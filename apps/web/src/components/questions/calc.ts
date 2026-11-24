import { joinPieces, toLatex, type Exercise } from '@pom/engine';

/** Le calcul d'un exercice tel qu'on l'écrit sur la copie ; en cours 0, l'écriture fabriquée (fautes comprises). */
export function calcLatex(ex: Exercise): string {
  const pieces = ex.meta?.tokens;
  return Array.isArray(pieces) ? writingLatex(joinPieces(pieces as string[])) : toLatex(ex.expr);
}

/**
 * Une écriture de calcul (cours 0) pour KaTeX. Un « − » qui n'est suivi ni d'un nombre, ni d'une parenthèse, ni d'un autre
 * signe (« 3− + 4 », « (2−) ») est posé tel quel : sans cela KaTeX le prend pour une soustraction et colle le « + » qui
 * suit au chiffre (« 3 − +4 »).
 */
export function writingLatex(latex: string): string {
  return latex.replace(/-(?=\s*(?:[^\s\d(\\-]|$))/g, '{-}');
}

/** Un symbole d'une écriture (une case de « Toucher la faute ») en texte simple. */
export function symbolText(latex: string): string {
  return latex.replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/-/g, '−');
}

/** Cours 0 (« Bien écrire un calcul ») : ses questions montrent des écritures, pas des résultats. */
export const WRITING_COURSE = 'c00-bien-ecrire';
