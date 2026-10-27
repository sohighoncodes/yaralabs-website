"use client";
import React from "react";
import AppBrand from "../AppBrand";
import BookingDialog from "../BookingDialog";
import SiteNav from "../SiteNav";

const EASE = 'cubic-bezier(.16,1,.3,1)';
const DARK = { ink: [[13,19,33,1],[243,245,250,1]], sub: [[91,98,114,1],[168,177,196,1]], line: [[228,231,236,1],[255,255,255,0.12]], frame: [[255,255,255,1],[22,30,52,0.75]] };
const ART = ['linear-gradient(135deg, #FFB37A, #F07A3C)', 'linear-gradient(135deg, #9DB7FF, #2A62F5)', 'linear-gradient(135deg, #C7B8FF, #765CFF)', 'linear-gradient(135deg, #B7E9CD, #22B26B)', 'linear-gradient(135deg, #FFE6D2, #FFB37A)'];
const USMD_APPS = [['Jotform', '#FF6100'], ['SignNow', '#2A62F5'], ['monday.com', '#FF3D57'], ['ActiveCampaign', '#356AE6'], ['Stripe', '#635BFF'], ['Wix', '#0D1321']];
const ORDERS = [['#4821', 'Set of 3 · 50×70', 2, 3], ['#4822', 'Framed · A3', 0, 1], ['#4823', '2 copies · A2', 1, 2], ['#4824', 'Unframed · A3', 0, 1]];
const cl = (v) => Math.min(1, Math.max(0, v));

export default class DesignPage extends React.Component {
  state = { tick: 0, scrolled: false, compactNav: false, bookOpen: false, sent: false };
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
    this.io && this.io.disconnect();
  }
  scrollTick() {
    const vh = window.innerHeight, patch = {};
    const scrolled = window.scrollY > 24; if (scrolled !== this.state.scrolled) patch.scrolled = scrolled;
    const compactNav = window.innerWidth < 900; if (compactNav !== this.state.compactNav) patch.compactNav = compactNav;
    if (Object.keys(patch).length) this.setState(patch);
    const z = this.zoneRef.current, d = this.darkRef.current;
    if (z && d) {
      const r = z.getBoundingClientRect();
      const p = Math.min(cl((vh * 0.75 - r.top) / (vh * 0.45)), cl((r.bottom - vh * 0.35) / (vh * 0.4)));
      d.style.opacity = p.toFixed(3);
      for (const k in DARK) { const [a, b] = DARK[k]; const c = a.map((v, i) => v + (b[i] - v) * p); z.style.setProperty('--yl-' + k, `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${c[3].toFixed(3)})`); }
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
      bookOpen: this.state.bookOpen, sent: this.state.sent, notSent: !this.state.sent,
      openBook: () => this.setState({ bookOpen: true, sent: false }),
      closeBook: () => this.setState({ bookOpen: false }),
      send: () => this.setState({ sent: true }),
      stop: (e) => e.stopPropagation()
    };
  }

