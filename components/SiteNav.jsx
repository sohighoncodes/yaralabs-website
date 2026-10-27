"use client";
import { useEffect, useState } from 'react';
import BookingLink from './BookingLink';

export default function SiteNav({ scrolled }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const escape = event => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);
  return <nav className={`site-nav${scrolled ? ' is-scrolled' : ''}`} aria-label="Main navigation">
    <a href="/" className="site-brand" aria-label="Yara Labs home">Yara<span> Labs</span></a>
    <div className="site-links"><a href="/services">Services</a><a href="/projects">Projects</a><BookingLink intent="quote" className="nav-quote">Get a quote</BookingLink></div>
    <button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} title={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}><span aria-hidden="true">{open ? '×' : '☰'}</span></button>
    <BookingLink className="nav-book" onClick={() => setOpen(false)}>Book a call</BookingLink>
    {open && <div id="mobile-menu" className="mobile-menu"><a href="/services">Services</a><a href="/projects">Projects</a><BookingLink intent="quote" onClick={() => setOpen(false)}>Get a quote</BookingLink><a href="mailto:hello@yaralabs.io">Contact</a></div>}
  </nav>;
}
