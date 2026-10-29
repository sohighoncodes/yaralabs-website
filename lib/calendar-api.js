import { validateInquiry } from './inquiries.js';
import { leadOperation, validLeadToken } from './leads.js';

const reply = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const unavailable = () => reply({ error: 'We can’t check the calendar right now. Please try again shortly.' }, 503);

export async function handleCalendarRequest(request, env, fetchImpl = fetch) {
  const url = new URL(request.url);
  const booking = url.pathname === '/api/booking/reserve';
  if ((!booking && request.method !== 'GET') || (booking && request.method !== 'POST')) return reply({ error: 'Method not allowed.' }, 405);
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return reply({ error: 'Invalid origin.' }, 403);
  let payload = { action: 'availability' };
  let tracked;
  if (booking) {
    if (!request.headers.get('content-type')?.includes('application/json')) return reply({ error: 'JSON required.' }, 415);
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: 'Details required.' }, 400);
    let input;
    try {
      const chunks = []; let size = 0;
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        size += value.byteLength;
        if (size > 24000) { await reader.cancel(); return reply({ error: 'Request too large.' }, 413); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      input = JSON.parse(new TextDecoder().decode(bytes));
    } catch { return reply({ error: 'Invalid request.' }, 400); }
    const details = validateInquiry(input);
    if (!details || input.website || typeof input.start !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\.000Z$/.test(input.start) || !Number.isFinite(Date.parse(input.start))) return reply({ error: 'Please check your details and selected time.' }, 400);
    payload = { action: 'book', details, start: input.start };
    if (input.token !== undefined) {
      if (!validLeadToken(input.token)) return reply({ error: 'Invalid enquiry.' }, 400);
      tracked = { ...details, token: input.token, start: input.start };
    }
  }
  // These bindings exist only on the Worker. Never return them to the browser.
  if (!env.CALENDAR_SCRIPT_URL || !env.CALENDAR_SHARED_SECRET || !/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(env.CALENDAR_SCRIPT_URL)) return unavailable();
  try {
    if (tracked) await leadOperation(env, 'pending', tracked, fetchImpl);
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(env.CALENDAR_SHARED_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    // Hash the trusted Cloudflare IP for short-lived abuse throttling; do not send raw IPs.
    const ip = request.headers.get('cf-connecting-ip') || 'local';
    const clientDigest = await crypto.subtle.sign('HMAC', key, encoder.encode(ip));
    const hex = bytes => Array.from(new Uint8Array(bytes), n => n.toString(16).padStart(2, '0')).join('');
    const data = JSON.stringify({ ...payload, client: hex(clientDigest) });
    const timestamp = Date.now();
    const signature = hex(await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${data}`)));
    const response = await fetchImpl(env.CALENDAR_SCRIPT_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp, data, signature }), signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) return unavailable();
    const result = await response.json();
    if (!result.ok) {
      if (tracked && ['taken', 'invalid', 'rate'].includes(result.code)) await leadOperation(env, 'release', tracked, fetchImpl);
      const errors = {
        taken: [409, 'That time was just taken. Please choose another available time.'],
        existing: [409, 'This enquiry already has a booking. Please check your calendar invitation.'],
        invalid: [400, 'Please check your details and selected time.'],
        rate: [429, 'Please wait a few minutes before trying again.'],
      };
      const [status, error] = errors[result.code] || [503, 'We couldn’t confirm the calendar response. Retry the same booking to check it safely.'];
      return reply({ error, code: result.code === 'taken' ? 'taken' : result.code === 'existing' ? 'existing' : 'unavailable' }, status);
    }
    if (!booking) {
      if (!Array.isArray(result.slots) || result.slots.some(s => typeof s !== 'string' || !Number.isFinite(Date.parse(s)))) return unavailable();
      return reply({ slots: result.slots, duration: result.duration, timeZone: result.timeZone });
    }
    if (!result.booking?.start || !result.booking?.end) return unavailable();
    const { start, end, meet } = result.booking;
    if (tracked) await leadOperation(env, 'complete', { ...tracked, start, end }, fetchImpl);
    return reply({ confirmed: true, start, end, meet: typeof meet === 'string' && /^https:\/\/meet\.google\.com\/[a-z-]+$/.test(meet) ? meet : null });
  } catch { return unavailable(); }
}
