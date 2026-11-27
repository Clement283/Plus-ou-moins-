// Cours 3 — Diviser des deux côtés (ax = c), déroulé guidé (2026-11-26). Fiche : docs/modules/02-equations-inequations/equations-diviser.md.
import { rat } from '../../math/rational';
import type { Rng } from '../../rng';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, Level } from '../types';
import {
  M, NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, buildErrors, choix, decouverte, draw, etapes, exemple,
  explanation, hl, intOf, is, lecon, linesScene, options3, redraw, signs, small, step, texted, toks, trouOf,
} from '../calculs/shared';
import { EQ_MODULE_ID, coefText, lin, lineQuestions, paramsOf, paren, parenL, resoudreQ, sgn, textOfEx, latexOfEx } from './lineaire';

const ID = 'equations-diviser';
const RULE = 'ax veut dire a × x. Pour trouver x, je divise les deux membres par a, avec son signe.';

// ——— Générateur : ax = c, a et x entiers (2 à 9, puis 12, puis 15 en valeur absolue), jamais 0 ni 1 ———
type Range = [number, number];
const RANGE: Record<Level, Range> = { 1: [2, 9], 2: [2, 12], 3: [2, 15] };
function generate(level: Level, rng: Rng): Exercise {
  const [aNeg, xNeg] = signs(rng);
  const a = (aNeg ? -1 : 1) * draw(rng, RANGE[level]);
  const x = (xNeg ? -1 : 1) * draw(rng, RANGE[level]);
  return lin(ID, level, a, 0, a * x);
}
/** ax = c avec x choisi : l'exemple d'un écran. */
const eq3 = (a: number, x: number): Exercise => lin(ID, 1, a, 0, a * x);

function resolution(ex: Exercise): string[] {
  const { a, c } = paramsOf(ex);
  return [latexOfEx(ex), `${a}x \\div ${parenL(a)} = ${c} \\div ${parenL(a)}`, `x = ${intOf(ex.answer)}`];
}
const divided = (ex: Exercise): string => {
  const { a, c } = paramsOf(ex);
  return `x = ${sgn(c)} ÷ ${paren(a)} = ${sgn(intOf(ex.answer))}`;
};

// ——— Erreurs reconnues ———
const R1 = 'Défaire une multiplication';
const R2 = 'Le signe de a';
const R3 = 'Vérifier en remplaçant';
const RULES: Record<string, NonNullable<ErrorDef['rule']>> = {
  'soustraire-coef': { n: 1, label: R1, partIndex: 1 },
  'multiplier-coef': { n: 1, label: R1, partIndex: 1 },
  'signe-oublie': { n: 2, label: R2, partIndex: 4 },
};
const xOf = (ex: Exercise): number => intOf(ex.answer);
const errors: ErrorDef[] = buildErrors(
  [
    {
      id: 'soustraire-coef',
      family: 'calcul',
      detect: (ex, given) => is(given, paramsOf(ex).c - paramsOf(ex).a),
      text: (ex) =>
        `${coefText(paramsOf(ex).a)} veut dire ${paren(paramsOf(ex).a)} × x : c'est une multiplication, qu'on défait en divisant, pas en soustrayant. On divise les deux membres par ${paren(paramsOf(ex).a)} : ${divided(ex)}.`,
      draw: (level, rng) => redraw(() => generate(level, rng), () => true),
      sample: (ex) => paramsOf(ex).c - paramsOf(ex).a,
    },
    {
      id: 'multiplier-coef',
      family: 'calcul',
      detect: (ex, given) => is(given, paramsOf(ex).c * paramsOf(ex).a),
      text: (ex) =>
        `${coefText(paramsOf(ex).a)} veut dire ${paren(paramsOf(ex).a)} × x. Pour retrouver x, on fait l'opération inverse de la multiplication : la division. On divise les deux membres par ${paren(paramsOf(ex).a)} : ${divided(ex)}.`,
      draw: (level, rng) => redraw(() => generate(level, rng), () => true),
      sample: (ex) => paramsOf(ex).c * paramsOf(ex).a,
    },
    {
      id: 'signe-oublie',
      family: 'signe',
      detect: (ex, given) => is(given, -xOf(ex)),
      text: (ex) => {
        const { a, c } = paramsOf(ex);
        const same = c < 0 === a < 0;
        return `On divise ${sgn(c)} par ${paren(a)} : ${same ? 'les deux nombres ont le même signe, donc x est positif' : 'les signes sont contraires, donc x est négatif'}. Le bon résultat est x = ${sgn(xOf(ex))}.`;
      },
      draw: (level, rng) => redraw(() => generate(level, rng), (ex) => paramsOf(ex).a < 0 || paramsOf(ex).c < 0),
      sample: (ex) => -xOf(ex),
    },
  ],
  resolution,
).map((e): ErrorDef => ({ ...e, rule: RULES[e.id] as NonNullable<ErrorDef['rule']> }));

