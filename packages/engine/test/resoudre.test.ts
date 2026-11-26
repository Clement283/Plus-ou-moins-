import { describe, expect, it } from 'vitest';
import { cst, equation, xt } from '../src/math/equation';
import { num } from '../src/math/expr';
import { rat } from '../src/math/rational';
import { checkAnswer, feedbackFor, getCourse, isAppEvent, type Question } from '../src';
import { courseMethod, gradeResolution, hintFor, judgeTypedLine, solutionText } from '../src/exercises/resoudre';

const start = equation([xt(4), cst(-3)], [xt(1), cst(9)]); // 4x − 3 = x + 9
const course = getCourse('c05-multiplier-deux');
const q: Question = { kind: 'resoudre', ex: { courseId: course.id, level: 1, expr: num(0), answer: rat(4) }, start };

describe('judgeTypedLine', () => {
  it('right line with her own operation', () => {
    const r = judgeTypedLine(start, '4x − x = 9 + 3');
    expect(r).toMatchObject({ kind: 'juste', opLatex: '-x +3', final: false });
  });
  it('unreadable, recopied, wrong', () => {
    expect(judgeTypedLine(start, '4x−3').kind).toBe('illisible');
    expect(judgeTypedLine(start, 'x=3÷0')).toMatchObject({ kind: 'illisible', message: 'On ne divise jamais par 0.' });
    expect(judgeTypedLine(start, '−3 + 4x = 9 + x').kind).toBe('recopiee');
    expect(judgeTypedLine(start, '4x − 3 = 9')).toMatchObject({ kind: 'fausse', errorId: 'un-seul-cote' });
  });
  it('a reducible fraction: right, not finished', () =>
    expect(judgeTypedLine(equation([xt(3)], [cst(12)]), '3x÷3 = 12÷3')).toMatchObject({
      kind: 'juste',
      final: false,
      opLatex: '\\div 3',
      message: 'Simplifie la fraction pour avoir x tout seul.',
    }));
});

describe('hint, course method, solution', () => {
  it('hint follows the course method', () => {
    expect(hintFor(start)).toEqual({ text: 'Méthode du cours : fais cette opération des deux côtés.', opLatex: '-x' });
    expect(hintFor(equation([xt(4), xt(-1)], [cst(12)])).opLatex).toBeNull();
  });
  it('course method lines', () =>
    expect(courseMethod(start).map(({ latex, opLatex }) => ({ latex, opLatex }))).toEqual([
      { latex: '3x - 3 = 9', opLatex: '-x' },
      { latex: '3x = 12', opLatex: '+3' },
      { latex: 'x = 4', opLatex: '\\div 3' },
    ]));
  it('solution text', () => {
    expect(solutionText(start)).toBe('x = 4');
    expect(solutionText(equation([xt(3), cst(5)], [xt(5), cst(-1)], '>'))).toBe('x < 3');
  });
});

describe('grading the whole resolution', () => {
  it('right when no line was wrong, even with her own method', () => {
    const lines = ['4x − x = 9 + 3', '3x = 12', 'x = 4'];
    expect(gradeResolution(start, lines)).toMatchObject({ finished: true, firstError: null });
    const o = checkAnswer(course, q, { lines, hinted: false });
    expect(o).toMatchObject({ correct: true, helped: false, expected: 'x = 4' });
  });
  it('the first wrong line is kept, even if corrected after', () => {
    const lines = ['4x − 3 = 9', '3x − 3 = 9', '3x = 6', '3x = 12', 'x = 4'];
    const o = checkAnswer(course, q, { lines, hinted: false });
    expect(o).toMatchObject({ correct: false, errorType: 'un-seul-cote', unfinished: false });
    const f = feedbackFor(course, q, { lines, hinted: false }, o);
    expect(f.tone).toBe('faux');
    if (f.tone === 'faux') expect(f.explanation?.steps).toHaveLength(3);
  });
  it('with the hint: right, « avec aide »', () => {
    const o = checkAnswer(course, q, { lines: ['3x − 3 = 9', '3x = 12', 'x = 4'], hinted: true });
    expect(o).toMatchObject({ correct: true, helped: true });
    expect(feedbackFor(course, q, { lines: [], hinted: true }, o)).toMatchObject({ tone: 'juste', note: 'Résolu avec l’indice : c’est noté « avec aide ».' });
  });
  it('the answer event accepts « helped » and the new kind', () => {
    const base = {
      id: 'e1', userId: 'u', at: 1, day: '2026-11-26', kind: 'answer', activityId: 'a', activity: 'fin', moduleId: 'm', courseId: 'c',
      level: 1, questionKind: 'resoudre', prompt: 'p', given: 'x = 4', expected: 'x = 4', correct: true, unfinished: false,
      errorType: null, errorFamily: null, attempt: 1, skipped: false, durationMs: 10,
    };
    expect(isAppEvent(base)).toBe(true);
    expect(isAppEvent({ ...base, helped: true })).toBe(true);
    expect(isAppEvent({ ...base, helped: 'oui' })).toBe(false);
  });
});
