// Cours 5 du module Priorités (déroulé guidé) : la dernière opération faite donne la nature du calcul.
// Fiche : docs/modules/03-priorites/priorites-nature-calcul.md
// Les exercices sont des questions à choix (somme, différence, produit, quotient) : pas de valeur à taper.
import type { Rng } from '../../rng';
import type { Question } from '../../exercises/types';
import type { QuestionKind } from '../../events';
import type { BuildCtx } from '../../exercises/types';
import type { CourseDef, EtapeStep, ErrorDef, Exercise, LessonPart, Level } from '../types';
import {
  NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, choix, decouverte, etapes, exemple, explanation, hl, lecon, oneScene,
  options3, redraw, small, step, texted, toks, trouOf,
} from '../calculs/shared';
import { type CalcOp, type CNode, parseCalc } from '../../math/calcul';
import { clean, fmt, latexOfText, mkEx, mulBlock, readable, resolutionOf, rnd, sgn, sumText, textOf, coin } from './priorites-commun';

const ID = 'priorites-nature-calcul';
const RULE = 'La dernière opération faite donne la nature du calcul : somme, différence, produit ou quotient.';

// ——— Exercice : un calcul et sa nature ———
type Nature = 'somme' | 'différence' | 'produit' | 'quotient';
const NATURE: Record<CalcOp, Nature> = { '+': 'somme', '-': 'différence', '*': 'produit', '/': 'quotient' };
const NAMES: Nature[] = ['somme', 'différence', 'produit', 'quotient'];
const ARTICLE: Record<Nature, string> = { somme: 'une somme', différence: 'une différence', produit: 'un produit', quotient: 'un quotient' };
const SYMBOL: Record<Nature, string> = { somme: '+', différence: '−', produit: '×', quotient: '÷' };
const natureOf = (text: string): Nature => {
  const p = parseCalc(text);
  if (!p.ok || p.tree.t !== 'b') throw new Error(`Nature d’un calcul sans opération finale : ${text}`);
  return NATURE[p.tree.o];
};
const mul2 = (rng: Rng, range: [number, number]): string => mulBlock(rng, 2, range, false, false).text;

function drawText(level: Level, rng: Rng): string {
  const a = rnd(rng, [2, 15]);
  const m = (): string => mul2(rng, [2, 9]);
  if (level === 1) {
    switch (rnd(rng, [1, 4])) {
      case 1: return `${a} + ${m()}`;
      case 2: return `${m()} - ${rnd(rng, [1, 9])}`;
      case 3: return `${a} - ${m()}`;
      default: return mulBlock(rng, 3, [2, 9], false, true).text;
    }
  }
  const s = sumText(rng, rnd(rng, [2, 9]), 12);
  const t = sumText(rng, rnd(rng, [2, 6]), 9);
  if (level === 2) {
    switch (rnd(rng, [1, 5])) {
      case 1: return `(${s}) * ${rnd(rng, [2, 9])}`;
      case 2: return `${rnd(rng, [2, 9])} * (${s})`;
      case 3: return `${a * 6} / (${sumText(rng, rnd(rng, [2, 6]), 9)})`;
      case 4: return `${a} + ${rnd(rng, [2, 5])} * (${s})`;
      default: return `${m()} ${sgn(rng)} (${s})`;
    }
  }
  switch (rnd(rng, [1, 5])) {
    case 1: return `[${s}] * (${t})`.replace('[', '(').replace(']', ')');
    case 2: return `${rnd(rng, [2, 9])} * [${rnd(rng, [2, 9])} ${sgn(rng)} (${t})]`;
    case 3: return `[${a} - (${t})] * ${fmt(-rnd(rng, [2, 5]))}`;
    case 4: return `${m()} ${sgn(rng)} ${rnd(rng, [2, 9])} * (${t})`;
    default: return `[${a} ${coin(rng) ? '+' : '-'} (${t})] / ${rnd(rng, [1, 3])}`;
  }
}
function generate(level: Level, rng: Rng): Exercise {
  return mkEx(
    ID,
    level,
    redraw(
      () => drawText(level, rng),
      (t) => parseCalc(t).ok && clean(t, 28, 150) && (parseCalc(t) as { tree: { t: string } }).tree.t === 'b',
    ),
  );
}
const natureOfEx = (ex: Exercise): Nature => natureOf(textOf(ex));

