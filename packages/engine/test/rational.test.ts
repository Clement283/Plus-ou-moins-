import { describe, expect, it } from 'vitest';
import { add, div, eqRat, mul, neg, rat, ratToString, sub } from '../src/math/rational';

describe('rational', () => {
  it('adds', () => expect(add(rat(3, 4), rat(1, 6))).toEqual({ n: 11, d: 12 }));
  it('normalises sign and gcd', () => {
    expect(rat(2, -4)).toEqual({ n: -1, d: 2 });
    expect(rat(6, 3)).toEqual({ n: 2, d: 1 });
    expect(rat(0, -5)).toEqual({ n: 0, d: 1 });
  });
  it('throws on zero denominator', () => expect(() => rat(1, 0)).toThrow());
  it('throws on division by zero', () => expect(() => div(rat(1), rat(0))).toThrow());
  it('subtracts, multiplies, divides, negates', () => {
    expect(sub(rat(1, 2), rat(3, 4))).toEqual(rat(-1, 4));
    expect(mul(rat(-2, 3), rat(3, 4))).toEqual(rat(-1, 2));
    expect(div(rat(-12), rat(4))).toEqual(rat(-3));
    expect(div(rat(1), rat(-2))).toEqual(rat(-1, 2));
    expect(neg(rat(1, 2))).toEqual(rat(-1, 2));
    expect(neg(rat(0))).toEqual(rat(0));
  });
  it('compares', () => {
    expect(eqRat(rat(1, 2), rat(2, 4))).toBe(true);
    expect(eqRat(rat(1, 2), rat(1, 3))).toBe(false);
  });
  it('prints', () => {
    expect(ratToString(rat(-12, 5))).toBe('-12/5');
    expect(ratToString(rat(4, 2))).toBe('2');
  });
});
