# Versioning

## Branches

- `main`: production-ready source
- `codex/*`: implementation branches created by Codex
- feature branches: engineer-owned changes before review/merge

## Commit Style

Use small commits with clear messages:

```text
feat: add landing page hero
docs: document deployment requirements
chore: update project metadata
```

## Release Notes

Track important public changes here until a formal changelog is needed.

### October 2026 — Milo guide and booking

- Integrated the supplied pixel kitten guide on all ten pages, with page tours,
  dragging, hide/restore and Yara's end-of-page scenes.
- Connected all booking CTAs and the guide to the Google Calendar schedule.
- Added keyboard dismissal, inert closed controls, scene cancellation when hidden,
  reduced-motion behavior and desktop/mobile browser checks.

### October 2026 redesign

- Replaced the original landing page with the ten-page supplied design.
- Added service details, project case studies, interactive demos and responsive navigation.
- Added accessible contact email drafting, reduced-motion support and optimized local avatars.
- Added route, browser interaction, and desktop/mobile layout checks.

### 0.1.0 — Initial release

- Created initial YARA LABS landing hero and navbar
- Added Inter Tight and Roboto Mono typography
- Added deployment, architecture, and versioning documentation
- Prepared Supabase and Cloudflare environment variable template
