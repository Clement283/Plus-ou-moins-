import { describe, expect, it } from 'vitest';
import { c06 } from '../../src/courses/calculs/c06-diviser-deux';
import type { Exercise, Level } from '../../src/courses/types';
import { TOLERANCE, checkDiagnosis, checkExample, exOf, ints, propertyChecks, share, tex, within } from './helpers';

const Q: Record<Level, [number, number]> = { 1: [1, 9], 2: [10, 30], 3: [10, 99] };
const B: Record<Level, [number, number]> = { 1: [2, 9], 2: [2, 9], 3: [10, 40] };
const fits = (ex: Exercise, level: Level): boolean => {
  const [a, b] = ints(ex) as [number, number];
  return ints(ex).length === 2 && ex.expr.k === 'op' && ex.expr.op === '/' && b !== 0 && ex.answer.d === 1 &&
    a === ex.answer.n * b && within(ex.answer.n, Q[level]) && within(b, B[level]);
};

describe('Cours 6 — Diviser deux relatifs', () => {
  it('title, rule, end exercises', () => {
    expect(c06.title).toBe('Diviser deux relatifs');
    expect(c06.rule).toBe(
      'La même que pour multiplier : même signe → positif ; signes contraires → négatif. Puis je divise les nombres sans leur signe.',
    );
    expect(c06.endExercises).toEqual({ count: 5, kind: 'saisie' });
  });

  it.each([
    [1, '−12 ÷ 4', -3],
    [1, '−35 ÷ (−7)', 5],
    [1, '24 ÷ (−6)', -4],
    [2, '−126 ÷ 6', -21],
    [2, '152 ÷ (−8)', -19],
    [2, '−270 ÷ (−9)', 30],
    [3, '−1188 ÷ 12', -99],
    [3, '2208 ÷ (−24)', -92],
    [3, '−3366 ÷ (−34)', 99],
  ] as [Level, string, number][])('exemple niveau %i : %s = %i', (level, display, answer) => {
    checkExample(c06, level, display, answer);
    expect(fits(exOf(c06, display, level), level)).toBe(true);
  });

  it.each([
    [3, 'regle-signes'],
    [-48, 'multiplication-au-lieu-division'],
    [48, 'multiplication-au-lieu-division'],
    [-4, 'autre'],
  ])('−12 ÷ 4 = −3 : %i → %s', (given, errorType) => checkDiagnosis(c06, '−12 ÷ 4', given, errorType));

  it('résolution type', () =>
    expect(c06.resolution(exOf(c06, '−12 ÷ 4'))).toEqual(['−12 ÷ 4', '= −(12 ÷ 4)', '= −3'].map(tex)));

  it('explications affichées', () => {
    const ex = exOf(c06, '−12 ÷ 4');
    const [regle, mult] = c06.errors;
    expect(c06.errors.map((e) => e.family)).toEqual(['signe', 'calcul']);
    expect(regle?.explain(ex).rule).toBe('Même règle que pour × : signes pareils → + ; différents → −.');
    expect(mult?.explain(ex).rule).toBe("Ici, c'est une **division** : ÷ et pas ×.");
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      c06,
      fits,
      {
        'regle-signes': { holds: (ex) => ints(ex).every((x) => x < 0), wrong: (ex) => -ex.answer.n },
        'multiplication-au-lieu-division': {
          holds: (ex) => Math.abs(ex.answer.n) <= Q[ex.level][0] + 2,
          wrong: (ex) => (ints(ex)[0] as number) * (ints(ex)[1] as number),
        },
      },
      606,
    ));

  it('au moins un négatif 3 fois sur 4', () => {
    for (const level of [1, 2, 3] as Level[])
      expect(Math.abs(share(c06, level, 61 + level, (ex) => ints(ex).some((x) => x < 0)) - 0.75)).toBeLessThanOrEqual(TOLERANCE);
  });

  it('leçon : 4 parties, 2 exemples guidés', () => {
    const kinds = c06.parts.map((p) => (p.type !== 'question' ? p.type : `${p.activity}:${p.question.kind}`));
    expect(kinds).toEqual([
      'explication', 'explication', 'lecon:ordre', 'lecon:saisie',
      'exemple:qcm', 'exemple:trou', 'exemple:trou', 'exemple:qcm', 'exemple:trou', 'exemple:trou',
    ]);
    const saisie = c06.parts[3];
    expect(saisie?.type === 'question' && saisie.question.kind === 'saisie' && saisie.question.ex.answer).toEqual({ n: 6, d: 1 });
    const signs = [4, 7].map((i) => {
      const p = c06.parts[i];
      return p?.type === 'question' && p.question.kind === 'qcm' ? p.question.choices[p.question.correctIndex]?.latex : null;
    });
    expect(signs).toEqual(['-', '+']);
    const hidden = [5, 6, 8, 9].map((i) => {
      const p = c06.parts[i];
      return p?.type === 'question' && p.question.kind === 'trou' ? p.question.hidden.n : null;
    });
    expect(hidden).toEqual([4, -4, 4, 4]);
  });
});
