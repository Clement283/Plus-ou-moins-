/**
 * The follower's page (doc 05): plain data for the home (§1, its 5 blocks), the module view (§2)
 * and the course view (§3). Display strings, symbols (●/◐/○, ↘/→/↗) and error labels are the UI's
 * job; only course and module titles come from the registry.
 *
 * Choices (technical or interpretations, see the task report):
 * - A « calcul » is a first answer (attempt 1, not « Simplifie ») in a 'fin', 'rattrapage',
 *   'revision' or 'entrainement' activity. Success rates and the error counts
 *   are counted over calculs; a calcul is right when correct and not skipped.
 * - Windows end today and include it: 28 days (the last 4 weeks) = today − 27 … today, 14 days = today − 13 … today.
 * - A day is 'partiel' as soon as it has any answer or lesson part, without reaching the goal.
 * - A module is « en cours » once one of its courses is started, until all of them are validated.
 * - The course statuses are 'pas-commence' (locked or available), 'en-cours' (started), 'a-rattraper'
 *   (finished without validation, doc 07 #19B) and 'valide'.
 * - A finished module leaves the home État lines but stays in the module list with `done` (doc 07 #17A).
 * - « À retravailler » compares the rounded, displayed percentage with 70
 *   (doc 07 #21A: a displayed 70 % is never flagged) and orders by the 14-day success rate (no answer in 14 days: last), then course
 *   order. The most common errors leave out « autre » (counted apart in `otherCount`) and tie on
 *   the most recent occurrence; the course view's errors include « autre ».
 * - The wrong calculs listed (home and course view) are the 10 most recent. `failures` counts the
 *   failed answers on the same prompt in the same activity (re-tries included; the « même type »
 *   calcul has another prompt); `passed` is true when that calcul was skipped (« Passer »).
 */
import type { AppEvent, ErrorFamily } from './events';
import { MODULES, getCourse } from './courses';
import { dailyTime, type DailyTime } from './daily';
import { pendingReviews } from './reviews';
import { LADDER, foldProgress, type CourseProgress } from './srs';
import { addDays } from './time';

/** « À retravailler » below this displayed percentage (doc 07 #21A). */
export const STRUGGLING_PERCENT = 70;
export const STRUGGLING_MIN_ANSWERS = 5;
export const TO_REWORK_MAX = 3;
export const COMMON_ERRORS_MAX = 3;
export const LISTED_ERRORS_MAX = 10;

export type DayMark = 'atteint' | 'partiel' | 'rien';
export type DashCourseStatus = 'pas-commence' | 'en-cours' | 'a-rattraper' | 'valide';

export interface DayPoint {
  day: string;
  mark: DayMark;
  totalMs: number;
  reviewMs: number;
  courseMs: number;
  trainingMs: number;
}

/** Right calculs over all calculs; rate null when there is none. */
export interface SuccessRate {
  ok: number;
  total: number;
  rate: number | null;
}

/** A wrong calcul: its first answer, and what happened to it in its activity. */
export interface WrongCalcul {
  day: string;
  courseId: string;
  activityId: string;
  prompt: string;
  given: string;
  expected: string;
  failures: number;
  passed: boolean;
}

export interface CommonError {
  errorType: string;
  family: ErrorFamily;
  count: number;
  calculs: WrongCalcul[];
}

export interface ErrorCount {
  errorType: string;
  family: ErrorFamily;
  count: number;
}

export interface ToRework {
  courseId: string;
  moduleId: string;
  title: string;
  success14: SuccessRate;
  /** Under 70 % over 14 days with at least 5 answers. */
  lowSuccess: boolean;
  failedTwiceInARow: boolean;
}

export interface DashboardHome {
  last28: { days: DayPoint[]; goalDays: number };
  state: {
    today: DailyTime;
    streak: number;
    modules: { moduleId: string; title: string; validated: number; total: number }[];
  };
  pendingReviews: { count: number; oldest: string | null; items: { courseId: string; title: string; due: string }[] };
  commonErrors: { top: CommonError[]; otherCount: number };
  toRework: ToRework[];
}

export interface ModuleCourse {
  courseId: string;
  title: string;
  order: number;
  status: DashCourseStatus;
  stars: 0 | 1 | 2 | 3;
  level: 1 | 2 | 3 | null;
  success28: SuccessRate;
  nextReview: string | null;
  /** ⚠: same conditions as « À retravailler » (validated courses only). */
  struggling: boolean;
  failedTwiceInARow: boolean;
}

