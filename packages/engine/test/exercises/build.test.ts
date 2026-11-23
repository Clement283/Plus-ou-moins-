import { describe, expect, it } from 'vitest';
import { buildQuestion } from '../../src/exercises/build';
import { checkAnswer } from '../../src/exercises/check';
import type { QuestionKind } from '../../src/exercises/types';
import { seededRng } from '../../src/rng';
import type { Level } from '../../src/courses/types';
import { C, RELATIFS } from './helpers';

const KINDS: QuestionKind[] = ['saisie', 'trou', 'ordre', 'erreur', 'paires', 'classer', 'qcm', 'vraifaux'];

describe('buildQuestion / checkAnswer', () => {
  it('builds every kind for every Relatifs course and level', () => {
    for (const n of RELATIFS)
      for (const kind of KINDS)
        for (const level of [1, 2, 3] as Level[]) {
          const q = buildQuestion(C(n), kind, { rng: seededRng(n * 10 + level), level, timesSeen: 3 });
          expect(q.kind).toBe(kind);
        }
  });

  it('Cours 0: its own hooks build and check first', () => {
    const c0 = C(0);
    for (const kind of ['erreur', 'qcm', 'classer'] as QuestionKind[]) {
      const q = buildQuestion(c0, kind, { rng: seededRng(5), level: 2, timesSeen: 0 });
      expect(q).toEqual(c0.customQuestion?.(kind, { rng: seededRng(5), level: 2, timesSeen: 0 }));
    }
    const q = buildQuestion(c0, 'erreur', { rng: seededRng(6), level: 1, timesSeen: 0 });
    if (q.kind !== 'erreur') throw new Error('kind');
    for (const line of [null, 0, 1]) {
      const o = checkAnswer(c0, q, { line });
      expect(o).toEqual(c0.customCheck?.(q, { line }));
      if (!o.correct) expect(o.errorFamily).toBe('ecriture');
    }
  });

  it('refuses an answer that does not fit the question', () => {
    const q = buildQuestion(C(5), 'qcm', { rng: seededRng(1), level: 1, timesSeen: 0 });
    expect(() => checkAnswer(C(5), q, { bool: true })).toThrow();
  });
});
