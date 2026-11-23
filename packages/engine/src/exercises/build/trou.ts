// « Compléter le trou » (doc 04 §2): one number of the calculation (never the result) is hidden.
import { type Expr, evaluate, num, toLatex } from '../../math/expr';
import type { Rational } from '../../math/rational';
import { randInt } from '../../rng';
import type { CourseDef, Exercise } from '../../courses/types';
import type { BuildCtx, Question } from '../types';
import { drawExercise, retry } from './common';

/** Positive placeholder (never parenthesised), replaced by the box in the LaTeX. */
const BOX = 987654321;

/** The numbers of the calculation, left to right. */
function leaves(e: Expr): Rational[] {
  if (e.k === 'num') return [e.v];
  if (e.k === 'op') return [...leaves(e.a), ...leaves(e.b)];
  return leaves(e.a);
}

const leafCount = (e: Expr): number => leaves(e).length;

/**
 * Whether the `index`-th number is the only value giving the result: no other factor of a
 * product is 0 (0 × ▢ = 0), a hidden divisor divides something that is not 0, no even power.
 */
function uniquelyDetermined(e: Expr, index: number): boolean {
  if (e.k === 'num') return true;
  if (e.k === 'pow') return e.e % 2 !== 0 && uniquelyDetermined(e.a, index);
  const n = leafCount(e.a);
  const inA = index < n;
  const [mine, other] = inA ? [e.a, e.b] : [e.b, e.a];
  const otherValue = evaluate(other);
  if (e.op === '*' && otherValue.n === 0) return false;
  if (e.op === '/' && !inA && otherValue.n === 0) return false;
  return uniquelyDetermined(mine, inA ? index : index - n);
}

function withBox(e: Expr, index: number): Expr {
  let i = 0;
  const walk = (x: Expr): Expr => {
    if (x.k === 'num') return i++ === index ? num(BOX) : x;
    if (x.k === 'op') {
      const a = walk(x.a);
      return { ...x, a, b: walk(x.b) };
    }
    return { ...x, a: walk(x.a) };
  };
  return walk(e);
}

/** The « trou » question of `ex` with its `index`-th number hidden; throws if that hole has several answers. */
export function trouFor(ex: Exercise, index: number): Question {
  const hidden = leaves(ex.expr)[index];
  if (hidden === undefined || !uniquelyDetermined(ex.expr, index)) throw new Error('Trou impossible');
  const promptLatex = `${toLatex(withBox(ex.expr, index)).replace(`${BOX}`, '\\square')} = ${toLatex(num(ex.answer))}`;
  return { kind: 'trou', ex, promptLatex, hidden };
}

export function buildTrou(course: CourseDef, ctx: BuildCtx): Question {
  const [ex, index] = retry(
    () => {
      const e = drawExercise(course, ctx);
      return [e, randInt(ctx.rng, 0, leafCount(e.expr) - 1)] as const;
    },
    ([e, i]) => {
      const hidden = leaves(e.expr)[i] as Rational;
      // « diviser »: an integer answer; every course: one answer only
      return (!course.expectInteger || hidden.d === 1) && uniquelyDetermined(e.expr, i);
    },
  );
  return trouFor(ex, index);
}
