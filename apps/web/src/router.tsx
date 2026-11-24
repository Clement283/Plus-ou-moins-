import { useSyncExternalStore } from 'react';

export type Route =
  | { name: 'accueil' }
  | { name: 'cours' }
  | { name: 'cours-detail'; id: string }
  | { name: 'relire'; id: string; part?: number }
  | { name: 'rattrapage'; id: string }
  | { name: 'revisions' }
  | { name: 'entrainement' }
  | { name: 'entrainement-serie' }
  | { name: 'suivi' }
  | { name: 'suivi-module'; eleve: string; id: string }
  | { name: 'suivi-cours'; eleve: string; id: string }
  | { name: 'fiche'; id: string }
  | { name: 'echauffement' }
  | { name: 'questions' }
  | { name: 'question'; id: string }
  | { name: 'suivi-question'; eleve: string; id: string }
  | { name: 'essai'; what: string }
  /** Adresse qui ne correspond à aucun écran : l'appli renvoie à l'accueil de la personne. */
  | { name: 'inconnu' };

const ACCUEIL: Route = { name: 'accueil' };

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map((p) => {
    try {
      return decodeURIComponent(p);
    } catch {
      return p;
    }
  });
  const [a, b, c, d] = parts;
  const n = parts.length;
  if (n === 0) return ACCUEIL;
  if (a === 'cours') {
    if (n === 1) return { name: 'cours' };
    if (n === 2) return { name: 'cours-detail', id: b! };
    if (n === 3 && c === 'fiche') return { name: 'fiche', id: b! };
    if (n === 3 && c === 'relire') return { name: 'relire', id: b! };
    if (n === 4 && c === 'relire' && /^\d+$/.test(d!)) return { name: 'relire', id: b!, part: Number(d) };
  }
  if (a === 'echauffement' && n === 1) return { name: 'echauffement' };
  if (a === 'questions') {
    if (n === 1) return { name: 'questions' };
    if (n === 2) return { name: 'question', id: b! };
  }
  if (a === 'rattrapage' && n === 2) return { name: 'rattrapage', id: b! };
  if (a === 'revisions' && n === 1) return { name: 'revisions' };
  if (a === 'entrainement') {
    if (n === 1) return { name: 'entrainement' };
    if (n === 2 && b === 'serie') return { name: 'entrainement-serie' };
  }
  if (a === 'suivi') {
    if (n === 1) return { name: 'suivi' };
    if (n === 4 && c === 'module') return { name: 'suivi-module', eleve: b!, id: d! };
    if (n === 4 && c === 'cours') return { name: 'suivi-cours', eleve: b!, id: d! };
    if (n === 4 && c === 'question') return { name: 'suivi-question', eleve: b!, id: d! };
  }
  if (a === 'essai' && n === 2) return { name: 'essai', what: b! };
  return { name: 'inconnu' };
}

export function toHash(r: Route): string {
  const e = encodeURIComponent;
  switch (r.name) {
    case 'accueil': return '#/';
    case 'cours': return '#/cours';
    case 'cours-detail': return `#/cours/${e(r.id)}`;
    case 'relire': return `#/cours/${e(r.id)}/relire${r.part === undefined ? '' : `/${r.part}`}`;
    case 'rattrapage': return `#/rattrapage/${e(r.id)}`;
    case 'revisions': return '#/revisions';
    case 'entrainement': return '#/entrainement';
    case 'entrainement-serie': return '#/entrainement/serie';
    case 'suivi': return '#/suivi';
    case 'suivi-module': return `#/suivi/${e(r.eleve)}/module/${e(r.id)}`;
    case 'suivi-cours': return `#/suivi/${e(r.eleve)}/cours/${e(r.id)}`;
    case 'fiche': return `#/cours/${e(r.id)}/fiche`;
    case 'echauffement': return '#/echauffement';
    case 'questions': return '#/questions';
    case 'question': return `#/questions/${e(r.id)}`;
    case 'suivi-question': return `#/suivi/${e(r.eleve)}/question/${e(r.id)}`;
    case 'essai': return `#/essai/${e(r.what)}`;
    case 'inconnu': return '#/';
  }
}

/** Navigue vers un hash (`'#/cours'`) ou une route. Le changement de hash déclenche `hashchange`. */
export function go(to: string | Route): void {
  const hash = typeof to === 'string' ? to : toHash(to);
  if (window.location.hash === hash) return;
  window.location.hash = hash;
}

function subscribe(cb: () => void): () => void {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}
const snapshot = () => window.location.hash;

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, snapshot, () => '');
  return parseRoute(hash);
}
