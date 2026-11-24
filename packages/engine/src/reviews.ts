/**
 * The review list and the review sessions (doc 02 §3–§5, doc 01 §3 and §5, doc 04 §9).
 *
 * Choices (technical, see the task report):
 * - A course is due when it is validated and its `nextReview` is today or earlier. A review
 *   counted today moves `nextReview` to tomorrow at the earliest (srs), so it is not proposed
 *   again today; an interrupted review changes nothing and stays due.
 * - Formats of a course's 3 questions: QCM by default; one of them is a « Vrai ou faux » with
 *   probability 1/4, and another one a « Classer » with probability 1/4. So at least one QCM,
 *   ~2.5 on average. Cours 0 (the course that checks its own questions) has 3 different formats
 *   among QCM, Classer, « Quelle règle ? », « Réécris » and « Toucher la faute ».
 * - The trap (doc 01 §5) goes on one of the QCM (Cours 0: on any question that is not a Classer): the most frequent recent error among the
 *   course's own errors (ties: the first in the course's list). « autre » and other errors with
 *   no trap calculation are not targeted.
 */
import { getCourse, MODULES, type CourseDef, type Level } from './courses';
import type { Question } from './exercises/types';
import { buildSlot, type Slot } from './exercises/build';
import type { QuestionKind } from './events';
import { type Rng, randInt, shuffle } from './rng';
import { LADDER, type CourseProgress, type ProgressState } from './srs';

/** Doc 02 §3: sessions of 5 courses at most. */
export const REVIEW_SESSION_COURSES = 5;
const QUESTIONS_PER_COURSE = 3;
const VRAIFAUX_CHANCE = 0.25;
const CLASSER_CHANCE = 0.25;
/** The formats of a Cours 0 review (doc 06): « Lequel est bien écrit ? », Classer, « Quelle règle ? », « Réécris », « Toucher la faute ». */
const COURSE_0_KINDS: QuestionKind[] = ['qcm', 'classer', 'choix', 'reecrire', 'erreur'];

export interface PendingReview {
  courseId: string;
  due: string;
}

export interface ReviewItem {
  courseId: string;
  question: Question;
}

export interface ReviewSession {
  activityId: string;
  items: ReviewItem[];
}

const COURSE_ORDER = new Map(MODULES.flatMap((m) => m.courseIds).map((id, i) => [id, i]));
const courseRank = (id: string): number => COURSE_ORDER.get(id) ?? Number.MAX_SAFE_INTEGER;
const cmp = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** Due courses: oldest date first, then the order the courses were validated, then course order. */
export function pendingReviews(state: ProgressState, today: string): PendingReview[] {
  return Object.values(state.courses)
    .filter((c): c is CourseProgress & { nextReview: string } => c.status === 'valide' && c.nextReview !== null && c.nextReview <= today)
    .sort(
      (a, b) =>
        cmp(a.nextReview, b.nextReview) ||
        cmp(a.validatedOn ?? '', b.validatedOn ?? '') ||
        courseRank(a.courseId) - courseRank(b.courseId) ||
        cmp(a.courseId, b.courseId),
    )
    .map((c) => ({ courseId: c.courseId, due: c.nextReview }));
}

/** Doc 01 §3: A 3×N1; B, C 2×N2 + 1×N1; D–H 2×N3 + 1×(N1 or N2). */
function levelsFor(step: number, rng: Rng): Level[] {
  const level = LADDER[step]?.level ?? 1;
  if (level === 1) return [1, 1, 1];
  if (level === 2) return [2, 2, 1];
  return [3, 3, rng() < 0.5 ? 1 : 2];
}

