/**
 * Données de test pour les captures d'écran (et les tests bout en bout) : une élève, « Léa »,
 * et sa suiveuse, « Claire », dans chacune des situations des maquettes.
 * Les événements sont de vrais `AppEvent` (mêmes champs que ceux que l'appli enregistre) ;
 * le « jour » vient de `parisDay`. Aujourd'hui = dimanche 22 novembre 2026, comme dans les maquettes.
 */
import { MODULES, parisDay, addDays, type AppEvent, type ClementQuestion } from '@pom/engine';

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
  /** Élève : ses questions à Clément. */
  questions?: ClementQuestion[];
  /** Suiveur : les questions de chaque élève suivie. */
  studentQuestions?: Record<string, ClementQuestion[]>;
};

export const SCENARIO_NAMES = [
  'debut-de-journee',
  'apres-une-seance',
  'objectif-atteint',
  'cours-a-rattraper',
  'module-termine',
  'debut-du-module',
  'elle-bloque',
  'tout-va-bien',
  'deux-eleves',
  'clement-a-repondu',
  'question-a-clement',
] as const;
export type ScenarioName = (typeof SCENARIO_NAMES)[number];

/** Deux questions à Clément : une répondue (pas encore lue), une sans réponse. Le jour d'aujourd'hui, à 9 h. */
function leaQuestions(): ClementQuestion[] {
  const at = Date.UTC(2026, 10, 22, 8, 0, 0);
  return [
    {
      id: 'q-2',
      courseId: COURSES[0]!,
      calc: '4 × −3',
      given: '4 × (−3',
      expected: '4 × (−3)',
      correction: 'Une parenthèse ouverte doit toujours être fermée.',
      note: 'Je ne vois pas où mettre la deuxième parenthèse.',
      askedAt: at - 60 * MIN,
      answer: 'Regarde où finit le nombre : la parenthèse se ferme juste après le 3. Elles vont toujours par deux.',
      answeredAt: at,
      answeredBy: 'Clément',
      readAt: null,
    },
    {
      id: 'q-1',
      courseId: COURSES[1]!,
      calc: '−4 + (−9)',
      given: '13',
      expected: '−13',
      correction: 'Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − !',
      note: null,
      askedAt: at - 26 * 60 * MIN,
      answer: null,
      answeredAt: null,
      answeredBy: null,
      readAt: null,
    },
  ];
}

export const LEA: User = { id: 'u-lea', name: 'Léa', role: 'eleve' };
export const CLAIRE: User = { id: 'u-claire', name: 'Claire', role: 'suiveur' };
export const HUGO: User = { id: 'u-hugo', name: 'Hugo', role: 'eleve' };

const MODULE = MODULES[0]!;
const COURSES = MODULE.courseIds;
const MIN = 60_000;

// --- constructeurs d'événements ------------------------------------------

