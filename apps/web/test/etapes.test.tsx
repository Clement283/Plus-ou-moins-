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

describe('Etapes (Cours 0 v3, écran 3 : règle 1)', () => {
  const p = part(2);
  it('1re étape : la scène et la 1re phrase, bouton « Suite »', () => {
    const t = setup(p.steps, p.title);
    expect(t.$('h1')!.textContent).toBe(p.title);
    expect(t.$('.stage')!.textContent).toContain('4 × −3');
    expect(t.$$('.etape')).toHaveLength(1);
    expect(t.$('.etape')!.textContent).toBe('Voici 4 × −3. Le × et le − sont collés : deux signes se touchent.');
    expect(t.btn('Suite')).not.toBeNull();
    expect(t.btn('Suivant')).toBeNull();
  });
  it('le surligneur jaune marque « regarde ici » et la légende dit « deux signes collés »', () => {
    const t = setup(p.steps, p.title);
    expect(t.$$('.stage .scene-hl').map((m) => m.textContent)).toEqual(['×', '−']);
    expect(t.$('.stage .anim-bump')).not.toBeNull();
    expect(t.$('.scene-label')!.textContent).toBe('deux signes collés');
    expect(t.$$('.dots i')).toHaveLength(p.steps.length);
    expect(t.$$('.dots i.is-on')).toHaveLength(1);
  });
  it('« Revoir » rejoue l’animation : la scène est remontée', () => {
    const t = setup(p.steps, p.title);
    const before = t.$('.stage')!;
    fireEvent.click(t.btn('Revoir')!);
    expect(t.$('.stage')).not.toBe(before);
    expect(t.$('.stage')!.textContent).toBe(before.textContent);
  });
});

describe('Etapes : autres mises en page', () => {
  it('paires mal écrit → bien écrit', () => {
    const steps: EtapeStep[] = [
      { scene: { layout: 'pairs', calcs: [{ tokens: [{ t: '5 + −2' }], tag: 'mal écrit' }, { tokens: [{ t: '5 + (−2)' }], tag: 'bien écrit' }] }, text: 'Après un **+** :' },
      {
        scene: {
          layout: 'pairs',
          calcs: [
            { tokens: [{ t: '5 + −2' }], tag: 'mal écrit' },
            { tokens: [{ t: '5 + (−2)' }], tag: 'bien écrit' },
            { tokens: [{ t: '7 − −1' }], tag: 'mal écrit' },
            { tokens: [{ t: '7 − (−1)' }], tag: 'bien écrit' },
          ],
        },
        text: 'Après un **−** :',
      },
    ];
    const t = setup(steps, 'Avec toutes les opérations');
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
    expect(t.$$('.scene-label').map((x) => x.textContent)).toEqual(['soustraire', 'signe du nombre']);
  });
  it('récapitulatif des 4 règles, avec « pas faux, mais inutile »', () => {
    const p = part(10);
    const t = setup(p.steps, p.title);
    expect(t.$$('.recap li')).toHaveLength(4);
    expect(t.$('.recap')!.textContent).toContain('pas faux, mais inutile');
    expect(t.btn('Suivant')).not.toBeNull(); // une seule étape
  });
  it('sans scène (annonce des exercices de fin) : pas de grande zone vide', () => {
    const p = part(16);
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
    expect(lessonStep(C00, 7)!.n).toBe(lessonStep(C00, 8)!.n);
    expect(lessonStep(C00, 9)!.n).toBe(lessonStep(C00, 8)!.n + 1);
    expect(lessonStep(C00, 10)!.n).toBe(total);
    expect(lessonStep(C00, 11)).toBeNull();
  });
});

// --- étapes interactives (faux cours « Cours 1 » et « Cours 0 ») ---
const line = (tone: 'color' | 'neutral') => ({
  from: -5,
  to: 2,
  jumps: [{ from: 0, by: -3, after: true }],
  tone,
});
const tk = (...t: string[]) => t.map((x) => ({ t: x }));
const C1: EtapeStep[] = [
  { scene: { layout: 'line', calcs: [{ tokens: tk('2', ' + ', '(−3)') }], line: line('color') }, text: 'On part de 2.' },
  {
    text: 'Ajouter un nombre négatif, c’est **reculer**.',
    action: {
      type: 'trou',
      open: 'Ajouter un nombre négatif, c’est [ ? ].',
      choices: ['avancer', 'reculer'],
      correct: 1,
      errors: { 0: 'Ajouter un nombre négatif, c’est reculer : vers la gauche.' },
    },
  },
  {
    text: 'Le bond est dessiné.',
    action: {
      type: 'graduation',
      consigne: 'Touche l’arrivée.',
      target: -3,
      errors: [{ at: [0], message: 'Tu es resté au départ : le bond fait 3 graduations.' }],
      fallback: 'Compte 3 graduations vers la gauche.',
    },
  },
  { text: 'Tu as compris.', action: { type: 'comprends' } },
];
const C0: EtapeStep[] = [
  {
    scene: { layout: 'one', calcs: [{ tokens: tk('4', ' × ', '−', '3') }] },
    text: 'Regarde ce calcul.',
    action: {
      type: 'morceau',
      consigne: 'Touche le morceau qui cloche.',
      calc: 0,
      target: [2],
      errors: [{ at: [0], message: 'Le 4 est bien écrit.' }],
      fallback: 'Cherche deux signes collés.',
    },
  },
  {
    scene: { layout: 'one', calcs: [{ tokens: tk('4', '×', '−3') }] },
    text: 'Il manque des parenthèses.',
    action: { type: 'endroit', consigne: 'Touche l’endroit.', calc: 0, target: [2], errors: [], fallback: 'Pas ici.' },
  },
];

