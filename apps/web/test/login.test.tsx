import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { resetDb } from '../src/store/db';
import { getSession } from '../src/store/sync';
import Login from '../src/screens/Login';

const USER = { id: 'u1', name: 'Léa', role: 'eleve' as const };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });

let loginFetch: ReturnType<typeof vi.fn>;
function stubLogin(impl: (body: { code: string }) => Response | Promise<Response>) {
  loginFetch = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === '/api/login') return impl(JSON.parse(init!.body as string));
    return json({}, 404);
  });
  vi.stubGlobal('fetch', loginFetch);
}

const field = () => screen.getByLabelText('Ton code') as HTMLInputElement;
const button = () => screen.getByRole('button', { name: /Entrer|Réessayer/ }) as HTMLButtonElement;
const type = (v: string) => fireEvent.change(field(), { target: { value: v } });

beforeEach(async () => {
  await resetDb();
  stubLogin(() => json({ token: 'tok', user: USER }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Connexion', () => {
  it('au départ : textes de la maquette, bouton « Entrer » inactif tant que le champ est vide', () => {
    const { container } = render(<Login />);
    expect(screen.getByRole('heading', { name: 'Plus ou moins' })).toBeTruthy();
    expect(screen.getByText('Entre ton code pour retrouver tes cours.')).toBeTruthy();
    expect(screen.getByText('Les majuscules et les espaces n\'ont pas d\'importance.')).toBeTruthy();
    expect(screen.getByText('Tu n\'as pas de code ? Demande-le à la personne qui te suit.')).toBeTruthy();
    expect(container.querySelector('.mark')?.textContent).toBe('+ −');
    expect(button().textContent).toBe('Entrer');
    expect(button().disabled).toBe(true);
    expect(field().getAttribute('autocapitalize')).toBe('off');
    expect(field().getAttribute('autocomplete')).toBe('off');
    expect(field().getAttribute('spellcheck')).toBe('false');
    expect(container.querySelector('nav, .bottom-nav')).toBeNull();
    expect(screen.queryByText(/déconnexion/i)).toBeNull();
  });

  it('code tapé : affiché en majuscules espacées, envoyé tel quel, session enregistrée', async () => {
    render(<Login />);
    type('k7m2 9qxp');
    expect(field().value).toBe('K7M2 9QXP');
    expect(button().disabled).toBe(false);
    await act(async () => fireEvent.click(button()));
    await waitFor(async () => expect(await getSession()).toEqual({ token: 'tok', user: USER }));
    expect(loginFetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(loginFetch.mock.calls[0]![1].body)).toEqual({ code: 'k7m2 9qxp' });
  });

  it('garde la casse tapée quand on ajoute des lettres une à une', () => {
    render(<Login />);
    let shown = '';
    for (const ch of 'k7m29q') {
      type(shown + ch);
      shown = field().value;
    }
    expect(shown).toBe('K7M2 9Q');
  });

  it('code inconnu (401) : champ en erreur, message de la maquette, rien d\'effacé', async () => {
    stubLogin(() => json({ error: 'unauthorized' }, 401));
    const { container } = render(<Login />);
    type('k7m2 9qxq');
    await act(async () => fireEvent.click(button()));
    const msg = await screen.findByText('Ce code n\'existe pas. Vérifie les lettres et les chiffres, puis réessaie.');
    expect(msg.classList.contains('is-error')).toBe(true);
    expect(container.querySelector('.field__box')!.classList.contains('is-error')).toBe(true);
    expect(field().getAttribute('aria-invalid')).toBe('true');
    expect(field().value).toBe('K7M2 9QXQ');
    expect(button().textContent).toBe('Entrer');
    expect(await getSession()).toBeUndefined();
  });

  it('hors ligne (ApiError 0) : bloc « Pas de connexion » et bouton « Réessayer »', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('down'); }));
    render(<Login />);
    type('k7m2 9qxp');
    await act(async () => fireEvent.click(button()));
    const alert = await screen.findByRole('status');
    expect(alert.classList.contains('alert--neutral')).toBe(true);
    expect(alert.textContent).toContain('Pas de connexion');
    expect(alert.textContent).toContain('Pour entrer, ton téléphone doit être connecté à internet. Ensuite, l\'appli marche aussi sans connexion.');
    expect(button().textContent).toBe('Réessayer');
    expect(field().value).toBe('K7M2 9QXP');
    // Réessayer : le réseau est revenu
    stubLogin(() => json({ token: 'tok', user: USER }));
    await act(async () => fireEvent.click(button()));
    await waitFor(async () => expect(await getSession()).toBeDefined());
  });

  it('modifier le code efface le message d\'erreur', async () => {
    stubLogin(() => json({}, 401));
    render(<Login />);
    type('abcd');
    await act(async () => fireEvent.click(button()));
    await screen.findByText(/n'existe pas/);
    type('abcde');
    expect(screen.queryByText(/n'existe pas/)).toBeNull();
  });

  it.each([
    ['eleve', '#/cours', '#/'],
    ['suiveur', '#/cours', '#/suivi'],
  ] as const)('après connexion (%s) : le hash passe à %s', async (role, stale, expected) => {
    stubLogin(() => json({ token: 'tok', user: { ...USER, role } }));
    window.location.hash = stale;
    render(<Login />);
    type('k7m2 9qxp');
    await act(async () => fireEvent.click(button()));
    await waitFor(async () => expect(await getSession()).toBeDefined());
    expect(window.location.hash).toBe(expected);
  });
});
