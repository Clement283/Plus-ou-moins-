// « Tableau de signes » (maquette docs/design/ecrans/equations-tableau-signes.html, validée le 2026-11-26) :
// l'élève construit le tableau en trois étapes, chacune vérifiée : 1 les valeurs (1re ligne), 2 les lignes (1re colonne),
// 3 les signes. L'exercice décide ce qu'il construit (`ask`) : les signes seuls, valeurs + signes, ou tout.
import type { Exercise } from '../courses/types';
import {
  type Factor,
  type TableErrorId,
  type TableOp,
  TABLE_ERROR_TEXT,
  expectedGrid,
  factorRoot,
  sortedRoots,
  wholeLatex,
  wholeText,
  factorText,
  rootText,
  signsText,
} from '../math/tableau';
import { eqRat } from '../math/rational';

export interface TableauQuestion {
  kind: 'tableau';
  ex: Exercise;
  op: TableOp;
  /** Dans l'ordre de l'expression : (x − 2)(x + 1), ou haut puis bas pour un quotient. */
  factors: Factor[];
  /** Ce que l'élève construit en plus des signes. */
  ask: { valeurs: boolean; lignes: boolean };
  /** L'expression en LaTeX (fraction pour un quotient). */
  promptLatex: string;
  /** Exemple guidé : l'aide du cours est affichée d'office. */
  guided?: true;
}

export function tableauQuestion(ex: Exercise, op: TableOp, factors: Factor[], ask: { valeurs: boolean; lignes: boolean } = { valeurs: true, lignes: true }): TableauQuestion {
  const want = op === 'seul' ? 1 : 2;
  if (op !== 'produit' && factors.length !== want) throw new Error(`tableauQuestion : ${want} facteur(s) attendu(s)`);
  if (factors.length < 1 || factors.some((f) => f.a === 0 || !Number.isInteger(f.a) || !Number.isInteger(f.b))) throw new Error('tableauQuestion : facteurs ax + b entiers');
  const roots = factors.map(factorRoot);
  if (roots.some((r, i) => roots.some((s, j) => i < j && eqRat(r, s)))) throw new Error('tableauQuestion : valeurs distinctes attendues');
  return { kind: 'tableau', ex, op, factors, ask, promptLatex: wholeLatex(op, factors) };
}

/** Le tableau juste, pour la correction et l'affichage : valeurs, libellés des lignes, signes. */
export function tableauSolution(q: TableauQuestion): { roots: string[]; labels: string[]; grid: string[][] } {
  const whole = wholeText(q.op, q.factors);
  return {
    roots: sortedRoots(q.factors).map(rootText),
    labels: [...q.factors.map(factorText), ...(whole ? [whole] : [])],
    grid: expectedGrid(q.op, q.factors),
  };
}

/** Le tableau en réponse : 1re ligne, 1re colonne, signes. */
export interface TableauAnswer {
  errors: TableErrorId[];
  hinted: boolean;
}

/** L'indice : l'étape de la méthode du cours. */
export const tableauHint = (q: TableauQuestion, step: 1 | 2 | 3): string =>
  step === 1
    ? 'Pour chaque facteur, cherche la valeur de x qui le rend égal à 0.'
    : step === 2
      ? q.op === 'seul' ? 'Écris le facteur sur la ligne.' : 'Une ligne par facteur, puis la dernière ligne : l’expression en entier.'
      : 'Un facteur a le signe du nombre devant x à droite de sa valeur, le signe contraire à gauche. 0 sous sa valeur.' + (q.op === 'quotient' ? ' Sous la valeur qui annule le bas : double barre.' : '');

export function gradeTableau(q: TableauQuestion, errors: TableErrorId[]): { correct: boolean; errorId: TableErrorId | null; message: string; expected: string } {
  const sol = tableauSolution(q);
  const expected = signsText(sol.grid[sol.grid.length - 1]!);
  const errorId = errors[0] ?? null;
  const t = errorId ? TABLE_ERROR_TEXT[errorId] : null;
  return { correct: errorId === null, errorId, message: t ? `${t.title} ${t.message}` : '', expected };
}
