import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { foldProgress, trainingPool, seededRng, type AppEvent } from '@pom/engine';
import { scenario, TODAY, type ScenarioName } from '../../../e2e/fixtures';

const h = vi.hoisted(() => ({ events: [] as AppEvent[], recorded: [] as any[] }));
vi.mock('../src/store/sync', () => ({
  useEvents: () => h.events,
  loadAll: vi.fn(async () => h.events),
  recordEvent: vi.fn(async (e: any) => void h.recorded.push(e)),
}));
vi.mock('../src/store/progress', async () => {
  const engine = await import('@pom/engine');
  return {
    useProgress: () => engine.foldProgress(h.events),
    useToday: () => '2026-11-22',
    useReady: () => true,
    useSession: () => ({ token: 't', user: { id: 'u-lea', name: 'Léa', role: 'eleve' } }),
  };
});

import Home from '../src/screens/Home';
import Courses from '../src/screens/Courses';
import Training, { TrainingSeries, startTraining } from '../src/screens/Training';

function load(name: ScenarioName | null) {
  h.events = name ? scenario(name).events : [];
}
function mount(ui: React.ReactElement) {
  const view = render(ui);
  const $ = (s: string) => view.container.querySelector<HTMLElement>(s);
  const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
  const text = () => view.container.textContent ?? '';
  const btn = (label: string) => $$('button, a').find((b) => (b.getAttribute('aria-label') ?? b.textContent?.trim()) === label) ?? null;
  return { ...view, $, $$, text, btn };
}

beforeEach(() => {
  window.location.hash = '';
});
afterEach(() => {
  cleanup();
  h.recorded.length = 0;
});

describe('Accueil, cours à valider', () => {
  it('« Dernier essai » après un essai raté, rien sans essai', () => {
    load('cours-a-rattraper');
    expect(mount(<Home />).text()).toContain('Dernier essai : 2 exercices de fin justes sur 5.');
    cleanup();
    load('debut-de-journee');
    expect(mount(<Home />).text()).not.toContain('Dernier essai');
  });
});

