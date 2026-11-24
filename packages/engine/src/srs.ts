/**
 * Spaced repetition and progress (doc 01): the state is the fold of the event journal.
 *
 * Choices (technical, see the task report):
 * - A course run (activities 'lecon' / 'exemple' / 'fin' sharing one activityId) is evaluated when
 *   its 5th first 'fin' answer arrives; a rattrapage when its 5th first answer arrives; a review of a
 *   course when its 3rd first answer in one 'revision' activity arrives. `activity_end` is not needed.
 * - A review only counts for a validated course that is due that day (doc 01 §4: no early review);
 *   this also ignores a second review of the same course on the same day.
 * - `journal` keeps the sorted, de-duplicated events and the running tallies, so `applyEvent` can
 *   update incrementally, and refold from the journal when an event older than the last one arrives.
 */
import type { AppEvent } from './events';
import { MODULES, type Level } from './courses';
import { addDays } from './time';

export const LADDER = [
  { step: 'A', level: 1, days: 2 },
  { step: 'B', level: 2, days: 2 },
  { step: 'C', level: 2, days: 7 },
  { step: 'D', level: 3, days: 2 },
  { step: 'E', level: 3, days: 7 },
  { step: 'F', level: 3, days: 30 },
  { step: 'G', level: 3, days: 90 },
  { step: 'H', level: 3, days: 180 },
] as const;

export type CourseStatus = 'verrouille' | 'disponible' | 'en-cours' | 'a-rattraper' | 'valide';

export interface CourseProgress {
  courseId: string;
  status: CourseStatus;
  validatedOn: string | null;
  /** Index in LADDER. */
  step: number | null;
  level: Level | null;
  stars: 0 | 1 | 2 | 3;
  nextReview: string | null;
  lastReviewFailed: boolean;
  reviewHistory: { day: string; ok: boolean }[];
  /** Recognised errors among the course's 10 most recent first answers. */
  recentErrors: Record<string, number>;
  failedTwiceInARow: boolean;
}

export interface ModuleProgress {
  moduleId: string;
  validated: number;
  total: number;
  done: boolean;
}

/** The validation rule of a course run or rattrapage (doc 01 §2) : 80 % overall and 4 of 5 end exercises; a rattrapage needs 4 of 5. */
export function validationOf(t: { first: number; ok: number; fin: number; finOk: number }): { percent: boolean; fin: boolean; validated: boolean } {
  const percent = t.ok * 5 >= t.first * 4;
  const fin = t.finOk >= 4;
  return { percent, fin, validated: t.fin > 0 ? percent && fin : t.ok >= 4 };
}

/** First answers of one activity for one course. */
export interface RunTally {
  first: number;
  ok: number;
  fin: number;
  finOk: number;
  done: boolean;
  /** « Simplifie » answers not yet followed by a first answer: attempts, by prompt. */
  unfinished: Record<string, number[]>;
}

/** What the fold needs beyond the visible progress (plain data, cacheable). */
export interface ProgressJournal {
  /** Applied events, sorted by (at, id), without duplicate ids. */
  events: AppEvent[];
  /** Keyed by `${activityId}|${courseId}`. */
  runs: Record<string, RunTally>;
  /** errorType of the course's 10 most recent first answers (null when right). */
  recent: Record<string, (string | null)[]>;
}

export interface ProgressState {
  courses: Record<string, CourseProgress>;
  modules: Record<string, ModuleProgress>;
  journal: ProgressJournal;
}

const END_COUNT = 5;
const RATTRAPAGE_COUNT = 5;
const REVIEW_COUNT = 3;
const RECENT_COUNT = 10;
const TOP = LADDER.length - 1;

type Answer = Extract<AppEvent, { kind: 'answer' }>;

const byTime = (a: AppEvent, b: AppEvent): number => a.at - b.at || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

function emptyCourse(courseId: string): CourseProgress {
  return {
    courseId,
    status: 'verrouille',
    validatedOn: null,
    step: null,
    level: null,
    stars: 0,
    nextReview: null,
    lastReviewFailed: false,
    reviewHistory: [],
    recentErrors: {},
    failedTwiceInARow: false,
  };
}

