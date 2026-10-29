export const attributionFields = ['utm_source', 'utm_medium', 'utm_campaign', 'landing_page', 'referrer'];
const paths = new Set(['/', '/book', '/quote', '/services', '/services/automation', '/services/ai-agents', '/services/crm', '/services/custom-apps', '/projects', '/projects/colliers-catering', '/projects/us-medical-directors', '/projects/inka-arthouse']);
const key = 'yara-first-touch-v1';
const lifetime = 30 * 86400000;
export function safePage(path) { return paths.has(path) ? path : '/other'; }
export function analyticsPageLocation(href) {
  const source = new URL(href), clean = new URL(safePage(source.pathname), source.origin);
  for (const key of ['utm_source','utm_medium','utm_campaign']) {
    const value = campaignLabel(source.searchParams.get(key)); if (value) clean.searchParams.set(key, value);
  }
  return clean.href;
}
export function campaignLabel(value) {
  // Campaign labels, never arbitrary URLs, emails, phone numbers or form values.
  return typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_. -]{0,119}$/.test(value) && !/\d{7,}/.test(value) ? value : '';
}
export function cleanAttribution(input) {
  const value = input && typeof input === 'object' ? input : {};
  let referrer = '';
  try { const url = new URL(value.referrer); if (['https:', 'http:'].includes(url.protocol)) referrer = url.origin.slice(0,200); } catch { /* No external referrer. */ }
  return { utm_source: campaignLabel(value.utm_source), utm_medium: campaignLabel(value.utm_medium), utm_campaign: campaignLabel(value.utm_campaign), landing_page: safePage(value.landing_page), referrer };
}
export function firstTouch(href, referrer, storage, now = Date.now()) {
  try {
    const saved = JSON.parse(storage?.getItem(key) || 'null');
    if (saved?.expires > now && saved.expires <= now + lifetime) return cleanAttribution(saved.data);
  } catch { /* Storage is optional. */ }
  const url = new URL(href);
  const data = cleanAttribution({ ...Object.fromEntries(url.searchParams), landing_page: url.pathname, referrer });
  try { storage?.setItem(key, JSON.stringify({ data, expires: now + lifetime })); } catch { /* Keep the current visit usable. */ }
  return data;
}
export function clearAttribution(storage) { try { storage?.removeItem(key); } catch { /* Optional storage. */ } }
export function browserAttribution() {
  if (typeof window === 'undefined') return null;
  let storage;
  try { storage = window.localStorage; if (storage.getItem('yara-analytics-choice') === 'denied') return null; } catch { /* Optional storage. */ }
  if (navigator.globalPrivacyControl || navigator.doNotTrack === '1') return null;
  return firstTouch(location.href, document.referrer, storage);
}
