// Cours 4 — Soustraire, c'est ajouter l'opposé (doc 06 version 2, maquette docs/design/ecrans/cours-4-v2.html validée).
import { type Expr, num, op, toLatex } from '../../math/expr';
import type { Rng } from '../../rng';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, LineScene, Level, Scene, SceneToken } from '../types';
import {
  COMPLETE, MODULE_ID, SIGN_CLASSES, SIZES, autres, buildErrors, chain, chance, choix, decouverte, draw, droiteQ, etapes,
  exemple, explanation, is, isOpposite, lecon, makeExercise, operands, pratique, redraw, saisie, signBox, signed, smallChoix, step,
  texted, toText, trou, txt
} from './shared';

const ID = 'c04-soustraire';
const RULE =
  "Soustraire un nombre, c'est ajouter son opposé : je remplace le − par un +, je change le signe du nombre qui suit, puis j'additionne.";

// ——— Générateur : niveaux 1 et 2, une soustraction ; niveau 3, une fois sur deux deux soustractions à la suite (doc 08 n° 51) ———

const someSigned = (level: Level, rng: Rng): number => signed(draw(rng, SIZES[level]), chance(rng, 0.5));

/** a − b − c … : une suite de soustractions, de gauche à droite. */
const subtraction = (xs: number[]): Expr => xs.map((x) => num(x)).reduce((acc, e) => op('-', acc, e));
const diff = (level: Level, xs: number[]): Exercise => makeExercise(ID, level, subtraction(xs));

/** Le nombre de termes : 2, et 3 une fois sur deux au niveau 3. */
const countOf = (level: Level, rng: Rng): number => (level === 3 && chance(rng, 0.5) ? 3 : 2);

/** a et b (et c) positifs ou négatifs ; b négatif 1 fois sur 2. */
const drawTerms = (level: Level, rng: Rng, count = countOf(level, rng)): number[] =>
  Array.from({ length: count }, () => someSigned(level, rng));

const generate = (level: Level, rng: Rng): Exercise => diff(level, drawTerms(level, rng));

/** Le premier nombre, puis les nombres retranchés. */
const split = (ex: Exercise): [number, number[]] => {
  const [a, ...bs] = operands(ex.expr) as [number, ...number[]];
  return [a, bs];
};
/** Les termes de l'addition : chaque nombre retranché devient son opposé. */
const addTerms = (ex: Exercise): number[] => {
  const [a, bs] = split(ex);
  return [a, ...bs.map((b) => -b)];
};
/** L'addition où les nombres de `kept` (indices des nombres retranchés) ont gardé leur signe : l'opposé oublié. */
const forgotten = (ex: Exercise, kept: (i: number) => boolean): number[] => {
  const [a, bs] = split(ex);
  return [a, ...bs.map((b, i) => (kept(i) ? b : -b))];
};
const total = (xs: number[]): number => xs.reduce((s, x) => s + x, 0);

const resolution = (ex: Exercise): string[] => [toLatex(ex.expr), `= ${toLatex(chain('+', addTerms(ex)))}`, `= ${ex.answer.n}`];

/** Les réponses de l'opposé oublié : un ou plusieurs nombres retranchés ont gardé leur signe. */
function oublis(ex: Exercise): number[] {
  const [, bs] = split(ex);
  const out: number[] = [];
  for (let mask = 1; mask < 1 << bs.length; mask++) out.push(total(forgotten(ex, (i) => (mask & (1 << i)) !== 0)));
  return out;
}

// ——— Textes de la maquette (retours d'erreur) ———

const M = '−';
const par = (t: number): string => (t < 0 ? `(${M}${-t})` : String(t));
/** a + (−b) + … écrit pour l'affichage. */
const sumText = (xs: number[]): string => xs.map((x, i) => (i === 0 ? txt(x) : par(x))).join(' + ');
const MEME = 'Les deux nombres ont le même signe : on **additionne** les nombres sans leur signe, et on garde ce signe.';
const OUBLI = "Il manque un nombre : coche chaque nombre quand tu l'as utilisé.";

/** L'explication de x + y (étape finale), pour les messages « juste ». */
function fin(x: number, y: number): string {
  const s = x + y;
  if (s === 0) return `${txt(x)} et ${txt(y)} sont opposés : ils s'annulent, le résultat est 0.`;
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  if (x * y > 0) return `Même signe : ${ax} + ${ay} = ${Math.abs(s)}, et je garde le signe ${x < 0 ? M : '+'} : ${txt(s)}.`;
  const big = Math.max(ax, ay);
  const small = Math.min(ax, ay);
  return `Signes contraires : ${big} ${M} ${small} = ${big - small}. Le plus grand, ${big}, est ${(ax > ay ? x : y) < 0 ? 'négatif' : 'positif'} : ${txt(s)}.`;
}

