import type { ErrorFamily, QuestionKind } from '../events';
import type { Answer, BuildCtx, Outcome, Question } from '../exercises/types';
import type { Expr } from '../math/expr';
import type { Rational } from '../math/rational';
import type { Rng } from '../rng';

export type Level = 1 | 2 | 3;

export interface ModuleDef {
  id: string;
  title: string;
  theme: string;
  colorVar: string;
  courseIds: string[];
}

export interface Exercise {
  courseId: string;
  level: Level;
  expr: Expr;
  answer: Rational;
  meta?: Record<string, unknown>;
}

export interface ErrorDef {
  id: string;
  family: ErrorFamily;
  detect(ex: Exercise, given: Rational): boolean;
  explain(ex: Exercise): Explanation;
  trap(level: Level, rng: Rng): Exercise;
  /**
   * The wrong answer(s) this error produces on `ex`: each differs from `ex.answer` and is
   * diagnosed as this very error (values caught by an earlier error of the list are dropped).
   */
  wrongValues(ex: Exercise): Rational[];
  /**
   * « Trouver l'erreur »: the model resolution of `ex` written the way a student making this very
   * error writes it, ending on `wrong` (one of `wrongValues(ex)`). `wrongLine` is its first wrong
   * line; the next lines carry the error on. null when `wrong` cannot come from this error alone.
   */
  wrongResolution?(ex: Exercise, wrong: Rational): WrongResolution | null;
}

export interface WrongResolution {
  lines: string[];
  wrongLine: number;
}

/** Colours and animations are allowed here (lessons and error explanations only). */
export interface Explanation {
  rule: string;
  steps: LessonBlock[];
}

/** How a text block is shown: 'neutre' = grey, neither right (✓) nor wrong (✗). */
export type LessonTone = 'ok' | 'ko' | 'neutre';

export type LessonBlock =
  | { t: 'text'; text: string; tone?: LessonTone }
  | { t: 'math'; latex: string; colorize?: boolean }
  | { t: 'number-line'; from: number; to: number; jumps: { from: number; by: number }[]; animate: true }
  | { t: 'anim'; name: string };

export type LessonPart =
  | { type: 'explication'; blocks: LessonBlock[] }
  | { type: 'question'; activity: 'lecon' | 'exemple'; question: Question };

export interface CourseDef {
  id: string;
  moduleId: string;
  order: number;
  title: string;
  rule: string;
  /** The course's own sequence, in order. */
  parts: LessonPart[];
  /** 'erreur' = the Cours 0 exception. */
  endExercises: { count: 5; kind: 'saisie' | 'trou' | 'erreur' };
  generate(level: Level, rng: Rng): Exercise;
  /** In detection order. */
  errors: ErrorDef[];
  generalExplanation(ex: Exercise): Explanation;
  /** LaTeX lines of the model resolution. */
  resolution(ex: Exercise): string[];
  /** For « Classer ». */
  classes: { id: string; label: string; of(ex: Exercise): string }[];
  expectInteger: boolean;
  /** Course-specific question building (Cours 0: writing exercises). null = use the generic builder. */
  customQuestion?(kind: QuestionKind, ctx: BuildCtx): Question | null;
  /** Course-specific checking (Cours 0). null = use the generic check. */
  customCheck?(q: Question, a: Answer): Outcome | null;
}
