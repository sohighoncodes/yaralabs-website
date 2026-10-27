# YARA LABS Website

YARA LABS marketing website, built with Vinext and React and deployed to
Cloudflare through GitHub. The October 2026 redesign includes ten pages:
home, services, four service details, projects and three case studies.

## Design Notes

- Typeface: Geist with Instrument Serif italic accents
- Background: cool white with scroll-driven dark sections
- Accent: blue, with glossy dark and blue calls to action
- Motion: native Web Animations API; reduced-motion preferences respected
- Mobile navigation, FAQ accordions, service recommendations and project demos

## Contact

Every booking CTA opens the Google Calendar appointment schedule at
https://calendar.app.google/oFoc5HX736V5vbZbA. The destination is defined in
`lib/booking.js`; `BookingLink` renders ordinary anchors that also work without
JavaScript. General email contact remains `hello@yaralabs.io`.

## Source and Verification

`components/pages/` contains normal React JSX and the animation logic adapted
from the supplied design handoff. `components/SiteNav.jsx` and
`components/BookingLink.jsx` are shared. No prototype runtime is deployed.

Milo, the supplied pixel kitten guide, loads after hydration on every page.
Click or focus him and press Enter to start a tour. Drag him, hide him, or
bring him back using the bottom-left control. See `docs/MILO.md` for integration
details, motion behavior and local browser storage.

`scripts/import-handoff.mjs <directory>` is the one-time migration utility;
edit the generated React source for ongoing development. Rerunning it replaces
page components and route metadata. Keep the original handoff ZIP separately.

`pnpm test` builds and checks all ten rendered routes and internal links.
`pnpm exec tsc --noEmit` checks types. With the local server running,
`node scripts/qa.mjs` checks every page at desktop and phone widths;
`node scripts/qa-interactions.mjs` checks interactive behavior;
`node scripts/qa-milo.mjs` checks tours, booking, dragging and hide/restore. Browser checks
need `pnpm exec playwright install chromium`. Reports are ignored in `outputs/`.

## Work From Another Device

1. Clone the GitHub repository.
2. Install Node.js `>=22.13.0`.
3. Install dependencies.
4. Start the local site.

```bash
pnpm install
pnpm run dev
```

## Useful Commands

```bash
pnpm run dev
pnpm run build
pnpm test
```

Future Supabase keys, Cloudflare settings, and CMS notes should be added to
`.env.example` and this README as those features are introduced.

## Project Docs

- `docs/ARCHITECTURE.md`: current stack, brand system, and planned Supabase use
- `docs/DEPLOYMENT.md`: Cloudflare, GitHub, domain, and Supabase access notes
- `docs/DESIGN_SYSTEM.md`: implemented design-system rules for the landing page
- `docs/SUPABASE.md`: Supabase project and future CMS/database notes
- `docs/VERSIONING.md`: branch, commit, and release-note conventions
