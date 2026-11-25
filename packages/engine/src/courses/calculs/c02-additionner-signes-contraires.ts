// Cours 2 — Additionner deux nombres de signes contraires (doc 06, version 2).
import { num, op, toLatex } from '../../math/expr';
import { rat } from '../../math/rational';
import type { Rng } from '../../rng';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, LineScene, Level, Scene, SceneToken } from '../types';
import {
  COMPLETE, MODULE_ID, SIGN_CLASSES, SIZES, absIs, autres, buildErrors, chance, choix, decouverte, draw, droiteQ, etapes, exemple,
  explanation, isOpposite, lecon, makeExercise, operands, pratique, redraw, resultLine, saisie, sg, signBox, smallChoix, step, stepped, texted,
  toText, trou, txt
} from './shared';

const ID = 'c02-additionner-signes-contraires';
const RULE =
  'Signes contraires : je soustrais le plus petit (sans signe) du plus grand (sans signe), et je prends le signe du plus grand.';

const sum = (level: Level, a: number, b: number): Exercise => makeExercise(ID, level, op('+', num(a), num(b)));

/** `negative` (without sign) is the negative number, `positive` the positive one, in a random order. */
function contrary(level: Level, rng: Rng, negative: number, positive: number, negativeFirst = chance(rng, 0.5)): Exercise {
  return negativeFirst ? sum(level, -negative, positive) : sum(level, positive, -negative);
}

/** Two different sizes. */
function twoSizes(level: Level, rng: Rng): [number, number] {
  const p = draw(rng, SIZES[level]);
  return [p, redraw(() => draw(rng, SIZES[level]), (q) => q !== p)];
}

function generate(level: Level, rng: Rng): Exercise {
  if (chance(rng, 0.1)) {
    const n = draw(rng, SIZES[level]);
    return contrary(level, rng, n, n);
  }
  const [p, q] = twoSizes(level, rng);
  return contrary(level, rng, p, q);
}

const bigSmall = (ex: Exercise): [number, number] => {
  const [a, b] = operands(ex.expr).map(Math.abs) as [number, number];
  return a >= b ? [a, b] : [b, a];
};

/** Is the larger of the two numbers (without sign) the negative one? (two opposites: the first.) */
const bigIsNegative = (ex: Exercise): boolean => {
  const [a, b] = operands(ex.expr) as [number, number];
  return Math.abs(a) >= Math.abs(b) ? a < 0 : b < 0;
};

function resolution(ex: Exercise): string[] {
  if (ex.answer.n === 0) return [toLatex(ex.expr), resultLine(ex)];
  const [big, small] = bigSmall(ex);
  return [toLatex(ex.expr), `= ${ex.answer.n < 0 ? '-' : '+'}(${big} - ${small})`, resultLine(ex)];
}

// ——— Textes du doc 06 (retours d'erreur) ———

const M = '−';
const SIGN = "Le signe du résultat, c'est celui du nombre **le plus grand** (sans son signe).";
/** « … Ici, c'est 8, et il est négatif. » : le signe du plus grand, dit avec ses nombres. */
const signHere = (big: number, negative: boolean): string => `${SIGN} Ici, c'est ${big}, et il est ${negative ? 'négatif' : 'positif'}.`;
const subMsg = (big: number, small: number): string => `Signes contraires : on **soustrait**. ${big} − ${small} = ${big - small}.`;
const OPPOSITES = "Deux nombres opposés s'annulent : le résultat est 0.";

/** « Relire la règle N » : la partie de la leçon qui l'explique (indices de `parts`). */
const RULES: Record<string, NonNullable<ErrorDef['rule']>> = {
  'signe-du-mauvais-nombre': { n: 2, label: 'Le plus grand décide du signe', partIndex: 6 },
  'addition-au-lieu-soustraction': { n: 1, label: 'Je soustrais les nombres sans leur signe', partIndex: 3 },
};

