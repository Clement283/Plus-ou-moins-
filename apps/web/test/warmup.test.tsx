import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { seededRng, type AppEvent } from '@pom/engine';
import { scenario, TODAY, type ScenarioName } from '../../../e2e/fixtures';

const h = vi.hoisted(() => ({ events: [] as AppEvent[], recorded: [] as any[], role: 'eleve' as 'eleve' | 'suiveur' }));
vi.mock('../src/store/sync', () => ({
  useEvents: () => h.events,
  loadAll: vi.fn(async () => h.events),
  recordEvent: vi.fn(async (e: any) => {
    h.recorded.push(e);
    h.events = [...h.events, { ...e, id: `new-${h.recorded.length}`, userId: 'u-lea', at: Date.now(), day: '2026-11-22' }];
  }),
}));
vi.mock('../src/store/progress', async () => {
  const engine = await import('@pom/engine');
  return {
    useProgress: () => engine.foldProgress(h.events),
    useToday: () => '2026-11-22',
    useReady: () => true,
    useSession: () => ({ token: 't', user: { id: 'u-lea', name: 'Léa', role: h.role } }),
  };
});

vi.mock('../src/screens/Dashboard', () => ({ default: () => <main data-screen="suivi" /> }));

import App from '../src/App';
import Warmup from '../src/screens/Warmup';
import { WarmupChip } from '../src/components/WarmupChip';

const load = (name: ScenarioName | null) => void (h.events = name ? scenario(name).events : []);
const flush = () => act(async () => void (await Promise.resolve()));
async function mount(ui: React.ReactElement) {
  const view = render(ui);
  await flush();
  await flush();
  const $ = (s: string) => view.container.querySelector<HTMLElement>(s);
  const $$ = (s: string) => [...view.container.querySelectorAll<HTMLElement>(s)];
  const text = () => view.container.textContent ?? '';
  const btn = (label: string) => $$('button, a').find((b) => (b.getAttribute('aria-label') ?? b.textContent?.trim()) === label) ?? null;
  return { ...view, $, $$, text, btn };
}

beforeEach(() => {
  window.location.hash = '';
  h.role = 'eleve';
});
afterEach(() => {
  cleanup();
  h.recorded.length = 0;
});

describe('Échauffement', () => {
  it('à la première ouverture du jour, #/ mène à l’échauffement', async () => {
    load('debut-de-journee');
    await mount(<App />);
    await waitFor(() => expect(window.location.hash).toBe('#/echauffement'));
  });

  it('aucun cours validé : pas d’échauffement', async () => {
    load('debut-du-module');
    await mount(<App />);
    expect(window.location.hash).not.toBe('#/echauffement');
  });

  it('un suiveur ne reçoit jamais d’échauffement', async () => {
    load('debut-de-journee');
    h.role = 'suiveur';
    await mount(<App />);
    expect(window.location.hash).not.toBe('#/echauffement');
  });

  it('écran centré : titre, durée, choix, « Passer »', async () => {
    load('debut-de-journee');
    const v = await mount(<Warmup rng={seededRng(1)} />);
    expect(v.$('h1')?.textContent).toBe('Un petit calcul avant de commencer');
    expect(v.text()).toContain('1 question · environ 20 secondes');
    expect(v.$$('.choice').length).toBeGreaterThanOrEqual(2);
    expect(v.btn('Passer')).not.toBeNull();
  });

  it('bonne réponse : « Juste. », accueil, un événement échauffement', async () => {
    // le bon choix est celui qu'on trouve par essai : on touche chacun dans un rendu neuf jusqu'au juste
    let ok = false;
    for (let i = 0; i < 3 && !ok; i++) {
      cleanup();
      h.recorded.length = 0;
      load('debut-de-journee');
      const w = await mount(<Warmup rng={seededRng(1)} />);
      fireEvent.click(w.$$('.choice')[i]!);
      await flush();
      ok = w.text().includes('Juste.');
      if (ok) {
        expect(h.recorded).toHaveLength(1);
        expect(h.recorded[0]).toMatchObject({ kind: 'answer', activity: 'echauffement', attempt: 1, correct: true });
        expect(w.text()).not.toContain('Ce cours reviendra');
        fireEvent.click(w.btn('Aller à l’accueil')!);
        expect(window.location.hash).toBe('#/');
      }
    }
    expect(ok).toBe(true);
  });

  it('mauvaise réponse : « Pas tout à fait. » et « Ce cours reviendra dans tes révisions. »', async () => {
    load('debut-de-journee');
    let wrong = false;
    for (let i = 0; i < 3 && !wrong; i++) {
      cleanup();
      h.recorded.length = 0;
      load('debut-de-journee');
      const w = await mount(<Warmup rng={seededRng(1)} />);
      fireEvent.click(w.$$('.choice')[i]!);
      await flush();
      wrong = w.text().includes('Pas tout à fait.');
      if (wrong) {
        expect(w.text()).toContain('Ce cours reviendra dans tes révisions.');
        expect(h.recorded[0]).toMatchObject({ activity: 'echauffement', correct: false });
      }
    }
    expect(wrong).toBe(true);
  });

  it('« Passer » : accueil, événement de fin, jamais reproposé après rechargement', async () => {
    load('debut-de-journee');
    const v = await mount(<Warmup rng={seededRng(1)} />);
    fireEvent.click(v.btn('Passer')!);
    await flush();
    expect(window.location.hash).toBe('#/');
    expect(h.recorded[0]).toMatchObject({ kind: 'activity_end', activity: 'echauffement', completed: false });
    cleanup();
    window.location.hash = '';
    await mount(<App />);
    expect(window.location.hash).not.toBe('#/echauffement');
  });

  it('rechargement sur #/echauffement quand il est déjà fait : retour à l’accueil', async () => {
    load('debut-de-journee');
    h.events = [...h.events, { id: 'done', userId: 'u-lea', at: Date.now(), day: '2026-11-22', kind: 'activity_end', activityId: 'z', activity: 'echauffement', moduleId: 'calculs', courseId: null, completed: false }];
    window.location.hash = '#/echauffement';
    await mount(<Warmup rng={seededRng(1)} />);
    await waitFor(() => expect(window.location.hash).toBe('#/'));
  });

  it('l’accueil montre « Échauffement fait » après une réponse', async () => {
    load('debut-de-journee');
    expect((await mount(<WarmupChip />)).text()).toBe('');
    cleanup();
    h.events = [...h.events, { id: 'ans', userId: 'u-lea', at: Date.now(), day: '2026-11-22', kind: 'answer', activityId: 'z', activity: 'echauffement', moduleId: 'calculs', courseId: 'c01', level: 1, questionKind: 'qcm', prompt: 'p', given: '', expected: '', correct: true, unfinished: false, errorType: null, errorFamily: null, attempt: 1, skipped: false, durationMs: 1000 } as AppEvent];
    expect((await mount(<WarmupChip />)).text()).toContain('Échauffement fait');
  });
});
void TODAY;
