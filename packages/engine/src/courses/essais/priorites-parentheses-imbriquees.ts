// Cours 4 du module Priorités (déroulé guidé) : parenthèses dans des parenthèses ou des crochets, de l'intérieur vers l'extérieur.
// Fiche : docs/modules/03-priorites/priorites-parentheses-imbriquees.md
import type { Rng } from '../../rng';
import type { CourseDef, EtapeStep, Exercise, LessonPart, Level } from '../types';
import {
  NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, choix, decouverte, etapes, exemple, hl, lecon, linesScene,
  options3, redraw, small, step, texted, toks, trouOf,
} from '../calculs/shared';
import {
  type ErrDef, calculerGuided, coin, customOf, explainOf, feedbackOf, makeErrors, mkEx, positiveSteps, readable, resolutionOf, rnd, sgn,
  sumText, textOf, wrongOf,
} from './priorites-commun';
import { parseCalc } from '../../math/calcul';

const ID = 'priorites-parentheses-imbriquees';
const RULE = 'Quand des parenthèses sont dans d’autres parenthèses ou des crochets, je commence par les plus intérieures, puis je sors peu à peu.';

// ——— Exercice : une parenthèse dans un crochet ———
const signed = (rng: Rng, level: Level): number => (level > 1 && coin(rng, 0.4) ? -1 : 1);
/** La parenthèse intérieure, de valeur u : (7 + 2), (11 − 2). */
function inner(rng: Rng, level: Level): { text: string; v: number } {
  const v = rnd(rng, level === 1 ? [2, 8] : [2, 9]) * signed(rng, level);
  return { text: `(${sumText(rng, v, level === 1 ? 9 : 12)})`, v };
}
/** Le crochet [b ± (…)] ; si `want` est donné, sa valeur est `want`. */
function outer(rng: Rng, level: Level, want?: number): { text: string; v: number } | null {
  const i = inner(rng, level);
  const plus = coin(rng);
  const b = want === undefined ? rnd(rng, [2, 14]) : plus ? want - i.v : want + i.v;
  if (b < 1) return null;
  return { text: `[${b} ${plus ? '+' : '-'} ${i.text}]`, v: plus ? b + i.v : b - i.v };
}
const fact = (rng: Rng, level: Level): string => {
  const v = rnd(rng, [2, 9]);
  return level === 3 && coin(rng, 0.3) ? `(-${v})` : `${v}`;
};
function drawText(level: Level, rng: Rng): string {
  const t = rnd(rng, [1, level === 1 ? 4 : level === 2 ? 6 : 7]);
  if (t === 3) {
    const d = rnd(rng, [2, 6]);
    const o = outer(rng, level, d * rnd(rng, [1, 6]) * signed(rng, level));
    return o ? `${o.text} / ${d}` : '';
  }
  if (t === 6 || t === 7) {
    const i = inner(rng, level);
    const a = rnd(rng, [2, 12]);
    const b = rnd(rng, [2, 6]);
    return t === 6 ? `[${a} ${sgn(rng)} ${b} * ${i.text}]` : `[${i.text} * ${fact(rng, level)} ${sgn(rng)} ${rnd(rng, [2, 9])}] ${sgn(rng)} ${rnd(rng, [2, 9])}`;
  }
  const o = outer(rng, level);
  if (!o) return '';
  switch (t) {
    case 1: return `${fact(rng, level)} * ${o.text}`;
    case 2: return `${o.text} * ${fact(rng, level)}`;
    case 4: return `${rnd(rng, [2, 15])} ${sgn(rng)} ${o.text}`;
    default: return `${fact(rng, level)} * ${o.text} ${sgn(rng)} ${rnd(rng, [2, 15])}`;
  }
}
const fits = (ex: Exercise): boolean => textOf(ex).length <= 28 && Math.abs(ex.answer.n) <= 150 && (ex.level > 1 || positiveSteps(textOf(ex)));
const valid = (t: string): boolean => t !== '' && parseCalc(t).ok;
function generate(level: Level, rng: Rng): Exercise {
  return mkEx(
    ID,
    level,
    redraw(
      () => drawText(level, rng),
      (t) => {
        if (!valid(t)) return false;
        const ex = mkEx(ID, level, t);
        return fits(ex) && /\[/.test(t) && wrongOf(ex, 'ordre-parentheses').length > 0;
      },
    ),
  );
}

// ——— Erreurs reconnues ———
const RULE_1 = { n: 1, label: 'Les parenthèses les plus intérieures', partIndex: 1 };
const RULE_2 = { n: 2, label: 'Les crochets', partIndex: 3 };
const RULE_3 = { n: 3, label: 'Les priorités dans un crochet', partIndex: 5 };
const defs: ErrDef[] = [
  {
    id: 'priorite',
    family: 'calcul',
    rule: RULE_3,
    draw: (level, rng) =>
      mkEx(
        ID,
        level,
        redraw(
          () => (level === 1 ? `[${rnd(rng, [2, 9])} + ${rnd(rng, [2, 4])} * ${inner(rng, 1).text}] ${sgn(rng)} ${rnd(rng, [1, 5])}` : `[${rnd(rng, [2, 9])} ${sgn(rng)} ${rnd(rng, [2, 5])} * ${inner(rng, level).text}] ${sgn(rng)} ${rnd(rng, [1, 5])}`),
          (t) => {
            if (!valid(t)) return false;
            const ex = mkEx(ID, level, t);
            return fits(ex) && wrongOf(ex, 'priorite').length > 0;
          },
        ),
      ),
    text: (ex) => `Dans ${readable(textOf(ex))}, même dans un crochet, la multiplication passe avant l’addition et la soustraction.`,
  },
  {
    id: 'parenthese',
    family: 'calcul',
    rule: RULE_2,
    text: (ex) => `Dans ${readable(textOf(ex))}, les parenthèses et les crochets passent en premier : on ne les ignore pas.`,
  },
  {
    id: 'moins-parenthese',
    family: 'signe',
    draw: (level, rng) => mkEx(ID, level, `${rnd(rng, [10, 30])} - (${rnd(rng, [2, 9])} ${sgn(rng)} ${rnd(rng, [2, 9])})`),
    rule: RULE_2,
    text: (ex) => `Dans ${readable(textOf(ex))}, on calcule d’abord la parenthèse. Si on l’enlève, le − devant change le signe de chaque terme qui est dedans.`,
  },
  {
    id: 'ordre-parentheses',
    family: 'calcul',
    rule: RULE_1,
    text: (ex) => `Dans ${readable(textOf(ex))}, on commence par la parenthèse la plus intérieure, avant de calculer ce qui l’entoure dans le crochet.`,
  },
];
const errors = makeErrors(defs, generate);

// ——— Leçon ———
const REGLE1 = '**Quand des parenthèses sont dans d’autres, je commence par les plus intérieures.** Je sors ensuite peu à peu, une opération par ligne.';
const REGLE2 = '**Les crochets [ ] sont des parenthèses plus grandes.** Ils servent à mieux lire : je les calcule quand il n’y a plus de parenthèse dedans.';
const REGLE3 = '**Dans un crochet aussi, j’applique les priorités :** les × et les ÷, puis les + et − de gauche à droite.';
const ex = (text: string): Exercise => mkEx(ID, 1, text);

const guess = choix(
  ex('3 * [10 - (4 + 2)]'),
  'À ton avis, que faut-il calculer en premier dans ce calcul ?',
  options3(
    ['4 + 2', 'Oui : c’est la parenthèse la plus intérieure. 4 + 2 = 6, puis 10 − 6 = 4, puis 3 × 4 = 12.'],
    ['10 − 4', 'Ce serait ignorer la parenthèse. Elle enferme 4 + 2 : on la calcule d’abord, 6.'],
    ['3 × 10', 'La multiplication par 3 se fait à la fin : elle porte sur tout le crochet.'],
  ),
  0,
  '3 \\times [10 - (4 + 2)]',
);

const regle1: EtapeStep[] = [
  step('Dans **3 × [10 − (4 + 2)]**, une parenthèse est dans un crochet. Comme des poupées russes, on ouvre la **plus petite** en premier.', {
    scene: linesScene(['A = 3 × [10 − ', hl('(4 + 2)'), ']']),
  }),
  step('La parenthèse la plus intérieure est (4 + 2). Elle vaut 6 : il reste 3 × [10 − 6].', {
    scene: linesScene(['A = 3 × [10 − (4 + 2)]']),
    after: linesScene(['A = 3 × [10 − (4 + 2)]'], ['A = 3 × [10 − ', hl('6'), ']']),
    action: trouOf('On calcule d’abord [ ? ].', ['4 + 2', '10 − 4'], 0, {
      1: 'Faire 10 − 4 d’abord donnerait 3 × [6 + 2] = 24 : c’est faux. La parenthèse intérieure passe en premier.',
    }),
  }),
  step(undefined, { scene: linesScene(['A = 3 × [10 − (4 + 2)]'], ['A = 3 × [10 − 6]'], ['A = 3 × ', hl('4')]), rule: { n: 1, text: REGLE1 } }),
];

const regle2: EtapeStep[] = [
  step('Quand il ne reste plus de parenthèse dans le crochet, on **calcule le crochet** : [10 − 6] vaut 4.', {
    scene: linesScene(['A = 3 × [10 − 6]']),
    after: linesScene(['A = 3 × [10 − 6]'], ['A = 3 × ', hl('4')]),
  }),
  step('Le crochet est devenu le nombre 4 : il reste une seule opération, 3 × 4.', {
    scene: linesScene(['A = 3 × [10 − (4 + 2)]'], ['A = 3 × [10 − 6]'], ['A = 3 × 4']),
    after: linesScene(['A = 3 × [10 − (4 + 2)]'], ['A = 3 × [10 − 6]'], ['A = 3 × 4'], ['A = ', hl('12')]),
    action: trouOf('Un crochet se calcule comme une [ ? ].', ['parenthèse', 'addition'], 0, {
      1: 'Un crochet n’est pas une opération : c’est une parenthèse plus grande, qu’on calcule comme une parenthèse.',
    }),
  }),
  step(undefined, { scene: linesScene(['A = 3 × [10 − (4 + 2)]'], ['A = 3 × [10 − 6]'], ['A = 3 × 4'], ['A = ', hl('12')]), rule: { n: 2, text: REGLE2 } }),
];

const regle3: EtapeStep[] = [
  step('Dans **[2 + 3 × (8 − 5)] − 1**, on commence par la parenthèse (8 − 5) = 3. Il reste [2 + 3 × 3] − 1.', {
    scene: linesScene(['B = [2 + 3 × ', hl('(8 − 5)'), '] − 1']),
    after: linesScene(['B = [2 + 3 × (8 − 5)] − 1'], ['B = [2 + 3 × ', hl('3'), '] − 1']),
  }),
  step('Dans le crochet, il y a une addition et une multiplication : le produit passe avant.', {
    scene: linesScene(['B = [2 + 3 × (8 − 5)] − 1'], ['B = [2 + 3 × 3] − 1']),
    after: linesScene(['B = [2 + 3 × (8 − 5)] − 1'], ['B = [2 + 3 × 3] − 1'], ['B = [2 + ', hl('9'), '] − 1']),
    action: trouOf('Dans [2 + 3 × 3], on calcule d’abord [ ? ].', ['3 × 3', '2 + 3'], 0, {
      1: 'Additionner 2 et 3 d’abord donnerait 5 × 3 = 15 : c’est faux. Le produit passe avant.',
    }),
  }),
  step(undefined, {
    scene: linesScene(['B = [2 + 3 × (8 − 5)] − 1'], ['B = [2 + 3 × 3] − 1'], ['B = [2 + 9] − 1'], ['B = 11 − 1'], ['B = ', hl('10')]),
    rule: { n: 3, text: REGLE3 },
  }),
];

const exGuide = ex('4 * [2 + (9 - 5) * 3]');

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Par où commencer ?',
    intro: ['Parfois, des parenthèses sont dans d’autres parenthèses, ou dans des crochets.', 'Ici, tu apprends par où commencer, et comment en sortir.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(RULE_1.label, regle1),
  lecon(
    small(ex('2 * [9 - (3 + 1)]'), '2 \\times [9 - (3 + 1)]', 'Dans 2 × [9 − (3 + 1)], que calcule-t-on en premier ?', [
      ['3 + 1', 'Oui : la parenthèse la plus intérieure. 3 + 1 = 4, puis 9 − 4 = 5, puis 2 × 5 = 10.'],
      ['9 − 3', 'Cela donnerait 2 × [6 + 1] = 14. La parenthèse (3 + 1) passe en premier.'],
      ['2 × 9', 'Le 2 multiplie tout le crochet : cette multiplication vient en dernier.'],
    ], 0),
  ),
  etapes(RULE_2.label, regle2),
  lecon(
    small(ex('[12 - (2 + 3)] * 2'), '[12 - (2 + 3)] \\times 2', 'Combien vaut [12 − (2 + 3)] × 2 ?', [
      ['14', 'Oui : 2 + 3 = 5, puis 12 − 5 = 7, puis 7 × 2 = 14.'],
      ['26', 'Tu as ignoré la parenthèse : 12 − 2 + 3 = 13, puis 13 × 2 = 26. La parenthèse (2 + 3) vaut 5 : 12 − 5 = 7, puis 7 × 2 = 14.'],
      ['7', 'Tu as calculé le crochet seulement. Il reste à multiplier par 2 : 7 × 2 = 14.'],
    ], 0),
  ),
  etapes(RULE_3.label, regle3),
  texted(
    decouverte(
      choix(
        ex('10 - (4 + 2)'),
        'Lequel de ces deux calculs vaut 4 ?',
        options3(
          ['Le calcul A, 10 − (4 + 2)', 'Oui : dans A, 4 + 2 = 6 puis 10 − 6 = 4. Dans B, 10 − 4 = 6 puis 6 + 2 = 8.'],
          ['Le calcul B, 10 − 4 + 2', 'Dans B, il n’y a pas de parenthèse : de gauche à droite, 10 − 4 = 6, puis 6 + 2 = 8.'],
          ['Les deux', 'La parenthèse change le calcul : A donne 4 et B donne 8.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ['Regarde la parenthèse.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Calcul A', latex: '10 - (4 + 2)' },
        b: { label: 'Calcul B', latex: '10 - 4 + 2' },
        note: '',
        inPlace: true,
        highlight: { a: toks('10 − ', hl('(4 + 2)')), b: toks('10 − 4 + 2') },
        after: ['Dans A, on calcule (4 + 2) = 6, puis 10 − 6 = 4.', 'Dans B, on va de gauche à droite : 10 − 4 = 6, puis 6 + 2 = 8.'],
      },
    },
  ),
  texted(exemple(calculerGuided(exGuide)), {
    title: 'On le fait ensemble',
    subtitle: 'Calcule 4 × [2 + (9 − 5) × 3], une opération par ligne. À chaque ligne, une aide te dit quoi faire.',
  }),
  annonceFin(),
];

const course: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 4,
  title: 'Des parenthèses dans des parenthèses',
  shortTitle: 'Parenthèses imbriquées',
  rule: RULE,
  parts,
  lessonLength: parts.findIndex((p) => p.type === 'question' && p.activity === 'exemple'),
  unePhrase: true,
  endExercises: { count: 5, kind: 'saisie', mix: ['calculer', 'calculer', 'calculer', 'calculer', 'calculer'] },
  formats: ['saisie', 'calculer', 'calculer'],
  generate,
  errors,
  generalExplanation: explainOf(RULE),
  resolution: resolutionOf,
  classes: SIGN_CLASSES,
  expectInteger: true,
  customQuestion: customOf(() => course),
  feedbackText: feedbackOf(
    () => course.errors,
    (e) => `Commence par la parenthèse la plus intérieure, puis sors peu à peu : ${readable(textOf(e))}.`,
  ),
  memo: {
    rule: RULE,
    ruleBullets: [
      'Des parenthèses dans d’autres : je commence par les plus intérieures.',
      'Les crochets sont des parenthèses plus grandes : je les calcule ensuite.',
      'Dans un crochet aussi, × et ÷ passent avant + et −.',
    ],
    examples: ['3 × [10 − (4 + 2)] ; 3 × [10 − 6] ; 3 × 4 ; 12', '[2 + 3 × (8 − 5)] − 1 ; [2 + 3 × 3] − 1 ; [2 + 9] − 1 ; 10'],
    mistake: { wrong: '3 × [10 − (4 + 2)] = 24', why: 'On a fait 10 − 4 avant la parenthèse intérieure. On commence par (4 + 2) = 6 : 3 × [10 − 6] = 12.' },
    tip: 'Je repère la parenthèse la plus intérieure, je la calcule, et je recommence.',
  },
};

export const priorites4 = course;
