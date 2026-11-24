import { describe, expect, it } from 'vitest';
import { atomize, c00, joinPieces, writingExercise, writingFaults } from '../../src/courses/calculs/c00-bien-ecrire';
import { lessonStep } from '../../src/courses/types';
import { checkAnswer } from '../../src/exercises/check';
import type { Exercise, Level } from '../../src/courses/types';
import type { Question } from '../../src/exercises/types';
import { type Expr, toLatex } from '../../src/math/expr';
import { seededRng } from '../../src/rng';
import { rat } from '../../src/math/rational';
import { diagnose, getCourse } from '../../src/courses';
import { DRAWS, LEVELS, TOLERANCE, opsOf, parseCalc, tex } from './helpers';

const tokens = (ex: Exercise): string[] => ex.meta?.tokens as string[];
const faultAt = (ex: Exercise): number | null => ex.meta?.faultAt as number | null;
const faultType = (ex: Exercise): string | null => ex.meta?.faultType as string | null;
const pieces = (...p: string[]): string[] => p.map(tex);
const leaves = (e: Expr): number[] => (e.k === 'num' ? [e.v.n] : e.k === 'op' ? [...leaves(e.a), ...leaves(e.b)] : leaves(e.a));

/** « Toucher la faute » question as customQuestion builds it: one box per symbol. */
function erreurOf(ex: Exercise): Extract<Question, { kind: 'erreur' }> {
  const at = faultAt(ex);
  const { symbols, accept } = atomize(tokens(ex), at === null ? null : { at, type: faultType(ex) as 'signes-colles' });
  return { kind: 'erreur', ex, lines: symbols, wrongLine: accept[0] ?? null, errorType: faultType(ex), accept, shownLatex: joinPieces(tokens(ex)) };
}

