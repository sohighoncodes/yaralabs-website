"use client";
import React from "react";
import { darkSectionProgress } from "../../lib/dark-section";
import AppBrand from "../AppBrand";
import BookingLink from "../BookingLink";
import SiteNav from "../SiteNav";
import BrandLogo from "../BrandLogo";

const EASE = 'cubic-bezier(.16,1,.3,1)';
const DARK = { ink: [[13,19,33,1],[243,245,250,1]], sub: [[91,98,114,1],[168,177,196,1]], line: [[228,231,236,1],[255,255,255,0.12]], frame: [[255,255,255,1],[22,30,52,0.75]], card: [[255,255,255,1],[22,30,52,0.72]], scard: [[246,247,249,1],[16,23,42,1]] };
const ART = ['linear-gradient(135deg, #FFB37A, #F07A3C)', 'linear-gradient(135deg, #9DB7FF, #2A62F5)', 'linear-gradient(135deg, #C7B8FF, #765CFF)', 'linear-gradient(135deg, #B7E9CD, #22B26B)', 'linear-gradient(135deg, #FFE6D2, #FFB37A)'];
const USMD_APPS = [['Jotform', '#FF6100'], ['SignNow', '#2A62F5'], ['monday.com', '#FF3D57'], ['ActiveCampaign', '#356AE6'], ['Stripe', '#635BFF'], ['Wix', '#0D1321']];
const ORDERS = [['#4821', 'Set of 3 · 50×70', 2, 3], ['#4822', 'Framed · A3', 0, 1], ['#4823', '2 copies · A2', 1, 2], ['#4824', 'Unframed · A3', 0, 1]];
const cl = (v) => Math.min(1, Math.max(0, v));

export default class DesignPage extends React.Component {
  state = { tick: 0, scrolled: false, compactNav: false };
  darkRef = React.createRef(); zoneRef = React.createRef();
  mx = 0; my = 0; cx = 0; cy = 0;
  motion() { return (this.props.motion ?? 'Full') !== 'Off' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  componentDidMount() {
    this.t1 = this.motion() && setInterval(() => this.setState(s => ({ tick: s.tick + 1 })), 1300);
    this.onScroll = () => { if (!this.raf) this.raf = requestAnimationFrame(() => { this.raf = 0; this.scrollTick(); }); };
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll);
    this.onPtr = (e) => { this.mx = e.clientX / window.innerWidth - 0.5; this.my = e.clientY / window.innerHeight - 0.5; };
    window.addEventListener('pointermove', this.onPtr, { passive: true });
    requestAnimationFrame(() => { this.animate(); this.scrollTick(); this.objLoop(); });
  }
  componentWillUnmount() {
    cancelAnimationFrame(this.loopRaf); clearInterval(this.t1);
    window.removeEventListener('scroll', this.onScroll); window.removeEventListener('resize', this.onScroll); window.removeEventListener('pointermove', this.onPtr);
    this.io && this.io.disconnect(); this.io2 && this.io2.disconnect();
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
    const st = document.querySelector('[data-yl-steps]'), ln = document.querySelector('[data-yl-line]');
    if (st && ln) {
      const r = st.getBoundingClientRect(), mark = vh * 0.6;
      ln.style.height = (cl((mark - r.top) / r.height) * 100).toFixed(2) + '%';
      document.querySelectorAll('[data-yl-node]').forEach(n => { const on = n.getBoundingClientRect().top + 24 < mark; n.style.background = on ? 'linear-gradient(180deg, #5A88FF, #2453E0)' : ''; n.style.color = on ? '#FFFFFF' : ''; n.style.boxShadow = on ? '0 0 0 6px rgba(42,98,245,0.18), 0 10px 30px -6px rgba(42,98,245,0.8)' : ''; });
    }
    if (this.motion()) document.querySelectorAll('[data-yl-rise]').forEach(el => {
      const r = el.getBoundingClientRect();
      const p = cl(1 - (r.top - vh * 0.25) / (vh * 0.6));
      el.style.transform = `translateY(${((1 - p) * 60).toFixed(1)}px) scale(${(0.9 + 0.1 * p).toFixed(4)}) rotateX(${((1 - p) * 14).toFixed(2)}deg)`;
      el.style.opacity = (0.35 + 0.65 * p).toFixed(3);
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
      { duration: 1200, delay: base + i * 110, easing: EASE, fill: 'both' }));
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
    document.querySelectorAll('[data-yl-obj]').forEach((el, i) => el.animate([{ opacity: 0, scale: 0.6, filter: full ? 'blur(14px)' : 'none' }, { opacity: 1, scale: 1, filter: 'blur(0px)' }], { duration: 1600, delay: 400 + i * 120, easing: EASE, fill: 'backwards' }));
    document.querySelectorAll('[data-yl-bob]').forEach((el, i) => el.animate([{ transform: 'translateY(0) rotate(0deg)' }, { transform: `translateY(-${14 + (i % 3) * 6}px) rotate(${i % 2 ? -6 : 6}deg)` }], { duration: 3800 + i * 700, delay: i * 200, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }));
    document.querySelectorAll('[data-yl-drift]').forEach((el, i) => el.animate([{ translate: '0 0' }, { translate: i ? '120px -60px' : '-90px 70px' }], { duration: 14000 + i * 4000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }));
    document.querySelectorAll('[data-yl-aurora]').forEach((el, i) => el.animate([{ translate: '0 0', scale: 1 }, { translate: ['18vw 10vh', '-14vw -12vh', '-10vw 14vh'][i], scale: 1.25 }], { duration: 16000 + i * 5000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }));
    this.io2 = new IntersectionObserver((entries) => entries.forEach(e => {
      if (!e.isIntersecting) return; this.io2.unobserve(e.target);
      const el = e.target, to = +el.dataset.ylCount, t0 = performance.now();
      const step = (now) => { const q = Math.min(1, (now - t0) / 1600), v = to * (1 - Math.pow(1 - q, 4)); el.textContent = Math.round(v).toLocaleString(); if (q < 1) requestAnimationFrame(step); };
      el.textContent = '0'; requestAnimationFrame(step);
    }), { rootMargin: '0px 0px -15% 0px' });
    document.querySelectorAll('[data-yl-count]').forEach(el => this.io2.observe(el));
    document.querySelectorAll('[data-yl-pulse]').forEach(el => el.animate([{ transform: 'scale(1)', opacity: 0.9 }, { transform: 'scale(1.9)', opacity: 0 }], { duration: 2200, iterations: Infinity, easing: 'cubic-bezier(.2,.6,.3,1)' }));
    document.querySelectorAll('[data-yl-shine]').forEach((el, i) => el.animate([{ left: '-60%', offset: 0 }, { left: '130%', offset: 0.3 }, { left: '130%', offset: 1 }], { duration: 4200, delay: 900 + i * 260, iterations: Infinity, easing: 'cubic-bezier(.45,0,.2,1)' }));
  }
  tiltMove = (e) => {
    if (!this.motion() || e.pointerType === 'touch') return;
    const el = e.currentTarget, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    const t = el.querySelector('[data-yl-tilt]'), g = el.querySelector('[data-yl-glare]');
    t.style.transition = 'transform 160ms ease-out';
    t.style.transform = `rotateY(${((x - 0.5) * 9).toFixed(2)}deg) rotateX(${((0.5 - y) * 7).toFixed(2)}deg) scale(1.015)`;
    g.style.opacity = '1';
    g.style.background = `radial-gradient(700px circle at ${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%, rgba(255,255,255,0.55), rgba(255,255,255,0) 45%)`;
  };
  tiltLeave = (e) => {
    const el = e.currentTarget, t = el.querySelector('[data-yl-tilt]'), g = el.querySelector('[data-yl-glare]');
    t.style.transition = `transform 1000ms ${EASE}`; t.style.transform = 'none'; g.style.opacity = '0';
  };
  renderVals() {
    const { scrolled, compactNav, tick } = this.state;
    const a = tick % 7, b = tick % 9, c = tick % 7, absorbed = Math.min(b, 6), up = (on) => on ? 'none' : 'translateY(2cqw)';
    const fn = [6, 3, 4], fresh = c >= 1 && c <= 4 ? ORDERS[c - 1][2] : -1;
    ORDERS.forEach((o, i) => { if (i < c) fn[o[2]] += o[3]; });
    const c1 = { name: a >= 1 ? 'Sarah · Acme Corp' : 'Name', nameC: a >= 1 ? '#0D1321' : '#A3AAB8', event: a >= 2 ? 'Corporate lunch' : 'Event type', guests: a >= 2 ? '40 guests' : 'Guests', evC: a >= 2 ? '#0D1321' : '#A3AAB8', f1b: a === 1 ? '#2A62F5' : '#E4E7EC', f2b: a === 2 ? '#2A62F5' : '#E4E7EC', btn: a === 2 ? '#1B47C4' : '#2A62F5', btnT: a === 2 ? 'scale(0.95)' : 'none', leadX: ['0%', '0%', '0%', '0%', '34.3%', '68.5%', '68.5%'][a], leadOp: a >= 3 ? 1 : 0, leadBg: a >= 5 ? '#22B26B' : '#2A62F5', smsOp: a >= 3 ? 1 : 0, smsT: up(a >= 3), revOp: a >= 6 ? 1 : 0, revT: up(a >= 6), leads: a >= 3 ? 28 : 27 };
    const ST = [['Awaiting medspa', '#FFF1E6', '#B4561E'], ['With medical director', '#EEF3FF', '#2A62F5'], ['Signed ✓', '#E6F7EE', '#178A52']];
    const u = { hubS: b >= 1 && b <= 6 && tick % 2 ? 'scale(1.06)' : 'scale(1)', count: absorbed >= 6 ? 'One platform' : (7 - absorbed) + ' tools', chips: USMD_APPS.map(([name, col], i) => { const g = (-90 + i * 60) * Math.PI / 180, on = i < absorbed; return { name, c: col, x: on ? 50 : +(50 + 36 * Math.cos(g)).toFixed(1), y: on ? 50 : +(50 + 34 * Math.sin(g)).toFixed(1), s: on ? 0.3 : 1, o: on ? 0 : 1 }; }), rows: ['Glow Medspa', 'Lumen Aesthetics', 'Pure Skin Co.'].map((name, j) => { const s = ST[(Math.floor(tick / 2) + j) % 3]; return { name, st: s[0], bg: s[1], fg: s[2] }; }), payOp: b >= 3 && b <= 7 ? 1 : 0, payT: up(b >= 3 && b <= 7) };
    const k = { orders: ORDERS.map(([id, desc], i) => ({ id, desc, art: ART[i], bg: i === c ? '#EEF3FF' : '#FFFFFF', bd: i === c ? '#9DB7FF' : '#EEF0F4', op: i < c ? 0.55 : 1, mark: i < c ? '✓' : i === c ? '•••' : '' })), nodes: ['Check', 'Match art', 'Sort'].map((name, j) => { const on = c < 4 && tick % 3 === j; return { name, bg: on ? '#2A62F5' : '#FFFFFF', fg: on ? '#FFFFFF' : '#3A4252' }; }), folders: ['A3', 'A2', '50×70'].map((name, j) => ({ name, bd: j === fresh ? '#2A62F5' : '#EEF0F4', thumbs: Array.from({ length: fn[j] }, (_, q) => ART[(q + j * 2) % ART.length]) })), total: fn[0] + fn[1] + fn[2], slackOp: c >= 5 ? 1 : 0, slackT: up(c >= 5) };
    return {
      c1, u, k,
      navLinksDisplay: compactNav ? 'none' : 'flex',
      navBg: scrolled ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.4)',
      navBorder: scrolled ? '#E4E7EC' : 'rgba(228,231,236,0.5)',
      navShadow: scrolled ? '0 10px 30px -12px rgba(13,19,33,0.18)' : 'none',
      darkRef: this.darkRef, zoneRef: this.zoneRef,
      projCols: compactNav ? 'minmax(0, 1fr)' : 'minmax(0, 1.35fr) minmax(0, 1fr)',
      projColsAlt: compactNav ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 1.35fr)',
      altOrder: compactNav ? 0 : 2,
      tiltMove: this.tiltMove, tiltLeave: this.tiltLeave,
    };
  }