/** L'addition finale, de deux termes (Cours 1 et 2) ou de trois (Cours 3 : on regroupe). */
function finSum(xs: number[]): string {
  if (xs.length === 2) return fin(xs[0] as number, xs[1] as number);
  const pos = xs.filter((x) => x > 0);
  const neg = xs.filter((x) => x < 0);
  const group = (label: [string, string], g: number[]): string =>
    `${g.length > 1 ? label[1] : label[0]} : ${g.length > 1 ? `${g.map(par).join(' + ')} = ` : ''}${txt(total(g))}.`;
  if (pos.length === 0 || neg.length === 0) {
    const s = total(xs);
    return `Même signe : ${xs.map((x) => Math.abs(x)).join(' + ')} = ${Math.abs(s)}, et je garde le signe ${s < 0 ? M : '+'} : ${txt(s)}.`;
  }
  // la fin du Cours 3 : les deux totaux, puis signes contraires
  const p = total(pos);
  const n = -total(neg);
  const head = `${group(['Positif', 'Positifs'], pos)} ${group(['Négatif', 'Négatifs'], neg)} Puis ${p} + (${M}${n})`;
  if (p === n) return `${head} : deux nombres opposés s'annulent : 0.`;
  const big = Math.max(p, n);
  const small = Math.min(p, n);
  return `${head} : ${big} ${M} ${small} = ${big - small}, le plus grand, ${big}, est ${p > n ? 'positif' : 'négatif'} : ${txt(p - n)}.`;
}

const shown = (ex: Exercise): string => toText(ex.expr);
const OPP = (ex: Exercise): string =>
  `Soustraire, c'est **ajouter l'opposé** : le ${M} devient +, et le nombre change de signe. ${shown(ex)} devient ${sumText(addTerms(ex))}, et non ${sumText(forgotten(ex, () => true))}.`;
const INV = (ex: Exercise): string =>
  split(ex)[1].length === 1
    ? `Transforme d'abord en addition : ${sumText(addTerms(ex))}. Puis regarde les signes : le résultat prend le signe du nombre le plus grand (sans son signe).`
    : `Transforme d'abord en addition : ${sumText(addTerms(ex))}. Puis regroupe les positifs et les négatifs (Cours 3) : le résultat prend le signe du total le plus grand (sans son signe).`;
const GOOD = (ex: Exercise): string => `${shown(ex)} devient ${sumText(addTerms(ex))}. ${finSum(addTerms(ex))}`;
const OTHER = (ex: Exercise): string =>
  `Transforme d'abord : ${shown(ex)} devient ${sumText(addTerms(ex))}. Puis additionne : ${txt(ex.answer.n)}.`;

/** « Relire la règle N » : la partie de la leçon qui l'explique (indices de `parts`). */
const RULE_1 = { n: 1, label: "J'ajoute l'opposé", partIndex: 3 };
const RULE_2 = { n: 2, label: "Puis j'additionne", partIndex: 4 };
const RULES: Record<string, NonNullable<ErrorDef['rule']>> = { 'signe-inverse': RULE_2, 'oppose-oublie': RULE_1 };

const errors: ErrorDef[] = buildErrors(
  [
    {
      id: 'signe-inverse',
      family: 'signe',
      detect: (ex, given) => ex.answer.n !== 0 && isOpposite(ex, given),
      text: INV,
      // un résultat négatif : on retranche plus qu'on n'a (3 − 8)
      draw: (level, rng) => redraw(() => generate(level, rng), (ex) => ex.answer.n < 0),
      sample: (ex) => -ex.answer.n,
      // 3 − 7 = 3 + (−7) = 4 : la transformation est juste, le signe final faux
      wrongLines: (ex, w) =>
        ex.answer.n !== 0 && w === -ex.answer.n ? [...resolution(ex).slice(0, -1), `= ${toLatex(num(w))}`] : null,
    },
    {
      id: 'oppose-oublie',
      family: 'signe',
      detect: (ex, given) => oublis(ex).some((x) => is(given, x)),
      text: OPP,
      // un nombre retranché négatif : 6 − (−4)
      draw: (level, rng) =>
        redraw(() => generate(level, rng), (ex) => split(ex)[1].some((b) => b < 0)),
      // tous les nombres retranchés ont gardé leur signe
      sample: (ex) => total(forgotten(ex, () => true)),
      alsoWrong: oublis,
      // 5 − (−3) = 5 + (−3) = 2 : le − est devenu +, mais le nombre n'a pas changé de signe
      wrongLines: (ex, w) => {
        const [, bs] = split(ex);
        for (let mask = 1; mask < 1 << bs.length; mask++) {
          const xs = forgotten(ex, (i) => (mask & (1 << i)) !== 0);
          if (total(xs) === w) return [toLatex(ex.expr), `= ${toLatex(chain('+', xs))}`, `= ${toLatex(num(w))}`];
        }
        return null;
      },
    },
  ],
  resolution,
).map((e): ErrorDef => ({ ...e, rule: RULES[e.id] as NonNullable<ErrorDef['rule']> }));

