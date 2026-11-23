/**
 * Data for the student's screens that the progress state does not give directly: the home
 * (doc 02, doc 08 #19), the end-of-course result (doc 01 §2) and the review summary (doc 02 §5).
 * Display strings are the UI's job, except the « revient … » labels of the review summary.
 *
 * Choices (technical or interpretations, see the task report):
 * - The module shown is the first one not finished (the only one in V1), or the first one.
 * - `next` is the first course of that module that is not validated (courses unlock in order);
 *   the window of 4 courses is centred on it (2 before, 1 after) and shifted at the edges. When the
 *   module is done, the window is its last 4 courses and none is `current`.
 * - Review minutes: round(questions / 3), at least 1.
 * - A run is validated by its own tally: a course run (with « fin » answers) at ≥ 80 % overall and ≥ 4 of
 *   the 5 end exercises; a rattrapage at ≥ 4 of 5 (same rules as srs).
 */
import { MODULES, getCourse, type ModuleDef } from './courses';
import { dailyTime, type DailyTime } from './daily';
import { streakOf } from './dashboard';
import type { AppEvent } from './events';
import { REVIEW_SESSION_COURSES, pendingReviews } from './reviews';
import { validationOf, type CourseStatus, type ProgressState } from './srs';
import { diffDays } from './time';

export const QUESTIONS_PER_REVIEW_COURSE = 3;
export const WINDOW_SIZE = 4;

export interface SessionSize {
  courses: number;
  questions: number;
  minutes: number;
}

export interface StudentHome {
  today: DailyTime;
  streak: number;
  reviews: SessionSize | null;
  nextSession: SessionSize | null;
  next: { courseId: string; status: 'disponible' | 'en-cours' | 'a-rattraper' } | null;
  module: {
    moduleId: string;
    title: string;
    validated: number;
    total: number;
    done: boolean;
    window: { courseId: string; order: number; status: CourseStatus; current: boolean }[];
  };
}

const sessionSize = (courses: number): SessionSize => {
  const questions = courses * QUESTIONS_PER_REVIEW_COURSE;
  return { courses, questions, minutes: Math.max(1, Math.round(questions / 3)) };
};

function dedupe(events: AppEvent[]): AppEvent[] {
  const seen = new Set<string>();
  return events.filter((e) => !seen.has(e.id) && !!seen.add(e.id));
}

function shownModule(state: ProgressState): ModuleDef {
  return MODULES.find((m) => !state.modules[m.id]?.done) ?? MODULES[0]!;
}

export function studentHome(state: ProgressState, events: AppEvent[], today: string): StudentHome {
  const all = dedupe(events);
  const pending = pendingReviews(state, today).length;
  const first = Math.min(pending, REVIEW_SESSION_COURSES);
  const rest = Math.min(pending - first, REVIEW_SESSION_COURSES);

  const m = shownModule(state);
  const progress = state.modules[m.id]!;
  const nextIndex = m.courseIds.findIndex((id) => state.courses[id]!.status !== 'valide');
  const nextId = nextIndex < 0 ? null : m.courseIds[nextIndex]!;
  const total = m.courseIds.length;
  const centre = nextIndex < 0 ? total - 1 : nextIndex;
  const start = Math.max(0, Math.min(centre - 2, total - WINDOW_SIZE));

  return {
    today: dailyTime(all, today),
    streak: streakOf(all, today),
    reviews: first > 0 ? sessionSize(first) : null,
    nextSession: rest > 0 ? sessionSize(rest) : null,
    next: nextId === null ? null : { courseId: nextId, status: state.courses[nextId]!.status as 'disponible' | 'en-cours' | 'a-rattraper' },
    module: {
      moduleId: m.id,
      title: m.title,
      validated: progress.validated,
      total: progress.total,
      done: progress.done,
      window: m.courseIds.slice(start, start + WINDOW_SIZE).map((id) => ({
        courseId: id,
        order: getCourse(id).order,
        status: state.courses[id]!.status,
        current: id === nextId,
      })),
    },
  };
}

export interface RunResult {
  validated: boolean;
  ok: number;
  first: number;
  finOk: number;
  fin: number;
  percent: number;
  nextCourseId: string | null;
  firstReviewInHours: 48;
}

/** The result shown for a tally (pure: also used from the first answers kept in memory by the runner). */
export function resultOfTally(t: { first: number; ok: number; fin: number; finOk: number }, courseId: string): RunResult {
  const validated = validationOf(t).validated;
  const m = MODULES.find((x) => x.courseIds.includes(courseId));
  const next = m ? (m.courseIds[m.courseIds.indexOf(courseId) + 1] ?? null) : null;
  return {
    validated,
    ok: t.ok,
    first: t.first,
    finOk: t.finOk,
    fin: t.fin,
    percent: t.first === 0 ? 0 : Math.round((t.ok / t.first) * 100),
    nextCourseId: validated ? next : null,
    firstReviewInHours: 48,
  };
}

/** The result of a finished course run or rattrapage (doc 01 §2), from the journal's tally. */
export function runResult(state: ProgressState, activityId: string, courseId: string): RunResult {
  const t = state.journal.runs[`${activityId}|${courseId}`];
  if (!t) throw new Error(`Activité inconnue : ${activityId}`);
  return resultOfTally(t, courseId);
}

export interface ReviewLine {
  courseId: string;
  order: number;
  title: string;
  ok: number;
  total: 3;
  nextReview: string;
  label: string;
}

/** « revient demain », « revient dans 2 jours », « … 1 semaine », « … 1 mois » (doc 01 ladder: 1, 2, 7, 30, 90, 180 days). */
export function returnLabel(days: number): string {
  if (days <= 1) return 'revient demain';
  if (days < 7) return `revient dans ${days} jours`;
  if (days < 30) {
    const w = Math.round(days / 7);
    return `revient dans ${w} semaine${w > 1 ? 's' : ''}`;
  }
  return `revient dans ${Math.round(days / 30)} mois`;
}

export function reviewSummary(
  state: ProgressState,
  activityId: string,
  today: string,
): { lines: ReviewLine[]; firstOk: number; firstTotal: number } {
  const lines: ReviewLine[] = [];
  let firstOk = 0;
  let firstTotal = 0;
  for (const [key, t] of Object.entries(state.journal.runs)) {
    const [id, courseId] = key.split('|');
    if (id !== activityId || !courseId) continue;
    const c = state.courses[courseId];
    if (!c) continue;
    firstOk += t.ok;
    firstTotal += t.first;
    const nextReview = c.nextReview ?? today;
    lines.push({
      courseId,
      order: getCourse(courseId).order,
      title: getCourse(courseId).title,
      ok: t.ok,
      total: 3,
      nextReview,
      label: returnLabel(diffDays(today, nextReview)),
    });
  }
  lines.sort((a, b) => a.order - b.order);
  return { lines, firstOk, firstTotal };
}
