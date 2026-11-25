// Cours 3 — Additionner plusieurs relatifs (doc 06, version 2).
import { num, op, toLatex } from '../../math/expr';
import { type Rng, pick, randInt } from '../../rng';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, LineScene, Level, Scene, SceneToken } from '../types';
import {
  COMPLETE, MODULE_ID, SIGN_CLASSES, absIs, autres, buildErrors, chain, chance, choix, decouverte, draw, droiteQ, etapes, exemple,
  explanation, is, isOpposite, lecon, makeExercise, operands, pratique, redraw, saisie, signBox, signed, smallChoix, step, texted,
  trou, txt
} from './shared';

const ID = 'c03-additionner-plusieurs';
const RULE =
  "Je regroupe les positifs ensemble et les négatifs ensemble, je calcule chaque groupe, puis j'additionne les deux totaux.";

// ——— Générateur : le niveau agrandit les nombres ET rallonge le calcul (doc 08 n° 51) ———

const RANGE: Record<Level, [number, number]> = { 1: [1, 9], 2: [1, 20], 3: [10, 99] };
const COUNTS: Record<Level, number[]> = { 1: [3, 4], 2: [4, 5], 3: [5, 6] };

const sum = (level: Level, xs: number[]): Exercise => makeExercise(ID, level, chain('+', xs));
const mixed = (xs: number[]): boolean => xs.some((x) => x > 0) && xs.some((x) => x < 0);

/** Terms of the level with random signs, at least one positive and one negative. */
function drawTerms(level: Level, rng: Rng, count = pick(rng, COUNTS[level])): number[] {
  return redraw(
    () => Array.from({ length: count }, () => signed(draw(rng, RANGE[level]), chance(rng, 0.5))),
    mixed,
  );
}

const generate = (level: Level, rng: Rng): Exercise => sum(level, drawTerms(level, rng));

const positives = (xs: number[]): number[] => xs.filter((x) => x > 0);
const negatives = (xs: number[]): number[] => xs.filter((x) => x < 0);
const total = (xs: number[]): number => xs.reduce((s, x) => s + x, 0);
/** The total of the positives and the total of the negatives (negative). */
const totals = (ex: Exercise): [number, number] => {
  const xs = operands(ex.expr);
  return [total(positives(xs)), total(negatives(xs))];
};
const sizeSum = (ex: Exercise): number => operands(ex.expr).reduce((s, x) => s + Math.abs(x), 0);

/** The calculation, its terms `xs` grouped (positives then negatives), their two totals, then `result`. */
function grouping(ex: Exercise, xs: number[], result: number): string[] {
  const p = total(positives(xs));
  const n = total(negatives(xs));
  const bodies = [
    toLatex(ex.expr),
    toLatex(chain('+', [...positives(xs), ...negatives(xs)])),
    ...(p !== 0 && n !== 0 ? [toLatex(op('+', num(p), num(n)))] : []),
    toLatex(num(result)),
  ];
  // an already grouped calculation does not repeat its first line
  return bodies.filter((b, i) => i === 0 || b !== bodies[i - 1]).map((b, i) => (i === 0 ? b : `= ${b}`));
}

const resolution = (ex: Exercise): string[] => grouping(ex, operands(ex.expr), ex.answer.n);

// ——— Textes du doc 06 (retours d'erreur) ———

const M = '−';
const par = (t: number): string => (t < 0 ? `(${M}${-t})` : String(t));
const SIGN = "Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe).";
/** `p` : total des positifs, `n` : total des négatifs sans son signe. */
const inverse = (p: number, n: number): string =>
  `Regarde qui gagne : le total des positifs (${p}) ou celui des négatifs (${n}) ? Le résultat prend le signe du plus grand.`;
const TOUT =
  "Un positif et un négatif ne s'ajoutent pas comme deux nombres de même signe. Regroupe d'abord les positifs et les négatifs, puis soustrais les deux totaux (sans leur signe).";
const OUBLI = "Il manque un nombre : coche chaque nombre quand tu l'as utilisé.";
const MEME = `Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe ${M} !`;
const subtract = (big: number, small: number): string => `Signes contraires : on **soustrait**. ${big} − ${small} = ${big - small}.`;

/** « Positifs : 3 + 4 = 7. » / « Négatif : −9. » : un groupe et son total. */
const group = (label: [string, string], xs: number[]): string =>
  `${xs.length > 1 ? label[1] : label[0]} : ${xs.length > 1 ? `${xs.map(par).join(' + ')} = ` : ''}${txt(total(xs))}.`;
const POS: [string, string] = ['Positif', 'Positifs'];
const NEG: [string, string] = ['Négatif', 'Négatifs'];

