import { describe, expect, it } from 'vitest';
import { cst, equationLatex, xt } from '../src/math/equation';
import { parseEquation } from '../src/math/parse-equation';
import { hasReducibleFraction, judgeLine } from '../src/math/solve';
import { equation } from '../src/math/equation';

const ok = (s: string) => {
  const r = parseEquation(s);
  if (!r.ok) throw new Error(`${s} : ${r.error}`);
  return r.eq;
};

describe('parseEquation', () => {
  it('reads what the keyboard types', () => {
    expect(ok('2x+3=7')).toEqual({ left: [xt(2), cst(3)], right: [cst(7)], rel: '=' });
    expect(equationLatex(ok('−x + 4 ⩾ 2x'))).toBe('-x + 4 \\geqslant 2x');
    expect(equationLatex(ok('x=−3'))).toBe('x = -3');
    expect(equationLatex(ok('5 − x < 0'))).toBe('5 - x < 0');
    expect(equationLatex(ok('2x+3−3=7−3'))).toBe('2x + 3 - 3 = 7 - 3');
    expect(ok('x ≤ 2').rel).toBe('<=');
    expect(ok('x>=2').rel).toBe('>=');
  });
  it('drops zero terms, keeps a zero member', () => {
    expect(equationLatex(ok('2x+0=4'))).toBe('2x = 4');
    expect(equationLatex(ok('3x+6−6=0−6'))).toBe('3x + 6 - 6 = -6');
    expect(equationLatex(ok('2x=0'))).toBe('2x = 0');
  });
  it('says what is wrong', () => {
    expect(parseEquation('  ')).toEqual({ ok: false, error: 'vide' });
    expect(parseEquation('2x+3')).toEqual({ ok: false, error: 'sans-signe' });
    expect(parseEquation('x=2=2')).toEqual({ ok: false, error: 'deux-signes' });
    expect(parseEquation('=7')).toEqual({ ok: false, error: 'membre-vide' });
    expect(parseEquation('2x=')).toEqual({ ok: false, error: 'membre-vide' });
    for (const s of ['2x3=1', 'x2=1', '2++x=1', '2x+=1', 'x*2=1', '2y=1'])
      expect(parseEquation(s)).toEqual({ ok: false, error: 'mal-ecrit' });
  });
  it('a typed line goes straight to judgeLine', () => {
    const prev = equation([xt(2), cst(3)], [cst(7)]);
    expect(judgeLine(prev, ok('2x=4')).correct).toBe(true);
    expect(judgeLine(prev, ok('2x=10')).errorId).toBe('signe-garde');
    expect(judgeLine(prev, ok('x=2')).final).toBe(true);
  });
  it('fractions: dividing written as a fraction, simplified at the end', () => {
    expect(equationLatex(ok('3x/3=12/3'))).toBe('\\frac{3x}{3} = \\frac{12}{3}');
    expect(equationLatex(ok('x = 12÷3'))).toBe('x = \\frac{12}{3}');
    expect(equationLatex(ok('−2x/−2 < −6/−2'))).toBe('\\frac{-2x}{-2} < \\frac{-6}{-2}');
    expect(equationLatex(ok('x = 1 − 3/2'))).toBe('x = 1 - \\frac{3}{2}');
    expect(parseEquation('x=3/0')).toEqual({ ok: false, error: 'mal-ecrit' });
    const p = equation([xt(3)], [cst(12)]);
    const v = judgeLine(p, ok('3x/3=12/3'));
    expect(v).toMatchObject({ correct: true, final: false, done: { k: 'div', v: 3 } });
    expect(hasReducibleFraction(ok('3x/3=12/3'))).toBe(true);
    expect(judgeLine(p, ok('x=12/3'))).toMatchObject({ correct: true, final: false });
    expect(judgeLine(ok('x=12/3'), ok('x=4'))).toMatchObject({ correct: true, final: true, done: { k: 'reduce' } });
    expect(judgeLine(equation([xt(2)], [cst(3)]), ok('x=3/2'))).toMatchObject({ correct: true, final: true });
    expect(hasReducibleFraction(ok('x=3/2'))).toBe(false);
    expect(judgeLine(equation([xt(-2)], [cst(-6)], '>'), ok('−2x/−2 > −6/−2')).errorId).toBe('sens-non-change');
    expect(judgeLine(equation([xt(-2)], [cst(-6)], '>'), ok('−2x/−2 < −6/−2')).correct).toBe(true);
  });
});
