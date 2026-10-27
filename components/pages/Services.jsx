"use client";
import React from "react";
import { darkSectionProgress } from "../../lib/dark-section";
import AppBrand from "../AppBrand";
import BookingLink from "../BookingLink";
import SiteNav from "../SiteNav";

const EASE = 'cubic-bezier(.16,1,.3,1)';
const DARK = { ink: [[13,19,33,1],[243,245,250,1]], sub: [[91,98,114,1],[168,177,196,1]], line: [[228,231,236,1],[255,255,255,0.12]], card: [[255,255,255,1],[22,30,52,0.72]], scard: [[255,255,255,1],[16,23,42,1]] };
const AI_REPLY = 'Sure! You\'re now booked for Friday at 2pm.';
const STEPS = [['New form lead', '#FF7A45'], ['Added to HubSpot', '#2A62F5'], ['Ping #sales in Slack', '#0D1321']];
const CRM = ['New', 'Contacted', 'Booked', 'Won'];
const SERV = [
  { title: 'Automation', line: 'Connect your apps so the data moves on its own.', href: '/services/automation' },
  { title: 'AI agents', line: 'Let AI answer, sort and book, around the clock.', href: '/services/ai-agents' },
  { title: 'CRM setup', line: 'One home for every lead, with follow-ups that send themselves.', href: '/services/crm' },
  { title: 'Custom apps', line: 'Swap the spreadsheets for a tool built around your work.', href: '/services/custom-apps' }
];
const PAINS = [['Leads slip through the cracks', 2], ['Copy-pasting between apps', 0], ['The inbox never hits zero', 1], ['Spreadsheets run the business', 3], ['Follow-ups get forgotten', 2], ['Same questions, every day', 1]];
const cl = (v) => Math.min(1, Math.max(0, v));