/** La réponse juste d'un calcul, dite avec ses deux totaux. */
function goodText(ex: Exercise): string {
  const xs = operands(ex.expr);
  const [p, n] = totals(ex);
  const head = `${group(POS, positives(xs))} ${group(NEG, negatives(xs))}`;
  if (ex.answer.n === 0) return `${head} Puis ${p} + (${M}${p}) : deux nombres opposés s'annulent : 0.`;
  const big = Math.max(p, -n);
  const small = Math.min(p, -n);
  return `${head} Puis ${p} + (${M}${-n}) : ${big} − ${small} = ${big - small}, le plus grand, ${big}, est ${p > -n ? 'positif' : 'négatif'} : ${txt(ex.answer.n)}.`;
}

/** « Relire la règle N » : la partie de la leçon qui l'explique (indices de `parts`). */
const RULE_1 = { n: 1, label: 'Je regroupe les positifs et les négatifs', partIndex: 3 };
const RULE_2 = { n: 2, label: "Je calcule chaque groupe, puis j'additionne les deux totaux", partIndex: 4 };
const RULES: Record<string, NonNullable<ErrorDef['rule']>> = {
  'signe-inverse': RULE_2,
  'tout-additionne': RULE_1,
  'terme-oublie': RULE_1,
};

/** The smallest size of the level, for a term that is easy to forget. */
const smallest = (level: Level): number => RANGE[level][0];

const errors: ErrorDef[] = buildErrors(
  [
    {
      id: 'signe-inverse',
      family: 'signe',
      detect: (ex, given) => ex.answer.n !== 0 && isOpposite(ex, given),
      text: (ex) => {
        const [p, n] = totals(ex);
        return inverse(p, -n);
      },
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
      // … = 5 + (−6) = 1: only the final sign is wrong
      wrongLines: (ex, w) =>
        ex.answer.n !== 0 && w === -ex.answer.n ? [...resolution(ex).slice(0, -1), `= ${toLatex(num(w))}`] : null,
    },
    {
      id: 'tout-additionne',
      family: 'calcul',
      detect: (ex, given) => absIs(given, sizeSum(ex)),
      text: () => TOUT,
      draw: (level, rng) =>
        redraw(() => generate(level, rng), (ex) => negatives(operands(ex.expr)).length >= 2),
      sample: sizeSum,
      alsoWrong: (ex) => [-sizeSum(ex)],
      // … = 5 + (−2) + (−4) = −(5 + 6) = −11: the negatives added to the positives, the winner's sign kept
      wrongLines: (ex, w) => {
        const [p, n] = totals(ex);
        const r = ex.answer.n;
        if (w !== (r < 0 ? -sizeSum(ex) : sizeSum(ex))) return null;
        const step = r < 0 ? `-(${p} + ${-n})` : `${p} + ${-n}`;
        return [...resolution(ex).slice(0, -2), `= ${step}`, `= ${toLatex(num(w))}`];
      },
    },
    {
      id: 'terme-oublie',
      family: 'calcul',
      detect: (ex, given) => operands(ex.expr).some((t) => is(given, ex.answer.n - t)),
      text: () => OUBLI,
      // one term of the smallest size, easy to forget
      draw: (level, rng) =>
        sum(
          level,
          redraw(() => {
            const xs = drawTerms(level, rng);
            xs[randInt(rng, 0, xs.length - 1)] = signed(smallest(level), chance(rng, 0.5));
            return xs;
          }, mixed),
        ),
      // the term of smallest size forgotten (a trap has one of the level's smallest size)
      sample: (ex) => ex.answer.n - (operands(ex.expr).sort((x, y) => Math.abs(x) - Math.abs(y))[0] as number),
      alsoWrong: (ex) => operands(ex.expr).map((t) => ex.answer.n - t),
      // −2 + 5 + (−4) = −2 + (−4) = −6: the regrouping drops a term
      wrongLines: (ex, w) => {
        const xs = operands(ex.expr);
        const k = xs.findIndex((t) => ex.answer.n - t === w);
        return k < 0 ? null : grouping(ex, xs.filter((_, i) => i !== k), w);
      },
    },
  ],
  resolution,
).map((e): ErrorDef => ({ ...e, rule: RULES[e.id] as NonNullable<ErrorDef['rule']> }));

// ——— Retours d'erreur des questions qui comptent ———

const givenOf = (o: Outcome): number => Number(o.given.replace(/−/g, '-'));
/** A calculation of one or more terms of mixed signs. */
const isMixed = (ex: Exercise): boolean => ex.expr.k === 'op' && ex.expr.op === '+' && mixed(operands(ex.expr));

/** The message of a wrong typed answer: the sign, everything added, a term forgotten, or any other. */
function wrongText(ex: Exercise, g: number, other: string): string {
  const xs = operands(ex.expr);
  const [p, n] = totals(ex);
  if (ex.answer.n !== 0 && g === -ex.answer.n) return inverse(p, -n);
  if (Math.abs(g) === sizeSum(ex)) return TOUT;
  if (xs.some((t) => g === ex.answer.n - t)) return OUBLI;
  return other;
}

