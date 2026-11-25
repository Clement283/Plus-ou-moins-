// Cours 5 — Multiplier deux nombres relatifs (doc 06 version 2, fiche courte ; mode autonome, sans maquette).
import { num, op, toLatex } from '../../math/expr';
import { rat } from '../../math/rational';
import type { Rng } from '../../rng';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, Level, Scene, SceneToken } from '../types';
import {
  MODULE_ID, SIGN_CLASSES, absIs, autres, buildErrors, chance, choix, decouverte, draw, etapes, exemple,
  explanation, is, isOpposite, lecon, makeExercise, operands, pratique, redraw, resultLine, saisie, sg, signBox, signs,
  smallChoix, step, stepped, texted, toText, trou, txt
} from './shared';

const ID = 'c05-multiplier-deux';
const RULE =
  'Pour multiplier deux nombres relatifs, je multiplie les nombres sans leur signe, puis je mets le signe : même signe, le résultat est positif ; signes contraires, il est négatif.';

// ——— Générateur : le produit de deux relatifs (pour deux facteurs, le calcul ne s'allonge pas : c'est le Cours 7) ———

type Range = [number, number];
const product = (level: Level, a: number, b: number): Exercise => makeExercise(ID, level, op('*', num(a), num(b)));

/** Tailles des deux facteurs : niveau 1, les tables (1 à 9) ; niveau 2, un facteur de 11 à 20 par 2 à 9, ou les tables de 11 et 12 ; niveau 3, deux facteurs à deux chiffres (10 à 99 et 10 à 19). */
function sizesOf(level: Level, rng: Rng): [Range, Range] {
  if (level === 1) return [[1, 9], [1, 9]];
  if (level === 2) return chance(rng, 0.5) ? [[11, 20], [2, 9]] : [[11, 12], [2, 12]];
  return [[10, 99], [10, 19]];
}
/** « Petits nombres » de chaque niveau, pour le piège de l'addition (−2 × 3). */
const SMALL: Record<Level, [Range, Range]> = { 1: [[2, 4], [2, 4]], 2: [[11, 15], [2, 4]], 3: [[10, 15], [10, 12]] };

function drawProduct(level: Level, rng: Rng, sizes: [Range, Range], [na, nb]: [boolean, boolean]): Exercise {
  const x = draw(rng, sizes[0]);
  const y = draw(rng, sizes[1]);
  const [a, b] = chance(rng, 0.5) ? [x, y] : [y, x];
  return product(level, na ? -a : a, nb ? -b : b);
}

const generate = (level: Level, rng: Rng): Exercise => drawProduct(level, rng, sizesOf(level, rng), signs(rng));

/** Les deux facteurs, avec leur signe. */
const factors = (ex: Exercise): [number, number] => operands(ex.expr) as [number, number];
/** Les deux facteurs sans leur signe. */
const sizes = (ex: Exercise): [number, number] => factors(ex).map(Math.abs) as [number, number];

function resolution(ex: Exercise): string[] {
  const [a, b] = sizes(ex);
  return [toLatex(ex.expr), `= ${ex.answer.n < 0 ? '-' : '+'}(${a} \\times ${b})`, resultLine(ex)];
}

// ——— Textes des retours d'erreur ———

const M = '−';
const shown = (ex: Exercise): string => toText(ex.expr);
const isProduct = (ex: Exercise): boolean => ex.expr.k === 'op' && ex.expr.op === '*' && operands(ex.expr).length === 2;

