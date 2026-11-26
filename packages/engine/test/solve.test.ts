import { describe, expect, it } from 'vitest';
import { cst, equation, equationLatex, xt, type Equation } from '../src/math/equation';
import { rat } from '../src/math/rational';
import {
  applyOp,
  doneOpLatex,
  equivalent,
  isFinal,
  judgeLine,
  nextStep,
  opLatex,
  resolve,
  simplify,
  solutionSet,
  wrongNext,
} from '../src/math/solve';
import { randInt, seededRng } from '../src/rng';

const latexLines = (eq: Equation) => resolve(eq).lines.map((l) => equationLatex(l.eq));

describe('applyOp, opLatex, simplify', () => {
  const e = equation([xt(2), cst(3)], [cst(7)]);
  it('same number on both sides, unreduced', () => {
    expect(equationLatex(applyOp(e, { k: 'add', v: -3 }))).toBe('2x + 3 - 3 = 7 - 3');
    expect(opLatex({ k: 'add', v: -3 })).toBe('-3');
    expect(opLatex({ k: 'add', v: 5 })).toBe('+5');
  });
  it('x term on both sides', () => {
    const f = equation([xt(5), cst(1)], [xt(2), cst(7)]);
    expect(equationLatex(applyOp(f, { k: 'addX', c: -2 }))).toBe('5x + 1 - 2x = 2x + 7 - 2x');
    expect(opLatex({ k: 'addX', c: -2 })).toBe('-2x');
    expect(opLatex({ k: 'addX', c: 1 })).toBe('+x');
  });
  it('division writes fractions; a negative divisor flips the inequality', () => {
    expect(equationLatex(applyOp(equation([xt(2)], [cst(4)]), { k: 'div', v: 2 }))).toBe(
      '\\frac{2x}{2} = \\frac{4}{2}',
    );
    expect(equationLatex(applyOp(equation([xt(-2)], [cst(6)], '<='), { k: 'div', v: -2 }))).toBe(
      '\\frac{-2x}{-2} \\geqslant \\frac{6}{-2}',
    );
    expect(opLatex({ k: 'div', v: -2 })).toBe('\\div (-2)');
  });
  it('swap flips the inequality', () =>
    expect(equationLatex(applyOp(equation([cst(7)], [xt(2)], '<'), { k: 'swap' }))).toBe('2x > 7'));
  it('simplify reduces, x first, and can give 0', () => {
    expect(equationLatex(simplify(equation([xt(4), cst(1), xt(-2)], [cst(7), cst(-7)])))).toBe('2x + 1 = 0');
    expect(equationLatex(simplify(applyOp(equation([xt(-2)], [cst(6)], '<='), { k: 'div', v: -2 })))).toBe(
      'x \\geqslant -3',
    );
  });
  it('refuses a non-integer division', () =>
    expect(() => simplify(applyOp(equation([xt(2)], [cst(3)]), { k: 'div', v: 2 }))).toThrow());
});

describe('nextStep', () => {
  it('order: swap, x to the left, number to the right, divide', () => {
    expect(nextStep(equation([cst(7)], [xt(2), cst(3)]))).toEqual({ k: 'swap' });
    expect(nextStep(equation([xt(5), cst(1)], [xt(2), cst(7)]))).toEqual({ k: 'addX', c: -2 });
    expect(nextStep(equation([xt(3), cst(1)], [cst(7)]))).toEqual({ k: 'add', v: -1 });
    expect(nextStep(equation([xt(3)], [cst(6)]))).toEqual({ k: 'div', v: 3 });
    expect(nextStep(equation([xt(1)], [cst(2)]))).toBeNull();
    expect(nextStep(equation([cst(1)], [cst(3)]))).toBeNull();
  });
});

