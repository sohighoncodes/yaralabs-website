-- Add first-touch campaign attribution without changing public read permissions.
-- Existing enquiries retain NULL attribution; never invent historical sources.
alter table public.website_inquiries add column attribution jsonb
  check (attribution is null or (jsonb_typeof(attribution) = 'object' and octet_length(attribution::text) <= 2000));
create or replace function public.capture_website_lead(p_action text, p_data jsonb, p_server_hash text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  lead public.website_inquiries;
  lead_id uuid := (p_data->>'id')::uuid;
  token text := p_data->>'token_hash';
  version bigint := (p_data->>'revision')::bigint;
begin
  if not exists(select 1 from private.lead_capture_config where secret_hash = p_server_hash)
    or token is null or token !~ '^[a-f0-9]{64}$' then return jsonb_build_object('saved',false); end if;
  if p_action in ('save','details') then
    if version is null or version < 1 then return jsonb_build_object('saved',false); end if;
    if p_action = 'details' and (char_length(btrim(p_data->>'tools')) < 1 or char_length(btrim(p_data->>'message')) < 10) then return jsonb_build_object('saved',false); end if;
    insert into public.website_inquiries(id,intent,name,email,phone,tools,message,source,token_hash,revision,lead_status,details_submitted_at,attribution)
      values(lead_id,p_data->>'intent',p_data->>'name',p_data->>'email',p_data->>'phone',p_data->>'tools',p_data->>'message',p_data->>'source',token,version,'in_progress',case when p_action='details' then now() end,nullif(p_data->'attribution','null'::jsonb))
      on conflict(id) do nothing;
  end if;
  select * into lead from public.website_inquiries where id = lead_id for update;
  if not found or lead.token_hash is distinct from token then return jsonb_build_object('saved',false); end if;
  if p_action in ('save','details') then
    if lead.lead_status in ('booking_pending','completed') and
      (lead.name is distinct from p_data->>'name' or lead.email is distinct from p_data->>'email'
      or lead.phone is distinct from p_data->>'phone' or lead.tools is distinct from p_data->>'tools'
      or lead.message is distinct from p_data->>'message') then return jsonb_build_object('saved',false); end if;
    -- A late unload/autosave must never undo a reservation or overwrite newer input.
    if lead.lead_status not in ('booking_pending','completed') and version >= lead.revision then
      update public.website_inquiries set name=p_data->>'name',email=p_data->>'email',phone=p_data->>'phone',
        tools=p_data->>'tools',message=p_data->>'message',revision=version,
        lead_status='in_progress',last_activity_at=now(),abandoned_at=null,
        details_submitted_at=case when p_action='details' then coalesce(details_submitted_at,now()) else details_submitted_at end
        where id=lead_id;
    end if;
  elsif p_action = 'pending' then
    if lead.details_submitted_at is null or lead.name is distinct from p_data->>'name'
      or lead.email is distinct from p_data->>'email' or lead.phone is distinct from p_data->>'phone'
      or lead.tools is distinct from p_data->>'tools' or lead.message is distinct from p_data->>'message'
      or (lead.lead_status in ('booking_pending','completed') and lead.booking_start is distinct from (p_data->>'start')::timestamptz)
      then return jsonb_build_object('saved',false); end if;
    if lead.lead_status <> 'completed' then
      update public.website_inquiries set lead_status='booking_pending',booking_start=(p_data->>'start')::timestamptz,last_activity_at=now(),abandoned_at=null where id=lead_id;
    end if;
  elsif p_action = 'release' then
    update public.website_inquiries set lead_status='in_progress',booking_start=null,last_activity_at=now()
      where id=lead_id and lead_status='booking_pending' and booking_start=(p_data->>'start')::timestamptz;
  elsif p_action = 'complete' then
    if lead.lead_status not in ('booking_pending','completed') or lead.booking_start is distinct from (p_data->>'start')::timestamptz then return jsonb_build_object('saved',false); end if;
    update public.website_inquiries set lead_status='completed',completed_at=coalesce(completed_at,now()),
      booking_end=(p_data->>'end')::timestamptz,abandoned_at=null,last_activity_at=now() where id=lead_id;
  else return jsonb_build_object('saved',false);
  end if;
  return (select jsonb_build_object('saved',true,'status',lead_status) from public.website_inquiries where id=lead_id);
end $$;
create or replace function public.read_crm_leads(p_server_hash text, p_after uuid default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare items jsonb;
begin
  if not exists(select 1 from private.crm_sync_config where secret_hash=p_server_hash)
    then return jsonb_build_object('authorized',false); end if;
  select coalesce(jsonb_agg(to_jsonb(rows) order by rows.id),'[]'::jsonb) into items from (
    select id,created_at,intent,name,email,phone,tools,message,source,lead_status,
      last_activity_at,details_submitted_at,abandoned_at,completed_at,booking_start,booking_end,attribution
    from public.website_inquiries where p_after is null or id>p_after order by id limit 200
  ) rows;
  return jsonb_build_object('authorized',true,'rows',items,
    'nextCursor',case when jsonb_array_length(items)=200 then items->199->>'id' else null end);
end $$;
