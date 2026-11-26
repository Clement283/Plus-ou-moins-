import { describe, expect, it } from 'vitest';
import {
  collect,
  cst,
  equation,
  equationLatex,
  evalMember,
  isSolution,
  memberLatex,
  solveLinear,
  substitute,
  xt,
} from '../src/math/equation';
import { evaluate, toLatex } from '../src/math/expr';
import { rat } from '../src/math/rational';

describe('memberLatex', () => {
  it('ax + b', () => expect(memberLatex([xt(2), cst(3)])).toBe('2x + 3'));
  it('subtracts a negative term instead of adding it', () =>
    expect(memberLatex([xt(2), cst(-3)])).toBe('2x - 3'));
  it('coefficient 1 and -1', () => {
    expect(memberLatex([xt(1)])).toBe('x');
    expect(memberLatex([xt(-1), cst(4)])).toBe('-x + 4');
    expect(memberLatex([cst(5), xt(-1)])).toBe('5 - x');
    expect(memberLatex([cst(5), xt(1)])).toBe('5 + x');
  });
  it('leading negatives and three terms', () => {
    expect(memberLatex([xt(-3), cst(-7)])).toBe('-3x - 7');
    expect(memberLatex([xt(4), cst(1), xt(-2)])).toBe('4x + 1 - 2x');
  });
  it('constant alone', () => expect(memberLatex([cst(-6)])).toBe('-6'));
  it('rejects an empty member or a zero term', () => {
    expect(() => memberLatex([])).toThrow();
    expect(() => memberLatex([xt(0)])).toThrow();
  });
});

describe('equationLatex', () => {
  it('equation', () =>
    expect(equationLatex(equation([xt(3), cst(4)], [xt(1)]))).toBe('3x + 4 = x'));
  it('inequalities', () => {
    expect(equationLatex(equation([xt(2)], [cst(6)], '<='))).toBe('2x \\leqslant 6');
    expect(equationLatex(equation([xt(2)], [cst(6)], '>='))).toBe('2x \\geqslant 6');
    expect(equationLatex(equation([xt(2)], [cst(6)], '<'))).toBe('2x < 6');
    expect(equationLatex(equation([xt(2)], [cst(6)], '>'))).toBe('2x > 6');
  });
});

describe('substitute (x replaced by a number, as a calculation)', () => {
  const s = (m: Parameters<typeof substitute>[0], v: number) => toLatex(substitute(m, v));
  it('ax + b with a negative value gets parentheses', () => {
    expect(s([xt(3), cst(4)], -2)).toBe('3 \\times (-2) + 4');
    expect(s([xt(2), cst(-3)], 5)).toBe('2 \\times 5 - 3');
  });
  it('5 - x with x = -3', () => expect(s([cst(5), xt(-1)], -3)).toBe('5 - (-3)'));
  it('x alone and + x', () => {
    expect(s([xt(1)], -2)).toBe('-2');
    expect(s([cst(5), xt(1)], -3)).toBe('5 + (-3)');
  });
  it('negative coefficient', () => {
    expect(s([xt(-2), cst(3)], -3)).toBe('-2 \\times (-3) + 3');
    expect(s([xt(4), cst(1), xt(-2)], 3)).toBe('4 \\times 3 + 1 - 2 \\times 3');
  });
  it('the calculation evaluates to the member', () => {
    for (const v of [-9, -3, -1, 0, 2, 7]) {
      const m = [xt(-1), cst(6), xt(4), cst(-2)];
      expect(evaluate(substitute(m, v))).toEqual(evalMember(m, rat(v)));
    }
  });
});

describe('evalMember, collect, isSolution', () => {
  it('evaluates', () => expect(evalMember([xt(3), cst(4)], rat(-2))).toEqual(rat(-2)));
  it('collects ax + b', () =>
    expect(collect([xt(4), cst(1), xt(-2), cst(-6)])).toEqual({ a: rat(2), b: rat(-5) }));
  it('equation', () => {
    const eq = equation([xt(3), cst(4)], [xt(1)]);
    expect(isSolution(eq, -2)).toBe(true);
    expect(isSolution(eq, 2)).toBe(false);
  });
  it('inequalities, bound included or not', () => {
    expect(isSolution(equation([xt(2)], [cst(6)], '<='), 3)).toBe(true);
    expect(isSolution(equation([xt(2)], [cst(6)], '<'), 3)).toBe(false);
    expect(isSolution(equation([xt(-2)], [cst(6)], '>='), -2)).toBe(false);
    expect(isSolution(equation([xt(-2)], [cst(6)], '>'), 0)).toBe(false);
    expect(isSolution(equation([xt(-2)], [cst(6)], '<'), 0)).toBe(true);
  });
});

describe('solveLinear', () => {
  it('one solution, integer or not', () => {
    expect(solveLinear(equation([xt(2), cst(3)], [cst(7)]))).toEqual({ kind: 'one', x: rat(2) });
    expect(solveLinear(equation([xt(3), cst(4)], [xt(1)]))).toEqual({ kind: 'one', x: rat(-2) });
    expect(solveLinear(equation([xt(2)], [cst(3)]))).toEqual({ kind: 'one', x: rat(3, 2) });
  });
  it('none or all', () => {
    expect(solveLinear(equation([xt(1), cst(1)], [xt(1)]))).toEqual({ kind: 'none' });
    expect(solveLinear(equation([xt(2), cst(2), xt(-1)], [xt(1), cst(2)]))).toEqual({ kind: 'all' });
  });
  it('refuses an inequality', () =>
    expect(() => solveLinear(equation([xt(2)], [cst(6)], '<'))).toThrow());
  it('the solution satisfies the equation', () => {
    const eq = equation([xt(-4), cst(9)], [xt(2), cst(-3)]);
    const r = solveLinear(eq);
    expect(r).toEqual({ kind: 'one', x: rat(2) });
    expect(isSolution(eq, 2)).toBe(true);
  });
});
