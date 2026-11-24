// Cours 0 v3 sur le vrai cours : étapes interactives, comparer deux cas, série de pratique.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { getCourse, type EtapeStep, type LessonPart, type Question } from '@pom/engine';
import { Etapes } from '../src/components/Etapes';
import { QuestionView } from '../src/components/questions/QuestionView';

afterEach(cleanup);

const C00 = getCourse('c00-bien-ecrire');
const etapesPart = (i: number): Extract<LessonPart, { type: 'etapes' }> => {
  const p = C00.parts[i];
  if (p?.type !== 'etapes') throw new Error(`partie ${i}`);
  return p;
};
const questionPart = (i: number): Extract<LessonPart, { type: 'question' }> => {
  const p = C00.parts[i];
  if (p?.type !== 'question') throw new Error(`partie ${i}`);
  return p;
};

function screen(i: number) {
  const p = etapesPart(i);
  const onDone = vi.fn();
  const view = render(<Etapes title={p.title} steps={p.steps as EtapeStep[]} onDone={onDone} />);
  const $ = (s: string) => view.container.querySelector<HTMLElement>(s);
  const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
  const btn = (label: string) => $$('button').find((b) => b.textContent === label) ?? null;
  const next = () => fireEvent.click(btn('Suite')!);
  const error = () => $('.etape-error')?.textContent ?? null;
  return { ...view, onDone, $, $$, btn, next, error };
}

describe('écran 2 : le signe − a deux rôles', () => {
  it('toucher le bon − : le texte de suite remplace « Suite », qui n’est jamais affiché pendant l’action', () => {
    const t = screen(1);
    t.next();
    t.next();
    expect(t.$('.etape-touch__consigne')!.textContent).toBe('Touche le − qui sert à soustraire.');
    expect(t.btn('Suite')).toBeNull();
    const tokens = t.$$('.touch-token');
    expect(tokens.map((b) => b.textContent)).toEqual(['−', '6', '+', '2', '−', '5']);
    fireEvent.click(tokens[0]!);
    expect(t.error()).toBe("Pas tout à fait. Ce − est tout au début : il n'y a rien à soustraire. C'est le signe de −6. Essaie encore.");
    expect(t.btn('Suite')).toBeNull();
    fireEvent.click(tokens[1]!);
    expect(t.error()).toBe("Pas tout à fait. Ce n'est pas un −. Cherche les deux traits − du calcul. Essaie encore.");
    fireEvent.click(tokens[4]!);
    expect(t.error()).toBeNull();
    expect(t.$$('.etape').at(-1)!.textContent).toBe('Ce − est entre 2 et 5 : on enlève 5. Le − du début est, lui, le signe de −6.');
    expect(t.btn('Suite')).not.toBeNull();
  });
  it('phrase à trous : « une soustraction » refusé, « le signe du nombre » accepté', () => {
    const t = screen(1);
    t.next();
    t.next();
    fireEvent.click(t.$$('.touch-token')[4]!);
    t.next();
    expect(t.$('.trou-slot')).not.toBeNull();
    fireEvent.click(t.btn('une soustraction')!);
    expect(t.error()).toBe("Pas tout à fait. Au début, il n'y a rien avant le − : on ne peut rien soustraire. Essaie encore.");
    fireEvent.click(t.btn('le signe du nombre')!);
    expect(t.$('.trou-slot')).toBeNull();
    expect(t.btn('Suivant')).not.toBeNull();
    fireEvent.click(t.btn('Suivant')!);
    expect(t.onDone).toHaveBeenCalledTimes(1);
  });
});

describe('écran 3 : deux signes collés', () => {
  const toGaps = () => {
    const t = screen(2);
    t.next();
    fireEvent.click(t.$$('.touch-token')[2]!); // le −
    t.next();
    return t;
  };
  it('toucher le signe collé au × : messages par morceau', () => {
    const t = screen(2);
    t.next();
    const tokens = t.$$('.touch-token');
    expect(tokens.map((b) => b.textContent)).toEqual(['4', '×', '−', '3']);
    fireEvent.click(tokens[1]!);
    expect(t.error()).toContain("C'est le × lui-même.");
    fireEvent.click(tokens[0]!);
    expect(t.error()).toContain('4 est un nombre, pas un signe.');
    fireEvent.click(tokens[2]!);
    expect(t.btn('Suite')).not.toBeNull();
  });
  it('trois emplacements : le bon (entre × et −) mène à « 4 × (−3) » avec ses deux parenthèses surlignées', () => {
    const t = toGaps();
    const gaps = t.$$('.touch-gap');
    expect(gaps).toHaveLength(3);
    fireEvent.click(gaps[0]!);
    expect(t.error()).toContain('Là, la parenthèse entourerait le × aussi.');
    fireEvent.click(gaps[2]!);
    expect(t.error()).toContain('Là, elle couperait −3 en deux.');
    fireEvent.click(gaps[1]!);
    expect(t.error()).toBeNull();
    t.next();
    expect(t.$('.stage')!.textContent).toContain('4 × (−3)');
    expect(t.$$('.stage .scene-hl').map((x) => x.textContent)).toEqual(['(', ')']);
    expect(t.$('.scene-label')!.textContent).toBe('−3 est un seul nombre');
    expect(t.$('.rule-box')!.textContent).toContain('Règle 1');
  });
});

