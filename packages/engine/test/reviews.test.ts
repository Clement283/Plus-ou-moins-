import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Activity, AppEvent, QuestionKind } from '../src/events';
import { getCourse, getModule, type Level } from '../src/courses';
import type { Question } from '../src/exercises/types';
import { seededRng } from '../src/rng';
import { addDays } from '../src/time';
import { LADDER, foldProgress, type CourseProgress, type ProgressState } from '../src/srs';
import { REVIEW_SESSION_COURSES, nextReviewSession, pendingReviews } from '../src/reviews';

const IDS = getModule('calculs').courseIds; // 8 courses, Cours 0 first
const C0 = IDS[0]!;
const C1 = IDS[1]!;
const C4 = IDS[4]!;
/** Les cours qui ont leurs propres formats de révision (Cours 1 v2, Cours 4 v2). */
const WITH_FORMATS = [C1, C4];
const C5 = 'c05-multiplier-deux';

let seq = 0;
const nextId = () => `e${String(++seq).padStart(6, '0')}`;

function answer(day: string, activityId: string, activity: Activity, courseId: string, correct: boolean, questionKind: QuestionKind = 'saisie'): AppEvent {
  const id = nextId();
  return {
    id, userId: 'u1', at: Date.parse(`${day}T09:00:00Z`) + seq * 1000, day, kind: 'answer', activityId, activity,
    moduleId: 'calculs', courseId, level: 1, questionKind, prompt: `q-${id}`, given: '', expected: '', correct,
    unfinished: false, errorType: correct ? null : 'autre', errorFamily: correct ? null : 'autre', attempt: 1,
    skipped: false, durationMs: 1000,
  };
}

/** A validation through a 5/5 rattrapage (the shortest way to validate a course in the journal). */
const validation = (day: string, courseId: string): AppEvent[] => {
  const act = nextId();
  return Array.from({ length: 5 }, () => answer(day, act, 'rattrapage', courseId, true));
};

/** Answers every question of a session (the 3 of each course right unless listed in `wrong`). */
function answerSession(day: string, s: NonNullable<ReturnType<typeof nextReviewSession>>, wrong: string[] = [], keep = (_c: string, _i: number) => true): AppEvent[] {
  const seen: Record<string, number> = {};
  const out: AppEvent[] = [];
  for (const item of s.items) {
    const i = (seen[item.courseId] = (seen[item.courseId] ?? 0) + 1);
    if (!keep(item.courseId, i)) continue;
    out.push(answer(day, s.activityId, 'revision', item.courseId, !(wrong.includes(item.courseId) && i === 1), item.question.kind));
  }
  return out;
}

const rng = () => seededRng(42);
const fixedId = () => 'session-id';
const courseIdsOf = (s: ReturnType<typeof nextReviewSession>) => [...new Set(s?.items.map((i) => i.courseId) ?? [])];

/** All 8 courses validated on `day` (Cours 0 first), all due on day + 2. */
function allValidated(day: string): { events: AppEvent[]; state: ProgressState } {
  const events = IDS.flatMap((id) => validation(day, id));
  return { events, state: foldProgress(events) };
}

/** A copy of `state` with some courses rescheduled (plain data, as the fold produces it). */
function withCourses(state: ProgressState, changes: Record<string, Partial<CourseProgress>>): ProgressState {
  const courses = { ...state.courses };
  for (const [id, ch] of Object.entries(changes)) {
    const c = { ...courses[id]!, ...ch };
    if (ch.step !== undefined && ch.step !== null) c.level = LADDER[ch.step]!.level;
    courses[id] = c;
  }
  return { ...state, courses };
}

/** Only these courses due on `day`; the others in the future. */
function onlyDue(state: ProgressState, due: string[], day: string): ProgressState {
  const changes: Record<string, Partial<CourseProgress>> = {};
  for (const id of IDS) changes[id] = { nextReview: due.includes(id) ? day : addDays(day, 10) };
  return withCourses(state, changes);
}

