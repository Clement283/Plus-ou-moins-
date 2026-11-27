// Cours 1 du module Priorités (déroulé guidé) : que des + et des −, ou que des × et des ÷ : de gauche à droite.
// Fiche : docs/modules/03-priorites/priorites-gauche-droite.md
// L'exercice est un calcul écrit comme au clavier (meta.text) ; les exercices de fin sont « Calculer par lignes » sans x.
import type { Rng } from '../../rng';
import { calcSteps, textTokens } from '../../math/calcul';
import type { CourseDef, EtapeStep, Exercise, LessonPart, Level } from '../types';
import {
  NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, choix, decouverte, etapes, exemple, hl, lecon, linesScene,
  options3, redraw, small, step, texted, toks, trouOf,
} from '../calculs/shared';
import { type ErrDef, calculerGuided, coin, customOf, explainOf, feedbackOf, fmt, makeErrors, mkEx, mulBlock, readable, resolutionOf, rnd, sgn, textOf, wrongOf } from './priorites-commun';

const ID = 'priorites-gauche-droite';
const RULE = 'Avec seulement des + et des − (ou seulement des × et des ÷), je calcule de gauche à droite, une opération par ligne.';

// ——— Exercice ———
const NUMS: Record<Level, [number, number]> = { 1: [1, 9], 2: [10, 40], 3: [10, 60] };
const COUNT: Record<Level, number> = { 1: 3, 2: 4, 3: 5 };
/** Tous les nombres de toutes les lignes de la méthode sont positifs ou nuls (niveau 1). */
const positive = (text: string): boolean => {
  const t = textTokens(text);
  return t !== null && calcSteps(t).every((line) => line.every((x) => x.k !== 'n' || x.v.n >= 0));
};
function drawText(level: Level, rng: Rng): string {
  if (coin(rng, 0.4)) {
    const len = level === 1 ? 3 : 4;
    return mulBlock(rng, len, level === 1 ? [4, 9] : [4, 12], level === 3, true).text;
  }
  const n = COUNT[level];
  let text = fmt(rnd(rng, NUMS[level]) * (level === 3 && coin(rng, 0.3) ? -1 : 1), true);
  for (let k = 1; k < n; k++) text += ` ${sgn(rng)} ${fmt(rnd(rng, NUMS[level]) * (level === 3 && coin(rng, 0.4) ? -1 : 1))}`;
  return text;
}
const fits = (text: string, level: Level): boolean => {
  const tokens = textTokens(text);
  if (!tokens || text.length > 30) return false;
  return level > 1 || positive(text);
};
function generate(level: Level, rng: Rng): Exercise {
  return redraw(
    () => mkEx(ID, level, drawText(level, rng)),
    (ex) => fits(textOf(ex), level) && wrongOf(ex, 'gauche-droite').length > 0 && Math.abs(ex.answer.n) <= 200,
  );
}

// ——— Erreurs reconnues ———
const RULE_1 = { n: 1, label: 'Des additions et des soustractions', partIndex: 1 };
const RULE_2 = { n: 2, label: 'Des multiplications et des divisions', partIndex: 3 };
const RULE_3 = { n: 3, label: 'Une opération par ligne', partIndex: 5 };
// une seule erreur reconnue : « pas de gauche à droite » ; elle renvoie à la règle 1 (additions et soustractions)
const defs: ErrDef[] = [
  {
    id: 'gauche-droite',
    family: 'calcul',
    rule: RULE_1,
    text: (ex) =>
      `Dans ${readable(textOf(ex))}, on calcule dans l’ordre de lecture, de gauche à droite : on fait la première opération, puis la suivante sur le résultat.`,
  },
];
const errors = makeErrors(defs, generate);

// ——— Leçon ———
const REGLE1 = '**Avec seulement des additions et des soustractions, je calcule de gauche à droite.** Je fais la première opération, puis la suivante.';
const REGLE2 = '**Avec seulement des multiplications et des divisions, c’est pareil : de gauche à droite.** Une division n’a pas de priorité sur une multiplication.';
const REGLE3 = '**J’écris une ligne par opération :** je calcule une seule opération et je recopie ce qui reste.';
const ex = (level: Level, text: string): Exercise => mkEx(ID, level, text);

