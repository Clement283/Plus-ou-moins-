import { applyEvent, foldProgress, type AppEvent, type ProgressState } from '@pom/engine';
import { getDb } from './db';

/** Délai (ms) après lequel un écran de fin affiche ce qu'il a en mémoire si le repli des événements n'a pas suivi. */
export const FOLD_WAIT_MS = 3000;

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