/** A list-level state with any number of validated courses (fake ids), for the rows above 8 courses. */
function syntheticState(courses: { id: string; validatedOn: string; nextReview: string }[]): ProgressState {
  const record: Record<string, CourseProgress> = {};
  for (const c of courses)
    record[c.id] = {
      courseId: c.id, status: 'valide', validatedOn: c.validatedOn, step: 0, level: 1, stars: 1, nextReview: c.nextReview,
      lastReviewFailed: false, reviewHistory: [], recentErrors: {}, failedTwiceInARow: false,
    };
  return { courses: record, modules: {}, journal: { events: [], runs: {}, recent: {} } };
}

/** « Encore des révisions » at list level: each session takes the first 5 due courses, which are then done. */
function sessionsOf(state: ProgressState, day: string, stopAfter = Infinity): { sessions: string[][]; state: ProgressState } {
  const sessions: string[][] = [];
  let s = state;
  while (sessions.length < stopAfter) {
    const ids = pendingReviews(s, day).slice(0, REVIEW_SESSION_COURSES).map((p) => p.courseId);
    if (ids.length === 0) break;
    sessions.push(ids);
    const courses = { ...s.courses };
    for (const id of ids) courses[id] = { ...courses[id]!, nextReview: addDays(day, 2) };
    s = { ...s, courses };
  }
  return { sessions, state: s };
}

const levelOf = (q: Question): Level => (q.kind === 'paires' || q.kind === 'classer' ? q.exs[0]!.level : q.ex.level);

describe('pendingReviews — les cours dus (doc 02 §3–§5)', () => {
  const V = '2026-03-02';

  it('aucun cours validé → rien à réviser', () => {
    expect(pendingReviews(foldProgress([]), V)).toEqual([]);
  });

  it('un cours validé est dû 48 h plus tard, pas avant (pas de révision en avance)', () => {
    const state = foldProgress(validation(V, C5));
    expect(pendingReviews(state, V)).toEqual([]);
    expect(pendingReviews(state, addDays(V, 1))).toEqual([]);
    expect(pendingReviews(state, addDays(V, 2))).toEqual([{ courseId: C5, due: addDays(V, 2) }]);
    expect(pendingReviews(state, addDays(V, 5))).toEqual([{ courseId: C5, due: addDays(V, 2) }]);
  });

  it('cours révisé ce matin (raté) : pas de nouvelle révision aujourd’hui ; dû demain', () => {
    const day = addDays(V, 2);
    const act = nextId();
    const events = [
      ...validation(V, C5),
      answer(day, act, 'revision', C5, true),
      answer(day, act, 'revision', C5, false),
      answer(day, act, 'revision', C5, true),
    ];
    const state = foldProgress(events);
    expect(pendingReviews(state, day)).toEqual([]);
    expect(pendingReviews(state, addDays(day, 1))).toEqual([{ courseId: C5, due: addDays(day, 1) }]);
  });

  it('un cours révisé aujourd’hui (réussi) n’est pas reproposé aujourd’hui', () => {
    const day = addDays(V, 2);
    const act = nextId();
    const events = [...validation(V, C5), ...[1, 2, 3].map(() => answer(day, act, 'revision', C5, true))];
    expect(pendingReviews(foldProgress(events), day)).toEqual([]);
  });

  it('séance interrompue : un cours dont les 3 questions n’ont pas toutes une 1re réponse reste à faire aujourd’hui', () => {
    const day = addDays(V, 2);
    const act = nextId();
    const events = [...validation(V, C5), answer(day, act, 'revision', C5, true), answer(day, act, 'revision', C5, true)];
    expect(pendingReviews(foldProgress(events), day)).toEqual([{ courseId: C5, due: day }]);
  });

  it('l’entraînement ne rend pas un cours dû et ne le retire pas de la liste', () => {
    const day = addDays(V, 2);
    const act = nextId();
    const events = [...validation(V, C5), ...[1, 2, 3].map(() => answer(day, act, 'entrainement', C5, true))];
    expect(pendingReviews(foldProgress(events), addDays(V, 1))).toEqual([]);
    expect(pendingReviews(foldProgress(events), day)).toEqual([{ courseId: C5, due: day }]);
  });

  it('les plus anciennes dates d’abord, puis l’ordre où les cours ont été faits', () => {
    const events = [
      ...validation('2026-03-01', IDS[3]!), // due 03-03
      ...validation('2026-03-02', IDS[1]!), // due 03-04, validated after IDS[2] on the same day
      ...validation('2026-03-02', IDS[2]!),
      ...validation('2026-03-03', IDS[0]!), // due 03-05
    ];
    const state = withCourses(foldProgress(events), {
      [IDS[1]!]: { validatedOn: '2026-03-02' },
      [IDS[2]!]: { validatedOn: '2026-03-01', nextReview: '2026-03-04' }, // validated earlier, same due date
    });
    expect(pendingReviews(state, '2026-03-10')).toEqual([
      { courseId: IDS[3]!, due: '2026-03-03' },
      { courseId: IDS[2]!, due: '2026-03-04' },
      { courseId: IDS[1]!, due: '2026-03-04' },
      { courseId: IDS[0]!, due: '2026-03-05' },
    ]);
  });

  it('même date et même jour de validation : dans l’ordre des cours', () => {
    // validated in reverse order on the same day: the course order breaks the tie
    const state = foldProgress([...IDS].reverse().flatMap((id) => validation(V, id)));
    expect(pendingReviews(state, addDays(V, 2)).map((p) => p.courseId)).toEqual(IDS);
  });
});

