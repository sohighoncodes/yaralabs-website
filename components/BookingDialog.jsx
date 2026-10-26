"use client";
import { useEffect, useRef, useState } from 'react';

export default function BookingDialog({ onClose }) {
  const dialog = useRef(null);
  const [prepared, setPrepared] = useState(false);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current.showModal();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = `Hi Yara Labs,\n\nI'd like to arrange a free discovery call.\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}\n`;
    window.location.href = `mailto:hello@yaralabs.io?subject=${encodeURIComponent('Discovery call request')}&body=${encodeURIComponent(body)}`;
    setPrepared(true);
  }
  // Native dialog provides Escape dismissal; this handler only adds pointer backdrop dismissal.
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
  return <dialog ref={dialog} className="booking-dialog" aria-labelledby="booking-title" onCancel={onClose} onClick={event => { if (event.target === dialog.current) { const r = dialog.current.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose(); } }}>
    <h2 id="booking-title">Let&apos;s talk.</h2>
    <p>Tell us a little about your project. We&apos;ll arrange a free discovery call by email.</p>
    <form onSubmit={submit}>
      <label>Name<input name="name" autoComplete="name" required maxLength={120} /></label>
      <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <label>What would you like to build or automate?<textarea name="message" required maxLength={3000} /></label>
      <p>Your email app will open with these details. Send the message there to reach us.</p>
      {prepared && <p role="status">Your email draft is ready. If your email app didn&apos;t open, contact <a href="mailto:hello@yaralabs.io">hello@yaralabs.io</a> directly.</p>}
      <div className="booking-actions"><button type="button" onClick={onClose}>Close</button><button type="submit">Continue in email</button></div>
    </form>
  </dialog>;
}
