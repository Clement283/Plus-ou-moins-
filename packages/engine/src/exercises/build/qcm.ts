// « QCM » (doc 04 §7): the right answer and 3 traps, typical or not, mixed by formula.
import { type Rational, eqRat, neg, rat } from '../../math/rational';
import { type Rng, pick, shuffle } from '../../rng';
import { diagnose } from '../../courses';
import type { CourseDef, Exercise } from '../../courses/types';
import type { BuildCtx, Question } from '../types';
import { drawExercise, retry, valueLatex } from './common';

export type Formula = 'debut' | 'paires-signes' | 'melangee';

/** Fewer QCM than this seen on the course: the « début » formula. */
const DEBUT_UNTIL = 5;
const TRAPS = 3;

export interface Trap {
  value: Rational;
  /** The recognised error of the value, 'autre' for a non-typical trap. */
  errorType: string;
}

/** Doc 04 §7.2: début, then « paires de signes » or « mélangée » one time in two. */
export function formulaFor(timesSeen: number, rng: Rng): Formula {
  if (timesSeen < DEBUT_UNTIL) return 'debut';
  return rng() < 0.5 ? 'paires-signes' : 'melangee';
}

const errorTypeOf = (course: CourseDef, ex: Exercise, v: Rational): string =>
  diagnose(course, ex, v)?.errorType ?? 'autre';

/** Typical traps: the results of the course's errors, one value of each error first, errors in random order. */
function typicalTraps(course: CourseDef, ex: Exercise, rng: Rng): Trap[] {
  const perError = shuffle(rng, course.errors)
    .map((e) => shuffle(rng, e.wrongValues(ex)).map((value) => ({ value, errorType: e.id })))
    .filter((list) => list.length > 0);
  const out: Trap[] = [];
  for (let round = 0; perError.some((list) => list.length > round); round++)
    for (const list of perError) {
      const t = list[round];
      if (t && !out.some((o) => eqRat(o.value, t.value))) out.push(t);
    }
  return out;
}

/** Doc 04 §7.3: the gaps of the same order of size as the answer. */
function gaps(size: number): number[] {
  if (size <= 20) return [1, 2, 3];
  return [...new Set([Math.round(0.1 * size), Math.round(0.2 * size), 10, 20, 30])].filter((g) => g > 0);
}

/**
 * Non-typical sizes: |answer| ± a gap, never 0 unless the answer is between −3 and 3.
 * (Integer answers: every course of the étape 1 has one.)
 */
function nonTypicalSizes(answer: Rational): number[] {
  const size = Math.abs(answer.n / answer.d);
  return gaps(size)
    .flatMap((g) => [size - g, size + g])
    .filter((m) => m > 0 || (m === 0 && size <= 3));
}

/** One non-typical trap not in `used`: the answer's sign one time in two, the other sign otherwise. */
function nonTypicalTrap(course: CourseDef, ex: Exercise, used: Rational[], rng: Rng): Trap | null {
  const answerSign = ex.answer.n < 0 ? -1 : 1;
  const ok = (v: Rational): boolean => !used.some((u) => eqRat(u, v)) && errorTypeOf(course, ex, v) === 'autre';
  const sizes = nonTypicalSizes(ex.answer);
  const first = rng() < 0.5 ? answerSign : -answerSign;
  for (const sign of [first, -first]) {
    const candidates = sizes.map((m) => rat(sign * m)).filter(ok);
    if (candidates.length > 0) return { value: pick(rng, candidates), errorType: 'autre' };
  }
  return null;
}

/** The 3 traps of the formula, in their doc order (before the shuffle); null when `ex` has not enough. */
export function trapsFor(course: CourseDef, ex: Exercise, formula: Formula, rng: Rng): Trap[] | null {
  const typical = typicalTraps(course, ex, rng);
  const out: Trap[] = [];
  const used = (): Rational[] => [ex.answer, ...out.map((t) => t.value)];
  if (formula === 'paires-signes') {
    // the answer, its opposite, another number and its opposite (a typical size first)
    const r = ex.answer;
    const sizeOf = (v: Rational): Rational => (v.n < 0 ? neg(v) : v);
    const fresh = (v: Rational): boolean => v.n !== 0 && !eqRat(sizeOf(v), sizeOf(r));
    const typicalSizes = typical.map((t) => sizeOf(t.value)).filter(fresh);
    const other =
      typicalSizes.length > 0
        ? pick(rng, typicalSizes)
        : sizeOf((nonTypicalTrap(course, ex, [r, neg(r)], rng) ?? { value: rat(0) }).value);
    if (!fresh(other)) return null;
    for (const v of [neg(r), other, neg(other)]) out.push({ value: v, errorType: errorTypeOf(course, ex, v) });
    return out;
  }
  out.push(...typical.slice(0, formula === 'debut' ? 2 : 1));
  while (out.length < TRAPS) {
    const t = nonTypicalTrap(course, ex, used(), rng);
    if (!t) return null;
    out.push(t);
  }
  return out;
}

/** « Paires de signes » needs an answer ≠ 0 (0 has no opposite): « mélangée » then. */
export const formulaOn = (formula: Formula, ex: Exercise): Formula =>
  formula === 'paires-signes' && ex.answer.n === 0 ? 'melangee' : formula;

/** The QCM of `ex` with this formula and these traps. */
function qcmWith(ex: Exercise, f: Formula, traps: Trap[], rng: Rng): Question {
  const choices = shuffle(rng, [{ value: ex.answer, errorType: null as string | null }, ...traps]).map((c) => ({ value: c.value, latex: valueLatex(c.value), errorType: c.errorType }));
  return { kind: 'qcm', ex, choices, correctIndex: choices.findIndex((c) => c.errorType === null), formula: f };
}

/** The QCM of `ex` with this formula; throws when `ex` has not enough traps. */
export function qcmFor(course: CourseDef, ex: Exercise, formula: Formula, rng: Rng): Question {
  const f = formulaOn(formula, ex);
  const traps = trapsFor(course, ex, f, rng);
  if (!traps) throw new Error("Impossible de fabriquer l'exercice");
  return qcmWith(ex, f, traps, rng);
}

/** A calculation of the course with the formula's 3 traps (redrawn when it has not enough). */
export function drawWithTraps(course: CourseDef, ctx: BuildCtx): { ex: Exercise; formula: Formula; traps: Trap[] } {
  const formula = formulaFor(ctx.timesSeen, ctx.rng);
  const drawn = retry(
    () => {
      const ex = drawExercise(course, ctx);
      const f = formulaOn(formula, ex);
      return { ex, formula: f, traps: trapsFor(course, ex, f, ctx.rng) };
    },
    (d) => d.traps !== null,
  );
  return { ...drawn, traps: drawn.traps ?? [] };
}

export function buildQcm(course: CourseDef, ctx: BuildCtx): Question {
  const { ex, formula, traps } = drawWithTraps(course, ctx);
  return qcmWith(ex, formula, traps, ctx.rng);
}
