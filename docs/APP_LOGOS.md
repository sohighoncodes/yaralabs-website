# App logos

App badges use SVGs from [ln-dev7/logos-apps](https://github.com/ln-dev7/logos-apps), pinned to commit `8bba11a4047d8f35f85a1c0728b4a68434384b3e`.

The 40 original SVG files are served from `public/assets/apps/`. `components/AppBrand.jsx` maps display names to assets and retains a plain text fallback for unmatched apps, including GoHighLevel and Jotform, and generic tools such as APIs. Wordmarks preserve their aspect ratio; icon badges retain a readable app name. White backing keeps original logo colors legible in dark sections.

The upstream license and trademark notice are included at `public/assets/apps/SOURCE-LICENSE.txt`. Logos belong to their respective owners; their inclusion does not imply endorsement.

`scripts/update-app-logos.mjs <logos-apps-checkout>` applies these badge changes after regenerating the original handoff pages. Normal ongoing edits can be made directly in the React components.

## Site-wide audit

All ten routes and 80 labeled sections are checked at desktop and phone widths by `node scripts/qa-all-logos.mjs`. It checks every logo image, standalone brand labels, browser errors and page overflow. Set `QA_BASE_URL` to verify production. The audit covers tool strips, hero labels, service demos, project scenes, value badges and Upwork testimonial badges. Editorial paragraphs and customer quotations retain normal text.

GoHighLevel (GHL), Jotform and Google Business Profile have no matching SVG in the pinned source. Generic capabilities such as APIs, calendars, email and webhooks remain text rather than borrowing unrelated product logos.
