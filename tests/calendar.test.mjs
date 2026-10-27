import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createHash, createHmac } from 'node:crypto';
import { handleCalendarRequest } from '../lib/calendar-api.js';

const sample = () => ({ id: crypto.randomUUID(), intent: 'quote', name: 'Test Visitor', email: 'visitor@example.com', phone: '+1 202 555 0148', tools: 'Slack', message: 'Testing the calendar integration.', source: '/' });
const secret = 'test-only-not-a-real-secret';
const env = { CALENDAR_SCRIPT_URL: 'https://script.google.com/macros/s/test/exec', CALENDAR_SHARED_SECRET: secret };
const now = Date.parse('2026-11-04T00:00:00Z');
const source = readFileSync('integrations/google-calendar/Code.gs', 'utf8');

function harness() {
  const properties = {}, events = {}, counts = {};
  const state = { busy: [], calendarError: false, inserts: 0, locked: false, insertUnknown: false, held: false };
  const context = vm.createContext({
    console, Date: class extends Date { static now() { return now; } },
    Utilities: {
      formatDate: (d, zone) => new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d),
      computeHmacSha256Signature: (data, key) => [...createHmac('sha256', key).update(data).digest()],
      computeDigest: (_, data) => [...createHash('sha256').update(data).digest()], DigestAlgorithm: { SHA_256: 'SHA-256' },
    },
    PropertiesService: { getScriptProperties: () => ({ getProperty: key => properties[key], getProperties: () => ({ ...properties }), setProperty: (key, value) => { properties[key] = value; }, deleteProperty: key => { delete properties[key]; } }) },
    CacheService: { getScriptCache: () => ({ get: k => counts[k], put: (k, v) => { counts[k] = v; } }) },
    LockService: { getScriptLock: () => ({ tryLock: () => { if (state.locked) return false; state.held = true; return true; }, releaseLock: () => { state.held = false; } }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }) },
    ScriptApp: { getOAuthToken: () => 'test-google-token' },
    UrlFetchApp: { fetch: (url, options) => {
      const body = options.payload ? JSON.parse(options.payload) : null;
      let code = 200, output;
      if (url.endsWith('/freeBusy')) output = { calendars: Object.fromEntries(body.items.map(({ id }) => [id, state.calendarError ? { errors: [{ reason: 'notFound' }] } : { busy: state.busy }])) };
      else if (options.method === 'get') { output = events[url.split('/').at(-1)]; if (!output) code = 404; }
      else {
        assert.equal(state.held, true, 'event inserts require the shared script lock');
        assert.ok(url.includes('sendUpdates=all&conferenceDataVersion=1'));
        state.inserts++;
        output = { ...body, status: 'confirmed', hangoutLink: 'https://meet.google.com/abc-defg-hij' };
        events[body.id] = output;
        if (state.insertUnknown) { state.insertUnknown = false; throw new Error('response lost after write'); }
      }
      return { getResponseCode: () => code, getContentText: () => JSON.stringify(output || {}) };
    } },
  });
  vm.runInContext(source, context);
  properties.CALENDAR_SHARED_SECRET = secret;
  const call = payload => {
    const data = JSON.stringify({ client: 'a'.repeat(64), ...payload });
    const signature = createHmac('sha256', secret).update(`${now}.${data}`).digest('hex');
    return context.doPost({ postData: { contents: JSON.stringify({ timestamp: now, data, signature }) } });
  };
  return { call, context, state, events, properties };
}

test('calendar excludes busy, all-day and recurring instances; respects Manila hours, notice and weekends', () => {
  const h = harness();
  h.state.busy = [{ start: '2026-11-04T03:00:00Z', end: '2026-11-04T03:30:00Z' }, { start: '2026-11-04T16:00:00Z', end: '2026-11-05T16:00:00Z' }];
  const result = h.call({ action: 'availability' });
  assert.equal(result.ok, true);
  assert.ok(!result.slots.includes('2026-11-04T03:00:00.000Z'));
  assert.ok(result.slots.includes('2026-11-04T03:30:00.000Z'), 'end-exclusive busy boundary');
  assert.ok(result.slots.includes('2026-11-04T14:30:00.000Z'), 'last slot ends at 11pm Manila');
  assert.ok(!result.slots.some(s => s.startsWith('2026-11-05')), 'all-day busy excludes whole day');
  for (const slot of result.slots) {
    const local = new Date(Date.parse(slot) + 8 * 3600000);
    assert.ok(local.getUTCHours() >= 11 && local.getUTCHours() < 23);
    assert.ok([1, 2, 3, 4, 5].includes(local.getUTCDay()));
    assert.ok(Date.parse(slot) >= now + 2 * 3600000);
    assert.ok(Date.parse(slot) <= now + 30 * 86400000);
  }
  const nearStart = Date.parse('2026-11-04T10:45:00+08:00');
  assert.equal(h.context.candidates_(nearStart)[0], Date.parse('2026-11-04T13:00:00+08:00'));
});

