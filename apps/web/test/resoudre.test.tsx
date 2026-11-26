import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { cst, equation, getCourse, num, rat, xt, type Answer, type Outcome, type Question } from '@pom/engine';
import { QuestionView } from '../src/components/questions/QuestionView';

afterEach(cleanup);

const course = getCourse('c05-multiplier-deux');
const question = (start = equation([xt(4), cst(-3)], [xt(1), cst(9)])): Question => ({
  kind: 'resoudre',
  ex: { courseId: course.id, level: 1, expr: num(0), answer: rat(4) },
  start,
});

function setup(q: Question) {
  const calls: [Answer, Outcome][] = [];
  const view = render(<QuestionView question={q} course={course} locked={false} onAnswer={(a, o) => calls.push([a, o])} />);
  const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
  const press = (k: string) => {
    const b = $$('.keypad button').find((x) => (x.getAttribute('aria-label') === 'effacer' ? '⌫' : x.textContent) === k);
    if (!b) throw new Error(`touche ${k} absente`);
    fireEvent.click(b);
  };
  /** Tape une ligne au clavier de l'écran (« − » du clavier, « ÷ », signes), puis « Valider ». */
  const line = (s: string) => {
    for (const ch of s.replace(/ /g, '')) press(ch === '-' ? '−' : ch === '/' ? '÷' : ch);
    fireEvent.click($$('button').find((b) => b.textContent === 'Valider')!);
  };
  const text = () => view.container.textContent ?? '';
  return { ...view, calls, $$, press, line, text };
}

describe('« À toi de résoudre »', () => {
  it('her own method: several operations, then grouping, then a fraction, then x = 4', () => {
    const t = setup(question());
    t.line('4x-x=9+3');
    expect(t.text()).toContain('Ligne juste.');
    expect(t.$$('.op-pill')).toHaveLength(2); // « −x +3 » sous chaque membre
    t.line('3x=12');
    expect(t.text()).toContain('Tu as regroupé les termes.');
    t.line('3x/3=12/3');
    expect(t.text()).toContain('Simplifie la fraction');
    expect(t.calls).toHaveLength(0);
    t.line('x=4');
    expect(t.calls).toHaveLength(1);
    expect(t.calls[0]![1]).toMatchObject({ correct: true, helped: false });
    expect(t.calls[0]![0]).toEqual({ lines: ['4x−x=9+3', '3x=12', '3x÷3=12÷3', 'x=4'], hinted: false });
    expect(t.$$('.keypad')).toHaveLength(0); // fini : plus de clavier
    expect(t.text()).toContain('Voir la méthode du cours');
  });

  it('a wrong line is explained, she corrects it, the question counts as wrong', () => {
    const t = setup(question());
    t.line('4x-3=9');
    expect(t.text()).toContain('Tu as changé un seul membre.');
    for (let i = 0; i < 6; i++) t.press('⌫');
    t.line('3x-3=9');
    t.line('3x=12');
    t.line('x=4');
    expect(t.calls[0]![1]).toMatchObject({ correct: false, errorType: 'un-seul-cote' });
  });

  it('unreadable and recopied lines are not counted', () => {
    const t = setup(question());
    t.line('4x-3');
    expect(t.text()).toContain('Il manque le signe du milieu');
    for (let i = 0; i < 4; i++) t.press('⌫');
    t.line('-3+4x=9+x');
    expect(t.text()).toContain('C’est la même ligne.');
  });

  it('the hint shows the course step and marks the answer « avec aide »', () => {
    const t = setup(question());
    fireEvent.click(t.$$('button').find((b) => b.textContent === 'Un indice')!);
    expect(t.text()).toContain('Méthode du cours');
    t.line('3x-3=9');
    t.line('3x=12');
    t.line('x=4');
    expect(t.calls[0]![1]).toMatchObject({ correct: true, helped: true });
    expect(t.text()).not.toContain('Voir la méthode du cours'); // même méthode que le cours
  });

  it('an inequality has <, >, ⩽, ⩾ and catches a direction kept wrong', () => {
    const t = setup(question(equation([xt(-2)], [cst(-6)], '>')));
    for (const k of ['<', '>', '⩽', '⩾']) expect(t.$$('.keypad button').some((b) => b.textContent === k)).toBe(true);
    expect(t.$$('.keypad button').some((b) => b.textContent === '=')).toBe(false);
    t.line('x>3');
    expect(t.text()).toContain('Le sens doit changer.');
  });
});
