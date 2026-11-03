-- Audit requests go to the same private intake and CRM feed as call requests.
alter table public.website_inquiries
  drop constraint website_inquiries_intent_check,
  add constraint website_inquiries_intent_check check (intent in ('call','quote','audit')),
  alter column phone drop not null,
  add constraint website_inquiries_phone_required check (intent = 'audit' or phone is not null);

create policy "Visitors can request an audit" on public.website_inquiries
  for insert to anon with check (intent = 'audit' and phone is null and char_length(btrim(message)) >= 10);
