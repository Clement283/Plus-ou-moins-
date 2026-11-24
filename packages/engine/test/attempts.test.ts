import { describe, expect, it } from 'vitest';
import type { Activity, AppEvent } from '../src/events';
import { foldProgress } from '../src/srs';
import { lastAttempt, runErrors } from '../src/attempts';

const C0 = 'c00-bien-ecrire';
let seq = 0;

function ans(o: {
  activityId: string;
  activity: Activity;
  correct: boolean;
  errorType?: string | null;
  attempt?: number;
  skipped?: boolean;
  unfinished?: boolean;
}): AppEvent {
  const id = `a${String(++seq).padStart(5, '0')}`;
  return {
    id, userId: 'u1', at: 1_700_000_000_000 + seq * 1000, day: '2026-11-24', kind: 'answer',
    activityId: o.activityId, activity: o.activity, moduleId: 'calculs', courseId: C0,
    level: 1, questionKind: 'saisie', prompt: `q-${id}`, given: '', expected: '', correct: o.correct,
    unfinished: o.unfinished ?? false,
    errorType: o.errorType !== undefined ? o.errorType : o.correct ? null : 'autre',
    errorFamily: o.correct ? null : 'autre', attempt: o.attempt ?? 1, skipped: o.skipped ?? false, durationMs: 1000,
  };
}
const end = (activityId: string, activity: Activity): AppEvent => ({
  id: `a${String(++seq).padStart(5, '0')}`, userId: 'u1', at: 1_700_000_000_000 + seq * 1000, day: '2026-11-24',
  kind: 'activity_end', activityId, activity, moduleId: 'calculs', courseId: C0, completed: true,
});
const wrong = (activityId: string, activity: Activity, errorType: string | null) => ans({ activityId, activity, correct: false, errorType });
const right = (activityId: string, activity: Activity) => ans({ activityId, activity, correct: true });

describe('runErrors', () => {
  it('ignore une petite question choix ratée (errorType null) : pas de « Autre erreur »', () => {
    const A = 'run2';
    const choixKo = { ...(wrong(A, 'lecon', null) as object), questionKind: 'choix' } as AppEvent;
    const evts = [choixKo, wrong(A, 'fin', 'parenthese'), wrong(A, 'fin', null)];
    expect(runErrors(evts, A, C0)).toEqual([
      { errorType: 'parenthese', label: 'Parenthèse non fermée', rule: 4, partIndex: 6, count: 1 },
      { errorType: 'autre', label: 'Autre erreur', rule: null, partIndex: null, count: 1 },
    ]);
  });

  it('groups first wrong answers by type, most frequent first', () => {
    const A = 'run1';
    const evts = [
      wrong(A, 'lecon', 'parenthese'),
      wrong(A, 'fin', 'signes-colles'),
      wrong(A, 'fin', 'signes-colles'),
      wrong(A, 'exemple', 'signes-colles'),
      ans({ activityId: A, activity: 'fin', correct: false, errorType: 'signes-colles', attempt: 2 }),
      right(A, 'fin'),
      wrong('other', 'fin', 'moins-apres'),
    ];
    expect(runErrors(evts, A, C0)).toEqual([
      { errorType: 'signes-colles', label: 'Deux signes qui se touchent', rule: 1, partIndex: 2, count: 3 },
      { errorType: 'parenthese', label: 'Parenthèse non fermée', rule: 4, partIndex: 6, count: 1 },
    ]);
  });
  it('ties follow the course error order; null/unknown types become « Autre erreur »', () => {
    const A = 'run2';
    const evts = [wrong(A, 'fin', 'autre'), wrong(A, 'fin', null), wrong(A, 'fin', 'parenthese'), wrong(A, 'fin', 'moins-apres')];
    expect(runErrors(evts, A, C0).map((l) => [l.errorType, l.count])).toEqual([
      ['autre', 2],
      ['moins-apres', 1],
      ['parenthese', 1],
    ]);
    expect(runErrors(evts, A, C0)[0]).toMatchObject({ label: 'Autre erreur', rule: null, partIndex: null });
  });
  it('ignores decouverte, skipped and unfinished answers', () => {
    const A = 'run3';
    const evts = [
      wrong(A, 'decouverte', 'parenthese'),
      ans({ activityId: A, activity: 'fin', correct: false, errorType: null, skipped: true }),
      ans({ activityId: A, activity: 'fin', correct: false, errorType: 'parenthese', unfinished: true }),
    ];
    expect(runErrors(evts, A, C0)).toEqual([]);
  });
});

describe('lastAttempt', () => {
  const fin = (id: string, good: number, errorType = 'signes-colles'): AppEvent[] => [
    ...Array.from({ length: 5 }, (_, i) => (i < good ? right(id, 'fin') : wrong(id, 'fin', errorType))),
    end(id, 'fin'),
  ];
  const ratt = (id: string, good: number, errorType = 'parenthese'): AppEvent[] => [
    ...Array.from({ length: 5 }, (_, i) => (i < good ? right(id, 'rattrapage') : wrong(id, 'rattrapage', errorType))),
    end(id, 'rattrapage'),
  ];
  const lesson = (id: string) => Array.from({ length: 7 }, () => right(id, 'lecon'));

  it('is null for a validated course and a never-tried course', () => {
    const ok = [...lesson('r'), ...fin('r', 5)];
    expect(lastAttempt(foldProgress(ok), ok, C0)).toBeNull();
    expect(lastAttempt(foldProgress([]), [], C0)).toBeNull();
  });
  it('reports the course run when it failed', () => {
    const evts = [...lesson('r'), ...fin('r', 2)];
    expect(lastAttempt(foldProgress(evts), evts, C0)).toEqual({
      kind: 'cours', finOk: 2, fin: 5,
      top: { errorType: 'signes-colles', label: 'Deux signes qui se touchent', rule: 1, partIndex: 2, count: 3 },
    });
  });
  it('takes the last attempt: a failed rattrapage after a failed course', () => {
    const evts = [...lesson('r'), ...fin('r', 2), ...ratt('t', 3)];
    const s = foldProgress(evts);
    expect(s.courses[C0]!.status).toBe('a-rattraper');
    expect(lastAttempt(s, evts, C0)).toMatchObject({ kind: 'rattrapage', finOk: 3, fin: 5, top: { errorType: 'parenthese', count: 2 } });
  });
  it('top is null when the failed attempt has no named error', () => {
    const evts = [
      ...lesson('r'),
      ...Array.from({ length: 5 }, () => ans({ activityId: 'r', activity: 'fin', correct: false, errorType: null, skipped: true })),
      end('r', 'fin'),
    ];
    expect(lastAttempt(foldProgress(evts), evts, C0)).toMatchObject({ kind: 'cours', finOk: 0, fin: 5, top: null });
  });
});