/** Doc 04 §9: mostly QCM, at most one « Vrai ou faux », at most one « Classer ». */
function kindsFor(course: CourseDef, rng: Rng): Slot[] {
  // a course with its own formats (doc 06, Cours 1 v2): 3 different formats among them
  if (course.formats) return shuffle(rng, course.formats).slice(0, QUESTIONS_PER_COURSE);
  // Cours 0 (doc 06): 3 different formats among its 5 (so at most one « Classer »)
  if (course.customCheck) return shuffle(rng, COURSE_0_KINDS).slice(0, QUESTIONS_PER_COURSE);
  const kinds: Slot[] = Array.from({ length: QUESTIONS_PER_COURSE }, () => 'qcm');
  const slots = shuffle(rng, [0, 1, 2]);
  if (rng() < VRAIFAUX_CHANCE) kinds[slots[0]!] = 'vraifaux';
  if (rng() < CLASSER_CHANCE) kinds[slots[1]!] = 'classer';
  return kinds;
}

/** Doc 01 §5: the most frequent recent error that has a trap (ties: first in the course's list). */
function trapFor(course: CourseDef, recentErrors: Record<string, number>): string | undefined {
  let best: string | undefined;
  let bestCount = 0;
  for (const e of course.errors) {
    const n = recentErrors[e.id] ?? 0;
    if (n > bestCount) [best, bestCount] = [e.id, n];
  }
  return best;
}

/** Doc 04 §7.2: QCM already seen on the course = its past first answers to a QCM. */
export function qcmSeen(state: ProgressState, courseId: string): number {
  let n = 0;
  for (const e of state.journal.events)
    if (e.kind === 'answer' && e.courseId === courseId && e.questionKind === 'qcm' && e.attempt === 1 && !e.unfinished) n++;
  return n;
}

function courseQuestions(state: ProgressState, c: CourseProgress, rng: Rng): Question[] {
  const course = getCourse(c.courseId);
  const kinds = kindsFor(course, rng);
  const levels = shuffle(rng, levelsFor(c.step ?? 0, rng));
  const trap = trapFor(course, c.recentErrors);
  // the trap goes on a question that can show it: a QCM, or any format but « Classer » in a course with its own questions
  const trapSlots = kinds.flatMap((k, i) =>
    k === 'qcm' || (course.customCheck && k !== 'classer') || (course.formats && (k === 'saisie' || k === 'signe')) ? [i] : [],
  );
  const trapSlot = trap ? trapSlots[randInt(rng, 0, trapSlots.length - 1)] : undefined;
  const timesSeen = qcmSeen(state, c.courseId);
  return kinds.map((kind, i) =>
    buildSlot(course, kind, {
      rng,
      level: levels[i]!,
      timesSeen,
      ...(i === trapSlot ? { trapErrorType: trap } : {}),
    }),
  );
}

/**
 * Random interleaving where two consecutive questions never come from the same course, unless
 * only one course is left. A course holding a strict majority of the remaining questions is
 * taken first, so the rule never gets stuck.
 */
function interleave(groups: ReviewItem[][], rng: Rng): ReviewItem[] {
  const queues = groups.map((g) => [...g]);
  const out: ReviewItem[] = [];
  let last = -1;
  for (let left = queues.reduce((s, q) => s + q.length, 0); left > 0; left--) {
    const open = queues.flatMap((q, i) => (q.length > 0 && i !== last ? [i] : []));
    const majority = open.find((i) => queues[i]!.length * 2 > left);
    const i = open.length === 0 ? last : (majority ?? open[randInt(rng, 0, open.length - 1)]!);
    out.push(queues[i]!.shift()!);
    last = i;
  }
  return out;
}

function randomId(): string {
  return globalThis.crypto.randomUUID();
}

/** The next session: the first 5 due courses × 3 questions, interleaved; null when nothing is due. */
export function nextReviewSession(
  state: ProgressState,
  today: string,
  rng: Rng,
  newId: () => string = randomId,
): ReviewSession | null {
  const due = pendingReviews(state, today).slice(0, REVIEW_SESSION_COURSES);
  if (due.length === 0) return null;
  const groups = due.map(({ courseId }) =>
    courseQuestions(state, state.courses[courseId]!, rng).map((question) => ({ courseId, question })),
  );
  return { activityId: newId(), items: interleave(groups, rng) };
}
