"use client";
import React from "react";
import AppBrand from "../AppBrand";
import BookingLink from "../BookingLink";
import SiteNav from "../SiteNav";

const STACK = ['Zapier', 'GoHighLevel', 'HubSpot', 'Make', 'OpenAI', 'Claude', 'Airtable', 'Slack', 'Stripe', 'Google Workspace', 'Supabase', 'Cursor', 'Any API'];
const APPS = ['Stripe', 'Airtable', 'Slack'];
const AI_REPLY = 'Done! You\'re booked for Friday at 2pm.';
const CRM = ['New', 'Contacted', 'Booked', 'Won'];
const PROCESS = [['01', 'Call', 'Thirty minutes to find the quick wins.'], ['02', 'Build', 'We set it up, test it and hand it over.'], ['03', 'Run', 'It works quietly. We watch for problems.']];
const TESTIMONIALS = [];
const TQ = [{"quote":"Very skilled and amazing to work with. They untangled our CallRail, WordPress, HubSpot and GHL setup and got it all talking to each other. Our email campaigns pretty much run themselves now.","who":"Zeid Kaddoura","role":"Webology World · Australia","work":"CRM automations, email campaigns","initials":"ZK","img":"/assets/avatars/zeid-kaddoura.png"},{"quote":"Mate, our inbox used to be where leads went to die. Now they get a reply before I've even seen them, and the reviews keep rolling in. Cheers!","who":"Kenny Eu","role":"Colliers Catering · Sydney","work":"CRM, funnels, ads, reviews","initials":"KE","img":"/assets/avatars/kenny-eu.png"},{"quote":"We went from juggling eight apps to one. My team got hours of their week back, and for the first time I can actually see what our growth spend returns. Thorough, patient and always a step ahead.","who":"Dr. Aloysius Fobi","role":"US Medical Directors · USA","work":"GHL migration, ops automation","initials":"AF","img":"/assets/avatars/aloysius-fobi.png"},{"quote":"Website, funnels, lead forms, affiliates, emails, CRM… I kept adding to the list and they kept ticking it off. Absolute legends.","who":"Jordan Treloar","role":"Hugo Health · Australia","work":"Website, funnels, affiliate system, CRM","initials":"JT","img":"/assets/avatars/jordan-treloar.png"},{"quote":"Facebook ads, pipeline, intake forms, Jotform, all connected. New clients land exactly where they should without me lifting a finger. I genuinely don't know how we managed before.","who":"Atty. Elizabeth Murrar","role":"Murrar Law","work":"GHL setup, ads, intake automation","initials":"EM","img":"/assets/avatars/elizabeth-murrar.png"},{"quote":"Never thought I'd call accounting fun. Katana and Xero now post our MO and SO journals and track COGS on their own. Month-end went from dread to done.","who":"Amanda Nguyen","role":"Speedshield","work":"Katana + Xero accounting automation","initials":"AN","img":"/assets/avatars/amanda-nguyen.png"}];
const FAQS = [
  ['Which service do I need?', 'Not sure? That\'s what the free call is for.'],
  ['Do I need new tools?', 'Almost never. We build around what you already use.'],
  ['How fast can you start?', 'Most projects kick off within a week of the call.'],
  ['What if something breaks?', 'Alerts tell us first. Fixes are included for 30 days.'],
  ['Do I own what you build?', 'Yes. Everything lives in your accounts.']
];
const EASE = 'cubic-bezier(.16,1,.3,1)';
const DARK = { ink: [[13,19,33,1],[243,245,250,1]], sub: [[91,98,114,1],[168,177,196,1]], line: [[228,231,236,1],[255,255,255,0.12]], card: [[255,255,255,1],[22,30,52,0.7]], bg: [[246,247,249,1],[7,11,22,1]] };