const guess = choix(
  ex(1, '10 - 3 + 2'),
  'À ton avis, combien vaut ce calcul ?',
  options3(
    ['9', 'Oui : dix moins trois fait sept, puis sept plus deux fait neuf. On lit de gauche à droite.'],
    ['5', 'On a retiré 3 puis encore 2, mais le + 2 ajoute. Dix moins trois fait 7, et 7 plus 2 fait 9.'],
    ['15', 'Le − 3 est bien une soustraction : 10 − 3 fait 7, pas 13. Puis on ajoute 2.'],
  ),
  0,
  '10 - 3 + 2',
);

const addSub: EtapeStep[] = [
  step('Dans **10 − 3 + 2**, il n’y a que des additions et des soustractions. On les fait **dans l’ordre où on lit** : de gauche à droite.', {
    scene: linesScene(['A = 10 − 3 + 2']),
  }),
  step('La première opération à faire est **10 − 3**, tout à gauche.', {
    scene: linesScene(['A = 10 − 3 + 2']),
    after: linesScene(['A = ', hl('10 − 3'), ' + 2'], ['A = ', hl('7'), ' + 2']),
    action: trouOf('La première opération à faire est [ ? ].', ['10 − 3', '3 + 2'], 0, {
      1: 'Le 3 est précédé d’un moins : il se retire de 10. 3 + 2 n’existe pas dans ce calcul.',
    }),
  }),
  step(undefined, { scene: linesScene(['A = 10 − 3 + 2'], ['A = 7 + 2'], ['A = ', hl('9')]), rule: { n: 1, text: REGLE1 } }),
];

const mulDiv: EtapeStep[] = [
  step('Dans **12 ÷ 3 × 2**, il n’y a que des divisions et des multiplications. La règle est la même : on lit de gauche à droite.', {
    scene: linesScene(['B = 12 ÷ 3 × 2']),
  }),
  step('On fait d’abord **12 ÷ 3**, puis on multiplie le résultat par 2.', {
    scene: linesScene(['B = 12 ÷ 3 × 2']),
    after: linesScene(['B = ', hl('12 ÷ 3'), ' × 2'], ['B = ', hl('4'), ' × 2']),
    action: trouOf('On fait d’abord [ ? ].', ['12 ÷ 3', '3 × 2'], 0, {
      1: 'Faire 3 × 2 d’abord donnerait 12 ÷ 6 = 2 : c’est faux. On lit de gauche à droite.',
    }),
  }),
  step(undefined, { scene: linesScene(['B = 12 ÷ 3 × 2'], ['B = 4 × 2'], ['B = ', hl('8')]), rule: { n: 2, text: REGLE2 } }),
];

const lignes: EtapeStep[] = [
  step('Sur une copie, **chaque ligne** ne fait qu’une opération : on recopie ce qui reste et on remplace les deux premiers nombres par leur résultat.', {
    scene: linesScene(['C = 15 − 4 + 6 − 2']),
    after: linesScene(['C = 15 − 4 + 6 − 2'], ['C = ', hl('11'), ' + 6 − 2']),
  }),
  step('À la ligne suivante, on recommence avec le nouveau début : 11 + 6.', {
    scene: linesScene(['C = 15 − 4 + 6 − 2'], ['C = 11 + 6 − 2']),
    after: linesScene(['C = 15 − 4 + 6 − 2'], ['C = 11 + 6 − 2'], ['C = ', hl('17'), ' − 2']),
    action: trouOf('Après 11 + 6, il reste [ ? ].', ['17 − 2', '11 + 4'], 0, {
      1: 'Le calcul 11 + 6 est déjà fait : il est devenu 17. Il reste 17 − 2.',
    }),
  }),
  step(undefined, { scene: linesScene(['C = 15 − 4 + 6 − 2'], ['C = 11 + 6 − 2'], ['C = 17 − 2'], ['C = ', hl('15')]), rule: { n: 3, text: REGLE3 } }),
];

