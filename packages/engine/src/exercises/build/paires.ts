// « Relier les paires » (doc 04 §5): 4 calculations of the course, their 4 results shuffled.
import { toLatex } from '../../math/expr';
import { shuffle } from '../../rng';
import type { CourseDef, Exercise } from '../../courses/types';
import type { BuildCtx, Question } from '../types';
import { drawExercise, retry, valueLatex } from './common';

const COUNT = 4;

/** 4 calculations (the first one may be the asked trap), shown in a random order. */
export function drawFour(course: CourseDef, ctx: BuildCtx, ok: (exs: Exercise[]) => boolean): Exercise[] {
  return retry(
    () =>
      shuffle(ctx.rng, [
        drawExercise(course, ctx),
        ...Array.from({ length: COUNT - 1 }, () => course.generate(ctx.level, ctx.rng)),
      ]),
    // no two identical calculations
    (exs) => new Set(exs.map((e) => toLatex(e.expr))).size === COUNT && ok(exs),
  );
}

export function buildPaires(course: CourseDef, ctx: BuildCtx): Question {
  // the 4 results all different
  const exs = drawFour(course, ctx, (list) => new Set(list.map((e) => valueLatex(e.answer))).size === COUNT);
  return {
    kind: 'paires',
    exs,
    left: exs.map((e) => toLatex(e.expr)),
    right: shuffle(
      ctx.rng,
      exs.map((e) => ({ latex: valueLatex(e.answer), value: e.answer })),
    ),
  };
}
