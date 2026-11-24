// « Toucher la droite » : un calcul à deux termes, les bonds sont dessinés, l'élève touche l'arrivée.
import { type Expr, toLatex } from '../../math/expr';
import type { CourseDef, Exercise } from '../../courses/types';
import type { Rng } from '../../rng';
import type { Question } from '../types';
import { MAX_TRIES } from './common';

/** 8 graduations au plus : max − min ≤ 7. */
export const MAX_SPAN = 7;

const operands = (e: Expr): number[] =>
  e.k === 'num' ? [e.v.n] : e.k === 'op' ? [...operands(e.a), ...operands(e.b)] : operands(e.a);

const geometry = (ex: Exercise): { terms: [number, number]; min: number; max: number } | null => {
  if (ex.expr.k !== 'op' || ex.expr.op !== '+') return null;
  const terms = operands(ex.expr);
  if (terms.length !== 2) return null;
  const [a, b] = terms as [number, number];
  const points = [0, a, a + b];
  return { terms: [a, b], min: Math.min(...points), max: Math.max(...points) };
};

export function droiteExercise(course: CourseDef, rng: Rng): Exercise {
  for (let i = 0; i < MAX_TRIES * 20; i++) {
    const ex = course.generate(1, rng);
    const g = geometry(ex);
    if (g && g.max - g.min <= MAX_SPAN) return ex;
  }
  throw new Error(`Impossible de fabriquer une droite pour ${course.id}`);
}

export function buildDroite(course: CourseDef, rng: Rng): Question {
  const ex = droiteExercise(course, rng);
  const g = geometry(ex)!;
  const [a, b] = g.terms;
  return {
    kind: 'droite',
    ex,
    promptLatex: toLatex(ex.expr),
    line: { from: g.min, to: g.max },
    jumps: [
      { from: 0, by: a },
      { from: a, by: b },
    ],
    answer: ex.answer.n,
  };
}
