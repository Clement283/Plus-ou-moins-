// Cours 7 du module Priorités (déroulé guidé), partie nombres : un moins devant une parenthèse change le signe de chaque terme.
// Fiche : docs/modules/03-priorites/priorites-moins-devant-parenthese.md
// PARTIE LETTRES (−(x − 3) = −x + 3) : pas encore codée ; à insérer dans `parts` juste avant l'exemple guidé (les partIndex des règles ne bougent pas).
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

const ID = 'priorites-moins-devant-parenthese';
const RULE = 'Un + devant une parenthèse ne change rien ; un − devant une parenthèse change le signe de chaque terme.';

// ——— Exercice : une parenthèse précédée de + ou de − ———
/** Le contenu d'une parenthèse : « 3 + 2 », « 3 - 2 », au niveau 3 aussi « -3 + 5 ». */
function inside(rng: Rng, level: Level): string {
  const hi = level === 1 ? 9 : 15;
  const a = rnd(rng, [2, hi]);
  const b = rnd(rng, [2, hi]);
  if (level === 3 && coin(rng, 0.35)) return `-${a} ${sgn(rng)} ${b}`;
  return `${a} ${sgn(rng)} ${b}`;
}
function drawText(level: Level, rng: Rng): string {
  const a = rnd(rng, level === 1 ? [6, 20] : [5, 40]);
  const minus = !coin(rng, 0.25);
  const head = `${a} ${minus ? '-' : '+'} (${inside(rng, level)})`;
  if (level === 1) return head;
  const tail = `${sgn(rng)} ${rnd(rng, [2, 15])}`;
  if (level === 2) return coin(rng) ? `${head} ${tail}` : `${rnd(rng, [2, 15])} + ${head}`;
  return `${head} - (${inside(rng, level)})`;
}
const fits = (ex: Exercise): boolean => textOf(ex).length <= 28 && Math.abs(ex.answer.n) <= 150 && (ex.level > 1 || positiveSteps(textOf(ex)));
function generate(level: Level, rng: Rng): Exercise {
  return redraw(() => mkEx(ID, level, drawText(level, rng)), (ex) => fits(ex) && wrongOf(ex, 'parenthese').length > 0);
}
/** Piège « signe » : un + devant la parenthèse, dont on change des signes à tort (8 + (3 − 2) lu 8 + 3 + 2). */
function signeTrap(level: Level, rng: Rng): Exercise {
  return redraw(
    () => mkEx(ID, level, `${rnd(rng, [5, 30])} + (${sumText(rng, rnd(rng, [2, 9]), 12)})`),
    (ex) => fits(ex) && wrongOf(ex, 'signe').length > 0,
  );
}

// ——— Erreurs reconnues ———
const RULE_1 = { n: 1, label: 'Un plus devant la parenthèse', partIndex: 1 };
const RULE_2 = { n: 2, label: 'Un moins devant la parenthèse', partIndex: 3 };
const RULE_3 = { n: 3, label: 'Deux chemins, même résultat', partIndex: 5 };
const defs: ErrDef[] = [
  {
    id: 'parenthese',
    family: 'signe',
    rule: RULE_2,
    text: (ex) => `Dans ${readable(textOf(ex))}, le − devant la parenthèse change le signe de chaque terme qui est dedans : un + devient −, un − devient +.`,
  },
  {
    id: 'signe',
    family: 'signe',
    rule: RULE_1,
    draw: signeTrap,
    text: (ex) => `Dans ${readable(textOf(ex))}, regarde le signe devant la parenthèse : un + ne change aucun signe, et un résultat négatif de la parenthèse reste négatif.`,
  },
];
const errors = makeErrors(defs, generate);

// ——— Leçon ———
const REGLE1 = '**Un + devant une parenthèse ne change rien :** j’enlève la parenthèse et je recopie les signes tels quels.';
const REGLE2 = '**Un − devant une parenthèse change le signe de chaque terme qui est dedans :** un + devient −, un − devient +.';
const REGLE3 = '**Je peux calculer la parenthèse d’abord, ou l’enlever avec les signes changés :** les deux chemins donnent le même résultat.';
const ex = (text: string): Exercise => mkEx(ID, 1, text);

