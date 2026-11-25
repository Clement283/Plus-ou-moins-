import { describe, expect, it } from 'vitest';
import { c06 } from '../../src/courses/calculs/c06-diviser-deux';
import { checkAnswer, courseRunItems } from '../../src';
import { toLatex } from '../../src/math/expr';
import { rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import { lessonStep } from '../../src/courses/types';
import type { Answer, Question } from '../../src/exercises/types';
import type { Exercise, Level, Scene } from '../../src/courses/types';
import { TOLERANCE, checkDiagnosis, checkExample, exOf, ints, opsOf, propertyChecks, share, tex, within } from './helpers';

// Cours 6 v2 (mode autonome, fiche courte du doc 06). Les textes sont vérifiés par instantané (c06.test.ts.snap), pas recopiés ici.

const Q: Record<Level, [number, number]> = { 1: [2, 9], 2: [10, 30], 3: [10, 99] };
const B: Record<Level, [number, number]> = { 1: [2, 9], 2: [2, 9], 3: [10, 40] };
const fits = (ex: Exercise, level: Level): boolean => {
  const [a, b] = ints(ex) as [number, number];
  return ints(ex).length === 2 && opsOf(ex.expr).join() === '/' && b !== 0 && ex.answer.d === 1 &&
    a === ex.answer.n * b && within(ex.answer.n, Q[level]) && within(b, B[level]);
};

describe('Cours 6 v2 — Diviser deux nombres relatifs', () => {
  it('titre, règle, exercices de fin, une phrase à la fois', () => {
    expect(c06.title).toBe('Diviser deux nombres relatifs');
    expect(c06.endExercises).toEqual({ count: 5, kind: 'saisie' });
    expect(c06.unePhrase).toBe(true);
  });

  it.each([
    [1, '−12 ÷ 4', -3],
    [1, '−35 ÷ (−7)', 5],
    [1, '24 ÷ (−6)', -4],
    [2, '−126 ÷ 6', -21],
    [2, '152 ÷ (−8)', -19],
    [2, '−270 ÷ (−9)', 30],
    [3, '−1188 ÷ 12', -99],
    [3, '2208 ÷ (−24)', -92],
    [3, '−3366 ÷ (−34)', 99],
  ] as [Level, string, number][])('exemple niveau %i : %s = %i', (level, display, answer) => {
    checkExample(c06, level, display, answer);
    expect(fits(exOf(c06, display, level), level)).toBe(true);
  });

  it.each([
    ['−12 ÷ 4', 3, 'regle-signes'],
    ['−12 ÷ (−4)', -3, 'regle-signes'],
    ['24 ÷ (−6)', 4, 'regle-signes'],
    ['12 ÷ 4', -3, 'regle-signes'],
    ['−12 ÷ 4', -48, 'multiplication-au-lieu-division'],
    ['−12 ÷ 4', 48, 'multiplication-au-lieu-division'],
    ['−12 ÷ 4', -4, 'erreur-table'],
    ['−12 ÷ 4', -2, 'erreur-table'],
    ['12 ÷ 4', 4, 'erreur-table'],
    ['−12 ÷ 4', -8, 'autre'],
    ['−12 ÷ 4', 0, 'autre'],
  ] as [string, number, string][])('%s : %i → %s', (display, given, errorType) => checkDiagnosis(c06, display, given, errorType));

  it('réponses fausses du moteur (QCM, vrai ou faux)', () => {
    const ex = exOf(c06, '−12 ÷ 4');
    expect(c06.errors.map((e) => e.wrongValues(ex).map((r) => r.n).sort((x, y) => x - y))).toEqual([[3], [-48, 48], [-4, -2]]);
  });

  it('résolution type : le signe d’abord écrit devant la division des nombres sans leur signe', () => {
    expect(c06.resolution(exOf(c06, '−12 ÷ 4'))).toEqual(['−12 ÷ 4', '= −(12 ÷ 4)', '= −3'].map(tex));
    expect(c06.resolution(exOf(c06, '−35 ÷ (−7)'))).toEqual(['−35 ÷ (−7)', '= +(35 ÷ 7)', '= 5'].map(tex));
    expect(c06.resolution(exOf(c06, '2208 ÷ (−24)', 3))).toEqual(['2208 ÷ (−24)', '= −(2208 ÷ 24)', '= −92'].map(tex));
  });

  it('résolution fausse (« Trouver l’erreur ») : la ligne fausse est la bonne', () => {
    const [regle, mult, table] = c06.errors;
    const ex = exOf(c06, '−12 ÷ (−4)');
    expect(regle?.wrongResolution?.(ex, rat(-3))).toEqual({ lines: ['-12 \\div (-4)', '= -(12 \\div 4)', '= -3'], wrongLine: 1 });
    expect(mult?.wrongResolution?.(ex, rat(48))).toEqual({ lines: ['-12 \\div (-4)', '= +(12 \\times 4)', '= 48'], wrongLine: 1 });
    expect(table?.wrongResolution?.(ex, rat(4))).toEqual({ lines: ['-12 \\div (-4)', '= +(12 \\div 4)', '= 4'], wrongLine: 2 });
  });

  // Un test par message d'erreur : les phrases exactes sont dans l'instantané, ici on vérifie quel message sort pour quel cas.
  describe('explications affichées : un message par erreur prévisible', () => {
    const [regle, mult, table] = c06.errors;
    const msg = (e: typeof regle, display: string) => e!.explain(exOf(c06, display)).rule;
    it('familles', () => expect(c06.errors.map((e) => e.family)).toEqual(['signe', 'calcul', 'calcul']));
    it('deux négatifs : le quotient est positif, on vérifie par la multiplication', () => {
      expect(msg(regle, '−12 ÷ (−4)')).toMatch(/^Deux nombres négatifs divisés donnent un \*\*positif\*\*/);
      expect(msg(regle, '−12 ÷ (−4)')).toContain('3 × (−4) = −12');
    });
    it('deux positifs', () => expect(msg(regle, '12 ÷ 4')).toBe('Deux nombres positifs donnent un résultat **positif** : 12 ÷ 4 = 3.'));
    it('signe du dividende gardé (positif ÷ négatif)', () => expect(msg(regle, '24 ÷ (−6)')).toMatch(/^Tu as gardé le signe de 24\./));
    it('signe oublié (négatif ÷ positif)', () => expect(msg(regle, '−12 ÷ 4')).toMatch(/^Il manque le signe : −12 et 4/));
    it('multiplication au lieu de division', () =>
      expect(msg(mult, '−12 ÷ 4')).toBe("Ici, c'est une **division** : ÷ et pas ×. 12 ÷ 4 = 3, et non 12 × 4 = 48."));
    it('erreur de table : le signe est bon, on vérifie par la multiplication', () =>
      expect(msg(table, '−12 ÷ 4')).toBe('Le signe est bon ! Vérifie avec la multiplication : 3 × 4 = 12, donc 12 ÷ 4 = 3.'));
  });

  it('chaque erreur reconnue renvoie à sa règle (« Relire la règle N »)', () => {
    expect(c06.errors.map((e) => [e.id, e.rule])).toEqual([
      ['regle-signes', { n: 2, label: 'Le signe du quotient', partIndex: 2 }],
      ['multiplication-au-lieu-division', { n: 1, label: "Diviser, c'est chercher un facteur", partIndex: 1 }],
      ['erreur-table', { n: 3, label: 'Vérifier par la multiplication', partIndex: 3 }],
    ]);
    for (const e of c06.errors) {
      const p = c06.parts[e.rule!.partIndex];
      expect(p?.type === 'etapes' && p.title).toBe(e.rule!.label);
      expect(p?.type === 'etapes' && p.steps.find((s) => s.rule)?.rule?.n).toBe(e.rule!.n);
    }
  });

  it('générateur et calculs-pièges (1 000 tirages par niveau)', () =>
    propertyChecks(
      c06,
      fits,
      {
        'regle-signes': { holds: (ex) => ints(ex).every((x) => x < 0), wrong: (ex) => -ex.answer.n },
        'multiplication-au-lieu-division': {
          holds: (ex) => Math.abs(ex.answer.n) <= Q[ex.level][0] + 2,
          wrong: (ex) => Math.abs((ints(ex)[0] as number) * (ints(ex)[1] as number)),
        },
        'erreur-table': {
          holds: (ex) => Math.abs(ex.answer.n) >= 2,
          wrong: (ex) => ex.answer.n + Math.sign(ex.answer.n),
        },
      },
      606,
    ));

  it('signes mélangés : au moins un négatif 3 fois sur 4', () => {
    for (const level of [1, 2, 3] as Level[])
      expect(Math.abs(share(c06, level, 61 + level, (ex) => ints(ex).some((x) => x < 0)) - 0.75)).toBeLessThanOrEqual(TOLERANCE);
  });
});

describe('Cours 6 v2 — générateur sur 500 tirages par niveau', () => {
  const drawn = (level: Level, seed: number, n = 500): Exercise[] => {
    const r = seededRng(seed);
    return Array.from({ length: n }, () => c06.generate(level, r));
  };

  it.each([1, 2, 3] as Level[])('niveau %i : une division exacte, diviseur différent de 0, tailles', (level) => {
    for (const ex of drawn(level, 20 + level)) {
      expect(fits(ex, level), toLatex(ex.expr)).toBe(true);
      const [a, b] = ints(ex) as [number, number];
      expect(b).not.toBe(0);
      expect(a % b === 0).toBe(true);
      expect(ex.answer).toEqual(rat(a / b));
      expect(ex.answer.n).not.toBe(0);
      expect(ex.courseId).toBe(c06.id);
      expect(ex.level).toBe(level);
    }
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

describe('Cours 6 v2 — structure, note et leçon', () => {
  it('14 parties, types dans l’ordre', () => {
    expect(c06.parts.map((p) => (p.type === 'question' ? `${p.activity}:${p.question.kind}` : p.type))).toEqual([
      'decouverte:choix', 'etapes', 'etapes', 'etapes',
      'lecon:choix', 'lecon:choix', 'decouverte:choix', 'autres', 'pratique',
      'etapes', 'exemple:trou', 'decouverte:qcm', 'exemple:trou', 'etapes',
    ]);
  });

  it('13 questions notées : 2 petites, série (4), exemple 1 (1), exemple 2 (1), fins (5)', () => {
    const items = courseRunItems(c06, seededRng(3));
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

  it('la série de pratique : une question du Cours 5 (multiplication) parmi les 4', () => {
    const p = c06.parts[8];
    if (p?.type !== 'pratique') throw new Error('pratique');
    const kinds = p.questions.map((x) => x.question.kind);
    expect(kinds).toEqual(['trou', 'qcm', 'choix', 'saisie']);
    const c5 = p.questions[2]!.question;
    expect(c5.kind === 'choix' && opsOf(c5.ex.expr)).toEqual(['*']);
    expect(p.questions.filter((x) => 'ex' in x.question && opsOf(x.question.ex.expr)[0] === '/')).toHaveLength(3);
  });

  it('les exercices de fin : niveau 1, uniquement la division de deux relatifs', () => {
    const fins = courseRunItems(c06, seededRng(9)).filter((i) => i.type === 'question' && i.activity === 'fin');
    expect(fins).toHaveLength(5);
    for (const f of fins) {
      if (f.type !== 'question' || !('ex' in f.question)) throw new Error('question');
      expect(f.question.ex.level).toBe(1);
      expect(opsOf(f.question.ex.expr)).toEqual(['/']);
    }
  });

  it('7 écrans de leçon (la pastille « étape N sur 7 ») ; la série n’en fait pas partie', () => {
    expect(c06.lessonLength).toBe(8);
    expect(lessonStep(c06, 0)).toEqual({ n: 1, total: 7 });
    expect(lessonStep(c06, 3)).toEqual({ n: 4, total: 7 });
    expect(lessonStep(c06, 4)).toEqual({ n: 5, total: 7 });
    expect(lessonStep(c06, 5)).toEqual({ n: 5, total: 7 });
    expect(lessonStep(c06, 7)).toEqual({ n: 7, total: 7 });
    expect(lessonStep(c06, 8)).toBeNull();
  });

  it('12 écrans pour apprendre avant l’annonce de la fin ; jamais plus de 2 lectures d’affilée', () => {
    const before = c06.parts.slice(0, 13);
    expect(before.filter((p) => !(p.type === 'question' && p.joinPrevious)).length).toBe(12);
    for (const p of c06.parts) {
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
    for (const p of c06.parts.slice(1, 4)) {
      if (p.type !== 'etapes') throw new Error('etapes');
      for (const s of p.steps.filter((x) => x.action?.type === 'trou'))
        expect([...(s.after?.calcs ?? [])].some((c) => c.tokens.some((t) => t.hl))).toBe(true);
    }
  });
});

// ——— Retours d'erreur des questions qui comptent (un message par erreur prévisible) ———

const typed = (n: number): Answer => ({
  raw: { tokens: [...(n < 0 ? `-${-n}` : String(n))].map((c) => ({ t: 'c' as const, c: c as '-' })), cursor: 'root' as const },
});
const say = (q: Question, a: Answer): string | null => c06.feedbackText?.(q, checkAnswer(c06, q, a)) ?? null;
const saisieOf = (display: string): Question => ({ kind: 'saisie', ex: exOf(c06, display), promptLatex: '' }) as Question;

describe('Cours 6 v2 — feedbackText', () => {
  it.each([
    ['−12 ÷ 4', -3, 'Juste'],
    ['−12 ÷ 4', 3, 'Il manque le signe'],
    ['24 ÷ (−6)', 4, 'Tu as gardé le signe de 24'],
    ['−12 ÷ (−4)', -3, 'Deux nombres négatifs divisés donnent un **positif**'],
    ['−12 ÷ 4', -48, 'c\'est une **division**'],
    ['−12 ÷ 4', -4, 'Le signe est bon !'],
    ['−12 ÷ 4', -9, 'D\'abord les nombres sans leur signe : 12 ÷ 4 = 3'],
  ])('saisie %s = %i → message', (display, given, start) => {
    const m = say(saisieOf(display), typed(given));
    expect(m).not.toBeNull();
    if (start === 'Juste') expect(m).toBe('−12 ÷ 4 : signes contraires, le résultat est négatif. 12 ÷ 4 = 3, donc −3.');
    else expect(m).toContain(start);
  });

  it('séries de pratique : la case au signe déjà écrit', () => {
    const p = c06.parts[8];
    if (p?.type !== 'pratique') throw new Error('pratique');
    const q = p.questions[0]!.question;
    expect(say(q, typed(7))).toBe('63 ÷ 9 = 7, et le signe + est déjà écrit : 7.');
    expect(say(q, typed(-7))).toBe('Le signe est déjà trouvé, sur la ligne du dessus : même signe, le résultat est positif. 63 ÷ 9 = 7, donc 7.');
  });

  it('séries de pratique : le signe du résultat (touches + et −)', () => {
    const p = c06.parts[8];
    if (p?.type !== 'pratique') throw new Error('pratique');
    const q = p.questions[1]!.question;
    expect(say(q, { choice: 1 })).toContain('48 ÷ 6 = 8');
    const wrong = say(q, { choice: 0 });
    expect(wrong).toMatch(/^Tu as gardé le signe de 48/);
  });

  it('la question du Cours 5 : « −3 » (le quotient) et « 27 » (le signe oublié) ont chacun leur message', () => {
    const p = c06.parts[8];
    if (p?.type !== 'pratique') throw new Error('pratique');
    const q = p.questions[2]!.question;
    if (q.kind !== 'choix') throw new Error('choix');
    expect(q.options.map((o) => o.label)).toEqual(['−27', '−3', '27']);
    expect(q.options[1]!.why).toContain('tu as divisé');
    expect(q.options[2]!.why).toContain('il manque le signe');
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

describe('Cours 6 v2 — instantané des textes', () => {
  it('écrans de la leçon, phrase par phrase', () => {
    const out = c06.parts.map((p, i) => {
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
    const cases = ['−12 ÷ (−4)', '12 ÷ 4', '24 ÷ (−6)', '−12 ÷ 4', '−35 ÷ (−7)', '2208 ÷ (−24)'];
    const out = Object.fromEntries(c06.errors.map((e) => [e.id, cases.map((d) => `${d} : ${e.explain(exOf(c06, d)).rule}`)]));
    expect(out).toMatchSnapshot();
  });

  it('fiche mémo et règle', () => {
    expect({ rule: c06.rule, memo: c06.memo }).toMatchSnapshot();
  });
});
