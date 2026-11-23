// « Trouver l'erreur » (doc 04 §4): the model resolution with one recognised error on one line.
import { type Rational, eqRat, neg } from '../../math/rational';
import { type Rng, pick } from '../../rng';
import { errorOf } from '../../courses/errors-util';
import type { CourseDef, ErrorDef, Exercise, WrongResolution } from '../../courses/types';
import type { BuildCtx, Question } from '../types';
import { drawExercise, retry } from './common';

/** 1 time in 5 the resolution is entirely right. */
const ALL_RIGHT = 0.2;

/**
 * Fallback for an error without its own `wrongResolution`: the model resolution written as if the
 * result were `wrong`. Kept only when it shows a single error: the result line alone is wrong, or
 * `wrong` is the opposite of the answer (sign line and result wrong together).
 */
function injected(course: CourseDef, ex: Exercise, wrong: Rational): WrongResolution | null {
  const right = course.resolution(ex);
  const lines = course.resolution({ ...ex, answer: wrong });
  if (lines.length !== right.length) return null;
  const wrongLine = lines.findIndex((l, i) => l !== right[i]);
  if (wrongLine <= 0) return null;
  return wrongLine === lines.length - 1 || eqRat(wrong, neg(ex.answer)) ? { lines, wrongLine } : null;
}

/** The resolution of `ex` showing `error`, ending on `wrong`; null when that error cannot give it alone. */
export function resolutionWith(course: CourseDef, error: ErrorDef, ex: Exercise, wrong: Rational): WrongResolution | null {
  return error.wrongResolution ? error.wrongResolution(ex, wrong) : injected(course, ex, wrong);
}

interface Wrong extends WrongResolution {
  error: ErrorDef;
}

/** Every way an error of the course (or only `only`) can show on the resolution of `ex`. */
function wrongs(course: CourseDef, ex: Exercise, only?: ErrorDef): Wrong[] {
  return (only ? [only] : course.errors).flatMap((error) =>
    error.wrongValues(ex).flatMap((w) => {
      const r = resolutionWith(course, error, ex, w);
      return r ? [{ error, ...r }] : [];
    }),
  );
}

/**
 * The « Trouver l'erreur » question of `ex`: entirely right when `error` is null, otherwise with
 * that error (any error of the course when `error` is 'any'). null when the error cannot show on `ex`.
 */
export function erreurFor(course: CourseDef, ex: Exercise, error: ErrorDef | null | 'any', rng: Rng): Question | null {
  if (error === null) return { kind: 'erreur', ex, lines: course.resolution(ex), wrongLine: null, errorType: null };
  const options = wrongs(course, ex, error === 'any' ? undefined : error);
  if (options.length === 0) return null;
  // the error first (each error equally likely), then one of its wrong values
  const chosen = pick(rng, [...new Set(options.map((o) => o.error))]);
  const w = pick(rng, options.filter((o) => o.error === chosen));
  return { kind: 'erreur', ex, lines: w.lines, wrongLine: w.wrongLine, errorType: chosen.id };
}

export function buildErreur(course: CourseDef, ctx: BuildCtx): Question {
  const { rng } = ctx;
  if (rng() < ALL_RIGHT) return erreurFor(course, drawExercise(course, ctx), null, rng) as Question;
  const error = errorOf(course, ctx.trapErrorType) ?? 'any';
  const q = retry(
    () => erreurFor(course, drawExercise(course, ctx), error, rng),
    (x) => x !== null,
  );
  return q as Question;
}
