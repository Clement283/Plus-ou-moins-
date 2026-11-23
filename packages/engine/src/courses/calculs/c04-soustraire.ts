// Cours 4 — Soustraire, c'est ajouter l'opposé (doc 06).
import { num, op, toLatex } from '../../math/expr';
import type { Rng } from '../../rng';
import type { CourseDef, Exercise, Level } from '../types';
import {
  MODULE_ID, SIGN_CLASSES, SIZES, buildErrors, chance, draw, exemple, explanation, explication, is,
  isOpposite, lecon, makeExercise, math, operands, redraw, resultLine, saisie, signed, stepped, text, toText, trou,
} from './shared';

const ID = 'c04-soustraire';
const RULE = "Soustraire un nombre, c'est ajouter son opposé. a − b = a + (−b), et a − (−b) = a + b.";

const diff = (level: Level, a: number, b: number): Exercise => makeExercise(ID, level, op('-', num(a), num(b)));
const someSigned = (level: Level, rng: Rng): number => signed(draw(rng, SIZES[level]), chance(rng, 0.5));

/** a and b positive or negative; b negative 1 time in 2. */
const generate = (level: Level, rng: Rng): Exercise => diff(level, someSigned(level, rng), someSigned(level, rng));

/** a − b written as an addition: a + (−b). */
const asAddition = (ex: Exercise) => {
  const [a, b] = operands(ex.expr) as [number, number];
  return op('+', num(a), num(-b));
};

const resolution = (ex: Exercise): string[] => [toLatex(ex.expr), `= ${toLatex(asAddition(ex))}`, resultLine(ex)];

const errors = buildErrors(
  [
    {
      id: 'signe-inverse',
      family: 'signe',
      detect: (ex, given) => ex.answer.n !== 0 && isOpposite(ex, given),
      text: () => "Transforme d'abord en addition, puis applique la règle : même signe ou signes contraires ?",
      // a smaller than b, e.g. 3 − 8
      draw: (level, rng) => redraw(() => generate(level, rng), (ex) => ex.answer.n < 0),
      sample: (ex) => -ex.answer.n,
      // 3 − 7 = 3 + (−7) = 4: the transformation is right, the final sign wrong
      wrongLines: (ex, w) =>
        ex.answer.n !== 0 && w === -ex.answer.n ? stepped(ex, toLatex(asAddition(ex)), w) : null,
    },
    {
      id: 'oppose-oublie',
      family: 'signe',
      detect: (ex, given) => is(given, operands(ex.expr).reduce((s, x) => s + x, 0)),
      text: (ex) => `Soustraire, c'est **ajouter l'opposé** : ${toText(ex.expr)} devient ${toText(asAddition(ex))}.`,
      // b negative, e.g. 6 − (−4)
      draw: (level, rng) => diff(level, someSigned(level, rng), -draw(rng, SIZES[level])),
      sample: (ex) => operands(ex.expr).reduce((s, x) => s + x, 0),
      // 5 − (−3) = 5 − 3 = 2 ; 3 − 7 = 3 + 7 = 10: the sign of b not changed
      wrongLines: (ex, w) => {
        const [a, b] = operands(ex.expr) as [number, number];
        if (w !== a + b) return null;
        return stepped(ex, toLatex(b < 0 ? op('-', num(a), num(-b)) : op('+', num(a), num(b))), w);
      },
    },
  ],
  resolution,
);

const ex1 = (a: number, b: number): Exercise => diff(1, a, b);

export const c04: CourseDef = {
  id: ID,
  moduleId: MODULE_ID,
  order: 4,
  title: "Soustraire, c'est ajouter l'opposé",
  rule: RULE,
  parts: [
    explication(
      text("Enlever une dette de 3 €, c'est comme gagner 3 €."),
      math('5 - (-3) = 5 + 3 = 8'),
      { t: 'anim', name: 'moins-moins-devient-plus' },
    ),
    explication(
      text(RULE),
      text("Je transforme, puis j'applique les cours 1 et 2 :"),
      text('5 − (−3) = 5 + 3 = **8**'),
      text('3 − 7 = 3 + (−7) = **−4**'),
      text('−4 − 6 = −4 + (−6) = **−10**'),
    ),
    lecon({
      kind: 'ordre',
      ex: ex1(5, -3),
      tiles: [
        { id: 't3', latex: '3' },
        { id: 't4', latex: '-' },
        { id: 't1', latex: '5' },
        { id: 't2', latex: '+' },
      ],
      solution: ['t1', 't2', 't3'],
      trapTile: { latex: '-', errorType: 'oppose-oublie' },
    }),
    lecon(saisie(ex1(-2, -9))),
    lecon({
      kind: 'erreur',
      ex: ex1(6, -2),
      lines: ['6 - (-2)', '= 6 - 2', '= 4'],
      wrongLine: 1,
      errorType: 'oppose-oublie',
    }),
    exemple(trou(ex1(6, -4), '6 - (-4) = 6 + \\square', 4)),
    exemple(trou(ex1(6, -4), '6 - (-4) = 6 + 4 = \\square', 10)),
    exemple(trou(ex1(2, 8), '2 - 8 = 2 + (\\square)', -8)),
    exemple(trou(ex1(2, 8), '2 - 8 = 2 + (-8) = \\square', -6)),
  ],
  endExercises: { count: 5, kind: 'saisie' },
  generate,
  errors,
  generalExplanation: (ex) => explanation(RULE, resolution(ex)),
  resolution,
  classes: SIGN_CLASSES,
  expectInteger: true,
};
