// Cours 0 — Bien écrire un calcul (doc 06). No numeric result: the exercise is a writing.
import type { QuestionKind } from '../../events';
import type { Answer, BuildCtx, Outcome, Question } from '../../exercises/types';
import { type Expr, type Op, evaluate, num, op, toLatex } from '../../math/expr';
import { rat } from '../../math/rational';
import { type Rng, pick, randInt, shuffle } from '../../rng';
import { normalizeCalc } from '../../exercises/rewrite';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, Explanation, Level, LessonPart, Scene, SceneToken, StepFault } from '../types';
import { MODULE_ID, asking, choix, smallChoix, chance, decouverte, etapes, exemple, lecon, math, operands, redraw, signed, texted, toText } from './shared';

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
    { n: 1, label: 'Deux signes qui se touchent', partIndex: 2 },
  ),
  // never made by the generator: only a typed answer (« Réécris ») can show it
  writingError('parentheses-en-tete', "En tête du calcul, on n'écrit pas de parenthèses : −3 + 4.", headNegative, {
    n: 2,
    label: 'Parenthèses inutiles en tête',
    partIndex: 4,
  }),
  writingError('moins-apres', "Le signe moins s'écrit avant le nombre : −3.", headNegative, { n: 3, label: 'Moins après le nombre', partIndex: 5 }),
  // with parentheses: one is not closed
  writingError(
    'parenthese',
    'Une parenthèse ouverte doit être fermée.',
    (level, rng) => trapWith(level, rng, (v) => v.type === 'parenthese' && (v.pieces[v.at] as string).startsWith('(')),
    { n: 4, label: 'Parenthèse non fermée', partIndex: 6 },
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

// ——— Lesson (doc 06, Cours 0 v3) ———

const lessonWriting = (expr: Expr, ...pieces: string[]): Exercise => writingExercise(expr, pieces, 1);

/** Scene tokens: plain strings, or a highlighted piece (« regarde ici »), with its animation. */
const hl = (t: string, anim?: SceneToken['anim']): SceneToken => ({ t, hl: true, ...(anim ? { anim } : {}) });
const toks = (...parts: (string | SceneToken)[]): SceneToken[] => parts.map((p) => (typeof p === 'string' ? { t: p } : p));
const oneScene = (tokens: SceneToken[], extra: { label?: string; caption?: string } = {}): Scene => ({
  layout: 'one',
  calcs: [{ tokens, ...(extra.label ? { label: extra.label } : {}) }],
  ...(extra.caption ? { caption: extra.caption } : {}),
});
const M = '−';

/** Small question on a lesson writing: the calculation is its pieces, as written. */
const small = (ex: Exercise, prompt: string, options: [string, string][], correctIndex: number): Question =>
  smallChoix(ex, prompt, options.map(([label, why]) => ({ label, why })), correctIndex, joinPieces(tokensOf(ex)));
/** The same, with no calculation shown. */
const smallPlain = (ex: Exercise, prompt: string, options: [string, string][], correctIndex: number): Question =>
  smallChoix(ex, prompt, options.map(([label, why]) => ({ label, why })), correctIndex);
/** A question of the practice series: not a « petite question » (a failed one comes back before the end exercises). */
const practice = (ex: Exercise, prompt: string, options: [string, string][], correctIndex: number, calcLatex: string): Question =>
  choix(ex, prompt, options.map(([label, why]) => ({ label, why })), correctIndex, calcLatex);

const YES_NO = (yes: string, no: string): [string, string][] => [['Oui', yes], ['Non', no]];

// « Réécris » (doc 06, tableau « Questions qui comptent »)
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

/** « head(−n) » for every n ≠ keep: the writing is right, the number changed. */
const otherNumbers = (head: string, keep: number, message: string): Rewrite['specific'] =>
  Array.from({ length: 99 }, (_, i) => i + 1)
    .filter((n) => n !== keep)
    .map((n) => answerOf(`${head}(−${n})`, message));

const PRACTICE_REWRITE = rewriteEx(
  lessonWriting(op('+', num(9), num(-4)), '9', '+ -', '4'),
  '9+(−4)',
  [
    answerOf('9+−4', `Le + et le ${M} se touchent encore. Mets ${M}4 entre parenthèses : 9 + (${M}4).`, 'signes-colles'),
    answerOf('9+(−4', `La parenthèse ouverte doit se fermer : 9 + (${M}4).`, 'parenthese'),
    answerOf('(9+−4)', `Les parenthèses doivent entourer le nombre négatif, pas tout le calcul : 9 + (${M}4).`, 'signes-colles'),
    answerOf('9+(4−)', `Le signe ${M} se met avant le 4 : 9 + (${M}4).`, 'moins-apres'),
    answerOf('9+4−', `Le signe ${M} se met avant le 4 : 9 + (${M}4).`, 'moins-apres'),
    ...otherNumbers('9+', 4, `L'écriture est bonne, mais le nombre a changé. Garde ${M}4.`),
  ],
  `Garde le même calcul, et mets le nombre négatif entre parenthèses : 9 + (${M}4).`,
  ['Repère les deux signes qui se touchent : + et −.', 'Mets le nombre négatif entre parenthèses : (−4).', 'Le calcul bien écrit : 9 + (−4).'],
);

const REWRITE_TIMES = lessonWriting(op('*', num(6), num(-2)), '6', '\\times -', '2');
const REWRITE_HEAD = lessonWriting(op('+', num(-3), num(4)), '3-', '+', '4');

const rewriteTimes = rewriteEx(
  REWRITE_TIMES,
  '6×(−2)',
  [
    answerOf('6×−2', `Le × et le ${M} se touchent encore. Mets ${M}2 entre parenthèses.`, 'signes-colles'),
    answerOf('6×(−2', 'La parenthèse ouverte doit se fermer.', 'parenthese'),
  ],
  `Recopie la ligne du dessus : 6 × (${M}2).`,
  ['Repère les deux signes qui se touchent : × et −.', 'Mets le nombre négatif entre parenthèses : (−2).', 'Le calcul bien écrit : 6 × (−2).'],
);

const rewriteHeadSign = rewriteEx(
  REWRITE_HEAD,
  '−3',
  [
    answerOf('3−', `Le ${M} est toujours après le 3. Il doit aller devant.`, 'moins-apres'),
    answerOf('(−3)', `En tête du calcul, on n'écrit pas de parenthèses : ${M}3.`, 'parentheses-en-tete'),
    answerOf('3', `Le 3 est négatif : garde son signe ${M}, devant le nombre.`),
  ],
  `Écris le nombre 3 avec son signe ${M} devant.`,
  ['Le signe − est après le 3 : il doit aller devant.', 'Le nombre négatif est en tête du calcul : pas de parenthèses.', 'Le nombre bien écrit : −3.'],
);

const rewriteHead = rewriteEx(
  REWRITE_HEAD,
  '−3+4',
  [
    // « (−3) + 4 » counts as a fault in this course (doc 08 n° 25)
    answerOf('(−3)+4', `Pas tout à fait. En tête du calcul, on n'écrit pas de parenthèses : ${M}3 + 4.`, 'parentheses-en-tete'),
    answerOf('3−+4', `Le ${M} est toujours après le 3. Il doit aller devant.`, 'moins-apres'),
    answerOf('3+4', `Le 3 est négatif : garde son signe ${M}, devant le nombre.`),
    answerOf('+3+4', `Le 3 est négatif : garde son signe ${M}, devant le nombre.`),
  ],
  `Garde les mêmes nombres. Le signe ${M} va devant le 3.`,
  ['Le signe − est après le 3 : il doit aller devant.', 'Le nombre négatif est en tête du calcul : pas besoin de parenthèses.', 'Le calcul bien écrit : −3 + 4.'],
);

const REWRITE_CONSIGNE = 'Ce calcul est mal écrit. Réécris-le correctement.';

// ——— Interactive steps ———

const tk = (...t: string[]): SceneToken[] => t.map((x) => ({ t: x }));
const fault = (message: string, ...at: number[]): StepFault => ({ at, message });
/** « Toucher un morceau » / « Toucher un endroit » : `target` = le morceau ou l'espace juste ; `gaps` = les espaces proposés. */
const touch = (
  type: 'morceau' | 'endroit',
  consigne: string,
  target: number,
  errors: StepFault[],
  fallback: string,
  extra: { gaps?: number[]; calc?: number } = {},
): NonNullable<EtapeStep['action']> => ({
  type,
  consigne,
  calc: extra.calc ?? 0,
  target: [target],
  errors,
  fallback,
  ...(extra.gaps ? { gaps: extra.gaps } : {}),
});

/** Exemple guidé résolu à l'écran : le calcul de départ, puis une ligne de plus à chaque « Je comprends ». */
const GUIDE_START = toks('6 × −2');
const GUIDE_LINE_1 = toks('Signes collés : ', hl('×'), ' et ', hl(M));
const GUIDE_LINE_2 = toks(`On met ${M}2 entre parenthèses : 6 × `, hl('('), `${M}2`, hl(')'));

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
      scene: oneScene(toks('7 ', hl(M, 'pin'), ' 3'), { label: 'soustraire' }),
      text: `Le signe **${M}** a **deux rôles**. Le premier : **soustraire**. Dans 7 ${M} 3, on enlève 3 à 7.`,
    },
    {
      scene: {
        layout: 'row',
        calcs: [
          { tokens: toks('7 ', hl(M), ' 3'), label: 'soustraire' },
          { tokens: toks(hl(M, 'pin'), '3'), label: 'signe du nombre' },
        ],
      },
      text: `Le deuxième : **dire qu'un nombre est négatif**. Dans ${M}3, le signe fait partie du nombre : on lit « moins trois ».`,
    },
    {
      scene: { layout: 'one', calcs: [{ tokens: tk(M, '6', '+', '2', M, '5') }] },
      text: `Ce ${M} est entre 2 et 5 : on enlève 5. Le ${M} du début est, lui, le signe de ${M}6.`,
      action: touch(
        'morceau',
        `Touche le ${M} qui sert à soustraire.`,
        4,
        [fault(`Ce ${M} est tout au début : il n'y a rien à soustraire. C'est le signe de ${M}6.`, 0)],
        `Ce n'est pas un ${M}. Cherche les deux traits ${M} du calcul.`,
      ),
    },
    {
      text: `Un ${M} placé tout au début d'un calcul est le signe du nombre. Quand tu lis un calcul, demande-toi toujours **quel rôle joue chaque ${M}**. Les 4 règles de ce cours servent à ça.`,
      action: {
        type: 'trou',
        open: `Un ${M} placé tout au début d'un calcul est [ ? ].`,
        choices: ['le signe du nombre', 'une soustraction'],
        correct: 0,
        errors: { 1: `Au début, il n'y a rien avant le ${M} : on ne peut rien soustraire.` },
      },
    },
  ]),
  // 2 — Règle 1 : deux signes collés
  etapes('Quand deux signes se touchent', [
    {
      scene: oneScene(toks('4 ', hl('×', 'bump'), ' ', hl(M, 'bump'), '3'), { label: 'deux signes collés' }),
      text: `Voici 4 × ${M}3. Le **×** et le **${M}** sont **collés** : deux signes se touchent.`,
    },
    {
      scene: { layout: 'one', calcs: [{ tokens: tk('4', '×', M, '3') }] },
      text: `Ce ${M}, est-ce qu'il soustrait ? Ou est-ce le signe de 3 ? **On ne sait plus.**`,
      action: touch(
        'morceau',
        'Touche le signe qui se colle au ×.',
        2,
        [
          fault("C'est le × lui-même. Cherche le signe qui le touche, juste à sa droite.", 1),
          fault('4 est un nombre, pas un signe. Cherche le signe collé au ×.', 0),
          fault('3 est un nombre, pas un signe. Cherche le signe collé au ×.', 3),
        ],
        'Cherche le signe collé au ×.',
      ),
    },
    {
      text: `La parenthèse se ferme après le 3. Elles entourent ${M}3 : c'est **un seul nombre**, le ${M} ne soustrait plus rien.`,
      action: touch(
        'endroit',
        "Touche l'endroit où la parenthèse ouvrante doit aller.",
        2,
        [
          fault('Là, la parenthèse entourerait le × aussi. Mais le × est une opération : il reste dehors.', 1),
          fault(`Là, elle couperait ${M}3 en deux. Le ${M} fait partie du nombre : il doit être dedans.`, 3),
        ],
        'Cherche où commence le nombre négatif.',
        { gaps: [1, 2, 3] },
      ),
    },
    {
      scene: oneScene(toks('4 × ', hl('(', 'pin'), `${M}3`, hl(')', 'pin')), { label: `${M}3 est un seul nombre` }),
      rule: { n: 1, text: `**Deux signes ne se suivent jamais.** Après +, ${M}, × ou ÷, un nombre négatif se met entre parenthèses.` },
    },
  ]),
  // 3 — Règle 1 : à toi (compte)
  texted(
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
    {
      title: 'La règle 1, à toi',
      intro: [`La règle marche aussi après un ${M} et un ÷. Le nombre ne change pas, le résultat non plus.`],
      above: ['7 - -1 \\;\\to\\; 7 - (-1)', '8 \\div -4 \\;\\to\\; 8 \\div (-4)'],
    },
  ),
  // 4 — Règle 2 : deviner puis expliquer (ne compte pas)
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
      outro: [`${M}3 + 5 ✓`, `(${M}3) + 5 : pas faux, mais inutile`],
    },
  ),
  // 5 — Règle 3 : le − avant le nombre
  etapes('Le moins se met avant le nombre', [
    {
      scene: oneScene(toks('3', hl(M, 'bump'), ' + 4'), { label: `le ${M} est après le 3` }),
      text: `Dans 3${M} + 4, le ${M} est écrit **après** le 3, et juste après lui, il y a un +.`,
    },
    {
      scene: { layout: 'one', calcs: [{ tokens: tk('3', M, '+', '4') }] },
      text: "On croit qu'on soustrait quelque chose au 3. Mais juste après, il y a un + : **il n'y a rien à soustraire**.",
      action: touch(
        'morceau',
        `Touche le ${M} qui est mal placé.`,
        1,
        [
          fault(`Le 3 est un nombre, il est bien écrit. Cherche le signe ${M} mal placé.`, 0),
          fault(`Le + est bien placé : il additionne 4. Cherche le ${M}.`, 2),
          fault(`Le 4 est bien écrit. Cherche le ${M}.`, 3),
        ],
        `Cherche le signe ${M} mal placé.`,
      ),
    },
    {
      scene: {
        layout: 'one',
        calcs: [{ tokens: [hl(M)], label: 'ce signe est à placer' }, { tokens: tk('3', '+', '4') }],
      },
      text: `Le signe d'un nombre négatif s'écrit **devant** le nombre : ${M}3 + 4.`,
      action: touch(
        'endroit',
        `Le ${M} quitte sa place. Touche l'endroit où il doit aller.`,
        0,
        [
          fault(`Là, le ${M} serait encore après le 3 : c'est la même faute. Le signe d'un nombre négatif se met avant le nombre.`, 1),
          fault('Là, il se collerait au + : deux signes se touchent (règle 1). Et il rendrait le 4 négatif, pas le 3.', 2),
        ],
        'Cherche où le signe doit aller.',
        { gaps: [0, 1, 2], calc: 1 },
      ),
    },
    {
      scene: oneScene(toks(hl(M, 'slide'), '3 + 4'), { label: `le ${M} passe devant` }),
      rule: { n: 3, text: `**Le signe ${M} d'un nombre négatif s'écrit toujours avant le nombre :** ${M}3, jamais 3${M}.` },
    },
  ]),
  // 6 — Règle 4 : une parenthèse se ferme
  etapes('Une parenthèse ouverte se ferme', [
    {
      scene: oneScene(toks('4 × ', hl('(', 'bump'), `${M}3`), { label: "elle s'ouvre ici" }),
      text: `Dans 4 × (${M}3, une parenthèse **s'ouvre**. Rien ne la **ferme**.`,
    },
    {
      text: "Sans parenthèse fermante, on ne sait pas où le nombre s'arrête. Les parenthèses vont toujours **par deux**, comme des guillemets.",
      action: {
        type: 'trou',
        open: 'Sans parenthèse fermante, on ne sait pas où le nombre [ ? ].',
        choices: ["s'arrête", 'commence'],
        correct: 0,
        errors: { 1: "Le nombre commence bien après la parenthèse ouverte. C'est la fin qu'on ne voit pas." },
      },
    },
    {
      scene: { layout: 'one', calcs: [{ tokens: tk('4', '×', '(', M, '3') }] },
      text: `Maintenant, on voit où le nombre s'arrête : **${M}3** est bien entouré.`,
      action: touch(
        'endroit',
        "Touche l'endroit où la parenthèse fermante doit aller.",
        5,
        [
          fault(`Là, elle couperait ${M}3 en deux. Le nombre n'est fini qu'après le 3.`, 4),
          fault("Là, elle se fermerait avant le nombre. Une parenthèse se ferme après ce qu'elle entoure.", 3),
          fault("Là, elle se fermerait avant d'avoir été ouverte. Elle doit venir après l'ouverture.", 1, 2),
        ],
        'Cherche où le nombre finit.',
        { gaps: [1, 2, 3, 4, 5] },
      ),
    },
    {
      scene: oneScene(toks('4 × ', hl('('), `${M}3`, hl(')', 'pin')), { label: 'une qui ouvre, une qui ferme' }),
      rule: { n: 4, text: '**Une parenthèse ouverte doit toujours être fermée.**' },
    },
  ]),
  // 7, 8 — Règles 3 et 4, à toi (2 petites questions sur le même écran, comptées)
  texted(
    lecon(
      smallPlain(
        lessonWriting(num(-7), '-7'),
        'Lequel est bien écrit ?',
        [
          [`7${M}`, `Le signe se met devant : ${M}7. Écrit après, on croirait une soustraction.`],
          [`${M}7`, `Le signe est devant le nombre : ${M}7, « moins sept ».`],
        ],
        1,
      ),
    ),
    { title: 'Règles 3 et 4, à toi' },
  ),
  texted(
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
    { joinPrevious: true },
  ),
  // 9 — Comparer deux cas (ne compte pas)
  texted(
    decouverte(
      smallPlain(
        lessonWriting(op('*', num(4), num(-3)), '4', '\\times', '(', '-3', ')'),
        "Qu'est-ce qui change entre A et B ?",
        [
          ['Le résultat', `Le résultat est le même : 4 fois ${M}3 donne ${M}12 dans les deux cas. Ce n'est pas le calcul qui change.`],
          ["La façon de l'écrire", "Le calcul et le résultat sont les mêmes. Seule l'écriture change : A a des parenthèses, B n'en a pas."],
          ['Le nombre 3', `Le nombre est ${M}3 dans les deux calculs. Seule la façon de l'écrire change.`],
        ],
        1,
      ),
    ),
    {
      title: 'Comparer deux cas',
      mention: 'Question pour comprendre : elle ne compte pas dans la note.',
      compare: {
        a: { label: 'Calcul A', latex: '4 \\times (-3)' },
        b: { label: 'Calcul B', latex: '4 \\times -3' },
        note: 'Voici deux écritures du même calcul. Regarde-les bien.',
        highlight: { a: toks('4 × ', hl('('), `${M}3`, hl(')')), b: toks('4 ', hl('×'), ' ', hl(M), '3') },
        after: [
          `Dans B, le × et le ${M} se touchent : on ne sait plus si le ${M} soustrait. Dans A, ${M}3 est **un seul nombre**, entouré de parenthèses. Le calcul A se lit d'**une seule façon** : c'est le bien écrit.`,
        ],
      },
    },
  ),
  // 10 — Récapitulatif
  etapes('Les 4 règles à retenir', [
    {
      recap: [
        { title: '1. Deux signes ne se suivent jamais.', ok: `4 × (${M}3)`, ko: `4 × ${M}3` },
        { title: '2. En tête, pas de parenthèses.', ok: `${M}3 + 5`, ko: `(${M}3) + 5`, koLabel: 'pas faux, mais inutile' },
        { title: `3. Le ${M} se met avant le nombre.`, ok: `${M}3`, ko: `3${M}` },
        { title: '4. Une parenthèse ouverte se ferme.', ok: `(${M}3)`, ko: `(${M}3` },
      ],
      text: 'Maintenant, à toi de les utiliser.',
    },
  ]),
  // 11 — Série de pratique (4 questions, notées, aide décroissante)
  {
    type: 'pratique',
    title: 'Cours 0 · Pratique',
    questions: [
      {
        question: practiceTouch(),
        texts: { consigne: "Rappel de la règle 1 : **deux signes ne se suivent jamais**. Touche l'endroit mal écrit de ce calcul." },
      },
      {
        question: practice(
          lessonWriting(op('*', num(4), num(-3)), '4', '\\times', '(-3'),
          "Ce calcul est mal écrit. **Touche la règle** qui n'est pas respectée.",
          [
            [RULE_OPTIONS[0] as string, "Il n'y a pas de signes collés ici : le × est suivi d'une parenthèse. Le problème est ailleurs."],
            [RULE_OPTIONS[1] as string, `Le ${M} de ${M}3 est bien devant le 3. Le problème : la parenthèse reste ouverte.`],
            [RULE_OPTIONS[2] as string, `La parenthèse ouverte ne se ferme pas : 4 × (${M}3).`],
          ],
          2,
          '4 \\times (-3',
        ),
      },
      {
        question: practice(
          lessonWriting(op('-', num(-6), op('*', num(-2), num(4))), '-6', '-', '(', '-2', ')', '\\times', '4'),
          'Ce calcul est bien écrit.',
          [
            ['Vrai', `Vrai : ${M}6 est en tête sans parenthèses, et (${M}2) est entre parenthèses. Rien ne se touche.`],
            [
              'Faux',
              `Cherche une faute : deux signes collés ? Non, ${M}2 est entre parenthèses. Un ${M} après un nombre ? Non. Une parenthèse ouverte ? Elle est fermée. Le calcul est bien écrit.`,
            ],
          ],
          0,
          '-6 - (-2) \\times 4',
        ),
        texts: { intro: ['Touche Vrai ou Faux.'] },
      },
      { question: PRACTICE_REWRITE, texts: { consigne: 'Ce calcul est mal écrit. **Réécris-le** en entier.' } },
    ],
  },
  // 12 — Exemple 1 (résolution à l'écran)
  etapes('Exemple 1 sur 2', [
    {
      scene: {
        layout: 'lines',
        calcs: [{ tokens: GUIDE_START }, { tokens: GUIDE_LINE_1 }],
        caption: 'Voici la correction. Lis chaque ligne, puis touche « Je comprends ».',
      },
      text: `**Ligne 1** Le × et le ${M} se touchent : c'est la règle 1 qui n'est pas respectée.`,
      action: { type: 'comprends' },
    },
    {
      scene: { layout: 'lines', calcs: [{ tokens: GUIDE_START }, { tokens: GUIDE_LINE_1 }, { tokens: GUIDE_LINE_2 }] },
      text: `**Ligne 2** ${M}2 est un seul nombre : on l'entoure de parenthèses. Le nombre ne change pas, le résultat non plus.`,
      action: { type: 'comprends' },
    },
  ]),
  // 13 — Exemple 1 : dernière ligne (compte)
  texted(exemple(rewriteTimes), {
    consigne: REWRITE_CONSIGNE,
    above: [
      '\\text{Signes collés : } \\times \\text{ et } -',
      '\\text{On met } -2 \\text{ entre parenthèses : } 6 \\times (-2)',
      '\\text{Le calcul bien écrit : } \\square',
    ],
    help: "**Dernière ligne** Écris le calcul en entier, bien écrit. Tu peux t'aider de la ligne du dessus.",
  }),
  // 14 — Exemple 2, case 1 (entraînement, ne compte pas)
  texted(decouverte(rewriteHeadSign), {
    consigne: 'Cette fois, deux cases sont à toi. Le calcul de départ reste affiché.',
    above: ['\\text{Le } - \\text{ passe devant le 3 : } \\square + 4'],
    uncounted: true,
  }),
  // 15 — Exemple 2, case 2 (compte)
  texted(exemple(rewriteHead), {
    consigne: 'Cette fois, deux cases sont à toi. Le calcul de départ reste affiché.',
    above: ['\\text{Le } - \\text{ passe devant le 3 : } -3 + 4', '\\text{Le calcul bien écrit : } \\square'],
  }),
  // 16 — Annonce des exercices de fin
  etapes('Place aux 5 exercices de fin', [
    { text: "Cette fois, **pas d'aide**. Ils ressemblent à ce que tu verras en contrôle." },
    { text: 'Pour valider le cours, il faut : au moins **4 exercices de fin justes sur 5** ; et **80 % de bonnes réponses** sur tout le cours.' },
    { text: "Si tu n'y arrives pas, ce n'est pas grave : tu feras une **série de validation**. Ce sont 5 exercices, sans refaire la leçon." },
  ]),
];