/** Le signe donné à l'envers : un message par cas (deux négatifs, deux positifs, signe de l'addition, signe oublié). */
function signText(ex: Exercise): string {
  const [x, y] = factors(ex);
  const [a, b] = sizes(ex);
  const r = txt(ex.answer.n);
  if (x < 0 && y < 0)
    return `Deux nombres négatifs multipliés donnent un **positif**. Ce n'est pas comme l'addition, où ${txt(x)} + (${txt(y)}) reste négatif : ici, ${shown(ex)} = ${r}.`;
  if (x > 0 && y > 0) return `Deux nombres positifs donnent un résultat **positif** : ${shown(ex)} = ${r}.`;
  const positiveBigger = (x > 0 ? a : b) > (x > 0 ? b : a);
  if (positiveBigger)
    return `« Le signe du plus grand », c'est la règle de l'**addition**. Pour multiplier, des signes contraires donnent toujours un **négatif** : ${shown(ex)} = ${r}.`;
  return `Il manque le signe : ${txt(x)} et ${txt(y)} ont des signes contraires, le résultat est **négatif** : ${shown(ex)} = ${r}.`;
}
const ADD = (ex: Exercise): string => {
  const [a, b] = sizes(ex);
  return `Ici, c'est une **multiplication** : × et pas +. ${a} × ${b} = ${a * b}, et non ${a} + ${b} = ${a + b}.`;
};
const TABLE = (ex: Exercise): string => {
  const [a, b] = sizes(ex);
  return `Le signe est bon ! Vérifie la multiplication : ${a} × ${b} = ${a * b}.`;
};
/** Le signe, en mots : « même signe, positif » ou « signes contraires, négatif ». */
const signWords = (ex: Exercise): string => (ex.answer.n > 0 ? 'même signe, le résultat est positif' : 'signes contraires, le résultat est négatif');
const GOOD = (ex: Exercise): string => {
  const [a, b] = sizes(ex);
  return `${shown(ex)} : ${signWords(ex)}. ${a} × ${b} = ${a * b}, donc ${txt(ex.answer.n)}.`;
};
const OTHER = (ex: Exercise): string => {
  const [a, b] = sizes(ex);
  return `D'abord les nombres sans leur signe : ${a} × ${b} = ${a * b}. Puis le signe : ${signWords(ex)}. Donc ${txt(ex.answer.n)}.`;
};

/** « Relire la règle N » : la partie de la leçon qui l'explique (indices de `parts`). */
const RULE_1 = { n: 1, label: 'Le signe du produit', partIndex: 2 };
const RULE_2 = { n: 2, label: "Les nombres d'abord, le signe ensuite", partIndex: 3 };
const RULES: Record<string, NonNullable<ErrorDef['rule']>> = {
  'regle-signes': RULE_1,
  'addition-au-lieu-multiplication': RULE_2,
  'erreur-table': RULE_2,
};

const errors: ErrorDef[] = buildErrors(
  [
    {
      id: 'regle-signes',
      family: 'signe',
      detect: (ex, given) => ex.answer.n !== 0 && isOpposite(ex, given),
      text: signText,
      draw: (level, rng) => drawProduct(level, rng, sizesOf(level, rng), [true, true]),
      sample: (ex) => -ex.answer.n,
      // −3 × (−4) = −(3 × 4) = −12
      wrongLines: (ex, w) => {
        const [a, b] = sizes(ex);
        return w === -ex.answer.n ? stepped(ex, `${sg(w)}(${a} \\times ${b})`, w) : null;
      },
    },
    {
      id: 'addition-au-lieu-multiplication',
      family: 'calcul',
      detect: (ex, given) => {
        const [x, y] = factors(ex);
        return is(given, x + y) || absIs(given, Math.abs(x) + Math.abs(y));
      },
      text: ADD,
      draw: (level, rng) => drawProduct(level, rng, SMALL[level], signs(rng)),
      sample: (ex) => factors(ex)[0] + factors(ex)[1],
      alsoWrong: (ex) => {
        const [a, b] = sizes(ex);
        return [a + b, -(a + b)];
      },
      // −3 × (−4) = −3 + (−4) = −7, ou = +(3 + 4) = 7 (le signe juste, les nombres additionnés)
      wrongLines: (ex, w) => {
        const [x, y] = factors(ex);
        const [a, b] = sizes(ex);
        if (w === x + y) return stepped(ex, toLatex(op('+', num(x), num(y))), w);
        return Math.abs(w) === a + b && Math.sign(w) === Math.sign(ex.answer.n) ? stepped(ex, `${sg(w)}(${a} + ${b})`, w) : null;
      },
    },
    {
      id: 'erreur-table',
      family: 'calcul',
      // même signe que la bonne réponse, décalée d'un des deux nombres (3 × 4 → 9, 15, 8 ou 16)
      detect: (ex, given) => {
        const r = ex.answer.n;
        if (given.d !== 1 || given.n === 0 || Math.sign(given.n) !== Math.sign(r)) return false;
        return sizes(ex).some((x) => Math.abs(given.n) === Math.abs(r) + x || Math.abs(given.n) === Math.abs(r) - x);
      },
      text: TABLE,
      // « les tables qu'elle a ratées » demande son historique : ici une table sans 1.
      draw: (level, rng) => redraw(() => generate(level, rng), (ex) => sizes(ex).every((x) => x >= 2)),
      sample: (ex) => ex.answer.n + Math.sign(ex.answer.n) * sizes(ex)[0],
      alsoWrong: (ex) => {
        const r = ex.answer.n;
        return sizes(ex).flatMap((x) => [r + Math.sign(r) * x, r - Math.sign(r) * x]);
      },
      // −3 × (−4) = +(3 × 4) = 16 : le signe est juste, la table fausse
      wrongLines: (ex, w) => {
        const [a, b] = sizes(ex);
        const r = ex.answer.n;
        return w !== r && Math.sign(w) === Math.sign(r) ? stepped(ex, `${sg(r)}(${a} \\times ${b})`, w) : null;
      },
    },
  ],
  resolution,
).map((e): ErrorDef => ({ ...e, rule: RULES[e.id] as NonNullable<ErrorDef['rule']> }));

