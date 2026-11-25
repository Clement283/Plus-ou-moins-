// Cours 7 (version b) — Multiplier plusieurs relatifs. Fiche : docs/modules/01-relatifs/c07-multiplier-plusieurs.md.
import { num, op, toLatex } from '../../math/expr';
import type { Rng } from '../../rng';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, Level } from '../types';
import {
  M, NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, autres, buildErrors, chain, choix,
  decouverte, draw, etapes, exemple, explanation, hl, is, isOpposite, lecon, linesScene, makeExercise, oneScene, operands,
  options3, pratique, redraw, resultLine, saisie, sg, signBox, small, step, stepped, texted, toks, toText, trou, trouOf, txt,
} from './shared';

const ID = 'c07b-multiplier-plusieurs';
const RULE =
  'Je compte les signes moins : nombre pair, résultat positif ; nombre impair, résultat négatif. Puis je multiplie tous les nombres sans leur signe.';

// ——— Générateur : le niveau agrandit les nombres ET allonge le calcul (3 puis 4 facteurs), jamais de 0, au moins un négatif ———
type Range = [number, number];
const SPEC: Record<Level, { counts: number[]; range: Range }> = {
  1: { counts: [3], range: [2, 5] },
  2: { counts: [3, 4], range: [2, 6] },
  3: { counts: [4], range: [2, 9] },
};
const product = (xs: number[]): number => xs.reduce((a, b) => a * b, 1);
function factors(level: Level, rng: Rng): number[] {
  const { counts, range } = SPEC[level];
  const n = counts[draw(rng, [0, counts.length - 1])] as number;
  return redraw(
    () => Array.from({ length: n }, () => (draw(rng, [0, 1]) === 1 ? -1 : 1) * draw(rng, range)),
    (xs) => xs.some((x) => x < 0),
  );
}
const generate = (level: Level, rng: Rng): Exercise => makeExercise(ID, level, chain('*', factors(level, rng)));
const ex = (...xs: number[]): Exercise => makeExercise(ID, 1, chain('*', xs));
const facts = (e: Exercise): number[] => operands(e.expr);
const minusCount = (e: Exercise): number => facts(e).filter((x) => x < 0).length;
const bare = (e: Exercise): string => facts(e).map(Math.abs).join(' \\times ');
const signOf = (e: Exercise): string => sg(e.answer.n);
function resolution(e: Exercise): string[] {
  return [toLatex(e.expr), `= ${signOf(e)}(${bare(e)})`, resultLine(e)];
}
const leaveOneOut = (e: Exercise): number[] => facts(e).map((_, i) => product(facts(e).filter((__, j) => j !== i)));

// ——— Erreurs reconnues ———
const shown = (e: Exercise): string => toText(e.expr);
const R1 = 'Je multiplie deux par deux, de gauche à droite';
const R2 = 'Je compte les signes moins';
const R3 = "J'écris le signe, puis je multiplie tous les nombres";
const RULES: Record<string, NonNullable<ErrorDef['rule']>> = {
  'addition-au-lieu-multiplication': { n: 1, label: R1, partIndex: 2 },
  'parite-signes': { n: 2, label: R2, partIndex: 4 },
  'facteur-oublie': { n: 3, label: R3, partIndex: 6 },
};
const sum = (e: Exercise): number => facts(e).reduce((a, b) => a + b, 0);
const absSum = (e: Exercise): number => facts(e).reduce((a, b) => a + Math.abs(b), 0);
const errors: ErrorDef[] = buildErrors(
  [
    {
      id: 'addition-au-lieu-multiplication',
      family: 'calcul',
      detect: (e, given) => is(given, sum(e)) || is(given, absSum(e)),
      text: (e) => `Dans ${shown(e)}, on multiplie les nombres : on ne les additionne pas. Fais d'abord le produit des deux premiers nombres.`,
      draw: (level, rng) => generate(level, rng),
      sample: (e) => sum(e),
      alsoWrong: (e) => [absSum(e)],
      wrongLines: (e, w) => (w === sum(e) ? stepped(e, facts(e).map((x, i) => (i === 0 ? `${x}` : `+ (${x})`)).join(' '), w) : null),
    },
    {
      id: 'parite-signes',
      family: 'signe',
      detect: (e, given) => e.answer.n !== 0 && isOpposite(e, given),
      text: (e) =>
        e.answer.n > 0
          ? `Dans ${shown(e)}, il y a ${minusCount(e)} signes moins : un nombre pair. Le résultat est positif : ${txt(e.answer.n)}.`
          : `Dans ${shown(e)}, il y a ${minusCount(e)} ${minusCount(e) === 1 ? 'signe moins' : 'signes moins'} : un nombre impair. Le résultat est négatif : ${txt(e.answer.n)}.`,
      draw: (level, rng) => generate(level, rng),
      sample: (e) => -e.answer.n,
      wrongLines: (e, w) => (w === -e.answer.n ? stepped(e, `${sg(w)}(${bare(e)})`, w) : null),
    },
    {
      id: 'facteur-oublie',
      family: 'calcul',
      detect: (e, given) => leaveOneOut(e).some((x) => is(given, x)),
      text: (e) => `Dans ${shown(e)}, il y a ${facts(e).length} nombres et tu n'en as utilisé que ${facts(e).length - 1}. Multiplie-les tous, sans en oublier un.`,
      draw: (level, rng) => generate(level, rng),
      sample: (e) => leaveOneOut(e)[facts(e).length - 1] as number,
      alsoWrong: (e) => leaveOneOut(e),
      wrongLines: (e, w) => (leaveOneOut(e).includes(w) ? stepped(e, `${sg(w)}(…)`, w) : null),
    },
  ],
  resolution,
).map((e): ErrorDef => ({ ...e, rule: RULES[e.id] as NonNullable<ErrorDef['rule']> }));