// ——— Retours d'erreur des questions qui comptent (saisie de x et case « x = ▢ ») ———
const OTHER = (ex: Exercise): string =>
  `Pour trouver x dans ${textOfEx(ex)}, on divise les deux membres par ${paren(paramsOf(ex).a)} : ${divided(ex)}.`;

function feedbackText(q: Question, o: Outcome): string | null {
  if (o.unfinished || o.errorFamily === 'ecriture' || o.correct) return null;
  if (q.kind !== 'saisie' && !(q.kind === 'trou' && q.promptLatex === 'x = \\square')) return null;
  const g = Number(o.given.replace(/−/g, '-'));
  const e = Number.isInteger(g) ? errors.find((x) => x.detect(q.ex, rat(g))) : undefined;
  return e ? e.explain(q.ex).rule : OTHER(q.ex);
}

// ——— Leçon : 8 écrans avant l'annonce de la fin (déroulé guidé, 2026-11-26) ———
const REGLE1 = '**ax veut dire a × x. Pour trouver x, je divise les deux membres par a.**';
const REGLE2 = '**Je divise par a avec son signe : même signe, x est positif ; signes contraires, x est négatif.**';
const REGLE3 = '**Je vérifie : je remplace x par ma réponse, et je dois retrouver le membre de droite.**';

// 0 — Accroche : une question pour deviner (ne compte pas)
const guess = choix(
  eq3(3, 4),
  'Pour commencer, à ton avis : si 3x = 12, combien vaut x ?',
  options3(
    ['4', 'Bonne intuition : 3 × 4 = 12. Le cours va te montrer comment le trouver à coup sûr, même avec des nombres plus grands.'],
    ['9', "Beaucoup d'élèves retirent 3 de 12. Mais 3x veut dire 3 × x, pas 3 + x : retirer 3 ne marche pas. Le cours va t'expliquer quoi faire."],
    ['36', "36, c'est 12 × 3. Mais 3 × 36 ne fait pas 12. Le cours va t'expliquer quoi faire des deux côtés."],
  ),
  0,
  '3x = 12',
);

// 1 — Règle 1 : la balance, on partage les deux côtés
const idee: EtapeStep[] = [
  step('Une équation est comme une **balance en équilibre** : les deux côtés pèsent pareil. Ici, 3x veut dire **3 paquets de x**, et ils pèsent 12.', {
    scene: linesScene([hl('3x'), ' = 12']),
  }),
  step('Si 3 paquets pèsent 12, **un seul paquet pèse 12 ÷ 3**. On partage donc les deux côtés en 3.', {
    scene: linesScene(['3x = 12']),
    after: linesScene(['3x = 12'], [hl('3x ÷ 3 = 12 ÷ 3')]),
    action: trouOf('On partage les deux côtés en 3 : on [ ? ] les deux membres par 3.', ['divise', 'soustrait', 'multiplie'], 0, {
      1: 'Soustraire 3 enlèverait 3 à chaque côté, sans rien partager. 3x veut dire 3 × x : pour partager en 3, on divise.',
      2: 'Multiplier par 3 ferait 9x = 36 : les paquets seraient plus gros, pas partagés. Pour partager en 3, on divise.',
    }),
  }),
  step(undefined, {
    scene: linesScene(['3x = 12'], ['3x ÷ 3 = 12 ÷ 3'], ['x = 4']),
    rule: { n: 1, text: REGLE1 },
  }),
];

