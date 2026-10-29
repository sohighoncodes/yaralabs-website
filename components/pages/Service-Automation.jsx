"use client";
import React from "react";
import AppBrand from "../AppBrand";
import BookingLink from "../BookingLink";
import SiteNav from "../SiteNav";
import BrandLogo from "../BrandLogo";

const SVC = [ { "n": "01", "title": "Workflow audit", "line": "We find every copy-paste in your week.", "tools": [ "Mapping" ] }, { "n": "02", "title": "Zaps & scenarios", "line": "Built in Zapier or Make, whichever fits best.", "tools": [ "Zapier", "Make" ] }, { "n": "03", "title": "Custom APIs", "line": "No integration? We write one.", "tools": [ "REST", "Webhooks" ] }, { "n": "04", "title": "Monitoring", "line": "Alerts if anything fails. Fixes included.", "tools": [ "Alerts", "Docs" ] } ];
const STACK = [ "Zapier", "Make", "n8n", "Airtable", "Google Sheets", "Slack", "Stripe", "QuickBooks", "Gmail", "Notion", "Asana", "Webhooks" ];
const STEPS = [ [ "Invoice paid", "Stripe" ], [ "Client logged", "Airtable" ], [ "Folder created", "Drive" ], [ "Welcome sent", "Gmail" ], [ "Team notified", "Slack" ] ];
const LOGS = [ "stripe.paid → airtable", "drive.folder.created", "gmail.sent · welcome", "slack #ops", "form → sheet.row", "calendar.event", "quickbooks.invoice", "webhook.received", "asana.task.created", "report.emailed · Mon" ];
const STORY = [ [ "Paid", "Payment lands in Stripe." ], [ "Logged", "Records update everywhere." ], [ "Onboarded", "Welcome email and folder, done." ], [ "Reported", "Your numbers, every Monday." ] ];
const PACKAGES = [ { "name": "Single workflow", "price": "Custom", "unit": "fixed quote", "items": [ "One process, end to end", "Zapier, Make or API", "30 days of tweaks" ], "cta": "Get a quote" }, { "name": "Automation system", "price": "Custom", "unit": "fixed quote", "featured": true, "items": [ "Full workflow audit", "Connected flows", "Alerts and docs" ], "cta": "Book a call" }, { "name": "Retainer", "price": "Monthly", "unit": "to scope", "items": [ "Monitoring and fixes", "New flows as you grow", "Priority support" ], "cta": "Talk to us" } ];
const TESTIMONIALS = [];
const TQ = [{"quote":"Very skilled and amazing to work with. They untangled our CallRail, WordPress, HubSpot and GHL setup and got it all talking to each other. Our email campaigns pretty much run themselves now.","who":"Zeid Kaddoura","role":"Webology World · Australia","work":"CRM automations, email campaigns","initials":"ZK","img":"/assets/avatars/zeid-kaddoura.png"},{"quote":"Mate, our inbox used to be where leads went to die. Now they get a reply before I've even seen them, and the reviews keep rolling in. Cheers!","who":"Kenny Eu","role":"Colliers Catering · Sydney","work":"CRM, funnels, ads, reviews","initials":"KE","img":"/assets/avatars/kenny-eu.png"},{"quote":"We went from juggling eight apps to one. My team got hours of their week back, and for the first time I can actually see what our growth spend returns. Thorough, patient and always a step ahead.","who":"Dr. Aloysius Fobi","role":"US Medical Directors · USA","work":"GHL migration, ops automation","initials":"AF","img":"/assets/avatars/aloysius-fobi.png"},{"quote":"Website, funnels, lead forms, affiliates, emails, CRM… I kept adding to the list and they kept ticking it off. Absolute legends.","who":"Jordan Treloar","role":"Hugo Health · Australia","work":"Website, funnels, affiliate system, CRM","initials":"JT","img":"/assets/avatars/jordan-treloar.png"},{"quote":"Facebook ads, pipeline, intake forms, Jotform, all connected. New clients land exactly where they should without me lifting a finger. I genuinely don't know how we managed before.","who":"Atty. Elizabeth Murrar","role":"Murrar Law","work":"GHL setup, ads, intake automation","initials":"EM","img":"/assets/avatars/elizabeth-murrar.png"},{"quote":"Never thought I'd call accounting fun. Katana and Xero now post our MO and SO journals and track COGS on their own. Month-end went from dread to done.","who":"Amanda Nguyen","role":"Speedshield","work":"Katana + Xero accounting automation","initials":"AN","img":"/assets/avatars/amanda-nguyen.png"}];
const FAQS = [ [ "Zapier or Make?", "Whichever is cheaper and more reliable for your workflow." ], [ "What if an app has no integration?", "We connect it directly through its API." ], [ "What if something breaks?", "Alerts tell us first. Fixes are included for 30 days." ], [ "Will it get expensive to run?", "We design for low usage and tell you running costs upfront." ], [ "Do I own it?", "Yes. Everything runs in your accounts." ] ];
const OTHER = [ { "n": "02", "title": "AI agents", "line": "AI that reads, sorts and replies for you.", "href": "/services/ai-agents", "delay": 0 }, { "n": "03", "title": "CRM setup", "line": "GoHighLevel or HubSpot, set up the way you sell.", "href": "/services/crm", "delay": 100 }, { "n": "04", "title": "Custom apps", "line": "Portals and tools, built fast.", "href": "/services/custom-apps", "delay": 200 } ];
const EASE = 'cubic-bezier(.16,1,.3,1)';

