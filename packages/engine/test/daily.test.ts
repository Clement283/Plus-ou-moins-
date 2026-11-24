import { describe, expect, it } from 'vitest';
import type { Activity, AppEvent } from '../src/events';
import { parisDay } from '../src/time';
import { dailyTime } from '../src/daily';

// Doc 02 §1 and its « Comptage du temps » table.
const DAY = '2026-03-10';
const S = 1000;
const MIN = 60 * S;

let seq = 0;
function answer(durationMs: number, activity: Activity = 'revision', day = DAY, at = Date.parse(`${day}T09:00:00Z`)): AppEvent {
  return {
    id: `a${++seq}`, userId: 'u1', at, day, kind: 'answer', activityId: 'act', activity, moduleId: 'calculs',
    courseId: 'c05-multiplier-deux', level: 1, questionKind: 'qcm', prompt: `p${seq}`, given: '', expected: '',
    correct: true, unfinished: false, errorType: null, errorFamily: null, attempt: 1, skipped: false, durationMs,
  };
}
function lessonPart(durationMs: number, day = DAY): AppEvent {
  return {
    id: `l${++seq}`, userId: 'u1', at: Date.parse(`${day}T09:00:00Z`), day, kind: 'lesson_part_done', activityId: 'act',
    moduleId: 'calculs', courseId: 'c05-multiplier-deux', partIndex: 0, durationMs,
  };
}

describe('dailyTime — « Comptage du temps » (doc 02)', () => {
  it('question affichée, réponse 40 s plus tard → 40 s', () => {
    expect(dailyTime([answer(40 * S)], DAY).totalMs).toBe(40 * S);
  });

  it('question affichée, téléphone posé, réponse 10 min plus tard → 2 min', () => {
    expect(dailyTime([answer(10 * MIN)], DAY).totalMs).toBe(2 * MIN);
  });

  it('explication de leçon lue pendant 1 min 30 → 1 min 30 ; au-delà de 3 min → 3 min', () => {
    expect(dailyTime([lessonPart(90 * S)], DAY).totalMs).toBe(90 * S);
    expect(dailyTime([lessonPart(7 * MIN)], DAY).totalMs).toBe(3 * MIN);
  });

  it("appli en arrière-plan 5 min au milieu d'une question → ces 5 min ne comptent pas", () => {
    // The client's chronometer pauses in the background: durationMs (here 50 s shown in two
    // stretches around a 5 min pause) already excludes it, and is counted as it is.
    expect(dailyTime([answer(50 * S)], DAY).totalMs).toBe(50 * S);
  });

  it('réponse à 23 h 59 puis à 0 h 01 (heure de Paris) : la 1re compte pour hier, la 2e pour aujourd’hui', () => {
    const before = Date.parse('2026-03-09T22:59:00Z'); // 23 h 59 in Paris (UTC+1)
    const after = Date.parse('2026-03-09T23:01:00Z'); // 0 h 01 in Paris
    const events = [answer(20 * S, 'revision', parisDay(before), before), answer(30 * S, 'revision', parisDay(after), after)];
    expect(dailyTime(events, '2026-03-09').totalMs).toBe(20 * S);
    expect(dailyTime(events, '2026-03-10').totalMs).toBe(30 * S);
  });
});

describe('dailyTime — catégories et objectif', () => {
  it('range le temps en révisions, cours (leçon, exemples, fin, rattrapage, explications) et entraînement', () => {
    const events = [
      answer(10 * S, 'revision'),
      answer(20 * S, 'lecon'),
      answer(30 * S, 'exemple'),
      answer(40 * S, 'fin'),
      answer(50 * S, 'rattrapage'),
      lessonPart(60 * S),
      answer(70 * S, 'entrainement'),
    ];
    expect(dailyTime(events, DAY)).toEqual({
      totalMs: 280 * S,
      reviewMs: 10 * S,
      courseMs: 200 * S,
      trainingMs: 70 * S,
      warmupMs: 0,
      goalReached: false,
    });
  });

  it("compte chaque réponse, repassages compris, et ignore les fins d'activité et les autres jours", () => {
    const retry = { ...answer(15 * S), attempt: 2 } as AppEvent;
    const end: AppEvent = {
      id: 'end', userId: 'u1', at: 0, day: DAY, kind: 'activity_end', activityId: 'act', activity: 'revision',
      moduleId: 'calculs', courseId: null, completed: true,
    };
    const events = [answer(10 * S), retry, end, answer(99 * S, 'revision', '2026-03-11')];
    expect(dailyTime(events, DAY).totalMs).toBe(25 * S);
  });

  it('objectif atteint à 15 min, toutes catégories confondues, et le temps en plus continue de compter', () => {
    const under = [answer(2 * MIN, 'revision'), ...Array.from({ length: 6 }, () => answer(2 * MIN, 'lecon')), answer(59 * S, 'entrainement')];
    expect(dailyTime(under, DAY).goalReached).toBe(false);
    const exactly = [...under, answer(1 * S, 'entrainement')];
    expect(dailyTime(exactly, DAY)).toMatchObject({ totalMs: 15 * MIN, goalReached: true });
    const more = [...exactly, ...Array.from({ length: 7 }, () => lessonPart(3 * MIN))];
    expect(dailyTime(more, DAY)).toMatchObject({ totalMs: 36 * MIN, goalReached: true });
  });

  it('2 h de cours aujourd’hui : le temps de cours n’est jamais limité', () => {
    const events = Array.from({ length: 60 }, () => answer(2 * MIN, 'fin'));
    expect(dailyTime(events, DAY).courseMs).toBe(120 * MIN);
  });

  it('aucun événement : 0 et objectif non atteint', () => {
    expect(dailyTime([], DAY)).toEqual({ totalMs: 0, reviewMs: 0, courseMs: 0, trainingMs: 0, warmupMs: 0, goalReached: false });
  });
});