export default class DesignPage extends React.Component {
  state = { tick: 0, chars: 0, openFaq: 0, scrolled: false, compactNav: false };
  bentoRef = React.createRef(); howRef = React.createRef(); darkRef = React.createRef(); zoneRef = React.createRef();
  mx = 0; my = 0; cx = 0; cy = 0;
  motion() { return (this.props.motion ?? 'Full') !== 'Off' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  componentDidMount() {
    this.t1 = this.motion() && setInterval(() => this.setState(s => ({ tick: s.tick + 1 })), 1100);
    this.t2 = this.motion() && setInterval(() => this.setState(s => ({ chars: s.chars >= AI_REPLY.length + 18 ? 0 : s.chars + 1 })), 70);
    this.onScroll = () => { if (!this.raf) this.raf = requestAnimationFrame(() => { this.raf = 0; this.scrollTick(); }); };
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll);
    this.onPtr = (e) => { this.mx = e.clientX / window.innerWidth - 0.5; this.my = e.clientY / window.innerHeight - 0.5; };
    window.addEventListener('pointermove', this.onPtr, { passive: true });
    requestAnimationFrame(() => { this.animate(); this.scrollTick(); this.objLoop(); });
  }
  componentWillUnmount() {
    clearInterval(this.t1); clearInterval(this.t2);
    window.removeEventListener('scroll', this.onScroll); window.removeEventListener('pointermove', this.onPtr); cancelAnimationFrame(this.loopRaf); window.removeEventListener('resize', this.onScroll);
    this.io && this.io.disconnect(); this.mq && this.mq.cancel();
  }
  scrollTick() {
    const vh = window.innerHeight, patch = {};
    const scrolled = window.scrollY > 24; if (scrolled !== this.state.scrolled) patch.scrolled = scrolled;
    const compactNav = window.innerWidth < 900; if (compactNav !== this.state.compactNav) patch.compactNav = compactNav;
    const hs = this.howRef.current;
    if (hs) { const r = hs.getBoundingClientRect(); const hp = Math.round(Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (vh * 0.55))) * 100); if (hp !== this.state.howP) patch.howP = hp; }
    if (Object.keys(patch).length) this.setState(patch);
    const z = this.zoneRef.current, d = this.darkRef.current;
    if (z && d) {
      const r = z.getBoundingClientRect(), cl = (v) => Math.min(1, Math.max(0, v));
      const p = Math.min(cl((vh * 0.7 - r.top) / (vh * 0.4)), cl((r.bottom - vh * 0.35) / (vh * 0.4)));
      d.style.opacity = p.toFixed(3);
      for (const k in DARK) { const [a, b] = DARK[k]; const c = a.map((v, i) => v + (b[i] - v) * p); z.style.setProperty('--yl-' + k, `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${c[3].toFixed(3)})`); }
    }
    const b = this.bentoRef.current;
    if (b && this.motion()) {
      const r = b.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - (r.top - vh * 0.3) / (vh * 0.6)));
      b.style.transform = `scale(${(0.92 + 0.08 * p).toFixed(4)}) rotateX(${((1 - p) * 12).toFixed(2)}deg)`;
    }
  }
  objLoop() {
    const objs = [...document.querySelectorAll('[data-yl-obj]')];
    const loop = () => {
      this.cx += (this.mx - this.cx) * 0.06; this.cy += (this.my - this.cy) * 0.06;
      const sy = window.scrollY;
      if (sy < window.innerHeight * 1.6) objs.forEach(o => { const k = +o.dataset.ylObj; o.style.transform = `translate3d(${(this.cx * k * 40).toFixed(1)}px, ${(this.cy * k * 40 - sy * k * 0.32).toFixed(1)}px, 0)`; });
      this.loopRaf = requestAnimationFrame(loop);
    };
    if (this.motion()) loop();
  }
  animate() {
    if (!this.motion()) return;
    const full = (this.props.motion ?? 'Full') === 'Full';
    const words = (root, base) => root.querySelectorAll('[data-yl-word]').forEach((w, i) => w.animate(
      [{ opacity: 0, filter: full ? 'blur(16px)' : 'none', transform: 'translateY(0.35em)' }, { opacity: 1, filter: 'blur(0px)', transform: 'none' }],
      { duration: 1200, delay: base + i * 90, easing: EASE, fill: 'both' }));
    const hide = (el) => { el._ylHide = el.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 1, fill: 'forwards' }); };
    const hero = document.querySelector('[data-yl-split="hero"]'); if (hero) words(hero, 150);
    const reveal = (el) => { const a = el.animate(
      [{ opacity: 0, filter: full ? 'blur(10px)' : 'none', transform: 'translateY(32px)' }, { opacity: 1, filter: 'blur(0px)', transform: 'none' }],
      { duration: 1100, delay: +el.dataset.ylReveal || 0, easing: EASE, fill: 'both' }); el._ylHide && el._ylHide.cancel(); a.onfinish = () => a.cancel(); };
    this.io = new IntersectionObserver((entries) => entries.forEach(e => {
      if (!e.isIntersecting) return;
      if (e.target.dataset.ylSplit) words(e.target, 0); else reveal(e.target);
      this.io.unobserve(e.target);
    }), { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('[data-yl-split]:not([data-yl-split="hero"])').forEach(el => { el.querySelectorAll('[data-yl-word]').forEach(hide); this.io.observe(el); });
    document.querySelectorAll('[data-yl-reveal]').forEach(el => { hide(el); this.io.observe(el); });
    document.querySelectorAll('[data-yl-float]').forEach((el, i) => el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }], { duration: 2600 + i * 500, delay: i * 300, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }));
    document.querySelectorAll('[data-yl-obj]').forEach((el, i) => el.animate([{ opacity: 0, scale: 0.6, filter: full ? 'blur(14px)' : 'none' }, { opacity: 1, scale: 1, filter: 'blur(0px)' }], { duration: 1600, delay: 500 + i * 120, easing: EASE, fill: 'backwards' }));
    document.querySelectorAll('[data-yl-bob]').forEach((el, i) => el.animate([{ transform: 'translateY(0) rotate(0deg)' }, { transform: `translateY(-${14 + (i % 3) * 6}px) rotate(${i % 2 ? -8 : 8}deg)` }], { duration: 3800 + i * 700, delay: i * 200, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }));
    document.querySelectorAll('[data-yl-drift]').forEach((el, i) => el.animate([{ translate: '0 0' }, { translate: i ? '120px -60px' : '-90px 70px' }], { duration: 14000 + i * 4000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }));
    document.querySelectorAll('[data-yl-aurora]').forEach((el, i) => el.animate([{ translate: '0 0', scale: 1 }, { translate: ['18vw 10vh', '-14vw -12vh', '-10vw 14vh'][i], scale: 1.25 }], { duration: 16000 + i * 5000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }));
    const up = document.querySelector('[data-yl-uptime]');
    if (up) up.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 24000, iterations: Infinity });
    document.querySelectorAll('[data-yl-shine]').forEach((el, i) => el.animate([{ left: '-60%', offset: 0 }, { left: '130%', offset: 0.3 }, { left: '130%', offset: 1 }], { duration: 4200, delay: 900 + i * 260, iterations: Infinity, easing: 'cubic-bezier(.45,0,.2,1)' }));
    document.querySelectorAll('[data-yl-col]').forEach((el, i) => { const k = [{ transform: 'translateY(0)' }, { transform: 'translateY(calc(-50% - 8px))' }]; el.animate(el.dataset.ylCol === 'down' ? k.reverse() : k, { duration: 42000 + i * 7000, iterations: Infinity }); });
    const m = document.querySelector('[data-yl-marquee]');
    if (m) this.mq = m.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(calc(-50% - 6px))' }], { duration: 50000, iterations: Infinity });
  }
  renderVals() {
    const { tick, chars, openFaq, scrolled } = this.state;
    const ai = tick % 3, crmStage = tick % 4;
    const seed = (i) => 30 + ((Math.sin((tick + 1) * 1.7 + i * 2.3) + 1) / 2) * 65;
    return {
      navLinksDisplay: this.state.compactNav ? 'none' : 'flex',
      navBg: scrolled ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.4)',
      navBorder: scrolled ? '#E4E7EC' : 'rgba(228,231,236,0.5)',
      navShadow: scrolled ? '0 10px 30px -12px rgba(13,19,33,0.18)' : 'none',
      bentoRef: this.bentoRef,
      autoDot: ['8%', 'calc(50% - 6px)', 'calc(92% - 12px)'][ai],
      autoApps: APPS.map((name, i) => ({ name, ring: i === ai ? '2px solid #2A62F5' : '2px solid transparent' })),
      aiText: AI_REPLY.slice(0, Math.min(chars, AI_REPLY.length)),
      caret: chars < AI_REPLY.length ? 1 : (Math.floor(chars / 4) % 2),
      crmCols: CRM.map((name, i) => ({ name, count: [12, 8, 5, 3][i] + (i === crmStage ? 1 : 0), hot: i === crmStage ? '#2A62F5' : '#FFFFFF', label: i === crmStage ? 'Sarah K.' : '' })),
      appBars: Array.from({ length: 8 }, (_, i) => ({ h: Math.round(seed(i)), c: i === 7 ? '#2A62F5' : '#DCE6FE' })),
      stackLoop: [...STACK, ...STACK],
      howRef: this.howRef, darkRef: this.darkRef, zoneRef: this.zoneRef,
      trackDisplay: this.state.compactNav ? 'none' : 'block',
      howCols: this.state.compactNav ? 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' : 'repeat(3, minmax(0, 1fr))',
      howFill: ((this.state.howP || 0) * 0.6668).toFixed(2) + '%',
      howNodes: ['16.66%', '50%', '83.33%'].map((x, k) => { const on = (this.state.howP || 0) >= k * 50; return { x, bg: on ? '#2A62F5' : '#DDE1E8', glow: on ? '0 0 0 6px rgba(42,98,245,0.15)' : 'none' }; }),
      hc0: (this.state.howP || 0) >= 0 && (this.state.howP || 0) > 2 ? '#7FA2FF' : 'var(--yl-line, #E4E7EC)',
      hc1: (this.state.howP || 0) >= 50 ? '#7FA2FF' : 'var(--yl-line, #E4E7EC)',
      hc2: (this.state.howP || 0) >= 100 ? '#7FA2FF' : 'var(--yl-line, #E4E7EC)',
      buildBlocks: [['Zapier', '#FF7A45'], ['GoHighLevel', '#2A62F5'], ['OpenAI', '#0D1321']].map(([name, c], k) => { const on = k < (tick % 5); return { name, c, op: on ? 1 : 0, tf: on ? 'none' : 'translateY(16px) scale(0.96)', fl: on ? 'blur(0px)' : 'blur(6px)' }; }),
      uptime: Array.from({ length: 60 }, (_, i) => i % 30 === 17 ? '#FFC48A' : '#B7E9CD'),
      runRing: tick % 2 ? 6 : 2,
      process: PROCESS.map(([n, title, line], i) => ({ n, title, line, delay: i * 110 })),
      showTestimonials: this.props.showTestimonials ?? true,
      tCols: [0, 1, 2].map(c => { const items = TQ.filter((_, i) => i % 3 === c); return { dir: c === 1 ? 'down' : 'up', items: [...items, ...items] }; }),
      testimonials: TESTIMONIALS.map((q, i) => ({ ...q, delay: i * 110 })),
      faqs: FAQS.map(([q, a], i) => ({ q, a, rows: openFaq === i ? '1fr' : '0fr', rot: openFaq === i ? 45 : 0, toggle: () => this.setState(s => ({ openFaq: s.openFaq === i ? -1 : i })) })),
    };
  }

