# Architecture

## Current Scope

The current site is a minimal YARA LABS landing page with a navbar and hero
section. It is intentionally static while the brand, copy, CMS, analytics, and
data model are built in stages.

## Application Stack

- Vinext app structure with React server rendering
- Tailwind CSS for styling
- Cloudflare-compatible build output
- pnpm for dependency management
- Git for version control

## Brand System

- Primary website font: Inter Tight
- Technical label/wordmark font: Roboto Mono
- Background: white, `#ffffff`
- Primary text: very dark gray, `#171321`
- Supporting text: muted premium gray
- Accent: pink-violet-blue gradient used sparingly for calls to action

## Future Supabase Usage

Supabase is planned for:

- CMS content records
- CMS asset metadata
- Admin authentication
- Analytics event storage
- Contact/consultation form submissions

Use Row Level Security before exposing tables to browser clients. Keep
server-only secrets in deployment secret storage, not in committed files.
