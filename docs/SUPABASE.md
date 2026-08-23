# Supabase Setup

## Project

- Project ref: `euahhliojookeumcvpem`
- Project URL: `https://euahhliojookeumcvpem.supabase.co`
- Public key type: publishable key

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
