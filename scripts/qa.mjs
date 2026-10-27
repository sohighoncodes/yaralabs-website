import { chromium } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { BOOKING_URL } from '../lib/booking.js';
const routes = JSON.parse(await readFile('scripts/routes.json', 'utf8'));
const base = process.env.QA_BASE_URL || 'http://localhost:3000';
await mkdir('outputs/qa', { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    for (const route of routes) {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error' && !m.text().includes('fonts.googleapis')) errors.push(m.text()); });
      const response = await page.goto(base + route.route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const links = await page.locator('[data-booking-link]').evaluateAll(els => els.map(e => e.href));
      const bookingConnected = links.length >= 2 && links.every(href => href === BOOKING_URL);
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        headings: [...document.querySelectorAll('h1')].map(h => h.textContent.trim()),
        brokenImages: [...document.images].filter(i => i.complete && !i.naturalWidth).map(i=>i.src),
        prototype: !!document.querySelector('sc-for,sc-if,x-dc'),
      }));
      await page.screenshot({ path: `outputs/qa/${route.name}-${width}.png`, fullPage: true });
      const result = { route: route.route, width, status: response.status(), bookingConnected, ...metrics, errors };
      results.push(result); console.log(JSON.stringify(result));
      await page.close();
    }
    await context.close();
  }
} finally { await browser.close(); }
await writeFile('outputs/qa/report.json', JSON.stringify(results, null, 2));
if (results.some(r => r.status !== 200 || r.overflow > 1 || r.errors.length || r.brokenImages.length || r.prototype || !r.bookingConnected)) process.exitCode = 1;