const errors: ErrorDef[] = buildErrors(
  [
    {
      id: 'signe-du-mauvais-nombre',
      family: 'signe',
      detect: (ex, given) => ex.answer.n !== 0 && isOpposite(ex, given),
      text: (ex) => signHere(bigSmall(ex)[0], bigIsNegative(ex)),
      // the larger (without sign) is negative, e.g. 3 + (−8)
      draw: (level, rng) => {
        const [p, q] = twoSizes(level, rng);
        return contrary(level, rng, Math.max(p, q), Math.min(p, q));
      },
      sample: (ex) => -ex.answer.n,
      // −3 + 5 = −(5 − 3) = −2
      wrongLines: (ex, w) => {
        const [big, small] = bigSmall(ex);
        return ex.answer.n !== 0 && w === -ex.answer.n ? stepped(ex, `${sg(w)}(${big} - ${small})`, w) : null;
      },
    },
    {
      id: 'addition-au-lieu-soustraction',
      family: 'calcul',
      detect: (ex, given) => absIs(given, bigSmall(ex)[0] + bigSmall(ex)[1]),
      text: (ex) => subMsg(...bigSmall(ex)),
      // the negative first, e.g. −7 + 4
      draw: (level, rng) => {
        const [p, q] = twoSizes(level, rng);
        return contrary(level, rng, p, q, true);
      },
      sample: (ex) => bigSmall(ex)[0] + bigSmall(ex)[1],
      alsoWrong: (ex) => [-(bigSmall(ex)[0] + bigSmall(ex)[1])],
      // −3 + 5 = +(5 + 3) = 8: the sign rule kept, the sizes added
      wrongLines: (ex, w) => {
        const [big, small] = bigSmall(ex);
        const r = ex.answer.n;
        return Math.abs(w) === big + small && (r === 0 || Math.sign(w) === Math.sign(r))
          ? stepped(ex, `${sg(w)}(${big} + ${small})`, w)
          : null;
      },
    },
  ],
  resolution,
).map((e): ErrorDef => ({ ...e, rule: RULES[e.id] as NonNullable<ErrorDef['rule']> }));

// ——— Retours d'erreur des questions qui comptent ———

/** The two numbers of a calculation with contrary signs, or null. */
const terms = (ex: Exercise): [number, number] | null => {
  const t = operands(ex.expr);
  const contraryTerms = t.length === 2 && (t[0] as number) * (t[1] as number) < 0;
  return ex.expr.k === 'op' && ex.expr.op === '+' && contraryTerms ? [t[0] as number, t[1] as number] : null;
};
const givenOf = (o: Outcome): number => Number(o.given.replace(/−/g, '-'));

/** Réponse tapée sur un calcul de signes contraires : juste, signe du mauvais nombre, addition, autre. */
function typedText(ex: Exercise, o: Outcome): string | null {
  if (!terms(ex)) return null;
  const [big, small] = bigSmall(ex);
  const ans = ex.answer.n;
  const negative = bigIsNegative(ex);
  if (o.correct)
    return ans === 0
      ? `Deux nombres opposés s'annulent : ${toText(ex.expr)} = 0.`
      : `Signes contraires : ${big} − ${small} = ${big - small}. Le plus grand, ${big}, est ${negative ? 'négatif' : 'positif'} : ${txt(ans)}.`;
  const g = givenOf(o);
  if (ans !== 0 && g === -ans) return signHere(big, negative);
  if (Math.abs(g) === big + small) return subMsg(big, small);
  return ans === 0 ? OPPOSITES : `Soustrais ${small} de ${big} (sans les signes), puis prends le signe du plus grand, ${big} : ${txt(ans)}.`;
}

const dirOf = (by: number): string => (by < 0 ? 'gauche' : 'droite');

