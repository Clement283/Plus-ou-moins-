import { describe, expect, it } from 'vitest';
import { equationsDiviser as c } from '../../src/courses/equations/equations-diviser';
import { paramsOf } from '../../src/courses/equations/lineaire';
import { lin } from '../../src/courses/equations/lineaire';
import { buildQuestion, checkAnswer, courseRunItems, diagnose } from '../../src';
import { rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import type { Outcome, Question } from '../../src/exercises/types';
import type { Level } from '../../src/courses/types';
import { propertyChecks } from './helpers';

const RANGE: Record<Level, [number, number]> = { 1: [2, 9], 2: [2, 12], 3: [2, 15] };
const ex = (a: number, x: number) => lin(c.id, 1, a, 0, a * x);
const inRange = (n: number, [lo, hi]: [number, number]): boolean => Math.abs(n) >= lo && Math.abs(n) <= hi;

describe('Cours 3 — Diviser des deux côtés (ax = c)', () => {
  it.each([
    [3, 4, 9, 'soustraire-coef'], // 3x = 12 → 12 − 3
    [3, 4, 36, 'multiplier-coef'],
    [-2, -3, -3, 'signe-oublie'], // −2x = 6 → x = 3 donné : ici x = −3, réponse 3
    [3, -4, 4, 'signe-oublie'], // 3x = −12 → 4
    [3, 4, 100, 'autre'],
  ])('a = %i, x = %i, réponse %i → %s', (a, x, given, errorType) => {
    const e = ex(a, x);
    const g = errorType === 'signe-oublie' && a === -2 ? 3 : given;
    expect(diagnose(c, e, rat(g))?.errorType).toBe(errorType);
  });

  it('l’équation et sa résolution', () => {
    const e = ex(-4, -5);
    expect(e.meta?.latex).toBe('-4x = 20');
    expect(c.resolution(e)).toEqual(['-4x = 20', '-4x \\div (-4) = 20 \\div (-4)', 'x = -5']);
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      c,
      (e, level) => {
        const { a, b, c: cc } = paramsOf(e);
        return b === 0 && inRange(a, RANGE[level]) && inRange(cc / a, RANGE[level]) && Number.isInteger(cc / a) && e.answer.n * a === cc;
      },
      {
        'soustraire-coef': { holds: (e) => paramsOf(e).c - paramsOf(e).a !== e.answer.n, wrong: (e) => paramsOf(e).c - paramsOf(e).a },
        'multiplier-coef': { holds: (e) => paramsOf(e).c * paramsOf(e).a !== e.answer.n, wrong: (e) => paramsOf(e).c * paramsOf(e).a },
        'signe-oublie': { holds: (e) => paramsOf(e).a < 0 || paramsOf(e).c < 0, wrong: (e) => -e.answer.n },
      },
      303,
    ));

  it('un message de retour par erreur prévisible', () => {
    const q = (a: number, x: number): Question => ({ kind: 'saisie', ex: ex(a, x), promptLatex: '' }) as Question;
    const o = (given: string, correct = false): Outcome =>
      ({ correct, unfinished: false, errorType: null, errorFamily: null, given, expected: '' }) as Outcome;
    expect(c.feedbackText?.(q(3, 4), o('9'))).toContain('divisant, pas en soustrayant');
    expect(c.feedbackText?.(q(3, 4), o('36'))).toContain('opération inverse');
    expect(c.feedbackText?.(q(-3, 4), o('-4'))).toContain('même signe');
    expect(c.feedbackText?.(q(-2, -3), o('3'))).toContain('contraires');
    expect(c.feedbackText?.(q(3, -4), o('4'))).toContain('contraires');
    expect(c.feedbackText?.(q(3, 4), o('100'))).toContain('x = 12 ÷ 3 = 4');
    expect(c.feedbackText?.(q(3, 4), o('4', true))).toBeNull();
  });

  it('les questions de révision : x = ▢ et À toi de résoudre, notées juste', () => {
    const ctx = { rng: seededRng(5), level: 2 as Level, timesSeen: 0 };
    const s = buildQuestion(c, 'saisie', ctx);
    expect(s.kind).toBe('saisie');
    const r = buildQuestion(c, 'resoudre', ctx);
    expect(r.kind).toBe('resoudre');
    if (r.kind !== 'resoudre') return;
    const { a, c: cc } = paramsOf(r.ex);
    const lines = [`${a}x÷${a < 0 ? `(${a})` : a}=${cc}÷${a < 0 ? `(${a})` : a}`, `x=${cc / a}`].map((l) => l.replace(/-/g, '−'));
    expect(checkAnswer(c, r, { lines, hinted: false })).toMatchObject({ correct: true });
  });

  it('exercices de fin : x = ▢ seulement (pas de résolution complète avant le cours suivant)', () => {
    const fins = courseRunItems(c, seededRng(2)).filter((i) => i.type === 'question' && i.activity === 'fin');
    expect(fins.map((f) => (f.type === 'question' ? f.question.kind : ''))).toEqual(Array(5).fill('saisie'));
  });
});
