import { useEffect, useState } from 'react';
import { parisDay } from '@pom/engine';
import { useStoredProgress, useStoredReady, useStoredSession } from './sync';

// --- session et progression (magasin partagé de sync.ts) ----------------------

export { FOLD_WAIT_MS, advanceProgress, loadProgressCache, saveProgressCache } from './foldcache';

/** Session courante : `undefined` pendant le chargement, `null` si personne n'est connecté. */
export const useSession = useStoredSession;

/** Progression de l'élève connecté : repli des événements locaux, mise à jour incrémentale, cache IndexedDB (voir sync.ts). */
export const useProgress = useStoredProgress;

/** Vrai quand la session et les premiers événements locaux sont chargés : avant, aucun chiffre ne doit s'afficher. */
export const useReady = useStoredReady;

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