render() { const {k,darkRef,zoneRef,tiltMove,tiltLeave} = this.renderVals(); return (<>{" "}

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
<div data-yl-drift={"1"} aria-hidden={"true"} style={{"position":"absolute","top":"320px","left":"6%","width":"620px","height":"520px","background":"radial-gradient(closest-side, rgba(255,179,122,0.3), rgba(246,247,249,0))","pointerEvents":"none"}}>

</div>
{" "}
<SiteNav scrolled={this.state.scrolled} />
{" "}
<header data-screen-label={"Case hero"} style={{"position":"relative","maxWidth":"1200px","margin":"0 auto","padding":"clamp(140px, 17vw, 200px) clamp(20px, 5vw, 64px) 0","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center"}}>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","inset":"0","zIndex":"0","pointerEvents":"none"}}>
{" "}
<div data-yl-obj={"0.7"} style={{"position":"absolute","right":"0%","top":"26%"}}>
<div data-yl-bob={"0"} style={{"perspective":"900px"}}>
<div style={{"width":"clamp(130px, 15vw, 220px)","borderRadius":"14px","background":"rgba(255,255,255,0.75)","border":"1px solid rgba(255,255,255,0.9)","backdropFilter":"blur(10px)","WebkitBackdropFilter":"blur(10px)","transform":"rotateY(-26deg) rotateX(12deg) rotateZ(4deg)","boxShadow":"inset 0 1px 0 #FFFFFF, 0 40px 60px -24px rgba(27,63,184,0.45)","overflow":"hidden"}}>
{" "}
<div style={{"display":"flex","gap":"4px","padding":"8px 10px","background":"rgba(241,243,247,0.9)"}}>
<span style={{"width":"6px","height":"6px","borderRadius":"999px","background":"#D5DBE5"}}>

</span>
<span style={{"width":"6px","height":"6px","borderRadius":"999px","background":"#D5DBE5"}}>

</span>
<span style={{"width":"6px","height":"6px","borderRadius":"999px","background":"#D5DBE5"}}>

</span>
</div>
{" "}
<div style={{"display":"flex","flexDirection":"column","gap":"7px","padding":"12px"}}>
<span style={{"height":"8px","width":"60%","borderRadius":"4px","background":"#2A62F5"}}>

</span>
<span style={{"height":"6px","width":"90%","borderRadius":"4px","background":"#DCE6FE"}}>

</span>
<span style={{"height":"6px","width":"75%","borderRadius":"4px","background":"#DCE6FE"}}>

</span>
<span style={{"display":"flex","gap":"6px","alignItems":"flex-end","height":"40px","marginTop":"4px"}}>
<span style={{"flex":"1","height":"40%","borderRadius":"3px","background":"#DCE6FE"}}>

</span>
<span style={{"flex":"1","height":"70%","borderRadius":"3px","background":"#DCE6FE"}}>

</span>
<span style={{"flex":"1","height":"55%","borderRadius":"3px","background":"#DCE6FE"}}>

</span>
<span style={{"flex":"1","height":"100%","borderRadius":"3px","background":"#2A62F5"}}>

</span>
</span>
</div>
{" "}
</div>
</div>
</div>
{" "}
<div data-yl-obj={"1.0"} style={{"position":"absolute","left":"2%","top":"30%"}}>
<div data-yl-bob={"1"}>
<div style={{"width":"clamp(76px, 9.6vw, 144px)","aspectRatio":"1","borderRadius":"50%","background":"radial-gradient(circle at 32% 28%, #FFFFFF 0%, #D6E2FF 9%, #7FA2FF 30%, #2A62F5 56%, #163599 84%, #0B1A5C 100%)","boxShadow":"inset -10px -14px 28px rgba(6,14,50,0.4), inset 6px 8px 16px rgba(255,255,255,0.4), 0 40px 60px -22px rgba(42,98,245,0.6)"}}>

</div>
</div>
</div>
{" "}
<div data-yl-obj={"1.4"} style={{"position":"absolute","right":"18%","top":"12%"}}>
<div data-yl-bob={"2"}>
<div style={{"width":"clamp(34px, 4vw, 58px)","aspectRatio":"1","borderRadius":"50%","background":"radial-gradient(circle at 32% 28%, #FFFFFF 0%, #FFE6D2 10%, #FFB37A 36%, #F07A3C 66%, #9C3A12 100%)","boxShadow":"inset -8px -10px 20px rgba(6,14,50,0.35), 0 22px 34px -14px rgba(240,122,60,0.55)"}}>

</div>
</div>
</div>
{" "}
<div data-yl-obj={"0.6"} style={{"position":"absolute","left":"14%","bottom":"-4%"}}>
<div data-yl-bob={"3"} style={{"perspective":"600px","filter":"drop-shadow(0 26px 26px rgba(27,63,184,0.32))"}}>
<div style={{"width":"clamp(96px, 11vw, 170px)","aspectRatio":"1","borderRadius":"50%","transform":"rotateX(64deg) rotateY(-18deg)","background":"radial-gradient(closest-side, transparent 56%, rgba(255,255,255,0.75) 68%, transparent 80%), conic-gradient(from 200deg, #163599, #6E96FF, #EEF3FF, #6E96FF, #163599, #0B1A5C, #163599)","WebkitMaskImage":"radial-gradient(closest-side, transparent 55%, #000 57%, #000 97%, transparent 100%)","maskImage":"radial-gradient(closest-side, transparent 55%, #000 57%, #000 97%, transparent 100%)"}}>

</div>
</div>
</div>
{" "}
<div data-yl-obj={"1.8"} style={{"position":"absolute","left":"26%","top":"15%"}}>
<div data-yl-bob={"4"}>
<div style={{"width":"20px","aspectRatio":"1","borderRadius":"50%","background":"radial-gradient(circle at 32% 28%, #FFFFFF 0%, #9DB7FF 30%, #2A62F5 70%, #0B1A5C 100%)","boxShadow":"0 10px 16px -6px rgba(42,98,245,0.6)"}}>

</div>
</div>
</div>
{" "}
</div>
{" "}
<a data-yl-reveal={"0"} href={"/projects"} style={{"position":"relative","zIndex":"1","fontSize":"14px","color":"#5B6272","display":"inline-flex","gap":"8px","alignItems":"center","marginBottom":"18px"}} className={"yl-hover-68"}>
{"← All projects"}
</a>
{" "}
<div data-yl-reveal={"80"} style={{"position":"relative","zIndex":"1","display":"inline-flex","alignItems":"center","gap":"10px","padding":"5px 14px 5px 5px","borderRadius":"999px","background":"rgba(255,255,255,0.8)","border":"1px solid #E4E7EC","fontSize":"13px","color":"#3A4252"}}>
<span style={{"padding":"3px 10px","borderRadius":"999px","background":"#2A62F5","color":"#FFFFFF","fontWeight":"500","fontSize":"12px"}}>
{"Case study"}
</span>
<span style={{"whiteSpace":"nowrap"}}>
{"Business automation"}
</span>
</div>
{" "}
<h1 data-yl-split={"hero"} style={{"position":"relative","zIndex":"1","fontWeight":"500","fontSize":"clamp(50px, 8.6vw, 124px)","lineHeight":"0.96","letterSpacing":"0","margin":"28px 0 0"}}>
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"Inka"}
</span>
<br  />
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","letterSpacing":"0","color":"#2A62F5","paddingRight":"0.06em"}}>
{"Arthouse."}
</span>
</h1>
{" "}
<p data-yl-reveal={"520"} style={{"position":"relative","zIndex":"1","fontSize":"clamp(17px, 1.6vw, 20px)","lineHeight":"1.5","maxWidth":"46ch","margin":"28px 0 0","color":"#5B6272"}}>
{"An automated print-prep workflow across three countries that helped the business grow to roughly 4–5× its previous revenue."}
</p>
{" "}
<div data-yl-reveal={"640"} style={{"position":"relative","zIndex":"1","display":"flex","flexWrap":"wrap","justifyContent":"center","gap":"8px","marginTop":"30px"}}>
{" "}
<span style={{"display":"inline-flex","gap":"8px","padding":"9px 16px","borderRadius":"999px","background":"rgba(255,255,255,0.85)","border":"1px solid #E4E7EC","fontSize":"14px"}}>
<span style={{"color":"#8A91A0"}}>
{"Client"}
</span>
<span style={{"fontWeight":"500"}}>
{"Australia · UK · US"}
</span>
</span>
{" "}
<span style={{"display":"inline-flex","gap":"8px","padding":"9px 16px","borderRadius":"999px","background":"rgba(255,255,255,0.85)","border":"1px solid #E4E7EC","fontSize":"14px"}}>
<span style={{"color":"#8A91A0"}}>
{"Industry"}
</span>
<span style={{"fontWeight":"500"}}>
{"E-commerce wall art"}
</span>
</span>
{" "}
<span style={{"display":"inline-flex","gap":"8px","padding":"9px 16px","borderRadius":"999px","background":"rgba(255,255,255,0.85)","border":"1px solid #E4E7EC","fontSize":"14px"}}>
<span style={{"color":"#8A91A0"}}>
{"Timeline"}
</span>
<span style={{"fontWeight":"500"}}>
{"1 month, ongoing support"}
</span>
</span>
{" "}
<span style={{"display":"inline-flex","gap":"8px","padding":"9px 16px","borderRadius":"999px","background":"rgba(255,255,255,0.85)","border":"1px solid #E4E7EC","fontSize":"14px"}}>
<span style={{"color":"#8A91A0"}}>
{"Investment"}
</span>
<span style={{"fontWeight":"500"}}>
{"$3,000"}
</span>
</span>
{" "}
<a href={"https://inkaarthouse.com/"} target={"_blank"} rel={"noopener noreferrer"} style={{"display":"inline-flex","gap":"8px","padding":"9px 16px","borderRadius":"999px","background":"#0D1321","color":"#FFFFFF","fontSize":"14px","fontWeight":"500"}} className={"yl-hover-69"}>
{"inkaarthouse.com ↗"}
</a>
{" "}
</div>
{" "}
</header>
{" "}
<section data-screen-label={"System in motion"} style={{"maxWidth":"1100px","margin":"0 auto","padding":"clamp(60px, 8vw, 100px) clamp(16px, 4vw, 48px) 0"}}>
{" "}
<div data-yl-rise={""} style={{"perspective":"1400px","transformOrigin":"50% 100%"}}>
{" "}
<div onPointerMove={(tiltMove)} onPointerLeave={(tiltLeave)} style={{"position":"relative"}}>
{" "}
<div data-yl-tilt={""} style={{"position":"relative","aspectRatio":"16 / 11","padding":"12px","boxSizing":"border-box","borderRadius":"34px","background":"#FFFFFF","border":"1px solid #E4E7EC","boxShadow":"0 70px 120px -60px rgba(42,98,245,0.6), 0 30px 60px -40px rgba(7,11,22,0.5)","transformStyle":"preserve-3d"}}>
{" "}
<div style={{"position":"relative","width":"100%","height":"100%","borderRadius":"22px","overflow":"hidden","containerType":"inline-size","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)"}}>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","inset":"0","color":"#0D1321","fontSize":"1.8cqw","lineHeight":"1.3"}}>
{" "}
<div style={{"position":"absolute","left":"5%","top":"8%","width":"36%","padding":"2cqw","display":"flex","flexDirection":"column","gap":"0.9cqw","borderRadius":"1.8cqw","background":"#FFFFFF","boxShadow":"0 2.4cqw 5cqw -2.4cqw rgba(13,19,33,0.35)","boxSizing":"border-box"}}>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","alignItems":"baseline"}}>
<span style={{"fontWeight":"500","fontSize":"2cqw"}}>
<span className="app-label"><AppBrand name="Shopify" />{" orders"}</span>
</span>
<span style={{"fontSize":"1.3cqw","color":"#8A91A0"}}>
{"Batch 214"}
</span>
</div>
{" "}
{(k.orders).map((od, itemIndex8) => <React.Fragment key={itemIndex8}>{" "}
<div style={{"display":"flex","alignItems":"center","gap":"1cqw","padding":"0.9cqw 1.1cqw","borderRadius":"1cqw","background":(od.bg),"border":"1px solid " + String(od.bd),"opacity":(od.op),"transition":"all 800ms cubic-bezier(.16,1,.3,1)"}}>
<span style={{"width":"3cqw","height":"3.6cqw","borderRadius":"0.4cqw","background":(od.art),"flex":"none"}}>

</span>
<span style={{"minWidth":"0"}}>
<span style={{"display":"block","fontWeight":"500","fontSize":"1.5cqw"}}>
{(od.id)}
</span>
<span style={{"display":"block","fontSize":"1.2cqw","color":"#5B6272","whiteSpace":"nowrap"}}>
{(od.desc)}
</span>
</span>
<span style={{"marginLeft":"auto","color":"#2A62F5","fontSize":"1.5cqw"}}>
{(od.mark)}
</span>
</div>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
<div style={{"position":"absolute","left":"5%","bottom":"8%","width":"36%","display":"flex","gap":"0.8cqw"}}>
{" "}
{(k.nodes).map((nd, itemIndex8) => <React.Fragment key={itemIndex8}>{" "}
<span style={{"flex":"1","textAlign":"center","padding":"1cqw 0","borderRadius":"999px","fontSize":"1.4cqw","fontWeight":"500","background":(nd.bg),"color":(nd.fg),"boxShadow":"0 1cqw 2.4cqw -1.2cqw rgba(13,19,33,0.35)","transition":"all 800ms cubic-bezier(.16,1,.3,1)"}}>
{(nd.name)}
</span>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
<div style={{"position":"absolute","right":"5%","top":"8%","width":"52%","padding":"2cqw","display":"flex","flexDirection":"column","gap":"1.2cqw","borderRadius":"1.8cqw","background":"#FFFFFF","boxShadow":"0 2.4cqw 5cqw -2.4cqw rgba(13,19,33,0.35)","boxSizing":"border-box"}}>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","alignItems":"baseline"}}>
<span style={{"fontWeight":"500","fontSize":"2cqw"}}>
<span className="app-label"><AppBrand name="Dropbox" />{" · Production"}</span>
</span>
<span style={{"fontSize":"1.3cqw","color":"#8A91A0"}}>
{String(k.total) + " files"}
</span>
</div>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"repeat(3, minmax(0, 1fr))","gap":"1cqw"}}>
{" "}
{(k.folders).map((fd, itemIndex9) => <React.Fragment key={itemIndex9}>{" "}
<div style={{"display":"flex","flexDirection":"column","gap":"0.8cqw","padding":"1.2cqw","borderRadius":"1.2cqw","background":"#F6F8FC","border":"1px solid " + String(fd.bd),"transition":"all 800ms cubic-bezier(.16,1,.3,1)"}}>
{" "}
<div style={{"display":"flex","alignItems":"center","gap":"0.7cqw"}}>
<span style={{"width":"2.2cqw","height":"1.7cqw","borderRadius":"0.3cqw 0.6cqw 0.3cqw 0.3cqw","background":"linear-gradient(180deg, #7FA2FF, #2A62F5)","flex":"none"}}>

</span>
<span style={{"fontWeight":"500","fontSize":"1.5cqw"}}>
{(fd.name)}
</span>
</div>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"repeat(4, minmax(0, 1fr))","gap":"0.5cqw","alignContent":"start","minHeight":"9cqw"}}>
{" "}
{(fd.thumbs).map((th, itemIndex12) => <React.Fragment key={itemIndex12}><span style={{"aspectRatio":"3 / 4","borderRadius":"0.3cqw","background":(th),"boxShadow":"0 0.4cqw 0.8cqw -0.3cqw rgba(13,19,33,0.35)"}}>

</span></React.Fragment>)}
{" "}
</div>
{" "}
</div>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
</div>
{" "}
<div style={{"position":"absolute","right":"5%","bottom":"8%","width":"52%","padding":"1.6cqw 1.8cqw","opacity":(k.slackOp),"transform":(k.slackT),"display":"flex","alignItems":"center","gap":"1.4cqw","borderRadius":"1.8cqw","background":"#FFFFFF","boxShadow":"0 2.4cqw 5cqw -2.4cqw rgba(13,19,33,0.35)","boxSizing":"border-box","transition":"all 800ms cubic-bezier(.16,1,.3,1)"}}>
{" "}
<span style={{"flex":"none","width":"3.6cqw","height":"3.6cqw","borderRadius":"1cqw","background":"#4A154B","color":"#FFFFFF","display":"grid","placeItems":"center","fontWeight":"600","fontSize":"1.8cqw"}}>
{"#"}
</span>
{" "}
<span style={{"minWidth":"0"}}>
<span style={{"display":"block","fontSize":"1.4cqw","color":"#5B6272"}}>
{"#production"}
</span>
<span style={{"display":"block"}}>
{"Batch 214 ready · packing slips attached ✓"}
</span>
</span>
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div data-yl-glare={""} aria-hidden={"true"} style={{"position":"absolute","inset":"0","borderRadius":"34px","pointerEvents":"none","opacity":"0","mixBlendMode":"soft-light","transition":"opacity 500ms ease"}}>

</div>
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<p data-yl-reveal={"0"} style={{"margin":"22px 0 0","textAlign":"center","fontSize":"14px","color":"#8A91A0"}}>
{"A simplified view of the system, running."}
</p>
{" "}
</section>
{" "}
<section data-screen-label={"Wins"} style={{"maxWidth":"1200px","margin":"0 auto","padding":"clamp(100px, 13vw, 170px) clamp(20px, 5vw, 64px) 0"}}>
{" "}
<h2 data-yl-split={"w"} style={{"textAlign":"center","fontWeight":"500","fontSize":"clamp(40px, 5.6vw, 76px)","lineHeight":"1","letterSpacing":"0","margin":"0 0 52px"}}>
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"The"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","letterSpacing":"0","color":"#2A62F5","paddingRight":"0.06em"}}>
{"wins."}
</span>
</h2>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 240px), 1fr))","gap":"14px"}}>
{" "}
<div data-yl-reveal={"0"} style={{"position":"relative","overflow":"hidden","padding":"28px","borderRadius":"28px","background":"#FFFFFF","border":"1px solid #E4E7EC","display":"flex","flexDirection":"column","gap":"12px","boxShadow":"0 30px 60px -44px rgba(42,98,245,0.5)","transition":"transform 500ms cubic-bezier(.16,1,.3,1), box-shadow 500ms ease"}} className={"yl-hover-70"}>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","right":"-70px","top":"-70px","width":"200px","height":"200px","background":"radial-gradient(closest-side, rgba(42,98,245,0.16), rgba(42,98,245,0))","pointerEvents":"none"}}>