function typedText(ex: Exercise, o: Outcome): string | null {
  if (!isMixed(ex)) return null;
  if (o.correct) return goodText(ex);
  const [p, n] = totals(ex);
  return wrongText(ex, givenOf(o), `Regroupe les positifs (${p}) et les négatifs (${M}${-n}), puis additionne les deux totaux : ${txt(ex.answer.n)}.`);
}

const dirOf = (by: number): string => (by < 0 ? 'gauche' : 'droite');

/** Les 3 bonds de la série de pratique : +4, puis −6, puis +3. */
function droiteText(q: Extract<Question, { kind: 'droite' }>, o: Outcome): string | null {
  const [j1, j2, j3] = q.jumps;
  if (!j1 || !j2 || !j3 || q.jumps.length !== 3) return null;
  const sign = (by: number) => (by < 0 ? M : '+') + Math.abs(by);
  if (o.correct) {
    const xs = q.jumps.map((j) => j.by);
    return `Les bonds : ${xs.map(sign).join(', puis ')}. ${group(POS, positives(xs))} ${group(NEG, negatives(xs))} ${total(positives(xs))} + (${M}${-total(negatives(xs))}) : on arrive à ${txt(q.answer)}.`;
  }
  const p = givenOf(o);
  const first = j1.from + j1.by;
  const second = j2.from + j2.by;
  if (p === j1.from) return `Tu es resté au départ : il y a trois bonds à suivre, le premier fait ${Math.abs(j1.by)} graduations vers la ${dirOf(j1.by)}.`;
  if (p === second) return `Tu t'es arrêtée après deux bonds, en ${txt(second)} : il reste le troisième bond, ${sign(j3.by)}, vers la ${dirOf(j3.by)}.`;
  if (p === first) return `${txt(first)}, c'est l'arrivée du premier bond seulement. Il reste deux bonds à faire.`;
  const steps = Array.from({ length: Math.abs(j3.by) }, (_, i) => txt(j3.from + Math.sign(j3.by) * (i + 1))).join(', ');
  return `Le troisième bond part de ${txt(j3.from)} et fait ${Math.abs(j3.by)} graduations vers la ${dirOf(j3.by)} : ${steps}. On arrive à ${txt(q.answer)}.`;
}

/** Les trois exemples guidés à cases : chaque ligne a ses messages. */
function trouText(q: Extract<Question, { kind: 'trou' }>, o: Outcome): string | null {
  const g = givenOf(o);
  const shown = toLatex(q.ex.expr);
  if (shown === '3 + (-7) + 6 + (-1)') {
    if (o.correct) return 'Signes contraires : 9 − 8 = 1. Le plus grand, 9, est positif : 1.';
    return wrongText(q.ex, g, `Le résultat de la ligne du dessus est 9 + (${M}8) : 9 − 8 = 1, avec le signe du plus grand, 9.`);
  }
  if (shown !== '-5 + 3 + (-4) + 2') return null;
  if (q.promptLatex === '= \\square + (-9)') {
    if (o.correct) return `Positifs : 3 + 2 = 5. Les négatifs, (${M}5) + (${M}4), font ${M}9 : même signe, 5 + 4 = 9, et on garde le signe ${M}.`;
    if (g === -5) return `Le total des positifs est positif : on écrit 5, sans signe ${M}.`;
    return 'Le groupe des positifs est 3 et 2 : on les additionne, 3 + 2 = 5.';
  }
  if (o.correct) return `Signes contraires : 9 − 5 = 4. Le plus grand, 9, est négatif : ${M}4.`;
  return wrongText(q.ex, g, `Soustrais 5 de 9 (sans les signes), puis prends le signe du plus grand, 9 : ${M}4.`);
}

function feedbackText(q: Question, o: Outcome): string | null {
  if (o.unfinished || o.errorFamily === 'ecriture') return null;
  switch (q.kind) {
    case 'saisie':
      return typedText(q.ex, o);
    case 'droite':
      return droiteText(q, o);
    case 'trou':
      return trouText(q, o);
    case 'qcm': {
      if (!isMixed(q.ex) || q.choices.map((c) => c.latex).join('|') !== '+|-') return null;
      const xs = operands(q.ex.expr);
      const [p, n] = totals(q.ex);
      if (!o.correct) return inverse(p, -n);
      const big = Math.max(p, -n);
      const small = Math.min(p, -n);
      const neg = -n > p;
      return `${group(POS, positives(xs))} ${group(NEG, negatives(xs))} Le plus grand, ${big}, est ${neg ? 'négatif' : 'positif'} : le résultat est ${neg ? 'négatif' : 'positif'}. ${big} − ${small} = ${big - small}, donc ${txt(q.ex.answer.n)}.`;
    }
    default:
      return null;
  }
}

// ——— Leçon ———

