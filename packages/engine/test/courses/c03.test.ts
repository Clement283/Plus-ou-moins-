import { describe, expect, it } from 'vitest';
import { c03 } from '../../src/courses/calculs/c03-additionner-plusieurs';
import { courseRunItems } from '../../src/activity';
import { toLatex } from '../../src/math/expr';
import { rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import { lessonStep } from '../../src/courses/types';
import type { Exercise, Level } from '../../src/courses/types';
import { checkDiagnosis, checkExample, exOf, ints, opsOf, propertyChecks, tex, within } from './helpers';

// Doc 08 n° 51 : le niveau rallonge le calcul en plus d'agrandir les nombres.
const RANGE: Record<Level, [number, number]> = { 1: [1, 9], 2: [1, 20], 3: [10, 99] };
const COUNTS: Record<Level, number[]> = { 1: [3, 4], 2: [4, 5], 3: [5, 6] };
const pos = (ex: Exercise): number => ints(ex).filter((x) => x > 0).reduce((s, x) => s + x, 0);
const neg = (ex: Exercise): number => ints(ex).filter((x) => x < 0).reduce((s, x) => s + x, 0);

describe('Cours 3 — Additionner plusieurs relatifs', () => {
  it('title, rule, end exercises', () => {
    expect(c03.title).toBe('Additionner plusieurs nombres relatifs');
    expect(c03.rule).toBe(
      "Je regroupe les positifs ensemble et les négatifs ensemble, je calcule chaque groupe, puis j'additionne les deux totaux.",
    );
    expect(c03.endExercises).toEqual({ count: 5, kind: 'saisie' });
  });

  it.each([
    [1, '3 + (−3) + 3', 3],
    [1, '−2 + 5 + (−4)', -1],
    [1, '7 + (−1) + (−8)', -2],
    [1, '6 + (−2) + 4 + (−9)', -1],
    [2, '12 + (−7) + 5 + (−9) + 4', 5],
    [2, '−15 + 8 + (−3) + 11', 1],
    [2, '6 + (−20) + 9 + (−4) + (−2)', -11],
    [3, '48 + (−27) + 15 + (−32) + 61', 65],
    [3, '−52 + 34 + (−95) + 18 + 77', -18],
    [3, '−47 + 29 + (−83) + 15 + (−62) + 38', -110],
    [3, '30 + (−76) + 41 + (−99) + 25 + 18', -61],
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

  it('wrongValues: 1 (the −2 forgotten) is caught first by signe-inverse', () => {
    const ex = exOf(c03, '−2 + 5 + (−4)');
    expect(c03.errors.map((e) => e.wrongValues(ex).map((r) => r.n).sort((x, y) => x - y))).toEqual([[1], [-11, 11], [-6, 3]]);
  });

  it('résolution type', () => {
    expect(c03.resolution(exOf(c03, '−2 + 5 + (−4)'))).toEqual(
      ['−2 + 5 + (−4)', '= 5 + (−2) + (−4)', '= 5 + (−6)', '= −1'].map(tex),
    );
    // already grouped: no repeated line
    expect(c03.resolution(exOf(c03, '7 + (−1) + (−8)'))).toEqual(['7 + (-1) + (-8)', '= 7 + (-9)', '= -2']);
    expect(c03.resolution(exOf(c03, '3 + (−3) + 3'))).toEqual(['3 + (-3) + 3', '= 3 + 3 + (-3)', '= 6 + (-3)', '= 3']);
    expect(c03.resolution(exOf(c03, '−15 + 8 + (−3) + 11'))).toEqual(
      ['−15 + 8 + (−3) + 11', '= 8 + 11 + (−15) + (−3)', '= 19 + (−18)', '= 1'].map(tex),
    );
    expect(c03.resolution(exOf(c03, '−47 + 29 + (−83) + 15 + (−62) + 38'))).toEqual(
      ['−47 + 29 + (−83) + 15 + (−62) + 38', '= 29 + 15 + 38 + (−47) + (−83) + (−62)', '= 82 + (−192)', '= −110'].map(tex),
    );
  });

  it('explications affichées', () => {
    const ex = exOf(c03, '−2 + 5 + (−4)');
    const [inverse, tout, oublie] = c03.errors;
    expect(c03.errors.map((e) => e.family)).toEqual(['signe', 'calcul', 'calcul']);
    expect(inverse?.explain(ex).rule).toBe(
      'Regarde qui gagne : le total des positifs (5) ou celui des négatifs (6) ? Le résultat prend le signe du plus grand.',
    );
    expect(tout?.explain(ex).rule).toBe(
      "Un positif et un négatif ne s'ajoutent pas comme deux nombres de même signe. Regroupe d'abord les positifs et les négatifs, puis soustrais les deux totaux (sans leur signe).",
    );
    expect(oublie?.explain(ex).rule).toBe("Il manque un nombre : coche chaque nombre quand tu l'as utilisé.");
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
});

describe('Cours 3 — le niveau rallonge le calcul (doc 08 n° 51)', () => {
  const drawn = (level: Level, seed: number, n = 500): Exercise[] => {
    const r = seededRng(seed);
    return Array.from({ length: n }, () => c03.generate(level, r));
  };

  it.each([1, 2, 3] as Level[])('niveau %i : nombre de termes, nombres, signes mélangés, résultat juste (500 tirages)', (level) => {
    const seen = new Set<number>();
    for (const ex of drawn(level, 30 + level)) {
      const xs = ints(ex);
      seen.add(xs.length);
      expect(COUNTS[level], toLatex(ex.expr)).toContain(xs.length);
      expect(xs.every((x) => within(x, RANGE[level]))).toBe(true);
      expect(xs.some((x) => x > 0) && xs.some((x) => x < 0)).toBe(true);
      expect(ex.answer).toEqual(rat(xs.reduce((s, x) => s + x, 0)));
      expect(opsOf(ex.expr).every((o) => o === '+')).toBe(true);
    }
    // les deux longueurs du niveau sortent
    expect([...seen].sort()).toEqual(COUNTS[level]);
  });

  it('le premier terme négatif s’écrit sans parenthèses, les autres négatifs entre parenthèses', () => {
    for (const level of [1, 2, 3] as Level[])
      for (const ex of drawn(level, 50 + level, 200)) {
        const latex = toLatex(ex.expr);
        expect(latex.startsWith('(')).toBe(false);
        const negativesAfterFirst = ints(ex).slice(1).filter((x) => x < 0).length;
        expect(latex.split('(-').length - 1).toBe(negativesAfterFirst);
        expect(latex.split('(').length - 1).toBe(negativesAfterFirst);
      }
  });

  it('un premier terme négatif et un premier terme positif sortent aux trois niveaux', () => {
    for (const level of [1, 2, 3] as Level[]) {
      const firsts = drawn(level, 60 + level, 200).map((ex) => (ints(ex)[0] as number) < 0);
      expect(firsts).toContain(true);
      expect(firsts).toContain(false);
    }
  });

  it('la résolution de 5 à 6 termes tient en 3 ou 4 lignes et finit sur le résultat', () => {
    for (const ex of drawn(3, 70, 200)) {
      const lines = c03.resolution(ex);
      expect(lines.length).toBeGreaterThanOrEqual(3);
      expect(lines.length).toBeLessThanOrEqual(4);
      expect(lines[lines.length - 1]).toBe(`= ${ex.answer.n}`);
    }
  });

  it('les réponses fausses du moteur ne sont jamais la bonne, à 6 termes', () => {
    for (const ex of drawn(3, 80, 300))
      for (const e of c03.errors) for (const w of e.wrongValues(ex)) expect(w).not.toEqual(ex.answer);
  });
});

describe('Cours 3 v2 — structure et note', () => {
  it('15 parties, types dans l’ordre de la spec', () => {
    expect(c03.parts.map((p) => (p.type === 'question' ? `${p.activity}:${p.question.kind}` : p.type))).toEqual([
      'decouverte:choix', 'etapes', 'decouverte:choix', 'etapes', 'etapes',
      'lecon:choix', 'lecon:choix', 'etapes', 'autres', 'pratique',
      'etapes', 'exemple:trou', 'decouverte:trou', 'exemple:trou', 'etapes',
    ]);
  });

  it('13 questions notées : 2 petites, série (4), exemple 1 (1), exemple 2 (1), fins (5)', () => {
    const items = courseRunItems(c03, seededRng(3));
    const counted = items.filter((i) => i.type === 'question' && i.activity !== 'decouverte');
    expect(counted).toHaveLength(13);
    expect(counted.map((i) => i.type === 'question' && i.activity)).toEqual([
      'lecon', 'lecon', // petites questions
      'lecon', 'lecon', 'lecon', 'lecon', // série de pratique
      'exemple', 'exemple',
      'fin', 'fin', 'fin', 'fin', 'fin',
    ]);
    const q = (id: string) => items.find((i) => i.itemId === id);
    expect(q('partie-0')).toMatchObject({ activity: 'decouverte' });
    expect(q('partie-2')).toMatchObject({ activity: 'decouverte' });
    expect(q('partie-12')).toMatchObject({ activity: 'decouverte' }); // case 1 de l'exemple 2 : non notée
    expect(q('partie-13')).toMatchObject({ activity: 'exemple' });
    expect(q('partie-9-2')).toMatchObject({ texts: { series: { n: 3, of: 4 } } });
  });

  it('les deux petites questions partagent un écran', () => {
    const items = courseRunItems(c03, seededRng(3));
    expect(items.find((i) => i.itemId === 'partie-6')).toMatchObject({ texts: { joinPrevious: true } });
    expect(items.find((i) => i.itemId === 'partie-5')).not.toMatchObject({ texts: { joinPrevious: true } });
  });

  it('8 écrans de leçon (la pastille « étape N sur 8 »), la série n’en fait pas partie', () => {
    expect(c03.lessonLength).toBe(9);
    expect(lessonStep(c03, 0)).toEqual({ n: 1, total: 8 });
    expect(lessonStep(c03, 6)).toEqual({ n: 6, total: 8 }); // 2e petite question : même écran que la 1re
    expect(lessonStep(c03, 8)).toEqual({ n: 8, total: 8 });
    expect(lessonStep(c03, 9)).toBeNull();
  });

  it('fiche mémo et règles des erreurs : chaque règle pointe l’encadré du même numéro', () => {
    expect(c03.memo?.rule).toBe(c03.rule);
    expect(c03.memo?.examples).toHaveLength(1);
    expect(c03.errors.map((e) => e.rule)).toEqual([
      { n: 2, label: "Je calcule chaque groupe, puis j'additionne les deux totaux", partIndex: 4 },
      { n: 1, label: 'Je regroupe les positifs et les négatifs', partIndex: 3 },
      { n: 1, label: 'Je regroupe les positifs et les négatifs', partIndex: 3 },
    ]);
    for (const e of c03.errors) {
      const p = c03.parts[e.rule!.partIndex];
      expect(p?.type).toBe('etapes');
      expect(p?.type === 'etapes' && p.steps.find((s) => s.rule)?.rule?.n).toBe(e.rule!.n);
    }
  });
});
