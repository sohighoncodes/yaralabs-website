import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
import { calendarFixture } from './booking-fixture.mjs';

const base = process.env.QA_BASE_URL || 'http://localhost:3000';
const routes = JSON.parse(await readFile('scripts/routes.json', 'utf8'));
const browser = await chromium.launch();
await mkdir('outputs/qa', { recursive: true });
const errors = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await context.addInitScript(() => localStorage.setItem('yl-pet-hidden', '1'));
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
    let payload, saves = 0, fail = false;
    await page.route('**/api/inquiries', async route => {
      saves++; payload = route.request().postDataJSON();
      await route.fulfill({ status: fail ? 503 : 201, contentType: 'application/json', body: JSON.stringify(fail ? { error: 'Unavailable' } : { saved: true }) });
    });
    await page.route('**/api/booking/availability', route => route.fulfill({ json: calendarFixture() }));
    await page.route('**/api/booking/reserve', route => { const input = route.request().postDataJSON(); return route.fulfill({ json: { confirmed: true, start: input.start, end: new Date(Date.parse(input.start) + 1800000).toISOString(), meet: null } }); });
    for (const { route } of routes) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      await page.locator('.nav-book').click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText('Let’s talk about your business.');
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
      const original = saves;
      await dialog.getByRole('button', { name: 'Continue to booking' }).click();
      assert.equal(saves, original, 'Empty form is not submitted');
      assert.equal(await page.locator('iframe.booking-calendar').count(), 0, 'Calendar loads only after saving details');
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(page.locator('.nav-book')).toBeFocused();
      if (width === 390) await page.getByRole('button', { name: 'Open menu', exact: true }).click();
      await page.getByRole('link', { name: 'Get a quote', exact: true }).first().click();
      await expect(dialog).toContainText('Let’s scope your project.');
      await dialog.getByLabel('Name', { exact: true }).fill('QA visitor');
      await dialog.getByLabel('Email', { exact: true }).fill('qa@example.com');
      await dialog.getByLabel('Phone', { exact: true }).fill('+1 202 555 0148');
      await dialog.getByLabel('Tools you currently use').fill('Slack, HubSpot and spreadsheets');
      await dialog.getByLabel('How can we help?').fill('Automate the handoff from new leads to onboarding.');
      if (route === '/') {
        await page.screenshot({ path: `outputs/qa/quote-form-${width}.png` });
        fail = true;
        await dialog.getByRole('button', { name: 'Continue to booking' }).click();
        await expect(dialog.getByRole('alert')).toBeVisible();
        await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue('QA visitor');
        assert.equal(await page.locator('iframe.booking-calendar').count(), 0, 'Failure does not claim success');
        fail = false;
      }
      await dialog.getByRole('button', { name: 'Continue to booking' }).click();
      await expect(dialog.locator('.native-calendar')).toBeVisible();
      assert.equal(payload.intent, 'quote'); assert.equal(payload.source, route);
      assert.equal(payload.email, 'qa@example.com'); assert.equal(payload.tools, 'Slack, HubSpot and spreadsheets');
      await expect(dialog.locator('iframe')).toHaveCount(0);
      await dialog.locator('.calendar-slots button').first().click();
      await dialog.getByRole('button', { name: 'Confirm booking' }).click();
      await expect(dialog).toContainText('You’re booked.');
      assert.ok(await dialog.evaluate(e => e.scrollWidth <= e.clientWidth + 1), 'No horizontal modal overflow');
      await dialog.getByRole('button', { name: 'Close booking window' }).click();
      assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
      console.log(`PASS ${width} ${route}: call modal, quote form, validation, save, calendar, close`);
    }
    await context.close();
  }
  assert.deepEqual(errors, []);
} finally { await browser.close(); }