// ——— Retours d'erreur des questions qui comptent ———

const givenOf = (o: Outcome): number => Number(o.given.replace(/−/g, '-'));
const isSubtraction = (ex: Exercise): boolean => ex.expr.k === 'op' && ex.expr.op === '-';

/** Le message d'une réponse tapée : juste, signe final inversé, opposé oublié, ou toute autre. */
function typedText(ex: Exercise, g: number | null, correct: boolean): string {
  if (correct) return GOOD(ex);
  if (g !== null && ex.answer.n !== 0 && g === -ex.answer.n) return INV(ex);
  if (g !== null && oublis(ex).includes(g)) return OPP(ex);
  return OTHER(ex);
}

const dirOf = (by: number): string => (by < 0 ? 'gauche' : 'droite');

/** Les 2 bonds d'une soustraction a − b : a, puis −b (série de pratique : 2 − (−3)). */
function droiteText(q: Extract<Question, { kind: 'droite' }>, o: Outcome): string | null {
  if (!isSubtraction(q.ex) || q.jumps.length !== 2) return null;
  const [a, b] = operands(q.ex.expr) as [number, number];
  const dir = dirOf(-b);
  if (o.correct) return `${shown(q.ex)} = ${sumText([a, -b])} = ${txt(q.answer)}. Soustraire ${txt(b)} fait aller vers la ${dir} : on arrive à ${txt(q.answer)}.`;
  const p = givenOf(o);
  if (p === a + b) return `${txt(a + b)}, c'est ${sumText([a, b])} : tu as ajouté ${txt(b)}. Soustraire ${txt(b)}, c'est le contraire : le bond va vers la ${dir}.`;
  if (p === 0) return `Tu es resté au départ. Le premier bond va jusqu'à ${txt(a)}, le second fait ${Math.abs(b)} graduations vers la ${dir}.`;
  if (p === a) return `${txt(a)}, c'est l'arrivée du premier bond seulement. Le bond de la soustraction part de ${txt(a)} et va vers la ${dir}.`;
  const steps = Array.from({ length: Math.abs(b) }, (_, i) => txt(a + Math.sign(-b) * (i + 1))).join(', ');
  return `Le deuxième bond part de ${txt(a)} et fait ${Math.abs(b)} graduations vers la ${dir} : ${steps}. On arrive à ${txt(q.answer)}.`;
}

/** « Quel est le signe du résultat ? » d'une soustraction a − b (série de pratique : 3 − 8). */
function signText(ex: Exercise, correct: boolean): string | null {
  if (!isSubtraction(ex) || ex.answer.n === 0 || operands(ex.expr).length !== 2) return null;
  const [x, y] = addTerms(ex) as [number, number];
  const neg = ex.answer.n < 0;
  const word = neg ? 'négatif' : 'positif';
  const added = sumText([x, y]);
  if (x * y > 0) {
    if (correct) return `${shown(ex)} = ${added}. ${fin(x, y)}`;
    return `Transforme d'abord : ${added}. Les deux nombres ont le même signe : le résultat garde ce signe, il est ${word}.`;
  }
  const big = Math.max(Math.abs(x), Math.abs(y));
  const small = Math.min(Math.abs(x), Math.abs(y));
  if (correct) return `${shown(ex)} = ${added}. Le plus grand, ${big}, est ${word} : le résultat est ${word}. ${big} ${M} ${small} = ${big - small}, donc ${txt(ex.answer.n)}.`;
  return `Transforme d'abord : ${added}. Le plus grand des deux nombres, ${big}, est ${word} : le résultat prend son signe.`;
}

