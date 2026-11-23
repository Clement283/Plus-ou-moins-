// « Étiquettes à ordonner » in training (doc 04 §3): the model resolution as shuffled tiles.
import { pick, shuffle } from '../../rng';
import type { CourseDef, Exercise } from '../../courses/types';
import type { BuildCtx, Question } from '../types';
import { errorOf } from '../../courses/errors-util';
import { drawExercise, retry } from './common';
import { resolutionWith } from './erreur';

/** A trap tile from the 3rd time on this course (seen twice already). */
const TRAP_FROM_TIMES_SEEN = 2;

/** The wrong result line « = w » of a resolution showing an error of the course (the asked one when given). */
function trapTiles(course: CourseDef, ctx: BuildCtx, ex: Exercise, lines: string[]): { latex: string; errorType: string }[] {
  const asked = errorOf(course, ctx.trapErrorType);
  return (asked ? [asked] : course.errors).flatMap((error) =>
    error.wrongValues(ex).flatMap((w) => {
      const wrong = resolutionWith(course, error, ex, w);
      const latex = wrong?.lines[wrong.lines.length - 1];
      // never a tile that is also right or already there
      return latex !== undefined && !lines.includes(latex) ? [{ latex, errorType: error.id }] : [];
    }),
  );
}

export function buildOrdre(course: CourseDef, ctx: BuildCtx): Question {
  const { rng } = ctx;
  const withTrap = ctx.timesSeen >= TRAP_FROM_TIMES_SEEN;
  const [ex, lines, traps] = retry(
    () => {
      const e = drawExercise(course, ctx);
      const ls = course.resolution(e);
      return [e, ls, withTrap ? trapTiles(course, ctx, e, ls) : []] as const;
    },
    ([, ls, ts]) => new Set(ls).size === ls.length && (!withTrap || ts.length > 0),
  );
  const solutionTiles = lines.map((latex, i) => ({ id: `t${i + 1}`, latex }));
  const solution = solutionTiles.map((t) => t.id);
  if (!withTrap) {
    const tiles = retry(() => shuffle(rng, solutionTiles), (ts) => ts.map((t) => t.id).join() !== solution.join());
    return { kind: 'ordre', ex, tiles, solution };
  }
  // one trap of each error equally likely
  const errorType = pick(rng, [...new Set(traps.map((t) => t.errorType))]);
  const trapTile = pick(rng, traps.filter((t) => t.errorType === errorType));
  const all = [...solutionTiles, { id: `t${lines.length + 1}`, latex: trapTile.latex }];
  const tiles = retry(
    () => shuffle(rng, all),
    (ts) => ts.filter((t) => solution.includes(t.id)).map((t) => t.id).join() !== solution.join(),
  );
  return { kind: 'ordre', ex, tiles, solution, trapTile };
}
