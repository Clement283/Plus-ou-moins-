import { describe, expect, it } from 'vitest';
import { inequationsSigneAffine as c } from '../../src/courses/essais/inequations-signe-affine';
import { checkAnswer, courseRunItems, diagnose } from '../../src';
import { expectedGrid } from '../../src/math/tableau';
import { rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import type { Outcome, Question } from '../../src/exercises/types';
import type { Exercise, Level } from '../../src/courses/types';
import { within } from './helpers';

type M = { a: number; b: number };
const meta = (ex: Exercise): M => ex.meta as unknown as M;
const SPEC: Record<Level, { a: [number, number]; b: [number, number] }> = { 1: { a: [1, 5], b: [1, 45] }, 2: { a: [2, 5], b: [1, 12] }, 3: { a: [2, 9], b: [1, 30] } };

describe('Cours 9 — Signe de ax + b', () => {
  it('générateur : a ≠ 0, b ≠ 0, valeur entière au niveau 1, des deux signes (1 000 tirages par niveau)', () => {
    for (const level of [1, 2, 3] as Level[]) {
      const rng = seededRng(42);
      let negA = 0;
      let frac = 0;
      for (let i = 0; i < 1000; i++) {
        const ex = c.generate(level, rng);
        const { a, b } = meta(ex);
        if (a < 0) negA++;
        if (ex.answer.d !== 1) frac++;
        expect(ex.level).toBe(level);
        expect(within(Math.abs(a), SPEC[level].a) && within(Math.abs(b), SPEC[level].b) && b !== 0).toBe(true);
        expect(ex.answer).toEqual(rat(-b, a));
      }
      expect(negA).toBeGreaterThan(400);
      expect(negA).toBeLessThan(600);
      if (level === 1) expect(frac).toBe(0);
      else expect(frac).toBeGreaterThan(0);
    }
  });

  it('piège « valeurs » : la valeur sans le changement de signe est reconnue', () => {
    for (const level of [1, 2, 3] as Level[]) {
      const rng = seededRng(7);
      const err = c.errors.find((e) => e.id === 'valeurs')!;
      for (let i = 0; i < 200; i++) {
        const ex = err.trap(level, rng);
        expect(err.wrongValues(ex)).toContainEqual(rat(meta(ex).b));
        expect(diagnose(c, ex, rat(meta(ex).b))?.errorType).toBe('valeurs');
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

  it('signes attendus : signe de a à droite, contraire à gauche', () => {
    const rng = seededRng(3);
    for (let i = 0; i < 100; i++) {
      const q = c.customQuestion?.('tableau', { rng, level: 2, timesSeen: 0 });
      if (q?.kind !== 'tableau') throw new Error('tableau attendu');
      const { a } = meta(q.ex);
      expect(expectedGrid('seul', q.factors)[0]).toEqual(a > 0 ? ['−', '0', '+'] : ['+', '0', '−']);
      expect(checkAnswer(c, q, { tableau: [], hinted: false }).correct).toBe(true);
      expect(checkAnswer(c, q, { tableau: ['signe-facteur'], hinted: false })).toMatchObject({ correct: false, errorType: 'signe-facteur' });
    }
  });

  it('question « saisie » : valeur entière, message par erreur', () => {
    const rng = seededRng(5);
    for (let i = 0; i < 50; i++) {
      const s = c.customQuestion?.('saisie', { rng, level: 2 as Level, timesSeen: 0 });
      if (s?.kind !== 'saisie') throw new Error('saisie attendue');
      expect(s.ex.answer.d).toBe(1);
    }
    const ex = c.generate(1, seededRng(2));
    const q = { kind: 'saisie', ex, promptLatex: '' } as Question;
    const o = { correct: false, unfinished: false, errorType: 'valeurs', errorFamily: 'calcul', given: '', expected: '' } as Outcome;
    expect(c.feedbackText?.(q, o)).toContain('on résout cette équation');
    expect(c.feedbackText?.(q, { ...o, errorType: 'autre' })).toContain('Résous');
    expect(c.feedbackText?.(q, { ...o, correct: true })).toBeNull();
  });

  it('exercices de fin : cinq tableaux complets d’un seul facteur', () => {
    const fins = courseRunItems(c, seededRng(9)).filter((i) => i.type === 'question' && i.activity === 'fin');
    expect(fins).toHaveLength(5);
    for (const f of fins) {
      expect(f.type === 'question' && f.question.kind).toBe('tableau');
      if (f.type === 'question' && f.question.kind === 'tableau') expect(f.question).toMatchObject({ op: 'seul', ask: { valeurs: true, lignes: true } });
    }
  });
});
