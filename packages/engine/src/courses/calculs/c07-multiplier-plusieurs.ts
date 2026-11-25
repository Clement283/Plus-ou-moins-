// Cours 7 — Multiplier plusieurs nombres relatifs (doc 06 version 2, fiche courte ; mode autonome, sans maquette ; une phrase à la fois).
import { type Expr, num, op, toLatex } from '../../math/expr';
import { rat } from '../../math/rational';
import { type Rng, pick } from '../../rng';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, Level, Scene, SceneToken } from '../types';
import {
  MODULE_ID, SIGN_CLASSES, absIs, autres, buildErrors, chain, chance, choix, decouverte, draw, etapes, exemple,
  explanation, is, isOpposite, lecon, makeExercise, operands, pratique, redraw, saisie, sg, signBox, signed,
  smallChoix, step, stepped, texted, toText, trou, txt
} from './shared';

const ID = 'c07-multiplier-plusieurs';
const RULE =
  'Je compte les signes − : nombre pair → résultat positif ; nombre impair → résultat négatif. Puis je multiplie les nombres sans leur signe.';

// ——— Générateur : le niveau allonge le calcul autant qu'il agrandit les nombres (doc 08 n° 51) ———

/** Niveau 1 : 3 facteurs de 1 à 9 ; niveau 2 : 4 facteurs de 1 à 6 ; niveau 3 : 5 ou 6 facteurs de 1 à 5 (le produit reste un entier raisonnable : 15 625 au plus). Jamais de 0. */
const RANGE: Record<Level, [number, number]> = { 1: [1, 9], 2: [1, 6], 3: [1, 5] };
const COUNTS: Record<Level, number[]> = { 1: [3], 2: [4], 3: [5, 6] };

const product = (level: Level, xs: number[]): Exercise => makeExercise(ID, level, chain('*', xs));
const negatives = (xs: number[]): number => xs.filter((x) => x < 0).length;

/** Les facteurs du niveau, signes mélangés, au moins un négatif. */
function drawFactors(level: Level, rng: Rng, range: [number, number] = RANGE[level]): number[] {
  const count = pick(rng, COUNTS[level]);
  return redraw(
    () => Array.from({ length: count }, () => signed(draw(rng, range), chance(rng, 0.5))),
    (xs) => negatives(xs) >= 1,
  );
}

const generate = (level: Level, rng: Rng): Exercise => product(level, drawFactors(level, rng));

/** Les facteurs avec leur signe, puis sans leur signe. */
const factors = (ex: Exercise): number[] => operands(ex.expr);
const sizes = (ex: Exercise): number[] => factors(ex).map(Math.abs);
const prod = (xs: number[]): number => xs.reduce((p, x) => p * x, 1);
const total = (xs: number[]): number => xs.reduce((s, x) => s + x, 0);

function resolution(ex: Exercise): string[] {
  return [toLatex(ex.expr), `= ${ex.answer.n < 0 ? '-' : '+'}(${sizes(ex).join(' \\times ')})`, `= ${toLatex(num(ex.answer.n))}`];
}

// ——— Textes des retours d'erreur ———

const M = '−';
const shown = (ex: Exercise): string => toText(ex.expr);
const isProduct = (ex: Exercise): boolean => {
  const only = (e: Expr): boolean => e.k === 'num' || (e.k === 'op' && e.op === '*' && only(e.a) && only(e.b));
  return only(ex.expr) && factors(ex).length >= 3;
};
/** « 1 signe − », « 2 signes − » (aucun pour 0). */
const signes = (k: number): string => (k === 0 ? 'aucun signe −' : `${k} signe${k > 1 ? 's' : ''} −`);
/** « 2 × 3 = 6, puis 6 × 4 = 24 » : les nombres sans leur signe, deux par deux. */
function pairwise(xs: number[]): string {
  const out: string[] = [];
  let acc = xs[0] ?? 1;
  for (const x of xs.slice(1)) {
    out.push(`${acc} × ${x} = ${acc * x}`);
    acc *= x;
  }
  return out.join(', puis ');
}
/** Le signe, dit avec le compte des − : « 2 signes −, un nombre pair, le résultat est positif ». */
const signCount = (ex: Exercise): string => {
  const k = negatives(factors(ex));
  const parity = k % 2 === 0 ? 'un nombre pair' : 'un nombre impair';
  return `${signes(k)}, ${parity}, le résultat est ${ex.answer.n > 0 ? 'positif' : 'négatif'}`;
};