// ——— Retours d'erreur des questions qui comptent ———

const givenOf = (o: Outcome): number => Number(o.given.replace(/−/g, '-'));

/** Le message d'une réponse tapée : juste, ou celui de l'erreur reconnue, ou la méthode pas à pas. */
function typedText(ex: Exercise, g: number, correct: boolean): string {
  if (correct) return GOOD(ex);
  if (!Number.isInteger(g)) return OTHER(ex);
  const e = errors.find((x) => x.detect(ex, rat(g)));
  return e ? e.explain(ex).rule : OTHER(ex);
}

/** « Quel est le signe du résultat ? » d'un produit. */
const signBoxText = (ex: Exercise, correct: boolean): string => (correct ? GOOD(ex) : signText(ex));

/** Une case dont le signe est déjà écrit (série de pratique : −7 × (−3) = +(7 × 3) = ▢). */
function signedHoleText(q: Extract<Question, { kind: 'trou' }>, o: Outcome): string {
  const [a, b] = sizes(q.ex);
  const g = givenOf(o);
  const r = q.ex.answer.n;
  if (o.correct) return `${a} × ${b} = ${a * b}, et le signe ${r < 0 ? M : '+'} est déjà écrit : ${txt(r)}.`;
  if (g === -r) return `Le signe est déjà trouvé, sur la ligne du dessus : ${signWords(q.ex)}. ${a} × ${b} = ${a * b}, donc ${txt(r)}.`;
  return typedText(q.ex, g, false);
}

function feedbackText(q: Question, o: Outcome): string | null {
  if (o.unfinished || o.errorFamily === 'ecriture') return null;
  switch (q.kind) {
    case 'saisie':
      return isProduct(q.ex) ? typedText(q.ex, givenOf(o), o.correct) : null;
    case 'trou':
      if (!isProduct(q.ex) || q.promptLatex !== '= \\square') return null;
      return toLatex(q.ex.expr) === '-7 \\times (-3)' ? signedHoleText(q, o) : typedText(q.ex, givenOf(o), o.correct);
    case 'qcm':
      return isProduct(q.ex) && q.choices.map((c) => c.latex).join('|') === '+|-' ? signBoxText(q.ex, o.correct) : null;
    default:
      return null;
  }
}

// ——— Leçon ———

const ex1 = (a: number, b: number): Exercise => product(1, a, b);
const hl = (t: string): SceneToken => ({ t, hl: true });
const calcOf = (...tokens: (string | SceneToken)[]): { tokens: SceneToken[] } => ({
  tokens: tokens.map((t) => (typeof t === 'string' ? { t } : t)),
});
const toks = (...tokens: (string | SceneToken)[]): SceneToken[] => calcOf(...tokens).tokens;
const oneScene = (...calc: (string | SceneToken)[]): Scene => ({ layout: 'one', calcs: [calcOf(...calc)] });
const linesScene = (...calcs: (string | SceneToken)[][]): Scene => ({ layout: 'lines', calcs: calcs.map((c) => calcOf(...c)) });
const trouOf = (open: string, choices: string[], correct: number, errs: Record<number, string>) =>
  ({ type: 'trou' as const, open, choices, correct, errors: errs });
const options3 = (...o: [string, string][]) => o.map(([label, why]) => ({ label, why }));

/** Petites questions (comptées) : `calc` en LaTeX au-dessus de la question. */
const small = (ex: Exercise, calc: string, prompt: string, options: [string, string][], correctIndex: number): Question =>
  smallChoix(ex, prompt, options.map(([label, why]) => ({ label, why })), correctIndex, calc);

