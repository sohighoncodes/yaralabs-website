import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser=await chromium.launch();
const root=process.env.QA_BASE_URL || 'http://localhost:4617';
await mkdir('outputs/catering-review',{recursive:true});
try {
 for (const width of [375,768,1440]) {
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('console', m=>{if(m.type()==='error') errors.push(m.text());});
  await page.route('https://**/*',route=>route.abort());
  for(const path of ['/','/caterers']){
   await page.goto(root+path,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
   await expect(page.locator('h1')).toContainText(path==='/'?'Systems that':'Enquiries');
   await expect(page.locator('nav .nav-book')).toHaveText('Book a call');
   if (path === '/') {
    await expect(page.locator('[data-booking-intent="audit"], a[href="/caterers"]')).toHaveCount(0);
    await page.locator('.nav-book').click();
    await expect(page.getByRole('dialog')).toContainText('Let’s talk about your business.');
    await page.keyboard.press('Escape');
   }
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   if(width!==768) await page.screenshot({path:'outputs/catering-review/'+(path==='/'?'home':'caterers')+'-'+width+'.png',fullPage:true});
   if(path==='/caterers'){
    await expect(page.getByText('Order won · review request queued',{exact:true})).toBeVisible();
    await expect(page.locator('#services button')).toHaveCount(4);
    await page.locator('#services button').nth(1).click();
    await page.locator('#faq button').nth(1).click();
    await page.getByRole('link',{name:'Talk to us'}).click();
    await expect(page.getByRole('dialog')).toContainText('Let’s talk about your business.');
    await page.keyboard.press('Escape');
    let submitted;
    await page.route('**/api/inquiries',route=>{submitted=route.request().postDataJSON();return route.fulfill({json:{saved:true}});});
    for(const name of ['Start with Lite','Claim a founding spot','Get your free audit']){
     await page.getByRole('link',{name,exact:name!=='Get your free audit'}).first().click();
     await expect(page.getByRole('dialog')).toContainText('Get your free Quote Leak Audit');
     await page.keyboard.press('Escape');
    }
    await page.getByRole('link',{name:'Get your free audit'}).last().click();
    await page.getByRole('button',{name:'Send me my audit'}).click();
    expect(submitted).toBeUndefined();
    for(const [label,value] of [['Your name','QA'],['Business name','QA Catering'],['Website','https://example.com'],['Email for the video','qa@example.com']])await page.locator('.booking-fields').getByLabel(label,{exact:true}).fill(value);
    await page.getByLabel('State',{exact:true}).selectOption('WA');
    await page.getByLabel('Enquiries a month, roughly').selectOption('10–30');
    await page.getByRole('button',{name:'Send me my audit'}).click();
    await expect(page.getByRole('status')).toHaveText('Thanks. Your audit video arrives within 2 business days.');
    expect(submitted.intent).toBe('audit');
   }
  }
  expect(errors.filter(e=>!e.includes('ERR_FAILED'))).toEqual([]);
  await page.close();console.log('Verified '+width+'px');
 }
} finally {await browser.close();}
