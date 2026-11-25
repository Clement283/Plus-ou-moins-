import { useSyncExternalStore } from 'react';

/**
 * Mode « Tester les cours » d'un compte suiveur « aperçu » (users.apercu) : il voit l'appli de l'élève, tous les cours
 * ouverts ; rien n'est enregistré (réponses gardées en mémoire le temps du cours, voir clearTestEvents). Retenu sur ce téléphone.
 */
const KEY = 'pom-tester-cours';
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

let on = read();

export function setTestMode(value: boolean): void {
  on = value;
  try {
    if (value) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    // stockage indisponible : le mode tient jusqu'au rechargement
  }
  listeners.forEach((l) => l());
}

export function useTestMode(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => on,
  );
}