const ex1 = (...xs: number[]): Exercise => sum(1, xs);
const hl = (t: string, anim?: SceneToken['anim']): SceneToken => ({ t, hl: true, ...(anim ? { anim } : {}) });
const calcOf = (...tokens: (string | SceneToken)[]): { tokens: SceneToken[] } => ({
  tokens: tokens.map((t) => (typeof t === 'string' ? { t } : t)),
});
const oneScene = (...calc: (string | SceneToken)[]): Scene => ({ layout: 'one', calcs: [calcOf(...calc)] });
const linesScene = (...calcs: (string | SceneToken)[][]): Scene => ({ layout: 'lines', calcs: calcs.map((c) => calcOf(...c)) });
const lineScene = (line: LineScene, ...calc: (string | SceneToken)[]): Scene => ({ layout: 'line', calcs: [calcOf(...calc)], line });
const neutral = (l: LineScene): LineScene => ({ ...l, tone: 'neutral' });
const trouOf = (open: string, choices: string[], correct: number, errs: Record<number, string>) =>
  ({ type: 'trou' as const, open, choices, correct, errors: errs });

/** La somme de la leçon, 5 + (−8) + 3 + (−2), et ses réécritures. */
const SUM = `5 + (${M}8) + 3 + (${M}2)`;
const GROUPED = `5 + 3 + (${M}8) + (${M}2)`;

/** Les 4 bonds de la somme, dans l'ordre donné, puis regroupés (droite de −4 à 9, non touchable). */
const ORDERED = [{ from: 0, by: 5 }, { from: 5, by: -8 }, { from: -3, by: 3 }, { from: 0, by: -2 }];
const REGROUPED = [{ from: 0, by: 5 }, { from: 5, by: 3 }, { from: 8, by: -8 }, { from: 0, by: -2 }];
const wide = (jumps: LineScene['jumps'], extra: Partial<LineScene> = {}): LineScene => ({ from: -4, to: 9, jumps, tone: 'color', ...extra });

// 1 — L'ordre des bonds ne change rien
const idee: EtapeStep[] = [
  step(`Voici la somme en **quatre bonds** : +5, ${M}8, +3, ${M}2. On les fait l'un après l'autre, dans l'ordre. On arrive en ${M}2.`, {
    scene: lineScene(wide(ORDERED, { highlight: [-2] }), SUM),
  }),
  step('Refaisons les **mêmes** bonds dans un autre ordre : d\'abord les deux bonds vers la droite, +5 et +3, puis les deux bonds vers la gauche, −8 et −2.', {
    scene: lineScene(wide(REGROUPED), `${GROUPED} = ?`),
  }),
  step(`En changeant l'ordre des bonds, on arrive **au même endroit**. On arrive en ${M}2, comme avant : **l'ordre ne change pas le résultat**, tant que chaque nombre **garde son signe** en changeant de place.`, {
    scene: lineScene(neutral(wide(REGROUPED)), `${GROUPED} = ?`),
    after: lineScene(wide(REGROUPED, { highlight: [-2] }), `${GROUPED} = ${M}2`),
    action: trouOf("En changeant l'ordre des bonds, on arrive [ ? ].", ['au même endroit', 'à un autre endroit'], 0, {
      1: `Regarde où arrive le dernier bond : c'est le même point que sur le dessin d'avant, ${M}2. Les bonds sont les mêmes, seul l'ordre change.`,
    }),
  }),
];

const REGLE1 = '**Je regroupe les positifs ensemble et les négatifs ensemble. Chaque nombre garde son signe, et je les utilise tous.**';
const REGLE2 = "**Je calcule chaque groupe, puis j'additionne les deux totaux.**";

// 3 — Règle 1 : je regroupe
const regroupe: EtapeStep[] = [
  step('Dans cette somme, les signes sont **mélangés**. Pour ne rien perdre, on **trie** : les positifs d\'un côté, les négatifs de l\'autre.', {
    scene: oneScene(SUM),
  }),
  step(`Les nombres négatifs de cette somme sont **${M}8 et ${M}2**. Les **positifs** sont donc 5 et 3.`, {
    scene: oneScene(SUM),
    after: oneScene('5 + (', hl(`${M}8`), ') + 3 + (', hl(`${M}2`), ')'),
    action: trouOf('Les nombres négatifs de cette somme sont [ ? ].', [`${M}8 et ${M}2`, '5 et 3', `${M}8 et 3`], 0, {
      1: "5 et 3 sont positifs : ils n'ont pas de signe −. Cherche les nombres écrits avec un −.",
      2: "3 est positif : il n'a pas de signe −. Il y a deux nombres écrits avec un −.",
    }),
  }),
  step(`On réécrit la somme : d'abord 5 et 3, puis (${M}8) et (${M}2). **Chaque nombre garde son signe**, et on les utilise **tous** : quatre nombres au départ, quatre à l'arrivée.`, {
    scene: linesScene([SUM], [hl(`= ${GROUPED}`)]),
  }),
  step(undefined, { rule: { n: 1, text: REGLE1 } }),
];

