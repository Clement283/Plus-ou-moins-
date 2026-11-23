// Cours 2 — Additionner deux nombres de signes contraires (doc 06).
import { num, op, toLatex } from '../../math/expr';
import { rat } from '../../math/rational';
import type { Rng } from '../../rng';
import type { CourseDef, Exercise, Level } from '../types';
import {
  MODULE_ID, SIGN_CLASSES, SIZES, absIs, buildErrors, chance, draw, exemple, explanation, explication,
  isOpposite, lecon, makeExercise, math, operands, ordre, redraw, resultLine, saisie, sg, stepped, text, trou,
} from './shared';

const ID = 'c02-additionner-signes-contraires';
const RULE =
  'Signes contraires : je soustrais le plus petit (sans signe) du plus grand (sans signe), et je prends le signe du plus grand.';

const sum = (level: Level, a: number, b: number): Exercise => makeExercise(ID, level, op('+', num(a), num(b)));

/** `negative` (without sign) is the negative number, `positive` the positive one, in a random order. */
function contrary(level: Level, rng: Rng, negative: number, positive: number, negativeFirst = chance(rng, 0.5)): Exercise {
  return negativeFirst ? sum(level, -negative, positive) : sum(level, positive, -negative);
}

/** Two different sizes. */
function twoSizes(level: Level, rng: Rng): [number, number] {
  const p = draw(rng, SIZES[level]);
  return [p, redraw(() => draw(rng, SIZES[level]), (q) => q !== p)];
}

function generate(level: Level, rng: Rng): Exercise {
  if (chance(rng, 0.1)) {
    const n = draw(rng, SIZES[level]);
    return contrary(level, rng, n, n);
  }
  const [p, q] = twoSizes(level, rng);
  return contrary(level, rng, p, q);
}

const bigSmall = (ex: Exercise): [number, number] => {
  const [a, b] = operands(ex.expr).map(Math.abs) as [number, number];
  return a >= b ? [a, b] : [b, a];
};

function resolution(ex: Exercise): string[] {
  if (ex.answer.n === 0) return [toLatex(ex.expr), resultLine(ex)];
  const [big, small] = bigSmall(ex);
  return [toLatex(ex.expr), `= ${ex.answer.n < 0 ? '-' : '+'}(${big} - ${small})`, resultLine(ex)];
}

const errors = buildErrors(
  [
    {
      id: 'signe-du-mauvais-nombre',
      family: 'signe',
      detect: (ex, given) => ex.answer.n !== 0 && isOpposite(ex, given),
      text: () => "Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe).",
      // the larger (without sign) is negative, e.g. 3 + (−8)
      draw: (level, rng) => {
        const [p, q] = twoSizes(level, rng);
        return contrary(level, rng, Math.max(p, q), Math.min(p, q));
      },
      sample: (ex) => -ex.answer.n,
      // −3 + 5 = −(5 − 3) = −2
      wrongLines: (ex, w) => {
        const [big, small] = bigSmall(ex);
        return ex.answer.n !== 0 && w === -ex.answer.n ? stepped(ex, `${sg(w)}(${big} - ${small})`, w) : null;
      },
    },
    {
      id: 'addition-au-lieu-soustraction',
      family: 'calcul',
      detect: (ex, given) => absIs(given, bigSmall(ex)[0] + bigSmall(ex)[1]),
      text: (ex) => {
        const [big, small] = bigSmall(ex);
        return `Signes contraires : on **soustrait**. ${big} − ${small} = ${big - small}.`;
      },
      // the negative first, e.g. −7 + 4
      draw: (level, rng) => {
        const [p, q] = twoSizes(level, rng);
        return contrary(level, rng, p, q, true);
      },
      sample: (ex) => bigSmall(ex)[0] + bigSmall(ex)[1],
      alsoWrong: (ex) => [-(bigSmall(ex)[0] + bigSmall(ex)[1])],
      // −3 + 5 = +(5 + 3) = 8: the sign rule kept, the sizes added
      wrongLines: (ex, w) => {
        const [big, small] = bigSmall(ex);
        const r = ex.answer.n;
        return Math.abs(w) === big + small && (r === 0 || Math.sign(w) === Math.sign(r))
          ? stepped(ex, `${sg(w)}(${big} + ${small})`, w)
          : null;
      },
    },
  ],
  resolution,
);

const ex1 = (a: number, b: number): Exercise => sum(1, a, b);
const pairs = [ex1(-3, 5), ex1(4, -9), ex1(-6, 6), ex1(7, -2)];

export const c02: CourseDef = {
  id: ID,
  moduleId: MODULE_ID,
  order: 2,
  title: 'Additionner deux nombres de signes contraires',
  rule: RULE,
  parts: [
    explication(
      text('Tu dois 3 € et tu gagnes 5 €. Il te reste 2 €.'),
      { t: 'number-line', from: -4, to: 3, jumps: [{ from: -3, by: 5 }], animate: true },
      text("Le calcul s'écrit"),
      math('-3 + 5 = 2'),
    ),
    explication(
      text(RULE),
      text('−3 + 5 → signes contraires → 5 − 3 = 2 → 5 est le plus grand, il est positif → **2**'),
      text('4 + (−9) → signes contraires → 9 − 4 = 5 → 9 est le plus grand, il est négatif → **−5**'),
      text("−6 + 6 → **0** (deux opposés s'annulent)"),
    ),
    lecon(ordre(ex1(4, -9), ['Signes contraires', '9 − 4 = 5', '9 est le plus grand : signe −', 'Résultat : −5'], [1, 3, 0, 2])),
    lecon(saisie(ex1(-7, 2))),
    lecon({
      kind: 'paires',
      exs: pairs,
      left: pairs.map((e) => toLatex(e.expr)),
      right: [0, -5, 5, 2].map((v) => ({ latex: toLatex(num(v)), value: rat(v) })),
    }),
    exemple(trou(ex1(-8, 3), '-8 + 3 \\text{ : } 8 - 3 = \\square', 5)),
    exemple(trou(ex1(-8, 3), '-8 + 3 \\text{ : } 8 - 3 = 5 \\text{, le plus grand est 8, donc le résultat est } \\square', -5)),
    exemple(trou(ex1(9, -4), '9 + (-4) \\text{ : } 9 - 4 = \\square', 5)),
    exemple(trou(ex1(9, -4), '9 + (-4) \\text{ : } 9 - 4 = 5 \\text{, le plus grand est 9, donc le résultat est } \\square', 5)),
  ],
  endExercises: { count: 5, kind: 'saisie' },
  generate,
  errors,
  generalExplanation: (ex) => explanation(RULE, resolution(ex)),
  resolution,
  classes: SIGN_CLASSES,
  expectInteger: true,
};