export default class DesignPage extends React.Component {
  state = { step: 0, log: [], open: -1, openFaq: 0, story: 0, storyPct: 0, scrolled: false, pulse: true };
  heroOuter = React.createRef(); heroInner = React.createRef(); storyRef = React.createRef();
  motion() { return (this.props.motion ?? 'Full') !== 'Off' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  componentDidMount() {
    const now = Date.now(); this.li = 8;
    this.setState({ log: Array.from({ length: 8 }, (_, i) => ({ ts: now - (8 - i) * 3000, msg: LOGS[i] })) });
    this.t1 = this.motion() && setInterval(() => this.setState(s => ({ step: (s.step + 1) % 9, pulse: !s.pulse })), 950);
    this.t2 = this.motion() && setInterval(() => this.setState(s => ({ log: [...s.log.slice(1), { ts: Date.now(), msg: LOGS[this.li++ % LOGS.length] }] })), 1800);
    this.onScroll = () => { if (!this.raf) this.raf = requestAnimationFrame(() => { this.raf = 0; this.scrollTick(); }); };
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll);
    requestAnimationFrame(() => { this.animate(); this.scrollTick(); });
  }
  componentWillUnmount() {
    clearInterval(this.t1); clearInterval(this.t2);
    window.removeEventListener('scroll', this.onScroll); window.removeEventListener('resize', this.onScroll);
    this.io && this.io.disconnect(); this.mq && this.mq.cancel();
  }
  scrollTick() {
    const vh = window.innerHeight;
    const scrolled = window.scrollY > 24;
    const patch = {};
    if (scrolled !== this.state.scrolled) patch.scrolled = scrolled;
    const sec = this.storyRef.current;
    if (sec) {
      const r = sec.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - vh)));
      const idx = Math.min(STORY.length - 1, Math.floor(p * STORY.length));
      if (idx !== this.state.story) patch.story = idx;
      const pct = Math.round(p * 100);
      if (pct !== this.state.storyPct) patch.storyPct = pct;
    }
    const narrow = window.innerWidth < 720;
    if (narrow !== this.state.narrow) patch.narrow = narrow;
    const compactNav = window.innerWidth < 900;
    if (compactNav !== this.state.compactNav) patch.compactNav = compactNav;
    if (Object.keys(patch).length) this.setState(patch);
    const o = this.heroOuter.current;
    if (o && this.motion()) {
      const r = o.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - (r.top - vh * 0.3) / (vh * 0.6)));
      o.style.transform = `scale(${(0.9 + 0.1 * p).toFixed(4)}) rotateX(${((1 - p) * 14).toFixed(2)}deg)`;
    }
  }
  animate() {
    if (!this.motion()) return;
    const full = (this.props.motion ?? 'Full') === 'Full';
    const words = (root, base) => root.querySelectorAll('[data-yl-word]').forEach((w, i) => w.animate(
      [{ opacity: 0, filter: full ? 'blur(16px)' : 'none', transform: 'translateY(0.35em)' }, { opacity: 1, filter: 'blur(0px)', transform: 'none' }],
      { duration: 1200, delay: base + i * 90, easing: EASE, fill: 'both' }));
    const hide = (el) => { el._ylHide = el.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 1, fill: 'forwards' }); };
    const hero = document.querySelector('[data-yl-split="hero"]');
    if (hero) words(hero, 150);
    const reveal = (el) => { const a = el.animate(
      [{ opacity: 0, filter: full ? 'blur(10px)' : 'none', transform: 'translateY(32px)' }, { opacity: 1, filter: 'blur(0px)', transform: 'none' }],
      { duration: 1100, delay: +el.dataset.ylReveal || 0, easing: EASE, fill: 'both' }); el._ylHide && el._ylHide.cancel(); a.onfinish = () => a.cancel(); };
    this.io = new IntersectionObserver((entries) => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      if (el.dataset.ylSplit) words(el, 0); else reveal(el);
      this.io.unobserve(el);
    }), { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('[data-yl-split]:not([data-yl-split="hero"])').forEach(el => { el.querySelectorAll('[data-yl-word]').forEach(hide); this.io.observe(el); });
    document.querySelectorAll('[data-yl-reveal]').forEach(el => { hide(el); this.io.observe(el); });
    document.querySelectorAll('[data-yl-shine]').forEach((el, i) => el.animate([{ left: '-60%', offset: 0 }, { left: '130%', offset: 0.3 }, { left: '130%', offset: 1 }], { duration: 4200, delay: 900 + i * 260, iterations: Infinity, easing: 'cubic-bezier(.45,0,.2,1)' }));
    document.querySelectorAll('[data-yl-col]').forEach((el, i) => { const k = [{ transform: 'translateY(0)' }, { transform: 'translateY(calc(-50% - 8px))' }]; el.animate(el.dataset.ylCol === 'down' ? k.reverse() : k, { duration: 42000 + i * 7000, iterations: Infinity }); });
    const m = document.querySelector('[data-yl-marquee]');
    if (m) this.mq = m.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(calc(-50% - 6px))' }], { duration: 50000, iterations: Infinity });
  }
  renderVals() {
    const { step, open, openFaq, story, scrolled } = this.state;
    const fmt = (ts) => new Date(ts).toTimeString().slice(0, 8);
    const vis = (i) => {
      const d = i - story;
      return d === 0 ? { op: 1, tf: 'none', fl: 'blur(0px)' } : { op: 0, tf: `translateY(${d > 0 ? 40 : -40}px) scale(0.94)`, fl: 'blur(12px)' };
    };
    return {
      navLinksDisplay: this.state.compactNav ? 'none' : 'flex',
      navBg: scrolled ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.4)',
      navBorder: scrolled ? '#E4E7EC' : 'rgba(228,231,236,0.5)',
      navShadow: scrolled ? '0 10px 30px -12px rgba(13,19,33,0.18)' : 'none',
      heroOuter: this.heroOuter, heroInner: this.heroInner, storyRef: this.storyRef,
      tilt: (e) => { const el = this.heroInner.current; if (!el || !this.motion()) return; const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; el.style.transform = `rotateY(${(x * 4).toFixed(2)}deg) rotateX(${(-y * 4).toFixed(2)}deg)`; },
      untilt: () => { const el = this.heroInner.current; if (el) el.style.transform = 'none'; },
      consoleStatus: step >= STEPS.length ? 'Running 24/7' : 'Automating…',
      pulse: this.state.pulse ? 1 : 0.25,
      steps: STEPS.map(([text, tool], i) => { const done = i < step, cur = i === step; return { text, tool, op: done || cur ? 1 : 0.35, x: done || cur ? 0 : 8, bg: cur ? '#F1F5FF' : 'transparent', dotBg: done ? '#2A62F5' : '#D5DBE5' }; }),
      log: this.state.log.map((l, i, a) => ({ t: fmt(l.ts), msg: l.msg, op: 0.25 + 0.75 * (i / (a.length - 1 || 1)) })),
      stackLoop: [...STACK, ...STACK],
      index: SVC.map((s, i) => ({ ...s, delay: i * 90, rows: open === i ? '1fr' : '0fr', op: open === i ? 1 : 0, blur: open === i ? 0 : 8, rot: open === i ? 45 : 0, x: open === i ? 12 : 0,
        btnBg: open === i ? '#2A62F5' : '#FFFFFF', btnFg: open === i ? '#FFFFFF' : '#0D1321',
        toggle: () => this.setState(st => ({ open: st.open === i ? -1 : i })) })),
      story: STORY.map(([title, line], i) => ({ title, line, op: i === story ? 1 : 0.32, rows: i === story ? '1fr' : '0fr',
        go: () => { const sec = this.storyRef.current; if (!sec) return; const top = sec.getBoundingClientRect().top + window.scrollY; window.scrollTo({ top: top + (sec.offsetHeight - window.innerHeight) * ((i + 0.5) / STORY.length), behavior: 'smooth' }); } })),
      storyPct: this.state.storyPct,
      storyCols: this.state.narrow ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 1.1fr)',
      storyCardH: this.state.narrow ? 'min(36vh, 300px)' : 'min(60vh, 460px)',
      v0: vis(0), v1: vis(1), v2: vis(2), v3: vis(3),
      ringOffset: story === 1 ? 75 : 578,
      packages: PACKAGES.map((p, i) => { const f = !!p.featured; return { ...p, featured: f, delay: i * 110,
        bg: f ? '#0B1530' : '#FFFFFF', fg: f ? '#FFFFFF' : '#0D1321', border: f ? '#0B1530' : '#E4E7EC',
        checkBg: '#2A62F5', btnBg: f ? 'linear-gradient(180deg, #5A88FF, #2453E0)' : 'linear-gradient(180deg, #2B3550 0%, #131B2E 55%, #0B1120 100%)', btnFg: '#FFFFFF', btnShadow: f ? 'inset 0 1px 0 rgba(255,255,255,0.4), 0 0 0 1px #1F48C9, 0 12px 26px -10px rgba(42,98,245,0.7)' : 'inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -2px 0 rgba(0,0,0,0.35), 0 0 0 1px #0B1120, 0 12px 26px -10px rgba(13,19,33,0.6)' }; }),
      others: OTHER,
      showTestimonials: this.props.showTestimonials ?? true,
      tCols: [0, 1, 2].map(c => { const items = TQ.filter((_, i) => i % 3 === c); return { dir: c === 1 ? 'down' : 'up', items: [...items, ...items] }; }),
      testimonials: TESTIMONIALS.map((q, i) => ({ ...q, delay: i * 110 })),
      faqs: FAQS.map(([q, a], i) => ({ q, a, rows: openFaq === i ? '1fr' : '0fr', rot: openFaq === i ? 45 : 0, toggle: () => this.setState(s => ({ openFaq: s.openFaq === i ? -1 : i })) })),
    };
  }

