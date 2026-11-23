import { describe, expect, it } from 'vitest';
import { buildQuestion } from '../../src/exercises/build';
import { type Formula, qcmFor } from '../../src/exercises/build/qcm';
import { checkAnswer } from '../../src/exercises/check';
import { num, toLatex } from '../../src/math/expr';
import { eqRat, rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import { diagnose } from '../../src/courses';
import type { Level } from '../../src/courses/types';
import { exOf } from '../courses/helpers';
import { C, RELATIFS } from './helpers';

type Choice = [number, string | null];
const key = (cs: Choice[]): string => JSON.stringify([...cs].sort((a, b) => a[0] - b[0]));

/** Every distinct set of choices `qcmFor` makes on this calculation, over 3 000 seeds. */
function reachable(n: number, display: string, level: Level, formula: Formula): Set<string> {
  const ex = exOf(C(n), display, level);
  const out = new Set<string>();
  for (let s = 0; s < 3000; s++) {
    const q = qcmFor(C(n), ex, formula, seededRng(s));
    if (q.kind !== 'qcm') throw new Error('kind');
    expect(q.formula).toBe(formula);
    out.add(key(q.choices.map((c) => [c.value.n, c.errorType])));
  }
  return out;
}

describe('QCM (doc 04 §7)', () => {
  it.each([
    // Calcul | Bonne réponse | Formule | Choix et erreur reliée
    [5, '−3 × (−3)', 1, 'debut', [[9, null], [-9, 'regle-signes'], [6, 'addition-au-lieu-multiplication'], [8, 'autre']]],
    [5, '−3 × (−3)', 1, 'paires-signes', [[9, null], [-9, 'regle-signes'], [6, 'addition-au-lieu-multiplication'], [-6, 'addition-au-lieu-multiplication']]],
    [1, '−3 + (−5)', 1, 'debut', [[-8, null], [8, 'signe-oublie'], [-2, 'soustraction-au-lieu-addition'], [-7, 'autre']]],
    [2, '−3 + 5', 1, 'paires-signes', [[2, null], [-2, 'signe-du-mauvais-nombre'], [8, 'addition-au-lieu-soustraction'], [-8, 'addition-au-lieu-soustraction']]],
    [4, '5 − (−3)', 1, 'melangee', [[8, null], [2, 'oppose-oublie'], [11, 'autre'], [-9, 'autre']]],
    [2, '−248 + 75', 3, 'melangee', [[-173, null], [173, 'signe-du-mauvais-nombre'], [-190, 'autre'], [156, 'autre']]],
    [2, '−7 + 7', 1, 'debut', [[0, null], [-14, 'addition-au-lieu-soustraction'], [14, 'addition-au-lieu-soustraction'], [1, 'autre']]],
  ] as [number, string, Level, Formula, Choice[]][])('cours %i : %s (%s)', (n, display, level, formula, choices) => {
    expect(reachable(n, display, level, formula)).toContain(key(choices));
  });

  it('−3 × (−3), mélangée: 9 ✓ · −6 addition · 7 autre (the doc\'s 12 is erreur-table, so never an « autre » trap)', () => {
    const ex = exOf(C(5), '−3 × (−3)');
    expect(diagnose(C(5), ex, rat(12))?.errorType).toBe('erreur-table');
    const sets = [...reachable(5, '−3 × (−3)', 1, 'melangee')].map((s) => JSON.parse(s) as Choice[]);
    const has = (cs: Choice[], c: Choice): boolean => cs.some((x) => x[0] === c[0] && x[1] === c[1]);
    expect(sets.some((cs) => has(cs, [9, null]) && has(cs, [-6, 'addition-au-lieu-multiplication']) && has(cs, [7, 'autre']))).toBe(true);
    expect(sets.some((cs) => has(cs, [12, 'autre']))).toBe(false);
  });

  it('records the error tied to the choice', () => {
    const q = qcmFor(C(5), exOf(C(5), '−3 × (−3)'), 'debut', seededRng(1));
    if (q.kind !== 'qcm') throw new Error('kind');
    q.choices.forEach((c, i) => {
      const o = checkAnswer(C(5), q, { choice: i });
      expect(o.correct).toBe(i === q.correctIndex);
      expect(o.errorType).toBe(c.errorType);
      expect(o.given).toBe(c.latex);
      expect(o.expected).toBe(toLatex(num(9)));
      if (c.errorType !== null) expect(o.errorFamily).toBe(c.errorType === 'autre' ? 'autre' : C(5).errors.find((e) => e.id === c.errorType)?.family);
    });
  });

  it('1 000 QCM per course: 4 choices, the answer exactly once, no duplicate, integers, the formula followed', () => {
    for (const n of RELATIFS) {
      const course = C(n);
      const rng = seededRng(700 + n);
      const formulas = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        const level = ((i % 3) + 1) as Level;
        const timesSeen = i % 10;
        const q = buildQuestion(course, 'qcm', { rng, level, timesSeen });
        if (q.kind !== 'qcm') throw new Error('kind');
        formulas.add(q.formula);
        const r = q.ex.answer;
        const values = q.choices.map((c) => c.value);
        expect(q.choices).toHaveLength(4);
        expect(values.filter((v) => eqRat(v, r))).toHaveLength(1);
        expect(eqRat(values[q.correctIndex] as typeof r, r)).toBe(true);
        expect(new Set(values.map((v) => `${v.n}/${v.d}`)).size).toBe(4);
        for (const c of q.choices) {
          expect(c.value.d).toBe(1);
          expect(c.latex).toBe(toLatex(num(c.value)));
          if (eqRat(c.value, r)) expect(c.errorType).toBeNull();
          else expect(c.errorType).toBe(diagnose(course, q.ex, c.value)?.errorType);
        }
        const typical = q.choices.filter((c) => c.errorType !== null && c.errorType !== 'autre').length;
        const available = new Set(course.errors.flatMap((e) => e.wrongValues(q.ex).map((v) => v.n))).size;
        const traps = q.choices.filter((c) => c.errorType !== null);
        if (timesSeen < 5) expect(q.formula).toBe('debut');
        if (q.formula === 'debut') expect(typical).toBe(Math.min(2, available));
        if (q.formula === 'melangee') expect(typical).toBe(Math.min(1, available));
        if (q.formula === 'paires-signes') {
          expect(r.n).not.toBe(0);
          for (const v of values) expect(values.some((w) => w.n === -v.n)).toBe(true);
        } else {
          // non-typical traps: same size, no 0 unless the answer is between −3 and 3
          for (const c of traps.filter((t) => t.errorType === 'autre')) {
            const gap = Math.abs(Math.abs(c.value.n) - Math.abs(r.n));
            if (Math.abs(r.n) <= 20) expect([1, 2, 3]).toContain(gap);
            else {
              const a = Math.abs(r.n);
              expect([Math.round(0.1 * a), Math.round(0.2 * a), 10, 20, 30]).toContain(gap);
            }
            if (Math.abs(r.n) > 3) expect(c.value.n).not.toBe(0);
          }
        }
      }
      expect([...formulas].sort()).toEqual(['debut', 'melangee', 'paires-signes']);
    }
  });

  it('works for every course 0 to 7 (reviews)', () => {
    for (const n of [0, ...RELATIFS]) {
      const q = buildQuestion(C(n), 'qcm', { rng: seededRng(n), level: 1, timesSeen: 7 });
      expect(q.kind).toBe('qcm');
    }
  });
});