const guess = choix(
  ex('8 - (3 - 2)'),
  'À ton avis, combien vaut ce calcul ?',
  options3(
    ['7', 'Oui : la parenthèse vaut 3 − 2 = 1, puis 8 − 1 = 7. On va voir comment l’enlever sans se tromper.'],
    ['3', 'C’est 8 − 3 − 2. Mais retirer (3 − 2), c’est retirer 1 seulement : 8 − 1 = 7.'],
    ['9', 'On retire la parenthèse, on ne l’ajoute pas : 8 − 1 = 7.'],
  ),
  0,
  '8 - (3 - 2)',
);

const regle1: EtapeStep[] = [
  step('Dans **8 + (3 − 2)**, on ajoute un paquet, la parenthèse. Ajouter un paquet, c’est ajouter chacun de ses morceaux : **rien ne change**.', {
    scene: linesScene(['A = 8 + ', hl('(3 − 2)')]),
  }),
  step('On peut donc enlever la parenthèse en recopiant les signes : 8 + 3 − 2.', {
    scene: linesScene(['A = 8 + (3 − 2)']),
    after: linesScene(['A = 8 + (3 − 2)'], ['A = 8 ', hl('+ 3 − 2')]),
    action: trouOf('Après un +, les signes de la parenthèse [ ? ].', ['ne changent pas', 'changent tous'], 0, {
      1: 'Ajouter un paquet, c’est ajouter ses morceaux tels quels : les signes ne changent pas.',
    }),
  }),
  step(undefined, { scene: linesScene(['A = 8 + (3 − 2)'], ['A = 8 + 3 − 2'], ['A = ', hl('9')]), rule: { n: 1, text: REGLE1 } }),
];

const regle2: EtapeStep[] = [
  step('Dans **8 − (3 + 2)**, on retire un paquet. Retirer un paquet, c’est retirer **chacun** de ses morceaux : on retire 3 et on retire 2.', {
    scene: linesScene(['B = 8 − ', hl('(3 + 2)')]),
    after: linesScene(['B = 8 − (3 + 2)'], ['B = 8 ', hl('− 3 − 2')]),
  }),
  step('Avec **8 − (3 − 2)**, le paquet contient un −2 : le retirer, c’est le **rendre**. Le − 2 devient + 2.', {
    scene: linesScene(['C = 8 − (3 − 2)']),
    after: linesScene(['C = 8 − (3 − 2)'], ['C = 8 ', hl('− 3 + 2')]),
    action: trouOf('En enlevant la parenthèse de 8 − (3 − 2), le − 2 devient [ ? ].', ['+ 2', '− 2'], 0, {
      1: 'Retirer un « moins 2 », c’est rendre 2 : le signe change, on écrit + 2. Garder − 2 serait oublier le moins devant la parenthèse.',
    }),
  }),
  step(undefined, { scene: linesScene(['C = 8 − (3 − 2)'], ['C = 8 − 3 + 2'], ['C = ', hl('7')]), rule: { n: 2, text: REGLE2 } }),
];

const regle3: EtapeStep[] = [
  step('Prenons **15 − (4 − 9)**. Premier chemin : on calcule la parenthèse d’abord, 4 − 9 = −5, puis 15 − (−5) = 20.', {
    scene: linesScene(['D = 15 − (4 − 9)'], ['D = 15 − (−5)']),
  }),
  step('Deuxième chemin : on enlève la parenthèse en changeant les signes, 15 − 4 + 9. On retrouve le même résultat.', {
    scene: linesScene(['D = 15 − (4 − 9)'], ['D = 15 − 4 + 9']),
    after: linesScene(['D = 15 − (4 − 9)'], ['D = 15 − 4 + 9'], ['D = 11 + 9'], ['D = ', hl('20')]),
    action: trouOf('Les deux chemins donnent [ ? ] résultat.', ['le même', 'deux'], 0, {
      1: 'Enlever la parenthèse en changeant les signes n’est qu’une autre façon de faire le même calcul : le résultat est le même.',
    }),
  }),
  step(undefined, { scene: linesScene(['D = 15 − (4 − 9)'], ['D = 15 − 4 + 9'], ['D = ', hl('20')]), rule: { n: 3, text: REGLE3 } }),
];

