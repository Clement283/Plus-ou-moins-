import { rat, type Rational } from '../math/rational';

/**
 * Raw manual answer input (doc 03 §1–§3): every key writes exactly one
 * character where the cursor is, nothing is ever corrected automatically.
 * The only layout is the stacked fraction the student places herself.
 */

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type RawChar = Digit | '-' | '(' | ')';

export type RawToken = { t: 'c'; c: RawChar } | { t: 'frac'; num: RawToken[]; den: RawToken[] };

/**
 * Where the next character goes. The cursor is always at the end of its box;
 * fractions exist only at root level and the cursor can only be inside the
 * last root token, so 'num' / 'den' always refer to that fraction.
 */
export type CursorPath = 'root' | 'num' | 'den';

export type RawInput = { tokens: RawToken[]; cursor: CursorPath };

export type Key = `digit:${Digit}` | 'minus' | 'lpar' | 'rpar' | 'frac' | 'next' | 'back';

export type ReadResult =
  | { kind: 'value'; value: Rational; note: 'zero-signe' | 'zero-tete' | null }
  | { kind: 'unfinished' }
  | {
      kind: 'writing-error';
      errorType: 'moins-apres' | 'double-signe' | 'parenthese' | 'ecriture-invalide';
      divZero: boolean;
    };

/** Doc 03 §2: at most 12 characters (a fraction itself counts for none). */
export const MAX_RAW_CHARS = 12;

export const emptyRaw = (): RawInput => ({ tokens: [], cursor: 'root' });

const countChars = (tokens: readonly RawToken[]): number =>
  tokens.reduce((n, tok) => n + (tok.t === 'c' ? 1 : countChars(tok.num) + countChars(tok.den)), 0);

export const canSubmit = (input: RawInput): boolean => countChars(input.tokens) > 0;

type Frac = Extract<RawToken, { t: 'frac' }>;

/** The fraction the cursor is in (always the last root token), copied. */
function splitOpenFrac(input: RawInput): { before: RawToken[]; frac: Frac } | null {
  const last = input.tokens[input.tokens.length - 1];
  if (input.cursor === 'root' || last?.t !== 'frac') return null;
  return { before: input.tokens.slice(0, -1), frac: { t: 'frac', num: [...last.num], den: [...last.den] } };
}

function keyChar(key: Key): RawChar | null {
  if (key.startsWith('digit:')) return key.slice(6) as Digit;
  return key === 'minus' ? '-' : key === 'lpar' ? '(' : key === 'rpar' ? ')' : null;
}

export function pressKey(input: RawInput, key: Key): RawInput {
  const open = splitOpenFrac(input);
  const ch = keyChar(key);

  if (ch !== null) {
    if (countChars(input.tokens) >= MAX_RAW_CHARS) return input;
    const tok: RawToken = { t: 'c', c: ch };
    if (!open) return { tokens: [...input.tokens, tok], cursor: 'root' };
    open.frac[input.cursor === 'num' ? 'num' : 'den'].push(tok);
    return { tokens: [...open.before, open.frac], cursor: input.cursor };
  }

  switch (key) {
    case 'frac':
      if (open) return input; // no fraction inside a fraction
      return { tokens: [...input.tokens, { t: 'frac', num: [], den: [] }], cursor: 'num' };
    case 'next':
      if (!open) return input;
      return { tokens: input.tokens, cursor: input.cursor === 'num' ? 'den' : 'root' };
    default: // 'back'
      return back(input, open);
  }
}

function back(input: RawInput, open: ReturnType<typeof splitOpenFrac>): RawInput {
  if (open) {
    const box = input.cursor === 'num' ? open.frac.num : open.frac.den;
    if (box.length > 0) {
      box.pop();
      return { tokens: [...open.before, open.frac], cursor: input.cursor };
    }
    if (input.cursor === 'den') return { tokens: input.tokens, cursor: 'num' };
    return { tokens: open.before, cursor: 'root' }; // empty numerator: erase the fraction
  }
  const last = input.tokens[input.tokens.length - 1];
  if (!last) return input;
  if (last.t === 'c') return { tokens: input.tokens.slice(0, -1), cursor: 'root' };
  // Right after a fraction: go back into its denominator and erase its last character
  // (doc 03, example "▭/▭ 3 → 4 → ⌫" → "3 sur ▭, le 4 est effacé").
  return {
    tokens: [...input.tokens.slice(0, -1), { t: 'frac', num: last.num, den: last.den.slice(0, -1) }],
    cursor: 'den',
  };
}

