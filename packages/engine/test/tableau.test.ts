import { describe, expect, it } from 'vitest';
import {
  checkAnswer,
  expectedGrid,
  factorText,
  getCourse,
  judgeLabels,
  judgeSigns,
  judgeValues,
  num,
  parseFactor,
  rat,
  tableauQuestion,
  tableauSolution,
  wholeText,
} from '../src';

const ex = { courseId: 'c05-multiplier-deux', level: 1 as const, expr: num(0), answer: rat(0) };
const course = getCourse('c05-multiplier-deux');
const f = (a: number, b: number) => ({ a, b });

describe('facteurs', () => {
  it('écrit et lit ax + b', () => {
    expect(factorText(f(1, -2))).toBe('x − 2');
    expect(factorText(f(2, 3))).toBe('2x + 3');
    expect(factorText(f(-1, 4))).toBe('−x + 4');
    expect(factorText(f(1, 0))).toBe('x');
    expect(parseFactor('x-2')).toEqual(f(1, -2));
    expect(parseFactor('2x + 3')).toEqual(f(2, 3));
    expect(parseFactor('3 − x')).toEqual(f(-1, 3));
    expect(parseFactor('−x')).toEqual(f(-1, 0));
    expect(parseFactor('x²')).toBeNull();
    expect(parseFactor('2')).toBeNull();
  });
});

describe('tableau de signes', () => {
  it('2x + 3 : − 0 +', () => expect(expectedGrid('seul', [f(2, 3)])).toEqual([['−', '0', '+']]));

  it('produit (x − 2)(x + 1)', () => {
    expect(expectedGrid('produit', [f(1, -2), f(1, 1)])).toEqual([
      ['−', '−', '−', '0', '+'],
      ['−', '0', '+', '+', '+'],
      ['+', '0', '−', '0', '+'],
    ]);
  });

  it('quotient (x + 1) ÷ (x − 2) : double barre sous la valeur du bas', () => {
    expect(expectedGrid('quotient', [f(1, 1), f(1, -2)])[2]).toEqual(['+', '0', '−', '‖', '+']);
  });

  it('valeurs : justes, désordre, fausses', () => {
    const fs = [f(1, -2), f(1, 1)];
    expect(judgeValues(fs, ['−1', '2'])).toEqual({ ok: true });
    expect(judgeValues(fs, ['2', '−1'])).toEqual({ ok: false, errorId: 'valeurs-ordre' });
    expect(judgeValues(fs, ['1', '2'])).toEqual({ ok: false, errorId: 'valeurs' });
    expect(judgeValues(fs, ['−1', ''])).toEqual({ ok: false, errorId: 'case-vide' });
    expect(judgeValues([f(2, 3)], ['−3/2'])).toEqual({ ok: true });
  });

  it('lignes : ordre libre, expression en entier', () => {
    const fs = [f(1, -2), f(1, 1)];
    expect(judgeLabels('produit', fs, ['x+1', 'x−2', '(x−2)(x+1)'])).toMatchObject({ ok: true });
    expect(judgeLabels('produit', fs, ['x−2', 'x+1', '(x+1)(x−2)'])).toMatchObject({ ok: true });
    expect(judgeLabels('produit', fs, ['x−2', 'x+1', 'x−2 x+1'])).toEqual({ ok: false, errorId: 'ligne-totale' });
    expect(judgeLabels('produit', fs, ['x−2', 'x+2', '(x−2)(x+2)'])).toEqual({ ok: false, errorId: 'lignes-facteurs' });
    const qf = [f(1, 1), f(1, -2)];
    expect(judgeLabels('quotient', qf, ['x+1', 'x−2', '(x+1)÷(x−2)'])).toMatchObject({ ok: true });
    expect(judgeLabels('quotient', qf, ['x+1', 'x−2', '(x−2)÷(x+1)'])).toEqual({ ok: false, errorId: 'ligne-totale' });
    expect(judgeLabels('seul', [f(2, 3)], ['2x+3'])).toMatchObject({ ok: true });
  });

  it('signes : première erreur nommée', () => {
    const fs = [f(1, -2), f(1, 1)];
    const good = expectedGrid('produit', fs).map((r) => r.slice());
    expect(judgeSigns('produit', fs, good).first).toBeNull();
    const bad = good.map((r) => r.slice());
    bad[2]![2] = '+';
    expect(judgeSigns('produit', fs, bad).first).toEqual({ r: 2, c: 2, errorId: 'regle-signes' });
    const noZero = good.map((r) => r.slice());
    noZero[1]![1] = '+';
    expect(judgeSigns('produit', fs, noZero).first?.errorId).toBe('zero-oublie');
    const qf = [f(1, 1), f(1, -2)];
    const q = expectedGrid('quotient', qf).map((r) => r.slice());
    q[2]![3] = '0';
    expect(judgeSigns('quotient', qf, q).first?.errorId).toBe('barre-oubliee');
    expect(judgeSigns('produit', fs, [[''], [''], ['']]).complete).toBe(false);
  });

  it('question et note', () => {
    const q = tableauQuestion(ex, 'produit', [f(1, -2), f(1, 1)]);
    expect(q.promptLatex).toBe('(x - 2)(x + 1)');
    expect(tableauSolution(q).roots).toEqual(['−1', '2']);
    expect(wholeText('produit', q.factors)).toBe('(x − 2)(x + 1)');
    expect(checkAnswer(course, q, { tableau: [], hinted: false })).toMatchObject({ correct: true, helped: false });
    const bad = checkAnswer(course, q, { tableau: ['regle-signes'], hinted: false });
    expect(bad).toMatchObject({ correct: false, errorType: 'regle-signes', errorFamily: 'signe', expected: '+ 0 − 0 +' });
    expect(() => tableauQuestion(ex, 'produit', [f(1, -2), f(2, -4)])).toThrow();
  });
});

