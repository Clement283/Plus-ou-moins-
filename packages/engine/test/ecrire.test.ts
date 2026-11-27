import { describe, expect, it } from 'vitest';
import { type EcrireQuestion, checkAnswer, getCourse, gradeEcrire, judgeEcrire, linearText } from '../src';
import { makeExercise } from '../src/courses/calculs/shared';
import { num } from '../src/math/expr';

const course = getCourse('priorites-moins-devant-parenthese');
const ex = makeExercise(course.id, 1, num(21));

const phrase: EcrireQuestion = {
  kind: 'ecrire',
  ex,
  mode: 'calcul',
  context: { kind: 'phrase', text: 'D est la différence de 30 et de la somme de 2 et de 7.' },
  name: 'D',
  steps: [{ instr: null, accepted: ['30 - (2 + 7)'] }],
  hint: 'La dernière opération est une différence : 30 − (…).',
};

describe('« ecrire », mode calcul', () => {
  const v = (t: string) => judgeEcrire(phrase, 0, t);
  it('juge la structure, pas seulement la valeur', () => {
    expect(v('30−(2+7)').kind).toBe('juste');
    expect(v('(30)−((2+7))').kind).toBe('juste'); // parenthèses inutiles acceptées
    expect(v('30−2−7').kind).toBe('gris'); // même valeur, autre calcul : ne compte pas
    expect(v('21').kind).toBe('gris'); // le résultat au lieu du calcul
    expect(v('30−2+7')).toMatchObject({ kind: 'faux', errorId: 'parentheses-oubliees' });
    expect(v('(2+7)−30')).toMatchObject({ kind: 'faux', errorId: 'ordre' });
    expect(v('30+2+7')).toMatchObject({ kind: 'faux', errorId: 'autre' });
  });
  it('une phrase : une seule réponse jugée', () => {
    expect(gradeEcrire(phrase, ['30−(2+7)'])).toMatchObject({ finished: true, correct: true });
    expect(gradeEcrire(phrase, ['30−2+7'])).toMatchObject({ finished: true, correct: false, errorId: 'parentheses-oubliees' });
    expect(checkAnswer(course, phrase, { written: ['30−(2+7)'], calcul: [], hinted: true })).toMatchObject({ correct: true, helped: true });
  });
  it('programme pas à pas : une étape fausse se corrige mais compte', () => {
    const prog: EcrireQuestion = {
      ...phrase,
      context: { kind: 'programme' },
      name: null,
      steps: [
        { instr: 'Pars du nombre 4 et ajoute-lui 3.', accepted: ['4 + 3'] },
        { instr: 'Multiplie le résultat par 5.', accepted: ['(4 + 3) * 5', '5 * (4 + 3)'] },
      ],
    };
    expect(gradeEcrire(prog, ['4+3'])).toMatchObject({ finished: false });
    expect(gradeEcrire(prog, ['4+3', '(4+3)×5'])).toMatchObject({ finished: true, correct: true });
    expect(gradeEcrire(prog, ['4+3', '4+3×5', '5×(4+3)'])).toMatchObject({ finished: true, correct: false, errorId: 'parentheses-oubliees' });
  });
  it('problème : le calcul écrit, puis calculé ligne par ligne', () => {
    const pb: EcrireQuestion = { ...phrase, context: { kind: 'phrase', text: 'Léo…' }, name: 'A', steps: [{ instr: null, accepted: ['20 - (7 + 3 * 2)'] }], compute: true };
    expect(gradeEcrire(pb, ['20−(7+3×2)'])).toMatchObject({ finished: false });
    expect(gradeEcrire(pb, ['20−(7+3×2)'], ['20−(7+6)', '20−13', '7'])).toMatchObject({ finished: true, correct: true });
    expect(gradeEcrire(pb, ['20−(7+3×2)'], ['20−13×2', '20−(7+6)', '20−13', '7'])).toMatchObject({ finished: true, correct: false });
  });
});

describe('« ecrire », mode réécrire (lettres)', () => {
  const q: EcrireQuestion = {
    ...phrase,
    mode: 'reecrire',
    context: { kind: 'latex', latex: '5 - (x - 3)' },
    name: null,
    steps: [{ instr: null, accepted: [] }],
    linear: { a: -1, b: 8, k: 5, op: '-', p: 1, q: -3 },
    hint: 'Change le signe de chaque terme de la parenthèse.',
  };
  const v = (t: string) => judgeEcrire(q, 0, t);
  it('juste avec ou sans réduire ; la forme réduite est montrée', () => {
    expect(v('8−x')).toMatchObject({ kind: 'juste', message: '' });
    expect(v('−x+8').kind).toBe('juste');
    expect(v('5−x+3')).toMatchObject({ kind: 'juste', message: 'Tu peux encore réduire : 8 − x.' });
    expect(gradeEcrire(q, ['5−x+3'])).toMatchObject({ correct: true, message: 'Tu peux encore réduire : 8 − x.' });
  });
  it('erreurs reconnues', () => {
    expect(v('5−x−3')).toMatchObject({ kind: 'faux', errorId: 'un-seul-signe' });
    expect(v('5+x−3')).toMatchObject({ kind: 'faux', errorId: 'moins-oublie' });
    expect(v('5−(x−3)').kind).toBe('gris');
    expect(v('5+x+3')).toMatchObject({ kind: 'faux', errorId: 'expression-fausse' });
  });
  it('linearText', () => {
    expect(linearText(-1, 8)).toBe('8 − x');
    expect(linearText(-2, 5)).toBe('5 − 2x');
    expect(linearText(3, -1)).toBe('−1 + 3x');
    expect(linearText(-1, 0)).toBe('−x');
  });
});
