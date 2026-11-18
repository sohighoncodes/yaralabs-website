# CRM

## GoHighLevel

Yara Labs location: `i7mMkKwsaWjvR55audA8`. The business website is
`https://yaralabs.io`. HighLevel displays the location in its available GMT+08:00
`Asia/Shanghai` label; the website booking system continues to use the equivalent
GMT+08:00 `Asia/Manila` timezone explicitly.

### Sales model

- Pipeline `Yara Labs Sales`: `YfxnpxhVq0A7mBt7UB1N`.
- Stages: New Enquiry `ddc524c6-66b6-4823-99a9-c40b6e4618bd`, Qualified
  `ba20fc3b-3dd8-46a3-92e3-f4b4da680553`, Discovery Booked
  `a1cacb19-951a-4867-bc46-0b7ac82ee50e`, Proposal Sent
  `47b27704-8fa3-4a36-b054-7fee72b12b9b`, Won
  `3e686dc2-72c6-4e13-9c49-649ab112546b`, Onboarding
  `626b4467-f1d9-4c75-9c8f-3f1670b60ce3`, Active
  `c26cd3a5-12c9-4503-9772-7ee9ee02c3fd`, Complete
  `5d30cef4-5186-4a53-b14e-29db6c43345d`, Lost
  `9aaf8e07-51a1-4aa9-8ed9-bdcc294b868d`.
- Contact fields: Service Interest `pWKWZDSORSVQsAyjKyGz`, Current Tools
  `KLarVanmV2XugbRJdIhC`, Project Brief `u0ahFyZuKrg2WBl7eqeH`, Lead Source
  `dEzuugqqjscmXH0sP0vB`, Budget Range `HlXalCrl8hWlao4kMWA2`, Project Timeline
  `QDExlAam52xqKPEFhbjw`, Website Inquiry ID `qkCCOcXgGErHv2duQaAo`.
- Opportunity fields: Project Type `incYPGlFtTJJYgFWql2W`, Estimated Value
  `hcESyGxpC4zwG1axHN9V`, Target Start Date `qbv00Q1fpSsiAMZruPR3`, Delivery
  Deadline `YEliaR4GQs5AFdgds23K`, Contract Status `uZpFH4Rt3SpTsohXtGDA`.

### Email

The dedicated sending domain `mail.yaralabs.io` is active with SSL issued and its
initial warm-up in progress. Cloudflare DNS has non-proxied SPF, DKIM, tracking
CNAME, two priority-10 MX records, and DMARC at `_dmarc.mail.yaralabs.io`.

Reusable templates are previewed but have not sent mail:

- `Yara Labs - New Enquiry Welcome`: `6afd001797e6ce5fa4922728`
- `Yara Labs - Client Welcome`: `6afd00185ddb9dde6e88ff38`

HighLevel's Workflow Definition API is not enabled for this location. Keep both
templates unsent until their UI workflows are reviewed and deliberately published.

### Website bridge

The Worker binding `GHL_SYNC_CONFIG` is one server-only JSON secret holding the PIT,
location, pipeline/stage, and custom-field IDs. Complete enquiries upsert a contact,
add the `website-lead` tag, and upsert one opportunity into New Enquiry. Confirmed
website bookings move the same opportunity into Discovery Booked. Partial autosaves
do not enter GHL. A 429, server failure, or timeout is retried once and then logged as
the constant `GHL_SYNC_FAILED`; it never changes the visitor's successful Supabase or
Google Calendar response.

The code is committed on `codex/yara-ghl-integration` at `c433228` but is not deployed
until `GHL_SYNC_CONFIG` is stored in the production Worker secret store.

### Remaining calendar dependency

The location currently has no assigned users. HighLevel requires a team member for
personal/round-robin calendars, so `Free Discovery Call` and `Client Success Session`
remain pending until the owner approves assigning an existing user to this location.

---

## Google Sheets CRM

Live workbook: https://docs.google.com/spreadsheets/d/1SLjKcYbZYkCQNoFWGJlgQJJT1C_xx6CdQfv_VzMVbn0/edit

Owner-run project: https://script.google.com/u/2/home/projects/1pu2afHUydjUmx7_8vdBnUB39rkU83B1_k3k02aK3L_Hb8hcKUwpyzWGd/edit

