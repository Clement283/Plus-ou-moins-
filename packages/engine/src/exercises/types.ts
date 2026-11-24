// Question, answer and outcome types. Builders: ./build; checking: ./check.
import type { ErrorFamily } from '../events';
import type { RawInput } from '../input/raw';
import type { Rational } from '../math/rational';
import type { Rng } from '../rng';
import type { Exercise, Level } from '../courses/types';

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
  | { point: number };

export interface Outcome {
  correct: boolean;
  unfinished: boolean;
  errorType: string | null;
  errorFamily: ErrorFamily | null;
  given: string;
  expected: string;
  /** Texte propre à la réponse (« choix », « Réécris »). */
  message?: string;
}
