/**
 * Données de test pour les captures d'écran (et les tests bout en bout) : une élève, « Léa »,
 * et sa suiveuse, « Claire », dans chacune des situations des maquettes.
 * Les événements sont de vrais `AppEvent` (mêmes champs que ceux que l'appli enregistre) ;
 * le « jour » vient de `parisDay`. Aujourd'hui = dimanche 22 novembre 2026, comme dans les maquettes.
 */
import { MODULES, parisDay, addDays, type AppEvent } from '@pom/engine';

export const TODAY = '2026-11-22';
/** 12 h à Paris (UTC+1 en novembre). */
export const NOW = Date.UTC(2026, 10, 22, 11, 0, 0);

export type User = { id: string; name: string; role: 'eleve' | 'suiveur' };
export type Fixture = {
  user: User;
  events: AppEvent[];
  /** Suiveur : élèves suivies et leurs événements. */
  students?: { id: string; name: string }[];
  studentEvents?: Record<string, AppEvent[]>;
};

export const SCENARIO_NAMES = [
  'debut-de-journee',
  'apres-une-seance',
  'objectif-atteint',
  'cours-a-rattraper',
  'module-termine',
  'elle-bloque',
  'tout-va-bien',
] as const;
export type ScenarioName = (typeof SCENARIO_NAMES)[number];

export const LEA: User = { id: 'u-lea', name: 'Léa', role: 'eleve' };
export const CLAIRE: User = { id: 'u-claire', name: 'Claire', role: 'suiveur' };

const MODULE = MODULES[0]!;
const COURSES = MODULE.courseIds;
const MIN = 60_000;

// --- constructeurs d'événements ------------------------------------------

class Log {
  events: AppEvent[] = [];
  private n = 0;
  constructor(private userId: string) {}

  /** Secondes écoulées depuis 17 h (Paris) pour chaque jour : les événements d'un jour restent dans ce jour. */
  private clock = new Map<string, number>();
  private tick(day: string, seconds: number): number {
    const t = (this.clock.get(day) ?? 0) + seconds;
    this.clock.set(day, t);
    return t;
  }

  private push<T extends object>(day: string, seconds: number, body: T): void {
    const [y, m, d] = day.split('-').map(Number) as [number, number, number];
    const at = Date.UTC(y, m - 1, d, 16, 0, 0) + seconds * 1000;
    this.events.push({ id: `${this.userId}-${String(++this.n).padStart(4, '0')}`, userId: this.userId, at, day: parisDay(at), ...body } as AppEvent);
  }

  lessonParts(day: string, courseId: string, activityId: string, parts = 3, durationMs = 2 * MIN): void {
    for (let i = 0; i < parts; i++) this.push(day, this.tick(day, 20), { kind: 'lesson_part_done', activityId, moduleId: MODULE.id, courseId, partIndex: i, durationMs });
  }

  answer(
    day: string,
    courseId: string,
    activityId: string,
    activity: 'lecon' | 'exemple' | 'fin' | 'rattrapage' | 'revision' | 'entrainement',
    i: number,
    opts: { correct: boolean; durationMs: number; errorType?: string | null },
  ): void {
    const errorType = opts.correct ? null : (opts.errorType ?? 'signe-oublie');
    this.push(day, this.tick(day, 30), {
      kind: 'answer',
      activityId,
      activity,
      moduleId: MODULE.id,
      courseId,
      level: 1,
      questionKind: 'saisie',
      prompt: `(-${i + 2}) + (-${i + 3})`,
      given: opts.correct ? `-${2 * i + 5}` : `${2 * i + 1}`,
      expected: `-${2 * i + 5}`,
      correct: opts.correct,
      unfinished: false,
      errorType,
      errorFamily: errorType ? 'signe' : null,
      attempt: 1,
      skipped: false,
      durationMs: opts.durationMs,
    });
  }

  end(day: string, courseId: string | null, activityId: string, activity: 'lecon' | 'fin' | 'rattrapage' | 'revision' | 'entrainement', completed = true): void {
    this.push(day, this.tick(day, 10), { kind: 'activity_end', activityId, activity, moduleId: MODULE.id, courseId, completed });
  }

  /** Un cours : leçon, exemples, puis les 5 exercices de fin ; `finOk` bonnes réponses sur les 5. */
  courseRun(day: string, courseId: string, finOk = 5): void {
    const id = `run-${courseId}-${day}`;
    this.lessonParts(day, courseId, id);
    for (let i = 0; i < 7; i++) this.answer(day, courseId, id, i < 4 ? 'lecon' : 'exemple', i, { correct: true, durationMs: 50_000 });
    for (let i = 0; i < 5; i++) this.answer(day, courseId, id, 'fin', 7 + i, { correct: i < finOk, durationMs: 50_000 });
    this.end(day, courseId, id, 'fin');
  }

