import { describe, expect, it } from 'vitest';
import { c04 } from '../../src/courses/calculs/c04-soustraire';
import { SIZES } from '../../src/courses/calculs/shared';
import { courseRunItems } from '../../src/activity';
import { toLatex } from '../../src/math/expr';
import { rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import { lessonStep } from '../../src/courses/types';
import type { Exercise, Level } from '../../src/courses/types';
import { TOLERANCE, checkDiagnosis, checkExample, exOf, ints, opsOf, propertyChecks, share, tex, within } from './helpers';

const fits = (ex: Exercise, level: Level): boolean =>
  (level === 3 ? [2, 3] : [2]).includes(ints(ex).length) &&
  opsOf(ex.expr).every((o) => o === '-') &&
  ints(ex).every((x) => within(x, SIZES[level]));

/** a − b − c = a + (−b) + (−c). */
const value = (ex: Exercise): number => ints(ex).reduce((s, x, i) => (i === 0 ? x : s - x), 0);

describe("Cours 4 v2 — Soustraire, c'est ajouter l'opposé", () => {
  it('title, rule, end exercises', () => {
    expect(c04.title).toBe("Soustraire, c'est ajouter l'opposé");
    expect(c04.rule).toBe(
      "Soustraire un nombre, c'est ajouter son opposé : je remplace le − par un +, je change le signe du nombre qui suit, puis j'additionne.",
    );
    expect(c04.endExercises).toEqual({ count: 5, kind: 'saisie' });
    expect(c04.formats).toEqual(['saisie', 'droite', 'signe', 'vraifaux', 'erreur']);
  });

  it.each([
    [1, '5 − (−3)', 8],
    [1, '3 − 7', -4],
    [1, '−4 − 6', -10],
    [1, '−6 − (−10)', 4],
    [1, '3 − 11', -8],
    [2, '45 − (−27)', 72],
    [2, '18 − 63', -45],
    [2, '−34 − (−50)', 16],
    [3, '248 − (−175) − 90', 333],
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
    ['45 − (−27)', 18, 'oppose-oublie'],
    ['45 − (−27)', -72, 'signe-inverse'],
    ['18 − 63', 81, 'oppose-oublie'],
    ['18 − 63', 45, 'signe-inverse'],
    // deux soustractions : un seul ou les deux nombres ont gardé leur signe
    ['248 − (−175) − 90', -333, 'signe-inverse'],
    ['248 − (−175) − 90', 333 - 350, 'oppose-oublie'],
    ['248 − (−175) − 90', 333 + 180, 'oppose-oublie'],
    ['248 − (−175) − 90', 248 - 175 + 90, 'oppose-oublie'],
    ['248 − (−175) − 90', 0, 'autre'],
  ] as [string, number, string][])('%s : %i → %s', (display, given, errorType) =>
    checkDiagnosis(c04, display, given, errorType));

  it('résolution type : 3 lignes, la soustraction devient une addition', () => {
    expect(c04.resolution(exOf(c04, '5 − (−3)'))).toEqual(['5 − (−3)', '= 5 + 3', '= 8'].map(tex));
    expect(c04.resolution(exOf(c04, '−4 − 6'))).toEqual(['-4 - 6', '= -4 + (-6)', '= -10']);
    expect(c04.resolution(exOf(c04, '45 − (−27)', 2))).toEqual(['45 − (−27)', '= 45 + 27', '= 72'].map(tex));
    expect(c04.resolution(exOf(c04, '18 − 63', 2))).toEqual(['18 − 63', '= 18 + (−63)', '= −45'].map(tex));
    expect(c04.resolution(exOf(c04, '248 − (−175) − 90', 3))).toEqual(['248 − (−175) − 90', '= 248 + 175 + (−90)', '= 333'].map(tex));
  });

  it('résolution fausse : l’opposé oublié s’écrit 5 + (−3), le signe final inversé garde la transformation', () => {
    const [inverse, oublie] = c04.errors;
    const ex = exOf(c04, '5 − (−3)');
    expect(oublie?.wrongResolution?.(ex, rat(2))).toEqual({ lines: ['5 - (-3)', '= 5 + (-3)', '= 2'], wrongLine: 1 });
    expect(inverse?.wrongResolution?.(ex, rat(-8))).toEqual({ lines: ['5 - (-3)', '= 5 + 3', '= -8'], wrongLine: 2 });
    const long = exOf(c04, '248 − (−175) − 90', 3);
    expect(oublie?.wrongResolution?.(long, rat(-17))).toEqual({ lines: ['248 - (-175) - 90', '= 248 + (-175) + (-90)', '= -17'], wrongLine: 1 });
  });

  it('explications affichées (messages de la maquette)', () => {
    const ex = exOf(c04, '5 − (−3)');
    const [inverse, oublie] = c04.errors;
    expect(c04.errors.map((e) => e.family)).toEqual(['signe', 'signe']);
    expect(inverse?.explain(ex).rule).toBe(
      "Transforme d'abord en addition : 5 + 3. Puis regarde les signes : le résultat prend le signe du nombre le plus grand (sans son signe).",
    );
    expect(oublie?.explain(ex).rule).toBe(
      "Soustraire, c'est **ajouter l'opposé** : le − devient +, et le nombre change de signe. 5 − (−3) devient 5 + 3, et non 5 + (−3).",
    );
    expect(oublie?.explain(exOf(c04, '3 − 7')).rule).toBe(
      "Soustraire, c'est **ajouter l'opposé** : le − devient +, et le nombre change de signe. 3 − 7 devient 3 + (−7), et non 3 + 7.",
    );
    expect(inverse?.explain(exOf(c04, '248 − (−175) − 90', 3)).rule).toBe(
      "Transforme d'abord en addition : 248 + 175 + (−90). Puis regroupe les positifs et les négatifs (Cours 3) : le résultat prend le signe du total le plus grand (sans son signe).",
    );
  });

  it('chaque erreur reconnue renvoie à sa règle (« Relire la règle N »)', () => {
    expect(c04.errors.map((e) => [e.id, e.rule])).toEqual([
      ['signe-inverse', { n: 2, label: "Puis j'additionne", partIndex: 4 }],
      ['oppose-oublie', { n: 1, label: "J'ajoute l'opposé", partIndex: 3 }],
    ]);
    for (const e of c04.errors) {
      const p = c04.parts[e.rule!.partIndex];
      expect(p?.type === 'etapes' && p.title).toBe(e.rule!.label);
      expect(p?.type === 'etapes' && p.steps.find((s) => s.rule)?.rule?.n).toBe(e.rule!.n);
    }
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      c04,
      fits,
      {
        'signe-inverse': { holds: (ex) => ex.answer.n < 0, wrong: (ex) => -ex.answer.n },
        'oppose-oublie': {
          holds: (ex) => ints(ex).slice(1).some((x) => x < 0),
          wrong: (ex) => ints(ex).reduce((s, x) => s + x, 0),
        },
      },
      404,
    ));

  it('b négatif au moins 1 fois sur 2 ; un résultat négatif (a plus petit que b) sort souvent', () => {
    for (const level of [1, 2, 3] as Level[]) {
      expect(share(c04, level, 41 + level, (ex) => (ints(ex)[1] as number) < 0)).toBeGreaterThanOrEqual(0.5 - TOLERANCE);
      expect(share(c04, level, 51 + level, (ex) => ex.answer.n < 0)).toBeGreaterThanOrEqual(0.4);
    }
  });
});

describe('Cours 4 v2 — le niveau agrandit les nombres, puis rallonge le calcul (doc 08 n° 51)', () => {
  const drawn = (level: Level, seed: number, n = 500): Exercise[] => {
    const r = seededRng(seed);
    return Array.from({ length: n }, () => c04.generate(level, r));
  };

  it.each([1, 2, 3] as Level[])('niveau %i : soustractions seulement, tailles, résultat juste (500 tirages)', (level) => {
    const lengths = new Set<number>();
    for (const ex of drawn(level, 20 + level)) {
      lengths.add(ints(ex).length);
      expect(fits(ex, level), toLatex(ex.expr)).toBe(true);
      expect(ex.answer).toEqual(rat(value(ex)));
      expect(ex.courseId).toBe(c04.id);
      expect(ex.level).toBe(level);
    }
    expect([...lengths].sort()).toEqual(level === 3 ? [2, 3] : [2]);
  });

  it('niveau 3 : deux soustractions à la suite environ une fois sur deux', () => {
    const long = drawn(3, 33, 500).filter((ex) => ints(ex).length === 3).length / 500;
    expect(Math.abs(long - 0.5)).toBeLessThan(TOLERANCE);
  });

  it('un négatif après un signe est toujours entre parenthèses, jamais le premier nombre', () => {
    for (const level of [1, 2, 3] as Level[])
      for (const ex of drawn(level, 60 + level, 300)) {
        const latex = toLatex(ex.expr);
        expect(latex.startsWith('(')).toBe(false);
        expect(latex.split('(-').length - 1).toBe(ints(ex).slice(1).filter((x) => x < 0).length);
      }
  });

  it('les réponses fausses du moteur ne sont jamais la bonne', () => {
    for (const level of [1, 2, 3] as Level[])
      for (const ex of drawn(level, 80 + level, 300))
        for (const e of c04.errors) for (const w of e.wrongValues(ex)) expect(w).not.toEqual(ex.answer);
  });
});

describe('Cours 4 v2 — structure et note', () => {
  it('14 parties, types dans l’ordre de la maquette', () => {
    expect(c04.parts.map((p) => (p.type === 'question' ? `${p.activity}:${p.question.kind}` : p.type))).toEqual([
      'decouverte:choix', 'etapes', 'decouverte:choix', 'etapes', 'etapes',
      'lecon:choix', 'lecon:choix', 'autres', 'pratique',
      'etapes', 'exemple:trou', 'decouverte:trou', 'exemple:trou', 'etapes',
    ]);
  });

  it('13 questions notées : 2 petites, série (4), exemple 1 (1), exemple 2 (1), fins (5)', () => {
    const items = courseRunItems(c04, seededRng(3));
    const counted = items.filter((i) => i.type === 'question' && i.activity !== 'decouverte');
    expect(counted.map((i) => i.type === 'question' && i.activity)).toEqual([
      'lecon', 'lecon',
      'lecon', 'lecon', 'lecon', 'lecon',
      'exemple', 'exemple',
      'fin', 'fin', 'fin', 'fin', 'fin',
    ]);
    const q = (id: string) => items.find((i) => i.itemId === id);
    expect(q('partie-0')).toMatchObject({ activity: 'decouverte' });
    expect(q('partie-2')).toMatchObject({ activity: 'decouverte' });
    expect(q('partie-11')).toMatchObject({ activity: 'decouverte' }); // case 1 de l'exemple 2 : non notée
    expect(q('partie-12')).toMatchObject({ activity: 'exemple' });
    expect(q('partie-8-3')).toMatchObject({ texts: { series: { n: 4, of: 4 } } });
    expect(q('partie-6')).toMatchObject({ texts: { joinPrevious: true } });
  });

  it('les exercices de fin : niveau 1, une soustraction seulement', () => {
    const fins = courseRunItems(c04, seededRng(9)).filter((i) => i.type === 'question' && i.activity === 'fin');
    expect(fins).toHaveLength(5);
    for (const f of fins) {
      if (f.type !== 'question' || !('ex' in f.question)) throw new Error('question');
      expect(f.question.ex.level).toBe(1);
      expect(opsOf(f.question.ex.expr)).toEqual(['-']);
    }
  });

  it('7 écrans de leçon (la pastille « étape N sur 7 ») ; la série n’en fait pas partie', () => {
    expect(c04.lessonLength).toBe(8);
    expect(lessonStep(c04, 0)).toEqual({ n: 1, total: 7 });
    expect(lessonStep(c04, 4)).toEqual({ n: 5, total: 7 });
    expect(lessonStep(c04, 5)).toEqual({ n: 6, total: 7 });
    expect(lessonStep(c04, 6)).toEqual({ n: 6, total: 7 }); // 2e petite question : même écran que la 1re
    expect(lessonStep(c04, 7)).toEqual({ n: 7, total: 7 });
    expect(lessonStep(c04, 8)).toBeNull();
  });
});
