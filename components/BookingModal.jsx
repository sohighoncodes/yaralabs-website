"use client";

import { useEffect, useRef, useState } from 'react';
import BookingCalendar from './BookingCalendar';
import { sharedBookingIntent } from '../lib/booking';
import { createLeadCapture } from '../lib/lead-capture-client';
import { trackEvent } from '../lib/analytics';
import { attributionFields, browserAttribution } from '../lib/attribution';

export default function BookingModal() {
  const [request, setRequest] = useState(null);
  useEffect(() => {
    const arrival = requestAnimationFrame(() => {
      const intent = sharedBookingIntent(window.location.pathname);
      if (intent) setRequest({ intent, trigger: null });
    });
    function open(event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.('[data-booking-link]');
      if (!link) return;
      event.preventDefault();
      trackEvent('book_call_click', { form_type: link.dataset.bookingIntent === 'quote' || /quote/i.test(link.textContent) ? 'quote' : 'call' });
      setRequest({ intent: link.dataset.bookingIntent === 'quote' || /quote/i.test(link.textContent) ? 'quote' : 'call', trigger: link });
    }
    document.addEventListener('click', open);
    return () => {
      cancelAnimationFrame(arrival);
      document.removeEventListener('click', open);
    };
  }, []);
  function close() {
    if (sharedBookingIntent(window.location.pathname)) {
      const url = new URL(window.location.href);
      url.pathname = '/';
      window.history.replaceState(window.history.state, '', url);
    }
    setRequest(null);
  }
  return request && <BookingWindow request={request} onClose={close} />;
}

function BookingWindow({ request, onClose }) {
  const dialog = useRef(null);
  const formRef = useRef(null);
  const capture = useRef(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [step, setStep] = useState('details');
  const [details, setDetails] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const quote = request.intent === 'quote';
  const [attribution] = useState(browserAttribution);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current.showModal();
    dialog.current.querySelector('input[name="name"]')?.focus({ preventScroll: true });
    capture.current = createLeadCapture(request.intent, () => formRef.current, setSaveStatus);
    const flush = () => { void capture.current?.flush(); };
    const hidden = () => { if (document.visibilityState === 'hidden') flush(); };
    const retry = () => capture.current?.changed();
    window.addEventListener('pagehide', flush);
    window.addEventListener('online', retry);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      capture.current?.dispose();
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('online', retry);
      document.removeEventListener('visibilitychange', hidden);
      document.body.style.overflow = previousOverflow;
      const focusTarget = request.trigger?.isConnected ? request.trigger : document.querySelector('.nav-book');
      focusTarget?.focus({ preventScroll: true });
    };
  }, [request]);

  useEffect(() => {
    if (step !== 'calendar') return;
    dialog.current.querySelector('#booking-heading')?.focus({ preventScroll: true });
  }, [step]);

  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    setPending(true); setError('');
    try {
      const contact = await capture.current.submit();
      if (!contact) throw new Error('Unable to save your details.');
      trackEvent('generate_lead', { form_type: request.intent }, contact.id);
      setDetails(contact);
      setStep('calendar');
    } catch {
      setError('We couldn’t save your details. Please try again, or email cjgomba@yaralabs.io.');
    } finally { setPending(false); }
  }

  return <dialog ref={dialog} data-clarity-mask="true" className={`booking-window${step === 'calendar' ? ' booking-window--calendar' : ''}`} aria-labelledby="booking-heading" onCancel={onClose}>
    <div className="booking-header">
      <div><p className="booking-eyebrow">Yara Labs · {quote ? 'Project enquiry' : 'Free discovery call'}</p>
        <h2 id="booking-heading" tabIndex={-1}>{step === 'calendar' ? 'Find a time that works.' : quote ? 'Let’s scope your project.' : 'Let’s talk about your business.'}</h2>
      </div>
      <button className="booking-close" type="button" aria-label="Close booking window" onClick={onClose}>×</button>
    </div>
    <ol className="booking-steps" aria-label="Booking progress">
      <li aria-current={step === 'details' ? 'step' : undefined}><span>{step === 'calendar' ? '✓' : '1'}</span>Your details</li>
      <li aria-current={step === 'calendar' ? 'step' : undefined}><span>2</span>Choose a time</li>
    </ol>
    {step === 'details' ? <form ref={formRef} className="booking-form" onSubmit={submit} onInput={() => capture.current?.changed()} onBlur={() => capture.current?.blur()}>
      {attributionFields.map(name => <input key={name} type="hidden" name={name} value={attribution?.[name] || ''} readOnly />)}
      <p className="booking-intro">{quote ? 'A little context helps us prepare a useful quote. Then choose a time to talk it through.' : 'Tell us a little about what you need, then book your free 30-minute call.'}</p>
      <fieldset className="booking-fields" disabled={pending}>
        <legend className="visually-hidden">Contact and project details</legend>
        <p className="booking-privacy booking-message">Your contact details are saved as you type so we can respond to your enquiry, even if you don’t finish booking.</p>
        <label>Name<input name="name" autoComplete="name" required maxLength={120} placeholder="Your name" /></label>
        <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com" /></label>
        <label>Phone<input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={40} placeholder="Include your country code" /></label>
        <label>Tools you currently use<input name="tools" required maxLength={600} placeholder="e.g. HubSpot, Slack, spreadsheets" /><small>Starting fresh? Just write “None yet”.</small></label>
        <label className="booking-message">How can we help?<textarea name="message" required minLength={10} maxLength={3000} rows={3} placeholder="What would you like to build, connect or improve?" /></label>
      </fieldset>
      <div className="booking-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <p className="booking-privacy" role="status">{saveStatus}</p>
      {error && <p className="booking-error" role="alert">{error} <a href="mailto:cjgomba@yaralabs.io">Email CJ</a></p>}
      <div className="booking-form-footer"><span>Free · 30 minutes · Google Meet</span><button type="submit" className="booking-continue" disabled={pending}>{pending ? 'Saving…' : 'Continue to booking'}<span aria-hidden="true"> →</span></button></div>
    </form> : <div className="booking-calendar-step" onClickCapture={() => capture.current?.activity()} onKeyDownCapture={() => capture.current?.activity()}>
      <BookingCalendar details={details} onConfirmed={() => capture.current?.complete()} />
    </div>}
  </dialog>;
}