function initialState(): ProgressState {
  const courses: Record<string, CourseProgress> = {};
  for (const m of MODULES) for (const id of m.courseIds) courses[id] = emptyCourse(id);
  return { courses, modules: {}, journal: { events: [], runs: {}, recent: {} } };
}

/** Copy of everything but the event list, which the caller replaces. */
function cloneDraft(s: ProgressState): ProgressState {
  const courses: Record<string, CourseProgress> = {};
  for (const [id, c] of Object.entries(s.courses))
    courses[id] = { ...c, reviewHistory: c.reviewHistory.map((r) => ({ ...r })), recentErrors: { ...c.recentErrors } };
  const runs: Record<string, RunTally> = {};
  for (const [k, r] of Object.entries(s.journal.runs)) {
    const unfinished: Record<string, number[]> = {};
    for (const [p, list] of Object.entries(r.unfinished)) unfinished[p] = [...list];
    runs[k] = { ...r, unfinished };
  }
  const recent: Record<string, (string | null)[]> = {};
  for (const [id, list] of Object.entries(s.journal.recent)) recent[id] = [...list];
  return { courses, modules: { ...s.modules }, journal: { events: s.journal.events, runs, recent } };
}

/**
 * Whether this answer is the first answer to its calcul. « Simplifie » is neutral: it is never a
 * first answer and does not consume it, whether the client numbers the next try 2 or 1 again.
 */
function isFirstAnswer(tally: RunTally, e: Answer): boolean {
  const pending = tally.unfinished[e.prompt] ?? [];
  if (e.unfinished) {
    tally.unfinished[e.prompt] = [...pending, e.attempt];
    return false;
  }
  const effectiveAttempt = e.attempt - pending.filter((a) => a < e.attempt).length;
  if (effectiveAttempt !== 1) return false;
  delete tally.unfinished[e.prompt];
  return true;
}

function markStarted(c: CourseProgress): void {
  if (c.status === 'verrouille' || c.status === 'disponible') c.status = 'en-cours';
}

function validate(c: CourseProgress, day: string): void {
  c.status = 'valide';
  c.validatedOn = day;
  c.step = 0;
  c.level = LADDER[0].level;
  c.stars = c.stars === 0 ? 1 : c.stars;
  c.nextReview = addDays(day, LADDER[0].days);
  c.lastReviewFailed = false;
}

function starsAt(step: number): 1 | 2 | 3 {
  return step >= 3 ? 3 : step >= 1 ? 2 : 1;
}

function trailingFailures(c: CourseProgress): number {
  let n = 0;
  for (let i = c.reviewHistory.length - 1; i >= 0 && !c.reviewHistory[i]!.ok; i--) n++;
  return n;
}

function recordReview(c: CourseProgress, day: string, ok: boolean): void {
  if (c.status !== 'valide' || c.step === null || c.nextReview === null || day < c.nextReview) return;
  const failures = trailingFailures(c);
  let step = c.step;
  let next: string;
  if (ok) {
    if (failures !== 1) step = Math.min(step + 1, TOP); // right after a 1st failure: stays (« stagne »)
    next = addDays(day, LADDER[step]!.days);
  } else if (failures === 0) {
    next = addDays(day, 1); // 1st failure: same step, back tomorrow
  } else {
    step = Math.max(step - 1, 0); // 2nd failure in a row and each further one
    next = addDays(day, LADDER[step]!.days);
  }
  c.reviewHistory.push({ day, ok });
  c.step = step;
  c.level = LADDER[step]!.level;
  c.stars = Math.max(c.stars, starsAt(step)) as 1 | 2 | 3;
  c.nextReview = next;
  c.lastReviewFailed = !ok;
  c.failedTwiceInARow = !ok && failures + 1 >= 2;
}

