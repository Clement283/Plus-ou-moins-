// Cours 6 — Diviser deux nombres relatifs (doc 06 version 2, fiche courte ; mode autonome, sans maquette ; une phrase à la fois).
import { num, op, toLatex } from '../../math/expr';
import { rat } from '../../math/rational';
import type { Rng } from '../../rng';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, Level, Scene, SceneToken } from '../types';
import {
  MODULE_ID, SIGN_CLASSES, absIs, autres, buildErrors, choix, decouverte, draw, etapes, exemple,
  explanation, isOpposite, lecon, makeExercise, operands, pratique, redraw, resultLine, saisie, sg, signBox, signs,
  smallChoix, step, stepped, texted, toText, trou, txt
} from './shared';

const ID = 'c06-diviser-deux';
const RULE =
  'Pour diviser deux nombres relatifs, je divise les nombres sans leur signe, puis je mets le signe, comme pour multiplier : même signe, le résultat est positif ; signes contraires, il est négatif.';

// ——— Générateur : la division tombe toujours juste (on tire le quotient et le diviseur, puis a = quotient × diviseur) ———

type Range = [number, number];
/** Niveau 1 : tables (quotient 2 à 9, diviseur 2 à 9) ; niveau 2 : quotient de 10 à 30 par un diviseur de 2 à 9 ; niveau 3 : quotient de 10 à 99 par un diviseur de 10 à 40. */
const QUOTIENT: Record<Level, Range> = { 1: [2, 9], 2: [10, 30], 3: [10, 99] };
const DIVISOR: Record<Level, Range> = { 1: [2, 9], 2: [2, 9], 3: [10, 40] };

const quotient = (level: Level, a: number, b: number): Exercise => makeExercise(ID, level, op('/', num(a), num(b)));

function drawDivision(level: Level, rng: Rng, q: Range, [na, nb]: [boolean, boolean]): Exercise {
  const qq = draw(rng, q);
  const b = draw(rng, DIVISOR[level]);
  return quotient(level, na ? -(qq * b) : qq * b, nb ? -b : b);
}

const generate = (level: Level, rng: Rng): Exercise => drawDivision(level, rng, QUOTIENT[level], signs(rng));

/** Le dividende et le diviseur, avec leur signe. */
const parts2 = (ex: Exercise): [number, number] => operands(ex.expr) as [number, number];
/** Le dividende et le diviseur sans leur signe. */
const sizes = (ex: Exercise): [number, number] => parts2(ex).map(Math.abs) as [number, number];

function resolution(ex: Exercise): string[] {
  const [a, b] = sizes(ex);
  return [toLatex(ex.expr), `= ${ex.answer.n < 0 ? '-' : '+'}(${a} \\div ${b})`, resultLine(ex)];
}

// ——— Textes des retours d'erreur ———

const M = '−';
const shown = (ex: Exercise): string => toText(ex.expr);
const isDivision = (ex: Exercise): boolean => ex.expr.k === 'op' && ex.expr.op === '/' && operands(ex.expr).length === 2;
/** Un nombre écrit comme dans un calcul : le négatif entre parenthèses. */
const par = (n: number): string => (n < 0 ? `(${txt(n)})` : `${n}`);