export interface ModuleView {
  moduleId: string;
  title: string;
  validated: number;
  total: number;
  /** Every course validated: the module has left the home État lines (doc 07 #17A). */
  done: boolean;
  courses: ModuleCourse[];
}

export interface CourseView {
  courseId: string;
  moduleId: string;
  title: string;
  order: number;
  status: DashCourseStatus;
  stars: 0 | 1 | 2 | 3;
  level: 1 | 2 | 3 | null;
  /** Letter of the step on the ladder (doc 01), null when not validated. */
  step: string | null;
  validatedOn: string | null;
  nextReview: string | null;
  reviews: { day: string; ok: boolean }[];
  errors28: ErrorCount[];
  lastErrors: WrongCalcul[];
}

export interface Dashboard {
  today: string;
  home: DashboardHome;
  modules: ModuleView[];
  courses: Record<string, CourseView>;
}

type Answer = Extract<AppEvent, { kind: 'answer' }>;

const CALCUL_ACTIVITIES: readonly string[] = ['fin', 'rattrapage', 'revision', 'entrainement'];
const isCalcul = (e: AppEvent): e is Answer =>
  e.kind === 'answer' && e.attempt === 1 && !e.unfinished && CALCUL_ACTIVITIES.includes(e.activity);
const isRight = (e: Answer): boolean => e.correct && !e.skipped;
const inWindow = (day: string, from: string, to: string): boolean => day >= from && day <= to;
const itemKey = (e: Answer): string => `${e.activityId}|${e.courseId}|${e.prompt}`;

function successRate(list: Answer[]): SuccessRate {
  const ok = list.filter(isRight).length;
  return { ok, total: list.length, rate: list.length === 0 ? null : ok / list.length };
}

function dashStatus(c: CourseProgress): DashCourseStatus {
  switch (c.status) {
    case 'valide':
    case 'a-rattraper':
    case 'en-cours':
      return c.status;
    default:
      return 'pas-commence'; // 'verrouille' | 'disponible'
  }
}

/** Error types by count (most frequent first, ties: most recent occurrence first). */
function countErrors(wrong: Answer[]): (ErrorCount & { latest: Answer[] })[] {
  const byType = new Map<string, ErrorCount & { latest: Answer[] }>();
  for (const e of wrong) {
    if (e.errorType === null || e.errorFamily === null) continue;
    const entry = byType.get(e.errorType) ?? { errorType: e.errorType, family: e.errorFamily, count: 0, latest: [] };
    entry.count++;
    entry.latest.unshift(e); // events are in time order: most recent first
    byType.set(e.errorType, entry);
  }
  return [...byType.values()].sort((a, b) => b.count - a.count || b.latest[0]!.at - a.latest[0]!.at);
}

