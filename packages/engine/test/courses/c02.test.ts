import { describe, expect, it } from 'vitest';
import { c02 } from '../../src/courses/calculs/c02-additionner-signes-contraires';
import { SIZES } from '../../src/courses/calculs/shared';
import type { Level } from '../../src/courses/types';
import { TOLERANCE, checkDiagnosis, checkExample, exOf, ints, propertyChecks, share, tex, within } from './helpers';

describe('Cours 2 — Additionner deux nombres de signes contraires', () => {
  it('title, rule, end exercises', () => {
    expect(c02.title).toBe('Additionner deux nombres de signes contraires');
    expect(c02.rule).toBe(
      'Signes contraires : je soustrais le plus petit (sans signe) du plus grand (sans signe), et je prends le signe du plus grand.',
    );
    expect(c02.endExercises).toEqual({ count: 5, kind: 'saisie' });
  });

  it.each([
    [1, '−3 + 5', 2],
    [1, '4 + (−9)', -5],
    [1, '−6 + 6', 0],
    [2, '−47 + 29', -18],
    [2, '63 + (−18)', 45],
    [2, '−25 + 71', 46],
    [3, '−248 + 75', -173],
    [3, '512 + (−689)', -177],
    [3, '−903 + 450', -453],
  ] as [Level, string, number][])('exemple niveau %i : %s = %i', (level, display, answer) =>
    checkExample(c02, level, display, answer));

  it.each([
    [-2, 'signe-du-mauvais-nombre'],
    [8, 'addition-au-lieu-soustraction'],
    [-8, 'addition-au-lieu-soustraction'],
    [3, 'autre'],
  ])('−3 + 5 = 2 : %i → %s', (given, errorType) => checkDiagnosis(c02, '−3 + 5', given, errorType));

  it('opposite of 0 is not a sign error', () => checkDiagnosis(c02, '−6 + 6', 12, 'addition-au-lieu-soustraction'));

  it('résolution type', () => {
    expect(c02.resolution(exOf(c02, '−3 + 5'))).toEqual(['-3 + 5', '= +(5 - 3)', '= 2'].map(tex));
    expect(c02.resolution(exOf(c02, '4 + (−9)'))).toEqual(['4 + (-9)', '= -(9 - 4)', '= -5']);
  });

  it('explications affichées', () => {
    const ex = exOf(c02, '−3 + 5');
    const [mauvais, addition] = c02.errors;
    expect(mauvais?.family).toBe('signe');
    expect(addition?.family).toBe('calcul');
    expect(mauvais?.explain(ex).rule).toBe(
      "Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe).",
    );
    expect(addition?.explain(ex).rule).toBe('Signes contraires : on **soustrait**. 5 − 3 = 2.');
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      c02,
      (ex, level) => {
        const [a, b] = ints(ex) as [number, number];
        return ints(ex).length === 2 && ex.expr.k === 'op' && ex.expr.op === '+' && a * b < 0 &&
          ints(ex).every((x) => within(x, SIZES[level]));
      },
      {
        'signe-du-mauvais-nombre': {
          holds: (ex) => {
            const [a, b] = ints(ex) as [number, number];
            return Math.abs(a) !== Math.abs(b) && (Math.abs(a) > Math.abs(b) ? a : b) < 0;
          },
          wrong: (ex) => -ex.answer.n,
        },
        'addition-au-lieu-soustraction': {
          holds: (ex) => (ints(ex)[0] as number) < 0 && ex.answer.n !== 0,
          wrong: (ex) => ints(ex).reduce((s, x) => s + Math.abs(x), 0),
        },
      },
      202,
    ));

  it('deux opposés 1 fois sur 10, négatif en premier 1 fois sur 2', () => {
    for (const level of [1, 2, 3] as Level[]) {
      expect(Math.abs(share(c02, level, 21 + level, (ex) => ex.answer.n === 0) - 0.1)).toBeLessThanOrEqual(TOLERANCE);
      expect(Math.abs(share(c02, level, 24 + level, (ex) => (ints(ex)[0] as number) < 0) - 0.5)).toBeLessThanOrEqual(TOLERANCE);
    }
  });

  it('leçon : 5 parties, 2 exemples guidés', () => {
    const kinds = c02.parts.map((p) => (p.type !== 'question' ? p.type : `${p.activity}:${p.question.kind}`));
    expect(kinds).toEqual([
      'explication', 'explication', 'lecon:ordre', 'lecon:saisie', 'lecon:paires',
      'exemple:trou', 'exemple:trou', 'exemple:trou', 'exemple:trou',
    ]);
    const saisie = c02.parts[3];
    expect(saisie?.type === 'question' && saisie.question.kind === 'saisie' && saisie.question.ex.answer).toEqual({ n: -5, d: 1 });
    const paires = c02.parts[4];
    if (paires?.type !== 'question' || paires.question.kind !== 'paires') throw new Error('paires');
    expect(paires.question.left).toEqual(['-3 + 5', '4 + (-9)', '-6 + 6', '7 + (-2)']);
    expect(paires.question.exs.map((e) => e.answer.n)).toEqual([2, -5, 0, 5]);
    expect(paires.question.right.map((r) => r.value.n).sort()).toEqual([-5, 0, 2, 5]);
    const hidden = c02.parts.slice(5).map((p) => (p.type === 'question' && p.question.kind === 'trou' ? p.question.hidden.n : null));
    expect(hidden).toEqual([5, -5, 5, 5]);
  });
});