function droiteText(q: Extract<Question, { kind: 'droite' }>, o: Outcome): string | null {
  const t = terms(q.ex);
  if (!t) return null;
  const [a, b] = t;
  const [big, small] = bigSmall(q.ex);
  const ans = q.ex.answer.n;
  if (o.correct)
    return ans === 0
      ? `Les deux bonds ont la même longueur, en sens contraires : on revient en 0.`
      : `Les deux bonds vont en sens contraires : ${big} − ${small} = ${big - small}. Le grand bond va vers la ${dirOf(bigIsNegative(q.ex) ? -1 : 1)} : on arrive à ${txt(ans)}.`;
  const p = givenOf(o);
  if (p === a) return `Tu es resté au départ du deuxième bond : il fait ${Math.abs(b)} graduations vers la ${dirOf(b)}.`;
  const short = Math.sign(p - a) === Math.sign(b) && Math.abs(p - a) < Math.abs(b) ? Math.abs(b) - Math.abs(p - a) : 0;
  if (short > 0) return `Il manque ${short === 1 ? 'une graduation' : 'des graduations'} : le deuxième bond en fait ${Math.abs(b)}.`;
  const steps = Array.from({ length: Math.abs(b) }, (_, i) => txt(a + Math.sign(b) * (i + 1))).join(', ');
  return `Le deuxième bond part de ${txt(a)} et fait ${Math.abs(b)} graduations vers la ${dirOf(b)} : ${steps}. On arrive à ${txt(ans)}.`;
}

function trouText(q: Extract<Question, { kind: 'trou' }>, o: Outcome): string | null {
  const g = givenOf(o);
  if (q.promptLatex === '= \\square' && q.hidden.n === -5) {
    if (o.correct) return 'On prend le signe du plus grand, 8 : −5.';
    return g === 5 ? SIGN : "Le résultat de la ligne du dessus est −(5), c'est-à-dire −5.";
  }
  if (q.promptLatex === '3 + (-7) = -(\\square - 3)') {
    if (o.correct) return 'Le plus grand nombre sans signe est 7, et il est négatif : le signe − est devant la parenthèse, et on écrit 7 − 3.';
    if (g === 3) return "Dans −(▢ − 3), on écrit d'abord le plus grand des deux nombres sans signe : 7. On lui retire le plus petit, 3.";
    if (g === -7) return 'On écrit le nombre sans son signe : 7. Le signe − est déjà devant la parenthèse.';
    return 'Dans −(▢ − 3), on met le plus grand des deux nombres, sans son signe : 7.';
  }
  if (q.promptLatex === '3 + (-7) = -(7 - 3) = \\square') {
    if (o.correct) return '7 − 3 = 4, et 7 est négatif : −4.';
    if (g === 4) return signHere(7, true);
    return Math.abs(g) === 10 ? subMsg(7, 3) : 'Soustrais 3 de 7, puis garde le signe − devant le résultat.';
  }
  return null;
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
      if (!terms(q.ex) || q.choices.map((c) => c.latex).join('|') !== '+|-') return null;
      const [big, small] = bigSmall(q.ex);
      const negative = bigIsNegative(q.ex);
      if (!o.correct) return signHere(big, negative);
      return `Le plus grand nombre sans signe est ${big}, et il est ${negative ? 'négatif' : 'positif'} : le résultat est ${negative ? 'négatif' : 'positif'}. ${big} − ${small} = ${big - small}, donc ${txt(q.ex.answer.n)}.`;
    }
    case 'vraifaux': {
      if (!terms(q.ex) || q.isTrue) return null;
      const [big, small] = bigSmall(q.ex);
      const negative = bigIsNegative(q.ex);
      const ans = q.ex.answer.n;
      if (o.correct) return `Faux : ${big} − ${small} = ${big - small}, et le plus grand, ${big}, est ${negative ? 'négatif' : 'positif'}. Le bon résultat est ${txt(ans)}.`;
      return `Signes contraires : ${big} − ${small} = ${big - small}, et on prend le signe du plus grand, ${big} (${negative ? 'négatif' : 'positif'}). ${toText(q.ex.expr)} = ${txt(ans)}.`;
    }
    default:
      return null;
  }
}

// ——— Leçon ———

const ex1 = (a: number, b: number): Exercise => sum(1, a, b);
const hl = (t: string, anim?: SceneToken['anim']): SceneToken => ({ t, hl: true, ...(anim ? { anim } : {}) });
const calcOf = (...tokens: (string | SceneToken)[]): { tokens: SceneToken[] } => ({
  tokens: tokens.map((t) => (typeof t === 'string' ? { t } : t)),
});
const lineScene = (line: LineScene, ...calc: (string | SceneToken)[]): Scene => ({ layout: 'line', calcs: [calcOf(...calc)], line });
const NEUTRAL_HINT = "Touche la droite à l'endroit où l'on arrive.";
const trouOf = (open: string, choices: string[], correct: number, errs: Record<number, string>) =>
  ({ type: 'trou' as const, open, choices, correct, errors: errs });
