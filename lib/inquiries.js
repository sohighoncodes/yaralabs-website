const SUPABASE_URL = 'https://euahhliojookeumcvpem.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_DvTvvzcP6Xdr3SBeFGRH1A_lki34n0g';
const json = (body, status) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export function validateInquiry(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const limits = { name: [1, 120], email: [3, 254], phone: [7, 40], tools: [1, 600], message: [10, 3000], source: [1, 300] };
  const clean = {};
  for (const [key, [min, max]] of Object.entries(limits)) {
    if (typeof input[key] !== 'string') return null;
    const value = input[key].trim();
    if (value.length < min || value.length > max || value.includes(String.fromCharCode(0))) return null;
    clean[key] = value;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email) || !/^[+()\d\s.-]+$/.test(clean.phone) || clean.phone.replace(/\D/g, '').length < 7) return null;
  if (!clean.source.startsWith('/') || clean.source.startsWith('//') || !['quote', 'call'].includes(input.intent)) return null;
  if (typeof input.id !== 'string' || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(input.id)) return null;
  return { ...clean, email: clean.email.toLowerCase(), id: input.id, intent: input.intent };
}

function validateAudit(input) {
  for (const [field, limit] of Object.entries({name:120,business:120,businessUrl:1500,email:254,source:300})) {
    if (typeof input[field] !== 'string' || !input[field].trim() || input[field].length > limit || Array.from(input[field]).some(c => c.charCodeAt(0) < 32)) return null;
  }
  let url;
  try { url = new URL(input.businessUrl); } catch { return null; }
  if (!['https:', 'http:'].includes(url.protocol) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) ||
      !/^\/(?!\/)/.test(input.source) || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(input.id) ||
      !['NSW','VIC','QLD','WA','SA','TAS','ACT','NT'].includes(input.state) || !['Under 10','10–30','30–100','100+'].includes(input.volume)) return null;
  return {id:input.id, intent:'audit', name:input.name.trim(), email:input.email.trim().toLowerCase(), source:input.source, phone:null, tools:'',
    message:['Quote Leak Audit', 'Business: '+input.business.trim(), 'Website: '+input.businessUrl.trim(), 'State: '+input.state, 'Enquiries a month: '+input.volume].join('\n')};
}

export async function handleInquiry(request, fetchImpl = fetch) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Invalid origin.' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'JSON required.' }, 415);
  if (Number(request.headers.get('content-length')) > 24000) return json({ error: 'Request too large.' }, 413);
  let input;
  try {
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'Details required.' }, 400);
    let size = 0; const chunks = [];
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 24000) { await reader.cancel(); return json({ error: 'Request too large.' }, 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    input = JSON.parse(new TextDecoder().decode(bytes));
  } catch { return json({ error: 'Invalid request.' }, 400); }
  if (input?.website) return json({ error: 'Please leave the website field empty.' }, 400);
  const inquiry = input?.intent === 'audit' ? validateAudit(input) : validateInquiry(input);
  if (!inquiry) return json({ error: 'Please check your contact and project details.' }, 400);
  try {
    const response = await fetchImpl(`${SUPABASE_URL}/rest/v1/website_inquiries`, {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { apikey: PUBLISHABLE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(inquiry),
    });
    if (!response.ok) {
      // Retrying a timed-out save uses the same random ID and must not duplicate it.
      if (response.status === 409 && (await response.json()).code === '23505') return json({ saved: true }, 200);
      return json({ error: 'We could not save your details. Please try again.' }, 503);
    }
    return json({ saved: true }, 201);
  } catch { return json({ error: 'We could not save your details. Please try again.' }, 503); }
}
