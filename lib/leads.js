import { handleInquiry, validateInquiry } from './inquiries.js';

const endpoint = 'https://euahhliojookeumcvpem.supabase.co/functions/v1/lead-capture';
const reply = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export const validLeadToken = token => typeof token === 'string' && /^[a-f0-9]{64}$/.test(token);
const hash = async value => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), n => n.toString(16).padStart(2, '0')).join('');

export function validateContact(input) {
  // Reuse the full form's normalization while allowing unfinished project fields.
  const contact = validateInquiry({ ...input, tools: 'Pending', message: 'Pending details' });
  if (!contact || !validLeadToken(input.token) || !Number.isSafeInteger(input.revision) || input.revision < 1) return null;
  for (const [key, max] of [['tools', 600], ['message', 3000]]) {
    if (typeof input[key] !== 'string' || input[key].length > max || input[key].includes('\0')) return null;
    contact[key] = input[key].trim();
  }
  return { ...contact, revision: input.revision };
}

export async function leadOperation(env, action, input, fetchImpl = fetch) {
  if (!env.LEAD_CAPTURE_SECRET || !validLeadToken(input.token)) throw new Error('Lead capture unavailable');
  const { token, ...data } = input;
  const response = await fetchImpl(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Lead-Secret': env.LEAD_CAPTURE_SECRET },
    body: JSON.stringify({ action, data: { ...data, token_hash: await hash(token) } }), signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('Lead capture unavailable');
  const result = await response.json();
  if (!result.saved) throw new Error('Lead capture unavailable');
  return result;
}

export async function handleLead(request, env, fetchImpl = fetch, full = false) {
  if (request.method !== 'POST') return reply({ error: 'Method not allowed.' }, 405);
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return reply({ error: 'Invalid origin.' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) return reply({ error: 'JSON required.' }, 415);
  let input;
  try {
    const reader = request.body?.getReader(); if (!reader) throw new Error();
    const chunks = []; let size = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength;
      if (size > 24000) { await reader.cancel(); return reply({ error: 'Request too large.' }, 413); } chunks.push(value); }
    const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    input = JSON.parse(new TextDecoder().decode(bytes));
  } catch { return reply({ error: 'Invalid request.' }, 400); }
  if (full && input?.token === undefined) return handleInquiry(new Request(request.url, {
    method: 'POST', headers: request.headers, body: JSON.stringify(input),
  }), fetchImpl);
  const contact = validateContact(input);
  if (!contact || input.website || (full && !validateInquiry(input))) return reply({ error: 'Please check your details.' }, 400);
  try {
    // The browser cannot request pending/release/complete transitions.
    const result = await leadOperation(env, full ? 'details' : 'save', { ...contact, token: input.token }, fetchImpl);
    return reply({ saved: true, status: result.status });
  } catch { return reply({ error: 'We couldn’t save your details. Please try again.' }, 503); }
}
