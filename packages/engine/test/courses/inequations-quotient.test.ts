import { describe, expect, it } from 'vitest';
import { inequationsQuotient as c } from '../../src/courses/essais/inequations-quotient';
import { checkAnswer, courseRunItems, diagnose } from '../../src';
import { type Factor, expectedGrid, factorRoot } from '../../src/math/tableau';
import type { Interval } from '../../src/math/intervalle';
import { eqRat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import type { Outcome, Question } from '../../src/exercises/types';
import type { Exercise, Level } from '../../src/courses/types';

type M = { f1: Factor; f2: Factor };
const meta = (ex: Exercise): M => ex.meta as unknown as M;
const bounded = (v: number, [lo, hi]: [number, number]): boolean => Math.abs(v) >= lo && Math.abs(v) <= hi;
const txt = (r: { n: number; d: number }): string => (r.d === 1 ? String(r.n) : `${r.n}/${r.d}`).replace('-', '−');
const input = (e: Interval) => ({
  left: e.loClosed ? ('[' as const) : (']' as const),
  lo: e.lo === null ? '−∞' : txt(e.lo),
  hi: e.hi === null ? '+∞' : txt(e.hi),
  right: e.hiClosed ? (']' as const) : ('[' as const),
});

describe('Cours 11 — Quotient et valeur interdite', () => {
  it('générateur : deux valeurs distinctes, a ≠ 0, entières aux niveaux 1 et 2 (1 000 tirages par niveau) ; la réponse est la valeur interdite', () => {
    const A: Record<Level, [number, number]> = { 1: [1, 2], 2: [1, 4], 3: [2, 5] };
    for (const level of [1, 2, 3] as Level[]) {
      const rng = seededRng(42);
      let frac = 0;
      for (let i = 0; i < 1000; i++) {
        const ex = c.generate(level, rng);
        const { f1, f2 } = meta(ex);
        expect(ex.level).toBe(level);
        expect(bounded(f1.a, A[level]) && bounded(f2.a, A[level])).toBe(true);
        expect(eqRat(factorRoot(f1), factorRoot(f2))).toBe(false);
        if (factorRoot(f1).d !== 1 || factorRoot(f2).d !== 1) frac++;
        expect(ex.answer).toEqual(factorRoot(f2));
      }
      if (level < 3) expect(frac).toBe(0);
      else expect(frac).toBeGreaterThan(0);
    }
  });

  it('piège « valeurs » : la valeur sans le changement de signe est reconnue', () => {
    for (const level of [1, 2, 3] as Level[]) {
      const rng = seededRng(7);
      const err = c.errors.find((e) => e.id === 'valeurs')!;
      for (let i = 0; i < 200; i++) {
        const ex = err.trap(level, rng);
        const wrong = err.wrongValues(ex)[0]!;
        expect(diagnose(c, ex, wrong)?.errorType).toBe('valeurs');
      }
    }
  });

  it('chaque erreur a une règle et une explication', () => {
    const ex = c.generate(1, seededRng(1));
    for (const e of c.errors) {
      expect(e.rule, e.id).toBeDefined();
      expect(e.explain(ex).rule.length, e.id).toBeGreaterThan(0);
    }
  });

  it('tableau : la ligne du produit suit la règle des signes ; bonne réponse juste', () => {
    const rng = seededRng(3);
    for (let i = 0; i < 100; i++) {
      const q = c.customQuestion?.('tableau', { rng, level: 2, timesSeen: 0 });
      if (q?.kind !== 'tableau') throw new Error('tableau attendu');
      const g = expectedGrid('quotient', q.factors);
      expect(g).toHaveLength(3);
      g[2]!.forEach((s, k) => {
        const [x, y] = [g[0]![k]!, g[1]![k]!];
        expect(s).toBe(y === '0' ? '‖' : x === '0' ? '0' : x === y ? '+' : '−');
      });
      expect(checkAnswer(c, q, { tableau: [], hinted: false }).correct).toBe(true);
      expect(checkAnswer(c, q, { tableau: ['regle-signes'], hinted: false })).toMatchObject({ correct: false, errorType: 'regle-signes' });
      expect(checkAnswer(c, q, { tableau: ['barre-oubliee'], hinted: false })).toMatchObject({ correct: false, errorType: 'barre-oubliee' });
    }
  });

  it('lecture de S : la valeur interdite a toujours un crochet ouvert, même avec ≤ ou ≥', () => {
    const rng = seededRng(21);
    let large = 0;
    for (let i = 0; i < 300; i++) {
      const q = c.customQuestion?.('intervalle', { rng, level: 1, timesSeen: 0 });
      if (q?.kind !== 'intervalle' || !q.table) throw new Error('intervalle attendu');
      if (q.table.rel === '<=' || q.table.rel === '>=') large++;
      const bad = factorRoot(q.table.factors[1]!);
      for (const e of [q.expected, q.expected2]) {
        if (!e) continue;
        if (e.lo && eqRat(e.lo, bad)) expect(e.loClosed).toBe(false);
        if (e.hi && eqRat(e.hi, bad)) expect(e.hiClosed).toBe(false);
      }
      // crochet fermé sur la valeur interdite : refusé
      const input0 = input(q.expected);
      const second = q.expected2 ? input(q.expected2) : undefined;
      const pieces = [q.expected, q.expected2].filter((e): e is Interval => e !== undefined);
      pieces.forEach((e, k) => {
        const p = input(e);
        const closedLo = e.lo && eqRat(e.lo, bad) ? { ...p, left: '[' as const } : null;
        const closedHi = e.hi && eqRat(e.hi, bad) ? { ...p, right: ']' as const } : null;
        for (const wrong of [closedLo, closedHi]) {
          if (!wrong) continue;
          const given = k === 0 ? { interval: wrong, ...(second ? { interval2: second } : {}) } : { interval: input0, interval2: wrong };
          expect(checkAnswer(c, q, { ...given, symbol: null, hinted: false })).toMatchObject({ correct: false, errorType: 'crochet' });
        }
      });
    }
    expect(large / 300).toBeGreaterThan(0.6);
  });

  it('lecture de S : un ou deux intervalles, bonne réponse juste, mauvais crochet refusé', () => {
    const rng = seededRng(11);
    for (let i = 0; i < 100; i++) {
      const q = c.customQuestion?.('intervalle', { rng, level: 1, timesSeen: 0 });
      if (q?.kind !== 'intervalle') throw new Error('intervalle attendu');
      const second = q.expected2 ? input(q.expected2) : undefined;
      const ok = checkAnswer(c, q, { interval: input(q.expected), ...(second ? { interval2: second } : {}), symbol: null, hinted: false });
      expect(ok.correct).toBe(true);
      const bad = checkAnswer(c, q, { interval: { ...input(q.expected), left: '[', lo: '−∞' }, symbol: null, hinted: false });
      expect(bad.correct).toBe(false);
    }
  });

  it('question « saisie » : valeur entière, message par erreur', () => {
    const rng = seededRng(5);
    for (let i = 0; i < 50; i++) {
      const s = c.customQuestion?.('saisie', { rng, level: 3 as Level, timesSeen: 0 });
      if (s?.kind !== 'saisie') throw new Error('saisie attendue');
      expect(s.ex.answer.d).toBe(1);
    }
    const ex = c.generate(1, seededRng(2));
    const q = { kind: 'saisie', ex, promptLatex: '' } as Question;
    const o = { correct: false, unfinished: false, errorType: 'valeurs', errorFamily: 'calcul', given: '', expected: '' } as Outcome;
    expect(c.feedbackText?.(q, o)).toContain('est interdite');
    expect(c.feedbackText?.(q, { ...o, errorType: 'autre' })).toContain('annule le bas');
    expect(c.feedbackText?.(q, { ...o, correct: true })).toBeNull();
  });

  it('exercices de fin : tableau, S, tableau, S, S (toujours sur un quotient)', () => {
    const fins = courseRunItems(c, seededRng(9)).filter((i) => i.type === 'question' && i.activity === 'fin');
    expect(fins.map((f) => f.type === 'question' && f.question.kind)).toEqual(['tableau', 'intervalle', 'tableau', 'intervalle', 'intervalle']);
    for (const f of fins) {
      if (f.type !== 'question') continue;
      if (f.question.kind === 'tableau') expect(f.question.op).toBe('quotient');
      if (f.question.kind === 'intervalle') expect(f.question.table?.op).toBe('quotient');
    }
  });
});
