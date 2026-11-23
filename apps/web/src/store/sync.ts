import { useSyncExternalStore } from 'react';
import { foldProgress, parisDay, type AppEvent, type ProgressState } from '@pom/engine';
import { ApiError, getEvents, postEvents } from '../api';
import { getDb, SESSION_KEY, type Session } from './db';
import { advanceProgress, loadProgressCache, saveProgressCache } from './foldcache';

const BATCH = 500;

type Generated = 'id' | 'userId' | 'at' | 'day';
/** Omit distribué sur chaque variante de AppEvent (un Omit simple écraserait l'union). */
export type NewEvent = AppEvent extends infer E ? (E extends AppEvent ? Omit<E, Generated> : never) : never;

// --- magasin partagé ---------------------------------------------------------
//
// Une seule copie en mémoire pour toute l'appli : la session, les événements locaux (IndexedDB) et leur repli.
// Local d'abord : les événements du cache s'affichent tout de suite, le serveur est fusionné en arrière-plan.
// Le repli des événements reste la vérité ; le cache de progression (IndexedDB) ne sert que de point de départ.

const EMPTY_PROGRESS: ProgressState = foldProgress([]);

interface Snapshot {
  /** `undefined` pendant le chargement, `null` si personne n'est connecté. */
  session: Session | null | undefined;
  events: AppEvent[];
  progress: ProgressState;
  /** La session et les événements locaux de cette session sont chargés. */
  ready: boolean;
}

const INITIAL: Snapshot = { session: undefined, events: [], progress: EMPTY_PROGRESS, ready: false };
let snap: Snapshot = INITIAL;
const listeners = new Set<() => void>();
let started: Promise<void> | null = null;
let seq = 0;

function set(patch: Partial<Snapshot>): void {
  snap = { ...snap, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  void init();
  return () => {
    listeners.delete(fn);
  };
}

/** Lit la session puis les événements locaux, une seule fois (les changements suivants passent par setSession, clearSession, recordEvent). */
function init(): Promise<void> {
  started ??= (async () => {
    let session: Session | null = null;
    try {
      session = (await getSession()) ?? null;
    } catch {
      // Base locale illisible : comme déconnecté.
    }
    set({ session, ready: session === null });
    await loadLocal();
  })();
  return started;
}

/** Remet le magasin à zéro (tests). */
export function resetStore(): void {
  seq++;
  started = null;
  remoteRun = null;
  snap = INITIAL;
  listeners.forEach((l) => l());
}

/** Relit les événements du compte connecté dans IndexedDB et recalcule la progression. Le dernier appel démarré gagne. */
async function loadLocal(): Promise<void> {
  const my = ++seq;
  const session = snap.session;
  if (!session) {
    set({ events: [], progress: EMPTY_PROGRESS, ready: true });
    return;
  }
  const uid = session.user.id;
  try {
    const db = await getDb();
    const all = (await db.getAllFromIndex('events', 'byUser', uid)).sort(byTime);
    if (my !== seq) return;
    const prev = (await seedFor(uid)) ?? null;
    if (my !== seq) return;
    const progress = advanceProgress(prev, all);
    set({ events: all, progress, ready: true });
    if (all.length > 0) void saveProgressCache(uid, progress);
  } catch {
    if (my === seq) set({ ready: true });
  }
}

let seed: { uid: string; state: ProgressState | null } | null = null;
/** Point de départ du repli : celui déjà en mémoire pour ce compte, sinon le cache IndexedDB (lu une fois). */
async function seedFor(uid: string): Promise<ProgressState | null> {
  if (snap.session?.user.id === uid && snap.progress !== EMPTY_PROGRESS) return snap.progress;
  if (seed?.uid !== uid) seed = { uid, state: await loadProgressCache(uid) };
  return seed.state;
}

/** Session courante : `undefined` pendant le chargement, `null` si personne n'est connecté. */
export function useStoredSession(): Session | null | undefined {
  return useSyncExternalStore(subscribe, () => snap.session);
}

/** Événements locaux de l'élève connecté (déjà fusionnés avec ceux du serveur reçus en arrière-plan). */
export function useEvents(): AppEvent[] {
  return useSyncExternalStore(subscribe, () => snap.events);
}

/** Progression repliée de l'élève connecté. */
export function useStoredProgress(): ProgressState {
  return useSyncExternalStore(subscribe, () => snap.progress);
}

/** Session et premiers événements locaux chargés. */
export function useStoredReady(): boolean {
  return useSyncExternalStore(subscribe, () => snap.ready);
}

// --- session ---------------------------------------------------------------

export async function getSession(): Promise<Session | undefined> {
  return (await getDb()).get('session', SESSION_KEY);
}

export async function setSession(s: Session): Promise<void> {
  await (await getDb()).put('session', s, SESSION_KEY);
  started ??= Promise.resolve();
  seed = null;
  set({ session: s, events: [], progress: EMPTY_PROGRESS, ready: false });
  // Première connexion sur ce téléphone : on attend un peu les événements du serveur pour ne pas afficher une progression vide.
  await remoteWithin(REMOTE_WAIT_MS);
  await loadLocal();
}

/** Déconnexion : efface la session ; le cache et l'outbox restent (jamais perdus). */
export async function clearSession(): Promise<void> {
  await (await getDb()).delete('session', SESSION_KEY);
  started ??= Promise.resolve();
  set({ session: null, events: [], progress: EMPTY_PROGRESS, ready: true });
}

/** Jeton refusé par le serveur (révoqué) : on efface la session, l'appli revient à la connexion. */
export async function dropSessionIf401(e: unknown): Promise<void> {
  if (e instanceof ApiError && e.status === 401) await clearSession();
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
  // L'événement est déjà dans le cache local : on relit en local, sans aller chercher le serveur.
  await loadLocal();
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
  } catch (e) {
    // Réseau coupé ou refus serveur : l'outbox est conservée, on réessaiera
    // (online, retour au premier plan, démarrage). Un 401 ramène à la connexion.
    await dropSessionIf401(e);
  }
}