Owner: `cjgomba@yaralabs.io`. The owner-run Apps Script polls the private website
feed every five minutes. Website saves and bookings do not depend on Google Sheets
availability. A failed sync retries on the next run.

## Workspace

- Pipeline: stage counts, open/won values separated by currency, overdue follow-ups,
  form-status counts and visible last-successful-sync time.
- Contacts: one normalized email per contact; company, lifecycle, owner, follow-up
  dates and relationship notes remain editable.
- Deals: one website enquiry per deal, linked by stable IDs; sales stage, value,
  currency, next action, dates, priority and notes remain editable.
- Activities: manual calls, emails, meetings, notes and tasks linked by email/enquiry ID.
- Enquiries: automatically refreshed website source details and booking status.
- Guide: daily use, synced-column boundaries, manual entries and recovery.

No messages are sent automatically. Sales stages are separate from form status.
Completing a booking does not mark a sale won. New deals default to USD, which can
be changed per deal. Values in different currencies are never added together.
Old enquiries remain `legacy_submitted`; their booking history is not inferred.

## Sync behavior

`supabase/functions/crm-feed` authenticates a dedicated read-only credential by
checking its SHA-256 digest through a service-only SECURITY INVOKER RPC. The RPC
returns only contact, enquiry and lifecycle fields. Visitor ownership tokens and
backend credentials are excluded. Public table reads remain denied.

The Google project stores `CRM_FEED_SECRET` and `CRM_SHEET_ID` in private Script
Properties. Never put them in cells, URLs, logs, source or frontend configuration.
Google's own Sheets authorization remains in Apps Script. No public web app is deployed.

Each run reads batches of 200 enquiries in UUID order. After all writes in a batch
succeed, its cursor is saved. Interrupted batches replay safely; the next full cycle
rechecks all records, including abandoned/completed status changes. Apps Script's
lock prevents overlapping syncs. IDs are resolved afresh, so sorting whole tables
does not attach notes to different leads.

Contacts use a hash of normalized email. Repeated enquiries share a contact but
remain separate deals. An edited email can create another contact. Manual contacts
receive IDs on sync. Manual deals receive `M-` IDs and are not overwritten by the feed.
Only explicitly designated source columns are updated; sales inputs are preserved.
Untrusted form strings are escaped before writing to prevent formula execution.

Source deletion does not erase CRM history. Deleting a synced Sheet row recreates
it on the next full sync. Archive with Lost/On hold/Past client; coordinate privacy
deletions in both stores. A Sheet is collaborative recordkeeping, not a permissioned
multi-user CRM: editors can change or remove records. Keep sharing restricted.

## Deployment

1. Apply `20261029040937_crm_lead_feed.sql` and provision a random 32-byte hex secret.
   Store only its SHA-256 digest in `private.crm_sync_config`.
2. Deploy `crm-feed` with JWT verification off; the function performs its own secret
   authentication. Its built-in service role is not copied out of Supabase.
3. Create the owner-only Google Apps Script project from
   `integrations/google-sheets-crm/Code.gs` and `appsscript.json`.
4. Set `CRM_FEED_SECRET` in Script Properties, authorize the listed Sheets, external
   request, trigger and email-identity scopes, and run `setupCRM` once.
5. Verify the Sheet owner, four native tables, formulas, dropdowns, permissions,
   initial backfill, repeat-sync idempotency and installed `syncCRM`/`crmEdit` triggers.
6. Verify a synthetic website lead reaches the Sheet, then remove only that test
   record from both stores. No real appointment is required.

`setupCRM` records its created Sheet ID and can finish an initialized partial setup
without creating a duplicate. The Pipeline refresh checkbox invokes the same sync.
`inspectCRM` logs only workbook metadata and aggregate counts, never contact records.

## Verification

`node --test tests/crm.test.mjs` covers contact deduplication, repeat-sync behavior,
sales-field preservation, row sorting, manual records and formula injection.
`pnpm test`, lint and TypeScript checks cover the website regression surface.

Activated on 2026-10-29 in the business account with restricted sharing, four
native tables, and both time-driven and manual-refresh triggers. A synthetic
website contact imported into all three record tabs. A repeat sync preserved
its edited stage, value, and notes, and the Pipeline formulas reflected those
changes. The synthetic record was removed from the website and CRM afterward.
