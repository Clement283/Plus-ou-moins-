import { describe, expect, it } from 'vitest';
import { checkAnswer } from '../../src/exercises/check';
import { droiteExercise } from '../../src/exercises/build/droite';
import { buildQuestion } from '../../src/exercises/build';
import { promptOf } from '../../src/activity';
import { seededRng } from '../../src/rng';
import { operands } from '../../src/courses/calculs/shared';
import type { Question } from '../../src/exercises/types';
import { C } from './helpers';

const c01 = C(1);

describe('droiteExercise', () => {
  it('draws two-term sums that fit on 8 graduations', () => {
    const rng = seededRng(7);
    for (let i = 0; i < 500; i++) {
      const ex = droiteExercise(c01, rng);
      const terms = operands(ex.expr);
      expect(terms).toHaveLength(2);
      const [a, b] = terms as [number, number];
      const pts = [0, a, a + b];
      expect(Math.max(...pts) - Math.min(...pts)).toBeLessThanOrEqual(7);
    }
  });

  it('builds a droite question with undecorated jumps', () => {
    const q = buildQuestion(c01, 'droite', { rng: seededRng(3), level: 1, timesSeen: 0 });
    expect(q.kind).toBe('droite');
    if (q.kind !== 'droite') return;
    expect(q.line.to - q.line.from).toBeLessThanOrEqual(7);
    expect(q.jumps).toHaveLength(2);
    expect(q.answer).toBe(q.ex.answer.n);
    expect(promptOf(q)).toBe(q.promptLatex);
  });
});

describe('checkAnswer droite', () => {
  const q = (): Question => {
    const base = buildQuestion(c01, 'saisie', { rng: seededRng(1), level: 1, timesSeen: 0 });
    if (base.kind !== 'saisie') throw new Error('x');
    // −2 + (−5)
    const ex = { ...base.ex, answer: { n: -7, d: 1 }, expr: { k: 'op', op: '+', a: { k: 'num', v: { n: -2, d: 1 } }, b: { k: 'num', v: { n: -5, d: 1 } } } } as typeof base.ex;
    return { kind: 'droite', ex, promptLatex: '-2 + (-5)', line: { from: -7, to: 0 }, jumps: [{ from: 0, by: -2 }, { from: -2, by: -5 }], answer: -7 };
  };

  it('is right on the arrival point', () => {
    const o = checkAnswer(c01, q(), { point: -7 });
    expect(o.correct).toBe(true);
    expect(o.given).toBe('−7');
  });
  it('diagnoses a forgotten sign', () => {
    const o = checkAnswer(c01, q(), { point: 7 });
    expect(o.correct).toBe(false);
    expect(o.errorType).toBe('signe-oublie');
  });
  it('diagnoses a subtraction instead of an addition', () => {
    const o = checkAnswer(c01, q(), { point: -3 });
    expect(o.errorType).toBe('soustraction-au-lieu-addition');
  });
});
