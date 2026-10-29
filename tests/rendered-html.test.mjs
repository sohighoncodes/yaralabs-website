import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import test from 'node:test';
import { parse } from 'parse5';
import { BOOKING_URL } from '../lib/booking.js';
const routes = [
  ...JSON.parse(await readFile(new URL('../scripts/routes.json', import.meta.url))),
  { route: '/quote', title: 'Get a quote' },
  { route: '/book', title: 'Book a free call' },
];
const { default: worker } = await import('../dist/server/index.js');
const env = { ASSETS: { fetch: async () => new Response('Not found', { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };
function elements(node) { return [node, ...(node.childNodes || []).flatMap(elements)]; }

for (const route of routes) {
  test(`${route.route} renders content, metadata and valid internal destinations`, async () => {
    const response = await worker.fetch(new Request('https://yaralabs.io' + route.route, { headers: { accept: 'text/html' } }), env, ctx);
    assert.equal(response.status, 200);
    const html = await response.text();
    const nodes = elements(parse(html));
    assert.equal(nodes.filter(n => n.tagName === 'h1').length, 1);
    const title = nodes.find(n => n.tagName === 'title');
    assert.ok(title?.childNodes[0]?.value.includes(route.title));
    assert.ok(nodes.some(n => n.tagName === 'nav'));
    assert.ok(nodes.some(n => n.tagName === 'footer'));
    const bookings = nodes.filter(n => n.tagName === 'a' && n.attrs?.some(a => a.name === 'data-booking-link'));
    assert.ok(bookings.length >= 2, 'Booking links work before JavaScript loads');
    assert.ok(bookings.every(n => n.attrs.some(a => a.name === 'href' && a.value === BOOKING_URL)));
    assert.doesNotMatch(html, /<x-dc|<sc-for|<sc-if|support\.js/);
    const ids = new Set(nodes.flatMap(n => n.attrs?.filter(a => a.name === 'id').map(a => a.value) || []));
    for (const node of nodes) {
      const attrs = Object.fromEntries((node.attrs || []).map(a => [a.name, a.value]));
      if (node.tagName === 'a' && attrs.href?.startsWith('/')) {
        const pathname = attrs.href.split('#')[0];
        assert.ok(routes.some(r => r.route === pathname), `Broken route ${attrs.href}`);
      }
      if (node.tagName === 'a' && attrs.href?.startsWith('#') && attrs.href.length > 1) assert.ok(ids.has(attrs.href.slice(1)), `Missing anchor ${attrs.href}`);
      if (node.tagName === 'img' && attrs.src?.startsWith('/assets/')) await access(new URL('../public' + attrs.src, import.meta.url));
    }
  });
}
