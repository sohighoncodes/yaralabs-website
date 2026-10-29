# Google Sheets CRM

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