// 0 — Accroche : question pour deviner
const guess = choix(
  ex1(-3, -4),
  'Pour commencer, à ton avis : combien vaut ce produit ?',
  options3(
    ['12', "Bonne intuition : deux nombres négatifs multipliés donnent un positif. Le cours va t'expliquer pourquoi."],
    ['−12', `Beaucoup d'élèves le pensent, car en addition ${M}3 + (${M}4) reste négatif. Pour la multiplication, c'est différent : le cours va t'expliquer pourquoi.`],
    ['−7', `${M}7, c'est ${M}3 + (${M}4) : une addition. Ici, on multiplie : 3 × 4 = 12, et le cours va t'expliquer quel signe mettre.`],
  ),
  0,
  '-3 \\times (-4)',
);

// 1 — L'idée de départ : multiplier, c'est répéter ; puis la suite qui monte de 2
const idee: EtapeStep[] = [
  step('3 × 2, c\'est 2 + 2 + 2 = 6 : multiplier par 3, c\'est **ajouter 3 fois** le même nombre.', {
    scene: oneScene('3 × 2 = 2 + 2 + 2 = 6'),
  }),
  step(`De même, 3 × (${M}2), c'est **3 dettes de 2 €** : (${M}2) + (${M}2) + (${M}2).`, {
    scene: linesScene([`3 × (${M}2)`], [`= (${M}2) + (${M}2) + (${M}2)`]),
  }),
  step(`Trois dettes de 2 €, c'est une **dette de 6 €** : 3 × (${M}2) = **${M}6**. Un positif fois un négatif donne un **négatif**.`, {
    scene: linesScene([`3 × (${M}2)`], [`= (${M}2) + (${M}2) + (${M}2) = ?`]),
    after: linesScene([`3 × (${M}2)`], [`= (${M}2) + (${M}2) + (${M}2) = `, hl(`${M}6`)]),
    action: trouOf(`Trois dettes de 2 €, c'est une dette de 6 € : 3 × (${M}2) = [ ? ].`, [`${M}6`, '6', '1'], 0, {
      1: `6, ce serait un gain de 6 €. Ici, on ajoute trois dettes : on doit 6 €, c'est ${M}6.`,
      2: `1, c'est 3 + (${M}2) : tu as additionné les deux nombres. Ici, on ajoute trois fois ${M}2 : (${M}2) + (${M}2) + (${M}2) = ${M}6.`,
    }),
  }),
  step(`Et ${M}1 × (${M}2) ? On ne peut pas ajouter « ${M}1 fois ». Regarde plutôt la suite : quand le premier nombre baisse de 1, le résultat **monte de 2**.`, {
    scene: linesScene([`3 × (${M}2) = ${M}6`], [`2 × (${M}2) = ${M}4`], [`1 × (${M}2) = ${M}2`]),
  }),
  step(`Après 1 × (${M}2) = ${M}2 vient 0 × (${M}2) = 0. Le résultat monte encore de 2 : ${M}1 × (${M}2) = **2**. Deux négatifs donnent un **positif**.`, {
    scene: linesScene([`1 × (${M}2) = ${M}2`], ['0 × (−2) = 0'], [`${M}1 × (${M}2) = ?`]),
    after: linesScene([`1 × (${M}2) = ${M}2`], ['0 × (−2) = 0'], [`${M}1 × (${M}2) = `, hl('2')]),
    action: trouOf(`Après 1 × (${M}2) = ${M}2 vient 0 × (${M}2) = 0. Le résultat monte encore de 2 : ${M}1 × (${M}2) = [ ? ].`, ['2', `${M}2`, '0'], 0, {
      1: `${M}2, c'est le résultat de 1 × (${M}2), deux lignes plus haut. Le résultat monte de 2 à chaque ligne : après 0 vient 2.`,
      2: `0, c'est 0 × (${M}2). Une ligne plus bas, le résultat monte encore de 2 : 0 + 2 = 2.`,
    }),
  }),
];

const REGLE1 = '**Même signe : le produit est positif. Signes contraires : le produit est négatif.**';
const REGLE2 = '**Je multiplie les nombres sans leur signe, puis je mets le signe du produit.**';