function pushRecent(s: ProgressState, c: CourseProgress, errorType: string | null): void {
  const list = [...(s.journal.recent[c.courseId] ?? []), errorType].slice(-RECENT_COUNT);
  s.journal.recent[c.courseId] = list;
  const counts: Record<string, number> = {};
  for (const t of list) if (t !== null) counts[t] = (counts[t] ?? 0) + 1;
  c.recentErrors = counts;
}

/** Applies one event to a draft (mutated). */
function step(s: ProgressState, e: AppEvent): void {
  if (e.kind === 'activity_end') return;
  const c = s.courses[e.courseId];
  if (!c) return;
  if (e.kind === 'lesson_part_done') {
    markStarted(c);
    return;
  }
  if (e.activity === 'decouverte') return; // ne compte jamais (ni note, ni suivi, ni répétition espacée)
  if (e.activity === 'echauffement') {
    // Échauffement : jamais dans une note ni dans l'échelle. Une 1re réponse fausse sur un cours validé le rend dû (étape inchangée).
    if (e.attempt === 1 && !e.unfinished && !(e.correct && !e.skipped) && c.status === 'valide' && c.nextReview !== null && e.day < c.nextReview) c.nextReview = e.day;
    return;
  }
  const isCourseRun = e.activity === 'lecon' || e.activity === 'exemple' || e.activity === 'fin';
  if (isCourseRun) markStarted(c);
  const key = `${e.activityId}|${e.courseId}`;
  const tally = (s.journal.runs[key] ??= { first: 0, ok: 0, fin: 0, finOk: 0, done: false, unfinished: {} });
  if (!isFirstAnswer(tally, e)) return;
  const correct = e.correct && !e.skipped;
  pushRecent(s, c, e.errorType);
  if (tally.done) return;
  tally.first++;
  if (correct) tally.ok++;

  switch (e.activity) {
    case 'fin':
      tally.fin++;
      if (correct) tally.finOk++;
      if (tally.fin === END_COUNT) {
        tally.done = true;
        if (c.status === 'valide') break;
        if (validationOf(tally).validated) validate(c, e.day);
        else c.status = 'a-rattraper';
      }
      break;
    case 'rattrapage':
      if (tally.first === RATTRAPAGE_COUNT) {
        tally.done = true;
        if (c.status === 'valide') break;
        if (validationOf({ ...tally, fin: 0 }).validated) validate(c, e.day);
        else c.status = 'a-rattraper';
      }
      break;
    case 'revision':
      if (tally.first === REVIEW_COUNT) {
        tally.done = true;
        recordReview(c, e.day, tally.ok === REVIEW_COUNT);
      }
      break;
    default:
      break; // 'lecon', 'exemple' are tallied for the run; 'entrainement' never changes the schedule
  }
}

/** Unlocks (first course of a module, or the one after a validated course) and module progress. */
function finalize(s: ProgressState): void {
  for (const m of MODULES) {
    let previousValid = true;
    let validated = 0;
    for (const id of m.courseIds) {
      const c = s.courses[id]!;
      if (c.status === 'verrouille' || c.status === 'disponible') c.status = previousValid ? 'disponible' : 'verrouille';
      previousValid = c.status === 'valide';
      if (previousValid) validated++;
    }
    const total = m.courseIds.length;
    s.modules[m.id] = { moduleId: m.id, validated, total, done: validated === total };
  }
}

export function foldProgress(events: AppEvent[]): ProgressState {
  const seen = new Set<string>();
  const sorted = [...events].sort(byTime).filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
  const s = initialState();
  s.journal.events = sorted;
  for (const e of sorted) step(s, e);
  finalize(s);
  return s;
}

/** Incremental update (cache); same result as refolding the journal with `e`. */
export function applyEvent(state: ProgressState, e: AppEvent): ProgressState {
  const events = state.journal.events;
  if (events.some((x) => x.id === e.id)) return state;
  const last = events[events.length - 1];
  if (last && byTime(e, last) < 0) return foldProgress([...events, e]); // older than the last one: refold
  const draft = cloneDraft(state);
  draft.journal.events = [...events, e];
  step(draft, e);
  finalize(draft);
  return draft;
}
