import { describe, expect, it } from 'vitest';
import { c00, joinPieces, writingExercise, writingFaults } from '../../src/courses/calculs/c00-bien-ecrire';
import type { Exercise, Level } from '../../src/courses/types';
import type { Question } from '../../src/exercises/types';
import { type Expr, toLatex } from '../../src/math/expr';
import { seededRng } from '../../src/rng';
import { DRAWS, LEVELS, TOLERANCE, opsOf, parseCalc, tex } from './helpers';

const tokens = (ex: Exercise): string[] => ex.meta?.tokens as string[];
const faultAt = (ex: Exercise): number | null => ex.meta?.faultAt as number | null;
const faultType = (ex: Exercise): string | null => ex.meta?.faultType as string | null;
const pieces = (...p: string[]): string[] => p.map(tex);
const leaves = (e: Expr): number[] => (e.k === 'num' ? [e.v.n] : e.k === 'op' ? [...leaves(e.a), ...leaves(e.b)] : leaves(e.a));

function erreurOf(ex: Exercise): Extract<Question, { kind: 'erreur' }> {
  return { kind: 'erreur', ex, lines: c00.resolution(ex), wrongLine: faultAt(ex), errorType: faultType(ex) };
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
      ['moins-apres', 'ecriture'],
      ['parenthese', 'ecriture'],
    ]);
    const ex = writingExercise(parseCalc('4 × (−3)'), pieces('4', '× −', '3'), 1);
    expect(c00.errors.map((e) => e.explain(ex).rule)).toEqual([
      'Deux signes ne se suivent jamais : 4 × (−3).',
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

    it('4 × −3 : touches « × − » → juste', () => {
      const o = c00.customCheck?.(erreurOf(row1), { line: 1 });
      expect(o).toMatchObject({ correct: true, errorType: null, errorFamily: null });
    });
    it('4 × (−3) : touches « × » → relecture', () => {
      const o = c00.customCheck?.(erreurOf(row2), { line: 1 });
      expect(o).toMatchObject({ correct: false, errorType: 'relecture', given: '\\times', expected: 'Tout est bien écrit' });
    });
    it('5 + (−2) × 3− : « Tout est bien écrit » → moins-apres', () => {
      const o = c00.customCheck?.(erreurOf(row3), { line: null });
      expect(o).toMatchObject({ correct: false, errorType: 'moins-apres', errorFamily: 'ecriture', given: 'Tout est bien écrit', expected: '3-' });
    });
    it('−6 − (−2 × 4 : touches « (−2 × 4 » → juste', () => {
      expect(c00.customCheck?.(erreurOf(row4), { line: 2 })).toMatchObject({ correct: true, errorType: null });
    });
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
        expect(c00.resolution(ex)).toEqual(tokens(ex));
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
          expect(faultType(ex)).toBe(err.id);
          expect(writingFaults(tokens(ex))).toEqual([{ at: faultAt(ex), type: err.id }]);
          const piece = tokens(ex)[faultAt(ex) as number] as string;
          if (err.id === 'signes-colles') expect(piece).toMatch(/^\\(times|div) -$/);
          if (err.id === 'moins-apres') expect(faultAt(ex)).toBe(0);
          if (err.id === 'parenthese') expect(piece).toMatch(/^\(/);
          expect(err.detect(ex, ex.answer)).toBe(true);
        }
  });

  describe('questions', () => {
    const ctx = (level: Level, seed: number, trapErrorType?: string) => ({ rng: seededRng(seed), level, timesSeen: 0, trapErrorType });

    it('Trouver l’erreur d’écriture', () => {
      for (const level of LEVELS) {
        const c = ctx(level, 2000 + level);
        for (let i = 0; i < 200; i++) {
          const q = c00.customQuestion?.('erreur', c);
          if (q?.kind !== 'erreur') throw new Error('erreur');
          expect(q.lines).toEqual(tokens(q.ex));
          expect(q.wrongLine).toBe(faultAt(q.ex));
          expect(q.errorType).toBe(faultType(q.ex));
        }
      }
      const q = c00.customQuestion?.('erreur', ctx(2, 7, 'moins-apres'));
      expect(q?.kind === 'erreur' && q.errorType).toBe('moins-apres');
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

  it('leçon : déroulé', () => {
    const kinds = c00.parts.map((p) => (p.type === 'explication' ? 'explication' : `${p.activity}:${p.question.kind}`));
    expect(kinds).toEqual([
      'explication', 'explication', 'explication', 'explication', 'explication',
      'lecon:classer', 'lecon:erreur', 'exemple:trou', 'exemple:trou',
    ]);
    const classer = c00.parts[5];
    if (classer?.type !== 'question' || classer.question.kind !== 'classer') throw new Error('classer');
    expect(classer.question.exs.map((e) => joinPieces(tokens(e)))).toEqual(['4 \\times (-3)', '5 + -2', '-3 + 5', '3- + 4']);
    expect(classer.question.expected).toEqual(['bien', 'mal', 'bien', 'mal']);
    const erreur = c00.parts[6];
    if (erreur?.type !== 'question' || erreur.question.kind !== 'erreur') throw new Error('erreur');
    expect(erreur.question.lines).toEqual(pieces('7', '− −', '1', '=', '8'));
    expect(erreur.question.wrongLine).toBe(1);
    const hidden = [7, 8].map((i) => {
      const p = c00.parts[i];
      return p?.type === 'question' && p.question.kind === 'trou' ? [p.question.promptLatex, p.question.hidden.n] : null;
    });
    expect(hidden).toEqual([
      ['6 \\times (\\square)', -2],
      ['9 + (\\square)', -4],
    ]);
  });
});
