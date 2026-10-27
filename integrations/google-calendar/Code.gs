// Deploy as a web app, executing as cjgomba@yaralabs.io. See docs/BOOKING.md.
// No calendar credentials or shared secrets belong in this source file.
var BOOKING_CONFIG = {
  calendar: 'cjgomba@yaralabs.io',
  busyCalendars: ['cjgomba@yaralabs.io', 'c_3475a463d4ef6a791882f4c7222773719a0597056d2c191c2aa57af36b37e17e@group.calendar.google.com'],
  timeZone: 'Asia/Manila', offset: '+08:00', weekdays: [1, 2, 3, 4, 5],
  startHour: 11, endHour: 23, duration: 30, noticeHours: 2, windowDays: 30
};

function doPost(e) {
  var result;
  try {
    if (!e.postData || e.postData.contents.length > 30000) throw problem_('invalid');
    var envelope = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty('CALENDAR_SHARED_SECRET');
    if (!secret || typeof envelope.data !== 'string' || !Number.isFinite(envelope.timestamp) || Math.abs(Date.now() - envelope.timestamp) > 120000) throw problem_('unauthorized');
    var expected = hex_(Utilities.computeHmacSha256Signature(envelope.timestamp + '.' + envelope.data, secret));
    if (!equal_(expected, envelope.signature)) throw problem_('unauthorized');
    var input = JSON.parse(envelope.data);
    if (!/^[a-f0-9]{64}$/.test(input.client)) throw problem_('invalid');
    if (input.action === 'availability') {
      throttle_(input.client, 90, 300);
      result = { ok: true, slots: available_(), duration: BOOKING_CONFIG.duration, timeZone: BOOKING_CONFIG.timeZone };
    } else if (input.action === 'book') {
      var lock = LockService.getScriptLock();
      if (!lock.tryLock(15000)) throw problem_('unavailable');
      try { pruneHolds_(); throttle_(input.client + ':book', 8, 900); result = book_(input); }
      finally { lock.releaseLock(); }
    } else throw problem_('invalid');
  } catch (error) { result = { ok: false, code: error.bookingCode || 'unavailable' }; }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() { return ContentService.createTextOutput('Yara Labs booking service'); }

// Run manually once to authorize and verify read access. Does not create an event.
function checkConnection() {
  busy_(Date.now(), Date.now() + 86400000);
  console.log('Calendar access verified for Yara Labs. No appointment created.');
}

function google_(method, path, body) {
  var response = UrlFetchApp.fetch('https://www.googleapis.com/calendar/v3' + path, {
    method: method, contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    payload: body ? JSON.stringify(body) : undefined, muteHttpExceptions: true
  });
  var status = response.getResponseCode();
  if (status === 404) return null;
  if (status === 410 && method === 'get') return { status: 'cancelled' };
  if (status < 200 || status >= 300) { var error = problem_('unavailable'); error.httpStatus = status; throw error; }
  return JSON.parse(response.getContentText());
}

function busy_(start, end) {
  var data = google_('post', '/freeBusy', {
    timeMin: new Date(start).toISOString(), timeMax: new Date(end).toISOString(),
    items: BOOKING_CONFIG.busyCalendars.map(function(id) { return { id: id }; })
  });
  var intervals = [];
  BOOKING_CONFIG.busyCalendars.forEach(function(id) {
    var calendar = data && data.calendars && data.calendars[id];
    // An unreadable calendar is not an empty calendar. Fail closed.
    if (!calendar || calendar.errors && calendar.errors.length || !Array.isArray(calendar.busy)) throw problem_('unavailable');
    calendar.busy.forEach(function(b) {
      var from = Date.parse(b.start), to = Date.parse(b.end);
      if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) throw problem_('unavailable');
      intervals.push([from, to]);
    });
  });
  return intervals;
}

function candidates_(now) {
  var today = Utilities.formatDate(new Date(now), BOOKING_CONFIG.timeZone, 'yyyy-MM-dd');
  var anchor = Date.parse(today + 'T00:00:00' + BOOKING_CONFIG.offset);
  var slots = [];
  for (var day = 0; day <= BOOKING_CONFIG.windowDays; day++) {
    var midnight = anchor + day * 86400000;
    var localDate = Utilities.formatDate(new Date(midnight), BOOKING_CONFIG.timeZone, 'yyyy-MM-dd');
    var weekday = new Date(localDate + 'T12:00:00Z').getUTCDay();
    if (BOOKING_CONFIG.weekdays.indexOf(weekday) < 0) continue;
    for (var minute = BOOKING_CONFIG.startHour * 60; minute + BOOKING_CONFIG.duration <= BOOKING_CONFIG.endHour * 60; minute += BOOKING_CONFIG.duration) {
      var start = midnight + minute * 60000;
      if (start >= now + BOOKING_CONFIG.noticeHours * 3600000 && start <= now + BOOKING_CONFIG.windowDays * 86400000) slots.push(start);
    }
  }
  return slots;
}

function holds_() {
  var values = PropertiesService.getScriptProperties().getProperties();
  return Object.keys(values).filter(function(key) { return key.indexOf('hold:') === 0; }).map(function(key) { return JSON.parse(values[key]); }).filter(function(h) { return h.end > Date.now() && (h.state !== 'confirmed' || h.created > Date.now() - 60000); });
}

function available_() {
  var now = Date.now(), candidates = candidates_(now);
  if (!candidates.length) return [];
  var intervals = busy_(candidates[0], candidates[candidates.length - 1] + BOOKING_CONFIG.duration * 60000);
  // Persisted holds cover delayed Google visibility and ambiguous insert responses.
  holds_().forEach(function(hold) { intervals.push([hold.start, hold.end]); });
  return candidates.filter(function(start) { return !overlaps_(start, start + BOOKING_CONFIG.duration * 60000, intervals); }).map(function(start) { return new Date(start).toISOString(); });
}

