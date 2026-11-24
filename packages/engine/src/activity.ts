/**
 * The activity queue (doc 01 §2 and §6, doc 03 §3 and §5): a course run, a rattrapage, a review
 * session or a training series, with the re-insertions after an error and the events to record.
 *
 * Choices (technical or interpretations, see the task report):
 * - Every item has a stable `itemId`. `attempt` counts the answers given on that item: 1 for its
 *   first answer, then 2, 3… for every later presentation. The « même type » calcul is a NEW calcul
 *   but belongs to the failed item, so it is recorded as one of that item's attempts (≥ 2): only the
 *   first answer of each original item counts for srs (5 'fin' answers, 3 review answers).
 * - « 3 questions plus loin, ou à la fin s'il en reste moins de 3 » (read literally): the failed
 *   question at position n, the « même type » calcul at position n + 3, i.e. after the next 2
 *   questions still to do (explanations not counted; pending repeats and « même type » calculs
 *   counted). With fewer than 3 questions left after the failed one, it goes at the end. The exact
 *   repeat is then added at the very end, after it.
 * - The « même type » calcul is added after the FIRST failure of an original item only. A failed
 *   repeat comes back at the end again; a failed « même type » calcul adds nothing.
 * - « Passer » (`canSkip`): offered on a repeat of a calcul that has failed at least twice (failures
 *   of the « même type » calcul are not failures of the same calcul). Counted per item (doc 07 #13):
 *   every calcul of the activity failed twice can be skipped, not only one.
 * - « Simplifie » (outcome `unfinished`): recorded with the attempt number of the answer that will
 *   follow; the calcul stays on screen and nothing else changes.
 * - « Même type »: same course, same level, same kind of question, the recognised error as trap
 *   (doc 01 §5, when the course has a trap for it), a calcul different from the original when
 *   possible. A kind the course cannot build (the hand-made 'trou' examples of Cours 0) becomes the
 *   course's end exercise kind.
 * - A course run records 'lecon' / 'exemple' / 'fin' answers under one activityId; its activity_end
 *   says 'fin' (as srs expects). activity_end has courseId null when the activity spans several courses.
 * - Lesson questions (doc 08 n° 21 et 22), on a wrong answer: a `decouverte` question never comes back;
 *   a `choix` question comes back CHOIX_REPEAT_DISTANCE steps later (explanations counted), with its
 *   options shuffled again, never later than the first 'fin' item, until it is answered right; any
 *   other 'lecon' / 'exemple' question has no « même type » calcul and its exact repeat goes just
 *   before the first 'fin' item (at the end when there is none). 'fin', 'rattrapage', 'revision' and
 *   'entrainement' keep the rules above.
 * - Functions return new states and never change the one they receive. The state is plain data:
 *   `createActivity` draws one seed from the injected `rng`, and each « même type » calcul is drawn
 *   from a generator seeded by (seed, itemId), so `answer` gives the same result for the same state.
 */
import type { Activity, AppEvent, QuestionKind } from './events';
import { getCourse, type CourseDef, type Exercise, type Level, type LessonBlock, type LessonPart, type PartTexts } from './courses';
import type { Outcome, Question } from './exercises/types';
import { buildQuestion } from './exercises/build';
import { valueLatex } from './exercises/build/common';
import { toLatex } from './math/expr';
import { type Rng, pick, seededRng, shuffle } from './rng';
import type { ProgressState } from './srs';
import { qcmSeen, type ReviewSession } from './reviews';

/** An event before the client stamps it (id, userId, at, day). */
export type NewEvent = AppEvent extends infer E ? (E extends AppEvent ? Omit<E, 'id' | 'userId' | 'at' | 'day'> : never) : never;
export type NewAnswerEvent = Extract<NewEvent, { kind: 'answer' }>;
export type NewLessonPartEvent = Extract<NewEvent, { kind: 'lesson_part_done' }>;
export type NewActivityEndEvent = Extract<NewEvent, { kind: 'activity_end' }>;

/** 'cours' = lesson, guided examples and end exercises under one activityId. */
export type ActivityKind = 'cours' | 'rattrapage' | 'revision' | 'entrainement';

