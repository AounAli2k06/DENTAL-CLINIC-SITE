import { describe, it, expect } from 'vitest';
import { formatPKR, SERVICES, TIME_SLOTS } from '../constants';

describe('formatPKR', () => {
  it('formats with the Pakistani thousands-separator convention', () => {
    expect(formatPKR(2500)).toBe('Rs. 2,500/-');
  });

  it('handles large amounts with multiple comma groups', () => {
    expect(formatPKR(120000)).toBe('Rs. 120,000/-');
  });

  it('handles small amounts without a comma', () => {
    expect(formatPKR(500)).toBe('Rs. 500/-');
  });

  it('handles zero', () => {
    expect(formatPKR(0)).toBe('Rs. 0/-');
  });

  it('never contains a dollar sign', () => {
    // Directly guards the "no prices in dollars" requirement.
    for (const service of SERVICES) {
      expect(formatPKR(service.price)).not.toContain('$');
    }
  });
});

describe('SERVICES', () => {
  it('every service has a positive price and duration', () => {
    for (const service of SERVICES) {
      expect(service.price).toBeGreaterThan(0);
      expect(service.duration).toBeGreaterThan(0);
    }
  });

  it('every service has a unique id', () => {
    const ids = SERVICES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('exactly one service is marked most popular', () => {
    const popularCount = SERVICES.filter((s) => s.popular).length;
    expect(popularCount).toBe(1);
  });
});

describe('TIME_SLOTS', () => {
  it('contains no duplicate slots', () => {
    expect(new Set(TIME_SLOTS).size).toBe(TIME_SLOTS.length);
  });

  it('every slot matches the "H:MM AM/PM" display format', () => {
    for (const slot of TIME_SLOTS) {
      expect(slot).toMatch(/^\d{2}:\d{2} (AM|PM)$/);
    }
  });
});
