import { describe, expect, it } from 'vitest';
import { inequationsIntervalles as c } from '../../src/courses/essais/inequations-intervalles';
import { checkAnswer, courseRunItems, diagnose } from '../../src';
import { rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import type { Outcome, Question } from '../../src/exercises/types';
import type { Exercise, Level } from '../../src/courses/types';
import { within } from './helpers';

type M = { rel: string; b: number };
const meta = (ex: Exercise): M => ex.meta as unknown as M;
const RANGE: Record<Level, [number, number]> = { 1: [1, 9], 2: [10, 30], 3: [10, 99] };
const iv = (left: '[' | ']', lo: string, hi: string, right: '[' | ']') => ({ left, lo, hi, right });
const run = (q: Question, interval: ReturnType<typeof iv>) => checkAnswer(c, q, { interval, symbol: null, hinted: false });

describe('Cours 7 — Intervalles', () => {
  it('générateur : 4 symboles, bornes du niveau, signe quelconque (1 000 tirages par niveau)', () => {
    for (const level of [1, 2, 3] as Level[]) {
      const rng = seededRng(42);
      const rels = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        const ex = c.generate(level, rng);
        rels.add(meta(ex).rel);
        expect(ex.level).toBe(level);
        expect(within(meta(ex).b, RANGE[level])).toBe(true);
        expect(ex.answer).toEqual(rat(meta(ex).b));
      }
      expect([...rels].sort()).toEqual(['<', '<=', '>', '>=']);
    }
  });

  it('piège « signe-borne » : l’opposé de la borne est reconnu', () => {
    for (const level of [1, 2, 3] as Level[]) {
      const rng = seededRng(7);
      for (let i = 0; i < 200; i++) {
        const ex = c.errors.find((e) => e.id === 'signe-borne')!.trap(level, rng);
        expect(diagnose(c, ex, rat(-meta(ex).b))?.errorType).toBe('signe-borne');
      }
    }
  });

  it('chaque erreur de l’intervalle a une règle et un message', () => {
    const ex = c.generate(1, seededRng(1));
    for (const e of c.errors) {
      expect(e.rule, e.id).toBeDefined();
      expect(e.explain(ex).rule.length, e.id).toBeGreaterThan(0);
    }
  });

  it('question « intervalle » : bonne réponse, crochet contre ∞, mauvais côté', () => {
    const ctx = { rng: seededRng(3), level: 1 as Level, timesSeen: 0 };
    const q = c.customQuestion?.('intervalle', ctx);
    if (q?.kind !== 'intervalle') throw new Error('intervalle attendu');
    expect(run(q, iv(']', '3', '3', '['))).toMatchObject({ correct: false });
    const { rel, b } = meta(q.ex);
    const bound = String(b).replace('-', '−');
    const lo = rel === '<' || rel === '<=' ? '−∞' : bound;
    const hi = rel === '<' || rel === '<=' ? bound : '+∞';
    const left = rel === '>=' ? '[' : ']';
    const right = rel === '<=' ? ']' : '[';
    expect(run(q, iv(left, lo, hi, right))).toMatchObject({ correct: true });
    const infFermé = rel === '<' || rel === '<=' ? iv('[', lo, hi, right) : iv(left, lo, hi, ']');
    expect(run(q, infFermé)).toMatchObject({ correct: false, errorType: 'crochet-infini' });
  });

  it('question « saisie » : la borne, avec message pour le signe', () => {
    const ctx = { rng: seededRng(5), level: 1 as Level, timesSeen: 0 };
    const s = c.customQuestion?.('saisie', ctx);
    expect(s?.kind === 'saisie' && s.promptLatex).toContain('x');
    const ex = c.generate(1, seededRng(2));
    const o = { correct: false, unfinished: false, errorType: 'signe-borne', errorFamily: 'signe', given: '', expected: '' } as Outcome;
    const q: Question = { kind: 'saisie', ex, promptLatex: '' } as Question;
    expect(c.feedbackText?.(q, o)).toContain('avec son signe');
    expect(c.feedbackText?.(q, { ...o, correct: true })).toBeNull();
  });

  it('exercices de fin : cinq questions « intervalle »', () => {
    const fins = courseRunItems(c, seededRng(9)).filter((i) => i.type === 'question' && i.activity === 'fin');
    expect(fins).toHaveLength(5);
    for (const f of fins) expect(f.type === 'question' && f.question.kind).toBe('intervalle');
  });
});
