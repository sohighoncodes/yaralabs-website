import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { calendarFixture } from './booking-fixture.mjs';

const browser = await chromium.launch();
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 950 }, reducedMotion: 'reduce' });
    const captured = [], submitted = [], errors = [];
    let fail = false;
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/leads', route => {
      captured.push(route.request().postDataJSON());
      return route.fulfill({ status: fail ? 503 : 200, json: fail ? { error: 'Unavailable' } : { saved: true, status: 'in_progress' } });
    });
    await page.route('**/api/inquiries', route => { submitted.push(route.request().postDataJSON()); return route.fulfill({ json: { saved: true, status: 'in_progress' } }); });
    await page.route('**/api/booking/availability', route => route.fulfill({ json: calendarFixture() }));
    await page.route('**/api/booking/reserve', route => { const d = route.request().postDataJSON(); return route.fulfill({ json: { confirmed: true, start: d.start, end: new Date(Date.parse(d.start) + 1800000).toISOString() } }); });
    const base = process.env.QA_BASE_URL || 'http://localhost:3000';
    await page.goto(`${base}/quote`, { waitUntil: 'networkidle' });
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name', { exact: true }).fill('Lead Capture QA');
    await dialog.getByLabel('Email', { exact: true }).fill('qa@example.com');
    await page.waitForTimeout(850); assert.equal(captured.length, 0);
    await dialog.getByLabel('Phone', { exact: true }).fill('+1 202 555 0148');
    await expect.poll(() => captured.length).toBeGreaterThan(0);
    await page.screenshot({ path: `outputs/qa/lead-capture-${width}.png` });
    assert.equal(submitted.length, 0); assert.equal(captured[0].tools, ''); assert.equal(captured[0].message, '');
    const id = captured[0].id, token = captured[0].token;
    const storage = await page.evaluate(() => JSON.stringify(sessionStorage));
    assert.ok(!storage.includes('qa@example.com') && !storage.includes('Lead Capture QA') && !storage.includes('+1 202 555 0148'));
    await page.reload({ waitUntil: 'networkidle' });
    await dialog.getByLabel('Name', { exact: true }).fill('Lead Capture QA');
    await dialog.getByLabel('Email', { exact: true }).fill('qa@example.com');
    await dialog.getByLabel('Phone', { exact: true }).fill('+1 202 555 0148');
    await expect.poll(() => captured.length).toBeGreaterThan(1);
    assert.equal(captured.at(-1).id, id); assert.equal(captured.at(-1).token, token);
    fail = true;
    await dialog.getByLabel('Tools you currently use').fill('Slack');
    await expect(dialog).toContainText('haven’t saved yet');
    fail = false; await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await expect(dialog).toContainText('Contact details saved.');
    await dialog.getByLabel('How can we help?').fill('Checking partial capture and booking.');
    await dialog.getByRole('button', { name: 'Continue to booking' }).click();
    await expect(dialog.locator('.native-calendar')).toBeVisible();
    assert.equal(submitted[0].id, id);
    await dialog.locator('.calendar-slots button').first().click();
    await dialog.getByRole('button', { name: 'Confirm booking' }).click();
    await expect(dialog).toContainText('You’re booked.');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('yara-lead-quote')), null);
    await dialog.getByRole('button', { name: 'Close booking window' }).click();
    await page.goto(`${base}/book`, { waitUntil: 'networkidle' });
    await dialog.getByLabel('Name', { exact: true }).fill('Closing QA');
    await dialog.getByLabel('Email', { exact: true }).fill('close@example.com');
    await dialog.getByLabel('Phone', { exact: true }).fill('+1 202 555 0149');
    await page.keyboard.press('Escape');
    await expect.poll(() => captured.some(d => d.email === 'close@example.com')).toBe(true);
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}: early save, no PII storage, reload identity, retry, completion, close flush`);
    await page.close();
  }
} finally { await browser.close(); }