</div>
{" "}
<div style={{"position":"relative","display":"flex","alignItems":"baseline","gap":"4px","fontWeight":"500","fontSize":"clamp(48px, 5.4vw, 72px)","lineHeight":"1","letterSpacing":"0","color":"#1B47C4","whiteSpace":"nowrap"}}>
<span >
{"4–5×"}
</span>
</div>
{" "}
<div style={{"position":"relative","fontSize":"16px","lineHeight":"1.45"}}>
{"revenue growth, supported without the same jump in manual work"}
</div>
{" "}
<div style={{"position":"relative","marginTop":"auto","paddingTop":"12px","borderTop":"1px solid #EEF0F4","fontSize":"13px","color":"#8A91A0"}}>
{"Prep was the bottleneck"}
</div>
{" "}
</div>
{" "}
<div data-yl-reveal={"110"} style={{"position":"relative","overflow":"hidden","padding":"28px","borderRadius":"28px","background":"#FFFFFF","border":"1px solid #E4E7EC","display":"flex","flexDirection":"column","gap":"12px","boxShadow":"0 30px 60px -44px rgba(42,98,245,0.5)","transition":"transform 500ms cubic-bezier(.16,1,.3,1), box-shadow 500ms ease"}} className={"yl-hover-71"}>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","right":"-70px","top":"-70px","width":"200px","height":"200px","background":"radial-gradient(closest-side, rgba(42,98,245,0.16), rgba(42,98,245,0))","pointerEvents":"none"}}>

