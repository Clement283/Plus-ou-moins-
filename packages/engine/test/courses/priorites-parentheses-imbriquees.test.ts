import { describe, expect, it } from 'vitest';
import { ESSAIS_COURSES } from '../../src/courses/essais';
import { priorites4 as c } from '../../src/courses/essais/priorites-parentheses-imbriquees';
import { mkEx, textOf } from '../../src/courses/essais/priorites-commun';
import { calculerCalcul, courseCalcLines, judgeTypedCalcLine } from '../../src/exercises/calculer';
import { diag, generatorChecks } from './priorites-helpers';

const ex = (text: string) => mkEx(c.id, 1, text);

describe('Priorités, cours 4 — Parenthèses dans des parenthèses', () => {
  it('est dans le module Essais', () => expect(ESSAIS_COURSES).toContain(c));

  it('générateur : une parenthèse dans un crochet ; niveau 1 positif', () => {
    generatorChecks(c, (e, level) => {
      const t = textOf(e);
      return /\[/.test(t) && /\(/.test(t) && (level > 1 || e.answer.n >= 0);
    });
  });

  it('erreurs reconnues', () => {
    expect(diag(c, ex('2 * [10 - (4 + 2)]'), 16)).toBe('ordre-parentheses'); // 2 × [10 − 4 + 2]
    expect(diag(c, ex('2 * [10 - (4 + 2)]'), 14)).toBe('parenthese'); // crochet oublié : 2 × 10 − (4 + 2)
    expect(diag(c, ex('3 * [10 - (4 + 2)]'), 12)).toBeUndefined();
    expect(diag(c, ex('[2 + 3 * (8 - 5)] - 1'), 14)).toBe('priorite');
  });

  it('en lignes avec crochets', () => {
    const q = calculerCalcul(ex('3 * [10 - (4 + 2)]'), '3 * [10 - (4 + 2)]');
    const q2 = calculerCalcul(ex('2 * [10 - (4 + 2)]'), '2 * [10 - (4 + 2)]');
    expect(courseCalcLines(q)).toEqual(['3 \\times [10 - (4 + 2)]', '3 \\times [10 - 6]', '3 \\times 4', '12']);
    expect(judgeTypedCalcLine(q, null, '3 * [10 - 6]')).toMatchObject({ kind: 'juste' });
    expect(judgeTypedCalcLine(q2, null, '2 * [6 + 2]')).toMatchObject({ kind: 'fausse', errorId: 'ordre-parentheses', title: 'Commence par la parenthèse la plus intérieure.' });
  });
});
