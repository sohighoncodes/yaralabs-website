-- Existing enquiries are not proof of a completed appointment.
alter table public.website_inquiries
  add column lead_status text not null default 'legacy_submitted'
    check (lead_status in ('legacy_submitted','in_progress','abandoned','booking_pending','completed')),
  add column last_activity_at timestamptz not null default now(),
  add column details_submitted_at timestamptz,
  add column abandoned_at timestamptz,
  add column completed_at timestamptz,
  add column booking_start timestamptz,
  add column booking_end timestamptz,
  add column token_hash text,
  add column revision bigint not null default 0;
alter table public.website_inquiries drop constraint website_inquiries_tools_check,
  drop constraint website_inquiries_message_check,
  add constraint website_inquiries_tools_check check (char_length(tools) <= 600),
  add constraint website_inquiries_message_check check (char_length(message) <= 3000),
  add constraint website_inquiries_token_check check (token_hash is null or token_hash ~ '^[a-f0-9]{64}$');
create index website_inquiries_active_idx on public.website_inquiries(last_activity_at) where lead_status = 'in_progress';

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;
create table private.lead_capture_config (singleton boolean primary key default true check(singleton), secret_hash text not null);
alter table private.lead_capture_config enable row level security;
revoke all on private.lead_capture_config from public, anon, authenticated;
grant select on private.lead_capture_config to service_role;
-- Provision the secret digest separately; the secret itself is never stored in SQL/source.

create function public.capture_website_lead(p_action text, p_data jsonb, p_server_hash text)
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
    insert into public.website_inquiries(id,intent,name,email,phone,tools,message,source,token_hash,revision,lead_status,details_submitted_at)
      values(lead_id,p_data->>'intent',p_data->>'name',p_data->>'email',p_data->>'phone',p_data->>'tools',p_data->>'message',p_data->>'source',token,version,'in_progress',case when p_action='details' then now() end)
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
revoke all on function public.capture_website_lead(text,jsonb,text) from public, anon, authenticated;
grant execute on function public.capture_website_lead(text,jsonb,text) to service_role;

create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('website-lead-abandonment', '* * * * *',
  $job$update public.website_inquiries set lead_status='abandoned', abandoned_at=now()
    where lead_status='in_progress' and last_activity_at < now() - interval '30 minutes'$job$);
