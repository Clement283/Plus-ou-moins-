import { describe, expect, it } from 'vitest';
import { cst, equation, xt } from '../src/math/equation';
import { num } from '../src/math/expr';
import { rat } from '../src/math/rational';
import { calcSteps, calcTextLatex, calcTokensLatex, evalFlat, exprTokens, judgeCalcLine, parseCalc, textTokens } from '../src/math/calcul';
import { calcHint, calculerCalcul, calculerQuestion, courseCalcLines, gradeCalcul, judgeTypedCalcLine } from '../src/exercises/calculer';
import { checkAnswer, feedbackFor, getCourse, isAppEvent } from '../src';

const ex = { courseId: 'c05-multiplier-deux', level: 1 as const, expr: num(0), answer: rat(0) };
// −3x + 7 = −5, pour x = 4 : −3 × 4 + 7 → −12 + 7 → −5, 4 est solution
const q = calculerQuestion(ex, equation([xt(-3), cst(7)], [cst(-5)]), 4);
// 5 − x = 8, pour x = −3 : 5 − (−3) → 5 + 3 → 8
const q2 = calculerQuestion(ex, equation([cst(5), xt(-1)], [cst(8)]), -3);
const course = getCourse('c05-multiplier-deux');

describe('parseCalc', () => {
  it('reads what the keyboard types, with priorities', () => {
    expect(parseCalc('−3 × 4 + 7')).toMatchObject({ ok: true, value: rat(-5), ops: 2, key: '-3*4+7' });
    expect(parseCalc('-3*4+7')).toMatchObject({ ok: true, value: rat(-5) });
    expect(parseCalc('(−3) × 4 + 7')).toMatchObject({ ok: true, value: rat(-5), key: '-3*4+7' });
    expect(parseCalc('5 − (−3)')).toMatchObject({ ok: true, value: rat(8), ops: 1, key: '5--3' });
    expect(parseCalc('(2+3)×4')).toMatchObject({ ok: true, value: rat(20), flat: null });
    expect(parseCalc('−5')).toMatchObject({ ok: true, value: rat(-5), ops: 0 });
    expect(parseCalc('8÷2÷2')).toMatchObject({ ok: true, value: rat(2) });
  });
  it('says what is wrong', () => {
    expect(parseCalc('  ')).toEqual({ ok: false, error: 'vide' });
    expect(parseCalc('3 + x')).toEqual({ ok: false, error: 'signe-inconnu' });
    expect(parseCalc('3××4')).toEqual({ ok: false, error: 'mal-ecrit' });
    expect(parseCalc('(3+4')).toEqual({ ok: false, error: 'mal-ecrit' });
    expect(parseCalc('4÷0')).toEqual({ ok: false, error: 'zero' });
    expect(parseCalc('5−−3')).toEqual({ ok: false, error: 'negatif-sans-parentheses' });
    expect(parseCalc('4×−3')).toEqual({ ok: false, error: 'negatif-sans-parentheses' });
  });
});

describe('evalFlat, steps, latex', () => {
  it('normal and reversed priority', () => {
    const p = parseCalc('-3*4+7');
    const t = p.ok && p.flat ? p.flat : [];
    expect(evalFlat(t)).toEqual(rat(-5));
    expect(evalFlat(t, true)).toEqual(rat(-33)); // −3 × (4 + 7)
  });
  it('the course method, one operation at a time', () => {
    expect(courseCalcLines(q)).toEqual(['-3 \\times 4 + 7', '-12 + 7', '-5']);
    expect(courseCalcLines(q2)).toEqual(['5 - (-3)', '5 + 3', '8']);
    const lines = calcSteps(exprTokens(q.start)).map(calcTokensLatex);
    expect(lines).toHaveLength(3);
  });
  it('typed text is shown like a notebook', () => {
    expect(calcTextLatex('-3×4+7')).toBe('-3 \\times 4 + 7');
    expect(calcTextLatex('5−(−3)')).toBe('5 - (-3)');
  });
});