// ——— Retours d'erreur des questions qui comptent ———
function feedbackText(q: Question, o: Outcome): string | null {
  if (o.unfinished || o.errorFamily === 'ecriture' || q.kind !== 'saisie' || o.correct) return null;
  const e = q.ex;
  if (o.errorType === 'addition-au-lieu-multiplication')
    return `Le signe × veut dire multiplier : on n'additionne pas les nombres de ${shown(e)}.`;
  if (o.errorType === 'parite-signes')
    return `Compte les signes moins de ${shown(e)} : il y en a ${minusCount(e)}, un nombre ${minusCount(e) % 2 === 0 ? 'pair, donc le résultat est positif' : 'impair, donc le résultat est négatif'}.`;
  if (o.errorType === 'facteur-oublie')
    return `Il y a ${facts(e).length} nombres dans ${shown(e)} : ils entrent tous dans le produit.`;
  return `Écris d'abord le signe (${minusCount(e) % 2 === 0 ? 'positif' : 'négatif'}), puis multiplie tous les nombres sans leur signe : ${facts(e).map(Math.abs).join(' × ')}.`;
}

// ——— Leçon ———
const REGLE1 = '**On multiplie les nombres deux par deux, de gauche à droite.** Le résultat du premier produit devient le premier nombre du suivant.';
const REGLE2 = '**Pour trouver le signe, on compte les signes moins.** Un nombre pair de signes moins donne un résultat positif. Un nombre impair donne un résultat négatif.';
const REGLE3 = "**On écrit le signe d'abord, puis on multiplie tous les nombres sans leur signe.** Chaque nombre entre une fois dans le produit.";

const guess = choix(
  ex(-2, 3, -4),
  'Pour commencer, à ton avis : combien vaut ce calcul ?',
  options3(
    ['24', 'Oui. Il y a deux signes moins : le résultat est positif. On va voir pourquoi.'],
    ['−24', 'Le nombre 24 est bon, mais pas le signe : il y a deux signes moins, et ils se compensent.'],
    ['−3', "Ici on multiplie, on n'additionne pas : −2 + 3 + (−4) ferait −3."],
  ),
  0,
  '-2 \\times 3 \\times (-4)',
);

const idee: EtapeStep[] = [
  step('Multiplier plusieurs nombres, c’est **répéter la multiplication de deux nombres**, que tu connais déjà.', {
    scene: linesScene([`${M}2 × 3 × (${M}4)`]),
  }),
  step('Chaque nombre négatif **change le signe du résultat, une seule fois**.', {
    scene: oneScene(`3 × (${M}2) = ?`),
    after: oneScene(`3 × (${M}2) = `, hl(`${M}6`)),
    action: trouOf('Un nombre positif multiplié par un nombre négatif devient [ ? ].', ['négatif', 'positif'], 0, {
      1: `Non : trois fois moins deux donne moins six, un nombre négatif.`,
    }),
  }),
  step('Donc, avec plusieurs nombres, **on répète cette idée, nombre après nombre**. Voyons comment faire sans se tromper.', {
    scene: linesScene([`${M}2 × 3 × (${M}4)`]),
  }),
];