export interface QuestionItem {
  type: 'question';
  itemId: string;
  courseId: string;
  activity: Activity;
  question: Question;
  /** Titre, sous-titre et consigne de l'écran de leçon (doc 09). */
  texts?: PartTexts;
}

export interface ExplanationItem {
  type: 'explication';
  itemId: string;
  courseId: string;
  partIndex: number;
  blocks: LessonBlock[];
  /** Titre et sous-titre de l'écran (doc 09). */
  texts?: PartTexts;
}

export type ActivityItem = QuestionItem | ExplanationItem;

/** original: first presentation; meme-type: the new calcul after an error; repetition: the same calcul again. */
export type StepRole = 'original' | 'meme-type' | 'repetition';

type Step = { type: 'explication'; item: ExplanationItem } | { type: 'question'; item: QuestionItem; role: StepRole; question: Question };

export interface ActivityState {
  kind: ActivityKind;
  activityId: string;
  /** Seed of the « même type » calculs (one per item, see memeType). */
  seed: number;
  courseIds: string[];
  queue: Step[];
  /** Answers given per item (« Simplifie » excluded). */
  answered: Record<string, number>;
  /** Failures on the exact calcul of the item (original and repeats). */
  failures: Record<string, number>;
  /** Expected answer of the item, from its last outcome (for « Passer »). */
  expected: Record<string, string>;
}

export type CurrentStep =
  | { type: 'explication'; item: ExplanationItem }
  | { type: 'question'; item: QuestionItem; question: Question; role: StepRole; attempt: number; canSkip: boolean };

/** The « même type » calcul comes this many positions after the failed question (doc 01 §6). */
export const MEME_TYPE_DISTANCE = 3;
/** A failed `choix` question comes back this many steps later, explanations included (doc 08 n° 21). */
export const CHOIX_REPEAT_DISTANCE = 2;
/** Shown by the screen when a failed lesson question will come back at the end of the lesson (doc 08 n° 22). */
export const LESSON_REPEAT_NOTE = 'Tu retrouveras ce calcul à la fin de la leçon.';
export const END_EXERCISES = 5;
export const RATTRAPAGE_EXERCISES = 5;
export const TRAINING_SERIES_LENGTH = 10;
/** Doc 07 #15B: each training question's level is drawn uniformly among these. */
const TRAINING_LEVELS: Level[] = [1, 2, 3];
const ALL_KINDS: QuestionKind[] = ['saisie', 'trou', 'ordre', 'erreur', 'paires', 'classer', 'qcm', 'vraifaux'];
/** Draws of a « même type » calcul (or of distinct end exercises) before accepting a duplicate. */
const DISTINCT_TRIES = 20;

export function createActivity(kind: ActivityKind, items: ActivityItem[], ctx: { activityId: string; rng: Rng }): ActivityState {
  if (items.length === 0) throw new Error('Activité sans question ni explication');
  return {
    kind,
    activityId: ctx.activityId,
    seed: Math.floor(ctx.rng() * 2 ** 32),
    courseIds: [...new Set(items.map((i) => i.courseId))],
    queue: items.map((item): Step => (item.type === 'explication' ? { type: 'explication', item } : { type: 'question', item, role: 'original', question: item.question })),
    answered: {},
    failures: {},
    expected: {},
  };
}

export function isDone(s: ActivityState): boolean {
  return s.queue.length === 0;
}

export function current(s: ActivityState): CurrentStep | null {
  const step = s.queue[0];
  if (!step) return null;
  if (step.type === 'explication') return step;
  const { item, role, question } = step;
  return {
    type: 'question',
    item,
    question,
    role,
    attempt: (s.answered[item.itemId] ?? 0) + 1,
    canSkip: role === 'repetition' && (s.failures[item.itemId] ?? 0) >= 2,
  };
}

function headQuestion(s: ActivityState): Extract<Step, { type: 'question' }> {
  const step = s.queue[0];
  if (!step || step.type !== 'question') throw new Error("Pas de question en cours dans l'activité");
  return step;
}