describe('judgeCalcLine', () => {
  const first = q.first;
  it('first line must replace x (parentheses around a negative are fine)', () => {
    expect(first).toEqual(['-3*4+7']);
    expect(judgeCalcLine(null, '−3 × 4 + 7', first)).toMatchObject({ kind: 'juste', final: false });
    expect(judgeCalcLine(null, '(−3) × 4 + 7', first)).toMatchObject({ kind: 'juste' });
    expect(judgeCalcLine(null, '−12 + 7', first)).toEqual({ kind: 'sans-remplacer' });
    expect(judgeCalcLine(null, '−5', first)).toEqual({ kind: 'sans-remplacer' });
    expect(q2.first).toEqual(['5--3']);
    expect(judgeCalcLine(null, '5 − (−3)', q2.first).kind).toBe('juste');
  });
  it('next lines: same value, moving forward, her own way', () => {
    const p = '−3 × 4 + 7';
    expect(judgeCalcLine(p, '−12 + 7', first)).toMatchObject({ kind: 'juste', final: false });
    expect(judgeCalcLine(p, '−5', first)).toMatchObject({ kind: 'juste', final: true }); // plusieurs étapes d'un coup
    expect(judgeCalcLine('5 − (−3)', '5 + 3', q2.first).kind).toBe('juste');
    expect(judgeCalcLine('5 + 3', '8', q2.first)).toMatchObject({ kind: 'juste', final: true });
  });
  it('not counted: recopied, longer', () => {
    expect(judgeCalcLine('−3 × 4 + 7', '(−3) × 4 + 7', first)).toEqual({ kind: 'recopiee' });
    expect(judgeCalcLine('−3 × 4 + 7', '−3 × 4 + 7 + 0', first)).toEqual({ kind: 'plus-longue' });
  });
  it('wrong: priority forgotten, sign slip, other', () => {
    const p = '−3 × 4 + 7';
    expect(judgeCalcLine(p, '−3 × 11', first)).toEqual({ kind: 'fausse', errorId: 'priorite' });
    expect(judgeCalcLine(p, '12 + 7', first)).toEqual({ kind: 'fausse', errorId: 'signe' }); // −3 × 4 écrit 12
    expect(judgeCalcLine(p, '−12 − 7', first)).toEqual({ kind: 'fausse', errorId: 'signe' }); // + 7 écrit − 7
    expect(judgeCalcLine(p, '−13 + 7', first)).toEqual({ kind: 'fausse', errorId: 'autre' });
    expect(judgeCalcLine('5 − (−3)', '5 − 3', q2.first)).toEqual({ kind: 'fausse', errorId: 'signe' });
  });
  it('unreadable', () => expect(judgeCalcLine('−3 × 4 + 7', '3 ×', first)).toEqual({ kind: 'illisible', error: 'mal-ecrit' }));
});

describe('judgeTypedCalcLine, hint, grading', () => {
  it('messages', () => {
    expect(judgeTypedCalcLine(q, null, '−12 + 7')).toMatchObject({ kind: 'sans-remplacer', title: 'Commence par remplacer x.' });
    expect(judgeTypedCalcLine(q, '−3 × 4 + 7', '−3 × 11')).toMatchObject({ kind: 'fausse', title: 'On fait d’abord les × et les ÷.' });
    expect(judgeTypedCalcLine(q, '−3 × 4 + 7', '5−−3')).toMatchObject({ kind: 'illisible' });
  });
  it('hint follows the course method', () => {
    expect(calcHint(q, null)).toContain('Remplace x par 4');
    expect(calcHint(q2, null)).toContain('(−3)');
    expect(calcHint(q, '−3 × 4 + 7')).toContain('multiplication');
    expect(calcHint(q, '−12 + 7')).toContain('de gauche à droite');
  });
  it('right when no line was wrong, even with her own steps', () => {
    expect(gradeCalcul(q, ['−3×4+7', '−12+7', '−5'])).toMatchObject({ finished: true, firstError: null });
    expect(gradeCalcul(q, ['−3×4+7', '−5'])).toMatchObject({ finished: true, firstError: null });
    expect(gradeCalcul(q, ['−3×4+7', '−12+7'])).toMatchObject({ finished: false });
  });
  it('the first wrong line is kept, even if corrected after; not counted lines are ignored', () => {
    const g = gradeCalcul(q, ['−12+7', '−3×4+7', '−3×11', '−12+7', '−3×4+7+0', '−5']);
    expect(g).toMatchObject({ finished: true, firstError: 'priorite' });
  });
});

