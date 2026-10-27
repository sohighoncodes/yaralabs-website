import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { parseFragment } from 'parse5';
import ts from 'typescript';

// One-time migration: compile the supplied design templates to ordinary React JSX.
// The deployed site has no template interpreter, eval, or prototype runtime.
const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/import-handoff.mjs <handoff-directory>');
const pages = [
  ['Home', '/', 'Systems that run themselves', 'Automation, AI agents, CRMs and custom apps for growing businesses.'],
  ['Services', '/services', 'Services', 'Business automation, AI agents, CRM setup and custom applications built around your business.'],
  ['Service-Automation', '/services/automation', 'Business Automation', 'Connect your tools and automate repetitive work with reliable business workflows.'],
  ['Service-AI-Agents', '/services/ai-agents', 'AI Agents', 'AI agents that qualify leads, answer questions and handle everyday tasks.'],
  ['Service-CRM', '/services/crm', 'CRM Setup', 'GoHighLevel and HubSpot CRM setup, migrations and automated customer journeys.'],
  ['Service-Custom-Apps', '/services/custom-apps', 'Custom Apps', 'Purpose-built portals, dashboards and applications for your team.'],
  ['Projects', '/projects', 'Our Projects', 'Explore the systems we built for Colliers Catering, US Medical Directors and Inka Arthouse.'],
  ['Case-Colliers', '/projects/colliers-catering', 'Colliers Catering Case Study', 'A connected lead-to-booking system for Colliers Catering.'],
  ['Case-USMD', '/projects/us-medical-directors', 'US Medical Directors Case Study', 'Consolidating tools and automating operations for US Medical Directors.'],
  ['Case-Inka', '/projects/inka-arthouse', 'Inka Arthouse Case Study', 'Automated order processing and artwork preparation for Inka Arthouse.'],
];
const routeMap = Object.fromEntries(pages.map(([name, route]) => [name + '.dc.html', route]));
const replacePaths = s => {
  for (const [file, route] of Object.entries(routeMap)) s = s.replaceAll(file, route);
  return s.replaceAll('assets/', '/assets/');
};
const expression = value => {
  const matches = [...value.matchAll(/{{([\s\S]*?)}}/g)];
  if (!matches.length) return JSON.stringify(value);
  if (matches.length === 1 && matches[0][0] === value) return '(' + matches[0][1].trim() + ')';
  let cursor = 0, parts = [];
  for (const m of matches) {
    if (m.index > cursor) parts.push(JSON.stringify(value.slice(cursor, m.index)));
    parts.push('String(' + m[1].trim() + ')'); cursor = m.index + m[0].length;
  }
  if (cursor < value.length) parts.push(JSON.stringify(value.slice(cursor)));
  return parts.join(' + ');
};
const cssName = name => name.startsWith('--') ? name : name.replace(/^-ms-/, 'ms-').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
function declarations(value) {
  // Semicolons inside quoted URLs and functions are not declaration separators.
  const parts = []; let start = 0, depth = 0, quote = '';
  for (let i = 0; i < value.length; i++) {
    const c = value[i];
    if (quote) { if (c === quote && value[i - 1] !== '\\') quote = ''; }
    else if (c === '"' || c === "'") quote = c;
    else if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === ';' && !depth) { parts.push(value.slice(start, i)); start = i + 1; }
  }
  parts.push(value.slice(start));
  return parts.filter(x => x.includes(':')).map(x => { const i = x.indexOf(':'); return [x.slice(0, i).trim(), x.slice(i + 1).trim()]; });
}
const attrNames = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', onclick: 'onClick', onpointermove: 'onPointerMove', onpointerleave: 'onPointerLeave', onmouseenter: 'onMouseEnter', onmouseleave: 'onMouseLeave', viewbox: 'viewBox', 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin', 'fill-rule': 'fillRule', 'clip-rule': 'clipRule', preserveaspectratio: 'preserveAspectRatio' };
Object.assign(attrNames, { onmousemove: 'onMouseMove', 'stroke-dasharray': 'strokeDasharray', 'stroke-dashoffset': 'strokeDashoffset' });
const voids = new Set(['img', 'input', 'br', 'hr', 'link', 'meta', 'source', 'wbr']);
let hoverRules = [], count = 0;
for (const [name, route, title, description] of pages) {
  const html = replacePaths(await readFile(path.join(source, name + '.dc.html'), 'utf8'));
  const template = html.match(/<x-dc>([\s\S]*?)<\/x-dc>/)[1];
  let logic = html.match(/<script[^>]*data-dc-script[^>]*>([\s\S]*?)<\/script>/)[1];
  const ast = ts.createSourceFile('logic.js', logic, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const klass = ast.statements.find(ts.isClassDeclaration);
  const renderVals = klass.members.find(m => m.name?.getText(ast) === 'renderVals');
  const returned = renderVals.body.statements.find(ts.isReturnStatement).expression;
  const keys = returned.properties.map(p => p.name.getText(ast));
  function render(node, level = 0) {
    if (node.nodeName === '#text') return '{' + expression(node.value.replace(/\s+/g, ' ')) + '}';
    if (!node.tagName) return '';
    let tag = node.tagName;
    const attrs = Object.fromEntries(node.attrs.map(a => [a.name, a.value]));
    if (['helmet', 'script'].includes(tag)) return '';
    if (tag === 'nav') return '<SiteNav scrolled={this.state.scrolled} />';
    if (tag === 'sc-if' && attrs.value === '{{ bookOpen }}') return '';
    if (tag === 'button' && attrs.onclick === '{{ openBook }}') {
      tag = 'BookingLink'; delete attrs.onclick; delete attrs.type;
    }
    const children = (node.childNodes || []).map(n => render(n, level + 1)).join('\n');
    if (tag === 'sc-if') return '{' + expression(attrs.value) + ' && <>' + children + '</>}';
    if (tag === 'sc-for') return '{' + expression(attrs.list) + '.map((' + attrs.as + ', itemIndex' + level + ') => <React.Fragment key={itemIndex' + level + '}>' + children + '</React.Fragment>)}';
    if (tag.startsWith('sc-')) throw new Error('Unsupported control ' + tag);
    const props = [];
    if (attrs.target === '_blank') attrs.rel = 'noopener noreferrer';
    if (tag === 'button' && attrs.onclick === '{{ f.toggle }}') {
      props.push('aria-expanded={f.rows === "1fr"}');
    }
    if (attrs['style-hover']) {
      const cls = 'yl-hover-' + count++;
      hoverRules.push('.' + cls + ':hover{' + declarations(attrs['style-hover']).map(([k,v]) => k + ':' + v + ' !important').join(';') + '}');
      attrs.class = ((attrs.class || '') + ' ' + cls).trim(); delete attrs['style-hover'];
    }
    for (let [key, value] of Object.entries(attrs)) {
      if (key.startsWith('hint-')) continue;
      if (key === 'style') {
        const entries = Object.fromEntries(declarations(value));
        // Neutral tracking and breakpoint-based type preserve legibility on small screens.
        if (entries['letter-spacing']) entries['letter-spacing'] = '0';
        props.push('style={{' + Object.entries(entries).map(([k,v]) => JSON.stringify(cssName(k)) + ':' + expression(v)).join(',') + '}}');
      } else {
        key = attrNames[key] || key;
        props.push(key + '={' + expression(value) + '}');
      }
    }
    if (tag === 'img') {
      if (!attrs.loading) props.push('loading="lazy"');
      if (!attrs.decoding) props.push('decoding="async"');
    }
    return '<' + tag + ' ' + props.join(' ') + (voids.has(tag) ? ' />' : '>\n' + children + '\n</' + tag + '>');
  }
  const jsx = parseFragment(template).childNodes.map(n => render(n)).join('\n');
  const used = new Set();
  function visit(node) { if (ts.isIdentifier(node)) used.add(node.text); ts.forEachChild(node, visit); }
  visit(ts.createSourceFile('view.jsx', '<>' + jsx + '</>', ts.ScriptTarget.Latest, true, ts.ScriptKind.JSX));
  logic = logic.slice(0, klass.end - 1) + '\nrender() { const {' + keys.filter(k => used.has(k)).join(',') + '} = this.renderVals(); return (<>' + jsx + '</>); }\n' + logic.slice(klass.end - 1);
  logic = logic.replaceAll('[id, desc, f]', '[id, desc]');
  logic = logic.replace('class Component extends DCLogic', 'export default class DesignPage extends React.Component');
  // Honor reduced motion for demo timers as well as visual transitions.
  logic = logic.replaceAll('= setInterval(', '= this.motion() && setInterval(');
  await mkdir('components/pages', { recursive: true });
  await writeFile('components/pages/' + name + '.jsx', '"use client";\nimport React from "react";\nimport BookingLink from "../BookingLink";\nimport SiteNav from "../SiteNav";\n' + logic);
  const dir = 'app' + (route === '/' ? '' : route);
  await mkdir(dir, { recursive: true });
  await writeFile(dir + '/page.tsx', 'import DesignPage from "@/components/pages/' + name + '";\nexport const metadata = ' + JSON.stringify({title: title + ' | Yara Labs', description, alternates:{canonical:route}, openGraph:{title:title+' | Yara Labs',description,url:route}}) + ';\nexport default function Page() { return <DesignPage />; }\n');
}
await writeFile('app/hover.css', hoverRules.join('\n') + '\n');
await writeFile('scripts/routes.json', JSON.stringify(pages.map(([name,route,title])=>({name,route,title})), null, 2));
console.log('Compiled ' + pages.length + ' React pages.');
