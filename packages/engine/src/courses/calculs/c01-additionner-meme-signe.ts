// Cours 1 — Additionner deux nombres de même signe (doc 06).
import { num, op, toLatex } from '../../math/expr';
import type { Rng } from '../../rng';
import type { CourseDef, Exercise, Level } from '../types';
import {
  MODULE_ID, SIGN_CLASSES, SIZES, absIs, buildErrors, chance, draw, exemple, explanation, explication,
  isOpposite, lecon, makeExercise, math, operands, ordre, resultLine, saisie, sg, signed, stepped, text, trou, txt, attention, ko, ok, ordered, titled
} from './shared';

const ID = 'c01-additionner-meme-signe';
const RULE = "Même signe : j'additionne les nombres sans leur signe, et je garde le signe.";

const sum = (level: Level, a: number, b: number): Exercise => makeExercise(ID, level, op('+', num(a), num(b)));

function generate(level: Level, rng: Rng): Exercise {
  const negative = chance(rng, 0.7);
  return sum(level, signed(draw(rng, SIZES[level]), negative), signed(draw(rng, SIZES[level]), negative));
}

function resolution(ex: Exercise): string[] {
  const [a, b] = operands(ex.expr).map(Math.abs) as [number, number];
  const sign = ex.answer.n < 0 ? '-' : '+';
  return [toLatex(ex.expr), `= ${sign}(${a} + ${b})`, resultLine(ex)];
}

const errors = buildErrors(
  [
    {
      id: 'signe-oublie',
      family: 'signe',
      detect: isOpposite,
      // Doc 07 #6A: the sentence follows the sign of the two numbers.
      text: (ex) =>
        ex.answer.n < 0
          ? 'Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − !'
          : 'Les deux nombres sont positifs : le résultat est positif aussi.',
      draw: (level, rng) => sum(level, -draw(rng, SIZES[level]), -draw(rng, SIZES[level])),
      sample: (ex) => -ex.answer.n,
      // −3 + (−5) = +(3 + 5) = 8
      wrongLines: (ex, w) => {
        const [a, b] = operands(ex.expr).map(Math.abs) as [number, number];
        return w === -ex.answer.n ? stepped(ex, `${sg(w)}(${a} + ${b})`, w) : null;
      },
    },
    {
      id: 'soustraction-au-lieu-addition',
      family: 'calcul',
      detect: (ex, given) => {
        const [a, b] = operands(ex.expr).map(Math.abs) as [number, number];
        return absIs(given, Math.abs(a - b));
      },
      text: (ex) => {
        const [a, b] = operands(ex.expr).map(Math.abs) as [number, number];
        return `Même signe : on **additionne** les nombres, on ne les soustrait pas. ${a} + ${b} = ${a + b}, donc ${txt(ex.answer.n)}.`;
      },
      // « deux nombres d'écart important » : the larger is at least 3 times the smaller.
      draw: (level, rng) => {
        const [lo, hi] = SIZES[level];
        const small = draw(rng, [lo, Math.floor(hi / 3)]);
        const big = draw(rng, [3 * small, hi]);
        const negative = chance(rng, 0.7);
        const [a, b] = chance(rng, 0.5) ? [small, big] : [big, small];
        return sum(level, signed(a, negative), signed(b, negative));
      },
      sample: (ex) => {
        const [a, b] = operands(ex.expr).map(Math.abs) as [number, number];
        return Math.sign(ex.answer.n) * Math.abs(a - b);
      },
      alsoWrong: (ex) => {
        const [a, b] = operands(ex.expr).map(Math.abs) as [number, number];
        return [Math.abs(a - b), -Math.abs(a - b)];
      },
      // −3 + (−5) = −(5 − 3) = −2: the sign kept, the sizes subtracted
      wrongLines: (ex, w) => {
        const [a, b] = operands(ex.expr).map(Math.abs) as [number, number];
        const [big, small] = a >= b ? [a, b] : [b, a];
        const r = ex.answer.n;
        return Math.abs(w) === big - small && (w === 0 || Math.sign(w) === Math.sign(r))
          ? stepped(ex, `${sg(r)}(${big} - ${small})`, w)
          : null;
      },
    },
  ],
  resolution,
);

const ex1 = (a: number, b: number): Exercise => sum(1, a, b);

export const c01: CourseDef = {
  id: ID,
  moduleId: MODULE_ID,
  order: 1,
  title: 'Additionner deux nombres de même signe',
  shortTitle: 'Même signe',
  rule: RULE,
  parts: [
    titled('Deux dettes font une plus grande dette', 'Tu dois 3 €, puis encore 5 €.', explication(
      text('Tu dois 3 €, puis encore 5 €. Tu dois 8 € en tout.'),
      { t: 'number-line', from: -9, to: 1, jumps: [{ from: 0, by: -3 }, { from: -3, by: -5 }], animate: true },
      text("Le calcul s'écrit"),
      math('-3 + (-5) = -8'),
    )),
    titled('Même signe : j\'additionne, je garde le signe', undefined, explication(
      text(RULE),
      ok('−3 + (−5) = −(3 + 5) = **−8**'),
      ok('4 + 6 = **10**'),
      ...attention(
        ko('−3 + (−5) = 8', 'Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − !'),
      ),
    )),
    ordered(
      '−2 + (−7)',
      lecon(
        ordre(ex1(-2, -7), ['Les deux sont négatifs', '2 + 7 = 9', 'Je garde le signe −', 'Résultat : −9'], [2, 0, 3, 1]),
      ),
    ),
    lecon(saisie(ex1(-2, -6))),
    exemple(trou(ex1(-4, -9), '-4 + (-9) = -(4 + \\square)', 9)),
    exemple(trou(ex1(-4, -9), '-4 + (-9) = -(4 + 9) = \\square', -13)),
    exemple(trou(ex1(-6, -1), '-6 + (-1) = -(\\square + 1)', 6)),
    exemple(trou(ex1(-6, -1), '-6 + (-1) = -(6 + 1) = \\square', -7)),
  ],
  endExercises: { count: 5, kind: 'saisie' },
  generate,
  errors,
  generalExplanation: (ex) => explanation(RULE, resolution(ex)),
  resolution,
  classes: SIGN_CLASSES,
  expectInteger: true,
};
