// Cours 0 — Bien écrire un calcul (doc 06). No numeric result: the exercise is a writing.
import type { QuestionKind } from '../../events';
import type { Answer, BuildCtx, Outcome, Question } from '../../exercises/types';
import { type Expr, type Op, evaluate, num, op, toLatex } from '../../math/expr';
import { rat } from '../../math/rational';
import { type Rng, pick, randInt, shuffle } from '../../rng';
import type { CourseDef, ErrorDef, Exercise, Explanation, Level } from '../types';
import { MODULE_ID, chance, exemple, explication, lecon, math, operands, redraw, signed, text } from './shared';

const ID = 'c00-bien-ecrire';
const RULE = "Un calcul s'écrit d'une seule façon correcte : il faut savoir le lire et l'écrire sans ambiguïté.";
const ALL_GOOD = 'Tout est bien écrit';

export type FaultType = 'signes-colles' | 'moins-apres' | 'parenthese';
export interface Fault {
  at: number;
  type: FaultType;
}

// ——— Writings as touchable pieces (LaTeX): numbers, signs, parentheses ———
// A fault turns the pieces it touches into one piece: « × − », « 3− », « (−2 × 4 ».

const ATOM = /\\times|\\div|\d+|[-+()=]/g;
const atoms = (piece: string): string[] => piece.match(ATOM) ?? [];
const isOp = (a: string | undefined): boolean => a === '+' || a === '-' || a === '\\times' || a === '\\div';
const isDigits = (a: string | undefined): boolean => a !== undefined && /^\d+$/.test(a);
const isNegative = (p: string | undefined): boolean => p !== undefined && /^-\d+$/.test(p);
const isNumber = (p: string | undefined): boolean => p !== undefined && /^-?\d+$/.test(p);

/** Pieces of a well-written LaTeX calculation: a − glued to a number at the start or after « ( » is its sign. */
export function toPieces(latex: string): string[] {
  const out: string[] = [];
  const as = atoms(latex);
  for (let i = 0; i < as.length; i++) {
    const a = as[i] as string;
    const prev = out[out.length - 1];
    if (a === '-' && isDigits(as[i + 1]) && (prev === undefined || prev === '(')) {
      out.push(`-${as[i + 1]}`);
      i++;
    } else out.push(a);
  }
  return out;
}

/** The whole writing in LaTeX. */
export function joinPieces(pieces: string[]): string {
  return pieces.reduce((s, p, i) => {
    if (i === 0) return p;
    const prev = pieces[i - 1] as string;
    const glued = prev.endsWith('(') || p.startsWith(')') || /\s-$/.test(prev);
    return glued ? s + p : `${s} ${p}`;
  }, '');
}

/** Every writing fault of a writing, by position. A well-written calculation has none. */
export function writingFaults(pieces: string[]): Fault[] {
  const faults: Fault[] = [];
  const open: number[] = [];
  pieces.forEach((piece, i) => {
    const as = atoms(piece);
    const prevLast = i > 0 ? atoms(pieces[i - 1] as string).at(-1) : undefined;
    if (as.length === 2 && isDigits(as[0]) && as[1] === '-') faults.push({ at: i, type: 'moins-apres' });
    else if (as.some((a, k) => k > 0 && isOp(a) && isOp(as[k - 1]))) faults.push({ at: i, type: 'signes-colles' });
    else if (isNegative(piece) && isOp(prevLast)) faults.push({ at: i - 1, type: 'signes-colles' });
    for (const a of as) {
      if (a === '(') open.push(i);
      else if (a === ')' && open.pop() === undefined) faults.push({ at: i, type: 'parenthese' });
    }
  });
  if (open.length > 0) faults.push({ at: open[0] as number, type: 'parenthese' });
  return faults.sort((x, y) => x.at - y.at);
}

/** A writing exercise. `expr` is the well-written calculation; `answer` is a placeholder (no numeric result). */
function writing(level: Level, expr: Expr, pieces: string[], fault: Fault | null): Exercise {
  return {
    courseId: ID,
    level,
    expr,
    answer: rat(0),
    meta: { tokens: pieces, faultAt: fault?.at ?? null, faultType: fault?.type ?? null },
  };
}

/** A writing exercise whose fault (if any) is read from the pieces. */
export const writingExercise = (expr: Expr, pieces: string[], level: Level): Exercise =>
  writing(level, expr, pieces, writingFaults(pieces)[0] ?? null);

