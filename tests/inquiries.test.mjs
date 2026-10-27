import assert from 'node:assert/strict';
import test from 'node:test';
import { handleInquiry, validateInquiry } from '../lib/inquiries.js';

const sample = () => ({ id: crypto.randomUUID(), intent: 'quote', name: 'Test Visitor', email: 'visitor@example.com', phone: '+1 202 555 0148', tools: 'Slack and spreadsheets', message: 'Testing the project intake flow.', source: '/services', website: '' });
const request = (data, headers = {}) => new Request('https://yaralabs.io/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://yaralabs.io', ...headers }, body: JSON.stringify(data) });

test('validates and normalizes contact details without retaining extra fields', () => {
  const data = validateInquiry({ ...sample(), name: ' Test Visitor ', email: 'Visitor@Example.com', extra: 'discard' });
  assert.equal(data.name, 'Test Visitor'); assert.equal(data.email, 'visitor@example.com');
  assert.equal(data.extra, undefined); assert.equal(data.website, undefined);
  for (const invalid of [{ email: 'invalid' }, { phone: 'abcdefg' }, { message: 'short' }, { tools: ' ' }, { name: 'x'.repeat(121) }, { intent: 'admin' }, { source: '//evil.example' }, { id: 'invalid' }]) {
    assert.equal(validateInquiry({ ...sample(), ...invalid }), null);
  }
});

test('saves all required fields and does not expose storage responses', async () => {
  const input = sample(); let saved;
  const result = await handleInquiry(request(input), async (url, options) => {
    assert.ok(url.endsWith('/rest/v1/website_inquiries'));
    assert.equal(options.headers.Prefer, 'return=minimal');
    saved = JSON.parse(options.body);
    return new Response(null, { status: 201 });
  });
  assert.equal(result.status, 201); assert.equal(saved.tools, input.tools); assert.equal(saved.message, input.message);
  assert.deepEqual(await result.json(), { saved: true });
  assert.equal(result.headers.get('Cache-Control'), 'no-store');
});

test('rejects invalid, oversized, cross-origin and honeypot requests before storage', async () => {
  const neverFetch = () => { throw Error('Storage must not be called'); };
  for (const [req, status] of [
    [request({ ...sample(), email: 'wrong' }), 400], [request({ ...sample(), website: 'spam' }), 400],
    [request(sample(), { Origin: 'https://other.example' }), 403],
    [request(sample(), { 'Content-Type': 'text/plain' }), 415],
    [request({ ...sample(), message: 'x'.repeat(25000) }), 413],
  ]) assert.equal((await handleInquiry(req, neverFetch)).status, status);
});

test('handles retries without duplicate records and preserves honest failure states', async () => {
  const duplicate = await handleInquiry(request(sample()), async () => Response.json({ code: '23505' }, { status: 409 }));
  assert.equal(duplicate.status, 200);
  for (const failure of [async () => new Response('private backend error', { status: 500 }), async () => { throw Error('timeout'); }]) {
    const response = await handleInquiry(request(sample()), failure);
    assert.equal(response.status, 503); assert.ok(!(await response.text()).includes('private backend error'));
  }
});
