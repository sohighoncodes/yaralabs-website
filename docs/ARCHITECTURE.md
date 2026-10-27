# Architecture

## Current Scope

The October 2026 site has ten server-rendered routes, client-side React
interactions, local assets and a shared two-step booking modal. Contact and
project details are validated by `POST /api/inquiries` and stored in Supabase
with insert-only public permissions. The native React calendar calls Cloudflare
booking routes, which sign requests to an owner-authorized Google Apps Script
backend. It checks free/busy, serializes website reservations and creates Calendar
events and Meet conferences. See `BOOKING.md`.
The supplied Milo canvas guide loads through `next/script` after hydration;
see `MILO.md` for its lifecycle and browser-only storage.

## Application Stack

- Vinext app structure with React server rendering
- Tailwind CSS for styling
- Cloudflare-compatible build output
- pnpm for dependency management
- Git for version control

## Brand System

- Primary website font: Geist
- Accent typeface: Instrument Serif italic
- Background: `#F6F7F9`, transitioning to `#070B16` in dark sections
- Primary text: `#0D1321`; secondary text: `#5B6272`
- Accent: `#2A62F5`, glossy dark and blue calls to action

## Future Supabase Usage

Supabase is planned for:

- CMS content records
- CMS asset metadata
- Admin authentication
- Analytics event storage
- Contact/consultation form submissions

Use Row Level Security before exposing tables to browser clients. Keep
server-only secrets in deployment secret storage, not in committed files.
