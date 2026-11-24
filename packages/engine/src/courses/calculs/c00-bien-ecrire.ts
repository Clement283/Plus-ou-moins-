// Cours 0 — Bien écrire un calcul (doc 06). No numeric result: the exercise is a writing.
import type { QuestionKind } from '../../events';
import type { Answer, BuildCtx, Outcome, Question } from '../../exercises/types';
import { type Expr, type Op, evaluate, num, op, toLatex } from '../../math/expr';
import { rat } from '../../math/rational';
import { type Rng, pick, randInt, shuffle } from '../../rng';
import { normalizeCalc } from '../../exercises/rewrite';
import type { CourseDef, ErrorDef, Exercise, Explanation, Level, LessonPart, Scene, SceneCalc, SceneToken } from '../types';
import { MODULE_ID, asking, choix, chance, decouverte, etapes, exemple, lecon, math, operands, redraw, signed, texted, toText } from './shared';

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

/**
 * « Toucher la faute » : the writing cut into boxes, one per symbol. A number is one box (the sign of a negative
 * is a box of its own), every sign and every parenthesis is a box. `accept` = the boxes of the fault: the two signs
 * that touch, the − after a number, the parenthesis without its pair (the « ( » not closed, or the « ) » in excess).
 */
export function atomize(pieces: string[], fault: Fault | null): { symbols: string[]; accept: number[] } {
  const symbols: string[] = [];
  const starts: number[] = [];
  for (const piece of pieces) {
    starts.push(symbols.length);
    symbols.push(...atoms(piece));
  }
  if (!fault) return { symbols, accept: [] };
  const from = starts[fault.at] ?? 0;
  const to = starts[fault.at + 1] ?? symbols.length;
  if (fault.type === 'moins-apres') return { symbols, accept: [to - 1] };
  if (fault.type === 'signes-colles') {
    // two signs together in the piece (« × − »), otherwise the sign that ends it and the − that starts the next piece
    for (let k = from + 1; k < to; k++) if (isOp(symbols[k - 1]) && isOp(symbols[k])) return { symbols, accept: [k - 1, k] };
    return { symbols, accept: [to - 1, to] };
  }
  const open: number[] = [];
  let extra: number | undefined;
  symbols.forEach((s, k) => {
    if (s === '(') open.push(k);
    else if (s === ')' && open.pop() === undefined) extra ??= k;
  });
  const lonely = extra ?? open[0];
  return { symbols, accept: lonely === undefined ? [] : [lonely] };
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
  // one type first (so the common fault types do not crowd out the others), then one of its variants
  const type = pick(rng, [...new Set(vs.map((x) => x.type))]);
  const v = pick(rng, vs.filter((x) => x.type === type));
  return writing(level, expr, v.pieces, v);
}

// ——— Errors ———

const corrected = (ex: Exercise, rule: string): Explanation => ({
  rule,
  steps: [math(toLatex(ex.expr))],
});

type ErrorId = FaultType | 'parentheses-en-tete';

function writingError(id: ErrorId, explanation: string, trap: ErrorDef['trap'], rule: NonNullable<ErrorDef['rule']>): ErrorDef {
  return {
    id,
    family: 'ecriture',
    detect: (ex) => faultTypeOf(ex) === id,
    explain: (ex) => corrected(ex, explanation),
    trap,
    wrongValues: () => [], // no numeric answer
    rule,
  };
}

// a negative at the start
const headNegative: ErrorDef['trap'] = (level, rng) => trapWith(level, rng, (v) => v.type === 'moins-apres' && v.at === 0);

/** Les 4 erreurs, dans l'ordre ; `rule.partIndex` = la partie de la leçon qui explique la règle (voir `parts`). */
const errors: ErrorDef[] = [
  // a negative after × or ÷
  writingError(
    'signes-colles',
    'Deux signes ne se suivent jamais : 4 × (−3).',
    (level, rng) => trapWith(level, rng, (v, p) => v.type === 'signes-colles' && (p[v.at] === '\\times' || p[v.at] === '\\div')),
    { n: 1, label: 'Deux signes qui se touchent', partIndex: 4 },
  ),
  // never made by the generator: only a typed answer (« Réécris ») can show it
  writingError('parentheses-en-tete', "En tête du calcul, on n'écrit pas de parenthèses : −3 + 4.", headNegative, {
    n: 2,
    label: 'Parenthèses inutiles en tête',
    partIndex: 7,
  }),
  writingError('moins-apres', "Le signe moins s'écrit avant le nombre : −3.", headNegative, { n: 3, label: 'Moins après le nombre', partIndex: 8 }),
  // with parentheses: one is not closed
  writingError(
    'parenthese',
    'Une parenthèse ouverte doit être fermée.',
    (level, rng) => trapWith(level, rng, (v) => v.type === 'parenthese' && (v.pieces[v.at] as string).startsWith('(')),
    { n: 4, label: 'Parenthèse non fermée', partIndex: 11 },
  ),
];