export function computeDashboard(events: AppEvent[], today: string): Dashboard {
  const progress = foldProgress(events);
  const all = progress.journal.events; // sorted by time, without duplicate ids
  const calculs = all.filter(isCalcul);

  // What happened to each calcul in its activity.
  const failures = new Map<string, number>();
  const passed = new Set<string>();
  for (const e of all) {
    if (e.kind !== 'answer' || e.unfinished) continue;
    if (e.skipped) passed.add(itemKey(e));
    else if (!e.correct) failures.set(itemKey(e), (failures.get(itemKey(e)) ?? 0) + 1);
  }
  const wrongCalcul = (e: Answer): WrongCalcul => ({
    day: e.day,
    courseId: e.courseId,
    activityId: e.activityId,
    prompt: e.prompt,
    given: e.given,
    expected: e.expected,
    failures: failures.get(itemKey(e)) ?? 0,
    passed: passed.has(itemKey(e)),
  });

  const from28 = addDays(today, -27);
  const from14 = addDays(today, -13);
  const calculs28 = calculs.filter((e) => inWindow(e.day, from28, today));
  const calculs14 = calculs.filter((e) => inWindow(e.day, from14, today));
  const wrong28 = calculs28.filter((e) => !isRight(e));

  // 28 derniers jours, and the série.
  const activeDays = new Set(all.filter((e) => e.kind !== 'activity_end').map((e) => e.day));
  const days: DayPoint[] = Array.from({ length: 28 }, (_, i) => {
    const day = addDays(from28, i);
    const { totalMs, reviewMs, courseMs, trainingMs, goalReached } = dailyTime(all, day);
    const mark: DayMark = goalReached ? 'atteint' : activeDays.has(day) ? 'partiel' : 'rien';
    return { day, mark, totalMs, reviewMs, courseMs, trainingMs };
  });
  const todayTime = dailyTime(all, today);
  let streak = 0;
  for (let day = todayTime.goalReached ? today : addDays(today, -1); dailyTime(all, day).goalReached; day = addDays(day, -1)) streak++;

  // Per course: the 14-day success and « en difficulté ».
  const struggling = new Map<string, ToRework>();
  for (const m of MODULES)
    for (const id of m.courseIds) {
      const c = progress.courses[id]!;
      const success14 = successRate(calculs14.filter((e) => e.courseId === id));
      const lowSuccess = success14.total >= STRUGGLING_MIN_ANSWERS && Math.round(success14.rate! * 100) < STRUGGLING_PERCENT;
      // Only validated courses can be « en difficulté » (doc 08 #14): a course not validated yet shows « à rattraper ».
      if (c.status === 'valide' && (lowSuccess || c.failedTwiceInARow))
        struggling.set(id, { courseId: id, moduleId: m.id, title: getCourse(id).title, success14, lowSuccess, failedTwiceInARow: c.failedTwiceInARow });
    }
  const courseRank = new Map(MODULES.flatMap((m) => m.courseIds).map((id, i) => [id, i]));
  const toRework = [...struggling.values()]
    .sort((a, b) => (a.success14.rate ?? 2) - (b.success14.rate ?? 2) || courseRank.get(a.courseId)! - courseRank.get(b.courseId)!)
    .slice(0, TO_REWORK_MAX);

  const common = countErrors(wrong28);
  const pending = pendingReviews(progress, today);

  const home: DashboardHome = {
    last28: { days, goalDays: days.filter((d) => d.mark === 'atteint').length },
    state: {
      today: todayTime,
      streak,
      modules: MODULES.filter((m) => {
        const started = m.courseIds.some((id) => dashStatus(progress.courses[id]!) !== 'pas-commence');
        return started && !progress.modules[m.id]!.done;
      }).map((m) => ({ moduleId: m.id, title: m.title, validated: progress.modules[m.id]!.validated, total: progress.modules[m.id]!.total })),
    },
    pendingReviews: {
      count: pending.length,
      oldest: pending[0]?.due ?? null,
      items: pending.map((p) => ({ courseId: p.courseId, title: getCourse(p.courseId).title, due: p.due })),
    },
    commonErrors: {
      top: common
        .filter((x) => x.family !== 'autre')
        .slice(0, COMMON_ERRORS_MAX)
        .map((x) => ({ errorType: x.errorType, family: x.family, count: x.count, calculs: x.latest.slice(0, LISTED_ERRORS_MAX).map(wrongCalcul) })),
      otherCount: common.filter((x) => x.family === 'autre').reduce((n, x) => n + x.count, 0),
    },
    toRework,
  };

  const modules: ModuleView[] = MODULES.map((m) => ({
    moduleId: m.id,
    title: m.title,
    validated: progress.modules[m.id]!.validated,
    total: progress.modules[m.id]!.total,
    done: progress.modules[m.id]!.done,
    courses: m.courseIds.map((id) => {
      const c = progress.courses[id]!;
      return {
        courseId: id,
        title: getCourse(id).title,
        order: getCourse(id).order,
        status: dashStatus(c),
        stars: c.stars,
        level: c.level,
        success28: successRate(calculs28.filter((e) => e.courseId === id)),
        nextReview: c.nextReview,
        struggling: struggling.has(id),
        failedTwiceInARow: c.failedTwiceInARow,
      };
    }),
  }));

  const courses: Record<string, CourseView> = {};
  for (const m of MODULES)
    for (const id of m.courseIds) {
      const c = progress.courses[id]!;
      const course = getCourse(id);
      const wrongOfCourse = calculs.filter((e) => e.courseId === id && !isRight(e));
      courses[id] = {
        courseId: id,
        moduleId: m.id,
        title: course.title,
        order: course.order,
        status: dashStatus(c),
        stars: c.stars,
        level: c.level,
        step: c.step === null ? null : LADDER[c.step]!.step,
        validatedOn: c.validatedOn,
        nextReview: c.nextReview,
        reviews: c.reviewHistory.map((r) => ({ ...r })),
        errors28: countErrors(wrong28.filter((e) => e.courseId === id)).map(({ errorType, family, count }) => ({ errorType, family, count })),
        lastErrors: wrongOfCourse.slice(-LISTED_ERRORS_MAX).reverse().map(wrongCalcul),
      };
    }

  return { today, home, modules, courses };
}
