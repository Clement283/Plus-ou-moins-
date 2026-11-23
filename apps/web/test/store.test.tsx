import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { foldProgress } from '@pom/engine';
import { scenario } from '../../../e2e/fixtures';

// Le vrai magasin (sync.ts, progress.ts) sur fake-indexeddb ; seul le réseau est simulé (hors ligne).
vi.mock('../src/api', async (orig) => {
  const real = await orig<typeof import('../src/api')>();
  const offline = () => Promise.reject(new real.ApiError(0, 'network'));
  return { ...real, getEvents: vi.fn(offline), postEvents: vi.fn(offline) };
});

import { resetDb, getDb } from '../src/store/db';
import { saveProgressCache } from '../src/store/foldcache';
import { resetStore, setSession } from '../src/store/sync';
import App from '../src/App';
import Home from '../src/screens/Home';
import Training, { TrainingSeries, startTraining } from '../src/screens/Training';

const USER = { id: 'u-lea', name: 'Léa', role: 'eleve' as const };

async function seed(name: Parameters<typeof scenario>[0]) {
  const db = await getDb();
  const events = scenario(name).events;
  const tx = db.transaction('events', 'readwrite');
  await Promise.all([...events.map((e) => tx.store.put(e)), tx.done]);
  await db.put('session', { token: 't', user: USER }, 'current');
}

/** Tout ce qu'un écran a affiché, état après état : sert à prouver qu'aucun faux chiffre n'a clignoté. */
function watch(container: HTMLElement): string[] {
  const seen = [container.textContent ?? ''];
  new MutationObserver(() => seen.push(container.textContent ?? '')).observe(container, { subtree: true, childList: true, characterData: true });
  return seen;
}

beforeEach(async () => {
  cleanup();
  await resetDb();
  resetStore();
  window.location.hash = '';
});
afterEach(() => cleanup());

describe('magasin réel (IndexedDB, hors ligne)', () => {
  it('Accueil : premier affichage utile avec le prénom et la vraie progression, jamais « Bonjour ! » ni « 0 cours sur 8 »', async () => {
    await seed('debut-de-journee');
    const { container } = render(<Home />);
    const seen = watch(container);
    await waitFor(() => expect(container.textContent).toContain('Bonjour Léa !'));
    expect(container.textContent).toContain('5 cours sur 8 validés');
    for (const t of seen) {
      expect(t).not.toContain('0 cours sur 8');
      expect(t).not.toMatch(/Bonjour !/);
    }
  });

  it('une connexion sur un téléphone vide donne un accueil prêt (progression vide, mais prénom)', async () => {
    const { container } = render(<App />);
    const seen = watch(container);
    await waitFor(() => expect(container.textContent).toContain('Ton code'));
    await setSession({ token: 't', user: USER });
    await waitFor(() => expect(container.textContent).toContain('Bonjour Léa !'));
    for (const t of seen) expect(t).not.toMatch(/Bonjour !/);
  });

  it('Entraînement : la série démarre avec 10 questions (progression chargée depuis IndexedDB)', async () => {
    await seed('debut-de-journee');
    const choose = render(<Training />);
    await waitFor(() => expect(choose.container.textContent).toContain('Commencer l\'entraînement'));
    choose.unmount();
    startTraining('tout');
    const { container } = render(<TrainingSeries />);
    await waitFor(() => expect(container.querySelector('.chip--module')?.textContent).toMatch(/^Cours \d+, entraînement$/));
    expect(container.querySelectorAll('.stepper__step')).toHaveLength(10);
    expect(window.location.hash).toBe('#/entrainement/serie');
  });

  it('routes : un élève sur #/suivi ou une adresse inconnue revient à #/, un suiveur sur une route élève va à #/suivi', async () => {
    await seed('debut-de-journee');
    window.location.hash = '#/suivi';
    const a = render(<App />);
    await waitFor(() => expect(window.location.hash).toBe('#/'));
    a.unmount();
    window.location.hash = '#/n-importe-quoi/du-tout';
    const b = render(<App />);
    await waitFor(() => expect(window.location.hash).toBe('#/'));
    b.unmount();
    // Un suiveur
    await (await getDb()).put('session', { token: 't', user: { id: 'u-claire', name: 'Claire', role: 'suiveur' } }, 'current');
    resetStore();
    window.location.hash = '#/cours';
    render(<App />);
    await waitFor(() => expect(window.location.hash).toBe('#/suivi'));
  });

  it('le cache de progression sert de point de départ au repli', async () => {
    const events = scenario('debut-de-journee').events;
    const db = await getDb();
    await db.put('session', { token: 't', user: USER }, 'current');
    await saveProgressCache(USER.id, foldProgress(events)); // le cache connaît des événements que la base d'événements n'a pas
    const { container } = render(<Home />);
    await waitFor(() => expect(container.textContent).toContain('5 cours sur 8 validés'));
  });
});