// ——— Questions : 4 choix ———
/** Le message d'un choix : pourquoi c'est juste, ou ce qu'il faut regarder. */
function why(ex: Exercise, picked: Nature): string {
  const n = natureOfEx(ex);
  const calc = readable(textOf(ex));
  if (picked === n) return `Oui : dans ${calc}, la dernière opération faite est ${SYMBOL[n]}, c’est ${ARTICLE[n]}.`;
  return `Pas ${ARTICLE[picked]} : dans ${calc}, la dernière opération faite est ${SYMBOL[n]}. C’est ${ARTICLE[n]}.`;
}
/** L'erreur que trahit un mauvais choix : une opération entre parenthèses, une autre opération du calcul, ou le mauvais mot. */
function errorOfPick(ex: Exercise, picked: Nature): string | undefined {
  const p = parseCalc(textOf(ex));
  if (!p.ok || p.tree.t !== 'b' || NATURE[p.tree.o] === picked) return undefined;
  const inside = new Set<Nature>();
  const outside = new Set<Nature>();
  const walk = (n: CNode, inG: boolean, root = false): void => {
    if (n.t === 'b') {
      if (!root) (inG ? inside : outside).add(NATURE[n.o]);
      walk(n.a, inG);
      walk(n.b, inG);
    } else if (n.t === 'g') walk(n.e, true);
    else if (n.t === 'm') walk(n.e, inG);
  };
  walk(p.tree, false, true);
  if (inside.has(picked)) return 'parenthese-nature';
  if (outside.has(picked)) return 'premiere-operation';
  return 'terme-facteur';
}
const optionsOf = (ex: Exercise) =>
  NAMES.map((n) => {
    const errorType = errorOfPick(ex, n);
    return { label: n[0]!.toUpperCase() + n.slice(1), why: why(ex, n), ...(errorType ? { errorType } : {}) };
  });
const natureQ = (ex: Exercise): Question =>
  choix(ex, 'Quelle est la nature de ce calcul ? Touche la réponse.', optionsOf(ex), NAMES.indexOf(natureOfEx(ex)), latexOfText(textOf(ex)));
function customQuestion(kind: QuestionKind, ctx: BuildCtx): Question | null {
  if (kind !== 'choix' && kind !== 'saisie') return null;
  return natureQ(generate(ctx.level, ctx.rng));
}

// ——— Erreurs : des choix, pas de valeur numérique ; elles servent à relire la bonne règle ———
const RULE_1 = { n: 1, label: 'La dernière opération', partIndex: 1 };
const RULE_2 = { n: 2, label: 'Termes et facteurs', partIndex: 3 };
const RULE_3 = { n: 3, label: 'Les parenthèses', partIndex: 5 };
const err = (id: string, rule: NonNullable<ErrorDef['rule']>, text: string): ErrorDef => ({
  id,
  family: 'autre',
  detect: () => false,
  explain: (ex) => explanation(text, resolutionOf(ex)),
  trap: (level, rng) => generate(level, rng),
  wrongValues: () => [],
  rule,
});
const errors: ErrorDef[] = [
  err('premiere-operation', RULE_1, 'C’est la dernière opération faite qui donne la nature du calcul, pas la première : on suit l’ordre des priorités jusqu’au bout.'),
  err('terme-facteur', RULE_2, 'Les nombres qu’on additionne ou qu’on soustrait sont des termes ; ceux qu’on multiplie ou qu’on divise sont des facteurs.'),
  err('parenthese-nature', RULE_3, 'Une parenthèse se calcule d’abord : elle n’est jamais la dernière opération du calcul qui la contient.'),
];

// ——— Leçon ———
const REGLE1 = '**La dernière opération faite donne la nature du calcul.** Si c’est un +, c’est une somme ; un −, une différence ; un ×, un produit ; un ÷, un quotient.';
const REGLE2 = '**Les nombres d’une somme ou d’une différence sont des termes ; ceux d’un produit ou d’un quotient sont des facteurs.** Un terme peut être un calcul entier.';
const REGLE3 = '**Les parenthèses se calculent d’abord : la dernière opération est celle qui est hors des parenthèses.** Les parenthèses changent donc la nature.';
const ex = (text: string): Exercise => mkEx(ID, 1, text);

