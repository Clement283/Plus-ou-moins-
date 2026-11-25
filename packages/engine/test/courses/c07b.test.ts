import { describe, expect, it } from 'vitest';
import { c07b } from '../../src/courses/calculs/c07b-multiplier-plusieurs';
import type { Outcome, Question } from '../../src/exercises/types';
import type { Level } from '../../src/courses/types';
import { checkDiagnosis, checkExample, exOf, ints, opsOf, propertyChecks, within } from './helpers';

const RANGE: Record<Level, [number, number]> = { 1: [2, 5], 2: [2, 6], 3: [2, 9] };
const COUNTS: Record<Level, number[]> = { 1: [3], 2: [3, 4], 3: [4] };
const prod = (xs: number[]): number => xs.reduce((a, b) => a * b, 1);

describe('Cours 7 (b) — Multiplier plusieurs relatifs', () => {
  it.each([
    [1, '−2 × 3 × (−4)', 24],
    [1, '3 × (−5) × 2', -30],
    [2, '−4 × (−3) × (−2) × 5', -120],
    [3, '−9 × 8 × (−7) × (−6)', -3024],
  ] as [Level, string, number][])('exemple niveau %i : %s = %i', (level, display, answer) => checkExample(c07b, level, display, answer));

  it.each([
    [-3, 'addition-au-lieu-multiplication'],
    [9, 'addition-au-lieu-multiplication'],
    [-24, 'parite-signes'],
    [-6, 'facteur-oublie'],
    [8, 'facteur-oublie'],
    [100, 'autre'],
  ])('−2 × 3 × (−4) = 24 : %i → %s', (given, errorType) => checkDiagnosis(c07b, '−2 × 3 × (−4)', given, errorType));

  it('trois signes moins : la bonne réponse est négative, l’opposée est reconnue', () =>
    checkDiagnosis(c07b, '−2 × 3 × (−4) × (−5)', 120, 'parite-signes'));

  it('résolution type', () => {
    expect(c07b.resolution(exOf(c07b, '−2 × 3 × (−4)'))).toEqual(['-2 \\times 3 \\times (-4)', '= +(2 \\times 3 \\times 4)', '= 24']);
    expect(c07b.resolution(exOf(c07b, '3 × (−5) × 2'))).toEqual(['3 \\times (-5) \\times 2', '= -(3 \\times 5 \\times 2)', '= -30']);
  });

  it('un message de retour par erreur prévisible (saisie)', () => {
    const q = (display: string): Question => ({ kind: 'saisie', ex: exOf(c07b, display), promptLatex: '' }) as Question;
    const o = (errorType: string | null): Outcome =>
      ({ correct: false, unfinished: false, errorType, errorFamily: errorType ? 'calcul' : null, given: '', expected: '' }) as Outcome;
    expect(c07b.feedbackText?.(q('−2 × 3 × (−4)'), o('addition-au-lieu-multiplication'))).toContain('on n’additionne pas'.replace('’', "'"));
    expect(c07b.feedbackText?.(q('−2 × 3 × (−4)'), o('parite-signes'))).toContain('2 ');
    expect(c07b.feedbackText?.(q('−2 × 3 × (−4)'), o('parite-signes'))).toContain('positif');
    expect(c07b.feedbackText?.(q('3 × (−5) × 2'), o('parite-signes'))).toContain('négatif');
    expect(c07b.feedbackText?.(q('−2 × 3 × (−4)'), o('facteur-oublie'))).toContain('3 nombres');
    expect(c07b.feedbackText?.(q('−2 × 3 × (−4)'), o(null))).toContain('2 × 3 × 4');
    expect(c07b.feedbackText?.(q('−2 × 3 × (−4)'), { ...o(null), correct: true })).toBeNull();
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      c07b,
      (ex, level) =>
        COUNTS[level].includes(ints(ex).length) && opsOf(ex.expr).every((x) => x === '*') &&
        ints(ex).some((x) => x < 0) && ints(ex).every((x) => within(x, RANGE[level])),
      {
        'addition-au-lieu-multiplication': { holds: (ex) => ints(ex).reduce((a, b) => a + b, 0) !== ex.answer.n, wrong: (ex) => ints(ex).reduce((a, b) => a + b, 0) },
        'parite-signes': { holds: (ex) => ex.answer.n !== 0, wrong: (ex) => -ex.answer.n },
        'facteur-oublie': { holds: (ex) => ints(ex).length >= 3, wrong: (ex) => prod(ints(ex).slice(0, -1)) },
      },
      707,
    ));
});
