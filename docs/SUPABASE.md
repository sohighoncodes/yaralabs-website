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

The website's server uses the existing publishable key through an insert-only
REST call. No service-role key is required or exposed. Local migrations are in
`supabase/migrations/`. See `BOOKING.md` for the complete flow and limitations.

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
