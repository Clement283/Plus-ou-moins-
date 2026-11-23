// « Trouver l'erreur » (doc 04 §4): the model resolution with one recognised error on one line.
import { type Rational } from '../../math/rational';
import { pick } from '../../rng';
import type { CourseDef, ErrorDef, Exercise } from '../../courses/types';
import type { BuildCtx, Question } from '../types';
import { drawExercise, errorOf, retry } from './common';

/** 1 time in 5 the resolution is entirely right. */
const ALL_RIGHT = 0.2;

/**
 * The model resolution written as if the result were `wrong`: the first line that depends on
 * the result is the wrong one, and the next lines carry the error on (« = −(3 × 4) · = −12 »).
 * null when the wrong resolution does not have the shape of the right one.
 */
export function wrongResolution(
  course: CourseDef,
  ex: Exercise,
  wrong: Rational,
): { lines: string[]; wrongLine: number } | null {
  const right = course.resolution(ex);
  const lines = course.resolution({ ...ex, answer: wrong });
  if (lines.length !== right.length) return null;
  const wrongLine = lines.findIndex((l, i) => l !== right[i]);
  return wrongLine > 0 ? { lines, wrongLine } : null;
}

interface Wrong {
  error: ErrorDef;
  lines: string[];
  wrongLine: number;
}

/** Every way an error of the course (or only `only`) can show on the resolution of `ex`. */
function wrongs(course: CourseDef, ex: Exercise, only?: ErrorDef): Wrong[] {
  return (only ? [only] : course.errors).flatMap((error) =>
    error.wrongValues(ex).flatMap((w) => {
      const r = wrongResolution(course, ex, w);
      return r ? [{ error, ...r }] : [];
    }),
  );
}

export function buildErreur(course: CourseDef, ctx: BuildCtx): Question {
  const { rng } = ctx;
  if (rng() < ALL_RIGHT) {
    const ex = drawExercise(course, ctx);
    return { kind: 'erreur', ex, lines: course.resolution(ex), wrongLine: null, errorType: null };
  }
  const trap = errorOf(course, ctx.trapErrorType);
  const [ex, options] = retry(
    () => {
      const e = drawExercise(course, ctx);
      return [e, wrongs(course, e, trap)] as const;
    },
    ([, list]) => list.length > 0,
  );
  // the error first (each error equally likely), then one of its wrong values
  const error = pick(rng, [...new Set(options.map((o) => o.error))]);
  const w = pick(rng, options.filter((o) => o.error === error));
  return { kind: 'erreur', ex, lines: w.lines, wrongLine: w.wrongLine, errorType: error.id };
}
