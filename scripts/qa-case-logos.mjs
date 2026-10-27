import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const base = process.env.QA_BASE_URL || 'http://localhost:3000';
const cases = {
  'colliers-catering': ['google-ads', 'meta', 'google-apps-script'],
  'us-medical-directors': ['stripe-s', 'google-ads', 'meta'],
  'inka-arthouse': ['shopify', 'make', 'dropbox', 'google-sheets', 'slack'],
};
await mkdir('outputs/qa', {recursive:true});
const browser = await chromium.launch();
try {
  for (const width of [1440,390]) {
    const page = await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
    for (const [slug, expected] of Object.entries(cases)) {
      const response = await page.goto(`${base}/projects/${slug}`,{waitUntil:'networkidle'});
      assert.equal(response.status(),200);
      const section = page.locator('[data-screen-label="Value"]');
      await section.scrollIntoViewIfNeeded();
      const assets = await section.locator('img').evaluateAll(images => images.map(img=>({src:img.getAttribute('src'),loaded:img.complete && img.naturalWidth>0})));
      assert.deepEqual(assets.map(a=>a.src),expected.map(name=>`/assets/apps/${name}.svg`));
      assert.ok(assets.every(a=>a.loaded));
      assert.equal(await section.locator('span').evaluateAll(spans=>spans.filter(s=>s.style.width==='7px').length),0);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await section.screenshot({path:`outputs/qa/${slug}-logos-${width}.png`});
      console.log(`PASS ${slug} at ${width}px: ${assets.length} logos, no placeholder dots.`);
    }
    await page.close();
  }
} finally { await browser.close(); }