const neutral = (l: LineScene): LineScene => ({ ...l, tone: 'neutral' });

/** −7 puis +2 : le grand bond et le petit bond de sens contraire. */
const BIG_SMALL = [{ from: 0, by: -7 }, { from: -7, by: 2 }];
const l7: LineScene = { from: -10, to: 1, jumps: BIG_SMALL, tone: 'color' };

/** Les 3 messages d'une graduation fausse pour un bond de `len` graduations vers la droite, parti de `start`. */
const hopErrors = (start: number, len: number, shortAt: number[], farAt: number[]) => [
  { at: [start], message: `Tu es resté au départ du bond : il fait ${len} graduations vers la droite.` },
  { at: shortAt, message: `Il manque des graduations : le bond en fait ${len}. Compte-les une par une à partir de ${txt(start)}.` },
  { at: farAt, message: `Une graduation de trop : le bond fait exactement ${len} graduations.` },
];

// 1 — Un bond qui en défait un autre
const ideeDepart: EtapeStep[] = [
  step(`Tu dois **7 €** : un bond de 7 graduations vers la **gauche**. Tu es à ${M}7.`, {
    scene: lineScene(
      {
        from: -7, to: 0, jumps: [{ from: 0, by: -7 }], tone: 'color',
        legend: "Une dette, c'est un nombre négatif",
        marks: [{ at: 0, text: 'départ' }, { at: -7, text: 'arrivée' }],
      },
      `${M}7`,
    ),
  }),
  step("Tu **rends 2 €** : c'est un bond de 2 graduations vers la **droite**, dans le sens **contraire** du premier. Tu arrives en −5 : tu dois encore **5 €**.", {
    scene: lineScene({ from: -7, to: 0, jumps: [{ from: 0, by: -7 }, { from: -7, by: 2, after: true }], tone: 'neutral' }, `${M}7 + 2`),
    after: lineScene({ from: -7, to: 0, jumps: BIG_SMALL, tone: 'color' }, `${M}7 + 2`),
    action: {
      type: 'graduation',
      consigne: NEUTRAL_HINT,
      target: -5,
      errors: hopErrors(-7, 2, [-6], [-4, -3, -2, -1, 0]),
      fallback: 'Le bond fait 2 graduations : compte-les une par une à partir de −7.',
    },
  }),
  step("Le bond de +2 est plus **court** que le bond de −7. Il ne défait qu'une partie de la dette : on reste du côté **négatif**. Le bond le **plus long décide**.", {
    scene: lineScene(l7, `${M}7 + 2`),
    action: trouOf('Le bond de +2 est plus [ ? ] que le bond de −7.', ['court', 'long'], 0, {
      1: 'Compare les deux arcs sur la droite : 2 graduations contre 7.',
    }),
  }),
];

const REGLE1 = '**Deux nombres de signes contraires : je soustrais les nombres sans leur signe.**';
const REGLE2 = '**Le nombre sans signe le plus grand décide : le résultat a son signe.**';

// 3 — Règle 1
const soustrais: EtapeStep[] = [
  step(`Reprenons ${M}7 + 2. Les signes sont contraires : les deux bonds vont en **sens contraires**. Le petit bond **défait** une partie du grand.`, {
    scene: lineScene(l7, `${M}7 + 2`),
  }),
  step('Les longueurs des bonds sont les nombres **sans leur signe** : 7 et 2. Le grand bond perd 2 graduations : il en reste 7 − 2 = **5**.', {
    scene: lineScene(
      { ...neutral(l7), jumps: [{ from: 0, by: -7, label: '7' }, { from: -7, by: 2, label: '2' }] },
      hl('7 − 2'),
    ),
    action: trouOf(
      'Les longueurs des bonds sont les nombres **sans leur signe** : 7 et 2. Le grand bond perd 2 graduations : il en reste 7 − 2 = [ ? ].',
      ['5', '9', '14'],
      0,
      {
        1: "9, c'est 7 + 2 : on additionnerait des bonds de même sens. Ici le petit bond défait une partie du grand : on soustrait.",
        2: 'On soustrait les longueurs, on ne les multiplie pas : 7 − 2.',
      },
    ),
  }),
  step(undefined, { rule: { n: 1, text: REGLE1 } }),
];

