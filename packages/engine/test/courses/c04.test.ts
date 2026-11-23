import { describe, expect, it } from 'vitest';
import { c04 } from '../../src/courses/calculs/c04-soustraire';
import { SIZES } from '../../src/courses/calculs/shared';
import type { Level } from '../../src/courses/types';
import { TOLERANCE, checkDiagnosis, checkExample, exOf, ints, propertyChecks, share, tex, within } from './helpers';

describe("Cours 4 — Soustraire, c'est ajouter l'opposé", () => {
  it('title, rule, end exercises', () => {
    expect(c04.title).toBe("Soustraire, c'est ajouter l'opposé");
    expect(c04.rule).toBe("Soustraire un nombre, c'est ajouter son opposé. a − b = a + (−b), et a − (−b) = a + b.");
    expect(c04.endExercises).toEqual({ count: 5, kind: 'saisie' });
  });

  it.each([
    [1, '5 − (−3)', 8],
    [1, '3 − 7', -4],
    [1, '−4 − 6', -10],
    [2, '45 − (−27)', 72],
    [2, '18 − 63', -45],
    [2, '−34 − (−50)', 16],
    [3, '248 − (−175)', 423],
    [3, '316 − 804', -488],
    [3, '−527 − (−390)', -137],
  ] as [Level, string, number][])('exemple niveau %i : %s = %i', (level, display, answer) =>
    checkExample(c04, level, display, answer));

  it.each([
    ['5 − (−3)', 2, 'oppose-oublie'],
    ['5 − (−3)', -8, 'signe-inverse'],
    ['3 − 7', 4, 'signe-inverse'],
    ['3 − 7', 10, 'oppose-oublie'],
    ['−4 − 6', 2, 'oppose-oublie'],
    ['−4 − 6', 10, 'signe-inverse'],
    ['−4 − 6', -2, 'autre'],
  ] as [string, number, string][])('%s : %i → %s', (display, given, errorType) =>
    checkDiagnosis(c04, display, given, errorType));

  it('résolution type', () => {
    expect(c04.resolution(exOf(c04, '5 − (−3)'))).toEqual(['5 − (−3)', '= 5 + 3', '= 8'].map(tex));
    expect(c04.resolution(exOf(c04, '−4 − 6'))).toEqual(['-4 - 6', '= -4 + (-6)', '= -10']);
  });

  it('explications affichées', () => {
    const ex = exOf(c04, '5 − (−3)');
    const [inverse, oublie] = c04.errors;
    expect(c04.errors.map((e) => e.family)).toEqual(['signe', 'signe']);
    expect(inverse?.explain(ex).rule).toBe(
      "Transforme d'abord en addition, puis applique la règle : même signe ou signes contraires ?",
    );
    expect(oublie?.explain(ex).rule).toBe("Soustraire, c'est **ajouter l'opposé** : 5 − (−3) devient 5 + 3.");
    expect(oublie?.explain(exOf(c04, '3 − 7')).rule).toBe("Soustraire, c'est **ajouter l'opposé** : 3 − 7 devient 3 + (−7).");
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      c04,
      (ex, level) =>
        ints(ex).length === 2 && ex.expr.k === 'op' && ex.expr.op === '-' && ints(ex).every((x) => within(x, SIZES[level])),
      {
        'signe-inverse': {
          holds: (ex) => (ints(ex)[0] as number) < (ints(ex)[1] as number),
          wrong: (ex) => -ex.answer.n,
        },
        'oppose-oublie': {
          holds: (ex) => (ints(ex)[1] as number) < 0,
          wrong: (ex) => (ints(ex)[0] as number) + (ints(ex)[1] as number),
        },
      },
      404,
    ));

  it('b négatif au moins 1 fois sur 2', () => {
    for (const level of [1, 2, 3] as Level[])
      expect(share(c04, level, 41 + level, (ex) => (ints(ex)[1] as number) < 0)).toBeGreaterThanOrEqual(0.5 - TOLERANCE);
  });

  it('leçon : 5 parties, 2 exemples guidés', () => {
    const kinds = c04.parts.map((p) => (p.type === 'explication' ? 'explication' : `${p.activity}:${p.question.kind}`));
    expect(kinds).toEqual([
      'explication', 'explication', 'lecon:ordre', 'lecon:saisie', 'lecon:erreur',
      'exemple:trou', 'exemple:trou', 'exemple:trou', 'exemple:trou',
    ]);
    const ordre = c04.parts[2];
    if (ordre?.type !== 'question' || ordre.question.kind !== 'ordre') throw new Error('ordre');
    const byId = Object.fromEntries(ordre.question.tiles.map((t) => [t.id, t.latex]));
    expect(ordre.question.solution.map((id) => byId[id])).toEqual(['5', '+', '3']);
    expect(ordre.question.tiles).toHaveLength(4);
    expect(ordre.question.trapTile).toEqual({ latex: '-', errorType: 'oppose-oublie' });
    const saisie = c04.parts[3];
    expect(saisie?.type === 'question' && saisie.question.kind === 'saisie' && saisie.question.ex.answer).toEqual({ n: 7, d: 1 });
    const erreur = c04.parts[4];
    if (erreur?.type !== 'question' || erreur.question.kind !== 'erreur') throw new Error('erreur');
    expect(erreur.question.lines).toEqual(['6 - (-2)', '= 6 - 2', '= 4']);
    expect(erreur.question.wrongLine).toBe(1);
    expect(erreur.question.errorType).toBe('oppose-oublie');
    const hidden = c04.parts.slice(5).map((p) => (p.type === 'question' && p.question.kind === 'trou' ? p.question.hidden.n : null));
    expect(hidden).toEqual([4, 10, -8, -6]);
  });
});