/** Les exemples guidés à cases : chaque case a ses messages. */
function trouText(q: Extract<Question, { kind: 'trou' }>, o: Outcome): string | null {
  const g = givenOf(o);
  const calc = toLatex(q.ex.expr);
  if (calc === '-6 - (-10)' && q.promptLatex === '= \\square') return o.correct ? fin(-6, 10) : typedText(q.ex, g, false);
  if (calc !== '3 - 11') return null;
  if (q.promptLatex === '= 3 + (\\square)') {
    if (o.correct) return `Soustraire 11, c'est ajouter son opposé, ${M}11.`;
    if (g === 11) return `11 est le nombre de départ. Il doit changer de signe : l'opposé de 11 est ${M}11.`;
    return `Le nombre retranché est 11 : on ajoute son opposé, ${M}11.`;
  }
  return q.promptLatex === '= \\square' ? typedText(q.ex, g, o.correct) : null;
}

function feedbackText(q: Question, o: Outcome): string | null {
  if (o.unfinished || o.errorFamily === 'ecriture') return null;
  switch (q.kind) {
    case 'saisie': {
      if (!isSubtraction(q.ex)) return null;
      const g = givenOf(o);
      return typedText(q.ex, Number.isInteger(g) ? g : null, o.correct);
    }
    case 'droite':
      return droiteText(q, o);
    case 'trou':
      return trouText(q, o);
    case 'qcm':
      return q.choices.map((c) => c.latex).join('|') === '+|-' ? signText(q.ex, o.correct) : null;
    default:
      return null;
  }
}

// ——— Leçon ———

const ex1 = (...xs: number[]): Exercise => diff(1, xs);
const hl = (t: string): SceneToken => ({ t, hl: true });
const calcOf = (...tokens: (string | SceneToken)[]): { tokens: SceneToken[] } => ({
  tokens: tokens.map((t) => (typeof t === 'string' ? { t } : t)),
});
const oneScene = (...calc: (string | SceneToken)[]): Scene => ({ layout: 'one', calcs: [calcOf(...calc)] });
const linesScene = (...calcs: (string | SceneToken)[][]): Scene => ({ layout: 'lines', calcs: calcs.map((c) => calcOf(...c)) });
const lineScene = (line: LineScene, ...calc: (string | SceneToken)[]): Scene => ({ layout: 'line', calcs: [calcOf(...calc)], line });
const trouOf = (open: string, choices: string[], correct: number, errs: Record<number, string>) =>
  ({ type: 'trou' as const, open, choices, correct, errors: errs });

/** La droite de la dette : de −1 à 8 (au plus 10 graduations, non touchable). */
const dette = (jumps: LineScene['jumps'], extra: Partial<LineScene> = {}): LineScene => ({ from: -1, to: 8, jumps, tone: 'color', ...extra });

// 1 — L'idée de départ : retrancher une dette (technique 2 du plan)
const idee: EtapeStep[] = [
  step(`Ton solde est de **5 €**. Il comptait une **dette de 3 €**, c'est le nombre ${M}3. Ton ami l'efface : on **soustrait** cette dette, ce qui s'écrit 5 ${M} (${M}3).`, {
    scene: lineScene(dette([], { highlight: [5] }), `5 ${M} (${M}3)`),
  }),
  step('Quand on **enlève une dette**, on devient **plus riche** : le solde passe de 5 € à 8 €. Sur la droite, le bond va vers la **droite**.', {
    scene: lineScene(dette([{ from: 5, by: 3 }], { highlight: [8] }), `5 ${M} (${M}3) = 8`),
  }),
  step(`Ajouter ${M}3 fait aller vers la gauche. Soustraire ${M}3, c'est le contraire : on va vers la **droite**. Donc 5 ${M} (${M}3) = **8**. **Soustraire une dette**, c'est comme **ajouter** 3.`, {
    scene: lineScene(dette([], { tone: 'neutral' }), `5 ${M} (${M}3) = ?`),
    after: lineScene(dette([{ from: 5, by: 3 }], { highlight: [8] }), `5 ${M} (${M}3) = 8`),
    action: trouOf(`Ajouter ${M}3 fait aller vers la gauche. Soustraire ${M}3, c'est le contraire : on va vers la [ ? ].`, ['droite', 'gauche'], 0, {
      1: "Enlever une dette, c'est gagner de l'argent : le solde monte, donc on va vers la droite, vers les plus grands nombres.",
    }),
  }),
];

const REGLE1 = `**Soustraire un nombre, c'est ajouter son opposé : je remplace le ${M} par un +, et je change le signe du nombre qui suit.**`;
const REGLE2 = "**Puis j'additionne : même signe, j'additionne ; signes contraires, je soustrais et je prends le signe du plus grand.**";

