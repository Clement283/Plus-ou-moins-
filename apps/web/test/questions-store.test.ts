import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { ClementQuestion } from '@pom/engine';

const h = vi.hoisted(() => ({
  posted: [] as any[],
  server: [] as any[],
  postError: null as null | { status: number },
  read: [] as string[],
}));
vi.mock('../src/api', async (orig) => {
  const real = await orig<typeof import('../src/api')>();
  return {
    ...real,
    postQuestion: vi.fn(async (_t: string, q: any) => {
      if (h.postError) throw new real.ApiError(h.postError.status, 'x');
      h.posted.push(q);
      if (!h.server.some((s) => s.id === q.id)) h.server.push({ ...q, answer: null, answeredAt: null, answeredBy: null, readAt: null });
    }),
    getMyQuestions: vi.fn(async () => {
      if (h.postError?.status === 0) throw new real.ApiError(0, 'offline');
      return h.server;
    }),
    markQuestionRead: vi.fn(async (_t: string, id: string) => void h.read.push(id)),
    getEvents: vi.fn(async () => []),
    postEvents: vi.fn(async () => []),
  };
});

import { ApiError } from '../src/api';
import { getDb, resetDb, SESSION_KEY } from '../src/store/db';
import { resetStore } from '../src/store/sync';
import { askClement, flushAsks, markRead, refreshQuestions, resetQuestions, useMyQuestions, useUnreadCount } from '../src/store/questions';

const A = { token: 'ta', user: { id: 'u-a', name: 'Léa', role: 'eleve' as const } };
const B = { token: 'tb', user: { id: 'u-b', name: 'Tom', role: 'eleve' as const } };
const input = { courseId: 'c01', calc: '−3 + (−5)', given: '8', expected: '−8', correction: 'Même signe.', note: null };

async function signIn(s: typeof A) {
  await (await getDb()).put('session', s, SESSION_KEY);
  resetStore();
  resetQuestions();
}
const answered = (over: Partial<ClementQuestion> = {}) => ({
  ...input, id: 'q9', askedAt: 1, answer: 'Voilà.', answeredAt: 2, answeredBy: 'Clément', readAt: null, ...over,
});

beforeEach(async () => {
  await resetDb();
  h.posted = [];
  h.server = [];
  h.postError = null;
  h.read = [];
  await signIn(A);
});
afterEach(() => cleanup());

describe('envoi des questions à Clément', () => {
  it('hors ligne : une entrée en attente, aucun envoi accepté', async () => {
    h.postError = { status: 0 };
    const id = await askClement(input);
    await flushAsks();
    expect(h.posted).toHaveLength(0);
    expect(await (await getDb()).count('asks')).toBe(1);
    expect(id).toBeTruthy();
  });

  it('retour du réseau : un seul envoi avec le même id, puis plus rien', async () => {
    h.postError = { status: 0 };
    const id = await askClement(input);
    await flushAsks();
    h.postError = null;
    await flushAsks();
    await flushAsks();
    expect(h.posted.map((p) => p.id)).toEqual([id]);
    expect(await (await getDb()).count('asks')).toBe(0);
    expect(h.posted[0]).not.toHaveProperty('userId');
  });

  it('appli rouverte (magasin neuf) : toujours un seul envoi par id', async () => {
    h.postError = { status: 0 };
    const id = await askClement(input);
    await flushAsks();
    resetStore();
    resetQuestions();
    h.postError = null;
    await Promise.all([flushAsks(), flushAsks()]);
    await flushAsks();
    expect(h.posted.map((p) => p.id)).toEqual([id]);
  });

  it('refus 400 ou 409 : l’entrée est supprimée, pas de boucle', async () => {
    for (const status of [400, 409]) {
      h.postError = { status };
      await askClement(input);
      await flushAsks();
      expect(await (await getDb()).count('asks')).toBe(0);
    }
  });

  it('erreur 500 : l’entrée est conservée', async () => {
    h.postError = { status: 500 };
    await askClement(input);
    await flushAsks();
    expect(await (await getDb()).count('asks')).toBe(1);
  });

  it('le compte B du même téléphone ne voit ni n’envoie les demandes de A', async () => {
    h.postError = { status: 0 };
    await askClement(input);
    await flushAsks();
    await signIn(B);
    h.postError = null;
    await flushAsks();
    expect(h.posted).toHaveLength(0);
    const { result } = renderHook(() => useMyQuestions());
    await new Promise((r) => setTimeout(r, 30));
    expect(result.current).toEqual([]);
  });
});

describe('lecture et pastille', () => {
  it('les envois en attente sont listés, marqués en attente de réseau', async () => {
    h.postError = { status: 0 };
    const id = await askClement(input);
    const { result } = renderHook(() => useMyQuestions());
    await waitFor(() => expect(result.current.map((q) => q.id)).toEqual([id]));
    expect(result.current[0]!.pending).toBe(true);
  });

  it('useUnreadCount : 0 sans réponse, 1 avec réponse non lue, 0 après markRead', async () => {
    h.server = [answered({ id: 'q1', answer: null, answeredAt: null, answeredBy: null })];
    const { result } = renderHook(() => useUnreadCount());
    await act(async () => void (await refreshQuestions()));
    expect(result.current).toBe(0);
    h.server = [answered({ id: 'q1' })];
    await act(async () => void (await refreshQuestions()));
    await waitFor(() => expect(result.current).toBe(1));
    await act(async () => void (await markRead('q1')));
    expect(result.current).toBe(0);
    expect(h.read).toEqual(['q1']);
  });

  it('une erreur serveur ne fait pas planter la lecture', async () => {
    const real = await import('../src/api');
    vi.mocked(real.getMyQuestions).mockRejectedValueOnce(new ApiError(500, 'x'));
    await expect(refreshQuestions()).resolves.toBeUndefined();
  });
});
