# Yara Labs GoHighLevel Design

## Intent

Make the new Yara Labs GoHighLevel sub-account the sales and client-relationship system for enquiries captured by `yaralabs.io`, while preserving the website's existing branded Supabase intake and Google Calendar booking experience.

## Goals

- Configure the Yara Labs sub-account with the correct website and `Asia/Manila` timezone.
- Create contact and opportunity fields that preserve the website's enquiry context.
- Create one sales pipeline and two calendars: a public lead discovery call and a client-only success session.
- Create reusable lead and client welcome email templates and publish the matching automations when the workflow API is available; otherwise build them in the GHL UI.
- Authenticate `mail.yaralabs.io` as the dedicated sending domain through Cloudflare DNS.
- Upsert website leads and their opportunity stage into GHL without making GHL availability a prerequisite for saving the original Supabase enquiry or booking.

## Non-goals

- Replace the current website booking UI or Google Calendar backend.
- Migrate historic Google Sheets CRM records in this phase.
- Send bulk marketing email or import old contacts.
- Change unrelated website analytics or design work already in the working tree.

## Approach

The selected approach is an integration bridge. GHL is configured through its supported v3 API where available and through the authenticated UI for settings that have no stable public API. The website continues to save to Supabase first, then performs an idempotent background upsert to GHL using a Cloudflare Worker secret containing the scoped Private Integration Token and created resource IDs.

Replacing the existing booking flow with a GHL embed was rejected because it would discard the site's branded, tested booking and recovery behavior. Replacing only the CTA link was rejected because it would split contact data between systems and lose the current form context.

## GHL model

### Contact fields

- `Service Interest` — single select: Automation, AI Agents, CRM Setup, Custom Apps, Other
- `Current Tools` — long text
- `Project Brief` — long text
- `Lead Source` — text
- `Budget Range` — single select: Not specified, Under $2,500, $2,500–$5,000, $5,000–$10,000, $10,000+
- `Project Timeline` — single select: ASAP, Within 30 days, 1–3 months, 3+ months, Not specified
- `Website Inquiry ID` — text

### Opportunity fields

- `Project Type` — single select: Automation, AI Agents, CRM Setup, Custom Apps, Other
- `Estimated Value` — monetary
- `Target Start Date` — date
- `Delivery Deadline` — date
- `Contract Status` — single select: Not sent, Sent, Signed, Declined

### Pipeline

`Yara Labs Sales`: New Enquiry, Qualified, Discovery Booked, Proposal Sent, Won, Onboarding, Active, Complete, Lost.

### Calendars

- `Free Discovery Call`: 30 minutes, two-hour minimum notice, 30-day booking window, Monday–Friday 11:00–23:00 Asia/Manila, public booking link.
- `Client Success Session`: 60 minutes, 24-hour minimum notice, 60-day booking window, Monday–Friday 11:00–23:00 Asia/Manila, client-only booking link.

Both calendars use the existing Yara Labs owner as host when that user is available in the sub-account. If no host is assigned, create the calendar configuration and document the single remaining host-assignment step rather than adding or changing user permissions without approval.

## Email content

- `Yara Labs — New Enquiry Welcome`: confirms receipt, explains review and next steps, and links to `https://yaralabs.io/book` when the visitor has not booked.
- `Yara Labs — Client Welcome`: welcomes a won client, explains kickoff/access/delivery expectations, and links to the Client Success Session calendar.

Sender: `Yara Labs <hello@yaralabs.io>`. Sending begins only after `mail.yaralabs.io` is verified.

## Website synchronization

On a complete form save, upsert the contact by email/phone, apply a `website-lead` tag, populate contact custom fields, and upsert one opportunity in `New Enquiry`. On confirmed booking, upsert the same contact/opportunity and move it to `Discovery Booked`. The `Website Inquiry ID` preserves the source record identifier. GHL errors are sanitized and logged but do not turn a successful Supabase save or Google booking into a visitor-facing failure.

The Worker receives one secret JSON binding named `GHL_SYNC_CONFIG`; it contains the Private Integration Token, location ID, pipeline/stage IDs, and field IDs. No credential is committed, returned to the browser, placed in URLs, or written to logs.

## Verification

- API reads show the expected fields, pipeline, calendars, templates, workflows, location timezone, and sending-domain status.
- Unit tests cover payload mapping, idempotent upserts, stage transitions, missing configuration, and sanitized failure handling.
- Existing build, test, lint, and booking suites remain green.
- A synthetic contact is used only after explicit confirmation because it will create a real CRM record and may trigger email; it is not automatically deleted.


