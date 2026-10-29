import test from 'node:test';
import assert from 'node:assert/strict';
import { firstTouch, cleanAttribution, analyticsPageLocation } from '../lib/attribution.js';
import { trackEvent, initializeAnalytics } from '../lib/analytics.js';
import { analyticsConfig } from '../lib/analytics-config.js';
const storage = () => { const values = new Map(); return { getItem:k=>values.get(k)||null, setItem:(k,v)=>values.set(k,v), removeItem:k=>values.delete(k) }; };

test('first-touch source persists through navigation and changes after its 30-day expiry', () => {
  const store=storage(), start=1000;
  const first=firstTouch('https://yaralabs.io/quote?utm_source=instagram&utm_medium=social&utm_campaign=launch','https://instagram.com/private?email=private@example.com',store,start);
  assert.equal(first.utm_source,'instagram'); assert.equal(first.landing_page,'/quote'); assert.equal(first.referrer,'https://instagram.com');
  assert.deepEqual(firstTouch('https://yaralabs.io/book?utm_source=google','',store,start+100),first);
  assert.equal(firstTouch('https://yaralabs.io/book?utm_source=google','',store,start+31*86400000).utm_source,'google');
});
test('campaign data and analytics URLs exclude arbitrary query strings and contact information', () => {
  const clean=cleanAttribution({utm_source:'private@example.com',utm_medium:'+639123456789',utm_campaign:'launch',landing_page:'/person/private@example.com',referrer:'https://example.com/person?token=secret',email:'private@example.com'});
  assert.deepEqual(clean,{utm_source:'',utm_medium:'',utm_campaign:'launch',landing_page:'/other',referrer:'https://example.com'});
  assert.equal(analyticsPageLocation('https://yaralabs.io/quote?utm_source=test&email=private@example.com&token=secret#private'),'https://yaralabs.io/quote?utm_source=test');
  assert.equal(firstTouch('https://yaralabs.io/','',null).landing_page,'/');
});
test('events allowlist metadata, deduplicate success retries, and honor visitor opt-out', () => {
  globalThis.window={dataLayer:[]}; globalThis.location={pathname:'/quote',href:'https://yaralabs.io/quote'};
  globalThis.localStorage=storage(); globalThis.sessionStorage=storage();
  Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
  assert.equal(trackEvent('generate_lead',{form_type:'quote',email:'private@example.com',token:'secret'},'test-lead'),true);
  assert.equal(trackEvent('generate_lead',{form_type:'quote'},'test-lead'),false);
  assert.deepEqual(window.dataLayer,[{event:'generate_lead',page_path:'/quote',form_type:'quote',contact_method:undefined,link_destination:undefined}]);
  assert.equal(trackEvent('booking_complete',{form_type:'quote'},'test-lead'),true);
  assert.equal(trackEvent('random_event'),false);
  localStorage.setItem('yara-analytics-choice','denied'); assert.equal(trackEvent('book_call_click'),false);
  localStorage.removeItem('yara-analytics-choice'); navigator.globalPrivacyControl=true; assert.equal(trackEvent('contact_click'),false);
});
test('GTM loads once with ads denied and sanitized page metadata; invalid config stays inert', () => {
  globalThis.window={dataLayer:[]};globalThis.localStorage=storage();Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
  globalThis.location={pathname:'/book',href:'https://yaralabs.io/book?utm_source=test&email=private@example.com',origin:'https://yaralabs.io'};
  const added=[];globalThis.document={referrer:'https://example.com/path?token=secret',getElementById:()=>added[0],createElement:()=>({}),head:{appendChild:s=>added.push(s)}};
  const original={...analyticsConfig};
  try {
    analyticsConfig.enabled=false;initializeAnalytics();assert.equal(added.length,0);
    analyticsConfig.enabled=true;analyticsConfig.gtmId='invalid';initializeAnalytics();assert.equal(added.length,0);
    analyticsConfig.enabled=true;analyticsConfig.gtmId='GTM-TEST123';
    initializeAnalytics();initializeAnalytics();assert.equal(added.length,1);
    assert.equal(window.dataLayer[0][2].ad_user_data,'denied');
    assert.equal(window.dataLayer[1][0],'set');
    assert.equal(window.dataLayer[1][1].allow_google_signals,false);
    assert.equal(window.dataLayer[1][1].page_location,'https://yaralabs.io/book?utm_source=test');
    assert.equal(window.dataLayer[2].page_location,'https://yaralabs.io/book?utm_source=test');
    assert.equal(JSON.stringify(window.dataLayer).includes('private@example.com'),false);
  } finally { Object.assign(analyticsConfig,original); }
});