// 2 — Règle 1 : le signe du produit (technique 1 du plan, la règle des signes)
const regle1: EtapeStep[] = [
  step(`Tu l'as vu : 3 × (${M}2) = ${M}6 et ${M}1 × (${M}2) = 2. Le signe du résultat dépend seulement des **signes des deux nombres**.`, {
    scene: linesScene([`3 × (${M}2) = ${M}6`], [`${M}1 × (${M}2) = 2`]),
  }),
  step(`${M}4 × (${M}5) : les deux nombres ont le **même signe**, donc le résultat est **positif** : ${M}4 × (${M}5) = 20.`, {
    scene: oneScene(`${M}4 × (${M}5) = ?`),
    after: oneScene(`${M}4 × (${M}5) = `, hl('20')),
    action: trouOf(`${M}4 × (${M}5) : les deux nombres ont le même signe, donc le résultat est [ ? ].`, ['positif', 'négatif'], 0, {
      1: `Deux négatifs multipliés donnent un positif, comme ${M}1 × (${M}2) = 2. Attention : c'est le contraire de l'addition, où ${M}4 + (${M}5) reste négatif.`,
    }),
  }),
  step(`6 × (${M}7) : les signes sont **contraires**, donc le résultat est **négatif** : 6 × (${M}7) = ${M}42.`, {
    scene: oneScene(`6 × (${M}7) = ${M}42`),
  }),
  step(`7 × (${M}2) : les signes sont contraires. 7 est le plus grand, mais le résultat est **négatif** : ${M}14. Ici, le plus grand ne compte pas.`, {
    scene: oneScene(`7 × (${M}2) = ?`),
    after: oneScene(`7 × (${M}2) = `, hl(`${M}14`)),
    action: trouOf('7 × (−2) : les signes sont contraires. 7 est le plus grand, mais le résultat est [ ? ].', ['négatif', 'positif'], 0, {
      1: `« Le signe du plus grand », c'est la règle de l'addition (Cours 2). Pour multiplier, des signes contraires donnent toujours un négatif : 7 × (${M}2) = ${M}14.`,
    }),
  }),
  step(undefined, {
    scene: linesScene(['+ × + = +'], [`${M} × ${M} = +`], [`+ × ${M} = ${M}`], [`${M} × + = ${M}`]),
    rule: { n: 1, text: REGLE1 },
  }),
];

// 3 — Règle 2 : les nombres d'abord, le signe ensuite (technique 2 du plan)
const regle2: EtapeStep[] = [
  step("Pour ne faire **qu'une chose à la fois**, on coupe le calcul en deux : d'abord les nombres **sans leur signe**, ensuite le signe.", {
    scene: oneScene(`${M}8 × 5`),
  }),
  step('Les nombres sans leur signe : 8 × 5 = **40**.', {
    scene: linesScene([`${M}8 × 5`], ['8 × 5 = ?']),
    after: linesScene([`${M}8 × 5`], ['8 × 5 = ', hl('40')]),
    action: trouOf('Les nombres sans leur signe : 8 × 5 = [ ? ].', ['40', '13', '45'], 0, {
      1: "13, c'est 8 + 5 : tu as additionné. Ici, on multiplie : 8 × 5 = 40.",
      2: "45, c'est 9 × 5. Revois la table de 5 : 8 × 5 = 40.",
    }),
  }),
  step(`Le signe ensuite : ${M}8 et 5 ont des signes contraires, donc ${M}8 × 5 = **${M}40**.`, {
    scene: linesScene([`${M}8 × 5`], ['8 × 5 = 40'], [`${M}8 × 5 = ?`]),
    after: linesScene([`${M}8 × 5`], ['8 × 5 = 40'], [`${M}8 × 5 = `, hl(`${M}40`)]),
    action: trouOf(`Le signe ensuite : ${M}8 et 5 ont des signes contraires, donc ${M}8 × 5 = [ ? ].`, [`${M}40`, '40'], 0, {
      1: `40 est le bon nombre, mais il manque le signe : ${M}8 et 5 ont des signes contraires, le résultat est négatif.`,
    }),
  }),
  step(undefined, { rule: { n: 2, text: REGLE2 } }),
];

