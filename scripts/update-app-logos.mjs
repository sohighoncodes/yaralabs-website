// One-time migration of the original handoff's brand badges.
import { readFile, writeFile, readdir, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
const source = process.argv[2];
if (!source) throw new Error('Pass the logos-apps checkout directory.');
const component = await readFile('components/AppBrand.jsx', 'utf8');
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
  for (const name of ['HubSpot','GoHighLevel','Make','Slack','Stripe','Google Drive','Xero']) text=text.replaceAll('{'+JSON.stringify(name)+'}',`<AppBrand name=${JSON.stringify(name)} />`);
  if (text !== before && !text.includes('import AppBrand')) text=text.replace('import React from "react";', 'import React from "react";\nimport AppBrand from "../AppBrand";');
  await writeFile(target,text);
}
console.log(`Copied ${filenames.length} local SVGs and updated brand badges.`);