// 3 — Règle 1 : j'ajoute l'opposé
const regle1: EtapeStep[] = [
  step(`Dans 5 ${M} (${M}3), il y a **deux signes ${M}**. Le premier est une **soustraction**. Le second, dans la parenthèse, est le **signe du nombre** ${M}3.`, {
    scene: oneScene('5 ', hl(M), ` (${M}3)`),
  }),
  step(`Soustraire un nombre, c'est **ajouter son opposé**. L'opposé d'un nombre est celui qui est **de l'autre côté de 0**, à la même distance : l'opposé de ${M}3 est 3.`, {
    scene: lineScene({ from: -4, to: 4, jumps: [{ from: 0, by: -3 }, { from: 0, by: 3 }], highlight: [-3, 3], tone: 'color' }, `l'opposé de ${M}3 est 3`),
  }),
  step(`5 ${M} (${M}3) = 5 + **3**. Le ${M} est devenu un +, et le nombre a changé de signe. 5 + 3 = **8**.`, {
    scene: oneScene(`5 ${M} (${M}3) = 5 + ?`),
    after: oneScene(`5 ${M} (${M}3) = 5 + `, hl('3')),
    action: trouOf(`5 ${M} (${M}3) = 5 + [ ? ].`, ['3', `(${M}3)`], 0, {
      1: `On a changé le ${M} en +, mais le nombre est resté ${M}3. Il faut aussi changer son signe : l'opposé de ${M}3 est 3.`,
    }),
  }),
  step(`3 ${M} 7 = 3 + **(${M}7)**. Soustraire 7, c'est ajouter ${M}7. Les parenthèses montrent que le ${M} est le **signe du nombre** : 3 + (${M}7).`, {
    scene: oneScene(`3 ${M} 7 = 3 + ?`),
    after: oneScene(`3 ${M} 7 = 3 + `, hl(`(${M}7)`)),
    action: trouOf(`3 ${M} 7 = 3 + [ ? ].`, [`(${M}7)`, '7'], 0, {
      1: `On a changé le ${M} en +, mais le nombre est resté 7. Il faut prendre son opposé : ${M}7, écrit entre parenthèses.`,
    }),
  }),
  step(undefined, { rule: { n: 1, text: REGLE1 } }),
];

// 4 — Règle 2 : puis j'additionne
const R2_LINE = (jumps: LineScene['jumps'], extra: Partial<LineScene> = {}): LineScene => ({ from: -5, to: 4, jumps, tone: 'color', ...extra });
const regle2: EtapeStep[] = [
  step(`Une fois transformée, **c'est une addition**, et tu sais la faire (Cours 1 et 2). Ici, 3 et ${M}7 ont des **signes contraires**.`, {
    scene: oneScene(`3 ${M} 7 = 3 + (${M}7)`),
  }),
  step(`3 + (${M}7) : le plus grand des deux, sans signe, est 7, donc le résultat est **négatif**. 7 ${M} 3 = 4, avec le signe ${M} : on arrive à **${M}4**.`, {
    scene: lineScene(R2_LINE([], { tone: 'neutral' }), `3 + (${M}7) = ?`),
    after: lineScene(R2_LINE([{ from: 0, by: 3 }, { from: 3, by: -7 }], { highlight: [-4] }), `3 + (${M}7) = ${M}4`),
    action: trouOf(`3 + (${M}7) : le plus grand des deux, sans signe, est 7, donc le résultat est [ ? ].`, ['négatif', 'positif'], 0, {
      1: "Le plus grand des deux nombres sans signe est 7, et il est négatif : le résultat prend son signe. C'est la règle du Cours 2.",
    }),
  }),
  step(`${M}4 ${M} 6 = ${M}4 + (${M}6) = **${M}10**. Même signe : le résultat est **${M}10**.`, {
    scene: linesScene([`${M}4 ${M} 6`], [`= ${M}4 + (${M}6) = ?`]),
    after: linesScene([`${M}4 ${M} 6`], [`= ${M}4 + (${M}6) = `, hl(`${M}10`)]),
    action: trouOf(`${M}4 ${M} 6 = ${M}4 + (${M}6) = [ ? ].`, [`${M}10`, '2', '10'], 0, {
      1: `${M}4 et ${M}6 ont le même signe : on ne les soustrait pas. On **additionne** 4 + 6 = 10, et on garde le signe ${M}.`,
      2: MEME,
    }),
  }),
  step(undefined, { rule: { n: 2, text: REGLE2 } }),
];

const options3 = (...o: [string, string][]) => o.map(([label, why]) => ({ label, why }));

