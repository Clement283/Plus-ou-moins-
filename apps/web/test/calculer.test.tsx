import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { calculerCalcul, calculerQuestion, cst, equation, getCourse, num, rat, xt, type Answer, type Outcome, type Question } from '@pom/engine';
import { QuestionView } from '../src/components/questions/QuestionView';

afterEach(cleanup);

const course = getCourse('c05-multiplier-deux');
const ex = { courseId: course.id, level: 1 as const, expr: num(0), answer: rat(0) };
// −3x + 7 = −5 pour x = 4 : −3 × 4 + 7, −12 + 7, −5 ; 4 est solution
const question = (right = -5): Question => calculerQuestion(ex, equation([xt(-3), cst(7)], [cst(right)]), 4);

function setup(q: Question) {
  const calls: [Answer, Outcome][] = [];
  const view = render(<QuestionView question={q} course={course} locked={false} onAnswer={(a, o) => calls.push([a, o])} />);
  const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
  const press = (k: string) => {
    const b = $$('.keypad button').find((x) => (x.getAttribute('aria-label') === 'effacer' ? '⌫' : x.textContent) === k);
    if (!b) throw new Error(`touche ${k} absente`);
    fireEvent.click(b);
  };
  /** Tape une ligne au clavier de l'écran, puis « Valider ». */
  const line = (s: string) => {
    for (const ch of s.replace(/ /g, '')) press(ch === '-' ? '−' : ch === '*' ? '×' : ch === '/' ? '÷' : ch);
    fireEvent.click($$('button').find((b) => b.textContent === 'Valider')!);
  };
  const erase = (n: number) => {
    for (let i = 0; i < n; i++) press('⌫');
  };
  const choose = (label: string) => fireEvent.click($$('.choice').find((b) => b.textContent === label)!);
  const text = () => view.container.textContent ?? '';
  return { ...view, calls, $$, press, line, erase, choose, text };
}

describe('« Calculer par lignes »', () => {
  it('her steps: replace x, calculate, then compare the two members', () => {
    const t = setup(question());
    t.line('-3*4+7');
    expect(t.text()).toContain('Ligne juste.');
    t.line('-12+7');
    t.line('-5');
    expect(t.$$('.keypad')).toHaveLength(0); // un seul nombre : place au verdict
    expect(t.text()).toContain('Le membre de gauche vaut −5, celui de droite −5.');
    expect(t.calls).toHaveLength(0);
    t.choose('Oui');
    expect(t.calls).toHaveLength(1);
    expect(t.calls[0]![1]).toMatchObject({ correct: true, helped: false });
    expect(t.calls[0]![0]).toEqual({ calcLines: ['−3×4+7', '−12+7', '−5'], firstPick: true, hinted: false });
  });

  it('several steps at once, her own way', () => {
    const t = setup(question());
    t.line('(-3)*4+7');
    t.line('-5');
    t.choose('Oui');
    expect(t.calls[0]![1]).toMatchObject({ correct: true });
  });

  it('priority forgotten: explained, she corrects, the question counts as wrong', () => {
    const t = setup(question());
    t.line('-3*4+7');
    t.line('-3*11');
    expect(t.text()).toContain('On fait d’abord les × et les ÷.');
    t.erase(6);
    t.line('-12+7');
    t.line('-5');
    t.choose('Oui');
    expect(t.calls[0]![1]).toMatchObject({ correct: false, errorType: 'priorite' });
  });

  it('x not replaced, recopied and unreadable lines are not counted', () => {
    const t = setup(question());
    t.line('-12+7');
    expect(t.text()).toContain('Commence par remplacer x.');
    t.erase(6);
    t.line('-3*4+7');
    t.line('(-3)*4+7');
    expect(t.text()).toContain('C’est la même ligne.');
    t.erase(9);
    t.line('5+');
    expect(t.text()).toContain('Je ne peux pas lire cette ligne.');
    t.erase(2);
    t.line('-5');
    t.choose('Oui');
    expect(t.calls[0]![1]).toMatchObject({ correct: true });
  });

  it('a wrong first verdict is explained and counts as wrong; she picks again', () => {
    const t = setup(question());
    t.line('-3*4+7');
    t.line('-5');
    t.choose('Non');
    expect(t.text()).toContain('Compare les deux membres.');
    expect(t.calls).toHaveLength(0);
    t.choose('Oui');
    expect(t.calls[0]![0]).toMatchObject({ firstPick: false });
    expect(t.calls[0]![1]).toMatchObject({ correct: false, errorType: 'verdict' });
  });

  it('not a solution: the right verdict is « Non »', () => {
    const t = setup(question(5));
    t.line('-3*4+7');
    t.line('-5');
    expect(t.text()).toContain('celui de droite 5');
    t.choose('Non');
    expect(t.calls[0]![1]).toMatchObject({ correct: true });
  });

  it('the hint follows the course method and marks the answer « avec aide »', () => {
    const t = setup(question());
    fireEvent.click(t.$$('button').find((b) => b.textContent === 'Un indice')!);
    expect(t.text()).toContain('Remplace x par 4');
    t.line('-3*4+7');
    fireEvent.click(t.$$('button').find((b) => b.textContent === 'Un indice')!);
    expect(t.text()).toContain('multiplication');
    t.line('-12+7');
    t.line('-5');
    t.choose('Oui');
    expect(t.calls[0]![1]).toMatchObject({ correct: true, helped: true });
  });

  it('guided example: the hint is shown at every line, without a hint button', () => {
    const t = setup({ ...question(), guided: true } as Question);
    expect(t.text()).toContain('Remplace x par 4');
    expect(t.$$('button').some((b) => b.textContent === 'Un indice')).toBe(false);
    t.line('-3*4+7');
    expect(t.text()).toContain('multiplication');
  });
});

describe('« Calculer par lignes » à partir d’un calcul seul', () => {
  it('pas de x, pas de verdict : répondu dès qu’il reste un nombre', () => {
    const t = setup(calculerCalcul(ex, '10 - 3 + 2'));
    expect(t.text()).toContain('A = 10 - 3 + 2');
    expect(t.text()).not.toContain('pour');
    expect(t.$$('.keypad button').some((b) => b.textContent === '[')).toBe(false);
    t.line('7+2');
    t.line('9');
    expect(t.calls).toHaveLength(1);
    expect(t.calls[0]![1]).toMatchObject({ correct: true });
    expect(t.text()).not.toContain('est-il solution');
  });
  it('touches crochets seulement pour un calcul à crochets', () => {
    const t = setup(calculerCalcul(ex, '3 * [10 - (4 + 2)]'));
    expect(t.$$('.keypad button').filter((b) => b.textContent === '[' || b.textContent === ']')).toHaveLength(2);
    t.line('3*[10-6]');
    t.line('3*4');
    t.line('12');
    expect(t.calls[0]![1]).toMatchObject({ correct: true });
  });
  it('erreur de parenthèse expliquée', () => {
    const t = setup(calculerCalcul(ex, '2 * (3 + 4)'));
    t.line('2*3+4');
    expect(t.text()).toContain('Les parenthèses passent en premier.');
  });
});
