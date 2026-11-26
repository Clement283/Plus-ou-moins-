import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { cst, equation, getCourse, intervalleFromInequality, intervalleQuestion, num, rat, xt, type Answer, type Outcome, type Question } from '@pom/engine';
import { QuestionView } from '../src/components/questions/QuestionView';

afterEach(cleanup);

const course = getCourse('c05-multiplier-deux');
const ex = { courseId: course.id, level: 1 as const, expr: num(0), answer: rat(0) };

function setup(q: Question) {
  const calls: [Answer, Outcome][] = [];
  const view = render(<QuestionView question={q} course={course} locked={false} onAnswer={(a, o) => calls.push([a, o])} />);
  const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
  const key = (k: string) => fireEvent.click($$('.keypad button').find((x) => x.textContent === k)!);
  const type = (s: string) => {
    for (const ch of s) key(ch === '-' ? '−' : ch);
  };
  const label = (l: string) => fireEvent.click(view.getByLabelText(l));
  const valider = () => fireEvent.click($$('button').find((b) => b.textContent === 'Valider')!);
  return { ...view, calls, $$, key, type, label, valider, text: () => view.container.textContent ?? '' };
}

describe('« Écrire un intervalle »', () => {
  it('x < 3 : crochets retournés, bornes tapées, juste', () => {
    const t = setup(intervalleQuestion(ex, '<', 3));
    expect(t.$$('.keypad button').find((b) => b.textContent === 'Valider')).toHaveProperty('disabled', true);
    t.label('Crochet de gauche'); // [ → ]
    t.key('−∞'); // la case de droite devient la case active
    t.type('3');
    t.label('Crochet de droite'); // ] → [
    expect(t.$$('.interval-line__zone')).toHaveLength(1); // aperçu colorié
    t.valider();
    expect(t.calls[0]![1]).toMatchObject({ correct: true, helped: false });
    expect(t.calls[0]![0]).toMatchObject({ interval: { left: ']', lo: '−∞', hi: '3', right: '[' } });
  });

  it('crochet fermé contre ∞ : nommé', () => {
    const t = setup(intervalleQuestion(ex, '>=', 3));
    t.type('3');
    t.label('Borne de droite');
    t.key('+∞');
    t.valider(); // [3 , +∞] : crochet de droite fermé
    expect(t.calls[0]![1]).toMatchObject({ correct: false, errorType: 'crochet-infini' });
    expect(t.calls[0]![1].message).toContain('toujours ouvert');
  });

  it('un indice marque « avec aide »', () => {
    const t = setup(intervalleQuestion(ex, '>=', 3));
    fireEvent.click(t.$$('button').find((b) => b.textContent === 'Un indice')!);
    t.type('3');
    t.label('Borne de droite');
    t.key('+∞');
    t.label('Crochet de droite');
    t.valider();
    expect(t.calls[0]![1]).toMatchObject({ correct: true, helped: true });
  });

  it('cours 8 : le symbole se choisit d’abord, puis S', () => {
    const q = intervalleFromInequality(ex, equation([xt(-2)], [cst(6)], '>='), { by: -2 });
    const t = setup(q);
    expect(t.$$('.sol-row')).toHaveLength(0); // pas de saisie avant le symbole
    expect(t.text()).toContain('On divise par −2');
    fireEvent.click(t.$$('.symbol-picker .choice').find((b) => b.textContent === '≤')!);
    expect(t.$$('.sol-row')).toHaveLength(1);
    t.label('Crochet de gauche');
    t.key('−∞');
    t.type('-3');
    t.valider();
    expect(t.calls[0]![1]).toMatchObject({ correct: true });
    expect(t.calls[0]![0]).toMatchObject({ symbol: '<=' });
  });

  it('cours 8 : mauvais symbole', () => {
    const q = intervalleFromInequality(ex, equation([xt(-2)], [cst(6)], '>='), { by: -2 });
    const t = setup(q);
    fireEvent.click(t.$$('.symbol-picker .choice').find((b) => b.textContent === '≥')!);
    t.label('Crochet de gauche');
    t.key('−∞');
    t.type('-3');
    t.valider();
    expect(t.calls[0]![1]).toMatchObject({ correct: false, errorType: 'sens' });
  });
});