describe('Accueil', () => {
  it('début de journée : prénom, série, jauge à 0, révisions à faire, bouton du cours à contour', () => {
    load('debut-de-journee');
    const v = mount(<Home />);
    expect(v.$('h1')?.textContent).toBe('Bonjour Léa !');
    expect(v.$('.streak')?.textContent).toBe('5 jours');
    expect(v.text()).toContain('0 / 15 min');
    expect(v.text()).toContain('Objectif du jour : 15 minutes.');
    const line = v.$('.number-line')!;
    expect(line.getAttribute('aria-label')).toBe('0 minutes sur 15');
    expect(line.querySelectorAll('.number-line__num')).toHaveLength(4); // 0, 5, 10, 15
    expect(v.text()).toContain('5 révisions à faire');
    expect(v.text()).toContain('15 questions, environ 5 minutes');
    expect(v.$('.card--feature .btn')?.textContent).toBe('Réviser');
    expect(v.text()).toContain('Prochain cours');
    expect(v.btn('Commencer le cours 5')?.className).toContain('btn--outlined');
    expect(v.text()).toContain('5 cours sur 8 validés');
    expect(v.$$('.course-window .course-chip')).toHaveLength(4);
  });

  it('« Réviser » ouvre les révisions, le cours ouvre le cours', () => {
    load('debut-de-journee');
    const v = mount(<Home />);
    fireEvent.click(v.btn('Réviser')!);
    expect(window.location.hash).toBe('#/revisions');
    fireEvent.click(v.btn('Commencer le cours 5')!);
    expect(window.location.hash).toBe('#/cours/c05-multiplier-deux');
    expect(v.btn('Voir tous mes cours')?.getAttribute('href')).toBe('#/cours');
  });

  it('après une séance : minutes, « Encore 7 minutes », « Encore 2 révisions »', () => {
    load('apres-une-seance');
    const v = mount(<Home />);
    expect(v.text()).toContain('8 / 15 min');
    expect(v.text()).toContain('Encore 7 minutes pour ton objectif.');
    expect(v.text()).toContain('Encore 2 révisions');
    expect(v.text()).toContain('6 questions, environ 2 minutes');
    expect(v.btn('Encore des révisions')).toBeTruthy();
    expect(v.btn('Commencer le cours 5')?.className).toContain('btn--outlined');
  });

  it('objectif atteint, révisions faites, cours entraînables : pas de grande carte, la carte du cours puis une ligne « Révisions faites »', () => {
    load('objectif-atteint');
    const v = mount(<Home />);
    expect(v.text()).toContain('22 / 15 min');
    expect(v.text()).toContain('Objectif atteint ! 7 minutes en plus.');
    expect(v.$('.day p')?.className).toContain('is-goal');
    expect(v.$('.number-line__cursor')?.className).toContain('is-goal');
    expect(v.$('.number-line__cursor')?.textContent).toBe('22 min');
    expect(v.$$('.number-line__num').map((n) => n.textContent)).toEqual(['0', '5', '10', '15', '20', '25']);
    expect(v.$('.card--feature')).toBeNull();
    expect(v.$('.card--done')).toBeNull();
    expect(v.text()).not.toContain('Tout est révisé');
    // ordre : jauge, carte du cours, ligne discrète
    const order = ['.day', 'section[aria-label="Prochain cours"]', '.done-line'].map((s) => v.$(s));
    expect(order.every(Boolean)).toBe(true);
    expect(order[0]!.compareDocumentPosition(order[1]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(order[1]!.compareDocumentPosition(order[2]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(order[2]!.textContent).toContain('Révisions faites');
    expect(order[2]!.classList.contains('card')).toBe(false);
    expect(order[2]!.querySelector('button')?.textContent).toBe('S\'entraîner');
    fireEvent.click(v.btn('S\'entraîner')!);
    expect(window.location.hash).toBe('#/entrainement');
    expect(v.btn('Commencer le cours 5')?.className).toContain('btn--ink');
  });

  it('aucun cours entraînable (rien de validé) : ni ligne ni bouton « S\'entraîner », la carte du cours suit la jauge', () => {
    load('debut-du-module');
    const v = mount(<Home />);
    expect(v.$('.card--feature')).toBeNull();
    expect(v.$('.done-line')).toBeNull();
    expect(v.text()).not.toContain('Révisions faites');
    expect(v.btn('S\'entraîner')).toBeNull();
    expect(v.$('.day')!.nextElementSibling?.matches('section[aria-label="Prochain cours"]')).toBe(true);
    expect(v.btn('Commencer le cours 0')?.className).toContain('btn--ink');
  });

  it('cours à rattraper : la carte propose la série de validation et la leçon', () => {
    load('cours-a-rattraper');
    const v = mount(<Home />);
    expect(v.text()).toContain('Cours à valider');
    expect(v.text()).toContain('5 exercices. Avec 4 justes, le cours est validé.');
    expect(v.text()).toContain('Encore 12 minutes pour ton objectif.');
    fireEvent.click(v.btn('Faire la série de validation')!);
    expect(window.location.hash).toBe('#/rattrapage/c04-soustraire');
    fireEvent.click(v.btn('Relire la leçon')!);
    expect(window.location.hash).toBe('#/cours/c04-soustraire/relire');
    expect(v.$('.course-window .is-retry')?.textContent).toContain('à valider');
    expect(v.$('.course-window .is-locked')).toBeTruthy();
  });

  it('module terminé : carte « Module Calculs terminé » et « S\'entraîner », plus de « Prochain cours »', () => {
    load('module-termine');
    const v = mount(<Home />);
    expect(v.text()).toContain('Module Calculs terminé. Tous les cours sont validés.');
    expect(v.text()).not.toContain('Prochain cours');
    expect(v.text()).toContain('8 cours sur 8 validés');
    fireEvent.click(v.btn('S\'entraîner')!);
    expect(window.location.hash).toBe('#/entrainement');
  });

  it('la barre du bas marque l\'accueil', () => {
    load('debut-de-journee');
    const v = mount(<Home />);
    expect(v.$('.bottomnav__item.is-active')?.textContent).toBe('Accueil');
  });
});

describe('Accueil, bouton du son', () => {
  it('bascule le son et met aria-pressed à jour, avec ou sans série', () => {
    localStorage.clear();
    load('debut-de-journee');
    const v = mount(<Home />);
    const b = v.$('button[aria-label="Couper le son"]')!;
    expect(b.getAttribute('aria-pressed')).toBe('false');
    expect(v.$('.top .streak')).toBeTruthy();
    fireEvent.click(b);
    const on = v.$('button[aria-label="Remettre le son"]')!;
    expect(on.getAttribute('aria-pressed')).toBe('true');
    expect(localStorage.getItem('pom-son')).toBe('0');
    fireEvent.click(on);
    expect(v.$('button[aria-label="Couper le son"]')?.getAttribute('aria-pressed')).toBe('false');
    cleanup();
    load(null);
    expect(mount(<Home />).$('button[aria-label="Couper le son"]')).toBeTruthy();
  });
});

describe('Mes cours', () => {
  it('début du module : cours 0 à faire ouvert, les autres verrouillés et fermés', () => {
    load(null);
    const v = mount(<Courses />);
    expect(v.text()).toContain('0 cours sur 8 validés');
    expect(v.$$('details.crow')).toHaveLength(1);
    expect(v.$$('.crow.is-locked')).toHaveLength(7);
    expect(v.$('details.crow')?.hasAttribute('open')).toBe(true);
    expect(v.text()).toContain('Valide le cours 0 pour l\'ouvrir.');
    expect(v.btn('Commencer le cours 0')).toBeTruthy();
    expect(v.text()).toContain('Le cours se termine par 5 exercices. Il te faut 4 justes pour le valider.');
  });

  it('un cours verrouillé ne s\'ouvre pas', () => {
    load('debut-de-journee');
    const v = mount(<Courses />);
    const locked = v.$$('.crow.is-locked');
    expect(locked.length).toBe(2);
    expect(locked[0]!.textContent).toContain('Valide le cours 5 pour l\'ouvrir.');
    fireEvent.click(locked[0]!);
    expect(v.$$('details[open]')).toHaveLength(1);
    expect(locked[0]!.querySelector('summary, button')).toBeNull();
  });

  it('en cours : validés avec étoiles, le prochain ouvert, un seul ouvert à la fois', () => {
    load('debut-de-journee');
    const v = mount(<Courses />);
    expect(v.text()).toContain('5 cours sur 8 validés');
    expect(v.$$('details.crow')).toHaveLength(6);
    const open = () => v.$$('details[open]');
    expect(open()).toHaveLength(1);
    expect(open()[0]!.textContent).toContain('Commencer le cours 5');
    // toucher un cours validé : il s'ouvre, l'autre se referme
    const first = v.$$('details.crow')[0]!;
    fireEvent.click(first.querySelector('summary')!);
    expect(open()).toHaveLength(1);
    expect(open()[0]).toBe(first);
    expect(first.textContent).toContain('Validé');
    expect(first.querySelector('.rating')).toBeTruthy();
    expect(v.btn('Relire la leçon')).toBeTruthy();
    expect(v.text()).toContain('Relire ne change ni tes étoiles ni tes révisions.');
    fireEvent.click(v.btn('Relire la leçon')!);
    expect(window.location.hash).toBe('#/cours/c00-bien-ecrire/relire');
    // retoucher la ligne ouverte la referme
    fireEvent.click(first.querySelector('summary')!);
    expect(open()).toHaveLength(0);
  });

  it('à valider : « Dernier essai » après un essai raté, rien pour un cours validé', () => {
    load('cours-a-rattraper');
    const v = mount(<Courses />);
    expect(v.text()).toContain('Dernier essai : 2 exercices de fin justes sur 5.');
    cleanup();
    load('debut-de-journee');
    expect(mount(<Courses />).text()).not.toContain('Dernier essai');
  });

  it('à valider : série de validation et leçon', () => {
    load('cours-a-rattraper');
    const v = mount(<Courses />);
    expect(v.text()).toContain('4 cours sur 8 validés');
    expect(v.text()).toContain('À valider');
    fireEvent.click(v.btn('Faire la série de validation')!);
    expect(window.location.hash).toBe('#/rattrapage/c04-soustraire');
    expect(v.text()).toContain('5 exercices, 4 justes pour valider. Tu peux recommencer autant de fois que tu veux.');
    expect(v.btn('Relire la leçon')).toBeTruthy();
  });

  it('module terminé : badge, 8 cours validés, aucun verrouillé', () => {
    load('module-termine');
    const v = mount(<Courses />);
    expect(v.$('.chip--success')?.textContent).toContain('Module terminé');
    expect(v.text()).toContain('8 cours sur 8 validés');
    expect(v.$$('.crow.is-locked')).toHaveLength(0);
    expect(v.$$('details.crow')).toHaveLength(8);
    expect(v.$('.bottomnav__item.is-active')?.textContent).toBe('Mes cours');
  });
});

describe('Entraînement', () => {
  it('tout mélangé : les cours retenus, « 5 cours retenus, 10 questions »', () => {
    load('debut-de-journee');
    const v = mount(<Training />);
    expect(v.text()).toContain('Pratique libre sur les cours que tu as validés.');
    expect(v.$$('.tchoice .chip--selected').map((c) => c.textContent)).toEqual(['Cours 0', 'Cours 1', 'Cours 2', 'Cours 3', 'Cours 4']);
    expect(v.text()).toContain('5 cours retenus, 10 questions');
    expect(v.text()).toContain('Les cours 5 à 7 apparaîtront ici quand tu auras fini ces cours.');
    expect(v.$('.bottomnav__item.is-active')?.textContent).toBe('Entraînement');
  });

  it('mes cours : cases à cocher, cours à rattraper compris, compteur du bouton', () => {
    load('cours-a-rattraper');
    const v = mount(<Training />);
    fireEvent.click(v.btn('Mes cours')!);
    const boxes = v.$$('input[type=checkbox]') as HTMLInputElement[];
    expect(boxes).toHaveLength(5); // 0 à 3 validés + le 4 à rattraper
    expect(v.text()).toContain('À valider');
    expect(v.text()).toContain('Choisis au moins un cours');
    const go = v.btn('Commencer l\'entraînement') as HTMLButtonElement;
    expect(go.disabled).toBe(true);
    fireEvent.click(boxes[1]!);
    expect(v.text()).toContain('1 cours retenu, 10 questions');
    fireEvent.click(boxes[3]!);
    expect(v.text()).toContain('2 cours retenus, 10 questions');
    expect(go.disabled).toBe(false);
    fireEvent.click(boxes[3]!);
    fireEvent.click(boxes[1]!);
    expect(v.text()).toContain('Choisis au moins un cours');
    expect(go.disabled).toBe(true);
  });

  it('rien à travailler : carte vide et renvoi vers Mes cours, pas de bouton de départ', () => {
    load(null);
    const v = mount(<Training />);
    expect(v.text()).toContain('Rien à travailler pour l\'instant');
    expect(v.text()).toContain('L\'entraînement s\'ouvre dès que tu as validé un cours.');
    expect(v.btn('Commencer l\'entraînement')).toBeNull();
    fireEvent.click(v.btn('Aller aux cours')!);
    expect(window.location.hash).toBe('#/cours');
  });

  it('« Commencer » ouvre la série', () => {
    load('debut-de-journee');
    const v = mount(<Training />);
    fireEvent.click(v.btn('Commencer l\'entraînement')!);
    expect(window.location.hash).toBe('#/entrainement/serie');
  });

  it('la série : 10 questions du cours choisi, pastille « Cours N, entraînement », fin → retour à l\'entraînement, aucune date de révision touchée', async () => {
    load('cours-a-rattraper');
    const before = foldProgress(h.events);
    startTraining({ courseIds: ['c01-additionner-meme-signe'] });
    // La série se tire d'après les événements chargés (loadAll), pas d'après un repli déjà prêt au premier rendu.
    const v = mount(<TrainingSeries rng={seededRng(7)} />);
    expect(v.$('.chip--module')).toBeNull();
    await waitFor(() => expect(v.$('.chip--module')?.textContent).toBe('Cours 1, entraînement'));
    expect(v.container.querySelectorAll('.stepper__step')).toHaveLength(10);
    // La croix quitte la série : retour à l'entraînement.
    fireEvent.click(v.btn('Quitter')!);
    await waitFor(() => expect(window.location.hash).toBe('#/entrainement'));
    expect(trainingPool(before)).toContain('c01-additionner-meme-signe');
    const after = foldProgress([...h.events, ...h.recorded.map((e, i) => ({ ...e, id: `n${i}`, userId: 'u-lea', at: Date.UTC(2026, 10, 22, 12) + i, day: TODAY }))]);
    for (const id of Object.keys(before.courses)) expect(after.courses[id]!.nextReview).toBe(before.courses[id]!.nextReview);
  });

  it('le choix est consommé : revenir sur l\'adresse de la série plus tard renvoie à l\'entraînement', async () => {
    load('cours-a-rattraper');
    startTraining({ courseIds: ['c01-additionner-meme-signe'] });
    const first = mount(<TrainingSeries rng={seededRng(7)} />);
    await waitFor(() => expect(first.$('.chip--module')).not.toBeNull());
    first.unmount();
    window.location.hash = '#/entrainement/serie';
    mount(<TrainingSeries rng={seededRng(7)} />);
    await waitFor(() => expect(window.location.hash).toBe('#/entrainement'));
  });

  it('sans choix en mémoire (rechargement), la série renvoie à l\'entraînement', () => {
    load('debut-de-journee');
    startTraining(null);
    mount(<TrainingSeries />);
    expect(window.location.hash).toBe('#/entrainement');
  });
});
