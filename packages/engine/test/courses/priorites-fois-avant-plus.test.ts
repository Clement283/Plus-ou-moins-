import { describe, expect, it } from 'vitest';
import { ESSAIS_COURSES } from '../../src/courses/essais';
import { priorites2 as c } from '../../src/courses/essais/priorites-fois-avant-plus';
import { mkEx, textOf } from '../../src/courses/essais/priorites-commun';
import { calculerCalcul, judgeTypedCalcLine } from '../../src/exercises/calculer';
import { diag, generatorChecks } from './priorites-helpers';

const ex = (text: string) => mkEx(c.id, 1, text);

describe('Priorités, cours 2 — Les × et ÷ d’abord', () => {
  it('est dans le module Essais', () => expect(ESSAIS_COURSES).toContain(c));

  it('générateur : toujours un × ou un ÷ et un + ou − ; niveau 1 positif ; la priorité fait une différence', () => {
    generatorChecks(c, (e, level) => {
      const t = textOf(e).replace(/\(-/g, '(');
      return /[*/]/.test(t) && /[+-]/.test(t.replace(/^-/, '')) && (level > 1 || e.answer.n >= 0);
    });
  });

  it('erreurs reconnues', () => {
    expect(diag(c, ex('3 + 4 * 2'), 14)).toBe('priorite');
    expect(diag(c, ex('10 - 6 / 2'), 2)).toBe('priorite'); // (10 − 6) ÷ 2
    expect(diag(c, ex('15 - 8 / 2 * 3'), 3)).toBeUndefined();
    expect(diag(c, ex('20 - 12 / 4 * 2'), 12)).toBe('autre'); // 20 − 12 ÷ 8 non entier ; 12 n'est pas une erreur reconnue
    expect(diag(c, ex('3 + 4 * 2'), 12)).toBe('autre');
  });

  it('en lignes : × avant +, jamais dans l’autre sens', () => {
    const q = calculerCalcul(ex('3 + 4 * 2'), '3 + 4 * 2');
    expect(judgeTypedCalcLine(q, null, '3 + 8')).toMatchObject({ kind: 'juste' });
    expect(judgeTypedCalcLine(q, null, '7 * 2')).toMatchObject({ kind: 'fausse', errorId: 'priorite', title: 'On fait d’abord les × et les ÷.' });
  });
});
