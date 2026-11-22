import { openDB, deleteDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AppEvent } from '@pom/engine';
import type { User } from '../api';

export type Session = { token: string; user: User };

interface PomDB extends DBSchema {
  /** Cache local de tous les événements connus (les miens + ceux reçus du serveur). */
  events: { key: string; value: AppEvent };
  /** Événements pas encore acceptés par le serveur. */
  outbox: { key: string; value: AppEvent };
  /** Une seule entrée, clé 'current'. */
  session: { key: string; value: Session };
}

const NAME = 'pom';
let dbPromise: Promise<IDBPDatabase<PomDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<PomDB>> {
  dbPromise ??= openDB<PomDB>(NAME, 1, {
    upgrade(db) {
      db.createObjectStore('events', { keyPath: 'id' });
      db.createObjectStore('outbox', { keyPath: 'id' });
      db.createObjectStore('session');
    },
  });
  return dbPromise;
}

/** Ferme et supprime la base (tests). */
export async function resetDb(): Promise<void> {
  if (dbPromise) (await dbPromise).close();
  dbPromise = null;
  await deleteDB(NAME);
}