/** Le signe du produit donné à l'envers : un message pour un nombre pair de −, un autre pour un nombre impair. */
function signText(ex: Exercise): string {
  const k = negatives(factors(ex));
  const r = txt(ex.answer.n);
  if (k % 2 === 0)
    return `${k === 0 ? "Il n'y a" : 'Il y a'} ${signes(k)} : un nombre **pair**, les − se compensent deux par deux. Le résultat est **positif** : ${shown(ex)} = ${r}.`;
  return `Il y a ${signes(k)} : un nombre **impair**, il en reste un qui n'est pas compensé. Le résultat est **négatif** : ${shown(ex)} = ${r}.`;
}
const ADD = (ex: Exercise): string => {
  const s = sizes(ex);
  return `Ici, on **multiplie** tous les nombres : ${s.join(' × ')} = ${prod(s)}, et non ${s.join(' + ')} = ${total(s)}.`;
};
const MISSING = (ex: Exercise): string => {
  const n = factors(ex).length;
  return `Il manque un facteur : le calcul en compte ${n}, et tu n'en as multiplié que ${n - 1}. Multiplie-les tous : ${pairwise(sizes(ex))}.`;
};
const GOOD = (ex: Exercise): string => `${shown(ex)} : ${signCount(ex)}. ${pairwise(sizes(ex))}, donc ${txt(ex.answer.n)}.`;
const OTHER = (ex: Exercise): string =>
  `Le signe d'abord : ${signCount(ex)}. Puis les nombres sans leur signe, deux par deux : ${pairwise(sizes(ex))}. Donc ${txt(ex.answer.n)}.`;

/** « Relire la règle N » : la partie de la leçon qui l'explique (indices de `parts`). */
const RULE_1 = { n: 1, label: 'Multiplier deux par deux', partIndex: 1 };
const RULE_2 = { n: 2, label: 'Je compte les signes −', partIndex: 2 };
const RULE_3 = { n: 3, label: "Le signe d'abord, puis les nombres", partIndex: 3 };
const RULES: Record<string, NonNullable<ErrorDef['rule']>> = {
  'parite-signes': RULE_2,
  'addition-au-lieu-multiplication': RULE_1,
  'facteur-oublie': RULE_3,
};

/** Le produit des nombres sans leur signe privé d'un facteur de taille `skip` (le premier trouvé). */
const without = (xs: number[], skip: number): number[] | null => {
  const i = xs.indexOf(skip);
  return i < 0 ? null : [...xs.slice(0, i), ...xs.slice(i + 1)];
};
/** Les calculs où l'on a oublié un facteur : le produit des autres, sans le facteur retiré (qui n'est pas 1). */
const forgotten = (ex: Exercise): { rest: number[]; value: number }[] => {
  const s = sizes(ex);
  return [...new Set(s)].filter((x) => x !== 1).map((x) => ({ rest: without(s, x) as number[], value: prod(without(s, x) as number[]) }));
};