const boxString = (tokens: readonly RawToken[]): string =>
  tokens.map((tok) => (tok.t === 'c' ? tok.c : `[${boxString(tok.num)}/${boxString(tok.den)}]`)).join('');

/** Canonical text for the journal: a fraction is written "[num/den]", e.g. "-[12/4]". */
export const rawToString = (input: RawInput): string => boxString(input.tokens);

const boxLatex = (tokens: readonly RawToken[]): string =>
  tokens.length === 0
    ? '\\square'
    : tokens.map((tok) => (tok.t === 'c' ? tok.c : `\\frac{${boxLatex(tok.num)}}{${boxLatex(tok.den)}}`)).join('');

/** "Copie" display: stacked fractions, an empty box as \square, no cursor. */
export const rawToLatex = (input: RawInput): string => (input.tokens.length === 0 ? '' : boxLatex(input.tokens));

// ---------------------------------------------------------------------------
// Reading (doc 03 §3)

type ErrorType = Extract<ReadResult, { kind: 'writing-error' }>['errorType'];
const writingError = (errorType: ErrorType, divZero = false): ReadResult => ({
  kind: 'writing-error',
  errorType,
  divZero,
});

/**
 * Error of a sequence that should be "-?" followed by one number, where 'F'
 * stands for a fraction and acts as a number. Checked in order: two
 * consecutive '-', a '-' after a number, anything else.
 */
function shapeError(shape: string): ErrorType {
  if (shape.includes('--')) return 'double-signe';
  if (/[\dF]-/.test(shape)) return 'moins-apres';
  return 'ecriture-invalide';
}

type Signed = { negative: boolean; digits: string };

/** A fraction box: "-?" then digits, nothing else. */
function readBox(tokens: readonly RawToken[]): Signed | ErrorType {
  const s = boxString(tokens);
  const m = /^(-?)(\d+)$/.exec(s);
  return m ? { negative: m[1] === '-', digits: m[2] as string } : shapeError(s);
}

export function readRaw(input: RawInput, expectInteger: boolean): ReadResult {
  // 1. Optional parentheses around the whole answer.
  let core = input.tokens;
  let parenMismatch = false;
  const isChar = (tok: RawToken | undefined, c: RawChar) => tok?.t === 'c' && tok.c === c;
  const opens = isChar(core[0], '(');
  const closes = core.length > (opens ? 1 : 0) && isChar(core[core.length - 1], ')');
  if (opens || closes) {
    core = core.slice(opens ? 1 : 0, closes ? -1 : undefined);
    parenMismatch = opens !== closes;
  }

  // 2. The core must be "-?" then digits, or "-?" then one fraction (no parenthesis left).
  const shape = core.map((tok) => (tok.t === 'c' ? tok.c : 'F')).join('');
  const m = /^(-?)(\d+|F)$/.exec(shape);
  if (!m) return writingError(shapeError(shape));
  const negative = m[1] === '-';

  const last = core[core.length - 1] as RawToken;
  if (last.t === 'c') {
    if (parenMismatch) return writingError('parenthese');
    const digits = m[2] as string;
    const n = Number(digits);
    const note = n === 0 && negative ? 'zero-signe' : digits.length > 1 && digits[0] === '0' ? 'zero-tete' : null;
    return { kind: 'value', value: rat(negative ? -n : n), note };
  }

  // 3. Fraction: each box well written, denominator not zero.
  const num = readBox(last.num);
  if (typeof num === 'string') return writingError(num);
  const den = readBox(last.den);
  if (typeof den === 'string') return writingError(den);
  const d = Number(den.digits);
  if (d === 0) return writingError('ecriture-invalide', true);
  if (parenMismatch) return writingError('parenthese');

  const sign = (negative ? -1 : 1) * (num.negative ? -1 : 1) * (den.negative ? -1 : 1);
  const value = rat(sign * Number(num.digits), d);
  if (expectInteger && value.d === 1) return { kind: 'unfinished' };
  return { kind: 'value', value, note: null };
}
