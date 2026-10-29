import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

function harness() {
  const tabs = Object.fromEntries(['Contacts','Deals','Enquiries'].map(name => [name, []]));
  const sheet = name => ({
    getLastRow: () => tabs[name].length + 1, getMaxRows: () => 1000,
    getRange: (row, col, height = 1, width = 1) => ({
      getValues: () => Array.from({ length: height }, (_, i) => Array.from({ length: width }, (_, j) => tabs[name][row+i-2]?.[col+j-1] ?? '')),
      setValues(values) { for (let i = 0; i < values.length; i++) { const r = tabs[name][row+i-2] ||= []; for (let j = 0; j < values[i].length; j++) r[col+j-1] = values[i][j]; } },
      setValue(value) { (tabs[name][row-2] ||= [])[col-1] = value; },
    }),
  });
  const context = vm.createContext({ Date, console, Utilities: { DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' }, computeDigest: (_, value) => [...createHash('sha256').update(value).digest()], getUuid: () => crypto.randomUUID() } });
  vm.runInContext(readFileSync('integrations/google-sheets-crm/Code.gs','utf8'), context);
  const book = { getSheetByName: sheet };
  const sync = rows => { const index = context.indexes_(book); for (const row of rows) context.upsertLead_(book,index,row); };
  return { context, tabs, sync, book };
}
const lead = overrides => ({ id: crypto.randomUUID(), name: 'Visitor', email: 'Visitor@Example.com', phone: '+1 202 555 0148', intent: 'quote', tools: 'Slack', message: 'Please connect our tools.', source: '/quote', lead_status: 'in_progress', created_at: '2026-10-29T03:00:00Z', last_activity_at: '2026-10-29T03:00:00Z', ...overrides });

test('CRM deduplicates contacts, keeps separate enquiries and preserves sales edits through repeated sync', () => {
  const h = harness(), one = lead(); h.sync([one]);
  const deal = h.tabs.Deals[0]; deal[2] = 'Proposal sent'; deal[3] = 2500; deal[4] = 'PHP'; deal[6] = 'Send revised proposal'; deal[11] = 'Private sales notes';
  h.tabs.Contacts[0][3] = 'Company'; h.tabs.Contacts[0][4] = 'Client'; h.tabs.Contacts[0][8] = 'Relationship notes';
  h.sync([{ ...one, lead_status: 'completed', booking_start: '2026-11-04T03:00:00Z', last_activity_at: '2026-10-29T04:00:00Z' }]);
  h.sync([lead({ email: 'visitor@example.com', name: 'Older name' })]);
  assert.equal(h.tabs.Contacts.length, 1); assert.equal(h.tabs.Deals.length, 2); assert.equal(h.tabs.Enquiries.length, 2);
  assert.equal(deal[2], 'Proposal sent'); assert.equal(deal[3], 2500); assert.equal(deal[4], 'PHP'); assert.equal(deal[11], 'Private sales notes');
  assert.equal(deal[12], 'completed'); assert.equal(h.tabs.Contacts[0][0], 'Visitor'); assert.equal(h.tabs.Contacts[0][4], 'Client');
});

test('CRM uses stable IDs after row sorting and resumes partial writes without duplicate rows', () => {
  const h = harness(), one = lead(), two = lead({ email: 'second@example.com' });
  h.sync([one,two]);h.tabs.Deals.reverse();h.tabs.Contacts.reverse();h.tabs.Enquiries.reverse();
  h.sync([{ ...one, lead_status: 'abandoned' },two]);
  assert.equal(h.tabs.Deals.find(r => r[15] === one.id)[12], 'abandoned');
  assert.equal(h.tabs.Deals.length, 2); assert.equal(h.tabs.Contacts.length, 2);
});

test('CRM neutralizes spreadsheet formulas and links manual entries without replacing sales input', () => {
  const h = harness(); h.sync([lead({ name: '=IMPORTXML("https://bad.example", "//a")', phone: '+1234567890' })]);
  assert.ok(h.tabs.Contacts[0][0].startsWith("'=")); assert.ok(h.tabs.Contacts[0][2].startsWith("'+"));
  assert.equal(h.context.text_(' \n=1+1'), "' \n=1+1");
  h.tabs.Contacts.push(['Offline person','offline@example.com','','','Client']);
  h.tabs.Deals.push(['Offline project','Offline person','Qualified',1200,'AUD']);
  h.context.prepareManualRows_(h.book);
  assert.match(h.tabs.Contacts[1][12], /^C-/); assert.match(h.tabs.Deals[1][15], /^M-/);
  assert.equal(h.tabs.Deals[1][2], 'Qualified'); assert.equal(h.tabs.Deals[1][4], 'AUD');
});
