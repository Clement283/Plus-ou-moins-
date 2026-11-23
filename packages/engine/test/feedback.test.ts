import { describe, expect, it } from 'vitest';
import { getCourse } from '../src/courses';
import { errorOf } from '../src/courses/errors-util';
import { emptyRaw, pressKey, type Key, type RawInput } from '../src/input/raw';
import { checkAnswer } from '../src/exercises/check';
import type { Answer, Question } from '../src/exercises/types';
import { seededRng } from '../src/rng';
import { rat } from '../src/math/rational';
import { num, op } from '../src/math/expr';
import { feedbackFor } from '../src/feedback';
import { buildQuestion } from '../src/exercises/build';

const C5 = getCourse('c05-multiplier-deux');
const C6 = getCourse('c06-diviser-deux');

const keys = (...k: Key[]): RawInput => k.reduce(pressKey, emptyRaw());
const d = (n: number): Key => `digit:${n}` as Key;

const saisie = (course: typeof C5, a: number, b: number, kind: 'saisie' = 'saisie'): Extract<Question, { kind: 'saisie' }> => {
  const ex = { courseId: course.id, level: 1 as const, expr: op(course === C5 ? '*' : '/', num(a), num(b)), answer: course === C5 ? rat(a * b) : rat(a / b) };
  return { kind, ex, promptLatex: '' };
};
const fb = (course: typeof C5, q: Question, a: Answer) => feedbackFor(course, q, a, checkAnswer(course, q, a));


const idxOf = (q: Extract<Question, { kind: 'paires' }>, l: number): number =>
  q.right.findIndex((r) => r.value.n === q.exs[l]!.answer.n && r.value.d === q.exs[l]!.answer.d);

/** An answer that is wrong (for the types with several elements, the first element is wrong). */
function wrongAnswer(q: Question): Answer {
  switch (q.kind) {
    case 'ordre':
      return { order: [...q.solution].reverse() };
    case 'erreur':
      return { line: q.wrongLine === null ? 0 : null };
    case 'paires':
      return { pairs: [[0, (idxOf(q, 0) + 1) % q.right.length], ...q.exs.map((_, l): [number, number] => [l, idxOf(q, l)])] };
    case 'classer':
      return { classes: q.expected.map((id) => (id === q.classes[0]!.id ? q.classes[1]!.id : q.classes[0]!.id)) };
    default:
      throw new Error('unused');
  }
}

describe('feedbackFor : réponse tapée', () => {
  const q = saisie(C5, -3, -4); // 12
  const raw = (r: RawInput) => fb(C5, q, { raw: r });

  it('moins après le nombre', () => {
    expect(raw(keys(d(3), 'minus'))).toMatchObject({ tone: 'faux', title: 'Réponse mal écrite', message: "Le signe moins s'écrit avant le nombre : −3.", explanation: null, steps: [] });
  });
  it('moins après : le nombre tapé est repris', () => {
    expect(raw(keys(d(8), 'minus'))).toMatchObject({ message: "Le signe moins s'écrit avant le nombre : −8." });
    expect(raw(keys(d(1), d(2), 'minus'))).toMatchObject({ message: "Le signe moins s'écrit avant le nombre : −12." });
  });
  it('double signe : le nombre tapé est repris', () => {
    expect(raw(keys('minus', 'minus', d(8)))).toMatchObject({ message: "Il y a deux signes moins à la suite. Un nombre n'a qu'un signe : −8 ou 8." });
  });
  it('3−4 : un seul nombre', () => {
    expect(raw(keys(d(3), 'minus', d(4)))).toMatchObject({ tone: 'faux', title: 'Réponse mal écrite', message: 'Ta réponse doit être un seul nombre.' });
  });
  it('3−(4) : un seul nombre', () => {
    expect(raw(keys(d(3), 'minus', 'lpar', d(4), 'rpar'))).toMatchObject({ tone: 'faux', title: 'Réponse mal écrite', message: 'Ta réponse doit être un seul nombre.' });
  });
  it(')−3 : parenthèse fermée sans ouverte', () => {
    expect(raw(keys('rpar', 'minus', d(3)))).toMatchObject({ message: 'Une parenthèse fermée doit avoir été ouverte.' });
  });
  it('(−3 et −3) : message complet', () => {
    const full = 'Une parenthèse ouverte doit être fermée, et une parenthèse fermée doit avoir été ouverte.';
    expect(raw(keys('lpar', 'minus', d(3)))).toMatchObject({ message: full });
    expect(raw(keys('minus', d(3), 'rpar'))).toMatchObject({ message: full });
  });
  it('double signe', () => {
    expect(raw(keys('minus', 'minus', d(3)))).toMatchObject({ message: "Il y a deux signes moins à la suite. Un nombre n'a qu'un signe : −3 ou 3." });
  });
  it('écriture invalide, et fraction sur 0', () => {
    expect(raw(keys('minus'))).toMatchObject({ message: "Cette réponse n'est pas un nombre bien écrit." });
    expect(raw(keys('frac', d(5), 'next', d(0)))).toMatchObject({ message: 'On ne divise jamais par 0.' });
  });
  it('la bonne réponse est donnée en LaTeX', () => {
    expect(raw(keys(d(3), 'minus'))).toMatchObject({ rightLatex: '12' });
  });
  it('−07 pour −7 : juste avec une note', () => {
    const q7 = saisie(C5, -7, 1);
    expect(fb(C5, q7, { raw: keys('minus', d(0), d(7)) })).toMatchObject({ tone: 'juste', note: 'Juste ! On écrit simplement −7.' });
    expect(fb(C5, q7, { raw: keys('minus', d(7)) })).toMatchObject({ tone: 'juste', note: null });
  });
  it('fraction −12 sur 4 : pas fini', () => {
    const q3 = saisie(C5, -3, 1);
    expect(fb(C5, q3, { raw: keys('frac', 'minus', d(1), d(2), 'next', d(4)) })).toMatchObject({ tone: 'pas-fini' });
  });
  it('−12 pour −3 × (−4) : erreur du cours, explication de la règle des signes', () => {
    const r = raw(keys('minus', d(1), d(2))) as Extract<ReturnType<typeof raw>, { tone: 'faux' }>;
    expect(r.tone).toBe('faux');
    expect(r.title).toBe('La bonne réponse est 12.');
    expect(r.explanation).toEqual(errorOf(C5, 'regle-signes')!.explain(q.ex));
    expect(r.steps).toEqual(C5.resolution(q.ex));
  });
  it('erreur inconnue : explication générale', () => {
    const r = raw(keys(d(9), d(9))) as Extract<ReturnType<typeof raw>, { tone: 'faux' }>;
    expect(r.explanation).toEqual(C5.generalExplanation(q.ex));
  });
});

