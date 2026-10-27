import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { WORK_PROJECTS } from '../components/work-projects.js';

const base = process.env.QA_BASE_URL || 'http://localhost:3000';
await mkdir('outputs/qa', { recursive: true });
const browser = await chromium.launch();
const errors = [];
async function open(options) {
  const page = await browser.newPage(options);
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('yl-pet-hidden', '1'));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return page;
}
async function checkPanel(panel, index) {
  await expect(panel).toHaveAttribute('href', WORK_PROJECTS[index].href);
  await expect(panel).toHaveAccessibleName(WORK_PROJECTS[index].name);
  await expect.poll(() => panel.evaluate(card => {
    const box = card.getBoundingClientRect();
    return [...card.querySelectorAll('.yl-proj__top, .yl-proj__name, .yl-proj__stack, .yl-proj__blurb, .yl-metric, .yl-bar__val, .yl-proj__cta')]
      .filter(el => { const r = el.getBoundingClientRect(); return r.left < box.left || r.right > box.right || r.top < box.top || r.bottom > box.bottom; })
      .map(el => el.textContent.trim());
  }), { message: 'Expanded content stays within its panel after layout settles' }).toEqual([]);
  for (let i = 0; i < 2; i++) {
    const metric = panel.locator('.yl-metric').nth(i);
    const lengths = await metric.locator('.yl-bar__fill').evaluateAll(els => els.map(el => el.getBoundingClientRect().width / el.parentElement.getBoundingClientRect().width * 100));
    assert.ok(Math.abs(lengths[0] - WORK_PROJECTS[index].metrics[i].b) < 3);
    assert.ok(Math.abs(lengths[1] - WORK_PROJECTS[index].metrics[i].a) < 3);
  }
}
try {
  const page = await open({ viewport: { width: 1440, height: 1000 } });
  const work = page.locator('#work'), panels = work.locator('.yl-proj');
  assert.deepEqual(await page.locator('[data-screen-label]').evaluateAll(els => els.map(el => el.dataset.screenLabel).slice(3, 6)), ['How we work', 'Work that paid off', 'Testimonials']);
  await expect(panels).toHaveCount(3);
  await expect(work.locator('.is-ready')).toHaveCount(0);
  await work.scrollIntoViewIfNeeded();
  await expect(panels.first()).toHaveClass(/is-ready/);
  await page.waitForTimeout(3600);
  await checkPanel(panels.first(), 0);
  const widths = await panels.evaluateAll(els => els.map(el => el.getBoundingClientRect().width));
  assert.ok(widths[0] > widths[1] * 1.8 && widths.every(width => width >= 260));
  await page.screenshot({ path: 'outputs/qa/work-desktop.png' });

  // Watch a shrinking After bar start at the old value, then converge to the new one.
  await panels.nth(1).hover();
  const ratio = () => panels.nth(1).locator('.yl-bar__fill--after').first().evaluate(el => el.getBoundingClientRect().width / el.parentElement.getBoundingClientRect().width);
  assert.ok(await ratio() > .95);
  await page.waitForTimeout(650);
  assert.ok(await ratio() > .95, 'After waits for the Before sequence');
  await page.waitForTimeout(1000);
  const mid = await ratio(); assert.ok(mid > .13 && mid < .95, 'After visibly shrinks');
  await page.waitForTimeout(1900);
  await checkPanel(panels.nth(1), 1);
  await panels.nth(2).hover(); await page.waitForTimeout(3600);
  await checkPanel(panels.nth(2), 2);
  assert.ok(await panels.nth(2).evaluate(el => el.style.getPropertyValue('--mx')), 'Pointer glow follows cursor');
  await page.screenshot({ path: 'outputs/qa/work-desktop-inka.png' });
  await page.close();

  for (const width of [1440, 1140, 1139, 1000, 390, 320]) {
    const page = await open({ viewport: { width, height: 950 }, reducedMotion: 'reduce' });
    const work = page.locator('#work'), panels = work.locator('.yl-proj');
    await work.locator('.yl-work__all').focus();
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab'); await expect(panels.nth(i)).toBeFocused();
      await expect(panels.nth(i)).toHaveClass(/is-ready/);
      await checkPanel(panels.nth(i), i);
      assert.equal(await panels.nth(i).evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
      if (width === 390) await page.screenshot({ path: `outputs/qa/work-mobile-${i}.png` });
    }
    assert.equal(await panels.filter({ has: page.locator('.yl-proj__name') }).count(), 3);
    await expect(work.locator('.is-active')).toHaveCount(width < 1140 ? 3 : 1);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.setViewportSize({ width: width < 1140 ? 1440 : 390, height: 950 });
    await expect(work.locator('.is-active')).toHaveCount(width < 1140 ? 1 : 3);
    await panels.nth(2).press('Enter'); await page.waitForURL('**/projects/inka-arthouse');
    console.log(`PASS work ${width}: layout, labels, links, keyboard, resize, reduced motion`);
    await page.close();
  }
  const nojs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
  await nojs.goto(base); await nojs.locator('#work').scrollIntoViewIfNeeded();
  await expect(nojs.locator('.yl-proj__body').first()).toHaveCSS('opacity', '1');
  await nojs.locator('.yl-proj').first().click(); await nojs.waitForURL('**/projects/colliers-catering');
  await nojs.close();
  assert.deepEqual(errors, []);
  console.log('PASS work: before/after animation, progressive enhancement and browser errors');
} finally { await browser.close(); }
