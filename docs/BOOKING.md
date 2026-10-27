# Custom quote and discovery-call booking

## Visitor flow

All quote/call CTAs open the same Yara-designed modal. The first step saves
name, email, phone, current tools and message privately in Supabase. The second
step is a native React calendar, with date selection, available times, a time-zone
selector, review and confirmation. There is no Google iframe.

The site sends bookings through its Cloudflare Worker to an owner-authorized
Google Apps Script backend. Google Calendar stores the event, project details,
attendee and Meet conference, and sends the calendar invitation. The modal
reports success only after the backend has returned a confirmed event.

- Calendar receiving bookings: `cjgomba@yaralabs.io`
- Conflict checks: that calendar plus the supplied secondary **Projects** calendar
- Hours: Monday–Friday, 11am–11pm, Asia/Manila
- Duration: 30 minutes; minimum notice: 2 hours; window: 30 days
- Last daily start: 10:30pm Manila
- Visitor time zones change presentation, never the host's business hours

The user specified hours, duration and minimum notice. Weekdays and a 30-day
window were retained from the stated defaults. Change BOOKING_CONFIG in
`integrations/google-calendar/Code.gs` to adjust these. These are independent
of Google's older appointment-schedule settings.

## Availability and races

Google's FreeBusy API handles busy events, all-day events and recurring event
instances. Errors on either calendar fail closed. Only available start times
are returned to the browser; no titles, descriptions or busy-event details.

Availability reloads every 45 seconds and when the tab becomes visible.
Confirmation acquires a shared Apps Script lock, checks the requested start
against server-owned hours/notice/window, and checks Google again before
inserting. Persisted holds prevent a second website reservation while Google's
busy index catches up. A stale selection returns 409 and disappears from the UI.

The inquiry UUID determines a stable Google event ID. A retry checks that
event and its private payload fingerprint before creating anything. Unknown
outcomes keep the same selection locked and offer Check booking; they never
display false success or submit a different booking. Pending holds remain
blocked until a successful retry or manual review. Confirmed holds age out
after one minute; past holds and expired confirmed holds are pruned on bookings.

Google's API does not offer atomic free/busy-check-and-insert across other
writers. The lock protects this website's requests; an independent calendar
edit or another scheduling service can race the last check. Avoid running two
public booking systems against the same hours if that guarantee is required.

Cancellation/rescheduling uses the Google Calendar invitation or direct contact.
The website does not currently expose cancel/reschedule controls. Cancelling an
event removes its busy window; the short confirmed hold can delay reopening by
up to one minute. Pending holds should be reviewed manually if a visitor
abandons an uncertain booking. Never remove a pending hold without checking
its Google event ID first.

## Backend and deployment

Source: `integrations/google-calendar/Code.gs` and `appsscript.json`.
Google project:
https://script.google.com/home/projects/1snd1t4LFlcbnmY9YUoFbZUsbf8RNvIuTR_lctCkBW1ZESfYMvumbTUhz/edit

Deploy the script as a web app, executing as `cjgomba@yaralabs.io`, with
Anyone access so Cloudflare can call it without browser cookies. The endpoint
authenticates every operation using HMAC-SHA256, a two-minute timestamp window
and a private shared secret. Anonymous unsigned requests reveal no availability
or event data and cannot create appointments. GET returns only a service label.

Google manages its owner authorization; no OAuth refresh token is copied to
the website. Scopes are owned-calendar events, free/busy, and external requests.
Calendar API is enabled through the manifest's advanced Calendar service.
`checkConnection` is a read-only verification function.

Set the same `CALENDAR_SHARED_SECRET` in Apps Script's Script Properties and
Cloudflare Worker secrets. Set `CALENDAR_SCRIPT_URL` to the deployed /exec URL
in Cloudflare. Both are server-only; never put either into frontend code.
Use Wrangler's secret commands with stdin or an ignored temporary file, without
echoing secrets. Secrets survive subsequent code deployments.

Worker routes are handled before Vinext routing:
- GET /api/booking/availability
- POST /api/booking/reserve

Requests are bounded, validated and checked for cross-origin browser submission.
The Worker signs the payload and an HMAC of the Cloudflare client IP. The raw
IP is not forwarded. Short-lived Apps Script cache counters limit repeated
requests. This lightweight throttle is not a substitute for dedicated bot
protection if abuse becomes significant. Failed upstream calls show a retry
message; an explicit external link to the existing Google schedule remains as
an outage/no-JavaScript fallback.

## Intake records

https://supabase.com/dashboard/project/euahhliojookeumcvpem/editor

Table: `public.website_inquiries`. Public access is insert-only with RLS and
no read/update/delete grants. Saving intake is not proof of a confirmed meeting.
Calendar confirmation is authoritative. There is no separate email notification
or booking-status synchronization back into Supabase. The event description
includes the submitted project details. No contact data is persisted to browser
storage or logged by the application.

## Verification

- `pnpm test`: all ten routes, intake validation, signed API proxy, business
  hours/notice, busy windows, lock/hold conflicts and idempotent recovery.
- `node scripts/qa-booking.mjs`: all pages at desktop/mobile widths using mocked
  saves/calendar operations. Never creates real appointments.
- `node scripts/qa-calendar.mjs`: custom design, time zones, stale-slot removal,
  uncertain retries, confirmations and fail-closed outages using controlled fixtures.
- `node scripts/qa-milo.mjs`: guide and shared modal regression.
- Live activation: verify real availability, a user-approved temporary appointment,
  conflict rejection and safe retry, then remove only that exact test event/hold.

Browser scripts accept `QA_BASE_URL=https://yaralabs.io`.
