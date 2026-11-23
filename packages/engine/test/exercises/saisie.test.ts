import { describe, expect, it } from 'vitest';
import { buildQuestion } from '../../src/exercises/build';
import { checkAnswer } from '../../src/exercises/check';
import type { Question } from '../../src/exercises/types';
import { toLatex } from '../../src/math/expr';
import { seededRng } from '../../src/rng';
import { exOf } from '../courses/helpers';
import { C, RELATIFS, typed } from './helpers';

const saisieOf = (n: number, display: string): Question => {
  const ex = exOf(C(n), display);
  return { kind: 'saisie', ex, promptLatex: `${toLatex(ex.expr)} = \\square` };
};

describe('Réponse écrite (doc 04 §1)', () => {
  // Calcul | Tapé | Résultat | Erreur enregistrée
  it('−3 × (−4), tapé 12 → juste', () => {
    expect(checkAnswer(C(5), saisieOf(5, '−3 × (−4)'), { raw: typed('12') })).toEqual({
      correct: true,
      unfinished: false,
      errorType: null,
      errorFamily: null,
      given: '12',
      expected: '12',
    });
  });

  it('−3 × (−4), tapé −12 → regle-signes', () => {
    expect(checkAnswer(C(5), saisieOf(5, '−3 × (−4)'), { raw: typed('-12') })).toEqual({
      correct: false,
      unfinished: false,
      errorType: 'regle-signes',
      errorFamily: 'signe',
      given: '-12',
      expected: '12',
    });
  });

  it('−3 × (−4), tapé 12− → moins-apres (écriture)', () => {
    expect(checkAnswer(C(5), saisieOf(5, '−3 × (−4)'), { raw: typed('12-') })).toEqual({
      correct: false,
      unfinished: false,
      errorType: 'moins-apres',
      errorFamily: 'ecriture',
      given: '12-',
      expected: '12',
    });
  });

  it('−12 ÷ 4, tapé la fraction −12 sur 4 → « Simplifie », aucune erreur', () => {
    expect(checkAnswer(C(6), saisieOf(6, '−12 ÷ 4'), { raw: typed('/-12>4') })).toEqual({
      correct: false,
      unfinished: true,
      errorType: null,
      errorFamily: null,
      given: '[-12/4]',
      expected: '-3',
    });
  });

  it('−3 × (−4), tapé 11 → autre', () => {
    const o = checkAnswer(C(5), saisieOf(5, '−3 × (−4)'), { raw: typed('11') });
    expect([o.correct, o.errorType, o.errorFamily]).toEqual([false, 'autre', 'autre']);
  });

  it('a writing error comes before the course error: 8− on −8 is moins-apres, not a sign error', () => {
    const o = checkAnswer(C(1), saisieOf(1, '−3 + (−5)'), { raw: typed('8-') });
    expect(o.errorType).toBe('moins-apres');
  });

  it('builds a calculation of the course at the level, or the trap of the error asked', () => {
    for (const n of RELATIFS) {
      const course = C(n);
      const q = buildQuestion(course, 'saisie', { rng: seededRng(n), level: 2, timesSeen: 0 });
      if (q.kind !== 'saisie') throw new Error('kind');
      expect(q.ex.courseId).toBe(course.id);
      expect(q.ex.level).toBe(2);
      expect(q.promptLatex).toBe(`${toLatex(q.ex.expr)} = \\square`);
      for (const err of course.errors) {
        const t = buildQuestion(course, 'saisie', { rng: seededRng(7), level: 1, timesSeen: 0, trapErrorType: err.id });
        expect(t.kind === 'saisie' && t.ex).toEqual(err.trap(1, seededRng(7)));
      }
    }
  });
});
