# Milo site guide

Source: the user-supplied `Yara Labs website project (1).zip`, containing
`design_handoff_yara_labs_site/milo-pet/MILO-PET.md` and `yara-pet.js`.
The vanilla script is served at `public/assets/yara-pet.js`. Its original canvas
sprites, platform physics, home tour and eight Yara scenes are preserved.

## Integration

`app/layout.tsx` loads it once through `next/script` with `afterInteractive`.
The script mounts itself under `document.body`; `window.__ylPet` guards against
duplicate mounting. Native internal links reload the document, resetting the
guide's page and event listeners. If the site changes to SPA navigation, add
route-change and teardown handling before using this script unchanged.

The route introductions use the actual nine non-home URL slugs. Tours discover
the existing `data-screen-label` sections. Home has six curated stops; other
pages use up to seven sections. Booking uses the shared `[data-booking-link]`
anchor, with a fallback URL passed from `lib/booking.js` on the script element.
There are no prototype `.dc.html` destinations or external asset requests.

## Interaction and accessibility

- Click Milo, or focus him and press Enter/Space, to open the tour.
- Drag and release him to move or throw him; idle wandering follows real cards.
- Scroll to the bottom for Yara's scene; scrolling up 500px rearms it.
- Hide cancels pending tour and scene work. Bring Milo back restores him.
- Escape dismisses the bubble; closed controls are inert. Keyboard tours retain
  focus on their action controls. Navigation is above the mascot and bubbles.
- Reduced motion skips entrance drops, wandering, idle sprite animation,
  particles, smooth tour scrolling and Yara scenes. Explicit dragging works.

Only local preference/scene state is stored: `yl-pet-hidden` in localStorage,
`yl-pet-greeted-<page>` and `yl-scene-last` in sessionStorage. Storage failures
are tolerated. No visitor data is sent by the guide.

## Verification

Run `pnpm test`, `pnpm run lint`, `pnpm exec tsc --noEmit`, and with the local
server running, `node scripts/qa-milo.mjs`. Browser coverage includes all ten
pages on desktop and mobile, the complete home tour, intercepted booking
navigation, keyboard dismissal, hide persistence, restoration, reduced motion,
dragging and cancellation during an active Yara scene. Screenshots are saved in
ignored `outputs/qa/`. Set `QA_BASE_URL` to check the deployed version.
