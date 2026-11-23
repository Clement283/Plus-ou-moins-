import { joinPieces, toLatex, type Exercise } from '@pom/engine';

/** Le calcul d'un exercice tel qu'on l'écrit sur la copie ; en cours 0, l'écriture fabriquée (fautes comprises). */
export function calcLatex(ex: Exercise): string {
  const pieces = ex.meta?.tokens;
  return Array.isArray(pieces) ? joinPieces(pieces as string[]) : toLatex(ex.expr);
}

/** Cours 0 (« Bien écrire un calcul ») : ses questions montrent des écritures, pas des résultats. */
export const WRITING_COURSE = 'c00-bien-ecrire';
