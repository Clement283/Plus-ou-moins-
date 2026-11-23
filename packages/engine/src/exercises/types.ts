// Question, answer and outcome types (Task 9 interfaces). Builders and checking live in Task 9.
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
  | { kind: 'erreur'; ex: Exercise; lines: string[]; wrongLine: number | null /* null = « Tout est juste » */; errorType: string | null }
  | { kind: 'paires'; exs: Exercise[]; left: string[]; right: { latex: string; value: Rational }[] }
  | { kind: 'classer'; exs: Exercise[]; classes: { id: string; label: string }[]; expected: string[] }
  | {
      kind: 'qcm';
      ex: Exercise;
      choices: { value: Rational; latex: string; errorType: string | null }[];
      correctIndex: number;
      formula: 'debut' | 'paires-signes' | 'melangee';
    }
  | { kind: 'vraifaux'; ex: Exercise; shown: Rational; isTrue: boolean; errorType: string | null };

export interface BuildCtx {
  rng: Rng;
  level: Level;
  timesSeen: number;
  trapErrorType?: string;
}

export type Answer =
  | { raw: RawInput }
  | { choice: number }
  | { order: string[] }
  | { line: number | null }
  | { pairs: [number, number][] }
  | { classes: string[] }
  | { bool: boolean };

export interface Outcome {
  correct: boolean;
  unfinished: boolean;
  errorType: string | null;
  errorFamily: ErrorFamily | null;
  given: string;
  expected: string;
}
