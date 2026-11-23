// Test helpers for the exercise tests.
import { type Key, type RawInput, emptyRaw, pressKey } from '../../src/input/raw';
import { getCourse } from '../../src/courses';
import type { CourseDef } from '../../src/courses/types';

/** Keys typed one by one: digits, '-' / '−', '(', ')'; '/' starts a fraction and '>' is « → ». */
export function typed(keys: string): RawInput {
  const map: Record<string, Key> = { '-': 'minus', '−': 'minus', '(': 'lpar', ')': 'rpar', '/': 'frac', '>': 'next' };
  return [...keys].reduce(
    (input, ch) => pressKey(input, /\d/.test(ch) ? (`digit:${ch}` as Key) : (map[ch] as Key)),
    emptyRaw(),
  );
}

export const C = (n: number): CourseDef =>
  getCourse(
    [
      'c00-bien-ecrire',
      'c01-additionner-meme-signe',
      'c02-additionner-signes-contraires',
      'c03-additionner-plusieurs',
      'c04-soustraire',
      'c05-multiplier-deux',
      'c06-diviser-deux',
      'c07-multiplier-plusieurs',
    ][n] as string,
  );

export const RELATIFS = [1, 2, 3, 4, 5, 6, 7];