const errors: ErrorDef[] = buildErrors(
  [
    {
      id: 'parite-signes',
      family: 'signe',
      detect: isOpposite,
      text: signText,
      // un nombre pair de négatifs (2, 4 ou 6)
      draw: (level, rng) => product(level, redraw(() => drawFactors(level, rng), (xs) => negatives(xs) % 2 === 0)),
      sample: (ex) => -ex.answer.n,
      // −2 × 3 × (−4) = −(2 × 3 × 4) = −24
      wrongLines: (ex, w) => (w === -ex.answer.n ? stepped(ex, `${sg(w)}(${sizes(ex).join(' \\times ')})`, w) : null),
    },
    {
      id: 'addition-au-lieu-multiplication',
      family: 'calcul',
      detect: (ex, given) => is(given, total(factors(ex))) || absIs(given, total(sizes(ex))),
      text: ADD,
      // des petits facteurs (1 à 3)
      draw: (level, rng) => product(level, drawFactors(level, rng, [1, 3])),
      sample: (ex) => total(factors(ex)),
      alsoWrong: (ex) => [total(sizes(ex)), -total(sizes(ex))],
      // −2 × 3 × (−4) = −2 + 3 + (−4) = −3, ou = +(2 + 3 + 4) = 9 (la règle des signes gardée, les nombres additionnés)
      wrongLines: (ex, w) => {
        if (w === total(factors(ex))) return stepped(ex, toLatex(chain('+', factors(ex))), w);
        return Math.abs(w) === total(sizes(ex)) && Math.sign(w) === Math.sign(ex.answer.n)
          ? stepped(ex, `${sg(w)}(${sizes(ex).join(' + ')})`, w)
          : null;
      },
    },
    {
      id: 'facteur-oublie',
      family: 'calcul',
      // le produit des autres facteurs (un facteur de plus de 1 a été oublié), avec l'un ou l'autre signe
      detect: (ex, given) => given.d === 1 && forgotten(ex).some((f) => absIs(given, f.value)),
      text: MISSING,
      // un premier facteur différent de 1 : on l'oublie
      draw: (level, rng) => redraw(() => generate(level, rng), (ex) => sizes(ex)[0] !== 1),
      sample: (ex) => signed(prod(sizes(ex).slice(1)), ex.answer.n < 0),
      alsoWrong: (ex) => [signed(prod(sizes(ex).slice(1)), ex.answer.n >= 0)],
      // −2 × 3 × (−4) = +(3 × 4) = 12 : un facteur oublié
      wrongLines: (ex, w) => {
        const f = forgotten(ex).find((x) => Math.abs(w) === x.value);
        return f && Math.sign(w) === Math.sign(ex.answer.n) ? stepped(ex, `${sg(w)}(${f.rest.join(' \\times ')})`, w) : null;
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

/** Le produit de la case au signe déjà écrit (série de pratique : −3 × (−2) × (−2) = −(3 × 2 × 2) = ▢). */
const SIGNED_HOLE = '-3 \\times (-2) \\times (-2)';
function signedHoleText(q: Extract<Question, { kind: 'trou' }>, o: Outcome): string {
  const s = sizes(q.ex);
  const g = givenOf(o);
  const r = q.ex.answer.n;
  if (o.correct) return `${s.join(' × ')} = ${prod(s)}, et le signe ${r < 0 ? M : '+'} est déjà écrit : ${txt(r)}.`;
  if (g === -r) return `Le signe est déjà trouvé, sur la ligne du dessus : ${signCount(q.ex)}. ${pairwise(s)}, donc ${txt(r)}.`;
  return typedText(q.ex, g, false);
}

function feedbackText(q: Question, o: Outcome): string | null {
  if (o.unfinished || o.errorFamily === 'ecriture') return null;
  switch (q.kind) {
    case 'saisie':
      return isProduct(q.ex) ? typedText(q.ex, givenOf(o), o.correct) : null;
    case 'trou':
      if (!isProduct(q.ex) || q.promptLatex !== '= \\square') return null;
      return toLatex(q.ex.expr) === SIGNED_HOLE ? signedHoleText(q, o) : typedText(q.ex, givenOf(o), o.correct);
    case 'qcm':
      return isProduct(q.ex) && q.choices.map((c) => c.latex).join('|') === '+|-' ? signBoxText(q.ex, o.correct) : null;
    default:
      return null;
  }
}

// ——— Leçon ———

const ex1 = (...xs: number[]): Exercise => product(1, xs);
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
  ex1(-2, 3, -4),
  'Pour commencer, à ton avis : combien vaut ce produit ?',
  options3(
    ['24', "Bonne intuition : deux signes −, ils se compensent et le résultat est positif. Le cours va t'expliquer pourquoi."],
    [`${M}24`, `Beaucoup d'élèves le pensent, mais il y a deux signes − : ils se compensent et le résultat est positif. Le cours va t'expliquer pourquoi.`],
    [`${M}3`, `${M}3, c'est ${M}2 + 3 + (${M}4) : une addition. Ici, on multiplie : 2 × 3 × 4 = 24, et le cours va t'expliquer quel signe mettre.`],
  ),
  0,
  '-2 \\times 3 \\times (-4)',
);

const REGLE1 = '**Pour multiplier plusieurs nombres, je les multiplie deux par deux, de gauche à droite.**';
const REGLE2 = '**Je compte les signes −. Nombre pair : le résultat est positif. Nombre impair : le résultat est négatif.**';
const REGLE3 = "**J'écris le signe d'abord, puis je multiplie tous les nombres sans leur signe.**";

const CALC = `${M}2 × 3 × (${M}4)`;
const MARKED = (): (string | SceneToken)[] => [hl(M), '2 × 3 × (', hl(M), '4)'];

// 1 — L'idée de départ : un produit se calcule deux par deux (règle 1, technique 2 du plan)
const deuxParDeux: EtapeStep[] = [
  step('Pour multiplier plusieurs nombres, on les multiplie **deux par deux**, de gauche à droite.', {
    scene: oneScene(hl(`${M}2 × 3`), ` × (${M}4)`),
  }),
  step(`${M}2 × 3 : un seul signe ${M}, donc le résultat est **négatif** : ${M}6.`, {
    scene: oneScene(hl(`${M}2 × 3`), ` × (${M}4)`),
    after: oneScene(hl(`${M}6`), ` × (${M}4)`),
    action: trouOf(`${M}2 × 3 : un seul signe ${M}, donc le résultat est [ ? ].`, ['négatif', 'positif'], 0, {
      1: `Un seul signe ${M} change le signe : ${M}2 × 3 = ${M}6.`,
    }),
  }),
  step(`${M}6 × (${M}4) : deux signes ${M}, donc le résultat est **positif** : 24.`, {
    scene: oneScene(hl(`${M}6 × (${M}4)`)),
    after: oneScene(`${CALC} = `, hl('24')),
    action: trouOf(`${M}6 × (${M}4) : deux signes ${M}, donc le résultat est [ ? ].`, ['positif', 'négatif'], 0, {
      1: `Deux nombres négatifs multipliés donnent un positif (Cours 5) : ${M}6 × (${M}4) = 24.`,
    }),
  }),
  step(undefined, {
    scene: linesScene([CALC], [`= ${M}6 × (${M}4)`], ['= 24']),
    rule: { n: 1, text: REGLE1 },
  }),
];

// 2 — Règle 2 : je compte les − (pourquoi : chaque − change le signe ; technique 1 du plan)
const compter: EtapeStep[] = [
  step(`Dans un produit, **chaque signe ${M}** change le signe du résultat.`, {
    scene: oneScene(...MARKED()),
  }),
  step(`Dans ${CALC}, je compte les ${M} : j'en trouve **deux**.`, {
    scene: oneScene(...MARKED()),
    after: linesScene(MARKED(), [hl(`2 signes ${M}`)]),
    action: trouOf(`Dans ${CALC}, je compte les ${M} : j'en trouve [ ? ].`, ['deux', 'un', 'trois'], 0, {
      1: `Il y a un ${M} devant le 2, et un autre dans la parenthèse (${M}4) : cela fait deux.`,
      2: `Le 3 est positif, il n'a pas de signe ${M}. Il y a seulement ${M}2 et ${M}4 : deux signes ${M}.`,
    }),
  }),
  step(`Deux, c'est un nombre **pair** : les ${M} se compensent, le résultat est **positif**.`, {
    scene: linesScene([CALC], [hl(`2 signes ${M}`)]),
    after: linesScene([CALC], [hl(`2 signes ${M}, pair : +`)]),
    action: trouOf(`Deux, c'est un nombre pair : les ${M} se compensent, le résultat est [ ? ].`, ['positif', 'négatif'], 0, {
      1: `Quand les ${M} se compensent deux par deux, il ne reste rien : le résultat est positif. On vérifie : ${M}2 × 3 = ${M}6, puis ${M}6 × (${M}4) = 24.`,
    }),
  }),
  step(`Dans ${M}1 × (${M}5) × (${M}2), il y a trois ${M} : un nombre **impair**, le résultat est **négatif**.`, {
    scene: linesScene([hl(M), '1 × (', hl(M), '5) × (', hl(M), '2)'], [hl(`3 signes ${M}`)]),
    after: linesScene([hl(M), '1 × (', hl(M), '5) × (', hl(M), '2)'], [hl(`3 signes ${M}, impair : ${M}`)]),
    action: trouOf(`Dans ${M}1 × (${M}5) × (${M}2), il y a trois ${M} : un nombre impair, le résultat est [ ? ].`, ['négatif', 'positif'], 0, {
      1: `Deux ${M} se compensent, mais le troisième reste tout seul : le résultat est négatif. On vérifie : ${M}1 × (${M}5) = 5, puis 5 × (${M}2) = ${M}10.`,
    }),
  }),
  step(undefined, {
    scene: linesScene([`Nombre pair de ${M} : +`], [`Nombre impair de ${M} : ${M}`]),
    rule: { n: 2, text: REGLE2 },
  }),
];

// 3 — Règle 3 : le signe d'abord, puis les nombres sans leur signe
const signeDabord: EtapeStep[] = [
  step("Quand on connaît le signe, on l'écrit **en premier** ; il reste à multiplier les nombres **sans leur signe**.", {
    scene: linesScene([CALC], [hl('= +(2 × 3 × 4)')]),
  }),
  step('2 × 3 × 4 = 24, et le signe + est déjà écrit.', {
    scene: linesScene([CALC], ['= +(', hl('2 × 3 × 4'), ')']),
    after: linesScene([CALC], ['= +(2 × 3 × 4)'], ['= ', hl('24')]),
    action: trouOf('2 × 3 × 4 = [ ? ].', ['24', '9', '12'], 0, {
      1: '9, c\'est 2 + 3 + 4 : tu as additionné. Ici, on multiplie : 2 × 3 = 6, puis 6 × 4 = 24.',
      2: '12, c\'est 3 × 4 : il manque le 2. On multiplie tous les nombres : 2 × 3 = 6, puis 6 × 4 = 24.',
    }),
  }),
  step(undefined, {
    scene: linesScene([CALC], ['= +(2 × 3 × 4)'], ['= 24']),
    rule: { n: 3, text: REGLE3 },
  }),
];

const compareQ = choix(
  ex1(-2, 3, -4),
  'Quel est le résultat de chaque calcul ?',
  options3(
    [`A 24, B 6`, `${M}2 × 3 × (${M}4) = 24 : deux signes ${M}, positif. ${M}24 ÷ (${M}4) = 6 : même signe, positif aussi.`],
    [`A 24, B ${M}6`, `Pour A, oui : 24. Mais B est une division de deux négatifs : même signe, le résultat est positif. ${M}24 ÷ (${M}4) = 6.`],
    [`A ${M}24, B 6`, `Pour B, oui : 6. Mais A a deux signes ${M}, un nombre pair : le résultat est positif. ${M}2 × 3 × (${M}4) = 24.`],
  ),
  0,
);

const exemple1: EtapeStep[] = [
  step('Voici la résolution. Lis la première ligne, puis touche « Je comprends ».', {
    scene: linesScene([`${M}2 × (${M}5) × (${M}3)`]),
  }),
  step(`Trois signes ${M} : un nombre impair, le résultat est **négatif**. On écrit d'abord ce signe, puis le produit des nombres sans leur signe.`, {
    scene: linesScene([`${M}2 × (${M}5) × (${M}3)`], [hl(`= ${M}(2 × 5 × 3)`)]),
    action: { type: 'comprends' },
  }),
];

// ——— Autres façons de faire (techniques 3 et 4 du plan), avec le rappel des règles en tête ———

const AUTRES: LessonPart = autres({
  title: 'Autres façons de faire',
  recap: {
    title: 'Les 3 règles à retenir',
    rules: [
      { title: '1. Je multiplie les nombres deux par deux, de gauche à droite.', ok: `${CALC} = ${M}6 × (${M}4) = 24`, ko: `${CALC} = ${M}3` },
      { title: `2. Je compte les ${M}. Pair : +. Impair : ${M}.`, ok: `${M}1 × (${M}5) × (${M}2) : trois ${M}, donc ${M}10`, ko: `${CALC} = ${M}24` },
      { title: "3. J'écris le signe d'abord, puis je multiplie les nombres sans leur signe.", ok: `4 × (${M}3) × 2 = ${M}(4 × 3 × 2) = ${M}24`, ko: `4 × (${M}3) × 2 = ${M}(4 × 3) = ${M}12` },
    ],
    sentence: `Je compte les ${M} : pair, positif ; impair, négatif. Puis je multiplie les nombres sans leur signe, deux par deux.`,
  },
  intro: 'La méthode marche toujours. Voici deux autres façons de faire : **choisis celle que tu veux essayer**.',
  techniques: [
    {
      name: 'Réordonner les facteurs',
      quand: 'Quand deux facteurs font un nombre rond.',
      example: `25 × (${M}7) × 4 = (25 × 4) × (${M}7) = ${M}700`,
      how: "Dans un produit, on peut changer l'ordre des facteurs sans changer le résultat. On rapproche ceux qui font un nombre rond, comme 25 × 4 = 100.",
      essai: {
        kind: 'saisie',
        consigne: `Essaie avec ${M}2 × 37 × 5 : rapproche ${M}2 et 5, puis multiplie. **Tape le résultat.**`,
        calc: `${M}2 × 37 × 5`,
        answer: -370,
        yes: `${M}2 × 5 = ${M}10, puis ${M}10 × 37 = ${M}370. Un seul signe ${M}, impair : négatif.`,
        errors: [
          { values: [370], message: `Le nombre est bon, mais pas le signe : il y a un seul signe ${M}, un nombre impair, le résultat est négatif.` },
          { values: [-37, 37], message: `Il faut multiplier par 37 aussi : ${M}2 × 5 = ${M}10, puis ${M}10 × 37 = ${M}370.` },
        ],
        fallback: `${M}2 × 5 = ${M}10, puis ${M}10 × 37 = ${M}370.`,
      },
    },
    {
      name: 'Chercher le 0',
      quand: 'Avant de calculer, quand un des facteurs est 0.',
      example: `${M}8 × 0 × 25 × (${M}3) = 0`,
      how: 'Dès qu\'un facteur est 0, tout le produit vaut 0. Pas besoin de compter les signes ni de multiplier.',
      essai: {
        kind: 'choix',
        consigne: `Calcule ${M}4 × 7 × 0 × (${M}9). **Touche ce que tu trouves.**`,
        calc: `${M}4 × 7 × 0 × (${M}9)`,
        options: ['0', '252', `${M}252`],
        correct: 0,
        yes: 'Un facteur est égal à 0 : le produit vaut 0, quels que soient les autres nombres.',
        no: "Regarde d'abord s'il y a un 0 : ici, oui. Un facteur égal à 0 rend tout le produit égal à 0, il n'y a rien d'autre à calculer.",
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
    title: 'Multiplier plusieurs nombres relatifs',
    intro: [
      `Tu sais **multiplier deux** nombres relatifs. Maintenant, tu vas en multiplier **plusieurs**, par exemple ${M}2 × 3 × (${M}4).`,
      'Bonne nouvelle : pas besoin de calculer le signe à chaque étape. Il suffit de **compter les signes −**.',
    ],
    mention: NOT_COUNTED_GUESS,
  }),
  // 1 — L'idée de départ : deux par deux
  etapes('Multiplier deux par deux', deuxParDeux),
  // 2 — Règle 2 : je compte les −
  etapes('Je compte les signes −', compter),
  // 3 — Règle 3 : le signe d'abord, puis les nombres
  etapes("Le signe d'abord, puis les nombres", signeDabord),
  // 4, 5 — Petites questions (sur le même écran, comptées)
  lecon(
    small(ex1(-3, 2, -5), '-3 \\times 2 \\times (-5)', 'Quel est le signe du résultat ?', [
      ['Positif', `Il y a deux signes ${M} : un nombre pair, ils se compensent. ${M}3 × 2 × (${M}5) = 30, positif.`],
      ['Négatif', `Il y a deux signes ${M}, un nombre pair : ils se compensent, le résultat est positif. ${M}3 × 2 × (${M}5) = 30.`],
      ['On ne peut pas savoir', `On peut savoir sans calculer : il suffit de compter les ${M}. Ici, il y en a deux, un nombre pair : le résultat est positif.`],
    ], 0),
  ),
  texted(
    lecon(
      small(ex1(4, -3, 2), '4 \\times (-3) \\times 2', 'Quel est le résultat ?', [
        [`${M}24`, `Un seul signe ${M}, un nombre impair : le résultat est négatif. 4 × 3 × 2 = 24, donc ${M}24.`],
        ['24', `4 × 3 × 2 = 24, c'est juste, mais il manque le signe : un seul ${M}, un nombre impair, le résultat est négatif.`],
        ['3', `3, c'est 4 + (${M}3) + 2 : tu as additionné. Ici, on multiplie : 4 × 3 × 2 = 24, puis le signe ${M}.`],
      ], 0),
    ),
    { joinPrevious: true },
  ),
  // 6 — Comparer deux cas (ne compte pas) : A de ce cours, B du Cours 6
  texted(decouverte(compareQ), {
    title: 'Comparer deux cas',
    intro: ["Voici deux calculs qui se ressemblent. Regarde bien l'opération."],
    mention: NOT_COUNTED_UNDERSTAND,
    compare: {
      a: { label: 'Calcul A', latex: '-2 \\times 3 \\times (-4)' },
      b: { label: 'Calcul B', latex: '-24 \\div (-4)' },
      note: 'Le calcul B vient du cours précédent (Cours 6) : tu sais déjà le faire. Ici, tu observes seulement ce qui change.',
      highlight: { a: toks(`${M}2 `, hl('×'), ' 3 ', hl('×'), ` (${M}4)`), b: toks(`${M}24 `, hl('÷'), ` (${M}4)`) },
      after: [
        `A : ${M}2 × 3 × (${M}4) = 24. On **multiplie** trois nombres : deux signes ${M}, le résultat est positif.`,
        `B : ${M}24 ÷ (${M}4) = 6. On **divise** deux nombres (Cours 6) : même signe, le résultat est positif aussi.`,
        "Avant de calculer, regarde bien l'opération (× ou ÷) et combien de nombres il y a.",
      ],
    },
  }),
  // 7 — Autres façons de faire (avec le rappel des règles)
  AUTRES,
  // 8 — Série de pratique (notée) : l'aide diminue, les formats changent
  pratique('Cours 7 · Pratique', [
    {
      question: trou(ex1(-3, -2, -2), '= \\square', -12),
      texts: { consigne: 'Le signe est déjà trouvé. **Tape le résultat dans la case.**', above: ['= -(3 \\times 2 \\times 2)'] },
    },
    {
      question: signBox(ex1(-2, -3, -1), false, 'parite-signes'),
      texts: { consigne: "Touche le signe du résultat. Tu n'as pas besoin de calculer.", intro: ['Quel est le signe du résultat ?'] },
    },
    {
      // une question du Cours 6 : elle doit d'abord reconnaître que ce calcul est une division
      question: choix(
        makeExercise(ID, 1, op('/', num(-56), num(7))),
        'Quel est le résultat ?',
        options3(
          [`${M}8`, `Ce calcul est une division (Cours 6) : 56 ÷ 7 = 8. Signes contraires, le résultat est négatif : ${M}8.`],
          [`${M}392`, `${M}392, c'est ${M}56 × 7 : tu as multiplié. Regarde bien l'opération : c'est une division. ${M}56 ÷ 7 = ${M}8.`],
          ['8', `8 est le bon nombre, mais il manque le signe : ${M}56 et 7 ont des signes contraires, le résultat est négatif.`],
        ),
        0,
        '-56 \\div 7',
      ),
      texts: { consigne: "Regarde bien l'opération, puis touche le résultat." },
    },
    { question: saisie(ex1(-3, 4, -5)), texts: { consigne: 'Calcule. **Tape le résultat.**' } },
  ], "Maintenant, deux exemples pour t'aider à les résoudre en entier."),
  // 9 — Exemple 1 : la première ligne est résolue à l'écran
  etapes('Exemple 1 sur 2', exemple1),
  // 10 — Exemple 1 : la dernière ligne (notée)
  texted(exemple(trou(ex1(-2, -5, -3), '= \\square', -30)), {
    consigne: 'Tape ce qui manque dans la case, avec les touches du clavier.',
    above: ['= -(2 \\times 5 \\times 3)'],
    help: "Dernière ligne. Calcule 2 × 5 × 3, avec le signe trouvé. Tu peux t'aider de la ligne du dessus.",
  }),
  // 11 — Exemple 2, case 1 : le signe (entraînement non noté)
  texted(decouverte(signBox(ex1(3, -4, -2), true, 'parite-signes')), {
    consigne: 'Touche le signe du résultat.',
    intro: ["Cette fois, deux cases sont à toi. Trouve d'abord le signe du résultat, puis calcule."],
    mention: '',
  }),
  // 12 — Exemple 2, case 2 : le résultat (notée)
  texted(exemple(trou(ex1(3, -4, -2), '= \\square', 24)), { above: ['= +(3 \\times 4 \\times 2)'], mention: '' }),
  // 13 — Annonce des exercices de fin
  etapes('Place aux 5 exercices de fin', [
    step("Cette fois, **pas d'aide**. Ils ressemblent à ce que tu verras en contrôle."),
    step('Pour valider le cours, il faut : au moins **4 exercices de fin justes sur 5** ; et **80 % de bonnes réponses** sur tout le cours.'),
    step("Si tu n'y arrives pas, ce n'est pas grave : tu feras une **série de validation**. Ce sont 5 exercices, sans refaire la leçon."),
  ]),
];

export const c07: CourseDef = {
  id: ID,
  moduleId: MODULE_ID,
  order: 7,
  title: 'Multiplier plusieurs relatifs',
  shortTitle: 'Multiplier plusieurs',
  rule: RULE,
  parts,
  lessonLength: 8,
  unePhrase: true,
  endExercises: { count: 5, kind: 'saisie' },
  generate,
  errors,
  generalExplanation: (ex) => explanation(RULE, resolution(ex)),
  resolution,
  classes: SIGN_CLASSES,
  expectInteger: true,
  feedbackText,
  memo: {
    rule: RULE,
    ruleBullets: [`Je compte les signes ${M}.`, 'Nombre pair : le résultat est positif.', 'Nombre impair : le résultat est négatif.', 'Puis je multiplie les nombres sans leur signe.'],
    examples: [`${M}2 × 3 × (${M}4) : deux ${M}, pair, donc +(2 × 3 × 4) = **24**`, `${M}1 × (${M}5) × (${M}2) : trois ${M}, impair, donc ${M}(1 × 5 × 2) = **${M}10**`],
    mistake: {
      wrong: `${M}2 × 3 × (${M}4) = ${M}24`,
      why: `Il y a deux signes ${M} : un nombre **pair**, ils se compensent. Le résultat est **positif** : 24.`,
    },
    tip: `Je compte les ${M} avant de calculer : pair, +; impair, ${M}. Puis je multiplie les nombres sans leur signe, deux par deux : 2 × 3 = 6, puis 6 × 4 = 24.`,
  },
};
