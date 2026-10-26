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

Book a call opens a contact dialog that prepares an email to `hello@yaralabs.io`. It does not claim to send or schedule a meeting; connect a booking provider before changing that promise.