function book_(input) {
  var d = input.details, start = Date.parse(input.start), now = Date.now();
  if (!d || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(d.id)) throw problem_('invalid');
  var limits = { name: [1, 120], email: [3, 254], phone: [7, 40], tools: [1, 600], message: [10, 3000], source: [1, 300] };
  Object.keys(limits).forEach(function(key) { if (typeof d[key] !== 'string' || d[key].trim().length < limits[key][0] || d[key].length > limits[key][1]) throw problem_('invalid'); });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) || ['quote', 'call'].indexOf(d.intent) < 0 || !Number.isFinite(start)) throw problem_('invalid');
  var eventId = 'b' + d.id.toLowerCase().replace(/-/g, '');
  var path = '/calendars/' + encodeURIComponent(BOOKING_CONFIG.calendar) + '/events';
  var fingerprint = hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, JSON.stringify([d.id, d.email.toLowerCase(), input.start, d.name, d.phone, d.tools, d.message, d.intent, d.source])));
  var existing = google_('get', path + '/' + eventId);
  if (existing) {
    if (existing.status === 'cancelled' || !existing.extendedProperties || !existing.extendedProperties.private || existing.extendedProperties.private.fingerprint !== fingerprint) throw problem_('existing');
    var previousHold = PropertiesService.getScriptProperties().getProperty('hold:' + eventId);
    if (previousHold) { previousHold = JSON.parse(previousHold); previousHold.state = 'confirmed'; PropertiesService.getScriptProperties().setProperty('hold:' + eventId, JSON.stringify(previousHold)); }
    return confirmed_(existing);
  }
  if (candidates_(now).indexOf(start) < 0) throw problem_('taken');
  var end = start + BOOKING_CONFIG.duration * 60000;
  var properties = PropertiesService.getScriptProperties();
  var holds = holds_();
  var ownHold = holds.filter(function(h) { return h.id === eventId; })[0];
  if (ownHold && ownHold.fingerprint !== fingerprint) throw problem_('existing');
  var intervals = busy_(start, end);
  holds.filter(function(h) { return h.id !== eventId; }).forEach(function(h) { intervals.push([h.start, h.end]); });
  if (overlaps_(start, end, intervals)) throw problem_('taken');
  // Retain a hold on unknown outcomes. Retrying this enquiry uses the same Google ID.
  properties.setProperty('hold:' + eventId, JSON.stringify({ id: eventId, start: start, end: end, fingerprint: fingerprint, state: 'pending', created: now }));
  var event;
  try {
    event = google_('post', path + '?sendUpdates=all&conferenceDataVersion=1', {
      id: eventId, summary: 'Yara Labs — ' + (d.intent === 'quote' ? 'Project quote' : 'Discovery call') + ' with ' + d.name,
      description: 'Name: ' + d.name + '\nEmail: ' + d.email + '\nPhone: ' + d.phone + '\nCurrent tools: ' + d.tools + '\n\nProject details:\n' + d.message + '\n\nSource: https://yaralabs.io' + d.source,
      start: { dateTime: new Date(start).toISOString(), timeZone: BOOKING_CONFIG.timeZone },
      end: { dateTime: new Date(end).toISOString(), timeZone: BOOKING_CONFIG.timeZone },
      attendees: [{ email: d.email, displayName: d.name }],
      transparency: 'opaque', visibility: 'private', guestsCanInviteOthers: false,
      extendedProperties: { private: { fingerprint: fingerprint, inquiryId: d.id } },
      conferenceData: { createRequest: { requestId: eventId, conferenceSolutionKey: { type: 'hangoutsMeet' } } }
    });
  } catch (error) {
    // A definitive rejected insert is safe to release; timeouts and 5xx are not.
    if ([400, 401, 403, 422, 429].indexOf(error.httpStatus) >= 0) properties.deleteProperty('hold:' + eventId);
    throw error;
  }
  if (!event || !event.id) throw problem_('unavailable');
  properties.setProperty('hold:' + eventId, JSON.stringify({ id: eventId, start: start, end: end, fingerprint: fingerprint, state: 'confirmed', created: now }));
  return confirmed_(event);
}

// Housekeeping: only confirmed holds age out; uncertain future holds stay closed.
function cleanupHolds() {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try { pruneHolds_(); } finally { lock.releaseLock(); }
}
function pruneHolds_() {
  var properties = PropertiesService.getScriptProperties(), values = properties.getProperties(), now = Date.now();
  Object.keys(values).filter(function(k) { return k.indexOf('hold:') === 0; }).forEach(function(key) {
    var h = JSON.parse(values[key]);
    if (h.end < now || h.state === 'confirmed' && h.created < now - 60000) properties.deleteProperty(key);
  });
}

function confirmed_(event) {
  return { ok: true, booking: { start: event.start.dateTime, end: event.end.dateTime, meet: event.hangoutLink || null } };
}
function overlaps_(start, end, intervals) { return intervals.some(function(b) { return start < b[1] && end > b[0]; }); }
function throttle_(client, max, seconds) {
  var cache = CacheService.getScriptCache(), key = 'rate:' + client + ':' + Math.floor(Date.now() / (seconds * 1000));
  var count = Number(cache.get(key) || 0);
  if (count >= max) throw problem_('rate');
  cache.put(key, String(count + 1), seconds);
}
function problem_(code) { var error = new Error(code); error.bookingCode = code; return error; }
function hex_(bytes) { return bytes.map(function(b) { return ((b + 256) % 256).toString(16).padStart(2, '0'); }).join(''); }
function equal_(a, b) {
  if (typeof b !== 'string' || a.length !== b.length) return false;
  var difference = 0; for (var i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}