render() { const {heroOuter,heroInner,storyRef,tilt,untilt,consoleStatus,pulse,steps,log,stackLoop,index,story,storyPct,storyCols,storyCardH,v0,v1,v2,v3,packages,others,showTestimonials,tCols,faqs} = this.renderVals(); return (<>{" "}

{" "}
<div style={{"overflowX":"clip","position":"relative"}}>
{" "}
<div aria-hidden={"true"} style={{"position":"fixed","inset":"0","zIndex":"45","pointerEvents":"none","opacity":"0.22","mixBlendMode":"soft-light","backgroundImage":"url(/assets/grain.png)","backgroundSize":"260px 260px"}}>

</div>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","top":"-280px","left":"50%","width":"1400px","height":"900px","transform":"translateX(-50%)","background":"radial-gradient(closest-side, #DCE6FE, rgba(246,247,249,0))","pointerEvents":"none"}}>

</div>
{" "}
<div aria-hidden={"true"} style={{"position":"absolute","top":"260px","left":"62%","width":"640px","height":"520px","background":"radial-gradient(closest-side, rgba(255,179,122,0.38), rgba(246,247,249,0))","pointerEvents":"none"}}>

</div>
{" "}
<SiteNav scrolled={this.state.scrolled} />
{" "}
<header id={"top"} data-screen-label={"Hero"} style={{"position":"relative","maxWidth":"1200px","margin":"0 auto","padding":"clamp(150px, 18vw, 210px) clamp(20px, 5vw, 64px) 0","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center"}}>
{" "}
<a href={"#pricing"} data-yl-reveal={"0"} style={{"display":"inline-flex","alignItems":"center","gap":"10px","padding":"5px 14px 5px 5px","borderRadius":"999px","background":"rgba(255,255,255,0.8)","border":"1px solid #E4E7EC","fontSize":"13px","color":"#3A4252","boxShadow":"0 1px 2px rgba(13,19,33,0.04)"}} className={"yl-hover-14"}>
{" "}
<span style={{"padding":"3px 10px","borderRadius":"999px","background":"#2A62F5","color":"#FFFFFF","fontWeight":"500","fontSize":"12px"}}>
{"Automation"}
</span>
<span style={{"whiteSpace":"nowrap"}}>
<span className="app-label"><AppBrand name="Zapier" />{" · "}<AppBrand name="Make" />{" · APIs"}</span>
</span>
<span style={{"color":"#2A62F5"}}>
{"→"}
</span>
{" "}
</a>
{" "}
<h1 data-yl-split={"hero"} style={{"fontWeight":"500","fontSize":"clamp(52px, 8.6vw, 120px)","lineHeight":"0.96","letterSpacing":"0","margin":"28px 0 0"}}>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"Apps"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"that"}
</span>
<br  />
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","letterSpacing":"0","color":"#2A62F5","paddingRight":"0.06em"}}>
{"talk"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","letterSpacing":"0","color":"#2A62F5","paddingRight":"0.06em"}}>
{"to"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","letterSpacing":"0","color":"#2A62F5","paddingRight":"0.06em"}}>
{"each"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","letterSpacing":"0","color":"#2A62F5","paddingRight":"0.06em"}}>
{"other."}
</span>
{" "}
</h1>
{" "}
<p data-yl-reveal={"520"} style={{"fontSize":"clamp(17px, 1.5vw, 19px)","lineHeight":"1.5","maxWidth":"40ch","margin":"28px 0 0","color":"#5B6272"}}>
{"We connect your tools so work moves on its own."}
</p>
{" "}
<div data-yl-reveal={"640"} style={{"display":"flex","gap":"10px","flexWrap":"wrap","justifyContent":"center","marginTop":"32px"}}>
{" "}
<BookingLink style={{"border":"0","cursor":"pointer","font":"inherit","fontSize":"15px","fontWeight":"500","display":"inline-flex","alignItems":"center","gap":"12px","padding":"7px 7px 7px 22px","borderRadius":"999px","position":"relative","overflow":"hidden","isolation":"isolate","background":"linear-gradient(180deg, #2B3550 0%, #131B2E 55%, #0B1120 100%)","color":"#FFFFFF","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -2px 0 rgba(0,0,0,0.35), 0 0 0 1px #0B1120, 0 2px 4px rgba(13,19,33,0.22), 0 12px 26px -10px rgba(13,19,33,0.6)","transition":"transform 400ms cubic-bezier(.16,1,.3,1), box-shadow 400ms ease"}} className={"yl-hover-15"}>
<span data-yl-shine={""} aria-hidden={"true"} style={{"position":"absolute","top":"0","bottom":"0","left":"-60%","width":"45%","zIndex":"-1","pointerEvents":"none","background":"linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)","transform":"skewX(-20deg)"}}>

</span>
{"Book a free call"}
<span style={{"width":"34px","height":"34px","borderRadius":"999px","background":"linear-gradient(180deg, #5A88FF, #2453E0)","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.45), 0 2px 6px -1px rgba(42,98,245,0.6)","display":"grid","placeItems":"center"}}>
{"→"}
</span>
</BookingLink>
{" "}
<a href={"#how"} style={{"display":"inline-flex","alignItems":"center","padding":"0 22px","minHeight":"48px","borderRadius":"999px","background":"linear-gradient(180deg, #FFFFFF, #F1F3F7)","border":"1px solid #DDE1E8","color":"#0D1321","fontSize":"15px","fontWeight":"500","boxShadow":"inset 0 1px 0 #FFFFFF, 0 1px 2px rgba(13,19,33,0.06), 0 8px 18px -10px rgba(13,19,33,0.25)","transition":"border-color 300ms ease"}} className={"yl-hover-16"}>
{"See how it works"}
</a>
{" "}
</div>
{" "}
<div data-yl-reveal={"760"} style={{"width":"100%","marginTop":"clamp(64px, 9vw, 104px)","perspective":"1600px"}}>
{" "}
<div ref={(heroOuter)} style={{"transformOrigin":"50% 0%","willChange":"transform"}}>
{" "}
<div ref={(heroInner)} onMouseMove={(tilt)} onMouseLeave={(untilt)} style={{"borderRadius":"28px","background":"#FFFFFF","border":"1px solid #E4E7EC","boxShadow":"0 1px 2px rgba(13,19,33,0.04), 0 30px 80px -30px rgba(13,19,33,0.28)","padding":"10px","textAlign":"left","transition":"transform 600ms cubic-bezier(.16,1,.3,1)","transformStyle":"preserve-3d"}}>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 380px), 1fr))","gap":"10px"}}>
{" "}
<div style={{"padding":"24px","display":"flex","flexDirection":"column","gap":"18px"}}>
{" "}
<div style={{"display":"inline-flex","alignSelf":"flex-start","alignItems":"center","gap":"8px","padding":"6px 12px","borderRadius":"999px","background":"#E9EFFE","color":"#1B47C4","fontSize":"13px","fontWeight":"500"}}>
<span style={{"width":"7px","height":"7px","borderRadius":"999px","background":"#2A62F5","opacity":(pulse),"transition":"opacity 600ms ease"}}>

</span>
{(consoleStatus)}
</div>
{" "}
<div style={{"display":"flex","flexDirection":"column","gap":"4px"}}>
{" "}
{(steps).map((st, itemIndex8) => <React.Fragment key={itemIndex8}>{" "}
<div style={{"display":"grid","gridTemplateColumns":"28px 1fr auto","gap":"12px","alignItems":"center","padding":"11px 12px","borderRadius":"14px","background":(st.bg),"opacity":(st.op),"transform":"translateX(" + String(st.x) + "px)","transition":"all 600ms cubic-bezier(.16,1,.3,1)"}}>
{" "}
<span style={{"width":"24px","height":"24px","borderRadius":"999px","display":"grid","placeItems":"center","fontSize":"12px","background":(st.dotBg),"color":"#FFFFFF","transition":"background 400ms ease"}}>
{"✓"}
</span>
{" "}
<span style={{"fontSize":"15px","fontWeight":"500"}}>
{(st.text)}
</span>
{" "}
<span style={{"fontSize":"12px","color":"#5B6272"}}>
<AppBrand name={st.tool} />
</span>
{" "}
</div>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
</div>
{" "}
<div style={{"borderRadius":"20px","background":"#0B1530","color":"#E7ECF7","padding":"22px 24px","display":"flex","flexDirection":"column","gap":"11px","minHeight":"300px","overflow":"hidden"}}>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","fontSize":"12px","color":"#8EA2CC"}}>
<span >
{"Run log"}
</span>
<span style={{"color":"#7FE3A8"}}>
{"● Live"}
</span>
</div>
{" "}
{(log).map((lg, itemIndex7) => <React.Fragment key={itemIndex7}>{" "}
<div style={{"display":"grid","gridTemplateColumns":"66px 1fr auto","gap":"10px","fontSize":"13px","lineHeight":"1.4","fontFamily":"ui-monospace, 'SF Mono', Menlo, monospace","opacity":(lg.op)}}>
{" "}
<span style={{"color":"#6F84B3"}}>
{(lg.t)}
</span>
<span >
{(lg.msg)}
</span>
<span style={{"color":"#7FE3A8"}}>
{"✓"}
</span>
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
</div>
{" "}
</div>
{" "}
</header>
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
<section id={"services"} data-screen-label={"Services"} style={{"maxWidth":"1200px","margin":"0 auto","padding":"clamp(110px, 14vw, 180px) clamp(20px, 5vw, 64px) 0"}}>
{" "}
<h2 data-yl-split={"s"} style={{"fontWeight":"500","fontSize":"clamp(40px, 5.6vw, 76px)","lineHeight":"1","letterSpacing":"0","margin":"0 0 48px"}}>
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"What's"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5","letterSpacing":"0"}}>
{"included."}
</span>
</h2>
{" "}
<div style={{"borderTop":"1px solid #DDE1E8"}}>
{" "}
{(index).map((ix, itemIndex3) => <React.Fragment key={itemIndex3}>{" "}
<div data-yl-reveal={(ix.delay)} style={{"borderBottom":"1px solid #DDE1E8"}}>
{" "}
<button type={"button"} onClick={(ix.toggle)} style={{"all":"unset","boxSizing":"border-box","cursor":"pointer","width":"100%","display":"grid","gridTemplateColumns":"minmax(40px, 72px) minmax(0, 1fr) auto","gap":"16px","alignItems":"center","padding":"clamp(22px, 3vw, 34px) 0"}} className={"yl-hover-17"}>
{" "}
<span style={{"fontSize":"14px","fontWeight":"500","color":"#8A91A0","fontFeatureSettings":"'tnum' 1"}}>
{(ix.n)}
</span>
{" "}
<span style={{"fontSize":"clamp(32px, 5.4vw, 68px)","lineHeight":"1","letterSpacing":"0","fontWeight":"500","transform":"translateX(" + String(ix.x) + "px)","transition":"transform 600ms cubic-bezier(.16,1,.3,1)"}}>
{(ix.title)}
</span>
{" "}
<span style={{"width":"48px","height":"48px","borderRadius":"999px","display":"grid","placeItems":"center","fontSize":"22px","fontWeight":"300","background":(ix.btnBg),"color":(ix.btnFg),"border":"1px solid #DDE1E8","transform":"rotate(" + String(ix.rot) + "deg)","transition":"all 500ms cubic-bezier(.16,1,.3,1)"}}>
{"+"}
</span>
{" "}
</button>
{" "}
<div style={{"display":"grid","gridTemplateRows":(ix.rows),"transition":"grid-template-rows 600ms cubic-bezier(.16,1,.3,1)"}}>
{" "}
<div style={{"overflow":"hidden"}}>
{" "}
<div style={{"display":"flex","flexWrap":"wrap","gap":"20px 48px","alignItems":"center","justifyContent":"space-between","padding":"0 0 36px clamp(56px, 6vw, 88px)","opacity":(ix.op),"filter":"blur(" + String(ix.blur) + "px)","transition":"opacity 500ms ease 100ms, filter 600ms ease 100ms"}}>
{" "}
<p style={{"margin":"0","fontSize":"18px","lineHeight":"1.5","maxWidth":"42ch","color":"#3A4252"}}>
{(ix.line)}
</p>
{" "}
<div style={{"display":"flex","gap":"8px","flexWrap":"wrap"}}>
{(ix.tools).map((tl, itemIndex9) => <React.Fragment key={itemIndex9}><span style={{"padding":"7px 14px","borderRadius":"999px","background":"#FFFFFF","border":"1px solid #E4E7EC","fontSize":"13px","fontWeight":"500"}}>
<AppBrand name={tl} />
</span></React.Fragment>)}
</div>
{" "}
</div>
{" "}
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
<section id={"how"} ref={(storyRef)} data-screen-label={"Story scroll"} style={{"position":"relative","height":"400vh","marginTop":"clamp(90px, 12vw, 160px)"}}>
{" "}
<div style={{"position":"sticky","top":"0","height":"100vh","maxWidth":"1200px","margin":"0 auto","padding":"96px clamp(20px, 5vw, 64px) 40px","boxSizing":"border-box","display":"grid","gridTemplateColumns":(storyCols),"gap":"20px clamp(24px, 5vw, 72px)","alignContent":"center","alignItems":"center"}}>
{" "}
<div >
{" "}
<h2 style={{"fontWeight":"500","fontSize":"clamp(30px, 4.8vw, 64px)","lineHeight":"1","letterSpacing":"0","margin":"0 0 clamp(16px, 4vh, 40px)"}}>
{"From sale to "}
<span style={{"fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5","letterSpacing":"0"}}>
{"onboarded,"}
</span>
{" untouched."}
</h2>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"2px 1fr","gap":"0 24px"}}>
{" "}
<div style={{"position":"relative","background":"#DDE1E8","borderRadius":"2px"}}>
<div style={{"position":"absolute","top":"0","left":"0","right":"0","height":String(storyPct) + "%","background":"#2A62F5","borderRadius":"2px","transition":"height 200ms linear"}}>

</div>
</div>
{" "}
<div style={{"display":"flex","flexDirection":"column","gap":"6px"}}>
{" "}
{(story).map((sy, itemIndex6) => <React.Fragment key={itemIndex6}>{" "}
<button type={"button"} onClick={(sy.go)} style={{"all":"unset","cursor":"pointer","padding":"12px 0","opacity":(sy.op),"transition":"opacity 500ms ease"}}>
{" "}
<div style={{"fontSize":"clamp(22px, 2.2vw, 28px)","fontWeight":"500","letterSpacing":"0"}}>
{(sy.title)}
</div>
{" "}
<div style={{"display":"grid","gridTemplateRows":(sy.rows),"transition":"grid-template-rows 600ms cubic-bezier(.16,1,.3,1)"}}>
<div style={{"overflow":"hidden"}}>
<div style={{"paddingTop":"6px","fontSize":"16px","color":"#5B6272"}}>
{(sy.line)}
</div>
</div>
</div>
{" "}
</button>
{" "}</React.Fragment>)}
{" "}
</div>
{" "}
</div>
{" "}
</div>
{" "}
<div style={{"position":"relative","height":(storyCardH),"borderRadius":"28px","background":"radial-gradient(rgba(42,98,245,0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(160deg, #E9EFFE, #FFF1E6)","border":"1px solid #E4E7EC","overflow":"hidden"}}>
{" "}
<div style={{"position":"absolute","inset":"0","display":"grid","placeItems":"center","padding":"24px","opacity":(v0.op),"transform":(v0.tf),"filter":(v0.fl),"transition":"all 800ms cubic-bezier(.16,1,.3,1)"}}>
{" "}
<div style={{"width":"min(100%, 340px)","padding":"22px","borderRadius":"20px","background":"#FFFFFF","boxShadow":"0 24px 60px -24px rgba(13,19,33,0.3)","display":"flex","flexDirection":"column","gap":"12px"}}>
<div style={{"display":"flex","justifyContent":"space-between","fontSize":"13px","color":"#5B6272"}}>
<span >
{"Payment received"}
</span>
<span >
{"just now"}
</span>
</div>
<div style={{"fontSize":"44px","fontWeight":"500","letterSpacing":"0"}}>
{"$2,400"}
</div>
<div style={{"fontSize":"14px","color":"#5B6272"}}>
<span className="app-label">{"Acme Co. · via "}<AppBrand name="Stripe" /></span>
</div>
<div style={{"alignSelf":"flex-start","padding":"6px 12px","borderRadius":"999px","background":"#E9EFFE","color":"#1B47C4","fontSize":"13px","fontWeight":"500"}}>
{"Paid"}
</div>
</div>
{" "}
</div>
{" "}
<div style={{"position":"absolute","inset":"0","display":"grid","placeItems":"center","padding":"24px","opacity":(v1.op),"transform":(v1.tf),"filter":(v1.fl),"transition":"all 800ms cubic-bezier(.16,1,.3,1)"}}>
{" "}
<div style={{"width":"min(100%, 340px)","padding":"22px","borderRadius":"20px","background":"#FFFFFF","boxShadow":"0 24px 60px -24px rgba(13,19,33,0.3)","display":"flex","flexDirection":"column","gap":"12px"}}>
<div style={{"display":"flex","justifyContent":"space-between","fontSize":"13px","color":"#5B6272"}}>
<span >
{"Syncing records"}
</span>
<span >
{"3 apps"}
</span>
</div>
<div >
<div style={{"display":"flex","alignItems":"center","gap":"12px","padding":"12px 0","borderBottom":"1px solid #EEF1F5"}}>
<span style={{"width":"22px","height":"22px","borderRadius":"999px","background":"#2A62F5","color":"#FFFFFF","display":"grid","placeItems":"center","fontSize":"11px","flex":"none"}}>
{"✓"}
</span>
<span style={{"fontSize":"15px","fontWeight":"500"}}>
{"Client added"}
</span>
<span style={{"marginLeft":"auto","fontSize":"13px","color":"#5B6272"}}>
<AppBrand name="Airtable" />
</span>
</div>
<div style={{"display":"flex","alignItems":"center","gap":"12px","padding":"12px 0","borderBottom":"1px solid #EEF1F5"}}>
<span style={{"width":"22px","height":"22px","borderRadius":"999px","background":"#2A62F5","color":"#FFFFFF","display":"grid","placeItems":"center","fontSize":"11px","flex":"none"}}>
{"✓"}
</span>
<span style={{"fontSize":"15px","fontWeight":"500"}}>
{"Deal updated"}
</span>
<span style={{"marginLeft":"auto","fontSize":"13px","color":"#5B6272"}}>
<AppBrand name="HubSpot" />
</span>
</div>
<div style={{"display":"flex","alignItems":"center","gap":"12px","padding":"12px 0","borderBottom":"1px solid #EEF1F5"}}>
<span style={{"width":"22px","height":"22px","borderRadius":"999px","background":"#2A62F5","color":"#FFFFFF","display":"grid","placeItems":"center","fontSize":"11px","flex":"none"}}>
{"✓"}
</span>
<span style={{"fontSize":"15px","fontWeight":"500"}}>
{"Row synced"}
</span>
<span style={{"marginLeft":"auto","fontSize":"13px","color":"#5B6272"}}>
{"Sheets"}
</span>
</div>
</div>
</div>
{" "}
</div>
{" "}
<div style={{"position":"absolute","inset":"0","display":"grid","placeItems":"center","padding":"24px","opacity":(v2.op),"transform":(v2.tf),"filter":(v2.fl),"transition":"all 800ms cubic-bezier(.16,1,.3,1)"}}>
{" "}
<div style={{"width":"min(100%, 340px)","padding":"22px","borderRadius":"20px","background":"#FFFFFF","boxShadow":"0 24px 60px -24px rgba(13,19,33,0.3)","display":"flex","flexDirection":"column","gap":"12px"}}>
<div style={{"display":"flex","justifyContent":"space-between","fontSize":"13px","color":"#5B6272"}}>
<span >
{"To: team@acme.co"}
</span>
<span >
{"Sent"}
</span>
</div>
<div style={{"fontSize":"20px","fontWeight":"500"}}>
{"Welcome aboard, Acme!"}
</div>
<div style={{"height":"10px","borderRadius":"6px","background":"#EEF1F5","width":"92%"}}>

</div>
<div style={{"height":"10px","borderRadius":"6px","background":"#EEF1F5","width":"76%"}}>

</div>
<div style={{"height":"10px","borderRadius":"6px","background":"#EEF1F5","width":"60%"}}>

</div>
<div style={{"alignSelf":"flex-start","padding":"6px 12px","borderRadius":"999px","background":"#E9EFFE","color":"#1B47C4","fontSize":"13px","fontWeight":"500"}}>
{"Drive folder created"}
</div>
</div>
{" "}
</div>
{" "}
<div style={{"position":"absolute","inset":"0","display":"grid","placeItems":"center","padding":"24px","opacity":(v3.op),"transform":(v3.tf),"filter":(v3.fl),"transition":"all 800ms cubic-bezier(.16,1,.3,1)"}}>
{" "}
<div style={{"width":"min(100%, 340px)","padding":"22px","borderRadius":"20px","background":"#FFFFFF","boxShadow":"0 24px 60px -24px rgba(13,19,33,0.3)","display":"flex","flexDirection":"column","gap":"12px"}}>
<div style={{"display":"flex","justifyContent":"space-between","fontSize":"13px","color":"#5B6272"}}>
<span >
{"Weekly report"}
</span>
<span >
{"Mon 08:00"}
</span>
</div>
<div style={{"fontSize":"20px","fontWeight":"500"}}>
{"Your numbers, delivered"}
</div>
<div style={{"display":"flex","alignItems":"flex-end","gap":"8px","height":"110px"}}>
<div style={{"flex":"1","height":"40%","borderRadius":"6px","background":"#DCE6FE"}}>

</div>
<div style={{"flex":"1","height":"55%","borderRadius":"6px","background":"#DCE6FE"}}>

</div>
<div style={{"flex":"1","height":"48%","borderRadius":"6px","background":"#DCE6FE"}}>

</div>
<div style={{"flex":"1","height":"70%","borderRadius":"6px","background":"#DCE6FE"}}>

</div>
<div style={{"flex":"1","height":"62%","borderRadius":"6px","background":"#DCE6FE"}}>

</div>
<div style={{"flex":"1","height":"88%","borderRadius":"6px","background":"#2A62F5"}}>

</div>
</div>
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
<section id={"pricing"} data-screen-label={"Pricing"} style={{"maxWidth":"1200px","margin":"0 auto","padding":"clamp(90px, 12vw, 160px) clamp(20px, 5vw, 64px) 0"}}>
{" "}
<h2 data-yl-split={"p"} style={{"textAlign":"center","fontWeight":"500","fontSize":"clamp(40px, 5.6vw, 76px)","lineHeight":"1","letterSpacing":"0","margin":"0 0 56px"}}>
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"Simple"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5","letterSpacing":"0"}}>
{"pricing."}
</span>
</h2>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 300px), 1fr))","gap":"16px","alignItems":"stretch"}}>
{" "}
{(packages).map((p, itemIndex3) => <React.Fragment key={itemIndex3}>{" "}
<div data-yl-reveal={(p.delay)} style={{"padding":"32px","borderRadius":"28px","background":(p.bg),"color":(p.fg),"border":"1px solid " + String(p.border),"display":"flex","flexDirection":"column","gap":"24px","transition":"transform 500ms cubic-bezier(.16,1,.3,1), box-shadow 500ms ease"}} className={"yl-hover-19"}>
{" "}
<div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","gap":"12px"}}>
{" "}
<span style={{"fontSize":"17px","fontWeight":"500"}}>
{(p.name)}
</span>
{" "}
{(p.featured) && <><span style={{"padding":"4px 10px","borderRadius":"999px","background":"#2A62F5","color":"#FFFFFF","fontSize":"12px","fontWeight":"500"}}>
{"Popular"}
</span></>}
{" "}
</div>
{" "}
<div >
<span style={{"fontSize":"52px","fontWeight":"500","letterSpacing":"0","lineHeight":"1"}}>
{(p.price)}
</span>
<span style={{"fontSize":"14px","marginLeft":"8px","opacity":"0.7"}}>
{(p.unit)}
</span>
</div>
{" "}
<ul style={{"listStyle":"none","margin":"0","padding":"0","display":"flex","flexDirection":"column","gap":"12px","flex":"1"}}>
{" "}
{(p.items).map((it, itemIndex6) => <React.Fragment key={itemIndex6}>{" "}
<li style={{"display":"flex","gap":"10px","fontSize":"15px","alignItems":"center"}}>
<span style={{"width":"18px","height":"18px","borderRadius":"999px","background":(p.checkBg),"color":"#FFFFFF","display":"grid","placeItems":"center","fontSize":"10px","flex":"none"}}>
{"✓"}
</span>
{(it)}
</li>
{" "}</React.Fragment>)}
{" "}
</ul>
{" "}
<BookingLink style={{"border":"0","cursor":"pointer","font":"inherit","fontSize":"15px","fontWeight":"500","minHeight":"48px","borderRadius":"999px","position":"relative","overflow":"hidden","isolation":"isolate","background":(p.btnBg),"color":(p.btnFg),"boxShadow":(p.btnShadow),"transition":"filter 300ms ease"}} className={"pricing-cta yl-hover-18"}>
<span data-yl-shine={""} aria-hidden={"true"} style={{"position":"absolute","top":"0","bottom":"0","left":"-60%","width":"45%","zIndex":"-1","pointerEvents":"none","background":"linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)","transform":"skewX(-20deg)"}}>

</span>
{(p.cta)}
</BookingLink>
{" "}
</div>
{" "}</React.Fragment>)}
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
{(tCols).map((col, itemIndex4) => <React.Fragment key={itemIndex4}>{" "}
<div data-yl-col={(col.dir)} style={{"display":"flex","flexDirection":"column","gap":"16px"}}>
{" "}
{(col.items).map((q, itemIndex6) => <React.Fragment key={itemIndex6}>{" "}
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
<section data-screen-label={"Other services"} style={{"maxWidth":"1200px","margin":"0 auto","padding":"clamp(90px, 12vw, 160px) clamp(20px, 5vw, 64px) 0"}}>
{" "}
<h2 data-yl-split={"o"} style={{"textAlign":"center","fontWeight":"500","fontSize":"clamp(40px, 5.6vw, 76px)","lineHeight":"1","letterSpacing":"0","margin":"0 0 56px"}}>
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"More"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block"}}>
{"from"}
</span>
{" "}
<span data-yl-word={""} style={{"display":"inline-block","fontFamily":"'Instrument Serif', serif","fontStyle":"italic","fontWeight":"400","color":"#2A62F5","letterSpacing":"0"}}>
{"Yara Labs."}
</span>
</h2>
{" "}
<div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 280px), 1fr))","gap":"16px"}}>
{" "}
{(others).map((o, itemIndex3) => <React.Fragment key={itemIndex3}>{" "}
<a href={(o.href)} data-yl-reveal={(o.delay)} style={{"display":"flex","flexDirection":"column","justifyContent":"space-between","gap":"48px","padding":"28px","borderRadius":"28px","background":"#FFFFFF","border":"1px solid #E4E7EC","color":"#0D1321","transition":"transform 500ms cubic-bezier(.16,1,.3,1), box-shadow 500ms ease"}} className={"yl-hover-20"}>
{" "}
<span style={{"fontSize":"13px","color":"#8A91A0"}}>
{(o.n)}
</span>
{" "}
<div >
<div style={{"fontSize":"30px","fontWeight":"500","letterSpacing":"0"}}>
{(o.title)}
</div>
<div style={{"marginTop":"8px","fontSize":"15px","color":"#5B6272"}}>
{(o.line)}
</div>
</div>
{" "}
<span style={{"width":"44px","height":"44px","borderRadius":"999px","background":"#0D1321","color":"#FFFFFF","display":"grid","placeItems":"center"}}>
{"→"}
</span>
{" "}
</a>
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
<BookingLink data-yl-reveal={"300"} style={{"position":"relative","marginTop":"40px","border":"0","cursor":"pointer","font":"inherit","fontSize":"16px","fontWeight":"500","display":"inline-flex","alignItems":"center","gap":"12px","padding":"8px 8px 8px 24px","borderRadius":"999px","overflow":"hidden","isolation":"isolate","background":"linear-gradient(180deg, #2B3550 0%, #131B2E 55%, #0B1120 100%)","color":"#FFFFFF","boxShadow":"inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -2px 0 rgba(0,0,0,0.35), 0 0 0 1px #0B1120, 0 2px 4px rgba(13,19,33,0.22), 0 12px 26px -10px rgba(13,19,33,0.6)","transition":"transform 400ms cubic-bezier(.16,1,.3,1)"}} className={"yl-hover-21"}>
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
<a href={"/"} style={{"color":"#5B6272"}}>
{"Home"}
</a>
<a href={"/services"} style={{"color":"#5B6272"}}>
{"Services"}
</a>
<a href={"/projects"} style={{"color":"#5B6272"}}>
{"Projects"}
</a>
<a href={"#pricing"} style={{"color":"#5B6272"}}>
{"Pricing"}
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