render() { const {bentoRef,autoDot,autoApps,aiText,caret,crmCols,appBars,stackLoop,howRef,darkRef,zoneRef,trackDisplay,howCols,howFill,howNodes,hc0,hc1,hc2,buildBlocks,uptime,runRing,showTestimonials,tCols,faqs} = this.renderVals(); return (<>{" "}

{" "}
<div style={{"overflowX":"clip","position":"relative"}}>
{" "}
<div aria-hidden={"true"} style={{"position":"fixed","inset":"0","zIndex":"45","pointerEvents":"none","opacity":"0.22","mixBlendMode":"soft-light","backgroundImage":"url(/assets/grain.png)","backgroundSize":"260px 260px"}}>

</div>
{" "}
<div ref={(darkRef)} aria-hidden={"true"} style={{"position":"fixed","inset":"0","zIndex":"-1","pointerEvents":"none","opacity":"0","background":"#070B16","overflow":"hidden"}}>
{" "}
<div data-yl-aurora={"0"} style={{"position":"absolute","left":"-15%","top":"-25%","width":"75vw","height":"75vw","background":"radial-gradient(closest-side, rgba(42,98,245,0.42), rgba(42,98,245,0))"}}>

</div>
{" "}
<div data-yl-aurora={"1"} style={{"position":"absolute","right":"-20%","bottom":"-30%","width":"65vw","height":"65vw","background":"radial-gradient(closest-side, rgba(118,92,255,0.28), rgba(118,92,255,0))"}}>

</div>
{" "}
<div data-yl-aurora={"2"} style={{"position":"absolute","left":"30%","top":"40%","width":"40vw","height":"40vw","background":"radial-gradient(closest-side, rgba(255,150,90,0.12), rgba(255,150,90,0))"}}>

</div>
{" "}
<div style={{"position":"absolute","inset":"0","backgroundImage":"radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1.2px)","backgroundSize":"24px 24px","WebkitMaskImage":"radial-gradient(ellipse at 50% 50%, #000, transparent 75%)","maskImage":"radial-gradient(ellipse at 50% 50%, #000, transparent 75%)"}}>

</div>
{" "}
</div>
{" "}
<div data-yl-drift={"0"} aria-hidden={"true"} style={{"position":"absolute","top":"-280px","left":"50%","width":"1400px","height":"900px","transform":"translateX(-50%)","background":"radial-gradient(closest-side, #DCE6FE, rgba(246,247,249,0))","pointerEvents":"none"}}>

</div>
{" "}
<div data-yl-drift={"1"} aria-hidden={"true"} style={{"position":"absolute","top":"300px","left":"8%","width":"620px","height":"520px","background":"radial-gradient(closest-side, rgba(255,179,122,0.34), rgba(246,247,249,0))","pointerEvents":"none"}}>

</div>
{" "}
<SiteNav scrolled={this.state.scrolled} />
{" "}
<header id={"top"} data-screen-label={"Hero"} style={{"position":"relative","maxWidth":"1200px","margin":"0 auto","padding":"clamp(150px, 18vw, 210px) clamp(20px, 5vw, 64px) 0","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center"}}>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","inset":"0","zIndex":"0","pointerEvents":"none"}}>
{" "}
<div data-yl-obj={"0.9"} style={{"position":"absolute","left":"2%","top":"34%"}}>
<div data-yl-bob={"0"}>
<div style={{"width":"clamp(78px, 10vw, 150px)","aspectRatio":"1","borderRadius":"50%","background":"radial-gradient(circle at 32% 28%, #FFFFFF 0%, #D6E2FF 9%, #7FA2FF 30%, #2A62F5 56%, #163599 84%, #0B1A5C 100%)","boxShadow":"inset -10px -14px 28px rgba(6,14,50,0.4), inset 6px 8px 16px rgba(255,255,255,0.4), 0 40px 60px -22px rgba(42,98,245,0.6)"}}>

</div>
</div>
</div>
{" "}
<div data-yl-obj={"1.4"} style={{"position":"absolute","right":"10%","top":"20%"}}>
<div data-yl-bob={"1"}>
<div style={{"width":"clamp(38px, 4.6vw, 70px)","aspectRatio":"1","borderRadius":"50%","background":"radial-gradient(circle at 32% 28%, #FFFFFF 0%, #FFE6D2 10%, #FFB37A 36%, #F07A3C 66%, #9C3A12 100%)","boxShadow":"inset -10px -14px 28px rgba(6,14,50,0.4), inset 6px 8px 16px rgba(255,255,255,0.4), 0 26px 40px -16px rgba(240,122,60,0.55)"}}>

</div>
</div>
</div>
{" "}
<div data-yl-obj={"0.6"} style={{"position":"absolute","right":"0%","top":"50%","perspective":"600px"}}>
<div data-yl-bob={"2"} style={{"filter":"drop-shadow(0 30px 30px rgba(27,63,184,0.35))"}}>
<div style={{"width":"clamp(110px, 13vw, 200px)","aspectRatio":"1","borderRadius":"50%","transform":"rotateX(62deg) rotateY(-16deg)","background":"radial-gradient(closest-side, transparent 56%, rgba(255,255,255,0.75) 68%, transparent 80%), conic-gradient(from 200deg, #163599, #6E96FF, #EEF3FF, #6E96FF, #163599, #0B1A5C, #163599)","WebkitMaskImage":"radial-gradient(closest-side, transparent 55%, #000 57%, #000 97%, transparent 100%)","maskImage":"radial-gradient(closest-side, transparent 55%, #000 57%, #000 97%, transparent 100%)"}}>

</div>
</div>
</div>
{" "}
<div data-yl-obj={"1.1"} style={{"position":"absolute","left":"13%","bottom":"0%","perspective":"500px"}}>
<div data-yl-bob={"3"}>
<div style={{"width":"clamp(56px, 6.4vw, 92px)","aspectRatio":"1","boxSizing":"border-box","borderRadius":"28%","transform":"rotate(-14deg) rotateX(16deg) rotateY(18deg)","background":"linear-gradient(145deg, #34405E 0%, #131B2E 50%, #070B16 100%)","boxShadow":"inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -4px 10px rgba(0,0,0,0.5), 0 30px 40px -18px rgba(13,19,33,0.6)","display":"grid","placeItems":"center"}}>
<div style={{"width":"62%","height":"32%","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.45), 0 0 18px rgba(90,136,255,0.6)","display":"flex","justifyContent":"flex-end","alignItems":"center","padding":"0 3px","boxSizing":"border-box"}}>
<div style={{"height":"80%","aspectRatio":"1","borderRadius":"50%","background":"radial-gradient(circle at 35% 30%, #FFFFFF, #DCE6FE)"}}>

</div>
</div>
</div>
</div>
</div>
{" "}
<div data-yl-obj={"0.8"} style={{"position":"absolute","right":"15%","bottom":"4%"}}>
<div data-yl-bob={"4"}>
<div style={{"width":"clamp(64px, 8vw, 120px)","aspectRatio":"2.4","borderRadius":"999px","transform":"rotate(28deg)","background":"linear-gradient(180deg, #FFFFFF 0%, #E4ECFF 40%, #A9C0FF 100%)","boxShadow":"inset 0 -6px 12px rgba(42,98,245,0.3), inset 0 3px 4px #FFFFFF, 0 24px 36px -16px rgba(42,98,245,0.45)"}}>

</div>
</div>
</div>
{" "}
<div data-yl-obj={"1.8"} style={{"position":"absolute","left":"24%","top":"17%"}}>
<div data-yl-bob={"5"}>
<div style={{"width":"22px","aspectRatio":"1","borderRadius":"50%","background":"radial-gradient(circle at 32% 28%, #FFFFFF 0%, #9DB7FF 30%, #2A62F5 70%, #0B1A5C 100%)","boxShadow":"inset -10px -14px 28px rgba(6,14,50,0.4), inset 6px 8px 16px rgba(255,255,255,0.4), 0 10px 16px -6px rgba(42,98,245,0.6)"}}>

</div>
</div>
</div>
{" "}
</div>
{" "}
<div data-yl-reveal={"0"} style={{"position":"relative","zIndex":"1","display":"inline-flex","alignItems":"center","gap":"10px","padding":"5px 14px 5px 5px","borderRadius":"999px","background":"rgba(255,255,255,0.8)","border":"1px solid #E4E7EC","fontSize":"13px","color":"#3A4252"}}>
{" "}
<span style={{"padding":"3px 10px","borderRadius":"999px","background":"#2A62F5","color":"#FFFFFF","fontWeight":"500","fontSize":"12px"}}>
{"Yara Labs"}
</span>
<span style={{"whiteSpace":"nowrap"}}>
{"Automation · AI · CRM · Apps"}
</span>
{" "}
</div>
{" "}
<h1 data-yl-split={"hero"} style={{"position":"relative","zIndex":"1","fontWeight":"500","fontSize":"clamp(52px, 8.6vw, 120px)","lineHeight":"0.96","letterSpacing":"0","margin":"28px 0 0"}}>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"Systems"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"that"}
</span>
<br  />
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","letterSpacing":"0","color":"#2A62F5","paddingRight":"0.06em"}}>
{"run"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","letterSpacing":"0","color":"#2A62F5","paddingRight":"0.06em"}}>
{"themselves."}
</span>
{" "}
</h1>
{" "}
<p data-yl-reveal={"520"} style={{"position":"relative","zIndex":"1","fontSize":"clamp(17px, 1.5vw, 19px)","lineHeight":"1.5","maxWidth":"40ch","margin":"28px 0 0","color":"#5B6272"}}>
{"Automation, AI, CRMs and custom apps for growing businesses."}
</p>
{" "}
<div data-yl-reveal={"640"} style={{"position":"relative","zIndex":"1","display":"flex","gap":"10px","flexWrap":"wrap","justifyContent":"center","marginTop":"32px"}}>
{" "}
<BookingLink style={{"border":"0","cursor":"pointer","font":"inherit","fontSize":"15px","fontWeight":"500","display":"inline-flex","alignItems":"center","gap":"12px","padding":"7px 7px 7px 22px","borderRadius":"999px","position":"relative","overflow":"hidden","isolation":"isolate","background":"linear-gradient(180deg, #2B3550 0%, #131B2E 55%, #0B1120 100%)","color":"#FFFFFF","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -2px 0 rgba(0,0,0,0.35), 0 0 0 1px #0B1120, 0 2px 4px rgba(13,19,33,0.22), 0 12px 26px -10px rgba(13,19,33,0.6)","transition":"transform 400ms cubic-bezier(.16,1,.3,1)"}} className={"yl-hover-0"}>
<span data-yl-shine={""} aria-hidden={"true"} style={{"position":"absolute","top":"0","bottom":"0","left":"-60%","width":"45%","zIndex":"-1","pointerEvents":"none","background":"linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)","transform":"skewX(-20deg)"}}>

</span>
{"Book a free call"}
<span style={{"width":"34px","height":"34px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.45), 0 2px 6px -1px rgba(42,98,245,0.6)","display":"grid","placeItems":"center"}}>
{"→"}
</span>
</BookingLink>
{" "}
<a href={"#services"} style={{"display":"inline-flex","alignItems":"center","padding":"0 22px","minHeight":"48px","borderRadius":"999px","background":"linear-gradient(180deg, #FFFFFF, #F1F3F7)","border":"1px solid #DDE1E8","color":"#0D1321","fontSize":"15px","fontWeight":"500","boxShadow":"inset 0 1px 0 #FFFFFF, 0 1px 2px rgba(13,19,33,0.06), 0 8px 18px -10px rgba(13,19,33,0.25)"}} className={"yl-hover-1"}>
{"Explore services"}
</a>
{" "}
</div>
{" "}
</header>
{" "}
<section id={"services"} data-screen-label={"Services bento"} style={{"maxWidth":"1200px","margin":"0 auto","padding":"clamp(64px, 9vw, 104px) clamp(20px, 5vw, 64px) 0","perspective":"1600px"}}>
{" "}
<div ref={(bentoRef)} style={{"transformOrigin":"50% 0%","willChange":"transform","display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 440px), 1fr))","gap":"16px"}}>
{" "}
<a href={"/services/automation"} data-yl-reveal={"760"} style={{"display":"flex","flexDirection":"column","gap":"28px","padding":"28px","borderRadius":"28px","background":"#FFFFFF","border":"1px solid #E4E7EC","color":"#0D1321","boxShadow":"0 1px 2px rgba(13,19,33,0.04)","transition":"transform 500ms cubic-bezier(.16,1,.3,1), box-shadow 500ms ease"}} className={"yl-hover-2"}>
{" "}
<div style={{"height":"200px","borderRadius":"20px","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)","position":"relative","display":"grid","placeItems":"center","overflow":"hidden"}}>
{" "}
<div style={{"position":"relative","width":"min(86%, 360px)","display":"flex","justifyContent":"space-between","alignItems":"center"}}>
{" "}
<div style={{"position":"absolute","left":"30px","right":"30px","top":"50%","height":"2px","background":"#C9D6FB"}}>

</div>
{" "}
<div style={{"position":"absolute","top":"calc(50% - 6px)","left":(autoDot),"width":"12px","height":"12px","borderRadius":"999px","background":"#2A62F5","boxShadow":"0 0 0 6px rgba(42,98,245,0.18)","transition":"left 900ms cubic-bezier(.16,1,.3,1)"}}>

</div>
{" "}
{(autoApps).map((ap, itemIndex6) => <React.Fragment key={itemIndex6}>{" "}
<span style={{"position":"relative","padding":"10px 14px","borderRadius":"14px","background":"#FFFFFF","fontSize":"13px","fontWeight":"500","boxShadow":"0 10px 30px -14px rgba(13,19,33,0.35)","outline":(ap.ring),"transition":"outline-color 400ms ease"}}>
<AppBrand name={ap.name} />
</span>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
</div>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","alignItems":"flex-end","gap":"20px"}}>
{" "}
<div >
<div style={{"fontSize":"13px","color":"#8A91A0"}}>
{"01"}
</div>
<div style={{"fontSize":"32px","fontWeight":"500","letterSpacing":"0","marginTop":"6px"}}>
{"Automation"}
</div>
<div style={{"fontSize":"15px","color":"var(--yl-sub, #5B6272)","marginTop":"6px"}}>
{"Your apps, talking to each other."}
</div>
</div>
{" "}
<span style={{"flex":"none","width":"44px","height":"44px","borderRadius":"999px","background":"#0D1321","color":"#FFFFFF","display":"grid","placeItems":"center"}}>
{"→"}
</span>
{" "}
</div>
{" "}
</a>
{" "}
<a href={"/services/ai-agents"} data-yl-reveal={"860"} style={{"display":"flex","flexDirection":"column","gap":"28px","padding":"28px","borderRadius":"28px","background":"#FFFFFF","border":"1px solid #E4E7EC","color":"#0D1321","boxShadow":"0 1px 2px rgba(13,19,33,0.04)","transition":"transform 500ms cubic-bezier(.16,1,.3,1), box-shadow 500ms ease"}} className={"yl-hover-3"}>
{" "}
<div style={{"height":"200px","borderRadius":"20px","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)","display":"flex","flexDirection":"column","justifyContent":"center","gap":"10px","padding":"0 clamp(18px, 4vw, 40px)"}}>
{" "}
<div style={{"alignSelf":"flex-start","maxWidth":"80%","padding":"10px 14px","borderRadius":"18px 18px 18px 6px","background":"#FFFFFF","fontSize":"14px","boxShadow":"0 10px 30px -14px rgba(13,19,33,0.3)"}}>
{"Can I move my booking to Friday?"}
</div>
{" "}
<div style={{"alignSelf":"flex-end","maxWidth":"85%","minHeight":"20px","padding":"10px 14px","borderRadius":"18px 18px 6px 18px","background":"#2A62F5","color":"#FFFFFF","fontSize":"14px","lineHeight":"1.4","boxShadow":"0 14px 30px -14px rgba(42,98,245,0.6)"}}>
{(aiText)}
<span style={{"opacity":(caret)}}>
{"▍"}
</span>
</div>
{" "}
</div>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","alignItems":"flex-end","gap":"20px"}}>
{" "}
<div >
<div style={{"fontSize":"13px","color":"#8A91A0"}}>
{"02"}
</div>
<div style={{"fontSize":"32px","fontWeight":"500","letterSpacing":"0","marginTop":"6px"}}>
{"AI agents"}
</div>
<div style={{"fontSize":"15px","color":"var(--yl-sub, #5B6272)","marginTop":"6px"}}>
{"AI that reads, sorts and replies for you."}
</div>
</div>
{" "}
<span style={{"flex":"none","width":"44px","height":"44px","borderRadius":"999px","background":"#0D1321","color":"#FFFFFF","display":"grid","placeItems":"center"}}>
{"→"}
</span>
{" "}
</div>
{" "}
</a>
{" "}
<a href={"/services/crm"} data-yl-reveal={"760"} style={{"display":"flex","flexDirection":"column","gap":"28px","padding":"28px","borderRadius":"28px","background":"#FFFFFF","border":"1px solid #E4E7EC","color":"#0D1321","boxShadow":"0 1px 2px rgba(13,19,33,0.04)","transition":"transform 500ms cubic-bezier(.16,1,.3,1), box-shadow 500ms ease"}} className={"yl-hover-4"}>
{" "}
<div style={{"height":"200px","borderRadius":"20px","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)","display":"grid","gridTemplateColumns":"repeat(4, minmax(0, 1fr))","gap":"8px","padding":"22px clamp(14px, 3vw, 28px)","boxSizing":"border-box"}}>
{" "}
{(crmCols).map((cc, itemIndex5) => <React.Fragment key={itemIndex5}>{" "}
<div style={{"display":"flex","flexDirection":"column","gap":"8px"}}>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","fontSize":"11px","fontWeight":"500","color":"#3A4252"}}>
<span >
{(cc.name)}
</span>
<span style={{"color":"#2A62F5"}}>
{(cc.count)}
</span>
</div>
{" "}
<div style={{"height":"38px","borderRadius":"10px","background":"#FFFFFF","boxShadow":"0 8px 20px -12px rgba(13,19,33,0.3)"}}>

</div>
{" "}
<div style={{"height":"38px","borderRadius":"10px","background":(cc.hot),"color":"#FFFFFF","fontSize":"11px","display":"grid","placeItems":"center","boxShadow":"0 8px 20px -12px rgba(13,19,33,0.3)","transition":"background 600ms ease"}}>
{(cc.label)}
</div>
{" "}
</div>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","alignItems":"flex-end","gap":"20px"}}>
{" "}
<div >
<div style={{"fontSize":"13px","color":"#8A91A0"}}>
{"03"}
</div>
<div style={{"fontSize":"32px","fontWeight":"500","letterSpacing":"0","marginTop":"6px"}}>
{"CRM setup"}
</div>
<div style={{"fontSize":"15px","color":"var(--yl-sub, #5B6272)","marginTop":"6px"}}>
{"GoHighLevel or HubSpot, set up the way you sell."}
</div>
</div>
{" "}
<span style={{"flex":"none","width":"44px","height":"44px","borderRadius":"999px","background":"#0D1321","color":"#FFFFFF","display":"grid","placeItems":"center"}}>
{"→"}
</span>
{" "}
</div>
{" "}
</a>
{" "}
<a href={"/services/custom-apps"} data-yl-reveal={"860"} style={{"display":"flex","flexDirection":"column","gap":"28px","padding":"28px","borderRadius":"28px","background":"#FFFFFF","border":"1px solid #E4E7EC","color":"#0D1321","boxShadow":"0 1px 2px rgba(13,19,33,0.04)","transition":"transform 500ms cubic-bezier(.16,1,.3,1), box-shadow 500ms ease"}} className={"yl-hover-5"}>
{" "}
<div style={{"height":"200px","borderRadius":"20px","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)","display":"grid","placeItems":"center","padding":"20px","boxSizing":"border-box"}}>
{" "}
<div style={{"width":"min(100%, 320px)","borderRadius":"14px","background":"#FFFFFF","boxShadow":"0 14px 34px -16px rgba(13,19,33,0.35)","overflow":"hidden"}}>
{" "}
<div style={{"display":"flex","gap":"5px","alignItems":"center","padding":"8px 10px","background":"#F1F3F7"}}>
<span style={{"width":"7px","height":"7px","borderRadius":"999px","background":"#D5DBE5"}}>

</span>
<span style={{"width":"7px","height":"7px","borderRadius":"999px","background":"#D5DBE5"}}>

</span>
<span style={{"width":"7px","height":"7px","borderRadius":"999px","background":"#D5DBE5"}}>

</span>
<span style={{"marginLeft":"8px","fontSize":"10px","color":"#5B6272"}}>
{"app.yourco.com"}
</span>
</div>
{" "}
<div style={{"display":"flex","alignItems":"flex-end","gap":"6px","height":"92px","padding":"12px 14px"}}>
{" "}
{(appBars).map((b, itemIndex7) => <React.Fragment key={itemIndex7}>{" "}
<div style={{"flex":"1","height":String(b.h) + "%","borderRadius":"4px","background":(b.c),"transition":"height 900ms cubic-bezier(.16,1,.3,1)"}}>

</div>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","alignItems":"flex-end","gap":"20px"}}>
{" "}
<div >
<div style={{"fontSize":"13px","color":"#8A91A0"}}>
{"04"}
</div>
<div style={{"fontSize":"32px","fontWeight":"500","letterSpacing":"0","marginTop":"6px"}}>
{"Custom apps"}
</div>
<div style={{"fontSize":"15px","color":"var(--yl-sub, #5B6272)","marginTop":"6px"}}>
{"Portals and tools, built fast."}
</div>
</div>
{" "}
<span style={{"flex":"none","width":"44px","height":"44px","borderRadius":"999px","background":"#0D1321","color":"#FFFFFF","display":"grid","placeItems":"center"}}>
{"→"}
</span>
{" "}
</div>
{" "}
</a>
{" "}
</div>
{" "}
</section>
{" "}
<section data-screen-label={"Stack marquee"} style={{"padding":"clamp(80px, 10vw, 120px) 0 0"}}>
{" "}
<p data-yl-reveal={"0"} style={{"textAlign":"center","margin":"0 0 24px","fontSize":"14px","color":"#5B6272"}}>
{"Plugs into the tools you already use"}
</p>
{" "}
<div style={{"overflow":"hidden","WebkitMaskImage":"linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)","maskImage":"linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)"}}>
{" "}
<div data-yl-marquee={""} style={{"display":"flex","width":"max-content","gap":"12px"}}>
{" "}
{(stackLoop).map((t, itemIndex4) => <React.Fragment key={itemIndex4}>{" "}
<span style={{"display":"inline-flex","alignItems":"center","gap":"10px","padding":"12px 20px","borderRadius":"999px","background":"#FFFFFF","border":"1px solid #E4E7EC","fontSize":"15px","fontWeight":"500","whiteSpace":"nowrap"}}>
<AppBrand name={t} />
</span>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
</div>
{" "}
</section>
{" "}
<div ref={(zoneRef)} style={{"color":"var(--yl-ink, #0D1321)","paddingBottom":"clamp(100px, 13vw, 180px)"}}>
{" "}
<section ref={(howRef)} data-screen-label={"How we work"} style={{"maxWidth":"1200px","margin":"0 auto","padding":"clamp(110px, 14vw, 180px) clamp(20px, 5vw, 64px) 0"}}>
{" "}
<h2 data-yl-split={"h"} style={{"textAlign":"center","fontWeight":"500","fontSize":"clamp(40px, 5.6vw, 76px)","lineHeight":"1","letterSpacing":"0","margin":"0 0 56px"}}>
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"How"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"we"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5","letterSpacing":"0"}}>
{"work."}
</span>
</h2>
{" "}
<div style={{"position":"relative","display":(trackDisplay),"height":"24px","margin":"0 0 20px"}}>
{" "}
<div style={{"position":"absolute","left":"16.66%","right":"16.66%","top":"11px","height":"2px","background":"var(--yl-line, #DDE1E8)","borderRadius":"2px"}}>

</div>
{" "}
<div style={{"position":"absolute","left":"16.66%","top":"11px","height":"2px","width":(howFill),"background":"#2A62F5","borderRadius":"2px","transition":"width 140ms linear"}}>

</div>
{" "}
{(howNodes).map((hn, itemIndex4) => <React.Fragment key={itemIndex4}>{" "}
<span style={{"position":"absolute","left":(hn.x),"top":"3px","width":"18px","height":"18px","marginLeft":"-9px","boxSizing":"border-box","borderRadius":"999px","background":(hn.bg),"border":"3px solid var(--yl-bg, #F6F7F9)","boxShadow":(hn.glow),"transition":"all 600ms cubic-bezier(.16,1,.3,1)"}}>

</span>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
<div style={{"display":"grid","gridTemplateColumns":(howCols),"gap":"16px"}}>
{" "}
<div data-yl-reveal={"0"} style={{"padding":"12px","borderRadius":"28px","background":"var(--yl-card, #FFFFFF)","border":"1px solid " + String(hc0),"display":"flex","flexDirection":"column","gap":"22px","transition":"border-color 600ms ease"}}>
{" "}
<div style={{"position":"relative","height":"210px","borderRadius":"20px","overflow":"hidden","color":"#0D1321","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)"}}>
{" "}
<div data-yl-float={"0"} style={{"position":"absolute","left":"10%","top":"18%","padding":"10px 14px","borderRadius":"16px 16px 16px 6px","background":"#FFFFFF","fontSize":"13px","boxShadow":"0 10px 30px -14px rgba(13,19,33,0.35)"}}>
{"What eats your week?"}
</div>
{" "}
<div data-yl-float={"1"} style={{"position":"absolute","right":"8%","top":"44%","padding":"10px 14px","borderRadius":"16px 16px 6px 16px","background":"#2A62F5","color":"#FFFFFF","fontSize":"13px","boxShadow":"0 14px 30px -14px rgba(42,98,245,0.6)"}}>
{"Copying leads into GHL…"}
</div>
{" "}
<div data-yl-float={"2"} style={{"position":"absolute","left":"16%","bottom":"13%","display":"inline-flex","gap":"8px","alignItems":"center","padding":"6px 12px","borderRadius":"999px","background":"#FFFFFF","fontSize":"12px","fontWeight":"500","boxShadow":"0 10px 24px -14px rgba(13,19,33,0.35)"}}>
<span style={{"width":"7px","height":"7px","borderRadius":"999px","background":"#2A62F5"}}>

</span>
{"30 min · free"}
</div>
{" "}
</div>
{" "}
<div style={{"padding":"0 16px 18px"}}>
{" "}
<span style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"20px","color":"#2A62F5"}}>
{"01"}
</span>
{" "}
<div style={{"fontSize":"28px","fontWeight":"500","letterSpacing":"0","marginTop":"4px"}}>
{"Call"}
</div>
{" "}
<div style={{"fontSize":"15px","color":"var(--yl-sub, #5B6272)","marginTop":"6px"}}>
{"Thirty minutes to find the quick wins."}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div data-yl-reveal={"110"} style={{"padding":"12px","borderRadius":"28px","background":"var(--yl-card, #FFFFFF)","border":"1px solid " + String(hc1),"display":"flex","flexDirection":"column","gap":"22px","transition":"border-color 600ms ease"}}>
{" "}
<div style={{"position":"relative","height":"210px","borderRadius":"20px","overflow":"hidden","color":"#0D1321","display":"grid","placeItems":"center","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)"}}>
{" "}
<div style={{"display":"flex","flexDirection":"column","gap":"8px","width":"min(80%, 240px)"}}>
{" "}
{(buildBlocks).map((bb, itemIndex7) => <React.Fragment key={itemIndex7}>{" "}
<div style={{"display":"flex","alignItems":"center","gap":"10px","padding":"10px 12px","borderRadius":"14px","background":"#FFFFFF","fontSize":"13px","fontWeight":"500","boxShadow":"0 10px 24px -14px rgba(13,19,33,0.35)","opacity":(bb.op),"transform":(bb.tf),"filter":(bb.fl),"transition":"all 700ms cubic-bezier(.16,1,.3,1)"}}>
<AppBrand name={bb.name} />
<span style={{"marginLeft":"auto","color":"#2A62F5"}}>
{"✓"}
</span>
</div>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
</div>
{" "}
<div style={{"padding":"0 16px 18px"}}>
{" "}
<span style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"20px","color":"#2A62F5"}}>
{"02"}
</span>
{" "}
<div style={{"fontSize":"28px","fontWeight":"500","letterSpacing":"0","marginTop":"4px"}}>
{"Build"}
</div>
{" "}
<div style={{"fontSize":"15px","color":"var(--yl-sub, #5B6272)","marginTop":"6px"}}>
{"We set it up, test it and hand it over."}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div data-yl-reveal={"220"} style={{"padding":"12px","borderRadius":"28px","background":"var(--yl-card, #FFFFFF)","border":"1px solid " + String(hc2),"display":"flex","flexDirection":"column","gap":"22px","transition":"border-color 600ms ease"}}>
{" "}
<div style={{"position":"relative","height":"210px","borderRadius":"20px","overflow":"hidden","color":"#0D1321","display":"grid","placeItems":"center","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)"}}>
{" "}
<div style={{"width":"min(86%, 280px)","boxSizing":"border-box","padding":"16px","borderRadius":"18px","background":"#FFFFFF","boxShadow":"0 14px 34px -16px rgba(13,19,33,0.35)","display":"flex","flexDirection":"column","gap":"14px"}}>
{" "}
<div style={{"display":"flex","alignItems":"center","gap":"8px","fontSize":"13px","fontWeight":"500"}}>
<span style={{"width":"8px","height":"8px","borderRadius":"999px","background":"#22B26B","boxShadow":"0 0 0 " + String(runRing) + "px rgba(34,178,107,0.18)","transition":"box-shadow 900ms ease"}}>

</span>
{"All systems running"}
<span style={{"marginLeft":"auto","color":"#5B6272","fontWeight":"400"}}>
{"24/7"}
</span>
</div>
{" "}
<div style={{"overflow":"hidden","WebkitMaskImage":"linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)","maskImage":"linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)"}}>
{" "}
<div data-yl-uptime={""} style={{"display":"flex","gap":"4px","width":"max-content"}}>
{" "}
{(uptime).map((u, itemIndex9) => <React.Fragment key={itemIndex9}><span style={{"width":"6px","height":"28px","borderRadius":"3px","background":(u)}}>

</span></React.Fragment>)}
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div style={{"padding":"0 16px 18px"}}>
{" "}
<span style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"20px","color":"#2A62F5"}}>
{"03"}
</span>
{" "}
<div style={{"fontSize":"28px","fontWeight":"500","letterSpacing":"0","marginTop":"4px"}}>
{"Run"}
</div>
{" "}
<div style={{"fontSize":"15px","color":"var(--yl-sub, #5B6272)","marginTop":"6px"}}>
{"It works quietly. We watch for problems."}
</div>
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
</section>
{" "}
{(showTestimonials) && <>{" "}
<section data-screen-label={"Testimonials"} style={{"maxWidth":"1200px","margin":"0 auto","padding":"clamp(90px, 12vw, 160px) clamp(20px, 5vw, 64px) 0"}}>
{" "}
<h2 data-yl-split={"t"} style={{"textAlign":"center","fontWeight":"500","fontSize":"clamp(40px, 5.6vw, 76px)","lineHeight":"1","letterSpacing":"0","margin":"0 0 56px"}}>
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"Kind"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5","letterSpacing":"0"}}>
{"words."}
</span>
</h2>
{" "}
<div data-yl-reveal={"0"} style={{"height":"560px","overflow":"hidden","WebkitMaskImage":"linear-gradient(180deg, transparent, #000 15%, #000 85%, transparent)","maskImage":"linear-gradient(180deg, transparent, #000 15%, #000 85%, transparent)","display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 300px), 1fr))","gap":"16px"}}>
{" "}
{(tCols).map((col, itemIndex5) => <React.Fragment key={itemIndex5}>{" "}
<div data-yl-col={(col.dir)} style={{"display":"flex","flexDirection":"column","gap":"16px"}}>
{" "}
{(col.items).map((q, itemIndex7) => <React.Fragment key={itemIndex7}>{" "}
<figure style={{"margin":"0","padding":"24px","borderRadius":"24px","background":"var(--yl-card, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)","display":"flex","flexDirection":"column","gap":"16px","boxShadow":"0 1px 2px rgba(13,19,33,0.04)"}}>
{" "}
<div style={{"display":"flex","alignItems":"center","gap":"8px","fontSize":"13px","color":"var(--yl-sub, #5B6272)"}}>
<span style={{"color":"#FF6B1A","letterSpacing":"0","fontSize":"15px"}}>
{"★★★★★"}
</span>
<span >
{"5.0"}
</span>
<span style={{"marginLeft":"auto","padding":"3px 10px","borderRadius":"999px","background":"rgba(20,168,0,0.12)","color":"#14A800","fontWeight":"500","fontSize":"12px"}}>
<AppBrand name="Upwork" />
</span>
</div>
{" "}
<blockquote style={{"margin":"0","fontSize":"16px","lineHeight":"1.5","color":"var(--yl-ink, #0D1321)"}}>
{"“" + String(q.quote) + "”"}
</blockquote>
{" "}
<figcaption style={{"display":"flex","alignItems":"center","gap":"12px","fontSize":"14px","paddingTop":"14px","borderTop":"1px solid var(--yl-line, #E4E7EC)"}}>
{" "}
<img src={(q.img)} alt={(q.who)} loading={"lazy"} width={"44"} height={"44"} style={{"flex":"none","width":"44px","height":"44px","borderRadius":"999px","objectFit":"cover","background":"#E9EFFE","boxShadow":"0 0 0 2px var(--yl-card, #FFFFFF), 0 0 0 3px var(--yl-line, #E4E7EC)"}} decoding="async" />
{" "}
<span style={{"minWidth":"0"}}>
<span style={{"display":"block","fontWeight":"500"}}>
{(q.who)}
</span>
<span style={{"display":"block","color":"var(--yl-sub, #5B6272)"}}>
{(q.role)}
</span>
<span style={{"display":"block","marginTop":"2px","fontSize":"12px","color":"#6E96FF"}}>
{(q.work)}
</span>
</span>
{" "}
</figcaption>
{" "}
</figure>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
</section>
{" "}</>}
{" "}
</div>
{" "}
<section id={"faq"} data-screen-label={"FAQ"} style={{"maxWidth":"860px","margin":"0 auto","padding":"clamp(90px, 12vw, 160px) clamp(20px, 5vw, 64px) 0"}}>
{" "}
<h2 data-yl-split={"f"} style={{"textAlign":"center","fontWeight":"500","fontSize":"clamp(40px, 5.6vw, 76px)","lineHeight":"1","letterSpacing":"0","margin":"0 0 48px"}}>
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5","letterSpacing":"0"}}>
{"Questions?"}
</span>
</h2>
{" "}
<div data-yl-reveal={"0"} style={{"display":"flex","flexDirection":"column","gap":"10px"}}>
{" "}
{(faqs).map((f, itemIndex3) => <React.Fragment key={itemIndex3}>{" "}
<div style={{"borderRadius":"20px","background":"#FFFFFF","border":"1px solid #E4E7EC"}}>
{" "}
<button aria-expanded={f.rows === "1fr"} type={"button"} onClick={(f.toggle)} style={{"all":"unset","boxSizing":"border-box","width":"100%","cursor":"pointer","display":"flex","justifyContent":"space-between","alignItems":"center","gap":"24px","padding":"20px 24px","fontSize":"17px","fontWeight":"500"}}>
{" "}
<span >
{(f.q)}
</span>
<span style={{"flex":"none","width":"30px","height":"30px","borderRadius":"999px","background":"#F1F3F7","display":"grid","placeItems":"center","fontSize":"18px","fontWeight":"300","transform":"rotate(" + String(f.rot) + "deg)","transition":"transform 500ms cubic-bezier(.16,1,.3,1)"}}>
{"+"}
</span>
{" "}
</button>
{" "}
<div style={{"display":"grid","gridTemplateRows":(f.rows),"transition":"grid-template-rows 500ms cubic-bezier(.16,1,.3,1)"}}>
{" "}
<div style={{"overflow":"hidden"}}>
<p style={{"margin":"0","padding":"0 24px 22px","fontSize":"16px","lineHeight":"1.55","color":"#5B6272"}}>
{(f.a)}
</p>
</div>
{" "}
</div>
{" "}
</div>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
</section>
{" "}
<section data-screen-label={"Final CTA"} style={{"position":"relative","maxWidth":"1200px","margin":"0 auto","padding":"clamp(120px, 15vw, 220px) clamp(20px, 5vw, 64px)","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center"}}>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","left":"50%","top":"50%","width":"900px","height":"560px","transform":"translate(-50%, -50%)","background":"radial-gradient(closest-side, rgba(255,160,100,0.35), rgba(220,230,254,0.5) 55%, rgba(246,247,249,0))","pointerEvents":"none"}}>

</div>
{" "}
<h2 data-yl-split={"c"} style={{"position":"relative","fontWeight":"500","fontSize":"clamp(48px, 8vw, 112px)","lineHeight":"0.96","letterSpacing":"0","margin":"0"}}>
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"Stop"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"doing"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"it"}
</span>
<br  />
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5","letterSpacing":"0","paddingRight":"0.06em"}}>
{"by"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5","letterSpacing":"0","paddingRight":"0.06em"}}>
{"hand."}
</span>
</h2>
{" "}
<BookingLink data-yl-reveal={"300"} style={{"position":"relative","marginTop":"40px","border":"0","cursor":"pointer","font":"inherit","fontSize":"16px","fontWeight":"500","display":"inline-flex","alignItems":"center","gap":"12px","padding":"8px 8px 8px 24px","borderRadius":"999px","overflow":"hidden","isolation":"isolate","background":"linear-gradient(180deg, #2B3550 0%, #131B2E 55%, #0B1120 100%)","color":"#FFFFFF","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -2px 0 rgba(0,0,0,0.35), 0 0 0 1px #0B1120, 0 2px 4px rgba(13,19,33,0.22), 0 12px 26px -10px rgba(13,19,33,0.6)","transition":"transform 400ms cubic-bezier(.16,1,.3,1)"}} className={"yl-hover-6"}>
<span data-yl-shine={""} aria-hidden={"true"} style={{"position":"absolute","top":"0","bottom":"0","left":"-60%","width":"45%","zIndex":"-1","pointerEvents":"none","background":"linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)","transform":"skewX(-20deg)"}}>

</span>
{"Book a free call"}
<span style={{"width":"38px","height":"38px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.45), 0 2px 6px -1px rgba(42,98,245,0.6)","display":"grid","placeItems":"center"}}>
{"→"}
</span>
</BookingLink>
{" "}
</section>
{" "}
<footer style={{"maxWidth":"1200px","margin":"0 auto","padding":"32px clamp(20px, 5vw, 64px) 40px","display":"flex","gap":"20px","flexWrap":"wrap","justifyContent":"space-between","alignItems":"center","fontSize":"14px","color":"#5B6272","borderTop":"1px solid #E4E7EC"}}>
{" "}
<span style={{"fontWeight":"600","color":"#0D1321","letterSpacing":"0"}}>
{"Yara"}
<span style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5"}}>
{" Labs"}
</span>
</span>
{" "}
<div style={{"display":"flex","gap":"24px","flexWrap":"wrap"}}>
<a href={"/services"} style={{"color":"#5B6272"}}>
{"Services"}
</a>
<a href={"/projects"} style={{"color":"#5B6272"}}>
{"Projects"}
</a>
<a href={"/services/automation"} style={{"color":"#5B6272"}}>
{"Automation"}
</a>
<a href={"/services/ai-agents"} style={{"color":"#5B6272"}}>
{"AI agents"}
</a>
<a href={"/services/crm"} style={{"color":"#5B6272"}}>
{"CRM"}
</a>
<a href={"/services/custom-apps"} style={{"color":"#5B6272"}}>
{"Custom apps"}
</a>
<a href={"mailto:hello@yaralabs.io"} style={{"color":"#5B6272"}}>
{"hello@yaralabs.io"}
</a>
</div>
{" "}
<span >
{"© 2026"}
</span>
{" "}
</footer>
{" "}

{" "}
</div>
{" "}</>); }
}
