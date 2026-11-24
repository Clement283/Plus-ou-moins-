import { describe, expect, it } from 'vitest';
import { isAnswerText, isNewClementQuestion } from '../src/questions';

const ok = { id: 'q1', courseId: 'c01', calc: '−2 + (−5)', given: '7', expected: '−7', correction: 'Même signe.', note: null, askedAt: 1790000000000 };

describe('isNewClementQuestion', () => {
  it('accepts a null note', () => expect(isNewClementQuestion(ok)).toBe(true));
  it('accepts a note of 500 characters', () => expect(isNewClementQuestion({ ...ok, note: 'a'.repeat(500) })).toBe(true));
  it('refuses a note of 501 characters', () => expect(isNewClementQuestion({ ...ok, note: 'a'.repeat(501) })).toBe(false));
  it('refuses an empty id', () => expect(isNewClementQuestion({ ...ok, id: '' })).toBe(false));
  it('refuses a missing field and non-objects', () => {
    expect(isNewClementQuestion({ ...ok, calc: undefined })).toBe(false);
    expect(isNewClementQuestion(null)).toBe(false);
  });
});

describe('isAnswerText', () => {
  it('refuses blank', () => expect(isAnswerText('  ')).toBe(false));
  it('refuses more than 2000 characters', () => expect(isAnswerText('a'.repeat(2001))).toBe(false));
  it('accepts text', () => expect(isAnswerText('Bien vu.')).toBe(true));
});
