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
  /** Série de pratique : « Question n sur of » ; `outro` = la phrase de transition sous l'encadré « N sur of » de la dernière question. */
  series?: { n: number; of: number; outro?: string };
  /** Lignes LaTeX de résolution déjà posées au-dessus de la case (exemples guidés). */
  above?: string[];
  /** Encadré d'aide de la ligne en cours. */
  help?: string;
  /** Mention sous la question (« ne compte pas » ; '' = aucune). */
  mention?: string;
  /** Entraînement non noté : l'élément devient `decouverte` (ne compte pas, ne repasse pas). */
  uncounted?: true;
  /** « Comparer deux cas ». */
  compare?: Compare;
}

/** La droite graduée d'une scène. */
export interface LineScene {
  from: number;
  to: number;
  /** `after` : dessiné seulement une fois l'action réussie. */
  jumps: { from: number; by: number; label?: string; after?: boolean }[];
  /** Graduations surlignées en jaune (ex. [0]). */
  highlight?: number[];
  /** « départ », « arrivée ». */
  marks?: { at: number; text: string }[];
  /** « négatifs à gauche · positifs à droite ». */
  legend?: string;
  /** 'neutral' = grise. */
  tone: 'color' | 'neutral';
}

export interface Compare {
  a: { label: string; latex: string };
  b: { label: string; latex: string };
  note: string;
  /** Les deux trajets sur la droite ; absent : pas de droite (Cours 0). */
  line?: LineScene;
  /** Après la réponse, sans droite : les deux calculs avec leurs morceaux surlignés. */
  highlight?: { a: SceneToken[]; b: SceneToken[] };
  after: string[];
}

/** Indices touchés → message. */
export interface StepFault {
  at: number[];
  message: string;
}

export type StepAction =
  /** `open` contient « [ ? ] » et remplace la phrase ; `step.text` = la phrase remplie. */
  | { type: 'trou'; open: string; choices: string[]; correct: number; errors: Record<number, string> }
  /** Toucher une graduation de `scene.line` ; le bon toucher dessine les jumps `after`. */
  | { type: 'graduation'; consigne: string; target: number; errors: StepFault[]; fallback: string }
  /** Bouton « Je comprends », pas d'erreur possible. */
  | { type: 'comprends'; label?: string }
  /** morceau : indices de tokens de `scene.calcs[calc]` ; endroit : indices d'espaces entre tokens (0 = avant le 1er). */
  | { type: 'morceau' | 'endroit'; consigne: string; calc: number; target: number[]; errors: StepFault[]; fallback: string; /** `endroit` : les espaces proposés (tous par défaut). */ gaps?: number[] };

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
  layout: 'one' | 'row' | 'pairs' | 'line' | 'lines';
  calcs: SceneCalc[];
  /** Phrase sous la scène. */
  caption?: string;
  /** 'line' : calcs[0] = le calcul au-dessus de la droite ; 'lines' : résolution ligne à ligne, la dernière calc est surlignée. */
  line?: LineScene;
}

/** Une étape d'un écran « pas à pas » (doc 08 n° 20). */
export interface EtapeStep {
  /** Remplace la scène précédente ; sans scène, la dernière reste affichée. */
  scene?: Scene;
  /** **gras** autorisé (composant Bold). */
  text?: string;
  rule?: { n: number; text: string };
  recap?: { title: string; ok: string; ko: string; koLabel?: string }[];
  /** Action de l'élève (remplace « Suite » ; rien n'est noté). */
  action?: StepAction;
  /** Scène montrée dès que l'action est réussie (le résultat du toucher), à la place de `scene`. */
  after?: Scene;
}

/** L'essai libre d'une technique de l'écran « Autres façons de faire » : ne compte pas dans la note, seul le résultat est corrigé. */
export type AutresEssai =
  /** Taper un résultat : `errors` = des réponses (entières) et leur message ; `fallback` pour toute autre. */
  | { kind: 'saisie'; consigne: string; calc: string; answer: number; yes: string; errors: { values: number[]; message: string }[]; fallback: string }
  /** Toucher un choix en bas de l'écran. */
  | { kind: 'choix'; consigne: string; calc: string; options: string[]; correct: number; yes: string; no: string };

/** Une carte de l'écran « Autres façons de faire » : le nom, quand l'utiliser, un exemple chiffré, l'explication, l'essai libre. */
export interface AutresTechnique {
  name: string;
  quand: string;
  example: string;
  how: string;
  essai: AutresEssai;
}

/**
 * « Autres façons de faire » (doc 06, Cours 2) : en haut le rappel des règles (`recap`, comme à la fin d'une leçon),
 * puis 2 ou 3 techniques en cartes ; le choix se fait avec les boutons du bas, l'essai est libre et on peut continuer sans essayer.
 */
export interface Autres {
  title: string;
  /** Rappel des règles : titre, une ligne par règle (exemple juste et faux), et « En une phrase ». */
  recap?: { title: string; rules: { title: string; ok: string; ko: string }[]; sentence: string };
  /** Phrase d'introduction des cartes (**gras** autorisé). */
  intro: string;
  techniques: AutresTechnique[];
  /** Phrase de fin d'écran (transition vers la série de pratique). */
  outro?: string;
}

export type LessonPart =
  | ({ type: 'explication'; blocks: LessonBlock[] } & Pick<PartTexts, 'title' | 'subtitle'>)
  | { type: 'etapes'; title: string; steps: EtapeStep[] }
  | ({ type: 'autres' } & Autres)
  | ({ type: 'question'; activity: 'lecon' | 'exemple' | 'decouverte'; question: Question } & PartTexts)
  | { type: 'pratique'; title: string; questions: { question: Question; texts?: PartTexts }[]; /** Phrase de transition après la série. */ outro?: string };

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

/** Fiche mémo d'un cours. */
export interface MemoCard {
  rule: string;
  ruleBullets?: string[];
  examples: string[];
  mistake: { wrong: string; why: string };
  tip: string;
}

export type ReviewFormat = 'saisie' | 'droite' | 'signe' | 'vraifaux' | 'erreur';

export interface CourseDef {
  id: string;
  moduleId: string;
  /** Numéro affiché (« Cours 5 »). Recalculé par `getCourse` d'après l'ordre des modules : la valeur écrite ici ne compte que pour les cours hors de MODULES. */
  order: number;
  title: string;
  /** Nom court, pour les listes serrées (bilan de séance). */
  shortTitle: string;
  rule: string;
  /** The course's own sequence, in order. */
  parts: LessonPart[];
  /** Nombre de parties « Leçon » au début de `parts` (le reste : à toi, exemples guidés, annonce). */
  lessonLength?: number;
  /**
   * Explications pas à pas : une seule phrase affichée à la fois (« Suite » la remplace, les précédentes sont derrière
   * « Relire le début ») ; sinon les 2 dernières. Décision du 2026-11-25 : pour les cours écrits à partir de cette date.
   */
  unePhrase?: boolean;
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
  memo?: MemoCard;
  formats?: ReviewFormat[];
  /** Texte propre au cours pour une réponse (juste ou fausse) ; null = texte du moteur. */
  feedbackText?(q: Question, o: Outcome): string | null;
}