const tokensOf = (ex: Exercise): string[] => ex.meta?.tokens as string[];
const faultAtOf = (ex: Exercise): number | null => ex.meta?.faultAt as number | null;
const faultTypeOf = (ex: Exercise): FaultType | null => ex.meta?.faultType as FaultType | null;

// ——— Faults applied to a well-written calculation ———

interface Variant extends Fault {
  pieces: string[];
}

function variants(p: string[]): Variant[] {
  const out: Variant[] = [];
  const depth: number[] = [];
  let d = 0;
  for (const piece of p) {
    depth.push(d);
    if (piece === '(') d++;
    if (piece === ')') d--;
  }
  p.forEach((piece, i) => {
    const wrapped = p[i - 1] === '(' && p[i + 1] === ')';
    if (isNegative(piece)) {
      // 4 × (−3) → 4 × −3
      if (wrapped && isOp(p[i - 2]))
        out.push({ type: 'signes-colles', at: i - 2, pieces: [...p.slice(0, i - 2), `${p[i - 2]} -`, piece.slice(1), ...p.slice(i + 2)] });
      // −3 → 3− (its parentheses go with it: (−3) → 3−)
      const s = wrapped ? i - 1 : i;
      out.push({ type: 'moins-apres', at: s, pieces: [...p.slice(0, s), `${piece.slice(1)}-`, ...p.slice(wrapped ? i + 2 : i + 1)] });
    }
    if (piece === '(' && depth[i] === 0) {
      // an outer parenthesis not closed: the piece runs from « ( » to the end
      const e = p.findIndex((q, k) => k > i && q === ')' && depth[k] === 1);
      out.push({ type: 'parenthese', at: i, pieces: [...p.slice(0, i), joinPieces([...p.slice(i, e), ...p.slice(e + 1)])] });
    }
    if (isNumber(piece) && depth[i] === 0)
      out.push({ type: 'parenthese', at: i + 1, pieces: [...p.slice(0, i + 1), ')', ...p.slice(i + 1)] });
  });
  return out;
}

// ——— Well-written calculations of each level (numbers 1 to 9, at least one negative) ———

const digit = (rng: Rng): number => signed(randInt(rng, 1, 9), chance(rng, 0.5));
const anyOp = (rng: Rng): Op => pick(rng, ['+', '-', '*', '/'] as Op[]);

/** a o b o c … with the usual priorities (× ÷ before + −), so that no grouping parenthesis is needed. */
function flat(items: (Expr | Op)[]): Expr {
  const sums: (Expr | Op)[] = [];
  let acc = items[0] as Expr;
  for (let k = 1; k < items.length; k += 2) {
    const o = items[k] as Op;
    const b = items[k + 1] as Expr;
    if (o === '*' || o === '/') acc = op(o, acc, b);
    else {
      sums.push(acc, o);
      acc = b;
    }
  }
  sums.push(acc);
  let e = sums[0] as Expr;
  for (let k = 1; k < sums.length; k += 2) e = op(sums[k] as Op, e, sums[k + 1] as Expr);
  return e;
}

function draft(level: Level, rng: Rng): Expr {
  const n = (): Expr => num(digit(rng));
  if (level === 1) return op(anyOp(rng), n(), n());
  if (level === 2) return flat([n(), anyOp(rng), n(), anyOp(rng), n()]);
  // level 3: three operations, one of them in parentheses, e.g. −6 − (−2) × (4 + (−1))
  const group = op(pick(rng, ['+', '-'] as Op[]), n(), n());
  const times = pick(rng, ['*', '/'] as Op[]);
  return chance(rng, 0.5)
    ? flat([n(), anyOp(rng), n(), times, group])
    : flat([group, times, n(), anyOp(rng), n()]);
}

function wellWritten(level: Level, rng: Rng): Expr {
  return redraw(
    () => draft(level, rng),
    (e) => {
      if (!operands(e).some((x) => x < 0)) return false;
      try {
        evaluate(e);
        return true;
      } catch {
        return false; // a division by a group worth 0
      }
    },
  );
}

const piecesOf = (e: Expr): string[] => toPieces(toLatex(e));

function generate(level: Level, rng: Rng): Exercise {
  const expr = wellWritten(level, rng);
  const p = piecesOf(expr);
  // 1 time in 5, everything is well written
  if (chance(rng, 0.2)) return writing(level, expr, p, null);
  const vs = variants(p);
  const type = pick(rng, [...new Set(vs.map((v) => v.type))]);
  const v = pick(rng, vs.filter((x) => x.type === type));
  return writing(level, expr, v.pieces, v);
}