const regle1: EtapeStep[] = [
  step('On commence par les **deux premiers nombres**. On ne regarde pas les autres pour l’instant.', {
    scene: linesScene([hl(`${M}2 × 3`), ` × (${M}4)`]),
  }),
  step('Moins deux fois trois : un négatif fois un positif donne un résultat **négatif**.', {
    scene: linesScene([hl(`${M}2 × 3`), ` × (${M}4)`]),
    after: linesScene([`${M}2 × 3 × (${M}4)`], ['= ', hl(`${M}6`), ` × (${M}4)`]),
    action: trouOf('Moins deux fois trois donne un résultat [ ? ].', ['négatif', 'positif'], 0, {
      1: 'Un seul nombre est négatif : le résultat du premier produit est négatif, moins six.',
    }),
  }),
  step(undefined, {
    scene: linesScene([`${M}2 × 3 × (${M}4)`], [`= ${M}6 × (${M}4)`], ['= ', hl('24')]),
    rule: { n: 1, text: REGLE1 },
  }),
];

const regle2: EtapeStep[] = [
  step('Chaque nombre négatif change le signe **une fois**. Il faut donc **compter les signes moins**.', {
    scene: oneScene('2 × (', hl(`${M}3`), ') × 4 × (', hl(`${M}5`), ')'),
  }),
  step('Regarde bien le calcul : combien de nombres sont précédés d’un signe moins ?', {
    scene: oneScene('2 × (', hl(`${M}3`), ') × 4 × (', hl(`${M}5`), ')'),
    after: oneScene('2 × (', hl(`${M}3`), ') × 4 × (', hl(`${M}5`), ')'),
    action: trouOf('Dans ce calcul, il y a [ ? ] signes moins.', ['deux', 'trois', 'quatre'], 0, {
      1: 'Compte encore : le 2 et le 4 sont positifs, il reste deux nombres négatifs.',
      2: 'Le 2 et le 4 n’ont pas de signe moins : il reste deux nombres négatifs.',
    }),
  }),
  step(undefined, {
    scene: linesScene(['2 × (', hl(`${M}3`), ') × 4 × (', hl(`${M}5`), ')'], ['deux signes moins : ', hl('pair'), ', donc positif']),
    rule: { n: 2, text: REGLE2 },
  }),
];

const regle3: EtapeStep[] = [
  step('On écrit **le signe d’abord**. Ici, il y a un seul signe moins : un nombre impair, donc le résultat est négatif.', {
    scene: linesScene([`${M}3 × 2 × 5`], ['= ', hl(M), '( … )']),
  }),
  step('Ensuite, on oublie les signes et on multiplie **tous les nombres** : trois, deux et cinq.', {
    scene: linesScene([`${M}3 × 2 × 5`], ['= ', hl(M), '( … )']),
    after: linesScene([`${M}3 × 2 × 5`], [`= ${M}(`, hl('3 × 2 × 5'), ')']),
    action: trouOf('Dans la parenthèse, on écrit [ ? ] nombres.', ['trois', 'deux'], 0, {
      1: 'Il y a trois nombres dans le calcul : trois, deux et cinq. Aucun ne doit manquer.',
    }),
  }),
  step(undefined, {
    scene: linesScene([`${M}3 × 2 × 5`], [`= ${M}(3 × 2 × 5)`], ['= ', hl(`${M}30`)]),
    rule: { n: 3, text: REGLE3 },
  }),
];

const exemple1: EtapeStep[] = [
  step('Voici la résolution. Lis la première ligne, puis touche « Je comprends ».', { scene: linesScene([`${M}3 × 4 × (${M}5)`]) }),
  step('Il y a deux signes moins : un nombre pair. On écrit le signe positif d’abord, puis on multiplie trois, quatre et cinq.', {
    scene: linesScene([`${M}3 × 4 × (${M}5)`], [hl('= +(3 × 4 × 5)')]),
    action: { type: 'comprends' },
  }),
];

