/* Milo — Yara Labs pixel guide. Jumps on the page's cards & buttons, rides them as you scroll, and gives a guided tour. Self-mounting. */
(function () {
  if (window.__ylPet) return; window.__ylPet = true;

  // Milo: a fluffy calico kitten (white, orange, black). Sprite is assembled from parts, then auto-outlined.
  const S = 3, W = 28, H = 18, GROUND = 14, G = 2400;
  const BODY = [
    [7, 7, "w"], [7, 10, "o"], [7, 12, "b"],
    [8, 5, "wbbbooowb"],
    [9, 3, "wwbbbbooowww"],
    [10, 2, "wwwwbbbooowwww"],
    [11, 2, "wwwwwbbowwwwwww"],
    [12, 2, "wwwwwwwwwwwwwwww"],
    [13, 3, "wwwwwwwwwwwwwww"]
  ];
  const HEADP = [
    [1, 15, "b"], [1, 23, "o"],
    [2, 14, "bpb"], [2, 22, "opo"],
    [3, 14, "bpbwwwwwopo"],
    [4, 13, "bbbbwwwwooooo"],
    [5, 13, "bbkkwwwwwkkoo"],
    [6, 13, "bwhkwwwwwhkwo"],
    [7, 13, "wwkkwwnwwkkww"],
    [8, 12, "wwpwwwmwmwwwpww"],
    [9, 13, "wwwwwwwwwwwww"],
    [10, 14, "wwwwwwwwwww"]
  ];
  const TAIL = {
    a: [[2, 2, "b"], [3, 1, "bb"], [4, 1, "bb"], [5, 1, "bb"], [6, 1, "bb"], [7, 2, "bb"], [8, 2, "bbb"]],
    b: [[3, 4, "b"], [4, 3, "bb"], [5, 2, "bb"], [6, 1, "bb"], [7, 1, "bbb"], [8, 2, "bbb"]],
    flat: [[11, 0, "b"], [12, 0, "bb"]]
  };
  const LEGS = {
    idle: ["....ww.ww....ww.ww", "....ww.ww....ww.ww", "....ww.ww....ww.ww"],
    run1: ["....ww.ww....ww.ww", "...ww...ww..ww...ww", "..ww.....ww.ww.....ww"],
    run2: ["....wwww.....wwww", ".....ww.......ww", ".....ww.......ww"],
    air:  ["...www.......www", "..ww...........ww", ".ww.............ww"],
    none: ["", "", ""]
  };
  const PW = W * S, PH = H * S, HALF = PW / 2;
  const PAL = { w: "#FFFFFF", s: "#EEE7E1", o: "#F39A3C", b: "#2A2321", p: "#F7A8B8", n: "#E57F95", m: "#5A3F3C", k: "#1E1716", h: "#FFFFFF", L: "#4A3B37" };
  function makeFrame(legs, closed, tail, drop) {
    const g = Array.from({ length: H }, () => Array(W).fill("."));
    const put = (r, c, s) => { for (let i = 0; i < s.length; i++) if (s[i] !== "." && g[r] && c + i < W) g[r][c + i] = s[i]; };
    TAIL[tail].forEach(p => put(...p)); BODY.forEach(p => put(...p)); HEADP.forEach(p => put(...p));
    LEGS[legs].forEach((s, i) => put(14 + i, 0, s));
    if (closed) { [15, 16, 22, 23].forEach(c => { g[5][c] = c < 20 ? "b" : "o"; g[6][c] = "w"; }); }
    for (let r = 12; r < 17; r++) for (let c = 0; c < W; c++) if (g[r][c] === "w") g[r][c] = "s";
    const o = g.map(r => r.slice());
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (g[r][c] === "." && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dr, dc]) => g[r + dr] && g[r + dr][c + dc] && g[r + dr][c + dc] !== ".")) o[r][c] = "L";
    const cv = document.createElement("canvas"); cv.width = PW; cv.height = PH;
    const x2 = cv.getContext("2d"), dy = drop || 0;
    o.forEach((row, y) => row.forEach((ch, x) => { if (ch === ".") return; x2.fillStyle = PAL[ch]; x2.fillRect(x * S, (y + dy) * S, S, S); }));
    return cv;
  }
  const FR = {
    idle: makeFrame("idle", 0, "a"), idle2: makeFrame("idle", 0, "b"), blink: makeFrame("idle", 1, "a"),
    run1: makeFrame("run1", 0, "b"), run2: makeFrame("run2", 0, "b"), air: makeFrame("air", 0, "b"),
    sleep: makeFrame("none", 1, "flat", 3)
  };

  const page = location.pathname.split('/').filter(Boolean).pop() || 'Home';
  const bookingUrl = document.currentScript?.dataset.bookingUrl;
  const clickBook = () => {
    const link = document.querySelector('[data-booking-link]');
    if (link) link.click();
    else if (bookingUrl) location.assign(bookingUrl);
  };

  // Tour: each stop scrolls to a section, Milo jumps onto a target inside it and explains.
  const HOME_TOUR = [
    { s: "Hero", pick: "button", t: "Start here. Booking a call is free and takes 30 minutes. You'll leave with a plan either way." },
    { s: "Services bento", pick: "card", t: "Four things we build: CRM, automation, AI agents and custom apps. Click any card to see scope and pricing." },
    { s: "How we work", pick: "card", t: "The process. Every step ends with something you can see and use, so you're never waiting on a black box." },
    { s: "Testimonials", pick: "card", t: "Real Upwork clients, all rated 5.0. Names, companies and what we built for them." },
    { s: "FAQ", pick: "card", t: "Pricing, timelines and who owns the code are answered here. Click a question to open it." },
    { s: "Final CTA", pick: "button", t: "That's the tour. If any of it sounds like your team, this button books a call." }
  ];
  const PAGE_INTRO = {
    "services": "Four ways we help. Pick the one that sounds like your biggest headache.",
    "projects": "Our work. Colliers, USMD and Inka each have a full case study.",
    "crm": "CRM builds: pipeline setup, data cleanup and team training.",
    "automation": "Automation: we find the repetitive work and make it run on its own.",
    "ai-agents": "AI agents: assistants that do real work in your tools, with guardrails.",
    "custom-apps": "Custom apps: internal tools built around how your team actually works.",
    "colliers-catering": "Case study: the problem, what we built, and the numbers after launch.",
    "us-medical-directors": "Case study: the problem, what we built, and the numbers after launch.",
    "inka-arthouse": "Case study: the problem, what we built, and the numbers after launch."
  };

  let mounted = false;
  function mount() {
    if (mounted || !document.body) return; mounted = true;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const font = "'Geist', system-ui, sans-serif";
    const el = (tag, css, parent) => { const e = document.createElement(tag); e.style.cssText = css; e.setAttribute("data-yl-pet", ""); (parent || document.body).appendChild(e); return e; };

    const shadow = el("div", "position:fixed;left:0;top:0;width:46px;height:8px;margin-top:-4px;border-radius:50%;background:rgba(13,19,33,0.2);z-index:43;pointer-events:none;");
    const pet = el("div", "position:fixed;left:0;top:0;width:" + PW + "px;height:" + PH + "px;z-index:44;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;");
    pet.setAttribute("role", "button"); pet.setAttribute("tabindex", "0"); pet.setAttribute("aria-label", "Milo, your site guide. Press for the tour.");
    const cv = document.createElement("canvas"); cv.width = PW; cv.height = PH;
    cv.style.cssText = "display:block;width:100%;height:100%;image-rendering:pixelated;transform-origin:50% 100%;";
    pet.appendChild(cv); const ctx = cv.getContext("2d");

    const bubble = el("div", "position:fixed;left:0;top:0;width:272px;box-sizing:border-box;padding:14px 14px 12px;border-radius:16px;background:#fff;border:1px solid rgba(13,19,33,0.08);box-shadow:0 1px 2px rgba(13,19,33,0.06),0 18px 40px -14px rgba(13,19,33,0.35);font-family:" + font + ";color:#0D1321;z-index:46;opacity:0;transform:translateY(6px) scale(0.96);transform-origin:50% 100%;transition:opacity 220ms ease,transform 320ms cubic-bezier(.16,1,.3,1);pointer-events:none;");
    bubble.innerHTML =
      '<div style="display:flex;align-items:center;gap:8px;margin:0 0 6px;"><span style="width:8px;height:8px;border-radius:2px;background:linear-gradient(135deg,#2A2321 0 33%,#FFFFFF 33% 66%,#F39A3C 66%);box-shadow:0 0 0 1px #4A3B37;"></span><span data-k="h1" style="font-size:12px;font-weight:600;letter-spacing:0.02em;color:#5B6272;">Milo · your guide</span><button data-k="x" aria-label="Close" style="margin-left:auto;border:0;background:none;cursor:pointer;font:inherit;font-size:16px;line-height:1;color:#8A91A0;padding:2px 4px;">×</button></div>' +
      '<p data-k="t" style="margin:0 0 12px;font-size:14px;line-height:1.45;text-wrap:pretty;"></p>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;"><button data-k="a" style="border:0;cursor:pointer;font:inherit;font-size:13px;font-weight:500;padding:7px 12px;border-radius:999px;background:#0D1321;color:#fff;"></button><button data-k="b" style="border:1px solid rgba(13,19,33,0.12);cursor:pointer;font:inherit;font-size:13px;padding:6px 12px;border-radius:999px;background:#fff;color:#0D1321;"></button><button data-k="hide" style="margin-left:auto;border:0;background:none;cursor:pointer;font:inherit;font-size:12px;color:#8A91A0;padding:4px;">Hide</button></div>' +
      '<span data-k="tail" style="position:absolute;bottom:-7px;width:12px;height:12px;background:#fff;border-right:1px solid rgba(13,19,33,0.08);border-bottom:1px solid rgba(13,19,33,0.08);transform:rotate(45deg);"></span>';
    const q = k => bubble.querySelector('[data-k="' + k + '"]');
    bubble.inert = true;
    bubble.id = "milo-tour";
    bubble.setAttribute("role", "region");
    bubble.setAttribute("aria-label", "Milo's page tour");
    pet.setAttribute("aria-controls", bubble.id);
    pet.setAttribute("aria-expanded", "false");

    const egg = el("button", "position:fixed;left:16px;bottom:16px;z-index:44;display:none;align-items:center;gap:8px;border:1px solid rgba(13,19,33,0.1);background:#fff;border-radius:999px;padding:6px 12px 6px 8px;cursor:pointer;font:500 13px " + font + ";color:#0D1321;box-shadow:0 8px 20px -10px rgba(13,19,33,0.4);");
    egg.innerHTML = '<span style="width:14px;height:16px;border-radius:50% 50% 45% 45%/60% 60% 40% 40%;background:linear-gradient(135deg,#2A2321 0 33%,#FFFFFF 33% 66%,#F39A3C 66%);box-shadow:0 0 0 1px #4A3B37;"></span>Bring Milo back';

    // ---------- platforms: real elements on the page ----------
    let cands = [], plats = [];
    function isPlatform(e, cs) {
      if (e.closest("[data-yl-pet],[aria-hidden='true'],dialog,[role='dialog']")) return false;
      const tag = e.tagName;
      if (tag === "BUTTON" || tag === "IMG") return true;
      if (tag === "A" && parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) > 8) return true;
      const bg = cs.backgroundColor, hasBg = bg && bg !== "transparent" && !/rgba\(.*,\s*0\)$/.test(bg);
      return hasBg || parseFloat(cs.borderTopWidth) > 0 || cs.backgroundImage.startsWith("linear");
    }
    function scan() {
      const vw = innerWidth, vh = innerHeight, out = [];
      for (const e of document.querySelectorAll("div,a,button,article,li,img,figure,details,summary")) {
        const r = e.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2 || r.width < 72 || r.width > vw * 0.92 || r.height < 30 || r.height > vh * 1.3) continue;
        const cs = getComputedStyle(e);
        if (cs.visibility === "hidden" || +cs.opacity < 0.3 || cs.pointerEvents === "none") continue;
        if (isPlatform(e, cs)) out.push(e);
      }
      cands = out;
      clipOf = new Map();
      for (const e of out) {
        let a = e.parentElement, c = null;
        while (a && a !== document.body) {
          const cs = getComputedStyle(a);
          if (cs.overflowY !== "visible" || cs.overflowX === "hidden") { c = { a, mask: cs.maskImage && cs.maskImage !== "none" || cs.webkitMaskImage && cs.webkitMaskImage !== "none" }; break; }
          a = a.parentElement;
        }
        if (c) clipOf.set(e, c);
      }
    }
    function readPlats(vh) {
      plats = [];
      if (extraPlat && extraPlat.isConnected) {
        const rg = document.createRange(); rg.selectNodeContents(extraPlat); const tr = rg.getBoundingClientRect();
        if (tr.width > 60 && tr.top > 70 && tr.top < vh - GROUND - 12) plats.push({ e: extraPlat, l: tr.left + 6, r: tr.right - 6, t: tr.top, rect: tr });
      }
      for (const e of cands) {
        if (!e.isConnected) continue;
        const r = e.getBoundingClientRect();
        if (!r.width || r.top <= 70 || r.top >= vh - GROUND - 12) continue;
        let l = r.left + 6, rr = r.right - 6;
        const c = clipOf.get(e);
        if (c) {
          if (c.mask) continue;
          const k = c.a.getBoundingClientRect(), pad = c.mask ? k.height * 0.18 : 8;
          if (r.top < k.top + pad || r.top > k.bottom - pad) continue;
          l = Math.max(l, k.left + 6); rr = Math.min(rr, k.right - 6);
          if (rr - l < 50) continue;
        }
        plats.push({ e, l, r: rr, t: r.top, rect: r });
      }
    }
    const platOf = e => plats.find(p => p.e === e);
    const isMoving = e => { const c = clipOf.get(e); return !!(c && c.mask); };

    // ---------- state ----------
    let vw = innerWidth, vh = innerHeight, groundY = vh - GROUND;
    let x = vw - 140, fy = reduce ? groundY : -PH, vx = 0, vy = 0, face = -1;
    let on = null, ignoreEl = null, ignoreT = 0;
    let mode = "idle", modeT = 1.5, walkTo = x, squash = 0, distAcc = 0, runFrame = 0;
    let blinkT = 2, blinking = 0, lastInteract = performance.now(), sleeping = false, zT = 0;
    let dragging = false, down = null, grab = { dx: 0, dy: 0 }, pv = { x: 0, y: 0 }, lastP = null;
    let mouse = { x: -999, y: -999, t: 0, el: null, since: 0 }, hoverCd = 0;
    let bubbleOpen = false, bubbleTimer = 0, bubbleHover = false, bubbleFocus = false;
    let pending = null; // {e, onLand, deadline}
    let tourIdx = -1, tourToken = 0, extraPlat = null, ringEl = null, ringT = 0, ringPrev = null, clipOf = new Map();
    let hidden = false; try { hidden = localStorage.getItem("yl-pet-hidden") === "1"; } catch { /* Storage may be unavailable in private browsing. */ }
    const particles = [];

    const wake = () => { lastInteract = performance.now(); sleeping = false; };

    // Ballistic jump that lands exactly on (tx, ty) under gravity G.
    function jumpTo(tx, ty, extra) {
      const dx = tx - x, h = fy - ty;
      const apex = Math.max(h, 0) + (extra ?? 50) + Math.min(120, Math.abs(dx) * 0.12);
      const v0 = -Math.sqrt(2 * G * apex);
      const t = (-v0 + Math.sqrt(Math.max(0, v0 * v0 - 2 * G * h))) / G;
      vy = v0; vx = Math.max(-1600, Math.min(1600, dx / Math.max(t, 0.08)));
      if (on) { ignoreEl = on; ignoreT = 0.15; }
      on = null; squash = -0.12; mode = "air";
    }
    function jumpOnto(e, onLand) {
      const p = platOf(e) || (() => { const r = e.getBoundingClientRect(); return { l: r.left + 6, r: r.right - 6, t: r.top }; })();
      const tx = Math.max(p.l + HALF * 0.6, Math.min(p.r - HALF * 0.6, x < p.l ? p.l + 40 : x > p.r ? p.r - 40 : x + (Math.random() - 0.5) * 60));
      pending = { e, onLand, deadline: performance.now() + 2600 };
      jumpTo(tx, p.t);
    }

    // ---------- bubble ----------
    function show(o) {
      q("h1").textContent = o.head || "Milo · your guide";
      q("t").textContent = o.t;
      const a = q("a"), b = q("b");
      a.style.display = o.a ? "" : "none"; if (o.a) { a.textContent = o.a.label; a.onclick = () => { o.a.run(); }; }
      b.style.display = o.b ? "" : "none"; if (o.b) { b.textContent = o.b.label; b.onclick = () => { o.b.run(); }; }
      bubbleOpen = true; bubbleTimer = o.sticky ? 1e9 : 10;
      bubble.inert = false;
      pet.setAttribute("aria-expanded", "true");
      bubble.style.opacity = "1"; bubble.style.transform = "translateY(0) scale(1)"; bubble.style.pointerEvents = "auto";
      if (bubbleFocus) (o.a ? a : o.b ? b : q("x")).focus({ preventScroll: true });
    }
    function closeBubble() {
      if (bubble.contains(document.activeElement)) pet.focus({ preventScroll: true });
      bubble.inert = true; pet.setAttribute("aria-expanded", "false");
      bubbleOpen = false; bubble.style.opacity = "0"; bubble.style.transform = "translateY(6px) scale(0.96)"; bubble.style.pointerEvents = "none";
    }
    const dismiss = () => { closeBubble(); tourIdx = -1; tourToken++; pending = null; unhighlight(); };
    q("x").onclick = dismiss;
    bubble.addEventListener("keydown", e => { if (e.key === "Escape") { e.stopPropagation(); dismiss(); } });
    q("hide").onclick = () => setHidden(true);
    egg.onclick = () => setHidden(false);
    bubble.addEventListener("pointerenter", () => bubbleHover = true);
    bubble.addEventListener("pointerleave", () => bubbleHover = false);

    // Outline drawn on the element itself, so it follows its transforms, radius, scroll and clipping exactly.
    function unhighlight() {
      if (ringEl && ringPrev) { const st = ringEl.style; st.outline = ringPrev.o; st.outlineOffset = ringPrev.oo; st.transition = ringPrev.t; }
      ringEl = null; ringPrev = null;
    }
    function highlight(e) {
      unhighlight();
      const st = e.style; ringPrev = { o: st.outline, oo: st.outlineOffset, t: st.transition };
      st.transition = (st.transition ? st.transition + ", " : "") + "outline-color 300ms ease";
      st.outline = "2px solid #F39A3C"; st.outlineOffset = "4px";
      ringEl = e; ringT = 3.2;
    }
    const clickable = e => e.matches("a[href],button") ? e : e.querySelector("a[href],button");

    // ---------- tour ----------
    function buildTour() {
      if (page === "Home") return HOME_TOUR.map(s => ({ ...s, sec: document.querySelector('[data-screen-label="' + s.s + '"]') })).filter(s => s.sec);
      const secs = [...document.querySelectorAll("[data-screen-label]")];
      return secs.slice(0, 7).map((sec, i) => {
        const hd = sec.querySelector("h1,h2,h3"), label = sec.getAttribute("data-screen-label");
        const txt = i === 0 && PAGE_INTRO[page] ? PAGE_INTRO[page] : (hd ? "“" + hd.textContent.trim().replace(/\s+/g, " ").slice(0, 70) + "”. " : "") + "This part is " + label.toLowerCase() + ".";
        return { s: label, sec, pick: i === secs.length - 1 ? "button" : "card", t: txt };
      });
    }
    function pickTarget(stop) {
      readPlats(vh);
      const inSec = plats.filter(p => stop.sec.contains(p.e) && !isMoving(p.e) && p.e !== extraPlat && p.t > 76 && p.r - p.l > 60).map(p => ({ e: p.e, top: p.t, h: p.rect.height }));
      const hit = choose(inSec, stop.pick);
      if (hit) return hit;
      extraPlat = stop.sec.querySelector("h1,h2,h3"); readPlats(vh);
      return platOf(extraPlat) ? extraPlat : null;
    }
    // Outermost element wins (a card, not a pill inside it) — Milo lands on the first top edge it meets.
    function choose(list, pick) {
      if (pick === "button") {
        const booking = list.find(o => o.e.matches("[data-booking-link]"));
        if (booking) return booking.e;
      }
      const outer = list.filter(o => !list.some(p => p !== o && p.e.contains(o.e))).sort((a, b) => a.top - b.top);
      const btn = outer.find(o => o.e.matches("a,button") && o.h <= 64), card = outer.find(o => !o.e.matches("img") && o.h > 60);
      return (pick === "button" ? btn || card : card || btn || outer[0])?.e || null;
    }
    // Section candidates ignoring reveal-opacity (off-screen sections are faded until scrolled in).
    function rawIn(sec) {
      const out = [];
      for (const e of sec.querySelectorAll("div,a,button,article,li,img,figure,details,summary")) {
        const r = e.getBoundingClientRect();
        if (r.width < 72 || r.width > vw * 0.92 || r.height < 30 || r.height > vh * 1.3) continue;
        let a = e.parentElement, masked = false;
        while (a && a !== sec.parentElement) { const ac = getComputedStyle(a); if ((ac.maskImage && ac.maskImage !== "none") || (ac.webkitMaskImage && ac.webkitMaskImage !== "none")) { masked = true; break; } a = a.parentElement; }
        if (masked || !isPlatform(e, getComputedStyle(e))) continue;
        out.push({ e, top: r.top, h: r.height });
      }
      return out;
    }
    function goStop(i) {
      const tour = buildTour(); wake();
      if (i >= tour.length) { tourIdx = -1; show({ t: "That's everything. Drag me onto anything you want me to sit on, or book a call when you're ready.", a: { label: "Book a call", run: () => { closeBubble(); clickBook(); } } }); return; }
      tourIdx = i; closeBubble(); unhighlight(); extraPlat = null; const token = ++tourToken;
      const stop = tour[i]; scan();
      const preEl = choose(rawIn(stop.sec), stop.pick), pre = preEl && { e: preEl };
      const r = stop.sec.getBoundingClientRect();
      const y0 = preEl ? preEl.getBoundingClientRect().top + scrollY - vh * 0.5 : r.top + scrollY - vh * 0.18;
      scrollTo({ top: Math.max(0, y0), behavior: reduce ? "auto" : "smooth" });
      const t0 = performance.now(); let lastY = -1, still = 0;
      const settle = () => {
        if (token !== tourToken || hidden) return;
        still = Math.abs(scrollY - lastY) < 1 ? still + 1 : 0; lastY = scrollY;
        if (!reduce && still < 3 && performance.now() - t0 < 1800) { setTimeout(settle, 70); return; }
        scan(); let tgt = pickTarget(stop);
        if (!tgt && pre && pre.e.isConnected && !isMoving(pre.e)) { const rr = pre.e.getBoundingClientRect(); if (rr.top > 76 && rr.top < groundY - 12) tgt = pre.e; }
        const say = () => {
          // Actions belong to the intended stop, even if physics lands on a neighbor.
          const here = tgt && tgt !== extraPlat && stop.sec.contains(tgt) ? tgt : null;
          if (here) highlight(here);
          const c = here && clickable(here);
          show({
            head: "Stop " + (i + 1) + " of " + tour.length, t: stop.t, sticky: true,
            a: c ? { label: c.matches("[data-booking-link]") ? "Book a call" : "Open this", run: () => { dismiss(); c.click(); } } : null,
            b: { label: i + 1 < tour.length ? "Next stop" : "Finish", run: () => goStop(i + 1) }
          });
        };
        if (tgt && !reduce) jumpOnto(tgt, () => { if (token === tourToken) say(); }); else say();
      };
      setTimeout(settle, 120);
    }
    function offerTour() {
      show({ t: "Mrrp! I'm Milo. I can walk you through this page in under a minute, hopping between the parts that matter.", sticky: true,
        a: { label: "Show me around", run: () => goStop(0) }, b: { label: "Later", run: closeBubble } });
    }

    function setHidden(h) {
      hidden = h; try { localStorage.setItem("yl-pet-hidden", h ? "1" : "0"); } catch { /* Storage may be unavailable in private browsing. */ }
      sceneAbort?.abort();
      dismiss(); dragging = false; down = null;
      for (const p of particles) p.d.remove(); particles.length = 0;
      mBub.style.opacity = "0";
      if (yarn) yarn.e.style.display = "none";
      [pet, shadow, yaraEl, yShadow].forEach(e => e.style.display = "none"); yBub.style.opacity = "0";
      [pet, shadow].forEach(e => e.style.display = h ? "none" : "");
      egg.style.display = h ? "inline-flex" : "none";
      if (!h) { x = vw * 0.8; fy = reduce ? groundY : -PH; vy = 0; vx = 0; on = null; wake(); last = performance.now(); cancelAnimationFrame(frameId); frameId = requestAnimationFrame(loop); pet.focus({ preventScroll: true }); }
      else { cancelAnimationFrame(frameId); egg.focus({ preventScroll: true }); }
    }

    function spawn(px, py, kind) {
      if (hidden || reduce) return;
      const d = el("div", "position:fixed;left:0;top:0;pointer-events:none;z-index:44;" + (kind !== "dust" ? "font:700 13px " + font + ";color:" + (kind === "heart" ? "#E57F95" : "#F39A3C") + ";" : "width:4px;height:4px;"));
      if (kind !== "dust") d.textContent = kind === "heart" ? "\u2665" : "z"; else d.style.background = ["#E8E2DC", "#F39A3C", "#CFC6BE", "#2A2321"][Math.random() * 4 | 0];
      particles.push(kind !== "dust" ? { d, x: px, y: py, vx: 14, vy: -28, g: 0, floor: 1e9, life: 1.8, max: 1.8 } : { d, x: px + (Math.random() - 0.5) * 30, y: py - 2, vx: (Math.random() - 0.5) * 240, vy: -120 - Math.random() * 220, g: 1400, floor: py, life: 0.55, max: 0.55 });
    }

    // ---------- input ----------
    pet.addEventListener("pointerdown", e => {
      wake(); pet.setPointerCapture(e.pointerId);
      down = { x: e.clientX, y: e.clientY }; grab.dx = e.clientX - x; grab.dy = e.clientY - fy;
      lastP = { x: e.clientX, y: e.clientY, t: performance.now() }; pv = { x: 0, y: 0 };
    });
    pet.addEventListener("pointermove", e => {
      if (!down) return;
      if (!dragging && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) { dragging = true; held = false; on = null; pending = null; pet.style.cursor = "grabbing"; closeBubble(); tourIdx = -1; tourToken++; unhighlight(); }
      if (dragging) {
        const now = performance.now(), dt = Math.max(1, now - lastP.t) / 1000;
        pv.x = pv.x * 0.6 + ((e.clientX - lastP.x) / dt) * 0.4; pv.y = pv.y * 0.6 + ((e.clientY - lastP.y) / dt) * 0.4;
        lastP = { x: e.clientX, y: e.clientY, t: now };
        x = e.clientX - grab.dx; fy = e.clientY - grab.dy;
      }
    });
    const up = () => {
      if (!down) return;
      if (dragging) { const c = v => Math.max(-2600, Math.min(2600, v)); vx = c(pv.x); vy = c(pv.y); dragging = false; pet.style.cursor = "grab"; mode = "air"; }
      else if (scene) { spawn(x + face * 20, fy - PH, "heart"); }
      else if (bubbleOpen) { closeBubble(); spawn(x + face * 20, fy - PH, "heart"); }
      else if (tourIdx >= 0) goStop(tourIdx);
      else { offerTour(); spawn(x + face * 20, fy - PH, "heart"); }
      down = null; modeT = 1.5;
    };
    pet.addEventListener("pointerup", up); pet.addEventListener("pointercancel", up);
    pet.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); bubbleFocus = true; if (bubbleOpen) dismiss(); else offerTour(); } else if (e.key === "Escape") dismiss(); });
    addEventListener("pointermove", e => {
      const now = performance.now();
      const t = e.target && e.target.closest ? cands.find(c => c === e.target || c.contains(e.target)) : null;
      if (t !== mouse.el) mouse.since = now;
      mouse = { x: e.clientX, y: e.clientY, t: now, el: t, since: mouse.since };
      if (Math.hypot(e.clientX - x, e.clientY - fy) < 250) wake();
    });
    addEventListener("resize", () => { vw = innerWidth; vh = innerHeight; groundY = vh - GROUND; scan(); });
    let scrollScan = 0; addEventListener("scroll", () => { scrollScan = 0.15; wake(); }, { passive: true });


    // ---------- Yara (Milo's owner) + random end-of-page scenes ----------
    const YW = 18, YH = 27, YPW = YW * S, YPH = YH * S;
    const YPAL = { h: "#1F1716", s: "#C98E66", c: "#E08A7E", k: "#1E1716", m: "#8E3B3B", t: "#FFFFFF", y: "#F6B8C8", Y: "#EC9DB2", j: "#F6B8C8", J: "#E68BA3", f: "#E25563", g: "#FFFFFF", w: "#F4F4F7", L: "#4A3B37" };
    // Yara: little girl, long straight dark hair (middle part), big smile, pink floral pajamas, one white sock.
    const Y_HEAD = ["...hhhhhh...", "..hhhhhhhh..", ".hhhhhhhhhh.", ".hhhhhshhhh.", "hhhhssssshhh", "hhsssssssshh", "hhsksssskshh", "hhsksssskshh", "hhcsssssschh", "hhssmttmsshh", "hh.ssssss.hh", "hh...ss...hh"];
    const Y_HAIR = [12, 13, 14, 15, 16].flatMap(r => [[r, 3, "h"], [r, 12, "h"]]);
    const LD = [[12, 2, "YY"], [13, 2, "YY"], [14, 2, "YY"], [15, 2, "ss"], [16, 2, "ss"]], RD = LD.map(([r, , t]) => [r, 12, t]);
    const RU = [[6, 14, "ss"], [7, 14, "ss"], [8, 14, "ss"], [9, 14, "YY"], [10, 14, "YY"], [11, 13, "YY"], [12, 12, "YY"]], LU = [[6, 0, "ss"], [7, 0, "ss"], [8, 0, "ss"], [9, 0, "YY"], [10, 0, "YY"], [11, 1, "YY"], [12, 2, "YY"]];
    const Y_ARMS = {
      down: LD.concat(RD), up: LU.concat(RU), wave: LD.concat(RU),
      wave2: LD.concat([[7, 13, "ss"], [8, 13, "ss"], [9, 14, "YY"], [10, 14, "YY"], [11, 13, "YY"], [12, 12, "YY"]]),
      reach: LD.concat([[12, 12, "YY"], [13, 12, "YYss"], [14, 14, "ss"]]),
      throw: LD.concat([[9, 13, "ss"], [10, 13, "ss"], [11, 12, "YY"], [12, 12, "YY"]])
    };
    const legRows = (a, b, from, to) => { const o = []; for (let r = from; r <= to; r++) o.push([r, a, "jj"], [r, b, "jj"]); return o; };
    const Y_LEGS = {
      stand: legRows(5, 9, 20, 23).concat([[24, 4, "sss"], [24, 9, "www"]]),
      walk1: legRows(5, 9, 20, 21).concat(legRows(4, 10, 22, 22), legRows(3, 11, 23, 23), [[24, 2, "sss"], [24, 11, "www"]]),
      walk2: [20, 21, 22, 23].map(r => [r, 6, "jjjj"]).concat([[24, 5, "ss"], [24, 8, "www"]]),
      air: legRows(5, 9, 20, 21).concat(legRows(4, 10, 22, 22), [[23, 3, "sss"], [23, 10, "www"]]),
      crouch: [[23, 3, "jjjjjjjjjj"], [24, 2, "sss"], [24, 11, "www"]]
    };
    function paint(g, pal, w, h) {
      const o = g.map(r => r.slice());
      for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) if (g[r][c] === "." && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => g[r + a] && g[r + a][c + b] && g[r + a][c + b] !== ".")) o[r][c] = "L";
      const cv = document.createElement("canvas"); cv.width = w * S; cv.height = h * S; const c2 = cv.getContext("2d");
      o.forEach((row, y) => row.forEach((ch, x) => { if (ch !== ".") { c2.fillStyle = pal[ch]; c2.fillRect(x * S, y * S, S, S); } }));
      return cv;
    }
    function yFrame(legs, arms, happy) {
      const g = Array.from({ length: YH }, () => Array(YW).fill("."));
      const sh = legs === "crouch" ? 3 : 0;
      const put = (r, c, t) => { for (let i = 0; i < t.length; i++) { const rr = r + 1, cc = c + 1 + i; if (t[i] !== "." && g[rr] && cc < YW) g[rr][cc] = t[i]; } };
      for (let r = 12; r < 19; r++) put(r + sh, 4, "yyyyyyyy"); put(19 + sh, 4, "JJJJJJJJ");
      Y_ARMS[arms].forEach(([r, c, t]) => put(r + sh, c, t));
      Y_HAIR.forEach(([r, c, t]) => put(r + sh, c, t));
      Y_HEAD.forEach((row, r) => put(r + sh, 2, happy && r === 8 ? row.replace(/k/g, "s") : row));
      Y_LEGS[legs].forEach(([r, c, t]) => put(r, c, t));
      for (let r = 0; r < YH; r++) for (let c = 0; c < YW; c++) if ("yYj".includes(g[r][c])) { const k = (r * 7 + c * 3) % 9; if (k === 0) g[r][c] = "f"; else if (k === 5) g[r][c] = "g"; }
      return paint(g, YPAL, YW, YH);
    }
    const YF = {
      stand: yFrame("stand", "down"), happy: yFrame("stand", "down", 1), walk1: yFrame("walk1", "down"), walk2: yFrame("walk2", "down"),
      air: yFrame("air", "up", 1), up: yFrame("stand", "up", 1), carry: yFrame("stand", "up", 1), wave: yFrame("stand", "wave", 1), wave2: yFrame("stand", "wave2", 1),
      crouch: yFrame("crouch", "down"), pet: yFrame("crouch", "reach", 1), throw: yFrame("stand", "throw")
    };
    const yShadow = el("div", "position:fixed;left:0;top:0;width:40px;height:7px;margin-top:-3px;border-radius:50%;background:rgba(13,19,33,0.2);z-index:42;pointer-events:none;display:none;");
    const yaraEl = el("div", "position:fixed;left:0;top:0;width:" + YPW + "px;height:" + YPH + "px;z-index:43;pointer-events:none;display:none;");
    const ycv = document.createElement("canvas"); ycv.width = YPW; ycv.height = YPH; ycv.style.cssText = "display:block;width:100%;height:100%;image-rendering:pixelated;transform-origin:50% 100%;";
    yaraEl.appendChild(ycv); const yctx = ycv.getContext("2d");
    const yBub = el("div", "position:fixed;left:0;top:0;max-width:220px;padding:8px 12px;border-radius:12px;background:#fff;border:1px solid rgba(13,19,33,0.1);box-shadow:0 10px 24px -12px rgba(13,19,33,0.4);font:500 13px/1.35 " + font + ";color:#0D1321;z-index:46;pointer-events:none;opacity:0;transition:opacity 200ms ease;white-space:normal;");
    const mBub = el("div", "position:fixed;left:0;top:0;padding:7px 12px;border-radius:12px;background:#fff;border:1px solid rgba(13,19,33,0.1);box-shadow:0 10px 24px -12px rgba(13,19,33,0.4);font:600 14px/1.3 " + font + ";color:#0D1321;z-index:46;pointer-events:none;opacity:0;transition:opacity 200ms ease;white-space:nowrap;");
    let mSayT = 0;
    const msay = (t, ms) => { mBub.textContent = t; mBub.style.opacity = "1"; mSayT = ms / 1000; };
    const Y = { x: -100, fy: 0, vx: 0, vy: 0, face: 1, tx: null, speed: 170, pose: "stand", lock: false, dist: 0, rf: 0, sayT: 0 };
    const mCtl = { tx: null, speed: 280, sleep: false, happy: false };
    let scene = false, held = false, endArmed = false, yarn = null, sceneZ = 0;
    const waiters = [];
    const pick = a => a[Math.random() * a.length | 0];
    const clampX = v => Math.max(HALF, Math.min(vw - HALF, v));
    let sceneAbort = null;
    // Hiding Milo cancels pending scene steps before they can reveal characters again.
    const pause = (ms, fn) => new Promise((resolve, reject) => {
      const signal = sceneAbort.signal;
      let timer, w;
      const finish = cancelled => {
        clearTimeout(timer); signal.removeEventListener("abort", abort);
        const i = waiters.indexOf(w); if (i >= 0) waiters.splice(i, 1);
        if (cancelled) reject(new DOMException("Scene cancelled", "AbortError")); else resolve();
      };
      const abort = () => finish(true);
      if (signal.aborted) { abort(); return; }
      signal.addEventListener("abort", abort, { once: true });
      if (fn) { w = { fn, r: () => finish(false) }; waiters.push(w); }
      timer = setTimeout(() => finish(false), ms);
    });
    const wait = ms => pause(ms);
    const until = (fn, ms) => pause(ms, fn);
    const ysay = (t, ms) => { yBub.textContent = t; yBub.style.opacity = "1"; Y.sayT = ms / 1000; };
    const miloTo = (tx, sp) => { tx = clampX(tx); mCtl.speed = sp || 280; if (on) jumpTo(tx, groundY, 30); mCtl.tx = tx; return until(() => mCtl.tx === null && !on && fy >= groundY - 1, 6000); };
    const yaraTo = (tx, sp) => { Y.tx = tx; Y.speed = sp || 170; return until(() => Y.tx === null, 9000); };
    const yHop = h => { Y.vy = -Math.sqrt(2 * G * h); };
    const miloHop = h => { if (!held) jumpTo(x, groundY, h); };
    const hearts = n => { for (let i = 0; i < n; i++) setTimeout(() => spawn(x + face * 18 + (Math.random() - 0.5) * 20, fy - PH + 4, "heart"), i * 140); };

    const SCENES = {
      pet: async () => {
        Y.pose = "crouch"; await wait(350); Y.pose = "pet"; mCtl.happy = true;
        ysay(pick(["Who's a good boy?", "So soft. Yes you are.", "Aww, he's purring already."]), 2400);
        for (let i = 0; i < 6; i++) { spawn(x + face * 18, fy - PH + 4, "heart"); squash = 0.12; await wait(380); }
        mCtl.happy = false; Y.pose = "stand";
      },
      race: async (side) => {
        ysay(pick(["Race you to the other side!", "Bet I'm faster today."]), 1400); await wait(900);
        const dir = -side, far = side < 0 ? vw - 80 : 80;
        Y.tx = far; Y.speed = 250; mCtl.tx = clampX(far + dir * 10); mCtl.speed = 300;
        await until(() => Y.tx === null && mCtl.tx === null, 8000);
        ysay(pick(["You win again!", "How are you so fast?!", "Okay, rematch tomorrow."]), 1700);
        miloHop(70); await wait(600); miloHop(50); await wait(800);
      },
      jumps: async () => {
        ysay(pick(["Ready? Jump!", "Hop with me!"]), 1100); await wait(600);
        for (let i = 0; i < 3; i++) {
          const h = 80 + i * 40; yHop(h); miloHop(h + 20);
          await until(() => Y.vy === 0 && Y.fy >= groundY - 0.5 && fy >= groundY - 0.5 && mode !== "air", 2200); await wait(160);
        }
        Y.pose = "up"; hearts(3); ysay("Wheee!", 1100); await wait(1000); Y.pose = "stand";
      },
      yarn: async (side) => {
        Y.pose = "throw"; ysay(pick(["Fetch, Milo!", "Go get it!"]), 1100); await wait(450);
        const dir = -side, ye = el("div", "position:fixed;left:0;top:0;width:14px;height:14px;margin:-14px 0 0 -7px;border-radius:50%;background:#F7A8B8;border:2px solid #4A3B37;box-sizing:border-box;box-shadow:inset 3px -2px 0 #E57F95;z-index:44;pointer-events:none;");
        yarn = { e: ye, x: Y.x + dir * 20, fy: Y.fy - 60, vx: dir * (420 + Math.random() * 260), vy: -560, held: false, spin: 0 };
        Y.pose = "stand";
        await until(() => { mCtl.tx = clampX(yarn.x); mCtl.speed = 360; return Math.abs(yarn.vx) < 60 && yarn.fy >= groundY - 2 && Math.abs(x - yarn.x) < 40; }, 6000);
        miloHop(40); await wait(350); yarn.held = true; hearts(1);
        await miloTo(Y.x + Math.sign(x - Y.x || 1) * 60, 240);
        yarn.held = false; yarn.vx = 0; yarn.vy = -120;
        Y.pose = "crouch"; ysay(pick(["Good catch!", "Thank you, sir.", "Again? Okay, later."]), 1600); await wait(700);
        ye.remove(); yarn = null; Y.pose = "stand"; await wait(500);
      },
      carry: async () => {
        Y.pose = "crouch"; ysay("Up you go!", 1000); await wait(500);
        held = true; Y.pose = "carry"; Y.lock = true; await wait(350);
        for (let i = 0; i < 4; i++) { Y.face *= -1; await wait(380); }
        ysay(pick(["Who's the cutest kitten?", "Look at those toe beans!", "Little loaf, up high."]), 1700); hearts(4); await wait(1400);
        Y.pose = "crouch"; await wait(250);
        held = false; x = clampX(Y.x + Y.face * 56); fy = groundY; vy = 0; vx = 0; squash = 0.45; mode = "idle";
        Y.lock = false; Y.pose = "stand"; await wait(500);
      },
      nap: async () => {
        ysay("Nap time?", 1100); Y.pose = "crouch"; await wait(600); mCtl.sleep = true;
        await wait(1200); ysay(pick(["Shh… he's out.", "Out like a light."]), 2000); await wait(2200);
        mCtl.sleep = false; squash = -0.25; Y.pose = "stand"; await wait(400);
      },
      zoomies: async (side) => {
        ysay(pick(["Uh oh… zoomies!", "Here we go again."]), 1500);
        const dir = -side;
        for (let i = 0; i < 4; i++) { await miloTo(i % 2 ? Y.x + dir * 50 : Y.x + dir * 300, 460); if (i === 2) miloHop(90); }
        Y.pose = "happy"; await wait(700); Y.pose = "stand";
      },
      wave: async () => {
        Y.pose = "wave"; ysay(pick(["Thanks for scrolling all the way down!", "Hi! We're Yara and Milo.", "Thanks for stopping by!"]), 2200);
        for (let i = 0; i < 3; i++) { miloHop(55); await wait(650); }
        Y.pose = "stand";
      }
    };
    async function runScene() {
      sceneAbort = new AbortController();
      scene = true; closeBubble(); unhighlight(); tourIdx = -1; tourToken++; wake();
      try {
        const side = Math.random() < 0.5 ? -1 : 1, home = side < 0 ? 64 : vw - 64;
        Y.x = side < 0 ? -50 : vw + 50; Y.fy = groundY; Y.vx = Y.vy = 0; Y.pose = "stand"; Y.lock = false;
        yaraEl.style.display = ""; yShadow.style.display = "";
        msay("Yaraaaa! 😻", 2000); face = side; miloHop(60); hearts(2);
        await yaraTo(home, 180);
        ysay(pick(["Milo! There you are.", "Milo, come here!", "Psst, Milo!", "Found you, Milo."]), 1500);
        await miloTo(home - side * 62, 320); hearts(1);
        let keys = Object.keys(SCENES), lastK = null; try { lastK = sessionStorage.getItem("yl-scene-last"); } catch { /* Storage may be unavailable in private browsing. */ }
        if (keys.length > 1) keys = keys.filter(k => k !== lastK);
        const k = pick(keys); try { sessionStorage.setItem("yl-scene-last", k); } catch { /* Storage may be unavailable in private browsing. */ }
        await SCENES[k](side);
        await wait(300);
        Y.pose = "wave"; ysay(pick(["Bye! Come say hi anytime.", "See you soon!", "Okay, back to work, Milo."]), 1500); await wait(1300);
        Y.pose = "stand"; await yaraTo(Y.x < vw / 2 ? -60 : vw + 60, 200);
      } catch (error) {
        if (error.name !== "AbortError") console.error("Milo scene failed", error);
      } finally {
        if (yarn) { yarn.e.remove(); yarn = null; }
        yaraEl.style.display = "none"; yShadow.style.display = "none"; yBub.style.opacity = "0"; mBub.style.opacity = "0";
        held = false; mCtl.tx = null; mCtl.sleep = mCtl.happy = false; scene = false; mode = "idle"; modeT = 2;
      }
    }
    function stepScene(dt, now) {
      const docH = document.documentElement.scrollHeight, atEnd = scrollY + vh >= docH - 80;
      if (scrollY + vh < docH - 500) endArmed = true;
      if (atEnd && endArmed && !scene && !dragging && tourIdx < 0 && !reduce) { endArmed = false; runScene(); }
      for (let i = waiters.length - 1; i >= 0; i--) if (waiters[i].fn()) { const w = waiters.splice(i, 1)[0]; w.r(); }
      if (!scene) return;
      const yg = Y.fy >= groundY - 0.5 && Y.vy >= 0;
      if (Y.tx != null && yg) {
        const d = Y.tx - Y.x;
        if (Math.abs(d) < 5) Y.tx = null;
        else { Y.vx += Math.sign(d) * 1400 * dt; Y.vx = Math.max(-Y.speed, Math.min(Y.speed, Y.vx)); if (Math.abs(d) < 30) Y.vx *= Math.exp(-8 * dt); }
      } else if (yg) Y.vx *= Math.exp(-12 * dt);
      if (!yg || Y.vy < 0) Y.vy += G * dt;
      Y.x += Y.vx * dt; Y.fy += Y.vy * dt;
      if (Y.fy >= groundY) { if (Y.vy > 350) for (let i = 0; i < 5; i++) spawn(Y.x, groundY, "dust"); Y.fy = groundY; Y.vy = 0; }
      if (!Y.lock) { if (Math.abs(Y.vx) > 12) Y.face = Math.sign(Y.vx); else Y.face = Math.sign(x - Y.x) || Y.face; }
      let f;
      if (Y.fy < groundY - 0.5) f = YF.air;
      else if (Math.abs(Y.vx) > 15) { Y.dist += Math.abs(Y.vx) * dt; if (Y.dist > 11) { Y.dist = 0; Y.rf ^= 1; } f = Y.rf ? YF.walk1 : YF.walk2; }
      else f = Y.pose === "wave" ? (Math.floor(now / 260) % 2 ? YF.wave : YF.wave2) : YF[Y.pose] || YF.stand;
      yctx.clearRect(0, 0, YPW, YPH); yctx.drawImage(f, 0, 0);
      const yst = Y.fy < groundY - 0.5 ? Math.min(0.12, Math.abs(Y.vy) / 2600) : 0;
      ycv.style.transform = "scale(" + (Y.face * (1 - yst * 0.5)).toFixed(3) + "," + (1 + yst).toFixed(3) + ")";
      yaraEl.style.transform = "translate(" + (Y.x - YPW / 2).toFixed(1) + "px," + (Y.fy - YPH).toFixed(1) + "px)";
      const yh = Math.min(1, (groundY - Y.fy) / 300);
      yShadow.style.transform = "translate(" + (Y.x - 20).toFixed(1) + "px," + groundY.toFixed(1) + "px) scale(" + (1 - yh * 0.6).toFixed(3) + ")";
      if (Y.sayT > 0) { Y.sayT -= dt; if (Y.sayT <= 0) yBub.style.opacity = "0"; }
      const bw = yBub.offsetWidth, bh = yBub.offsetHeight;
      yBub.style.transform = "translate(" + Math.max(8, Math.min(vw - bw - 8, Y.x - bw / 2)).toFixed(1) + "px," + (Y.fy - YPH - bh - 10).toFixed(1) + "px)";
      if (mSayT > 0) { mSayT -= dt; if (mSayT <= 0) mBub.style.opacity = "0"; }
      { const mw = mBub.offsetWidth, mh = mBub.offsetHeight; mBub.style.transform = "translate(" + Math.max(8, Math.min(vw - mw - 8, x - mw / 2)).toFixed(1) + "px," + (fy - PH - mh - 8).toFixed(1) + "px)"; }
      if (mCtl.sleep) { sceneZ -= dt; if (sceneZ <= 0) { sceneZ = 1; spawn(x + face * 24, fy - 30, "z"); } }
      if (yarn) {
        if (yarn.held) { yarn.x = x + face * 30; yarn.fy = fy - 12; }
        else {
          yarn.vy += G * dt; yarn.x += yarn.vx * dt; yarn.fy += yarn.vy * dt;
          if (yarn.fy >= groundY) { yarn.fy = groundY; yarn.vy = Math.abs(yarn.vy) > 160 ? -Math.abs(yarn.vy) * 0.55 : 0; yarn.vx *= yarn.vy === 0 ? Math.exp(-3 * dt) : 0.85; }
          if (yarn.x < 10) { yarn.x = 10; yarn.vx = Math.abs(yarn.vx) * 0.6; } if (yarn.x > vw - 10) { yarn.x = vw - 10; yarn.vx = -Math.abs(yarn.vx) * 0.6; }
          yarn.spin += yarn.vx * dt * 2;
        }
        yarn.e.style.transform = "translate(" + yarn.x.toFixed(1) + "px," + yarn.fy.toFixed(1) + "px) rotate(" + yarn.spin.toFixed(0) + "deg)";
      }
    }

    // ---------- loop ----------
    let last = performance.now(), scanT = 0, frameId = 0;
    function loop(now) {
      if (hidden) return;
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      scanT -= dt; if (scrollScan > 0 && (scrollScan -= dt) <= 0) scanT = 0;
      if (scanT <= 0) { scan(); scanT = 1.2; }
      readPlats(vh);
      if (ignoreT > 0 && (ignoreT -= dt) <= 0) ignoreEl = null;

      // ride the platform (it moves when the page scrolls)
      if (on && !dragging) {
        const p = platOf(on);
        if (!p) { on = null; mode = "air"; if (fy < 90) vy = Math.max(vy, 0); }
        else {
          const dy = p.t - fy; fy = p.t;
          if (Math.abs(dy) > 30 && dy < 0) { vy = 0; }
          if (x < p.l - HALF * 0.5 || x > p.r + HALF * 0.5) { on = null; mode = "air"; ignoreEl = p.e; ignoreT = 0.2; }
        }
      }
      const grounded = !dragging && (on || fy >= groundY - 0.5) && vy >= 0;

      if (held && !dragging) { x = Y.x; fy = Y.fy - YPH + 22; vx = 0; vy = 0; on = null; mode = "air"; }
      if (!dragging && !held) {
        const idleFor = (now - lastInteract) / 1000;
        if (!sleeping && idleFor > 30 && grounded && mode === "idle" && !bubbleOpen) sleeping = true;
        hoverCd -= dt;
        if (scene && grounded && mCtl.tx != null) {
          const d = mCtl.tx - x;
          if (on) jumpTo(mCtl.tx, groundY, 30);
          else if (Math.abs(d) < 8) { mCtl.tx = null; vx *= 0.3; }
          else { vx += Math.sign(d) * 1800 * dt; vx = Math.max(-mCtl.speed, Math.min(mCtl.speed, vx)); if (Math.abs(d) < 40) vx *= Math.exp(-6 * dt); }
        }
        if (grounded && !sleeping && !reduce && !pending && tourIdx < 0 && !scene) {
          // follow your attention: rest the cursor on a card and Milo hops onto it
          if (mouse.el && mouse.el !== on && now - mouse.since > 1400 && now - mouse.t < 4000 && hoverCd <= 0 && platOf(mouse.el)) { hoverCd = 5; wake(); jumpOnto(mouse.el); }
          else {
            modeT -= dt;
            if (modeT <= 0) {
              const r = Math.random(), surf = on ? platOf(on) : { l: HALF, r: vw - HALF };
              const reach = plats.filter(p => p.e !== on && Math.abs((p.l + p.r) / 2 - x) < 700 && p.t > 100 && p.r - p.l > 70);
              if (r < 0.45 && reach.length) jumpOnto(reach[Math.random() * reach.length | 0].e);
              else if (r < 0.6 && on) { jumpTo(Math.max(HALF, Math.min(vw - HALF, x + (Math.random() - 0.5) * 300)), groundY, 40); ignoreEl = on; ignoreT = 0.35; }
              else if (mode === "idle") { mode = "walk"; walkTo = Math.max(surf.l + HALF * 0.5, Math.min(surf.r - HALF * 0.5, x + (Math.random() - 0.5) * 360)); }
              else mode = "idle";
              modeT = 2.5 + Math.random() * 3;
            }
          }
          if (mode === "walk") {
            const d = walkTo - x;
            if (Math.abs(d) < 6) { mode = "idle"; }
            else { vx += Math.sign(d) * 900 * dt; vx = Math.max(-140, Math.min(140, vx)); if (Math.abs(d) < 50) vx *= Math.exp(-6 * dt); }
          }
        }
        if (grounded && mode !== "walk" && !(scene && mCtl.tx != null)) vx *= Math.exp(-12 * dt);
        if (!grounded) mode = "air"; else if (mode === "air") mode = "idle";

        const prevFy = fy;
        if (!grounded || vy < 0) vy += G * dt; else vy = 0;
        vx *= Math.exp(-0.2 * dt);
        x += vx * dt; fy += vy * dt;

        // land on platforms (one-way: only from above, only when falling)
        if (vy > 0 && !on && !scene) {
          for (const p of plats) {
            if (p.e === ignoreEl || x < p.l || x > p.r) continue;
            if (prevFy <= p.t + 4 && fy >= p.t) { land(p.t, p.e); break; }
          }
        }
        if (fy >= groundY) { if (!grounded) land(groundY, null); else fy = groundY; }
        if (x < HALF) { x = HALF; vx = Math.abs(vx) * 0.55; }
        if (x > vw - HALF) { x = vw - HALF; vx = -Math.abs(vx) * 0.55; }
        if (fy < PH && vy < 0) { fy = PH; vy = Math.abs(vy) * 0.3; }
        if (on) { const p = platOf(on); if (p && mode === "walk") walkTo = Math.max(p.l + HALF * 0.4, Math.min(p.r - HALF * 0.4, walkTo)); }
      }
      if (pending && now > pending.deadline) { const cb = pending.onLand; pending = null; if (cb) cb(); }

      function land(top, e) {
        const impact = Math.min(1, vy / 1800);
        if (vy > 450 && !e && !pending) {
          squash = Math.max(squash, 0.25 + impact * 0.5);
          for (let i = 0; i < 4 + impact * 8; i++) spawn(x, top, "dust");
          fy = top; vy = -vy * 0.3; vx *= 0.7; return;
        }
        squash = Math.max(squash, 0.18 + impact * 0.45);
        if (vy > 300) for (let i = 0; i < 3 + impact * 6; i++) spawn(x, top, "dust");
        fy = top; vy = 0; vx *= e ? 0.25 : 0.5; on = e; mode = "idle"; modeT = 1.5 + Math.random() * 2;
        if (pending) { const cb = pending.onLand; pending = null; if (cb) cb(); }
      }

      // facing
      if (Math.abs(vx) > 12) face = Math.sign(vx);
      else if (bubbleOpen && ringEl) { const r = ringEl.getBoundingClientRect(); const cx = (r.left + r.right) / 2; if (Math.abs(cx - x) > 40) face = Math.sign(cx - x); }
      else if (!sleeping && now - mouse.t < 3000 && Math.abs(mouse.x - x) > 20) face = Math.sign(mouse.x - x);
      if (scene && Math.abs(vx) <= 12) face = held ? Y.face : (Math.sign(Y.x - x) || face);

      // frame
      let fr;
      const gnd = !dragging && mode !== "air";
      if (!gnd) fr = FR.air;
      else if (sleeping || (scene && mCtl.sleep)) fr = FR.sleep;
      else if (scene && mCtl.happy) fr = FR.blink;
      else if (Math.abs(vx) > 18) { distAcc += Math.abs(vx) * dt; if (distAcc > 9) { distAcc = 0; runFrame ^= 1; } fr = runFrame ? FR.run1 : FR.run2; }
      else { blinkT -= dt; if (blinkT <= 0) { blinking = 0.12; blinkT = 2 + Math.random() * 4; } if (blinking > 0) blinking -= dt; fr = blinking > 0 ? FR.blink : (Math.floor(now / 650) % 2 ? FR.idle2 : FR.idle); }
      if (reduce) fr = FR.idle;
      ctx.clearRect(0, 0, PW, PH); ctx.drawImage(fr, 0, 0);

      squash *= Math.exp(-9 * dt);
      const stretch = gnd ? 0 : Math.min(0.16, Math.abs(vy) / 2400);
      const breathe = gnd && !reduce ? Math.sin(now / (sleeping ? 700 : 400)) * (sleeping ? 0.04 : 0.015) : 0;
      const sy = 1 - squash * 0.4 + stretch + breathe, sx = 1 + squash * 0.3 - stretch * 0.6;
      const tilt = dragging ? Math.max(-25, Math.min(25, pv.x / 60)) : (!gnd ? Math.max(-14, Math.min(14, vx / 50)) * face : 0);
      cv.style.transform = "rotate(" + tilt.toFixed(2) + "deg) scale(" + (face * sx).toFixed(3) + "," + sy.toFixed(3) + ")";
      pet.style.transform = "translate(" + (x - HALF).toFixed(1) + "px," + (fy - PH).toFixed(1) + "px)";

      // shadow on whatever surface is below
      let below = groundY;
      for (const p of plats) if (x >= p.l && x <= p.r && p.t >= fy - 1 && p.t < below) below = p.t;
      const hgt = Math.min(1, (below - fy) / 300);
      shadow.style.transform = "translate(" + (x - 23).toFixed(1) + "px," + below.toFixed(1) + "px) scale(" + (1 - hgt * 0.6).toFixed(3) + ")";
      shadow.style.opacity = (1 - hgt * 0.8).toFixed(2);

      if (sleeping) { zT -= dt; if (zT <= 0) { zT = 1.1; spawn(x + face * 24, fy - PH + 14, "z"); } }

      // highlight ring
      if (ringEl) {
        if (!ringEl.isConnected) { ringEl = null; ringPrev = null; }
        else if (!bubbleOpen && (ringT -= dt) <= 0) { if (ringT > -0.05) ringEl.style.outlineColor = "rgba(243,154,60,0)"; if (ringT < -0.4) unhighlight(); }
      }

      if (ringEl && tourIdx < 0 && !pending && !dragging && on !== ringEl) unhighlight();

      // bubble follows
      if (bubbleOpen) {
        if (!bubbleHover) { bubbleTimer -= dt; if (bubbleTimer <= 0) closeBubble(); }
        const bh = bubble.offsetHeight, bl = Math.max(12, Math.min(vw - 284, x - 136));
        let bt = fy - PH - 14 - bh, flip = false;
        if (bt < 76) { bt = fy + 14; flip = true; }
        bt = Math.max(80, Math.min(vh - bh - 12, bt));
        bubble.style.left = bl.toFixed(1) + "px"; bubble.style.top = bt.toFixed(1) + "px";
        const tail = q("tail"); tail.style.left = Math.max(14, Math.min(246, x - bl - 6)).toFixed(1) + "px";
        tail.style.bottom = flip ? "auto" : "-7px"; tail.style.top = flip ? "-7px" : "auto"; tail.style.transform = flip ? "rotate(225deg)" : "rotate(45deg)";
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; p.life -= dt;
        if (p.life <= 0) { p.d.remove(); particles.splice(i, 1); continue; }
        p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.y > p.floor) { p.y = p.floor; p.vy *= -0.3; p.vx *= 0.6; }
        p.d.style.transform = "translate(" + p.x.toFixed(1) + "px," + p.y.toFixed(1) + "px)"; p.d.style.opacity = (p.life / p.max).toFixed(2);
      }
      stepScene(dt, now);
      frameId = requestAnimationFrame(loop);
    }

    if (hidden) { [pet, shadow].forEach(e => e.style.display = "none"); egg.style.display = "inline-flex"; }
    else {
      setTimeout(() => { if (!hidden) { scan(); last = performance.now(); cancelAnimationFrame(frameId); frameId = requestAnimationFrame(loop); } }, 400);
      let greeted = false; try { greeted = sessionStorage.getItem("yl-pet-greeted-" + page) === "1"; sessionStorage.setItem("yl-pet-greeted-" + page, "1"); } catch { /* Storage may be unavailable in private browsing. */ }
      if (!greeted) setTimeout(() => { if (!hidden && !bubbleOpen) offerTour(); }, 2200);
    }
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
