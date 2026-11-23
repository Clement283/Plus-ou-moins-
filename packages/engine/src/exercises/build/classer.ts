// « Classer » (doc 04 §6): 4 calculations to sort into the course's boxes.
import type { CourseDef, Exercise } from '../../courses/types';
import type { BuildCtx, Question } from '../types';
import { drawFour } from './paires';

/** The box shown only when one calculation goes in it (Relatifs: « Résultat 0 »). */
const SHOWN_WHEN_USED = 'zero';

const classOf = (course: CourseDef, ex: Exercise): string => {
  const first = course.classes[0];
  if (!first) throw new Error(`Pas de cases « Classer » pour ${course.id}`);
  return first.of(ex);
};

/** The « Classer » question of these calculations: the boxes shown and the expected placement. */
export function classerFor(course: CourseDef, exs: Exercise[]): Question {
  const expected = exs.map((e) => classOf(course, e));
  const classes = course.classes
    .filter((c) => c.id !== SHOWN_WHEN_USED || expected.includes(c.id))
    .map(({ id, label }) => ({ id, label }));
  return { kind: 'classer', exs, classes, expected };
}

export function buildClasser(course: CourseDef, ctx: BuildCtx): Question {
  // at least one calculation in each box shown
  const exs = drawFour(course, ctx, (list) => {
    const used = new Set(list.map((e) => classOf(course, e)));
    return course.classes.every((c) => c.id === SHOWN_WHEN_USED || used.has(c.id));
  });
  return classerFor(course, exs);
}
