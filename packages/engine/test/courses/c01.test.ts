import { describe, expect, it } from 'vitest';
import { c01 } from '../../src/courses/calculs/c01-additionner-meme-signe';
import { SIZES } from '../../src/courses/calculs/shared';
import type { Exercise, Level } from '../../src/courses/types';
import { TOLERANCE, checkDiagnosis, checkExample, exOf, ints, propertyChecks, share, tex, within } from './helpers';

const abs = (ex: Exercise): number[] => ints(ex).map(Math.abs);

describe('Cours 1 — Additionner deux nombres de même signe', () => {
  it('title, rule, end exercises', () => {
    expect(c01.title).toBe('Additionner deux nombres de même signe');
    expect(c01.rule).toBe("Même signe : j'additionne les nombres sans leur signe, et je garde le signe.");
    expect(c01.endExercises).toEqual({ count: 5, kind: 'saisie' });
    expect(c01.expectInteger).toBe(true);
  });

  it.each([
    [1, '−3 + (−5)', -8],
    [1, '−7 + (−2)', -9],
    [1, '4 + 6', 10],
    [2, '−34 + (−58)', -92],
    [2, '−17 + (−66)', -83],
    [2, '45 + 38', 83],
    [3, '−348 + (−275)', -623],
    [3, '−509 + (−187)', -696],
    [3, '−120 + (−880)', -1000],
  ] as [Level, string, number][])('exemple niveau %i : %s = %i', (level, display, answer) =>
    checkExample(c01, level, display, answer));

  it.each([
    [8, 'signe-oublie'],
    [-2, 'soustraction-au-lieu-addition'],
    [2, 'soustraction-au-lieu-addition'],
    [-7, 'autre'],
  ])('−3 + (−5) = −8 : %i → %s', (given, errorType) => checkDiagnosis(c01, '−3 + (−5)', given, errorType));

  it('wrongValues', () => {
    const ex = exOf(c01, '−3 + (−5)');
    expect(c01.errors.map((e) => e.wrongValues(ex).map((r) => r.n))).toEqual([[8], [-2, 2]]);
  });

  it('résolution type', () =>
    expect(c01.resolution(exOf(c01, '−3 + (−5)'))).toEqual(['-3 + (-5)', '= -(3 + 5)', '= -8'].map(tex)));

  it('explications affichées', () => {
    const ex = exOf(c01, '−3 + (−5)');
    const [oublie, soustraction] = c01.errors;
    expect(oublie?.family).toBe('signe');
    expect(soustraction?.family).toBe('calcul');
    expect(oublie?.explain(ex).rule).toBe(
      'Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − !',
    );
    expect(soustraction?.explain(ex).rule).toBe(
      'Même signe : on **additionne** les nombres, on ne les soustrait pas. 3 + 5 = 8, donc −8.',
    );
    expect(c01.generalExplanation(ex).rule).toBe(c01.rule);
  });

  it('signe-oublie avec deux nombres positifs : phrase dédiée (doc 07 #6A)', () => {
    const oublie = c01.errors[0];
    expect(oublie?.explain(exOf(c01, '4 + 6')).rule).toBe('Les deux nombres sont positifs : le résultat est positif aussi.');
    expect(oublie?.explain(exOf(c01, '−3 + (−5)')).rule).toBe(
      'Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − !',
    );
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      c01,
      (ex, level) => {
        const [a, b] = ints(ex);
        return ints(ex).length === 2 && ex.expr.k === 'op' && ex.expr.op === '+' &&
          Math.sign(a as number) === Math.sign(b as number) && abs(ex).every((x) => within(x, SIZES[level]));
      },
      {
        'signe-oublie': { holds: (ex) => ints(ex).every((x) => x < 0), wrong: (ex) => -ex.answer.n },
        'soustraction-au-lieu-addition': {
          holds: (ex) => {
            const [s, g] = abs(ex).sort((x, y) => x - y) as [number, number];
            return g >= 3 * s;
          },
          wrong: (ex) => Math.sign(ex.answer.n) * Math.abs((abs(ex)[0] as number) - (abs(ex)[1] as number)),
        },
      },
      101,
    ));

  it('négatifs 7 fois sur 10', () => {
    for (const level of [1, 2, 3] as Level[])
      expect(Math.abs(share(c01, level, 11 + level, (ex) => ex.answer.n < 0) - 0.7)).toBeLessThanOrEqual(TOLERANCE);
  });

  it('classer : résultat + / − / 0', () => {
    expect(c01.classes.map((c) => c.label)).toEqual(['Résultat +', 'Résultat −', 'Résultat 0']);
    expect(c01.classes[0]?.of(exOf(c01, '−3 + (−5)'))).toBe('negatif');
    expect(c01.classes[0]?.of(exOf(c01, '4 + 6'))).toBe('positif');
  });

  it('leçon : déroulé en 4 parties, 2 exemples guidés', () => {
    const kinds = c01.parts.map((p) => (p.type !== 'question' ? p.type : `${p.activity}:${p.question.kind}`));
    expect(kinds).toEqual([
      'explication', 'explication', 'lecon:ordre', 'lecon:saisie',
      'exemple:trou', 'exemple:trou', 'exemple:trou', 'exemple:trou',
    ]);
    const saisie = c01.parts[3];
    expect(saisie?.type === 'question' && saisie.question.kind === 'saisie' && saisie.question.ex.answer).toEqual({ n: -8, d: 1 });
    const hidden = c01.parts.slice(4).map((p) => (p.type === 'question' && p.question.kind === 'trou' ? p.question.hidden.n : null));
    expect(hidden).toEqual([9, -13, 6, -7]);
  });
});
