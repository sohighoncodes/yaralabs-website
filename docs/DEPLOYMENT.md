# Deployment

## Target

- Domain: `yaralabs.io`
- Hosting preference: free-tier Cloudflare-compatible deployment
- Source of truth: GitHub repository
- Future data/CMS: Supabase free project

## Required Access

To publish and connect the domain, the deployer needs one of these paths.

### Option A: Cloudflare Dashboard + GitHub

This is the simplest path for a human to manage long term.

- GitHub repository access with permission to push this project
- Cloudflare account access where `yaralabs.io` is managed
- Cloudflare Pages project connected to the GitHub repository
- Build command: `pnpm run build`
- Deploy command: `pnpm run deploy`
- Production branch: `main`

### Option B: Cloudflare API Automation

Use this only when automation is preferred.

- Cloudflare Account ID
- Cloudflare Zone ID for `yaralabs.io`
- Cloudflare API token with limited permissions:
  - Account: Cloudflare Pages edit
  - Zone: DNS edit for `yaralabs.io`
  - Zone: zone read for `yaralabs.io`
- GitHub repository access or a GitHub token with repository contents access

## Supabase Values

For the future CMS/database integration:

- `NEXT_PUBLIC_SUPABASE_URL=https://euahhliojookeumcvpem.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_DvTvvzcP6Xdr3SBeFGRH1A_lki34n0g`
- `SUPABASE_SERVICE_ROLE_KEY`

Do not commit real Supabase keys. Store production values in the hosting
provider's environment variable or secret manager. The publishable Supabase
key is safe for browser use when Row Level Security is configured; service-role
keys and direct database connection strings are not safe to expose.

## Local Verification

```bash
pnpm install
pnpm run build
pnpm test
pnpm run lint
pnpm exec tsc --noEmit
```

## Cloudflare Workers Build Settings

If deploying through Cloudflare Workers & Pages with a connected GitHub
repository, use:

```text
Production branch: main
Root directory: /
Build command: pnpm run build
Deploy command: pnpm run deploy
```

The deploy script uses the generated `dist/server/wrangler.json` file and runs
Wrangler from `dist/server`. This is important because the built Worker imports
server chunk files relative to that directory, and static assets are served from
`dist/client`.

`pnpm-workspace.yaml` is intentionally present even though this is a
single-package app. Cloudflare's build environment uses pnpm's dependency
build-script approval policy, so the file explicitly allows native setup for
`esbuild`, `sharp`, and `workerd`.

If the build fails during cloning, reconnect the GitHub integration and confirm
Cloudflare has access to the exact repository selected for this project.

For this project, the expected GitHub repository is:

```text
sohighoncodes/yaralabs-website
```

## Custom Domain Notes

After pushing `main`, verify all ten routes listed in `scripts/routes.json`
on the production domain. Browser checks accept `QA_BASE_URL=https://yaralabs.io`.
Booking links open the intake/calendar modal. The database must be active with
the migrations in `supabase/migrations/` applied. The server uses the project's
publishable key with insert-only RLS; no service-role key or Google OAuth token
is deployed. `public/assets/yara-pet.js` is a local static
asset loaded after hydration. Run `node scripts/qa-milo.mjs` against production
to check the guide and booking modal without submitting a real appointment.
`qa-booking.mjs` tests the modal with mocked saves; `qa-calendar.mjs` loads the
real public Google schedule without making a booking. See `BOOKING.md` for
server/storage verification.

Cloudflare Pages can serve `yaralabs.io` after the Pages project is connected
to the zone. DNS should remain managed in Cloudflare. Keep proxy/SSL settings
managed through Cloudflare unless the hosting target changes.