// 4 — Règle 2 : le signe de a
const regle2: EtapeStep[] = [
  step('Quand le nombre devant x est **négatif**, on divise par ce nombre négatif : on garde son signe.', {
    scene: linesScene([hl(`${M}2x`), ' = 6']),
  }),
  step(`${M}2x = 6 : on divise par ${M}2. Les nombres 6 et ${M}2 ont des signes **contraires**, donc x est **négatif**.`, {
    scene: linesScene([`${M}2x = 6`], [`${M}2x ÷ (${M}2) = 6 ÷ (${M}2)`]),
    after: linesScene([`${M}2x = 6`], [`${M}2x ÷ (${M}2) = 6 ÷ (${M}2)`], ['x = ', hl(`${M}3`)]),
    action: trouOf(`6 ÷ (${M}2) : les signes sont contraires, donc x est [ ? ].`, ['négatif', 'positif'], 0, {
      1: `Des signes contraires donnent un résultat négatif, comme pour diviser deux relatifs : 6 ÷ (${M}2) = ${M}3, et ${M}2 × (${M}3) = 6.`,
    }),
  }),
  step(undefined, {
    scene: linesScene([`${M}2x = 6`], [`${M}2x ÷ (${M}2) = 6 ÷ (${M}2)`], [`x = ${M}3`]),
    rule: { n: 2, text: REGLE2 },
  }),
];

// 6 — Règle 3 : vérifier en remplaçant (reprise du cours « Tester si un nombre est solution »)
const verifier: EtapeStep[] = [
  step("Pour être sûr de sa réponse, on **remplace x** par le nombre trouvé, dans l'équation de départ, comme dans le cours « Tester si un nombre est solution ».", {
    scene: linesScene([`5x = ${M}35`], [`x = ${M}7`]),
  }),
  step(`Avec x = ${M}7, on calcule 5 × (${M}7) : on doit retrouver ${M}35.`, {
    scene: linesScene([`5x = ${M}35`], [`5 × (${M}7) = ?`]),
    after: linesScene([`5x = ${M}35`], [`5 × (${M}7) = `, hl(`${M}35`)]),
    action: trouOf(`5 × (${M}7) = [ ? ].`, [`${M}35`, '35', `${M}2`], 0, {
      1: `5 et ${M}7 ont des signes contraires : le produit est négatif, donc ${M}35 et non 35.`,
      2: `${M}2, c'est 5 + (${M}7) : tu as additionné. Ici, on multiplie : 5 × 7 = 35, puis le signe ${M}.`,
    }),
  }),
  step(undefined, {
    scene: linesScene([`5 × (${M}7) = ${M}35`], [`On retrouve ${M}35.`]),
    rule: { n: 3, text: REGLE3 },
  }),
];

// Comparer deux cas : le 3 multiplie x, ou s'ajoute à x (cours précédent) : retirer ou diviser
const compareQ = choix(
  eq3(3, 4),
  'Dans quelle équation divise-t-on par 3 ?',
  options3(
    ['Dans A, 3x = 12', 'Oui : dans A, 3 multiplie x, on le défait en divisant.'],
    ['Dans B, x + 3 = 12', 'Dans B, 3 est ajouté à x : on le retire, on ne divise pas.'],
    ['Dans les deux', 'Non : une addition se défait en retirant, une multiplication en divisant.'],
  ),
  0,
);

