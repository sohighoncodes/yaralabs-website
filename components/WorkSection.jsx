"use client";

import { memo, useEffect, useRef } from 'react';
import { WORK_PROJECTS } from './work-projects';

function Metric({ metric, index }) {
  const { label, before, after, b, a, delta } = metric;
  const element = useRef(null);
  useEffect(() => {
    // Follow the actual animated width, including shrinking bars, so labels never
    // jump outside the track at the start of the before/after transition.
    const observer = new ResizeObserver(entries => entries.forEach(({ target }) => {
      const label = target.firstElementChild;
      const width = target.getBoundingClientRect().width;
      const track = target.parentElement.getBoundingClientRect().width;
      label.classList.toggle('is-inside', width > track * 0.45 && width >= label.scrollWidth);
    }));
    element.current.querySelectorAll('.yl-bar__fill').forEach(fill => observer.observe(fill));
    return () => observer.disconnect();
  }, []);
  return <div ref={element} className="yl-metric" style={{ '--b': b, '--a': a, '--d': 380 + index * 260 }}>
    <div className="yl-metric__head">
      <span className="yl-metric__label">{label}</span>
      <span className="yl-metric__delta">{delta}</span>
    </div>
    <div className="yl-metric__grid">
      <span className="yl-metric__k">Before</span>
      <div className="yl-bar"><div className="yl-bar__fill yl-bar__fill--before">
        <span className={`yl-bar__val${b > 45 ? ' is-inside' : ''}`}>{before}</span>
      </div></div>
      <span className="yl-metric__k yl-metric__k--after">After</span>
      <div className="yl-bar yl-bar--after"><div className="yl-bar__fill yl-bar__fill--after">
        <span className={`yl-bar__val${a > 45 ? ' is-inside' : ''}`}>{after}</span>
      </div></div>
    </div>
  </div>;
}

function WorkSection() {
  const section = useRef(null);
  useEffect(() => {
    const root = section.current;
    const cards = [...root.querySelectorAll('.yl-proj')];
    const compact = window.matchMedia('(max-width: 1139px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const visibleCards = new Set();
    let active = 0, seen = false, timer;
    root.classList.add('is-enhanced');
    function apply() {
      root.classList.toggle('is-stacked', compact.matches);
      cards.forEach((card, index) => {
        const open = compact.matches || (seen && index === active);
        card.classList.toggle('is-active', open);
        card.classList.toggle('is-ready', open && (compact.matches ? visibleCards.has(card) : seen));
      });
    }
    function select(index) {
      root.classList.add('is-in');
      seen = true; active = index; visibleCards.add(cards[index]); apply();
    }
    const listeners = cards.map((card, index) => {
      const enter = event => {
        if (!compact.matches && event.pointerType !== 'touch' && !root.querySelector(':focus-visible')) select(index);
      };
      const focus = () => select(index);
      const move = event => {
        if (reduced.matches || compact.matches) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        card.style.setProperty('--my', `${event.clientY - rect.top}px`);
      };
      card.addEventListener('pointerenter', enter);
      card.addEventListener('focus', focus);
      card.addEventListener('pointermove', move, { passive: true });
      return () => {
        card.removeEventListener('pointerenter', enter);
        card.removeEventListener('focus', focus);
        card.removeEventListener('pointermove', move);
      };
    });
    const reveal = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      root.classList.add('is-in'); reveal.disconnect();
    }, { rootMargin: '0px 0px -15% 0px' });
    reveal.observe(root);
    // On phones each result animates when reached, not offscreen with the first card.
    const results = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        visibleCards.add(entry.target); results.unobserve(entry.target);
      });
      if (!visibleCards.size) return;
      root.classList.add('is-in');
      if (!seen && !timer) timer = window.setTimeout(() => { seen = true; apply(); }, reduced.matches ? 0 : 500);
      apply();
    }, { rootMargin: '0px 0px -15% 0px' });
    cards.forEach(card => results.observe(card));
    compact.addEventListener('change', apply);
    reduced.addEventListener('change', apply);
    apply();
    return () => {
      clearTimeout(timer); reveal.disconnect(); results.disconnect();
      listeners.forEach(remove => remove());
      compact.removeEventListener('change', apply);
      reduced.removeEventListener('change', apply);
      root.classList.remove('is-enhanced', 'is-in', 'is-stacked');
      cards.forEach(card => card.classList.remove('is-active', 'is-ready'));
    };
  }, []);

  return <section ref={section} className="yl-work" id="work" data-screen-label="Work that paid off" aria-labelledby="yl-work-title">
    <div className="yl-work__head">
      <h2 className="yl-work__title" id="yl-work-title">
        <span>Work</span>{' '}<span style={{ transitionDelay: '90ms' }}>that</span>{' '}
        <em><span style={{ transitionDelay: '180ms' }}>paid</span>{' '}<span style={{ transitionDelay: '270ms' }}>off.</span></em>
      </h2>
      <a className="yl-work__all" href="/projects">All projects <span aria-hidden="true">→</span></a>
    </div>
    <div className="yl-work__row">
      {WORK_PROJECTS.map((project, index) => <a key={project.href} className="yl-proj" href={project.href} aria-labelledby={`work-project-${index}`}>
        <div className="yl-proj__glow" aria-hidden="true" />
        <div className="yl-proj__ghost" aria-hidden="true">0{index + 1}</div>
        <div className="yl-proj__top">
          <span className="yl-proj__num" aria-hidden="true">0{index + 1}</span>
          <span className="yl-proj__tag">{project.tag}</span>
          <span className="yl-proj__arrow" aria-hidden="true">→</span>
        </div>
        <div className="yl-proj__bottom">
          <div>
            <h3 className="yl-proj__name" id={`work-project-${index}`}>{project.name}</h3>
            <div className="yl-proj__stack">{project.stack}</div>
          </div>
          <div className="yl-fold yl-proj__stat"><div><div className="yl-proj__statin">
            <span className="yl-proj__big">{project.stat}</span><span className="yl-proj__biglabel">{project.statLabel}</span>
          </div></div></div>
          <div className="yl-fold yl-proj__more"><div><div className="yl-proj__body">
            <p className="yl-proj__blurb">{project.blurb}</p>
            {project.metrics.map((metric, i) => <Metric key={metric.label} metric={metric} index={i} />)}
            <span className="yl-proj__cta">Read the case study <span aria-hidden="true">→</span></span>
          </div></div></div>
        </div>
      </a>)}
    </div>
  </section>;
}

export default memo(WorkSection);