/** Le signe du quotient donné à l'envers : un message par cas (deux négatifs, deux positifs, signe du premier nombre gardé, signe oublié). */
function signText(ex: Exercise): string {
  const [x, y] = parts2(ex);
  const r = txt(ex.answer.n);
  if (x < 0 && y < 0)
    return `Deux nombres négatifs divisés donnent un **positif**, comme pour multiplier : ${shown(ex)} = ${r}. On vérifie : ${r} × ${par(y)} = ${txt(x)}.`;
  if (x > 0 && y > 0) return `Deux nombres positifs donnent un résultat **positif** : ${shown(ex)} = ${r}.`;
  if (x > 0)
    return `Tu as gardé le signe de ${x}. Mais le diviseur ${txt(y)} compte aussi : les signes sont contraires, le résultat est **négatif** : ${shown(ex)} = ${r}.`;
  return `Il manque le signe : ${txt(x)} et ${y} ont des signes contraires, le résultat est **négatif** : ${shown(ex)} = ${r}.`;
}
const MULT = (ex: Exercise): string => {
  const [a, b] = sizes(ex);
  return `Ici, c'est une **division** : ÷ et pas ×. ${a} ÷ ${b} = ${a / b}, et non ${a} × ${b} = ${a * b}.`;
};
const TABLE = (ex: Exercise): string => {
  const [a, b] = sizes(ex);
  return `Le signe est bon ! Vérifie avec la multiplication : ${a / b} × ${b} = ${a}, donc ${a} ÷ ${b} = ${a / b}.`;
};
/** Le signe, en mots : « même signe, positif » ou « signes contraires, négatif ». */
const signWords = (ex: Exercise): string => (ex.answer.n > 0 ? 'même signe, le résultat est positif' : 'signes contraires, le résultat est négatif');
const GOOD = (ex: Exercise): string => {
  const [a, b] = sizes(ex);
  return `${shown(ex)} : ${signWords(ex)}. ${a} ÷ ${b} = ${a / b}, donc ${txt(ex.answer.n)}.`;
};
const OTHER = (ex: Exercise): string => {
  const [a, b] = sizes(ex);
  return `D'abord les nombres sans leur signe : ${a} ÷ ${b} = ${a / b}. Puis le signe : ${signWords(ex)}. Donc ${txt(ex.answer.n)}.`;
};

/** « Relire la règle N » : la partie de la leçon qui l'explique (indices de `parts`). */
const RULE_1 = { n: 1, label: "Diviser, c'est chercher un facteur", partIndex: 1 };
const RULE_2 = { n: 2, label: 'Le signe du quotient', partIndex: 2 };
const RULE_3 = { n: 3, label: 'Vérifier par la multiplication', partIndex: 3 };
const RULES: Record<string, NonNullable<ErrorDef['rule']>> = {
  'regle-signes': RULE_2,
  'multiplication-au-lieu-division': RULE_1,
  'erreur-table': RULE_3,
};

