// « Réponse écrite » (doc 04 §1): a calculation of the course, or the trap of a frequent error.
import { toLatex } from '../../math/expr';
import type { CourseDef } from '../../courses/types';
import type { BuildCtx, Question } from '../types';
import { drawExercise } from './common';

export function buildSaisie(course: CourseDef, ctx: BuildCtx): Question {
  const ex = drawExercise(course, ctx);
  return { kind: 'saisie', ex, promptLatex: `${toLatex(ex.expr)} = \\square` };
}
