import test from 'node:test';
import assert from 'node:assert/strict';
import { handleLead, validateContact } from '../lib/leads.js';
import { handleCalendarRequest } from '../lib/calendar-api.js';

const sample = () => ({ id: crypto.randomUUID(), token: 'a'.repeat(64), revision: 1, intent: 'quote', name: ' Visitor ', email: 'Visitor@Example.com', phone: '+1 202 555 0148', tools: '', message: '', source: '/quote' });
const env = { LEAD_CAPTURE_SECRET: 'private', CALENDAR_SHARED_SECRET: 'private', CALENDAR_SCRIPT_URL: 'https://script.google.com/macros/s/test/exec' };
const request = (data, path = '/api/leads', origin = 'https://yaralabs.io') => new Request(`https://yaralabs.io${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', origin }, body: JSON.stringify(data) });

test('captures valid contact before project fields and limits browser status control', async () => {
  const data = sample();
  assert.equal(validateContact(data).email, 'visitor@example.com');
  for (const invalid of [{ phone: 'invalid' }, { name: '' }, { email: 'x@' }, { token: 'short' }, { revision: -1 }, { tools: 'x'.repeat(601) }]) assert.equal(validateContact({ ...data, ...invalid }), null);
  let sent;
  const response = await handleLead(request({ ...data, action: 'complete', lead_status: 'completed' }), env, async (_, options) => {
    sent = JSON.parse(options.body);
    assert.equal(options.headers['X-Lead-Secret'], 'private');
    return Response.json({ saved: true, status: 'in_progress' });
  });
  assert.equal(response.status, 200); assert.equal(sent.action, 'save');
  assert.equal(sent.data.token, undefined); assert.match(sent.data.token_hash, /^[a-f0-9]{64}$/);
  assert.equal(sent.data.lead_status, undefined);
  assert.equal((await handleLead(request(data), env, fetch, true)).status, 400);
});

test('partial capture fails safely on cross-origin, spam, oversized and storage failure', async () => {
  const noFetch = () => { throw new Error('should not call'); };
  assert.equal((await handleLead(request(sample(), '/api/leads', 'https://evil.example'), env, noFetch)).status, 403);
  assert.equal((await handleLead(request({ ...sample(), website: 'spam' }), env, noFetch)).status, 400);
  assert.equal((await handleLead(request({ ...sample(), message: 'x'.repeat(25000) }), env, noFetch)).status, 413);
  assert.equal((await handleLead(request(sample()), env, async () => new Response('private error', { status: 500 }))).status, 503);
});

test('only confirmed Google bookings complete leads; conflicts release and unknown responses remain pending', async () => {
  const details = { ...sample(), tools: 'Slack', message: 'Connect the tools we use.', start: '2026-11-04T03:00:00.000Z' };
  for (const [result, expected, status] of [
    [{ ok: true, booking: { start: details.start, end: '2026-11-04T03:30:00.000Z' } }, ['pending', 'google', 'complete'], 200],
    [{ ok: false, code: 'taken' }, ['pending', 'google', 'release'], 409],
    [{ ok: false, code: 'unavailable' }, ['pending', 'google'], 503],
  ]) {
    const calls = [];
    const response = await handleCalendarRequest(request(details, '/api/booking/reserve'), env, async (url, options) => {
      if (url.includes('functions/v1')) { calls.push(JSON.parse(options.body).action); return Response.json({ saved: true }); }
      calls.push('google'); return Response.json(result);
    });
    assert.equal(response.status, status); assert.deepEqual(calls, expected);
  }
  const failedSave = await handleCalendarRequest(request(details, '/api/booking/reserve'), env, async (url, options) => {
    if (url.includes('functions/v1')) return JSON.parse(options.body).action === 'pending' ? Response.json({ saved: true }) : new Response('', { status: 503 });
    return Response.json({ ok: true, booking: { start: details.start, end: '2026-11-04T03:30:00.000Z' } });
  });
  assert.equal(failedSave.status, 503, 'never claim complete before tracking is durable');
});
