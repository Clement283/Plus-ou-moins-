import { describe, expect, it } from 'vitest';
import { buildQuestion } from '../../src/exercises/build';
import { wrongResolution } from '../../src/exercises/build/erreur';
import { checkAnswer } from '../../src/exercises/check';
import type { Question } from '../../src/exercises/types';
import { rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import { diagnose } from '../../src/courses';
import type { Level } from '../../src/courses/types';
import { exOf, tex } from '../courses/helpers';
import { C, RELATIFS } from './helpers';

/** Doc display « a / = b / = c » → LaTeX lines. */
const linesOf = (shown: string): string[] => shown.split(' / ').map(tex);

const erreurOf = (n: number, display: string, shown: string, wrongLine: number | null, errorType: string | null): Question => ({
  kind: 'erreur',
  ex: exOf(C(n), display),
  lines: linesOf(shown),
  wrongLine,
  errorType,
});

describe('Trouver l\'erreur (doc 04 §4)', () => {
  it.each([
    // Résolution affichée | Bonne réponse | Elle touche | Erreur enregistrée (lines numbered from 0)
    [5, '−3 × (−4)', '−3 × (−4) / = −(3 × 4) / = −12', 1, 'regle-signes', 1, null],
    [5, '−3 × (−4)', '−3 × (−4) / = −(3 × 4) / = −12', 1, 'regle-signes', 2, 'regle-signes'],
    [4, '5 − (−3)', '5 − (−3) / = 5 − 3 / = 2', 1, 'oppose-oublie', 1, null],
    [4, '5 − (−3)', '5 − (−3) / = 5 + 3 / = 8', null, null, 2, 'relecture'],
    [3, '−2 + 5 + (−4)', '−2 + 5 + (−4) / = 5 + (−2) + (−4) / = 5 + (−6) / = 1', 3, 'signe-inverse', null, 'relecture'],
  ] as [number, string, string, number | null, string | null, number | null, string | null][])(
    'cours %i : %s — %s',
    (n, display, shown, wrongLine, wrongError, touched, errorType) => {
      const q = erreurOf(n, display, shown, wrongLine, wrongError);
      const o = checkAnswer(C(n), q, { line: touched });
      expect(o.correct).toBe(errorType === null);
      expect(o.errorType).toBe(errorType);
      expect(o.errorFamily).toBe(errorType === null ? null : errorType === 'relecture' ? 'autre' : 'signe');
      const show = (l: number | null): string => (l === null ? 'Tout est juste' : (q.kind === 'erreur' && q.lines[l]) || '');
      expect(o.given).toBe(show(touched));
      expect(o.expected).toBe(show(wrongLine));
    },
  );

  it('the error appears on one line and the next lines carry it on (doc examples)', () => {
    expect(wrongResolution(C(5), exOf(C(5), '−3 × (−4)'), rat(-12))).toEqual({
      lines: linesOf('−3 × (−4) / = −(3 × 4) / = −12'),
      wrongLine: 1,
    });
    expect(wrongResolution(C(3), exOf(C(3), '−2 + 5 + (−4)'), rat(1))).toEqual({
      lines: linesOf('−2 + 5 + (−4) / = 5 + (−2) + (−4) / = 5 + (−6) / = 1'),
      wrongLine: 3,
    });
  });

  it('1 000 draws per course: 15 % to 25 % entirely right; otherwise the first wrong line is really wrong', () => {
    for (const n of RELATIFS) {
      const course = C(n);
      const rng = seededRng(400 + n);
      let allRight = 0;
      for (let i = 0; i < 1000; i++) {
        const level = ((i % 3) + 1) as Level;
        const q = buildQuestion(course, 'erreur', { rng, level, timesSeen: 0 });
        if (q.kind !== 'erreur') throw new Error('kind');
        const right = course.resolution(q.ex);
        if (q.wrongLine === null) {
          allRight++;
          expect(q.lines).toEqual(right);
          expect(q.errorType).toBeNull();
          continue;
        }
        expect(q.lines).toHaveLength(right.length);
        expect(q.wrongLine).toBeGreaterThan(0);
        expect(q.lines.slice(0, q.wrongLine)).toEqual(right.slice(0, q.wrongLine));
        expect(q.lines[q.wrongLine]).not.toBe(right[q.wrongLine]);
        // the shown result is a wrong answer recognised as the error
        const last = q.lines[q.lines.length - 1] as string;
        const shown = rat(Number(last.replace('= ', '')));
        expect(diagnose(course, q.ex, shown)?.errorType).toBe(q.errorType);
        expect(checkAnswer(course, q, { line: q.wrongLine }).correct).toBe(true);
        expect(checkAnswer(course, q, { line: null }).errorType).toBe('relecture');
      }
      expect(allRight / 1000).toBeGreaterThanOrEqual(0.15);
      expect(allRight / 1000).toBeLessThanOrEqual(0.25);
    }
  });

  it('uses the trap of the error asked', () => {
    for (const err of C(4).errors) {
      const rng = seededRng(9);
      for (let i = 0; i < 50; i++) {
        const q = buildQuestion(C(4), 'erreur', { rng, level: 1, timesSeen: 0, trapErrorType: err.id });
        if (q.kind !== 'erreur') throw new Error('kind');
        if (q.wrongLine !== null) expect(q.errorType).toBe(err.id);
      }
    }
  });
});
