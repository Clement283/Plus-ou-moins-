import { describe, expect, it } from 'vitest';
import { buildQuestion } from '../../src/exercises/build';
import { classerFor } from '../../src/exercises/build/classer';
import { checkAnswer, checkParts } from '../../src/exercises/check';
import { seededRng } from '../../src/rng';
import type { Level } from '../../src/courses/types';
import { exOf } from '../courses/helpers';
import { C, RELATIFS } from './helpers';

const SIGN: Record<string, string> = { '+': 'positif', '−': 'negatif', '0': 'zero' };

describe('Classer (doc 04 §6)', () => {
  it.each([
    // Calculs | Rangement attendu
    [5, ['−2 × 3', '−4 × (−5)', '7 × (−1)', '2 × 8'], '− · + · − · +', ['positif', 'negatif']],
    [2, ['−3 + 5', '4 + (−9)', '−6 + 6', '−1 + (−2)'], '+ · − · 0 · −', ['positif', 'negatif', 'zero']],
  ] as [number, string[], string, string[]][])('cours %i : %j → %s', (n, calcs, expected, boxes) => {
    const q = classerFor(C(n), calcs.map((d) => exOf(C(n), d)));
    if (q.kind !== 'classer') throw new Error('kind');
    expect(q.expected).toEqual(expected.split(' · ').map((s) => SIGN[s]));
    expect(q.classes.map((c) => c.id)).toEqual(boxes);
    expect(q.classes.map((c) => c.label)).toEqual(['Résultat +', 'Résultat −', 'Résultat 0'].slice(0, boxes.length));
  });

  it('juste only if the 4 are well placed the first time; a misplaced one records the sign error of the course', () => {
    const q = classerFor(C(5), ['−2 × 3', '−4 × (−5)', '7 × (−1)', '2 × 8'].map((d) => exOf(C(5), d)));
    if (q.kind !== 'classer') throw new Error('kind');
    const ok = checkAnswer(C(5), q, { classes: q.expected });
    expect(ok).toEqual({
      correct: true,
      unfinished: false,
      errorType: null,
      errorFamily: null,
      given: 'Résultat − · Résultat + · Résultat − · Résultat +',
      expected: 'Résultat − · Résultat + · Résultat − · Résultat +',
    });
    const placed = ['negatif', 'negatif', 'negatif', 'positif'];
    const o = checkAnswer(C(5), q, { classes: placed });
    expect([o.correct, o.errorType, o.errorFamily]).toEqual([false, 'regle-signes', 'signe']);
    expect(checkParts(C(5), q, { classes: placed }).map((p) => [p.correct, p.errorType])).toEqual([
      [true, null],
      [false, 'regle-signes'],
      [true, null],
      [true, null],
    ]);
    // Cours 4: its first sign error
    const q4 = classerFor(C(4), ['5 − (−3)', '3 − 7', '−4 − 6', '2 − 1'].map((d) => exOf(C(4), d)));
    if (q4.kind !== 'classer') throw new Error('kind');
    expect(checkAnswer(C(4), q4, { classes: ['negatif', ...q4.expected.slice(1)] }).errorType).toBe('signe-inverse');
  });

  it('1 000 draws per course: 4 calculations, at least one in each box shown, box « 0 » only when used', () => {
    for (const n of RELATIFS) {
      const course = C(n);
      const rng = seededRng(600 + n);
      for (let i = 0; i < 1000; i++) {
        const level = ((i % 3) + 1) as Level;
        const q = buildQuestion(course, 'classer', { rng, level, timesSeen: 0 });
        if (q.kind !== 'classer') throw new Error('kind');
        expect(q.exs).toHaveLength(4);
        expect(q.expected).toHaveLength(4);
        const ids = q.classes.map((c) => c.id);
        expect(ids.slice(0, 2)).toEqual(['positif', 'negatif']);
        expect(ids.includes('zero')).toBe(q.expected.includes('zero'));
        for (const id of ids) expect(q.expected).toContain(id);
        q.exs.forEach((e, k) => expect(q.expected[k]).toBe(e.answer.n > 0 ? 'positif' : e.answer.n < 0 ? 'negatif' : 'zero'));
      }
    }
  });

  it('Cours 0 builds its own « bien écrit / mal écrit » boxes', () => {
    const q = buildQuestion(C(0), 'classer', { rng: seededRng(1), level: 1, timesSeen: 0 });
    expect(q.kind === 'classer' && q.classes.map((c) => c.id)).toEqual(['bien', 'mal']);
  });
});
