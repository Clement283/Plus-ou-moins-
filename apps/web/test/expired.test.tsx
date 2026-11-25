import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

vi.mock('../src/api', async (orig) => {
  const real = await orig<typeof import('../src/api')>();
  const offline = () => Promise.reject(new real.ApiError(0, 'network'));
  return { ...real, getEvents: vi.fn(offline), postEvents: vi.fn(offline), getMe: vi.fn(offline) };
});

import { ApiError } from '../src/api';
import { resetDb } from '../src/store/db';
import { dropSessionIf401, resetStore, sessionExpired, setSession } from '../src/store/sync';
import Login from '../src/screens/Login';

beforeEach(async () => {
  cleanup();
  await resetDb();
  resetStore();
});

describe('connexion refusée par le serveur (401)', () => {
  it('retour à la connexion avec « Ta connexion a expiré » et le rappel que le code reste le même', async () => {
    await setSession({ token: 't', user: { id: 'u', name: 'Léa', role: 'eleve' } });
    await dropSessionIf401(new ApiError(401, 'HTTP 401'));
    expect(sessionExpired()).toBe(true);
    const { container } = render(<Login />);
    expect(container.textContent).toContain('Ta connexion a expiré');
    expect(container.textContent).toContain('il marche autant de fois que tu veux');
  });

  it('sans session refusée, pas de message', () => {
    const { container } = render(<Login />);
    expect(container.textContent).not.toContain('Ta connexion a expiré');
  });
});
