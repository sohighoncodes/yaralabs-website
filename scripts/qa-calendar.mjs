import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { calendarFixture } from './booking-fixture.mjs';

const browser = await chromium.launch();
const base = process.env.QA_BASE_URL || 'http://localhost:3000';
await mkdir('outputs/qa', { recursive: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, timezoneId: 'Asia/Manila', reducedMotion: 'reduce' });
    let fixture = calendarFixture(), mode = 'taken', posted = [], unavailable = false;
    await page.addInitScript(() => localStorage.setItem('yl-pet-hidden', '1'));
    await page.route('**/api/inquiries', route => route.fulfill({ status: 201, json: { saved: true } }));
    await page.route('**/api/booking/availability', route => route.fulfill({ status: unavailable ? 503 : 200, json: unavailable ? { error: 'Unavailable' } : fixture }));
    await page.route('**/api/booking/reserve', route => {
      const input = route.request().postDataJSON(); posted.push(input);
      if (mode === 'taken') { fixture.slots = fixture.slots.filter(s => s !== input.start); return route.fulfill({ status: 409, json: { code: 'taken', error: 'That time was just taken. Please choose another available time.' } }); }
      if (mode === 'unknown') return route.fulfill({ status: 503, json: { error: 'Please retry the same booking to check confirmation.' } });
      return route.fulfill({ json: { confirmed: true, start: input.start, end: new Date(Date.parse(input.start) + 1800000).toISOString(), meet: 'https://meet.google.com/abc-defg-hij' } });
    });
    await page.goto(base, { waitUntil: 'networkidle' });
    async function open() {
      await page.locator('.nav-book').click();
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel('Name', { exact: true }).fill('QA visitor');
      await dialog.getByLabel('Email', { exact: true }).fill('qa@example.com');
      await dialog.getByLabel('Phone', { exact: true }).fill('+1 202 555 0148');
      await dialog.getByLabel('Tools you currently use').fill('Google Sheets');
      await dialog.getByLabel('How can we help?').fill('Checking the custom booking calendar.');
      await dialog.getByRole('button', { name: 'Continue to booking' }).click();
      return dialog;
    }
    const dialog = await open();
    await expect(dialog.locator('.calendar-slots button').first()).toBeEnabled();
    await expect(dialog.locator('iframe')).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: 'Confirm booking' })).toBeDisabled();
    await page.screenshot({ path: 'outputs/qa/calendar-native-' + width + '.png' });
    await dialog.getByRole('button', { name: '11:00 AM', exact: true }).click();
    await dialog.getByRole('button', { name: 'Confirm booking' }).click();
    await expect(dialog.getByRole('alert')).toContainText('just taken');
    await expect(dialog.getByRole('button', { name: '11:00 AM', exact: true })).toHaveCount(0);
    await dialog.getByRole('combobox').selectOption('America/New_York');
    await expect(dialog.getByRole('button', { name: '11:30 AM', exact: true })).toHaveCount(0);
    await dialog.getByRole('combobox').selectOption('Asia/Manila');
    await dialog.locator('.calendar-slots button').first().click(); mode = 'unknown';
    await dialog.getByRole('button', { name: 'Confirm booking' }).click();
    await expect(dialog.getByRole('button', { name: 'Check booking' })).toBeEnabled();
    await expect(dialog.getByRole('combobox')).toBeDisabled();
    const uncertain = posted.at(-1); mode = 'success';
    await dialog.getByRole('button', { name: 'Check booking' }).click();
    await expect(dialog).toContainText('You’re booked.');
    assert.equal(posted.at(-1).id, uncertain.id); assert.equal(posted.at(-1).start, uncertain.start);
    assert.ok(await dialog.evaluate(e => e.scrollWidth <= e.clientWidth + 1));
    await page.screenshot({ path: 'outputs/qa/calendar-confirmed-' + width + '.png' });
    await dialog.getByRole('button', { name: 'Close booking window' }).click();
    unavailable = true;
    await open(); await expect(dialog).toContainText('We can’t check available times');
    await expect(dialog.locator('.calendar-slots button')).toHaveCount(0);
    await expect(dialog.getByRole('link', { name: 'open the booking page' })).toBeVisible();
    await dialog.getByRole('button', { name: 'Close booking window' }).click();
    console.log('PASS ' + width + ': native design, timezone conversion, conflict removal, uncertain retry, confirmation and fail-closed outage.');
    await page.close();
  }
} finally { await browser.close(); }