import { gradeSolutions, gradeIntervalle, intervalleFromTable, solutionsQuestion, intervalText } from '../src';
const emptyIv = { left: '[' as const, lo: '', hi: '', right: ']' as const };

describe('lire S dans le tableau (réunion)', () => {
  it('(x − 2)(x + 1) ≥ 0 : ]−∞ , −1] ∪ [2 , +∞[', () => {
    const t = tableauQuestion(ex, 'produit', [f(1, -2), f(1, 1)]);
    const q = intervalleFromTable(ex, t, '>=');
    expect(intervalText(q.expected)).toBe(']−∞ , −1]');
    expect(intervalText(q.expected2!)).toBe('[2 , +∞[');
    const a = { left: ']' as const, lo: '−∞', hi: '−1', right: ']' as const };
    const b = { left: '[' as const, lo: '2', hi: '+∞', right: '[' as const };
    expect(gradeIntervalle(q, a, null, b)).toMatchObject({ correct: true, expected: ']−∞ , −1] ∪ [2 , +∞[' });
    expect(gradeIntervalle(q, a, null, null)).toMatchObject({ correct: false, errorId: 'reunion' });
    expect(gradeIntervalle(q, a, null, emptyIv).correct).toBe(false);
  });
  it('quotient ≤ 0 : la valeur interdite reste ouverte', () => {
    const t = tableauQuestion(ex, 'quotient', [f(1, 1), f(1, -2)]);
    const q = intervalleFromTable(ex, t, '<=');
    expect(intervalText(q.expected)).toBe('[−1 , 2[');
    expect(q.expected2).toBeUndefined();
  });
});

describe('solutions du produit nul', () => {
  const q = solutionsQuestion(ex, [f(1, 2), f(1, -3)]);
  it('juste, dans un ordre libre', () => {
    expect(q.promptLatex).toBe('(x + 2)(x - 3) = 0');
    expect(gradeSolutions(q, ['3', '−2'])).toMatchObject({ correct: true, expected: '{−2 ; 3}' });
    expect(checkAnswer(course, q, { values: ['−2', '3'], hinted: true })).toMatchObject({ correct: true, helped: true });
  });
  it('erreurs nommées', () => {
    expect(gradeSolutions(q, ['2', '3']).errorId).toBe('signe');
    expect(gradeSolutions(q, ['3', '3']).errorId).toBe('une-seule');
    expect(gradeSolutions(q, ['7', '3']).errorId).toBe('valeur');
    expect(gradeSolutions(q, ['3', '']).errorId).toBe('vide');
    expect(checkAnswer(course, q, { values: ['2', '3'], hinted: false })).toMatchObject({ correct: false, errorType: 'signe' });
  });
});
