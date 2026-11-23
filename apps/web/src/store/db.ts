import { openDB, deleteDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AppEvent, ProgressState } from '@pom/engine';
import type { User } from '../api';

export type Session = { token: string; user: User };

interface PomDB extends DBSchema {
  /** Cache local des événements connus (index byUser : plusieurs comptes peuvent partager un téléphone). */
  events: { key: string; value: AppEvent; indexes: { byUser: string } };
  /** Événements pas encore acceptés par le serveur. */
  outbox: { key: string; value: AppEvent; indexes: { byUser: string } };
  /** Une seule entrée, clé 'current'. */
  session: { key: string; value: Session };
  /** Cache de la progression repliée, une entrée par élève (clé = id). Simple optimisation : le repli des événements fait foi. */
  progress: { key: string; value: ProgressCache };
}

export type ProgressCache = { build: string; state: ProgressState };

const NAME = 'pom';
let dbPromise: Promise<IDBPDatabase<PomDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<PomDB>> {
  if (!dbPromise) {
    const p = openDB<PomDB>(NAME, 3, {
      upgrade(db, oldVersion, _newVersion, tx) {
        if (oldVersion < 1) {
          db.createObjectStore('events', { keyPath: 'id' });
          db.createObjectStore('outbox', { keyPath: 'id' });
          db.createObjectStore('session');
        }
        if (oldVersion < 2) {
          tx.objectStore('events').createIndex('byUser', 'userId');
          tx.objectStore('outbox').createIndex('byUser', 'userId');
        }
        if (oldVersion < 3) {
          db.createObjectStore('progress');
        }
      },
    });
    // Une ouverture refusée ne doit pas rester en cache : le prochain appel réessaie.
    p.catch(() => {
      if (dbPromise === p) dbPromise = null;
    });
    dbPromise = p;
  }
  return dbPromise;
}

/** Ferme et supprime la base (tests). */
export async function resetDb(): Promise<void> {
  if (dbPromise) (await dbPromise).close();
  dbPromise = null;
  await deleteDB(NAME);
}
