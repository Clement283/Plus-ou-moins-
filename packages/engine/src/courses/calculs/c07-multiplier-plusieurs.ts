// Cours 7 — Multiplier plusieurs relatifs (doc 06).
import { toLatex } from '../../math/expr';
import type { Rng } from '../../rng';
import type { CourseDef, Exercise, Level } from '../types';
import {
  MODULE_ID, SIGN_CLASSES, absIs, buildErrors, chain, chance, draw, exemple, explanation, explication, is,
  isOpposite, lecon, makeExercise, math, operands, ordre, redraw, resultLine, saisie, sg, signBox, signed, stepped, text,
  trou, attention, ko, ok, ordered, titled
} from './shared';

const ID = 'c07-multiplier-plusieurs';
const RULE =
  'Je compte les signes − : nombre pair → résultat positif ; nombre impair → résultat négatif. Puis je multiplie les nombres sans leur signe.';

const COUNT: Record<Level, number> = { 1: 3, 2: 4, 3: 5 };
const MAX: Record<Level, number> = { 1: 5, 2: 5, 3: 6 };

const product = (level: Level, xs: number[]): Exercise => makeExercise(ID, level, chain('*', xs));
const negatives = (xs: number[]): number => xs.filter((x) => x < 0).length;

/** COUNT[level] factors of sizes 1..max, at least one negative. */
function drawFactors(level: Level, rng: Rng, max: number): number[] {
  return redraw(
    () => Array.from({ length: COUNT[level] }, () => signed(draw(rng, [1, max]), chance(rng, 0.5))),
    (xs) => negatives(xs) >= 1,
  );
}

const generate = (level: Level, rng: Rng): Exercise => product(level, drawFactors(level, rng, MAX[level]));

const sum = (ex: Exercise): number => operands(ex.expr).reduce((s, x) => s + x, 0);

function resolution(ex: Exercise): string[] {
  const sizes = operands(ex.expr).map(Math.abs);
  return [toLatex(ex.expr), `= ${ex.answer.n < 0 ? '-' : '+'}(${sizes.join(' \\times ')})`, resultLine(ex)];
}

const errors = buildErrors(
  [
    {
      id: 'parite-signes',
      family: 'signe',
      detect: isOpposite,
      text: () => 'Compte les signes − : pair → + ; impair → −.',
      // an even number of negatives (2 or 4)
      draw: (level, rng) =>
        product(level, redraw(() => drawFactors(level, rng, MAX[level]), (xs) => [2, 4].includes(negatives(xs)))),
      sample: (ex) => -ex.answer.n,
      // −2 × 3 × (−4) = −(2 × 3 × 4) = −24
      wrongLines: (ex, w) => {
        const xs = operands(ex.expr).map(Math.abs);
        return w === -ex.answer.n ? stepped(ex, `${sg(w)}(${xs.join(' \\times ')})`, w) : null;
      },
    },
    {
      id: 'addition-au-lieu-multiplication',
      family: 'calcul',
      detect: (ex, given) => is(given, sum(ex)) || absIs(given, operands(ex.expr).reduce((s, x) => s + Math.abs(x), 0)),
      text: () => 'Ici, on **multiplie** tous les nombres.',
      // small factors (1 to 3)
      draw: (level, rng) => product(level, drawFactors(level, rng, 3)),
      sample: sum,
      alsoWrong: (ex) => {
        const sizes = operands(ex.expr).reduce((s, x) => s + Math.abs(x), 0);
        return [sizes, -sizes];
      },
      // −2 × 3 × (−4) = −2 + 3 + (−4) = −3, or = +(2 + 3 + 4) = 9 (the sign rule kept, the sizes added)
      wrongLines: (ex, w) => {
        const xs = operands(ex.expr);
        if (w === sum(ex)) return stepped(ex, toLatex(chain('+', xs)), w);
        const abs = xs.map(Math.abs);
        return Math.abs(w) === abs.reduce((s, x) => s + x, 0) && Math.sign(w) === Math.sign(ex.answer.n)
          ? stepped(ex, `${sg(w)}(${abs.join(' + ')})`, w)
          : null;
      },
    },
  ],
  resolution,
);

const ex1 = (...xs: number[]): Exercise => product(1, xs);
const ex2 = (...xs: number[]): Exercise => product(2, xs);

export const c07: CourseDef = {
  id: ID,
  moduleId: MODULE_ID,
  order: 7,
  title: 'Multiplier plusieurs relatifs',
  shortTitle: 'Multiplier plusieurs',
  rule: RULE,
  parts: [
    titled('Je compte les signes moins', "Deux signes −, c'est pair : le résultat est positif.", explication(
      math('-2 \\times 3 \\times (-4)'),
      { t: 'anim', name: 'compter-les-moins' },
      text("2 signes −, c'est pair, donc le résultat est positif."),
      text('Puis 2 × 3 × 4 = 24 → **24**.'),
    )),
    titled('Pair donne +, impair donne −', 'Je compte les −, puis je multiplie.', explication(
      text(RULE),
      ok('−1 × (−5) × (−2) : 3 signes − → impair → **−10**'),
      ok('4 × (−3) × 2 : 1 signe − → impair → **−24**'),
      ...attention(
        ko('−2 × 3 × (−4) = −24', 'Compte les signes − : pair → + ; impair → −.'),
      ),
    )),
    ordered(
      '−2 × (−3) × (−1) × 4',
      lecon(
        ordre(
          ex2(-2, -3, -1, 4),
          ['Je compte les − : 3', '3 est impair → −', '2 × 3 × 1 × 4 = 24', 'Résultat : −24'],
          [3, 1, 0, 2],
        ),
      ),
    ),
    lecon(saisie(ex1(-2, 3, -4))),
    exemple(trou(ex1(-3, -2, -2), '-3 \\times (-2) \\times (-2) \\text{ : nombre de signes } - = \\square', 3)),
    exemple(signBox(ex1(-3, -2, -2), false, 'parite-signes')),
    exemple(trou(ex1(-3, -2, -2), '-3 \\times (-2) \\times (-2) \\text{ : } 3 \\times 2 \\times 2 = \\square', 12)),
    exemple(trou(ex1(-3, -2, -2), '-3 \\times (-2) \\times (-2) = \\square', -12)),
    exemple(trou(ex1(5, -1, -2), '5 \\times (-1) \\times (-2) \\text{ : nombre de signes } - = \\square', 2)),
    exemple(signBox(ex1(5, -1, -2), true, 'parite-signes')),
    exemple(trou(ex1(5, -1, -2), '5 \\times (-1) \\times (-2) \\text{ : } 5 \\times 1 \\times 2 = \\square', 10)),
    exemple(trou(ex1(5, -1, -2), '5 \\times (-1) \\times (-2) = \\square', 10)),
  ],
  endExercises: { count: 5, kind: 'saisie' },
  generate,
  errors,
  generalExplanation: (ex) => explanation(RULE, resolution(ex)),
  resolution,
  classes: SIGN_CLASSES,
  expectInteger: true,
};
