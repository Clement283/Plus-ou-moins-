import { describe, expect, it } from 'vitest';
import { buildQuestion } from '../../src/exercises/build';
import { checkAnswer, checkParts } from '../../src/exercises/check';
import type { Question } from '../../src/exercises/types';
import { num, toLatex } from '../../src/math/expr';
import { eqRat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import type { Level } from '../../src/courses/types';
import { exOf } from '../courses/helpers';
import { C, RELATIFS } from './helpers';

// The doc's screen: −3 × (−4) · 6 × (−2) · −5 × (−2) · 3 × (−3), results −9 · 12 · 10 · −12
const exs = ['−3 × (−4)', '6 × (−2)', '−5 × (−2)', '3 × (−3)'].map((d) => exOf(C(5), d));
const q: Question = {
  kind: 'paires',
  exs,
  left: exs.map((e) => toLatex(e.expr)),
  right: [-9, 12, 10, -12].map((v) => ({ latex: toLatex(num(v)), value: exs.find((e) => e.answer.n === v)?.answer ?? exs[0]!.answer })),
};
const at = (v: number): number => (q.kind === 'paires' ? q.right.findIndex((r) => r.value.n === v) : -1);

describe('Relier les paires (doc 04 §5)', () => {
  it.each([
    // Calcul | Résultat choisi | Erreur enregistrée
    [0, 12, null],
    [0, -12, 'regle-signes'],
    [1, 10, 'autre'],
  ] as [number, number, string | null][])('calcul n° %i, résultat %i → %s', (left, value, errorType) => {
    const [o] = checkParts(C(5), q, { pairs: [[left, at(value)]] });
    expect(o?.correct).toBe(errorType === null);
    expect(o?.errorType).toBe(errorType);
    expect(o?.given).toBe(`${value}`);
    expect(o?.expected).toBe(`${exs[left]!.answer.n}`);
  });

  it('juste only if the 4 pairs are right the first time; a wrong pair records its error', () => {
    const right: [number, number][] = [[0, at(12)], [1, at(-12)], [2, at(10)], [3, at(-9)]];
    expect(checkAnswer(C(5), q, { pairs: right }).correct).toBe(true);
    // a wrong attempt, then she retries and gets it right
    const o = checkAnswer(C(5), q, { pairs: [[0, at(-12)], ...right] });
    expect([o.correct, o.errorType, o.errorFamily]).toEqual([false, 'regle-signes', 'signe']);
    expect(checkParts(C(5), q, { pairs: [[0, at(-12)], ...right] }).map((p) => p.correct)).toEqual([false, true, true, true, true]);
    // not finished: not an answer to the exercise
    expect(() => checkAnswer(C(5), q, { pairs: right.slice(0, 3) })).toThrow(/incomplète/);
    expect(() => checkAnswer(C(5), q, { pairs: [[0, at(-12)]] })).toThrow(/incomplète/);
  });

  it('1 000 draws per course: 4 calculations of the course, 4 results all different', () => {
    for (const n of RELATIFS) {
      const course = C(n);
      const rng = seededRng(500 + n);
      for (let i = 0; i < 1000; i++) {
        const level = ((i % 3) + 1) as Level;
        const p = buildQuestion(course, 'paires', { rng, level, timesSeen: 0 });
        if (p.kind !== 'paires') throw new Error('kind');
        expect(p.exs).toHaveLength(4);
        expect(p.left).toEqual(p.exs.map((e) => toLatex(e.expr)));
        expect(new Set(p.left).size).toBe(4);
        expect(new Set(p.right.map((r) => r.latex)).size).toBe(4);
        for (const e of p.exs) {
          expect(e.courseId).toBe(course.id);
          expect(e.level).toBe(level);
          expect(p.right.filter((r) => eqRat(r.value, e.answer))).toHaveLength(1);
        }
        for (const r of p.right) expect(r.latex).toBe(toLatex(num(r.value)));
      }
    }
  });
});
