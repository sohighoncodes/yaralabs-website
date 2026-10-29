import { analyticsConfig } from './analytics-config.js';
import { safePage, analyticsPageLocation } from './attribution.js';

const events = new Set(['generate_lead', 'booking_complete', 'book_call_click', 'contact_click', 'outbound_click']);
const emitted = new Set();
export function analyticsAllowed() {
  if (typeof window === 'undefined' || navigator.globalPrivacyControl || navigator.doNotTrack === '1') return false;
  try { return localStorage.getItem('yara-analytics-choice') !== 'denied'; } catch { return true; }
}
export function trackEvent(event, parameters = {}, onceId) {
  if (!events.has(event) || !analyticsAllowed()) return false;
  const key = onceId ? `yara-event:${event}:${onceId}` : null;
  if (key) {
    if (emitted.has(key)) return false;
    try { if (sessionStorage.getItem(key)) return false; } catch { /* In-memory deduplication still applies. */ }
  }
  // Never put lead IDs, contact values, messages, tokens or full link URLs in dataLayer.
  // Reset optional fields so GTM cannot reuse metadata from the previous event.
  const payload = { event, page_path: safePage(location.pathname), form_type: undefined, contact_method: undefined, link_destination: undefined };
  if (['quote','call'].includes(parameters.form_type)) payload.form_type = parameters.form_type;
  if (['email','phone'].includes(parameters.contact_method)) payload.contact_method = parameters.contact_method;
  if (['google_calendar','upwork'].includes(parameters.link_destination)) payload.link_destination = parameters.link_destination;
  window.dataLayer ||= [];
  window.dataLayer.push(payload);
  if (key) { emitted.add(key); try { sessionStorage.setItem(key,'1'); } catch { /* Optional storage. */ } }
  return true;
}
export function initializeAnalytics() {
  if (!analyticsAllowed() || !analyticsConfig.enabled || !/^GTM-[A-Z0-9]+$/.test(analyticsConfig.gtmId) || document.getElementById('yara-gtm')) return;
  window.dataLayer ||= [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent','default',{ analytics_storage:'granted', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied' });
  const page = { page_location: analyticsPageLocation(location.href), page_path: safePage(location.pathname), page_referrer: safeReferrer() };
  // Global Google tag defaults must precede GTM's initialization event.
  // Data-layer variables alone do not override GA4's automatic page URL.
  gtag('set', { ...page, allow_google_signals: false, allow_ad_personalization_signals: false });
  window.dataLayer.push(page);
  window.dataLayer.push({ 'gtm.start':Date.now(),event:'gtm.js' });
  const script = document.createElement('script'); script.id='yara-gtm'; script.async=true;
  script.src=`https://www.googletagmanager.com/gtm.js?id=${analyticsConfig.gtmId}`;
  document.head.appendChild(script);
}
function safeReferrer() { try { return new URL(document.referrer).origin; } catch { return ''; } }
