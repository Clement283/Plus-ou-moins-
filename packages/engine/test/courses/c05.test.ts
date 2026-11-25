import { describe, expect, it } from 'vitest';
import { c05 } from '../../src/courses/calculs/c05-multiplier-deux';
import { courseRunItems } from '../../src/activity';
import { toLatex } from '../../src/math/expr';
import { rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import { lessonStep } from '../../src/courses/types';
import type { Exercise, Level } from '../../src/courses/types';
import { TOLERANCE, checkDiagnosis, checkExample, exOf, ints, opsOf, propertyChecks, share, tex, within } from './helpers';

const absSorted = (ex: Exercise): number[] => ints(ex).map(Math.abs).sort((x, y) => x - y);
/** Niveau 1 : les tables ; niveau 2 : un facteur de 11 à 20 par 2 à 9, ou les tables de 11 et 12 ; niveau 3 : 10 à 19 par 10 à 99. */
function fitsSizes(ex: Exercise, level: Level): boolean {
  const [s, g] = absSorted(ex) as [number, number];
  if (level === 1) return within(s, [1, 9]) && within(g, [1, 9]);
  if (level === 2) return (within(s, [2, 9]) && within(g, [11, 20])) || (within(s, [2, 12]) && within(g, [11, 12]));
  return within(s, [10, 19]) && within(g, [10, 99]);
}
const fits = (ex: Exercise, level: Level): boolean => ints(ex).length === 2 && opsOf(ex.expr).join() === '*' && fitsSizes(ex, level);

describe('Cours 5 v2 — Multiplier deux nombres relatifs', () => {
  it('titre, règle, exercices de fin, formats de révision', () => {
    expect(c05.title).toBe('Multiplier deux nombres relatifs');
    expect(c05.rule).toBe(
      'Pour multiplier deux nombres relatifs, je multiplie les nombres sans leur signe, puis je mets le signe : même signe, le résultat est positif ; signes contraires, il est négatif.',
    );
    expect(c05.endExercises).toEqual({ count: 5, kind: 'saisie' });
    expect(c05.formats).toEqual(['saisie', 'signe', 'vraifaux', 'erreur']);
  });

  it.each([
    [1, '−3 × (−4)', 12],
    [1, '6 × (−7)', -42],
    [1, '−8 × 5', -40],
    [2, '−12 × 7', -84],
    [2, '−11 × (−12)', 132],
    [2, '15 × (−6)', -90],
    [3, '−23 × (−14)', 322],
    [3, '35 × (−17)', -595],
    [3, '−48 × (−12)', 576],
  ] as [Level, string, number][])('exemple niveau %i : %s = %i', (level, display, answer) => {
    checkExample(c05, level, display, answer);
    expect(fitsSizes(exOf(c05, display, level), level)).toBe(true);
  });

  it.each([
    ['−3 × (−4)', -12, 'regle-signes'],
    ['−3 × (−4)', -7, 'addition-au-lieu-multiplication'],
    ['−3 × (−4)', 7, 'addition-au-lieu-multiplication'],
    ['−3 × (−4)', 9, 'erreur-table'],
    ['−3 × (−4)', 16, 'erreur-table'],
    ['−3 × (−4)', 11, 'autre'],
    ['8 × (−3)', 24, 'regle-signes'],
    ['8 × (−3)', 5, 'addition-au-lieu-multiplication'],
    ['8 × (−3)', -11, 'addition-au-lieu-multiplication'],
    ['8 × (−3)', -21, 'erreur-table'],
    ['8 × (−3)', -32, 'erreur-table'],
    ['8 × (−3)', -25, 'autre'],
    ['−8 × 3', 24, 'regle-signes'],
    ['3 × 4', -12, 'regle-signes'],
  ] as [string, number, string][])('%s : %i → %s', (display, given, errorType) => checkDiagnosis(c05, display, given, errorType));

  it('erreur-table : 3 × 4 → 9, 15, 8 ou 16', () => {
    for (const given of [9, 15, 8, 16]) checkDiagnosis(c05, '3 × 4', given, 'erreur-table');
    checkDiagnosis(c05, '3 × 4', -9, 'autre');
  });

  it('réponses fausses du moteur (QCM, vrai ou faux)', () => {
    const ex = exOf(c05, '−3 × (−4)');
    expect(c05.errors.map((e) => e.wrongValues(ex).map((r) => r.n).sort((x, y) => x - y))).toEqual([[-12], [-7, 7], [8, 9, 15, 16]]);
  });

  it('résolution type : le signe d’abord écrit devant le produit des nombres sans leur signe', () => {
    expect(c05.resolution(exOf(c05, '−3 × (−4)'))).toEqual(['−3 × (−4)', '= +(3 × 4)', '= 12'].map(tex));
    expect(c05.resolution(exOf(c05, '6 × (−7)'))).toEqual(['6 \\times (-7)', '= -(6 \\times 7)', '= -42']);
    expect(c05.resolution(exOf(c05, '35 × (−17)', 3))).toEqual(['35 × (−17)', '= −(35 × 17)', '= −595'].map(tex));
  });

  it('résolution fausse (« Trouver l’erreur ») : la ligne fausse est la bonne', () => {
    const [regle, addition, table] = c05.errors;
    const ex = exOf(c05, '−3 × (−4)');
    expect(regle?.wrongResolution?.(ex, rat(-12))).toEqual({ lines: ['-3 \\times (-4)', '= -(3 \\times 4)', '= -12'], wrongLine: 1 });
    expect(addition?.wrongResolution?.(ex, rat(-7))).toEqual({ lines: ['-3 \\times (-4)', '= -3 + (-4)', '= -7'], wrongLine: 1 });
    expect(table?.wrongResolution?.(ex, rat(16))).toEqual({ lines: ['-3 \\times (-4)', '= +(3 \\times 4)', '= 16'], wrongLine: 2 });
  });

  it('explications affichées : un message par erreur prévisible', () => {
    const [regle, addition, table] = c05.errors;
    expect(c05.errors.map((e) => e.family)).toEqual(['signe', 'calcul', 'calcul']);
    // (−) × (−) donné négatif
    expect(regle?.explain(exOf(c05, '−3 × (−4)')).rule).toBe(
      "Deux nombres négatifs multipliés donnent un **positif**. Ce n'est pas comme l'addition, où −3 + (−4) reste négatif : ici, −3 × (−4) = 12.",
    );
    // le signe de l'addition (celui du plus grand) appliqué au produit
    expect(regle?.explain(exOf(c05, '8 × (−3)')).rule).toBe(
      "« Le signe du plus grand », c'est la règle de l'**addition**. Pour multiplier, des signes contraires donnent toujours un **négatif** : 8 × (−3) = −24.",
    );
    // le signe oublié
    expect(regle?.explain(exOf(c05, '−8 × 3')).rule).toBe(
      'Il manque le signe : −8 et 3 ont des signes contraires, le résultat est **négatif** : −8 × 3 = −24.',
    );
    expect(regle?.explain(exOf(c05, '−5 × 5')).rule).toBe(
      'Il manque le signe : −5 et 5 ont des signes contraires, le résultat est **négatif** : −5 × 5 = −25.',
    );
    expect(regle?.explain(exOf(c05, '3 × 4')).rule).toBe('Deux nombres positifs donnent un résultat **positif** : 3 × 4 = 12.');
    expect(addition?.explain(exOf(c05, '−3 × (−4)')).rule).toBe("Ici, c'est une **multiplication** : × et pas +. 3 × 4 = 12, et non 3 + 4 = 7.");
    expect(table?.explain(exOf(c05, '−3 × (−4)')).rule).toBe('Le signe est bon ! Vérifie la multiplication : 3 × 4 = 12.');
  });

  it('chaque erreur reconnue renvoie à sa règle (« Relire la règle N »)', () => {
    expect(c05.errors.map((e) => [e.id, e.rule])).toEqual([
      ['regle-signes', { n: 1, label: 'Le signe du produit', partIndex: 2 }],
      ['addition-au-lieu-multiplication', { n: 2, label: "Les nombres d'abord, le signe ensuite", partIndex: 3 }],
      ['erreur-table', { n: 2, label: "Les nombres d'abord, le signe ensuite", partIndex: 3 }],
    ]);
    for (const e of c05.errors) {
      const p = c05.parts[e.rule!.partIndex];
      expect(p?.type === 'etapes' && p.title).toBe(e.rule!.label);
      expect(p?.type === 'etapes' && p.steps.find((s) => s.rule)?.rule?.n).toBe(e.rule!.n);
    }
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      c05,
      fits,
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

  it('signes mélangés : au moins un négatif 3 fois sur 4', () => {
    for (const level of [1, 2, 3] as Level[])
      expect(Math.abs(share(c05, level, 51 + level, (ex) => ints(ex).some((x) => x < 0)) - 0.75)).toBeLessThanOrEqual(TOLERANCE);
  });
});

describe('Cours 5 v2 — générateur sur 500 tirages par niveau', () => {
  const drawn = (level: Level, seed: number, n = 500): Exercise[] => {
    const r = seededRng(seed);
    return Array.from({ length: n }, () => c05.generate(level, r));
  };

  it.each([1, 2, 3] as Level[])('niveau %i : un produit de deux facteurs, tailles, résultat juste', (level) => {
    for (const ex of drawn(level, 20 + level)) {
      expect(fits(ex, level), toLatex(ex.expr)).toBe(true);
      const [a, b] = ints(ex) as [number, number];
      expect(ex.answer).toEqual(rat(a * b));
      expect(ex.answer.n).not.toBe(0);
      expect(ex.courseId).toBe(c05.id);
      expect(ex.level).toBe(level);
    }
  });

  it('niveau 2 : les deux familles sortent (un facteur jusqu’à 20, tables de 11 et 12)', () => {
    const xs = drawn(2, 31);
    expect(xs.some((ex) => (absSorted(ex)[1] as number) > 12)).toBe(true);
    expect(xs.some((ex) => (absSorted(ex)[0] as number) > 9)).toBe(true);
  });

  it('les quatre combinaisons de signes sortent à chaque niveau', () => {
    for (const level of [1, 2, 3] as Level[]) {
      const combos = new Set(drawn(level, 40 + level).map((ex) => ints(ex).map((x) => (x < 0 ? '-' : '+')).join('')));
      expect([...combos].sort()).toEqual(['++', '+-', '-+', '--']);
    }
  });

  it('un négatif en second est entre parenthèses, jamais le premier', () => {
    for (const level of [1, 2, 3] as Level[])
      for (const ex of drawn(level, 60 + level, 300)) {
        const latex = toLatex(ex.expr);
        expect(latex.startsWith('(')).toBe(false);
        expect(latex.includes('(-')).toBe((ints(ex)[1] as number) < 0);
      }
  });
});

describe('Cours 5 v2 — structure et note', () => {
  it('14 parties, types dans l’ordre', () => {
    expect(c05.parts.map((p) => (p.type === 'question' ? `${p.activity}:${p.question.kind}` : p.type))).toEqual([
      'decouverte:choix', 'etapes', 'etapes', 'etapes',
      'lecon:choix', 'lecon:choix', 'decouverte:choix', 'autres', 'pratique',
      'etapes', 'exemple:trou', 'decouverte:qcm', 'exemple:trou', 'etapes',
    ]);
  });

  it('13 questions notées : 2 petites, série (4), exemple 1 (1), exemple 2 (1), fins (5)', () => {
    const items = courseRunItems(c05, seededRng(3));
    const counted = items.filter((i) => i.type === 'question' && i.activity !== 'decouverte');
    expect(counted.map((i) => i.type === 'question' && i.activity)).toEqual([
      'lecon', 'lecon',
      'lecon', 'lecon', 'lecon', 'lecon',
      'exemple', 'exemple',
      'fin', 'fin', 'fin', 'fin', 'fin',
    ]);
    const q = (id: string) => items.find((i) => i.itemId === id);
    expect(q('partie-0')).toMatchObject({ activity: 'decouverte' });
    expect(q('partie-6')).toMatchObject({ activity: 'decouverte' });
    expect(q('partie-11')).toMatchObject({ activity: 'decouverte' }); // case 1 de l'exemple 2 : non notée
    expect(q('partie-12')).toMatchObject({ activity: 'exemple' });
    expect(q('partie-8-3')).toMatchObject({ texts: { series: { n: 4, of: 4 } } });
    expect(q('partie-5')).toMatchObject({ texts: { joinPrevious: true } });
  });

  it('les exercices de fin : niveau 1, uniquement le produit de deux relatifs', () => {
    const fins = courseRunItems(c05, seededRng(9)).filter((i) => i.type === 'question' && i.activity === 'fin');
    expect(fins).toHaveLength(5);
    for (const f of fins) {
      if (f.type !== 'question' || !('ex' in f.question)) throw new Error('question');
      expect(f.question.ex.level).toBe(1);
      expect(opsOf(f.question.ex.expr)).toEqual(['*']);
    }
  });

  it('7 écrans de leçon (la pastille « étape N sur 7 ») ; la série n’en fait pas partie', () => {
    expect(c05.lessonLength).toBe(8);
    expect(lessonStep(c05, 0)).toEqual({ n: 1, total: 7 });
    expect(lessonStep(c05, 3)).toEqual({ n: 4, total: 7 });
    expect(lessonStep(c05, 4)).toEqual({ n: 5, total: 7 });
    expect(lessonStep(c05, 5)).toEqual({ n: 5, total: 7 }); // 2e petite question : même écran que la 1re
    expect(lessonStep(c05, 6)).toEqual({ n: 6, total: 7 });
    expect(lessonStep(c05, 7)).toEqual({ n: 7, total: 7 });
    expect(lessonStep(c05, 8)).toBeNull();
  });

  it('12 écrans pour apprendre avant l’annonce de la fin (13 parties, 2 petites questions sur un écran)', () => {
    const before = c05.parts.slice(0, 13);
    expect(before.filter((p) => !(p.type === 'question' && p.joinPrevious)).length).toBe(12);
  });
});