const classOf = (ex: Exercise): string => (faultAtOf(ex) === null ? 'bien' : 'mal');
const CLASSES: CourseDef['classes'] = [
  { id: 'bien', label: 'Bien écrit', of: classOf },
  { id: 'mal', label: 'Mal écrit', of: classOf },
];

// ——— Questions: « Toucher la faute », « Lequel est bien écrit ? », « Classer », « Quelle règle ? », « Réécris » ———

const FAULT_ORDER: FaultType[] = ['signes-colles', 'moins-apres', 'parenthese'];

/** The fault of an exercise (null when everything is well written). */
function faultOf(ex: Exercise): Fault | null {
  const at = faultAtOf(ex);
  const type = faultTypeOf(ex);
  return at === null || type === null ? null : { at, type };
}

/** A parenthesis not closed (not one too many): what « Quelle règle ? » calls « n'est pas fermée ». */
const unclosed = (v: Variant): boolean => v.type !== 'parenthese' || (v.pieces[v.at] as string).startsWith('(');

/** A badly written calculation of the level; the trap's one when there is a trap. */
function faultyWriting(level: Level, rng: Rng, trapErrorType: string | undefined, accept: (v: Variant) => boolean = () => true): Exercise {
  const trap = errors.find((e) => e.id === trapErrorType);
  return trap ? trap.trap(level, rng) : trapWith(level, rng, accept);
}

const RULE_OPTIONS = ['Deux signes se touchent', 'Le moins est après le nombre', "Une parenthèse n'est pas fermée"];
const RULE_SENTENCE = ['Deux signes se touchent.', 'Le − est écrit après le nombre.', "Une parenthèse n'est pas fermée."];
const RULE_PROBLEM = ['deux signes se touchent', 'un − est écrit après le nombre', "une parenthèse n'est pas fermée"];
const RULE_NOT_HERE = [
  'Ici, aucun signe ne touche un autre signe.',
  "Ici, aucun − n'est écrit après un nombre.",
  "Ici, aucune parenthèse n'est ouverte sans être fermée.",
];

/** « Quelle règle n'est pas respectée ? » on a generated writing with a fault. */
function ruleQuestion(level: Level, rng: Rng, trapErrorType: string | undefined): Question {
  const ex = faultyWriting(level, rng, trapErrorType, unclosed);
  const right = FAULT_ORDER.indexOf(faultTypeOf(ex) as FaultType);
  return choix(
    ex,
    "Ce calcul est mal écrit. Quelle règle n'est pas respectée ?",
    RULE_OPTIONS.map((label, i) => ({
      label,
      why: i === right ? `${RULE_SENTENCE[i]} Bien écrit : ${toText(ex.expr)}.` : `${RULE_NOT_HERE[i]} Le problème : ${RULE_PROBLEM[right]}.`,
    })),
    right,
    joinPieces(tokensOf(ex)),
  );
}

const REWRITE_STEPS: Record<FaultType, [string, string]> = {
  'signes-colles': ['Repère les deux signes qui se touchent.', 'Mets le nombre négatif entre parenthèses.'],
  'moins-apres': ['Repère le signe − écrit après le nombre.', 'Mets-le devant le nombre.'],
  parenthese: ["Repère la parenthèse qui n'a pas sa pareille.", 'Ajoute celle qui manque, ou retire celle qui est en trop.'],
};