  /** Une révision de 3 questions sur un cours. */
  review(day: string, courseId: string, ok: number, durationMs = 50_000): void {
    const id = `rev-${day}-${courseId}`;
    for (let i = 0; i < 3; i++) this.answer(day, courseId, id, 'revision', i, { correct: i < ok, durationMs, errorType: 'signe-inverse' });
    this.end(day, courseId, id, 'revision');
  }

  /** Du temps d'entraînement (`minutes` au total) sur un cours validé. */
  training(day: string, courseId: string, minutes: number, correct = (_: number) => true): void {
    const id = `ent-${day}-${courseId}`;
    const n = Math.round((minutes * MIN) / 40_000);
    for (let i = 0; i < n; i++) this.answer(day, courseId, id, 'entrainement', i, { correct: correct(i), durationMs: 40_000, errorType: 'signe-inverse' });
    this.end(day, courseId, id, 'entrainement');
  }
}

const day = (back: number) => addDays(TODAY, -back);

/** Cours 0 à 4 validés (jours 11-12, 13, 15, 17, 19), objectif atteint chaque jour du 18 au 21 : 5 révisions dues, série de 4. */
function base(log: Log): void {
  const runs: [number, number][] = [[0, 10], [1, 9], [2, 7], [3, 5], [4, 3]];
  for (const [c, back] of runs) log.courseRun(day(back), COURSES[c]!);
  for (let back = 4; back >= 1; back--) log.training(day(back), COURSES[back % 3]!, 16);
}

export function scenario(name: ScenarioName): Fixture {
  const log = new Log(LEA.id);
  const c = (i: number) => COURSES[i]!;
  switch (name) {
    case 'debut-de-journee':
      base(log);
      break;
    case 'apres-une-seance':
      // 3 des 5 révisions faites ce matin (8 minutes) : il en reste 2.
      base(log);
      for (const i of [0, 1, 2]) log.review(TODAY, c(i), 3, 53_000);
      break;
    case 'objectif-atteint':
      // les 5 révisions (10 minutes) puis 12 minutes d'entraînement : 22 minutes.
      base(log);
      for (const i of [0, 1, 2, 3, 4]) log.review(TODAY, c(i), 3, 40_000);
      log.training(TODAY, c(2), 12);
      break;
    case 'cours-a-rattraper':
      // le cours 4 n'a pas été validé hier (2 exercices de fin justes sur 5) ; 3 minutes déjà faites aujourd'hui.
      for (const [i, back] of [[0, 10], [1, 9], [2, 7], [3, 5]] as [number, number][]) log.courseRun(day(back), c(i));
      for (let back = 4; back >= 2; back--) log.training(day(back), c(back % 3), 16);
      log.courseRun(day(1), c(4), 2);
      log.training(TODAY, c(1), 3);
      break;
    case 'module-termine':
      // les 8 cours validés ; la dernière validation date d'hier.
      COURSES.forEach((id, i) => log.courseRun(day(15 - 2 * i), id));
      for (let back = 3; back >= 1; back--) log.training(day(back), c(back), 16);
      log.review(day(1), c(0), 3);
      break;
    case 'elle-bloque':
    case 'tout-va-bien': {
      const stuck = name === 'elle-bloque';
      for (const [i, back] of [[0, 12], [1, 11], [2, 9], [3, 7], [4, 6]] as [number, number][]) log.courseRun(day(back), c(i), i === 4 && stuck ? 4 : 5);
      if (stuck) {
        // Cours 4 : deux révisions ratées d'affilée, puis un entraînement où 3 réponses sur 8 sont justes.
        log.review(day(4), c(4), 1);
        log.review(day(3), c(4), 0);
        log.training(day(2), c(4), 5, (i) => i < 3);
        log.training(day(1), c(1), 16);
        log.training(TODAY, c(2), 6);
      } else {
        for (let back = 5; back >= 1; back--) log.training(day(back), c(back % 4), 16);
        for (const i of [0, 1, 2]) log.review(day(2), c(i), 3);
        log.training(TODAY, c(3), 16);
      }
      return {
        user: CLAIRE,
        events: [],
        students: [{ id: LEA.id, name: LEA.name }],
        studentEvents: { [LEA.id]: log.events },
      };
    }
  }
  return { user: LEA, events: log.events };
}