test('an unreadable calendar fails closed instead of advertising empty availability', () => {
  const h = harness(); h.state.calendarError = true;
  assert.equal(h.call({ action: 'availability' }).code, 'unavailable');
  assert.equal(h.call({ action: 'book', details: sample(), start: '2026-11-04T03:00:00.000Z' }).ok, false);
  assert.equal(h.state.inserts, 0);
});

test('rechecks busy times before booking and serializes website reservations even with Google visibility lag', () => {
  const h = harness(), start = '2026-11-04T03:00:00.000Z';
  assert.ok(h.call({ action: 'availability' }).slots.includes(start));
  h.state.busy = [{ start, end: '2026-11-04T04:00:00Z' }];
  assert.equal(h.call({ action: 'book', details: sample(), start }).code, 'taken');
  h.state.busy = [];
  assert.equal(h.call({ action: 'book', details: sample(), start }).ok, true);
  assert.equal(h.call({ action: 'book', details: sample(), start }).code, 'taken');
  assert.ok(!h.call({ action: 'availability' }).slots.includes(start));
  assert.equal(h.state.inserts, 1);
  h.state.locked = true;
  assert.equal(h.call({ action: 'book', details: sample(), start: '2026-11-04T04:00:00.000Z' }).code, 'unavailable');
});

test('retries recover a lost confirmation without duplicate invitations; includes project details', () => {
  const h = harness(), details = sample(), request = { action: 'book', details, start: '2026-11-04T03:00:00.000Z' };
  h.state.insertUnknown = true;
  assert.equal(h.call(request).ok, false);
  assert.ok(!h.call({ action: 'availability' }).slots.includes(request.start));
  const recovered = h.call(request);
  assert.equal(recovered.ok, true); assert.equal(h.state.inserts, 1);
  const event = Object.values(h.events)[0];
  assert.ok(event.description.includes(details.message)); assert.ok(event.description.includes(details.phone));
  assert.equal(event.attendees[0].email, details.email);
  assert.equal(event.visibility, 'private');
  assert.equal(h.call({ ...request, start: '2026-11-04T04:00:00.000Z' }).code, 'existing');
});

test('invalid input, forged signatures, stale requests and out-of-hours times cannot create events', () => {
  const h = harness();
  assert.equal(h.context.doPost({ postData: { contents: JSON.stringify({ timestamp: now, data: '{}', signature: '0'.repeat(64) }) } }).ok, false);
  assert.equal(h.call({ action: 'book', details: { ...sample(), email: 'invalid' }, start: '2026-11-04T03:00:00.000Z' }).code, 'invalid');
  assert.equal(h.call({ action: 'book', details: sample(), start: '2026-11-04T20:00:00.000Z' }).code, 'taken');
  assert.equal(h.state.inserts, 0);
});

test('Worker keeps signing secrets private and rejects missing configuration, oversized and cross-origin requests', async () => {
  const availability = new Request('https://yaralabs.io/api/booking/availability');
  assert.equal((await handleCalendarRequest(availability, {})).status, 503);
  let forwarded;
  const result = await handleCalendarRequest(availability, env, async (_, options) => {
    forwarded = JSON.parse(options.body);
    assert.equal(forwarded.signature, createHmac('sha256', secret).update(`${forwarded.timestamp}.${forwarded.data}`).digest('hex'));
    return Response.json({ ok: true, slots: ['2026-11-04T03:00:00.000Z'], duration: 30, timeZone: 'Asia/Manila', secret: 'must not return' });
  });
  assert.equal(result.status, 200); assert.equal((await result.json()).secret, undefined);
  const post = (data, origin = 'https://yaralabs.io') => new Request('https://yaralabs.io/api/booking/reserve', { method: 'POST', headers: { 'Content-Type': 'application/json', origin }, body: JSON.stringify(data) });
  assert.equal((await handleCalendarRequest(post(sample(), 'https://evil.example'), env)).status, 403);
  assert.equal((await handleCalendarRequest(post({ ...sample(), message: 'x'.repeat(25000) }), env)).status, 413);
  assert.equal((await handleCalendarRequest(post({ ...sample(), start: 'invalid' }), env)).status, 400);
  const conflict = await handleCalendarRequest(post({ ...sample(), start: '2026-11-04T03:00:00.000Z' }), env, async () => Response.json({ ok: false, code: 'taken' }));
  assert.equal(conflict.status, 409); assert.equal((await conflict.json()).code, 'taken');
});