// 4 — Règle 2 : je calcule chaque groupe
const calcule: EtapeStep[] = [
  step('Dans chaque groupe, tous les nombres ont **le même signe** : tu sais déjà les additionner (Cours 1). Les positifs : 5 + 3 = **8**.', {
    scene: linesScene([GROUPED], [hl('positifs : 5 + 3 = 8')]),
  }),
  step(`Les négatifs : (${M}8) + (${M}2) = **${M}10**. Il reste deux totaux : **8** d'un côté, **${M}10** de l'autre.`, {
    scene: linesScene([GROUPED], [`(${M}8) + (${M}2) = ?`]),
    after: linesScene([GROUPED], [hl(`(${M}8) + (${M}2) = ${M}10`)]),
    action: trouOf(`Les négatifs : (${M}8) + (${M}2) = [ ? ].`, [`${M}10`, '10', `${M}6`], 0, {
      1: MEME,
      2: `Même signe : on **additionne** les nombres, on ne les soustrait pas. 8 + 2 = 10, donc ${M}10.`,
    }),
  }),
  step(`8 + (${M}10) : le plus grand des deux, sans signe, est 10, donc le résultat est **négatif**. 10 − 8 = 2, avec le signe ${M} : on arrive à **${M}2**.`, {
    scene: lineScene(neutral(wide([{ from: 0, by: 8 }, { from: 8, by: -10 }])), `8 + (${M}10) = ?`),
    after: lineScene(wide([{ from: 0, by: 8 }, { from: 8, by: -10 }], { highlight: [-2] }), `8 + (${M}10) = ${M}2`),
    action: trouOf(`8 + (${M}10) : le plus grand des deux, sans signe, est 10, donc le résultat est [ ? ].`, ['négatif', 'positif'], 0, {
      1: "Le plus grand des deux nombres sans signe est 10, et il est négatif : le résultat prend son signe. C'est la règle du Cours 2.",
    }),
  }),
  step(undefined, { rule: { n: 2, text: REGLE2 } }),
];

// 7 — Une autre route : de gauche à droite (technique 2 du plan)
const JUMPS_3 = [{ from: 0, by: 5 }, { from: 5, by: -8 }, { from: -3, by: 3 }];
const gauche: EtapeStep[] = [
  step(`Il y a une autre route : faire **un seul calcul à la fois**, de gauche à droite. On commence par les deux premiers nombres : 5 + (${M}8).`, {
    scene: lineScene(wide(JUMPS_3.slice(0, 2)), SUM),
  }),
  step(`5 + (${M}8) = **${M}3**. On est en ${M}3. Le calcul suivant : ${M}3 + 3.`, {
    scene: lineScene(neutral(wide(JUMPS_3.slice(0, 2))), `5 + (${M}8) = ?`),
    after: lineScene(wide(JUMPS_3.slice(0, 2), { highlight: [-3] }), `5 + (${M}8) = ${M}3`),
    action: trouOf(`5 + (${M}8) = [ ? ].`, [`${M}3`, '3', `${M}13`], 0, {
      1: `${SIGN} Ici, c'est 8, et il est négatif.`,
      2: `Signes contraires : on **soustrait**. 8 − 5 = 3, avec le signe ${M} : ${M}3.`,
    }),
  }),
  step(`${M}3 + 3 = **0**. On revient en 0 : deux nombres **opposés** s'annulent.`, {
    scene: lineScene(neutral(wide(JUMPS_3)), `${M}3 + 3 = ?`),
    after: lineScene(wide(JUMPS_3, { highlight: [0] }), `${M}3 + 3 = 0`),
    action: trouOf(`${M}3 + 3 = [ ? ].`, ['0', '6', `${M}6`], 0, {
      1: "6, c'est 3 + 3 sans le signe. Ici les signes sont contraires : on soustrait, 3 − 3 = 0.",
      2: `Deux nombres **opposés** s'annulent : ${M}3 et 3 se compensent. Le résultat est 0.`,
    }),
  }),
  step(`Il reste 0 + (${M}2) = **${M}2**. C'est le même résultat qu'avec les groupes : **les deux routes arrivent au même endroit**. Regrouper est pratique quand il y a beaucoup de nombres. Avancer à gauche, c'est un seul calcul à la fois. **Choisis celle qui te rassure.**`, {
    scene: lineScene(wide([...JUMPS_3, { from: 0, by: -2 }], { highlight: [-2] }), `0 + (${M}2) = ${M}2`),
  }),
];

const options3 = (...o: [string, string][]) => o.map(([label, why]) => ({ label, why }));