const errors: ErrorDef[] = buildErrors(
  [
    {
      id: 'regle-signes',
      family: 'signe',
      detect: (ex, given) => ex.answer.n !== 0 && isOpposite(ex, given),
      text: signText,
      draw: (level, rng) => drawDivision(level, rng, QUOTIENT[level], [true, true]),
      sample: (ex) => -ex.answer.n,
      // −12 ÷ (−4) = −(12 ÷ 4) = −3
      wrongLines: (ex, w) => {
        const [a, b] = sizes(ex);
        return w === -ex.answer.n ? stepped(ex, `${sg(w)}(${a} \\div ${b})`, w) : null;
      },
    },
    {
      id: 'multiplication-au-lieu-division',
      family: 'calcul',
      detect: (ex, given) => absIs(given, sizes(ex)[0] * sizes(ex)[1]),
      text: MULT,
      // un petit quotient (les 3 plus petits du niveau) : −8 ÷ (−4)
      draw: (level, rng) => drawDivision(level, rng, [QUOTIENT[level][0], QUOTIENT[level][0] + 2], signs(rng)),
      sample: (ex) => sizes(ex)[0] * sizes(ex)[1],
      alsoWrong: (ex) => [-(sizes(ex)[0] * sizes(ex)[1])],
      // −12 ÷ 4 = −(12 × 4) = −48 : le signe juste, les nombres multipliés
      wrongLines: (ex, w) => {
        const [a, b] = sizes(ex);
        return Math.abs(w) === a * b && Math.sign(w) === Math.sign(ex.answer.n) ? stepped(ex, `${sg(w)}(${a} \\times ${b})`, w) : null;
      },
    },
    {
      id: 'erreur-table',
      family: 'calcul',
      // le signe juste, le quotient décalé de 1 (12 ÷ 4 → 2 ou 4)
      detect: (ex, given) => {
        const r = ex.answer.n;
        if (given.d !== 1 || given.n === 0 || Math.sign(given.n) !== Math.sign(r)) return false;
        return Math.abs(given.n) === Math.abs(r) + 1 || Math.abs(given.n) === Math.abs(r) - 1;
      },
      text: TABLE,
      draw: (level, rng) => redraw(() => generate(level, rng), (ex) => Math.abs(ex.answer.n) >= 2),
      sample: (ex) => ex.answer.n + Math.sign(ex.answer.n),
      alsoWrong: (ex) => [ex.answer.n - Math.sign(ex.answer.n)],
      // −12 ÷ 4 = −(12 ÷ 4) = −4 : le signe est juste, le quotient faux
      wrongLines: (ex, w) => {
        const [a, b] = sizes(ex);
        const r = ex.answer.n;
        return w !== r && Math.sign(w) === Math.sign(r) ? stepped(ex, `${sg(r)}(${a} \\div ${b})`, w) : null;
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

/** « Quel est le signe du résultat ? » d'un quotient. */
const signBoxText = (ex: Exercise, correct: boolean): string => (correct ? GOOD(ex) : signText(ex));

/** Une case dont le signe est déjà écrit (série de pratique : −63 ÷ (−9) = +(63 ÷ 9) = ▢). */
function signedHoleText(q: Extract<Question, { kind: 'trou' }>, o: Outcome): string {
  const [a, b] = sizes(q.ex);
  const g = givenOf(o);
  const r = q.ex.answer.n;
  if (o.correct) return `${a} ÷ ${b} = ${a / b}, et le signe ${r < 0 ? M : '+'} est déjà écrit : ${txt(r)}.`;
  if (g === -r) return `Le signe est déjà trouvé, sur la ligne du dessus : ${signWords(q.ex)}. ${a} ÷ ${b} = ${a / b}, donc ${txt(r)}.`;
  return typedText(q.ex, g, false);
}

function feedbackText(q: Question, o: Outcome): string | null {
  if (o.unfinished || o.errorFamily === 'ecriture') return null;
  switch (q.kind) {
    case 'saisie':
      return isDivision(q.ex) ? typedText(q.ex, givenOf(o), o.correct) : null;
    case 'trou':
      if (!isDivision(q.ex) || q.promptLatex !== '= \\square') return null;
      return toLatex(q.ex.expr) === '-63 \\div (-9)' ? signedHoleText(q, o) : typedText(q.ex, givenOf(o), o.correct);
    case 'qcm':
      return isDivision(q.ex) && q.choices.map((c) => c.latex).join('|') === '+|-' ? signBoxText(q.ex, o.correct) : null;
    default:
      return null;
  }
}

// ——— Leçon ———

const ex1 = (a: number, b: number): Exercise => quotient(1, a, b);
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
  ex1(-24, -6),
  'Pour commencer, à ton avis : combien vaut ce quotient ?',
  options3(
    ['4', "Bonne intuition : deux nombres négatifs divisés donnent un positif, comme pour multiplier. Le cours va t'expliquer pourquoi."],
    [`${M}4`, `Beaucoup d'élèves le pensent, mais deux nombres négatifs divisés donnent un positif, comme pour multiplier. Le cours va t'expliquer pourquoi.`],
    [`${M}30`, `${M}30, c'est ${M}24 + (${M}6) : une addition. Ici, on divise : 24 ÷ 6 = 4, et le cours va t'expliquer quel signe mettre.`],
  ),
  0,
  '-24 \\div (-6)',
);

const REGLE1 = '**Diviser, c\'est chercher le nombre qui, multiplié par le diviseur, redonne le premier nombre.**';
const REGLE2 = '**Même signe : le résultat est positif. Signes contraires : le résultat est négatif.**';
const REGLE3 = '**Pour vérifier une division, je multiplie le résultat par le diviseur : je dois retrouver le premier nombre.**';

// 1 — L'idée de départ : la division est la réciproque de la multiplication (règle 1)
const idee: EtapeStep[] = [
  step('Diviser, c\'est le **contraire de multiplier** : 12 ÷ 4 = 3, car 3 × 4 = 12.', {
    scene: linesScene(['12 ÷ 4 = 3'], ['3 × 4 = 12']),
  }),
  step(`${M}12 ÷ 4, c'est le nombre qui, **multiplié par 4**, donne ${M}12.`, {
    scene: linesScene([`${M}12 ÷ 4 = ?`], [`? × 4 = ${M}12`]),
  }),
  step(`Pour obtenir ${M}12 en multipliant par 4, il faut un nombre **négatif** : ${M}12 ÷ 4 = ${M}3, car ${M}3 × 4 = ${M}12.`, {
    scene: linesScene([`${M}12 ÷ 4 = ?`], [`? × 4 = ${M}12`]),
    after: linesScene([`${M}12 ÷ 4 = `, hl(`${M}3`)], [hl(`${M}3`), ` × 4 = ${M}12`]),
    action: trouOf(`Pour obtenir ${M}12 en multipliant par 4, il faut un nombre [ ? ].`, ['négatif', 'positif'], 0, {
      1: `3 × 4 = 12, et non ${M}12. Pour obtenir ${M}12 en multipliant par 4, le nombre cherché est négatif : ${M}3.`,
    }),
  }),
  step(undefined, {
    scene: linesScene(['12 ÷ 4 = 3, car 3 × 4 = 12'], [`${M}12 ÷ 4 = ${M}3, car ${M}3 × 4 = ${M}12`]),
    rule: { n: 1, text: REGLE1 },
  }),
];

// 2 — Règle 2 : le signe du quotient (technique 1 du plan : la même règle des signes que pour ×)
const regle2: EtapeStep[] = [
  step('Pour diviser, on regarde d\'abord les **signes des deux nombres**, comme pour multiplier.', {
    scene: oneScene(hl(`${M}18`), ' ÷ ', hl('3')),
  }),
  step(`${M}18 ÷ 3 : les signes sont **contraires**, donc le résultat est **négatif** : ${M}6.`, {
    scene: oneScene(`${M}18 ÷ 3 = ?`),
    after: oneScene(`${M}18 ÷ 3 = `, hl(`${M}6`)),
    action: trouOf(`${M}18 ÷ 3 : les signes sont contraires, donc le résultat est [ ? ].`, ['négatif', 'positif'], 0, {
      1: `Des signes contraires donnent un négatif, comme pour multiplier : ${M}18 ÷ 3 = ${M}6, car ${M}6 × 3 = ${M}18.`,
    }),
  }),
  step(`${M}20 ÷ (${M}4) : les deux nombres ont le **même signe**, donc le résultat est **positif** : 5.`, {
    scene: oneScene(`${M}20 ÷ (${M}4) = ?`),
    after: oneScene(`${M}20 ÷ (${M}4) = `, hl('5')),
    action: trouOf(`${M}20 ÷ (${M}4) : les deux nombres ont le même signe, donc le résultat est [ ? ].`, ['positif', 'négatif'], 0, {
      1: `Deux négatifs divisés donnent un positif, comme pour multiplier : ${M}20 ÷ (${M}4) = 5, car 5 × (${M}4) = ${M}20.`,
    }),
  }),
  step(undefined, {
    scene: linesScene(['+ ÷ + = +'], [`${M} ÷ ${M} = +`], [`+ ÷ ${M} = ${M}`], [`${M} ÷ + = ${M}`]),
    rule: { n: 2, text: REGLE2 },
  }),
];

// 3 — Règle 3 : vérifier par la multiplication (technique 2 du plan)
const verifier: EtapeStep[] = [
  step('Pour vérifier une division, on **multiplie le résultat par le diviseur**.', {
    scene: linesScene([`${M}35 ÷ (${M}7) = 5`]),
  }),
  step(`Ici, le résultat est 5 et le diviseur est ${M}7 : on calcule 5 × (${M}7).`, {
    scene: linesScene([`${M}35 ÷ (${M}7) = 5`], [hl('5'), ` × (${M}7) = ?`]),
    after: linesScene([`${M}35 ÷ (${M}7) = 5`], [`5 × (${M}7) = `, hl(`${M}35`)]),
    action: trouOf(`5 × (${M}7) = [ ? ].`, [`${M}35`, '35', `${M}2`], 0, {
      1: `5 et ${M}7 ont des signes contraires : le produit est négatif, ${M}35.`,
      2: `${M}2, c'est 5 + (${M}7) : tu as additionné. Ici, on multiplie : 5 × 7 = 35, puis le signe ${M}.`,
    }),
  }),
  step(`Un élève a trouvé ${M}12 ÷ 4 = 3. On vérifie : 3 × 4 = 12, et ce n'est pas ${M}12.`, {
    scene: linesScene([`${M}12 ÷ 4 = 3`], ['3 × 4 = 12']),
    after: linesScene([`${M}12 ÷ 4 = 3`], [hl('3 × 4 = 12'), `, et non ${M}12`]),
    action: trouOf(`3 × 4 = 12, mais on cherchait ${M}12. Le résultat 3 est [ ? ].`, ['faux', 'juste'], 0, {
      1: `Si 3 était juste, 3 × 4 donnerait ${M}12. Or 3 × 4 = 12 : il manque le signe, le bon résultat est ${M}3.`,
    }),
  }),
  step(undefined, {
    scene: linesScene([`${M}12 ÷ 4 = ${M}3`], [`${M}3 × 4 = ${M}12`]),
    rule: { n: 3, text: REGLE3 },
  }),
];

const compareQ = choix(
  ex1(-12, 4),
  'Quel est le résultat de chaque calcul ?',
  options3(
    [`A ${M}3, B ${M}12`, `${M}12 ÷ 4 = ${M}3 : on divise. ${M}3 × 4 = ${M}12 : on multiplie, et on retrouve le nombre de départ.`],
    [`A ${M}12, B ${M}3`, `C'est l'inverse : A est la division, ${M}12 ÷ 4 = ${M}3. B est la multiplication, ${M}3 × 4 = ${M}12.`],
    [`Les deux ${M}3`, `Pour A, oui : ${M}12 ÷ 4 = ${M}3. Mais B est une multiplication : ${M}3 × 4 = ${M}12.`],
  ),
  0,
);

const exemple1: EtapeStep[] = [
  step('Voici la résolution. Lis la première ligne, puis touche « Je comprends ».', {
    scene: linesScene([`${M}45 ÷ (${M}9)`]),
  }),
  step("Même signe : le résultat est **positif**. On écrit d'abord ce signe, puis la division des nombres sans leur signe.", {
    scene: linesScene([`${M}45 ÷ (${M}9)`], [hl('= +(45 ÷ 9)')]),
    action: { type: 'comprends' },
  }),
];

// ——— Autres façons de faire (technique 3 du plan), avec le rappel des règles en tête ———

const AUTRES: LessonPart = autres({
  title: 'Autres façons de faire',
  recap: {
    title: 'Les 3 règles à retenir',
    rules: [
      { title: '1. Diviser, c\'est chercher le nombre qui, multiplié par le diviseur, redonne le premier.', ok: `${M}12 ÷ 4 = ${M}3, car ${M}3 × 4 = ${M}12`, ko: `${M}12 ÷ 4 = ${M}48` },
      { title: '2. Même signe : positif. Signes contraires : négatif.', ok: `${M}20 ÷ (${M}4) = 5`, ko: `${M}20 ÷ (${M}4) = ${M}5` },
      { title: '3. Je vérifie en multipliant le résultat par le diviseur.', ok: `5 × (${M}4) = ${M}20`, ko: `3 × 4 = 12, donc ${M}12 ÷ 4 = 3` },
    ],
    sentence: 'Je divise les nombres sans leur signe, puis je mets le signe : même signe, positif ; signes contraires, négatif. Je vérifie en multipliant.',
  },
  intro: 'La méthode marche toujours. Voici deux autres façons de faire : **choisis celle que tu veux essayer**.',
  techniques: [
    {
      name: 'Barrer des zéros',
      quand: 'Quand les deux nombres se terminent par des zéros.',
      example: '350 ÷ 50 : on barre un zéro en haut et en bas, 35 ÷ 5 = 7',
      how: 'On barre autant de zéros en haut qu\'en bas : le résultat ne change pas. Le signe se met à la fin, comme d\'habitude.',
      essai: {
        kind: 'saisie',
        consigne: `Essaie avec ${M}4200 ÷ 600 : barre deux zéros en haut et en bas, puis divise. **Tape le résultat.**`,
        calc: `${M}4200 ÷ 600`,
        answer: -7,
        yes: `On barre deux zéros : 42 ÷ 6 = 7. Signes contraires : ${M}7.`,
        errors: [
          { values: [7], message: `Le nombre est bon, mais pas le signe : ${M}4200 et 600 ont des signes contraires, le résultat est négatif.` },
          { values: [70, -70], message: 'Il faut barrer le même nombre de zéros en haut et en bas : deux zéros en haut, deux zéros en bas. 42 ÷ 6 = 7.' },
        ],
        fallback: `On barre deux zéros : 42 ÷ 6 = 7, puis le signe ${M} : ${M}7.`,
      },
    },
    {
      name: 'Diviser en deux fois',
      quand: 'Quand le diviseur est un produit de petits nombres.',
      example: '36 ÷ 4 : 36 ÷ 2 = 18, puis 18 ÷ 2 = 9',
      how: 'Diviser par 4, c\'est diviser par 2, puis encore par 2. On coupe le diviseur en deux petits nombres et on divise deux fois.',
      essai: {
        kind: 'choix',
        consigne: `Calcule ${M}48 ÷ 6 en divisant par 2, puis par 3. **Touche ce que tu trouves.**`,
        calc: `${M}48 ÷ 6`,
        options: [`${M}8`, '8', `${M}24`],
        correct: 0,
        yes: `${M}48 ÷ 2 = ${M}24, puis ${M}24 ÷ 3 = ${M}8. Le signe ne change pas en route : signes contraires, négatif.`,
        no: `${M}48 ÷ 2 = ${M}24, puis ${M}24 ÷ 3 = ${M}8. Il faut diviser deux fois, et garder le signe négatif.`,
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
    title: 'Diviser deux nombres relatifs',
    intro: [
      `Tu sais **multiplier** des nombres relatifs. Maintenant, tu vas les **diviser**, par exemple ${M}12 ÷ 4 ou ${M}24 ÷ (${M}6).`,
      'Bonne nouvelle : la règle des signes est **la même** que pour multiplier. Et la division se **vérifie** avec une multiplication.',
    ],
    mention: NOT_COUNTED_GUESS,
  }),
  // 1 — L'idée de départ
  etapes("Diviser, c'est chercher un facteur", idee),
  // 2 — Règle 2 : le signe du quotient
  etapes('Le signe du quotient', regle2),
  // 3 — Règle 3 : vérifier par la multiplication
  etapes('Vérifier par la multiplication', verifier),
  // 4, 5 — Petites questions (sur le même écran, comptées)
  lecon(
    small(ex1(-42, -7), '-42 \\div (-7)', 'Quel est le signe du résultat ?', [
      ['Positif', 'Même signe : deux négatifs divisés donnent un positif. 42 ÷ 7 = 6, donc −42 ÷ (−7) = 6.'],
      ['Négatif', 'Pour diviser, la règle est celle de la multiplication : le même signe donne un positif. −42 ÷ (−7) = 6.'],
      ['On ne peut pas savoir', 'On peut savoir sans calculer : il suffit de regarder les deux signes. Ici, ils sont pareils : le résultat est positif.'],
    ], 0),
  ),
  texted(
    lecon(
      small(ex1(36, -4), '36 \\div (-4)', 'Quel est le résultat ?', [
        [`${M}9`, `Les nombres d'abord : 36 ÷ 4 = 9. Puis le signe : signes contraires, le résultat est négatif : ${M}9.`],
        ['9', '36 ÷ 4 = 9, c\'est juste, mais il manque le signe : 36 et −4 ont des signes contraires, le résultat est négatif.'],
        [`${M}32`, `${M}32, c'est 36 + (${M}4) : tu as additionné. Ici, on divise : 36 ÷ 4 = 9, puis le signe ${M}.`],
      ], 0),
    ),
    { joinPrevious: true },
  ),
  // 6 — Comparer deux cas (ne compte pas) : A de ce cours, B du Cours 5
  texted(decouverte(compareQ), {
    title: 'Comparer deux cas',
    intro: ["Voici deux calculs qui se ressemblent. Regarde bien l'opération."],
    mention: NOT_COUNTED_UNDERSTAND,
    compare: {
      a: { label: 'Calcul A', latex: '-12 \\div 4' },
      b: { label: 'Calcul B', latex: '-3 \\times 4' },
      note: 'Le calcul B vient du cours précédent : tu sais déjà le faire. Ici, tu observes seulement ce qui change.',
      highlight: { a: toks(`${M}12 `, hl('÷'), ' 4'), b: toks(`${M}3 `, hl('×'), ' 4') },
      after: [
        `A : ${M}12 ÷ 4 = ${M}3. On **divise**.`,
        `B : ${M}3 × 4 = ${M}12. On **multiplie**, et on retrouve le nombre de départ (Cours 5).`,
        'La multiplication **défait** la division, et la division défait la multiplication. Avant de calculer, regarde bien l\'opération.',
      ],
    },
  }),
  // 7 — Autres façons de faire (avec le rappel des règles)
  AUTRES,
  // 8 — Série de pratique (notée) : l'aide diminue, les formats changent
  pratique('Cours 6 · Pratique', [
    {
      question: trou(ex1(-63, -9), '= \\square', 7),
      texts: { consigne: 'Le signe est déjà trouvé. **Tape le résultat dans la case.**', above: ['= +(63 \\div 9)'] },
    },
    {
      question: signBox(ex1(48, -6), false, 'regle-signes'),
      texts: { consigne: "Touche le signe du résultat. Tu n'as pas besoin de calculer.", intro: ['Quel est le signe du résultat ?'] },
    },
    {
      // une question du Cours 5 : elle doit d'abord reconnaître que ce calcul est une multiplication
      question: choix(
        makeExercise(ID, 1, op('*', num(-9), num(3))),
        'Quel est le résultat ?',
        options3(
          [`${M}27`, `Ce calcul est une multiplication (Cours 5) : 9 × 3 = 27. Signes contraires, le résultat est négatif : ${M}27.`],
          [`${M}3`, `${M}3, c'est ${M}9 ÷ 3 : tu as divisé. Regarde bien l'opération : c'est une multiplication. ${M}9 × 3 = ${M}27.`],
          ['27', `27 est le bon nombre, mais il manque le signe : ${M}9 et 3 ont des signes contraires, le résultat est négatif.`],
        ),
        0,
        '-9 \\times 3',
      ),
      texts: { consigne: "Regarde bien l'opération, puis touche le résultat." },
    },
    { question: saisie(ex1(-72, -8)), texts: { consigne: 'Calcule. **Tape le résultat.**' } },
  ], "Maintenant, deux exemples pour t'aider à les résoudre en entier."),
  // 9 — Exemple 1 : la première ligne est résolue à l'écran
  etapes('Exemple 1 sur 2', exemple1),
  // 10 — Exemple 1 : la dernière ligne (notée)
  texted(exemple(trou(ex1(-45, -9), '= \\square', 5)), {
    consigne: 'Tape ce qui manque dans la case, avec les touches du clavier.',
    above: ['= +(45 \\div 9)'],
    help: "Dernière ligne. Calcule 45 ÷ 9, avec le signe trouvé. Tu peux t'aider de la ligne du dessus.",
  }),
  // 11 — Exemple 2, case 1 : le signe (entraînement non noté)
  texted(decouverte(signBox(ex1(54, -6), false, 'regle-signes')), {
    consigne: 'Touche le signe du résultat.',
    intro: ["Cette fois, deux cases sont à toi. Trouve d'abord le signe du résultat, puis calcule."],
    mention: '',
  }),
  // 12 — Exemple 2, case 2 : le résultat (notée)
  texted(exemple(trou(ex1(54, -6), '= \\square', -9)), { above: ['= -(54 \\div 6)'], mention: '' }),
  // 13 — Annonce des exercices de fin
  etapes('Place aux 5 exercices de fin', [
    step("Cette fois, **pas d'aide**. Ils ressemblent à ce que tu verras en contrôle."),
    step('Pour valider le cours, il faut : au moins **4 exercices de fin justes sur 5** ; et **80 % de bonnes réponses** sur tout le cours.'),
    step("Si tu n'y arrives pas, ce n'est pas grave : tu feras une **série de validation**. Ce sont 5 exercices, sans refaire la leçon."),
  ]),
];

export const c06: CourseDef = {
  id: ID,
  moduleId: MODULE_ID,
  order: 6,
  title: 'Diviser deux nombres relatifs',
  shortTitle: 'Diviser',
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
    ruleBullets: ['Même signe : le résultat est positif.', 'Signes contraires : le résultat est négatif.'],
    examples: [`${M}12 ÷ 4 = ${M}(12 ÷ 4) = **${M}3**`, `${M}35 ÷ (${M}7) = +(35 ÷ 7) = **5**`],
    mistake: {
      wrong: `${M}20 ÷ (${M}4) = ${M}5`,
      why: `Deux nombres négatifs divisés donnent un **positif**, comme pour multiplier. On vérifie : 5 × (${M}4) = ${M}20.`,
    },
    tip: `Même règle des signes que pour × : signes identiques, + ; signes contraires, ${M}. Pour vérifier, je multiplie le résultat par le diviseur : ${M}12 ÷ 4 = ${M}3, car ${M}3 × 4 = ${M}12.`,
  },
};
