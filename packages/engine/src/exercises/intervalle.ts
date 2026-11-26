// « Écrire un intervalle » (maquette docs/design/ecrans/equations-intervalles.html, validée le 2026-11-26) :
// l'élève écrit l'ensemble des solutions d'une inéquation en intervalle (crochets à retourner, bornes, ±∞).
// Variante `flip` (cours 8) : avant d'écrire S, il choisit le symbole après une division par un nombre négatif.
import type { Exercise } from '../courses/types';
import { type Equation, type Relation, equationLatex, flipRel, relationLatex } from '../math/equation';
import { solutionSet } from '../math/solve';
import {
  INTERVAL_ERROR_TEXT,
  type Interval,
  type IntervalErrorId,
  type IntervalInput,
  inputText,
  intervalLatex,
  intervalOfRelation,
  intervalText,
  judgeInterval,
} from '../math/intervalle';
import { type Rational, rat, ratToString } from '../math/rational';

export type Strict = Exclude<Relation, '='>;

export interface IntervalleQuestion {
  kind: 'intervalle';
  ex: Exercise;
  /** L'inéquation de départ en LaTeX : x < 3, ou −2x ⩾ 6 avec `flip`. */
  promptLatex: string;
  /** L'intervalle attendu. */
  expected: Interval;
  /** La forme x rel b, en LaTeX : montrée sous la ligne `flip`, une fois le symbole choisi. */
  resultLatex: string;
  /** Cours 8 : on divise par `by` (négatif) ; le bon symbole est `answer`, `given` celui de départ. */
  flip?: { by: number; given: Strict; answer: Strict };
  /** Exemple guidé : l'aide du cours est affichée d'office. */
  guided?: true;
}

/** « x rel b » à écrire en intervalle (cours 7). */
export function intervalleQuestion(ex: Exercise, rel: Strict, bound: number | Rational): IntervalleQuestion {
  const b = typeof bound === 'number' ? rat(bound) : bound;
  return {
    kind: 'intervalle',
    ex,
    promptLatex: `x ${relationLatex(rel)} ${latexNum(b)}`,
    expected: intervalOfRelation(rel, b),
    resultLatex: `x ${relationLatex(rel)} ${latexNum(b)}`,
  };
}

/** Une inéquation du 1er degré à résoudre en intervalle (cours 8) : −2x + 1 ⩾ 7. Le symbole est choisi si on divise par un négatif. */
export function intervalleFromInequality(ex: Exercise, eq: Equation, flip?: { by: number }): IntervalleQuestion {
  const s = solutionSet(eq);
  if (s.kind !== 'ray') throw new Error('intervalleFromInequality : inéquation du 1er degré attendue');
  const q: IntervalleQuestion = {
    kind: 'intervalle',
    ex,
    promptLatex: equationLatex(eq),
    expected: intervalOfRelation(s.rel, s.bound),
    resultLatex: `x ${relationLatex(s.rel)} ${latexNum(s.bound)}`,
  };
  if (flip && flip.by < 0 && eq.rel !== '=') return { ...q, flip: { by: flip.by, given: eq.rel as Strict, answer: flipRel(eq.rel) as Strict } };
  return q;
}

const latexNum = (v: Rational): string => (v.d === 1 ? `${v.n}` : `${v.n < 0 ? '-' : ''}\\frac{${Math.abs(v.n)}}{${v.d}}`);

export const SYMBOLS: Strict[] = ['<', '<=', '>', '>='];

export type IntervalleOutcome = { correct: boolean; errorId: IntervalErrorId | null; message: string; given: string; expected: string };

/** La note de la question : le symbole (si `flip`) d'abord, puis l'intervalle. */
export function gradeIntervalle(q: IntervalleQuestion, input: IntervalInput, symbol: Relation | null): IntervalleOutcome {
  const expected = intervalText(q.expected);
  const given = inputText(input);
  if (q.flip && symbol !== q.flip.answer) {
    return { correct: false, errorId: 'sens', message: `${INTERVAL_ERROR_TEXT.sens.title} ${INTERVAL_ERROR_TEXT.sens.message}`, given, expected };
  }
  const v = judgeInterval(q.expected, input);
  if (v.ok) return { correct: true, errorId: null, message: '', given, expected };
  const t = INTERVAL_ERROR_TEXT[v.errorId];
  return { correct: false, errorId: v.errorId, message: `${t.title} ${t.message}`, given, expected };
}

/** L'indice : la règle des crochets, en une phrase. */
export const intervalleHint = (q: IntervalleQuestion): string =>
  q.flip
    ? 'Divise par un négatif : le sens se retourne. Puis : borne comprise (≤ ou ≥), crochet tourné vers elle ; sinon, tourné à l’opposé. Contre ∞, toujours ouvert.'
    : 'Borne comprise (≤ ou ≥) : le crochet est tourné vers elle. Borne exclue (< ou >) : il s’en éloigne. Contre ∞, toujours ouvert.';

/** Le résultat attendu, en LaTeX, pour la correction. */
export const intervalleExpectedLatex = (q: IntervalleQuestion): string => `S = ${intervalLatex(q.expected)}`;

export const symbolText = (s: Relation): string => ({ '=': '=', '<': '<', '<=': '≤', '>': '>', '>=': '≥' })[s];
export const boundValueText = (v: Rational): string => ratToString(v).replace(/-/g, '−');
