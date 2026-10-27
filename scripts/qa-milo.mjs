import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
import { BOOKING_URL } from '../lib/booking.js';

const base = process.env.QA_BASE_URL || 'http://localhost:3000';
const routes = JSON.parse(await readFile('scripts/routes.json', 'utf8'));
await mkdir('outputs/qa', { recursive: true });
const browser = await chromium.launch();
const errors = [];
const observe = page => page.on('pageerror', error => errors.push(error.message));
const petOn = page => page.getByRole('button', { name: 'Milo, your site guide. Press for the tour.' });
const tourOn = page => page.getByRole('region', { name: "Milo's page tour" });
async function startTour(page) {
  const pet = petOn(page);
  await expect(pet).toBeVisible();
  if (await pet.getAttribute('aria-expanded') === 'true') await tourOn(page).getByRole('button', { name: 'Close', exact: true }).click();
  await pet.focus(); await pet.press('Enter');
  await tourOn(page).getByRole('button', { name: 'Show me around' }).click();
  await expect(tourOn(page)).toContainText('Stop 1 of');
}
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
    const page = await context.newPage(); observe(page);
    for (const route of routes) {
      await page.goto(base + route.route, { waitUntil: 'networkidle' });
      await startTour(page);
      assert.equal(await petOn(page).count(), 1, 'One Milo per document');
      assert.equal(await page.locator('script[src*="/assets/yara-pet.js"]').count(), 1);
      const tour = tourOn(page);
      if (route.route === '/') {
        await expect(tour.getByRole('button', { name: 'Book a call', exact: true })).toBeVisible();
        assert.equal(await page.locator('header [data-booking-link]').evaluate(el => el.style.outlineStyle), 'solid');
        for (let stop = 2; stop <= 6; stop++) {
          await tour.getByRole('button', { name: 'Next stop' }).click();
          await expect(tour).toContainText(`Stop ${stop} of 6`);
        }
        await tour.getByRole('button', { name: 'Finish', exact: true }).click();
        await expect(tour).toContainText("That's everything");
        await page.screenshot({ path: `outputs/qa/milo-tour-${width}.png` });
        await tour.getByRole('button', { name: 'Book a call', exact: true }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.getByRole('button', { name: 'Close booking window' }).click();
        await page.goto(base, { waitUntil: 'networkidle' });
        await startTour(page);
      } else {
        const intro = await tour.locator('[data-k="t"]').textContent();
        assert.ok(!intro.includes('This part is'), `Correct route introduction for ${route.route}`);
        await tour.getByRole('button', { name: 'Next stop' }).click();
        await expect(tour).toContainText('Stop 2 of');
      }
      await page.keyboard.press('Escape');
      await expect(petOn(page)).toHaveAttribute('aria-expanded', 'false');
      assert.equal(await page.locator('#milo-tour').evaluate(el => el.inert), true);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      const links = await page.locator('[data-booking-link]').evaluateAll(els => els.map(el => el.href));
      assert.ok(links.length >= 2 && links.every(href => href === BOOKING_URL));
      console.log(`PASS ${width} ${route.route}: tour, keyboard, singleton, booking links`);
    }
    await petOn(page).press('Enter');
    await tourOn(page).getByRole('button', { name: 'Hide', exact: true }).click();
    await page.reload({ waitUntil: 'networkidle' });
    await expect(petOn(page)).toBeHidden();
    await page.getByRole('button', { name: 'Bring Milo back' }).click();
    await expect(petOn(page)).toBeVisible();
    await page.waitForTimeout(400);
    const before = await petOn(page).boundingBox();
    await page.waitForTimeout(1800);
    const after = await petOn(page).boundingBox();
    assert.equal(after.x, before.x, 'Reduced motion disables autonomous wandering');
    assert.equal(after.y, before.y, 'Reduced motion disables autonomous jumping');
    await page.locator('.nav-book').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Close booking window' }).click();
    await context.close();
  }

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } }); observe(page);
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await startTour(page);
  await expect(tourOn(page).getByRole('button', { name: 'Book a call', exact: true })).toBeVisible();
  await page.screenshot({ path: 'outputs/qa/milo-desktop.png' });
  await tourOn(page).getByRole('button', { name: 'Close', exact: true }).click();
  const box = await petOn(page).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(200, 350, { steps: 12 });
  const dragged = await petOn(page).boundingBox();
  assert.ok(Math.abs(dragged.x - (200 - box.width / 2)) < 10, 'Dragging follows pointer');
  await page.mouse.up();
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect(page.locator('[data-yl-pet]').filter({ hasText: /^Yaraaaa!/ })).toHaveCSS('opacity', '1', { timeout: 10000 });
  await page.screenshot({ path: 'outputs/qa/milo-yara-scene.png' });
  // Hide while a scene is in flight; pending steps must not bring Yara back.
  await petOn(page).focus(); await petOn(page).press('Enter');
  await tourOn(page).getByRole('button', { name: 'Hide', exact: true }).click();
  await page.waitForTimeout(2500);
  const visibleSprites = await page.locator('[data-yl-pet] > canvas').evaluateAll(canvases => canvases.filter(c => getComputedStyle(c.parentElement).display !== 'none').length);
  assert.equal(visibleSprites, 0, 'Hide cancels the active scene');
  await page.getByRole('button', { name: 'Bring Milo back' }).click();
  await expect(petOn(page)).toBeVisible();
  assert.deepEqual(errors, []);
  console.log('PASS: full home tour, booking modal, persisted hide/restore, reduced motion, drag and Yara scene cancellation.');
} finally { await browser.close(); }