/** « Toucher la faute » de la série : 5 + −2 en 4 cases, le + et le − sont chacun une bonne case. */
function practiceTouch(): Question {
  const ex = lessonWriting(op('+', num(5), num(-2)), '5', '+ -', '2');
  const { symbols, accept } = atomize(tokensOf(ex), faultOf(ex));
  return { kind: 'erreur', ex, lines: symbols, wrongLine: accept[0] ?? null, errorType: faultTypeOf(ex), accept, shownLatex: joinPieces(tokensOf(ex)) };
}

// ——— Textes de retour propres au cours (doc 06, « Retours d'erreur précis ») ———

const RIGHT_REWRITE: Record<string, string> = {
  '6×(−2)': `Le × et le ${M} ne se touchent plus.`,
  '−3': `Le ${M} est devant le 3, comme la règle 3 le demande.`,
  '−3+4': `Le ${M} est devant le 3, et pas de parenthèses en tête.`,
  '9+(−4)': `Le + et le ${M} ne se touchent plus : 9 + (${M}4).`,
};
const TOUCH_RIGHT = `Le + et le ${M} se touchent. On écrit 5 + (${M}2).`;
const TOUCH_WRONG = `Les nombres sont bien écrits. Cherche les deux signes qui se touchent : + et ${M}.`;