const compareQ = choix(
  ex1(-3, -4),
  'Quel est le signe de chaque résultat ?',
  options3(
    ['A positif, B négatif', `${M}3 × (${M}4) = 12 : deux négatifs multipliés donnent un positif. ${M}3 ${M} 4 = ${M}3 + (${M}4) = ${M}7 : deux négatifs additionnés restent négatifs.`],
    ['Les deux négatifs', `Pour B, oui : ${M}3 ${M} 4 = ${M}3 + (${M}4) = ${M}7. Mais A est une multiplication : deux négatifs multipliés donnent un positif, 12.`],
    ['Les deux positifs', `Pour A, oui : ${M}3 × (${M}4) = 12. Mais B est une soustraction : ${M}3 ${M} 4 = ${M}3 + (${M}4) = ${M}7, un négatif.`],
  ),
  0,
);

const exemple1: EtapeStep[] = [
  step('Voici la résolution. Lis la première ligne, puis touche « Je comprends ».', {
    scene: linesScene([`${M}5 × (${M}8)`]),
  }),
  step("Même signe : le résultat est **positif**. On écrit d'abord ce signe, puis le produit des nombres sans leur signe.", {
    scene: linesScene([`${M}5 × (${M}8)`], [hl('= +(5 × 8)')]),
    action: { type: 'comprends' },
  }),
];

// ——— Autres façons de faire (techniques 3 et 4 du plan), avec le rappel des règles en tête ———

const AUTRES: LessonPart = autres({
  title: 'Autres façons de faire',
  recap: {
    title: 'Les 2 règles à retenir',
    rules: [
      { title: '1. Même signe : positif. Signes contraires : négatif.', ok: `${M}3 × (${M}4) = 12`, ko: `${M}3 × (${M}4) = ${M}12` },
      { title: '2. Je multiplie les nombres sans leur signe, puis je mets le signe.', ok: `6 × (${M}7) = ${M}42`, ko: `6 × (${M}7) = ${M}13` },
    ],
    sentence: 'Je multiplie les nombres sans leur signe, puis je mets le signe : même signe, positif ; signes contraires, négatif.',
  },
  intro: 'La méthode marche toujours. Voici deux autres façons de faire : **choisis celle que tu veux essayer**.',
  techniques: [
    {
      name: "Calcul mental d'un produit",
      quand: 'Quand un des nombres a deux chiffres.',
      example: `7 × (${M}12) : 7 × 10 = 70 et 7 × 2 = 14, donc 7 × 12 = 84 ; le résultat est ${M}84`,
      how: 'On coupe le nombre à deux chiffres en dizaines et unités : 12 = 10 + 2. On multiplie chaque morceau, puis on additionne. Le signe se met à la fin, comme d\'habitude.',
      essai: {
        kind: 'saisie',
        consigne: `Essaie avec ${M}6 × 13 : calcule 6 × 10 et 6 × 3, additionne, puis mets le signe. **Tape le résultat.**`,
        calc: `${M}6 × 13`,
        answer: -78,
        yes: `6 × 10 = 60 et 6 × 3 = 18 : 60 + 18 = 78. Signes contraires : ${M}78.`,
        errors: [
          { values: [78], message: `Le nombre est bon, mais pas le signe : ${M}6 et 13 ont des signes contraires, le résultat est négatif.` },
          { values: [19, -19], message: `19, c'est 6 + 13 : tu as additionné. Ici, on multiplie : 6 × 13 = 60 + 18 = 78, puis le signe ${M}.` },
          { values: [63, -63], message: 'Tu as fait 6 × 10 + 3. Il faut multiplier les deux morceaux : 6 × 10 = 60 et 6 × 3 = 18, puis additionner.' },
        ],
        fallback: `6 × 13 = 60 + 18 = 78, puis le signe ${M} : ${M}78.`,
      },
    },
    {
      name: 'Multiplier par −1, c\'est prendre l\'opposé',
      quand: `Quand un des nombres est ${M}1.`,
      example: `${M}1 × 7 = ${M}7 ; ${M}1 × (${M}5) = 5`,
      how: `Multiplier par 1 ne change rien. Multiplier par ${M}1 change seulement le signe : on obtient l'opposé du nombre.`,
      essai: {
        kind: 'choix',
        consigne: `Calcule ${M}1 × (${M}8). **Touche ce que tu trouves.**`,
        calc: `${M}1 × (${M}8)`,
        options: ['8', `${M}8`, `${M}9`],
        correct: 0,
        yes: `Multiplier par ${M}1 donne l'opposé : l'opposé de ${M}8 est 8. Et deux négatifs donnent bien un positif.`,
        no: `Multiplier par ${M}1, c'est prendre l'opposé : ${M}8 devient 8. Deux nombres négatifs donnent un positif.`,
      },
    },
  ],
  outro: "Ensuite, tu t'entraînes avec quatre questions.",
});