// 6 — Règle 2
const plusGrand: EtapeStep[] = [
  step('Il reste **5** graduations. Reste une question : on arrive du côté **négatif** ou du côté **positif** ?', {
    scene: lineScene(
      { ...l7, jumps: [{ from: 0, by: -7, label: '7' }, { from: -7, by: 2, label: '2' }], highlight: [-5] },
      `${M}7 + 2 = ?`,
    ),
  }),
  step("Le grand bond est celui de −7 : on reste du côté **négatif**. C'est le nombre sans signe **le plus grand** qui décide du signe.", {
    scene: lineScene(neutral(l7), `${M}7 + 2`),
    action: trouOf('Le grand bond est celui de −7 : on reste du côté [ ? ].', ['positif', 'négatif'], 1, {
      0: "Le bond de −7 est plus long que celui de +2 : c'est lui qui décide du côté. −7 est négatif.",
    }),
  }),
  step(`Du côté négatif : ${M}7 + 2 = **${M}5**. Il reste 5 graduations, du côté négatif.`, {
    scene: lineScene(neutral(l7), `${M}7 + 2 = ?`),
    action: trouOf(`Du côté négatif : ${M}7 + 2 = [ ? ]`, [`${M}5`, '5', `${M}9`], 0, {
      1: 'Il reste bien 5 graduations, mais on arrive à gauche de 0 : il faut garder le signe −, celui du plus grand nombre (7).',
      2: `${M}9 viendrait de 7 + 2. Ici les bonds sont de sens contraires : 7 − 2 = 5, avec le signe ${M}.`,
    }),
  }),
  step(`Et si le bond **positif** est le plus long ? Avec ${M}2 + 6, il dépasse 0 : on arrive du côté **positif**, en 4.`, {
    scene: lineScene({ from: -3, to: 5, jumps: [{ from: 0, by: -2 }, { from: -2, by: 6 }], tone: 'color' }, `${M}2 + 6 = 4`),
  }),
  step(`Cas particulier : ${M}6 + 6. On recule de 6, puis on **avance de 6** : on revient au départ. Deux nombres **opposés** s'annulent : ${M}6 + 6 = **0**.`, {
    scene: lineScene(
      { from: -6, to: 1, jumps: [{ from: 0, by: -6 }, { from: -6, by: 6, after: true }], tone: 'neutral' },
      `${M}6 + 6`,
    ),
    after: lineScene({ from: -6, to: 1, jumps: [{ from: 0, by: -6 }, { from: -6, by: 6 }], tone: 'color' }, `${M}6 + 6 = 0`),
    action: {
      type: 'graduation',
      consigne: NEUTRAL_HINT,
      target: 0,
      errors: hopErrors(-6, 6, [-5, -4, -3, -2, -1], [1]),
      fallback: 'Le bond fait 6 graduations : compte-les une par une à partir de −6.',
    },
  }),
  step(undefined, { rule: { n: 2, text: REGLE2 } }),
];

const options3 = (...o: [string, string][]) => o.map(([label, why]) => ({ label, why }));

const guess = choix(
  sum(1, -7, 2),
  'Pour commencer, à ton avis : tu dois 7 € à une amie, puis tu lui rends 2 €. Combien dois-tu encore ?',
  options3(
    ['5 €', "En rendant 2 €, ta dette diminue : il te reste 5 € à rendre. Le cours va t'expliquer comment l'écrire avec des nombres relatifs, et surtout comment trouver le signe."],
    ['9 €', "Rendre de l'argent fait baisser ta dette, elle ne grandit pas. Tu dois 7 € moins les 2 € rendus : 5 €."],
    ['2 €', "2 €, c'est ce que tu as rendu. Il reste à rendre ce que tu dois moins ce que tu as déjà rendu : 7 − 2 = 5 €."],
  ),
  0,
);

