import { openDB, deleteDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AppEvent, ClementQuestion, NewClementQuestion, ProgressState } from '@pom/engine';
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
  /** Page de suivi : liste des élèves ('students'), dernier élève consulté ('last') et événements par élève ('events:<id>'), lisibles hors ligne. */
  follow: { key: string; value: unknown };
  /** « Demander à Clément » : envois en attente de réseau (id client = clé d'idempotence côté serveur). */
  asks: { key: string; value: PendingAsk; indexes: { byUser: string } };
  /** Copie locale des questions de l'élève, une entrée par compte (clé = id de l'élève). */
  questions: { key: string; value: ClementQuestion[] };
}

export type PendingAsk = NewClementQuestion & { userId: string };

export type ProgressCache = { build: string; state: ProgressState };

export const DB_NAME = 'pom';
export const DB_VERSION = 5;
/** Magasin de la session et clé de son unique entrée. */
export const SESSION_STORE = 'session';
export const SESSION_KEY = 'current';
/** Forme de la base à la dernière version (utilisée par e2e/shots.ts pour la préparer ; test de cohérence dans test/progress.test.tsx). */
export const DB_SCHEMA: { name: keyof PomDB & string; keyPath?: string; indexes: { name: string; keyPath: string }[] }[] = [
  { name: 'events', keyPath: 'id', indexes: [{ name: 'byUser', keyPath: 'userId' }] },
  { name: 'outbox', keyPath: 'id', indexes: [{ name: 'byUser', keyPath: 'userId' }] },
  { name: SESSION_STORE, indexes: [] },
  { name: 'progress', indexes: [] },
  { name: 'follow', indexes: [] },
  { name: 'asks', keyPath: 'id', indexes: [{ name: 'byUser', keyPath: 'userId' }] },
  { name: 'questions', indexes: [] },
];
let dbPromise: Promise<IDBPDatabase<PomDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<PomDB>> {
  if (!dbPromise) {
    const p = openDB<PomDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, tx) {
        if (oldVersion < 1) {
          db.createObjectStore('events', { keyPath: 'id' });
          db.createObjectStore('outbox', { keyPath: 'id' });
          db.createObjectStore(SESSION_STORE);
        }
        if (oldVersion < 2) {
          tx.objectStore('events').createIndex('byUser', 'userId');
          tx.objectStore('outbox').createIndex('byUser', 'userId');
        }
        if (oldVersion < 3) {
          db.createObjectStore('progress');
        }
        if (oldVersion < 4) {
          db.createObjectStore('follow');
        }
        if (oldVersion < 5) {
          db.createObjectStore('asks', { keyPath: 'id' }).createIndex('byUser', 'userId');
          db.createObjectStore('questions');
        }
      },
      // Une version plus récente de l'appli est ouverte ailleurs : on libère la base et on recharge.
      blocking() {
        void p.then((db) => db.close());
        location.reload();
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
  await deleteDB(DB_NAME);
}
