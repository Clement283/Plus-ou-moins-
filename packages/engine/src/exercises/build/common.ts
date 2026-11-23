// Ingredients shared by the question builders (doc 04 §0).
import type { ErrorFamily } from '../../events';
import { num, toLatex } from '../../math/expr';
import type { Rational } from '../../math/rational';
import type { CourseDef, ErrorDef, Exercise } from '../../courses/types';
import type { BuildCtx } from '../types';

/** Doc 04 §0 / Task 9: a draw breaking the rules is redrawn, at most this many times. */
export const MAX_TRIES = 50;

export function retry<T>(draw: () => T, ok: (t: T) => boolean): T {
  for (let i = 0; i < MAX_TRIES; i++) {
    const t = draw();
    if (ok(t)) return t;
  }
  throw new Error("Impossible de fabriquer l'exercice");
}

export const errorOf = (course: CourseDef, id: string | null | undefined): ErrorDef | undefined =>
  course.errors.find((e) => e.id === id);

/** A calculation of the course: the trap of `ctx.trapErrorType` when it is one of the course's errors. */
export function drawExercise(course: CourseDef, ctx: BuildCtx): Exercise {
  const trap = errorOf(course, ctx.trapErrorType);
  return trap ? trap.trap(ctx.level, ctx.rng) : course.generate(ctx.level, ctx.rng);
}

/** The sign error of the course (marked 🔴 in doc 06): its first error of the « signe » family. */
export const signError = (course: CourseDef): ErrorDef | undefined => course.errors.find((e) => e.family === 'signe');

/** Family of a recorded error: the course's own, otherwise « autre » (relecture, ordre-etapes, autre). */
export const familyOf = (course: CourseDef, errorType: string): ErrorFamily => errorOf(course, errorType)?.family ?? 'autre';

/** A value « comme sur une copie ». */
export const valueLatex = (v: Rational): string => toLatex(num(v));
