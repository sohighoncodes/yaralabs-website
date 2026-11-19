import test from 'node:test';
import assert from 'node:assert/strict';
import { queueGhlLeadSync, syncLeadToGhl } from '../lib/ghl-sync.js';
import { handleLead } from '../lib/leads.js';
import { handleCalendarRequest } from '../lib/calendar-api.js';

const lead = () => ({
  id: '619b2e1c-6b5a-4fd8-9c2b-7d9c3817707f',
  intent: 'quote',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+1 202 555 0148',
  tools: 'HubSpot and Slack',
  message: 'We need an AI agent connected to our CRM.',
  source: '/quote?utm_source=google',
});

const config = () => ({
  token: 'pit-test-only-token',
  locationId: 'loc-1',
  pipelineId: 'pipeline-1',
  stages: { new_enquiry: 'stage-new', discovery_booked: 'stage-booked' },
  fields: {
    contact: {
      serviceInterest: 'contact-service', currentTools: 'contact-tools', projectBrief: 'contact-brief',
      leadSource: 'contact-source', budgetRange: 'contact-budget', projectTimeline: 'contact-timeline',
      websiteInquiryId: 'contact-inquiry',
    },
    opportunity: { projectType: 'opp-type', contractStatus: 'opp-contract' },
  },
});

const env = () => ({ GHL_SYNC_CONFIG: JSON.stringify(config()) });

function successfulFetch(calls) {
  return async (url, options) => {
    calls.push({ url, options, body: JSON.parse(options.body) });
    if (url.endsWith('/contacts/upsert')) return Response.json({ contact: { id: 'contact-1' }, new: calls.length === 1 }, { status: 201 });
    if (url.endsWith('/tags')) return Response.json({ tags: ['website-lead'] });
    if (url.endsWith('/opportunities/upsert')) return Response.json({ opportunity: { id: 'opportunity-1' }, new: calls.length === 3 }, { status: 201 });
    throw new Error(`unexpected URL ${url}`);
  };
}

test('maps a completed website enquiry to exact contact fields, tag, and New Enquiry opportunity', async () => {
  const calls = [];
  const result = await syncLeadToGhl(env(), lead(), 'new_enquiry', successfulFetch(calls));
  assert.deepEqual(result, { synced: true });
  assert.equal(calls.length, 3);

  const contact = calls[0];
  assert.equal(contact.url, 'https://services.leadconnectorhq.com/contacts/upsert');
  assert.equal(contact.options.headers.Version, 'v3');
  assert.equal(contact.options.headers.Authorization, 'Bearer pit-test-only-token');
  assert.deepEqual(contact.body, {
    locationId: 'loc-1', firstName: 'Ada', lastName: 'Lovelace', name: 'Ada Lovelace',
    email: 'ada@example.com', phone: '+1 202 555 0148', source: 'Yara Labs Website',
    customFields: [
      { id: 'contact-service', fieldValue: 'AI Agents' },
      { id: 'contact-tools', fieldValue: 'HubSpot and Slack' },
      { id: 'contact-brief', fieldValue: 'We need an AI agent connected to our CRM.' },
      { id: 'contact-source', fieldValue: '/quote?utm_source=google' },
      { id: 'contact-budget', fieldValue: 'Not specified' },
      { id: 'contact-timeline', fieldValue: 'Not specified' },
      { id: 'contact-inquiry', fieldValue: '619b2e1c-6b5a-4fd8-9c2b-7d9c3817707f' },
    ],
  });

  assert.equal(calls[1].url, 'https://services.leadconnectorhq.com/contacts/contact-1/tags');
  assert.deepEqual(calls[1].body, { tags: ['website-lead'] });
  assert.deepEqual(calls[2].body, {
    locationId: 'loc-1', pipelineId: 'pipeline-1', pipelineStageId: 'stage-new',
    contactId: 'contact-1', name: 'Ada Lovelace - AI Agents', status: 'open',
    customFields: [
      { id: 'opp-type', fieldValue: 'AI Agents' },
      { id: 'opp-contract', fieldValue: 'Not sent' },
    ],
  });
});

test('repeated syncs use the same upsert keys and a booking moves the opportunity stage', async () => {
  const calls = [];
  const fetchImpl = successfulFetch(calls);
  await syncLeadToGhl(env(), lead(), 'new_enquiry', fetchImpl);
  await syncLeadToGhl(env(), lead(), 'discovery_booked', fetchImpl);
  assert.equal(calls.length, 6);
  assert.equal(calls[2].body.contactId, calls[5].body.contactId);
  assert.equal(calls[2].body.pipelineId, calls[5].body.pipelineId);
  assert.equal(calls[2].body.pipelineStageId, 'stage-new');
  assert.equal(calls[5].body.pipelineStageId, 'stage-booked');
  assert.equal(Object.hasOwn(calls[2].body, 'id'), false);
  assert.equal(Object.hasOwn(calls[5].body, 'id'), false);
});

