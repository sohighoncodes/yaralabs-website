# Brand assets

The supplied `Yara Labs website project (5).zip` is the source of the October
2026 logo, icons and social preview. Its assets are copied without modification,
including their SVG provenance metadata.

- Favicon variants, Apple touch icon, app icons, manifest and OG images live at
  the public root under the supplied filenames.
- Logo variants live in `public/brand/`.
- `components/BrandLogo.jsx` is used by the shared navigation and all footers.
  It inlines the supplied full SVG so Geist and Instrument Serif load from the
  page; an external SVG image cannot rely on the document's font stylesheet.
  The `dark` prop selects the supplied dark lockup and light-blue symbol.
- The full lockup is 32px high with its original proportions. Below 900px,
  responsive placements use the 28px symbol. Padding provides clear space.
  No filters, recoloring, shadows or distortion are applied to the logo.
- Current navigation and footers use the light-background variant; dark sections
  elsewhere in the page do not change their background into a dark surface.

`app/layout.tsx` supplies all icon links, the manifest and theme color. The SVG
favicon has a version query to replace the previous cached favicon.
`lib/brand-metadata.ts` provides the shared OG and X image defaults. Every page
calls `withBrandMetadata` to preserve its existing OG title, description and URL
without losing the shared image when nested metadata is replaced. Both social
booking entry points use the same defaults.

The preview is `/og-image.png` (1200 × 630); `/og-image@2x.png` is retained as
the supplied high-resolution backup. The manifest includes the 192px, 512px
and maskable icons; Apple's home-screen icon is 180 × 180.

Rendered-route tests verify social metadata on all twelve URLs. Browser QA
checks desktop/mobile logo proportions, loaded fonts, icon/manifest responses,
mobile navigation, booking links and head tags without relying on client-side
JavaScript for crawler metadata.
