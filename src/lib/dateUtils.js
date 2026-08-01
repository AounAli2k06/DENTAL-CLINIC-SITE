/**
 * Centralized date handling to avoid timezone bugs.
 *
 * The bug this file fixes: `date.toISOString().split('T')[0]` converts to
 * UTC before slicing off the date, which silently shifts the calendar date
 * by one day for any user west of UTC (or east, depending on time of day).
 * A patient in Austin, TX picking "today" after 7pm local time could end up
 * requesting slots for what the server treats as tomorrow (or vice versa) —
 * so the server queries a date with zero data, and legitimately-open slots
 * are never returned. That's the empty time-slot screen.
 *
 * Fix: always build the "YYYY-MM-DD" key from LOCAL calendar fields on the
 * client, and always anchor day boundaries to UTC on the server using that
 * same string — so the key is the single source of truth, never re-derived
 * through a UTC conversion.
 */

// Client-side: turn a "YYYY-MM-DD" key into a Date object anchored to LOCAL
// midnight (not UTC midnight). Use this instead of `new Date(key)` whenever
// you need to *display* the date — `new Date("2026-08-05")` is parsed as UTC
// midnight, which `toLocaleDateString()` then renders in the browser's local
// timezone, silently showing the wrong calendar day for anyone west of UTC.
export function parseDateKeyLocal(key) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key || '');
  if (!match) return new Date(NaN);
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

// Server-side: turn a Date that was stored via dayBoundsFromKey(...).start
// (i.e. UTC midnight of some calendar day) back into its "YYYY-MM-DD" key.
// Uses UTC getters deliberately — this must invert dayBoundsFromKey exactly,
// not depend on whatever timezone the Node process happens to run in.
export function dateToKeyUTC(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Client-side: turn a JS Date into a local "YYYY-MM-DD" key.
export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Server-side: turn a "YYYY-MM-DD" key into UTC start/end-of-day Date objects.
// Anchoring to UTC (instead of the server process's local timezone) means the
// boundaries are identical no matter where the Node process happens to run.
export function dayBoundsFromKey(key) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key || '');
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

  if (Number.isNaN(start.getTime())) return null;
  return { start, end };
}

// Server-side: what is "today" and "what time is it right now", as observed
// in the clinic's own timezone — not the server process's timezone and not
// the patient's browser timezone. This is what should decide whether a slot
// on "today" has already passed.
export function getClinicNow(timeZone) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const map = {};
  for (const part of parts) map[part.type] = part.value;

  // Intl can format midnight as "24:00" in some environments; normalize it.
  const hour = map.hour === '24' ? 0 : Number(map.hour);

  return {
    dateKey: `${map.year}-${map.month}-${map.day}`,
    minutesSinceMidnight: hour * 60 + Number(map.minute),
  };
}
