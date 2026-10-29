// Worker-only gateway. Supabase's built-in service credential stays in this runtime.
// Authentication is performed by the RPC against a private SHA-256 secret digest.
Deno.serve(async (request: Request) => {
  const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  const secret = request.headers.get('x-lead-secret') || '';
  if (request.method !== 'POST' || !/^[a-f0-9]{64}$/.test(secret)) return reply({ error: 'Unauthorized' }, 401);
  try {
    const reader = request.body?.getReader(); if (!reader) return reply({ error: 'Invalid request' }, 400);
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength;
      if (size > 24000) { await reader.cancel(); return reply({ error: 'Too large' }, 413); } chunks.push(value); }
    const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const { action, data } = JSON.parse(new TextDecoder().decode(bytes));
    const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))), n => n.toString(16).padStart(2, '0')).join('');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/capture_website_lead`, {
      method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_action: action, p_data: data, p_server_hash: digest }), signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return reply({ error: 'Unable to save' }, 503);
    const result = await response.json();
    return result?.saved ? reply(result) : reply({ error: 'Unauthorized or invalid transition' }, 403);
  } catch { return reply({ error: 'Unable to save' }, 503); }
});
