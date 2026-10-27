# YARA LABS Design System

The October 2026 website follows the supplied `Yara Labs website project.zip` handoff, replacing the earlier landing page.

## Current design

- Geist for headings and interface text; Instrument Serif italic for editorial accents.
- Light canvas `#F6F7F9`, dark sections `#070B16`, primary blue `#2A62F5`.
- Blue dimensional buttons with inset highlights and shadows.
- Glossy blue and peach objects, rounded panels, and a subtle grain overlay.
- Floating shared navigation with a collapsible mobile menu.
- Responsive service cards, project scenes, and case-study layouts.
- Scroll-driven dark sections, floating objects, project hover tilt, FAQs, and a service recommendation picker.
- Large decorative hero objects are hidden on small phones to keep content readable.
- Reduced-motion preferences disable continuous decorative animation and transitions.
- Visible keyboard focus, labeled contact fields, native dialog focus handling, and Escape dismissal.

## Implementation

Letter spacing remains neutral; hero sizes use explicit breakpoints. Page components are in `components/pages/`, shared controls in `components/`, and global styles in `app/globals.css`. The prototype runtime is not shipped.

Scroll-driven dark sections use `lib/dark-section.js`. The entrance fade starts
at a nonnegative document scroll position so tall screens never load with a
partially dark hero. `node scripts/qa-hero.mjs` checks phone, desktop and 4K
viewports, scrolling back to the top, reloads and hero entrance animations.

Book a call and Get a quote open the same native modal dialog. The quote CTA
is a quiet text link in desktop navigation and a mobile menu item. The modal
collects contact/project details, then displays a native date grid, available
time buttons, visitor time-zone selector and confirmation panel. Blue selected
states, soft borders and the site's fonts carry through the calendar; no iframe.
Modal controls keep a visible close button,
focus containment/restoration and Escape dismissal; background scrolling is locked.

Milo's pixel artwork and tour bubbles use the supplied handoff design. Navigation stays above the guide. Reduced motion disables wandering, entrance drops, particles, idle sprite animation and Yara scenes; tours remain available without smooth scrolling. Closed bubbles are inert and Escape dismisses the tour.
