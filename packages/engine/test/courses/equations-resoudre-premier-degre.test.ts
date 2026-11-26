import { describe, expect, it } from 'vitest';
import { equationsResoudrePremierDegre as c } from '../../src/courses/equations/equations-resoudre-premier-degre';
import { lin, paramsOf } from '../../src/courses/equations/lineaire';
import { buildQuestion, checkAnswer, courseRunItems, diagnose } from '../../src';
import { rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import type { Outcome, Question } from '../../src/exercises/types';
import type { Level } from '../../src/courses/types';
import { propertyChecks } from './helpers';

const SPEC: Record<Level, { a: [number, number]; b: [number, number]; x: [number, number] }> = {
  1: { a: [2, 5], b: [1, 9], x: [1, 9] },
  2: { a: [2, 9], b: [1, 20], x: [1, 12] },
  3: { a: [2, 12], b: [1, 30], x: [1, 15] },
};
const ex = (a: number, b: number, x: number) => lin(c.id, 1, a, b, a * x + b);
const within = (n: number, [lo, hi]: [number, number]): boolean => Math.abs(n) >= lo && Math.abs(n) <= hi;
const whole = (n: number, d: number): number | null => (Number.isInteger(n / d) ? n / d : null);

describe('Cours 4 — Résoudre ax + b = c', () => {
  it.each([
    [2, 3, 2, 4, 'oublier-diviser'], // 2x + 3 = 7 → 7 − 3
    [2, 3, 2, 5, 'signe-b-garde'], // (7 + 3) ÷ 2
    [2, 4, 3, 1, 'diviser-avant'], // 2x + 4 = 10 → 10 ÷ 2 − 4
    [-2, 4, -3, 3, 'signe-oublie'], // −2x + 4 = 10 → x = 3 au lieu de −3
    [2, 3, 2, 100, 'autre'],
  ])('a = %i, b = %i, x = %i, réponse %i → %s', (a, b, x, given, errorType) =>
    expect(diagnose(c, ex(a, b, x), rat(given))?.errorType).toBe(errorType));

  it('l’équation et sa résolution, ligne par ligne', () => {
    expect(c.resolution(ex(2, 3, 2))).toEqual(['2x + 3 = 7', '2x + 3 - 3 = 7 - 3', '2x = 4', '2x \\div 2 = 4 \\div 2', 'x = 2']);
    expect(c.resolution(ex(3, -4, 5))).toEqual(['3x - 4 = 11', '3x - 4 + 4 = 11 + 4', '3x = 15', '3x \\div 3 = 15 \\div 3', 'x = 5']);
    expect(c.resolution(ex(-3, 2, 3))[3]).toBe('-3x \\div (-3) = -9 \\div (-3)');
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      c,
      (e, level) => {
        const { a, b, c: cc } = paramsOf(e);
        const x = e.answer.n;
        return (
          e.answer.d === 1 && x !== 0 && cc !== 0 && a * x + b === cc &&
          within(a, SPEC[level].a) && within(b, SPEC[level].b) && within(x, SPEC[level].x)
        );
      },
      {
        'oublier-diviser': { holds: (e) => paramsOf(e).c - paramsOf(e).b !== e.answer.n, wrong: (e) => paramsOf(e).c - paramsOf(e).b },
        'signe-b-garde': {
          holds: (e) => whole(paramsOf(e).c + paramsOf(e).b, paramsOf(e).a) !== null,
          wrong: (e) => whole(paramsOf(e).c + paramsOf(e).b, paramsOf(e).a) as number,
        },
        'diviser-avant': {
          holds: (e) => whole(paramsOf(e).c, paramsOf(e).a) !== null,
          wrong: (e) => (whole(paramsOf(e).c, paramsOf(e).a) as number) - paramsOf(e).b,
        },
        'signe-oublie': { holds: (e) => e.answer.n !== 0, wrong: (e) => -e.answer.n },
      },
      404,
    ));

  it('un message de retour par erreur prévisible', () => {
    const q = (a: number, b: number, x: number): Question => ({ kind: 'saisie', ex: ex(a, b, x), promptLatex: '' }) as Question;
    const o = (given: string, correct = false): Outcome =>
      ({ correct, unfinished: false, errorType: null, errorFamily: null, given, expected: '' }) as Outcome;
    expect(c.feedbackText?.(q(2, 3, 2), o('4'))).toContain('il reste à diviser');
    expect(c.feedbackText?.(q(2, 3, 2), o('5'))).toContain('7 − 3 = 4, et non 7 + 3');
    expect(c.feedbackText?.(q(2, 4, 3), o('1'))).toContain('On ne divise pas un seul terme');
    expect(c.feedbackText?.(q(-2, 4, -3), o('3'))).toContain('contraires');
    expect(c.feedbackText?.(q(2, 3, 2), o('100'))).toContain('x = 2');
    expect(c.feedbackText?.(q(2, 3, 2), o('2', true))).toBeNull();
    const caseQ = { kind: 'trou', ex: ex(3, 5, 5), promptLatex: '3x = \\square', hidden: rat(15) } as Question;
    expect(c.feedbackText?.(caseQ, o('25'))).toContain('20 − 5 = 15');
  });

  it('À toi de résoudre : une résolution juste ligne par ligne est notée juste', () => {
    const r = buildQuestion(c, 'resoudre', { rng: seededRng(8), level: 3, timesSeen: 0 });
    if (r.kind !== 'resoudre') throw new Error('resoudre');
    const { a, b, c: cc } = paramsOf(r.ex);
    const bb = Math.abs(b);
    const lines = [
      `${a}x${b > 0 ? '+' : '−'}${bb}${b > 0 ? '−' : '+'}${bb}=${cc}${b > 0 ? '−' : '+'}${bb}`,
      `${a}x=${cc - b}`,
      `x=${(cc - b) / a}`,
    ].map((l) => l.replace(/-/g, '−'));
    expect(checkAnswer(c, r, { lines, hinted: false })).toMatchObject({ correct: true });
  });

  it('exercices de fin : 2 résolutions complètes sur 5, niveau 1', () => {
    const kinds = courseRunItems(c, seededRng(3))
      .filter((i) => i.type === 'question' && i.activity === 'fin')
      .map((f) => (f.type === 'question' ? f.question.kind : ''));
    expect(kinds).toEqual(['saisie', 'resoudre', 'saisie', 'resoudre', 'saisie']);
  });
});
