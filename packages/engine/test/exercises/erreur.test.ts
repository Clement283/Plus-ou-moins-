import { describe, expect, it } from 'vitest';
import { buildQuestion } from '../../src/exercises/build';
import { erreurFor, resolutionWith } from '../../src/exercises/build/erreur';
import { checkAnswer } from '../../src/exercises/check';
import type { Question } from '../../src/exercises/types';
import { rat } from '../../src/math/rational';
import { seededRng } from '../../src/rng';
import { diagnose } from '../../src/courses';
import type { CourseDef, ErrorDef, Level } from '../../src/courses/types';
import { exOf, tex } from '../courses/helpers';
import { C, RELATIFS } from './helpers';

/** Doc display « a / = b / = c » → LaTeX lines. */
const linesOf = (shown: string): string[] => shown.split(' / ').map(tex);
const err = (course: CourseDef, id: string): ErrorDef => course.errors.find((e) => e.id === id) as ErrorDef;

/** Built by the builder: entirely right (error null) or with that error on that doc calculation. */
function built(n: number, display: string, errorId: string | null): Question {
  const course = C(n);
  const q = erreurFor(course, exOf(course, display), errorId === null ? null : err(course, errorId), seededRng(1));
  if (!q) throw new Error('not built');
  return q;
}

describe("Trouver l'erreur (doc 04 §4)", () => {
  it.each([
    // Résolution affichée | Bonne réponse | Elle touche | Erreur enregistrée (lines numbered from 0)
    [5, '−3 × (−4)', 'regle-signes', '−3 × (−4) / = −(3 × 4) / = −12', 1, 1, null],
    [5, '−3 × (−4)', 'regle-signes', '−3 × (−4) / = −(3 × 4) / = −12', 1, 2, 'regle-signes'],
    [4, '5 − (−3)', 'oppose-oublie', '5 − (−3) / = 5 − 3 / = 2', 1, 1, null],
    [4, '5 − (−3)', null, '5 − (−3) / = 5 + 3 / = 8', null, 2, 'relecture'],
    [3, '−2 + 5 + (−4)', 'signe-inverse', '−2 + 5 + (−4) / = 5 + (−2) + (−4) / = 5 + (−6) / = 1', 3, null, 'relecture'],
  ] as [number, string, string | null, string, number | null, number | null, string | null][])(
    'cours %i : %s (%s) — %s',
    (n, display, errorId, shown, wrongLine, touched, errorType) => {
      const q = built(n, display, errorId);
      expect(q).toMatchObject({ lines: linesOf(shown), wrongLine, errorType: errorId });
      const o = checkAnswer(C(n), q, { line: touched });
      expect(o.correct).toBe(errorType === null);
      expect(o.errorType).toBe(errorType);
      expect(o.errorFamily).toBe(errorType === null ? null : errorType === 'relecture' ? 'autre' : 'signe');
      const show = (l: number | null): string => (l === null ? 'Tout est juste' : (q.kind === 'erreur' && q.lines[l]) || '');
      expect(o.given).toBe(show(touched));
      expect(o.expected).toBe(show(wrongLine));
    },
  );

  it('the Cours 4 lesson pattern (doc 06): 6 − (−2) = 6 − 2 = 4, wrong at the 2nd step', () => {
    const lesson = C(4).parts.find((p) => p.type === 'question' && p.question.kind === 'erreur');
    if (lesson?.type !== 'question' || lesson.question.kind !== 'erreur') throw new Error('no lesson question');
    const q = built(4, '6 − (−2)', 'oppose-oublie');
    expect(q).toMatchObject({ lines: lesson.question.lines, wrongLine: lesson.question.wrongLine, errorType: 'oppose-oublie' });
    expect(q).toMatchObject({ lines: linesOf('6 − (−2) / = 6 − 2 / = 4'), wrongLine: 1 });
  });

  // How each error of courses 1–7 shows, the way a student writes it; null = not that error alone.
  it.each([
    [1, '−3 + (−5)', 'signe-oublie', 8, '−3 + (−5) / = +(3 + 5) / = 8', 1],
    [1, '−3 + (−5)', 'soustraction-au-lieu-addition', -2, '−3 + (−5) / = −(5 − 3) / = −2', 1],
    [1, '−3 + (−5)', 'soustraction-au-lieu-addition', 2, null, null],
    [2, '−3 + 5', 'signe-du-mauvais-nombre', -2, '−3 + 5 / = −(5 − 3) / = −2', 1],
    [2, '−3 + 5', 'addition-au-lieu-soustraction', 8, '−3 + 5 / = +(5 + 3) / = 8', 1],
    [2, '−3 + 5', 'addition-au-lieu-soustraction', -8, null, null],
    [2, '−7 + 7', 'addition-au-lieu-soustraction', -14, '−7 + 7 / = −(7 + 7) / = −14', 1],
    [3, '−2 + 5 + (−4)', 'tout-additionne', -11, '−2 + 5 + (−4) / = 5 + (−2) + (−4) / = −(5 + 6) / = −11', 2],
    [3, '−2 + 5 + (−4)', 'tout-additionne', 11, null, null],
    [3, '−2 + 5 + (−4)', 'terme-oublie', -6, '−2 + 5 + (−4) / = −2 + (−4) / = −6', 1],
    [3, '−2 + 5 + (−4)', 'terme-oublie', 3, '−2 + 5 + (−4) / = 5 + (−2) / = 3', 1],
    [4, '5 − (−3)', 'signe-inverse', -8, '5 − (−3) / = 5 + 3 / = −8', 2],
    [4, '3 − 7', 'oppose-oublie', 10, '3 − 7 / = 3 + 7 / = 10', 1],
    [5, '−3 × (−4)', 'addition-au-lieu-multiplication', -7, '−3 × (−4) / = −3 + (−4) / = −7', 1],
    [5, '−3 × (−4)', 'addition-au-lieu-multiplication', 7, '−3 × (−4) / = +(3 + 4) / = 7', 1],
    [5, '6 × (−2)', 'addition-au-lieu-multiplication', 8, null, null],
    [5, '−3 × (−4)', 'erreur-table', 16, '−3 × (−4) / = +(3 × 4) / = 16', 2],
    [6, '−12 ÷ 4', 'regle-signes', 3, '−12 ÷ 4 / = +(12 ÷ 4) / = 3', 1],
    [6, '−12 ÷ 4', 'multiplication-au-lieu-division', -48, '−12 ÷ 4 / = −(12 × 4) / = −48', 1],
    [6, '−12 ÷ 4', 'multiplication-au-lieu-division', 48, null, null],
    [7, '−2 × 3 × (−4)', 'parite-signes', -24, '−2 × 3 × (−4) / = −(2 × 3 × 4) / = −24', 1],
    [7, '−2 × 3 × (−4)', 'addition-au-lieu-multiplication', -3, '−2 × 3 × (−4) / = −2 + 3 + (−4) / = −3', 1],
    [7, '−2 × 3 × (−4)', 'addition-au-lieu-multiplication', 9, '−2 × 3 × (−4) / = +(2 + 3 + 4) / = 9', 1],
    [7, '−2 × 3 × (−4)', 'addition-au-lieu-multiplication', -9, null, null],
  ] as [number, string, string, number, string | null, number | null][])(
    'cours %i : %s, %s → %i',
    (n, display, id, w, shown, wrongLine) => {
      const course = C(n);
      const e = err(course, id);
      expect(e.wrongResolution).toBeDefined();
      const r = resolutionWith(course, e, exOf(course, display), rat(w));
      expect(r).toEqual(shown === null ? null : { lines: linesOf(shown), wrongLine });
    },
  );

  it('fallback for an error without its own wrong resolution: never two independent errors', () => {
    const course = C(5);
    const ex = exOf(course, '−3 × (−4)');
    const bare = (id: string): ErrorDef => ({ ...err(course, id), wrongResolution: undefined });
    // the opposite: sign line and result wrong together (one sign error)
    expect(resolutionWith(course, bare('regle-signes'), ex, rat(-12))).toEqual({ lines: linesOf('−3 × (−4) / = −(3 × 4) / = −12'), wrongLine: 1 });
    // only the result line wrong
    expect(resolutionWith(course, bare('erreur-table'), ex, rat(16))).toEqual({ lines: linesOf('−3 × (−4) / = +(3 × 4) / = 16'), wrongLine: 2 });
    // a flipped sign line plus another wrong result: refused
    expect(resolutionWith(course, bare('addition-au-lieu-multiplication'), ex, rat(-7))).toBeNull();
  });

  it('every error of courses 1–7 has its own wrong resolution', () => {
    for (const n of RELATIFS) for (const e of C(n).errors) expect(e.wrongResolution, `${n} ${e.id}`).toBeDefined();
  });

  it('1 000 draws per course and level: 15 % to 25 % entirely right; otherwise one error, carried on', () => {
    for (const n of RELATIFS) {
      const course = C(n);
      for (const level of [1, 2, 3] as Level[]) {
        const rng = seededRng(400 + 10 * n + level);
        let allRight = 0;
        for (let i = 0; i < 1000; i++) {
          const q = buildQuestion(course, 'erreur', { rng, level, timesSeen: 0 });
          if (q.kind !== 'erreur') throw new Error('kind');
          const right = course.resolution(q.ex);
          if (q.wrongLine === null) {
            allRight++;
            expect(q.lines).toEqual(right);
            expect(q.errorType).toBeNull();
            continue;
          }
          const shown = q.lines.join(' / ');
          const e = err(course, q.errorType as string);
          // before the wrong line: the model; the wrong line differs
          expect(q.wrongLine, shown).toBeGreaterThan(0);
          expect(q.lines.slice(0, q.wrongLine), shown).toEqual(right.slice(0, q.wrongLine));
          expect(q.lines[q.wrongLine], shown).not.toBe(right[q.wrongLine]);
          // the result shown is a wrong value of that very error, and the error's own resolution of it
          const last = q.lines[q.lines.length - 1] as string;
          const w = rat(Number(last.replace('= ', '')));
          expect(e.wrongValues(q.ex), shown).toContainEqual(w);
          expect(diagnose(course, q.ex, w)?.errorType, shown).toBe(e.id);
          expect(e.wrongResolution?.(q.ex, w), shown).toEqual({ lines: q.lines, wrongLine: q.wrongLine });
          expect(checkAnswer(course, q, { line: q.wrongLine }).correct).toBe(true);
          expect(checkAnswer(course, q, { line: null }).errorType).toBe('relecture');
        }
        expect(allRight / 1000).toBeGreaterThanOrEqual(0.15);
        expect(allRight / 1000).toBeLessThanOrEqual(0.25);
      }
    }
  });

  it('uses the trap of the error asked', () => {
    for (const e of C(4).errors) {
      const rng = seededRng(9);
      for (let i = 0; i < 50; i++) {
        const q = buildQuestion(C(4), 'erreur', { rng, level: 1, timesSeen: 0, trapErrorType: e.id });
        if (q.kind !== 'erreur') throw new Error('kind');
        if (q.wrongLine !== null) expect(q.errorType).toBe(e.id);
      }
    }
  });

  it('builds the doc rows through buildQuestion too (seeds found by search)', () => {
    const find = (n: number, display: string, errorId: string | null): boolean => {
      for (let s = 0; s < 20000; s++) {
        const q = buildQuestion(C(n), 'erreur', { rng: seededRng(s), level: 1, timesSeen: 0, ...(errorId ? { trapErrorType: errorId } : {}) });
        if (q.kind === 'erreur' && q.lines[0] === tex(display) && q.errorType === errorId) return true;
      }
      return false;
    };
    expect(find(5, '−3 × (−4)', 'regle-signes')).toBe(true);
    expect(find(4, '5 − (−3)', 'oppose-oublie')).toBe(true);
    expect(find(4, '5 − (−3)', null)).toBe(true);
  });
});
