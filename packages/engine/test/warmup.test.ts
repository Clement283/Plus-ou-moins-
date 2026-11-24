import { describe, expect, it } from 'vitest';
import type { Activity, AppEvent } from '../src/events';
import { isAppEvent } from '../src/events';
import { getCourse, getModule } from '../src/courses';
import { seededRng } from '../src/rng';
import { addDays } from '../src/time';
import { foldProgress } from '../src/srs';
import { pendingReviews } from '../src/reviews';
import { dailyTime } from '../src/daily';
import { checkAnswer } from '../src/exercises/check';
import { computeDashboard } from '../src/dashboard';
import { buildWarmup, warmupAnswerEvent, warmupCourse, warmupDoneToday, warmupDue, warmupSkipEvent } from '../src/warmup';

const IDS = getModule('calculs').courseIds;
const [C0, C1] = [IDS[0]!, IDS[1]!];
const TODAY = '2026-03-10';
const yesterday = addDays(TODAY, -1);

let seq = 0;
const nextId = () => `w${String(++seq).padStart(6, '0')}`;
const base = { userId: 'u1', moduleId: 'calculs' };

function answer(day: string, activityId: string, activity: Activity, courseId: string, correct: boolean, durationMs = 1000): AppEvent {
  const id = nextId();
  return {
    ...base, id, at: Date.parse(`${day}T09:00:00Z`) + seq * 1000, day, kind: 'answer', activityId, activity, courseId, level: 1,
    questionKind: 'qcm', prompt: `q-${id}`, given: 'x', expected: 'y', correct, unfinished: false,
    errorType: correct ? null : 'signe-oublie', errorFamily: correct ? null : 'signe', attempt: 1, skipped: false, durationMs,
  };
}
const validation = (day: string, courseId: string): AppEvent[] => {
  const act = nextId();
  return Array.from({ length: 5 }, () => answer(day, act, 'rattrapage', courseId, true));
};
const end = (day: string, activity: Activity): AppEvent => ({
  ...base, id: nextId(), at: Date.parse(`${day}T10:00:00Z`) + seq, day, kind: 'activity_end', activityId: 'x', activity, courseId: null, completed: false,
});

describe('warmupCourse', () => {
  it('null sans cours validé', () => {
    expect(warmupCourse(foldProgress([]), TODAY)).toBeNull();
  });
  it('un cours à revoir passe avant celui dont la révision est proche', () => {
    const ev = [...validation(addDays(TODAY, -10), C1), ...validation(TODAY, C0)];
    expect(warmupCourse(foldProgress(ev), TODAY)).toBe(C1);
  });
  it('sinon le validé dont nextReview est le plus proche', () => {
    const ev = [...validation(yesterday, C1), ...validation(TODAY, C0)];
    expect(warmupCourse(foldProgress(ev), TODAY)).toBe(C1);
  });
});

describe('warmupDue', () => {
  const evs = validation(addDays(TODAY, -10), C0);
  it('faux sans cours validé', () => expect(warmupDue(foldProgress([]), [], TODAY)).toBe(false));
  it('vrai avec un cours validé et rien aujourd’hui', () => expect(warmupDue(foldProgress(evs), evs, TODAY)).toBe(true));
  it('faux si un événement existe déjà aujourd’hui', () => {
    const e = [...evs, answer(TODAY, 'a', 'entrainement', C0, true)];
    expect(warmupDue(foldProgress(e), e, TODAY)).toBe(false);
    const l = [...evs, { ...base, id: nextId(), at: 1, day: TODAY, kind: 'lesson_part_done', activityId: 'l', courseId: C1, partIndex: 0, durationMs: 1 } as AppEvent];
    expect(warmupDue(foldProgress(l), l, TODAY)).toBe(false);
  });
  it('faux après « Passer » du jour (même rechargé), vrai le lendemain', () => {
    const e = [...evs, end(TODAY, 'echauffement')];
    expect(warmupDoneToday(e, TODAY)).toBe(true);
    expect(warmupDue(foldProgress(e), e, TODAY)).toBe(false);
    expect(warmupDue(foldProgress(e), e, addDays(TODAY, 1))).toBe(true);
  });
});

describe('buildWarmup et événements', () => {
  it('une question qcm sur le cours choisi, événements valides', () => {
    const w = buildWarmup(foldProgress(validation(addDays(TODAY, -10), C0)), TODAY, seededRng(3))!;
    expect(w.courseId).toBe(C0);
    expect(w.question.kind).toBe('qcm');
    expect(buildWarmup(foldProgress([]), TODAY, seededRng(3))).toBeNull();
    const o = checkAnswer(getCourse(w.courseId), w.question, { choice: 0 });
    const e = warmupAnswerEvent(w, o, 5000);
    expect(e).toMatchObject({ kind: 'answer', activity: 'echauffement', attempt: 1, courseId: C0, durationMs: 5000, activityId: w.activityId });
    expect(isAppEvent({ ...e, id: 'x', userId: 'u', at: 1, day: TODAY })).toBe(true);
    const s = warmupSkipEvent(w);
    expect(s).toMatchObject({ kind: 'activity_end', activity: 'echauffement', completed: false, courseId: C0 });
    expect(isAppEvent({ ...s, id: 'y', userId: 'u', at: 1, day: TODAY })).toBe(true);
  });
});

describe('répétition espacée', () => {
  const b = validation(yesterday, C0); // nextReview = demain
  it('une réponse fausse rend le cours dû, étape inchangée', () => {
    const before = foldProgress(b);
    expect(pendingReviews(before, TODAY)).toHaveLength(0);
    const after = foldProgress([...b, answer(TODAY, 'wu', 'echauffement', C0, false)]);
    expect(pendingReviews(after, TODAY).map((p) => p.courseId)).toEqual([C0]);
    expect(after.courses[C0]!.step).toBe(before.courses[C0]!.step);
    expect(after.courses[C0]!.reviewHistory).toEqual([]);
  });
  it('une réponse juste ne change rien', () => {
    const after = foldProgress([...b, answer(TODAY, 'wu', 'echauffement', C0, true)]);
    expect(pendingReviews(after, TODAY)).toHaveLength(0);
    expect(after.courses[C0]!.nextReview).toBe(foldProgress(b).courses[C0]!.nextReview);
  });
  it('ne compte ni dans les tallies ni dans la note', () => {
    const after = foldProgress([...b, answer(TODAY, 'wu', 'echauffement', C0, false)]);
    expect(after.journal.runs[`wu|${C0}`]).toBeUndefined();
  });
});

describe('dailyTime', () => {
  it('compte l’échauffement, plafonné à 2 min', () => {
    expect(dailyTime([answer(TODAY, 'w', 'echauffement', C0, true, 20_000)], TODAY)).toMatchObject({ warmupMs: 20_000, totalMs: 20_000 });
    expect(dailyTime([answer(TODAY, 'w', 'echauffement', C0, true, 5 * 60_000)], TODAY)).toMatchObject({ warmupMs: 120_000, totalMs: 120_000 });
  });
  it('« Passer » ne compte pas', () => {
    expect(dailyTime([end(TODAY, 'echauffement')], TODAY).totalMs).toBe(0);
  });
});

describe('suivi', () => {
  it('une erreur d’échauffement apparaît dans les erreurs les plus communes', () => {
    const ev = [...validation(addDays(TODAY, -3), C0), answer(TODAY, 'wu', 'echauffement', C0, false)];
    expect(computeDashboard(ev, TODAY).home.commonErrors.top.map((e) => e.errorType)).toContain('signe-oublie');
  });
});