test('missing or malformed configuration is a safe no-op', async () => {
  const noFetch = () => { throw new Error('must not fetch'); };
  assert.deepEqual(await syncLeadToGhl({}, lead(), 'new_enquiry', noFetch), { skipped: true });
  assert.deepEqual(await syncLeadToGhl({ GHL_SYNC_CONFIG: '{bad' }, lead(), 'new_enquiry', noFetch), { skipped: true });
  assert.deepEqual(await syncLeadToGhl({ GHL_SYNC_CONFIG: JSON.stringify({ ...config(), token: 'wrong' }) }, lead(), 'new_enquiry', noFetch), { skipped: true });
});

test('retries one 429 or server failure and exposes only a constant sanitized error', async () => {
  let attempts = 0;
  const retryCalls = [];
  await syncLeadToGhl(env(), lead(), 'new_enquiry', async (url, options) => {
    attempts++;
    if (attempts === 1) return new Response('private vendor response', { status: 429 });
    return successfulFetch(retryCalls)(url, options);
  });
  assert.equal(attempts, 4);
  assert.equal(retryCalls.length, 3);

  await assert.rejects(
    syncLeadToGhl(env(), lead(), 'new_enquiry', async () => { throw new Error('pit-test-only-token private body'); }),
    error => error.message === 'GHL_SYNC_FAILED' && !error.message.includes('pit-') && !error.message.includes('private'),
  );

  let clientErrorAttempts = 0;
  await assert.rejects(syncLeadToGhl(env(), lead(), 'new_enquiry', async () => {
    clientErrorAttempts++;
    return new Response('private validation detail', { status: 400 });
  }), { message: 'GHL_SYNC_FAILED' });
  assert.equal(clientErrorAttempts, 1, 'non-retryable client errors are attempted once');
});

test('background queue catches failures and logs only a constant code', async () => {
  let pending;
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = value => warnings.push(value);
  try {
    const queued = queueGhlLeadSync({ waitUntil(promise) { pending = promise; } }, env(), lead(), 'new_enquiry', async () => new Response('pit-test-only-token secret vendor body', { status: 500 }));
    assert.equal(queued, true);
    await pending;
  } finally { console.warn = originalWarn; }
  assert.deepEqual(warnings, ['GHL_SYNC_FAILED']);
  assert.equal(JSON.stringify(warnings).includes('pit-test-only-token'), false);
  assert.equal(JSON.stringify(warnings).includes('vendor body'), false);
});

test('only a completed full intake queues a New Enquiry sync', async () => {
  const data = { ...lead(), token: 'a'.repeat(64), revision: 1 };
  const request = () => new Request('https://yaralabs.io/api/inquiries', {
    method: 'POST', headers: { 'Content-Type': 'application/json', origin: 'https://yaralabs.io' }, body: JSON.stringify(data),
  });
  const ghlCalls = [];
  const fetchImpl = async (url, options) => {
    if (url.includes('functions/v1/lead-capture')) return Response.json({ saved: true, status: 'in_progress' });
    return successfulFetch(ghlCalls)(url, options);
  };
  let pending;
  const ctx = { waitUntil(promise) { pending = promise; } };
  const intakeEnv = { ...env(), LEAD_CAPTURE_SECRET: 'lead-private' };
  const full = await handleLead(request(), intakeEnv, fetchImpl, true, ctx);
  assert.equal(full.status, 200);
  await pending;
  assert.equal(ghlCalls[2].body.pipelineStageId, 'stage-new');

  pending = undefined;
  const partial = await handleLead(request(), intakeEnv, fetchImpl, false, ctx);
  assert.equal(partial.status, 200);
  assert.equal(pending, undefined);
});

test('only a confirmed tracked booking queues Discovery Booked', async () => {
  const details = { ...lead(), token: 'b'.repeat(64), revision: 1, start: '2026-11-19T03:00:00.000Z' };
  const request = new Request('https://yaralabs.io/api/booking/reserve', {
    method: 'POST', headers: { 'Content-Type': 'application/json', origin: 'https://yaralabs.io' }, body: JSON.stringify(details),
  });
  const ghlCalls = [];
  const calendarEnv = {
    ...env(), LEAD_CAPTURE_SECRET: 'lead-private', CALENDAR_SHARED_SECRET: 'calendar-private',
    CALENDAR_SCRIPT_URL: 'https://script.google.com/macros/s/test/exec',
  };
  const fetchImpl = async (url, options) => {
    if (url.includes('functions/v1/lead-capture')) return Response.json({ saved: true });
    if (url.startsWith(calendarEnv.CALENDAR_SCRIPT_URL)) return Response.json({ ok: true, booking: { start: details.start, end: '2026-11-19T03:30:00.000Z' } });
    return successfulFetch(ghlCalls)(url, options);
  };
  let pending;
  const response = await handleCalendarRequest(request, calendarEnv, fetchImpl, { waitUntil(promise) { pending = promise; } });
  assert.equal(response.status, 200);
  await pending;
  assert.equal(ghlCalls[2].body.pipelineStageId, 'stage-booked');
});