describe('resolve', () => {
  it('ax + b = c', () =>
    expect(latexLines(equation([xt(2), cst(3)], [cst(7)]))).toEqual([
      '2x + 3 = 7',
      '2x + 3 - 3 = 7 - 3',
      '2x = 4',
      '\\frac{2x}{2} = \\frac{4}{2}',
      'x = 2',
    ]));
  it('x on both sides', () =>
    expect(latexLines(equation([xt(5), cst(1)], [xt(2), cst(7)]))).toEqual([
      '5x + 1 = 2x + 7',
      '5x + 1 - 2x = 2x + 7 - 2x',
      '3x + 1 = 7',
      '3x + 1 - 1 = 7 - 1',
      '3x = 6',
      '\\frac{3x}{3} = \\frac{6}{3}',
      'x = 2',
    ]));
  it('x only on the right: swap first', () =>
    expect(latexLines(equation([cst(7)], [xt(2), cst(3)])).slice(0, 3)).toEqual([
      '7 = 2x + 3',
      '2x + 3 = 7',
      '2x + 3 - 3 = 7 - 3',
    ]));
  it('negative right side, and a zero member receives the operation: 0 - 6', () => {
    expect(latexLines(equation([xt(2), cst(3)], [cst(-3)])).slice(1, 3)).toEqual(['2x + 3 - 3 = -3 - 3', '2x = -6']);
    expect(latexLines(equation([xt(3), cst(6)], [cst(0)]))[1]).toBe('3x + 6 - 6 = 0 - 6');
  });
  it('reduces an unreduced statement first', () =>
    expect(latexLines(equation([xt(4), cst(1), xt(-2)], [cst(7)])).slice(0, 2)).toEqual([
      '4x + 1 - 2x = 7',
      '2x + 1 = 7',
    ]));
  it('inequality divided by a negative', () => {
    const e = equation([xt(-2), cst(1)], [cst(7)], '<=');
    expect(latexLines(e).slice(-3)).toEqual(['-2x \\leqslant 6', '\\frac{-2x}{-2} \\geqslant \\frac{6}{-2}', 'x \\geqslant -3']);
    expect(resolve(e).set).toEqual({ kind: 'ray', rel: '>=', bound: rat(-3) });
  });
  it('x disappears: no solution or all numbers', () => {
    const none = resolve(equation([xt(1), cst(1)], [xt(1), cst(3)]));
    expect(equationLatex(none.lines.at(-1)!.eq)).toBe('1 = 3');
    expect(none.set).toEqual({ kind: 'none' });
    expect(resolve(equation([xt(2), cst(1)], [xt(2), cst(5)], '<')).set).toEqual({ kind: 'all' });
  });
  it('every line keeps the solutions, the last one is x = solution (random equations)', () => {
    const rng = seededRng(42);
    const nz = () => (randInt(rng, 0, 1) ? 1 : -1) * randInt(rng, 1, 9);
    for (let i = 0; i < 300; i++) {
      const x = randInt(rng, -9, 9);
      const a = nz();
      let c = nz();
      if (c === a) c = -a;
      const d = nz();
      const b = c * x + d - a * x;
      const rels = ['=', '<', '<=', '>', '>='] as const;
      const rel = rels[randInt(rng, 0, 4)]!;
      const e = equation(b === 0 ? [xt(a)] : [xt(a), cst(b)], [xt(c), cst(d)], rel);
      const { lines } = resolve(e);
      for (const l of lines) expect(equivalent(l.eq, e)).toBe(true);
      const last = lines.at(-1)!.eq;
      expect(isFinal(last)).toBe(true);
      expect(last.right).toEqual([x === 0 ? cst(0) : cst(x)]);
    }
  });
});

describe('solutionSet', () => {
  it('equation and inequalities', () => {
    expect(solutionSet(equation([xt(3), cst(4)], [xt(1)]))).toEqual({ kind: 'one', x: rat(-2) });
    expect(solutionSet(equation([xt(-3)], [cst(6)], '<'))).toEqual({ kind: 'ray', rel: '>', bound: rat(-2) });
    expect(solutionSet(equation([xt(2)], [cst(3)], '>='))).toEqual({ kind: 'ray', rel: '>=', bound: rat(3, 2) });
  });
});

