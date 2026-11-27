// Cours 2 du module Priorités (déroulé guidé) : × et ÷ passent avant + et −, puis on finit de gauche à droite.
// Fiche : docs/modules/03-priorites/priorites-fois-avant-plus.md
import type { Rng } from '../../rng';
import type { CourseDef, EtapeStep, Exercise, LessonPart, Level } from '../types';
import {
  NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, choix, decouverte, etapes, exemple, hl, lecon, linesScene,
  options3, redraw, small, step, texted, toks, trouOf,
} from '../calculs/shared';
import {
  type ErrDef, calculerGuided, coin, customOf, explainOf, feedbackOf, makeErrors, mkEx, mulBlock, positiveSteps, readable,
  resolutionOf, rnd, sgn, textOf, wrongOf,
} from './priorites-commun';

const ID = 'priorites-fois-avant-plus';
const RULE = 'Les × et les ÷ passent avant les + et les − ; je les calcule d’abord, puis je finis de gauche à droite.';

// ——— Exercice : des blocs de × et ÷ séparés par des + et des − ———
const RANGE: Record<Level, [number, number]> = { 1: [2, 9], 2: [3, 12], 3: [2, 12] };
function drawText(level: Level, rng: Rng): string {
  const lens =
    level === 1 ? (coin(rng) ? [1, 2] : [2, 1]) : level === 2 ? [[1, 2, 2], [2, 1, 2], [2, 2, 1]][rnd(rng, [0, 2])]! : coin(rng) ? [2, 3, 1] : [1, 2, 2, 2];
  const order = level === 3 ? [...lens].sort(() => rng() - 0.5) : lens;
  return order
    .map((len, k) => {
      const b = mulBlock(rng, len, RANGE[level], level === 3, k === 0).text;
      return k === 0 ? b : `${sgn(rng)} ${b}`;
    })
    .join(' ')
    .replace(/\+ \(-/g, '+ (-');
}
function generate(level: Level, rng: Rng): Exercise {
  return redraw(
    () => mkEx(ID, level, drawText(level, rng)),
    (ex) =>
      textOf(ex).length <= 30 && Math.abs(ex.answer.n) <= 200 && (level > 1 || positiveSteps(textOf(ex))) && wrongOf(ex, 'priorite').length > 0,
  );
}

/** Piège « gauche à droite » : un bloc a ÷ b × c dont la lecture de droite à gauche tombe aussi juste (24 ÷ 2 × 3 : 36 contre 4). */
function gdTrap(level: Level, rng: Rng): Exercise {
  return redraw(
    () => {
      const c = rnd(rng, [2, 4]);
      const d = rnd(rng, [2, 3]) * (level === 3 && coin(rng, 0.3) ? -1 : 1);
      const b = c * Math.abs(d) * rnd(rng, [1, 3]);
      const block = `${b} / ${c} * ${d < 0 ? `(${d})` : d}`;
      const head = level === 1 ? '' : `${rnd(rng, [2, 9])} * ${rnd(rng, [2, 6])} ${sgn(rng)} `;
      return mkEx(ID, level, `${head ? head : `${rnd(rng, [10, 60])} ${sgn(rng)} `}${block}`);
    },
    (ex) => textOf(ex).length <= 30 && (ex.level > 1 || positiveSteps(textOf(ex))) && wrongOf(ex, 'gauche-droite').length > 0,
  );
}

// ——— Erreurs reconnues ———
const RULE_1 = { n: 1, label: 'Les × et les ÷ d’abord', partIndex: 1 };
const RULE_2 = { n: 2, label: 'Le signe reste devant son bloc', partIndex: 3 };
const RULE_3 = { n: 3, label: 'Plusieurs blocs', partIndex: 5 };
const defs: ErrDef[] = [
  {
    id: 'priorite',
    family: 'calcul',
    rule: RULE_1,
    text: (ex) => `Dans ${readable(textOf(ex))}, les multiplications et les divisions passent avant les additions et les soustractions : on les calcule d’abord.`,
  },
  {
    id: 'gauche-droite',
    family: 'calcul',
    rule: RULE_3,
    draw: gdTrap,
    text: (ex) => `Dans ${readable(textOf(ex))}, quand il reste plusieurs opérations de même niveau, on va de gauche à droite : un bloc de × et ÷ se lit dans l’ordre, puis les + et −.`,
  },
];
const errors = makeErrors(defs, generate);

// ——— Leçon ———
const REGLE1 = '**Les multiplications et les divisions passent avant les additions et les soustractions.** On les calcule d’abord.';
const REGLE2 = '**Le signe + ou − reste devant son bloc.** Dans 10 − 6 ÷ 2, on calcule 6 ÷ 2 = 3, puis 10 − 3.';
const REGLE3 = '**Avec plusieurs blocs : je calcule chaque bloc de gauche à droite, puis je finis les + et − de gauche à droite.**';
const ex = (text: string): Exercise => mkEx(ID, 1, text);

const guess = choix(
  ex('3 + 4 * 2'),
  'À ton avis, combien vaut ce calcul ?',
  options3(
    ['11', 'Oui : on calcule 4 × 2 = 8 d’abord, puis 3 + 8 = 11. Le produit passe avant l’addition.'],
    ['14', 'C’est 7 × 2. Mais la multiplication passe avant l’addition : 4 × 2 = 8, puis 3 + 8 = 11.'],
    ['9', 'Ce n’est pas 3 + 4 + 2. Il y a une multiplication : 4 × 2 = 8, puis 3 + 8 = 11.'],
  ),
  0,
  '3 + 4 \\times 2',
);

const regle1: EtapeStep[] = [
  step('Dans **3 + 4 × 2**, il y a une addition et une multiplication. Imagine 3 billes, plus 4 sacs de 2 billes.', {
    scene: linesScene(['A = 3 + 4 × 2']),
  }),
  step('Le produit **4 × 2** colle ses deux nombres : on le calcule en premier, avant d’additionner.', {
    scene: linesScene(['A = 3 + 4 × 2']),
    after: linesScene(['A = 3 + ', hl('4 × 2')], ['A = 3 + ', hl('8')]),
    action: trouOf('On calcule d’abord [ ? ].', ['4 × 2', '3 + 4'], 0, {
      1: 'Additionner 3 et 4 d’abord donnerait 7 × 2 = 14 : c’est faux. La multiplication passe avant.',
    }),
  }),
  step(undefined, { scene: linesScene(['A = 3 + 4 × 2'], ['A = 3 + 8'], ['A = ', hl('11')]), rule: { n: 1, text: REGLE1 } }),
];

const regle2: EtapeStep[] = [
  step('Avec une soustraction et une division, c’est pareil. Dans **10 − 6 ÷ 2**, le bloc est **6 ÷ 2**.', {
    scene: linesScene(['B = 10 − ', hl('6 ÷ 2')]),
  }),
  step('Le signe moins reste devant son bloc : on calcule 6 ÷ 2 = 3, puis on retire 3 de 10.', {
    scene: linesScene(['B = 10 − 6 ÷ 2']),
    after: linesScene(['B = 10 − 6 ÷ 2'], ['B = 10 − ', hl('3')]),
    action: trouOf('Après 6 ÷ 2, il reste [ ? ].', ['10 − 3', '4 ÷ 2'], 0, {
      1: 'Dix moins six n’est pas fait en premier : la division passe avant. Il reste 10 − 3.',
    }),
  }),
  step(undefined, { scene: linesScene(['B = 10 − 6 ÷ 2'], ['B = 10 − 3'], ['B = ', hl('7')]), rule: { n: 2, text: REGLE2 } }),
];

const regle3: EtapeStep[] = [
  step('Dans **15 − 8 ÷ 2 × 3**, il y a un seul bloc : **8 ÷ 2 × 3**. Un bloc de × et ÷ se lit de gauche à droite.', {
    scene: linesScene(['C = 15 − ', hl('8 ÷ 2 × 3')]),
  }),
  step('On calcule le bloc dans l’ordre : 8 ÷ 2 fait 4, puis 4 × 3 fait 12.', {
    scene: linesScene(['C = 15 − 8 ÷ 2 × 3']),
    after: linesScene(['C = 15 − 8 ÷ 2 × 3'], ['C = 15 − ', hl('4'), ' × 3']),
    action: trouOf('Dans le bloc, on calcule d’abord [ ? ].', ['8 ÷ 2', '2 × 3'], 0, {
      1: 'Faire 2 × 3 d’abord donnerait 8 ÷ 6 : c’est faux. Dans un bloc, on va de gauche à droite.',
    }),
  }),
  step(undefined, { scene: linesScene(['C = 15 − 8 ÷ 2 × 3'], ['C = 15 − 4 × 3'], ['C = 15 − 12'], ['C = ', hl('3')]), rule: { n: 3, text: REGLE3 } }),
];

const exGuide = ex('-6 / 3 + 4 * (-2) - 5');

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Quelle opération en premier ?',
    intro: ['Quand un calcul mélange additions et multiplications, deux résultats sont possibles.', 'Ici, tu apprends laquelle on fait en premier, et pourquoi.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(RULE_1.label, regle1),
  lecon(
    small(ex('5 + 2 * 6'), '5 + 2 \\times 6', 'Dans 5 + 2 × 6, quelle opération fait-on en premier ?', [
      ['2 × 6', 'Oui : le produit passe avant l’addition. Deux fois six fait douze, puis cinq plus douze fait dix-sept.'],
      ['5 + 2', 'Cela donnerait 7 × 6 = 42. La multiplication passe avant l’addition.'],
      ['5 + 6', 'Ces deux nombres ne se suivent pas dans le calcul : le 6 est multiplié par 2.'],
    ], 0),
  ),
  etapes(RULE_2.label, regle2),
  lecon(
    small(ex('20 - 12 / 4'), '20 - 12 \\div 4', 'Combien vaut 20 − 12 ÷ 4 ?', [
      ['17', 'Oui : douze divisé par quatre fait trois, puis vingt moins trois fait dix-sept.'],
      ['2', 'Tu as fait 20 − 12 = 8 d’abord. La division passe avant : 12 ÷ 4 = 3, puis 20 − 3.'],
      ['8', 'Ce n’est pas 20 − 12. Le 12 est divisé par 4 avant d’être retiré de 20.'],
    ], 0),
  ),
  etapes(RULE_3.label, regle3),
  texted(
    decouverte(
      choix(
        ex('3 * 4 + 2'),
        'Lequel de ces deux calculs vaut 11 ?',
        options3(
          ['Le calcul A, 3 + 4 × 2', 'Oui : dans A, 4 × 2 = 8 puis 3 + 8 = 11. Dans B, 3 × 4 = 12 puis 12 + 2 = 14.'],
          ['Le calcul B, 3 × 4 + 2', 'Dans B, on calcule 3 × 4 = 12 d’abord, puis 12 + 2 = 14.'],
          ['Les deux', 'Le bloc n’est pas le même : 4 × 2 dans A, 3 × 4 dans B. Les résultats sont différents.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ['Regarde où se trouve la multiplication.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Calcul A', latex: '3 + 4 \\times 2' },
        b: { label: 'Calcul B', latex: '3 \\times 4 + 2' },
        note: '',
        inPlace: true,
        highlight: { a: toks('3 + ', hl('4 × 2')), b: toks(hl('3 × 4'), ' + 2') },
        after: ['Dans A, le bloc est 4 × 2 = 8, puis 3 + 8 = 11.', 'Dans B, le bloc est 3 × 4 = 12, puis 12 + 2 = 14.'],
      },
    },
  ),
  texted(exemple(calculerGuided(exGuide)), {
    title: 'On le fait ensemble',
    subtitle: 'Calcule −6 ÷ 3 + 4 × (−2) − 5, une opération par ligne. À chaque ligne, une aide te dit quoi faire.',
  }),
  annonceFin(),
];

const course: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 2,
  title: 'Les multiplications et les divisions d’abord',
  shortTitle: '× et ÷ d’abord',
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
    (e) => `Calcule d’abord les × et les ÷, puis finis de gauche à droite : ${readable(textOf(e))}.`,
  ),
  memo: {
    rule: RULE,
    ruleBullets: [
      'Les × et les ÷ passent avant les + et les −.',
      'Le signe reste devant son bloc : 10 − 6 ÷ 2 = 10 − 3.',
      'Plusieurs blocs : chaque bloc de gauche à droite, puis les + et − de gauche à droite.',
    ],
    examples: ['3 + 4 × 2 ; 3 + 8 ; 11', '15 − 8 ÷ 2 × 3 ; 15 − 4 × 3 ; 15 − 12 ; 3'],
    mistake: { wrong: '3 + 4 × 2 = 14', why: 'On a additionné d’abord. La multiplication passe avant : 4 × 2 = 8, puis 3 + 8 = 11.' },
    tip: 'Je souligne les blocs de × et ÷, je les calcule, puis je finis de gauche à droite.',
  },
};

export const priorites2 = course;
