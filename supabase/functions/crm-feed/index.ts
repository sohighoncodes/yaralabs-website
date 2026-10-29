// Private, read-only website enquiry feed for the owner's Google Sheets CRM.
Deno.serve(async (request: Request) => {
  const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  const secret = request.headers.get('x-crm-secret') || '';
  if (request.method !== 'POST' || !/^[a-f0-9]{64}$/.test(secret)) return reply({ error: 'Unauthorized' }, 401);
  try {
    const reader = request.body?.getReader(); if (!reader) return reply({ error: 'Invalid request' }, 400);
    let text = ''; let size = 0; const decoder = new TextDecoder();
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength;
      if (size > 1024) { await reader.cancel(); return reply({ error: 'Too large' }, 413); } text += decoder.decode(value, { stream: true }); }
    text += decoder.decode();
    const { after = null } = JSON.parse(text);
    if (after !== null && (typeof after !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(after))) return reply({ error: 'Invalid cursor' }, 400);
    const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))), n => n.toString(16).padStart(2, '0')).join('');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/read_crm_leads`, {
      method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_after: after, p_server_hash: digest }), signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return reply({ error: 'Sync unavailable' }, 503);
    const result = await response.json();
    return result?.authorized ? reply({ rows: result.rows, nextCursor: result.nextCursor }) : reply({ error: 'Unauthorized' }, 401);
  } catch { return reply({ error: 'Sync unavailable' }, 503); }
});