</div>
{" "}
<div style={{"position":"relative","display":"flex","alignItems":"baseline","gap":"4px","fontWeight":"500","fontSize":"clamp(48px, 5.4vw, 72px)","lineHeight":"1","letterSpacing":"0","color":"#1B47C4","whiteSpace":"nowrap"}}>
<span data-yl-count={"3"}>
{"3"}
</span>
</div>
{" "}
<div style={{"position":"relative","fontSize":"16px","lineHeight":"1.45"}}>
{"production sites on one workflow"}
</div>
{" "}
<div style={{"position":"relative","marginTop":"auto","paddingTop":"12px","borderTop":"1px solid #EEF0F4","fontSize":"13px","color":"#8A91A0"}}>
{"Australia, UK and US"}
</div>
{" "}
</div>
{" "}
<div data-yl-reveal={"220"} style={{"position":"relative","overflow":"hidden","padding":"28px","borderRadius":"28px","background":"#FFFFFF","border":"1px solid #E4E7EC","display":"flex","flexDirection":"column","gap":"12px","boxShadow":"0 30px 60px -44px rgba(42,98,245,0.5)","transition":"transform 500ms cubic-bezier(.16,1,.3,1), box-shadow 500ms ease"}} className={"yl-hover-72"}>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","right":"-70px","top":"-70px","width":"200px","height":"200px","background":"radial-gradient(closest-side, rgba(42,98,245,0.16), rgba(42,98,245,0))","pointerEvents":"none"}}>

