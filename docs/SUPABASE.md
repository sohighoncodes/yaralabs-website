# Supabase Setup

## Project

- Project ref: `euahhliojookeumcvpem`
- Project URL: `https://euahhliojookeumcvpem.supabase.co`
- Public key type: publishable key

## Website enquiries

The project was restored from its paused state for the October 2026 booking
integration. `public.website_inquiries` stores the contact/project intake before
Google Calendar booking. Review submissions in the Supabase Table Editor, using
the appointment email to match the enquiry. Public visitors can insert validated
rows but cannot select, update or delete them. Only project administrators or
server-side service-role credentials can read these details.

New forms autosave contact details and track `lead_status` through a private Worker
to Edge Function gateway. The Edge Function uses its built-in server credential;
it is never exposed to visitors. A service-only SECURITY INVOKER RPC checks ownership,
prevents stale writes and records Google-confirmed completion. A pg_cron job tags
inactive unfinished leads after 30 minutes. Public read/update/delete remain denied.
The original insert-only endpoint supports already-loaded older clients.
Local migrations are in `supabase/migrations/`. See `BOOKING.md` for statuses,
secret provisioning, verification and operational limitations.

## Environment Variables

Browser-safe values:

```text
NEXT_PUBLIC_SUPABASE_URL=https://euahhliojookeumcvpem.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_DvTvvzcP6Xdr3SBeFGRH1A_lki34n0g
```

Server-only values:

```text
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

Never commit server-only values. Store them in Cloudflare runtime secrets only
when the CMS, analytics, or admin features need them.

## CLI Setup

Use the Supabase CLI when local database migrations are introduced:

```bash
supabase login
supabase init
supabase link --project-ref euahhliojookeumcvpem
```

Do not commit direct database connection strings. They include the database
password and should be treated as secrets.
