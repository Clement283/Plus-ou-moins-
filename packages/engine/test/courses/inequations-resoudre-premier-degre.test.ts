import { describe, expect, it } from 'vitest';
import { inequationsResoudrePremierDegre as c } from '../../src/courses/essais/inequations-resoudre-premier-degre';
import { checkAnswer, courseRunItems, diagnose } from '../../src';
import { seededRng } from '../../src/rng';
import type { Outcome, Question } from '../../src/exercises/types';
import type { Exercise, Level } from '../../src/courses/types';
import { within } from './helpers';

type M = { a: number; b: number; c: number; rel: '<' | '<=' | '>' | '>=' };
const meta = (ex: Exercise): M => ex.meta as unknown as M;
const SPEC: Record<Level, { a: [number, number]; b: [number, number]; x: [number, number] }> = {
  1: { a: [2, 5], b: [1, 9], x: [1, 9] },
  2: { a: [2, 9], b: [1, 20], x: [1, 12] },
  3: { a: [2, 12], b: [1, 30], x: [1, 15] },
};
const iv = (left: '[' | ']', lo: string, hi: string, right: '[' | ']') => ({ left, lo, hi, right });

describe('Cours 8 — Résoudre une inéquation', () => {
  it('générateur : solution entière non nulle, 4 symboles, a négatif le plus souvent (1 000 tirages par niveau)', () => {
    for (const level of [1, 2, 3] as Level[]) {
      const rng = seededRng(42);
      const rels = new Set<string>();
      let neg = 0;
      for (let i = 0; i < 1000; i++) {
        const ex = c.generate(level, rng);
        const { a, b, c: cc, rel } = meta(ex);
        rels.add(rel);
        if (a < 0) neg++;
        expect(ex.level).toBe(level);
        expect(within(Math.abs(a), SPEC[level].a) && within(Math.abs(b), SPEC[level].b)).toBe(true);
        expect(Number.isInteger(ex.answer.n / ex.answer.d) && ex.answer.n !== 0 && cc !== 0).toBe(true);
        expect(within(Math.abs(ex.answer.n), SPEC[level].x)).toBe(true);
      }
      expect([...rels].sort()).toEqual(['<', '<=', '>', '>=']);
      expect(neg / 1000).toBeGreaterThan(0.65);
      expect(neg / 1000).toBeLessThan(0.85);
    }
  });

  it('pièges numériques : signe perdu et coefficient soustrait sont reconnus', () => {
    for (const level of [1, 2, 3] as Level[]) {
      const rng = seededRng(7);
      for (const id of ['signe-perdu-division', 'soustraire-coef']) {
        const err = c.errors.find((e) => e.id === id)!;
        for (let i = 0; i < 200; i++) {
          const ex = err.trap(level, rng);
          for (const w of err.wrongValues(ex)) expect(diagnose(c, ex, w)?.errorType, `${id}`).toBe(id);
          expect(err.wrongValues(ex).length).toBeGreaterThan(0);
        }
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

  it('question « intervalle » : symbole à choisir seulement si a < 0, bonne réponse juste, sens oublié refusé', () => {
    const rng = seededRng(11);
    const txt = (r: { n: number }): string => String(r.n).replace('-', '−');
    for (let i = 0; i < 100; i++) {
      const q = c.customQuestion?.('intervalle', { rng, level: 1, timesSeen: 0 });
      if (q?.kind !== 'intervalle') throw new Error('intervalle attendu');
      expect(q.flip !== undefined).toBe(meta(q.ex).a < 0);
      const e = q.expected;
      const input = iv(e.loClosed ? '[' : ']', e.lo === null ? '−∞' : txt(e.lo), e.hi === null ? '+∞' : txt(e.hi), e.hiClosed ? ']' : '[');
      expect(checkAnswer(c, q, { interval: input, symbol: q.flip?.answer ?? null, hinted: false }).correct).toBe(true);
      if (q.flip) expect(checkAnswer(c, q, { interval: input, symbol: q.flip.given, hinted: false })).toMatchObject({ correct: false, errorType: 'sens' });
    }
  });

  it('question « saisie » : la borne, avec un message par erreur', () => {
    const ex = c.generate(1, seededRng(2));
    const s = c.customQuestion?.('saisie', { rng: seededRng(5), level: 1 as Level, timesSeen: 0 });
    expect(s?.kind === 'saisie' && s.promptLatex).toContain('x');
    const q = { kind: 'saisie', ex, promptLatex: '' } as Question;
    const o = { correct: false, unfinished: false, errorType: 'signe-perdu-division', errorFamily: 'signe', given: '', expected: '' } as Outcome;
    expect(c.feedbackText?.(q, o)).toContain('avec son signe');
    expect(c.feedbackText?.(q, { ...o, errorType: 'soustraire-coef' })).toContain('on ne le soustrait pas');
    expect(c.feedbackText?.(q, { ...o, errorType: 'autre' })).toContain('la borne est');
    expect(c.feedbackText?.(q, { ...o, correct: true })).toBeNull();
  });

  it('exercices de fin : 2 résolutions complètes et 3 intervalles', () => {
    const fins = courseRunItems(c, seededRng(9)).filter((i) => i.type === 'question' && i.activity === 'fin');
    expect(fins.map((f) => f.type === 'question' && f.question.kind)).toEqual(['resoudre', 'intervalle', 'resoudre', 'intervalle', 'intervalle']);
  });
});
