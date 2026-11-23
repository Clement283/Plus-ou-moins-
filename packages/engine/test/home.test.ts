import { describe, expect, it } from 'vitest';
import type { Activity, AppEvent } from '../src/events';
import { getModule } from '../src/courses';
import { foldProgress, type ProgressState } from '../src/srs';
import { addDays } from '../src/time';
import { dailyTime } from '../src/daily';
import { runResult, reviewSummary, studentHome } from '../src/home';
import { computeDashboard } from '../src/dashboard';

const IDS = getModule('calculs').courseIds;
const DAY = '2026-03-02';

let seq = 0;
function ans(day: string, activityId: string, activity: Activity, courseId: string, correct: boolean, durationMs = 1000): AppEvent {
  const id = `e${String(++seq).padStart(6, '0')}`;
  return {
    id, userId: 'u1', at: Date.parse(`${day}T09:00:00Z`) + seq * 1000, day, kind: 'answer', activityId, activity,
    moduleId: 'calculs', courseId, level: 1, questionKind: 'saisie', prompt: `q-${id}`, given: '', expected: '', correct,
    unfinished: false, errorType: correct ? null : 'autre', errorFamily: correct ? null : 'autre', attempt: 1,
    skipped: false, durationMs,
  };
}
const validation = (day: string, courseId: string): AppEvent[] => {
  const act = `val-${courseId}-${day}-${seq}`;
  return Array.from({ length: 5 }, () => ans(day, act, 'rattrapage', courseId, true));
};
const validated = (n: number, day = DAY): AppEvent[] => IDS.slice(0, n).flatMap((id) => validation(day, id));

describe('studentHome', () => {
  it('aucun événement : prochain cours = cours 0 disponible, fenêtre c00..c03', () => {
    const h = studentHome(foldProgress([]), [], DAY);
    expect(h.next).toEqual({ courseId: IDS[0], status: 'disponible' });
    expect(h.module.window.map((w) => w.courseId)).toEqual(IDS.slice(0, 4));
    expect(h.module.window.filter((w) => w.current).map((w) => w.courseId)).toEqual([IDS[0]]);
    expect(h.reviews).toBeNull();
    expect(h.streak).toBe(0);
    expect(h.module).toMatchObject({ moduleId: 'calculs', validated: 0, total: 8, done: false });
  });

  it('cours 0 à 3 validés : fenêtre c02..c05, actuel c04', () => {
    const events = validated(4);
    const h = studentHome(foldProgress(events), events, DAY);
    expect(h.module.window.map((w) => w.courseId)).toEqual(IDS.slice(2, 6));
    expect(h.module.window.find((w) => w.current)!.courseId).toBe(IDS[4]);
    expect(h.module.window.map((w) => w.status)).toEqual(['valide', 'valide', 'disponible', 'verrouille']);
    expect(h.next).toEqual({ courseId: IDS[4], status: 'disponible' });
  });

  it('8 cours validés : module terminé, plus de prochain cours', () => {
    const events = validated(8);
    const h = studentHome(foldProgress(events), events, DAY);
    expect(h.next).toBeNull();
    expect(h.module.done).toBe(true);
    expect(h.module.window).toHaveLength(4);
    expect(h.module.window.some((w) => w.current)).toBe(false);
  });

  it('un cours en cours ou à rattraper est le prochain', () => {
    const events = [...validated(1), ...Array.from({ length: 5 }, () => ans(DAY, 'run1', 'fin', IDS[1]!, false))];
    const h = studentHome(foldProgress(events), events, DAY);
    expect(h.next).toEqual({ courseId: IDS[1], status: 'a-rattraper' });
  });

  it('fenêtre décalée au bord : cours 6 actuel garde 4 cours', () => {
    const events = validated(6);
    const h = studentHome(foldProgress(events), events, DAY);
    expect(h.module.window.map((w) => w.courseId)).toEqual(IDS.slice(4, 8));
    expect(h.module.window.find((w) => w.current)!.courseId).toBe(IDS[6]);
  });

  it('7 cours dus : une séance de 5 cours (15 questions, 5 min)', () => {
    const events = validated(7);
    const h = studentHome(foldProgress(events), events, addDays(DAY, 2));
    expect(h.reviews).toEqual({ courses: 5, questions: 15, minutes: 5 });
  });

  it('3 cours dus : une séance de 9 questions, 3 min', () => {
    const events = validated(3);
    const h = studentHome(foldProgress(events), events, addDays(DAY, 2));
    expect(h.reviews).toEqual({ courses: 3, questions: 9, minutes: 3 });
  });

  it('12 cours dus (simulés) : séance limitée à 5 cours', () => {
    const base = foldProgress(validated(8));
    const state: ProgressState = base;
    const h = studentHome(state, [], addDays(DAY, 2));
    expect(h.reviews!.courses).toBe(5);
  });

  it('série et temps du jour : même règle que le suivi', () => {
    const events = [DAY, addDays(DAY, 1), addDays(DAY, 2)].map((d) => ans(d, `a-${d}`, 'entrainement', IDS[0]!, true, 120_000)).flatMap((e, i) =>
      Array.from({ length: 8 }, (_, k) => ({ ...e, id: `s${i}-${k}`, at: e.at + k })),
    );
    const today = addDays(DAY, 2);
    const h = studentHome(foldProgress(events), events, today);
    expect(h.streak).toBe(computeDashboard(events, today).home.state.streak);
    expect(h.streak).toBe(3);
    expect(h.today).toEqual(dailyTime(events, today));
  });
});