const NOT_COUNTED_GUESS = 'Question pour découvrir : elle ne compte pas dans la note.';
const NOT_COUNTED_UNDERSTAND = 'Question pour comprendre : elle ne compte pas dans la note.';

const parts: LessonPart[] = [
  // 0 — Accroche + deviner (ne compte pas)
  texted(decouverte(guess), {
    title: 'Multiplier deux nombres relatifs',
    intro: [
      `Tu sais **additionner** et **soustraire** des nombres relatifs. Maintenant, tu vas les **multiplier**, par exemple 3 × (${M}2) ou ${M}3 × (${M}4).`,
      "Bonne nouvelle : la règle des signes est **plus simple** que pour l'addition. Mais elle n'est **pas la même** : c'est là qu'est le piège.",
    ],
    mention: NOT_COUNTED_GUESS,
  }),
  // 1 — L'idée de départ
  etapes("Multiplier, c'est répéter", idee),
  // 2 — Règle 1
  etapes('Le signe du produit', regle1),
  // 3 — Règle 2
  etapes("Les nombres d'abord, le signe ensuite", regle2),
  // 4, 5 — Petites questions, une par règle (sur le même écran, comptées)
  lecon(
    small(ex1(-6, -3), '-6 \\times (-3)', 'Quel est le signe du résultat ?', [
      ['Positif', 'Même signe : deux négatifs donnent un positif. 6 × 3 = 18, donc −6 × (−3) = 18.'],
      ['Négatif', "C'est la règle de l'addition : −6 + (−3) reste négatif. Pour multiplier, le même signe donne un positif : 18."],
      ['On ne peut pas savoir', 'On peut savoir sans calculer : il suffit de regarder les deux signes. Ici, ils sont pareils : le résultat est positif.'],
    ], 0),
  ),
  texted(
    lecon(
      small(ex1(4, -9), '4 \\times (-9)', 'Quel est le résultat ?', [
        [`${M}36`, `Les nombres d'abord : 4 × 9 = 36. Puis le signe : signes contraires, le résultat est négatif : ${M}36.`],
        ['36', '4 × 9 = 36, c\'est juste, mais il manque le signe : 4 et −9 ont des signes contraires, le résultat est négatif.'],
        [`${M}13`, `${M}13, c'est ${M}(4 + 9) : tu as additionné les nombres. Ici, on multiplie : 4 × 9 = 36, puis le signe ${M}.`],
      ], 0),
    ),
    { joinPrevious: true },
  ),
  // 6 — Comparer deux cas (ne compte pas) : A de ce cours, B du Cours 4
  texted(decouverte(compareQ), {
    title: 'Comparer deux cas',
    intro: ["Voici deux calculs qui se ressemblent. Regarde bien l'opération."],
    mention: NOT_COUNTED_UNDERSTAND,
    compare: {
      a: { label: 'Calcul A', latex: '-3 \\times (-4)' },
      b: { label: 'Calcul B', latex: '-3 - 4' },
      note: 'Le calcul B vient du cours précédent : tu sais déjà le faire. Ici, tu observes seulement ce qui change.',
      highlight: { a: toks(`${M}3 `, hl('×'), ` (${M}4)`), b: toks(`${M}3 `, hl(M), ' 4') },
      after: [
        `A : ${M}3 × (${M}4) = 12. Deux négatifs **multipliés** donnent un **positif**.`,
        `B : ${M}3 ${M} 4 = ${M}3 + (${M}4) = ${M}7. Deux négatifs **additionnés** donnent un **négatif** (Cours 1 et 4).`,
        "Le piège : la règle des signes de l'**addition** n'est pas celle de la **multiplication**. Avant de chercher le signe, regarde bien l'opération.",
      ],
    },
  }),
  // 7 — Les règles, puis autres façons de faire
  AUTRES,
  // 8 — Série de pratique (notée) : l'aide diminue, les formats changent
  pratique('Cours 5 · Pratique', [
    {
      question: trou(ex1(-7, -3), '= \\square', 21),
      texts: { consigne: 'Le signe est déjà trouvé. **Tape le résultat dans la case.**', above: ['= +(7 \\times 3)'] },
    },
    {
      question: signBox(ex1(8, -6), false, 'regle-signes'),
      texts: { consigne: "Touche le signe du résultat. Tu n'as pas besoin de calculer.", intro: ['Quel est le signe du résultat ?'] },
    },
    {
      // une question du Cours 4 : elle doit d'abord reconnaître que ce calcul n'est pas une multiplication
      question: choix(
        makeExercise(ID, 1, op('-', num(-4), num(3))),
        'Quel est le résultat ?',
        options3(
          [`${M}7`, `Ce calcul est une soustraction (Cours 4) : ${M}4 ${M} 3 = ${M}4 + (${M}3). Même signe : 4 + 3 = 7, et je garde le signe ${M} : ${M}7.`],
          ['12', `12, c'est ${M}4 × (${M}3) : tu as multiplié. Regarde bien l'opération : c'est une soustraction. ${M}4 ${M} 3 = ${M}4 + (${M}3) = ${M}7.`],
          [`${M}1`, `Soustraire 3, c'est ajouter ${M}3, pas 3 : ${M}4 ${M} 3 = ${M}4 + (${M}3) = ${M}7.`],
        ),
        0,
        '-4 - 3',
      ),
      texts: { consigne: "Regarde bien l'opération, puis touche le résultat." },
    },
    { question: saisie(ex1(-6, -7)), texts: { consigne: 'Calcule. **Tape le résultat.**' } },
  ], "Maintenant, deux exemples pour t'aider à les résoudre en entier."),
  // 9 — Exemple 1 : la première ligne est résolue à l'écran
  etapes('Exemple 1 sur 2', exemple1),
  // 10 — Exemple 1 : la dernière ligne (notée)
  texted(exemple(trou(ex1(-5, -8), '= \\square', 40)), {
    consigne: 'Tape ce qui manque dans la case, avec les touches du clavier.',
    above: ['= +(5 \\times 8)'],
    help: "Dernière ligne. Calcule 5 × 8, avec le signe trouvé. Tu peux t'aider de la ligne du dessus.",
  }),
  // 11 — Exemple 2, case 1 : le signe (entraînement non noté)
  texted(decouverte(signBox(ex1(9, -6), false, 'regle-signes')), {
    consigne: 'Touche le signe du résultat.',
    intro: ['Cette fois, deux cases sont à toi. Trouve d\'abord le signe du résultat, puis calcule.'],
    mention: '',
  }),
  // 12 — Exemple 2, case 2 : le résultat (notée)
  texted(exemple(trou(ex1(9, -6), '= \\square', -54)), { above: ['= -(9 \\times 6)'], mention: '' }),
  // 13 — Annonce des exercices de fin
  etapes('Place aux 5 exercices de fin', [
    step("Cette fois, **pas d'aide**. Ils ressemblent à ce que tu verras en contrôle."),
    step('Pour valider le cours, il faut : au moins **4 exercices de fin justes sur 5** ; et **80 % de bonnes réponses** sur tout le cours.'),
    step("Si tu n'y arrives pas, ce n'est pas grave : tu feras une **série de validation**. Ce sont 5 exercices, sans refaire la leçon."),
  ]),
];

