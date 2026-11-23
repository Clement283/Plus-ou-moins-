// Cours 5 — Multiplier deux relatifs (doc 06).
import { num, op, toLatex } from '../../math/expr';
import type { Rng } from '../../rng';
import type { CourseDef, Exercise, Level } from '../types';
import {
  MODULE_ID, SIGN_CLASSES, absIs, buildErrors, chance, draw, exemple, explanation, explication, is,
  isOpposite, lecon, makeExercise, math, operands, ordre, redraw, resultLine, saisie, sg, signBox, signClassOf,
  signs, stepped, text, trou,
} from './shared';

const ID = 'c05-multiplier-deux';
const RULE =
  'Même signe → résultat positif. Signes contraires → résultat négatif. Puis je multiplie les nombres sans leur signe.';

const product = (level: Level, a: number, b: number): Exercise => makeExercise(ID, level, op('*', num(a), num(b)));

type Range = [number, number];
/** Sizes of the two numbers: tables; one of 10–99 and one of 2–9; both of 10–99. */
const SIZES: Record<Level, [Range, Range]> = { 1: [[1, 9], [1, 9]], 2: [[10, 99], [2, 9]], 3: [[10, 99], [10, 99]] };
/** « petits nombres » of each level, for the addition trap. */
const SMALL: Record<Level, [Range, Range]> = { 1: [[2, 4], [2, 4]], 2: [[10, 15], [2, 4]], 3: [[10, 15], [10, 15]] };

function drawProduct(level: Level, rng: Rng, sizes: [Range, Range], [na, nb]: [boolean, boolean]): Exercise {
  const x = draw(rng, sizes[0]);
  const y = draw(rng, sizes[1]);
  const [a, b] = chance(rng, 0.5) ? [x, y] : [y, x];
  return product(level, na ? -a : a, nb ? -b : b);
}

const generate = (level: Level, rng: Rng): Exercise => drawProduct(level, rng, SIZES[level], signs(rng));

const sizes = (ex: Exercise): [number, number] => operands(ex.expr).map(Math.abs) as [number, number];

function resolution(ex: Exercise): string[] {
  const [a, b] = sizes(ex);
  return [toLatex(ex.expr), `= ${ex.answer.n < 0 ? '-' : '+'}(${a} \\times ${b})`, resultLine(ex)];
}

