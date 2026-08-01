import { describe, it, expect } from 'vitest';
import {
  toDateKey,
  parseDateKeyLocal,
  dayBoundsFromKey,
  dateToKeyUTC,
  getClinicNow,
} from '../dateUtils';

describe('toDateKey', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    const d = new Date(2026, 7, 3); // August 3, 2026 (month is 0-indexed)
    expect(toDateKey(d)).toBe('2026-08-03');
  });

  it('pads single-digit months and days', () => {
    const d = new Date(2026, 0, 5); // January 5, 2026
    expect(toDateKey(d)).toBe('2026-01-05');
  });

  it('does NOT shift the date via UTC conversion — the original bug', () => {
    // This is the exact bug that broke the time-slot picker: the old code
    // used `date.toISOString().split('T')[0]`, which converts to UTC first.
    // A date built from local fields must produce a key matching those same
    // local fields, regardless of what UTC offset the test runner is in.
    const d = new Date(2026, 11, 31, 23, 59); // Dec 31, 2026, 11:59pm local
    expect(toDateKey(d)).toBe('2026-12-31');
  });
});

describe('parseDateKeyLocal', () => {
  it('round-trips with toDateKey', () => {
    const key = '2026-08-03';
    const parsed = parseDateKeyLocal(key);
    expect(toDateKey(parsed)).toBe(key);
  });

  it('produces a date whose LOCAL calendar fields match the key exactly', () => {
    // The bug this guards against: `new Date("2026-08-05")` parses as UTC
    // midnight, and toLocaleDateString() then renders that in the local
    // timezone — which can display as Aug 4 for anyone west of UTC.
    // parseDateKeyLocal must never go through that UTC parse at all.
    const parsed = parseDateKeyLocal('2026-08-05');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7); // August, 0-indexed
    expect(parsed.getDate()).toBe(5);
  });

  it('returns an invalid Date for a malformed key rather than guessing', () => {
    expect(Number.isNaN(parseDateKeyLocal('not-a-date').getTime())).toBe(true);
    expect(Number.isNaN(parseDateKeyLocal('').getTime())).toBe(true);
  });
});

describe('dayBoundsFromKey', () => {
  it('anchors start/end of day to UTC regardless of runtime timezone', () => {
    const bounds = dayBoundsFromKey('2026-08-03');
    expect(bounds.start.toISOString()).toBe('2026-08-03T00:00:00.000Z');
    expect(bounds.end.toISOString()).toBe('2026-08-03T23:59:59.999Z');
  });

  it('returns null for an invalid key instead of a garbage date range', () => {
    expect(dayBoundsFromKey('garbage')).toBeNull();
    expect(dayBoundsFromKey('')).toBeNull();
    expect(dayBoundsFromKey(undefined)).toBeNull();
  });

  it('handles month/year boundaries correctly', () => {
    const bounds = dayBoundsFromKey('2026-12-31');
    expect(bounds.start.getUTCFullYear()).toBe(2026);
    expect(bounds.start.getUTCMonth()).toBe(11);
    expect(bounds.start.getUTCDate()).toBe(31);
  });
});

describe('dateToKeyUTC', () => {
  it('inverts dayBoundsFromKey exactly — this is what status-change emails rely on', () => {
    // The Appointment model stores `date` as whatever dayBoundsFromKey(key).start
    // produced. When we later need to email the patient about a status change,
    // we have to turn that stored Date back into the same key. If this drifts
    // even one day off, the confirmation/cancellation email shows the wrong date.
    const originalKey = '2026-08-03';
    const stored = dayBoundsFromKey(originalKey).start;
    expect(dateToKeyUTC(stored)).toBe(originalKey);
  });

  it('round-trips for every day in a 31-day month, not just a spot check', () => {
    for (let day = 1; day <= 31; day++) {
      const key = `2026-01-${String(day).padStart(2, '0')}`;
      const stored = dayBoundsFromKey(key).start;
      expect(dateToKeyUTC(stored)).toBe(key);
    }
  });
});

describe('getClinicNow', () => {
  it('returns a dateKey matching the YYYY-MM-DD shape', () => {
    const { dateKey } = getClinicNow('Asia/Karachi');
    expect(dateKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns minutesSinceMidnight within a valid 0-1439 range', () => {
    const { minutesSinceMidnight } = getClinicNow('Asia/Karachi');
    expect(minutesSinceMidnight).toBeGreaterThanOrEqual(0);
    expect(minutesSinceMidnight).toBeLessThan(24 * 60);
  });

  it('agrees with a manually computed Karachi time for a fixed instant', () => {
    // Karachi is a fixed UTC+5 offset (no DST), so this is a stable check —
    // we don't need to mock the clock, just verify the timezone math itself
    // against a known reference point in wall-clock terms.
    const { minutesSinceMidnight: karachiMinutes } = getClinicNow('Asia/Karachi');
    const { minutesSinceMidnight: utcMinutes } = getClinicNow('UTC');
    // Karachi is always exactly 300 minutes (5 hours) ahead of UTC, modulo a day.
    const diff = (karachiMinutes - utcMinutes + 1440) % 1440;
    expect(diff).toBe(300);
  });
});
