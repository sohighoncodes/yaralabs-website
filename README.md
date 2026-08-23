# YARA LABS Website

Minimal landing page for YARA LABS, built with Vinext, React, Tailwind CSS,
and Cloudflare-compatible output.

## Design Notes

- Main/display font: Roboto Mono
- Body/content font: Roboto
- Background: warm white
- Text: very dark premium gray
- Accent/CTA: pink, violet, and blue gradient
- Current scope: landing page navbar and hero section

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
