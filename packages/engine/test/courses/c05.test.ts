import { describe, expect, it } from 'vitest';
import { c05 } from '../../src/courses/calculs/c05-multiplier-deux';
import type { Exercise, Level } from '../../src/courses/types';
import { TOLERANCE, checkDiagnosis, checkExample, exOf, ints, propertyChecks, share, tex, within } from './helpers';

const absSorted = (ex: Exercise): number[] => ints(ex).map(Math.abs).sort((x, y) => x - y);
function fitsSizes(ex: Exercise, level: Level): boolean {
  const [s, g] = absSorted(ex) as [number, number];
  if (level === 1) return within(s, [1, 9]) && within(g, [1, 9]);
  if (level === 2) return within(s, [2, 9]) && within(g, [10, 99]);
  return within(s, [10, 99]) && within(g, [10, 99]);
}

describe('Cours 5 — Multiplier deux relatifs', () => {
  it('title, rule, end exercises', () => {
    expect(c05.title).toBe('Multiplier deux relatifs');
    expect(c05.rule).toBe(
      'Même signe → résultat positif. Signes contraires → résultat négatif. Puis je multiplie les nombres sans leur signe.',
    );
    expect(c05.endExercises).toEqual({ count: 5, kind: 'saisie' });
  });

  it.each([
    [1, '−3 × (−4)', 12],
    [1, '6 × (−7)', -42],
    [1, '−8 × 5', -40],
    [2, '−12 × 7', -84],
    [2, '−25 × (−4)', 100],
    [2, '15 × (−6)', -90],
    [3, '−23 × (−14)', 322],
    [3, '35 × (−21)', -735],
    [3, '−48 × (−12)', 576],
  ] as [Level, string, number][])('exemple niveau %i : %s = %i', (level, display, answer) => {
    checkExample(c05, level, display, answer);
    expect(fitsSizes(exOf(c05, display, level), level)).toBe(true);
  });

  it.each([
    [-12, 'regle-signes'],
    [-7, 'addition-au-lieu-multiplication'],
    [7, 'addition-au-lieu-multiplication'],
    [9, 'erreur-table'],
    [16, 'erreur-table'],
    [11, 'autre'],
  ])('−3 × (−4) = 12 : %i → %s', (given, errorType) => checkDiagnosis(c05, '−3 × (−4)', given, errorType));

  it('erreur-table: 3 × 4 → 9, 15, 8 ou 16', () => {
    for (const given of [9, 15, 8, 16]) checkDiagnosis(c05, '3 × 4', given, 'erreur-table');
    checkDiagnosis(c05, '3 × 4', -9, 'autre');
  });

  it('wrongValues', () => {
    const ex = exOf(c05, '−3 × (−4)');
    expect(c05.errors.map((e) => e.wrongValues(ex).map((r) => r.n).sort((x, y) => x - y))).toEqual([
      [-12],
      [-7, 7],
      [8, 9, 15, 16],
    ]);
  });

  it('résolution type', () => {
    expect(c05.resolution(exOf(c05, '−3 × (−4)'))).toEqual(['−3 × (−4)', '= +(3 × 4)', '= 12'].map(tex));
    expect(c05.resolution(exOf(c05, '6 × (−7)'))).toEqual(['6 \\times (-7)', '= -(6 \\times 7)', '= -42']);
  });

  it('explications affichées', () => {
    const ex = exOf(c05, '−3 × (−4)');
    const [regle, addition, table] = c05.errors;
    expect(c05.errors.map((e) => e.family)).toEqual(['signe', 'calcul', 'calcul']);
    expect(regle?.explain(ex).rule).toBe('− × − = + et + × − = −. Deux signes pareils → + ; différents → −.');
    expect(addition?.explain(ex).rule).toBe("Ici, c'est une **multiplication** : × et pas +.");
    expect(table?.explain(ex).rule).toBe('Le signe est bon ! Vérifie la multiplication : 3 × 4 = 12.');
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      c05,
      (ex, level) => ints(ex).length === 2 && ex.expr.k === 'op' && ex.expr.op === '*' && fitsSizes(ex, level),
      {
        'regle-signes': { holds: (ex) => ints(ex).every((x) => x < 0), wrong: (ex) => -ex.answer.n },
        'addition-au-lieu-multiplication': {
          holds: (ex) => {
            const [s, g] = absSorted(ex) as [number, number];
            return ex.level === 1 ? g <= 4 : ex.level === 2 ? s <= 4 && g <= 15 : g <= 15;
          },
          wrong: (ex) => (ints(ex)[0] as number) + (ints(ex)[1] as number),
        },
        'erreur-table': {
          holds: (ex) => ints(ex).every((x) => Math.abs(x) >= 2),
          wrong: (ex) => ex.answer.n + Math.sign(ex.answer.n) * Math.abs(ints(ex)[0] as number),
        },
      },
      505,
    ));

  it('au moins un négatif 3 fois sur 4', () => {
    for (const level of [1, 2, 3] as Level[])
      expect(Math.abs(share(c05, level, 51 + level, (ex) => ints(ex).some((x) => x < 0)) - 0.75)).toBeLessThanOrEqual(TOLERANCE);
  });

  it('leçon : 5 parties, 2 exemples guidés', () => {
    const kinds = c05.parts.map((p) => (p.type !== 'question' ? p.type : `${p.activity}:${p.question.kind}`));
    expect(kinds).toEqual([
      'explication', 'explication', 'lecon:ordre', 'lecon:saisie', 'lecon:classer',
      'exemple:qcm', 'exemple:trou', 'exemple:trou', 'exemple:qcm', 'exemple:trou', 'exemple:trou',
    ]);
    const saisie = c05.parts[3];
    expect(saisie?.type === 'question' && saisie.question.kind === 'saisie' && saisie.question.ex.answer).toEqual({ n: -40, d: 1 });
    const classer = c05.parts[4];
    if (classer?.type !== 'question' || classer.question.kind !== 'classer') throw new Error('classer');
    expect(classer.question.exs.map((e) => e.answer.n)).toEqual([-6, 20, -7, 16]);
    expect(classer.question.expected).toEqual(['negatif', 'positif', 'negatif', 'positif']);
    expect(classer.question.classes.map((c) => c.id)).toEqual(['positif', 'negatif']);
    const signs = [5, 8].map((i) => {
      const p = c05.parts[i];
      return p?.type === 'question' && p.question.kind === 'qcm' ? p.question.choices[p.question.correctIndex]?.latex : null;
    });
    expect(signs).toEqual(['+', '-']);
    const hidden = [6, 7, 9, 10].map((i) => {
      const p = c05.parts[i];
      return p?.type === 'question' && p.question.kind === 'trou' ? p.question.hidden.n : null;
    });
    expect(hidden).toEqual([30, 30, 21, -21]);
  });
});