const guess = choix(
  ex1(5, 3, -8, -2),
  'Pour commencer, à ton avis : tu as 5 € et 3 € en poche. Tu dois 8 € à un ami et 2 € à un autre. Où en es-tu en tout ?',
  options3(
    ['Il me manque 2 €', "Tu as 5 + 3 = 8 € et tu dois 8 + 2 = 10 € : il te manque 2 €. Le cours va t'expliquer comment l'écrire avec des nombres relatifs, sans perdre un signe en route."],
    ['Il me reste 2 €', "En tout, tu as 8 € mais tu dois 10 € : tu dois plus que tu n'as. Il te manque donc 2 €."],
    ['Il me manque 18 €', "18, c'est tout mélangé : ce que tu as et ce que tu dois ne s'additionnent pas ensemble. Compte d'abord ce que tu as (8 €), puis ce que tu dois (10 €), puis compare."],
  ),
  0,
);

const compareQ = choix(
  ex1(-2, 5, -4),
  "Qu'est-ce qui change entre A et B ?",
  options3(
    ['Le premier nombre', `Les deux calculs commencent par ${M}2 : le premier nombre ne change pas.`],
    ['Il y a un bond de plus', `Le calcul A a un troisième nombre, (${M}4) : il y a un bond de plus à faire après les deux premiers.`],
    ['Le signe du deuxième nombre', 'Le deuxième nombre est 5 dans les deux calculs : son signe ne change pas.'],
  ),
  1,
);

const NOT_COUNTED_GUESS = 'Question pour découvrir : elle ne compte pas dans la note.';
const NOT_COUNTED_UNDERSTAND = 'Question pour comprendre : elle ne compte pas dans la note.';

/** Petites questions (comptées) : `calc` en LaTeX au-dessus de la question. */
const small = (ex: Exercise, calc: string, prompt: string, options: [string, string][], correctIndex: number): Question =>
  smallChoix(ex, prompt, options.map(([label, why]) => ({ label, why })), correctIndex, calc);

/** Une petite question de leçon ; la 2e d'un écran (`joinPrevious`) partage l'écran de la précédente. */
const smallPart = (question: Question, joinPrevious = false): LessonPart => (joinPrevious ? texted(lecon(question), { joinPrevious: true }) : lecon(question));

const exemple1: EtapeStep[] = [
  step('Voici la résolution complète. Lis chaque ligne, puis touche « Je comprends ».', {
    scene: linesScene([`3 + (${M}7) + 6 + (${M}1)`]),
  }),
  step(`Je regroupe : les positifs, 3 et 6, d'abord ; les négatifs, (${M}7) et (${M}1), ensuite. Chaque nombre garde son signe : il y en a toujours quatre.`, {
    scene: linesScene([`3 + (${M}7) + 6 + (${M}1)`], [hl(`= 3 + 6 + (${M}7) + (${M}1)`)]),
    action: { type: 'comprends' },
  }),
  step(`Positifs : 3 + 6 = 9. Négatifs : (${M}7) + (${M}1), même signe : 7 + 1 = 8, et je garde le signe ${M} : ${M}8.`, {
    scene: linesScene([`3 + (${M}7) + 6 + (${M}1)`], [`= 3 + 6 + (${M}7) + (${M}1)`], [hl(`= 9 + (${M}8)`)]),
    action: { type: 'comprends' },
  }),
];

// ——— Autres façons de faire (techniques 3 et 4 du plan) ———

