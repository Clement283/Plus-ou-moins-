import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppEvent } from '@pom/engine';
import { resetDb, getDb } from '../src/store/db';
import { flush, loadAll, recordEvent, setSession, startSync, type NewEvent } from '../src/store/sync';

const USER = { id: 'u1', name: 'Léa', role: 'eleve' as const };
const partDone = (i: number): NewEvent => ({
  kind: 'lesson_part_done', activityId: 'a1', moduleId: 'm1', courseId: 'c1', partIndex: i, durationMs: 10,
});

/** Faux serveur en mémoire : POST idempotent par id, GET renvoie tout. */
function fakeServer() {
  const store = new Map<string, AppEvent>();
  const state = { online: true, posts: 0, dropAfterStore: false, postDelay: 0 };
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (!state.online) throw new TypeError('network down');
    const json = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
    if (url === '/api/events' && init?.method === 'POST') {
      state.posts++;
      const events = (JSON.parse(init.body as string) as { events: AppEvent[] }).events;
      if (state.postDelay) await new Promise((r) => setTimeout(r, state.postDelay));
      for (const e of events) if (!store.has(e.id)) store.set(e.id, e);
      if (state.dropAfterStore) {
        state.dropAfterStore = false;
        throw new TypeError('connection lost before response');
      }
      return json({ accepted: events.map((e) => e.id) });
    }
    if (url === '/api/events') return json({ events: [...store.values()] });
    return new Response('{}', { status: 404 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return { store, state, fetchMock };
}

async function outboxSize() {
  return (await getDb()).count('outbox');
}

beforeEach(async () => {
  await resetDb();
  await setSession({ token: 't', user: USER });
});
afterEach(() => vi.unstubAllGlobals());

describe('synchronisation', () => {
  it('hors ligne: 3 recordEvent → outbox=3', async () => {
    const srv = fakeServer();
    srv.state.online = false;
    for (let i = 0; i < 3; i++) await recordEvent(partDone(i));
    await flush();
    expect(await outboxSize()).toBe(3);
    expect(await (await getDb()).count('events')).toBe(3);
  });

  it('retour réseau: flush → POST des 3, outbox=0', async () => {
    const srv = fakeServer();
    srv.state.online = false;
    for (let i = 0; i < 3; i++) await recordEvent(partDone(i));
    await flush();
    srv.state.online = true;
    srv.state.posts = 0;
    await flush();
    expect(srv.state.posts).toBe(1);
    expect(srv.store.size).toBe(3);
    expect(await outboxSize()).toBe(0);
  });

  it('coupure pendant l\'envoi puis renvoi → chaque id une seule fois dans loadAll', async () => {
    const srv = fakeServer();
    srv.state.online = false;
    for (let i = 0; i < 3; i++) await recordEvent(partDone(i));
    await flush(); // laisse se terminer les envois lancés hors ligne
    srv.state.online = true;
    srv.state.dropAfterStore = true; // le serveur stocke, mais la réponse se perd
    await flush();
    expect(await outboxSize()).toBe(3);
    await flush(); // renvoi des mêmes ids
    expect(await outboxSize()).toBe(0);
    expect(srv.store.size).toBe(3);
    const all = await loadAll();
    expect(all).toHaveLength(3);
    expect(new Set(all.map((e) => e.id)).size).toBe(3);
  });

  it('deux flush simultanés → un seul POST', async () => {
    const srv = fakeServer();
    srv.state.online = false;
    for (let i = 0; i < 3; i++) await recordEvent(partDone(i));
    srv.state.online = true;
    srv.state.postDelay = 20;
    srv.state.posts = 0;
    await Promise.all([flush(), flush()]);
    expect(srv.state.posts).toBe(1);
    expect(await outboxSize()).toBe(0);
  });

  it('base locale vide + login + loadAll → mêmes événements que le serveur', async () => {
    const srv = fakeServer();
    const a = { id: 'b', userId: 'u1', at: 2, day: '2026-01-01', ...partDone(1) } as AppEvent;
    const b = { id: 'a', userId: 'u1', at: 1, day: '2026-01-01', ...partDone(0) } as AppEvent;
    srv.store.set(a.id, a);
    srv.store.set(b.id, b);
    await resetDb(); // téléphone neuf
    await setSession({ token: 't', user: USER }); // = après login
    expect(await loadAll()).toEqual([b, a]);
  });
});

describe('plusieurs comptes sur un téléphone', () => {
  const OTHER = { id: 'u2', name: 'Sam', role: 'eleve' as const };
  const mk = (id: string, userId: string, at: number) =>
    ({ id, userId, at, day: '2026-01-01', ...partDone(0) }) as AppEvent;

  it('loadAll ne renvoie que les événements du compte connecté', async () => {
    const srv = fakeServer();
    srv.state.online = false;
    await recordEvent(partDone(0)); // u1
    await setSession({ token: 't2', user: OTHER });
    await recordEvent(partDone(1)); // u2
    srv.state.online = true;
    const all = await loadAll();
    expect(all).toHaveLength(1);
    expect(all[0]!.userId).toBe('u2');
  });

  it("des restes d'un autre compte (> 500) ne bloquent pas l'envoi du compte connecté", async () => {
    const srv = fakeServer();
    const db = await getDb();
    const tx = db.transaction('outbox', 'readwrite');
    // ids 'a…' : triés avant 'z…', ils occuperaient les 500 premières clés
    await Promise.all([...Array.from({ length: 600 }, (_, i) => tx.store.put(mk(`a${i}`, 'u2', i))), tx.done]);
    await db.put('outbox', mk('z1', 'u1', 1));
    await flush();
    expect(srv.store.has('z1')).toBe(true);
    expect(srv.store.size).toBe(1);
    expect(await db.countFromIndex('outbox', 'byUser', 'u2')).toBe(600);
    expect(await db.countFromIndex('outbox', 'byUser', 'u1')).toBe(0);
  });
});

describe('sans session', () => {
  it('flush est sans effet et loadAll renvoie []', async () => {
    const srv = fakeServer();
    const { clearSession } = await import('../src/store/sync');
    await clearSession();
    await flush();
    expect(srv.fetchMock).not.toHaveBeenCalled();
    expect(await loadAll()).toEqual([]);
  });
});

describe('startSync', () => {
  it('démarrage, online et visibilitychange déclenchent un flush ; arrêt débranche', async () => {
    const srv = fakeServer();
    srv.state.online = false;
    await recordEvent(partDone(0));
    srv.state.online = true;
    const listeners: Record<string, () => void> = {};
    const target = (extra: object = {}) => ({
      addEventListener: (t: string, l: () => void) => { listeners[t] = l; },
      removeEventListener: (t: string) => { delete listeners[t]; },
      ...extra,
    });
    srv.state.posts = 0;
    const stop = startSync(target() as never, target({ visibilityState: 'visible' }) as never);
    await flush();
    expect(srv.state.posts).toBe(1);
    await recordEvent(partDone(1)); // lance son propre flush
    await flush();
    srv.state.online = false;
    await recordEvent(partDone(2));
    srv.state.online = true;
    srv.state.posts = 0;
    listeners.online!();
    await flush();
    expect(srv.state.posts).toBe(1);
    expect(Object.keys(listeners).sort()).toEqual(['online', 'visibilitychange']);
    stop();
    expect(Object.keys(listeners)).toEqual([]);
  });
});