describe('Etapes : actions interactives', () => {
  it('trou faux : message, trou toujours ouvert ; juste : phrase remplie, jamais de « Suite » pendant le trou', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const t = setup(C1);
    fireEvent.click(t.btn('Suite')!);
    expect(t.btn('Suite')).toBeNull();
    expect(t.$('.trou-slot')).not.toBeNull();
    fireEvent.click(t.btn('avancer')!);
    expect(t.$('.etape-error')!.textContent).toBe('Pas tout à fait. Ajouter un nombre négatif, c’est reculer : vers la gauche. Essaie encore.');
    expect(t.$('.trou-slot')).not.toBeNull();
    fireEvent.click(t.btn('reculer')!);
    expect(t.$('.trou-slot')).toBeNull();
    expect(t.$$('.etape').at(-1)!.textContent).toBe('Ajouter un nombre négatif, c’est reculer.');
    expect(t.btn('Suite')).not.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
  it('la droite est grise tant que le trou est ouvert, en couleur ensuite avec le bond dessiné', () => {
    const t = setup(C1);
    fireEvent.click(t.btn('Suite')!);
    expect(t.$('.line-view')!.className).toContain('is-neutral');
    expect(t.$('.line-view__arc')!.className).not.toContain('is-shown');
    fireEvent.click(t.btn('reculer')!);
    expect(t.$('.line-view')!.className).toContain('is-color');
    expect(t.$('.line-view__arc')!.className).toContain('is-shown');
  });
  it('graduation : 0 → message dédié, 1 → fallback, −3 → bond dessiné', () => {
    const t = setup(C1);
    fireEvent.click(t.btn('Suite')!);
    fireEvent.click(t.btn('reculer')!);
    fireEvent.click(t.btn('Suite')!);
    expect(t.$('.line-view__consigne')!.textContent).toBe('Touche l’arrivée.');
    expect(t.btn('Suite')).toBeNull();
    fireEvent.click(t.$('[aria-label="Graduation 0"]')!);
    expect(t.$('.etape-error')!.textContent).toBe('Pas tout à fait. Tu es resté au départ : le bond fait 3 graduations. Essaie encore.');
    fireEvent.click(t.$('[aria-label="Graduation 1"]')!);
    expect(t.$('.etape-error')!.textContent).toContain('Compte 3 graduations vers la gauche.');
    expect(t.$('.line-view__arc')!.className).not.toContain('is-shown');
    fireEvent.click(t.$('[aria-label="Graduation −3"]')!);
    expect(t.$('.line-view__arc')!.className).toContain('is-shown');
    expect(t.$('.line-view')!.className).toContain('is-color');
    expect(t.btn('Suite')).not.toBeNull();
  });
  it('comprends : un seul bouton, aucune erreur, avance', () => {
    const t = setup(C1);
    fireEvent.click(t.btn('Suite')!);
    fireEvent.click(t.btn('reculer')!);
    fireEvent.click(t.btn('Suite')!);
    fireEvent.click(t.$('[aria-label="Graduation −3"]')!);
    fireEvent.click(t.btn('Suite')!);
    expect(t.btn('Suite')).toBeNull();
    expect(t.btn('Je comprends')).not.toBeNull();
    expect(t.$('.etape-error')).toBeNull();
    fireEvent.click(t.btn('Je comprends')!);
    expect(t.onDone).toHaveBeenCalledTimes(1);
  });
  it('morceau : mauvais token → message, bon → texte et « Suite »', () => {
    const t = setup(C0);
    expect(t.btn('Suite')).toBeNull();
    fireEvent.click(t.btn('4')!);
    expect(t.$('.etape-error')!.textContent).toBe('Pas tout à fait. Le 4 est bien écrit. Essaie encore.');
    fireEvent.click(t.btn('−')!);
    expect(t.$('.etape-error')).toBeNull();
    expect(t.btn('Suite')).not.toBeNull();
  });
  it('endroit : 4 cibles d’espaces, fallback puis succès', () => {
    const t = setup(C0);
    fireEvent.click(t.btn('−')!);
    fireEvent.click(t.btn('Suite')!);
    const gaps = t.$$('.touch-gap');
    expect(gaps).toHaveLength(4);
    fireEvent.click(gaps[0]!);
    expect(t.$('.etape-error')!.textContent).toContain('Pas ici.');
    fireEvent.click(gaps[2]!);
    expect(t.btn('Suivant')).not.toBeNull();
  });
  it('2 phrases visibles au plus : « Relire le début » montre les autres, « Replier le début » les cache', () => {
    const steps: EtapeStep[] = ['A.', 'B.', 'C.', 'D.'].map((text) => ({ text }));
    steps[0]!.scene = { layout: 'one', calcs: [{ tokens: tk('1') }] };
    const t = setup(steps);
    for (let i = 0; i < 3; i++) fireEvent.click(t.btn('Suite')!);
    const visible = () => t.$$('.etape').filter((e) => !e.hidden).map((e) => e.textContent);
    expect(visible()).toEqual(['C.', 'D.']);
    const fold = t.btn('Relire le début')!;
    expect(fold.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(fold);
    expect(visible()).toEqual(['A.', 'B.', 'C.', 'D.']);
    fireEvent.click(t.btn('Replier le début')!);
    expect(visible()).toEqual(['C.', 'D.']);
  });
});
