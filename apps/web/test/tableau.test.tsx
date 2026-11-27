import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { getCourse, intervalleFromTable, num, rat, solutionsQuestion, tableauQuestion, type Answer, type Outcome, type Question } from '@pom/engine';
import { QuestionView } from '../src/components/questions/QuestionView';

afterEach(cleanup);

const course = getCourse('c05-multiplier-deux');
const ex = { courseId: course.id, level: 1 as const, expr: num(0), answer: rat(0) };
const f = (a: number, b: number) => ({ a, b });

function setup(q: Question) {
  const calls: [Answer, Outcome][] = [];
  const view = render(<QuestionView question={q} course={course} locked={false} onAnswer={(a, o) => calls.push([a, o])} />);
  const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
  const key = (k: string) => {
    const b = $$('.keypad button').find((x) => (x.getAttribute('aria-label') === 'effacer' ? '⌫' : x.textContent) === k);
    if (!b) throw new Error(`touche ${k} absente`);
    fireEvent.click(b);
  };
  const label = (l: string) => fireEvent.click(view.getByLabelText(l));
  const type = (s: string) => {
    for (const ch of s.replace(/ /g, '')) key(ch === '-' ? '−' : ch);
  };
  const verify = () => fireEvent.click($$('.keypad button').find((b) => b.textContent === 'Vérifier')!);
  return { ...view, calls, $$, key, label, type, verify, text: () => view.container.textContent ?? '' };
}

describe('« Tableau de signes »', () => {
  it('construit tout : valeurs (une fois dans le désordre), lignes, signes', () => {
    const t = setup(tableauQuestion(ex, 'produit', [f(1, -2), f(1, 1)]));
    t.label('Valeur 1');
    t.type('2');
    t.label('Valeur 2');
    t.type('-1');
    t.verify();
    expect(t.text()).toContain('désordre');
    t.label('Valeur 1');
    t.key('⌫');
    t.type('-1');
    t.label('Valeur 2');
    t.key('⌫');
    t.key('⌫');
    t.key('⌫');
    t.type('2');
    t.verify();
    expect(t.text()).toContain('Les valeurs sont justes.');
    t.label('Ligne 1');
    t.type('x-2');
    t.label('Ligne 2');
    t.type('x+1');
    t.label('Ligne 3');
    t.type('(x-2)(x+1)');
    t.verify();
    expect(t.text()).toContain('Les lignes sont justes.');
    const rows = [
      ['−', '−', '−', '0', '+'],
      ['−', '0', '+', '+', '+'],
      ['+', '0', '−', '0', '+'],
    ];
    rows.forEach((row, r) =>
      row.forEach((v, c) => {
        t.label(`Ligne ${r + 1}, colonne ${c + 1}`);
        t.key(v);
      }),
    );
    t.verify();
    expect(t.calls).toHaveLength(1);
    // le 1er essai des valeurs était faux : la question n'est pas juste du premier coup
    expect(t.calls[0]![1]).toMatchObject({ correct: false, errorType: 'valeurs-ordre' });
  });

  it('signes seulement (valeurs et lignes données), du premier coup', () => {
    const t = setup(tableauQuestion(ex, 'seul', [f(2, 3)], { valeurs: false, lignes: false }));
    expect(t.text()).toContain('−3/2');
    ['−', '0', '+'].forEach((v, c) => {
      t.label(`Ligne 1, colonne ${c + 1}`);
      t.key(v);
    });
    t.verify();
    expect(t.calls[0]![1]).toMatchObject({ correct: true, helped: false });
  });

  it('quotient : 0 au lieu de la double barre, signalé', () => {
    const t = setup(tableauQuestion(ex, 'quotient', [f(1, 1), f(1, -2)], { valeurs: false, lignes: false }));
    const rows = [
      ['−', '0', '+', '+', '+'],
      ['−', '−', '−', '0', '+'],
      ['+', '0', '−', '0', '+'],
    ];
    rows.forEach((row, r) =>
      row.forEach((v, c) => {
        t.label(`Ligne ${r + 1}, colonne ${c + 1}`);
        t.key(v);
      }),
    );
    t.verify();
    expect(t.text()).toContain('double barre');
    expect(t.calls).toHaveLength(0);
    t.label('Ligne 3, colonne 4');
    t.key('‖');
    t.verify();
    expect(t.calls[0]![1]).toMatchObject({ correct: false, errorType: 'barre-oubliee' });
  });
});

describe('lire S dans le tableau : réunion', () => {
  it('(x − 2)(x + 1) ≥ 0', () => {
    const q = intervalleFromTable(ex, tableauQuestion(ex, 'produit', [f(1, -2), f(1, 1)]), '>=');
    const t = setup(q);
    expect(t.$$('.sign-table')).toHaveLength(1);
    fireEvent.click(t.$$('button').find((b) => b.textContent?.includes('Relier'))!);
    t.label('Crochet de gauche');
    t.label('Borne de gauche');
    t.key('−∞');
    t.key('−');
    t.key('1');
    t.label('Borne de gauche du 2e intervalle');
    t.key('2');
    t.label('Borne de droite du 2e intervalle');
    t.key('+∞');
    t.label('Crochet de droite du 2e intervalle');
    t.key('Valider');
    expect(t.calls[0]![1]).toMatchObject({ correct: true });
  });
});

describe('« Écrire les solutions »', () => {
  it('(x + 2)(x − 3) = 0, dans le désordre', () => {
    const t = setup(solutionsQuestion(ex, [f(1, 2), f(1, -3)]));
    t.label('Solution 1');
    t.type('3');
    t.label('Solution 2');
    t.type('-2');
    t.verify();
    expect(t.calls[0]![1]).toMatchObject({ correct: true });
  });
  it('une valeur au mauvais signe', () => {
    const t = setup(solutionsQuestion(ex, [f(1, 2), f(1, -3)]));
    t.label('Solution 1');
    t.type('2');
    t.label('Solution 2');
    t.type('3');
    t.verify();
    expect(t.calls[0]![1]).toMatchObject({ correct: false, errorType: 'signe' });
  });
});
