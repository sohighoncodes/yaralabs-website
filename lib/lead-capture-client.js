import { browserAttribution } from './attribution.js';
// Session storage contains only opaque ownership credentials, never contact data.
export function createLeadCapture(intent, readForm, notify, options = {}) {
  const send = options.fetch || fetch;
  let storage = options.storage;
  try { storage ||= window.sessionStorage; } catch { /* Browser privacy mode. */ }
  const key = `yara-lead-${intent}`;
  let identity, timer, latest, stopped = false, revision = 0, lastSent = '', lastActivity = 0;
  try { identity = JSON.parse(storage.getItem(key)); } catch { /* Storage may be disabled. */ }
  if (!identity || identity.expires < Date.now() || !/^[a-f0-9]{64}$/.test(identity.token)) identity = null;
  function credentials() {
    if (!identity) {
      identity = { id: crypto.randomUUID(), token: Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, '0')).join(''), expires: Date.now() + 86400000 };
      try { storage.setItem(key, JSON.stringify(identity)); } catch { /* In-memory fallback. */ }
    }
    return identity;
  }
  function snapshot() {
    const form = readForm();
    if (form) {
      const data = Object.fromEntries(new FormData(form));
      if (!String(data.name || '').trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email || '').trim()) || !/^[+()\d\s.-]+$/.test(data.phone || '') || String(data.phone || '').replace(/\D/g, '').length < 7 || data.website) return null;
      latest = { ...data, attribution: browserAttribution(), intent, source: location.pathname };
    }
    return latest;
  }
  async function save(full = false, unload = false) {
    clearTimeout(timer);
    if (stopped) return null;
    const data = snapshot(); if (!data) return null;
    const serialized = JSON.stringify(data);
    if (!full && serialized === lastSent && Date.now() - lastActivity < 60000) return null;
    revision = Math.max(Date.now(), revision + 1);
    const payload = { ...data, ...credentials(), revision };
    delete payload.expires;
    if (!unload) notify('Saving contact details…');
    try {
      const response = await send(full ? '/api/inquiries' : '/api/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true, signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error('Save failed');
      const result = await response.json();
      if (!result.saved) throw new Error('Save failed');
      if (payload.revision === revision) { lastSent = serialized; lastActivity = Date.now(); }
      if (!stopped && !unload && payload.revision === revision) notify('Contact details saved.');
      return payload;
    } catch {
      if (!stopped && !unload && payload.revision === revision) notify('Contact details haven’t saved yet. Check your connection; we’ll retry.');
      if (!stopped && !unload && !full && payload.revision === revision) timer = setTimeout(() => { void save(); }, 10000);
      if (full) throw new Error('Save failed');
      return null;
    }
  }
  return {
    changed() { snapshot(); clearTimeout(timer); timer = setTimeout(() => { void save(); }, 700); },
    flush() { return save(false, true); },
    blur() { return save(); },
    activity() { if (latest && Date.now() - lastActivity >= 60000) { lastActivity = 0; void save(); } },
    submit() { return save(true); },
    complete() { stopped = true; clearTimeout(timer); try { storage.removeItem(key); } catch { /* Optional storage. */ } },
    dispose() { clearTimeout(timer); void save(false, true); stopped = true; },
  };
}
