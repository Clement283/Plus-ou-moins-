import { describe, expect, it } from 'vitest';
import { buildQuestion } from '../../src/exercises/build';
import { trouFor } from '../../src/exercises/build/trou';
import { checkAnswer } from '../../src/exercises/check';
import type { Question } from '../../src/exercises/types';
import { type Expr, evaluate, num, op } from '../../src/math/expr';
import { eqRat, rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import { operands } from '../../src/courses/calculs/shared';
import type { Level } from '../../src/courses/types';
import { exOf } from '../courses/helpers';
import { C, RELATIFS, typed } from './helpers';

/** The « trou » question of a doc calculation with its `index`-th number hidden. */
const trouOf = (n: number, display: string, index: number): Question => trouFor(exOf(C(n), display), index);

/** The calculation with its `index`-th leaf replaced by `v`. */
function withLeaf(e: Expr, index: number, v: number): Expr {
  let i = 0;
  const walk = (x: Expr): Expr => {
    if (x.k === 'num') return i++ === index ? num(v) : x;
    if (x.k === 'op') {
      const a = walk(x.a);
      return op(x.op, a, walk(x.b));
    }
    return { ...x, a: walk(x.a) };
  };
  return walk(e);
}

describe('Compléter le trou (doc 04 §2)', () => {
  it.each([
    // Affiché | Bonne réponse | Tapé | Erreur enregistrée
    [2, '−3 + 8', 1, '-3 + \\square = 5', 8, '8', null],
    [2, '−3 + 8', 1, '-3 + \\square = 5', 8, '-8', 'signe-du-mauvais-nombre'],
    [5, '−3 × (−4)', 0, '\\square \\times (-4) = 12', -3, '3', 'regle-signes'],
    [4, '5 − (−3)', 1, '5 - \\square = 8', -3, '3', 'signe-inverse'],
    [6, '−12 ÷ 4', 1, '-12 \\div \\square = -3', 4, '6', 'autre'],
  ] as [number, string, number, string, number, string, string | null][])(
    'cours %i : %s, trou n° %i → %s',
    (n, display, index, prompt, hidden, keys, errorType) => {
      const q = trouOf(n, display, index);
      if (q.kind !== 'trou') throw new Error('kind');
      expect(q.promptLatex).toBe(prompt);
      expect(q.hidden).toEqual(rat(hidden));
      const o = checkAnswer(C(n), q, { raw: typed(keys) });
      expect(o.correct).toBe(errorType === null);
      expect(o.errorType).toBe(errorType);
      expect(o.errorFamily).toBe(errorType === null ? null : errorType === 'autre' ? 'autre' : 'signe');
      expect(o.expected).toBe(`${hidden}`);
      expect(o.given).toBe(keys);
    },
  );

  it('reads the typed answer like a written answer: writing error, then « Simplifie »', () => {
    expect(checkAnswer(C(2), trouOf(2, '−3 + 8', 1), { raw: typed('8-') }).errorType).toBe('moins-apres');
    const o = checkAnswer(C(6), trouOf(6, '−12 ÷ 4', 1), { raw: typed('/8>2') });
    expect([o.correct, o.unfinished, o.errorType]).toEqual([false, true, null]);
  });

  it('never hides a number multiplied by 0', () => {
    const ex = { ...exOf(C(5), '3 × 4'), expr: op('*', num(0), num(4)), answer: rat(0) };
    expect(() => trouFor(ex, 1)).toThrow();
    expect(trouFor(ex, 0).kind).toBe('trou'); // 0 × 4 = 0 → ▢ = 0 only
  });

  it('1 000 draws per course: one possible answer only, a number of the calculation (never the result)', () => {
    for (const n of RELATIFS) {
      const course = C(n);
      const rng = seededRng(100 + n);
      for (let i = 0; i < 1000; i++) {
        const level = ((i % 3) + 1) as Level;
        const q = buildQuestion(course, 'trou', { rng, level, timesSeen: 0 });
        if (q.kind !== 'trou') throw new Error('kind');
        const xs = operands(q.ex.expr);
        const index = xs.findIndex((x) => eqRat(rat(x), q.hidden));
        expect(index).toBeGreaterThanOrEqual(0);
        expect(q.hidden.d).toBe(1);
        expect(q.promptLatex).toMatch(/\\square/);
        // only the hidden number gives the result, among all the numbers of the levels (c06 dividends go up to 99 × 40)
        let solutions = 0;
        for (let v = -4000; v <= 4000; v++) {
          let value;
          try {
            value = evaluate(withLeaf(q.ex.expr, index, v));
          } catch {
            continue; // division by 0
          }
          if (eqRat(value, q.ex.answer)) solutions++;
        }
        expect(solutions, q.promptLatex).toBe(1);
      }
    }
  }, 60_000);
});
