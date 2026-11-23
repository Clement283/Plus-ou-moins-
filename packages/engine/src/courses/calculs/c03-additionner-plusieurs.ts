// Cours 3 — Additionner plusieurs relatifs (doc 06).
import { num, op, toLatex } from '../../math/expr';
import { type Rng, pick, randInt } from '../../rng';
import type { CourseDef, Exercise, Level } from '../types';
import {
  MODULE_ID, SIGN_CLASSES, absIs, buildErrors, chain, chance, draw, exemple, explanation, explication,
  is, isOpposite, lecon, makeExercise, math, operands, ordre, redraw, saisie, signed, text, trou,
} from './shared';

const ID = 'c03-additionner-plusieurs';
const RULE = 'Je regroupe les positifs, puis les négatifs, puis je termine avec la règle des signes contraires.';

const RANGE: Record<Level, [number, number]> = { 1: [1, 9], 2: [1, 20], 3: [10, 999] };
const COUNTS: Record<Level, number[]> = { 1: [3], 2: [4, 5], 3: [4] };

const sum = (level: Level, xs: number[]): Exercise => makeExercise(ID, level, chain('+', xs));
const mixed = (xs: number[]): boolean => xs.some((x) => x > 0) && xs.some((x) => x < 0);

/** Terms of the level with random signs, at least one positive and one negative. */
function drawTerms(level: Level, rng: Rng): number[] {
  const count = pick(rng, COUNTS[level]);
  return redraw(
    () => Array.from({ length: count }, () => signed(draw(rng, RANGE[level]), chance(rng, 0.5))),
    mixed,
  );
}

const generate = (level: Level, rng: Rng): Exercise => sum(level, drawTerms(level, rng));

const totals = (ex: Exercise): [number, number] => {
  const xs = operands(ex.expr);
  return [xs.filter((x) => x > 0).reduce((s, x) => s + x, 0), xs.filter((x) => x < 0).reduce((s, x) => s + x, 0)];
};
const sizeSum = (ex: Exercise): number => operands(ex.expr).reduce((s, x) => s + Math.abs(x), 0);

function resolution(ex: Exercise): string[] {
  const xs = operands(ex.expr);
  const [p, n] = totals(ex);
  const bodies = [
    toLatex(ex.expr),
    toLatex(chain('+', [...xs.filter((x) => x > 0), ...xs.filter((x) => x < 0)])),
    toLatex(op('+', num(p), num(n))),
    toLatex(num(ex.answer)),
  ];
  // an already grouped calculation does not repeat its first line
  return bodies.filter((b, i) => i === 0 || b !== bodies[i - 1]).map((b, i) => (i === 0 ? b : `= ${b}`));
}

/** The smallest size of the level, for a term that is easy to forget (doc: 1 or −1). */
const smallest = (level: Level): number => RANGE[level][0];

const errors = buildErrors(
  [
    {
      id: 'signe-inverse',
      family: 'signe',
      detect: (ex, given) => ex.answer.n !== 0 && isOpposite(ex, given),
      text: () => 'Regarde qui gagne : le total des positifs ou celui des négatifs ? Le résultat prend son signe.',
      // totals of the positives and of the negatives close to each other
      draw: (level, rng) =>
        redraw(
          () => generate(level, rng),
          (ex) => {
            const [p, n] = totals(ex);
            const r = Math.abs(ex.answer.n);
            return r > 0 && r <= Math.max(1, Math.round(0.2 * Math.max(p, -n)));
          },
        ),
      sample: (ex) => -ex.answer.n,
    },
    {
      id: 'tout-additionne',
      family: 'calcul',
      detect: (ex, given) => absIs(given, sizeSum(ex)),
      text: () => "Les négatifs ne s'ajoutent pas aux positifs : ils se **retranchent**. Regroupe-les d'abord.",
      draw: (level, rng) =>
        redraw(() => generate(level, rng), (ex) => operands(ex.expr).filter((x) => x < 0).length >= 2),
      sample: sizeSum,
      alsoWrong: (ex) => [-sizeSum(ex)],
    },
    {
      id: 'terme-oublie',
      family: 'calcul',
      detect: (ex, given) => operands(ex.expr).some((t) => is(given, ex.answer.n - t)),
      text: () => "Il manque un nombre : coche chaque terme quand tu l'as utilisé.",
      // one term of the smallest size, easy to forget
      draw: (level, rng) =>
        sum(
          level,
          redraw(() => {
            const xs = Array.from({ length: pick(rng, COUNTS[level]) }, () => signed(draw(rng, RANGE[level]), chance(rng, 0.5)));
            xs[randInt(rng, 0, xs.length - 1)] = signed(smallest(level), chance(rng, 0.5));
            return xs;
          }, mixed),
        ),
      // the term of smallest size forgotten (a trap has one of the level's smallest size)
      sample: (ex) => ex.answer.n - (operands(ex.expr).sort((x, y) => Math.abs(x) - Math.abs(y))[0] as number),
      alsoWrong: (ex) => operands(ex.expr).map((t) => ex.answer.n - t),
    },
  ],
  resolution,
);

const ex1 = (...xs: number[]): Exercise => sum(1, xs);

export const c03: CourseDef = {
  id: ID,
  moduleId: MODULE_ID,
  order: 3,
  title: 'Additionner plusieurs relatifs',
  rule: RULE,
  parts: [
    explication(
      math('-2 + 5 + (-4)'),
      text('Positifs : 5.'),
      text('Négatifs : −2 + (−4) = −6.'),
      text('Puis 5 + (−6) = −1.'),
    ),
    explication(
      text(RULE),
      math('3 + (-3) + 3'),
      text('positifs : 3 + 3 = 6'),
      text('négatifs : −3'),
      text('6 + (−3) = **3**'),
    ),
    lecon(ordre(ex1(7, -1, -8), ['Positifs : 7', 'Négatifs : −1 + (−8) = −9', '7 + (−9)', 'Résultat : −2'], [2, 0, 3, 1])),
    lecon(saisie(ex1(-2, 5, -4))),
    exemple(trou(ex1(6, -2, 4), '6 + (-2) + 4 \\text{ : positifs } 6 + 4 = \\square', 10)),
    exemple(trou(ex1(6, -2, 4), '6 + (-2) + 4 \\text{ : positifs } 6 + 4 = 10 \\text{ ; négatifs } -2 \\text{ ; résultat } \\square', 8)),
    exemple(trou(ex1(-5, 3, -1), '-5 + 3 + (-1) \\text{ : positifs } 3 \\text{ ; négatifs } -5 + (-1) = \\square', -6)),
    exemple(trou(ex1(-5, 3, -1), '-5 + 3 + (-1) \\text{ : positifs } 3 \\text{ ; négatifs } -5 + (-1) = -6 \\text{ ; résultat } \\square', -3)),
  ],
  endExercises: { count: 5, kind: 'saisie' },
  generate,
  errors,
  generalExplanation: (ex) => explanation(RULE, resolution(ex)),
  resolution,
  classes: SIGN_CLASSES,
  expectInteger: true,
};
