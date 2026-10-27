# App logos

App badges use SVGs from [ln-dev7/logos-apps](https://github.com/ln-dev7/logos-apps), pinned to commit `8bba11a4047d8f35f85a1c0728b4a68434384b3e`.

The 34 original SVG files are served from `public/assets/apps/`. `components/AppBrand.jsx` maps display names to assets and retains a plain text fallback for unmatched apps, including GoHighLevel and Jotform, and generic tools such as APIs. Wordmarks preserve their aspect ratio; icon badges retain a readable app name. White backing keeps original logo colors legible in dark sections.

The upstream license and trademark notice are included at `public/assets/apps/SOURCE-LICENSE.txt`. Logos belong to their respective owners; their inclusion does not imply endorsement.

`scripts/update-app-logos.mjs <logos-apps-checkout>` applies these badge changes after regenerating the original handoff pages. Normal ongoing edits can be made directly in the React components.
