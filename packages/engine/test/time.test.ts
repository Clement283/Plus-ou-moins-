import { describe, expect, it } from 'vitest';
import { addDays, diffDays, parisDay } from '../src/time';

describe('parisDay', () => {
  it('handles winter time (UTC+1)', () => {
    expect(parisDay(Date.parse('2026-11-22T22:59:00Z'))).toBe('2026-11-22');
    expect(parisDay(Date.parse('2026-11-22T23:01:00Z'))).toBe('2026-11-23');
  });
  it('handles summer time (UTC+2)', () => {
    expect(parisDay(Date.parse('2026-07-01T21:59:00Z'))).toBe('2026-07-01');
    expect(parisDay(Date.parse('2026-07-01T22:01:00Z'))).toBe('2026-07-02');
  });
  it('handles the DST change day', () => {
    expect(parisDay(Date.parse('2026-10-25T00:30:00Z'))).toBe('2026-10-25');
  });
});

describe('addDays', () => {
  it('adds across months', () => expect(addDays('2026-03-25', 10)).toBe('2026-04-04'));
  it('subtracts', () => expect(addDays('2026-03-01', -1)).toBe('2026-02-28'));
  it('crosses years and leap days', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });
  it('is stable over DST changes', () => expect(addDays('2026-03-28', 2)).toBe('2026-03-30'));
});

describe('diffDays', () => {
  it('is b minus a', () => {
    expect(diffDays('2026-03-25', '2026-04-04')).toBe(10);
    expect(diffDays('2026-04-04', '2026-03-25')).toBe(-10);
    expect(diffDays('2026-05-05', '2026-05-05')).toBe(0);
  });
  it('is exact across DST changes and years', () => {
    expect(diffDays('2026-03-28', '2026-03-30')).toBe(2);
    expect(diffDays('2026-10-24', '2026-10-26')).toBe(2);
    expect(diffDays('2026-12-31', '2027-01-01')).toBe(1);
  });
});
