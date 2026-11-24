// « Quel est le signe du résultat ? » : deux gros boutons « + » et « − », le résultat n'est jamais 0.
import type { CourseDef } from '../../courses/types';
import { rat } from '../../math/rational';
import type { BuildCtx, Question } from '../types';
import { drawExercise, retry } from './common';

/** L'erreur de signe du cours (famille « signe »). */
export const signErrorOf = (course: CourseDef): string => {
  const e = course.errors.find((x) => x.family === 'signe');
  if (!e) throw new Error(`Pas d'erreur de signe pour ${course.id}`);
  return e.id;
};

export function buildSigne(course: CourseDef, ctx: BuildCtx): Question {
  const signError = signErrorOf(course);
  const ex = retry(() => drawExercise(course, ctx), (e) => e.answer.n !== 0);
  const positive = ex.answer.n > 0;
  return {
    kind: 'qcm',
    ex,
    choices: [
      { value: rat(1), latex: '+', errorType: positive ? null : signError },
      { value: rat(-1), latex: '-', errorType: positive ? signError : null },
    ],
    correctIndex: positive ? 0 : 1,
    formula: 'debut',
  };
}
