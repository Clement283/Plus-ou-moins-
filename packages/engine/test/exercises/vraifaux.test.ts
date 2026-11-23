import { describe, expect, it } from 'vitest';
import { buildQuestion } from '../../src/exercises/build';
import { checkAnswer } from '../../src/exercises/check';
import type { Question } from '../../src/exercises/types';
import { eqRat, rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import { diagnose } from '../../src/courses';
import type { Level } from '../../src/courses/types';
import { exOf } from '../courses/helpers';
import { C, RELATIFS } from './helpers';

const vfOf = (shown: number, errorType: string | null): Question => {
  const ex = exOf(C(5), '−3 × (−4)');
  return { kind: 'vraifaux', ex, shown: rat(shown), isTrue: eqRat(rat(shown), ex.answer), errorType };
};

describe('Vrai ou faux (doc 04 §8)', () => {
  it.each([
    // Affiché | Bonne réponse | Elle répond | Erreur enregistrée
    [12, null, true, null],
    [-12, 'regle-signes', true, 'regle-signes'],
    [12, null, false, 'autre'],
  ] as [number, string | null, boolean, string | null][])('−3 × (−4) = %i, elle répond %s → %s', (shown, trap, bool, errorType) => {
    const o = checkAnswer(C(5), vfOf(shown, trap), { bool });
    expect(o.correct).toBe(errorType === null);
    expect(o.errorType).toBe(errorType);
    expect(o.errorFamily).toBe(errorType === null ? null : errorType === 'autre' ? 'autre' : 'signe');
    expect(o.given).toBe(bool ? 'Vrai' : 'Faux');
    expect(o.expected).toBe(shown === 12 ? 'Vrai' : 'Faux');
  });

  it('1 000 draws per course: between 45 % and 55 % « Vrai »; a wrong result is a QCM trap', () => {
    for (const n of RELATIFS) {
      const course = C(n);
      const rng = seededRng(800 + n);
      let vrai = 0;
      for (let i = 0; i < 1000; i++) {
        const level = ((i % 3) + 1) as Level;
        const q = buildQuestion(course, 'vraifaux', { rng, level, timesSeen: i % 10 });
        if (q.kind !== 'vraifaux') throw new Error('kind');
        expect(q.isTrue).toBe(eqRat(q.shown, q.ex.answer));
        if (q.isTrue) {
          vrai++;
          expect(q.errorType).toBeNull();
        } else {
          expect(q.errorType).toBe(diagnose(course, q.ex, q.shown)?.errorType);
          expect(q.shown.d).toBe(1);
        }
      }
      expect(vrai / 1000).toBeGreaterThanOrEqual(0.45);
      expect(vrai / 1000).toBeLessThanOrEqual(0.55);
    }
  });

  it('a typical trap at the beginning when the course has one', () => {
    const rng = seededRng(3);
    for (let i = 0; i < 200; i++) {
      const q = buildQuestion(C(5), 'vraifaux', { rng, level: 1, timesSeen: 0, trapErrorType: 'regle-signes' });
      if (q.kind === 'vraifaux' && !q.isTrue) expect(q.errorType).not.toBeNull();
    }
  });

  it('Cours 0 has no « Vrai ou faux » (doc 06: QCM and Classer in reviews)', () => {
    expect(() => buildQuestion(C(0), 'vraifaux', { rng: seededRng(1), level: 1, timesSeen: 0 })).toThrow();
  });
});
