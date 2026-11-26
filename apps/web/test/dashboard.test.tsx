import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { MODULES, type AppEvent } from '@pom/engine';
import { scenario, LEA, HUGO, type ScenarioName } from '../../../e2e/fixtures';

const h = vi.hoisted(() => ({ students: [] as { id: string; name: string }[], events: {} as Record<string, any[]>, offline: false, status: 0, questions: {} as Record<string, any[]> }));
vi.mock('../src/api', async (orig) => {
  const real = await orig<typeof import('../src/api')>();
  const fail = () => Promise.reject(new real.ApiError(h.status || 0, 'x'));
  return {
    ...real,
    getStudents: vi.fn(async () => (h.offline ? fail() : h.students)),
    getStudentQuestions: vi.fn(async (_t: string, id: string) => (h.offline ? fail() : (h.questions[id] ?? []))),
    getStudentEvents: vi.fn(async (_t: string, id: string) => (h.offline ? fail() : (h.events[id] ?? []))),
  };
});
vi.mock('../src/store/progress', () => ({
  useToday: () => '2026-11-22',
  useSession: () => ({ token: 't', user: { id: 'u-claire', name: 'Claire', role: 'suiveur' } }),
}));

import { resetDb } from '../src/store/db';
import * as sync from '../src/store/sync';
import Dashboard from '../src/screens/Dashboard';
import DashModule from '../src/screens/DashModule';
import DashCourse from '../src/screens/DashCourse';
import { loadEventsCache, loadLastStudent, useStudentEvents } from '../src/store/follow';

const MOD = MODULES[0]!;
const C = (n: number) => MOD.courseIds[n]!;

function load(name: ScenarioName) {
  const f = scenario(name);
  h.students = f.students!;
  h.events = f.studentEvents! as Record<string, AppEvent[]>;
}
async function mount(ui: React.ReactElement, ready = 'main section, main .block') {
  const view = render(ui);
  await waitFor(() => expect(view.container.querySelector(ready)).toBeTruthy());
  const $ = (s: string) => view.container.querySelector<HTMLElement>(s);
  const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
  const text = () => view.container.textContent ?? '';
  return { ...view, $, $$, text };
}

beforeEach(async () => {
  await resetDb();
  h.offline = false;
  h.status = 0;
  h.questions = {};
  window.location.hash = '';
});
afterEach(() => cleanup());

