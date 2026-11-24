/**
 * L'échauffement du jour : une seule question sur un cours déjà validé, à la première ouverture du jour
 * (écran dédié avant l'accueil). Il compte dans le temps du jour, jamais dans une note ni dans l'échelle des
 * révisions ; une erreur remet le cours dans les révisions du jour (srs.ts) et apparaît dans le suivi.
 */
import { getCourse } from './courses';
import type { AppEvent } from './events';
import { levelOf, promptOf, type NewActivityEndEvent, type NewAnswerEvent } from './activity';
import { buildQuestion } from './exercises/build';
import type { Outcome, Question } from './exercises/types';
import { pendingReviews, qcmSeen } from './reviews';
import type { Rng } from './rng';
import { LADDER, type ProgressState } from './srs';

export interface Warmup {
  activityId: string;
  courseId: string;
  question: Question;
}

const cmp = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** Le 1er cours à revoir ; sinon le validé dont `nextReview` est le plus proche ; null si aucun n'est validé. */
export function warmupCourse(state: ProgressState, today: string): string | null {
  const due = pendingReviews(state, today)[0];
  if (due) return due.courseId;
  const next = Object.values(state.courses)
    .filter((c) => c.status === 'valide' && c.nextReview !== null)
    .sort((a, b) => cmp(a.nextReview!, b.nextReview!) || cmp(a.courseId, b.courseId))[0];
  return next?.courseId ?? null;
}

/** Y a-t-il déjà eu un échauffement (réponse ou « Passer ») aujourd'hui ? */
export function warmupDoneToday(events: AppEvent[], today: string): boolean {
  return events.some((e) => e.day === today && (e.kind === 'answer' || e.kind === 'activity_end') && e.activity === 'echauffement');
}

/** À proposer : aucun événement aujourd'hui (quelle qu'en soit la nature), pas d'échauffement du jour, un cours validé. */
export function warmupDue(state: ProgressState, events: AppEvent[], today: string): boolean {
  if (events.some((e) => e.day === today)) return false;
  return warmupCourse(state, today) !== null;
}

/** Une question QCM au niveau du cours (échelle de révision). */
export function buildWarmup(state: ProgressState, today: string, rng: Rng, newId: () => string = () => globalThis.crypto.randomUUID()): Warmup | null {
  const courseId = warmupCourse(state, today);
  if (!courseId) return null;
  const progress = state.courses[courseId]!;
  const level = LADDER[progress.step ?? 0]?.level ?? 1;
  const question = buildQuestion(getCourse(courseId), 'qcm', { rng, level, timesSeen: qcmSeen(state, courseId) });
  return { activityId: newId(), courseId, question };
}

export function warmupAnswerEvent(w: Warmup, o: Outcome, durationMs: number): NewAnswerEvent {
  return {
    kind: 'answer',
    activityId: w.activityId,
    activity: 'echauffement',
    moduleId: getCourse(w.courseId).moduleId,
    courseId: w.courseId,
    level: levelOf(w.question),
    questionKind: w.question.kind,
    prompt: promptOf(w.question),
    given: o.given,
    expected: o.expected,
    correct: o.correct,
    unfinished: false,
    errorType: o.errorType,
    errorFamily: o.errorFamily,
    attempt: 1,
    skipped: false,
    durationMs,
  };
}

export function warmupSkipEvent(w: Warmup): NewActivityEndEvent {
  return { kind: 'activity_end', activityId: w.activityId, activity: 'echauffement', moduleId: getCourse(w.courseId).moduleId, courseId: w.courseId, completed: false };
}