const exGuide = ex(1, '5 - 8 + (-2)');

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Dans quel ordre calculer ?',
    intro: ['Un calcul se lit comme une phrase : de gauche à droite.', 'Ici, tu apprends à ne plus te tromper quand il y a plusieurs opérations de suite.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(RULE_1.label, addSub),
  lecon(
    small(ex(1, '8 - 5 + 4'), '8 - 5 + 4', 'Dans 8 − 5 + 4, quelle opération fait-on en premier ?', [
      ['8 − 5', 'Oui : tout à gauche. Huit moins cinq fait trois, puis trois plus quatre fait sept.'],
      ['5 + 4', 'Si on additionne d’abord 5 et 4, on obtient 8 − 9 = −1. Mais le 5 est retiré de 8 avant : on lit de gauche à droite.'],
      ['8 + 4', 'Ces deux nombres ne sont pas voisins : on fait l’opération qui est tout à gauche.'],
    ], 0),
  ),
  etapes(RULE_2.label, mulDiv),
  lecon(
    small(ex(1, '20 / 5 * 2'), '20 \\div 5 \\times 2', 'Combien vaut 20 ÷ 5 × 2 ?', [
      ['8', 'Oui : vingt divisé par cinq fait quatre, puis quatre fois deux fait huit.'],
      ['2', 'Tu as divisé 20 par 5 × 2, c’est-à-dire par 10. Il faut diviser par 5 d’abord, puis multiplier par 2.'],
      ['10', 'Ce n’est pas 20 ÷ 2. On lit de gauche à droite : vingt divisé par cinq, puis fois deux.'],
    ], 0),
  ),
  etapes(RULE_3.label, lignes),
  texted(
    decouverte(
      choix(
        ex(1, '10 - 3 - 2'),
        'Dans lequel de ces deux calculs retire-t-on 5 en tout ?',
        options3(
          ['Dans B, 10 − 3 − 2', 'Oui : dans B, on retire 3 puis encore 2, donc 5 en tout : 10 − 5 = 5.'],
          ['Dans A, 10 − 3 + 2', 'Dans A, le dernier signe est un plus : on retire 3 puis on ajoute 2.'],
          ['Dans les deux', 'Le dernier signe change tout : un moins retire, un plus ajoute.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ['Regarde le dernier signe.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Calcul A', latex: '10 - 3 + 2' },
        b: { label: 'Calcul B', latex: '10 - 3 - 2' },
        note: '',
        inPlace: true,
        highlight: { a: toks('10 − 3 ', hl('+ 2')), b: toks('10 − 3 ', hl('− 2')) },
        after: ['Dans A : 10 − 3 = 7, puis 7 + 2 = 9.', 'Dans B : 10 − 3 = 7, puis 7 − 2 = 5.'],
      },
    },
  ),
  texted(exemple(calculerGuided(exGuide)), {
    title: 'On le fait ensemble',
    subtitle: 'Calcule 5 − 8 + (−2), une opération par ligne. À chaque ligne, une aide te dit quoi faire.',
  }),
  annonceFin(),
];

const course: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 1,
  title: 'Calculer de gauche à droite',
  shortTitle: 'Gauche à droite',
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
    (e) => `Calcule de gauche à droite, une opération à la fois : ${readable(textOf(e))}.`,
  ),
  memo: {
    rule: RULE,
    ruleBullets: [
      'Que des + et des − : de gauche à droite.',
      'Que des × et des ÷ : de gauche à droite aussi.',
      'Une ligne par opération : je calcule une seule opération et je recopie le reste.',
    ],
    examples: ['10 − 3 + 2 ; 7 + 2 ; 9', '12 ÷ 3 × 2 ; 4 × 2 ; 8'],
    mistake: { wrong: '10 − 3 + 2 = 5', why: 'On a retiré 3 **et** 2. Le dernier signe est un plus : 10 − 3 = 7, puis 7 + 2 = 9.' },
    tip: 'Je lis le calcul comme une phrase et je fais la première opération à gauche.',
  },
};

export const priorites1 = course;