</div>
{" "}
<div style={{"position":"relative","display":"flex","alignItems":"baseline","gap":"4px","fontWeight":"500","fontSize":"clamp(48px, 5.4vw, 72px)","lineHeight":"1","letterSpacing":"0","color":"#1B47C4","whiteSpace":"nowrap"}}>
<span >
{"Auto"}
</span>
</div>
{" "}
<div style={{"position":"relative","fontSize":"16px","lineHeight":"1.45"}}>
{"artwork checks, print folders and packing slips"}
</div>
{" "}
<div style={{"position":"relative","marginTop":"auto","paddingTop":"12px","borderTop":"1px solid #EEF0F4","fontSize":"13px","color":"#8A91A0"}}>
{"Was done by hand for every batch"}
</div>
{" "}
</div>
{" "}
</div>
{" "}
</section>
{" "}
<div ref={(zoneRef)} style={{"color":"var(--yl-ink, #0D1321)","padding":"clamp(130px, 16vw, 220px) 0 clamp(120px, 14vw, 200px)"}}>
{" "}
<section data-screen-label={"Problem"} style={{"maxWidth":"1200px","margin":"0 auto","padding":"0 clamp(20px, 5vw, 64px)","display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 340px), 1fr))","gap":"clamp(28px, 5vw, 80px)","alignItems":"start"}}>
{" "}
<div data-yl-reveal={"0"}>
<div style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"22px","color":"#6E96FF"}}>
{"The problem"}
</div>
<h2 style={{"margin":"12px 0 0","fontWeight":"500","fontSize":"clamp(38px, 4.8vw, 64px)","lineHeight":"1","letterSpacing":"0"}}>
{"Where they were stuck."}
</h2>
</div>
{" "}
<p data-yl-reveal={"140"} style={{"margin":"0","fontSize":"clamp(18px, 1.8vw, 22px)","lineHeight":"1.55","color":"var(--yl-sub, #5B6272)"}}>
{"Inka sells wall art and prints in Australia, the UK and the US. Every batch meant checking orders, finding the right artwork, confirming sizes and quantities, sorting files and making packing slips by hand. As orders grew, this became the bottleneck, with more risk of missing artwork, duplicate prints and packing mistakes."}
</p>
{" "}
</section>
{" "}
<section data-screen-label={"What we built"} style={{"maxWidth":"860px","margin":"0 auto","padding":"clamp(110px, 14vw, 180px) clamp(20px, 5vw, 64px) 0"}}>
{" "}
<h2 data-yl-split={"b"} style={{"textAlign":"center","fontWeight":"500","fontSize":"clamp(40px, 5.6vw, 76px)","lineHeight":"1","letterSpacing":"0","margin":"0 0 56px"}}>
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"What"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"we"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","letterSpacing":"0","color":"#6E96FF","paddingRight":"0.06em"}}>
{"built."}
</span>
</h2>
{" "}
<div data-yl-steps={""} style={{"position":"relative","display":"flex","flexDirection":"column","gap":"18px"}}>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","left":"23px","top":"24px","bottom":"24px","width":"2px","background":"var(--yl-line, #E4E7EC)"}}>
<div data-yl-line={""} style={{"width":"100%","height":"0%","background":"linear-gradient(180deg, #6E96FF, #2A62F5)","boxShadow":"0 0 12px rgba(42,98,245,0.8)"}}>

</div>
</div>
{" "}
<div data-yl-reveal={"0"} style={{"position":"relative","display":"grid","gridTemplateColumns":"48px minmax(0, 1fr)","gap":"clamp(14px, 3vw, 28px)","alignItems":"start"}}>
{" "}
<span data-yl-node={""} style={{"width":"48px","height":"48px","borderRadius":"999px","display":"grid","placeItems":"center","background":"var(--yl-scard, #F6F7F9)","border":"1px solid var(--yl-line, #E4E7EC)","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"19px","color":"#6E96FF","transition":"all 600ms cubic-bezier(.16,1,.3,1)"}}>
{"01"}
</span>
{" "}
<div style={{"padding":"22px 24px","borderRadius":"24px","background":"var(--yl-card, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)","backdropFilter":"blur(16px)","WebkitBackdropFilter":"blur(16px)"}}>
<div style={{"fontSize":"21px","fontWeight":"500","letterSpacing":"0"}}>
{"Process review"}
</div>
<div style={{"marginTop":"8px","fontSize":"16px","lineHeight":"1.55","color":"var(--yl-sub, #5B6272)"}}>
{"Mapped how each production team prepared orders for print."}
</div>
</div>
{" "}
</div>
{" "}
<div data-yl-reveal={"0"} style={{"position":"relative","display":"grid","gridTemplateColumns":"48px minmax(0, 1fr)","gap":"clamp(14px, 3vw, 28px)","alignItems":"start"}}>
{" "}
<span data-yl-node={""} style={{"width":"48px","height":"48px","borderRadius":"999px","display":"grid","placeItems":"center","background":"var(--yl-scard, #F6F7F9)","border":"1px solid var(--yl-line, #E4E7EC)","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"19px","color":"#6E96FF","transition":"all 600ms cubic-bezier(.16,1,.3,1)"}}>
{"02"}
</span>
{" "}
<div style={{"padding":"22px 24px","borderRadius":"24px","background":"var(--yl-card, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)","backdropFilter":"blur(16px)","WebkitBackdropFilter":"blur(16px)"}}>
<div style={{"fontSize":"21px","fontWeight":"500","letterSpacing":"0"}}>
{"Batch automation"}
</div>
<div style={{"marginTop":"8px","fontSize":"16px","lineHeight":"1.55","color":"var(--yl-sub, #5B6272)"}}>
{"Connected Shopify, Make, Dropbox, Google Sheets and Slack. The team submits a batch; the system checks orders, finds the artwork and validates files and quantities."}
</div>
</div>
{" "}
</div>
{" "}
<div data-yl-reveal={"0"} style={{"position":"relative","display":"grid","gridTemplateColumns":"48px minmax(0, 1fr)","gap":"clamp(14px, 3vw, 28px)","alignItems":"start"}}>
{" "}
<span data-yl-node={""} style={{"width":"48px","height":"48px","borderRadius":"999px","display":"grid","placeItems":"center","background":"var(--yl-scard, #F6F7F9)","border":"1px solid var(--yl-line, #E4E7EC)","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"19px","color":"#6E96FF","transition":"all 600ms cubic-bezier(.16,1,.3,1)"}}>
{"03"}
</span>
{" "}
<div style={{"padding":"22px 24px","borderRadius":"24px","background":"var(--yl-card, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)","backdropFilter":"blur(16px)","WebkitBackdropFilter":"blur(16px)"}}>
<div style={{"fontSize":"21px","fontWeight":"500","letterSpacing":"0"}}>
{"Smart sorting"}
</div>
<div style={{"marginTop":"8px","fontSize":"16px","lineHeight":"1.55","color":"var(--yl-sub, #5B6272)"}}>
{"Files land in production folders by print size and roll. Handles multi-picture sets, multiple copies, framed and unframed, and separates items that need manual sizing."}
</div>
</div>
{" "}
</div>
{" "}
<div data-yl-reveal={"0"} style={{"position":"relative","display":"grid","gridTemplateColumns":"48px minmax(0, 1fr)","gap":"clamp(14px, 3vw, 28px)","alignItems":"start"}}>
{" "}
<span data-yl-node={""} style={{"width":"48px","height":"48px","borderRadius":"999px","display":"grid","placeItems":"center","background":"var(--yl-scard, #F6F7F9)","border":"1px solid var(--yl-line, #E4E7EC)","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"19px","color":"#6E96FF","transition":"all 600ms cubic-bezier(.16,1,.3,1)"}}>
{"04"}
</span>
{" "}
<div style={{"padding":"22px 24px","borderRadius":"24px","background":"var(--yl-card, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)","backdropFilter":"blur(16px)","WebkitBackdropFilter":"blur(16px)"}}>
<div style={{"fontSize":"21px","fontWeight":"500","letterSpacing":"0"}}>
{"Packing slips and alerts"}
</div>
<div style={{"marginTop":"8px","fontSize":"16px","lineHeight":"1.55","color":"var(--yl-sub, #5B6272)"}}>
{"Packing-slip PDFs are generated automatically, and Slack tells the team when images and slips are ready."}
</div>
</div>
{" "}
</div>
{" "}
<div data-yl-reveal={"0"} style={{"position":"relative","display":"grid","gridTemplateColumns":"48px minmax(0, 1fr)","gap":"clamp(14px, 3vw, 28px)","alignItems":"start"}}>
{" "}
<span data-yl-node={""} style={{"width":"48px","height":"48px","borderRadius":"999px","display":"grid","placeItems":"center","background":"var(--yl-scard, #F6F7F9)","border":"1px solid var(--yl-line, #E4E7EC)","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"19px","color":"#6E96FF","transition":"all 600ms cubic-bezier(.16,1,.3,1)"}}>
{"05"}
</span>
{" "}
<div style={{"padding":"22px 24px","borderRadius":"24px","background":"var(--yl-card, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)","backdropFilter":"blur(16px)","WebkitBackdropFilter":"blur(16px)"}}>
<div style={{"fontSize":"21px","fontWeight":"500","letterSpacing":"0"}}>
{"Safety nets"}
</div>
<div style={{"marginTop":"8px","fontSize":"16px","lineHeight":"1.55","color":"var(--yl-sub, #5B6272)"}}>
{"Duplicate protection, SKU exclusions for in-stock items, warnings for changed or removed items and mismatched files, plus recovery checks to resume interrupted work."}
</div>
</div>
{" "}
</div>
{" "}
<div data-yl-reveal={"0"} style={{"position":"relative","display":"grid","gridTemplateColumns":"48px minmax(0, 1fr)","gap":"clamp(14px, 3vw, 28px)","alignItems":"start"}}>
{" "}
<span data-yl-node={""} style={{"width":"48px","height":"48px","borderRadius":"999px","display":"grid","placeItems":"center","background":"var(--yl-scard, #F6F7F9)","border":"1px solid var(--yl-line, #E4E7EC)","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"19px","color":"#6E96FF","transition":"all 600ms cubic-bezier(.16,1,.3,1)"}}>
{"06"}
</span>
{" "}
<div style={{"padding":"22px 24px","borderRadius":"24px","background":"var(--yl-card, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)","backdropFilter":"blur(16px)","WebkitBackdropFilter":"blur(16px)"}}>
<div style={{"fontSize":"21px","fontWeight":"500","letterSpacing":"0"}}>
{"Rolled out in three countries"}
</div>
<div style={{"marginTop":"8px","fontSize":"16px","lineHeight":"1.55","color":"var(--yl-sub, #5B6272)"}}>
{"Live across all three production locations."}
</div>
</div>
{" "}
</div>
{" "}
</div>
{" "}
</section>
{" "}
<section data-screen-label={"Before and after"} style={{"maxWidth":"1100px","margin":"0 auto","padding":"clamp(110px, 14vw, 180px) clamp(20px, 5vw, 64px) 0"}}>
{" "}
<h2 data-yl-split={"ba"} style={{"textAlign":"center","fontWeight":"500","fontSize":"clamp(40px, 5.6vw, 76px)","lineHeight":"1","letterSpacing":"0","margin":"0 0 52px"}}>
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"Before"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"&"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","letterSpacing":"0","color":"#6E96FF","paddingRight":"0.06em"}}>
{"after."}
</span>
</h2>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 320px), 1fr))","gap":"14px"}}>
{" "}
<div data-yl-reveal={"0"} style={{"padding":"clamp(22px, 3vw, 32px)","borderRadius":"28px","background":"var(--yl-card, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)","display":"flex","flexDirection":"column","gap":"14px"}}>
{" "}
<div style={{"fontSize":"14px","color":"var(--yl-sub, #5B6272)","paddingBottom":"6px"}}>
{"Before"}
</div>
{" "}
<div style={{"display":"flex","gap":"12px","alignItems":"flex-start","fontSize":"16px","lineHeight":"1.45","color":"var(--yl-sub, #5B6272)"}}>
<span style={{"flex":"none","width":"22px","height":"22px","borderRadius":"999px","border":"1px solid var(--yl-line, #E4E7EC)","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✕"}
</span>
{"Orders checked one by one"}
</div>
{" "}
<div style={{"display":"flex","gap":"12px","alignItems":"flex-start","fontSize":"16px","lineHeight":"1.45","color":"var(--yl-sub, #5B6272)"}}>
<span style={{"flex":"none","width":"22px","height":"22px","borderRadius":"999px","border":"1px solid var(--yl-line, #E4E7EC)","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✕"}
</span>
{"Artwork found and sorted by hand"}
</div>
{" "}
<div style={{"display":"flex","gap":"12px","alignItems":"flex-start","fontSize":"16px","lineHeight":"1.45","color":"var(--yl-sub, #5B6272)"}}>
<span style={{"flex":"none","width":"22px","height":"22px","borderRadius":"999px","border":"1px solid var(--yl-line, #E4E7EC)","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✕"}
</span>
{"Packing slips made manually"}
</div>
{" "}
<div style={{"display":"flex","gap":"12px","alignItems":"flex-start","fontSize":"16px","lineHeight":"1.45","color":"var(--yl-sub, #5B6272)"}}>
<span style={{"flex":"none","width":"22px","height":"22px","borderRadius":"999px","border":"1px solid var(--yl-line, #E4E7EC)","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✕"}
</span>
{"Risk of duplicates and missed files"}
</div>
{" "}
<div style={{"display":"flex","gap":"12px","alignItems":"flex-start","fontSize":"16px","lineHeight":"1.45","color":"var(--yl-sub, #5B6272)"}}>
<span style={{"flex":"none","width":"22px","height":"22px","borderRadius":"999px","border":"1px solid var(--yl-line, #E4E7EC)","display":"grid","placeItems":"center","fontSize":"11px"}}>
{"✕"}
</span>
{"Prep time grew with every order"}
</div>
{" "}
</div>
{" "}
<div data-yl-reveal={"140"} style={{"position":"relative","overflow":"hidden","padding":"clamp(22px, 3vw, 32px)","borderRadius":"28px","background":"linear-gradient(160deg, rgba(42,98,245,0.22), rgba(42,98,245,0.06))","border":"1px solid rgba(110,150,255,0.55)","boxShadow":"0 40px 90px -40px rgba(42,98,245,0.7)","display":"flex","flexDirection":"column","gap":"14px"}}>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","right":"-90px","top":"-90px","width":"260px","height":"260px","background":"radial-gradient(closest-side, rgba(110,150,255,0.35), rgba(110,150,255,0))","pointerEvents":"none"}}>

</div>
{" "}
<div style={{"position":"relative","fontSize":"14px","color":"#6E96FF","paddingBottom":"6px"}}>
{"After"}
</div>
{" "}
<div style={{"position":"relative","display":"flex","gap":"12px","alignItems":"flex-start","fontSize":"16px","lineHeight":"1.45","fontWeight":"500"}}>
<span style={{"flex":"none","width":"22px","height":"22px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","color":"#FFFFFF","display":"grid","placeItems":"center","fontSize":"11px","boxShadow":"0 0 12px rgba(42,98,245,0.6)"}}>
{"✓"}
</span>
{"Batches checked and sorted automatically"}
</div>
{" "}
<div style={{"position":"relative","display":"flex","gap":"12px","alignItems":"flex-start","fontSize":"16px","lineHeight":"1.45","fontWeight":"500"}}>
<span style={{"flex":"none","width":"22px","height":"22px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","color":"#FFFFFF","display":"grid","placeItems":"center","fontSize":"11px","boxShadow":"0 0 12px rgba(42,98,245,0.6)"}}>
{"✓"}
</span>
{"Folders ready by print size and roll"}
</div>
{" "}
<div style={{"position":"relative","display":"flex","gap":"12px","alignItems":"flex-start","fontSize":"16px","lineHeight":"1.45","fontWeight":"500"}}>
<span style={{"flex":"none","width":"22px","height":"22px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","color":"#FFFFFF","display":"grid","placeItems":"center","fontSize":"11px","boxShadow":"0 0 12px rgba(42,98,245,0.6)"}}>
{"✓"}
</span>
{"Packing slips and Slack alerts generated"}
</div>
{" "}
<div style={{"position":"relative","display":"flex","gap":"12px","alignItems":"flex-start","fontSize":"16px","lineHeight":"1.45","fontWeight":"500"}}>
<span style={{"flex":"none","width":"22px","height":"22px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","color":"#FFFFFF","display":"grid","placeItems":"center","fontSize":"11px","boxShadow":"0 0 12px rgba(42,98,245,0.6)"}}>
{"✓"}
</span>
{"Duplicates and mismatches caught early"}
</div>
{" "}
<div style={{"position":"relative","display":"flex","gap":"12px","alignItems":"flex-start","fontSize":"16px","lineHeight":"1.45","fontWeight":"500"}}>
<span style={{"flex":"none","width":"22px","height":"22px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","color":"#FFFFFF","display":"grid","placeItems":"center","fontSize":"11px","boxShadow":"0 0 12px rgba(42,98,245,0.6)"}}>
{"✓"}
</span>
{"Volume grows without the same manual work"}
</div>
{" "}
</div>
{" "}
</div>
{" "}
</section>
{" "}
</div>
{" "}
<section data-screen-label={"Value"} style={{"maxWidth":"1000px","margin":"0 auto","padding":"clamp(110px, 14vw, 180px) clamp(20px, 5vw, 64px) 0","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","gap":"28px"}}>
{" "}
<div data-yl-reveal={"0"} style={{"fontSize":"14px","color":"#5B6272"}}>
{"The value"}
</div>
{" "}
<p data-yl-reveal={"100"} style={{"margin":"0","fontWeight":"500","fontSize":"clamp(30px, 4.2vw, 54px)","lineHeight":"1.12","letterSpacing":"0"}}>
{"The team now spends its time "}
<span style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5","letterSpacing":"0"}}>
{"producing and shipping orders,"}
</span>
{" not preparing them."}
</p>
{" "}
<div data-yl-reveal={"220"} style={{"display":"flex","flexWrap":"wrap","justifyContent":"center","gap":"8px","marginTop":"12px"}}>
{" "}
<span style={{"display":"inline-flex","alignItems":"center","gap":"8px","padding":"9px 16px","borderRadius":"999px","background":"#FFFFFF","border":"1px solid #E4E7EC","fontSize":"14px","fontWeight":"500"}}>
<AppBrand name="Shopify" />
</span>
{" "}
<span style={{"display":"inline-flex","alignItems":"center","gap":"8px","padding":"9px 16px","borderRadius":"999px","background":"#FFFFFF","border":"1px solid #E4E7EC","fontSize":"14px","fontWeight":"500"}}>
<AppBrand name="Make" />
</span>
{" "}
<span style={{"display":"inline-flex","alignItems":"center","gap":"8px","padding":"9px 16px","borderRadius":"999px","background":"#FFFFFF","border":"1px solid #E4E7EC","fontSize":"14px","fontWeight":"500"}}>
<AppBrand name="Dropbox" />
</span>
{" "}
<span style={{"display":"inline-flex","alignItems":"center","gap":"8px","padding":"9px 16px","borderRadius":"999px","background":"#FFFFFF","border":"1px solid #E4E7EC","fontSize":"14px","fontWeight":"500"}}>
<AppBrand name="Google Sheets" />
</span>
{" "}
<span style={{"display":"inline-flex","alignItems":"center","gap":"8px","padding":"9px 16px","borderRadius":"999px","background":"#FFFFFF","border":"1px solid #E4E7EC","fontSize":"14px","fontWeight":"500"}}>
<AppBrand name="Slack" />
</span>
{" "}
</div>
{" "}
</section>
{" "}
<section data-screen-label={"Next project"} style={{"maxWidth":"1200px","margin":"0 auto","padding":"clamp(110px, 14vw, 180px) clamp(20px, 5vw, 64px) 0"}}>
{" "}
<a data-yl-reveal={"0"} href={"/projects/colliers-catering"} style={{"position":"relative","overflow":"hidden","display":"flex","flexWrap":"wrap","justifyContent":"space-between","alignItems":"flex-end","gap":"24px","padding":"clamp(28px, 4vw, 48px)","borderRadius":"32px","background":"linear-gradient(160deg, #0D1321, #131B2E 60%, #1B2C66)","color":"#FFFFFF","boxShadow":"0 50px 90px -50px rgba(13,19,33,0.7)","transition":"transform 600ms cubic-bezier(.16,1,.3,1)"}} className={"yl-hover-73"}>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","right":"8%","top":"-40%","width":"420px","height":"420px","background":"radial-gradient(closest-side, rgba(42,98,245,0.55), rgba(42,98,245,0))","pointerEvents":"none"}}>

</div>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","right":"18%","top":"18%","width":"64px","height":"64px","borderRadius":"50%","background":"radial-gradient(circle at 32% 28%, #FFFFFF 0%, #D6E2FF 9%, #7FA2FF 30%, #2A62F5 56%, #163599 84%, #0B1A5C 100%)","boxShadow":"inset -6px -8px 16px rgba(6,14,50,0.4), 0 20px 40px -12px rgba(42,98,245,0.7)"}}>

</div>
{" "}
<div style={{"position":"relative"}}>
<div style={{"fontSize":"14px","color":"#A8B1C4"}}>
{"Next project"}
</div>
<div style={{"marginTop":"10px","fontWeight":"500","fontSize":"clamp(40px, 6vw, 84px)","lineHeight":"1","letterSpacing":"0"}}>
{"Colliers Catering"}
</div>
<div style={{"marginTop":"12px","fontSize":"16px","color":"#A8B1C4"}}>
{"CRM + lead gen"}
</div>
</div>
{" "}
<span style={{"position":"relative","flex":"none","width":"64px","height":"64px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.45), 0 14px 30px -10px rgba(42,98,245,0.8)","display":"grid","placeItems":"center","fontSize":"22px"}}>
{"→"}
</span>
{" "}
</a>
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
{"Want"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"results"}
</span>
<br  />
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5","letterSpacing":"0","paddingRight":"0.06em"}}>
{"like"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5","letterSpacing":"0","paddingRight":"0.06em"}}>
{"these?"}
</span>
</h2>
{" "}
<BookingLink data-yl-reveal={"300"} style={{"marginTop":"40px","border":"0","cursor":"pointer","font":"inherit","fontSize":"16px","fontWeight":"500","display":"inline-flex","alignItems":"center","gap":"12px","padding":"8px 8px 8px 24px","borderRadius":"999px","position":"relative","overflow":"hidden","isolation":"isolate","background":"linear-gradient(180deg, #2B3550 0%, #131B2E 55%, #0B1120 100%)","color":"#FFFFFF","transition":"transform 400ms cubic-bezier(.16,1,.3,1)","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -2px 0 rgba(0,0,0,0.35), 0 0 0 1px #0B1120, 0 2px 4px rgba(13,19,33,0.22), 0 12px 26px -10px rgba(13,19,33,0.6)"}} className={"yl-hover-74"}>
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
<BrandLogo />
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
