import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/api', async (orig) => {
  const real = await orig<typeof import('../src/api')>();
  const offline = () => Promise.reject(new real.ApiError(0, 'network'));
  return { ...real, getEvents: vi.fn(offline), postEvents: vi.fn(offline) };
});

import { postEvents } from '../src/api';
import { getDb, resetDb } from '../src/store/db';
import { clearTestEvents, currentEvents, recordEvent, resetStore, setSession } from '../src/store/sync';

const CLEMENT = { id: 'u-clement', name: 'Clément', role: 'suiveur' as const, apercu: true };

beforeEach(async () => {
  await resetDb();
  resetStore();
  vi.mocked(postEvents).mockClear();
});

describe('mode « Tester les cours » (suiveur) : rien n’est enregistré', () => {
  it('une réponse reste en mémoire, jamais sur le téléphone ni envoyée, puis est effacée à la fermeture du cours', async () => {
    await setSession({ token: 't', user: CLEMENT });
    await recordEvent({ kind: 'lesson_part_done', activityId: 'a1', courseId: 'c00', partIndex: 0 } as never);
    expect(currentEvents()).toHaveLength(1);
    const db = await getDb();
    expect(await db.getAll('events')).toHaveLength(0);
    expect(await db.getAll('outbox')).toHaveLength(0);
    expect(postEvents).not.toHaveBeenCalled();
    clearTestEvents();
    expect(currentEvents()).toHaveLength(0);
  });
});
