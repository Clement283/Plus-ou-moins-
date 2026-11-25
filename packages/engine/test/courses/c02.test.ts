import { describe, expect, it } from 'vitest';
import { c02 } from '../../src/courses/calculs/c02-additionner-signes-contraires';
import { SIZES } from '../../src/courses/calculs/shared';
import { courseRunItems } from '../../src/activity';
import { seededRng } from '../../src/rng';
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
    expect(c02.resolution(exOf(c02, '−47 + 29'))).toEqual(['-47 + 29', '= -(47 - 29)', '= -18']);
  });

  it('explications affichées', () => {
    const ex = exOf(c02, '−3 + 5');
    const [mauvais, addition] = c02.errors;
    expect(mauvais?.family).toBe('signe');
    expect(addition?.family).toBe('calcul');
    expect(mauvais?.explain(ex).rule).toBe(
      "Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe). Ici, c'est 5, et il est positif.",
    );
    expect(mauvais?.explain(exOf(c02, '3 + (−8)')).rule).toBe(
      "Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe). Ici, c'est 8, et il est négatif.",
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

  it('formats, fiche mémo et règles des erreurs', () => {
    expect(c02.lessonLength).toBe(10);
    expect(c02.memo?.rule).toBe(c02.rule);
    expect(c02.memo?.examples).toHaveLength(2);
    expect(c02.errors.map((e) => e.rule)).toEqual([
      { n: 2, label: 'Le plus grand décide du signe', partIndex: 6 },
      { n: 1, label: 'Je soustrais les nombres sans leur signe', partIndex: 3 },
    ]);
  });

  it('chaque règle d’erreur pointe l’encadré du même numéro', () => {
    for (const e of c02.errors) {
      const p = c02.parts[e.rule!.partIndex];
      expect(p?.type).toBe('etapes');
      expect(p?.type === 'etapes' && p.steps.find((s) => s.rule)?.rule?.n).toBe(e.rule!.n);
    }
  });
});

describe('Cours 2 v2 — structure et note', () => {
  it('16 parties, types dans l’ordre de la spec', () => {
    expect(c02.parts.map((p) => (p.type === 'question' ? `${p.activity}:${p.question.kind}` : p.type))).toEqual([
      'decouverte:choix', 'etapes', 'decouverte:choix', 'etapes',
      'lecon:choix', 'lecon:choix', 'etapes', 'lecon:choix', 'lecon:choix',
      'autres', 'pratique', 'etapes', 'exemple:trou', 'decouverte:trou', 'exemple:trou', 'etapes',
    ]);
  });

  it('15 questions notées : 4 petites, série (4), exemple 1 (1), exemple 2 (1), fins (5)', () => {
    const items = courseRunItems(c02, seededRng(3));
    const counted = items.filter((i) => i.type === 'question' && i.activity !== 'decouverte');
    expect(counted).toHaveLength(15);
    expect(counted.map((i) => i.type === 'question' && i.activity)).toEqual([
      'lecon', 'lecon', 'lecon', 'lecon', // petites questions
      'lecon', 'lecon', 'lecon', 'lecon', // série de pratique
      'exemple', 'exemple',
      'fin', 'fin', 'fin', 'fin', 'fin',
    ]);
    const q = (id: string) => items.find((i) => i.itemId === id);
    expect(q('partie-0')).toMatchObject({ activity: 'decouverte' });
    expect(q('partie-2')).toMatchObject({ activity: 'decouverte' });
    expect(q('partie-13')).toMatchObject({ activity: 'decouverte' }); // case 1 de l'exemple 2 : non notée
    expect(q('partie-14')).toMatchObject({ activity: 'exemple' });
    expect(q('partie-10-2')).toMatchObject({ texts: { series: { n: 3, of: 4 } } });
  });

  it('les petites questions de chaque règle partagent un écran de deux', () => {
    const items = courseRunItems(c02, seededRng(3));
    for (const id of ['partie-5', 'partie-8']) expect(items.find((i) => i.itemId === id)).toMatchObject({ texts: { joinPrevious: true } });
    for (const id of ['partie-4', 'partie-7']) expect(items.find((i) => i.itemId === id)).not.toMatchObject({ texts: { joinPrevious: true } });
  });

  it('écrans de leçon : 8 (la pastille « étape N sur 8 »), la série n’en fait pas partie', async () => {
    const { lessonStep } = await import('../../src/courses/types');
    expect(lessonStep(c02, 0)).toEqual({ n: 1, total: 8 });
    expect(lessonStep(c02, 5)).toEqual({ n: 5, total: 8 }); // 2e petite question : même écran que la 1re
    expect(lessonStep(c02, 9)).toEqual({ n: 8, total: 8 });
    expect(lessonStep(c02, 10)).toBeNull();
  });

  it('l’écran « Autres façons de faire » est une partie `autres` devenue une explication de l’activité', () => {
    const items = courseRunItems(c02, seededRng(3));
    const autres = items.find((i) => i.itemId === 'partie-9');
    expect(autres).toMatchObject({ type: 'explication', partIndex: 9, blocks: [], texts: { title: 'Autres façons de faire' } });
    expect(autres?.type === 'explication' && autres.autres?.techniques.map((t) => t.name)).toEqual(['Commencer par le positif', 'Deviner le signe']);
  });

  it('droites : cibles dans la droite, 8 graduations au plus', () => {
    for (const i of [1, 6]) {
      const p = c02.parts[i];
      if (p?.type !== 'etapes') throw new Error('etapes');
      for (const s of p.steps) {
        const l = s.scene?.line;
        const a = s.action;
        if (a?.type === 'graduation' && l) {
          expect(a.target).toBeGreaterThanOrEqual(l.from);
          expect(a.target).toBeLessThanOrEqual(l.to);
          expect(l.to - l.from + 1).toBeLessThanOrEqual(8);
          for (const e of a.errors) for (const at of e.at) expect(at >= l.from && at <= l.to).toBe(true);
        }
      }
    }
    const pr = c02.parts[10];
    const q = pr?.type === 'pratique' ? pr.questions[0]?.question : undefined;
    expect(q?.kind === 'droite' && q.line.to - q.line.from + 1).toBeLessThanOrEqual(8);
  });

  it('jamais plus de 2 étapes de lecture d’affilée sans action', () => {
    for (const p of c02.parts) {
      if (p.type !== 'etapes' || p.title === 'Place aux 5 exercices de fin' || p.title === 'Exemple 1 sur 2') continue;
      let run = 0;
      for (const s of p.steps) {
        run = s.action ? 0 : run + 1;
        expect(run, p.title).toBeLessThanOrEqual(2);
      }
    }
  });
});
