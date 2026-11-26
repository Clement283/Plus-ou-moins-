import { describe, expect, it } from 'vitest';
import { equationsProduitNul as c } from '../../src/courses/essais/equations-produit-nul';
import { buildQuestion, checkAnswer, courseRunItems, diagnose } from '../../src';
import { num, op } from '../../src/math/expr';
import { rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import type { Outcome, Question } from '../../src/exercises/types';
import type { Exercise, Level } from '../../src/courses/types';
import { propertyChecks, within } from './helpers';

type P = { p: number; q: number; r: number; s: number; ask: 'min' | 'max' };
const m = (ex: Exercise): P => ex.meta as unknown as P;
const roots = (pr: P): number[] => [-pr.q / pr.p, -pr.s / pr.r];
const asked = (pr: P): number => (pr.ask === 'min' ? Math.min(...roots(pr)) : Math.max(...roots(pr)));
/** Le produit (px + q)(rx + s) = 0, avec la demande « min » ou « max ». */
const mkEx = (p: number, q: number, r: number, s: number, ask: 'min' | 'max'): Exercise => {
  const pr = { p, q, r, s, ask };
  const x = asked(pr);
  return {
    courseId: c.id,
    level: 1,
    expr: op('/', num(x === -q / p ? -q : -s), num(x === -q / p ? p : r)),
    answer: rat(x),
    meta: pr as unknown as Record<string, unknown>,
  };
};
const askedFactor = (ex: Exercise): { a: number; b: number } => {
  const pr = m(ex);
  return roots(pr)[0] === ex.answer.n ? { a: pr.p, b: pr.q } : { a: pr.r, b: pr.s };
};
const o = (given: string, correct = false): Outcome =>
  ({ correct, unfinished: false, errorType: null, errorFamily: null, given, expected: '' }) as Outcome;
const sq = (ex: Exercise): Question => ({ kind: 'saisie', ex, promptLatex: '' }) as Question;
const RANGE: Record<Level, { x1: [number, number]; x2: [number, number] }> = {
  1: { x1: [1, 9], x2: [1, 9] },
  2: { x1: [1, 9], x2: [1, 9] },
  3: { x1: [1, 9], x2: [1, 9] },
};

describe('Cours 6 — Équation produit nul', () => {
  it('résolution type', () => {
    expect(c.resolution(mkEx(1, 2, 1, -3, 'max'))).toEqual([
      '(x + 2)(x - 3) = 0',
      'x + 2 = 0 \\quad\\text{ou}\\quad x - 3 = 0',
      'x = -2 \\quad\\text{ou}\\quad x = 3',
    ]);
  });

  it.each([
    [1, 2, 1, -3, 'max', 3, 'bonne'],
    [1, 2, 1, -3, 'min', 2, 'signe-oublie'], // x + 2 = 0 → 2
    [2, -8, 1, 5, 'max', 8, 'diviser-oublie'], // 2x − 8 = 0 → 8
    [1, 2, 1, -3, 'min', 3, 'autre-solution'], // la plus petite demandée, on donne 3
    [1, 2, 1, -3, 'min', 100, 'autre'],
  ])('(%i, %i, %i, %i), %s, réponse %i → %s', (p, q, r, s, ask, given, errorType) => {
    const ex = mkEx(p, q, r, s, ask as 'min' | 'max');
    const e = diagnose(c, ex, rat(given))?.errorType;
    if (errorType === 'bonne') expect(rat(given)).toEqual(ex.answer);
    else expect(e).toBe(errorType);
  });

  it('un message de retour par erreur prévisible (saisie)', () => {
    expect(c.feedbackText?.(sq(mkEx(1, 2, 1, -3, 'min')), o('2'))).toContain('on retire 2 des deux côtés');
    expect(c.feedbackText?.(sq(mkEx(1, -4, 1, 1, 'max')), o('−4'))).toContain('on ajoute 4');
    expect(c.feedbackText?.(sq(mkEx(2, -8, 1, 5, 'max')), o('8'))).toContain('oublié de diviser par 2');
    expect(c.feedbackText?.(sq(mkEx(1, 2, 1, -3, 'min')), o('3'))).toContain('la plus petite');
    expect(c.feedbackText?.(sq(mkEx(1, 2, 1, -3, 'max')), o('100'))).toContain('x = −2 ou x = 3');
    expect(c.feedbackText?.(sq(mkEx(1, 2, 1, -3, 'max')), o('3', true))).toBeNull();
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      { ...c, errors: c.errors.filter((e) => ['diviser-oublie', 'signe-oublie', 'autre-solution'].includes(e.id)) },
      (ex, level) => {
        const pr = m(ex);
        const [x1, x2] = roots(pr);
        const coefOk = level === 1 ? [pr.p, pr.r].includes(1) && pr.p <= 2 && pr.r <= 2 : level === 2 ? [pr.p, pr.r].includes(1) && [pr.p, pr.r].some((k) => k >= 2 && k <= 4) : within(pr.p, [2, 5]) && within(pr.r, [2, 5]);
        return (
          Number.isInteger(x1) && Number.isInteger(x2) && x1 !== x2 && x1 !== 0 && x2 !== 0 && pr.q !== 0 && pr.s !== 0 &&
          ex.answer.n === asked(pr) && within(x1 as number, RANGE[level].x1) && within(x2 as number, RANGE[level].x2) && coefOk
        );
      },
      {
        'diviser-oublie': { holds: (ex) => askedFactor(ex).a !== 1, wrong: (ex) => -askedFactor(ex).b },
        'signe-oublie': { holds: (ex) => ex.answer.n !== 0, wrong: (ex) => -ex.answer.n },
        'autre-solution': { holds: (ex) => roots(m(ex))[0] !== roots(m(ex))[1], wrong: (ex) => roots(m(ex)).find((x) => x !== ex.answer.n) as number },
      },
      606,
    ));

  it('exercices de fin : les deux solutions et « À toi de résoudre » sur un facteur', () => {
    const kinds = courseRunItems(c, seededRng(3))
      .filter((i) => i.type === 'question' && i.activity === 'fin')
      .map((f) => (f.type === 'question' ? f.question.kind : ''));
    expect(kinds).toEqual(['solutions', 'resoudre', 'solutions', 'resoudre', 'solutions']);
  });

  it('question « solutions » : les deux valeurs, dans l’ordre voulu', () => {
    const rng = seededRng(4);
    for (let i = 0; i < 100; i++) {
      const q = buildQuestion(c, 'solutions', { rng, level: 1, timesSeen: 0 });
      if (q.kind !== 'solutions') throw new Error('solutions');
      const [x1, x2] = roots(m(q.ex));
      expect(q.roots).toEqual([rat(x1 as number), rat(x2 as number)]);
      expect(checkAnswer(c, q, { values: [String(x2).replace('-', '−'), String(x1).replace('-', '−')], hinted: false }).correct).toBe(true);
      expect(checkAnswer(c, q, { values: [String(x1).replace('-', '−'), String(x1).replace('-', '−')], hinted: false }).correct).toBe(false);
    }
  });

  it('exemple guidé : question « solutions » avec l’aide d’office', () => {
    const ex = c.parts.find((x) => x.type === 'question' && x.activity === 'exemple');
    expect(ex && ex.type === 'question' && ex.question).toMatchObject({ kind: 'solutions', guided: true });
  });

  it('À toi de résoudre : le facteur donne la solution demandée', () => {
    const r = buildQuestion(c, 'resoudre', { rng: seededRng(8), level: 3, timesSeen: 0 });
    if (r.kind !== 'resoudre') throw new Error('resoudre');
    const pr = m(r.ex);
    const f = roots(pr)[0] === r.ex.answer.n ? { a: pr.p, b: pr.q } : { a: pr.r, b: pr.s };
    const sign = f.b > 0 ? '+' : '−';
    const B = Math.abs(f.b);
    const lines = [`${f.a}x${sign}${B}${f.b > 0 ? '−' : '+'}${B}=0${f.b > 0 ? '−' : '+'}${B}`, `${f.a}x=${-f.b}`, `x=${r.ex.answer.n}`];
    expect(checkAnswer(c, r, { lines, hinted: false })).toMatchObject({ correct: true });
  });
});
