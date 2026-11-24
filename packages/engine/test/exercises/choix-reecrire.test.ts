import { describe, expect, it } from 'vitest';
import { checkAnswer } from '../../src/exercises/check';
import { normalizeCalc } from '../../src/exercises/rewrite';
import { feedbackFor } from '../../src/feedback';
import type { Question } from '../../src/exercises/types';
import { rat } from '../../src/math/rational';
import { num, op } from '../../src/math/expr';
import { C } from './helpers';

const course = C(0);
const ex = { courseId: course.id, level: 1 as const, expr: op('*', num(6), num(-2)), answer: rat(-12) };

const choix: Extract<Question, { kind: 'choix' }> = {
  kind: 'choix', ex, calcLatex: '6 \\times -2', prompt: 'Que faut-il changer ?',
  options: [{ label: 'Rien', why: 'Il y a un souci.' }, { label: 'Des parenthèses', why: 'Oui : le − se met entre parenthèses.' }],
  correctIndex: 1,
};
const reecrire: Extract<Question, { kind: 'reecrire' }> = {
  kind: 'reecrire', ex, givenLatex: '6 \\times -2', expected: '6×(−2)',
  specific: [{ answer: '6×−2', message: 'Le × et le − se touchent encore. Mets −2 entre parenthèses.', errorType: 'signes-colles', correct: false }],
  fallback: 'Réécris le calcul avec −2 entre parenthèses.', steps: ['Étape 1'],
};

describe('normalizeCalc', () => {
  it('normalise espaces, -, *, x, /', () => {
    expect(normalizeCalc(' 6 * (-2) ')).toBe('6×(−2)');
    expect(normalizeCalc('6x(-2)')).toBe('6×(−2)');
    expect(normalizeCalc('8/2')).toBe('8÷2');
  });
});

describe('choix', () => {
  it('juste', () => {
    const o = checkAnswer(course, choix, { choice: 1 });
    expect(o.correct).toBe(true);
    expect(o.message).toBe(choix.options[1]!.why);
  });
  it('faux', () => {
    const o = checkAnswer(course, choix, { choice: 0 });
    expect(o.correct).toBe(false);
    expect(o.errorType).toBeNull();
    expect(o.errorFamily).toBeNull();
    expect(o.message).toBe('Il y a un souci.');
  });
  it('devinette fausse : ton pas-fini', () => {
    const a = { choice: 0 };
    const f = feedbackFor(course, choix, a, checkAnswer(course, choix, a), { guess: true });
    expect(f.tone).toBe('pas-fini');
    expect(f.title).toBe("Pas tout à fait, et c'est normal.");
  });
  it('juste : titre Juste !', () => {
    const a = { choice: 1 };
    expect(feedbackFor(course, choix, a, checkAnswer(course, choix, a)).title).toBe('Juste !');
  });
});

describe('reecrire', () => {
  it('réponse juste, quelle que soit la saisie', () => {
    for (const text of ['6 × (−2)', '6*(-2)', '6x(-2)']) expect(checkAnswer(course, reecrire, { text }).correct).toBe(true);
  });
  it('réponse prévue', () => {
    const o = checkAnswer(course, reecrire, { text: '6×-2' });
    expect(o.correct).toBe(false);
    expect(o.message).toBe(reecrire.specific[0]!.message);
    expect(o.errorType).toBe('signes-colles');
  });
  it('autre réponse : fallback', () => {
    const o = checkAnswer(course, reecrire, { text: '7' });
    expect(o.correct).toBe(false);
    expect(o.message).toBe(reecrire.fallback);
  });
  it('faux : étape par étape', () => {
    const a = { text: '7' };
    const f = feedbackFor(course, reecrire, a, checkAnswer(course, reecrire, a));
    expect(f.tone).toBe('faux');
    if (f.tone === 'faux') expect(f.explanation?.steps).toEqual([{ t: 'text', text: 'Étape 1' }]);
  });
});

describe('erreur avec accept', () => {
  const q: Extract<Question, { kind: 'erreur' }> = { kind: 'erreur', ex: { ...ex, courseId: C(5).id }, lines: ['6', '×', '−2'], wrongLine: 2, errorType: 'signes-colles', accept: [1, 2] };
  it('une case acceptée est juste', () => expect(checkAnswer(C(5), q, { line: 1 }).correct).toBe(true));
  it('une autre est fausse', () => expect(checkAnswer(C(5), q, { line: 0 }).correct).toBe(false));
  it('« Tout est bien écrit » juste si accept vide', () => {
    const ok = { ...q, accept: [] };
    expect(checkAnswer(C(5), ok, { line: null }).correct).toBe(true);
    expect(checkAnswer(C(5), ok, { line: 0 }).correct).toBe(false);
  });
});
