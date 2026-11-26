// « Écrire les solutions » (cours 6, produit nul) : l'élève lit (x + 2)(x − 3) = 0 et écrit S = { ▢ ; ▢ }, deux valeurs
// dans l'ordre qu'il veut. Maquette : même écran de saisie que l'intervalle (crochets remplacés par des accolades fixes).
import type { Exercise } from '../courses/types';
import { type Factor, factorRoot, wholeLatex } from '../math/tableau';
import { parseBound } from '../math/intervalle';
import { type Rational, eqRat, ratToString } from '../math/rational';

export interface SolutionsQuestion {
  kind: 'solutions';
  ex: Exercise;
  /** L'équation en LaTeX : (x + 2)(x - 3) = 0. */
  promptLatex: string;
  /** Les solutions attendues (distinctes). */
  roots: Rational[];
  guided?: true;
}

/** (ax + b)(cx + d) = 0 : les solutions sont les valeurs qui annulent un facteur. */
export function solutionsQuestion(ex: Exercise, factors: Factor[]): SolutionsQuestion {
  const roots = factors.map(factorRoot);
  if (roots.some((r, i) => roots.some((s, j) => i < j && eqRat(r, s)))) throw new Error('solutionsQuestion : valeurs distinctes attendues');
  return { kind: 'solutions', ex, promptLatex: `${wholeLatex('produit', factors)} = 0`, roots };
}

export type SolutionsErrorId = 'vide' | 'illisible' | 'une-seule' | 'signe' | 'valeur';

export const SOLUTIONS_ERROR_TEXT: Record<SolutionsErrorId, { title: string; message: string }> = {
  vide: { title: 'Il reste une case vide.', message: 'Il y a une solution pour chaque facteur.' },
  illisible: { title: 'Je ne peux pas lire cette valeur.', message: 'Écris un nombre, par exemple −3 ou 1/2.' },
  'une-seule': { title: 'Il y a deux solutions différentes.', message: 'Chaque facteur donne sa solution : x + 2 = 0 d’un côté, x − 3 = 0 de l’autre.' },
  signe: { title: 'Regarde le signe.', message: 'Pour x + 2 = 0, x vaut −2 : on enlève 2 des deux côtés.' },
  valeur: { title: 'Une valeur n’est pas la bonne.', message: 'Résous chaque facteur égal à 0 : une équation par facteur.' },
};

export function gradeSolutions(q: SolutionsQuestion, typed: string[]): { correct: boolean; errorId: SolutionsErrorId | null; message: string; given: string; expected: string } {
  const fmt = (v: Rational): string => ratToString(v).replace(/-/g, '−');
  const expected = `{${q.roots.slice().sort((a, b) => a.n / a.d - b.n / b.d).map(fmt).join(' ; ')}}`;
  const given = `{${typed.map((t) => t || '…').join(' ; ')}}`;
  const fail = (errorId: SolutionsErrorId) => ({ correct: false, errorId, message: `${SOLUTIONS_ERROR_TEXT[errorId].title} ${SOLUTIONS_ERROR_TEXT[errorId].message}`, given, expected });
  if (typed.length !== q.roots.length || typed.some((t) => t.trim() === '')) return fail('vide');
  const parsed = typed.map(parseBound);
  if (parsed.some((p) => p.kind !== 'num')) return fail('illisible');
  const vs = parsed.map((p) => (p as { kind: 'num'; v: Rational }).v);
  const used = new Set<number>();
  const hit = vs.map((v) => q.roots.findIndex((r, i) => !used.has(i) && eqRat(r, v) && (used.add(i), true)));
  if (hit.every((h) => h >= 0)) return { correct: true, errorId: null, message: '', given, expected };
  if (vs.length === 2 && eqRat(vs[0]!, vs[1]!)) return fail('une-seule');
  if (vs.some((v, i) => hit[i]! < 0 && q.roots.some((r) => r.n !== 0 && eqRat(r, { n: -v.n, d: v.d })))) return fail('signe');
  return fail('valeur');
}

export const solutionsHint = (): string => 'Un produit est nul si un de ses facteurs est nul : résous chaque facteur égal à 0.';
