import { getCourse } from './courses';
import type { AppEvent } from './events';
import type { ProgressState } from './srs';

export interface RunErrorLine {
  errorType: string;
  label: string;
  rule: number | null;
  partIndex: number | null;
  count: number;
}

const OTHER_LABEL = 'Autre erreur';

type AnswerEvent = Extract<AppEvent, { kind: 'answer' }>;
type EndEvent = Extract<AppEvent, { kind: 'activity_end' }>;

/** Erreurs des 1res réponses d'un essai (activityId), groupées par type, de la plus fréquente à la moins fréquente ; decouverte exclue. */
export function runErrors(events: AppEvent[], activityId: string, courseId: string): RunErrorLine[] {
  const defs = getCourse(courseId).errors;
  const counts = new Map<string, number>();
  for (const e of events) {
    if (
      e.kind !== 'answer' ||
      e.activityId !== activityId ||
      e.courseId !== courseId ||
      e.activity === 'decouverte' ||
      e.attempt !== 1 ||
      e.unfinished ||
      e.skipped ||
      e.correct ||
      (e.questionKind === 'choix' && e.errorType === null) // petite question : pas une règle, ne masque pas la vraie
    )
      continue;
    const type = e.errorType ?? 'autre';
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }
  const orderOf = (type: string): number => {
    const i = defs.findIndex((d) => d.id === type);
    return i === -1 ? defs.length : i;
  };
  return [...counts.entries()]
    .map(([errorType, count]): RunErrorLine => {
      const rule = defs.find((d) => d.id === errorType)?.rule;
      return rule
        ? { errorType, label: rule.label, rule: rule.n, partIndex: rule.partIndex, count }
        : { errorType, label: OTHER_LABEL, rule: null, partIndex: null, count };
    })
    .sort((a, b) => b.count - a.count || orderOf(a.errorType) - orderOf(b.errorType));
}

export interface LastAttempt {
  kind: 'cours' | 'rattrapage';
  finOk: number;
  fin: number;
  top: RunErrorLine | null;
}

/** Dernier essai terminé (activity_end completed, 'fin' ou 'rattrapage') d'un cours « à valider » ; null sinon. */
export function lastAttempt(state: ProgressState, events: AppEvent[], courseId: string): LastAttempt | null {
  if (state.courses[courseId]?.status !== 'a-rattraper') return null;
  let last: EndEvent | null = null;
  for (const e of events) {
    if (e.kind !== 'activity_end' || !e.completed || e.courseId !== courseId) continue;
    if (e.activity !== 'fin' && e.activity !== 'rattrapage') continue;
    if (!last || e.at >= last.at) last = e;
  }
  if (!last) return null;
  const { activityId, activity } = last;
  const answers = events.filter(
    (e): e is AnswerEvent =>
      e.kind === 'answer' &&
      e.activityId === activityId &&
      e.courseId === courseId &&
      e.activity === activity &&
      e.attempt === 1 &&
      !e.unfinished,
  );
  return {
    kind: activity === 'fin' ? 'cours' : 'rattrapage',
    finOk: answers.filter((e) => e.correct && !e.skipped).length,
    fin: answers.length,
    top: runErrors(events, activityId, courseId)[0] ?? null,
  };
}