function answerEvent(s: ActivityState, step: Extract<Step, { type: 'question' }>, o: Outcome, skipped: boolean, durationMs: number): NewAnswerEvent {
  const { item, question } = step;
  return {
    kind: 'answer',
    activityId: s.activityId,
    activity: item.activity,
    moduleId: getCourse(item.courseId).moduleId,
    courseId: item.courseId,
    level: levelOf(question),
    questionKind: question.kind,
    prompt: promptOf(question),
    given: o.given,
    expected: o.expected,
    correct: o.correct,
    unfinished: o.unfinished,
    errorType: o.errorType,
    errorFamily: o.errorFamily,
    attempt: (s.answered[item.itemId] ?? 0) + 1,
    skipped,
    durationMs,
  };
}

/**
 * Where the « même type » calcul goes in `queue` (the steps after the failed question): after the
 * next MEME_TYPE_DISTANCE − 1 questions, or at the end when fewer than MEME_TYPE_DISTANCE remain.
 */
function memeTypeIndex(queue: Step[]): number {
  const questions = queue.flatMap((step, i) => (step.type === 'question' ? [i] : []));
  if (questions.length < MEME_TYPE_DISTANCE) return queue.length;
  return questions[MEME_TYPE_DISTANCE - 2]! + 1;
}

/** Deterministic generator for the item's « même type » calcul (FNV-1a of seed and itemId). */
function itemRng(seed: number, itemId: string): Rng {
  let h = 0x811c9dc5 ^ seed;
  for (const ch of itemId) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193);
  return seededRng(h >>> 0);
}

/** The same `choix` question with its options in another order (drawn from seed, item and attempt). */
function reshuffled(q: Extract<Question, { kind: 'choix' }>, rng: Rng): Question {
  const order = q.options.map((_, i) => i);
  let next = shuffle(rng, order);
  if (order.length > 1 && next.every((v, i) => v === i)) next = [...order.slice(1), order[0]!];
  return { ...q, options: next.map((i) => q.options[i]!), correctIndex: next.indexOf(q.correctIndex) };
}

const firstFin = (queue: Step[]): number => {
  const i = queue.findIndex((x) => x.type === 'question' && x.item.activity === 'fin');
  return i < 0 ? queue.length : i;
};

/** Answer to the current question (outcome from checkAnswer). */
export function answer(s: ActivityState, outcome: Outcome, durationMs: number): { state: ActivityState; event: NewAnswerEvent } {
  const step = headQuestion(s);
  const event = answerEvent(s, step, outcome, false, durationMs);
  if (outcome.unfinished) return { state: s, event }; // « Simplifie »: same calcul, same attempt
  const id = step.item.itemId;
  const queue = s.queue.slice(1);
  const failures = { ...s.failures };
  const activity = step.item.activity;
  const isLesson = activity === 'lecon' || activity === 'exemple';
  if (!outcome.correct && activity === 'decouverte') {
    // nothing comes back
  } else if (!outcome.correct && isLesson && step.role !== 'meme-type') {
    failures[id] = (failures[id] ?? 0) + 1;
    const q = step.question;
    if (q.kind === 'choix') {
      const attempt = (s.answered[id] ?? 0) + 1;
      const question = reshuffled(q, itemRng(s.seed, `${id}#${attempt}`));
      queue.splice(Math.min(CHOIX_REPEAT_DISTANCE, firstFin(queue)), 0, { type: 'question', item: step.item, role: 'repetition', question });
    } else {
      queue.splice(firstFin(queue), 0, { type: 'question', item: step.item, role: 'repetition', question: step.item.question });
    }
  } else if (!outcome.correct && step.role !== 'meme-type') {
    failures[id] = (failures[id] ?? 0) + 1;
    if (step.role === 'original') {
      const meme: Step = { type: 'question', item: step.item, role: 'meme-type', question: memeType(step.item, step.question, outcome.errorType, itemRng(s.seed, id)) };
      queue.splice(memeTypeIndex(queue), 0, meme);
    }
    queue.push({ type: 'question', item: step.item, role: 'repetition', question: step.item.question });
  }
  const state: ActivityState = {
    ...s,
    queue,
    failures,
    answered: { ...s.answered, [id]: (s.answered[id] ?? 0) + 1 },
    expected: step.role === 'meme-type' ? s.expected : { ...s.expected, [id]: outcome.expected },
  };
  return { state, event };
}