const AUTRES: LessonPart = autres({
  title: 'Autres façons de faire',
  recap: {
    title: 'Les 2 règles à retenir',
    rules: [
      { title: '1. Je regroupe les positifs ensemble et les négatifs ensemble.', ok: `${M}2 + 5 + (${M}4) = 5 + (${M}2) + (${M}4)`, ko: `${M}2 + 5 + (${M}4) = 5 + 2 + 4` },
      { title: "2. Je calcule chaque groupe, puis j'additionne les deux totaux.", ok: `5 + (${M}6) = ${M}1`, ko: `5 + (${M}6) = 1` },
    ],
    sentence: "Je regroupe les positifs et les négatifs, je calcule chaque groupe, puis j'additionne les deux totaux.",
  },
  intro: 'La méthode marche toujours. Voici deux autres façons de faire : **choisis celle que tu veux essayer**.',
  techniques: [
    {
      name: 'Chercher les opposés et les nombres ronds',
      quand: "Dès qu'un nombre et son opposé sont dans la somme.",
      example: `7 + (${M}4) + (${M}7) + 10 : 7 et (${M}7) s'annulent ; (${M}4) + 10 = 6`,
      how: "Deux nombres opposés font 0 : on les barre. Il ne reste que (−4) + 10 = 6. On peut aussi chercher des nombres qui font un nombre rond ensemble (6 et 4, 15 et 5…) : une addition se fait dans n'importe quel ordre.",
      essai: {
        kind: 'saisie',
        consigne: `Essaie avec 9 + (${M}3) + (${M}9) + 4 : repère les deux opposés, puis calcule. **Tape le résultat.**`,
        calc: `9 + (${M}3) + (${M}9) + 4`,
        answer: 1,
        yes: `9 et (${M}9) s'annulent. Il reste (${M}3) + 4 : 4 − 3 = 1, le plus grand, 4, est positif : 1.`,
        errors: [{ values: [-1], message: `${SIGN} Ici, c'est 4, et il est positif.` }],
        fallback: `9 et (${M}9) s'annulent. Il reste (${M}3) + 4 : 4 − 3 = 1.`,
      },
    },
    {
      name: 'Cocher chaque nombre utilisé',
      quand: 'Dans les longues sommes.',
      example: `3 + (${M}5) + 8 + (${M}1) : 3 ✓ (${M}5) ✓ 8 ✓ (${M}1) ✓ : quatre nombres, quatre coches`,
      how: "Chaque fois que tu places un nombre dans un groupe, tu le coches (sur ta feuille, tu peux le barrer). À la fin, tous les nombres sont cochés : tu n'en as oublié aucun.",
      essai: {
        kind: 'choix',
        consigne: `Essaie avec 8 + (${M}3) + 2 + (${M}6). Quelqu'un a regroupé : 8 + 2 + (${M}3). **Touche le nombre oublié.**`,
        calc: `8 + (${M}3) + 2 + (${M}6)`,
        options: [`${M}3`, '2', `${M}6`],
        correct: 2,
        yes: `Quatre nombres au départ, trois à l'arrivée : (${M}6) n'a pas été coché.`,
        no: `Ce nombre est bien dans le regroupement. En cochant chaque nombre, on voit que c'est (${M}6) qui manque.`,
      },
    },
  ],
  outro: "Ensuite, tu t'entraînes avec quatre questions.",
});

