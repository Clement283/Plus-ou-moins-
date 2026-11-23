import { useEffect, useState } from 'react';
import { parisDay, type AppEvent } from '@pom/engine';
import { getEvents, postEvents } from '../api';
import { getDb, type Session } from './db';

const BATCH = 500;
const SESSION_KEY = 'current';

type Generated = 'id' | 'userId' | 'at' | 'day';
/** Omit distribué sur chaque variante de AppEvent (un Omit simple écraserait l'union). */
export type NewEvent = AppEvent extends infer E ? (E extends AppEvent ? Omit<E, Generated> : never) : never;

// --- session ---------------------------------------------------------------

export async function getSession(): Promise<Session | undefined> {
  return (await getDb()).get('session', SESSION_KEY);
}

export async function setSession(s: Session): Promise<void> {
  await (await getDb()).put('session', s, SESSION_KEY);
  notify();
}

/** Déconnexion : efface la session ; le cache et l'outbox restent (jamais perdus). */
export async function clearSession(): Promise<void> {
  await (await getDb()).delete('session', SESSION_KEY);
  notify();
}

// --- abonnés (useEvents) ---------------------------------------------------

const listeners = new Set<() => void>();
/** Abonnement aux changements locaux (session, événements enregistrés). Renvoie la fonction de désabonnement. */
export function onChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function notify(): void {
  listeners.forEach((l) => l());
}

// --- écriture --------------------------------------------------------------

/** Écrit dans `events` et `outbox` (une seule transaction), puis lance `flush()` sans l'attendre. */
export async function recordEvent(e: NewEvent): Promise<AppEvent> {
  const session = await getSession();
  if (!session) throw new Error('recordEvent: pas de session');
  const at = Date.now();
  const event = { ...e, id: crypto.randomUUID(), userId: session.user.id, at, day: parisDay(at) } as AppEvent;
  const db = await getDb();
  const tx = db.transaction(['events', 'outbox'], 'readwrite');
  await Promise.all([tx.objectStore('events').put(event), tx.objectStore('outbox').put(event), tx.done]);
  notify();
  void flush();
  return event;
}

// --- envoi -----------------------------------------------------------------

let running: Promise<void> | null = null;
let again = false;

/**
 * Envoie l'outbox par lots de 500. Une seule exécution à la fois : un appel pendant un envoi
 * demande un nouveau tour à la fin de l'envoi en cours (pas de second POST concurrent).
 * Ne lève jamais : en cas d'échec, l'outbox est conservée pour un prochain essai.
 */
export function flush(): Promise<void> {
  if (running) {
    again = true;
    return running;
  }
  running = (async () => {
    try {
      do {
        again = false;
        await drainOutbox();
      } while (again);
    } finally {
      running = null;
    }
  })();
  return running;
}

async function drainOutbox(): Promise<void> {
  try {
    const session = await getSession();
    if (!session) return;
    const db = await getDb();
    for (;;) {
      const batch = await db.getAllFromIndex('outbox', 'byUser', session.user.id, BATCH);
      if (batch.length === 0) return;
      const accepted = new Set(await postEvents(session.token, batch));
      const sent = batch.filter((e) => accepted.has(e.id));
      if (sent.length === 0) return; // rien d'accepté : on arrête, pas de boucle infinie
      const tx = db.transaction('outbox', 'readwrite');
      await Promise.all([...sent.map((e) => tx.store.delete(e.id)), tx.done]);
      if (batch.length < BATCH) return;
    }
  } catch {
    // Réseau coupé ou refus serveur : l'outbox est conservée, on réessaiera
    // (online, retour au premier plan, démarrage).
  }
}

// --- lecture ---------------------------------------------------------------

function byTime(a: AppEvent, b: AppEvent): number {
  return a.at - b.at || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

/**
 * Cache local fusionné avec le serveur, dédoublonné par `id`, trié par date puis id.
 * Hors ligne, renvoie le cache local seul ; sans session, renvoie [].
 */
export async function loadAll(): Promise<AppEvent[]> {
  const db = await getDb();
  const session = await getSession();
  if (!session) return [];
  try {
    const remote = await getEvents(session.token);
    const tx = db.transaction('events', 'readwrite');
    await Promise.all([...remote.map((e) => tx.store.put(e)), tx.done]);
  } catch {
    // Hors ligne : on se contente du cache local.
  }
  // Le cache garde les événements de tous les comptes du téléphone : on ne lit que ceux du compte connecté.
  const all = await db.getAllFromIndex('events', 'byUser', session.user.id);
  const byId = new Map(all.map((e) => [e.id, e]));
  return [...byId.values()].sort(byTime);
}

/** Événements de l'élève connecté ; se recharge à chaque enregistrement local. */
export function useEvents(): AppEvent[] {
  const [events, setEvents] = useState<AppEvent[]>([]);
  useEffect(() => {
    let alive = true;
    const refresh = () => void loadAll().then((all) => alive && setEvents(all));
    refresh();
    listeners.add(refresh);
    return () => {
      alive = false;
      listeners.delete(refresh);
    };
  }, []);
  return events;
}

// --- déclencheurs ----------------------------------------------------------

type Target = Pick<EventTarget, 'addEventListener' | 'removeEventListener'>;

/**
 * À appeler une fois au démarrage de l'appli : lance un envoi, puis un nouvel envoi
 * au retour du réseau (`online`) et au retour au premier plan (`visibilitychange`).
 * Renvoie la fonction d'arrêt.
 */
export function startSync(win: Target = window, doc: Target & { visibilityState?: string } = document): () => void {
  const onOnline = () => void flush();
  const onVisible = () => {
    if (doc.visibilityState !== 'hidden') void flush();
  };
  win.addEventListener('online', onOnline);
  doc.addEventListener('visibilitychange', onVisible);
  void flush();
  return () => {
    win.removeEventListener('online', onOnline);
    doc.removeEventListener('visibilitychange', onVisible);
  };
}
