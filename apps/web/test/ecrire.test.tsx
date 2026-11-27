import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { getCourse, num, rat, type Answer, type EcrireQuestion, type Outcome, type Question } from '@pom/engine';
import { QuestionView } from '../src/components/questions/QuestionView';

afterEach(cleanup);

const course = getCourse('priorites-moins-devant-parenthese');
const ex = { courseId: course.id, level: 1 as const, expr: num(0), answer: rat(0) };
const base: EcrireQuestion = {
  kind: 'ecrire',
  ex,
  mode: 'calcul',
  context: { kind: 'phrase', text: 'D est la différence de 30 et de la somme de 2 et de 7.' },
  name: 'D',
  steps: [{ instr: null, accepted: ['30 - (2 + 7)'] }],
  hint: 'Une différence : 30 − (…).',
};

function setup(q: Question) {
  const calls: [Answer, Outcome][] = [];
  const view = render(<QuestionView question={q} course={course} locked={false} onAnswer={(a, o) => calls.push([a, o])} />);
  const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
  const press = (k: string) => {
    const b = $$('.keypad button').find((x) => x.textContent === k);
    if (!b) throw new Error(`touche ${k} absente`);
    fireEvent.click(b);
  };
  const line = (s: string) => {
    for (const ch of s.replace(/ /g, '')) press(ch === '-' ? '−' : ch === '*' ? '×' : ch);
    fireEvent.click($$('button').find((b) => b.textContent === 'Valider')!);
  };
  const erase = (n: number) => {
    for (let i = 0; i < n; i++) fireEvent.click($$('.keypad button').find((x) => x.getAttribute('aria-label') === 'effacer')!);
  };
  const text = () => view.container.textContent ?? '';
  return { ...view, calls, line, erase, text };
}

describe('« Écris le calcul »', () => {
  it('même valeur : message gris, rien ne compte ; puis juste', () => {
    const t = setup(base);
    t.line('30-2-7');
    expect(t.text()).toContain('Même résultat, mais pas le calcul demandé.');
    expect(t.calls).toHaveLength(0);
    t.erase(6);
    t.line('30-(2+7)');
    expect(t.calls).toHaveLength(1);
    expect(t.calls[0]![1]).toMatchObject({ correct: true });
  });
  it('une phrase fausse : une seule réponse jugée', () => {
    const t = setup(base);
    t.line('30-2+7');
    expect(t.calls[0]![1]).toMatchObject({ correct: false, errorType: 'parentheses-oubliees' });
  });
  it('programme : étape par étape', () => {
    const t = setup({
      ...base,
      name: null,
      context: { kind: 'programme' },
      steps: [
        { instr: 'Pars du nombre 4 et ajoute-lui 3.', accepted: ['4 + 3'] },
        { instr: 'Multiplie le résultat par 5.', accepted: ['(4 + 3) * 5'] },
      ],
    });
    t.line('4+3');
    expect(t.calls).toHaveLength(0);
    t.line('(4+3)*5');
    expect(t.calls[0]![1]).toMatchObject({ correct: true });
  });
  it('réécrire avec x : clavier avec x, forme réduite montrée', () => {
    const t = setup({
      ...base,
      mode: 'reecrire',
      name: null,
      context: { kind: 'latex', latex: '5 - (x - 3)' },
      steps: [{ instr: null, accepted: [] }],
      linear: { a: -1, b: 8, k: 5, op: '-', p: 1, q: -3 },
    });
    t.line('5-x+3');
    expect(t.calls[0]![1]).toMatchObject({ correct: true, message: 'Tu peux encore réduire : 8 − x.' });
  });
  it('problème : après le calcul écrit, on le calcule ligne par ligne', () => {
    const t = setup({ ...base, name: 'A', steps: [{ instr: null, accepted: ['20 - (7 + 3 * 2)'] }], compute: true });
    t.line('20-(7+3*2)');
    expect(t.text()).toContain('Calcule A, ligne par ligne.');
    t.line('20-(7+6)');
    t.line('20-13');
    t.line('7');
    expect(t.calls[0]![1]).toMatchObject({ correct: true });
  });
});