describe('feedbackFor : réponse touchée', () => {
  it('qcm raté : bonne réponse du QCM, explication', () => {
    const rng = seededRng(5);
    const q = buildQuestion(C5, 'qcm', { rng, level: 1, timesSeen: 0 }) as Extract<Question, { kind: 'qcm' }>;
    const wrongIdx = q.choices.findIndex((_, i) => i !== q.correctIndex);
    const r = fb(C5, q, { choice: wrongIdx });
    expect(r).toMatchObject({ tone: 'faux', rightLatex: q.choices[q.correctIndex]!.latex });
    expect(fb(C5, q, { choice: q.correctIndex })).toMatchObject({ tone: 'juste', note: null });
  });
  it('qcm raté : jamais de LaTeX brut dans le titre, sur tous les cours (c00 compris)', () => {
    let n = 0;
    for (const course of [getCourse('c00-bien-ecrire'), C5, C6]) {
      for (let seed = 1; seed <= 60; seed++) {
        for (const level of [1, 2, 3] as const) {
          let q: Question;
          try {
            q = buildQuestion(course, 'qcm', { rng: seededRng(seed), level, timesSeen: 0 });
          } catch {
            continue;
          }
          if (q.kind !== 'qcm') continue;
          const wrongIdx = q.choices.findIndex((_, i) => i !== q.correctIndex);
          const r = feedbackFor(course, q, { choice: wrongIdx }, checkAnswer(course, q, { choice: wrongIdx }));
          expect(r.title, r.title).not.toMatch(/[\\{}]/);
          n++;
        }
      }
    }
    expect(n).toBeGreaterThan(0);
  });
  it('vrai ou faux raté', () => {
    const q = buildQuestion(C5, 'vraifaux', { rng: seededRng(2), level: 1, timesSeen: 0 }) as Extract<Question, { kind: 'vraifaux' }>;
    const r = fb(C5, q, { bool: !q.isTrue });
    expect(r).toMatchObject({ tone: 'faux', rightLatex: q.isTrue ? '\\text{Vrai}' : '\\text{Faux}', title: q.isTrue ? "C'était vrai." : "C'était faux." });
  });
  it('les autres types ratés : toujours un retour « faux » avec explication', () => {
    for (const kind of ['ordre', 'erreur', 'paires', 'classer'] as const) {
      const q = buildQuestion(C5, kind, { rng: seededRng(4), level: 2, timesSeen: 0 });
      const a = wrongAnswer(q);
      const o = checkAnswer(C5, q, a);
      if (o.correct) continue;
      const r = feedbackFor(C5, q, a, o);
      expect(r.tone).toBe('faux');
      if (r.tone === 'faux') {
        expect(r.title.length).toBeGreaterThan(0);
        expect(r.rightLatex.length).toBeGreaterThan(0);
        expect(r.explanation).not.toBeNull();
      }
    }
  });
  it('division : un calcul qui est une division donne le message complet', () => {
    const q = saisie(C6, -12, 4);
    expect(fb(C6, q, { raw: keys('frac', 'minus', d(1), d(2), 'next', d(4)) })).toMatchObject({ tone: 'pas-fini', title: "Le calcul n'est pas fini : simplifie." });
  });
});
