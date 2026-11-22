import { describe, expect, it } from 'vitest';
import { evaluate, num, op, pow, terms, toLatex } from '../src/math/expr';
import { rat } from '../src/math/rational';
import { pick, randInt, seededRng, shuffle } from '../src/rng';

describe('toLatex', () => {
  it('leading negative has no parentheses', () =>
    expect(toLatex(op('+', num(-3), num(-5)))).toBe('-3 + (-5)'));
  it('times', () => expect(toLatex(op('*', num(4), num(-3)))).toBe('4 \\times (-3)'));
  it('div', () => expect(toLatex(op('/', num(-12), num(4)))).toBe('-12 \\div 4'));
  it('pow of negative', () => expect(toLatex(pow(num(-3), 2))).toBe('(-3)^{2}'));
  it('pow of positive', () => expect(toLatex(pow(num(3), 2))).toBe('3^{2}'));
  it('stacked fractions', () => {
    expect(toLatex(num(rat(-3, 4)))).toBe('-\\frac{3}{4}');
    expect(toLatex(op('+', num(1), num(rat(-3, 4))))).toBe('1 + (-\\frac{3}{4})');
  });
  it('parenthesises by precedence', () => {
    expect(toLatex(op('*', op('+', num(2), num(3)), num(4)))).toBe('(2 + 3) \\times 4');
    expect(toLatex(op('+', num(2), op('*', num(3), num(4))))).toBe('2 + 3 \\times 4');
    expect(toLatex(op('-', num(2), op('-', num(3), num(4))))).toBe('2 - (3 - 4)');
    expect(toLatex(op('-', op('-', num(2), num(3)), num(4)))).toBe('2 - 3 - 4');
    expect(toLatex(op('/', num(8), op('*', num(2), num(2))))).toBe('8 \\div (2 \\times 2)');
    expect(toLatex(pow(op('+', num(2), num(3)), 2))).toBe('(2 + 3)^{2}');
  });
  it('negative leading inside parentheses', () =>
    expect(toLatex(op('*', num(2), op('+', num(-3), num(5))))).toBe('2 \\times (-3 + 5)'));
});

describe('evaluate', () => {
  it('respects structure', () =>
    expect(evaluate(op('-', num(3), op('*', num(2), num(-4))))).toEqual(rat(11)));
  it('divides into fractions', () =>
    expect(evaluate(op('/', num(1), num(-2)))).toEqual(rat(-1, 2)));
  it('powers', () => {
    expect(evaluate(pow(num(-3), 2))).toEqual(rat(9));
    expect(evaluate(pow(num(-2), 3))).toEqual(rat(-8));
    expect(evaluate(pow(num(2), 0))).toEqual(rat(1));
    expect(evaluate(pow(num(2), -2))).toEqual(rat(1, 4));
  });
});

describe('terms', () => {
  it('flattens a chain of additions left to right', () => {
    const a = num(1), b = num(-2), c = op('*', num(3), num(4)), d = num(5);
    expect(terms(op('+', op('+', op('+', a, b), c), d))).toEqual([a, b, c, d]);
  });
  it('flattens right-nested additions too', () => {
    const a = num(1), b = num(2), c = num(3);
    expect(terms(op('+', a, op('+', b, c)))).toEqual([a, b, c]);
  });
  it('returns a single term otherwise', () => {
    const e = op('-', num(1), num(2));
    expect(terms(e)).toEqual([e]);
  });
});

describe('rng', () => {
  it('is deterministic per seed', () => {
    expect(seededRng(42)()).toBe(seededRng(42)());
    expect(seededRng(1)()).not.toBe(seededRng(2)());
  });
  it('stays in [0,1)', () => {
    const r = seededRng(7);
    for (let i = 0; i < 100; i++) { const x = r(); expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThan(1); }
  });
  it('randInt is inclusive', () => {
    const r = seededRng(3);
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) seen.add(randInt(r, -2, 2));
    expect([...seen].sort((a, b) => a - b)).toEqual([-2, -1, 0, 1, 2]);
  });
  it('pick returns an element', () => {
    const r = seededRng(5);
    for (let i = 0; i < 20; i++) expect(['a', 'b', 'c']).toContain(pick(r, ['a', 'b', 'c']));
  });
  it('shuffle returns a permutation without mutating', () => {
    const arr = [1, 2, 3, 4, 5, 6];
    const out = shuffle(seededRng(9), arr);
    expect(arr).toEqual([1, 2, 3, 4, 5, 6]);
    expect([...out].sort((a, b) => a - b)).toEqual(arr);
    expect(shuffle(seededRng(9), arr)).toEqual(out);
  });
});