const guess = choix(
  ex('3 + 4 * 2'),
  'À ton avis, ce calcul est-il une somme ou un produit ?',
  options3(
    ['Une somme', 'Oui : on fait 4 × 2 = 8, puis 3 + 8. La dernière opération est le +.'],
    ['Un produit', 'Il y a un ×, mais il se fait en premier. La dernière opération est le +, c’est une somme.'],
    ['Les deux', 'Un calcul n’a qu’une nature : celle de la dernière opération faite, le +.'],
  ),
  0,
  '3 + 4 \\times 2',
);

const regle1: EtapeStep[] = [
  step('Pour donner la nature d’un calcul, on cherche **la dernière opération faite**. Dans 3 + 4 × 2, on fait d’abord 4 × 2, puis 3 + 8.', {
    scene: oneScene('3', '+', '4', '×', '2'),
  }),
  step('Le × se fait en premier, donc il n’est pas le dernier. Touche l’opération qui se fait en dernier.', {
    scene: oneScene('3', '+', '4', '×', '2'),
    after: oneScene('3', hl('+'), '4', '×', '2'),
    action: {
      type: 'morceau',
      consigne: 'Touche la dernière opération faite.',
      calc: 0,
      target: [1],
      errors: [{ at: [3], message: 'Le × se fait en premier : 4 × 2 = 8. La dernière opération est le +.' }],
      fallback: 'Touche un signe d’opération : + ou ×.',
    },
  }),
  step(undefined, { scene: oneScene('3', hl('+'), '4', '×', '2'), rule: { n: 1, text: REGLE1 } }),
];

const regle2: EtapeStep[] = [
  step('Dans la somme 3 + 4 × 2, on additionne deux morceaux : **3** et **4 × 2**. Ces morceaux s’appellent des **termes**.', {
    scene: oneScene(hl('3'), ' + ', hl('4 × 2')),
  }),
  step('Dans le produit 4 × 2, on multiplie deux nombres : ce sont des **facteurs**.', {
    scene: oneScene('3 + ', hl('4'), ' × ', hl('2')),
    after: oneScene('3 + ', hl('4'), ' × ', hl('2')),
    action: trouOf('Dans un produit, les nombres multipliés sont des [ ? ].', ['facteurs', 'termes'], 0, {
      1: 'On appelle termes les nombres d’une somme ou d’une différence. Dans un produit, ce sont des facteurs.',
    }),
  }),
  step(undefined, { scene: oneScene(hl('3'), ' + ', hl('4 × 2')), rule: { n: 2, text: REGLE2 } }),
];

const regle3: EtapeStep[] = [
  step('Dans **(3 + 4) × 2**, les parenthèses se calculent d’abord : 3 + 4 = 7. Il reste 7 × 2.', {
    scene: oneScene('(3 + 4)', '×', '2'),
  }),
  step('La dernière opération faite est le ×, qui est **hors** des parenthèses. Le calcul est un produit de deux facteurs : (3 + 4) et 2.', {
    scene: oneScene('(3 + 4)', '×', '2'),
    after: oneScene('(3 + 4)', hl('×'), '2'),
    action: trouOf('La dernière opération est le ×, donc (3 + 4) × 2 est [ ? ].', ['un produit', 'une somme'], 0, {
      1: 'Le + est dans la parenthèse : il se fait d’abord. Le calcul entier se termine par le ×, c’est un produit.',
    }),
  }),
  step(undefined, { scene: oneScene('(3 + 4)', hl('×'), '2'), rule: { n: 3, text: REGLE3 } }),
];

