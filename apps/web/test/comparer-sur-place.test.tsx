import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { getCourse, type Question } from '@pom/engine';
import { QuestionView } from '../src/components/questions/QuestionView';

afterEach(cleanup);

// « Comparer deux cas » du cours 2 : option `inPlace` (une seule copie des équations, surlignée sur place)
const course = getCourse('equations-ajouter-retirer');
const part = course.parts.find((p) => p.type === 'question' && p.compare !== undefined);

describe('Comparer deux cas, surlignage sur place', () => {
  it('avant la réponse : deux équations, pas de note vide ; après : toujours deux, signes surlignés, pas de seconde copie', () => {
    if (!part || part.type !== 'question') throw new Error('partie « comparer »');
    const q = part.question as Extract<Question, { kind: 'choix' }>;
    const view = render(<QuestionView question={q} course={course} locked={false} onAnswer={() => undefined} texts={{ ...part }} activity="decouverte" />);
    const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
    expect($$('.compare__case')).toHaveLength(2);
    expect($$('.compare__note')).toHaveLength(0);
    fireEvent.click($$('.choice').find((b) => b.textContent === 'Dans B, x − 3 = 7')!);
    expect($$('.compare__case')).toHaveLength(2); // pas de seconde copie
    expect($$('.compare__highlight')).toHaveLength(0);
    expect($$('.scene-hl').map((x) => x.textContent)).toEqual(['+ 3', '− 3']);
    expect($$('.compare-feedback .alert')).toHaveLength(0); // le message est déjà en bas de l'écran
    expect(view.container.textContent).toContain('x = 7 + 3 = 10');
  });
});
