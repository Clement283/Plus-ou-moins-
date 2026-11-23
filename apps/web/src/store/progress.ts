import { useEffect, useMemo, useRef, useState } from 'react';
import { applyEvent, foldProgress, parisDay, type AppEvent, type ProgressState } from '@pom/engine';
import { getDb, type Session } from './db';
import { getSession, onChange, useEvents } from './sync';

// --- session ---------------------------------------------------------------

/** Session courante : `undefined` pendant le chargement, `null` si personne n'est connecté. */
export function useSession(): Session | null | undefined {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    const refresh = () => void getSession().then((s) => alive && setSession(s ?? null), () => alive && setSession(null));
    refresh();
    const off = onChange(refresh);
    return () => {
      alive = false;
      off();
    };
  }, []);
  return session;
}

// --- progression -----------------------------------------------------------

/** Ajoute à `prev` les événements qu'il ne connaît pas (applyEvent refait le repli si l'un est plus ancien). */
export function advanceProgress(prev: ProgressState | null, events: AppEvent[]): ProgressState {
  if (!prev) return foldProgress(events);
  const known = new Set(prev.journal.events.map((e) => e.id));
  let s = prev;
  for (const e of events) if (!known.has(e.id)) s = applyEvent(s, e);
  return s;
}

const BUILD = typeof __APP_BUILD__ === 'string' ? __APP_BUILD__ : 'dev';

export async function loadProgressCache(userId: string, build = BUILD): Promise<ProgressState | null> {
  try {
    const c = await (await getDb()).get('progress', userId);
    return c && c.build === build ? c.state : null;
  } catch {
    return null;
  }
}

export async function saveProgressCache(userId: string, state: ProgressState, build = BUILD): Promise<void> {
  try {
    await (await getDb()).put('progress', { build, state }, userId);
  } catch {
    // Le cache est facultatif.
  }
}

/** Progression de l'élève connecté : repli des événements, mise à jour incrémentale, cache IndexedDB. */
export function useProgress(): ProgressState {
  const events = useEvents();
  const session = useSession();
  const uid = session?.user.id ?? null;
  const [seed, setSeed] = useState<{ uid: string; state: ProgressState } | null>(null);
  const last = useRef<{ uid: string | null; state: ProgressState } | null>(null);

  useEffect(() => {
    if (!uid) return;
    let alive = true;
    void loadProgressCache(uid).then((state) => alive && state && setSeed({ uid, state }));
    return () => {
      alive = false;
    };
  }, [uid]);

  const state = useMemo(() => {
    const mine = events.filter((e) => e.userId === uid);
    const prev = last.current?.uid === uid ? last.current.state : seed?.uid === uid ? seed.state : null;
    const next = advanceProgress(prev, mine);
    last.current = { uid, state: next };
    return next;
  }, [events, uid, seed]);

  useEffect(() => {
    if (uid && state.journal.events.length > 0) void saveProgressCache(uid, state);
  }, [uid, state]);

  return state;
}

// --- jour ------------------------------------------------------------------

/** Délai (ms) avant le prochain minuit à Paris, à partir de `now`. */
export function msUntilParisMidnight(now: number): number {
  const today = parisDay(now);
  let lo = now;
  let hi = now + 26 * 3_600_000; // minuit tombe toujours dans les 26 h (changement d'heure compris)
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (parisDay(mid) === today) lo = mid;
    else hi = mid;
  }
  return hi - now;
}

/** Jour de Paris ('YYYY-MM-DD'), recalculé à minuit (Paris) et au retour au premier plan. */
export function useToday(): string {
  const [today, setToday] = useState(() => parisDay(Date.now()));
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      setToday(parisDay(Date.now()));
      clearTimeout(timer);
      timer = setTimeout(refresh, Math.min(msUntilParisMidnight(Date.now()) + 50, 2 ** 31 - 1));
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  return today;
}

