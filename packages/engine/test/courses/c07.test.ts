import { describe, expect, it } from 'vitest';
import { c07 } from '../../src/courses/calculs/c07-multiplier-plusieurs';
import type { Level } from '../../src/courses/types';
import { checkDiagnosis, checkExample, exOf, ints, opsOf, propertyChecks, tex, within } from './helpers';

const COUNT: Record<Level, number> = { 1: 3, 2: 4, 3: 5 };
const MAX: Record<Level, number> = { 1: 5, 2: 5, 3: 6 };

describe('Cours 7 — Multiplier plusieurs relatifs', () => {
  it('title, rule, end exercises', () => {
    expect(c07.title).toBe('Multiplier plusieurs relatifs');
    expect(c07.rule).toBe(
      'Je compte les signes − : nombre pair → résultat positif ; nombre impair → résultat négatif. Puis je multiplie les nombres sans leur signe.',
    );
    expect(c07.endExercises).toEqual({ count: 5, kind: 'saisie' });
  });

  it.each([
    [1, '−2 × 3 × (−4)', 24],
    [1, '−1 × (−5) × (−2)', -10],
    [1, '4 × (−3) × 2', -24],
    [2, '−2 × (−3) × (−1) × 4', -24],
    [2, '3 × (−2) × (−5) × (−2)', -60],
    [2, '−4 × (−1) × (−3) × (−2)', 24],
    [3, '−2 × 3 × (−5) × (−1) × 6', -180],
    [3, '−3 × (−2) × (−4) × (−1) × (−5)', -120],
    [3, '2 × (−6) × (−3) × (−1) × (−4)', 144],
  ] as [Level, string, number][])('exemple niveau %i : %s = %i', (level, display, answer) =>
    checkExample(c07, level, display, answer));

  it.each([
    [-24, 'parite-signes'],
    [-3, 'addition-au-lieu-multiplication'],
    [9, 'addition-au-lieu-multiplication'],
    [20, 'autre'],
  ])('−2 × 3 × (−4) = 24 : %i → %s', (given, errorType) => checkDiagnosis(c07, '−2 × 3 × (−4)', given, errorType));

  it('résolution type', () =>
    expect(c07.resolution(exOf(c07, '−2 × 3 × (−4)'))).toEqual(['−2 × 3 × (−4)', '= +(2 × 3 × 4)', '= 24'].map(tex)));

  it('explications affichées', () => {
    const ex = exOf(c07, '−2 × 3 × (−4)');
    const [parite, addition] = c07.errors;
    expect(c07.errors.map((e) => e.family)).toEqual(['signe', 'calcul']);
    expect(parite?.explain(ex).rule).toBe('Compte les signes − : pair → + ; impair → −.');
    expect(addition?.explain(ex).rule).toBe('Ici, on **multiplie** tous les nombres.');
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      c07,
      (ex, level) =>
        ints(ex).length === COUNT[level] && opsOf(ex.expr).every((o) => o === '*') &&
        ints(ex).some((x) => x < 0) && ints(ex).every((x) => within(x, [1, MAX[level]])),
      {
        'parite-signes': {
          holds: (ex) => [2, 4].includes(ints(ex).filter((x) => x < 0).length),
          wrong: (ex) => -ex.answer.n,
        },
        'addition-au-lieu-multiplication': {
          holds: (ex) => ints(ex).every((x) => Math.abs(x) <= 3),
          wrong: (ex) => ints(ex).reduce((s, x) => s + x, 0),
        },
      },
      707,
    ));

  it('leçon : 4 parties, 2 exemples guidés', () => {
    const kinds = c07.parts.map((p) => (p.type === 'explication' ? 'explication' : `${p.activity}:${p.question.kind}`));
    expect(kinds).toEqual([
      'explication', 'explication', 'lecon:ordre', 'lecon:saisie',
      'exemple:trou', 'exemple:qcm', 'exemple:trou', 'exemple:trou',
      'exemple:trou', 'exemple:qcm', 'exemple:trou', 'exemple:trou',
    ]);
    const saisie = c07.parts[3];
    expect(saisie?.type === 'question' && saisie.question.kind === 'saisie' && saisie.question.ex.answer).toEqual({ n: 24, d: 1 });
    const signs = [5, 9].map((i) => {
      const p = c07.parts[i];
      return p?.type === 'question' && p.question.kind === 'qcm' ? p.question.choices[p.question.correctIndex]?.latex : null;
    });
    expect(signs).toEqual(['-', '+']);
    const hidden = [4, 6, 7, 8, 10, 11].map((i) => {
      const p = c07.parts[i];
      return p?.type === 'question' && p.question.kind === 'trou' ? p.question.hidden.n : null;
    });
    expect(hidden).toEqual([3, 12, -12, 2, 10, 10]);
  });
});