describe('Cours 0 — Bien écrire un calcul', () => {
  it('title, rule, end exercises, errors', () => {
    expect(c00.title).toBe('Bien écrire un calcul');
    expect(c00.order).toBe(0);
    expect(c00.rule).toBe(
      "Un calcul s'écrit d'une seule façon correcte : il faut savoir le lire et l'écrire sans ambiguïté.",
    );
    expect(c00.endExercises).toEqual({ count: 5, kind: 'erreur' });
    expect(c00.errors.map((e) => [e.id, e.family])).toEqual([
      ['signes-colles', 'ecriture'],
      ['parentheses-en-tete', 'ecriture'],
      ['moins-apres', 'ecriture'],
      ['parenthese', 'ecriture'],
    ]);
    expect(c00.errors.map((e) => e.rule)).toEqual([
      { n: 1, label: 'Deux signes qui se touchent', partIndex: 4 },
      { n: 2, label: 'Parenthèses inutiles en tête', partIndex: 7 },
      { n: 3, label: 'Moins après le nombre', partIndex: 8 },
      { n: 4, label: 'Parenthèse non fermée', partIndex: 11 },
    ]);
    const ex = writingExercise(parseCalc('4 × (−3)'), pieces('4', '× −', '3'), 1);
    expect(c00.errors.map((e) => e.explain(ex).rule)).toEqual([
      'Deux signes ne se suivent jamais : 4 × (−3).',
      "En tête du calcul, on n'écrit pas de parenthèses : −3 + 4.",
      "Le signe moins s'écrit avant le nombre : −3.",
      'Une parenthèse ouverte doit être fermée.',
    ]);
    expect(c00.classes.map((c) => c.label)).toEqual(['Bien écrit', 'Mal écrit']);
  });

  describe('exemples du doc 06', () => {
    const row1 = writingExercise(parseCalc('4 × (−3)'), pieces('4', '× −', '3'), 1);
    const row2 = writingExercise(parseCalc('4 × (−3)'), pieces('4', '×', '(', '−3', ')'), 1);
    const row3 = writingExercise(parseCalc('5 + (−2) × (−3)'), pieces('5', '+', '(', '−2', ')', '×', '3−'), 2);
    const row4 = writingExercise(parseCalc('−6 − (−2) × 4'), pieces('−6', '−', '(−2 × 4'), 2);

    it('the right answer is found from the writing', () => {
      expect([faultAt(row1), faultType(row1)]).toEqual([1, 'signes-colles']);
      expect([faultAt(row2), faultType(row2)]).toEqual([null, null]);
      expect([faultAt(row3), faultType(row3)]).toEqual([6, 'moins-apres']);
      expect([faultAt(row4), faultType(row4)]).toEqual([2, 'parenthese']);
    });

    it('4 × −3 : la case « × » ou la case « − » → juste', () => {
      const q = erreurOf(row1);
      expect(q.lines).toEqual(['4', '\\times', '-', '3']);
      expect(c00.customCheck?.(q, { line: 2 })).toMatchObject({ correct: true, errorType: null, errorFamily: null });
      expect(c00.customCheck?.(q, { line: 1 })).toMatchObject({ correct: true, errorType: null });
      expect(c00.customCheck?.(q, { line: 0 })).toMatchObject({ correct: false, errorType: 'signes-colles', errorFamily: 'ecriture' });
    });
    it('4 × (−3) : touche « × » → relecture', () => {
      const o = c00.customCheck?.(erreurOf(row2), { line: 1 });
      expect(o).toMatchObject({ correct: false, errorType: 'relecture', given: '\\times', expected: 'Tout est bien écrit' });
      expect(c00.customCheck?.(erreurOf(row2), { line: null })).toMatchObject({ correct: true });
    });
    it('5 + (−2) × 3− : « Tout est bien écrit » → moins-apres', () => {
      const o = c00.customCheck?.(erreurOf(row3), { line: null });
      expect(o).toMatchObject({ correct: false, errorType: 'moins-apres', errorFamily: 'ecriture', given: 'Tout est bien écrit', expected: '-' });
    });
    it('−6 − (−2 × 4 : la case « ( » non fermée → juste', () => {
      const q = erreurOf(row4);
      expect(q.lines).toEqual(['-', '6', '-', '(', '-', '2', '\\times', '4']);
      expect(q.accept).toEqual([3]);
      expect(c00.customCheck?.(q, { line: 3 })).toMatchObject({ correct: true, errorType: null });
    });
  });

  it('diagnose does not apply (no numeric answer)', () => {
    const ex = c00.generate(1, seededRng(9));
    expect(diagnose(c00, ex, rat(5))).toBeNull();
  });

  it('(−3) + 5 is never a fault', () => {
    expect(writingFaults(pieces('(', '−3', ')', '+', '5'))).toEqual([]);
    expect(writingExercise(parseCalc('−3 + 5'), pieces('(', '−3', ')', '+', '5'), 1).meta?.faultAt).toBeNull();
  });

  it('lesson writings: 5 + −2 and 3− + 4 and 7 − −1 = 8', () => {
    expect(writingFaults(pieces('5', '+ −', '2'))).toEqual([{ at: 1, type: 'signes-colles' }]);
    expect(writingFaults(pieces('5', '+', '−2'))).toEqual([{ at: 1, type: 'signes-colles' }]);
    expect(writingFaults(pieces('3−', '+', '4'))).toEqual([{ at: 0, type: 'moins-apres' }]);
    expect(writingFaults(pieces('7', '− −', '1', '=', '8'))).toEqual([{ at: 1, type: 'signes-colles' }]);
    expect(writingFaults(pieces('−3', ')', '+', '5'))).toEqual([{ at: 1, type: 'parenthese' }]);
  });

  it('générateur : 1 000 tirages par niveau, faute unique et reconnue', () => {
    const rng = seededRng(1000);
    for (const level of LEVELS) {
      let wellWritten = 0;
      for (let i = 0; i < DRAWS; i++) {
        const ex = c00.generate(level, rng);
        expect(ex.courseId).toBe(c00.id);
        expect(ex.level).toBe(level);
        const ops = opsOf(ex.expr).length;
        const shown = toLatex(ex.expr);
        if (level === 1) expect(ops).toBe(1);
        if (level === 2) expect(ops).toBe(2);
        if (level === 3) expect(ops).toBeGreaterThanOrEqual(3);
        const groupParens = /\((?!-\d+\))/.test(shown);
        expect(groupParens, shown).toBe(level === 3);
        expect(leaves(ex.expr).every((n) => Math.abs(n) >= 1 && Math.abs(n) <= 9)).toBe(true);
        expect(leaves(ex.expr).some((n) => n < 0)).toBe(true);
        const expected = faultAt(ex) === null ? [] : [{ at: faultAt(ex), type: faultType(ex) }];
        expect(writingFaults(tokens(ex)), joinPieces(tokens(ex))).toEqual(expected);
        expect(c00.resolution(ex)).toEqual(erreurOf(ex).lines);
        if (faultAt(ex) === null) {
          wellWritten++;
          expect(joinPieces(tokens(ex))).toBe(shown);
        }
      }
      expect(Math.abs(wellWritten / DRAWS - 0.2)).toBeLessThanOrEqual(TOLERANCE);
    }
  });

  it('every fault type shows up at every level', () => {
    const rng = seededRng(1001);
    for (const level of LEVELS) {
      const seen = new Set<string | null>();
      for (let i = 0; i < 300; i++) seen.add(faultType(c00.generate(level, rng)));
      expect([...seen].sort()).toEqual(['moins-apres', 'parenthese', 'signes-colles', null].sort());
    }
  });

  it('calculs-pièges', () => {
    const rng = seededRng(1002);
    for (const level of LEVELS)
      for (const err of c00.errors)
        for (let i = 0; i < DRAWS; i++) {
          const ex = err.trap(level, rng);
          expect(ex.level).toBe(level);
          // « parentheses-en-tete » n'est jamais produite par le générateur : son piège (Réécris) est un négatif en tête mal écrit
          const made = err.id === 'parentheses-en-tete' ? 'moins-apres' : err.id;
          expect(faultType(ex)).toBe(made);
          expect(writingFaults(tokens(ex))).toEqual([{ at: faultAt(ex), type: made }]);
          const piece = tokens(ex)[faultAt(ex) as number] as string;
          if (err.id === 'signes-colles') expect(piece).toMatch(/^\\(times|div) -$/);
          if (made === 'moins-apres') expect(faultAt(ex)).toBe(0);
          if (err.id === 'parenthese') expect(piece).toMatch(/^\(/);
          expect(err.wrongValues(ex)).toEqual([]);
        }
  });

  describe('questions', () => {
    const ctx = (level: Level, seed: number, trapErrorType?: string) => ({ rng: seededRng(seed), level, timesSeen: 0, trapErrorType });

    it('Toucher la faute : une case par symbole, les cases acceptées sont celles de la faute (500 tirages)', () => {
      const SYMBOL = /^(\\times|\\div|\+|-|\(|\)|\d+)$/;
      const traps = [undefined, 'signes-colles', 'moins-apres', 'parenthese'];
      const c = ctx(1, 2000);
      for (let i = 0; i < 500; i++) {
        const level = LEVELS[i % 3] as Level;
        const q = c00.customQuestion?.('erreur', { ...c, level, trapErrorType: traps[i % 4] });
        if (q?.kind !== 'erreur') throw new Error('erreur');
        const accept = q.accept as number[];
        expect(accept, joinPieces(tokens(q.ex))).toBeDefined();
        expect(accept.length > 0).toBe(q.wrongLine !== null);
        expect(q.wrongLine).toBe(accept[0] ?? null);
        expect(q.errorType).toBe(faultType(q.ex));
        expect(q.shownLatex).toBe(joinPieces(tokens(q.ex)));
        // un nombre = une case, jamais de signe collé à un nombre
        expect(q.lines.every((l) => SYMBOL.test(l)), q.lines.join(' ')).toBe(true);
        expect(q.lines.filter((l) => /^\d+$/.test(l)).length).toBe(tokens(q.ex).join(' ').match(/\d+/g)?.length);
        for (const k of accept) expect(q.lines[k]).toMatch(/^(\\times|\\div|\+|-|\(|\))$/);
        const type = faultType(q.ex);
        if (type === 'signes-colles') {
          expect(accept).toHaveLength(2);
          expect(accept[1]).toBe((accept[0] as number) + 1);
          expect(q.lines[accept[0] as number]).toMatch(/^(\\times|\\div|\+|-)$/);
          expect(q.lines[accept[1] as number]).toBe('-');
        }
        if (type === 'moins-apres') {
          expect(accept).toHaveLength(1);
          expect(q.lines[accept[0] as number]).toBe('-');
          expect(q.lines[(accept[0] as number) - 1]).toMatch(/^\d+$/);
        }
        if (type === 'parenthese') {
          expect(accept).toHaveLength(1);
          expect(q.lines[accept[0] as number]).toMatch(/^[()]$/);
          // la case acceptée est bien celle qui n'a pas sa pareille
          const open = q.lines.filter((l) => l === '(').length;
          const close = q.lines.filter((l) => l === ')').length;
          expect(q.lines[accept[0] as number]).toBe(open > close ? '(' : ')');
        }
        if (type === null) expect(accept).toEqual([]);
      }
      const q = c00.customQuestion?.('erreur', ctx(2, 7, 'moins-apres'));
      expect(q?.kind === 'erreur' && q.errorType).toBe('moins-apres');
    });

    it('atomize : un nombre = une case, chaque signe et parenthèse = une case', () => {
      expect(atomize(['4', '\\times -', '3'], { at: 1, type: 'signes-colles' })).toEqual({ symbols: ['4', '\\times', '-', '3'], accept: [1, 2] });
      expect(atomize(['3-', '+', '4'], { at: 0, type: 'moins-apres' })).toEqual({ symbols: ['3', '-', '+', '4'], accept: [1] });
      expect(atomize(['4', '\\times', '(', '-3', ')'], null)).toEqual({ symbols: ['4', '\\times', '(', '-', '3', ')'], accept: [] });
      expect(atomize(['12', '+', '(', '-34', ')'], null).symbols).toEqual(['12', '+', '(', '-', '34', ')']);
      expect(atomize(['4', '\\times', '(-3'], { at: 2, type: 'parenthese' })).toEqual({ symbols: ['4', '\\times', '(', '-', '3'], accept: [2] });
      expect(atomize(['4', '\\times', '-3', ')'], { at: 3, type: 'parenthese' }).accept).toEqual([4]);
    });

    it('Quelle règle ? (généré) : 3 options fixes, la bonne selon la faute réelle', () => {
      const c = ctx(1, 2500);
      const labels = ['Deux signes se touchent', 'Le moins est après le nombre', "Une parenthèse n'est pas fermée"];
      for (let i = 0; i < 300; i++) {
        const q = c00.customQuestion?.('choix', { ...c, level: LEVELS[i % 3] as Level });
        if (q?.kind !== 'choix') throw new Error('choix');
        expect(q.prompt).toBe("Ce calcul est mal écrit. Quelle règle n'est pas respectée ?");
        expect(q.options.map((o) => o.label)).toEqual(labels);
        expect(q.calcLatex).toBe(joinPieces(tokens(q.ex)));
        const type = faultType(q.ex);
        expect(q.correctIndex).toBe(['signes-colles', 'moins-apres', 'parenthese'].indexOf(type as string));
        expect(q.options.every((o) => o.why.length > 0)).toBe(true);
        expect(checkAnswer(c00, q, { choice: q.correctIndex })).toMatchObject({ correct: true });
        const wrongIndex = (q.correctIndex + 1) % 3;
        expect(checkAnswer(c00, q, { choice: wrongIndex })).toMatchObject({ correct: false, message: q.options[wrongIndex]?.why });
      }
    });

    it('Réécris correctement (généré) : bonne réponse, écriture fautive affichée, parenthèses en tête, nombres changés', () => {
      const c = ctx(1, 2600);
      let sawHead = false;
      for (let i = 0; i < 300; i++) {
        const q = c00.customQuestion?.('reecrire', { ...c, level: LEVELS[i % 3] as Level });
        if (q?.kind !== 'reecrire') throw new Error('reecrire');
        const type = faultType(q.ex);
        expect(type).not.toBeNull();
        expect(q.givenLatex).toBe(joinPieces(tokens(q.ex)));
        expect(q.steps).toHaveLength(3);
        expect(checkAnswer(c00, q, { text: q.expected })).toMatchObject({ correct: true });
        expect(checkAnswer(c00, q, { text: ` ${q.expected.replace(/×/g, ' x ')} ` })).toMatchObject({ correct: true });
        const shown = q.givenLatex.replace(/\\times ?/g, '×').replace(/\\div ?/g, '÷');
        const o = checkAnswer(c00, q, { text: shown });
        expect(o, shown).toMatchObject({ correct: false, errorType: type, errorFamily: 'ecriture' });
        expect(o.message).toBeTruthy();
        const head = q.expected.match(/^−(\d+)(?=[+−×÷]|$)/);
        if (head) {
          sawHead = true;
          const withParens = q.expected.replace(/^−\d+/, `(−${head[1]})`);
          expect(checkAnswer(c00, q, { text: withParens })).toMatchObject({ correct: false, errorType: 'parentheses-en-tete', errorFamily: 'ecriture' });
        }
        // même écriture, mais un nombre change
        const changed = q.expected.replace(/\d+/, (d) => String(Number(d) + 10));
        expect(checkAnswer(c00, q, { text: changed })).toMatchObject({ correct: false, errorType: null, message: 'Garde les mêmes nombres.' });
        // un « = » final isolé ne change pas le diagnostic
        expect(checkAnswer(c00, q, { text: `${q.expected}=` })).toMatchObject({ correct: true });
        expect(checkAnswer(c00, q, { text: `${changed}=` })).toMatchObject({ correct: false, errorType: null, message: 'Garde les mêmes nombres.' });
      }
      expect(sawHead).toBe(true);
    });

    it('QCM « Lequel est bien écrit ? » : 4 écritures, une seule correcte', () => {
      for (const level of LEVELS) {
        const c = ctx(level, 3000 + level);
        for (let i = 0; i < DRAWS; i++) {
          const q = c00.customQuestion?.('qcm', c);
          if (q?.kind !== 'qcm') throw new Error('qcm');
          expect(q.choices).toHaveLength(4);
          expect(new Set(q.choices.map((ch) => ch.latex)).size).toBe(4);
          expect(q.choices.filter((ch) => ch.errorType === null)).toHaveLength(1);
          expect(q.choices[q.correctIndex]?.errorType).toBeNull();
          expect(q.choices[q.correctIndex]?.latex).toBe(toLatex(q.ex.expr));
          expect(q.choices.every((ch) => ch.latex !== '(' + toLatex(q.ex.expr))).toBe(true);
        }
      }
      const q = c00.customQuestion?.('qcm', ctx(1, 5));
      if (q?.kind !== 'qcm') throw new Error('qcm');
      const wrong = q.choices.findIndex((ch) => ch.errorType !== null);
      expect(c00.customCheck?.(q, { choice: q.correctIndex })).toMatchObject({ correct: true });
      expect(c00.customCheck?.(q, { choice: wrong })).toMatchObject({
        correct: false,
        errorType: q.choices[wrong]?.errorType,
        errorFamily: 'ecriture',
      });
    });

    it('piège « parenthese » aux niveaux 1 et 2 : une parenthèse ouverte autour d’un négatif, jamais fermée (doc 07 #7A)', () => {
      for (const level of [1, 2] as const)
        for (let i = 0; i < DRAWS; i++) {
          const ex = c00.errors.find((e) => e.id === 'parenthese')!.trap(level, seededRng(5000 + i));
          const pieces = ex.meta?.tokens as string[];
          const at = ex.meta?.faultAt as number;
          expect(ex.level).toBe(level);
          expect(ex.meta?.faultType).toBe('parenthese');
          expect(pieces[at]).toMatch(/^\(-\d/); // « (−3 » : ouverte autour d’un négatif
        }
    });

    it('QCM avec un piège (doc 01 §5) : une des écritures fausses fait cette faute-là', () => {
      for (const trap of ['signes-colles', 'moins-apres', 'parenthese'])
        for (const level of LEVELS) {
          const c = ctx(level, 4000 + level, trap);
          for (let i = 0; i < DRAWS; i++) {
            const q = c00.customQuestion?.('qcm', c);
            if (q?.kind !== 'qcm') throw new Error('qcm');
            expect(q.choices.filter((ch) => ch.errorType === null)).toHaveLength(1);
            expect(q.choices.some((ch) => ch.errorType === trap)).toBe(true);
          }
        }
    });

    it('Classer bien écrit / mal écrit', () => {
      for (const level of LEVELS) {
        const c = ctx(level, 4000 + level);
        for (let i = 0; i < DRAWS; i++) {
          const q = c00.customQuestion?.('classer', c);
          if (q?.kind !== 'classer') throw new Error('classer');
          expect(q.exs).toHaveLength(4);
          expect(q.classes.map((k) => k.id)).toEqual(['bien', 'mal']);
          expect(q.expected).toEqual(q.exs.map((e) => (faultAt(e) === null ? 'bien' : 'mal')));
          expect(new Set(q.expected).size).toBe(2);
          expect(new Set(q.exs.map((e) => joinPieces(tokens(e)))).size).toBe(4);
        }
      }
      const q = c00.customQuestion?.('classer', ctx(1, 6));
      if (q?.kind !== 'classer') throw new Error('classer');
      expect(c00.customCheck?.(q, { classes: q.expected })).toMatchObject({ correct: true });
      const firstMal = q.expected.indexOf('mal');
      const swapped = q.expected.map((k, i) => (i === firstMal ? 'bien' : k));
      expect(c00.customCheck?.(q, { classes: swapped })).toMatchObject({
        correct: false,
        errorType: faultType(q.exs[firstMal] as Exercise),
        errorFamily: 'ecriture',
      });
      const firstBien = q.expected.indexOf('bien');
      const swapped2 = q.expected.map((k, i) => (i === firstBien ? 'mal' : k));
      expect(c00.customCheck?.(q, { classes: swapped2 })).toMatchObject({ correct: false, errorType: 'relecture' });
    });

    it('other kinds use the generic builder', () => {
      for (const kind of ['saisie', 'trou', 'ordre', 'paires', 'vraifaux'] as const)
        expect(c00.customQuestion?.(kind, ctx(1, 1))).toBeNull();
      const q = c00.customQuestion?.('erreur', ctx(1, 1)) as Question;
      expect(c00.customCheck?.(q, { choice: 0 })).toBeNull();
    });
  });

  it('règle 2 : « (−3) + 5 : pas faux, mais inutile » (doc 07 #8A), sans symbole « ~ »', () => {
    const p = c00.parts[7];
    if (p?.type !== 'question') throw new Error('question');
    expect(p.activity).toBe('decouverte');
    expect(p.outro).toEqual(['(−3) + 5 : pas faux, mais inutile']);
    expect(p.outroRule).toEqual({ n: 2, text: "**En tête d'un calcul, pas de parenthèses** pour un nombre négatif." });
  });

  it('leçon : 19 parties dans l’ordre du plan', () => {
    expect(c00.parts).toHaveLength(19);
    expect(c00.lessonLength).toBe(14);
    const kinds = c00.parts.map((p) => (p.type === 'question' ? `${p.activity}:${p.question.kind}` : p.type));
    expect(kinds).toEqual([
      'decouverte:choix', 'etapes', 'lecon:choix', 'lecon:choix', 'etapes', 'etapes', 'lecon:choix', 'decouverte:choix',
      'etapes', 'lecon:choix', 'lecon:choix', 'etapes', 'lecon:choix', 'etapes', 'lecon:classer', 'lecon:choix',
      'exemple:reecrire', 'exemple:reecrire', 'etapes',
    ]);
    expect(c00.parts[4]?.type).toBe('etapes');
    const joined = c00.parts.flatMap((p, i) => (p.type === 'question' && p.joinPrevious ? [i] : []));
    expect(joined).toEqual([3, 10]);
    expect(lessonStep(c00, 0)).toEqual({ n: 1, total: 12 });
    expect(lessonStep(c00, 2)).toEqual({ n: 3, total: 12 });
    expect(lessonStep(c00, 3)).toEqual({ n: 3, total: 12 });
    expect(lessonStep(c00, 4)).toEqual({ n: 4, total: 12 });
    expect(lessonStep(c00, 10)).toEqual({ n: 9, total: 12 });
    expect(lessonStep(c00, 13)).toEqual({ n: 12, total: 12 });
    expect(lessonStep(c00, 14)).toBeNull();
    expect(lessonStep(getCourse('c04-soustraire'), 0)).toBeNull();
  });

  it('leçon : textes du doc 06, mot pour mot', () => {
    const part = (i: number) => c00.parts[i] as Extract<(typeof c00.parts)[number], { type: 'question' }>;
    const choix = (i: number) => {
      const q = part(i).question;
      if (q.kind !== 'choix') throw new Error('choix');
      return q;
    };
    const etapes = (i: number) => c00.parts[i] as Extract<(typeof c00.parts)[number], { type: 'etapes' }>;
    expect(part(0).title).toBe('Bien écrire un calcul');
    expect(part(0).intro).toEqual([
      "En maths, un calcul doit se lire **d'une seule façon**. S'il est mal écrit, on peut se tromper même en connaissant la méthode.",
      "Dans ce cours, tu vas apprendre **4 règles d'écriture**.",
    ]);
    expect(choix(0).prompt).toBe('Pour commencer, à ton avis : ce calcul est-il bien écrit ?');
    expect(choix(0).options.map((o) => o.label)).toEqual(['Oui', 'Non']);
    expect(choix(0).correctIndex).toBe(1);
    expect(choix(0).options[0]?.why).toBe("Il est mal écrit. Ce n'est pas grave de ne pas le savoir encore : c'est justement ce que ce cours explique.");
    expect(etapes(1).title).toBe('Le signe − a deux rôles');
    expect(etapes(1).steps).toHaveLength(4);
    expect(etapes(4).steps).toHaveLength(5);
    expect(etapes(4).steps[4]?.rule).toEqual({ n: 1, text: '**Deux signes ne se suivent jamais.** Après +, −, × ou ÷, un nombre négatif se met entre parenthèses.' });
    expect(etapes(5).steps).toHaveLength(4);
    expect(etapes(8).steps).toHaveLength(5);
    expect(etapes(8).steps[3]?.scene?.calcs[0]?.tokens[0]).toEqual({ t: '−', hl: true, anim: 'slide' });
    expect(etapes(11).steps).toHaveLength(5);
    expect(etapes(13).steps[0]?.recap).toHaveLength(4);
    expect(choix(2).prompt).toBe('Dans ce calcul, à quoi sert le − ?');
    expect(choix(2).options[1]?.why).toBe("Ici le − est entre deux nombres : on enlève 5 à 8. C'est une soustraction.");
    expect(choix(3).options[0]?.why).toBe("Il n'y a rien avant le − : on ne peut rien soustraire. C'est le signe du nombre −6.");
    expect(choix(6).options.map((o) => o.label)).toEqual(['(5 + −2)', '5 + (−2)', '5 (+ −2)']);
    expect(choix(6).options[2]?.why).toBe('Le + est une opération : il reste en dehors. Seul le nombre négatif −2 va entre parenthèses.');
    expect(choix(9).options.map((o) => o.label)).toEqual(['avant le nombre', 'après le nombre']);
    expect(choix(10).options.map((o) => o.label)).toEqual(['7−', '−7']);
    expect(choix(12).options.map((o) => o.label)).toEqual(['(', ')', '−']);
    expect(choix(12).options[0]?.why).toBe('Une parenthèse est déjà ouverte. Il manque celle qui la ferme : « ) ».');
    expect(choix(15).options.map((o) => o.label)).toEqual(['Deux signes se touchent', 'Le moins est après le nombre', "Une parenthèse n'est pas fermée"]);
    expect(choix(15).calcLatex).toBe('7 - -1 = 8');
    expect(part(15).outro).toEqual(['On le corrige : 7 − (−1) = 8']);
  });

  it('Classer : 4 calculs, « 3− + 4 » affiché 3- + 4', () => {
    const classer = c00.parts[14];
    if (classer?.type !== 'question' || classer.question.kind !== 'classer') throw new Error('classer');
    expect(classer.consigne).toBe("Fais glisser chaque calcul du bas de l'écran vers la bonne case. Tu peux aussi toucher un calcul, puis toucher la case.");
    expect(classer.question.exs.map((e) => joinPieces(tokens(e)))).toEqual(['4 \\times (-3)', '5 + -2', '-3 + 5', '3- + 4']);
    expect(classer.question.expected).toEqual(['bien', 'mal', 'bien', 'mal']);
  });

  describe('exemples guidés « Réécris »', () => {
    const reecrire = (i: number) => {
      const p = c00.parts[i];
      if (p?.type !== 'question' || p.question.kind !== 'reecrire') throw new Error('reecrire');
      return p.question;
    };
    const check = (i: number, text: string) => checkAnswer(c00, reecrire(i), { text });

    it('Réécris 6 × −2', () => {
      expect(reecrire(16).expected).toBe('6×(−2)');
      expect(check(16, '6 × (−2)')).toMatchObject({ correct: true });
      expect(check(16, '6*(-2)')).toMatchObject({ correct: true });
      expect(check(16, '6×-2')).toMatchObject({ correct: false, errorType: 'signes-colles', message: 'Le × et le − se touchent encore. Mets −2 entre parenthèses.' });
      expect(check(16, '6×(−2')).toMatchObject({ correct: false, errorType: 'parenthese', message: 'La parenthèse ouverte doit se fermer.' });
      expect(check(16, '6×(2−)')).toMatchObject({ errorType: 'moins-apres', message: 'Le signe − se met avant le 2.' });
      expect(check(16, '6×2−')).toMatchObject({ message: 'Le signe − se met avant le 2.' });
      expect(check(16, '6×(−5)')).toMatchObject({ correct: false, message: "L'écriture est bonne, mais le nombre a changé. Garde −2." });
      expect(check(16, '6×(−35)')).toMatchObject({ message: "L'écriture est bonne, mais le nombre a changé. Garde −2." });
      expect(check(16, '(6×−2)')).toMatchObject({ message: 'Les parenthèses doivent entourer le nombre négatif, pas tout le calcul.' });
      expect(check(16, '7')).toMatchObject({ correct: false, errorType: null, message: 'Garde le même calcul, et mets le nombre négatif entre parenthèses.' });
      expect(reecrire(16).steps).toEqual([
        'Repère les deux signes qui se touchent : × et −.',
        'Mets le nombre négatif entre parenthèses : (−2).',
        'Le calcul bien écrit : 6 × (−2).',
      ]);
    });

    it('Réécris 3− + 4', () => {
      expect(reecrire(17).givenLatex).toBe('3- + 4');
      expect(check(17, '-3+4')).toMatchObject({ correct: true });
      expect(check(17, '−3 + 4')).toMatchObject({ correct: true });
      expect(check(17, '(-3)+4')).toMatchObject({
        correct: false,
        errorType: 'parentheses-en-tete',
        message: "Pas tout à fait. En tête du calcul, on n'écrit pas de parenthèses : −3 + 4.",
      });
      expect(check(17, '3-+4')).toMatchObject({ errorType: 'moins-apres', message: 'Le − est toujours après le 3. Il doit aller devant.' });
      expect(check(17, '3+4')).toMatchObject({ message: 'Le 3 est négatif : garde son signe −, devant le nombre.' });
      expect(check(17, '+3+4')).toMatchObject({ message: 'Le 3 est négatif : garde son signe −, devant le nombre.' });
      expect(check(17, '8')).toMatchObject({ message: 'Garde les mêmes nombres. Le signe − va devant le 3.' });
      expect(reecrire(17).steps).toEqual([
        'Le signe − est après le 3 : il doit aller devant.',
        'Le nombre négatif est en tête du calcul : pas besoin de parenthèses.',
        'Le calcul bien écrit : −3 + 4.',
      ]);
    });
  });

  it('annonce de la fin', () => {
    const p = c00.parts[18];
    if (p?.type !== 'etapes') throw new Error('etapes');
    expect(p.title).toBe('Place aux 5 exercices de fin');
    expect(p.steps.map((s) => s.text).join(' ')).toContain('au moins **4 exercices de fin justes sur 5**');
  });
});
