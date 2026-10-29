# Website analytics and activity tracking

## Filled setup brief

- Website: https://yaralabs.io
- Platform: custom Vinext/React/Tailwind on Cloudflare Workers, GitHub repository `sohighoncodes/yaralabs-website`; pnpm.
- Repository access: yes. DNS: Cloudflare-managed; DNS write access still to be verified before making a change.
- Google and Clarity login: `cjgomba@yaralabs.io`; Clarity uses Sign in with Google.
- Forms: native quote/call modal → private Supabase enquiries → Google Sheets CRM.
- Booking: native calendar UI → signed Apps Script backend → Google Calendar.
- Audience: owner confirmed no EU/UK visitors on 2026-10-29. No consent banner in this scope. Revisit this configuration before targeting those regions.
- Reporting settings verified in GA4: Philippines Time (GMT+08:00), Philippine Peso (PHP), as chosen during owner setup. CRM deals retain their own currency (USD default); no monetary values are sent by this analytics implementation.
- Account creation and terms: performed by the owner. No passwords or authentication codes requested.
- Publishing: requires the owner's explicit yes after a reviewable implementation and verification.

## Accounts & IDs (running record)

| Tool | Login account | IDs | Access / status |
| --- | --- | --- | --- |
| Google Tag Manager | cjgomba@yaralabs.io | GTM-TSFCKRDJ; account 6400901834; container 284195758 | Business account confirmed; unpublished workspace; full user list pending audit |
| Google Analytics 4 | cjgomba@yaralabs.io | G-69NQLKLSCS; Web stream 16226898565; account 413979792; property 561411943 | Property access verified: cjgomba@yaralabs.io is sole Administrator |
| Microsoft Clarity | Google: cjgomba@yaralabs.io | z56q8zdiq6 | Team verified: cjgomba@yaralabs.io is sole Admin; Strict masking enabled; GA4 integration pending |
| Search Console | cjgomba@yaralabs.io | sc-domain:yaralabs.io | Verified Domain property; cjgomba@yaralabs.io sole verified Owner; indexing data processing; no DNS change required |
| Lead CRM | cjgomba@yaralabs.io | Sheet 1SLjKcYbZYkCQNoFWGJlgQJJT1C_xx6CdQfv_VzMVbn0 | Existing private CRM; attribution upgrade prepared locally |

No separate agent user is needed for this setup. For future reporting-only access,
use GA4 Viewer, GTM Read, Search Console Restricted, and Clarity Member (verify the
current permission descriptions before inviting). Tag editing needs GTM Edit;
keep publishing with the owner. Never grant account administrator solely to read reports.

## Conversion inventory and definitions

The owner confirmed the four main events below. Shared handlers cover the home,
service, case-study and social-entry routes; Milo also opens the shared booking CTA.

| Event | Actual trigger | GA4 destination | Key event |
| --- | --- | --- | --- |
| generate_lead | Successful full intake response, immediately before calendar step; once per enquiry per browser session | Engagement → Events; acquisition key-event selection | Yes |
| booking_complete | Successful confirmed response from the Google Calendar booking backend; once per enquiry per browser session | Engagement → Events; acquisition key-event selection | Yes |
| book_call_click | Click on a shared booking/quote CTA; form_type distinguishes call/quote | Engagement → Events | No |
| contact_click | mailto or tel link; sends only email/phone category, never address or number | Engagement → Events | No |
| outbound_click | Explicit external Google Calendar fallback or Upwork link, where present | Engagement → Events | No |

Autosaves, form-button clicks, failed submissions, unavailable slots and uncertain
bookings are not conversions. `/book` and `/quote` open the form directly without
inventing a CTA click. The two key events represent different funnel steps; do not
sum them and describe the result as unique leads. Use the CRM for authoritative
lead/appointment counts: blockers, opt-outs and closed tabs can suppress browser events.

## Data collection boundaries

- GTM is the only vendor loader. Do not also paste a direct gtag.js or Clarity snippet into the site.
- The website loader is enabled for the owner-approved deployment and Preview checks. GTM remains unpublished until final approval.
- Event payloads allow only event, known page path, form type, contact category and named outbound destination.
- No contact names, email addresses, phone numbers, tools, messages, inquiry IDs, calendar times, Meet URLs, tokens or credentials enter dataLayer.
- GA4 page_location must use the prepared sanitized data-layer variable: only known paths and allowlisted campaign labels; arbitrary queries and fragments are removed.
- The complete booking dialog uses data-clarity-mask. Configure Clarity strict masking as well; verify recordings after activation.
- Advertising storage, advertising user data and ad personalization default to denied. Disable Google Signals and automatic user-provided-data collection.
- Honor Global Privacy Control, Do Not Track and the visitor's local analytics opt-out; do not load GTM when blocked.
- The opt-out unloads vendor scripts and removes first-party GA/Clarity cookies on this host. The preference remains in this browser.

Enhanced Measurement can collect page views, scroll depth, outbound clicks,
site search, video engagement, file downloads and form interactions. Enable only
relevant measurements; disable automatic form measurement (it is not reliable
for this multi-step form), site-search query collection and duplicate outbound
measurement. Configure page views with sanitized URLs. Confirm actual controls
in the current GA4/GTM UI before publication.

## Source capture and CRM fields