export default class DesignPage extends React.Component {
  state = { tick: 0, chars: 0, pick: 0, scrolled: false, compactNav: false };
  darkRef = React.createRef(); zoneRef = React.createRef(); resRef = React.createRef();
  mx = 0; my = 0; cx = 0; cy = 0;
  motion() { return (this.props.motion ?? 'Full') !== 'Off' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  componentDidMount() {
    this.t1 = this.motion() && setInterval(() => this.setState(s => ({ tick: s.tick + 1 })), 1200);
    this.t2 = this.motion() && setInterval(() => this.setState(s => ({ chars: s.chars >= AI_REPLY.length + 20 ? 0 : s.chars + 1 })), 65);
    this.onScroll = () => { if (!this.raf) this.raf = requestAnimationFrame(() => { this.raf = 0; this.scrollTick(); }); };
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll);
    this.onPtr = (e) => { this.mx = e.clientX / window.innerWidth - 0.5; this.my = e.clientY / window.innerHeight - 0.5; };
    window.addEventListener('pointermove', this.onPtr, { passive: true });
    requestAnimationFrame(() => { this.animate(); this.scrollTick(); this.objLoop(); });
  }
  componentWillUnmount() {
    clearInterval(this.t1); clearInterval(this.t2); cancelAnimationFrame(this.loopRaf);
    window.removeEventListener('scroll', this.onScroll); window.removeEventListener('resize', this.onScroll); window.removeEventListener('pointermove', this.onPtr);
    this.io && this.io.disconnect();
  }
  componentDidUpdate(_, prev) {
    if (prev.pick !== this.state.pick && this.resRef.current && this.motion())
      this.resRef.current.animate([{ opacity: 0.2, filter: 'blur(10px)', transform: 'translateY(14px) scale(0.98)' }, { opacity: 1, filter: 'blur(0px)', transform: 'none' }], { duration: 800, easing: EASE });
  }
  scrollTick() {
    const vh = window.innerHeight, patch = {};
    const scrolled = window.scrollY > 24; if (scrolled !== this.state.scrolled) patch.scrolled = scrolled;
    const compactNav = window.innerWidth < 900; if (compactNav !== this.state.compactNav) patch.compactNav = compactNav;
    if (Object.keys(patch).length) this.setState(patch);
    const z = this.zoneRef.current, d = this.darkRef.current;
    if (z && d) {
      const r = z.getBoundingClientRect();
      const p = darkSectionProgress(r, vh, window.scrollY);
      d.style.opacity = p.toFixed(3);
      for (const k in DARK) { const [a, b] = DARK[k]; const c = a.map((v, i) => v + (b[i] - v) * p); z.style.setProperty('--yl-' + k, `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${c[3].toFixed(3)})`); }
    }
    const cards = [...document.querySelectorAll('[data-yl-stack]')];
    cards.forEach((c, i) => {
      const inner = c.firstElementChild, nx = cards[i + 1];
      if (!nx || !this.motion() || this.state.compactNav) { inner.style.transform = ''; inner.style.filter = ''; return; }
      const p = cl(1 - (nx.getBoundingClientRect().top - c.getBoundingClientRect().top) / inner.offsetHeight);
      inner.style.transform = `scale(${(1 - 0.05 * p).toFixed(4)})`;
      inner.style.filter = p > 0.01 ? `brightness(${(1 - 0.3 * p).toFixed(3)})` : '';
    });
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
    document.querySelectorAll('[data-yl-obj]').forEach((el, i) => el.animate([{ opacity: 0, scale: 0.6, filter: full ? 'blur(14px)' : 'none' }, { opacity: 1, scale: 1, filter: 'blur(0px)' }], { duration: 1600, delay: 500 + i * 120, easing: EASE, fill: 'backwards' }));
    document.querySelectorAll('[data-yl-bob]').forEach((el, i) => el.animate([{ transform: 'translateY(0) rotate(0deg)' }, { transform: `translateY(-${14 + (i % 3) * 6}px) rotate(${i % 2 ? -7 : 7}deg)` }], { duration: 3800 + i * 700, delay: i * 200, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }));
    document.querySelectorAll('[data-yl-spin]').forEach(el => el.animate([{ transform: 'rotateX(-22deg) rotateY(0deg) rotateZ(6deg)' }, { transform: 'rotateX(-22deg) rotateY(360deg) rotateZ(6deg)' }], { duration: 20000, iterations: Infinity }));
    document.querySelectorAll('[data-yl-float]').forEach((el, i) => el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }], { duration: 2600 + i * 500, delay: i * 300, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }));
    document.querySelectorAll('[data-yl-drift]').forEach((el, i) => el.animate([{ translate: '0 0' }, { translate: i ? '-120px 60px' : '90px 70px' }], { duration: 14000 + i * 4000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }));
    document.querySelectorAll('[data-yl-aurora]').forEach((el, i) => el.animate([{ translate: '0 0', scale: 1 }, { translate: ['18vw 10vh', '-14vw -12vh', '-10vw 14vh'][i], scale: 1.25 }], { duration: 16000 + i * 5000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }));
    const wh = document.querySelector('[data-yl-wheel]');
    if (wh) wh.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(12px)', opacity: 0 }], { duration: 1600, iterations: Infinity, easing: 'ease-in' });
    document.querySelectorAll('[data-yl-shine]').forEach((el, i) => el.animate([{ left: '-60%', offset: 0 }, { left: '130%', offset: 0.3 }, { left: '130%', offset: 1 }], { duration: 4200, delay: 900 + i * 260, iterations: Infinity, easing: 'cubic-bezier(.45,0,.2,1)' }));
  }
  renderVals() {
    const { tick, chars, scrolled, compactNav, pick } = this.state;
    const ai = tick % 3, crmStage = tick % 4;
    const seed = (i) => 30 + ((Math.sin((tick + 1) * 1.7 + i * 2.3) + 1) / 2) * 65;
    const recIdx = PAINS[pick][1];
    return {
      navLinksDisplay: compactNav ? 'none' : 'flex',
      navBg: scrolled ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.4)',
      navBorder: scrolled ? '#E4E7EC' : 'rgba(228,231,236,0.5)',
      navShadow: scrolled ? '0 10px 30px -12px rgba(13,19,33,0.18)' : 'none',
      darkRef: this.darkRef, zoneRef: this.zoneRef, resRef: this.resRef,
      stackPos: compactNav ? 'relative' : 'sticky',
      stackCols: compactNav ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 1.05fr)',
      autoDot: ['18px', 'calc(50% - 6px)', 'calc(100% - 30px)'][ai],
      autoSteps: STEPS.map(([name, c], i) => ({ name, c, ring: i === ai ? '2px solid #2A62F5' : '2px solid transparent', ck: i <= ai ? 1 : 0.2 })),
      aiText: AI_REPLY.slice(0, Math.min(chars, AI_REPLY.length)),
      caret: chars < AI_REPLY.length ? 1 : (Math.floor(chars / 4) % 2),
      crmCols: CRM.map((name, i) => ({ name, count: [12, 8, 5, 3][i] + (i === crmStage ? 1 : 0), hot: i === crmStage ? '#2A62F5' : '#FFFFFF', label: i === crmStage ? 'Sarah K.' : '', lift: i === crmStage ? 'translateY(-3px) rotate(-2deg)' : 'none' })),
      appBars: Array.from({ length: 8 }, (_, i) => ({ h: Math.round(seed(i)), c: i === 7 ? '#2A62F5' : '#DCE6FE' })),
      appCount: 40 + (tick % 9),
      pains: PAINS.map(([label], i) => { const on = i === pick; return { label, bg: on ? '#2A62F5' : 'var(--yl-card, #FFFFFF)', fg: on ? '#FFFFFF' : 'var(--yl-ink, #0D1321)', bd: on ? '#5A88FF' : 'var(--yl-line, #E4E7EC)', sh: on ? '0 14px 30px -12px rgba(42,98,245,0.7)' : 'none', pick: () => this.setState({ pick: i }) }; }),
      rec: SERV[recIdx],
    };
  }

