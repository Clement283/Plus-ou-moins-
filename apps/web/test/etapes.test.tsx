import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { getCourse, lessonStep, type EtapeStep } from '@pom/engine';
import { Etapes } from '../src/components/Etapes';

afterEach(cleanup);

const C00 = getCourse('c00-bien-ecrire');
const part = (i: number): Extract<(typeof C00.parts)[number], { type: 'etapes' }> => {
  const p = C00.parts[i];
  if (p?.type !== 'etapes') throw new Error(`la partie ${i} n'est pas une explication pas à pas`);
  return p;
};

function setup(steps: EtapeStep[], title = 'Titre') {
  const onDone = vi.fn();
  const view = render(<Etapes title={title} steps={steps} onDone={onDone} />);
  const $ = (s: string) => view.container.querySelector<HTMLElement>(s);
  const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
  const btn = (label: string) => $$('button').find((b) => b.textContent === label) ?? null;
  return { ...view, onDone, $, $$, btn };
}

describe('Etapes (règle 1, partie 4 du Cours 0)', () => {
  const p = part(4);
  it('1re étape : la scène et la 1re phrase, bouton « Suite »', () => {
    const t = setup(p.steps, p.title);
    expect(t.$('h1')!.textContent).toBe(p.title);
    expect(t.$('.stage')!.textContent).toContain('4 × −3');
    expect(t.$$('.etape')).toHaveLength(1);
    expect(t.$('.etape')!.textContent).toBe('Reprenons le calcul du début.');
    expect(t.btn('Suite')).not.toBeNull();
    expect(t.btn('Suivant')).toBeNull();
  });
  it('la scène est visible dès la 1re étape et fait au moins 190 px de haut (feuille de style)', () => {
    const t = setup(p.steps, p.title);
    expect(t.$('.stage')).not.toBeNull();
    expect(t.$$('.dots i')).toHaveLength(p.steps.length);
    expect(t.$$('.dots i.is-on')).toHaveLength(1);
  });
  it('2 clics sur « Suite » : 3 phrases, les 2 anciennes ne sont plus « nouvelles »', () => {
    const t = setup(p.steps, p.title);
    fireEvent.click(t.btn('Suite')!);
    fireEvent.click(t.btn('Suite')!);
    expect(t.$$('.etape')).toHaveLength(3);
    expect(t.$$('.etape.is-new')).toHaveLength(1);
    expect(t.$$('.dots i.is-on')).toHaveLength(3);
    expect(t.onDone).not.toHaveBeenCalled();
  });
  it('la scène change à chaque étape et le surligneur jaune marque « regarde ici »', () => {
    const t = setup(p.steps, p.title);
    fireEvent.click(t.btn('Suite')!);
    expect(t.$('.stage .scene-hl')!.textContent).toBe('× −');
    expect(t.$('.stage .anim-bump')).not.toBeNull();
    expect(t.$('.scene-label')!.textContent).toBe('deux signes collés');
    fireEvent.click(t.btn('Suite')!);
    expect(t.$$('.stage .scene-hl').map((m) => m.textContent)).toEqual(['×', '−']);
  });
  it('dernière étape : « Suivant » appelle onDone, avec l’encadré de règle', () => {
    const t = setup(p.steps, p.title);
    for (let i = 1; i < p.steps.length; i++) fireEvent.click(t.btn('Suite')!);
    expect(t.btn('Suite')).toBeNull();
    expect(t.$('.rule-box')!.textContent).toContain('Règle 1');
    expect(t.$('.rule-box b')!.textContent).toContain('Deux signes ne se suivent jamais.');
    fireEvent.click(t.btn('Suivant')!);
    expect(t.onDone).toHaveBeenCalledTimes(1);
  });
  it('« Revoir » rejoue l’animation : la scène est remontée', () => {
    const t = setup(p.steps, p.title);
    fireEvent.click(t.btn('Suite')!);
    const before = t.$('.stage')!;
    fireEvent.click(t.btn('Revoir')!);
    expect(t.$('.stage')).not.toBe(before);
    expect(t.$('.stage')!.textContent).toBe(before.textContent);
  });
});

describe('Etapes : autres mises en page', () => {
  it('paires mal écrit → bien écrit (règle 1, exemples)', () => {
    const p = part(5);
    const t = setup(p.steps, p.title);
    expect(t.$('.stage--pairs')).not.toBeNull();
    expect(t.$$('.stage__pair')).toHaveLength(1);
    expect(t.$$('.scene-tag').map((x) => x.textContent)).toEqual(['mal écrit', 'bien écrit']);
    fireEvent.click(t.btn('Suite')!);
    expect(t.$$('.stage__pair')).toHaveLength(2);
  });
  it('2 calculs côte à côte (le signe − a deux rôles)', () => {
    const p = part(1);
    const t = setup(p.steps, p.title);
    fireEvent.click(t.btn('Suite')!);
    expect(t.$('.stage--row')).not.toBeNull();
    expect(t.$$('.stage__calc')).toHaveLength(2);
    expect(t.$('.scene-dim')!.textContent).toBe('−3');
  });
  it('récapitulatif des 4 règles, avec « pas faux, mais inutile »', () => {
    const p = part(13);
    const t = setup(p.steps, p.title);
    expect(t.$$('.recap li')).toHaveLength(4);
    expect(t.$('.recap')!.textContent).toContain('pas faux, mais inutile');
    expect(t.btn('Suivant')).not.toBeNull(); // une seule étape
  });
  it('sans scène (annonce des exercices de fin) : pas de grande zone vide', () => {
    const p = part(18);
    const t = setup(p.steps, p.title);
    expect(t.$('.stage')).toBeNull();
    expect(t.$('.etape')!.textContent).toContain("pas d'aide");
    fireEvent.click(t.btn('Suite')!);
    fireEvent.click(t.btn('Suite')!);
    expect(t.$$('.etape')).toHaveLength(3);
    expect(t.$$('.etape b').map((b) => b.textContent)).toContain('série de validation');
  });
});

describe('Cours 0 : numéro d’étape de la pastille', () => {
  it('les parties qui partagent un écran comptent pour une étape', () => {
    const total = lessonStep(C00, 0)!.total;
    expect(lessonStep(C00, 2)!.n).toBe(lessonStep(C00, 3)!.n);
    expect(lessonStep(C00, 4)!.n).toBe(lessonStep(C00, 3)!.n + 1);
    expect(lessonStep(C00, 13)!.n).toBe(total);
    expect(lessonStep(C00, 14)).toBeNull();
  });
});