describe('checkAnswer and feedback for « calculer »', () => {
  const lines = ['−3×4+7', '−12+7', '−5'];
  it('right: solution picked first', () =>
    expect(checkAnswer(course, q, { calcLines: lines, firstPick: true, hinted: false })).toMatchObject({ correct: true, helped: false, expected: 'solution' }));
  it('wrong verdict at the first pick', () => {
    const o = checkAnswer(course, q, { calcLines: lines, firstPick: false, hinted: false });
    expect(o).toMatchObject({ correct: false, errorType: 'verdict', expected: 'solution' });
    const f = feedbackFor(course, q, { calcLines: lines, firstPick: false, hinted: false }, o);
    expect(f.tone).toBe('faux');
    if (f.tone === 'faux') expect(f.explanation?.steps).toHaveLength(3);
  });
  it('wrong line on the way', () => {
    const o = checkAnswer(course, q, { calcLines: ['−3×4+7', '−3×11', '−12+7', '−5'], firstPick: true, hinted: false });
    expect(o).toMatchObject({ correct: false, errorType: 'priorite', errorFamily: 'calcul' });
    expect(checkAnswer(course, q, { calcLines: ['−3×4+7', '12+7', '−12+7', '−5'], firstPick: true, hinted: false })).toMatchObject({ errorType: 'signe', errorFamily: 'signe' });
  });
  it('with the hint: right, « avec aide »', () => {
    const a = { calcLines: lines, firstPick: true, hinted: true };
    const o = checkAnswer(course, q, a);
    expect(o).toMatchObject({ correct: true, helped: true });
    expect(feedbackFor(course, q, a, o)).toMatchObject({ tone: 'juste', note: 'Calculé avec l’indice : c’est noté « avec aide ».' });
  });
  it('not finished', () =>
    expect(checkAnswer(course, q, { calcLines: ['−3×4+7'], firstPick: true, hinted: false })).toMatchObject({ unfinished: true }));
  it('a non-solution', () => {
    const no = calculerQuestion(ex, equation([xt(-3), cst(7)], [cst(5)]), 4);
    expect(no.isSolution).toBe(false);
    expect(checkAnswer(course, no, { calcLines: lines, firstPick: false, hinted: false })).toMatchObject({ correct: true, expected: 'pas solution' });
  });
  it('the answer event accepts the new kind', () =>
    expect(
      isAppEvent({
        id: 'e1', userId: 'u', at: 1, day: '2026-11-26', kind: 'answer', activityId: 'a', activity: 'fin', moduleId: 'm', courseId: 'c',
        level: 1, questionKind: 'calculer', prompt: 'p', given: '-5', expected: 'solution', correct: true, unfinished: false,
        errorType: null, errorFamily: null, attempt: 1, skipped: false, durationMs: 10, helped: true,
      }),
    ).toBe(true));
});