/** « Passer » (only when `canSkip`): counted wrong, recorded as skipped; the calcul does not come back. */
export function skip(s: ActivityState, durationMs: number): { state: ActivityState; event: NewAnswerEvent } {
  const cur = current(s);
  if (cur?.type !== 'question' || !cur.canSkip) throw new Error('« Passer » non autorisé ici');
  const step = headQuestion(s);
  const id = step.item.itemId;
  const outcome: Outcome = { correct: false, unfinished: false, errorType: null, errorFamily: null, given: '', expected: s.expected[id] ?? '' };
  const event = answerEvent(s, step, outcome, true, durationMs);
  return { state: { ...s, queue: s.queue.slice(1), answered: { ...s.answered, [id]: (s.answered[id] ?? 0) + 1 } }, event };
}

/** The current lesson explanation has been read. */
export function explanationDone(s: ActivityState, durationMs: number): { state: ActivityState; event: NewLessonPartEvent } {
  const step = s.queue[0];
  if (!step || step.type !== 'explication') throw new Error("Pas d'explication en cours dans l'activité");
  const { item } = step;
  const event: NewLessonPartEvent = {
    kind: 'lesson_part_done',
    activityId: s.activityId,
    moduleId: getCourse(item.courseId).moduleId,
    courseId: item.courseId,
    partIndex: item.partIndex,
    durationMs,
  };
  return { state: { ...s, queue: s.queue.slice(1) }, event };
}

/** activity_end; completed when nothing is left. courseId is null for an activity over several courses. */
export function endEvent(s: ActivityState): NewActivityEndEvent {
  const first = s.courseIds[0];
  return {
    kind: 'activity_end',
    activityId: s.activityId,
    activity: s.kind === 'cours' ? 'fin' : s.kind,
    moduleId: first ? getCourse(first).moduleId : '',
    courseId: s.courseIds.length === 1 ? first! : null,
    completed: isDone(s),
  };
}

// ——— Question helpers ———

function exercisesOf(q: Question): Exercise[] {
  return 'ex' in q ? [q.ex] : q.exs;
}

export function levelOf(q: Question): Level {
  return exercisesOf(q)[0]!.level;
}

/** The calcul as written (Cours 0 writings keep their own tokens). */
function exLatex(ex: Exercise): string {
  const tokens = ex.meta?.tokens;
  return Array.isArray(tokens) ? tokens.join(' ') : toLatex(ex.expr);
}

/** A stable text of the question, recorded as `prompt`. */
export function promptOf(q: Question): string {
  switch (q.kind) {
    case 'saisie':
    case 'trou':
      return q.promptLatex;
    case 'erreur':
      return q.shownLatex ?? q.lines.join(' \\\\ ');
    case 'paires':
      return q.left.join(' ; ');
    case 'classer':
      return q.exs.map(exLatex).join(' ; ');
    case 'vraifaux':
      return `${exLatex(q.ex)} = ${valueLatex(q.shown)}`;
    case 'ordre':
    case 'qcm':
      return exLatex(q.ex);
    case 'choix':
      return q.calcLatex ? `${q.prompt} ${q.calcLatex}` : q.prompt;
    case 'reecrire':
      return q.givenLatex;
  }
}

/** The kinds of question the course can build (Cours 0 builds only its own formats). */
export function availableKinds(course: CourseDef): QuestionKind[] {
  if (!course.customCheck) return [...ALL_KINDS];
  const probe = { rng: seededRng(0), level: 1 as Level, timesSeen: 0 };
  return ALL_KINDS.filter((k) => course.customQuestion?.(k, probe) != null);
}

/** Doc 04 §7.2: keeps the QCM formula of the original (« début » below 5 QCM seen). */
const timesSeenLike = (q: Question): number => (q.kind === 'qcm' && q.formula !== 'debut' ? 5 : 0);

function distinctFrom(prompts: Set<string>, draw: () => Question): Question {
  let q = draw();
  for (let i = 1; i < DISTINCT_TRIES && prompts.has(promptOf(q)); i++) q = draw();
  return q;
}

function memeType(item: QuestionItem, q: Question, errorType: string | null, rng: Rng): Question {
  const course = getCourse(item.courseId);
  const kind = availableKinds(course).includes(q.kind) ? q.kind : course.endExercises.kind;
  const ctx = { rng, level: levelOf(q), timesSeen: timesSeenLike(q), ...(errorType ? { trapErrorType: errorType } : {}) };
  return distinctFrom(new Set([promptOf(q)]), () => buildQuestion(course, kind, ctx));
}