const guess = choix(
  ex1(5, -3),
  "Pour commencer, à ton avis : ton solde est de 5 €. Il comptait une dette de 3 €, et ton ami l'efface. Quel est ton nouveau solde ?",
  options3(
    ['8 €', `Ta dette de 3 € ne pèse plus : tu es plus riche de 3 €, donc 5 + 3 = 8 €. Le cours va t'expliquer comment l'écrire avec des nombres relatifs : 5 ${M} (${M}3).`],
    ['2 €', '2 €, ce serait si tu avais une dette de plus. Ici, on enlève une dette : ton solde monte, il ne baisse pas.'],
    ['5 €', 'Si rien ne changeait, ton solde resterait à 5 €. Mais effacer une dette de 3 €, c\'est comme recevoir 3 € : ton solde monte.'],
  ),
  0,
);

const compareQ = choix(
  ex1(5, -3),
  "Qu'est-ce qui change entre A et B ?",
  options3(
    ['Le premier nombre', 'Les deux calculs commencent par 5 : le premier nombre ne change pas.'],
    ['Le signe devant la parenthèse', `Dans A, le signe devant la parenthèse est un ${M} : on **soustrait** ${M}3. Dans B, c'est un + : on **ajoute** ${M}3.`],
    ['Le nombre dans la parenthèse', `Dans les deux calculs, la parenthèse contient (${M}3) : ce nombre ne change pas.`],
  ),
  1,
);

const NOT_COUNTED_GUESS = 'Question pour découvrir : elle ne compte pas dans la note.';
const NOT_COUNTED_UNDERSTAND = 'Question pour comprendre : elle ne compte pas dans la note.';

/** Petites questions (comptées) : `calc` en LaTeX au-dessus de la question. */
const small = (ex: Exercise, calc: string, prompt: string, options: [string, string][], correctIndex: number): Question =>
  smallChoix(ex, prompt, options.map(([label, why]) => ({ label, why })), correctIndex, calc);

const exemple1: EtapeStep[] = [
  step('Voici la résolution. Lis la première ligne, puis touche « Je comprends ».', {
    scene: linesScene([`${M}6 ${M} (${M}10)`]),
  }),
  step(`Le ${M} devient +, et le nombre ${M}10 devient son opposé, 10. Le ${M}6 du début ne change pas.`, {
    scene: linesScene([`${M}6 ${M} (${M}10)`], [hl(`= ${M}6 + 10`)]),
    action: { type: 'comprends' },
  }),
];

// ——— Autres façons de faire (techniques 3 et 4 du plan), avec le rappel des règles en tête ———

const AUTRES: LessonPart = autres({
  title: 'Autres façons de faire',
  recap: {
    title: 'Les 2 règles à retenir',
    rules: [
      { title: `1. Je remplace le ${M} par un +, et je change le signe du nombre.`, ok: `6 ${M} (${M}4) = 6 + 4`, ko: `6 ${M} (${M}4) = 6 + (${M}4)` },
      { title: "2. Puis j'additionne, avec les règles des Cours 1 et 2.", ok: `3 ${M} 7 = 3 + (${M}7) = ${M}4`, ko: `3 ${M} 7 = 3 + (${M}7) = 4` },
    ],
    sentence: `Soustraire, c'est ajouter l'opposé : je remplace le ${M} par un +, je change le signe du nombre, puis j'additionne.`,
  },
  intro: 'La méthode marche toujours. Voici deux autres façons de faire : **choisis celle que tu veux essayer**.',
  techniques: [
    {
      name: 'Petit moins grand : on retourne',
      quand: 'Quand on retranche un nombre positif plus grand que le premier.',
      example: `3 ${M} 8 : je calcule 8 ${M} 3 = 5, et le résultat est négatif : ${M}5`,
      how: "Au lieu de passer par l'addition, on soustrait dans le sens facile : le plus grand moins le plus petit. Comme on retranche plus qu'on n'a, le résultat est négatif : on met le signe −.",
      essai: {
        kind: 'saisie',
        consigne: `Essaie avec 4 ${M} 9 : calcule le plus grand moins le plus petit, puis mets le bon signe. **Tape le résultat.**`,
        calc: `4 ${M} 9`,
        answer: -5,
        yes: `9 ${M} 4 = 5, et on retranche 9 à 4, un nombre plus petit : le résultat est négatif, ${M}5.`,
        errors: [
          { values: [5], message: 'Tu as le bon nombre, mais pas le bon signe : on retranche 9 à 4, plus petit que 9, donc le résultat est négatif.' },
          { values: [13], message: `13, c'est 4 + 9. Soustraire 9, ce n'est pas l'ajouter : 9 ${M} 4 = 5, puis le signe ${M}.` },
        ],
        fallback: `9 ${M} 4 = 5, puis le signe ${M} : ${M}5.`,
      },
    },
    {
      name: "Vérifier par l'opération inverse",
      quand: 'Après une soustraction, pour être sûr du résultat.',
      example: `5 ${M} (${M}3) = 8 car 8 + (${M}3) = 5`,
      how: "Si le résultat est juste, en y ajoutant le nombre retranché, on retrouve le premier nombre. Si ce n'est pas le cas, il y a une erreur : on recommence.",
      essai: {
        kind: 'choix',
        consigne: `Quelqu'un a calculé 6 ${M} (${M}4) = 2. Vérifie : calcule 2 + (${M}4). **Touche ce que tu trouves.**`,
        calc: `2 + (${M}4)`,
        options: [`${M}2`, '6', `${M}6`],
        correct: 0,
        yes: `2 + (${M}4) = ${M}2, et non 6 : le résultat 2 est faux. La bonne réponse est 10, car 10 + (${M}4) = 6.`,
        no: `Signes contraires : 4 ${M} 2 = 2, et le plus grand, 4, est négatif : 2 + (${M}4) = ${M}2. On ne retrouve pas 6, donc 2 est faux.`,
      },
    },
  ],
  outro: "Ensuite, tu t'entraînes avec quatre questions.",
});

