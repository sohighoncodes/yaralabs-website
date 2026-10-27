create table public.website_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  intent text not null check (intent in ('quote', 'call')),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  phone text not null check (char_length(phone) between 7 and 40),
  tools text not null check (char_length(btrim(tools)) between 1 and 600),
  message text not null check (char_length(btrim(message)) between 10 and 3000),
  source text not null check (char_length(source) between 1 and 300 and source like '/%' and source not like '//%')
);
alter table public.website_inquiries enable row level security;
revoke all on public.website_inquiries from public, anon, authenticated;
grant insert (id, intent, name, email, phone, tools, message, source) on public.website_inquiries to anon;
grant all on public.website_inquiries to service_role;
create policy "Visitors can submit contact and project details"
  on public.website_inquiries for insert to anon
  with check (
    intent in ('quote', 'call')
    and char_length(btrim(name)) between 1 and 120
    and char_length(btrim(message)) between 10 and 3000
  );
create index website_inquiries_created_at_idx on public.website_inquiries (created_at desc);
create index website_inquiries_email_idx on public.website_inquiries (lower(email));
comment on table public.website_inquiries is 'Private pre-booking enquiries. Saving a row does not confirm a calendar appointment. Match Google bookings by email.';
