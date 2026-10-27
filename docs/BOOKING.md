# Quote and discovery-call booking

## Visitor flow

Get a quote is a text link in the desktop navigation and mobile menu. Existing
call buttons and Milo's booking actions open the same native dialog, with
different copy for quote enquiries.

1. Name, email, phone, current tools and message are required.
2. Continue to booking validates and saves the enquiry through `/api/inquiries`.
3. The modal displays the supplied Google appointment schedule. Visitors choose
   a slot, use the same email, and complete Google's contact/confirmation form.
4. Google creates the appointment and conferencing details on the calendar
   configured for that schedule. The website never fabricates a booking success.

Schedule: https://calendar.app.google/BEKk213nkobDqUM47

Owner/contact: `cjgomba@yaralabs.io`. The other supplied calendar link identifies
the secondary **Projects** calendar. The integration uses the supplied appointment
schedule's existing calendar settings; it does not create a separate event on
that secondary calendar or change the schedule's availability/settings.

Google's cross-origin iframe does not provide this app with a documented
confirmation callback or a supported way to prefill its fields. The initial
project details are retained separately in Supabase, not injected into the
calendar event. Match enquiries to bookings by email. There is no automatic
confirmation-status synchronization, enquiry email notification or duplicate
calendar event. Google may require its own email verification or CAPTCHA.

The calendar has an explicit new-tab fallback. Without JavaScript, the anchor
opens the public schedule directly. Normal clicks use the modal; modified
clicks retain browser link behavior. Errors keep form details for retry.

## Storage and privacy

Review enquiries in the project's private Table Editor:
https://supabase.com/dashboard/project/euahhliojookeumcvpem/editor

Table: `public.website_inquiries`. Fields: UUID, server-created timestamp,
intent (`quote` or `call`), name, email, phone, tools, message and source pathname.
Saving a record means **intake received**, not **appointment booked**. Do not
infer a confirmed meeting from a row alone.

The Supabase project must stay active. Public `anon` can insert only the
specified intake columns; SELECT, UPDATE and DELETE are not granted. RLS is
enabled. The site needs no service-role credential or Google Calendar token.
`lib/inquiries.js` uses the existing public project configuration, validates
input, caps request size, rejects cross-origin browser submissions and a
honeypot field, and returns no contact data. It does not log form contents or
persist them to browser storage. Random submission IDs deduplicate retries.
These checks are not a substitute for a dedicated anti-spam service if traffic
later warrants one. Administrators manage retention in the private database.

## Verification

- `pnpm test`: server rendering and API validation/storage-response tests.
- `node scripts/qa-booking.mjs`: all ten pages at desktop/mobile widths with
  mocked saves, validation/error handling, focus restoration and modal sizing.
- `node scripts/qa-calendar.mjs`: real Google schedule loads inside both desktop
  and mobile modals; no appointment is submitted.
- `node scripts/qa-milo.mjs`: Milo still opens the modal correctly.
- A separate test POST was verified against the real database, public read
  access was rejected, and the exact temporary QA record was removed afterward.

Browser scripts accept `QA_BASE_URL` for production verification.