/** n distinct end-of-course style exercises (typed, level 1; 'erreur' for Cours 0). */
function typedSeries(course: CourseDef, n: number, rng: Rng): Question[] {
  const prompts = new Set<string>();
  return Array.from({ length: n }, () => {
    const q = distinctFrom(prompts, () => buildQuestion(course, course.endExercises.kind, { rng, level: 1, timesSeen: 0 }));
    prompts.add(promptOf(q));
    return q;
  });
}

// ——— Items of each activity ———

/** The doc 09 texts of a part, as an optional `texts` field (nothing when the part has none). */
function withTexts(p: LessonPart): { texts?: PartTexts } {
  const texts: PartTexts = {};
  if (p.title !== undefined) texts.title = p.title;
  if (p.subtitle !== undefined) texts.subtitle = p.subtitle;
  if (p.type === 'question' && p.consigne !== undefined) texts.consigne = p.consigne;
  return Object.keys(texts).length > 0 ? { texts } : {};
}

/** Doc 01 §2: the course's parts in order, then its 5 end exercises. */
export function courseRunItems(course: CourseDef, rng: Rng): ActivityItem[] {
  const parts = course.parts.map((p, i): ActivityItem =>
    p.type === 'explication'
      ? { type: 'explication', itemId: `partie-${i}`, courseId: course.id, partIndex: i, blocks: p.blocks, ...withTexts(p) }
      : { type: 'question', itemId: `partie-${i}`, courseId: course.id, activity: p.activity, question: p.question, ...withTexts(p) },
  );
  const fin = typedSeries(course, END_EXERCISES, rng).map(
    (question, i): ActivityItem => ({ type: 'question', itemId: `fin-${i}`, courseId: course.id, activity: 'fin', question }),
  );
  return [...parts, ...fin];
}

/** Doc 01 §2: 5 typed exercises, like the end exercises. */
export function rattrapageItems(course: CourseDef, rng: Rng): QuestionItem[] {
  return typedSeries(course, RATTRAPAGE_EXERCISES, rng).map((question, i) => ({
    type: 'question',
    itemId: `rattrapage-${i}`,
    courseId: course.id,
    activity: 'rattrapage',
    question,
  }));
}

export function reviewItems(session: ReviewSession): QuestionItem[] {
  return session.items.map(({ courseId, question }, i) => ({ type: 'question', itemId: `revision-${i}`, courseId, activity: 'revision', question }));
}

/** Doc 08 #1: the courses that can be trained are the validated ones and those to catch up (course order). */
export function trainingPool(state: ProgressState): string[] {
  return Object.values(state.courses)
    .filter((c) => c.status === 'valide' || c.status === 'a-rattraper')
    .map((c) => c.courseId);
}

/**
 * Doc 03 §5, doc 08 #1 and #3: a series of 10 questions on the trainable courses (validated or to
 * catch up; « tout mélangé »: a random one for each question) or on the chosen ones (one or several);
 * any kind the course can build, at
 * a level drawn uniformly among 1, 2 and 3 for each question (doc 07 #15B, not the course's level). Never changes the schedule (srs ignores 'entrainement').
 */
export function trainingSeries(state: ProgressState, choice: 'tout' | { courseIds: string[] }, rng: Rng): QuestionItem[] {
  const trainable = trainingPool(state);
  const pool = choice === 'tout' ? trainable : trainable.filter((id) => choice.courseIds.includes(id));
  if (pool.length === 0) throw new Error(choice === 'tout' ? 'Aucun cours à travailler' : `Cours non disponible : ${choice.courseIds.join(', ')}`);
  return Array.from({ length: TRAINING_SERIES_LENGTH }, (_, i) => {
    const courseId = pick(rng, pool);
    const course = getCourse(courseId);
    const question = buildQuestion(course, pick(rng, availableKinds(course)), {
      rng,
      level: pick(rng, TRAINING_LEVELS),
      timesSeen: qcmSeen(state, courseId),
    });
    return { type: 'question', itemId: `entrainement-${i}`, courseId, activity: 'entrainement', question };
  });
}
