import { describe, expect, it } from 'vitest';
import { isAppEvent } from '../src/events';

const base = { id: 'a1b2c3d4-0000-4000-8000-000000000000', userId: 'u1', at: 1790000000000, day: '2026-11-22' };
const answer = {
  ...base, kind: 'answer', activityId: 'act1', activity: 'entrainement', moduleId: 'relatifs', courseId: 'c1',
  level: 2, questionKind: 'saisie', prompt: '3 + (-2)', given: '1', expected: '1', correct: true,
  unfinished: false, errorType: null, errorFamily: null, attempt: 1, skipped: false, durationMs: 4200,
};
const part = { ...base, kind: 'lesson_part_done', activityId: 'act1', moduleId: 'relatifs', courseId: 'c1', partIndex: 0, durationMs: 1000 };
const end = { ...base, kind: 'activity_end', activityId: 'act1', activity: 'lecon', moduleId: 'relatifs', courseId: null, completed: true };

describe('isAppEvent valid', () => {
  it('accepts answer', () => expect(isAppEvent(answer)).toBe(true));
  it('accepts answer with error info', () =>
    expect(isAppEvent({ ...answer, correct: false, errorType: 'sign-flip', errorFamily: 'signe', attempt: 2 })).toBe(true));
  it('accepts lesson_part_done', () => expect(isAppEvent(part)).toBe(true));
  it('accepts activity_end with string or null courseId', () => {
    expect(isAppEvent(end)).toBe(true);
    expect(isAppEvent({ ...end, courseId: 'c1' })).toBe(true);
  });
});

describe('isAppEvent découverte', () => {
  it('accepts decouverte / choix', () =>
    expect(isAppEvent({ ...answer, activity: 'decouverte', questionKind: 'choix' })).toBe(true));
  it('accepts reecrire', () => expect(isAppEvent({ ...answer, questionKind: 'reecrire' })).toBe(true));
});

describe('isAppEvent invalid', () => {
  it.each([null, undefined, 42, 'x', [], {}, { kind: 'answer' }])('rejects %j', (x) => expect(isAppEvent(x)).toBe(false));
  it('rejects unknown kind', () => expect(isAppEvent({ ...base, kind: 'other' })).toBe(false));
  it('rejects bad common fields', () => {
    expect(isAppEvent({ ...answer, id: 3 })).toBe(false);
    expect(isAppEvent({ ...answer, userId: undefined })).toBe(false);
    expect(isAppEvent({ ...answer, at: '1' })).toBe(false);
    expect(isAppEvent({ ...answer, at: NaN })).toBe(false);
    expect(isAppEvent({ ...answer, day: '22/11/2026' })).toBe(false);
  });
  it('rejects bad enums', () => {
    expect(isAppEvent({ ...answer, activity: 'jeu' })).toBe(false);
    expect(isAppEvent({ ...answer, questionKind: 'dessin' })).toBe(false);
    expect(isAppEvent({ ...answer, errorFamily: 'autre2' })).toBe(false);
    expect(isAppEvent({ ...end, activity: 'x' })).toBe(false);
  });
  it('rejects bad level and attempt', () => {
    expect(isAppEvent({ ...answer, level: 4 })).toBe(false);
    expect(isAppEvent({ ...answer, level: 0 })).toBe(false);
    expect(isAppEvent({ ...answer, level: '1' })).toBe(false);
    expect(isAppEvent({ ...answer, attempt: 0 })).toBe(false);
    expect(isAppEvent({ ...answer, attempt: 1.5 })).toBe(false);
  });
  it('rejects bad types and nullables', () => {
    expect(isAppEvent({ ...answer, correct: 'true' })).toBe(false);
    expect(isAppEvent({ ...answer, errorType: 3 })).toBe(false);
    expect(isAppEvent({ ...answer, errorType: undefined })).toBe(false);
    expect(isAppEvent({ ...answer, durationMs: '5' })).toBe(false);
    expect(isAppEvent({ ...answer, durationMs: -1 })).toBe(false);
    expect(isAppEvent({ ...answer, courseId: null })).toBe(false);
    expect(isAppEvent({ ...part, partIndex: 1.2 })).toBe(false);
    expect(isAppEvent({ ...part, partIndex: -1 })).toBe(false);
    expect(isAppEvent({ ...end, completed: 1 })).toBe(false);
    expect(isAppEvent({ ...end, courseId: undefined })).toBe(false);
  });
});
