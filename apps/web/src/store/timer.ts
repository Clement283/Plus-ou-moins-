import { useEffect, useRef } from 'react';

/**
 * Chronomètre d'une question ou d'une partie de leçon : mesure de l'affichage à la réponse, en pause tant que
 * la page n'est pas visible (onglet ou appli en arrière-plan, écran verrouillé). Le plafond de 2 et 3 minutes par
 * activité est appliqué plus loin, par `dailyTime` du moteur.
 */
export interface StepTimer {
  /** (Re)démarre à zéro. */
  start(): void;
  /** Millisecondes écoulées, pauses exclues. */
  read(): number;
  /** Repart de zéro sans s'arrêter (après un « Simplifie »). */
  reset(): void;
  /** Détache l'écouteur de visibilité. */
  stop(): void;
}

const visible = (): boolean => typeof document === 'undefined' || document.visibilityState === 'visible';

export function createTimer(now: () => number = Date.now): StepTimer {
  let acc = 0;
  let since: number | null = null;
  let on = false;

  const pause = () => {
    if (since !== null) {
      acc += now() - since;
      since = null;
    }
  };
  const onVisibility = () => {
    if (!on) return;
    if (visible()) since ??= now();
    else pause();
  };
  const start = () => {
    acc = 0;
    since = visible() ? now() : null;
    if (!on && typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility);
    on = true;
  };
  return {
    start,
    read: () => acc + (since !== null ? now() - since : 0),
    reset: start,
    stop() {
      pause();
      on = false;
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}

/** Un chronomètre qui repart à zéro à chaque nouvelle valeur de `key` (une valeur par étape affichée). */
export function useStepTimer(key: unknown): StepTimer {
  const ref = useRef<StepTimer | null>(null);
  ref.current ??= createTimer();
  useEffect(() => {
    const t = ref.current!;
    t.start();
    return () => t.stop();
  }, [key]);
  return ref.current;
}