/** A trap: a calculation of the level where `accept` finds a place for the fault. */
function trapWith(level: Level, rng: Rng, accept: (v: Variant, p: string[]) => boolean): Exercise {
  const [expr, vs] = redraw(
    () => {
      const e = wellWritten(level, rng);
      const p = piecesOf(e);
      return [e, variants(p).filter((v) => accept(v, p))] as const;
    },
    ([, list]) => list.length > 0,
  );
  const v = pick(rng, vs);
  return writing(level, expr, v.pieces, v);
}

// ——— Errors ———

const corrected = (ex: Exercise, rule: string): Explanation => ({
  rule,
  steps: [math(toLatex(ex.expr))],
});

function writingError(id: FaultType, explanation: string, trap: ErrorDef['trap']): ErrorDef {
  return {
    id,
    family: 'ecriture',
    detect: (ex) => faultTypeOf(ex) === id,
    explain: (ex) => corrected(ex, explanation),
    trap,
    wrongValues: () => [], // no numeric answer
  };
}

const errors: ErrorDef[] = [
  // a negative after × or ÷
  writingError('signes-colles', 'Deux signes ne se suivent jamais : 4 × (−3).', (level, rng) =>
    trapWith(level, rng, (v, p) => v.type === 'signes-colles' && (p[v.at] === '\\times' || p[v.at] === '\\div')),
  ),
  // a negative at the start
  writingError('moins-apres', "Le signe moins s'écrit avant le nombre : −3.", (level, rng) =>
    trapWith(level, rng, (v) => v.type === 'moins-apres' && v.at === 0),
  ),
  // with parentheses: one is not closed
  writingError('parenthese', 'Une parenthèse ouverte doit être fermée.', (level, rng) =>
    trapWith(level, rng, (v) => v.type === 'parenthese' && (v.pieces[v.at] as string).startsWith('(')),
  ),
];

const classOf = (ex: Exercise): string => (faultAtOf(ex) === null ? 'bien' : 'mal');
const CLASSES: CourseDef['classes'] = [
  { id: 'bien', label: 'Bien écrit', of: classOf },
  { id: 'mal', label: 'Mal écrit', of: classOf },
];

// ——— Questions: « Trouver l'erreur d'écriture », « Lequel est bien écrit ? », « Classer » ———

function customQuestion(kind: QuestionKind, ctx: BuildCtx): Question | null {
  const { rng, level } = ctx;
  if (kind === 'erreur') {
    const trap = errors.find((e) => e.id === ctx.trapErrorType);
    const ex = trap ? trap.trap(level, rng) : generate(level, rng);
    return { kind: 'erreur', ex, lines: tokensOf(ex), wrongLine: faultAtOf(ex), errorType: faultTypeOf(ex) };
  }
  if (kind === 'qcm') {
    // 4 writings of the same calculation, exactly one well written
    const [expr, wrong] = redraw(
      () => {
        const e = wellWritten(level, rng);
        const seen = new Set<string>();
        const chosen: Variant[] = [];
        // one per fault type first, then any other writing
        const vs = shuffle(rng, variants(piecesOf(e)));
        const ordered = [...vs.filter((v, i) => vs.findIndex((w) => w.type === v.type) === i), ...vs];
        for (const v of ordered) {
          const latex = joinPieces(v.pieces);
          if (chosen.length < 3 && !seen.has(latex)) {
            seen.add(latex);
            chosen.push(v);
          }
        }
        return [e, chosen] as const;
      },
      ([, chosen]) => chosen.length === 3,
    );
    const choices = shuffle(rng, [
      { value: rat(0), latex: toLatex(expr), errorType: null as string | null },
      ...wrong.map((v) => ({ value: rat(0), latex: joinPieces(v.pieces), errorType: v.type as string | null })),
    ]);
    return {
      kind: 'qcm',
      ex: writing(level, expr, piecesOf(expr), null),
      choices,
      correctIndex: choices.findIndex((c) => c.errorType === null),
      formula: 'debut',
    };
  }
  if (kind === 'classer') {
    const exs = redraw(
      () => Array.from({ length: 4 }, () => generate(level, rng)),
      // both boxes used, and 4 different writings (doc 04 §0: no duplicate)
      (list) => new Set(list.map(classOf)).size === 2 && new Set(list.map((e) => joinPieces(tokensOf(e)))).size === 4,
    );
    return { kind: 'classer', exs, classes: CLASSES.map(({ id, label }) => ({ id, label })), expected: exs.map(classOf) };
  }
  return null;
}

