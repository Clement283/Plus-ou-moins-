import { describe, expect, it } from 'vitest';
import { equationsInconnueDeuxCotes as c } from '../../src/courses/essais/equations-inconnue-deux-cotes';
import { buildQuestion, checkAnswer, diagnose } from '../../src';
import { num, op } from '../../src/math/expr';
import { rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import type { Outcome, Question } from '../../src/exercises/types';
import type { Exercise, Level } from '../../src/courses/types';
import { propertyChecks, within } from './helpers';

const SPEC: Record<Level, { a: [number, number]; b: [number, number]; x: [number, number] }> = {
  1: { a: [3, 6], b: [1, 9], x: [1, 6] },
  2: { a: [4, 9], b: [2, 20], x: [2, 12] },
  3: { a: [5, 12], b: [2, 30], x: [2, 15] },
};
type P = { a: number; b: number; c: number; d: number };
const m = (ex: Exercise): P => ex.meta as unknown as P;
const whole = (n: number, d: number): number | null => (Number.isInteger(n / d) ? n / d : null);
/** L'exercice ax + b = cx + d, construit comme le générateur. */
const mkEx = (a: number, b: number, cc: number, d: number): Exercise => ({
  courseId: c.id,
  level: 1,
  expr: op('/', num(d - b), num(a - cc)),
  answer: rat((d - b) / (a - cc)),
  meta: { a, b, c: cc, d } as unknown as Record<string, unknown>,
});
const o = (given: string, correct = false): Outcome =>
  ({ correct, unfinished: false, errorType: null, errorFamily: null, given, expected: '' }) as Outcome;
const sq = (ex: Exercise): Question => ({ kind: 'saisie', ex, promptLatex: '' }) as Question;

describe('Cours 5 — Résoudre ax + b = cx + d', () => {
  it('résolution ligne par ligne', () => {
    expect(c.resolution(mkEx(4, 5, 1, 14))).toEqual([
      '4x + 5 = x + 14', '4x + 5 - x = x + 14 - x', '3x + 5 = 14', '3x + 5 - 5 = 14 - 5', '3x = 9', '3x \\div 3 = 9 \\div 3', 'x = 3',
    ]);
  });

  it.each([
    [5, 1, 3, 9, 1, 'ajouter-x'], // 5x + 1 = 3x + 9, x = 4 ; 8 ÷ (5 + 3)
    [6, 2, 2, 14, 2, 'x-oublie'], // 6x + 2 = 2x + 14, x = 3 ; 12 ÷ 6
    [5, 3, 2, 12, 5, 'nombre-mal-deplace'], // 5x + 3 = 2x + 12, x = 3 ; (12 + 3) ÷ 3
    [5, -3, 2, 9, 2, 'nombre-mal-deplace'], // 5x − 3 = 2x + 9, x = 4 ; (9 − 3) ÷ 3
    [4, 9, 1, -3, 4, 'signe-resultat'], // 4x + 9 = x − 3, x = −4
    [4, 9, 1, -3, 100, 'autre'],
  ])('a = %i, b = %i, c = %i, d = %i, réponse %i → %s', (a, b, cc, d, given, errorType) =>
    expect(diagnose(c, mkEx(a, b, cc, d), rat(given))?.errorType).toBe(errorType));

  it('un message de retour par erreur prévisible (saisie)', () => {
    expect(c.feedbackText?.(sq(mkEx(5, 1, 3, 9)), o('1'))).toContain('au lieu de le retirer');
    expect(c.feedbackText?.(sq(mkEx(6, 2, 2, 14)), o('2'))).toContain('pas par 6');
    expect(c.feedbackText?.(sq(mkEx(5, 3, 2, 12)), o('5'))).toContain('Tu as ajouté 3');
    expect(c.feedbackText?.(sq(mkEx(5, -3, 2, 9)), o('2'))).toContain('au lieu de l’ajouter');
    expect(c.feedbackText?.(sq(mkEx(4, 9, 1, -3)), o('4'))).toContain('Le signe de x est faux');
    expect(c.feedbackText?.(sq(mkEx(4, 9, 1, -3)), o('100'))).toContain('on retire x des deux côtés');
    expect(c.feedbackText?.(sq(mkEx(4, 9, 1, -3)), o('−4', true))).toBeNull();
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      c,
      (ex, level) => {
        const { a, b, c: cc, d } = m(ex);
        const x = ex.answer.n;
        return (
          ex.answer.d === 1 && x !== 0 && a * x + b === cc * x + d && cc >= 1 && a - cc >= 2 && b !== 0 && d !== 0 &&
          within(a, SPEC[level].a) && within(b, SPEC[level].b) && within(x, SPEC[level].x) && (level > 1 || (x > 0 && d > 0))
        );
      },
      {
        'ajouter-x': { holds: (ex) => whole(m(ex).d - m(ex).b, m(ex).a + m(ex).c) !== null, wrong: (ex) => whole(m(ex).d - m(ex).b, m(ex).a + m(ex).c) as number },
        'x-oublie': { holds: (ex) => whole(m(ex).d - m(ex).b, m(ex).a) !== null, wrong: (ex) => whole(m(ex).d - m(ex).b, m(ex).a) as number },
        'nombre-mal-deplace': {
          holds: (ex) => whole(m(ex).d + m(ex).b, m(ex).a - m(ex).c) !== null,
          wrong: (ex) => whole(m(ex).d + m(ex).b, m(ex).a - m(ex).c) as number,
        },
        'signe-resultat': { holds: (ex) => ex.answer.n !== 0, wrong: (ex) => -ex.answer.n },
      },
      505,
    ));

  it('À toi de résoudre : une résolution juste ligne par ligne est notée juste', () => {
    const r = buildQuestion(c, 'resoudre', { rng: seededRng(8), level: 1, timesSeen: 0 });
    if (r.kind !== 'resoudre') throw new Error('resoudre');
    const { a, b, c: cc, d } = m(r.ex);
    const B = Math.abs(b);
    const sign = b > 0 ? '+' : '−';
    const lines = [
      `${a}x${sign}${B}−${cc === 1 ? '' : cc}x=${d}`,
      `${a - cc}x${sign}${B}=${d}`,
      `${a - cc}x=${d - b}`,
      `x=${r.ex.answer.n}`,
    ];
    expect(checkAnswer(c, r, { lines, hinted: false })).toMatchObject({ correct: true });
  });
});