/** « Réécris correctement » on a generated writing with a fault: she types the whole calculation. */
function rewriteQuestion(level: Level, rng: Rng, trapErrorType: string | undefined): Question {
  const ex = faultyWriting(level, rng, trapErrorType);
  const good = toText(ex.expr);
  return {
    kind: 'reecrire',
    ex,
    givenLatex: joinPieces(tokensOf(ex)),
    expected: normalizeCalc(good),
    specific: [],
    fallback: 'Garde le même calcul, et corrige seulement la faute.',
    steps: [...REWRITE_STEPS[faultTypeOf(ex) as FaultType], `Le calcul bien écrit : ${good}.`],
  };
}

function customQuestion(kind: QuestionKind, ctx: BuildCtx): Question | null {
  const { rng, level } = ctx;
  if (kind === 'erreur') {
    const trap = errors.find((e) => e.id === ctx.trapErrorType);
    const ex = trap ? trap.trap(level, rng) : generate(level, rng);
    const { symbols, accept } = atomize(tokensOf(ex), faultOf(ex));
    return {
      kind: 'erreur',
      ex,
      lines: symbols,
      wrongLine: accept[0] ?? null,
      errorType: faultTypeOf(ex),
      accept,
      shownLatex: joinPieces(tokensOf(ex)),
    };
  }
  if (kind === 'choix') return ruleQuestion(level, rng, ctx.trapErrorType);
  if (kind === 'reecrire') return rewriteQuestion(level, rng, ctx.trapErrorType);
  if (kind === 'qcm') {
    // 4 writings of the same calculation, exactly one well written; with a trap (doc 01 §5),
    // one of the wrong writings makes that very fault (« parentheses-en-tete » is never shown as a fault)
    const trap = FAULT_ORDER.find((t) => t === ctx.trapErrorType);
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
      ([, chosen]) => chosen.length === 3 && (trap === undefined || chosen.some((v) => v.type === trap)),
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
  errorFamily: correct ? null : errorType === null ? null : 'ecriture',
  given,
  expected,
});

// ——— « Réécris » : diagnostic d'une réponse tapée (normalisée, voir normalizeCalc) ———

const TYPED_ATOMS = /\d+|[+−×÷()=]/g;
const isTypedOp = (a: string | undefined): boolean => a === '+' || a === '−' || a === '×' || a === '÷';

/** The writing fault of a typed calculation, if any (the first one found: − after a number, signs together, parentheses). */
function typedFault(typed: string): FaultType | null {
  const a = typed.match(TYPED_ATOMS) ?? [];
  const afterNumber = a.some(
    (x, k) => x === '−' && /^\d+$/.test(a[k - 1] ?? '') && (k === a.length - 1 || ['+', '×', '÷', ')'].includes(a[k + 1] as string)),
  );
  if (afterNumber) return 'moins-apres';
  if (a.some((x, k) => k > 0 && isTypedOp(x) && isTypedOp(a[k - 1]))) return 'signes-colles';
  let depth = 0;
  for (const x of a) {
    if (x === '(') depth++;
    else if (x === ')' && --depth < 0) return 'parenthese';
  }
  return depth !== 0 ? 'parenthese' : null;
}

const TYPED_MESSAGE: Record<FaultType, string> = {
  'signes-colles': 'Deux signes ne se suivent jamais : mets le nombre négatif entre parenthèses.',
  'moins-apres': 'Le signe − se met avant le nombre.',
  parenthese: 'Les parenthèses vont toujours par deux : une qui ouvre, une qui ferme.',
};

type Rewrite = Extract<Question, { kind: 'reecrire' }>;

/** A wrong « Réécris correctement » answer on a generated writing; null when it is the right one. */
function rewriteOutcome(q: Rewrite, raw: string): Outcome | null {
  const given = normalizeCalc(raw);
  if (given === q.expected) return null;
  const withMessage = (o: Outcome, message: string): Outcome => ({ ...o, message });
  // the writing shown to her, retyped: the fault she was asked to correct
  const shown = normalizeCalc(q.givenLatex.replace(/\\times/g, '×').replace(/\\div/g, '÷'));
  const type = given === shown ? faultTypeOf(q.ex) : typedFault(given);
  if (type) return withMessage(outcome(false, type, given, q.expected), TYPED_MESSAGE[type]);
  // well written but with useless parentheses around a negative at the start
  const bare = given.replace(/^\(−(\d+)\)/, '−$1');
  if (bare !== given && bare === q.expected)
    return withMessage(outcome(false, 'parentheses-en-tete', given, q.expected), `En tête du calcul, on n'écrit pas de parenthèses : ${toText(q.ex.expr)}.`);
  return withMessage(outcome(false, null, given, q.expected), 'Garde les mêmes nombres.');
}

