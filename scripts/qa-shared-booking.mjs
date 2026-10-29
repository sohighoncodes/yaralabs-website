import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { calendarFixture } from './booking-fixture.mjs';

const base = process.env.QA_BASE_URL || 'http://localhost:3000';
const browser = await chromium.launch();
await mkdir('outputs/qa', { recursive: true });
const errors = [];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => errors.push(error.message));
    let payload, saves = 0;
    await page.route('**/api/leads', route => route.fulfill({ json: { saved: true, status: 'in_progress' } }));
    await page.route('**/api/inquiries', route => {
      saves++; payload = route.request().postDataJSON();
      return route.fulfill({ status: 201, json: { saved: true } });
    });
    await page.route('**/api/booking/availability', route => route.fulfill({ json: calendarFixture() }));
    await page.route('**/api/booking/reserve', route => route.abort());
    for (const [path, intent, title, heading] of [
      ['/quote', 'quote', 'Get a quote', 'Let’s scope your project.'],
      ['/book', 'call', 'Book a free call', 'Let’s talk about your business.'],
    ]) {
      const response = await page.goto(`${base}${path}?utm_source=instagram`, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      await expect(page).toHaveTitle(`${title} | Yara Labs`);
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText(heading);
      await expect(dialog.getByLabel('Name', { exact: true })).toBeFocused();
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `https://yaralabs.io${path}`);
      await page.reload({ waitUntil: 'networkidle' });
      await expect(dialog).toHaveCount(1);
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText(heading);
      const original = saves;
      await dialog.getByRole('button', { name: 'Continue to booking' }).click();
      assert.equal(saves, original);
      await dialog.getByLabel('Name', { exact: true }).fill('Social link QA');
      await dialog.getByLabel('Email', { exact: true }).fill('qa@example.com');
      await dialog.getByLabel('Phone', { exact: true }).fill('+1 202 555 0148');
      await dialog.getByLabel('Tools you currently use').fill('Slack, HubSpot');
      await dialog.getByLabel('How can we help?').fill('Connect our lead capture and onboarding tools.');
      await page.screenshot({ path: `outputs/qa/shared-${intent}-${width}.png` });
      await dialog.getByRole('button', { name: 'Continue to booking' }).click();
      await expect(dialog.locator('.native-calendar')).toBeVisible();
      assert.equal(payload.intent, intent);
      assert.equal(payload.source, path);
      assert.equal(new URL(page.url()).pathname, path);
      if (intent === 'quote') await dialog.getByRole('button', { name: 'Close booking window' }).click();
      else await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      assert.equal(new URL(page.url()).pathname, '/');
      assert.equal(new URL(page.url()).search, '?utm_source=instagram');
      await expect(page.locator('.nav-book')).toBeFocused();
      assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
      await page.reload({ waitUntil: 'networkidle' });
      await expect(dialog).toHaveCount(0);
      await page.locator('.nav-book').click();
      await expect(dialog).toContainText('Let’s talk about your business.');
      await page.keyboard.press('Escape');
      console.log(`PASS ${width} ${path}: auto-open, refresh, intent, calendar, dismiss, homepage`);
    }
    await page.close();
  }
  assert.deepEqual(errors, []);
} finally { await browser.close(); }