describe('écran 6 : le − avant le nombre', () => {
  it('un − « à placer » et trois emplacements : le bon est avant le 3', () => {
    const t = screen(5);
    t.next();
    fireEvent.click(t.$$('.touch-token')[1]!);
    t.next();
    expect(t.$$('.scene-label').map((x) => x.textContent)).toContain('ce signe est à placer');
    expect(t.$$('.stage .scene-hl').map((x) => x.textContent)).toEqual(['−']);
    const gaps = t.$$('.touch-gap');
    expect(gaps).toHaveLength(3);
    fireEvent.click(gaps[1]!);
    expect(t.error()).toContain('Là, le − serait encore après le 3');
    fireEvent.click(gaps[2]!);
    expect(t.error()).toContain('deux signes se touchent (règle 1)');
    fireEvent.click(gaps[0]!);
    expect(t.error()).toBeNull();
    t.next();
    expect(t.$('.stage')!.textContent).toContain('−3 + 4');
    expect(t.$('.scene-label')!.textContent).toBe('le − passe devant');
  });
});

describe('écran 7 : une parenthèse se ferme', () => {
  it('cinq emplacements : le bon (après le 3) fait apparaître « ) »', () => {
    const t = screen(6);
    t.next();
    fireEvent.click(t.btn('commence')!);
    expect(t.error()).toContain("C'est la fin qu'on ne voit pas.");
    fireEvent.click(t.btn("s'arrête")!);
    t.next();
    const gaps = t.$$('.touch-gap');
    expect(gaps).toHaveLength(5);
    fireEvent.click(gaps[0]!);
    expect(t.error()).toContain("avant d'avoir été ouverte");
    fireEvent.click(gaps[2]!);
    expect(t.error()).toContain("Là, elle se fermerait avant le nombre.");
    fireEvent.click(gaps[3]!);
    expect(t.error()).toContain('Le nombre n\'est fini qu\'après le 3.');
    fireEvent.click(gaps[4]!);
    expect(t.error()).toBeNull();
    t.next();
    expect(t.$$('.stage .scene-hl').map((x) => x.textContent)).toEqual(['(', ')']);
    expect(t.$('.scene-label')!.textContent).toBe('une qui ouvre, une qui ferme');
  });
});

describe('lecture : 2 phrases visibles au plus', () => {
  it('après quatre étapes de lecture (annonce), seules 2 phrases restent visibles', () => {
    const t = screen(16);
    t.next();
    t.next();
    const visible = () => t.$$('.etape').filter((e) => !e.hidden);
    expect(visible()).toHaveLength(3 - 1);
    expect(t.btn('Relire le début')).not.toBeNull();
  });
});

describe('écran 9 : comparer deux cas (sans droite)', () => {
  it('après la réponse, les parenthèses de A et les signes collés de B sont surlignés, aucune droite', () => {
    const p = questionPart(9);
    const q = p.question as Extract<Question, { kind: 'choix' }>;
    const view = render(<QuestionView question={q} course={C00} locked={false} onAnswer={() => undefined} texts={{ ...p }} activity="decouverte" />);
    const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
    expect($$('.compare__case')).toHaveLength(2);
    expect($$('.compare__highlight')).toHaveLength(0);
    fireEvent.click($$('.choice').find((b) => b.textContent === "La façon de l'écrire")!);
    expect($$('.compare__highlight .scene-hl').map((x) => x.textContent)).toEqual(['(', ')', '×', '−']);
    expect($$('.line-view')).toHaveLength(0);
    expect(view.container.textContent).toContain('Juste.');
    expect(view.container.textContent).toContain('Calcul A');
  });
});

describe('écran 11 : série de pratique', () => {
  const series = C00.parts[11];
  if (series?.type !== 'pratique') throw new Error('pratique');
  it('Q1 : 4 cases touchables, la consigne rappelle la règle 1 en gras', () => {
    const { question, texts } = series.questions[0]!;
    const view = render(<QuestionView question={question} course={C00} locked={false} onAnswer={() => undefined} texts={{ ...texts, series: { n: 1, of: 4 } }} />);
    expect(view.container.querySelector('.series-counter__n')!.textContent).toBe('Question 1 sur 4');
    expect([...view.container.querySelectorAll('.pieces .tag--piece')].map((b) => b.textContent)).toEqual(['5', '+', '−', '2']);
    expect(view.container.querySelector('.q-ask b')!.textContent).toBe('deux signes ne se suivent jamais');
    expect(view.container.querySelector('.series-dots')!.querySelectorAll('i')).toHaveLength(4);
  });
  it('Q2 : « Touche la règle » en gras, 3 règles', () => {
    const { question, texts } = series.questions[1]!;
    const view = render(<QuestionView question={question} course={C00} locked={false} onAnswer={() => undefined} texts={{ ...texts, series: { n: 2, of: 4 } }} />);
    expect(view.container.querySelector('.q-ask b')!.textContent).toBe('Touche la règle');
    expect([...view.container.querySelectorAll('.answer-zone .choice')].map((b) => b.textContent)).toEqual([
      'Deux signes se touchent',
      'Le moins est après le nombre',
      "Une parenthèse n'est pas fermée",
    ]);
  });
  it('aucune couleur de signe (orange ou bleu) dans les étapes ni dans la série', () => {
    for (let i = 0; i < C00.parts.length; i++) {
      const p = C00.parts[i]!;
      if (p.type !== 'etapes') continue;
      const t = screen(i);
      expect(t.$$('.neg, .pos'), `partie ${i}`).toHaveLength(0);
      cleanup();
    }
    for (const { question, texts } of series.questions) {
      const view = render(<QuestionView question={question} course={C00} locked={false} onAnswer={() => undefined} texts={texts} />);
      expect(view.container.querySelectorAll('.neg, .pos')).toHaveLength(0);
      cleanup();
    }
  });
});