const parts: LessonPart[] = [
  // 0 — Accroche + deviner (ne compte pas)
  texted(decouverte(guess), {
    title: 'Additionner plusieurs nombres relatifs',
    intro: [
      "Jusqu'ici, tu as additionné **deux** nombres. Maintenant, la somme en a **plusieurs**, avec des signes mélangés.",
      "Le piège : en changeant un nombre de place, on peut **perdre son signe**. Tu vas apprendre une méthode pour n'en perdre aucun.",
    ],
    mention: NOT_COUNTED_GUESS,
  }),
  // 1 — L'ordre des bonds ne change rien
  etapes("L'ordre des bonds ne change rien", idee),
  // 2 — Comparer deux cas (ne compte pas)
  texted(decouverte(compareQ), {
    title: 'Comparer deux cas',
    intro: ['Voici deux calculs presque identiques. Regarde-les bien.'],
    mention: NOT_COUNTED_UNDERSTAND,
    compare: {
      a: { label: 'Calcul A', latex: '-2 + 5 + (-4)' },
      b: { label: 'Calcul B', latex: '-2 + 5' },
      note: 'Le calcul B vient du cours précédent : tu sais déjà le faire. Ici, tu observes seulement ce qui change.',
      line: {
        from: -4,
        to: 4,
        jumps: [{ from: 0, by: -2 }, { from: -2, by: 5 }, { from: 3, by: -4, label: 'A' }],
        marks: [{ at: -1, text: `A : ${M}1` }, { at: 3, text: 'B : 3' }],
        tone: 'color',
      },
      after: [
        `A arrive en ${M}1 : ${M}2 + 5 + (${M}4) = ${M}1.`,
        `B arrive en 3 : ${M}2 + 5 = 3.`,
        'Dans B, deux nombres : tu sais faire (Cours 2). Dans A, un troisième bond arrive **après**. Avec plusieurs nombres, il faut une méthode pour ne perdre **aucun bond** et **aucun signe**.',
      ],
    },
  }),
  // 3 — Règle 1
  etapes('Je regroupe les positifs et les négatifs', regroupe),
  // 4 — Règle 2
  etapes('Je calcule chaque groupe', calcule),
  // 5, 6 — Petites questions, une par règle (sur le même écran, comptées)
  smallPart(
    small(ex1(-2, 5, -4), '-2 + 5 + (-4)', 'Quelle réécriture garde tous les nombres, chacun avec son signe ?', [
      [`5 + (${M}2) + (${M}4)`, `Les trois nombres sont là, chacun avec son signe : 5, puis (${M}2) et (${M}4).`],
      ['5 + 2 + 4', 'Ici les signes ont disparu : 2 et 4 sont devenus positifs. Chaque nombre garde son signe quand il change de place.'],
      [`5 + (${M}4)`, `Il manque un nombre : ${M}2 a disparu. Il y avait trois nombres au départ, il n'y en a plus que deux. ${OUBLI}`],
    ], 0),
  ),
  smallPart(
    small(ex1(7, -1, -8), '7 + (-1) + (-8)', 'Quel est le résultat ?', [
      [`${M}2`, `Positifs : 7. Négatifs : (${M}1) + (${M}8) = ${M}9. Puis 7 + (${M}9) : 9 − 7 = 2, le plus grand, 9, est négatif : ${M}2.`],
      ['2', inverse(7, 9)],
      [`${M}16`, TOUT],
    ], 0),
    true,
  ),
  // 7 — Une autre route : de gauche à droite
  etapes('De gauche à droite, un calcul à la fois', gauche),
  // 8 — Les règles, puis autres façons de faire
  AUTRES,
  // 9 — Série de pratique (notée)
  pratique('Cours 3 · Pratique', [
    { question: droiteQ(ex1(4, -6, 3), { from: -2, to: 4 }, [{ from: 0, by: 4 }, { from: 4, by: -6 }, { from: -2, by: 3 }]) },
    {
      question: signBox(ex1(3, -9, 4), false, 'signe-inverse'),
      texts: { consigne: "Touche le signe du résultat. Tu n'as pas besoin de calculer.", intro: ['Quel est le signe du résultat ?'] },
    },
    {
      // une question du Cours 2 : elle doit d'abord reconnaître quelle règle s'applique
      question: choix(
        makeExercise(ID, 1, op('+', num(-3), num(5))),
        'Quel est le résultat ?',
        options3(
          ['2', 'Deux nombres de signes contraires (Cours 2) : 5 − 3 = 2. Le plus grand, 5, est positif : le résultat est 2.'],
          [`${M}2`, `${SIGN} Ici, c'est 5, et il est positif.`],
          ['8', 'Les signes sont contraires : on **soustrait** les nombres sans leur signe, on ne les additionne pas. 5 − 3 = 2.'],
        ),
        0,
        '-3 + 5',
      ),
      texts: { consigne: "Regarde d'abord les signes des deux nombres, puis touche le résultat." },
    },
    { question: saisie(ex1(5, -9, 2, -4)), texts: { consigne: 'Calcule. **Tape le résultat.**' } },
  ], "Maintenant, deux exemples pour t'aider à les résoudre en entier."),
  // 10 — Exemple 1 : tout est résolu à l'écran
  etapes('Exemple 1 sur 2', exemple1),
  // 11 — Exemple 1 : la dernière ligne (notée)
  texted(exemple(trou(ex1(3, -7, 6, -1), '= \\square', 1)), {
    consigne: 'Tape ce qui manque dans la case, avec les touches du clavier.',
    above: ['= 3 + 6 + (-7) + (-1)', '= 9 + (-8)'],
    help: "Dernière ligne. Écris le résultat, avec son signe. Tu peux t'aider de la ligne du dessus.",
  }),
  // 12 — Exemple 2, case 1 (entraînement non noté)
  texted(decouverte(trou(ex1(-5, 3, -4, 2), '= \\square + (-9)', 5)), {
    consigne: COMPLETE,
    intro: ['Cette fois, deux cases sont à toi. Les nombres sont déjà regroupés : calcule chaque groupe, puis additionne les deux totaux.'],
    above: ['= 3 + 2 + (-5) + (-4)'],
    mention: '',
  }),
  // 13 — Exemple 2, case 2 (le résultat, notée)
  texted(exemple(trou(ex1(-5, 3, -4, 2), '= \\square', -4)), { above: ['= 3 + 2 + (-5) + (-4)', '= 5 + (-9)'], mention: '' }),
  // 14 — Annonce des exercices de fin
  etapes('Place aux 5 exercices de fin', [
    step("Cette fois, **pas d'aide**. Ils ressemblent à ce que tu verras en contrôle."),
    step('Pour valider le cours, il faut : au moins **4 exercices de fin justes sur 5** ; et **80 % de bonnes réponses** sur tout le cours.'),
    step("Si tu n'y arrives pas, ce n'est pas grave : tu feras une **série de validation**. Ce sont 5 exercices, sans refaire la leçon."),
  ]),
];

export const c03: CourseDef = {
  id: ID,
  moduleId: MODULE_ID,
  order: 3,
  title: 'Additionner plusieurs nombres relatifs',
  shortTitle: 'Plusieurs relatifs',
  rule: RULE,
  parts,
  lessonLength: 9,
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
    examples: [`5 + (${M}8) + 3 + (${M}2) = 5 + 3 + (${M}8) + (${M}2) = 8 + (${M}10) = **${M}2**`],
    mistake: {
      wrong: `5 + (${M}8) + 3 + (${M}2) = 5 + 3 + 8 + 2`,
      why: "Quand un nombre change de place, il **garde son signe**. Et je compte les nombres au départ et à l'arrivée : je n'en oublie aucun.",
    },
    tip: "Regrouper les positifs, puis les négatifs. On peut réécrire l'addition dans l'ordre qu'on veut (par exemple d'abord les négatifs, puis les positifs) : chaque nombre garde son signe.",
  },
};