describe('Suivi, accueil', () => {
  it('elle bloque : prénom sans chevron, lecture seule, calendrier L à D, détail du jour, objectif', async () => {
    load('elle-bloque');
    const v = await mount(<Dashboard />);
    expect(v.$('.who')?.textContent).toBe('Léa');
    expect(v.$('.who .ico')).toBeNull();
    expect(v.$('.ro')?.textContent).toBe('Lecture seule');
    expect(v.$$('.cal__wd').map((e) => e.textContent).join('')).toBe('LMMJVSD');
    expect(v.$$('.cal__day')).toHaveLength(28);
    expect(v.text()).toMatch(/Objectif atteint \d+ jours sur 28/);
    const info = v.$('.dayinfo')!.textContent!;
    expect(info).toMatch(/^Dimanche 22 novembre \(aujourd'hui\), 9 min\. Révisions \d+ min, cours \d+ min, entraînement \d+ min\.$/);
    fireEvent.click(v.$$('.cal__day')[0]!);
    expect(v.$('.dayinfo')!.textContent).toMatch(/^Lundi 26 octobre/);
    expect(v.$$('.cal__day')[0]!.getAttribute('aria-pressed')).toBe('true');
  });

  it('elle bloque : État, révisions dépliables, erreurs dépliables, à retravailler', async () => {
    load('elle-bloque');
    const v = await mount(<Dashboard />);
    const facts = v.$$('.facts .fact').map((f) => f.textContent);
    expect(facts[0]).toBe("Aujourd'hui9 / 15 min");
    expect(facts[1]).toMatch(/^Série\d+ jours?$/);
    expect(facts[2]).toBe('Calculs4 / 8 cours');
    expect(v.$('a.fact')?.getAttribute('href')).toBe(`#/suivi/u-lea/module/${MOD.id}`);
    // révisions
    expect(v.text()).toContain('4 en attente');
    expect(v.text()).toContain('la plus ancienne : le 7 novembre');
    expect(v.$('#hrev')!.closest('section')!.querySelector('.acc__body')).toBeNull();
    fireEvent.click(v.$('#hrev')!.closest('section')!.querySelector('summary')!);
    expect(v.$('#hrev')!.closest('section')!.textContent).toContain('Cours 3, additionner plusieurs nombres relatifs');
    // erreurs
    const rows = v.$$('#herr ~ * summary, section[aria-labelledby=herr] summary');
    expect(rows[0]!.textContent).toContain('Signe inversé');
    expect(rows[0]!.textContent).toMatch(/\d+ fois/);
    expect(v.$('section[aria-labelledby=herr] .err')).toBeNull();
    fireEvent.click(rows[0]!);
    const err = v.$('section[aria-labelledby=herr] .err')!;
    expect(err.textContent).toContain('Elle a répondu');
    expect(err.textContent).toContain('la bonne réponse est');
    expect(err.querySelector('.katex')).toBeTruthy();
    // à retravailler : cours validé qui coince
    const rework = v.$('section[aria-labelledby=hret]')!;
    expect(rework.textContent).toContain('Cours 3, Additionner plusieurs nombres relatifs');
    expect(rework.textContent).toContain("2 révisions ratées d'affilée");
    expect(rework.querySelector('a')!.getAttribute('href')).toBe(`#/suivi/u-lea/cours/${C(3)}`);
    expect(rework.querySelectorAll('.crow')).toHaveLength(1); // le cours 4, à valider, n'y est pas (doc 08 n° 14)
  });

  it('tout va bien : révisions à jour, rien à retravailler, objectif atteint', async () => {
    load('tout-va-bien');
    const v = await mount(<Dashboard />);
    expect(v.$('section[aria-labelledby=hrev] .empty--ok')?.textContent).toBe('Révisions à jour');
    expect(v.$('section[aria-labelledby=hret] .empty--ok')?.textContent).toBe('Rien à retravailler en ce moment');
    expect(v.$$('.facts .fact')[0]!.textContent).toBe("Aujourd'hui17 / 15 min");
    expect(v.$('.facts .fact .ico-success')).toBeTruthy();
    expect(v.text()).not.toMatch(/rattrap/i);
  });

  it('deux élèves : le prénom ouvre un volet avec la liste, le choix est mémorisé', async () => {
    load('deux-eleves');
    const v = await mount(<Dashboard />);
    const who = v.$('button.who')!;
    expect(who.getAttribute('aria-label')).toBe("Changer d'élève, Léa");
    expect(who.querySelector('.ico')).toBeTruthy();
    fireEvent.click(who);
    const sheet = document.querySelector('[role=dialog]')!;
    expect([...sheet.querySelectorAll('button')].map((b) => b.textContent)).toEqual(['Léa', 'Hugo']);
    fireEvent.click([...sheet.querySelectorAll('button')][1]!);
    await waitFor(() => expect(v.$('.who')?.textContent).toBe('Hugo'));
    expect(document.querySelector('[role=dialog]')).toBeNull();
    await waitFor(async () => expect(await loadLastStudent('u-claire')).toBe(HUGO.id));
    cleanup();
    const again = await mount(<Dashboard />);
    await waitFor(() => expect(again.$('.who')?.textContent).toBe('Hugo'));
  });

  it('la version de l’appli est affichée en bas de la page de suivi', async () => {
    load('elle-bloque');
    const v = await mount(<Dashboard />);
    const version = v.$('main .app-version');
    expect(version?.textContent).toMatch(/^Version /);
    expect(version?.getAttribute('aria-label')).toContain('Version de l\'appli');
    expect(v.$('main')?.lastElementChild).toBe(version); // tout en bas
  });

  it('lecture seule : aucun bouton d’action, seulement de la navigation', async () => {
    load('elle-bloque');
    const v = await mount(<Dashboard />);
    const allowed = (b: HTMLElement) => b.classList.contains('cal__day') || b.closest('summary') !== null;
    expect(v.$$('button').filter((b) => !allowed(b))).toEqual([]);
    expect(v.$$('input, select, textarea, form')).toEqual([]);
  });

  it('hors ligne : rouvre avec les dernières données gardées', async () => {
    load('elle-bloque');
    const first = await mount(<Dashboard />);
    await waitFor(() => expect(first.text()).toContain('Calculs'));
    await new Promise((r) => setTimeout(r, 50));
    cleanup();
    h.offline = true;
    const v = await mount(<Dashboard />);
    await waitFor(() => expect(v.text()).toContain('Calculs'));
    expect(v.text()).toContain('4 en attente');
  });

  it('401 : la session est effacée', async () => {
    load('elle-bloque');
    h.offline = true;
    h.status = 401;
    const spy = vi.spyOn(sync, 'dropSessionIf401');
    render(<Dashboard />);
    await waitFor(() => expect(spy).toHaveBeenCalled());
  });
});

describe('Suivi, module', () => {
  it('une ligne par cours : validé, à valider (sans ⚠), pas commencé, retour à l’accueil', async () => {
    load('elle-bloque');
    const v = await mount(<DashModule eleve={LEA.id} id={MOD.id} />, '.crow');
    expect(v.$('.appbar__title')?.textContent).toBe('Calculs');
    expect(v.$('.appbar__sub')?.textContent).toBe('4 / 8 cours validés');
    expect(v.$('.appbar a')!.getAttribute('href')).toBe('#/suivi');
    const rows = v.$$('.crow');
    expect(rows).toHaveLength(8);
    expect(rows[0]!.querySelector('.state')?.textContent).toBe('validé');
    expect(rows[0]!.textContent).toMatch(/niveau \d/);
    expect(rows[3]!.textContent).toContain('Cours qui coince : 2 révisions ratées d\'affilée');
    expect(rows[3]!.querySelector('.warn')).toBeTruthy();
    expect(rows[4]!.querySelector('.state--retry')?.textContent).toBe('à valider');
    expect(rows[4]!.textContent).toContain("fin de cours ratée, 3 sur 5 alors qu'il en faut 4");
    expect(rows[4]!.querySelector('.warn')).toBeNull(); // ⚠ seulement sur un cours validé (doc 08 n° 14)
    expect(rows[4]!.getAttribute('href')).toBe(`#/suivi/u-lea/cours/${C(4)}`);
    expect(rows[5]!.querySelector('.state--none')?.textContent).toBe('pas commencé');
    expect(rows[5]!.querySelector('use')!.getAttribute('href')).toBe('#i-lock');
    expect(rows[5]!.tagName).toBe('DIV');
    expect(v.text()).not.toMatch(/rattrap/i);
  });

  it('un cours en cours : « Leçon commencée vendredi, pas encore terminée »', async () => {
    load('tout-va-bien');
    const v = await mount(<DashModule eleve={LEA.id} id={MOD.id} />, '.crow');
    expect(v.$$('.crow')[4]!.textContent).toContain('en coursLeçon commencée vendredi, pas encore terminée');
  });

  it('module terminé : badge « terminé »', async () => {
    const f = scenario('module-termine');
    h.students = [{ id: LEA.id, name: 'Léa' }];
    h.events = { [LEA.id]: f.events as any };
    const v = await mount(<DashModule eleve={LEA.id} id={MOD.id} />, '.crow');
    expect(v.$('.appbar__sub')?.textContent).toContain('terminé');
    expect(v.$('.appbar__sub')?.textContent).toContain('8 / 8 cours validés');
  });
});

describe('Suivi, cours', () => {
  it('cours validé : état, révisions ✓ ✗, erreurs sur 28 jours, dernières erreurs, alerte', async () => {
    load('elle-bloque');
    const v = await mount(<DashCourse eleve={LEA.id} id={C(3)} />, '.chead');
    expect(v.$('.appbar__title')?.textContent).toBe('Cours 3, Additionner plusieurs nombres relatifs');
    expect(v.$('.appbar a')!.getAttribute('href')).toBe(`#/suivi/u-lea/module/${MOD.id}`);
    expect(v.$('.chead .state')?.textContent).toBe('validé');
    expect(v.text()).toMatch(/Validé le \d+ novembre/);
    expect(v.$('.alert--error')?.textContent).toContain("Elle a raté 2 révisions d'affilée");
    const revs = v.$$('.revs .chip');
    expect(revs.map((c) => c.className.includes('chip--success'))).toEqual([true, false, false]);
    expect(revs[1]!.textContent).toContain('ratée');
    expect(v.$$('.bar').length).toBeGreaterThan(0);
    expect(v.$$('.errs .err').length).toBeGreaterThan(0);
  });

  it('cours à valider : score et jour de l’échec, série de validation proposée, pas d’alerte ni d’étoile', async () => {
    load('elle-bloque');
    const v = await mount(<DashCourse eleve={LEA.id} id={C(4)} />, '.chead');
    expect(v.$('.chead .state--retry')?.textContent).toBe('à valider');
    expect(v.$('.cfacts')!.textContent).toBe('Pas encore validé : 3 sur 5 aux exercices de fin, le 21 novembreLa série de validation lui est proposée');
    expect(v.text()).toContain("Pas encore de niveau ni d'étoile");
    expect(v.text()).toContain('Aucune révision pour l’instant : le cours n’est pas validé.');
    expect(v.$('.alert--error')).toBeNull();
    expect(v.text()).not.toMatch(/rattrap/i);
    expect(v.$$('.bar__label').map((e) => e.textContent)).toEqual(['Signe inversé', 'Opposé oublié']);
  });

  it('lecture seule : aucun bouton', async () => {
    load('elle-bloque');
    const v = await mount(<DashCourse eleve={LEA.id} id={C(4)} />, '.chead');
    expect(v.$$('button')).toEqual([]);
  });
});

describe('useStudentEvents', () => {
  it('cache IndexedDB par élève', async () => {
    load('elle-bloque');
    const { renderHook } = await import('@testing-library/react');
    const a = renderHook(() => useStudentEvents(LEA.id));
    await waitFor(() => expect(a.result.current.data?.length).toBeGreaterThan(0));
    await new Promise((r) => setTimeout(r, 50));
    a.unmount();
    h.offline = true;
    const b = renderHook(() => useStudentEvents(LEA.id));
    await waitFor(() => expect(b.result.current.data?.length).toBeGreaterThan(0));
  });

  it('le cache est propre à la personne connectée : un autre suiveur sur ce téléphone ne le voit pas', async () => {
    load('elle-bloque');
    const { renderHook } = await import('@testing-library/react');
    const a = renderHook(() => useStudentEvents(LEA.id));
    await waitFor(() => expect(a.result.current.data?.length).toBeGreaterThan(0));
    await waitFor(async () => expect(await loadEventsCache('u-claire', LEA.id)).toBeDefined());
    expect(await loadEventsCache('u-autre-suiveur', LEA.id)).toBeUndefined();
  });
});

describe('Suivi, hors ligne sans cache', () => {
  it('le module affiche le message hors ligne, pas un écran vide', async () => {
    load('elle-bloque');
    h.offline = true;
    const v = await mount(<DashModule eleve={LEA.id} id={MOD.id} />, '.alert');
    expect(v.text()).toContain('Pas de connexion');
  });
  it('le cours affiche le message hors ligne, pas un écran vide', async () => {
    load('elle-bloque');
    h.offline = true;
    const v = await mount(<DashCourse eleve={LEA.id} id={C(4)} />, '.alert');
    expect(v.text()).toContain('Pas de connexion');
  });
});

describe('Questions à Clément (page de suivi)', () => {
  const q = (id: string, over: Record<string, unknown> = {}) => ({
    id, courseId: MOD.courseIds[0]!, calc: '−3 + (−5)', given: '8', expected: '−8', correction: 'c', note: 'Je ne comprends pas.',
    askedAt: Date.UTC(2026, 10, 22, 8), answer: null, answeredAt: null, answeredBy: null, readAt: null, ...over,
  });

  it('badge = nombre de questions sans réponse, une ligne par demande', async () => {
    load('elle-bloque');
    h.questions[h.students[0]!.id] = [q('a'), q('b'), q('c', { answer: 'Voilà.', answeredAt: 1 })];
    const v = await mount(<Dashboard />);
    await waitFor(() => expect(v.$('[data-questions-badge]')?.textContent).toBe('2'));
    expect(v.text()).toContain('Questions à Clément');
    expect(v.text()).toContain('Sa réponse');
    expect(v.text()).toContain('La bonne réponse');
    expect(v.text()).toContain('Je ne comprends pas.');
    expect(v.$$('[data-question]')).toHaveLength(3);
    expect(v.$$('a[href*="/question/"]')).toHaveLength(3);
  });

  it('pas de badge quand tout est répondu', async () => {
    load('elle-bloque');
    h.questions[h.students[0]!.id] = [q('c', { answer: 'Voilà.', answeredAt: 1 })];
    const v = await mount(<Dashboard />);
    await waitFor(() => expect(v.$$('[data-question]')).toHaveLength(1));
    expect(v.$('[data-questions-badge]')).toBeNull();
  });

  it('la liste vient du cache hors ligne quand le réseau échoue', async () => {
    load('elle-bloque');
    h.questions[h.students[0]!.id] = [q('a')];
    const v1 = await mount(<Dashboard />);
    await waitFor(() => expect(v1.$$('[data-question]')).toHaveLength(1));
    v1.unmount();
    h.offline = true;
    const v2 = await mount(<Dashboard />);
    await waitFor(() => expect(v2.$$('[data-question]')).toHaveLength(1));
  });
});
