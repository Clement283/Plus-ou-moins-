import { describe, expect, it } from 'vitest';
import { ESSAIS_COURSES } from '../../src/courses/essais';
import { priorites7 as c } from '../../src/courses/essais/priorites-moins-devant-parenthese';
import { mkEx, textOf } from '../../src/courses/essais/priorites-commun';
import { calculerCalcul, courseCalcLines, judgeTypedCalcLine } from '../../src/exercises/calculer';
import { diag, generatorChecks } from './priorites-helpers';

const ex = (text: string) => mkEx(c.id, 1, text);

describe('Priorités, cours 7 — Un moins devant une parenthèse (partie nombres)', () => {
  it('est dans le module Essais', () => expect(ESSAIS_COURSES).toContain(c));

  it('générateur : une parenthèse précédée de + ou −, un − devant une parenthèse qui change la valeur', () => {
    generatorChecks(c, (e, level) => /[+-] \(/.test(textOf(e)) && (level > 1 || e.answer.n >= 0));
  });

  it('erreurs reconnues', () => {
    expect(diag(c, ex('8 - (3 - 2)'), 3)).toBe('parenthese'); // 8 − 3 − 2
    expect(diag(c, ex('8 - (3 + 2)'), 7)).toBe('parenthese'); // 8 − 3 + 2
    expect(diag(c, ex('8 - (3 - 2)'), 7)).toBeUndefined();
    expect(diag(c, ex('8 + (3 - 2)'), 13)).toBe('signe'); // 8 + (3 + 2)
  });

  it('en lignes : les deux chemins sont acceptés', () => {
    const q = calculerCalcul(ex('15 - (4 - 9)'), '15 - (4 - 9)');
    expect(courseCalcLines(q)).toEqual(['15 - (4 - 9)', '15 - (-5)', '15 + 5', '20']);
    expect(judgeTypedCalcLine(q, null, '15 − (−5)')).toMatchObject({ kind: 'juste' });
    expect(judgeTypedCalcLine(q, null, '15 − 4 + 9')).toMatchObject({ kind: 'juste' }); // parenthèse enlevée, signes changés
    expect(judgeTypedCalcLine(q, null, '15 − 4 − 9')).toMatchObject({ kind: 'fausse', errorId: 'parenthese' });
  });
});
