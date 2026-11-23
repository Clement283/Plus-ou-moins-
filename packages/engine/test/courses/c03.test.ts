import { describe, expect, it } from 'vitest';
import { c03 } from '../../src/courses/calculs/c03-additionner-plusieurs';
import type { Exercise, Level } from '../../src/courses/types';
import { checkDiagnosis, checkExample, exOf, ints, opsOf, propertyChecks, tex, within } from './helpers';

const RANGE: Record<Level, [number, number]> = { 1: [1, 9], 2: [1, 20], 3: [10, 999] };
const COUNTS: Record<Level, number[]> = { 1: [3], 2: [4, 5], 3: [4] };
const pos = (ex: Exercise): number => ints(ex).filter((x) => x > 0).reduce((s, x) => s + x, 0);
const neg = (ex: Exercise): number => ints(ex).filter((x) => x < 0).reduce((s, x) => s + x, 0);

describe('Cours 3 — Additionner plusieurs relatifs', () => {
  it('title, rule, end exercises', () => {
    expect(c03.title).toBe('Additionner plusieurs relatifs');
    expect(c03.rule).toBe(
      'Je regroupe les positifs, puis les négatifs, puis je termine avec la règle des signes contraires.',
    );
    expect(c03.endExercises).toEqual({ count: 5, kind: 'saisie' });
  });

  it.each([
    [1, '3 + (−3) + 3', 3],
    [1, '−2 + 5 + (−4)', -1],
    [1, '7 + (−1) + (−8)', -2],
    [2, '12 + (−7) + 5 + (−9) + 4', 5],
    [2, '−15 + 8 + (−3) + 11', 1],
    [2, '6 + (−20) + 9 + (−4) + (−2)', -11],
    [3, '248 + (−27) + 15 + (−132)', 104],
    [3, '−512 + 340 + (−95) + 18', -249],
    [3, '130 + (−760) + 415 + (−99)', -314],
  ] as [Level, string, number][])('exemple niveau %i : %s = %i', (level, display, answer) =>
    checkExample(c03, level, display, answer));

  it.each([
    [1, 'signe-inverse'],
    [11, 'tout-additionne'],
    [-11, 'tout-additionne'],
    [-6, 'terme-oublie'],
    [3, 'terme-oublie'],
    [4, 'autre'],
  ])('−2 + 5 + (−4) = −1 : %i → %s', (given, errorType) => checkDiagnosis(c03, '−2 + 5 + (−4)', given, errorType));

  it('résolution type', () => {
    expect(c03.resolution(exOf(c03, '−2 + 5 + (−4)'))).toEqual(
      ['−2 + 5 + (−4)', '= 5 + (−2) + (−4)', '= 5 + (−6)', '= −1'].map(tex),
    );
    // already grouped: no repeated line
    expect(c03.resolution(exOf(c03, '7 + (−1) + (−8)'))).toEqual(['7 + (-1) + (-8)', '= 7 + (-9)', '= -2']);
    expect(c03.resolution(exOf(c03, '3 + (−3) + 3'))).toEqual(['3 + (-3) + 3', '= 3 + 3 + (-3)', '= 6 + (-3)', '= 3']);
  });

  it('explications affichées', () => {
    const ex = exOf(c03, '−2 + 5 + (−4)');
    const [inverse, tout, oublie] = c03.errors;
    expect(c03.errors.map((e) => e.family)).toEqual(['signe', 'calcul', 'calcul']);
    expect(inverse?.explain(ex).rule).toBe(
      'Regarde qui gagne : le total des positifs ou celui des négatifs ? Le résultat prend son signe.',
    );
    expect(tout?.explain(ex).rule).toBe(
      "Les négatifs ne s'ajoutent pas aux positifs : ils se **retranchent**. Regroupe-les d'abord.",
    );
    expect(oublie?.explain(ex).rule).toBe("Il manque un nombre : coche chaque terme quand tu l'as utilisé.");
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      c03,
      (ex, level) =>
        COUNTS[level].includes(ints(ex).length) && opsOf(ex.expr).every((o) => o === '+') &&
        ints(ex).some((x) => x > 0) && ints(ex).some((x) => x < 0) &&
        ints(ex).every((x) => within(x, RANGE[level])),
      {
        'signe-inverse': {
          holds: (ex) => ex.answer.n !== 0 && Math.abs(ex.answer.n) <= Math.max(1, Math.round(0.2 * Math.max(pos(ex), -neg(ex)))),
          wrong: (ex) => -ex.answer.n,
        },
        'tout-additionne': {
          holds: (ex) => ints(ex).filter((x) => x < 0).length >= 2,
          wrong: (ex) => ints(ex).reduce((s, x) => s + Math.abs(x), 0),
        },
        'terme-oublie': {
          holds: (ex) => ints(ex).some((x) => Math.abs(x) === RANGE[ex.level][0]),
          wrong: (ex) => ex.answer.n - (ints(ex).find((x) => Math.abs(x) === RANGE[ex.level][0]) as number),
        },
      },
      303,
    ));

  it('leçon : 4 parties, 2 exemples guidés', () => {
    const kinds = c03.parts.map((p) => (p.type === 'explication' ? 'explication' : `${p.activity}:${p.question.kind}`));
    expect(kinds).toEqual([
      'explication', 'explication', 'lecon:ordre', 'lecon:saisie',
      'exemple:trou', 'exemple:trou', 'exemple:trou', 'exemple:trou',
    ]);
    const saisie = c03.parts[3];
    expect(saisie?.type === 'question' && saisie.question.kind === 'saisie' && saisie.question.ex.answer).toEqual({ n: -1, d: 1 });
    const hidden = c03.parts.slice(4).map((p) => (p.type === 'question' && p.question.kind === 'trou' ? p.question.hidden.n : null));
    expect(hidden).toEqual([10, 8, -6, -3]);
  });
});
