// Question, answer and outcome types. Builders: ./build; checking: ./check.
import type { ErrorFamily } from '../events';
import type { RawInput } from '../input/raw';
import type { Rational } from '../math/rational';
import type { Rng } from '../rng';
import type { Exercise, Level } from '../courses/types';
import type { Equation } from '../math/equation';
import type { CalculerQuestion } from './calculer';
import type { IntervalleQuestion } from './intervalle';
import type { TableauQuestion } from './tableau';
import type { SolutionsQuestion } from './solutions';
import type { IntervalInput } from '../math/intervalle';

export type { QuestionKind } from '../events';

export type Question =
  | { kind: 'saisie'; ex: Exercise; promptLatex: string }
  | { kind: 'trou'; ex: Exercise; promptLatex: string; hidden: Rational }
  | {
      kind: 'ordre';
      ex: Exercise;
      tiles: { id: string; latex: string }[];
      solution: string[];
      trapTile?: { latex: string; errorType: string };
    }
  | {
      kind: 'erreur';
      ex: Exercise;
      lines: string[];
      wrongLine: number | null /* null = « Tout est juste » */;
      errorType: string | null;
      /** « Toucher la faute » : si présent, `line` est juste ⇔ `line ∈ accept` ; vide ⇔ « Tout est bien écrit » juste. */
      accept?: number[];
      /** Le calcul affiché en haut. */
      shownLatex?: string;
    }
  | { kind: 'paires'; exs: Exercise[]; left: string[]; right: { latex: string; value: Rational }[] }
  | { kind: 'classer'; exs: Exercise[]; classes: { id: string; label: string }[]; expected: string[] }
  | {
      kind: 'qcm';
      ex: Exercise;
      choices: { value: Rational; latex: string; errorType: string | null }[];
      correctIndex: number;
      formula: 'debut' | 'paires-signes' | 'melangee';
    }
  | { kind: 'vraifaux'; ex: Exercise; shown: Rational; isTrue: boolean; errorType: string | null }
  | {
      kind: 'choix';
      ex: Exercise;
      calcLatex: string | null;
      prompt: string;
      options: { label: string; why: string }[];
      correctIndex: number;
      /** Petite question de leçon : repasse 2 étapes plus loin, options remélangées (doc 08 n° 21). Absent : repassage habituel. */
      small?: true;
      /** Question « pour deviner » : titre du retour quand la réponse est fausse (défaut : « Pas tout à fait, et c'est normal. »). */
      guessTitle?: string;
    }
  | {
      kind: 'reecrire';
      ex: Exercise;
      givenLatex: string;
      /** Normalisés (voir `normalizeCalc`). */
      expected: string;
      specific: { answer: string; message: string; errorType: string | null; correct: boolean }[];
      fallback: string;
      steps: string[];
    }
  | {
      /** « À toi de résoudre » : l'élève écrit chaque ligne, avec sa méthode, jusqu'à x = … */
      kind: 'resoudre';
      ex: Exercise;
      start: Equation;
      /** Exemple guidé : l'aide (l'étape du cours) est affichée d'office à chaque ligne. */
      guided?: true;
    }
  | CalculerQuestion
  | IntervalleQuestion
  | TableauQuestion
  | SolutionsQuestion
  | {
      kind: 'droite';
      ex: Exercise;
      promptLatex: string;
      line: { from: number; to: number };
      jumps: { from: number; by: number }[];
      answer: number;
    };

export interface BuildCtx {
  rng: Rng;
  level: Level;
  timesSeen: number;
  trapErrorType?: string;
}

/**
 * - `pairs` (« Relier les paires »): every pair she tried, in order, wrong ones included;
 * - `classes` (« Classer »): `classes[i]` = the box where she first put calculation i.
 * Both tell the first try, so the exercise is right only if everything was right at once.
 */
export type Answer =
  | { raw: RawInput }
  | { choice: number }
  | { order: string[] }
  | { line: number | null }
  | { pairs: [number, number][] }
  | { classes: string[] }
  | { bool: boolean }
  | { text: string }
  | { point: number }
  /** « résoudre » : toutes les lignes validées, dans l'ordre (fausses comprises) ; `hinted` : l'indice a été ouvert. */
  | { lines: string[]; hinted: boolean }
  /** « calculer » : les lignes de calcul validées (fausses comprises), le 1er verdict « solution ou pas » et l'indice. */
  | { calcLines: string[]; firstPick: boolean; hinted: boolean }
  /** « intervalle » : l'intervalle écrit, le symbole choisi (cours 8, après une division par un négatif) et l'indice. */
  | { interval: IntervalInput; interval2?: IntervalInput | null; symbol: string | null; hinted: boolean }
  /** « tableau » : l'erreur de chaque vérification ratée, dans l'ordre (vide : tout juste du premier coup), et l'indice. */
  | { tableau: import('../math/tableau').TableErrorId[]; hinted: boolean }
  /** « solutions » : les valeurs écrites (une par solution) et l'indice. */
  | { values: string[]; hinted: boolean };

export interface Outcome {
  correct: boolean;
  unfinished: boolean;
  errorType: string | null;
  errorFamily: ErrorFamily | null;
  given: string;
  expected: string;
  /** Texte propre à la réponse (« choix », « Réécris », « résoudre »). */
  message?: string;
  /** Juste avec l'indice (« résoudre ») : « avec aide » dans le suivi. */
  helped?: boolean;
}
