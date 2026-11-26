import { describe, expect, it } from 'vitest';
import { courseRunItems } from '../../src';
import { ESSAIS_COURSES } from '../../src/courses/essais';
import { equationsTesterSolution as c } from '../../src/courses/essais/equations-tester-solution';
import { type Member, cst, substitute, xt } from '../../src/math/equation';
import { evaluate, toLatex } from '../../src/math/expr';
import { rat } from '../../src/math/rational';
import { diagnose } from '../../src/courses';
import { seededRng } from '../../src/rng';
import type { Outcome, Question } from '../../src/exercises/types';
import type { Exercise, Level } from '../../src/courses/types';
import { ints, propertyChecks, within } from './helpers';

interface Meta {
  left: Member;
  right: Member;
  x: number;
  side: string;
}
const mk = (left: Member, x: number, right: Member = [cst(0)]): Exercise => {
  const expr = substitute(left, x);
  return { courseId: c.id, level: 1, expr, answer: evaluate(expr), meta: { left, right, x, side: 'left' } };
};
const A = mk([xt(3), cst(4)], -2); // 3 × (−2) + 4 = −2
const B = mk([cst(5), xt(-1)], -3); // 5 − (−3) = 8

// La valeur fausse de chaque erreur, recalculée ici indépendamment du cours.
function valueOf(ex: Exercise, mode: 'colle' | 'paren' | 'signe'): number {
  const m = ex.meta as unknown as Meta;
  const mem = m.side === 'left' ? m.left : m.right;
  let acc = 0;
  mem.forEach((t, i) => {
    const raw = t.k === 'x' ? t.coef : t.v;
    const a = i === 0 ? raw : Math.abs(raw);
    const sub = i > 0 && raw < 0;
    let p = t.k === 'num' ? a : Math.abs(a) === 1 ? m.x : a * m.x;
    const isProduct = t.k === 'x' && Math.abs(a) >= 2;
    if (mode === 'colle' && isProduct) p = m.x > 0 ? Math.sign(a) * (10 * Math.abs(a) + m.x) : a + m.x;
    if (mode === 'signe' && isProduct && !sub && p < 0) p = -p;
    if (mode === 'paren' && sub && p < 0) p = -p;
    acc = i === 0 ? p : sub ? acc - p : acc + p;
  });
  return acc;
}

describe('Équations, cours 1 — Tester si un nombre est solution', () => {
  it('est dans le module Essais', () => expect(ESSAIS_COURSES).toContain(c));

  it('le calcul obtenu et sa résolution', () => {
    expect(toLatex(A.expr)).toBe('3 \\times (-2) + 4');
    expect(A.answer).toEqual(rat(-2));
    expect(c.resolution(A)).toEqual(['3 \\times (-2) + 4', '= -6 + 4', '= -2']);
    expect(toLatex(B.expr)).toBe('5 - (-3)');
    expect(c.resolution(B)).toEqual(['5 - (-3)', '= 5 + 3', '= 8']);
  });

  it.each([
    [A, 10, 'signe-relatif'],
    [A, 5, 'x-colle'],
    [A, 2, 'autre'],
    [B, 2, 'parentheses-oubliees'],
    [B, -8, 'autre'],
  ] as [Exercise, number, string][])('%#: réponse %i → %s', (ex, given, errorType) =>
    expect(diagnose(c, ex, rat(given))?.errorType).toBe(errorType),
  );

  it('x collé : 2x pour x = 3 lu 23, ou 2 + 3', () => {
    const e = mk([xt(2), cst(1)], 3);
    expect(diagnose(c, e, rat(24))?.errorType).toBe('x-colle');
    expect(diagnose(c, e, rat(6))?.errorType).toBe('x-colle');
  });

  it('un message de retour par erreur prévisible (saisie)', () => {
    const q = (ex: Exercise): Question => ({ kind: 'saisie', ex, promptLatex: '' }) as Question;
    const o = (errorType: string | null): Outcome =>
      ({ correct: false, unfinished: false, errorType, errorFamily: errorType ? 'calcul' : null, given: '', expected: '' }) as Outcome;
    expect(c.feedbackText?.(q(A), o('x-colle'))).toContain('3 × x');
    expect(c.feedbackText?.(q(B), o('parentheses-oubliees'))).toContain('5 − (−3)');
    expect(c.feedbackText?.(q(A), o('signe-relatif'))).toContain('négatif');
    expect(c.feedbackText?.(q(A), o(null))).toContain('3 × (−2) + 4');
    expect(c.feedbackText?.(q(A), { ...o(null), correct: true })).toBeNull();
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      c,
      (ex, level: Level) => {
        const m = ex.meta as unknown as Meta;
        return within(m.x, [1, level === 3 ? 9 : 5]) && ints(ex).every((n) => Math.abs(n) <= 81) && (level !== 1 || m.side === 'left');
      },
      {
        'x-colle': { holds: (ex) => valueOf(ex, 'colle') !== ex.answer.n, wrong: (ex) => valueOf(ex, 'colle') },
        'parentheses-oubliees': { holds: (ex) => valueOf(ex, 'paren') !== ex.answer.n, wrong: (ex) => valueOf(ex, 'paren') },
        'signe-relatif': { holds: (ex) => valueOf(ex, 'signe') !== ex.answer.n, wrong: (ex) => valueOf(ex, 'signe') },
      },
      4242,
    ));

  it('moitié de nombres solutions, moitié non (niveau 1)', () => {
    const rng = seededRng(5);
    let yes = 0;
    for (let i = 0; i < 400; i++) {
      const e = c.generate(1, rng);
      const m = e.meta as unknown as Meta;
      if (evaluate(substitute(m.right, 0)).n === e.answer.n) yes++;
    }
    expect(yes).toBeGreaterThan(140);
    expect(yes).toBeLessThan(260);
  });

  it('forme : 12 à 15 écrans, exercices de fin au niveau 1, erreurs reliées à une règle', () => {
    const before = c.parts.slice(0, -1);
    const n = before.filter((p) => !(p.type === 'question' && p.joinPrevious === true)).length;
    expect(n).toBeGreaterThanOrEqual(12);
    expect(n).toBeLessThanOrEqual(15);
    const fins = courseRunItems(c, seededRng(9)).filter((i) => i.type === 'question' && i.activity === 'fin');
    expect(fins).toHaveLength(5);
    for (const f of fins) if (f.type === 'question' && 'ex' in f.question) expect(f.question.ex.level).toBe(1);
    for (const e of c.errors) {
      const p = c.parts[e.rule!.partIndex];
      expect(p?.type === 'etapes' && p.title).toBe(e.rule!.label);
    }
  });
});
