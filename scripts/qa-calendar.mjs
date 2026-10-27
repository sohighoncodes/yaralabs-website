import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch();
const base = process.env.QA_BASE_URL || 'http://localhost:3000';
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await page.addInitScript(() => localStorage.setItem('yl-pet-hidden', '1'));
    // Only the intake save is mocked; the Google iframe is the real public schedule.
    await page.route('**/api/inquiries', route => route.fulfill({ status: 201, contentType: 'application/json', body: '{"saved":true}' }));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.locator('.nav-book').click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name', { exact: true }).fill('QA visitor');
    await dialog.getByLabel('Email', { exact: true }).fill('qa@example.com');
    await dialog.getByLabel('Phone', { exact: true }).fill('+1 202 555 0148');
    await dialog.getByLabel('Tools you currently use').fill('Spreadsheets');
    await dialog.getByLabel('How can we help?').fill('Checking the booking calendar display.');
    await dialog.getByRole('button', { name: 'Continue to booking' }).click();
    const calendar = page.frameLocator('.booking-calendar');
    await expect(calendar.getByRole('heading', { name: 'System Audit with Yara Labs', exact: true })).toBeVisible({ timeout: 30000 });
    await expect(calendar.getByRole('heading', { name: 'Select an appointment time', exact: true })).toBeVisible();
    await page.screenshot({ path: `outputs/qa/calendar-real-${width}.png` });
    // Do not select or submit an appointment during automated verification.
    await dialog.getByRole('button', { name: 'Close booking window' }).click();
    console.log(`PASS ${width}: live Google Calendar schedule embeds inside the modal.`);
    await page.close();
  }
} finally { await browser.close(); }
