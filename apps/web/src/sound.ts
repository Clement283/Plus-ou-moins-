/**
 * Sons de l'appli : synthétisés avec Web Audio (aucun fichier), courts (400 ms au plus) et doux
 * (volume bas, attaque et déclin, ondes sinus ou triangle). Jamais de vibration.
 * Rien ne lève : sans Web Audio, ou s'il échoue, le son est simplement absent.
 */
export type SoundName = 'juste' | 'faux' | 'valide' | 'objectif';

const KEY = 'pom-son';

/** Réglage mémorisé (défaut : activé). */
export function isSoundOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== '0';
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    // stockage bloqué : le réglage ne sera pas mémorisé
  }
}

interface Note {
  /** Fréquence en Hz. */
  f: number;
  /** Début, en secondes. */
  at: number;
  /** Durée, en secondes. */
  dur: number;
  type?: OscillatorType;
  /** Volume de crête (bas : 0,1 à 0,16). */
  vol?: number;
}

// Gamme de do majeur : do5 523, mi5 659, sol5 784, do6 1047. Faux : sol3 196.
const SOUNDS: Record<SoundName, Note[]> = {
  juste: [
    { f: 659.25, at: 0, dur: 0.11, type: 'sine', vol: 0.14 },
    { f: 880, at: 0.09, dur: 0.16, type: 'sine', vol: 0.14 },
  ],
  faux: [{ f: 196, at: 0, dur: 0.22, type: 'triangle', vol: 0.12 }],
  valide: [
    { f: 523.25, at: 0, dur: 0.14, type: 'triangle', vol: 0.13 },
    { f: 659.25, at: 0.1, dur: 0.14, type: 'triangle', vol: 0.13 },
    { f: 783.99, at: 0.2, dur: 0.2, type: 'triangle', vol: 0.13 },
  ],
  objectif: [
    { f: 523.25, at: 0, dur: 0.1, type: 'sine', vol: 0.13 },
    { f: 659.25, at: 0.08, dur: 0.1, type: 'sine', vol: 0.13 },
    { f: 783.99, at: 0.16, dur: 0.1, type: 'sine', vol: 0.13 },
    { f: 1046.5, at: 0.24, dur: 0.16, type: 'sine', vol: 0.13 },
  ],
};

let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor: typeof AudioContext | undefined = typeof window === 'undefined' ? undefined : (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

export function playSound(name: SoundName): void {
  try {
    if (!isSoundOn()) return;
    const c = context();
    if (!c) return;
    if (c.state === 'suspended') void c.resume().catch(() => undefined);
    const t0 = c.currentTime + 0.02;
    for (const n of SOUNDS[name]) {
      const osc = c.createOscillator();
      const gain = c.createGain();
      const vol = n.vol ?? 0.12;
      const start = t0 + n.at;
      const end = start + n.dur;
      osc.type = n.type ?? 'sine';
      osc.frequency.setValueAtTime(n.f, start);
      // attaque 15 ms, puis déclin jusqu'à presque rien : pas de clic ni de buzz
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(start);
      osc.stop(end + 0.02);
    }
  } catch {
    // Web Audio indisponible ou refusé : pas de son
  }
}

const GOAL_KEY = 'pom-objectif-sonne';

/** Objectif du jour atteint : joue « objectif » une seule fois par jour (`day` = date du jour à Paris, mémorisée). */
export function announceGoal(day: string): void {
  try {
    if (localStorage.getItem(GOAL_KEY) === day) return;
    localStorage.setItem(GOAL_KEY, day);
  } catch {
    // stockage bloqué : on joue quand même (le franchissement n'arrive qu'une fois par jour de toute façon)
  }
  // un peu après le son du retour (« juste » ou « faux ») pour ne pas le couvrir
  setTimeout(() => playSound('objectif'), 450);
}