describe('judgeLine', () => {
  const e = equation([xt(2), cst(3)], [cst(7)]);
  it('right lines, finished or not', () => {
    expect(judgeLine(e, equation([xt(2)], [cst(4)]))).toMatchObject({ correct: true, final: false, unchanged: false, errorId: null });
    expect(judgeLine(e, equation([xt(1)], [cst(2)]))).toMatchObject({ correct: true, final: true, unchanged: false, errorId: null });
    expect(judgeLine(e, equation([cst(3), xt(2)], [cst(7)])).unchanged).toBe(true);
    expect(judgeLine(e, applyOp(e, { k: 'add', v: -3 })).correct).toBe(true);
  });
  it('done on one side only', () =>
    expect(judgeLine(e, equation([xt(2)], [cst(7)])).errorId).toBe('un-seul-cote'));
  it('moved without changing the sign', () =>
    expect(judgeLine(e, equation([xt(2)], [cst(10)])).errorId).toBe('signe-garde'));
  it('x moved without changing the sign', () =>
    expect(judgeLine(equation([xt(5), cst(1)], [xt(2), cst(7)]), equation([xt(7), cst(1)], [cst(7)])).errorId).toBe(
      'signe-garde',
    ));
  it('subtracted the coefficient instead of dividing', () =>
    expect(judgeLine(equation([xt(2)], [cst(8)]), equation([xt(1)], [cst(6)])).errorId).toBe('soustraire-coef'));
  it('lost the sign when dividing by a negative', () =>
    expect(judgeLine(equation([xt(-2)], [cst(8)]), equation([xt(1)], [cst(4)])).errorId).toBe(
      'signe-perdu-division',
    ));
  it('kept the direction of the inequality', () =>
    expect(judgeLine(equation([xt(-2)], [cst(6)], '<='), equation([xt(1)], [cst(-3)], '<=')).errorId).toBe(
      'sens-non-change',
    ));
  it('unknown mistake', () =>
    expect(judgeLine(e, equation([xt(1)], [cst(9)]))).toMatchObject({ correct: false, final: false, unchanged: false, errorId: null }));
  it('her own method: several operations at once, then reduce, then divide', () => {
    const p0 = equation([xt(4), cst(-3)], [xt(1), cst(9)]);
    const p1 = equation([xt(4), xt(-1)], [cst(9), cst(3)]); // 4x − x = 9 + 3
    const v1 = judgeLine(p0, p1);
    expect(v1).toMatchObject({ correct: true, unchanged: false, done: { k: 'add', x: -1, n: 3 } });
    expect(doneOpLatex(v1.done!)).toBe('-x +3');
    const p2 = equation([xt(3)], [cst(12)]);
    expect(judgeLine(p1, p2)).toMatchObject({ correct: true, unchanged: false, done: { k: 'reduce' } });
    expect(judgeLine(p1, equation([xt(1)], [cst(4)]))).toMatchObject({ correct: true, final: true, done: { k: 'div', v: 3 } });
  });
  it('x moved to the right, answer written 4 = x', () => {
    const p0 = equation([xt(4), cst(-3)], [xt(1), cst(9)]);
    const p1 = equation([cst(-3)], [xt(-3), cst(9)]);
    expect(judgeLine(p0, p1)).toMatchObject({ correct: true, done: { k: 'add', x: -4, n: 0 } });
    expect(judgeLine(equation([cst(-12)], [xt(-3)]), equation([cst(4)], [xt(1)]))).toMatchObject({
      correct: true,
      final: true,
      done: { k: 'div', v: -3 },
    });
  });
  it('a recopied line (terms in another order) does not move forward', () =>
    expect(judgeLine(e, equation([cst(3), xt(2)], [cst(7)])).unchanged).toBe(true));
  it('mistake while grouping terms', () =>
    expect(judgeLine(equation([xt(4), xt(-1)], [cst(12)]), equation([xt(4)], [cst(12)])).errorId).toBe('reduction'));
  it('direction changed for no reason', () =>
    expect(judgeLine(equation([xt(2), cst(3)], [cst(7)], '<'), equation([xt(2)], [cst(4)], '>')).errorId).toBe(
      'sens-change-a-tort',
    ));
  it('swap of the members is read as such', () =>
    expect(judgeLine(equation([cst(7)], [xt(2)], '<'), equation([xt(2)], [cst(7)], '>'))).toMatchObject({
      correct: true,
      done: { k: 'swap' },
    }));
  it('wrong lines are never equivalent to the previous line', () => {
    for (const w of wrongNext(e)) expect(equivalent(w.eq, e)).toBe(false);
  });
});