const exGuide = ex('12 - 3 * (4 - 2)');

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Somme ou produit ?',
    intro: ['Un calcul a un nom : somme, différence, produit ou quotient.', 'Ici, tu apprends à le trouver sans calculer le résultat.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(RULE_1.label, regle1),
  lecon(
    small(ex('10 - 2 * 3'), '10 - 2 \\times 3', 'Quelle est la nature de 10 − 2 × 3 ?', [
      ['Une différence', 'Oui : 2 × 3 = 6 se fait d’abord, puis 10 − 6. La dernière opération est le −.'],
      ['Un produit', 'Le × se fait en premier. La dernière opération est le −, c’est une différence.'],
      ['Une somme', 'Il n’y a pas de + dans ce calcul : la dernière opération est le −.'],
    ], 0),
  ),
  etapes(RULE_2.label, regle2),
  lecon(
    small(ex('5 * 3 + 2'), '5 \\times 3 + 2', 'Dans la somme 5 × 3 + 2, quels sont les termes ?', [
      ['5 × 3 et 2', 'Oui : la somme a deux termes, 5 × 3 et 2. Le premier terme est lui-même un produit.'],
      ['5 et 3 et 2', 'On ne coupe pas 5 × 3 : ce produit est un seul terme de la somme.'],
      ['5 et 3', 'Dans la somme 5 × 3 + 2, il y a aussi le terme 2.'],
    ], 0),
  ),
  etapes(RULE_3.label, regle3),
  texted(
    decouverte(
      choix(
        ex('(3 + 4) * 2'),
        'Lequel de ces deux calculs est un produit ?',
        options3(
          ['Le calcul B, (3 + 4) × 2', 'Oui : dans B, la parenthèse se calcule d’abord et la dernière opération est le ×.'],
          ['Le calcul A, 3 + 4 × 2', 'Dans A, le × se fait d’abord et la dernière opération est le +, c’est une somme.'],
          ['Les deux', 'Ils n’ont pas la même dernière opération : + dans A, × dans B.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ['Cherche la dernière opération de chacun.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Calcul A', latex: '3 + 4 \\times 2' },
        b: { label: 'Calcul B', latex: '(3 + 4) \\times 2' },
        note: '',
        inPlace: true,
        highlight: { a: toks('3 ', hl('+'), ' 4 × 2'), b: toks('(3 + 4) ', hl('×'), ' 2') },
        after: ['Dans A, la dernière opération est le + : c’est une somme.', 'Dans B, la dernière opération est le × : c’est un produit.'],
      },
    },
  ),
  texted(exemple(choix(exGuide, 'Quelle est la nature de ce calcul ? Calcule dans ta tête l’ordre des opérations.', NAMES.map((n) => ({ label: n[0]!.toUpperCase() + n.slice(1), why: why(exGuide, n) })), NAMES.indexOf(natureOfEx(exGuide)), latexOfText(textOf(exGuide)))), {
    title: 'On le fait ensemble',
    subtitle: 'Donne la nature de 12 − 3 × (4 − 2) : la parenthèse d’abord, puis le produit, puis la dernière opération.',
  }),
  annonceFin(),
];

const course: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 5,
  title: 'Somme, différence, produit ou quotient',
  shortTitle: 'Nature d’un calcul',
  rule: RULE,
  parts,
  lessonLength: parts.findIndex((p) => p.type === 'question' && p.activity === 'exemple'),
  unePhrase: true,
  endExercises: { count: 5, kind: 'saisie', mix: ['choix', 'choix', 'choix', 'choix', 'choix'] },
  // la révision et l'entraînement posent aussi la question à choix (pas de saisie d'une valeur)
  formats: ['saisie', 'saisie', 'saisie'],
  generate,
  errors,
  generalExplanation: (e) => explanation(RULE, resolutionOf(e)),
  resolution: resolutionOf,
  classes: SIGN_CLASSES,
  expectInteger: true,
  customQuestion,
  memo: {
    rule: RULE,
    ruleBullets: [
      'La dernière opération faite donne la nature : + somme, − différence, × produit, ÷ quotient.',
      'Termes pour + et −, facteurs pour × et ÷ ; un terme peut être un calcul.',
      'Les parenthèses se calculent d’abord : elles changent la dernière opération.',
    ],
    examples: ['3 + 4 × 2 est une somme (termes 3 et 4 × 2)', '(3 + 4) × 2 est un produit (facteurs 3 + 4 et 2)'],
    mistake: { wrong: '3 + 4 × 2 est un produit', why: 'Le × se fait en premier. La **dernière** opération est le + : c’est une somme.' },
    tip: 'Je cherche la dernière opération que je ferais en calculant.',
  },
};

export const priorites5 = course;
/** La question à choix sur un calcul précis (tests). */
export const natureQuestion = (text: string): Question => natureQ(mkEx(ID, 1, text));