const exGuide = eq3(-6, 7); // −6x = −42, x = 7

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Diviser des deux côtés',
    intro: ['Dans une équation comme 3x = 12, le nombre 3 est collé à x : 3x veut dire 3 × x.', 'Dans ce cours, tu apprends à trouver x en faisant **la même opération des deux côtés** du signe égal.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(R1, idee),
  lecon(
    small(eq3(5, 7), '5x = 35', 'Pour trouver x dans 5x = 35, que fait-on des deux côtés ?', [
      ['On divise par 5', 'Oui : 5x veut dire 5 × x, on le défait en divisant les deux membres par 5. 35 ÷ 5 = 7.'],
      ['On retire 5', 'Retirer 5 donnerait 5x − 5 = 30 : x ne serait pas seul. 5x veut dire 5 × x, on divise.'],
      ['On multiplie par 5', 'Multiplier par 5 donnerait 25x = 175 : x serait encore plus loin d’être seul. On divise.'],
    ], 0),
  ),
  texted(decouverte(compareQ), {
    title: 'Comparer deux cas',
    intro: ['Ces deux équations se ressemblent : regarde comment 3 est écrit à côté de x.'],
    mention: NOT_COUNTED_UNDERSTAND,
    compare: {
      a: { label: 'Équation A', latex: '3x = 12' },
      b: { label: 'Équation B', latex: 'x + 3 = 12' },
      note: '',
      inPlace: true,
      highlight: { a: toks(hl('3x'), ' = 12'), b: toks('x ', hl('+ 3'), ' = 12') },
      after: ['Dans A, 3 multiplie x : on divise par 3, x = 12 ÷ 3 = 4.', 'Dans B, 3 est ajouté à x : on retire 3, x = 12 − 3 = 9.'],
    },
  }),
  etapes(R2, regle2),
  lecon(
    small(eq3(4, -5), `4x = ${M}20`, `Dans 4x = ${M}20, que vaut x ?`, [
      [`x = ${M}5`, `${M}20 ÷ 4 : les signes sont contraires, donc x est négatif : ${M}5.`],
      ['x = 5', `${M}20 est négatif et 4 est positif : les signes sont contraires, donc x est négatif.`],
      [`x = ${M}24`, `${M}24, c'est ${M}20 − 4 : tu as soustrait. On divise les deux membres par 4.`],
    ], 0),
  ),
  etapes(R3, verifier),
  texted(exemple({ ...resoudreQ(exGuide), guided: true } as Question), {
    title: 'On le fait ensemble',
    subtitle: `Résous ${M}6x = ${M}42. À chaque ligne, une aide te dit quoi faire.`,
  }),
  annonceFin(),
];

export const equationsDiviser: CourseDef = {
  id: ID,
  moduleId: EQ_MODULE_ID,
  order: 3,
  title: 'Diviser des deux côtés',
  shortTitle: 'Diviser',
  rule: RULE,
  parts,
  // pas de série de pratique : la pastille s'arrête avant l'exemple guidé
  lessonLength: parts.findIndex((p) => p.type === 'question' && p.activity === 'exemple'),
  unePhrase: true,
  // « resoudre » : l'élève écrit ses lignes (décision du 2026-11-26)
  endExercises: { count: 5, kind: 'saisie', mix: ['resoudre', 'resoudre', 'resoudre', 'resoudre', 'resoudre'] },
  generate,
  errors,
  generalExplanation: (ex) => explanation(RULE, resolution(ex)),
  resolution,
  classes: SIGN_CLASSES,
  expectInteger: true,
  // « saisie » (x = ▢) et « resoudre » (À toi de résoudre) en révision et en entraînement ; 3 formats pour que la révision garde 3 questions
  formats: ['saisie', 'resoudre', 'resoudre'],
  customQuestion: lineQuestions(generate, () => errors),
  feedbackText,
  memo: {
    rule: RULE,
    ruleBullets: [
      'ax veut dire a × x : on divise les deux membres par a.',
      'On garde le signe de a : même signe, x positif ; signes contraires, x négatif.',
      'On vérifie en remplaçant x par la réponse.',
    ],
    examples: [`3x = 12 : 3x ÷ 3 = 12 ÷ 3, donc x = 4`, `${M}2x = 6 : ${M}2x ÷ (${M}2) = 6 ÷ (${M}2), donc x = ${M}3`],
    mistake: { wrong: '3x = 12, donc x = 12 − 3 = 9', why: '3x veut dire **3 × x** : une multiplication se défait en **divisant**, pas en soustrayant.' },
    tip: 'Écris la ligne « ÷ a » sous les deux membres, puis calcule chaque côté.',
  },
};