render() { const {c1,u,k,darkRef,zoneRef,projCols,projColsAlt,altOrder,tiltMove,tiltLeave,bookOpen,openBook,closeBook} = this.renderVals(); return (<>{" "}

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
<SiteNav onBook={openBook} scrolled={this.state.scrolled} />
{" "}
<header data-screen-label={"Projects hero"} style={{"position":"relative","maxWidth":"1200px","margin":"0 auto","padding":"clamp(150px, 18vw, 210px) clamp(20px, 5vw, 64px) clamp(40px, 6vw, 80px)","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center"}}>
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
<div data-yl-reveal={"0"} style={{"position":"relative","zIndex":"1","display":"inline-flex","alignItems":"center","gap":"10px","padding":"5px 14px 5px 5px","borderRadius":"999px","background":"rgba(255,255,255,0.8)","border":"1px solid #E4E7EC","fontSize":"13px","color":"#3A4252"}}>
{" "}
<span style={{"padding":"3px 10px","borderRadius":"999px","background":"#2A62F5","color":"#FFFFFF","fontWeight":"500","fontSize":"12px"}}>
{"Projects"}
</span>
<span style={{"whiteSpace":"nowrap"}}>
{"Recent client work"}
</span>
{" "}
</div>
{" "}
<h1 data-yl-split={"hero"} style={{"position":"relative","zIndex":"1","fontWeight":"500","fontSize":"clamp(54px, 9vw, 128px)","lineHeight":"0.96","letterSpacing":"0","margin":"28px 0 0"}}>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"Selected"}
</span>
<br  />
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","letterSpacing":"0","color":"#2A62F5","paddingRight":"0.06em"}}>
{"work."}
</span>
{" "}
</h1>
{" "}
<p data-yl-reveal={"420"} style={{"position":"relative","zIndex":"1","fontSize":"clamp(17px, 1.5vw, 19px)","lineHeight":"1.5","maxWidth":"40ch","margin":"28px 0 0","color":"#5B6272"}}>
{"Three systems we've built for clients, and what changed after."}
</p>
{" "}
</header>
{" "}
<div ref={(zoneRef)} style={{"color":"var(--yl-ink, #0D1321)","paddingBottom":"clamp(120px, 14vw, 200px)"}}>
{" "}
<section data-screen-label={"Project list"} style={{"maxWidth":"1200px","margin":"0 auto","padding":"clamp(60px, 8vw, 110px) clamp(16px, 4vw, 48px) 0","display":"flex","flexDirection":"column","gap":"clamp(100px, 14vw, 200px)"}}>
{" "}
<article data-screen-label={"Project 01"} style={{"display":"grid","gridTemplateColumns":(projCols),"gap":"clamp(28px, 4vw, 64px)","alignItems":"start"}}>
{" "}
<div data-yl-rise={""} style={{"perspective":"1400px","transformOrigin":"50% 100%"}}>
{" "}
<div onPointerMove={(tiltMove)} onPointerLeave={(tiltLeave)} style={{"position":"relative"}}>
{" "}
<div data-yl-tilt={""} style={{"position":"relative","aspectRatio":"16 / 11","padding":"10px","boxSizing":"border-box","borderRadius":"30px","background":"var(--yl-frame, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)","boxShadow":"0 60px 100px -50px rgba(42,98,245,0.55), 0 30px 60px -40px rgba(7,11,22,0.6)","transformStyle":"preserve-3d"}}>
{" "}
<div style={{"position":"relative","width":"100%","height":"100%","borderRadius":"22px","overflow":"hidden","containerType":"inline-size","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)"}}>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","inset":"0","color":"#0D1321","fontSize":"1.8cqw","lineHeight":"1.3"}}>
{" "}
<div style={{"position":"absolute","left":"5%","top":"8%","width":"36%","padding":"2.2cqw","display":"flex","flexDirection":"column","gap":"1.2cqw","borderRadius":"1.8cqw","background":"#FFFFFF","boxShadow":"0 2.4cqw 5cqw -2.4cqw rgba(13,19,33,0.35)","boxSizing":"border-box"}}>
{" "}
<div >
<div style={{"fontWeight":"500","fontSize":"2.3cqw"}}>
{"Get a quote"}
</div>
<div style={{"fontSize":"1.4cqw","color":"#8A91A0"}}>
{"colliers.net.au"}
</div>
</div>
{" "}
<div style={{"padding":"1.1cqw 1.3cqw","borderRadius":"1.1cqw","background":"#F3F5F9","border":"1px solid " + String(c1.f1b),"color":(c1.nameC),"transition":"all 800ms cubic-bezier(.16,1,.3,1)"}}>
{(c1.name)}
</div>
{" "}
<div style={{"padding":"1.1cqw 1.3cqw","borderRadius":"1.1cqw","background":"#F3F5F9","border":"1px solid " + String(c1.f2b),"color":(c1.evC),"transition":"all 800ms cubic-bezier(.16,1,.3,1)"}}>
{(c1.event)}
</div>
{" "}
<div style={{"padding":"1.1cqw 1.3cqw","borderRadius":"1.1cqw","background":"#F3F5F9","border":"1px solid " + String(c1.f2b),"color":(c1.evC),"transition":"all 800ms cubic-bezier(.16,1,.3,1)"}}>
{(c1.guests)}
</div>
{" "}
<div style={{"padding":"1.2cqw","borderRadius":"999px","background":(c1.btn),"color":"#FFFFFF","textAlign":"center","fontWeight":"500","transform":(c1.btnT),"boxShadow":"0 1.2cqw 2.4cqw -1cqw rgba(42,98,245,0.7)","transition":"all 800ms cubic-bezier(.16,1,.3,1)"}}>
{"Request quote"}
</div>
{" "}
</div>
{" "}
<div style={{"position":"absolute","right":"5%","top":"8%","width":"50%","height":"54%","padding":"2cqw","display":"flex","flexDirection":"column","gap":"1.4cqw","borderRadius":"1.8cqw","background":"#FFFFFF","boxShadow":"0 2.4cqw 5cqw -2.4cqw rgba(13,19,33,0.35)","boxSizing":"border-box"}}>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","alignItems":"center"}}>
<span style={{"fontWeight":"500","fontSize":"2.1cqw"}}>
{"Pipeline"}
</span>
<span style={{"padding":"0.4cqw 1cqw","borderRadius":"999px","background":"#EEF3FF","color":"#2A62F5","fontSize":"1.3cqw"}}>
{"GoHighLevel · " + String(c1.leads) + " leads"}
</span>
</div>
{" "}
<div style={{"position":"relative","flex":"1","display":"grid","gridTemplateColumns":"repeat(3, minmax(0, 1fr))","gap":"1cqw"}}>
{" "}
<div style={{"display":"flex","flexDirection":"column","gap":"0.9cqw"}}>
<span style={{"fontSize":"1.4cqw","color":"#5B6272"}}>
{"New"}
</span>
<span style={{"height":"4.4cqw","borderRadius":"1cqw","background":"#F3F5F9"}}>

</span>
<span style={{"height":"4.4cqw","borderRadius":"1cqw","background":"#F3F5F9"}}>

</span>
</div>
{" "}
<div style={{"display":"flex","flexDirection":"column","gap":"0.9cqw"}}>
<span style={{"fontSize":"1.4cqw","color":"#5B6272"}}>
{"Quote sent"}
</span>
<span style={{"height":"4.4cqw","borderRadius":"1cqw","background":"#F3F5F9"}}>

</span>
</div>
{" "}
<div style={{"display":"flex","flexDirection":"column","gap":"0.9cqw"}}>
<span style={{"fontSize":"1.4cqw","color":"#5B6272"}}>
{"Won"}
</span>
<span style={{"height":"4.4cqw","borderRadius":"1cqw","background":"#F3F5F9"}}>

</span>
<span style={{"height":"4.4cqw","borderRadius":"1cqw","background":"#F3F5F9"}}>

</span>
</div>
{" "}
<div style={{"position":"absolute","left":(c1.leadX),"top":"3cqw","width":"31.5%","padding":"1cqw 1.2cqw","boxSizing":"border-box","borderRadius":"1cqw","background":(c1.leadBg),"color":"#FFFFFF","opacity":(c1.leadOp),"boxShadow":"0 1.4cqw 2.6cqw -1cqw rgba(42,98,245,0.7)","transition":"left 900ms cubic-bezier(.16,1,.3,1), background 600ms ease, opacity 500ms ease"}}>
<div style={{"fontWeight":"500","fontSize":"1.5cqw"}}>
{"Sarah · Acme"}
</div>
<div style={{"fontSize":"1.2cqw","opacity":"0.85"}}>
{"Lunch for 40"}
</div>
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div style={{"position":"absolute","left":"5%","bottom":"7%","width":"44%","padding":"1.6cqw 1.8cqw","opacity":(c1.smsOp),"transform":(c1.smsT),"borderRadius":"1.8cqw","background":"#FFFFFF","boxShadow":"0 2.4cqw 5cqw -2.4cqw rgba(13,19,33,0.35)","boxSizing":"border-box","transition":"all 800ms cubic-bezier(.16,1,.3,1)"}}>
{" "}
<div style={{"display":"flex","alignItems":"center","gap":"0.8cqw","fontSize":"1.4cqw","color":"#5B6272"}}>
<span style={{"width":"1cqw","height":"1cqw","borderRadius":"999px","background":"#22B26B"}}>

</span>
{"SMS · sent in 38s"}
</div>
{" "}
<div style={{"marginTop":"0.6cqw"}}>
{"Hi Sarah, thanks! Your quote is on its way."}
</div>
{" "}
</div>
{" "}
<div style={{"position":"absolute","right":"5%","bottom":"7%","width":"40%","padding":"1.6cqw 1.8cqw","opacity":(c1.revOp),"transform":(c1.revT),"borderRadius":"1.8cqw","background":"#FFFFFF","boxShadow":"0 2.4cqw 5cqw -2.4cqw rgba(13,19,33,0.35)","boxSizing":"border-box","transition":"all 800ms cubic-bezier(.16,1,.3,1)"}}>
{" "}
<div style={{"color":"#F5A524","fontSize":"1.9cqw","letterSpacing":"0"}}>
{"★★★★★"}
</div>
{" "}
<div style={{"marginTop":"0.4cqw"}}>
<span style={{"fontWeight":"500"}}>
<span className="app-label">{"New "}<AppBrand name="Google" />{" review"}</span>
</span>
{" · “Food was amazing.”"}
</div>
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div data-yl-glare={""} aria-hidden={"true"} style={{"position":"absolute","inset":"0","borderRadius":"30px","pointerEvents":"none","opacity":"0","mixBlendMode":"soft-light","transition":"opacity 500ms ease"}}>

</div>
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div data-yl-reveal={"120"} style={{"display":"flex","flexDirection":"column","gap":"20px","minWidth":"0"}}>
{" "}
<div style={{"display":"flex","alignItems":"center","gap":"12px","fontSize":"14px","color":"var(--yl-sub, #5B6272)"}}>
<span style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"22px","color":"#6E96FF"}}>
{"01"}
</span>
<span style={{"flex":"1","height":"1px","background":"var(--yl-line, #E4E7EC)"}}>

