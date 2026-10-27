// One-time migration of the original handoff's brand badges.
import { readFile, writeFile, readdir, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
const source = process.argv[2];
if (!source) throw new Error('Pass the logos-apps checkout directory.');
const component = await readFile('components/AppBrand.jsx', 'utf8');
const brandNames = [...component.slice(component.indexOf('const logos'),component.indexOf('const wordmarks')).matchAll(/(?:'([^']+)'|\b([A-Za-z][A-Za-z0-9]*)):\s*'[a-z0-9-]+'/g)].map(m=>m[1]||m[2]);
const filenames = [...new Set([...component.matchAll(/:\s*'([a-z0-9-]+)'/g)].map(m=>m[1]))];
await mkdir('public/assets/apps', {recursive:true});
for (const file of filenames) {
  const svg = await readFile(path.join(source,'logos',file+'.svg'),'utf8');
  if (/<script|<foreignObject|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?:https?:|javascript:)/i.test(svg)) throw new Error('Unexpected active/external SVG content: '+file);
  await copyFile(path.join(source,'logos',file+'.svg'),'public/assets/apps/'+file+'.svg');
}
await copyFile(path.join(source,'LICENSE'),'public/assets/apps/SOURCE-LICENSE.txt');
const dynamic = ['t','tl','ap.name','bb.name','ch.name','st.tool'];
for (const file of await readdir('components/pages')) {
  if (!file.endsWith('.jsx')) continue;
  const target = path.join('components/pages',file);
  let text = await readFile(target,'utf8');
  const before = text;
  // Remove only the colored placeholder immediately preceding a known app label.
  text = text.replace(/<span style=\{\{[^\n]+\}\}>\s*<\/span>\s*\{\((t|bb\.name|ch\.name|st\.name)\)\}/g, (_,expr)=>`<AppBrand name={${expr}} />`);
  for (const expr of dynamic) text = text.replaceAll(`{(${expr})}`,`<AppBrand name={${expr}} />`);
  for (const name of [...brandNames,'GoHighLevel']) text=text.replaceAll('{'+JSON.stringify(name)+'}',`<AppBrand name=${JSON.stringify(name)} />`);
  const labels = {
    'New Google review': ['New ', ['Google'], ' review'],
    'Shopify orders': [['Shopify'], ' orders'],
    'Dropbox · Production': [['Dropbox'], ' · Production'],
    'Stripe · payment received': [['Stripe'], ' · payment received'],
    'GoHighLevel · Google & Meta ads': ['GoHighLevel · ', ['Google Ads'], ' · ', ['Meta Ads']],
    'GoHighLevel · Stripe': ['GoHighLevel · ', ['Stripe']],
    'Shopify · Make · Dropbox · Slack': [['Shopify'], ' · ', ['Make'], ' · ', ['Dropbox'], ' · ', ['Slack']],
    'OpenAI · Claude · Agents': [['OpenAI'], ' · ', ['Claude'], ' · Agents'],
    'Zapier · Make · APIs': [['Zapier'], ' · ', ['Make'], ' · APIs'],
    'Acme Co. · via Stripe': ['Acme Co. · via ', ['Stripe']],
    'Slack and email alerts': [['Slack'], ' and email alerts'],
  };
  for (const [label, parts] of Object.entries(labels)) text = text.replaceAll('{'+JSON.stringify(label)+'}',
    '<span className="app-label">' + parts.map(part => Array.isArray(part) ? `<AppBrand name=${JSON.stringify(part[0])} />` : '{'+JSON.stringify(part)+'}').join('') + '</span>');
  // Case-study value badges are static, unlike the mapped tool strips above.
  // Remove their old dots, including duplicates beside an existing brand logo.
  text = text.replace(/(<section data-screen-label=\{"Value"\}[\s\S]*?<\/section>)/g,
    section => section.replace(/<span style=\{\{"width":"7px","height":"7px","borderRadius":"3px","background":"#2A62F5"\}\}>\s*<\/span>\s*/g, ''));
  if (text !== before && !text.includes('import AppBrand')) text=text.replace('import React from "react";', 'import React from "react";\nimport AppBrand from "../AppBrand";');
  await writeFile(target,text);
}
console.log(`Copied ${filenames.length} local SVGs and updated brand badges.`);