describe('Séances — tableau « Exemples » du doc 02', () => {
  const V = '2026-03-02';
  const D = addDays(V, 2);
  const { events: base, state: all } = allValidated(V);

  it('0 cours dû → aucune séance', () => {
    expect(nextReviewSession(all, V, rng(), fixedId)).toBeNull();
    expect(pendingReviews(all, V)).toEqual([]);
  });

  it('3 cours dus → 1 séance : 3 cours, 9 questions', () => {
    const s = nextReviewSession(onlyDue(all, IDS.slice(2, 5), D), D, rng(), fixedId);
    expect(s?.items).toHaveLength(9);
    expect(courseIdsOf(s).sort()).toEqual(IDS.slice(2, 5).sort());
  });

  it('5 cours dus → 1 séance : 5 cours, 15 questions', () => {
    const s = nextReviewSession(onlyDue(all, IDS.slice(0, 5), D), D, rng(), fixedId);
    expect(s?.items).toHaveLength(15);
    expect(courseIdsOf(s)).toHaveLength(5);
  });

  it('7 cours dus → 2 séances : 5 cours (15 questions), puis 2 cours (6 questions) via « Encore des révisions »', () => {
    const seven = IDS.slice(0, 7);
    const events = base.filter((e) => e.kind !== 'answer' || e.courseId !== IDS[7]);
    const state = foldProgress(events);
    expect(pendingReviews(state, D).map((p) => p.courseId)).toEqual(seven);

    const s1 = nextReviewSession(state, D, rng(), () => 'rev-1')!;
    expect(s1.activityId).toBe('rev-1');
    expect(s1.items).toHaveLength(15);
    expect(courseIdsOf(s1).sort()).toEqual(seven.slice(0, 5).sort());

    const after1 = foldProgress([...events, ...answerSession(D, s1)]);
    const s2 = nextReviewSession(after1, D, rng(), () => 'rev-2')!;
    expect(s2.items).toHaveLength(6);
    expect(courseIdsOf(s2).sort()).toEqual(seven.slice(5).sort());

    const after2 = foldProgress([...events, ...answerSession(D, s1), ...answerSession(D, s2)]);
    expect(nextReviewSession(after2, D, rng(), fixedId)).toBeNull();
    expect(pendingReviews(after2, D)).toEqual([]);
  });

  it('séance interrompue : les cours sans leurs 3 premières réponses restent dus et reviennent dans la séance suivante', () => {
    const s1 = nextReviewSession(onlyDue(all, IDS.slice(0, 3), D), D, rng(), () => 'rev-1')!;
    const [done, cut, untouched] = courseIdsOf(s1) as [string, string, string];
    // She stops: 3 answers for `done`, 2 for `cut`, none for `untouched`.
    const partial = answerSession(D, s1, [], (c, i) => c === done || (c === cut && i <= 2));
    const events = [...base, ...partial];
    const state = withCourses(foldProgress(events), {
      ...Object.fromEntries(IDS.filter((id) => !IDS.slice(0, 3).includes(id)).map((id) => [id, { nextReview: addDays(D, 10) }])),
    });
    expect(pendingReviews(state, D).map((p) => p.courseId).sort()).toEqual([cut, untouched].sort());
    const s2 = nextReviewSession(state, D, rng(), () => 'rev-2')!;
    expect(s2.items).toHaveLength(6);
    expect(courseIdsOf(s2).sort()).toEqual([cut, untouched].sort());
  });

  it('cours révisé ce matin (raté) : pas dans la séance suivante aujourd’hui', () => {
    const state = onlyDue(all, [C5, IDS[1]!], D);
    const s1 = nextReviewSession(state, D, rng(), () => 'rev-1')!;
    const failed = foldProgress([...base, ...answerSession(D, s1, [C5])]);
    // the other courses stay in the future, as in `state`
    const after = withCourses(failed, Object.fromEntries(IDS.filter((id) => id !== C5 && id !== IDS[1]).map((id) => [id, { nextReview: addDays(D, 10) }])));
    expect(nextReviewSession(after, D, rng(), fixedId)).toBeNull();
    expect(pendingReviews(after, addDays(D, 1)).map((p) => p.courseId)).toEqual([C5]);
  });

  it('12 cours dus (retour après une absence) → 3 séances : 5 + 5 + 2 cours', () => {
    const twelve = Array.from({ length: 12 }, (_, i) => ({ id: `x${i}`, validatedOn: addDays(V, i), nextReview: addDays(V, i + 2) }));
    const { sessions } = sessionsOf(syntheticState(twelve), addDays(V, 30));
    expect(sessions.map((s) => s.length)).toEqual([5, 5, 2]);
  });

  it('12 cours dus, elle s’arrête après la 1re séance → les 7 restants gardent leur date et passent demain avant les révisions du jour', () => {
    const today = addDays(V, 30);
    const twelve = Array.from({ length: 12 }, (_, i) => ({ id: `x${i}`, validatedOn: addDays(V, i), nextReview: addDays(V, i + 2) }));
    const tomorrowsOwn = { id: 'y', validatedOn: addDays(V, 20), nextReview: addDays(today, 1) };
    const { state } = sessionsOf(syntheticState([...twelve, tomorrowsOwn]), today, 1);
    const rest = twelve.slice(5);
    expect(pendingReviews(state, addDays(today, 1))).toEqual([
      ...rest.map((c) => ({ courseId: c.id, due: c.nextReview })),
      { courseId: 'y', due: addDays(today, 1) },
    ]);
  });

  it('pas de révision du lundi au jeudi ; vendredi : 10 en attente (2 par jour) → 2 séances dans l’ordre des dates', () => {
    const mon = '2026-03-09';
    const days = [0, 1, 2, 3, 4].map((n) => addDays(mon, n)); // lun. → ven.
    const courses = days.flatMap((d, n) => [
      { id: `${n}a`, validatedOn: addDays(d, -2), nextReview: d },
      { id: `${n}b`, validatedOn: addDays(d, -2), nextReview: d },
    ]);
    // same due date: the 2nd one of each day was validated after the 1st one
    const state = syntheticState(courses);
    state.courses['0a']!.validatedOn = '2026-03-06';
    state.courses['0b']!.validatedOn = '2026-03-07';
    state.courses['1a']!.validatedOn = '2026-03-07';
    state.courses['1b']!.validatedOn = '2026-03-08';
    state.courses['2a']!.validatedOn = '2026-03-08';
    state.courses['2b']!.validatedOn = '2026-03-09';
    const { sessions } = sessionsOf(state, days[4]!);
    expect(sessions).toEqual([
      ['0a', '0b', '1a', '1b', '2a'],
      ['2b', '3a', '3b', '4a', '4b'],
    ]);
  });

  it('2 h de cours aujourd’hui : chaque cours validé entre dans la liste, avec sa 1re révision dans 48 h', () => {
    const state = foldProgress(IDS.slice(0, 4).flatMap((id) => validation(V, id)));
    expect(pendingReviews(state, addDays(V, 1))).toEqual([]);
    expect(pendingReviews(state, addDays(V, 2)).map((p) => p.courseId)).toEqual(IDS.slice(0, 4));
  });
});

