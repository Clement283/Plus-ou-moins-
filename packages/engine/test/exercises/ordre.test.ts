import { describe, expect, it } from 'vitest';
import { buildQuestion } from '../../src/exercises/build';
import { checkAnswer } from '../../src/exercises/check';
import type { Question } from '../../src/exercises/types';
import { seededRng } from '../../src/rng';
import type { Level } from '../../src/courses/types';
import { exOf, tex } from '../courses/helpers';
import { C, RELATIFS } from './helpers';

/** A training « Étiquettes » question: resolution lines of a doc calculation, plus an optional trap tile. */
function ordreOf(n: number, display: string, trap?: { latex: string; errorType: string }): Question {
  const ex = exOf(C(n), display);
  const lines = C(n).resolution(ex);
  const tiles = lines.map((latex, i) => ({ id: `t${i + 1}`, latex }));
  if (trap) tiles.push({ id: `t${tiles.length + 1}`, latex: trap.latex });
  return { kind: 'ordre', ex, tiles: [...tiles].reverse(), solution: lines.map((_, i) => `t${i + 1}`), ...(trap ? { trapTile: trap } : {}) };
}

/** Ids of the tiles placed, from their texts (« on compare les textes »). */
const place = (q: Question, placed: string[]): { order: string[] } => {
  if (q.kind !== 'ordre') throw new Error('kind');
  return { order: placed.map((p) => q.tiles.find((t) => t.latex === tex(p))?.id as string) };
};

describe('Étiquettes à ordonner (doc 04 §3)', () => {
  const trap = { latex: '= -12', errorType: 'regle-signes' };

  it.each([
    // Calcul | Placé | Résultat | Erreur enregistrée
    [5, '−3 × (−4)', ['−3 × (−4)', '= +(3 × 4)', '= 12'], null],
    [5, '−3 × (−4)', ['−3 × (−4)', '= 12', '= +(3 × 4)'], 'ordre-etapes'],
    [5, '−3 × (−4)', ['−3 × (−4)', '= +(3 × 4)', '= −12'], 'regle-signes'],
    [4, '5 − (−3)', ['5 − (−3)', '= 5 + 3', '= 8'], null],
  ] as [number, string, string[], string | null][])('cours %i : %s, placé %j → %s', (n, display, placed, errorType) => {
    const q = ordreOf(n, display, n === 5 ? trap : undefined);
    const o = checkAnswer(C(n), q, place(q, placed));
    expect(o.correct).toBe(errorType === null);
    expect(o.unfinished).toBe(false);
    expect(o.errorType).toBe(errorType);
    expect(o.errorFamily).toBe(errorType === null ? null : errorType === 'ordre-etapes' ? 'autre' : 'signe');
    expect(o.given).toBe(placed.map(tex).join(' · '));
    expect(o.expected).toBe(C(n).resolution(exOf(C(n), display)).join(' · '));
  });

  it('the Cours 4 lesson tiles: the trap tile « − » records oppose-oublie', () => {
    const lesson = C(4).parts.find((p) => p.type === 'question' && p.question.kind === 'ordre');
    if (lesson?.type !== 'question') throw new Error('no lesson tiles');
    const q = lesson.question;
    expect(checkAnswer(C(4), q, place(q, ['5', '+', '3'])).correct).toBe(true);
    expect(checkAnswer(C(4), q, place(q, ['5', '−', '3'])).errorType).toBe('oppose-oublie');
  });

  it('builds the shuffled model resolution; a trap tile from the 3rd time on this course', () => {
    for (const n of RELATIFS) {
      const course = C(n);
      const rng = seededRng(300 + n);
      for (let i = 0; i < 300; i++) {
        const level = ((i % 3) + 1) as Level;
        const timesSeen = i % 4;
        const q = buildQuestion(course, 'ordre', { rng, level, timesSeen });
        if (q.kind !== 'ordre') throw new Error('kind');
        const lines = course.resolution(q.ex);
        const byId = new Map(q.tiles.map((t) => [t.id, t.latex]));
        expect(q.solution.map((id) => byId.get(id))).toEqual(lines);
        // no two tiles with the same text
        expect(new Set(q.tiles.map((t) => t.latex)).size).toBe(q.tiles.length);
        // shuffled
        expect(q.tiles.filter((t) => t.latex !== q.trapTile?.latex).map((t) => t.id)).not.toEqual(q.solution);
        if (timesSeen >= 2) {
          expect(q.trapTile).toBeDefined();
          expect(q.tiles).toHaveLength(lines.length + 1);
          expect(lines).not.toContain(q.trapTile?.latex);
          expect(q.tiles.map((t) => t.latex)).toContain(q.trapTile?.latex);
          expect(course.errors.map((e) => e.id)).toContain(q.trapTile?.errorType);
          // placing the trap records its error
          const placed = [...q.solution.slice(0, -1), q.tiles.find((t) => t.latex === q.trapTile?.latex)?.id as string];
          expect(checkAnswer(course, q, { order: placed }).errorType).toBe(q.trapTile?.errorType);
        } else {
          expect(q.trapTile).toBeUndefined();
          expect(q.tiles).toHaveLength(lines.length);
        }
        expect(checkAnswer(course, q, { order: q.solution }).correct).toBe(true);
      }
    }
  });

  it('the trap tile is the wrong line produced by the error asked', () => {
    const q = buildQuestion(C(5), 'ordre', { rng: seededRng(1), level: 1, timesSeen: 2, trapErrorType: 'regle-signes' });
    if (q.kind !== 'ordre') throw new Error('kind');
    expect(q.trapTile).toEqual({ latex: `= ${-q.ex.answer.n}`, errorType: 'regle-signes' });
  });
});
