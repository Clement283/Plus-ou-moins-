import { describe, expect, it } from 'vitest';
import { c07 } from '../../src/courses/calculs/c07-multiplier-plusieurs';
import { checkAnswer, courseRunItems } from '../../src';
import { toLatex } from '../../src/math/expr';
import { rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import { lessonStep } from '../../src/courses/types';
import type { Answer, Question } from '../../src/exercises/types';
import type { Exercise, Level, Scene } from '../../src/courses/types';
import { checkDiagnosis, checkExample, exOf, ints, opsOf, propertyChecks, tex, within } from './helpers';

// Cours 7 v2 (mode autonome, fiche courte du doc 06). Les textes sont vérifiés par instantané (c07.test.ts.snap), pas recopiés ici.

/** Niveau 1 : 3 facteurs de 1 à 9 ; niveau 2 : 4 facteurs de 1 à 6 ; niveau 3 : 5 ou 6 facteurs de 1 à 5. */
const COUNTS: Record<Level, number[]> = { 1: [3], 2: [4], 3: [5, 6] };
const MAX: Record<Level, number> = { 1: 9, 2: 6, 3: 5 };
const BOUND: Record<Level, number> = { 1: 729, 2: 1296, 3: 15625 };
const negs = (ex: Exercise): number => ints(ex).filter((x) => x < 0).length;
const fits = (ex: Exercise, level: Level): boolean =>
  COUNTS[level].includes(ints(ex).length) && opsOf(ex.expr).every((o) => o === '*') &&
  negs(ex) >= 1 && ints(ex).every((x) => within(x, [1, MAX[level]])) &&
  ex.answer.d === 1 && Math.abs(ex.answer.n) <= BOUND[level];

describe('Cours 7 v2 — Multiplier plusieurs relatifs', () => {
  it('titre, règle, exercices de fin, une phrase à la fois', () => {
    expect(c07.title).toBe('Multiplier plusieurs relatifs');
    expect(c07.rule).toBe(
      'Je compte les signes − : nombre pair → résultat positif ; nombre impair → résultat négatif. Puis je multiplie les nombres sans leur signe.',
    );
    expect(c07.endExercises).toEqual({ count: 5, kind: 'saisie' });
    expect(c07.unePhrase).toBe(true);
    expect(c07.expectInteger).toBe(true);
  });

  it.each([
    [1, '−2 × 3 × (−4)', 24],
    [1, '−1 × (−5) × (−2)', -10],
    [1, '4 × (−3) × 2', -24],
    [2, '−2 × (−3) × (−1) × 4', -24],
    [2, '3 × (−2) × (−5) × (−2)', -60],
    [2, '−4 × (−1) × (−3) × (−2)', 24],
    [3, '−2 × 3 × (−5) × (−1) × 5', -150],
    [3, '−3 × (−2) × (−4) × (−1) × (−5)', -120],
    [3, '2 × (−5) × (−3) × (−1) × (−4) × 2', 240],
  ] as [Level, string, number][])('exemple niveau %i : %s = %i', (level, display, answer) => {
    checkExample(c07, level, display, answer);
    expect(fits(exOf(c07, display, level), level)).toBe(true);
  });

  it.each([
    [-24, 'parite-signes'],
    [-3, 'addition-au-lieu-multiplication'],
    [9, 'addition-au-lieu-multiplication'],
    [-9, 'addition-au-lieu-multiplication'],
    [12, 'facteur-oublie'],
    [-12, 'facteur-oublie'],
    [8, 'facteur-oublie'],
    [6, 'facteur-oublie'],
    [20, 'autre'],
    [0, 'autre'],
  ] as [number, string][])('−2 × 3 × (−4) = 24 : %i → %s', (given, errorType) => checkDiagnosis(c07, '−2 × 3 × (−4)', given, errorType));

  it('réponses fausses du moteur (QCM, vrai ou faux)', () => {
    const ex = exOf(c07, '−2 × 3 × (−4)');
    expect(c07.errors.map((e) => e.wrongValues(ex).map((r) => r.n).sort((x, y) => x - y))).toEqual([[-24], [-9, -3, 9], [-12, 12]]);
  });

  it('résolution type : le signe d’abord écrit devant le produit des nombres sans leur signe', () => {
    expect(c07.resolution(exOf(c07, '−2 × 3 × (−4)'))).toEqual(['−2 × 3 × (−4)', '= +(2 × 3 × 4)', '= 24'].map(tex));
    expect(c07.resolution(exOf(c07, '4 × (−3) × 2'))).toEqual(['4 × (−3) × 2', '= −(4 × 3 × 2)', '= −24'].map(tex));
    expect(c07.resolution(exOf(c07, '2 × (−5) × (−3) × (−1) × (−4) × 2', 3))).toEqual(
      ['2 × (−5) × (−3) × (−1) × (−4) × 2', '= +(2 × 5 × 3 × 1 × 4 × 2)', '= 240'].map(tex),
    );
  });

  it('résolution fausse (« Trouver l’erreur ») : la ligne fausse est la bonne', () => {
    const [parite, addition, oubli] = c07.errors;
    const ex = exOf(c07, '−2 × 3 × (−4)');
    expect(parite?.wrongResolution?.(ex, rat(-24))).toEqual({ lines: ['-2 \\times 3 \\times (-4)', '= -(2 \\times 3 \\times 4)', '= -24'], wrongLine: 1 });
    expect(addition?.wrongResolution?.(ex, rat(-3))).toEqual({ lines: ['-2 \\times 3 \\times (-4)', '= -2 + 3 + (-4)', '= -3'], wrongLine: 1 });
    expect(addition?.wrongResolution?.(ex, rat(9))).toEqual({ lines: ['-2 \\times 3 \\times (-4)', '= +(2 + 3 + 4)', '= 9'], wrongLine: 1 });
    expect(oubli?.wrongResolution?.(ex, rat(12))).toEqual({ lines: ['-2 \\times 3 \\times (-4)', '= +(3 \\times 4)', '= 12'], wrongLine: 1 });
  });

  // Un test par message d'erreur : les phrases exactes sont dans l'instantané, ici on vérifie quel message sort pour quel cas.
  describe('explications affichées : un message par erreur prévisible', () => {
    const [parite, addition, oubli] = c07.errors;
    const msg = (e: typeof parite, display: string) => e!.explain(exOf(c07, display)).rule;
    it('familles', () => expect(c07.errors.map((e) => e.family)).toEqual(['signe', 'calcul', 'calcul']));
    it('nombre pair de − : ils se compensent, le résultat est positif', () => {
      expect(msg(parite, '−2 × 3 × (−4)')).toBe('Il y a 2 signes − : un nombre **pair**, les − se compensent deux par deux. Le résultat est **positif** : −2 × 3 × (−4) = 24.');
      expect(msg(parite, '−2 × (−3) × (−1) × (−4)')).toMatch(/^Il y a 4 signes − : un nombre \*\*pair\*\*/);
    });
    it('nombre impair de − : il en reste un, le résultat est négatif', () => {
      expect(msg(parite, '4 × (−3) × 2')).toBe('Il y a 1 signe − : un nombre **impair**, il en reste un qui n\'est pas compensé. Le résultat est **négatif** : 4 × (−3) × 2 = −24.');
      expect(msg(parite, '−1 × (−5) × (−2)')).toMatch(/^Il y a 3 signes − : un nombre \*\*impair\*\*/);
    });
    it('addition au lieu de multiplication : le vrai produit et la fausse somme', () =>
      expect(msg(addition, '−2 × 3 × (−4)')).toBe('Ici, on **multiplie** tous les nombres : 2 × 3 × 4 = 24, et non 2 + 3 + 4 = 9.'));
    it('facteur oublié : on compte les facteurs, on multiplie deux par deux', () =>
      expect(msg(oubli, '−2 × 3 × (−4)')).toBe(
        "Il manque un facteur : le calcul en compte 3, et tu n'en as multiplié que 2. Multiplie-les tous : 2 × 3 = 6, puis 6 × 4 = 24.",
      ));
  });

  it('chaque erreur reconnue renvoie à sa règle (« Relire la règle N »)', () => {
    expect(c07.errors.map((e) => [e.id, e.rule])).toEqual([
      ['parite-signes', { n: 2, label: 'Je compte les signes −', partIndex: 2 }],
      ['addition-au-lieu-multiplication', { n: 1, label: 'Multiplier deux par deux', partIndex: 1 }],
      ['facteur-oublie', { n: 3, label: "Le signe d'abord, puis les nombres", partIndex: 3 }],
    ]);
    for (const e of c07.errors) {
      const p = c07.parts[e.rule!.partIndex];
      expect(p?.type === 'etapes' && p.title).toBe(e.rule!.label);
      expect(p?.type === 'etapes' && p.steps.find((s) => s.rule)?.rule?.n).toBe(e.rule!.n);
    }
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      c07,
      fits,
      {
        'parite-signes': { holds: (ex) => negs(ex) % 2 === 0, wrong: (ex) => -ex.answer.n },
        'addition-au-lieu-multiplication': {
          holds: (ex) => ints(ex).every((x) => Math.abs(x) <= 3),
          wrong: (ex) => ints(ex).reduce((s, x) => s + x, 0),
        },
        'facteur-oublie': {
          holds: (ex) => Math.abs(ints(ex)[0] as number) !== 1,
          wrong: (ex) => Math.abs(ints(ex).slice(1).reduce((p, x) => p * x, 1)) * (ex.answer.n < 0 ? -1 : 1),
        },
      },
      707,
    ));
});

describe('Cours 7 v2 — générateur sur 500 tirages par niveau', () => {
  const drawn = (level: Level, seed: number, n = 500): Exercise[] => {
    const r = seededRng(seed);
    return Array.from({ length: n }, () => c07.generate(level, r));
  };

  it.each([1, 2, 3] as Level[])('niveau %i : un produit entier, nombre de facteurs, bornes, au moins un négatif, jamais 0', (level) => {
    const counts = new Set<number>();
    for (const ex of drawn(level, 70 + level)) {
      expect(fits(ex, level), toLatex(ex.expr)).toBe(true);
      counts.add(ints(ex).length);
      expect(ints(ex).every((x) => x !== 0)).toBe(true);
      expect(negs(ex)).toBeGreaterThanOrEqual(1);
      expect(Number.isInteger(ex.answer.n) && ex.answer.d === 1).toBe(true);
      expect(ex.answer.n).not.toBe(0);
      expect(ex.courseId).toBe(c07.id);
      expect(ex.level).toBe(level);
    }
    expect([...counts].sort()).toEqual(COUNTS[level]);
  });

  it('le nombre de signes − est tantôt pair, tantôt impair, à chaque niveau', () => {
    for (const level of [1, 2, 3] as Level[]) {
      const parities = new Set(drawn(level, 80 + level).map((ex) => negs(ex) % 2));
      expect([...parities].sort()).toEqual([0, 1]);
    }
  });

  it('un négatif après le premier facteur est entre parenthèses, jamais le premier', () => {
    for (const level of [1, 2, 3] as Level[])
      for (const ex of drawn(level, 90 + level, 300)) {
        const latex = toLatex(ex.expr);
        expect(latex.startsWith('(')).toBe(false);
        expect((latex.match(/\(-/g) ?? []).length).toBe(ints(ex).slice(1).filter((x) => x < 0).length);
      }
  });
});

describe('Cours 7 v2 — structure, note et leçon', () => {
  it('14 parties, types dans l’ordre', () => {
    expect(c07.parts.map((p) => (p.type === 'question' ? `${p.activity}:${p.question.kind}` : p.type))).toEqual([
      'decouverte:choix', 'etapes', 'etapes', 'etapes',
      'lecon:choix', 'lecon:choix', 'decouverte:choix', 'autres', 'pratique',
      'etapes', 'exemple:trou', 'decouverte:qcm', 'exemple:trou', 'etapes',
    ]);
  });

  it('13 questions notées : 2 petites, série (4), exemple 1 (1), exemple 2 (1), fins (5)', () => {
    const items = courseRunItems(c07, seededRng(3));
    const counted = items.filter((i) => i.type === 'question' && i.activity !== 'decouverte');
    expect(counted.map((i) => i.type === 'question' && i.activity)).toEqual([
      'lecon', 'lecon', 'lecon', 'lecon', 'lecon', 'lecon', 'exemple', 'exemple', 'fin', 'fin', 'fin', 'fin', 'fin',
    ]);
    const q = (id: string) => items.find((i) => i.itemId === id);
    expect(q('partie-0')).toMatchObject({ activity: 'decouverte' });
    expect(q('partie-6')).toMatchObject({ activity: 'decouverte' });
    expect(q('partie-11')).toMatchObject({ activity: 'decouverte' });
    expect(q('partie-12')).toMatchObject({ activity: 'exemple' });
    expect(q('partie-8-3')).toMatchObject({ texts: { series: { n: 4, of: 4 } } });
    expect(q('partie-5')).toMatchObject({ texts: { joinPrevious: true } });
  });

  it('la série de pratique : une question du Cours 6 (division) parmi les 4', () => {
    const p = c07.parts[8];
    if (p?.type !== 'pratique') throw new Error('pratique');
    const kinds = p.questions.map((x) => x.question.kind);
    expect(kinds).toEqual(['trou', 'qcm', 'choix', 'saisie']);
    const c6 = p.questions[2]!.question;
    expect(c6.kind === 'choix' && opsOf(c6.ex.expr)).toEqual(['/']);
    expect(p.questions.filter((x) => 'ex' in x.question && opsOf(x.question.ex.expr)[0] === '*')).toHaveLength(3);
  });

  it('les exercices de fin : niveau 1, uniquement le produit de trois relatifs', () => {
    const fins = courseRunItems(c07, seededRng(9)).filter((i) => i.type === 'question' && i.activity === 'fin');
    expect(fins).toHaveLength(5);
    for (const f of fins) {
      if (f.type !== 'question' || !('ex' in f.question)) throw new Error('question');
      expect(f.question.ex.level).toBe(1);
      expect(opsOf(f.question.ex.expr)).toEqual(['*', '*']);
    }
  });

  it('7 écrans de leçon (la pastille « étape N sur 7 ») ; la série n’en fait pas partie', () => {
    expect(c07.lessonLength).toBe(8);
    expect(lessonStep(c07, 0)).toEqual({ n: 1, total: 7 });
    expect(lessonStep(c07, 3)).toEqual({ n: 4, total: 7 });
    expect(lessonStep(c07, 4)).toEqual({ n: 5, total: 7 });
    expect(lessonStep(c07, 5)).toEqual({ n: 5, total: 7 });
    expect(lessonStep(c07, 7)).toEqual({ n: 7, total: 7 });
    expect(lessonStep(c07, 8)).toBeNull();
  });

  it('12 écrans pour apprendre avant l’annonce de la fin ; jamais plus de 2 lectures d’affilée', () => {
    const before = c07.parts.slice(0, 13);
    expect(before.filter((p) => !(p.type === 'question' && p.joinPrevious)).length).toBe(12);
    for (const p of c07.parts) {
      if (p.type !== 'etapes' || p.title.startsWith('Place aux')) continue;
      let run = 0;
      for (const s of p.steps) {
        run = s.action ? 0 : run + 1;
        // l'encadré de règle (dernière étape, sans phrase) n'est pas une lecture de plus
        if (s.text === undefined) run--;
        expect(run, p.title).toBeLessThanOrEqual(2);
      }
      expect(p.steps.length, p.title).toBeLessThanOrEqual(5);
    }
  });

  it('chaque étape de leçon surligne ce dont elle parle (une scène avec `hl` dans les étapes à action)', () => {
    for (const p of c07.parts.slice(1, 4)) {
      if (p.type !== 'etapes') throw new Error('etapes');
      for (const s of p.steps.filter((x) => x.action?.type === 'trou'))
        expect([...(s.after?.calcs ?? [])].some((c) => c.tokens.some((t) => t.hl))).toBe(true);
    }
  });

  it('chaque phrase à trou a sa bonne réponse dans la phrase remplie', () => {
    for (const p of c07.parts.slice(1, 4)) {
      if (p.type !== 'etapes') throw new Error('etapes');
      for (const s of p.steps) {
        if (s.action?.type !== 'trou') continue;
        const good = s.action.choices[s.action.correct]!;
        expect(s.action.open).toContain('[ ? ]');
        expect(s.text!.replace(/\*\*/g, '')).toContain(s.action.open.replace('[ ? ]', good).replace(/\.$/, ''));
      }
    }
  });
});

// ——— Retours d'erreur des questions qui comptent (un message par erreur prévisible) ———

const typed = (n: number): Answer => ({
  raw: { tokens: [...(n < 0 ? `-${-n}` : String(n))].map((c) => ({ t: 'c' as const, c: c as '-' })), cursor: 'root' as const },
});
const say = (q: Question, a: Answer): string | null => c07.feedbackText?.(q, checkAnswer(c07, q, a)) ?? null;
const saisieOf = (display: string): Question => ({ kind: 'saisie', ex: exOf(c07, display), promptLatex: '' }) as Question;

describe('Cours 7 v2 — feedbackText', () => {
  it.each([
    ['−2 × 3 × (−4)', 24, 'Juste'],
    ['−2 × 3 × (−4)', -24, 'Il y a 2 signes −'],
    ['4 × (−3) × 2', 24, 'Il y a 1 signe −'],
    ['−2 × 3 × (−4)', -3, 'Ici, on **multiplie**'],
    ['−2 × 3 × (−4)', 9, 'Ici, on **multiplie**'],
    ['−2 × 3 × (−4)', 12, 'Il manque un facteur'],
    ['−2 × 3 × (−4)', 20, 'Le signe d\'abord : 2 signes −, un nombre pair, le résultat est positif. Puis les nombres sans leur signe, deux par deux : 2 × 3 = 6, puis 6 × 4 = 24.'],
  ])('saisie %s = %i → message', (display, given, start) => {
    const m = say(saisieOf(display), typed(given));
    expect(m).not.toBeNull();
    if (start === 'Juste') expect(m).toBe('−2 × 3 × (−4) : 2 signes −, un nombre pair, le résultat est positif. 2 × 3 = 6, puis 6 × 4 = 24, donc 24.');
    else expect(m).toContain(start);
  });

  it('séries de pratique : la case au signe déjà écrit', () => {
    const p = c07.parts[8];
    if (p?.type !== 'pratique') throw new Error('pratique');
    const q = p.questions[0]!.question;
    expect(say(q, typed(-12))).toBe('3 × 2 × 2 = 12, et le signe − est déjà écrit : −12.');
    expect(say(q, typed(12))).toBe(
      'Le signe est déjà trouvé, sur la ligne du dessus : 3 signes −, un nombre impair, le résultat est négatif. 3 × 2 = 6, puis 6 × 2 = 12, donc −12.',
    );
    expect(say(q, typed(7))).toContain('Ici, on **multiplie**');
  });

  it('séries de pratique : le signe du résultat (touches + et −)', () => {
    const p = c07.parts[8];
    if (p?.type !== 'pratique') throw new Error('pratique');
    const q = p.questions[1]!.question;
    expect(say(q, { choice: 1 })).toContain('2 × 3 = 6, puis 6 × 1 = 6, donc −6');
    expect(say(q, { choice: 0 })).toMatch(/^Il y a 3 signes − : un nombre \*\*impair\*\*/);
  });

  it('la question du Cours 6 : « −392 » (tu as multiplié) et « 8 » (le signe oublié) ont chacun leur message', () => {
    const p = c07.parts[8];
    if (p?.type !== 'pratique') throw new Error('pratique');
    const q = p.questions[2]!.question;
    if (q.kind !== 'choix') throw new Error('choix');
    expect(q.options.map((o) => o.label)).toEqual(['−8', '−392', '8']);
    expect(q.options[1]!.why).toContain('tu as multiplié');
    expect(q.options[2]!.why).toContain('il manque le signe');
  });

  it('les exemples guidés : exemple 1 (−30) et exemple 2 (24)', () => {
    const hidden = [10, 12].map((i) => {
      const p = c07.parts[i];
      return p?.type === 'question' && p.question.kind === 'trou' ? p.question.hidden.n : null;
    });
    expect(hidden).toEqual([-30, 24]);
    const sign = c07.parts[11];
    expect(sign?.type === 'question' && sign.question.kind === 'qcm' && sign.question.correctIndex).toBe(0);
  });
});

// ——— Les textes, par instantané ———

/** Toutes les phrases d'une partie (les clés techniques sont écartées). */
const SKIP = new Set(['type', 'kind', 'activity', 'layout', 'k', 'op', 'courseId', 'itemId', 'tone', 'anim', 'hl', 'dim', 'errorType', 'formula']);
function strings(x: unknown): string[] {
  if (typeof x === 'string') return [x];
  if (Array.isArray(x)) return x.flatMap(strings);
  if (x && typeof x === 'object')
    return Object.entries(x).flatMap(([k, v]) => (SKIP.has(k) ? [] : typeof v === 'boolean' || typeof v === 'number' ? [] : strings(v)));
  return [];
}

/** Le calcul de chaque ligne d'une scène, le morceau surligné entre [crochets]. */
const scene = (sc?: Scene): string[] =>
  sc ? [`scène : ${sc.calcs.map((c) => c.tokens.map((t) => (t.hl ? `[${t.t}]` : t.t)).join('')).join(' | ')}`] : [];

describe('Cours 7 v2 — instantané des textes', () => {
  it('écrans de la leçon, phrase par phrase', () => {
    const out = c07.parts.map((p, i) => {
      if (p.type === 'etapes')
        return {
          partie: i,
          titre: p.title,
          etapes: p.steps.map((s) => [s.text ?? '(encadré)', s.rule?.text, ...strings(s.action), ...scene(s.scene), ...scene(s.after)].filter(Boolean)),
        };
      return { partie: i, textes: strings(p) };
    });
    expect(out).toMatchSnapshot();
  });

  it('messages d’erreur (explications affichées)', () => {
    const cases = ['−2 × 3 × (−4)', '4 × (−3) × 2', '−1 × (−5) × (−2)', '−3 × (−2) × (−4) × (−1)', '2 × 5 × 3'];
    const out = Object.fromEntries(c07.errors.map((e) => [e.id, cases.map((d) => `${d} : ${e.explain(exOf(c07, d)).rule}`)]));
    expect(out).toMatchSnapshot();
  });

  it('fiche mémo et règle', () => {
    expect({ rule: c07.rule, memo: c07.memo }).toMatchSnapshot();
  });
});
