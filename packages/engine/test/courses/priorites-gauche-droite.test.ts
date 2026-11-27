import { describe, expect, it } from 'vitest';
import { ESSAIS_COURSES } from '../../src/courses/essais';
import { priorites1 as c } from '../../src/courses/essais/priorites-gauche-droite';
import { calculerCalcul, judgeTypedCalcLine } from '../../src/exercises/calculer';
import { mkEx } from '../../src/courses/essais/priorites-commun';
import { checkAnswer, courseRunItems } from '../../src';
import { seededRng } from '../../src/rng';
import { diag, generatorChecks } from './priorites-helpers';
import { textOf } from '../../src/courses/essais/priorites-commun';

const ex = (text: string) => mkEx(c.id, 1, text);

describe('Priorités, cours 1 — Calculer de gauche à droite', () => {
  it('est dans le module Essais', () => expect(ESSAIS_COURSES).toContain(c));

  it('générateur : que des + et −, ou que des × et ÷ ; résultats positifs au niveau 1 ; piège toujours possible', () => {
    generatorChecks(c, (e, level) => {
      const t = textOf(e).replace(/\(-/g, '(');
      const mixed = /[+-]/.test(t.replace(/^-/, '')) && /[*/]/.test(t);
      return !mixed && (level > 1 || e.answer.n >= 0);
    });
  });

  it('erreurs : gauche à droite non respecté', () => {
    expect(diag(c, ex('10 - 3 + 2'), 5)).toBe('gauche-droite');
    expect(diag(c, ex('12 / 3 * 2'), 2)).toBe('gauche-droite');
    expect(diag(c, ex('15 - 4 + 6 - 2'), 15)).toBeUndefined();
    expect(diag(c, ex('15 - 4 + 6 - 2'), 7)).toBe('gauche-droite'); // 15 − (4 + (6 − 2))... 15 − 8 = 7
    expect(diag(c, ex('10 - 3 + 2'), 4)).toBe('autre');
  });

  it('message de l’erreur et du calcul en lignes', () => {
    const q = calculerCalcul(ex('10 - 3 + 2'), '10 - 3 + 2');
    expect(judgeTypedCalcLine(q, null, '10 − 5')).toMatchObject({ kind: 'fausse', errorId: 'gauche-droite', title: 'Même priorité : on va de gauche à droite.' });
    expect(judgeTypedCalcLine(q, null, '7 + 2')).toMatchObject({ kind: 'juste' });
    expect(checkAnswer(c as never, q, { calcLines: ['7+2', '9'], firstPick: true, hinted: false })).toMatchObject({ correct: true });
  });

  it('cinq exercices de fin « calculer », sans x', () => {
    const fins = courseRunItems(c, seededRng(3)).filter((i) => i.type === 'question' && i.activity === 'fin');
    expect(fins).toHaveLength(5);
    for (const f of fins) expect(f.type === 'question' && f.question).toMatchObject({ kind: 'calculer', xValue: null });
  });
});
