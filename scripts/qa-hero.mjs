import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const base = process.env.QA_BASE_URL || 'http://localhost:3000';
const routes = ['/', '/services', '/projects', '/projects/colliers-catering', '/projects/us-medical-directors', '/projects/inka-arthouse'];
const browser = await chromium.launch();
await mkdir('outputs/qa', { recursive: true });
const errors = [];
const dark = page => page.locator('div[aria-hidden="true"]').filter({ has: page.locator('[data-yl-aurora]') });
const zone = page => page.locator('div[style*="--yl-ink:"]');
async function scrollTo(page, y) {
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y);
  await page.waitForTimeout(100);
}
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }, { width: 2560, height: 1360 }, { width: 3840, height: 2160 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    await context.addInitScript(() => localStorage.setItem('yl-pet-hidden', '1'));
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    for (const route of routes) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      await expect(dark(page)).toHaveCSS('opacity', '0');
      await expect(zone(page)).toHaveCSS('color', 'rgb(13, 19, 33)');
      const sectionTop = await zone(page).evaluate(e => e.getBoundingClientRect().top + scrollY);
      // Enter the actual content section, preserving the intended dark treatment.
      await scrollTo(page, Math.max(sectionTop - 100, viewport.height * 0.45));
      await expect(dark(page)).toHaveCSS('opacity', '1');
      await expect(zone(page)).toHaveCSS('color', 'rgb(243, 245, 250)');
      // Returning to the hero resets its canvas without a reload.
      await scrollTo(page, 0);
      await expect(dark(page)).toHaveCSS('opacity', '0');
      await page.reload({ waitUntil: 'networkidle' });
      await expect(dark(page)).toHaveCSS('opacity', '0');
      console.log(`PASS ${viewport.width}x${viewport.height} ${route}: light arrival, dark section, return to top and reload`);
    }
    await context.close();
  }
  // Real entrance animations must settle sharply and remain light after resizing.
  const page = await browser.newPage({ viewport: { width: 2560, height: 1360 } });
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => localStorage.setItem('yl-pet-hidden', '1'));
  for (const route of ['/services', '/projects']) {
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2600);
    await expect(dark(page)).toHaveCSS('opacity', '0');
    const words = page.locator('h1 [data-yl-word]');
    for (const word of await words.all()) {
      await expect(word).toHaveCSS('opacity', '1');
      assert.ok(['none', 'blur(0px)'].includes(await word.evaluate(e => getComputedStyle(e).filter)));
    }
    await page.screenshot({ path: `outputs/qa/${route.slice(1)}-hero-clear.png` });
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(dark(page)).toHaveCSS('opacity', '0');
    await page.setViewportSize({ width: 2560, height: 1360 });
    await expect(dark(page)).toHaveCSS('opacity', '0');
  }
  assert.deepEqual(errors, []);
  console.log('PASS: animated heroes remain sharp and light, including viewport resize.');
} finally { await browser.close(); }
