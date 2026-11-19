# Yara Labs GoHighLevel Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure the Yara Labs GHL sub-account and synchronize website enquiries and bookings into its CRM without replacing the current website flow.

**Architecture:** GHL resources are created idempotently with the official API, with UI fallback for unsupported settings. The Cloudflare Worker performs best-effort background contact and opportunity upserts after Supabase saves and Google booking confirmations, using one server-only JSON secret.

**Tech Stack:** HighLevel v3 API, Cloudflare Workers, Vinext/React, Node test runner, Cloudflare DNS.

**Spec:** `docs/superpowers/specs/2026-11-18-yara-labs-ghl-design.md`

## Global Constraints

- Preserve the existing Supabase intake and Google Calendar booking flow.
- Never expose the GHL token in source, logs, URLs, browser responses, screenshots, or test fixtures.
- Do not modify or discard unrelated dirty-worktree changes.
- Use `mail.yaralabs.io` only for authenticated sending; use `hello@yaralabs.io` as the visible From address.
- GHL synchronization failures must not downgrade a successful primary save or booking.

## Review Focus

- Repeated form saves must update one contact and one opportunity rather than duplicate them.
- A booking confirmation must move the same opportunity to Discovery Booked.
- Missing or malformed secret configuration must skip GHL safely and preserve the primary response.
- GHL 429/5xx/timeouts must be sanitized and must not leak credentials or vendor response bodies.
- Contact custom-field values must use created IDs and normalized website values.

---

### Task 1: Idempotent GHL account configuration

**Files:**
- Modify: `docs/CRM.md`

**Interfaces:**
- Consumes: the supplied Private Integration Token and location `i7mMkKwsaWjvR55audA8`
- Produces: location, contact-field, opportunity-field, pipeline, stage, calendar, template, workflow, and email-domain identifiers

- [ ] **Step 1: Inventory current resources with read-only v3 calls**

Check location details, custom fields, pipelines, calendars, email templates, workflows, and assigned users. Record only IDs/names/statuses, never the token.

- [ ] **Step 2: Create missing CRM resources**

Create the exact fields and `Yara Labs Sales` stages from the spec. Re-read by name before each write so reruns are idempotent.

- [ ] **Step 3: Create the two calendars**

Create the exact durations, notice windows, booking windows, slugs, and Manila hours from the spec. Assign the existing owner if available; otherwise stop at host assignment.

- [ ] **Step 4: Create the two email templates**

Create HTML templates with merge-field fallback, `hello@yaralabs.io` sender identity, and the exact lead/client purposes from the spec. Preview each template through the API.

- [ ] **Step 5: Create and publish welcome workflows**

Use the v3 workflow definition API if enabled; otherwise create the equivalent tag/stage-triggered workflows in the GHL UI. Do not send a test or live email yet.

- [ ] **Step 6: Verify resource inventory**

Read everything back and add the created names, booking links, and non-secret IDs to `docs/CRM.md`.

### Task 2: Worker-side GHL synchronization

**Files:**
- Create: `lib/ghl-sync.js`
- Modify: `lib/leads.js`
- Modify: `lib/calendar-api.js`
- Modify: `worker/index.ts`
- Modify: `.env.example`
- Test: `tests/ghl.test.mjs`

**Interfaces:**
- Consumes: `env.GHL_SYNC_CONFIG`, complete website enquiry payloads, and confirmed booking payloads
- Produces: `queueGhlLeadSync(ctx, env, lead, stage)` and idempotent HighLevel contact/opportunity upserts

- [ ] **Step 1: Write failing mapping and safety tests**

Test exact contact fields/tags, New Enquiry versus Discovery Booked stage mapping, repeated upserts, missing config, 429/5xx/timeout sanitization, and absence of token/body data in responses.

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `node --test tests/ghl.test.mjs`
Expected: FAIL because `lib/ghl-sync.js` does not exist.

- [ ] **Step 3: Implement `syncLeadToGhl(env, lead, stage, fetchImpl = fetch)`**

Parse and validate `GHL_SYNC_CONFIG`; call `POST /contacts/upsert` and `POST /opportunities/upsert` with `Version: v3`; retry one 429/5xx response; throw only sanitized errors.

- [ ] **Step 4: Implement `queueGhlLeadSync(ctx, env, lead, stage, fetchImpl = fetch)`**

Use `ctx.waitUntil` when available and catch/log only a constant error code. A missing config is a no-op.

- [ ] **Step 5: Wire complete intake and booking events**

Queue `new_enquiry` after successful full details save and `discovery_booked` after confirmed booking. Do not queue partial autosaves.

- [ ] **Step 6: Run focused and full tests**

Run: `node --test tests/ghl.test.mjs tests/leads.test.mjs tests/calendar.test.mjs`
Expected: PASS.

- [ ] **Step 7: Commit the synchronization unit**

Commit only the new GHL integration, its tests, env documentation, and directly related docs.

### Task 3: Dedicated sending domain

**Files:**
- Modify: `docs/CRM.md`

**Interfaces:**
- Consumes: GHL-generated DNS record set and the Cloudflare `yaralabs.io` zone
- Produces: verified `mail.yaralabs.io` sending domain

- [ ] **Step 1: Start dedicated-domain setup in GHL**

Add `mail.yaralabs.io` under the Yara Labs email service and capture the exact generated DNS records.

- [ ] **Step 2: Check for DNS conflicts**

Read existing records for every generated hostname; stop rather than overwrite a conflicting record.

- [ ] **Step 3: Add the generated records in Cloudflare**

Create only the exact non-proxied records GHL requests.

- [ ] **Step 4: Verify DNS and GHL status**

Poll authoritative DNS and GHL until the domain is verified or report the pending records and propagation state.

- [ ] **Step 5: Document the verified sender configuration**

Record hostnames, record types, and verification status without including tokens or unrelated DNS data.

### Task 4: Deployment and end-to-end verification

**Files:**
- Modify: `docs/BOOKING.md`
- Modify: `docs/CRM.md`

**Interfaces:**
- Consumes: tested Worker code and created GHL resource IDs
- Produces: deployed `GHL_SYNC_CONFIG` secret and verified production integration

- [ ] **Step 1: Run repository verification**

Run: `pnpm test`, `pnpm lint`, and the existing booking/lead QA suites.
Expected: all pass without real appointments or email sends.

- [ ] **Step 2: Store `GHL_SYNC_CONFIG` as a Cloudflare Worker secret**

Pipe the secret JSON directly to the existing production Worker secret command; never echo or persist the JSON.

- [ ] **Step 3: Deploy the Worker**

Use the project’s existing Vinext build and Wrangler deployment path. Capture the deployment ID.

- [ ] **Step 4: Verify non-mutating production behavior**

Confirm the site loads, availability still works, and GHL inventory remains readable.

- [ ] **Step 5: Request action-time confirmation for a synthetic live enquiry**

Explain that submitting it creates a real CRM contact/opportunity and can trigger welcome email. After confirmation, submit one unique synthetic lead and verify field/stage/email behavior.

- [ ] **Step 6: Update operational documentation**

Document reconciliation behavior, failure isolation, created booking links, sending domain, and how to rotate the PIT/secret.