describe('nextReviewSession — composition des 3 calculs de chaque cours', () => {
  const V = '2026-03-02';
  const D = addDays(V, 2);
  const { state: all } = allValidated(V);

  const EXPECTED: Record<number, (levels: Level[]) => boolean> = {
    1: (l) => l.join() === '1,1,1',
    2: (l) => l.join() === '1,2,2',
    3: (l) => l.join() === '1,2,2',
    4: (l) => l.join() === '1,3,3' || l.join() === '2,3,3',
  };

  for (const [i, { step, level }] of LADDER.entries()) {
    it(`étape ${step} (niveau ${level}) : ${['3 au niveau 1', '2 au niveau 2 + 1 au niveau 1', '2 au niveau 2 + 1 au niveau 1'][i] ?? '2 au niveau 3 + 1 au niveau 1 ou 2'}`, () => {
      const state = onlyDue(withCourses(all, Object.fromEntries(IDS.map((id) => [id, { step: i }]))), [C0, C5, IDS[2]!], D);
      const thirds = new Set<Level>();
      for (let seed = 0; seed < 200; seed++) {
        const s = nextReviewSession(state, D, seededRng(seed), fixedId)!;
        for (const id of [C0, C5, IDS[2]!]) {
          const levels = s.items.filter((it) => it.courseId === id).map((it) => levelOf(it.question)).sort();
          expect(EXPECTED[level === 3 ? 4 : i === 0 ? 1 : 2]!(levels)).toBe(true);
          if (level === 3) thirds.add(levels[0]!);
        }
      }
      if (level === 3) expect([...thirds].sort()).toEqual([1, 2]);
    });
  }

  it('formats (doc 04 §9) sur 1 000 séances : au plus 1 vrai ou faux, au plus 1 classer, le reste en QCM ; Cours 0 sans vrai ou faux', () => {
    const state = onlyDue(all, IDS.slice(0, 5), D);
    const state2 = onlyDue(all, IDS.slice(3), D);
    const seenKinds = new Set<string>();
    for (let seed = 0; seed < 1000; seed++) {
      const s = nextReviewSession(seed % 2 ? state : state2, D, seededRng(seed), fixedId)!;
      for (const id of courseIdsOf(s)) {
        const kinds = s.items.filter((it) => it.courseId === id).map((it) => it.question.kind);
        expect(kinds).toHaveLength(3);
        expect(kinds.filter((k) => k === 'vraifaux').length).toBeLessThanOrEqual(1);
        expect(kinds.filter((k) => k === 'classer').length).toBeLessThanOrEqual(1);
        if (id === C0) {
          // Cours 0: 3 different formats among QCM, Classer, « Quelle règle ? », « Réécris », « Toucher la faute »
          expect(new Set(kinds).size).toBe(3);
          expect(kinds.every((k) => ['qcm', 'classer', 'choix', 'reecrire', 'erreur'].includes(k))).toBe(true);
        } else if (WITH_FORMATS.includes(id)) {
          // Cours 1 et 4 : 3 formats différents parmi leurs `formats` (saisie, droite, signe = qcm, vrai ou faux, erreur)
          expect(new Set(kinds).size).toBe(3);
          expect(kinds.every((k) => ['saisie', 'droite', 'qcm', 'vraifaux', 'erreur'].includes(k))).toBe(true);
        } else {
          expect(kinds.every((k) => k === 'qcm' || k === 'vraifaux' || k === 'classer')).toBe(true);
          expect(kinds.filter((k) => k === 'qcm').length).toBeGreaterThanOrEqual(1);
        }
        if (!WITH_FORMATS.includes(id)) for (const k of kinds) seenKinds.add(`${id === C0 ? 'c0' : 'other'}:${k}`);
      }
    }
    expect([...seenKinds].sort()).toEqual(['c0:choix', 'c0:classer', 'c0:erreur', 'c0:qcm', 'c0:reecrire', 'other:classer', 'other:qcm', 'other:vraifaux']);
  });

  it('fréquence des formats (doc 07 #10A) : 1 chance sur 4 de « vrai ou faux », 1 sur 4 de « classer » par cours', () => {
    const state = onlyDue(all, [2, 3, 5, 6, 7].map((i) => IDS[i]!), D); // 5 cours sans formats propres, aucun n'est le Cours 0
    let vf = 0;
    let cl = 0;
    let courses = 0;
    for (let seed = 0; seed < 1000; seed++) {
      const s = nextReviewSession(state, D, seededRng(seed), fixedId)!;
      for (const id of courseIdsOf(s)) {
        const kinds = s.items.filter((it) => it.courseId === id).map((it) => it.question.kind);
        courses++;
        vf += kinds.filter((k) => k === 'vraifaux').length;
        cl += kinds.filter((k) => k === 'classer').length;
      }
    }
    expect(Math.abs(vf / courses - 0.25)).toBeLessThan(0.03);
    expect(Math.abs(cl / courses - 0.25)).toBeLessThan(0.03);
  });

  it('les questions des différents cours sont entremêlées : jamais deux de suite du même cours', () => {
    for (const n of [2, 3, 5]) {
      const state = onlyDue(all, IDS.slice(1, 1 + n), D);
      const firsts = new Set<string>();
      for (let seed = 0; seed < 200; seed++) {
        const s = nextReviewSession(state, D, seededRng(seed), fixedId)!;
        for (let i = 1; i < s.items.length; i++) expect(s.items[i]!.courseId).not.toBe(s.items[i - 1]!.courseId);
        firsts.add(s.items[0]!.courseId);
      }
      expect(firsts.size).toBe(n); // in random order, not grouped by course
    }
  });

  it('un seul cours dû : ses 3 questions', () => {
    const s = nextReviewSession(onlyDue(all, [C5], D), D, rng(), fixedId)!;
    expect(s.items.map((i) => i.courseId)).toEqual([C5, C5, C5]);
  });

  it('erreurs récentes du cours 5 : 3 fois « règle des signes », 1 fois « table » → au moins 1 des 3 calculs vise la règle des signes', () => {
    // The « règle des signes » trap of Cours 5 multiplies two negative numbers.
    const twoNegatives = (q: Question) =>
      q.kind !== 'paires' && q.kind !== 'classer' && q.ex.expr.k === 'op' &&
      q.ex.expr.a.k === 'num' && q.ex.expr.b.k === 'num' && q.ex.expr.a.v.n < 0 && q.ex.expr.b.v.n < 0;
    const withErrors = withCourses(onlyDue(all, [C5, IDS[1]!], D), { [C5]: { recentErrors: { 'erreur-table': 1, 'regle-signes': 3 } } });
    const without = onlyDue(all, [C5, IDS[1]!], D);
    let misses = 0;
    for (let seed = 0; seed < 300; seed++) {
      const hit = (st: ProgressState) =>
        nextReviewSession(st, D, seededRng(seed), fixedId)!.items.some((it) => it.courseId === C5 && twoNegatives(it.question));
      expect(hit(withErrors)).toBe(true);
      if (!hit(without)) misses++;
    }
    expect(misses).toBeGreaterThan(0); // without recent errors, nothing forces it
  });

  it('Cours 0 avec des erreurs récentes « signes collés » : au moins 1 question montre cette faute', () => {
    const state = withCourses(onlyDue(all, [C0], D), { [C0]: { recentErrors: { 'signes-colles': 2, parenthese: 1 } } });
    const faultOf = (q: Question) => (q.kind !== 'paires' && q.kind !== 'classer' ? (q.ex.meta?.faultType ?? null) : null);
    for (let seed = 0; seed < 300; seed++) {
      const items = nextReviewSession(state, D, seededRng(seed), fixedId)!.items;
      expect(
        items.some(
          (it) =>
            (it.question.kind === 'qcm' && it.question.choices.some((ch) => ch.errorType === 'signes-colles')) ||
            ((it.question.kind === 'erreur' || it.question.kind === 'choix' || it.question.kind === 'reecrire') && faultOf(it.question) === 'signes-colles'),
        ),
      ).toBe(true);
    }
  });

  it('erreurs à égalité : celle qui vient en premier dans la liste des erreurs du cours', () => {
    const twoNegatives = (q: Question) =>
      q.kind !== 'paires' && q.kind !== 'classer' && q.ex.expr.k === 'op' &&
      q.ex.expr.a.k === 'num' && q.ex.expr.b.k === 'num' && q.ex.expr.a.v.n < 0 && q.ex.expr.b.v.n < 0;
    const state = withCourses(onlyDue(all, [C5], D), { [C5]: { recentErrors: { 'erreur-table': 2, 'regle-signes': 2, autre: 5 } } });
    for (let seed = 0; seed < 100; seed++)
      expect(nextReviewSession(state, D, seededRng(seed), fixedId)!.items.some((it) => twoNegatives(it.question))).toBe(true);
  });

  it('timesSeen : la formule « début » du QCM tant que le cours a moins de 5 QCM déjà vus (doc 04 §7.2)', () => {
    const qcmFormulas = (st: ProgressState) => {
      const f = new Set<string>();
      for (let seed = 0; seed < 100; seed++)
        for (const it of nextReviewSession(st, D, seededRng(seed), fixedId)!.items)
          if (it.question.kind === 'qcm') f.add(it.question.formula);
      return f;
    };
    const fresh = onlyDue(all, [C5], D);
    expect([...qcmFormulas(fresh)]).toEqual(['debut']);

    const act = nextId();
    const seenQcm = Array.from({ length: 5 }, () => answer(V, act, 'entrainement', C5, true, 'qcm'));
    const { events } = allValidated(V);
    const seasoned = onlyDue(foldProgress([...events, ...seenQcm]), [C5], D);
    expect(qcmFormulas(seasoned).size).toBeGreaterThan(1);

    // repeated tries (attempt > 1) and other courses' QCM do not count
    const notFirst = Array.from({ length: 5 }, () => ({ ...answer(V, act, 'entrainement', C5, true, 'qcm'), attempt: 2 }) as AppEvent);
    const other = Array.from({ length: 5 }, () => answer(V, act, 'entrainement', IDS[1]!, true, 'qcm'));
    expect([...qcmFormulas(onlyDue(foldProgress([...events, ...notFirst, ...other]), [C5], D))]).toEqual(['debut']);
  });

  it('activityId : un nouvel identifiant (UUID) à chaque séance, injectable pour les tests', () => {
    const state = onlyDue(all, [C5], D);
    const a = nextReviewSession(state, D, rng())!.activityId;
    const b = nextReviewSession(state, D, rng())!.activityId;
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(a).not.toBe(b);
    expect(nextReviewSession(state, D, rng(), () => 'mine')!.activityId).toBe('mine');
  });
});