const errors = buildErrors(
  [
    {
      id: 'regle-signes',
      family: 'signe',
      detect: (ex, given) => ex.answer.n !== 0 && isOpposite(ex, given),
      text: () => '− × − = + et + × − = −. Deux signes pareils → + ; différents → −.',
      draw: (level, rng) => drawProduct(level, rng, SIZES[level], [true, true]),
      sample: (ex) => -ex.answer.n,
      // −3 × (−4) = −(3 × 4) = −12
      wrongLines: (ex, w) => {
        const [a, b] = sizes(ex);
        return w === -ex.answer.n ? stepped(ex, `${sg(w)}(${a} \\times ${b})`, w) : null;
      },
    },
    {
      id: 'addition-au-lieu-multiplication',
      family: 'calcul',
      detect: (ex, given) => {
        const [a, b] = operands(ex.expr) as [number, number];
        return is(given, a + b) || absIs(given, Math.abs(a) + Math.abs(b));
      },
      text: () => "Ici, c'est une **multiplication** : × et pas +.",
      draw: (level, rng) => drawProduct(level, rng, SMALL[level], signs(rng)),
      sample: (ex) => operands(ex.expr).reduce((s, x) => s + x, 0),
      alsoWrong: (ex) => {
        const [a, b] = sizes(ex);
        return [a + b, -(a + b)];
      },
      // −3 × (−4) = −3 + (−4) = −7, or = +(3 + 4) = 7 (the sign rule kept, the sizes added)
      wrongLines: (ex, w) => {
        const [x, y] = operands(ex.expr) as [number, number];
        const [a, b] = sizes(ex);
        if (w === x + y) return stepped(ex, toLatex(op('+', num(x), num(y))), w);
        return Math.abs(w) === a + b && Math.sign(w) === Math.sign(ex.answer.n)
          ? stepped(ex, `${sg(w)}(${a} + ${b})`, w)
          : null;
      },
    },
    {
      id: 'erreur-table',
      family: 'calcul',
      // same sign as the right answer, off by one of the two numbers (3 × 4 → 9, 15, 8 or 16)
      detect: (ex, given) => {
        const r = ex.answer.n;
        if (given.d !== 1 || given.n === 0 || Math.sign(given.n) !== Math.sign(r)) return false;
        return sizes(ex).some((x) => Math.abs(given.n) === Math.abs(r) + x || Math.abs(given.n) === Math.abs(r) - x);
      },
      text: (ex) => {
        const [a, b] = sizes(ex);
        return `Le signe est bon ! Vérifie la multiplication : ${a} × ${b} = ${a * b}.`;
      },
      // « les tables qu'elle a ratées » needs her history: here any table without 1.
      draw: (level, rng) => redraw(() => generate(level, rng), (ex) => sizes(ex).every((x) => x >= 2)),
      sample: (ex) => ex.answer.n + Math.sign(ex.answer.n) * (sizes(ex)[0] as number),
      alsoWrong: (ex) => {
        const r = ex.answer.n;
        return sizes(ex).flatMap((x) => [r + Math.sign(r) * x, r - Math.sign(r) * x]);
      },
      // −3 × (−4) = +(3 × 4) = 16: the sign is right, the table wrong
      wrongLines: (ex, w) => {
        const [a, b] = sizes(ex);
        const r = ex.answer.n;
        return w !== r && Math.sign(w) === Math.sign(r) ? stepped(ex, `${sg(r)}(${a} \\times ${b})`, w) : null;
      },
    },
  ],
  resolution,
);

const ex1 = (a: number, b: number): Exercise => product(1, a, b);
const toClass = [ex1(-2, 3), ex1(-4, -5), ex1(7, -1), ex1(2, 8)];

export const c05: CourseDef = {
  id: ID,
  moduleId: MODULE_ID,
  order: 5,
  title: 'Multiplier deux relatifs',
  shortTitle: 'Multiplier',
  rule: RULE,
  parts: [
    explication(
      math('+ \\times + = +'),
      math('- \\times - = +'),
      math('+ \\times - = -'),
      math('- \\times + = -'),
      text("Le moyen de s'en souvenir : « deux signes pareils → + ; deux signes différents → − »."),
    ),
    explication(
      text(RULE),
      text('−3 × (−4) → même signe → + → 3 × 4 = 12 → **12**'),
      text('6 × (−7) → signes contraires → − → 6 × 7 = 42 → **−42**'),
    ),
    lecon(ordre(ex1(-4, -3), ['Même signe → +', '4 × 3 = 12', 'Résultat : 12'], [1, 2, 0])),
    lecon(saisie(ex1(-8, 5))),
    lecon({
      kind: 'classer',
      exs: toClass,
      classes: SIGN_CLASSES.filter((c) => c.id !== 'zero').map(({ id, label }) => ({ id, label })),
      expected: toClass.map(signClassOf),
    }),
    exemple(signBox(ex1(-5, -6), true, 'regle-signes')),
    exemple(trou(ex1(-5, -6), '-5 \\times (-6) \\text{ : } 5 \\times 6 = \\square', 30)),
    exemple(trou(ex1(-5, -6), '-5 \\times (-6) = \\square', 30)),
    exemple(signBox(ex1(7, -3), false, 'regle-signes')),
    exemple(trou(ex1(7, -3), '7 \\times (-3) \\text{ : } 7 \\times 3 = \\square', 21)),
    exemple(trou(ex1(7, -3), '7 \\times (-3) = \\square', -21)),
  ],
  endExercises: { count: 5, kind: 'saisie' },
  generate,
  errors,
  generalExplanation: (ex) => explanation(RULE, resolution(ex)),
  resolution,
  classes: SIGN_CLASSES,
  expectInteger: true,
};