const compareQ = choix(
  sum(1, -7, 2),
  "Qu'est-ce qui change entre A et B ?",
  options3(
    ['Le premier nombre', `Le premier nombre est ${M}7 dans les deux calculs : il ne change pas.`],
    ['La longueur du deuxième bond', "Le deuxième bond fait 2 graduations dans les deux calculs : ce n'est pas sa longueur qui change, c'est son sens."],
    ['Le signe du deuxième nombre', 'Le deuxième nombre est positif dans le calcul A, négatif dans le calcul B : le signe change, donc le sens du bond change.'],
  ),
  2,
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
    scene: { layout: 'lines', calcs: [calcOf(`${M}8 + 3`)] },
  }),
  step('Les signes sont contraires : je soustrais 8 − 3. Le plus grand nombre sans signe est 8, et il est négatif : je mets le signe − devant la parenthèse.', {
    scene: { layout: 'lines', calcs: [calcOf(`${M}8 + 3`), calcOf(hl(`= ${M}(8 − 3)`))] },
    action: { type: 'comprends' },
  }),
  step("8 − 3 = 5. Le signe − est toujours devant : c'est le signe du plus grand nombre.", {
    scene: { layout: 'lines', calcs: [calcOf(`${M}8 + 3`), calcOf(`= ${M}(8 − 3)`), calcOf(hl(`= ${M}(5)`))] },
    action: { type: 'comprends' },
  }),
];

// ——— Autres façons de faire (techniques 3 et 4 du plan) ———

const AUTRES: LessonPart = autres({
  title: 'Autres façons de faire',
  recap: {
    title: 'Les 2 règles à retenir',
    rules: [
      { title: '1. Je soustrais les nombres sans leur signe.', ok: `${M}7 + 2 : 7 − 2 = 5`, ko: '7 + 2 = 9' },
      { title: '2. Le plus grand (sans signe) décide du signe.', ok: `3 + (${M}8) = ${M}5`, ko: `3 + (${M}8) = 5` },
      { title: 'Deux nombres opposés donnent 0.', ok: `${M}6 + 6 = 0`, ko: `${M}6 + 6 = ${M}12` },
    ],
    sentence: 'Signes contraires : je soustrais le plus petit du plus grand (sans signe), et je prends le signe du plus grand.',
  },
  intro: 'La règle marche toujours. Voici deux autres façons de faire : **choisis celle que tu veux essayer**.',
  techniques: [
    {
      name: 'Commencer par le positif',
      quand: 'Quand le calcul commence par un négatif.',
      example: `${M}7 + 2 = 2 + (${M}7) = 2 − 7 = ${M}5`,
      how: "On change l'ordre des deux nombres : une addition se calcule dans n'importe quel ordre. Puis on lit « 2 moins 7 » : on part de 2 et on recule de 7.",
      essai: {
        kind: 'saisie',
        consigne: `Essaie avec ${M}8 + 5 : écris 5 + (${M}8), puis calcule. **Tape le résultat.**`,
        calc: `${M}8 + 5 = 5 + (${M}8) = 5 − 8`,
        answer: -3,
        yes: `On part de 5 et on recule de 8 : on dépasse 0 et on arrive à ${M}3.`,
        errors: [
          { values: [3], message: signHere(8, true) },
          { values: [13, -13], message: subMsg(8, 5) },
        ],
        fallback: `Depuis 5, on recule de 8 : 5 − 8 = ${M}3.`,
      },
    },
    {
      name: 'Deviner le signe',
      quand: 'Pour vérifier un résultat, ou avant de calculer.',
      example: `${M}7 + 2 : ${M}7 est plus loin de 0 que 2`,
      how: "Le résultat a le signe du nombre le plus loin de 0 : ici négatif, donc −5. Si ton résultat a un autre signe, tu t'es trompée quelque part.",
      essai: {
        kind: 'choix',
        consigne: `Essaie avec ${M}3 + 9, sans calculer. **Touche le signe du résultat.**`,
        calc: `${M}3 + 9`,
        options: ['positif', 'négatif'],
        correct: 0,
        yes: `9 est plus loin de 0 que 3 et il est positif : le résultat est positif (${M}3 + 9 = 6).`,
        no: `Le nombre le plus loin de 0 est 9, et il est positif : le résultat est positif. ${M}3 + 9 = 6.`,
      },
    },
  ],
  outro: "Maintenant, tu t'entraînes avec quatre questions.",
});

