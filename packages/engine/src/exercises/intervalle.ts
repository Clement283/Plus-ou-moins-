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
import { type Sign, expectedGrid, sortedRoots } from '../math/tableau';
import type { TableauQuestion } from './tableau';

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
  /** Deuxième morceau d'une réunion A ∪ B (cours 10 et 11) : l'élève relie les intervalles par ∪. */
  expected2?: Interval;
  /** Le tableau de signes à lire (affiché au-dessus, colonnes qui conviennent coloriées). */
  table?: TableauQuestion & { rel: Strict };
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
export function gradeIntervalle(q: IntervalleQuestion, input: IntervalInput, symbol: Relation | null, input2: IntervalInput | null = null): IntervalleOutcome {
  const expected = [q.expected, q.expected2].filter((e): e is Interval => e !== undefined).map(intervalText).join(' ∪ ');
  const given = [input, input2].filter((i): i is IntervalInput => i !== null).map(inputText).join(' ∪ ');
  if (q.flip && symbol !== q.flip.answer) {
    return { correct: false, errorId: 'sens', message: `${INTERVAL_ERROR_TEXT.sens.title} ${INTERVAL_ERROR_TEXT.sens.message}`, given, expected };
  }
  if ((q.expected2 !== undefined) !== (input2 !== null)) {
    const r = INTERVAL_ERROR_TEXT.reunion;
    return { correct: false, errorId: 'reunion', message: `${r.title} ${r.message}`, given, expected };
  }
  let v = judgeInterval(q.expected, input);
  if (v.ok && q.expected2 && input2) v = judgeInterval(q.expected2, input2);
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

/**
 * Les colonnes d'un tableau qui conviennent pour `rel` : les colonnes de signe voulu, et les valeurs elles-mêmes si la
 * relation est large (≤ ou ≥) et que la case vaut 0. Une double barre ne convient jamais (valeur interdite).
 */
export function solutionColumns(row: Sign[], rel: Strict): boolean[] {
  const want: Sign = rel === '>' || rel === '>=' ? '+' : '−';
  const large = rel === '<=' || rel === '>=';
  return row.map((s, c) => (c % 2 === 1 ? large && s === '0' : s === want));
}

/** Les intervalles d'un tableau (au plus deux) : les colonnes qui conviennent, regroupées. */
export function intervalsOfColumns(roots: Rational[], ok: boolean[]): Interval[] {
  const out: Interval[] = [];
  const last = ok.length - 1;
  let c = 0;
  while (c <= last) {
    if (!ok[c]) {
      c += 1;
      continue;
    }
    const s = c;
    while (c < last && ok[c + 1]) c += 1;
    const e = c;
    out.push({
      lo: s === 0 ? null : roots[s % 2 === 1 ? (s - 1) / 2 : s / 2 - 1]!,
      loClosed: s % 2 === 1,
      hi: e === last ? null : roots[e % 2 === 1 ? (e - 1) / 2 : e / 2]!,
      hiClosed: e % 2 === 1,
    });
    c += 1;
  }
  return out;
}

/** « Résous (x − 2)(x + 1) ≥ 0 » : le tableau (à lire) puis S, en un ou deux intervalles. */
export function intervalleFromTable(ex: Exercise, table: TableauQuestion, rel: Strict): IntervalleQuestion {
  const grid = expectedGrid(table.op, table.factors);
  const ivs = intervalsOfColumns(sortedRoots(table.factors), solutionColumns(grid[grid.length - 1]!, rel));
  if (ivs.length === 0 || ivs.length > 2) throw new Error('intervalleFromTable : un ou deux intervalles attendus');
  const whole = table.promptLatex;
  const q: IntervalleQuestion = {
    kind: 'intervalle',
    ex,
    promptLatex: `${whole} ${relationLatex(rel)} 0`,
    expected: ivs[0]!,
    resultLatex: '',
    table: { ...table, rel },
  };
  return ivs[1] ? { ...q, expected2: ivs[1] } : q;
}
