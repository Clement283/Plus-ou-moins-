// Cours 6 — Diviser deux relatifs (doc 06).
import { num, op, toLatex } from '../../math/expr';
import type { Rng } from '../../rng';
import type { CourseDef, Exercise, Level } from '../types';
import {
  MODULE_ID, SIGN_CLASSES, absIs, buildErrors, draw, exemple, explanation, explication, isOpposite, lecon,
  makeExercise, math, operands, ordre, resultLine, saisie, signBox, signed, signs, text, trou,
} from './shared';

const ID = 'c06-diviser-deux';
const RULE =
  'La même que pour multiplier : même signe → positif ; signes contraires → négatif. Puis je divise les nombres sans leur signe.';

type Range = [number, number];
const QUOTIENT: Record<Level, Range> = { 1: [1, 9], 2: [10, 30], 3: [10, 99] };
const DIVISOR: Record<Level, Range> = { 1: [2, 9], 2: [2, 9], 3: [10, 40] };

const quotient = (level: Level, a: number, b: number): Exercise => makeExercise(ID, level, op('/', num(a), num(b)));

/** The division is always exact: q and b are drawn, then a = q × b. Never a division by 0. */
function drawDivision(level: Level, rng: Rng, q: Range, [na, nb]: [boolean, boolean]): Exercise {
  const qq = draw(rng, q);
  const b = draw(rng, DIVISOR[level]);
  return quotient(level, signed(qq * b, na), signed(b, nb));
}

const generate = (level: Level, rng: Rng): Exercise => drawDivision(level, rng, QUOTIENT[level], signs(rng));

function resolution(ex: Exercise): string[] {
  const [a, b] = operands(ex.expr).map(Math.abs) as [number, number];
  return [toLatex(ex.expr), `= ${ex.answer.n < 0 ? '-' : '+'}(${a} \\div ${b})`, resultLine(ex)];
}

const errors = buildErrors(
  [
    {
      id: 'regle-signes',
      family: 'signe',
      detect: isOpposite,
      text: () => 'Même règle que pour × : signes pareils → + ; différents → −.',
      draw: (level, rng) => drawDivision(level, rng, QUOTIENT[level], [true, true]),
      sample: (ex) => -ex.answer.n,
    },
    {
      id: 'multiplication-au-lieu-division',
      family: 'calcul',
      detect: (ex, given) => absIs(given, Math.abs(operands(ex.expr).reduce((p, x) => p * x, 1))),
      text: () => "Ici, c'est une **division** : ÷ et pas ×.",
      // « petit quotient » : one of the 3 smallest quotients of the level, e.g. −8 ÷ (−4)
      draw: (level, rng) => drawDivision(level, rng, [QUOTIENT[level][0], QUOTIENT[level][0] + 2], signs(rng)),
      sample: (ex) => operands(ex.expr).reduce((p, x) => p * x, 1),
    },
  ],
  resolution,
);

const ex1 = (a: number, b: number): Exercise => quotient(1, a, b);

export const c06: CourseDef = {
  id: ID,
  moduleId: MODULE_ID,
  order: 6,
  title: 'Diviser deux relatifs',
  rule: RULE,
  parts: [
    explication(
      math('+ \\div + = +'),
      math('- \\div - = +'),
      math('+ \\div - = -'),
      math('- \\div + = -'),
      text("Bonne nouvelle : c'est la même règle !"),
    ),
    explication(
      text(RULE),
      text('−12 ÷ 4 → signes contraires → − → 12 ÷ 4 = 3 → **−3**'),
      text('−35 ÷ (−7) → même signe → + → 35 ÷ 7 = 5 → **5**'),
    ),
    lecon(ordre(ex1(24, -6), ['Signes contraires → −', '24 ÷ 6 = 4', 'Résultat : −4'], [2, 0, 1])),
    lecon(saisie(ex1(-18, -3))),
    exemple(signBox(ex1(-20, 5), false, 'regle-signes')),
    exemple(trou(ex1(-20, 5), '-20 \\div 5 \\text{ : } 20 \\div 5 = \\square', 4)),
    exemple(trou(ex1(-20, 5), '-20 \\div 5 = \\square', -4)),
    exemple(signBox(ex1(-36, -9), true, 'regle-signes')),
    exemple(trou(ex1(-36, -9), '-36 \\div (-9) \\text{ : } 36 \\div 9 = \\square', 4)),
    exemple(trou(ex1(-36, -9), '-36 \\div (-9) = \\square', 4)),
  ],
  endExercises: { count: 5, kind: 'saisie' },
  generate,
  errors,
  generalExplanation: (ex) => explanation(RULE, resolution(ex)),
  resolution,
  classes: SIGN_CLASSES,
  expectInteger: true,
};