describe('formats propres à un cours (doc 06, Cours 1 v2)', () => {
  const C1 = 'c01-additionner-meme-signe';
  const FORMATS = ['saisie', 'droite', 'signe', 'vraifaux', 'erreur'] as const;
  const course = getCourse(C1) as { formats?: readonly string[] };
  const stepOf = (level: Level) => LADDER.findIndex((l) => l.level === level);
  const stateAt = (step: number) => withCourses(foldProgress(validation('2026-03-02', C1)), { [C1]: { step, nextReview: '2026-03-04' } });
  const session = (seed: number, step: number) => nextReviewSession(stateAt(step), '2026-03-04', seededRng(seed), fixedId)!;
  /** « signe » is a QCM whose two choices are « + » and « − ». */
  const isSigne = (q: Question) => q.kind === 'qcm' && q.choices.map((c) => c.latex).join() === '+,-';
  const formatOf = (q: Question) => (isSigne(q) ? 'signe' : q.kind);

  beforeEach(() => {
    course.formats = FORMATS;
  });
  afterEach(() => {
    delete course.formats;
  });

  it('3 formats différents tirés dans la liste, tous vus sur l’ensemble (niveau 1)', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 200; seed++) {
      const kinds = session(seed, 0).items.map((i) => formatOf(i.question));
      expect(new Set(kinds).size).toBe(3);
      kinds.forEach((k) => seen.add(k));
    }
    expect([...seen].sort()).toEqual([...FORMATS].sort());
  });

  it('droite : jamais plus de 8 graduations ; seulement au niveau 1 (repli sur saisie ensuite)', () => {
    for (let seed = 0; seed < 500; seed++)
      for (const i of session(seed, 0).items)
        if (i.question.kind === 'droite') expect(i.question.line.to - i.question.line.from).toBeLessThanOrEqual(7);
    for (const level of [2, 3] as Level[])
      for (let seed = 0; seed < 200; seed++)
        for (const i of session(seed, stepOf(level)).items) if (i.question.kind === 'droite') expect(i.question.ex.level).toBe(1);
  });

  it('sans formats : séance identique à celle d’avant', () => {
    delete course.formats;
    const a = session(5, 0);
    expect(a.items.every((i) => !isSigne(i.question) && i.question.kind !== 'droite')).toBe(true);
    expect(a).toEqual(session(5, 0));
  });
});