const parts: LessonPart[] = [
  // 0 — Accroche + deviner (ne compte pas)
  texted(decouverte(guess), {
    title: 'Additionner deux nombres de signes contraires',
    intro: [
      'Quand tu additionnes un nombre **négatif** et un nombre **positif**, on dit qu\'ils ont des **signes contraires**.',
      'Dans ce cours, tu vas apprendre à trouver le résultat, et surtout **son signe**, avec une image : **la droite graduée**.',
    ],
    mention: NOT_COUNTED_GUESS,
  }),
  // 1 — Un bond qui en défait un autre
  etapes('Un bond qui en défait un autre', ideeDepart),
  // 2 — Comparer deux cas (ne compte pas)
  texted(decouverte(compareQ), {
    title: 'Comparer deux cas',
    intro: ['Voici deux calculs presque identiques. Regarde-les bien.'],
    mention: NOT_COUNTED_UNDERSTAND,
    compare: {
      a: { label: 'Calcul A', latex: '-7 + 2' },
      b: { label: 'Calcul B', latex: '-7 + (-2)' },
      note: 'Le calcul B vient du cours précédent : tu sais déjà le faire. Ici, tu observes seulement ce qui change.',
      line: {
        from: -10,
        to: 1,
        jumps: [{ from: 0, by: -7 }, { from: -7, by: 2, label: 'A' }, { from: -7, by: -2, label: 'B' }],
        marks: [{ at: -5, text: `A : ${M}5` }, { at: -9, text: `B : ${M}9` }],
        tone: 'color',
      },
      after: [
        `A arrive en ${M}5 : ${M}7 + 2 = ${M}5.`,
        `B arrive en ${M}9 : ${M}7 + (${M}2) = ${M}9.`,
        "Dans B, le deuxième bond continue vers la **gauche** : les bonds s'ajoutent (Cours 1). Dans A, il repart vers la **droite** : il **défait** une partie du premier. Ce cours traite le cas A.",
      ],
    },
  }),
  // 3 — Règle 1
  etapes('Je soustrais les longueurs des bonds', soustrais),
  // 4, 5 — Petites questions de la règle 1 (2 par écran, comptées)
  smallPart(
    small(ex1(-8, 3), '-8 + 3', 'Les signes sont contraires. Que fait-on avec 8 et 3, sans leur signe ?', [
      ['Je les additionne', subMsg(8, 3)],
      ['Je les soustrais', 'Signes contraires : on soustrait. 8 − 3 = 5.'],
      ['Je les multiplie', 'On ne multiplie pas : pour deux signes contraires, on soustrait les nombres sans leur signe. 8 − 3 = 5.'],
    ], 1),
  ),
  smallPart(
    small(ex1(9, -4), '9 + (-4)', 'Quel nombre obtient-on en soustrayant les nombres sans leur signe ?', [
      ['5', "Juste : 9 − 4 = 5. Il reste à trouver le signe, c'est la règle suivante."],
      ['13', subMsg(9, 4)],
      ['36', 'On ne multiplie pas : 9 − 4 = 5.'],
    ], 0),
    true,
  ),
  // 6 — Règle 2
  etapes('Le plus grand décide du signe', plusGrand),
  // 7, 8 — Petites questions de la règle 2 (2 par écran, comptées)
  smallPart(
    small(ex1(3, -8), '3 + (-8)', "Quel est le signe du résultat ? Tu n'as pas besoin de calculer.", [
      ['positif', signHere(8, true)],
      ['négatif', 'Le plus grand nombre sans signe est 8, et il est négatif : le résultat est négatif.'],
    ], 1),
  ),
  smallPart(
    small(ex1(-5, 8), '-5 + 8', 'Quel est le résultat ?', [
      ['3', 'Signes contraires : 8 − 5 = 3. Le plus grand, 8, est positif : le résultat est 3.'],
      [`${M}3`, signHere(8, false)],
      [`${M}13`, subMsg(8, 5)],
    ], 0),
    true,
  ),
  // 9 — Les règles, puis autres façons de faire
  AUTRES,
  // 10 — Série de pratique (notée)
  pratique('Cours 2 · Pratique', [
    { question: droiteQ(ex1(-6, 2), { from: -7, to: 0 }, [{ from: 0, by: -6 }, { from: -6, by: 2 }]) },
    {
      question: signBox(ex1(3, -8), false, 'signe-du-mauvais-nombre'),
      texts: { consigne: "Touche le signe du résultat. Tu n'as pas besoin de calculer.", intro: ['Quel est le signe du résultat ?'] },
    },
    {
      // une question du Cours 1 : elle doit d'abord reconnaître quelle règle s'applique
      question: choix(
        makeExercise(ID, 1, op('+', num(-4), num(-3))),
        'Quel est le résultat ?',
        options3(
          [`${M}7`, `Les deux nombres sont négatifs : même signe, on additionne (Cours 1). 4 + 3 = 7, on garde le signe ${M} : ${M}7.`],
          [`${M}1`, 'Les deux nombres sont négatifs : même signe. On additionne (4 + 3 = 7), on ne soustrait pas. Soustraire, c\'est pour des signes contraires.'],
          ['7', 'Les deux nombres sont négatifs : le résultat est négatif aussi. On garde le signe − !'],
        ),
        0,
        '-4 + (-3)',
      ),
      texts: { consigne: "Regarde d'abord les signes des deux nombres, puis touche le résultat." },
    },
    { question: saisie(ex1(4, -11)), texts: { consigne: 'Calcule. **Tape le résultat.**' } },
  ], "Maintenant, deux exemples pour t'aider à les résoudre en entier."),
  // 11 — Exemple 1 : tout est résolu à l'écran
  etapes('Exemple 1 sur 2', exemple1),
  // 12 — Exemple 1 : la dernière ligne (notée)
  texted(exemple(trou(ex1(-8, 3), '= \\square', -5)), {
    consigne: 'Tape ce qui manque dans la case, avec les touches du clavier.',
    above: ['= -(8 - 3)', '= -(5)'],
    help: "Dernière ligne. Écris le résultat, avec son signe. Tu peux t'aider de la ligne du dessus.",
  }),
  // 13 — Exemple 2, case 1 (entraînement non noté)
  texted(decouverte(trou(ex1(3, -7), '3 + (-7) = -(\\square - 3)', 7)), {
    consigne: COMPLETE,
    intro: ['Cette fois, deux cases sont à toi. Signes contraires : je soustrais, et je prends le signe du plus grand.'],
    mention: '',
  }),
  // 14 — Exemple 2, case 2 (le résultat, notée)
  texted(exemple(trou(ex1(3, -7), '3 + (-7) = -(7 - 3) = \\square', -4)), { mention: '' }),
  // 15 — Annonce des exercices de fin
  etapes('Place aux 5 exercices de fin', [
    step("Cette fois, **pas d'aide**. Ils ressemblent à ce que tu verras en contrôle."),
    step('Pour valider le cours, il faut : au moins **4 exercices de fin justes sur 5** ; et **80 % de bonnes réponses** sur tout le cours.'),
    step("Si tu n'y arrives pas, ce n'est pas grave : tu feras une **série de validation**. Ce sont 5 exercices, sans refaire la leçon."),
  ]),
];

export const c02: CourseDef = {
  id: ID,
  moduleId: MODULE_ID,
  order: 2,
  title: 'Additionner deux nombres de signes contraires',
  shortTitle: 'Signes contraires',
  rule: RULE,
  parts,
  lessonLength: 10,
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
    examples: [`${M}7 + 2 = **${M}5** · 3 + (${M}8) = **${M}5**`, `${M}6 + 6 = **0**`],
    mistake: {
      wrong: `3 + (${M}8) = 5`,
      why: `Je ne prends pas le signe du premier nombre : je prends celui du **plus grand**. Ici 8 est négatif : ${M}5.`,
    },
    tip: `Le plus grand sans le signe gagne. ${M}7 + 2 : 7 > 2, donc le résultat est négatif. 7 − 2 = 5. Résultat : ${M}5.`,
  },
};