</span>
<span >
{"of 03"}
</span>
</div>
{" "}
<div style={{"display":"flex","gap":"8px","flexWrap":"wrap"}}>
<span style={{"padding":"6px 12px","borderRadius":"999px","fontSize":"13px","background":"rgba(42,98,245,0.14)","color":"#6E96FF"}}>
{"CRM + lead gen"}
</span>
<span style={{"padding":"6px 12px","borderRadius":"999px","fontSize":"13px","border":"1px solid var(--yl-line, #E4E7EC)","color":"var(--yl-sub, #5B6272)"}}>
<span className="app-label">{"GoHighLevel · "}<AppBrand name="Google Ads" />{" · "}<AppBrand name="Meta Ads" /></span>
</span>
</div>
{" "}
<div >
<h2 style={{"margin":"0","fontWeight":"500","fontSize":"clamp(36px, 4.4vw, 58px)","lineHeight":"1","letterSpacing":"0"}}>
{"Colliers Catering"}
</h2>
<div style={{"marginTop":"10px","fontSize":"14px","color":"var(--yl-sub, #5B6272)"}}>
{"Colliers Catering · Sydney, AU"}
</div>
</div>
{" "}
<p style={{"margin":"0","fontSize":"17px","lineHeight":"1.55","color":"var(--yl-sub, #5B6272)","maxWidth":"44ch"}}>
{"A Sydney corporate caterer with plenty of loyal clients wanted to grow online. We rebuilt how leads come in, get answered and turn into orders."}
</p>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"repeat(2, minmax(0, 1fr))","gap":"10px"}}>
{" "}
<div style={{"padding":"16px 18px","borderRadius":"20px","background":"var(--yl-frame, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)"}}>
<div style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"clamp(30px, 3vw, 40px)","lineHeight":"1","color":"#6E96FF"}}>
{"~30"}
</div>
<div style={{"marginTop":"8px","fontSize":"13px","lineHeight":"1.4","color":"var(--yl-sub, #5B6272)"}}>
{"leads a month, up from 1 a quarter"}
</div>
</div>
{" "}
<div style={{"padding":"16px 18px","borderRadius":"20px","background":"var(--yl-frame, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)"}}>
<div style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"clamp(30px, 3vw, 40px)","lineHeight":"1","color":"#6E96FF"}}>
{"< 1 min"}
</div>
<div style={{"marginTop":"8px","fontSize":"13px","lineHeight":"1.4","color":"var(--yl-sub, #5B6272)"}}>
{"first reply, down from 2–3 hours"}
</div>
</div>
{" "}
</div>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 220px), 1fr))","gap":"9px 18px","fontSize":"14px","lineHeight":"1.4"}}>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Redesigned website with a Get a Quote funnel"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Chat widget that captures leads"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Instant replies plus email and SMS nurture"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Sales app synced to GHL with free webhooks"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Auto review requests after the 1st and 3rd order"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Google and Meta ads with lead-source tracking"}
</span>
{" "}
</div>
{" "}
<div style={{"display":"grid","fontSize":"15px"}}>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","gap":"20px","padding":"13px 0","borderTop":"1px solid var(--yl-line, #E4E7EC)"}}>
<span style={{"color":"var(--yl-sub, #5B6272)"}}>
{"Timeline"}
</span>
<span >
{"3 weeks"}
</span>
</div>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","gap":"20px","padding":"13px 0","borderTop":"1px solid var(--yl-line, #E4E7EC)"}}>
<span style={{"color":"var(--yl-sub, #5B6272)"}}>
{"Investment"}
</span>
<span >
{"$2,000"}
</span>
</div>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","gap":"20px","padding":"13px 0","borderTop":"1px solid var(--yl-line, #E4E7EC)","borderBottom":"1px solid var(--yl-line, #E4E7EC)"}}>
<span style={{"color":"var(--yl-sub, #5B6272)"}}>
{"Website"}
</span>
<a href={"https://www.colliers.net.au/"} target={"_blank"} rel={"noopener noreferrer"} style={{"color":"#6E96FF"}} className={"yl-hover-46"}>
{"colliers.net.au ↗"}
</a>
</div>
{" "}
</div>
{" "}
<a href={"/projects/colliers-catering"} style={{"alignSelf":"flex-start","display":"inline-flex","alignItems":"center","gap":"10px","padding":"12px 20px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","color":"#FFFFFF","fontSize":"15px","fontWeight":"500","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.18), 0 12px 26px -10px rgba(42,98,245,0.7)","transition":"transform 400ms cubic-bezier(.16,1,.3,1)"}} className={"yl-hover-47"}>
{"Read case study →"}
</a>
{" "}
</div>
{" "}
</article>
{" "}
<article data-screen-label={"Project 02"} style={{"display":"grid","gridTemplateColumns":(projColsAlt),"gap":"clamp(28px, 4vw, 64px)","alignItems":"start"}}>
{" "}
<div data-yl-rise={""} style={{"perspective":"1400px","transformOrigin":"50% 100%","order":(altOrder)}}>
{" "}
<div onPointerMove={(tiltMove)} onPointerLeave={(tiltLeave)} style={{"position":"relative"}}>
{" "}
<div data-yl-tilt={""} style={{"position":"relative","aspectRatio":"16 / 11","padding":"10px","boxSizing":"border-box","borderRadius":"30px","background":"var(--yl-frame, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)","boxShadow":"0 60px 100px -50px rgba(118,92,255,0.55), 0 30px 60px -40px rgba(7,11,22,0.6)","transformStyle":"preserve-3d"}}>
{" "}
<div style={{"position":"relative","width":"100%","height":"100%","borderRadius":"22px","overflow":"hidden","containerType":"inline-size","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)"}}>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","inset":"0","color":"#0D1321","fontSize":"1.8cqw","lineHeight":"1.3"}}>
{" "}
<div style={{"position":"absolute","left":"0","top":"0","width":"60%","height":"100%"}}>
{" "}
<div style={{"position":"absolute","left":"50%","top":"50%","width":"76%","aspectRatio":"1","transform":"translate(-50%, -50%)","borderRadius":"50%","border":"1px dashed rgba(42,98,245,0.35)"}}>

</div>
{" "}
<div data-yl-pulse={""} style={{"position":"absolute","left":"50%","top":"50%","width":"16cqw","height":"16cqw","margin":"-8cqw 0 0 -8cqw","borderRadius":"30%","background":"rgba(42,98,245,0.25)"}}>

</div>
{" "}
<div style={{"position":"absolute","left":"50%","top":"50%","width":"16cqw","height":"16cqw","margin":"-8cqw 0 0 -8cqw","borderRadius":"30%","background":"linear-gradient(160deg, #6E96FF 0%, #2A62F5 50%, #163599 100%)","boxShadow":"inset 0 0.3cqw 0 rgba(255,255,255,0.5), inset 0 -0.6cqw 1.2cqw rgba(6,14,50,0.4), 0 2.4cqw 5cqw -1.6cqw rgba(42,98,245,0.8)","color":"#FFFFFF","display":"grid","placeItems":"center","fontWeight":"600","fontSize":"3cqw","letterSpacing":"0","transform":(u.hubS),"transition":"all 800ms cubic-bezier(.16,1,.3,1)"}}>
{"GHL"}
</div>
{" "}
<div style={{"position":"absolute","left":"50%","top":"calc(50% + 10.5cqw)","transform":"translateX(-50%)","whiteSpace":"nowrap","padding":"0.6cqw 1.4cqw","borderRadius":"999px","background":"#FFFFFF","fontSize":"1.4cqw","fontWeight":"500","boxShadow":"0 1cqw 2.4cqw -1cqw rgba(13,19,33,0.3)"}}>
{(u.count)}
</div>
{" "}
{(u.chips).map((ch, itemIndex10) => <React.Fragment key={itemIndex10}>{" "}
<div style={{"position":"absolute","left":String(ch.x) + "%","top":String(ch.y) + "%","transform":"translate(-50%, -50%) scale(" + String(ch.s) + ")","opacity":(ch.o),"display":"flex","alignItems":"center","gap":"0.8cqw","whiteSpace":"nowrap","padding":"0.9cqw 1.4cqw","borderRadius":"999px","background":"#FFFFFF","fontSize":"1.5cqw","fontWeight":"500","boxShadow":"0 1.2cqw 2.6cqw -1.2cqw rgba(13,19,33,0.35)","transition":"all 1000ms cubic-bezier(.65,0,.35,1)"}}>
<AppBrand name={ch.name} />
</div>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
<div style={{"position":"absolute","right":"5%","top":"9%","width":"36%","padding":"2cqw","display":"flex","flexDirection":"column","gap":"1.1cqw","borderRadius":"1.8cqw","background":"#FFFFFF","boxShadow":"0 2.4cqw 5cqw -2.4cqw rgba(13,19,33,0.35)","boxSizing":"border-box"}}>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","alignItems":"baseline"}}>
<span style={{"fontWeight":"500","fontSize":"2cqw"}}>
{"Attestations"}
</span>
<span style={{"fontSize":"1.3cqw","color":"#8A91A0"}}>
{"March"}
</span>
</div>
{" "}
{(u.rows).map((rw, itemIndex10) => <React.Fragment key={itemIndex10}>{" "}
<div style={{"display":"flex","flexDirection":"column","gap":"0.5cqw","paddingTop":"1cqw","borderTop":"1px solid #EEF0F4"}}>
<span style={{"fontSize":"1.5cqw"}}>
{(rw.name)}
</span>
<span style={{"alignSelf":"flex-start","padding":"0.3cqw 1cqw","borderRadius":"999px","fontSize":"1.2cqw","fontWeight":"500","background":(rw.bg),"color":(rw.fg),"transition":"all 800ms cubic-bezier(.16,1,.3,1)"}}>
{(rw.st)}
</span>
</div>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
<div style={{"position":"absolute","right":"5%","bottom":"8%","width":"36%","padding":"1.6cqw 1.8cqw","opacity":(u.payOp),"transform":(u.payT),"borderRadius":"1.8cqw","background":"#FFFFFF","boxShadow":"0 2.4cqw 5cqw -2.4cqw rgba(13,19,33,0.35)","boxSizing":"border-box","transition":"all 800ms cubic-bezier(.16,1,.3,1)"}}>
{" "}
<div style={{"display":"flex","alignItems":"center","gap":"0.8cqw","fontSize":"1.4cqw","color":"#5B6272"}}>
<span style={{"width":"1.2cqw","height":"1.2cqw","borderRadius":"0.4cqw","background":"#635BFF"}}>

</span>
<span className="app-label"><AppBrand name="Stripe" />{" · payment received"}</span>
</div>
{" "}
<div style={{"marginTop":"0.5cqw"}}>
{"Client status → "}
<span style={{"color":"#22B26B","fontWeight":"500"}}>
{"Active"}
</span>
</div>
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div data-yl-glare={""} aria-hidden={"true"} style={{"position":"absolute","inset":"0","borderRadius":"30px","pointerEvents":"none","opacity":"0","mixBlendMode":"soft-light","transition":"opacity 500ms ease"}}>

</div>
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div data-yl-reveal={"120"} style={{"display":"flex","flexDirection":"column","gap":"20px","minWidth":"0"}}>
{" "}
<div style={{"display":"flex","alignItems":"center","gap":"12px","fontSize":"14px","color":"var(--yl-sub, #5B6272)"}}>
<span style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"22px","color":"#6E96FF"}}>
{"02"}
</span>
<span style={{"flex":"1","height":"1px","background":"var(--yl-line, #E4E7EC)"}}>

</span>
<span >
{"of 03"}
</span>
</div>
{" "}
<div style={{"display":"flex","gap":"8px","flexWrap":"wrap"}}>
<span style={{"padding":"6px 12px","borderRadius":"999px","fontSize":"13px","background":"rgba(42,98,245,0.14)","color":"#6E96FF"}}>
{"CRM migration"}
</span>
<span style={{"padding":"6px 12px","borderRadius":"999px","fontSize":"13px","border":"1px solid var(--yl-line, #E4E7EC)","color":"var(--yl-sub, #5B6272)"}}>
<span className="app-label">{"GoHighLevel · "}<AppBrand name="Stripe" /></span>
</span>
</div>
{" "}
<div >
<h2 style={{"margin":"0","fontWeight":"500","fontSize":"clamp(36px, 4.4vw, 58px)","lineHeight":"1","letterSpacing":"0"}}>
{"US Medical Directors"}
</h2>
<div style={{"marginTop":"10px","fontSize":"14px","color":"var(--yl-sub, #5B6272)"}}>
{"US Medical Directors · USA"}
</div>
</div>
{" "}
<p style={{"margin":"0","fontSize":"17px","lineHeight":"1.55","color":"var(--yl-sub, #5B6272)","maxWidth":"44ch"}}>
{"USMD keeps med spas compliant. Their data was spread across eight apps, with no way to see what growth spending returned. Now everything runs in one GHL account."}
</p>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"repeat(2, minmax(0, 1fr))","gap":"10px"}}>
{" "}
<div style={{"padding":"16px 18px","borderRadius":"20px","background":"var(--yl-frame, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)"}}>
<div style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"clamp(30px, 3vw, 40px)","lineHeight":"1","color":"#6E96FF"}}>
{"8+ → 1"}
</div>
<div style={{"marginTop":"8px","fontSize":"13px","lineHeight":"1.4","color":"var(--yl-sub, #5B6272)"}}>
{"apps replaced by one platform"}
</div>
</div>
{" "}
<div style={{"padding":"16px 18px","borderRadius":"20px","background":"var(--yl-frame, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)"}}>
<div style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"clamp(30px, 3vw, 40px)","lineHeight":"1","color":"#6E96FF"}}>
{"0"}
</div>
<div style={{"marginTop":"8px","fontSize":"13px","lineHeight":"1.4","color":"var(--yl-sub, #5B6272)"}}>
{"manual payment checks"}
</div>
</div>
{" "}
</div>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 220px), 1fr))","gap":"9px 18px","fontSize":"14px","lineHeight":"1.4"}}>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Moved Jotform, SignNow, Monday, ActiveCampaign, Wix and more into GHL"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Website forms create contacts and opportunities"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Attestation charts tracked and chased automatically"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Stripe payments and past-due follow-ups automated"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Google and Meta ads tracked by ad ID"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Calendars, campaigns and automated messages"}
</span>
{" "}
</div>
{" "}
<div style={{"display":"grid","fontSize":"15px"}}>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","gap":"20px","padding":"13px 0","borderTop":"1px solid var(--yl-line, #E4E7EC)"}}>
<span style={{"color":"var(--yl-sub, #5B6272)"}}>
{"Timeline"}
</span>
<span >
{"4–5 months, ongoing"}
</span>
</div>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","gap":"20px","padding":"13px 0","borderTop":"1px solid var(--yl-line, #E4E7EC)"}}>
<span style={{"color":"var(--yl-sub, #5B6272)"}}>
{"Investment"}
</span>
<span >
{"$3,000"}
</span>
</div>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","gap":"20px","padding":"13px 0","borderTop":"1px solid var(--yl-line, #E4E7EC)","borderBottom":"1px solid var(--yl-line, #E4E7EC)"}}>
<span style={{"color":"var(--yl-sub, #5B6272)"}}>
{"Website"}
</span>
<a href={"https://usmedicaldirectors.com/"} target={"_blank"} rel={"noopener noreferrer"} style={{"color":"#6E96FF"}} className={"yl-hover-48"}>
{"usmedicaldirectors.com ↗"}
</a>
</div>
{" "}
</div>
{" "}
<a href={"/projects/us-medical-directors"} style={{"alignSelf":"flex-start","display":"inline-flex","alignItems":"center","gap":"10px","padding":"12px 20px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","color":"#FFFFFF","fontSize":"15px","fontWeight":"500","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.18), 0 12px 26px -10px rgba(42,98,245,0.7)","transition":"transform 400ms cubic-bezier(.16,1,.3,1)"}} className={"yl-hover-49"}>
{"Read case study →"}
</a>
{" "}
</div>
{" "}
</article>
{" "}
<article data-screen-label={"Project 03"} style={{"display":"grid","gridTemplateColumns":(projCols),"gap":"clamp(28px, 4vw, 64px)","alignItems":"start"}}>
{" "}
<div data-yl-rise={""} style={{"perspective":"1400px","transformOrigin":"50% 100%"}}>
{" "}
<div onPointerMove={(tiltMove)} onPointerLeave={(tiltLeave)} style={{"position":"relative"}}>
{" "}
<div data-yl-tilt={""} style={{"position":"relative","aspectRatio":"16 / 11","padding":"10px","boxSizing":"border-box","borderRadius":"30px","background":"var(--yl-frame, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)","boxShadow":"0 60px 100px -50px rgba(255,150,90,0.45), 0 30px 60px -40px rgba(7,11,22,0.6)","transformStyle":"preserve-3d"}}>
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
{(k.orders).map((od, itemIndex10) => <React.Fragment key={itemIndex10}>{" "}
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
{(k.nodes).map((nd, itemIndex10) => <React.Fragment key={itemIndex10}>{" "}
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
{(k.folders).map((fd, itemIndex11) => <React.Fragment key={itemIndex11}>{" "}
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
{(fd.thumbs).map((th, itemIndex14) => <React.Fragment key={itemIndex14}><span style={{"aspectRatio":"3 / 4","borderRadius":"0.3cqw","background":(th),"boxShadow":"0 0.4cqw 0.8cqw -0.3cqw rgba(13,19,33,0.35)"}}>

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
<div data-yl-glare={""} aria-hidden={"true"} style={{"position":"absolute","inset":"0","borderRadius":"30px","pointerEvents":"none","opacity":"0","mixBlendMode":"soft-light","transition":"opacity 500ms ease"}}>

</div>
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div data-yl-reveal={"120"} style={{"display":"flex","flexDirection":"column","gap":"20px","minWidth":"0"}}>
{" "}
<div style={{"display":"flex","alignItems":"center","gap":"12px","fontSize":"14px","color":"var(--yl-sub, #5B6272)"}}>
<span style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"22px","color":"#6E96FF"}}>
{"03"}
</span>
<span style={{"flex":"1","height":"1px","background":"var(--yl-line, #E4E7EC)"}}>

</span>
<span >
{"of 03"}
</span>
</div>
{" "}
<div style={{"display":"flex","gap":"8px","flexWrap":"wrap"}}>
<span style={{"padding":"6px 12px","borderRadius":"999px","fontSize":"13px","background":"rgba(42,98,245,0.14)","color":"#6E96FF"}}>
{"Business automation"}
</span>
<span style={{"padding":"6px 12px","borderRadius":"999px","fontSize":"13px","border":"1px solid var(--yl-line, #E4E7EC)","color":"var(--yl-sub, #5B6272)"}}>
<span className="app-label"><AppBrand name="Shopify" />{" · "}<AppBrand name="Make" />{" · "}<AppBrand name="Dropbox" />{" · "}<AppBrand name="Slack" /></span>
</span>
</div>
{" "}
<div >
<h2 style={{"margin":"0","fontWeight":"500","fontSize":"clamp(36px, 4.4vw, 58px)","lineHeight":"1","letterSpacing":"0"}}>
{"Inka Arthouse"}
</h2>
<div style={{"marginTop":"10px","fontSize":"14px","color":"var(--yl-sub, #5B6272)"}}>
{"Inka Arthouse · AU, UK, US"}
</div>
</div>
{" "}
<p style={{"margin":"0","fontSize":"17px","lineHeight":"1.55","color":"var(--yl-sub, #5B6272)","maxWidth":"44ch"}}>
{"A wall-art store printing in three countries. Getting each batch ready by hand was the bottleneck. Now a batch goes from order to print-ready folders by itself."}
</p>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"repeat(2, minmax(0, 1fr))","gap":"10px"}}>
{" "}
<div style={{"padding":"16px 18px","borderRadius":"20px","background":"var(--yl-frame, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)"}}>
<div style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"clamp(30px, 3vw, 40px)","lineHeight":"1","color":"#6E96FF"}}>
{"4–5×"}
</div>
<div style={{"marginTop":"8px","fontSize":"13px","lineHeight":"1.4","color":"var(--yl-sub, #5B6272)"}}>
{"revenue growth, without more manual work"}
</div>
</div>
{" "}
<div style={{"padding":"16px 18px","borderRadius":"20px","background":"var(--yl-frame, #FFFFFF)","border":"1px solid var(--yl-line, #E4E7EC)"}}>
<div style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontSize":"clamp(30px, 3vw, 40px)","lineHeight":"1","color":"#6E96FF"}}>
{"3"}
</div>
<div style={{"marginTop":"8px","fontSize":"13px","lineHeight":"1.4","color":"var(--yl-sub, #5B6272)"}}>
{"production sites on one workflow"}
</div>
</div>
{" "}
</div>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 220px), 1fr))","gap":"9px 18px","fontSize":"14px","lineHeight":"1.4"}}>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Orders checked and matched to the right artwork"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Files sorted into folders by print size and roll"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Handles sets, copies, framed and unframed"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Packing-slip PDFs and Slack alerts generated"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Protection against duplicates, plus SKU exclusions"}
</span>
{" "}
<span style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
<span style={{"flex":"none","width":"18px","height":"18px","marginTop":"1px","borderRadius":"999px","background":"rgba(42,98,245,0.16)","color":"#6E96FF","display":"grid","placeItems":"center","fontSize":"10px"}}>
{"✓"}
</span>
{"Recovery checks so stopped batches resume cleanly"}
</span>
{" "}
</div>
{" "}
<div style={{"display":"grid","fontSize":"15px"}}>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","gap":"20px","padding":"13px 0","borderTop":"1px solid var(--yl-line, #E4E7EC)"}}>
<span style={{"color":"var(--yl-sub, #5B6272)"}}>
{"Timeline"}
</span>
<span >
{"1 month, ongoing support"}
</span>
</div>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","gap":"20px","padding":"13px 0","borderTop":"1px solid var(--yl-line, #E4E7EC)"}}>
<span style={{"color":"var(--yl-sub, #5B6272)"}}>
{"Investment"}
</span>
<span >
{"$3,000"}
</span>
</div>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","gap":"20px","padding":"13px 0","borderTop":"1px solid var(--yl-line, #E4E7EC)","borderBottom":"1px solid var(--yl-line, #E4E7EC)"}}>
<span style={{"color":"var(--yl-sub, #5B6272)"}}>
{"Website"}
</span>
<a href={"https://inkaarthouse.com/"} target={"_blank"} rel={"noopener noreferrer"} style={{"color":"#6E96FF"}} className={"yl-hover-50"}>
{"inkaarthouse.com ↗"}
</a>
</div>
{" "}
</div>
{" "}
<a href={"/projects/inka-arthouse"} style={{"alignSelf":"flex-start","display":"inline-flex","alignItems":"center","gap":"10px","padding":"12px 20px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","color":"#FFFFFF","fontSize":"15px","fontWeight":"500","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.18), 0 12px 26px -10px rgba(42,98,245,0.7)","transition":"transform 400ms cubic-bezier(.16,1,.3,1)"}} className={"yl-hover-51"}>
{"Read case study →"}
</a>
{" "}
</div>
{" "}
</article>
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
{"Your"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"project"}
</span>
<br  />
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5","letterSpacing":"0","paddingRight":"0.06em"}}>
{"next."}
</span>
</h2>
{" "}
<button type={"button"} data-yl-reveal={"300"} onClick={(openBook)} style={{"marginTop":"40px","border":"0","cursor":"pointer","font":"inherit","fontSize":"16px","fontWeight":"500","display":"inline-flex","alignItems":"center","gap":"12px","padding":"8px 8px 8px 24px","borderRadius":"999px","position":"relative","overflow":"hidden","isolation":"isolate","background":"linear-gradient(180deg, #2B3550 0%, #131B2E 55%, #0B1120 100%)","color":"#FFFFFF","transition":"transform 400ms cubic-bezier(.16,1,.3,1)","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -2px 0 rgba(0,0,0,0.35), 0 0 0 1px #0B1120, 0 2px 4px rgba(13,19,33,0.22), 0 12px 26px -10px rgba(13,19,33,0.6)"}} className={"yl-hover-52"}>
<span data-yl-shine={""} aria-hidden={"true"} style={{"position":"absolute","top":"0","bottom":"0","left":"-60%","width":"45%","zIndex":"-1","pointerEvents":"none","background":"linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)","transform":"skewX(-20deg)"}}>

</span>
{"Book a free call"}
<span style={{"width":"38px","height":"38px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.45), 0 2px 6px -1px rgba(42,98,245,0.6)","display":"grid","placeItems":"center"}}>
{"→"}
</span>
</button>
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
{bookOpen && <BookingDialog onClose={closeBook} />}
{" "}
</div>
{" "}</>); }
}
