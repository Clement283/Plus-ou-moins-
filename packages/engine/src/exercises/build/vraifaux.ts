// « Vrai ou faux » (doc 04 §8): the right result one time in two, otherwise a QCM trap.
import { pick } from '../../rng';
import type { CourseDef } from '../../courses/types';
import type { BuildCtx, Question } from '../types';
import { drawExercise } from './common';
import { formulaFor, formulaOn, trapsFor } from './qcm';

export function buildVraiFaux(course: CourseDef, ctx: BuildCtx): Question {
  const { rng } = ctx;
  const ex = drawExercise(course, ctx);
  if (rng() < 0.5) return { kind: 'vraifaux', ex, shown: ex.answer, isTrue: true, errorType: null };
  // a trap chosen as for the QCM: typical at the beginning, then mixed
  const formula = formulaOn(formulaFor(ctx.timesSeen, rng), ex);
  const traps = trapsFor(course, ex, formula, rng);
  const debut = formula === 'debut' ? traps.filter((t) => t.errorType !== 'autre') : [];
  const trap = pick(rng, debut.length > 0 ? debut : traps);
  return { kind: 'vraifaux', ex, shown: trap.value, isTrue: false, errorType: trap.errorType };
}