// ——— Priorités : calcul seul, parenthèses et crochets ———
describe('parenthèses de calcul et crochets', () => {
  const lines = (text: string): string[] => calcSteps(textTokens(text)!).map(calcTokensLatex);
  it('lit les groupes, les crochets et garde la clé des négatifs', () => {
    expect(parseCalc('2 × (3 − 5)')).toMatchObject({ ok: true, value: rat(-4), ops: 2, key: '2*(3-5)' });
    expect(parseCalc('3 × [10 − (4 + 2)]')).toMatchObject({ ok: true, value: rat(12), key: '3*(10-(4+2))' });
    expect(parseCalc('(7)+1')).toMatchObject({ ok: true, key: '7+1' });
    expect(parseCalc('(−3 + 5) × 2')).toMatchObject({ ok: true, value: rat(4) });
    expect(parseCalc('[3 + 4)')).toEqual({ ok: false, error: 'mal-ecrit' });
    expect(parseCalc('(3 + 4')).toEqual({ ok: false, error: 'mal-ecrit' });
    expect(parseCalc('4 ÷ (2 − 2)')).toEqual({ ok: false, error: 'zero' });
  });
  it('la méthode : intérieur d’abord, une opération par ligne', () => {
    expect(lines('2 × (3 − 5)')).toEqual(['2 \\times (3 - 5)', '2 \\times (-2)', '-4']);
    expect(lines('10 − 3 + 2')).toEqual(['10 - 3 + 2', '7 + 2', '9']);
    expect(lines('3 × [10 − (4 + 2)]')).toEqual(['3 \\times [10 - (4 + 2)]', '3 \\times [10 - 6]', '3 \\times 4', '12']);
    expect(lines('(2 + 3) × (8 − 5)')).toEqual(['(2 + 3) \\times (8 - 5)', '5 \\times (8 - 5)', '5 \\times 3', '15']);
    expect(lines('8 − (3 − 5)')).toEqual(['8 - (3 - 5)', '8 - (-2)', '8 + 2', '10']);
  });
  it('lignes justes de l’élève, à sa façon', () => {
    const f = ['2*(3-5)'];
    expect(judgeCalcLine('2 × (3 − 5)', '2 × (−2)', f)).toMatchObject({ kind: 'juste', final: false });
    expect(judgeCalcLine('2 × (3 − 5)', '−4', f)).toMatchObject({ kind: 'juste', final: true });
    expect(judgeCalcLine('2 × (3 − 5)', '2 × [3 − 5]', f)).toEqual({ kind: 'recopiee' });
  });
  it('erreurs : gauche à droite, parenthèse ignorée, intérieure oubliée, signe, priorité', () => {
    expect(judgeCalcLine('10 − 3 + 2', '10 − 5', ['10-3+2'])).toEqual({ kind: 'fausse', errorId: 'gauche-droite' });
    expect(judgeCalcLine('12 ÷ 3 × 2', '12 ÷ 6', ['x'])).toEqual({ kind: 'fausse', errorId: 'gauche-droite' });
    expect(judgeCalcLine('12 ÷ 3 × 2', '4 × 2', ['x'])).toMatchObject({ kind: 'juste' });
    expect(judgeCalcLine('2 × (3 + 4)', '2 × 3 + 4', ['x'])).toEqual({ kind: 'fausse', errorId: 'parenthese' });
    expect(judgeCalcLine('2 × (3 + 4)', '10', ['x'])).toEqual({ kind: 'fausse', errorId: 'parenthese' });
    expect(judgeCalcLine('8 − (3 − 2)', '3', ['x'])).toEqual({ kind: 'fausse', errorId: 'parenthese' }); // 8 − 3 − 2
    expect(judgeCalcLine('2 × (3 − 5)', '2 × 2', ['x'])).toEqual({ kind: 'fausse', errorId: 'signe' });
    expect(judgeCalcLine('[10 − (4 + 2)] × 3', '[10 − 4 + 2] × 3', ['x'])).toEqual({ kind: 'fausse', errorId: 'ordre-parentheses' });
    expect(judgeCalcLine('3 + 4 × 2', '7 × 2', ['x'])).toEqual({ kind: 'fausse', errorId: 'priorite' });
    expect(judgeCalcLine('(3 + 4) × 2 − 1', '7 × 1', ['x'])).toEqual({ kind: 'fausse', errorId: 'priorite' }); // 2 − 1 d'abord
  });
});

describe('calcul seul (sans x)', () => {
  const ex = { courseId: 'essais', level: 1 as const, expr: num(0), answer: rat(9) };
  const q = calculerCalcul(ex, '10 - 3 + 2');
  it('la 1re ligne est déjà un pas ; pas de verdict', () => {
    expect(q).toMatchObject({ xValue: null, eqLatex: 'A = 10 - 3 + 2', startText: '10 - 3 + 2' });
    expect(judgeTypedCalcLine(q, null, '7 + 2')).toMatchObject({ kind: 'juste', final: false });
    expect(judgeTypedCalcLine(q, null, '10 − 3 + 2')).toMatchObject({ kind: 'recopiee' });
    expect(judgeTypedCalcLine(q, null, '10 − 5')).toMatchObject({ kind: 'fausse', errorId: 'gauche-droite' });
    expect(calcHint(q, null)).toContain('de gauche à droite');
    expect(courseCalcLines(q)).toEqual(['10 - 3 + 2', '7 + 2', '9']);
  });
  it('juste sans verdict, erreurs classées', () => {
    expect(checkAnswer(course, q, { calcLines: ['7+2', '9'], firstPick: true, hinted: false })).toMatchObject({ correct: true });
    expect(checkAnswer(course, q, { calcLines: ['10−5', '7+2', '9'], firstPick: true, hinted: false })).toMatchObject({ correct: false, errorType: 'gauche-droite', errorFamily: 'calcul' });
  });
  it('crochets signalés au clavier', () => {
    expect(calculerCalcul(ex, '3 * [10 - (4 + 2)]').brackets).toBe(true);
    expect(q.brackets).toBeUndefined();
  });
});