const WRITING_ERRORS = ['moins-apres', 'parenthese', 'signes-colles'];

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
    this.events.push({ id: `${this.userId}-${String(++this.n).padStart(4, '0')}`, userId: this.userId, at, day: parisDay(at), ...body } as unknown as AppEvent);
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
      errorFamily: errorType ? (WRITING_ERRORS.includes(errorType) ? 'ecriture' : 'signe') : null,
      attempt: 1,
      skipped: false,
      durationMs: opts.durationMs,
    });
  }

  end(day: string, courseId: string | null, activityId: string, activity: 'lecon' | 'fin' | 'rattrapage' | 'revision' | 'entrainement', completed = true): void {
    this.push(day, this.tick(day, 10), { kind: 'activity_end', activityId, activity, moduleId: MODULE.id, courseId, completed });
  }

  /** Un cours : leçon, exemples, puis les 5 exercices de fin ; `finOk` bonnes réponses sur les 5, les ratés avec les erreurs de `errors` à tour de rôle. */
  courseRun(day: string, courseId: string, finOk = 5, errors: string[] = []): void {
    const id = `run-${courseId}-${day}`;
    this.lessonParts(day, courseId, id);
    for (let i = 0; i < 7; i++) this.answer(day, courseId, id, i < 4 ? 'lecon' : 'exemple', i, { correct: true, durationMs: 50_000 });
    for (let i = 0; i < 5; i++) this.answer(day, courseId, id, 'fin', 7 + i, { correct: i < finOk, durationMs: 50_000, errorType: errors.length ? errors[(i - finOk) % errors.length] : undefined });
    this.end(day, courseId, id, 'fin');
  }

  /** Une révision de 3 questions sur un cours. */
  review(day: string, courseId: string, ok: number, durationMs = 50_000): void {
    const id = `rev-${day}-${courseId}`;
    for (let i = 0; i < 3; i++) this.answer(day, courseId, id, 'revision', i, { correct: i < ok, durationMs, errorType: 'signe-inverse' });
    this.end(day, courseId, id, 'revision');
  }

  /** Du temps d'entraînement (`minutes` au total) sur un cours validé. */
  training(day: string, courseId: string, minutes: number, correct = (_: number) => true, errorType = 'signe-inverse'): void {
    const id = `ent-${day}-${courseId}`;
    const n = Math.round((minutes * MIN) / 40_000);
    for (let i = 0; i < n; i++) this.answer(day, courseId, id, 'entrainement', i, { correct: correct(i), durationMs: 40_000, errorType });
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
    case 'debut-du-module':
      // aucun cours commencé : seul le cours 0 est ouvert, rien à réviser ni à travailler.
      break;
    case 'debut-de-journee':
      base(log);
      break;
    case 'clement-a-repondu':
      // 3 révisions faites ce matin (pas d'échauffement à proposer) ; une réponse de Clément attend d'être lue.
      base(log);
      for (const i of [0, 1, 2]) log.review(TODAY, c(i), 3, 54_000);
      return { user: LEA, events: log.events, questions: leaQuestions() };
    case 'apres-une-seance':
      // 3 des 5 révisions faites ce matin (8 minutes) : il en reste 2.
      base(log);
      for (const i of [0, 1, 2]) log.review(TODAY, c(i), 3, 54_000);
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
    case 'tout-va-bien':
    case 'question-a-clement':
    case 'deux-eleves': {
      const stuck = name !== 'tout-va-bien';
      const questions = name === 'question-a-clement' ? { [LEA.id]: leaQuestions().map((q) => (q.id === 'q-2' ? { ...q, answer: null, answeredAt: null, answeredBy: null } : q)) } : undefined;
      // Cours 0 à 3 validés ; le cours 4 est à valider (elle bloque) ou à peine commencé (tout va bien).
      for (const [i, back] of [[0, 17], [1, 16], [2, 14], [3, 12]] as [number, number][]) log.courseRun(day(back), c(i));
      if (stuck) {
        // Cours 4 : 3 exercices de fin justes sur 5 hier. Cours 3 : deux révisions ratées d'affilée. Pas de révision pour les cours 0 à 2.
        log.review(day(8), c(3), 3);
        log.review(day(5), c(3), 1);
        log.review(day(4), c(3), 0);
        for (let back = 10; back >= 2; back -= 2) log.training(day(back), c(back % 3), 16);
        log.training(day(2), c(4), 5, (i) => i < 3);
        log.courseRun(day(1), c(4), 3, ['signe-inverse', 'oppose-oublie']);
        log.training(TODAY, c(3), 9);
      } else {
        for (let back = 10; back >= 1; back--) log.training(day(back), c(back % 4), 16, (i) => i % 7 !== 3, back % 3 === 0 ? 'oppose-oublie' : 'signe-inverse');
        log.training(day(4), c(1), 3, (i) => i !== 0, 'moins-apres');
        for (const i of [0, 1, 2, 3]) log.review(day(1), c(i), 3);
        log.lessonParts(day(2), c(4), `run-${c(4)}-${day(2)}`, 2);
        log.training(TODAY, c(3), 17);
      }
      const students = [{ id: LEA.id, name: LEA.name }];
      const studentEvents: Record<string, AppEvent[]> = { [LEA.id]: log.events };
      if (name === 'deux-eleves') {
        // Hugo : un seul cours validé, quelques jours d'entraînement.
        const hugo = new Log(HUGO.id);
        hugo.courseRun(day(6), c(0));
        for (let back = 3; back >= 1; back--) hugo.training(day(back), c(0), 10);
        students.push({ id: HUGO.id, name: HUGO.name });
        studentEvents[HUGO.id] = hugo.events;
      }
      return { user: CLAIRE, events: [], students, studentEvents, ...(questions ? { studentQuestions: questions } : {}) };
    }
  }
  return { user: LEA, events: log.events };
}