export const c05: CourseDef = {
  id: ID,
  moduleId: MODULE_ID,
  order: 5,
  title: 'Multiplier deux nombres relatifs',
  shortTitle: 'Multiplier',
  rule: RULE,
  parts,
  lessonLength: 8,
  endExercises: { count: 5, kind: 'saisie' },
  generate,
  errors,
  generalExplanation: (ex) => explanation(RULE, resolution(ex)),
  resolution,
  classes: SIGN_CLASSES,
  expectInteger: true,
  formats: ['saisie', 'signe', 'vraifaux', 'erreur'],
  feedbackText,
  memo: {
    rule: RULE,
    ruleBullets: ['Même signe : le résultat est positif.', 'Signes contraires : le résultat est négatif.'],
    examples: [`${M}3 × (${M}4) = +(3 × 4) = **12**`, `6 × (${M}7) = ${M}(6 × 7) = **${M}42**`],
    mistake: {
      wrong: `${M}3 × (${M}4) = ${M}12`,
      why: `C'est la règle de l'**addition** qui garde le signe ${M}. Pour multiplier, deux nombres négatifs donnent un **positif**.`,
    },
    tip: `Règle des signes : signes identiques, + ; signes contraires, ${M}. ${M}3 × (${M}4) = 12 ; 6 × (${M}7) = ${M}42.`,
  },
};