// --- lecture ---------------------------------------------------------------

function byTime(a: AppEvent, b: AppEvent): number {
  return a.at - b.at || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

let remoteRun: Promise<void> | null = null;

/**
 * Fusionne les événements du serveur dans le cache local puis met le magasin à jour. Une seule requête à la fois
 * dans toute l'appli. Ne lève jamais : hors ligne, le cache local suffit ; un 401 (jeton révoqué) efface la session.
 */
export function refreshRemote(): Promise<void> {
  if (remoteRun) return remoteRun;
  const run: Promise<void> = (async () => {
    try {
      const session = await getSession();
      if (!session) return;
      const remote = await getEvents(session.token);
      const db = await getDb();
      const tx = db.transaction('events', 'readwrite');
      await Promise.all([...remote.map((e) => tx.store.put(e)), tx.done]);
      if (snap.session?.user.id === session.user.id) await loadLocal();
    } catch (e) {
      await dropSessionIf401(e);
    }
  })().finally(() => {
    if (remoteRun === run) remoteRun = null;
  });
  remoteRun = run;
  return run;
}

/** Attend la fusion du serveur au plus `ms` (elle continue en arrière-plan au-delà). */
async function remoteWithin(ms: number): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  await Promise.race([refreshRemote(), new Promise((r) => (timer = setTimeout(r, ms)))]);
  clearTimeout(timer);
}

/** Attente maximale (ms) du serveur dans `loadAll` : au-delà, on part du cache local, la fusion continue en arrière-plan. */
const REMOTE_WAIT_MS = 3000;

/**
 * Cache local fusionné avec le serveur (attendu au plus REMOTE_WAIT_MS), dédoublonné par `id`, trié par date puis id.
 * Hors ligne, renvoie le cache local seul ; sans session, renvoie [].
 */
export async function loadAll(): Promise<AppEvent[]> {
  const session = await getSession();
  if (!session) return [];
  await remoteWithin(REMOTE_WAIT_MS);
  // Le cache garde les événements de tous les comptes du téléphone : on ne lit que ceux du compte connecté.
  const all = await (await getDb()).getAllFromIndex('events', 'byUser', session.user.id);
  const byId = new Map(all.map((e) => [e.id, e]));
  return [...byId.values()].sort(byTime);
}

// --- déclencheurs ----------------------------------------------------------

type Target = Pick<EventTarget, 'addEventListener' | 'removeEventListener'>;

/**
 * À appeler une fois au démarrage de l'appli : lance un envoi, puis un nouvel envoi
 * au retour du réseau (`online`) et au retour au premier plan (`visibilitychange`).
 * Renvoie la fonction d'arrêt.
 */
export function startSync(win: Target = window, doc: Target & { visibilityState?: string } = document): () => void {
  const sync = () => void flush().then(refreshRemote);
  const onOnline = sync;
  const onVisible = () => {
    if (doc.visibilityState !== 'hidden') sync();
  };
  win.addEventListener('online', onOnline);
  doc.addEventListener('visibilitychange', onVisible);
  void init();
  sync();
  return () => {
    win.removeEventListener('online', onOnline);
    doc.removeEventListener('visibilitychange', onVisible);
  };
}
