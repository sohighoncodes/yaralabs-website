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

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Do not commit real Supabase keys. Store production values in the hosting
provider's environment variable or secret manager.

## Local Verification

```bash
pnpm install
pnpm run build
pnpm test
```

## Custom Domain Notes

Cloudflare Pages can serve `yaralabs.io` after the Pages project is connected
to the zone. DNS should remain managed in Cloudflare. Keep proxy/SSL settings
managed through Cloudflare unless the hosting target changes.