/** Les questions de leçon à texte propre : « Questions qui comptent » (écrans 4, 8, 11, 12, 13). */
function feedbackText(q: Question, o: Outcome): string | null {
  if (q.kind === 'choix') return q.options.find((opt) => opt.label === o.given)?.why ?? null;
  if (q.kind === 'erreur' && q.shownLatex === '5 + -2' && q.accept?.join() === '1,2') return o.correct ? TOUCH_RIGHT : TOUCH_WRONG;
  if (q.kind === 'reecrire' && q.specific.length > 0) return o.correct ? (RIGHT_REWRITE[q.expected] ?? null) : (o.message ?? null);
  return null;
}

export const c00: CourseDef = {
  id: ID,
  moduleId: MODULE_ID,
  order: 0,
  title: 'Bien écrire un calcul',
  shortTitle: 'Bien écrire',
  rule: RULE,
  parts,
  lessonLength: 11,
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
  feedbackText,
  memo: {
    rule: `**Un calcul s'écrit d'une seule façon.** On doit toujours savoir quel rôle joue chaque ${M} : soustraire, ou signe d'un nombre.`,
    ruleBullets: ['Deux signes ne se suivent jamais.', 'En tête, pas de parenthèses.', `Le ${M} se met avant le nombre.`, 'Une parenthèse ouverte se ferme.'],
    examples: [`4 × (${M}3)`, `${M}3 + 5`],
    mistake: { wrong: `4 × ${M}3`, why: `Le × et le ${M} se touchent. On écrit 4 × (${M}3).` },
    tip: `Cherche d'abord les signes qui se touchent, puis demande-toi pour chaque ${M} : il soustrait, ou c'est le signe d'un nombre ?`,
  },
};