const parts: LessonPart[] = [
  // 0 — Accroche + deviner (ne compte pas)
  texted(decouverte(guess), {
    title: 'Soustraire un nombre relatif',
    intro: [
      `Jusqu'ici, tu as **additionné** des nombres relatifs. Maintenant, tu vas aussi les **soustraire**, par exemple 5 ${M} (${M}3) ou 3 ${M} 8.`,
      `Le piège : un signe ${M} peut en **cacher un autre**. Tu vas apprendre une méthode qui marche à chaque fois.`,
    ],
    mention: NOT_COUNTED_GUESS,
  }),
  // 1 — Retrancher une dette
  etapes('Retrancher une dette', idee),
  // 2 — Comparer deux cas (ne compte pas) : A de ce cours, B du Cours 2
  texted(decouverte(compareQ), {
    title: 'Comparer deux cas',
    intro: ['Voici deux calculs presque identiques. Regarde-les bien.'],
    mention: NOT_COUNTED_UNDERSTAND,
    compare: {
      a: { label: 'Calcul A', latex: '5 - (-3)' },
      b: { label: 'Calcul B', latex: '5 + (-3)' },
      note: 'Le calcul B vient du cours précédent : tu sais déjà le faire. Ici, tu observes seulement ce qui change.',
      line: {
        from: 1,
        to: 8,
        jumps: [{ from: 5, by: 3, label: 'A' }, { from: 5, by: -3, label: 'B' }],
        marks: [{ at: 8, text: 'A : 8' }, { at: 2, text: 'B : 2' }],
        tone: 'color',
      },
      after: [
        `A arrive en 8 : 5 ${M} (${M}3) = 8.`,
        `B arrive en 2 : 5 + (${M}3) = 2.`,
        'Un seul signe change, et on arrive à des endroits **opposés** : 8 et 2. Dans B, tu sais faire (Cours 2). Pour A, il faut une méthode : la **transformer en addition**.',
      ],
    },
  }),
  // 3 — Règle 1
  etapes("J'ajoute l'opposé", regle1),
  // 4 — Règle 2
  etapes("Puis j'additionne", regle2),
  // 5, 6 — Petites questions, une par règle (sur le même écran, comptées)
  lecon(
    small(ex1(6, -4), '6 - (-4)', 'Quelle réécriture en addition est juste ?', [
      ['6 + 4', `Le ${M} devient +, et ${M}4 devient son opposé, 4 : 6 + 4. Puis 6 + 4 = 10.`],
      [`6 + (${M}4)`, `Tu as changé le ${M} en +, mais pas le signe du nombre : (${M}4) est resté (${M}4). L'opposé de ${M}4 est 4.`],
      [`6 ${M} 4`, `6 ${M} 4 est encore une soustraction, et le signe ${M} du nombre a disparu. Une réécriture en addition commence par 6 +.`],
    ], 0),
  ),
  texted(
    lecon(
      small(ex1(-4, 6), '-4 - 6', 'Quel est le résultat ?', [
        [`${M}10`, `${M}4 ${M} 6 = ${M}4 + (${M}6). ${fin(-4, -6)}`],
        ['2', `Tu as ajouté 6 au lieu de son opposé : ${M}4 + 6 = 2. Soustraire 6, c'est ajouter ${M}6.`],
        ['10', `Transforme d'abord : ${M}4 + (${M}6). Les deux nombres sont négatifs : le résultat est négatif aussi.`],
      ], 0),
    ),
    { joinPrevious: true },
  ),
  // 7 — Les règles, puis autres façons de faire
  AUTRES,
  // 8 — Série de pratique (notée)
  pratique('Cours 4 · Pratique', [
    {
      question: droiteQ(ex1(2, -3), { from: -1, to: 6 }, [{ from: 0, by: 2 }, { from: 2, by: 3 }]),
      texts: { consigne: `Les bonds sont dessinés : +2, puis la soustraction de ${M}3. Où arrive-t-on ?` },
    },
    {
      question: signBox(ex1(3, 8), false, 'signe-inverse'),
      texts: { consigne: "Touche le signe du résultat. Tu n'as pas besoin de calculer.", intro: ['Quel est le signe du résultat ?'] },
    },
    {
      // une question du Cours 3 : elle doit d'abord reconnaître que ce calcul n'est pas une soustraction
      question: choix(
        makeExercise(ID, 1, chain('+', [6, -2, 4])),
        'Quel est le résultat ?',
        options3(
          ['8', `Ce calcul est une addition (Cours 3). Positifs : 6 + 4 = 10. Négatif : ${M}2. 10 + (${M}2) = 8.`],
          ['12', `Le ${M}2 est négatif : il se retranche des positifs, on ne l'ajoute pas. Regroupe les positifs (10) et le négatif (${M}2), puis 10 ${M} 2 = 8.`],
          ['4', OUBLI],
        ),
        0,
        '6 + (-2) + 4',
      ),
      texts: { consigne: 'Regarde bien le calcul, puis touche le résultat.' },
    },
    { question: saisie(ex1(-3, -8)), texts: { consigne: 'Calcule. **Tape le résultat.**' } },
  ], "Maintenant, deux exemples pour t'aider à les résoudre en entier."),
  // 9 — Exemple 1 : la première ligne est résolue à l'écran
  etapes('Exemple 1 sur 2', exemple1),
  // 10 — Exemple 1 : la dernière ligne (notée)
  texted(exemple(trou(ex1(-6, -10), '= \\square', 4)), {
    consigne: 'Tape ce qui manque dans la case, avec les touches du clavier.',
    above: ['= -6 + 10'],
    help: "Dernière ligne. Écris le résultat, avec son signe. Tu peux t'aider de la ligne du dessus.",
  }),
  // 11 — Exemple 2, case 1 : la transformation (entraînement non noté)
  texted(decouverte(trou(ex1(3, 11), '= 3 + (\\square)', -11)), {
    consigne: COMPLETE,
    intro: ['Cette fois, deux cases sont à toi. Transforme la soustraction en addition, puis calcule.'],
    mention: '',
  }),
  // 12 — Exemple 2, case 2 : le résultat (notée)
  texted(exemple(trou(ex1(3, 11), '= \\square', -8)), { above: ['= 3 + (-11)'], mention: '' }),
  // 13 — Annonce des exercices de fin
  etapes('Place aux 5 exercices de fin', [
    step("Cette fois, **pas d'aide**. Ils ressemblent à ce que tu verras en contrôle."),
    step('Pour valider le cours, il faut : au moins **4 exercices de fin justes sur 5** ; et **80 % de bonnes réponses** sur tout le cours.'),
    step("Si tu n'y arrives pas, ce n'est pas grave : tu feras une **série de validation**. Ce sont 5 exercices, sans refaire la leçon."),
  ]),
];

export const c04: CourseDef = {
  id: ID,
  moduleId: MODULE_ID,
  order: 4,
  title: "Soustraire, c'est ajouter l'opposé",
  shortTitle: 'Soustraire',
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
  formats: ['saisie', 'droite', 'signe', 'vraifaux', 'erreur'],
  feedbackText,
  memo: {
    rule: RULE,
    examples: [`5 ${M} (${M}3) = 5 + 3 = **8**`],
    mistake: {
      wrong: `5 ${M} (${M}3) = 5 + (${M}3)`,
      why: `Changer le ${M} en + ne suffit pas : le nombre doit aussi **changer de signe**. Avant de calculer, je vérifie que j'ai bien écrit l'opposé.`,
    },
    tip: `Soustraire, c'est ajouter l'opposé : 5 ${M} (${M}3) = 5 + 3 = 8 ; 5 ${M} 3 = 5 + (${M}3) = 2.`,
  },
};