First-touch attribution is stored for 30 days in first-party localStorage. It is
not collected when the visitor opts out or signals GPC/DNT. New visits preserve
the original source until expiry. Only campaign labels, a known landing path and
referrer origin are retained; referrer paths/query strings are stripped.

Hidden fields: utm_source, utm_medium, utm_campaign, landing_page, referrer.
The request also contains a normalized attribution object, independently cleaned
by the server. The initial enquiry stores it immutably. Existing historical
enquiries remain blank. Deploy the database migration before the website.

The CRM Enquiries tab adds Q:U: UTM source, UTM medium, UTM campaign, Landing page,
Referrer. All existing contact/deal IDs, sales fields and manual notes stay intact.
Use Enquiry ID to match a source row to Deals. Google attribution and this explicit
30-day first-touch model answer different questions, so counts need not match.

## Privacy-policy draft — review before publishing

We use Google Analytics to understand visits, traffic sources and actions such as
submitted enquiries and confirmed bookings. Microsoft Clarity helps us understand
page interactions through heatmaps and session recordings. Our booking form is
masked in recordings, and we do not send its contact details or message to our
analytics events. We save campaign labels and referral information in your browser
for up to 30 days and attach that information to an enquiry to understand its source.
You can turn off optional analytics using the website control; we also honor Global
Privacy Control and Do Not Track signals. Our contact form saves valid details as
you type, even if you do not finish booking, so we can respond to your enquiry.
These operational enquiry records are separate from optional analytics. For
privacy questions, contact cjgomba@yaralabs.io.

This paragraph describes this implementation; incorporate it into the business's
complete privacy notice and confirm vendor retention settings before publication.

## Reading the results

Weekly: in Clarity, filter recordings by landing page and device, inspect repeated
dead/rage clicks, and compare scroll heatmaps with CTA positions. A rage click is
an investigation signal, not proof of a bug. Reproduce an issue before changing UI.

Monthly: GA4 Reports → Acquisition → Traffic acquisition, Session source/medium,
then select generate_lead or booking_complete separately. Compare campaign traffic
with its key-event rate, not raw visit volume. User acquisition answers first-user
acquisition; Traffic acquisition answers the session that brought the visit.
In the CRM, compare UTM sources with Qualified/Won deals to assess business value.

Monthly: Search Console → Performance: queries, pages, clicks, impressions and CTR;
then indexing reports and sitemap status. Search Console covers Google organic
search, not all website traffic. New data can take time to appear.

## Release and verification checklist

1. Confirm all four account identities/IDs and permissions; no unrelated personal-account properties.
2. Prepare GTM Google tag, event tags/variables/triggers and masked Clarity; link GA4/Clarity only with the owner's approval for the requested account access.
3. Verify local build, tests, desktop/mobile modal and sanitized hidden fields.
4. Review migration, CRM columns, Worker/code diff and any DNS TXT record with owner; get yes before live changes.
5. Install site code and attribution storage, leaving the GTM container unpublished; use Preview for the draft.
6. Verify Tag Assistant event order/parameters, GA4 DebugView and Realtime, Clarity session/masking, and a synthetic UTM lead reaching the CRM. Remove only that test record.
7. Get final approval, then publish GTM with a clear version name. Do not claim a recording exists until Clarity shows it.

Current verification: production build and 33 unit/render tests pass; lint and
TypeScript pass. Local desktop form renders with the masking attribute and five
hidden fields. Browser input inspection redacts hidden values, so first-touch
values are covered by unit tests; the live UTM-to-CRM check is still required.
The local quote modal also fits a 390×844 mobile viewport without horizontal
overflow. Tag Assistant, GA4 and Clarity checks remain pending; do not treat these
as passed. Live analytics and CRM-attribution checks require release approval.

## Prepared release for approval

- Website: shared GTM loader, five event handlers, masked booking dialog, visitor
  opt-out and 30-day first-touch source capture. Enable the public config only
  for the approved release. No direct GA4/Clarity script is added separately.
- Database: add optional attribution JSON to enquiries and return it through the
  existing private CRM feed. Existing records keep blank historical sources.
- CRM: append five source columns to Enquiries; preserve contact/deal IDs and sales edits.
- GA4: retain page views, scrolls and file downloads; disable automatic form,
  outbound, history and site-search measurement to avoid duplicate or private data.
  Mark generate_lead and booking_complete as key events. Keep Google Signals and
  user-provided data collection off. No advertising integration.
- Clarity: switch masking from Balanced to Strict before the first test session.
  GA4 linking may require a separate Google permission confirmation when its actual
  requested scopes are shown.
- Verification: use synthetic contact/source data in the production CRM and one
  clearly labelled test appointment on the owner's calendar, then remove only
  those test records after checking the results. Ask permission before this step.
- GTM stays unpublished until Preview and end-to-end checks pass and the owner
  gives the final publishing approval required by step 19 of the brief.

Native GTM import file: `integrations/analytics/gtm-container.json`.
Imported successfully into Default Workspace as 12 unpublished additions
(three tags, six data-layer variables, one trigger and two settings). GTM Preview
opened Tag Assistant without a compilation error; connection and event firing
verification are still pending. Published version remains the empty container.
Google's [configuration reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)
documents global page_location settings; these are queued before GTM loads.
