-- Read-only CRM feed; the credential has no write or booking privileges.
create table private.crm_sync_config (
  singleton boolean primary key default true check(singleton), secret_hash text not null
);
alter table private.crm_sync_config enable row level security;
revoke all on private.crm_sync_config from public, anon, authenticated;
grant select on private.crm_sync_config to service_role;

create function public.read_crm_leads(p_server_hash text, p_after uuid default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare items jsonb;
begin
  if not exists(select 1 from private.crm_sync_config where secret_hash=p_server_hash)
    then return jsonb_build_object('authorized',false); end if;
  select coalesce(jsonb_agg(to_jsonb(rows) order by rows.id),'[]'::jsonb) into items from (
    select id,created_at,intent,name,email,phone,tools,message,source,lead_status,
      last_activity_at,details_submitted_at,abandoned_at,completed_at,booking_start,booking_end
    from public.website_inquiries where p_after is null or id>p_after order by id limit 200
  ) rows;
  return jsonb_build_object('authorized',true,'rows',items,
    'nextCursor',case when jsonb_array_length(items)=200 then items->199->>'id' else null end);
end $$;
revoke all on function public.read_crm_leads(text,uuid) from public,anon,authenticated;
grant execute on function public.read_crm_leads(text,uuid) to service_role;
