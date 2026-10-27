"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { BOOKING_URL } from '../lib/booking';

const dateKey = (date, timeZone) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date));
const monthLabel = month => new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T12:00:00Z`));
const fullDay = day => new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${day}T12:00:00Z`));

export default function BookingCalendar({ details }) {
  const [zone, setZone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Manila');
  const [openedAt] = useState(Date.now);
  const [slots, setSlots] = useState([]);
  const [duration, setDuration] = useState(30);
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const active = useRef(true);
  const request = useRef(null);
  const bookingRequest = useRef(null);
  const successHeading = useRef(null);
  const load = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    const timer = setTimeout(() => controller.abort(), 30000);
    setLoading(true);
    try {
      const response = await fetch('/api/booking/availability', { cache: 'no-store', signal: controller.signal });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.slots)) throw new Error();
      if (!active.current || request.current !== controller) return;
      setSlots(data.slots); setDuration(data.duration); setLoadError('');
      setSelected(previous => data.slots.includes(previous) ? previous : '');
    } catch {
      if (!active.current || request.current !== controller) return;
      setSlots([]); setSelected(''); setLoadError('We can’t check available times right now. Please try again.');
    } finally { clearTimeout(timer); if (active.current && request.current === controller) setLoading(false); }
  }, []);

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; request.current?.abort(); bookingRequest.current?.abort(); };
  }, []);
  useEffect(() => {
    if (pending || confirmed || uncertain) return;
    const initial = setTimeout(load, 0);
    const timer = setInterval(load, 45000);
    const focus = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', focus);
    return () => { clearTimeout(initial); clearInterval(timer); document.removeEventListener('visibilitychange', focus); request.current?.abort(); };
  }, [load, pending, confirmed, uncertain]);
  useEffect(() => { if (confirmed) successHeading.current?.focus(); }, [confirmed]);

  const byDay = {};
  for (const start of slots) { const key = dateKey(start, zone); (byDay[key] ??= []).push(start); }
  const availableDays = Object.keys(byDay).sort();
  const currentMonth = month || (availableDays[0] || dateKey(openedAt, zone)).slice(0, 7);
  const months = [...new Set([dateKey(openedAt, zone).slice(0, 7), ...availableDays.map(d => d.slice(0, 7))])].sort();
  const selectedDay = byDay[day] && day.startsWith(currentMonth) ? day : availableDays.find(d => d.startsWith(currentMonth));
  const [year, monthNumber] = currentMonth.split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const offset = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  const time = start => new Intl.DateTimeFormat('en', { timeZone: zone, hour: 'numeric', minute: '2-digit' }).format(new Date(start));
  const zones = [...new Set([zone, 'Asia/Manila', 'Asia/Singapore', 'Australia/Sydney', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'UTC'])];

  async function book() {
    if (!selected || pending || loading) return;
    setPending(true); setError('');
    bookingRequest.current = new AbortController();
    const timer = setTimeout(() => bookingRequest.current?.abort(), 30000);
    try {
      const response = await fetch('/api/booking/reserve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: bookingRequest.current.signal, body: JSON.stringify({ ...details, start: selected }) });
      const result = await response.json();
      if (!active.current) return;
      if (response.ok && result.confirmed) { setConfirmed(result); setUncertain(false); }
      else {
        setError(result.error || 'We couldn’t confirm your booking. Please retry the same time.');
        setUncertain(response.status >= 500);
        if (result.code === 'taken') { setSlots(list => list.filter(s => s !== selected)); setSelected(''); }
      }
    } catch { if (active.current) { setUncertain(true); setError('The confirmation is taking longer than expected. Retry the same booking; we’ll check it without creating a duplicate.'); } }
    finally { clearTimeout(timer); if (active.current) setPending(false); }
  }

  if (confirmed) return <div className="calendar-success" role="status">
    <span className="calendar-success-icon" aria-hidden="true">✓</span>
    <h3 ref={successHeading} tabIndex={-1}>You’re booked.</h3>
    <p>{fullDay(dateKey(confirmed.start, zone))}<br /><strong>{time(confirmed.start)} – {time(confirmed.end)}</strong><br /><span>{zone.replaceAll('_', ' ')}</span></p>
    <p>Your calendar invitation is on its way to <strong>{details.email}</strong>. Your project details are included so we can prepare.</p>
    {confirmed.meet ? <a className="booking-continue" href={confirmed.meet} target="_blank" rel="noopener noreferrer">Google Meet link ↗</a> : <p>Meeting details will be included in your calendar invitation.</p>}
  </div>;

  return <div className="native-calendar">
    <div className="calendar-context"><span className="calendar-context-icon" aria-hidden="true">↗</span><div><strong>{details.intent === 'quote' ? 'Your project, scoped together.' : 'A little clarity. A lot of possibility.'}</strong><p>{duration} minutes · Free · Google Meet</p></div></div>
    <label className="calendar-zone">Times shown in<select value={zone} disabled={pending || uncertain} onChange={e => { setZone(e.target.value); setMonth(''); setDay(''); setSelected(''); }}>{zones.map(z => <option key={z} value={z}>{z.replaceAll('_', ' ')}</option>)}</select></label>
    <p className="calendar-live" role="status">{loading ? 'Checking your calendar for available times…' : loadError ? 'Calendar temporarily unavailable' : 'Only available times are shown. We’ll check again when you confirm.'}</p>
    {loadError ? <div className="calendar-empty"><p>{loadError}</p><button type="button" className="calendar-text-button" onClick={load}>Try again</button><p>Or <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">open the booking page ↗</a></p></div> : <>
      <div className="calendar-layout" aria-busy={loading}>
        <div className="calendar-month"><div className="calendar-month-heading"><h3>{monthLabel(currentMonth)}</h3><div><button type="button" aria-label="Previous month" disabled={pending || uncertain || loading || months.indexOf(currentMonth) <= 0} onClick={() => { setMonth(months[months.indexOf(currentMonth) - 1]); setSelected(''); }}>‹</button><button type="button" aria-label="Next month" disabled={pending || uncertain || loading || months.indexOf(currentMonth) >= months.length - 1} onClick={() => { setMonth(months[months.indexOf(currentMonth) + 1]); setSelected(''); }}>›</button></div></div>
          <div className="calendar-grid">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span className="calendar-weekday" key={d}>{d}</span>)}{Array.from({ length: offset }, (_, i) => <span key={`space-${i}`} />)}{Array.from({ length: daysInMonth }, (_, i) => {
            const key = `${currentMonth}-${String(i + 1).padStart(2, '0')}`;
            return <button type="button" key={key} disabled={pending || uncertain || loading || !byDay[key]} className={selectedDay === key ? 'is-selected' : ''} aria-label={fullDay(key)} aria-pressed={selectedDay === key} onClick={() => { setDay(key); setSelected(''); setError(''); }}>{i + 1}</button>;
          })}</div>
        </div>
        <div className="calendar-times"><h3>{selectedDay ? fullDay(selectedDay) : 'Available times'}</h3><div className="calendar-slots">{(byDay[selectedDay] || []).map(start => <button type="button" key={start} disabled={pending || uncertain || loading} aria-pressed={selected === start} className={selected === start ? 'is-selected' : ''} onClick={() => { setSelected(start); setError(''); }}>{time(start)}</button>)}</div>{!loading && !selectedDay && <p className="calendar-empty">No times available this month. Try the next month or <a href="mailto:cjgomba@yaralabs.io">contact CJ</a>.</p>}</div>
      </div>
      {error && <p className="booking-error" role="alert">{error}</p>}
      <div className="calendar-confirm"><p>{selected ? <><strong>{fullDay(dateKey(selected, zone))} · {time(selected)}</strong><span>Invite goes to {details.email}</span></> : 'Choose an available date and time.'}</p><button type="button" className="booking-continue" disabled={!selected || pending || loading} onClick={book}>{pending ? 'Confirming…' : uncertain ? 'Check booking' : 'Confirm booking'}<span aria-hidden="true"> →</span></button></div>
    </>}
  </div>;
}
