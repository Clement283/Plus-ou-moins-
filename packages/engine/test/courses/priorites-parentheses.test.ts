import { describe, expect, it } from 'vitest';
import { ESSAIS_COURSES } from '../../src/courses/essais';
import { priorites3 as c } from '../../src/courses/essais/priorites-parentheses';
import { mkEx, textOf } from '../../src/courses/essais/priorites-commun';
import { calculerCalcul, judgeTypedCalcLine, courseCalcLines } from '../../src/exercises/calculer';
import { diag, generatorChecks } from './priorites-helpers';

const ex = (text: string) => mkEx(c.id, 1, text);

describe('Priorités, cours 3 — Les parenthèses d’abord', () => {
  it('est dans le module Essais', () => expect(ESSAIS_COURSES).toContain(c));

  it('générateur : au moins une parenthèse de calcul, pas imbriquée ; niveau 1 positif', () => {
    generatorChecks(c, (e, level) => {
      const t = textOf(e);
      return /\(/.test(t) && !/\([^)]*\(-?\d+\)[^)]*\)/.test(t) && !/\[/.test(t) && (level > 1 || e.answer.n >= 0);
    });
  });

  it('erreurs reconnues', () => {
    expect(diag(c, ex('2 * (3 + 4)'), 10)).toBe('parenthese');
    expect(diag(c, ex('2 * (3 - 5)'), 4)).toBe('signe');
    expect(diag(c, ex('2 * (3 - 5)'), 1)).toBe('parenthese'); // 2 × 3 − 5
    expect(diag(c, ex('3 + 2 * (8 - 5)'), 15)).toBe('priorite');
    expect(diag(c, ex('3 + 2 * (8 - 5)'), 9)).toBeUndefined();
  });

  it('en lignes : parenthèse d’abord, parenthèse ignorée expliquée', () => {
    const q = calculerCalcul(ex('3 + 2 * (8 - 5)'), '3 + 2 * (8 - 5)');
    expect(courseCalcLines(q)).toEqual(['3 + 2 \\times (8 - 5)', '3 + 2 \\times 3', '3 + 6', '9']);
    expect(judgeTypedCalcLine(q, null, '3 + 2 * 3')).toMatchObject({ kind: 'juste' });
    expect(judgeTypedCalcLine(q, null, '5 * (8 - 5)')).toMatchObject({ kind: 'fausse', errorId: 'priorite' });
    expect(judgeTypedCalcLine(q, null, '3 + 2 * 8 - 5')).toMatchObject({ kind: 'fausse', errorId: 'parenthese', title: 'Les parenthèses passent en premier.' });
  });
});
