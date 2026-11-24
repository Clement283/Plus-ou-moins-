import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { ClementQuestion, NewClementQuestion } from '@pom/engine';
import { ApiError, getMyQuestions, markQuestionRead, postQuestion } from '../api';
import { getDb, SESSION_KEY, type PendingAsk, type Session } from './db';

/**
 * « Demander à Clément » côté élève. Les envois attendent dans `asks` (IndexedDB) jusqu'à ce que le serveur les
 * accepte ; l'id client sert de clé d'idempotence (jamais d'envoi en double). Les questions du serveur sont copiées
 * dans `questions` (une entrée par compte) pour s'afficher hors ligne. Chaque lecture est filtrée par compte.
 */

export type MyQuestion = ClementQuestion & { /** Envoyée, en attente de réseau. */ pending?: true };

interface Snap {
  uid: string | null;
  server: ClementQuestion[];
  pending: PendingAsk[];
}
const EMPTY: Snap = { uid: null, server: [], pending: [] };
let snap: Snap = EMPTY;
const listeners = new Set<() => void>();
let loading: Promise<void> | null = null;
/** Réponses vues pendant cette session de l'appli : une relecture du serveur partie avant ne doit pas les remettre « non lues ». */
const seenIds = new Set<string>();

function set(next: Snap): void {
  snap = next;
  listeners.forEach((l) => l());
}

/** Remet le magasin à zéro (tests, changement de compte). */
export function resetQuestions(): void {
  loading = null;
  seenIds.clear();
  snap = EMPTY;
  listeners.forEach((l) => l());
}

async function currentSession(): Promise<Session | undefined> {
  return (await getDb()).get('session', SESSION_KEY);
}

/** Relit la copie locale et les envois en attente du compte `uid`. */
async function loadLocal(uid: string): Promise<void> {
  try {
    const db = await getDb();
    const [server, pending] = await Promise.all([db.get('questions', uid), db.getAllFromIndex('asks', 'byUser', uid)]);
    if (snap.uid !== null && snap.uid !== uid) return;
    set({ uid, server: server ?? [], pending });
  } catch {
    // Base locale illisible : on affiche ce qu'on a.
  }
}

/** Charge la copie locale du compte connecté (lu dans la base), une fois par session de l'appli. */
function ensureLoaded(): void {
  if (snap.uid !== null || loading) return;
  loading = (async () => {
    try {
      const session = await currentSession();
      if (session) await loadLocal(session.user.id);
    } catch {
      // Base locale illisible : liste vide.
    }
  })().finally(() => {
    loading = null;
  });
}

/** Écrit une demande dans `asks` (une seule transaction), l'affiche tout de suite, puis tente l'envoi sans l'attendre. */
export async function askClement(input: Omit<NewClementQuestion, 'id' | 'askedAt'>): Promise<string> {
  const session = await currentSession();
  if (!session) throw new Error('askClement: pas de session');
  const ask: PendingAsk = { ...input, id: crypto.randomUUID(), askedAt: Date.now(), userId: session.user.id };
  await (await getDb()).put('asks', ask);
  if (snap.uid === ask.userId) set({ ...snap, pending: [...snap.pending, ask] });
  else await loadLocal(ask.userId);
  void flushAsks();
  return ask.id;
}

let sending: Promise<void> | null = null;
let again = false;

/** Envoie les demandes en attente du compte connecté, une seule exécution à la fois. Ne lève jamais. */
export function flushAsks(): Promise<void> {
  if (sending) {
    again = true;
    return sending;
  }
  sending = (async () => {
    try {
      do {
        again = false;
        await drain();
      } while (again);
    } finally {
      sending = null;
    }
  })();
  return sending;
}

async function drain(): Promise<void> {
  try {
    const session = await currentSession();
    if (!session) return;
    const uid = session.user.id;
    const db = await getDb();
    const asks = await db.getAllFromIndex('asks', 'byUser', uid);
    let sentAny = false;
    for (const { userId: _u, ...ask } of asks) {
      try {
        await postQuestion(session.token, ask);
      } catch (e) {
        // Refus définitif (invalide, id déjà pris par un autre) : on abandonne l'entrée, sinon on réessaiera plus tard.
        if (e instanceof ApiError && (e.status === 400 || e.status === 409)) {
          await db.delete('asks', ask.id);
          continue;
        }
        throw e;
      }
      await db.delete('asks', ask.id);
      sentAny = true;
    }
    await loadLocal(uid);
    if (sentAny) await refreshQuestions();
  } catch (e) {
    const { dropSessionIf401 } = await import('./sync');
    await dropSessionIf401(e);
  }
}

/** Relit les questions du serveur dans la copie locale. Ne lève jamais : hors ligne, la copie locale suffit. */
export async function refreshQuestions(): Promise<void> {
  try {
    const session = await currentSession();
    if (!session) return;
    const uid = session.user.id;
    const fetched = await getMyQuestions(session.token);
    const db = await getDb();
    const withSeen = (list: ClementQuestion[]) =>
      list.map((q) => (seenIds.has(q.id) && q.answer !== null && q.readAt === null ? { ...q, readAt: Date.now() } : q));
    await db.put('questions', withSeen(fetched), uid);
    const questions = withSeen(fetched);
    set({ uid, server: questions, pending: await db.getAllFromIndex('asks', 'byUser', uid) });
  } catch (e) {
    try {
      const { dropSessionIf401 } = await import('./sync');
      await dropSessionIf401(e);
    } catch {
      // ignoré
    }
  }
}

/** Marque une réponse comme lue : tout de suite en local, puis sur le serveur (un échec réseau n'est pas bloquant). */
export async function markRead(id: string): Promise<void> {
  const session = await currentSession();
  if (!session) return;
  const uid = session.user.id;
  const q = snap.server.find((x) => x.id === id);
  if (!q || q.answer === null || q.readAt !== null) return;
  const server = snap.server.map((x) => (x.id === id ? { ...x, readAt: Date.now() } : x));
  seenIds.add(id);
  set({ ...snap, uid, server });
  try {
    await (await getDb()).put('questions', server, uid);
    await markQuestionRead(session.token, id);
  } catch {
    seenIds.delete(id);
    // Le serveur la redonnera non lue : l'élève la reverra, sans perte.
  }
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
const getSnap = () => snap;

/** Questions du compte connecté : serveur + envois en attente, la plus récente d'abord. */
export function useMyQuestions(): MyQuestion[] {
  const s = useSyncExternalStore(subscribe, getSnap);
  useEffect(ensureLoaded, [s]);
  return useMemo(() => {
    if (s.uid === null) return [];
    const known = new Set(s.server.map((q) => q.id));
    const pending: MyQuestion[] = s.pending
      .filter((p) => !known.has(p.id))
      .map(({ userId: _u, ...p }) => ({
        ...p, answer: null, answeredAt: null, answeredBy: null, readAt: null, pending: true as const,
      }));
    return [...pending, ...s.server].sort((a, b) => b.askedAt - a.askedAt);
  }, [s]);
}

/** Nombre de réponses de Clément pas encore lues. */
export function useUnreadCount(): number {
  const list = useMyQuestions();
  return list.filter((q) => q.answer !== null && q.readAt === null).length;
}
