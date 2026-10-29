"use client";
import { useEffect, useState } from 'react';
import { analyticsAllowed, initializeAnalytics, trackEvent } from '../lib/analytics';
import { browserAttribution, clearAttribution } from '../lib/attribution';
import { analyticsConfig } from '../lib/analytics-config';

export default function Analytics() {
  const [allowed, setAllowed] = useState(null);
  useEffect(() => {
    browserAttribution(); initializeAnalytics();
    const frame = requestAnimationFrame(() => setAllowed(analyticsAllowed()));
    function click(event) {
      const link = event.target.closest?.('a[href]'); if (!link) return;
      // Shared booking links open our modal; their Google fallback URL is not an outbound visit.
      if (event.defaultPrevented || link.hasAttribute('data-booking-link')) return;
      const url = new URL(link.href, location.href);
      if (['mailto:','tel:'].includes(url.protocol)) trackEvent('contact_click',{contact_method:url.protocol==='mailto:'?'email':'phone'});
      else if (url.hostname === 'calendar.app.google') trackEvent('outbound_click',{link_destination:'google_calendar'});
      else if (url.hostname === 'www.upwork.com' || url.hostname === 'upwork.com') trackEvent('outbound_click',{link_destination:'upwork'});
    }
    document.addEventListener('click',click);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('click',click); };
  }, []);
  function optOut() {
    try { localStorage.setItem('yara-analytics-choice','denied'); clearAttribution(localStorage); } catch { return; }
    // Reload unloads third-party scripts; the next page load never starts GTM.
    window.dataLayer ||= [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.clarity?.('consentv2',{analytics_Storage:'denied',ad_Storage:'denied'});
    for (const cookie of document.cookie.split(';')) {
      const name=cookie.split('=')[0].trim();
      if (!/^(_ga(?:_|$)|_clck$|_clsk$)/.test(name)) continue;
      for (const domain of ['',location.hostname,'.'+location.hostname]) document.cookie=`${name}=; Max-Age=0; Path=/;${domain?' Domain='+domain+';':''}`;
    }
    location.reload();
  }
  return analyticsConfig.enabled && <div className="analytics-preferences">{allowed === true ? <button type="button" onClick={optOut}>Turn off optional analytics</button> : allowed === false ? <span>Optional analytics are off in this browser.</span> : null}</div>;
}