const exGuide = ex('15 - (4 - 9)');

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Que fait un moins devant une parenthèse ?',
    intro: ['Un signe devant une parenthèse change ce qu’il y a dedans.', 'Ici, tu apprends à enlever une parenthèse sans te tromper de signe.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(RULE_1.label, regle1),
  lecon(
    small(ex('10 + (6 - 4)'), '10 + (6 - 4)', 'Dans 10 + (6 − 4), que devient le − 4 quand on enlève la parenthèse ?', [
      ['Il reste − 4', 'Oui : après un +, rien ne change. 10 + 6 − 4 = 12.'],
      ['Il devient + 4', 'Ce serait vrai après un moins. Ici, c’est un + devant la parenthèse : rien ne change.'],
      ['Il disparaît', 'Le − 4 reste dans le calcul : 10 + 6 − 4.'],
    ], 0),
  ),
  etapes(RULE_2.label, regle2),
  lecon(
    small(ex('12 - (5 - 3)'), '12 - (5 - 3)', 'Dans 12 − (5 − 3), que devient le − 3 quand on enlève la parenthèse ?', [
      ['+ 3', 'Oui : après un −, les signes changent. 12 − 5 + 3 = 10.'],
      ['− 3', 'Ce serait oublier le moins devant la parenthèse : il change le signe de chaque terme.'],
      ['Il disparaît', 'Le 3 reste dans le calcul : on l’écrit avec le signe contraire, + 3.'],
    ], 0),
  ),
  etapes(RULE_3.label, regle3),
  texted(
    decouverte(
      choix(
        ex('8 - (3 - 2)'),
        'Lequel de ces deux calculs vaut 3 ?',
        options3(
          ['Le calcul A, 8 − (3 + 2)', 'Oui : dans A, 3 + 2 = 5 puis 8 − 5 = 3. Dans B, 3 − 2 = 1 puis 8 − 1 = 7.'],
          ['Le calcul B, 8 − (3 − 2)', 'Dans B, la parenthèse vaut 1 : 8 − 1 = 7. Le − 2 est rendu : 8 − 3 + 2.'],
          ['Les deux', 'Le signe dans la parenthèse change tout : A donne 3 et B donne 7.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ['Regarde le signe dans la parenthèse.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Calcul A', latex: '8 - (3 + 2)' },
        b: { label: 'Calcul B', latex: '8 - (3 - 2)' },
        note: '',
        inPlace: true,
        highlight: { a: toks('8 − (3 ', hl('+ 2'), ')'), b: toks('8 − (3 ', hl('− 2'), ')') },
        after: ['Dans A : 8 − 3 − 2 = 3.', 'Dans B : 8 − 3 + 2 = 7.'],
      },
    },
  ),
  // ICI, avant l'exemple guidé : la partie lettres (−(x − 3) = −x + 3), à brancher.
  texted(exemple(calculerGuided(exGuide)), {
    title: 'On le fait ensemble',
    subtitle: 'Calcule 15 − (4 − 9), une opération par ligne. À chaque ligne, une aide te dit quoi faire.',
  }),
  annonceFin(),
];

const course: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 7,
  title: 'Un moins devant une parenthèse',
  shortTitle: 'Moins devant une parenthèse',
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
    (e) => `Calcule la parenthèse d’abord, ou enlève-la en changeant les signes si elle est précédée d’un − : ${readable(textOf(e))}.`,
  ),
  memo: {
    rule: RULE,
    ruleBullets: [
      'Un + devant une parenthèse : je l’enlève, rien ne change.',
      'Un − devant une parenthèse : je l’enlève et je change le signe de chaque terme.',
      'Je peux aussi calculer la parenthèse d’abord : même résultat.',
    ],
    examples: ['8 − (3 + 2) = 8 − 3 − 2 = 3', '8 − (3 − 2) = 8 − 3 + 2 = 7'],
    mistake: { wrong: '8 − (3 − 2) = 8 − 3 − 2', why: 'Le − devant la parenthèse change le signe de **chaque** terme : le − 2 devient + 2. 8 − 3 + 2 = 7.' },
    tip: 'Avant un −, je change tous les signes dans la parenthèse.',
  },
};

export const priorites7 = course;
