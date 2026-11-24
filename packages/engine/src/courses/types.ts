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
  /** La règle du cours que cette erreur enfreint, et la partie de la leçon qui l'explique (« Relire la règle N »). */
  rule?: { n: number; label: string; partIndex: number };
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
  | { t: 'text'; text: string; tone?: LessonTone; /** Explication sous la ligne (« Fais attention »). */ note?: string }
  | { t: 'heading'; text: string }
  | { t: 'math'; latex: string; colorize?: boolean }
  | { t: 'number-line'; from: number; to: number; jumps: { from: number; by: number }[]; animate: true }
  | { t: 'anim'; name: string };

/**
 * Textes d'un écran de leçon (doc 09) : `title` remplace le titre du cours (écran d'explication) ou la consigne
 * (écran de question), `subtitle` se met sous le titre, `consigne` remplace la consigne générique d'une question.
 */
export interface PartTexts {
  title?: string;
  subtitle?: string;
  consigne?: string;
  /** Paragraphes avant la question (**gras** autorisé). */
  intro?: string[];
  /** Paragraphes après la réponse, avec l'encadré de règle `outroRule`. */
  outro?: string[];
  outroRule?: { n: number; text: string };
  /** La question s'affiche sur le même écran que la précédente (2 questions par écran, doc 08 n° 20) ; le moteur garde 2 éléments distincts. */
  joinPrevious?: boolean;
}

/** Un morceau d'un calcul affiché dans une scène : `hl` = surligneur (« regarde ici »), `anim` = animation, `dim` = estompé. */
export interface SceneToken {
  t: string;
  hl?: boolean;
  anim?: 'pin' | 'bump' | 'slide';
  dim?: boolean;
}

export interface SceneCalc {
  tokens: SceneToken[];
  /** Sous le calcul (« soustraire »). */
  label?: string;
  /** Étiquette au-dessus (« mal écrit », « bien écrit »). */
  tag?: string;
}

/** La grande zone de calcul d'un écran « pas à pas » ; `pairs` : les calculs par paires (mal écrit puis bien écrit). */
export interface Scene {
  layout: 'one' | 'row' | 'pairs';
  calcs: SceneCalc[];
  /** Phrase sous la scène. */
  caption?: string;
}

/** Une étape d'un écran « pas à pas » (doc 08 n° 20). */
export interface EtapeStep {
  /** Remplace la scène précédente ; sans scène, la dernière reste affichée. */
  scene?: Scene;
  /** **gras** autorisé (composant Bold). */
  text?: string;
  rule?: { n: number; text: string };
  recap?: { title: string; ok: string; ko: string; koLabel?: string }[];
}

export type LessonPart =
  | ({ type: 'explication'; blocks: LessonBlock[] } & Pick<PartTexts, 'title' | 'subtitle'>)
  | { type: 'etapes'; title: string; steps: EtapeStep[] }
  | ({ type: 'question'; activity: 'lecon' | 'exemple' | 'decouverte'; question: Question } & PartTexts);

/**
 * Numéro d'écran de leçon (les parties `joinPrevious` partagent l'écran de la précédente) et nombre d'écrans
 * de la leçon ; null hors leçon (après `lessonLength`, ou cours sans `lessonLength`).
 */
export function lessonStep(course: CourseDef, partIndex: number): { n: number; total: number } | null {
  const length = course.lessonLength;
  if (length === undefined || partIndex < 0 || partIndex >= length) return null;
  let n = 0;
  let total = 0;
  for (let i = 0; i < length; i++) {
    const p = course.parts[i];
    if (p?.type === 'question' && p.joinPrevious === true) continue;
    total++;
    if (i <= partIndex) n++;
  }
  return { n, total };
}

export interface CourseDef {
  id: string;
  moduleId: string;
  order: number;
  title: string;
  /** Nom court, pour les listes serrées (bilan de séance). */
  shortTitle: string;
  rule: string;
  /** The course's own sequence, in order. */
  parts: LessonPart[];
  /** Nombre de parties « Leçon » au début de `parts` (le reste : à toi, exemples guidés, annonce). */
  lessonLength?: number;
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
