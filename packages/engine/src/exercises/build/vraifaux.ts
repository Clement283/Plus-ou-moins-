// « Vrai ou faux » (doc 04 §8): the right result one time in two, otherwise a QCM trap.
import { pick } from '../../rng';
import type { CourseDef } from '../../courses/types';
import type { BuildCtx, Question } from '../types';
import { drawWithTraps } from './qcm';

export function buildVraiFaux(course: CourseDef, ctx: BuildCtx): Question {
  const { rng } = ctx;
  const isTrue = rng() < 0.5;
  // a trap chosen as for the QCM: typical at the beginning, then mixed
  const { ex, formula, traps } = drawWithTraps(course, ctx);
  if (isTrue) return { kind: 'vraifaux', ex, shown: ex.answer, isTrue: true, errorType: null };
  const debut = formula === 'debut' ? traps.filter((t) => t.errorType !== 'autre') : [];
  const trap = pick(rng, debut.length > 0 ? debut : traps);
  return { kind: 'vraifaux', ex, shown: trap.value, isTrue: false, errorType: trap.errorType };
}