describe('runResult (doc 01, « Autres cas »)', () => {
  /** A course run: 7 non-final answers then 5 final ones. */
  function run(courseId: string, okTotal: number, finOk: number): AppEvent[] {
    const act = `run-${courseId}`;
    const lesson = Array.from({ length: 7 }, (_, i) => ans(DAY, act, 'lecon', courseId, i < okTotal - finOk));
    const fin = Array.from({ length: 5 }, (_, i) => ans(DAY, act, 'fin', courseId, i < finOk));
    return [...lesson, ...fin];
  }
  it('11 sur 12 dont 5 sur 5 : validé, cours suivant, 1re révision dans 48 h', () => {
    const events = run(IDS[1]!, 11, 5);
    const r = runResult(foldProgress(events), `run-${IDS[1]}`, IDS[1]!);
    expect(r).toEqual({ validated: true, ok: 11, first: 12, finOk: 5, fin: 5, percent: 92, nextCourseId: IDS[2], firstReviewInHours: 48 });
  });
  it('10 sur 12 dont 3 sur 5 : non validé, 83 %, le cours suivant reste annoncé', () => {
    const events = run(IDS[1]!, 10, 3);
    const r = runResult(foldProgress(events), `run-${IDS[1]}`, IDS[1]!);
    expect(r).toMatchObject({ validated: false, ok: 10, first: 12, finOk: 3, percent: 83, nextCourseId: IDS[2] });
  });
  it('9 sur 12 dont 4 sur 5 : non validé (moins de 80 %)', () => {
    const r = runResult(foldProgress(run(IDS[1]!, 9, 4)), `run-${IDS[1]}`, IDS[1]!);
    expect(r.validated).toBe(false);
    expect(r.percent).toBe(75);
  });
  it('rattrapage 4 sur 5 : validé ; 3 sur 5 : non validé', () => {
    const mk = (okCount: number) => Array.from({ length: 5 }, (_, i) => ans(DAY, 'rat', 'rattrapage', IDS[1]!, i < okCount));
    expect(runResult(foldProgress(mk(4)), 'rat', IDS[1]!)).toMatchObject({ validated: true, ok: 4, first: 5, percent: 80, nextCourseId: IDS[2] });
    expect(runResult(foldProgress(mk(3)), 'rat', IDS[1]!)).toMatchObject({ validated: false, percent: 60 });
  });
  it('dernier cours validé : pas de cours suivant', () => {
    const last = IDS[7]!;
    expect(runResult(foldProgress(run(last, 12, 5)), `run-${last}`, last).nextCourseId).toBeNull();
  });
  it('activité inconnue : erreur', () => {
    expect(() => runResult(foldProgress([]), 'x', IDS[1]!)).toThrow();
  });
});

describe('reviewSummary', () => {
  it('étape B réussie : revient dans 1 semaine ; 1er raté : revient demain', () => {
    // course 1 at step B (index 1), course 2 at step A, both due on D
    const D = addDays(DAY, 2);
    const v = [...validation(DAY, IDS[1]!), ...validation(DAY, IDS[2]!)];
    const r1 = [...Array.from({ length: 3 }, () => ans(D, 'rev1', 'revision', IDS[1]!, true)), ...Array.from({ length: 3 }, () => ans(D, 'rev1', 'revision', IDS[2]!, true))];
    const D2 = addDays(D, 2);
    const r2 = [ans(D2, 'rev2', 'revision', IDS[1]!, true), ans(D2, 'rev2', 'revision', IDS[1]!, true), ans(D2, 'rev2', 'revision', IDS[1]!, true),
      ans(D2, 'rev2', 'revision', IDS[2]!, false), ans(D2, 'rev2', 'revision', IDS[2]!, true), ans(D2, 'rev2', 'revision', IDS[2]!, true)];
    const state = foldProgress([...v, ...r1, ...r2]);
    const s = reviewSummary(state, 'rev2', D2);
    expect(s.firstOk).toBe(5);
    expect(s.firstTotal).toBe(6);
    expect(s.lines).toHaveLength(2);
    expect(s.lines[0]).toMatchObject({ courseId: IDS[1], order: 1, ok: 3, total: 3, label: 'revient dans 1 semaine' });
    expect(s.lines[1]).toMatchObject({ courseId: IDS[2], ok: 2, total: 3, label: 'revient demain', nextReview: addDays(D2, 1) });
    expect(s.lines[0]!.title).toBeTruthy();
  });
  it('libellés : 2 jours, 1 mois', () => {
    const v = validation(DAY, IDS[1]!);
    const state = foldProgress([...v, ...Array.from({ length: 3 }, () => ans(addDays(DAY, 2), 'r', 'revision', IDS[1]!, true))]);
    expect(reviewSummary(state, 'r', addDays(DAY, 2)).lines[0]!.label).toBe('revient dans 2 jours'); // step B: 2 days
    const m = { ...state, courses: { ...state.courses, [IDS[1]!]: { ...state.courses[IDS[1]!]!, nextReview: addDays(DAY, 32) } } };
    expect(reviewSummary(m, 'r', addDays(DAY, 2)).lines[0]!.label).toBe('revient dans 1 mois');
  });
});