function customCheck(q: Question, a: Answer): Outcome | null {
  if (q.kind === 'erreur' && 'line' in a && q.ex.courseId === ID) {
    const show = (line: number | null): string => (line === null ? ALL_GOOD : (q.lines[line] ?? ''));
    // the boxes of the fault; none = everything is well written
    const accept = q.accept ?? (q.wrongLine === null ? [] : [q.wrongLine]);
    // a fault not spotted → that fault; a fault « found » in a well-written calculation → relecture
    const errorType = accept.length === 0 ? 'relecture' : q.errorType;
    const ok = a.line === null ? accept.length === 0 : accept.includes(a.line);
    return outcome(ok, errorType, show(a.line), show(accept[0] ?? null));
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
  // generated « Réécris correctement » (the guided examples carry their own answers: generic check)
  if (q.kind === 'reecrire' && 'text' in a && q.ex.courseId === ID && q.specific.length === 0) return rewriteOutcome(q, a.text);
  return null;
}

// ——— Lesson ———

const lessonWriting = (expr: Expr, ...pieces: string[]): Exercise => writingExercise(expr, pieces, 1);

/** Scene tokens: plain strings, or a highlighted piece (« regarde ici »), with its animation. */
const hl = (t: string, anim?: SceneToken['anim']): SceneToken => ({ t, hl: true, ...(anim ? { anim } : {}) });
const toks = (...parts: (string | SceneToken)[]): SceneToken[] => parts.map((p) => (typeof p === 'string' ? { t: p } : p));
const oneScene = (tokens: SceneToken[], extra: { label?: string; caption?: string } = {}): Scene => ({
  layout: 'one',
  calcs: [{ tokens, ...(extra.label ? { label: extra.label } : {}) }],
  ...(extra.caption ? { caption: extra.caption } : {}),
});
const badGood = (bad: SceneToken[], good: SceneToken[]): SceneCalc[] => [
  { tokens: bad, tag: 'mal écrit' },
  { tokens: good, tag: 'bien écrit' },
];
const M = '−';

const toClass = [
  lessonWriting(op('*', num(4), num(-3)), '4', '\\times', '(', '-3', ')'),
  lessonWriting(op('+', num(5), num(-2)), '5', '+ -', '2'),
  lessonWriting(op('+', num(-3), num(5)), '-3', '+', '5'),
  lessonWriting(op('+', num(-3), num(4)), '3-', '+', '4'),
];

/** Small question on a lesson writing: the calculation is its pieces, as written. */
const small = (ex: Exercise, prompt: string, options: [string, string][], correctIndex: number): Question =>
  choix(ex, prompt, options.map(([label, why]) => ({ label, why })), correctIndex, joinPieces(tokensOf(ex)));
/** The same, with no calculation shown. */
const smallPlain = (ex: Exercise, prompt: string, options: [string, string][], correctIndex: number): Question =>
  choix(ex, prompt, options.map(([label, why]) => ({ label, why })), correctIndex);

const YES_NO = (yes: string, no: string): [string, string][] => [['Oui', yes], ['Non', no]];

// « Réécris 6 × −2 » and « Réécris 3− + 4 » (doc 06, tableau « Retours d'erreur précis »)
const answerOf = (answer: string, message: string, errorType: string | null = null): Rewrite['specific'][number] => ({
  answer: normalizeCalc(answer),
  message,
  errorType,
  correct: false,
});
const rewriteEx = (ex: Exercise, expected: string, specific: Rewrite['specific'], fallback: string, steps: string[]): Rewrite => ({
  kind: 'reecrire',
  ex,
  givenLatex: joinPieces(tokensOf(ex)),
  expected: normalizeCalc(expected),
  specific,
  fallback,
  steps,
});

const REWRITE_TIMES = lessonWriting(op('*', num(6), num(-2)), '6', '\\times -', '2');
const REWRITE_HEAD = lessonWriting(op('+', num(-3), num(4)), '3-', '+', '4');
const NUMBER_CHANGED = "L'écriture est bonne, mais le nombre a changé. Garde −2.";

const rewriteTimes = rewriteEx(
  REWRITE_TIMES,
  '6×(−2)',
  [
    answerOf('6×−2', 'Le × et le − se touchent encore. Mets −2 entre parenthèses.', 'signes-colles'),
    answerOf('6×(−2', 'La parenthèse ouverte doit se fermer.', 'parenthese'),
    answerOf('6×(2−)', 'Le signe − se met avant le 2.', 'moins-apres'),
    answerOf('6×2−', 'Le signe − se met avant le 2.', 'moins-apres'),
    answerOf('(6×−2)', 'Les parenthèses doivent entourer le nombre négatif, pas tout le calcul.', 'signes-colles'),
    // 6 × (−n), n ≠ 2: the writing is right, the number changed
    ...Array.from({ length: 99 }, (_, i) => i + 1)
      .filter((n) => n !== 2)
      .map((n) => answerOf(`6×(−${n})`, NUMBER_CHANGED)),
  ],
  'Garde le même calcul, et mets le nombre négatif entre parenthèses.',
  ['Repère les deux signes qui se touchent : × et −.', 'Mets le nombre négatif entre parenthèses : (−2).', 'Le calcul bien écrit : 6 × (−2).'],
);

const rewriteHead = rewriteEx(
  REWRITE_HEAD,
  '−3+4',
  [
    // « (−3) + 4 » counts as a fault in this course (doc 08 n° 25)
    answerOf('(−3)+4', "Pas tout à fait. En tête du calcul, on n'écrit pas de parenthèses : −3 + 4.", 'parentheses-en-tete'),
    answerOf('3−+4', 'Le − est toujours après le 3. Il doit aller devant.', 'moins-apres'),
    answerOf('3+4', 'Le 3 est négatif : garde son signe −, devant le nombre.'),
    answerOf('+3+4', 'Le 3 est négatif : garde son signe −, devant le nombre.'),
  ],
  'Garde les mêmes nombres. Le signe − va devant le 3.',
  ['Le signe − est après le 3 : il doit aller devant.', 'Le nombre négatif est en tête du calcul : pas besoin de parenthèses.', 'Le calcul bien écrit : −3 + 4.'],
);

const REWRITE_CONSIGNE = 'Ce calcul est mal écrit. Réécris-le correctement.';
const CLASSER_CONSIGNE = "Fais glisser chaque calcul du bas de l'écran vers la bonne case. Tu peux aussi toucher un calcul, puis toucher la case.";

const parts: LessonPart[] = [
  // 0 — Accroche + deviner (ne compte pas)
  texted(
    decouverte(
      small(
        lessonWriting(op('*', num(4), num(-3)), '4', '\\times -', '3'),
        'Pour commencer, à ton avis : ce calcul est-il bien écrit ?',
        YES_NO(
          "Il est mal écrit. Ce n'est pas grave de ne pas le savoir encore : c'est justement ce que ce cours explique.",
          'Il lui manque quelque chose. Tu vas voir quoi, et surtout pourquoi.',
        ),
        1,
      ),
    ),
    {
      title: 'Bien écrire un calcul',
      intro: [
        "En maths, un calcul doit se lire **d'une seule façon**. S'il est mal écrit, on peut se tromper même en connaissant la méthode.",
        "Dans ce cours, tu vas apprendre **4 règles d'écriture**.",
      ],
    },
  ),
  // 1 — Le signe − a deux rôles
  etapes(`Le signe ${M} a deux rôles`, [
    {
      scene: oneScene(toks(M), { caption: 'Le même petit trait, deux sens différents.' }),
      text: 'Avant les règles, une chose à savoir sur le signe moins.',
    },
    {
      scene: {
        layout: 'row',
        calcs: [{ tokens: toks('7 ', hl(M, 'pin'), ' 3'), label: 'soustraire' }, { tokens: [{ t: `${M}3`, dim: true }] }],
      },
      text: `**Rôle 1 : soustraire.** Le ${M} est entre deux nombres : on enlève 3 à 7.`,
    },
    {
      scene: {
        layout: 'row',
        calcs: [
          { tokens: toks('7 ', hl(M), ' 3'), label: 'soustraire' },
          { tokens: toks(hl(M, 'pin'), '3'), label: 'signe du nombre' },
        ],
      },
      text: `**Rôle 2 : dire qu'un nombre est négatif.** Le signe fait partie du nombre : ${M}3 se lit « moins trois ».`,
    },
    { text: `Quand tu lis un calcul, tu dois toujours savoir **quel rôle joue chaque ${M}**. Les 4 règles de ce cours servent à ça.` },
  ]),
  // 2, 3 — Quel rôle ? (2 petites questions sur le même écran)
  lecon(
    small(
      lessonWriting(op('-', num(8), num(5)), '8', '-', '5'),
      `Dans ce calcul, à quoi sert le ${M} ?`,
      [
        ['À soustraire', 'On enlève 5 à 8.'],
        ['À dire que 5 est négatif', `Ici le ${M} est entre deux nombres : on enlève 5 à 8. C'est une soustraction.`],
      ],
      0,
    ),
  ),
  texted(
    lecon(
      small(
        lessonWriting(op('+', num(-6), num(2)), '-6', '+', '2'),
        `Et ici, à quoi sert le ${M} ?`,
        [
          ['À soustraire', `Il n'y a rien avant le ${M} : on ne peut rien soustraire. C'est le signe du nombre ${M}6.`],
          ['À dire que 6 est négatif', `${M}6, c'est « moins six ». Le signe fait partie du nombre.`],
        ],
        1,
      ),
    ),
    { joinPrevious: true },
  ),
  // 4 — Règle 1
  etapes('Quand deux signes se touchent', [
    { scene: oneScene(toks(`4 × ${M}3`), { caption: 'Le calcul du début' }), text: 'Reprenons le calcul du début.' },
    {
      scene: oneScene(toks('4 ', hl(`× ${M}`, 'bump'), '3'), { label: 'deux signes collés' }),
      text: `Le **×** et le **${M}** sont collés : **deux signes se touchent**.`,
    },
    {
      scene: oneScene(toks('4 ', hl('×'), ' ', hl(M, 'bump'), '3'), { caption: `Ce ${M}, il soustrait ? Ou c'est le signe du 3 ?` }),
      text: `On ne voit plus bien le rôle du ${M}. Est-ce qu'il soustrait ? Est-ce qu'il donne le signe de 3 ?`,
    },
    {
      scene: oneScene(toks('4 × ', hl('(', 'pin'), `${M}3`, hl(')', 'pin')), { label: `${M}3 est un seul nombre` }),
      text: `Solution : on met le nombre négatif **entre parenthèses**. Elles montrent que ${M}3 est un seul nombre.`,
    },
    { rule: { n: 1, text: `**Deux signes ne se suivent jamais.** Après +, ${M}, × ou ÷, un nombre négatif se met entre parenthèses.` } },
  ]),
  // 5 — Règle 1, exemples
  etapes('Avec toutes les opérations', [
    {
      scene: { layout: 'pairs', calcs: badGood(toks(`5 + ${M}2`), toks('5 + ', hl('('), `${M}2`, hl(')'))) },
      text: `La règle 1 marche après +, ${M}, × et ÷. Après un **+** :`,
    },
    {
      scene: {
        layout: 'pairs',
        calcs: [
          ...badGood(toks(`5 + ${M}2`), toks('5 + ', hl('('), `${M}2`, hl(')'))),
          ...badGood(toks(`7 ${M} ${M}1`), toks(`7 ${M} `, hl('('), `${M}1`, hl(')'))),
        ],
      },
      text: `Après un **${M}** :`,
    },
    {
      scene: {
        layout: 'pairs',
        calcs: [
          ...badGood(toks(`5 + ${M}2`), toks('5 + ', hl('('), `${M}2`, hl(')'))),
          ...badGood(toks(`7 ${M} ${M}1`), toks(`7 ${M} `, hl('('), `${M}1`, hl(')'))),
          ...badGood(toks(`8 ÷ ${M}4`), toks('8 ÷ ', hl('('), `${M}4`, hl(')'))),
        ],
      },
      text: 'Après un **÷** :',
    },
    { text: 'À chaque fois, on ajoute deux parenthèses autour du nombre négatif. **Le nombre ne change pas**, le résultat non plus.' },
  ]),
  // 6 — Règle 1, à toi
  lecon(
    small(
      lessonWriting(op('+', num(5), num(-2)), '5', '+ -', '2'),
      'Comment écrire correctement ce calcul ?',
      [
        [`(5 + ${M}2)`, `Les parenthèses doivent entourer le nombre négatif, pas tout le calcul. Ici + et ${M} se touchent encore.`],
        [`5 + (${M}2)`, `Les parenthèses entourent le nombre négatif ${M}2. Le + et le ${M} ne se touchent plus.`],
        [`5 (+ ${M}2)`, `Le + est une opération : il reste en dehors. Seul le nombre négatif ${M}2 va entre parenthèses.`],
      ],
      1,
    ),
  ),
  // 7 — Règle 2 : deviner puis expliquer (ne compte pas)
  texted(
    decouverte(
      small(
        lessonWriting(op('+', num(-3), num(5)), '-3', '+', '5'),
        `Ce calcul commence par un nombre négatif. Faut-il des parenthèses autour de ${M}3 ?`,
        YES_NO(
          `Regarde devant ${M}3 : il n'y a aucun signe. Rien ne se touche, donc pas besoin de parenthèses.`,
          `Devant ${M}3, il n'y a aucun signe. Rien ne se touche, donc pas besoin de parenthèses.`,
        ),
        1,
      ),
    ),
    {
      title: 'Et au début du calcul ?',
      outroRule: { n: 2, text: "**En tête d'un calcul, pas de parenthèses** pour un nombre négatif." },
      outro: ['(−3) + 5 : pas faux, mais inutile'],
    },
  ),
  // 8 — Règle 3
  etapes(`Le moins se met avant le nombre`, [
    { scene: oneScene(toks(`3${M} + 4`)), text: 'Regarde ce calcul.' },
    {
      scene: oneScene(toks('3', hl(M, 'bump'), ' + 4'), { label: `le ${M} est après le 3` }),
      text: `Ici, le ${M} est écrit **après** le 3.`,
    },
    {
      scene: oneScene(toks('3', hl(M), ' ', hl('+', 'bump'), ' 4'), { caption: 'Soustraire quoi ? Juste après, il y a un +.' }),
      text: "On croit qu'on va soustraire quelque chose au 3. Mais juste après, il y a un + : il n'y a rien à soustraire.",
    },
    {
      scene: oneScene(toks(hl(M, 'slide'), '3 + 4'), { label: `le ${M} passe devant` }),
      text: "Le signe d'un nombre négatif s'écrit **devant** le nombre.",
    },
    { rule: { n: 3, text: `**Le signe ${M} d'un nombre négatif s'écrit toujours avant le nombre :** ${M}3, jamais 3${M}.` } },
  ]),
  // 9, 10 — Avant ou après ? (2 petites questions sur le même écran)
  lecon(
    smallPlain(
      lessonWriting(num(-7), '-7'),
      `Le signe ${M} d'un nombre négatif se met…`,
      [
        ['avant le nombre', `On écrit ${M}7, « moins sept ».`],
        ['après le nombre', `Le signe se met devant : ${M}7. Écrit après, on croirait une soustraction.`],
      ],
      0,
    ),
  ),
  texted(
    lecon(
      smallPlain(
        lessonWriting(num(-7), '-7'),
        'Lequel est bien écrit ?',
        [
          [`7${M}`, `Le signe se met devant : ${M}7. Écrit après, on croirait une soustraction.`],
          [`${M}7`, 'Le signe est devant le nombre.'],
        ],
        1,
      ),
    ),
    { joinPrevious: true },
  ),
  // 11 — Règle 4
  etapes('Une parenthèse ouverte se ferme', [
    { scene: oneScene(toks(`4 × (${M}3`)), text: 'Regarde ce calcul.' },
    {
      scene: oneScene(toks('4 × ', hl('(', 'bump'), `${M}3`), { label: "elle s'ouvre ici" }),
      text: "Une parenthèse s'ouvre ici…",
    },
    {
      scene: oneScene(toks('4 × ', hl('('), `${M}3 `, { t: '?', hl: true, anim: 'bump', dim: true }), { caption: "Où s'arrête le nombre ?" }),
      text: "… mais elle ne se ferme jamais. On ne sait pas où le nombre s'arrête.",
    },
    {
      scene: oneScene(toks('4 × ', hl('('), `${M}3`, hl(')', 'pin')), { label: 'une qui ouvre, une qui ferme' }),
      text: 'Les parenthèses vont toujours **par deux**, comme des guillemets.',
    },
    { rule: { n: 4, text: '**Une parenthèse ouverte doit toujours être fermée.**' } },
  ]),
  // 12 — Que manque-t-il ?
  lecon(
    small(
      lessonWriting(op('*', num(4), num(-3)), '4', '\\times', '(-3'),
      'Que manque-t-il à ce calcul ?',
      [
        ['(', 'Une parenthèse est déjà ouverte. Il manque celle qui la ferme : « ) ».'],
        [')', `La parenthèse ouverte est maintenant fermée : 4 × (${M}3).`],
        [M, `Le ${M} est déjà là, devant le 3. Il manque la parenthèse qui ferme : « ) ».`],
      ],
      1,
    ),
  ),
  // 13 — Récapitulatif
  etapes('Les 4 règles à retenir', [
    {
      recap: [
        { title: '1. Deux signes ne se suivent jamais.', ok: `4 × (${M}3)`, ko: `4 × ${M}3` },
        { title: '2. En tête, pas de parenthèses.', ok: `${M}3 + 5`, ko: `(${M}3) + 5`, koLabel: 'pas faux, mais inutile' },
        { title: `3. Le ${M} se met avant le nombre.`, ok: `${M}3`, ko: `3${M}` },
        { title: '4. Une parenthèse ouverte se ferme.', ok: `(${M}3)`, ko: `(${M}3` },
      ],
      text: "Maintenant, à toi de les utiliser.",
    },
  ]),
  // 14 — Classer en glisser-déposer
  asking(
    CLASSER_CONSIGNE,
    lecon({
      kind: 'classer',
      exs: toClass,
      classes: CLASSES.map(({ id, label }) => ({ id, label })),
      expected: toClass.map(classOf),
    }),
  ),
  // 15 — Quelle règle ? (le calcul corrigé apparaît après la réponse)
  texted(
    lecon(
      small(
        lessonWriting(op('-', num(7), num(-1)), '7', '- -', '1', '=', '8'),
        "Ce calcul est mal écrit. Quelle règle n'est pas respectée ?",
        [
          [RULE_OPTIONS[0] as string, `Le ${M} de la soustraction et le ${M} de ${M}1 se touchent.`],
          [RULE_OPTIONS[1] as string, `Le ${M} de ${M}1 est bien devant le 1. Le problème : deux ${M} se touchent.`],
          [RULE_OPTIONS[2] as string, `Il n'y a aucune parenthèse ici. Le problème : deux ${M} se touchent.`],
        ],
        0,
      ),
    ),
    { outro: [`On le corrige : 7 ${M} (${M}1) = 8`] },
  ),
  // 16, 17 — Exemples guidés
  asking(REWRITE_CONSIGNE, exemple(rewriteTimes)),
  asking(REWRITE_CONSIGNE, exemple(rewriteHead)),
  // 18 — Annonce des exercices de fin
  etapes('Place aux 5 exercices de fin', [
    { text: "Cette fois, **pas d'aide**. Ils ressemblent à ce que tu verras en contrôle." },
    { text: 'Pour valider le cours, il faut : au moins **4 exercices de fin justes sur 5** ; et **80 % de bonnes réponses** sur tout le cours.' },
    { text: "Si tu n'y arrives pas, ce n'est pas grave : tu feras une **série de validation**. Ce sont 5 exercices, sans refaire la leçon." },
  ]),
];

export const c00: CourseDef = {
  id: ID,
  moduleId: MODULE_ID,
  order: 0,
  title: 'Bien écrire un calcul',
  shortTitle: 'Bien écrire',
  rule: RULE,
  parts,
  lessonLength: 14,
  endExercises: { count: 5, kind: 'erreur' },
  generate,
  errors,
  generalExplanation: (ex) => corrected(ex, RULE),
  /** The calculation itself, cut into touchable boxes (one per symbol). */
  resolution: (ex) => atomize(tokensOf(ex), faultOf(ex)).symbols,
  classes: CLASSES,
  expectInteger: true,
  customQuestion,
  customCheck,
};
