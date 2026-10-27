import assert from 'node:assert/strict';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';
const routes = JSON.parse(await readFile('scripts/routes.json','utf8'));
const source = await readFile('components/AppBrand.jsx','utf8');
const names = [...source.slice(source.indexOf('const logos'),source.indexOf('const wordmarks')).matchAll(/(?:'([^']+)'|\b([A-Za-z][A-Za-z0-9]*)):\s*'[a-z0-9-]+'/g)].map(m=>m[1]||m[2]);
const browser = await chromium.launch();
const report=[];
await mkdir('outputs/qa',{recursive:true});
try {
 for(const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  for(const route of routes) {
   const errors=[];
   const onError=e=>errors.push(e.message);
   page.on('pageerror',onError);
   const response=await page.goto((process.env.QA_BASE_URL||'http://localhost:3000')+route.route,{waitUntil:'networkidle'});
   assert.equal(response.status(),200);
   // Visit every section, including content revealed on scroll.
   for(const section of await page.locator('[data-screen-label]').all()) await section.scrollIntoViewIfNeeded();
   const audit=await page.evaluate(names=>{
    const images=[...document.querySelectorAll('.app-brand img')];
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const bare=[];
    while(walker.nextNode()) {const node=walker.currentNode; if(names.includes(node.textContent.trim())&&!node.parentElement.closest('.app-brand,script,style')) bare.push(node.textContent.trim());}
    return {logos:images.length,broken:images.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),bare,overflow:document.documentElement.scrollWidth>innerWidth,sections:[...document.querySelectorAll('[data-screen-label]')].map(s=>({name:s.dataset.screenLabel,logos:s.querySelectorAll('.app-brand img').length}))};
   },names);
   assert.deepEqual(audit.broken,[],`${route.route}: broken logos`);
   assert.deepEqual(audit.bare,[],`${route.route}: unconverted brand labels`);
   assert.equal(audit.overflow,false,`${route.route}: overflow`);
   assert.deepEqual(errors,[]);
   report.push({route:route.route,width,...audit});
   if(route.route==='/projects') {await page.locator('[data-yl-tilt]').last().scrollIntoViewIfNeeded();await page.screenshot({path:`outputs/qa/projects-logos-${width}.png`});}
   console.log(`PASS ${route.route} ${width}px: ${audit.logos} logos, ${audit.sections.length} sections audited`);
   page.off('pageerror',onError);
  }
  await page.close();
 }
} finally {await browser.close();}
await writeFile('outputs/qa/logo-audit.json',JSON.stringify(report,null,2));