const outcome = (correct: boolean, errorType: string | null, given: string, expected: string): Outcome => ({
  correct,
  unfinished: false,
  errorType: correct ? null : errorType,
  errorFamily: correct ? null : 'ecriture',
  given,
  expected,
});

function customCheck(q: Question, a: Answer): Outcome | null {
  if (q.kind === 'erreur' && 'line' in a && q.ex.courseId === ID) {
    const show = (line: number | null): string => (line === null ? ALL_GOOD : (q.lines[line] ?? ''));
    // a fault not spotted → that fault; a fault « found » in a well-written calculation → relecture
    const errorType = q.wrongLine === null ? 'relecture' : q.errorType;
    return outcome(a.line === q.wrongLine, errorType, show(a.line), show(q.wrongLine));
  }
  if (q.kind === 'qcm' && 'choice' in a && q.ex.courseId === ID) {
    const chosen = q.choices[a.choice];
    const right = q.choices[q.correctIndex];
    return outcome(a.choice === q.correctIndex, chosen?.errorType ?? null, chosen?.latex ?? '', right?.latex ?? '');
  }
  if (q.kind === 'classer' && 'classes' in a && q.exs.every((e) => e.courseId === ID)) {
    const wrong = q.expected.findIndex((k, i) => a.classes[i] !== k);
    const ex = q.exs[wrong];
    const errorType = ex === undefined ? null : (faultTypeOf(ex) ?? 'relecture');
    return outcome(wrong === -1, errorType, a.classes.join(' · '), q.expected.join(' · '));
  }
  return null;
}

// ——— Lesson ———

const lessonWriting = (expr: Expr, ...pieces: string[]): Exercise => writingExercise(expr, pieces, 1);
const toClass = [
  lessonWriting(op('*', num(4), num(-3)), '4', '\\times', '(', '-3', ')'),
  lessonWriting(op('+', num(5), num(-2)), '5', '+ -', '2'),
  lessonWriting(op('+', num(-3), num(5)), '-3', '+', '5'),
  lessonWriting(op('+', num(-3), num(4)), '3-', '+', '4'),
];
const toFix = lessonWriting(op('-', num(7), num(-1)), '7', '- -', '1', '=', '8');

export const c00: CourseDef = {
  id: ID,
  moduleId: MODULE_ID,
  order: 0,
  title: 'Bien écrire un calcul',
  rule: RULE,
  parts: [
    explication(math('4 \\times -3'), { t: 'anim', name: 'signes-qui-se-cognent' }, math('4 \\times (-3)')),
    explication(
      text('**Deux signes ne se suivent jamais.** Après +, −, × ou ÷, un nombre négatif se met **entre parenthèses** : 4 × (−3), 5 + (−2), 7 − (−1).'),
      text('✓ 4 × (−3)'),
      text('✗ 4 × −3 · ✗ 5 + −2'),
    ),
    explication(text("**En tête d'un calcul, pas de parenthèses** pour un négatif : −3 + 5."), text('✓ −3 + 5')),
    explication(text("**Le signe − s'écrit avant le nombre** : −3, jamais 3−."), text('✓ −3'), text('✗ 3−')),
    explication(text('**Une parenthèse ouverte se ferme** : (−3), jamais (−3 tout seul.'), text('✓ (−3)'), text('✗ (−3')),
    lecon({
      kind: 'classer',
      exs: toClass,
      classes: CLASSES.map(({ id, label }) => ({ id, label })),
      expected: toClass.map(classOf),
    }),
    lecon({ kind: 'erreur', ex: toFix, lines: tokensOf(toFix), wrongLine: faultAtOf(toFix), errorType: faultTypeOf(toFix) }),
    exemple({
      kind: 'trou',
      ex: lessonWriting(op('*', num(6), num(-2)), '6', '\\times -', '2'),
      promptLatex: '6 \\times (\\square)',
      hidden: rat(-2),
    }),
    exemple({
      kind: 'trou',
      ex: lessonWriting(op('+', num(9), num(-4)), '9', '+ -', '4'),
      promptLatex: '9 + (\\square)',
      hidden: rat(-4),
    }),
  ],
  endExercises: { count: 5, kind: 'erreur' },
  generate,
  errors,
  generalExplanation: (ex) => corrected(ex, RULE),
  /** The calculation itself, cut into touchable pieces. */
  resolution: tokensOf,
  classes: CLASSES,
  expectInteger: true,
  customQuestion,
  customCheck,
};