render() { const {darkRef,zoneRef,resRef,stackPos,stackCols,autoDot,autoSteps,aiText,caret,crmCols,appBars,appCount,pains,rec} = this.renderVals(); return (<>{" "}

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
<div data-yl-drift={"1"} aria-hidden={"true"} style={{"position":"absolute","top":"260px","right":"4%","width":"620px","height":"520px","background":"radial-gradient(closest-side, rgba(255,179,122,0.3), rgba(246,247,249,0))","pointerEvents":"none"}}>

</div>
{" "}
<SiteNav scrolled={this.state.scrolled} />
{" "}
<header data-screen-label={"Services hero"} style={{"position":"relative","maxWidth":"1200px","margin":"0 auto","padding":"clamp(150px, 18vw, 210px) clamp(20px, 5vw, 64px) clamp(40px, 6vw, 80px)","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center"}}>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","inset":"0","zIndex":"0","pointerEvents":"none"}}>
{" "}
<div data-yl-obj={"0.7"} style={{"position":"absolute","right":"3%","top":"30%"}}>
<div data-yl-bob={"0"} style={{"perspective":"900px"}}>
<div data-yl-spin={""} style={{"position":"relative","width":"clamp(70px, 8.4vw, 124px)","aspectRatio":"1","transformStyle":"preserve-3d"}}>
{" "}
<div style={{"position":"absolute","inset":"0","borderRadius":"22%","transform":"translateZ(calc(clamp(70px, 8.4vw, 124px) / 2))","background":"linear-gradient(145deg, rgba(160,186,255,0.75), rgba(42,98,245,0.55))","border":"1px solid rgba(255,255,255,0.7)","boxShadow":"inset 0 0 24px rgba(255,255,255,0.45)"}}>

</div>
{" "}
<div style={{"position":"absolute","inset":"0","borderRadius":"22%","transform":"rotateY(180deg) translateZ(calc(clamp(70px, 8.4vw, 124px) / 2))","background":"linear-gradient(145deg, rgba(42,98,245,0.7), rgba(11,26,92,0.75))","border":"1px solid rgba(255,255,255,0.4)"}}>

</div>
{" "}
<div style={{"position":"absolute","inset":"0","borderRadius":"22%","transform":"rotateY(90deg) translateZ(calc(clamp(70px, 8.4vw, 124px) / 2))","background":"linear-gradient(145deg, rgba(127,162,255,0.7), rgba(22,53,153,0.7))","border":"1px solid rgba(255,255,255,0.5)","boxShadow":"inset 0 0 20px rgba(255,255,255,0.25)"}}>

</div>
{" "}
<div style={{"position":"absolute","inset":"0","borderRadius":"22%","transform":"rotateY(-90deg) translateZ(calc(clamp(70px, 8.4vw, 124px) / 2))","background":"linear-gradient(145deg, rgba(200,216,255,0.75), rgba(42,98,245,0.6))","border":"1px solid rgba(255,255,255,0.6)"}}>

</div>
{" "}
<div style={{"position":"absolute","inset":"0","borderRadius":"22%","transform":"rotateX(90deg) translateZ(calc(clamp(70px, 8.4vw, 124px) / 2))","background":"linear-gradient(145deg, rgba(238,243,255,0.9), rgba(127,162,255,0.65))","border":"1px solid rgba(255,255,255,0.8)"}}>

</div>
{" "}
<div style={{"position":"absolute","inset":"0","borderRadius":"22%","transform":"rotateX(-90deg) translateZ(calc(clamp(70px, 8.4vw, 124px) / 2))","background":"linear-gradient(145deg, rgba(22,53,153,0.8), rgba(7,11,22,0.8))","border":"1px solid rgba(255,255,255,0.3)"}}>

</div>
{" "}
</div>
</div>
</div>
{" "}
<div data-yl-obj={"1.0"} style={{"position":"absolute","left":"3%","top":"24%"}}>
<div data-yl-bob={"1"}>
<div style={{"width":"clamp(64px, 8vw, 120px)","aspectRatio":"1","borderRadius":"50%","background":"radial-gradient(circle at 32% 28%, #FFFFFF 0%, #FFE6D2 10%, #FFB37A 36%, #F07A3C 66%, #9C3A12 100%)","boxShadow":"inset -10px -14px 28px rgba(6,14,50,0.35), inset 6px 8px 16px rgba(255,255,255,0.4), 0 34px 50px -20px rgba(240,122,60,0.5)"}}>

</div>
</div>
</div>
{" "}
<div data-yl-obj={"0.6"} style={{"position":"absolute","left":"9%","bottom":"-6%"}}>
<div data-yl-bob={"2"} style={{"perspective":"600px","filter":"drop-shadow(0 26px 26px rgba(27,63,184,0.32))"}}>
<div style={{"width":"clamp(96px, 11vw, 170px)","aspectRatio":"1","borderRadius":"50%","transform":"rotateX(64deg) rotateY(18deg)","background":"radial-gradient(closest-side, transparent 56%, rgba(255,255,255,0.75) 68%, transparent 80%), conic-gradient(from 200deg, #163599, #6E96FF, #EEF3FF, #6E96FF, #163599, #0B1A5C, #163599)","WebkitMaskImage":"radial-gradient(closest-side, transparent 55%, #000 57%, #000 97%, transparent 100%)","maskImage":"radial-gradient(closest-side, transparent 55%, #000 57%, #000 97%, transparent 100%)"}}>

</div>
</div>
</div>
{" "}
<div data-yl-obj={"1.5"} style={{"position":"absolute","right":"20%","top":"14%"}}>
<div data-yl-bob={"3"}>
<div style={{"width":"26px","aspectRatio":"1","borderRadius":"50%","background":"radial-gradient(circle at 32% 28%, #FFFFFF 0%, #9DB7FF 30%, #2A62F5 70%, #0B1A5C 100%)","boxShadow":"0 10px 16px -6px rgba(42,98,245,0.6)"}}>

</div>
</div>
</div>
{" "}
<div data-yl-obj={"1.2"} style={{"position":"absolute","right":"14%","bottom":"0%"}}>
<div data-yl-bob={"4"}>
<div style={{"width":"clamp(60px, 7vw, 104px)","aspectRatio":"2.4","borderRadius":"999px","transform":"rotate(-24deg)","background":"linear-gradient(180deg, #FFFFFF 0%, #E4ECFF 40%, #A9C0FF 100%)","boxShadow":"inset 0 -6px 12px rgba(42,98,245,0.3), inset 0 3px 4px #FFFFFF, 0 24px 36px -16px rgba(42,98,245,0.45)"}}>

</div>
</div>
</div>
{" "}
</div>
{" "}
<div data-yl-reveal={"0"} style={{"position":"relative","zIndex":"1","display":"inline-flex","alignItems":"center","gap":"10px","padding":"5px 14px 5px 5px","borderRadius":"999px","background":"rgba(255,255,255,0.8)","border":"1px solid #E4E7EC","fontSize":"13px","color":"#3A4252"}}>
{" "}
<span style={{"padding":"3px 10px","borderRadius":"999px","background":"#2A62F5","color":"#FFFFFF","fontWeight":"500","fontSize":"12px"}}>
{"Services"}
</span>
<span style={{"whiteSpace":"nowrap"}}>
{"Four services, one team"}
</span>
{" "}
</div>
{" "}
<h1 data-yl-split={"hero"} style={{"position":"relative","zIndex":"1","fontWeight":"500","fontSize":"clamp(50px, 8.2vw, 116px)","lineHeight":"0.96","letterSpacing":"0","margin":"28px 0 0"}}>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"Four"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"ways"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"to"}
</span>
<br  />
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"get"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","letterSpacing":"0","color":"#2A62F5","paddingRight":"0.06em"}}>
{"time"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","letterSpacing":"0","color":"#2A62F5","paddingRight":"0.06em"}}>
{"back."}
</span>
{" "}
</h1>
{" "}
<p data-yl-reveal={"520"} style={{"position":"relative","zIndex":"1","fontSize":"clamp(17px, 1.5vw, 19px)","lineHeight":"1.5","maxWidth":"42ch","margin":"28px 0 0","color":"#5B6272"}}>
{"Pick one or combine them. Everything plugs into the tools you already use."}
</p>
{" "}
<div data-yl-reveal={"680"} aria-hidden={"true"} style={{"position":"relative","zIndex":"1","marginTop":"44px","width":"26px","height":"42px","boxSizing":"border-box","borderRadius":"999px","border":"1.5px solid #C3CAD6","display":"flex","justifyContent":"center","paddingTop":"8px"}}>
<span data-yl-wheel={""} style={{"width":"3px","height":"8px","borderRadius":"3px","background":"#2A62F5"}}>

</span>
</div>
{" "}
</header>
{" "}
<div ref={(zoneRef)} style={{"color":"var(--yl-ink, #0D1321)","paddingBottom":"clamp(120px, 14vw, 200px)"}}>
{" "}
<section data-screen-label={"Service stack"} style={{"maxWidth":"1200px","margin":"0 auto","padding":"clamp(40px, 6vw, 80px) clamp(16px, 4vw, 48px) 0"}}>
{" "}
<div data-yl-stack={""} style={{"position":(stackPos),"top":"96px","marginBottom":"18vh"}}>
{" "}
<div style={{"transformOrigin":"50% 0%","borderRadius":"32px","background":"var(--yl-scard, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)","boxShadow":"0 40px 80px -40px rgba(7,11,22,0.55)","padding":"14px","display":"grid","gridTemplateColumns":(stackCols),"gap":"14px","minHeight":"min(560px, calc(100vh - 150px))","boxSizing":"border-box"}}>
{" "}
<div style={{"padding":"clamp(18px, 3vw, 36px)","display":"flex","flexDirection":"column","gap":"18px"}}>
{" "}
<span style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"22px","color":"#2A62F5"}}>
{"01"}
</span>
{" "}
<h2 style={{"margin":"0","fontWeight":"500","fontSize":"clamp(38px, 4.6vw, 60px)","lineHeight":"1","letterSpacing":"0"}}>
{"Automation"}
</h2>
{" "}
<p style={{"margin":"0","fontSize":"17px","lineHeight":"1.5","color":"var(--yl-sub, #5B6272)","maxWidth":"36ch"}}>
{"Your apps, talking to each other. Data moves on its own, so nobody copies and pastes."}
</p>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 200px), 1fr))","gap":"10px 20px","marginTop":"6px","fontSize":"15px"}}>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"center"}}>
<span style={{"flex":"none","width":"20px","height":"20px","borderRadius":"999px","background":"rgba(42,98,245,0.14)","color":"#2A62F5","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✓"}
</span>
{"Leads straight into your CRM"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"center"}}>
<span style={{"flex":"none","width":"20px","height":"20px","borderRadius":"999px","background":"rgba(42,98,245,0.14)","color":"#2A62F5","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✓"}
</span>
{"Invoices and payments synced"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"center"}}>
<span style={{"flex":"none","width":"20px","height":"20px","borderRadius":"999px","background":"rgba(42,98,245,0.14)","color":"#2A62F5","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✓"}
</span>
<span className="app-label"><AppBrand name="Slack" />{" and email alerts"}</span>
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"center"}}>
<span style={{"flex":"none","width":"20px","height":"20px","borderRadius":"999px","background":"rgba(42,98,245,0.14)","color":"#2A62F5","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✓"}
</span>
{"Error monitoring built in"}
</span>
{" "}
</div>
{" "}
<div style={{"marginTop":"auto","paddingTop":"18px","display":"flex","gap":"16px","alignItems":"center","flexWrap":"wrap"}}>
{" "}
<a href={"/services/automation"} style={{"display":"inline-flex","alignItems":"center","gap":"10px","padding":"12px 20px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","color":"#FFFFFF","fontSize":"15px","fontWeight":"500","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.18), 0 12px 26px -10px rgba(42,98,245,0.7)","transition":"transform 400ms cubic-bezier(.16,1,.3,1)"}} className={"yl-hover-7"}>
{"Explore automation →"}
</a>
{" "}
<span style={{"fontSize":"14px","color":"var(--yl-sub, #5B6272)"}}>
{"Fixed quote after a free call"}
</span>
{" "}
</div>
{" "}
</div>
{" "}
<div style={{"position":"relative","minHeight":"300px","borderRadius":"22px","overflow":"hidden","color":"#0D1321","display":"grid","placeItems":"center","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)"}}>
{" "}
<div style={{"position":"relative","display":"flex","flexDirection":"column","gap":"22px","width":"min(78%, 300px)"}}>
{" "}
<div style={{"position":"absolute","left":"27px","top":"24px","bottom":"24px","width":"2px","background":"#C9D6FB"}}>

</div>
{" "}
<div style={{"position":"absolute","left":"22px","top":(autoDot),"width":"12px","height":"12px","borderRadius":"999px","background":"#2A62F5","boxShadow":"0 0 0 6px rgba(42,98,245,0.18)","transition":"top 900ms cubic-bezier(.16,1,.3,1)"}}>

</div>
{" "}
{(autoSteps).map((st, itemIndex7) => <React.Fragment key={itemIndex7}>{" "}
<div style={{"position":"relative","marginLeft":"52px","display":"flex","alignItems":"center","gap":"10px","padding":"12px 14px","borderRadius":"14px","background":"#FFFFFF","fontSize":"14px","fontWeight":"500","boxShadow":"0 12px 30px -14px rgba(13,19,33,0.35)","outline":(st.ring),"transition":"outline-color 400ms ease"}}>
<AppBrand name={st.name} />
<span style={{"marginLeft":"auto","color":"#2A62F5","opacity":(st.ck),"transition":"opacity 400ms ease"}}>
{"✓"}
</span>
</div>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div data-yl-stack={""} style={{"position":(stackPos),"top":"114px","marginBottom":"18vh"}}>
{" "}
<div style={{"transformOrigin":"50% 0%","borderRadius":"32px","background":"var(--yl-scard, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)","boxShadow":"0 40px 80px -40px rgba(7,11,22,0.55)","padding":"14px","display":"grid","gridTemplateColumns":(stackCols),"gap":"14px","minHeight":"min(560px, calc(100vh - 150px))","boxSizing":"border-box"}}>
{" "}
<div style={{"padding":"clamp(18px, 3vw, 36px)","display":"flex","flexDirection":"column","gap":"18px"}}>
{" "}
<span style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"22px","color":"#2A62F5"}}>
{"02"}
</span>
{" "}
<h2 style={{"margin":"0","fontWeight":"500","fontSize":"clamp(38px, 4.6vw, 60px)","lineHeight":"1","letterSpacing":"0"}}>
{"AI agents"}
</h2>
{" "}
<p style={{"margin":"0","fontSize":"17px","lineHeight":"1.5","color":"var(--yl-sub, #5B6272)","maxWidth":"36ch"}}>
{"AI that reads, sorts and replies for you, day and night, in your voice."}
</p>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 200px), 1fr))","gap":"10px 20px","marginTop":"6px","fontSize":"15px"}}>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"center"}}>
<span style={{"flex":"none","width":"20px","height":"20px","borderRadius":"999px","background":"rgba(42,98,245,0.14)","color":"#2A62F5","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✓"}
</span>
{"Inbox and support replies"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"center"}}>
<span style={{"flex":"none","width":"20px","height":"20px","borderRadius":"999px","background":"rgba(42,98,245,0.14)","color":"#2A62F5","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✓"}
</span>
{"Lead qualification"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"center"}}>
<span style={{"flex":"none","width":"20px","height":"20px","borderRadius":"999px","background":"rgba(42,98,245,0.14)","color":"#2A62F5","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✓"}
</span>
{"Booking and rescheduling"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"center"}}>
<span style={{"flex":"none","width":"20px","height":"20px","borderRadius":"999px","background":"rgba(42,98,245,0.14)","color":"#2A62F5","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✓"}
</span>
{"Trained on your own docs"}
</span>
{" "}
</div>
{" "}
<div style={{"marginTop":"auto","paddingTop":"18px","display":"flex","gap":"16px","alignItems":"center","flexWrap":"wrap"}}>
{" "}
<a href={"/services/ai-agents"} style={{"display":"inline-flex","alignItems":"center","gap":"10px","padding":"12px 20px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","color":"#FFFFFF","fontSize":"15px","fontWeight":"500","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.18), 0 12px 26px -10px rgba(42,98,245,0.7)","transition":"transform 400ms cubic-bezier(.16,1,.3,1)"}} className={"yl-hover-8"}>
{"Explore AI agents →"}
</a>
{" "}
<span style={{"fontSize":"14px","color":"var(--yl-sub, #5B6272)"}}>
{"Fixed quote after a free call"}
</span>
{" "}
</div>
{" "}
</div>
{" "}
<div style={{"position":"relative","minHeight":"300px","borderRadius":"22px","overflow":"hidden","color":"#0D1321","display":"flex","flexDirection":"column","justifyContent":"center","gap":"12px","padding":"0 clamp(18px, 4vw, 44px)","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)"}}>
{" "}
<div data-yl-float={"0"} style={{"alignSelf":"flex-start","maxWidth":"80%","padding":"12px 16px","borderRadius":"18px 18px 18px 6px","background":"#FFFFFF","fontSize":"15px","boxShadow":"0 12px 30px -14px rgba(13,19,33,0.3)"}}>
{"Hi! Can I move my booking to Friday?"}
</div>
{" "}
<div style={{"alignSelf":"flex-end","maxWidth":"85%","minHeight":"22px","padding":"12px 16px","borderRadius":"18px 18px 6px 18px","background":"#2A62F5","color":"#FFFFFF","fontSize":"15px","lineHeight":"1.4","boxShadow":"0 14px 30px -14px rgba(42,98,245,0.6)"}}>
{(aiText)}
<span style={{"opacity":(caret)}}>
{"▍"}
</span>
</div>
{" "}
<div data-yl-float={"1"} style={{"alignSelf":"flex-end","display":"inline-flex","gap":"8px","alignItems":"center","padding":"6px 12px","borderRadius":"999px","background":"#FFFFFF","fontSize":"12px","fontWeight":"500","boxShadow":"0 10px 24px -14px rgba(13,19,33,0.35)"}}>
<span style={{"width":"7px","height":"7px","borderRadius":"999px","background":"#22B26B"}}>

</span>
{"Calendar updated"}
</div>
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div data-yl-stack={""} style={{"position":(stackPos),"top":"132px","marginBottom":"18vh"}}>
{" "}
<div style={{"transformOrigin":"50% 0%","borderRadius":"32px","background":"var(--yl-scard, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)","boxShadow":"0 40px 80px -40px rgba(7,11,22,0.55)","padding":"14px","display":"grid","gridTemplateColumns":(stackCols),"gap":"14px","minHeight":"min(560px, calc(100vh - 150px))","boxSizing":"border-box"}}>
{" "}
<div style={{"padding":"clamp(18px, 3vw, 36px)","display":"flex","flexDirection":"column","gap":"18px"}}>
{" "}
<span style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"22px","color":"#2A62F5"}}>
{"03"}
</span>
{" "}
<h2 style={{"margin":"0","fontWeight":"500","fontSize":"clamp(38px, 4.6vw, 60px)","lineHeight":"1","letterSpacing":"0"}}>
{"CRM setup"}
</h2>
{" "}
<p style={{"margin":"0","fontSize":"17px","lineHeight":"1.5","color":"var(--yl-sub, #5B6272)","maxWidth":"36ch"}}>
{"GoHighLevel or HubSpot, set up the way you sell. Every lead in one place."}
</p>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 200px), 1fr))","gap":"10px 20px","marginTop":"6px","fontSize":"15px"}}>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"center"}}>
<span style={{"flex":"none","width":"20px","height":"20px","borderRadius":"999px","background":"rgba(42,98,245,0.14)","color":"#2A62F5","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✓"}
</span>
{"Pipelines and stages"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"center"}}>
<span style={{"flex":"none","width":"20px","height":"20px","borderRadius":"999px","background":"rgba(42,98,245,0.14)","color":"#2A62F5","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✓"}
</span>
{"Follow-ups that send themselves"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"center"}}>
<span style={{"flex":"none","width":"20px","height":"20px","borderRadius":"999px","background":"rgba(42,98,245,0.14)","color":"#2A62F5","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✓"}
</span>
{"Forms and lead capture"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"center"}}>
<span style={{"flex":"none","width":"20px","height":"20px","borderRadius":"999px","background":"rgba(42,98,245,0.14)","color":"#2A62F5","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✓"}
</span>
{"Data moved over from your old tools"}
</span>
{" "}
</div>
{" "}
<div style={{"marginTop":"auto","paddingTop":"18px","display":"flex","gap":"16px","alignItems":"center","flexWrap":"wrap"}}>
{" "}
<a href={"/services/crm"} style={{"display":"inline-flex","alignItems":"center","gap":"10px","padding":"12px 20px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","color":"#FFFFFF","fontSize":"15px","fontWeight":"500","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.18), 0 12px 26px -10px rgba(42,98,245,0.7)","transition":"transform 400ms cubic-bezier(.16,1,.3,1)"}} className={"yl-hover-9"}>
{"Explore CRM setup →"}
</a>
{" "}
<span style={{"fontSize":"14px","color":"var(--yl-sub, #5B6272)"}}>
{"From "}
<span style={{"color":"var(--yl-ink, #0D1321)","fontWeight":"500"}}>
{"$1,500"}
</span>
</span>
{" "}
</div>
{" "}
</div>
{" "}
<div style={{"position":"relative","minHeight":"300px","borderRadius":"22px","overflow":"hidden","color":"#0D1321","display":"grid","gridTemplateColumns":"repeat(4, minmax(0, 1fr))","gap":"10px","alignContent":"center","padding":"24px clamp(14px, 3vw, 30px)","boxSizing":"border-box","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)"}}>
{" "}
{(crmCols).map((cc, itemIndex6) => <React.Fragment key={itemIndex6}>{" "}
<div style={{"display":"flex","flexDirection":"column","gap":"8px"}}>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","fontSize":"12px","fontWeight":"500","color":"#3A4252"}}>
<span >
{(cc.name)}
</span>
<span style={{"color":"#2A62F5"}}>
{(cc.count)}
</span>
</div>
{" "}
<div style={{"height":"46px","borderRadius":"12px","background":"#FFFFFF","boxShadow":"0 8px 20px -12px rgba(13,19,33,0.3)"}}>

</div>
{" "}
<div style={{"height":"46px","borderRadius":"12px","background":(cc.hot),"color":"#FFFFFF","fontSize":"12px","display":"grid","placeItems":"center","boxShadow":"0 8px 20px -12px rgba(13,19,33,0.3)","transform":(cc.lift),"transition":"all 600ms cubic-bezier(.16,1,.3,1)"}}>
{(cc.label)}
</div>
{" "}
<div style={{"height":"46px","borderRadius":"12px","background":"rgba(255,255,255,0.6)"}}>

</div>
{" "}
</div>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div data-yl-stack={""} style={{"position":(stackPos),"top":"150px"}}>
{" "}
<div style={{"transformOrigin":"50% 0%","borderRadius":"32px","background":"var(--yl-scard, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)","boxShadow":"0 40px 80px -40px rgba(7,11,22,0.55)","padding":"14px","display":"grid","gridTemplateColumns":(stackCols),"gap":"14px","minHeight":"min(560px, calc(100vh - 150px))","boxSizing":"border-box"}}>
{" "}
<div style={{"padding":"clamp(18px, 3vw, 36px)","display":"flex","flexDirection":"column","gap":"18px"}}>
{" "}
<span style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"22px","color":"#2A62F5"}}>
{"04"}
</span>
{" "}
<h2 style={{"margin":"0","fontWeight":"500","fontSize":"clamp(38px, 4.6vw, 60px)","lineHeight":"1","letterSpacing":"0"}}>
{"Custom apps"}
</h2>
{" "}
<p style={{"margin":"0","fontSize":"17px","lineHeight":"1.5","color":"var(--yl-sub, #5B6272)","maxWidth":"36ch"}}>
{"Portals and tools built around how you work, instead of another spreadsheet."}
</p>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 200px), 1fr))","gap":"10px 20px","marginTop":"6px","fontSize":"15px"}}>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"center"}}>
<span style={{"flex":"none","width":"20px","height":"20px","borderRadius":"999px","background":"rgba(42,98,245,0.14)","color":"#2A62F5","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✓"}
</span>
{"Client portals"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"center"}}>
<span style={{"flex":"none","width":"20px","height":"20px","borderRadius":"999px","background":"rgba(42,98,245,0.14)","color":"#2A62F5","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✓"}
</span>
{"Internal dashboards"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"center"}}>
<span style={{"flex":"none","width":"20px","height":"20px","borderRadius":"999px","background":"rgba(42,98,245,0.14)","color":"#2A62F5","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✓"}
</span>
{"Ops tools on your data"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"center"}}>
<span style={{"flex":"none","width":"20px","height":"20px","borderRadius":"999px","background":"rgba(42,98,245,0.14)","color":"#2A62F5","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✓"}
</span>
{"Hosted and looked after"}
</span>
{" "}
</div>
{" "}
<div style={{"marginTop":"auto","paddingTop":"18px","display":"flex","gap":"16px","alignItems":"center","flexWrap":"wrap"}}>
{" "}
<a href={"/services/custom-apps"} style={{"display":"inline-flex","alignItems":"center","gap":"10px","padding":"12px 20px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","color":"#FFFFFF","fontSize":"15px","fontWeight":"500","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.18), 0 12px 26px -10px rgba(42,98,245,0.7)","transition":"transform 400ms cubic-bezier(.16,1,.3,1)"}} className={"yl-hover-10"}>
{"Explore custom apps →"}
</a>
{" "}
<span style={{"fontSize":"14px","color":"var(--yl-sub, #5B6272)"}}>
{"Fixed quote after a free call"}
</span>
{" "}
</div>
{" "}
</div>
{" "}
<div style={{"position":"relative","minHeight":"300px","borderRadius":"22px","overflow":"hidden","color":"#0D1321","display":"grid","placeItems":"center","padding":"24px","boxSizing":"border-box","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)"}}>
{" "}
<div data-yl-float={"2"} style={{"width":"min(100%, 360px)","borderRadius":"16px","background":"#FFFFFF","boxShadow":"0 24px 50px -20px rgba(13,19,33,0.4)","overflow":"hidden"}}>
{" "}
<div style={{"display":"flex","gap":"5px","alignItems":"center","padding":"9px 12px","background":"#F1F3F7"}}>
<span style={{"width":"8px","height":"8px","borderRadius":"999px","background":"#D5DBE5"}}>

</span>
<span style={{"width":"8px","height":"8px","borderRadius":"999px","background":"#D5DBE5"}}>

</span>
<span style={{"width":"8px","height":"8px","borderRadius":"999px","background":"#D5DBE5"}}>

</span>
<span style={{"marginLeft":"8px","fontSize":"11px","color":"#5B6272"}}>
{"app.yourco.com"}
</span>
</div>
{" "}
<div style={{"padding":"16px 16px 4px","display":"flex","justifyContent":"space-between","alignItems":"baseline"}}>
<span style={{"fontSize":"13px","color":"#5B6272"}}>
{"Jobs this week"}
</span>
<span style={{"fontSize":"22px","fontWeight":"500","letterSpacing":"0"}}>
{(appCount)}
</span>
</div>
{" "}
<div style={{"display":"flex","alignItems":"flex-end","gap":"6px","height":"110px","padding":"12px 16px 16px"}}>
{" "}
{(appBars).map((b, itemIndex8) => <React.Fragment key={itemIndex8}>{" "}
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
</div>
{" "}
</div>
{" "}
</section>
{" "}
<section data-screen-label={"Service picker"} style={{"position":"relative","maxWidth":"1000px","margin":"0 auto","padding":"clamp(120px, 15vw, 200px) clamp(20px, 5vw, 64px) 0","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center"}}>
{" "}
<h2 data-yl-split={"p"} style={{"fontWeight":"500","fontSize":"clamp(40px, 5.6vw, 76px)","lineHeight":"1","letterSpacing":"0","margin":"0"}}>
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"Not"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"sure"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"where"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"to"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#6E96FF","letterSpacing":"0","paddingRight":"0.06em"}}>
{"start?"}
</span>
</h2>
{" "}
<p data-yl-reveal={"200"} style={{"margin":"20px 0 0","fontSize":"17px","color":"var(--yl-sub, #5B6272)"}}>
{"Pick what sounds familiar."}
</p>
{" "}
<div data-yl-reveal={"300"} style={{"display":"flex","flexWrap":"wrap","justifyContent":"center","gap":"10px","marginTop":"32px","maxWidth":"760px"}}>
{" "}
{(pains).map((pn, itemIndex4) => <React.Fragment key={itemIndex4}>{" "}
<button type={"button"} onClick={(pn.pick)} style={{"border":"1px solid " + String(pn.bd),"cursor":"pointer","font":"inherit","fontSize":"15px","padding":"12px 18px","borderRadius":"999px","background":(pn.bg),"color":(pn.fg),"boxShadow":(pn.sh),"transition":"all 400ms cubic-bezier(.16,1,.3,1)"}} className={"yl-hover-11"}>
{(pn.label)}
</button>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
<div data-yl-reveal={"420"} style={{"width":"100%","maxWidth":"620px","marginTop":"36px"}}>
{" "}
<div ref={(resRef)} style={{"position":"relative","overflow":"hidden","textAlign":"left","padding":"clamp(22px, 3vw, 32px)","borderRadius":"28px","background":"var(--yl-card, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)","boxShadow":"0 40px 80px -40px rgba(42,98,245,0.5)","display":"flex","flexWrap":"wrap","gap":"20px","alignItems":"center","justifyContent":"space-between","backdropFilter":"blur(20px)","WebkitBackdropFilter":"blur(20px)"}}>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","right":"-80px","top":"-120px","width":"300px","height":"300px","background":"radial-gradient(closest-side, rgba(42,98,245,0.35), rgba(42,98,245,0))","pointerEvents":"none"}}>

</div>
{" "}
<div style={{"position":"relative","minWidth":"0","flex":"1 1 260px"}}>
{" "}
<div style={{"fontSize":"14px","color":"var(--yl-sub, #5B6272)"}}>
{"Start with"}
</div>
{" "}
<div style={{"fontSize":"clamp(30px, 3.4vw, 42px)","fontWeight":"500","letterSpacing":"0","marginTop":"4px"}}>
{(rec.title)}
</div>
{" "}
<div style={{"fontSize":"16px","color":"var(--yl-sub, #5B6272)","marginTop":"6px","lineHeight":"1.5"}}>
{(rec.line)}
</div>
{" "}
</div>
{" "}
<a href={(rec.href)} style={{"position":"relative","flex":"none","display":"inline-flex","alignItems":"center","gap":"10px","padding":"12px 20px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","color":"#FFFFFF","fontSize":"15px","fontWeight":"500","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.18), 0 12px 26px -10px rgba(42,98,245,0.7)"}} className={"yl-hover-12"}>
{"See how →"}
</a>
{" "}
</div>
{" "}
</div>
{" "}
</section>
{" "}
</div>
{" "}
<section data-screen-label={"Final CTA"} style={{"position":"relative","maxWidth":"1200px","margin":"0 auto","padding":"clamp(120px, 15vw, 220px) clamp(20px, 5vw, 64px)","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center"}}>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","left":"50%","top":"50%","width":"900px","height":"560px","transform":"translate(-50%, -50%)","background":"radial-gradient(closest-side, rgba(255,160,100,0.35), rgba(220,230,254,0.5) 55%, rgba(246,247,249,0))","pointerEvents":"none"}}>

</div>
{" "}
<h2 data-yl-split={"c"} style={{"position":"relative","fontWeight":"500","fontSize":"clamp(48px, 8vw, 112px)","lineHeight":"0.96","letterSpacing":"0","margin":"0"}}>
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"Let's"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"find"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"your"}
</span>
<br  />
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5","letterSpacing":"0","paddingRight":"0.06em"}}>
{"quick"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5","letterSpacing":"0","paddingRight":"0.06em"}}>
{"wins."}
</span>
</h2>
{" "}
<BookingLink data-yl-reveal={"300"} style={{"marginTop":"40px","border":"0","cursor":"pointer","font":"inherit","fontSize":"16px","fontWeight":"500","display":"inline-flex","alignItems":"center","gap":"12px","padding":"8px 8px 8px 24px","borderRadius":"999px","position":"relative","overflow":"hidden","isolation":"isolate","background":"linear-gradient(180deg, #2B3550 0%, #131B2E 55%, #0B1120 100%)","color":"#FFFFFF","transition":"transform 400ms cubic-bezier(.16,1,.3,1)","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -2px 0 rgba(0,0,0,0.35), 0 0 0 1px #0B1120, 0 2px 4px rgba(13,19,33,0.22), 0 12px 26px -10px rgba(13,19,33,0.6)"}} className={"yl-hover-13"}>
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
<a href={"/"} style={{"fontWeight":"600","color":"#0D1321","letterSpacing":"0"}}>
{"Yara"}
<span style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5"}}>
{" Labs"}
</span>
</a>
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