const PRATIQUE = pratique(
  'Cours 7 · Pratique',
  [
    {
      question: trou(ex(-2, 3, -4), '= \\square', 24),
      texts: { consigne: 'Le premier produit est déjà fait. **Tape le résultat dans la case.**', above: ['= -6 \\times (-4)'] },
    },
    {
      question: signBox(ex(3, -2, -5, -4), false, 'parite-signes'),
      texts: { consigne: "Touche le signe du résultat. Tu n'as pas besoin de calculer.", intro: ['Quel est le signe du résultat ?'] },
    },
    {
      question: choix(
        makeExercise('c06-diviser-deux', 1, op('/', num(-35), num(5))),
        'Attention, ce calcul est une division. Quel est le résultat ?',
        options3(
          ['−7', 'Oui : un négatif divisé par un positif donne un négatif, et trente-cinq divisé par cinq fait sept.'],
          ['7', 'Une seule valeur est négative : le résultat est négatif.'],
          ['−30', 'On divise, on ne soustrait pas : trente-cinq divisé par cinq fait sept.'],
        ),
        0,
        '-35 \\div 5',
      ),
      texts: { consigne: "Regarde bien l'opération, puis touche le résultat." },
    },
    { question: saisie(ex(3, -2, 5, -4)), texts: { consigne: 'Calcule. **Tape le résultat.**' } },
  ],
  "Maintenant, deux exemples pour t'aider à les résoudre en entier.",
);

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Multiplier plusieurs nombres relatifs',
    intro: ['Tu sais multiplier deux nombres relatifs. Mais un calcul peut en contenir trois, quatre ou plus.', 'Dans ce cours, tu apprends à trouver le signe et le résultat sans te perdre.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes('Pourquoi ça marche', idee),
  etapes(R1, regle1),
  lecon(
    small(ex(-5, 2, 3), '-5 \\times 2 \\times 3', 'Quel est le produit des deux premiers nombres ?', [
      ['−10', 'Oui : moins cinq fois deux donne moins dix.'],
      ['−3', 'Tu as additionné moins cinq et deux. Ici, on multiplie.'],
      ['10', 'Un seul des deux nombres est négatif : le produit est négatif.'],
    ], 0),
  ),
  etapes(R2, regle2),
  lecon(
    small(ex(-2, 3, -4, -5), '-2 \\times 3 \\times (-4) \\times (-5)', 'Quel est le résultat ?', [
      ['−120', 'Oui : trois signes moins, un nombre impair, donc négatif.'],
      ['120', 'Il y a trois signes moins, pas deux : un nombre impair, donc négatif.'],
      ['−8', 'Tu as additionné les nombres. Ici, on les multiplie.'],
    ], 0),
  ),
  etapes(R3, regle3),
  lecon(
    small(ex(4, -3, 5), '4 \\times (-3) \\times 5', 'Quel est le résultat ?', [
      ['−60', 'Oui : un seul signe moins, donc négatif, et quatre fois trois fois cinq fait soixante.'],
      ['−12', 'Tu as oublié le nombre cinq : tous les nombres entrent dans le produit.'],
      ['60', 'Il y a un seul signe moins : le résultat est négatif.'],
    ], 0),
  ),
  texted(
    decouverte(
      choix(
        ex(-2, 3, -4),
        'Quel est le résultat de chaque calcul ?',
        options3(
          ['A fait 24 et B fait 6', 'Oui : dans les deux cas, deux signes moins donnent un résultat positif.'],
          ['A fait 24 et B fait −6', 'B a deux signes moins : le résultat est positif.'],
          ['A fait −24 et B fait 6', 'A a deux signes moins aussi : le résultat est positif.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ["Voici deux calculs qui se ressemblent : un produit de trois nombres et une division. Regarde bien l'opération."],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Calcul A', latex: '-2 \\times 3 \\times (-4)' },
        b: { label: 'Calcul B', latex: '-24 \\div (-4)' },
        note: 'Le calcul B vient du cours sur la division : tu sais déjà le faire. Ici, tu observes seulement ce qui change.',
        highlight: { a: toks(hl(`${M}2`), ' × 3 × (', hl(`${M}4`), ')'), b: toks(hl(`${M}24`), ' ÷ (', hl(`${M}4`), ')') },
        after: [
          'A : il y a deux signes moins, le résultat est positif : 24.',
          'B : il y a deux signes moins, le résultat est positif : 6.',
          'La règle des signes est la même. Ce qui change : A multiplie trois nombres, B divise deux nombres.',
        ],
      },
    },
  ),
  autres({
    title: 'Autres façons de faire',
    recap: {
      title: 'Les règles à retenir',
      rules: [
        { title: '1. Deux par deux, de gauche à droite', ok: '(−2) × 3 × (−4) = −6 × (−4) = 24', ko: '(−2) × 3 × (−4) = −3' },
        { title: '2. Je compte les signes moins', ok: 'deux signes moins : positif', ko: 'deux signes moins : −24' },
        { title: '3. Tous les nombres entrent', ok: '2 × 3 × 4 = 24', ko: '2 × 3 = 6' },
      ],
      sentence: 'Je compte les signes moins, puis je multiplie tous les nombres sans leur signe.',
    },
    intro: 'La méthode marche toujours. Voici d’autres façons de faire : **choisis celle que tu veux essayer**.',
    techniques: [
      {
        name: 'Réordonner les facteurs',
        quand: 'Quand deux nombres font un nombre rond.',
        example: '25 × (−7) × 4 = (25 × 4) × (−7) = −700',
        how: 'On peut multiplier dans le désordre. Ici, vingt-cinq fois quatre fait cent : le calcul devient facile.',
        essai: {
          kind: 'saisie',
          consigne: 'Cherche les deux nombres qui font un nombre rond. **Tape le résultat.**',
          calc: `4 × (${M}3) × 25`,
          answer: -300,
          yes: 'Oui : quatre fois vingt-cinq fait cent, puis cent fois moins trois fait moins trois cents.',
          errors: [
            { values: [300], message: 'Il y a un seul signe moins : le résultat est négatif.' },
            { values: [-12], message: 'Tu as oublié le nombre vingt-cinq.' },
          ],
          fallback: 'Regroupe quatre et vingt-cinq : cela fait cent. Puis multiplie par moins trois.',
        },
      },
      {
        name: 'Chercher le zéro',
        quand: 'Quand un des nombres est zéro.',
        example: `7 × (${M}3) × 0 × 12 = 0`,
        how: 'Un produit qui contient zéro vaut zéro. On le voit avant de calculer.',
        essai: {
          kind: 'choix',
          consigne: 'Regarde les nombres avant de calculer. **Touche le résultat.**',
          calc: `5 × (${M}8) × 0 × 3`,
          options: ['0', `${M}120`, '120'],
          correct: 0,
          yes: 'Oui : un des nombres est zéro, donc le produit vaut zéro.',
          no: 'Cherche un nombre particulier dans le calcul : le zéro rend tout le produit nul.',
        },
      },
    ],
    outro: "Ensuite, tu t'entraînes avec quatre questions.",
  }),
  PRATIQUE,
  etapes('Exemple 1 sur 2', exemple1),
  texted(exemple(trou(ex(-3, 4, -5), '= \\square', 60)), {
    consigne: 'Tape ce qui manque dans la case, avec les touches du clavier.',
    above: ['= +(3 \\times 4 \\times 5)'],
    help: 'Multiplie trois, quatre et cinq : trois fois quatre fait douze, puis douze fois cinq fait soixante.',
  }),
  texted(decouverte(signBox(ex(2, -6, 5), false, 'parite-signes')), {
    consigne: 'Touche le signe du résultat.',
    intro: ["Cette fois, deux cases sont à toi. Trouve d'abord le signe du résultat, puis calcule."],
    mention: '',
  }),
  texted(exemple(trou(ex(2, -6, 5), '= \\square', -60)), { above: ['= -(2 \\times 6 \\times 5)'], mention: '' }),
  annonceFin(),
];

export const c07b: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 1,
  title: 'Multiplier plusieurs nombres relatifs (version 2)',
  shortTitle: 'Multiplier plusieurs (2)',
  rule: RULE,
  parts,
  lessonLength: parts.findIndex((p) => p.type === 'pratique'),
  unePhrase: true,
  endExercises: { count: 5, kind: 'saisie' },
  generate,
  errors,
  generalExplanation: (e) => explanation(RULE, resolution(e)),
  resolution,
  classes: SIGN_CLASSES,
  expectInteger: true,
  feedbackText,
  memo: {
    rule: RULE,
    ruleBullets: [
      'Je compte les signes moins : pair, positif ; impair, négatif.',
      'J’écris le signe, puis je multiplie tous les nombres sans leur signe.',
    ],
    examples: [`(${M}2) × 3 × (${M}4) : deux signes moins, donc positif ; 2 × 3 × 4 = 24.`, `3 × (${M}5) × 2 : un signe moins, donc négatif ; 3 × 5 × 2 = 30, donc ${M}30.`],
    mistake: { wrong: `${M}2 × 3 × (${M}4) = ${M}24`, why: 'Il y a **deux** signes moins : un nombre pair, donc le résultat est **positif**.' },
    tip: 'Je compte les signes moins : pair, positif ; impair, négatif. Puis je multiplie tous les nombres sans leur signe.',
  },
};
