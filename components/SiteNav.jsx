"use client";
import { useEffect, useState } from 'react';

export default function SiteNav({ onBook, scrolled }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const escape = event => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);
  return <nav className={`site-nav${scrolled ? ' is-scrolled' : ''}`} aria-label="Main navigation">
    <a href="/" className="site-brand" aria-label="Yara Labs home">Yara<span> Labs</span></a>
    <div className="site-links"><a href="/services">Services</a><a href="/projects">Projects</a></div>
    <button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} title={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}><span aria-hidden="true">{open ? '×' : '☰'}</span></button>
    <button className="nav-book" onClick={() => { setOpen(false); onBook(); }}>Book a call</button>
    {open && <div id="mobile-menu" className="mobile-menu"><a href="/services">Services</a><a href="/projects">Projects</a><a href="mailto:hello@yaralabs.io">Contact</a></div>}
  </nav>;
}
