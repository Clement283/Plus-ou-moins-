import { describe, expect, it } from 'vitest';
import { buildSigne } from '../../src/exercises/build/signe';
import { buildSlot } from '../../src/exercises/build';
import { checkAnswer } from '../../src/exercises/check';
import { seededRng } from '../../src/rng';
import { C } from './helpers';

describe('buildSigne', () => {
  it('two buttons + and −, correct one follows the sign of the answer, never 0', () => {
    const rng = seededRng(3);
    for (const n of [1, 2, 5]) {
      const c = C(n);
      for (let i = 0; i < 100; i++) {
        const q = buildSigne(c, { rng, level: 1, timesSeen: 0 });
        if (q.kind !== 'qcm') throw new Error('qcm attendu');
        expect(q.ex.answer.n).not.toBe(0);
        expect(q.choices.map((x) => x.latex)).toEqual(['+', '-']);
        expect(q.correctIndex).toBe(q.ex.answer.n > 0 ? 0 : 1);
        const wrong = q.choices[1 - q.correctIndex]!;
        expect(wrong.errorType).toBe(c.errors.find((e) => e.family === 'signe')!.id);
        expect(q.choices[q.correctIndex]!.errorType).toBeNull();
      }
    }
  });

  it('is checked like a QCM', () => {
    const q = buildSigne(C(1), { rng: seededRng(1), level: 1, timesSeen: 0 });
    if (q.kind !== 'qcm') throw new Error();
    expect(checkAnswer(C(1), q, { choice: q.correctIndex }).correct).toBe(true);
    expect(checkAnswer(C(1), q, { choice: 1 - q.correctIndex }).correct).toBe(false);
  });

  it('buildSlot: droite falls back to saisie above level 1', () => {
    const rng = seededRng(2);
    expect(buildSlot(C(1), 'droite', { rng, level: 1, timesSeen: 0 }).kind).toBe('droite');
    expect(buildSlot(C(1), 'droite', { rng, level: 2, timesSeen: 0 }).kind).toBe('saisie');
  });
});
