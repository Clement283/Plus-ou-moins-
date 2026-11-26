// Cours 3 — Diviser des deux côtés (ax = c). Fiche : docs/modules/02-equations-inequations/equations-diviser.md.
import { rat } from '../../math/rational';
import type { Rng } from '../../rng';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, Level } from '../types';
import {
  M, NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, autres, buildErrors, choix, decouverte, draw,
  etapes, exemple, explanation, hl, intOf, is, lecon, linesScene, options3, pratique, redraw, signBox, signs, small, step,
  texted, toks, trou, trouOf,
} from '../calculs/shared';
import { EQ_MODULE_ID, coefText, lin, lineQuestions, paramsOf, paren, parenL, saisieX, sgn, textOfEx, latexOfEx } from './lineaire';

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

// ——— Leçon ———
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

// 1 — L'idée de départ : la balance, on partage les deux côtés (règle 1)
const idee: EtapeStep[] = [
  step('Une équation est comme une **balance en équilibre** : les deux côtés pèsent pareil. Ici, 3x veut dire **3 paquets de x**, et ils pèsent 12.', {
    scene: linesScene([hl('3x'), ' = 12']),
  }),
  step('Si 3 paquets pèsent 12, **un seul paquet pèse 12 ÷ 3**. On partage donc les deux côtés en 3.', {
    scene: linesScene(['3x = 12']),
    after: linesScene(['3x = 12'], [hl('3x ÷ 3 = 12 ÷ 3')]),
    action: trouOf('On partage les deux côtés en 3 : on [ ? ] les deux membres par 3.', ['divise', 'soustrait', 'multiplie'], 0, {
      1: "Soustraire 3 enlèverait 3 à chaque côté, sans rien partager. 3x veut dire 3 × x : pour partager en 3, on divise.",
      2: 'Multiplier par 3 ferait 9x = 36 : les paquets seraient plus gros, pas partagés. Pour partager en 3, on divise.',
    }),
  }),
  step(undefined, {
    scene: linesScene(['3x = 12'], ['3x ÷ 3 = 12 ÷ 3'], ['x = 4']),
    rule: { n: 1, text: REGLE1 },
  }),
];

// 2 — Règle 2 : le signe de a
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

// 3 — Règle 3 : vérifier en remplaçant
const verifier: EtapeStep[] = [
  step("Pour être sûr de sa réponse, on **remplace x** par le nombre trouvé, dans l'équation de départ.", {
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
    scene: linesScene([`5 × (${M}7) = ${M}35 : c'est le membre de droite`]),
    rule: { n: 3, text: REGLE3 },
  }),
];

const compareQ = choix(
  eq3(3, 4),
  "Quelle opération fait-on des deux côtés, dans chaque équation ?",
  options3(
    ['A : diviser par 3, B : retirer 3', 'Oui. Dans A, 3 multiplie x : on divise par 3. Dans B, 3 est ajouté à x : on le retire des deux côtés.'],
    ['A : retirer 3, B : diviser par 3', "C'est l'inverse. Dans A, 3x veut dire 3 × x : on divise par 3. Dans B, 3 est ajouté : on le retire."],
    ['Les deux : retirer 3', 'Pour B, oui. Mais dans A, retirer 3 ne laisse pas x seul : 3x veut dire 3 × x, il faut diviser.'],
  ),
  0,
);

const exemple1: EtapeStep[] = [
  step(`Voici la résolution de ${M}4x = 20. Lis la première ligne, puis touche « Je comprends ».`, {
    scene: linesScene([`${M}4x = 20`]),
  }),
  step(`On divise les deux membres par ${M}4. Les signes sont contraires : x sera **négatif**.`, {
    scene: linesScene([`${M}4x = 20`], [hl(`${M}4x ÷ (${M}4) = 20 ÷ (${M}4)`)]),
    action: { type: 'comprends' },
  }),
];

// ——— Autres façons de faire ———
const AUTRES: LessonPart = autres({
  title: 'Autres façons de faire',
  recap: {
    title: 'Les 3 règles à retenir',
    rules: [
      { title: '1. Je divise les deux membres par a.', ok: '3x = 12, donc x = 12 ÷ 3 = 4', ko: '3x = 12, donc x = 12 − 3 = 9' },
      { title: '2. Je garde le signe de a.', ok: `${M}2x = 6, donc x = ${M}3`, ko: `${M}2x = 6, donc x = 3` },
      { title: '3. Je vérifie en remplaçant x.', ok: `5 × (${M}7) = ${M}35`, ko: `5 × 7 = 35, donc x = ${M}7 est faux` },
    ],
    sentence: 'ax veut dire a × x : je divise les deux membres par a, avec son signe, et je vérifie en remplaçant x.',
  },
  intro: 'La méthode marche toujours. Voici deux autres façons de faire : **choisis celle que tu veux essayer**.',
  techniques: [
    {
      name: 'Se demander « a fois combien ? »',
      quand: 'Quand ta table de multiplication te donne la réponse.',
      example: '3x = 12 : 3 fois combien font 12 ? Réponse : 4.',
      how: '3x veut dire 3 × x. Tu cherches le nombre qui, multiplié par 3, donne 12. C’est la même chose que 12 ÷ 3, calculée de tête.',
      essai: {
        kind: 'saisie',
        consigne: 'Dans 6x = 42, **6 fois combien font 42 ? Tape la valeur de x.**',
        calc: '6x = 42',
        answer: 7,
        yes: '6 × 7 = 42 : x = 7. Même résultat que 42 ÷ 6.',
        errors: [
          { values: [36], message: '36, c’est 42 − 6 : tu as soustrait. 6x veut dire 6 × x : cherche 6 fois combien font 42.' },
          { values: [252], message: '252, c’est 42 × 6 : tu as multiplié. Cherche le nombre qui, multiplié par 6, donne 42.' },
        ],
        fallback: 'Cherche le nombre qui, multiplié par 6, donne 42. Tu peux aussi calculer 42 ÷ 6.',
      },
    },
    {
      name: 'Vérifier sa réponse',
      quand: 'Une fois x trouvé, ou quand tu hésites entre deux réponses.',
      example: '4x = 20 et x = 5 : 4 × 5 = 20, c’est juste.',
      how: 'Tu remplaces x par ton nombre, tu calcules le membre de gauche, et tu regardes si tu retrouves le membre de droite.',
      essai: {
        kind: 'choix',
        consigne: 'Un élève a trouvé x = 6 pour 4x = 20. **Touche ce qu’on obtient en remplaçant x par 6.**',
        calc: '4x = 20',
        options: ['4 × 6 = 24, donc x = 6 est faux', '4 × 6 = 20, donc x = 6 est juste', '4 × 6 = 10, donc x = 6 est faux'],
        correct: 0,
        yes: '4 × 6 = 24, et 24 n’est pas 20 : x = 6 est faux. Le bon résultat est x = 5.',
        no: '4 × 6 = 24. On ne retrouve pas 20, donc x = 6 est faux. Le bon résultat est x = 5.',
      },
    },
  ],
  outro: "Ensuite, tu t'entraînes avec quatre questions.",
});

// ——— Série de pratique : l'aide diminue ; la 1re question vient du cours précédent ———
const PRATIQUE = pratique(
  'Pratique',
  [
    {
      question: choix(
        eq3(2, 2),
        'Pour résoudre x + 4 = 11, quelle opération fait-on des deux côtés ?',
        options3(
          ['Retirer 4', 'Oui : on retire 4 des deux côtés, 11 − 4 = 7. C’est la méthode du cours « Ajouter ou retirer le même nombre ».'],
          ['Diviser par 4', 'Diviser par 4 sert quand 4 multiplie x, comme dans 4x. Ici, 4 est ajouté à x : on le retire.'],
          ['Ajouter 4', 'Ajouter 4 donnerait x + 8 = 15 : x ne serait pas seul. On retire 4.'],
        ),
        0,
        'x + 4 = 11',
      ),
      texts: { consigne: 'Cette équation vient du cours précédent. **Touche la bonne opération.**' },
    },
    {
      question: trou(eq3(5, 7), 'x = \\square', 7),
      texts: { consigne: 'La ligne « ÷ 5 » est déjà écrite. **Tape la valeur de x dans la case.**', above: ['5x \\div 5 = 35 \\div 5'] },
    },
    {
      question: choix(
        eq3(-4, -6),
        'Quelle est la valeur de x ?',
        options3(
          [`x = ${M}6`, `${M}4x = 24 : on divise 24 par ${M}4. Les signes sont contraires, donc x est négatif : ${M}6.`],
          ['x = 6', `6 a le bon chiffre, mais 24 ÷ (${M}4) est négatif : les signes sont contraires. Le bon résultat est ${M}6.`],
          ['x = 28', `28, c'est 24 − (${M}4) : tu as soustrait. ${M}4x veut dire (${M}4) × x : on divise les deux membres par ${M}4.`],
        ),
        0,
        `-4x = 24`,
      ),
      texts: { consigne: "Regarde bien le signe de a, puis touche la valeur de x." },
    },
    { question: saisieX(eq3(7, -8)), texts: { consigne: "Résous l'équation. **Tape la valeur de x.**" } },
  ],
  "Maintenant, deux exemples pour t'aider à les résoudre en entier.",
);

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Diviser des deux côtés',
    intro: ['Dans une équation comme 3x = 12, le nombre 3 est collé à x : 3x veut dire 3 × x.', 'Dans ce cours, tu apprends à trouver x en faisant **la même opération des deux côtés** du signe égal.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(R1, idee),
  lecon(small(eq3(5, 7), '5x = 35', 'Pour trouver x dans 5x = 35, que fait-on des deux côtés ?', [
    ['On divise par 5', 'Oui : 5x veut dire 5 × x, on le défait en divisant les deux membres par 5. 35 ÷ 5 = 7.'],
    ['On retire 5', 'Retirer 5 donnerait 5x − 5 = 30 : x ne serait pas seul. 5x veut dire 5 × x, on divise.'],
    ['On multiplie par 5', 'Multiplier par 5 donnerait 25x = 175 : x serait encore plus loin d’être seul. On divise.'],
  ], 0)),
  texted(lecon(small(eq3(4, 7), '4x = 28', 'Dans 4x = 28, que vaut x ?', [
    ['x = 7', '4x = 28 : on divise les deux membres par 4, 28 ÷ 4 = 7. Et 4 × 7 = 28.'],
    ['x = 24', '24, c’est 28 − 4 : tu as soustrait. On divise les deux membres par 4.'],
    ['x = 112', '112, c’est 28 × 4 : tu as multiplié. On divise les deux membres par 4.'],
  ], 0)), { joinPrevious: true }),
  etapes(R2, regle2),
  lecon(small(eq3(-3, -5), `${M}3x = 15`, `Dans ${M}3x = 15, que vaut x ?`, [
    [`x = ${M}5`, `15 ÷ (${M}3) : les signes sont contraires, donc x est négatif : ${M}5.`],
    ['x = 5', `5 a le bon chiffre, mais on divise par ${M}3 : les signes sont contraires, donc x est négatif.`],
    ['x = 18', `18, c'est 15 − (${M}3) : tu as soustrait. On divise les deux membres par ${M}3.`],
  ], 0)),
  texted(lecon(small(eq3(4, -5), `4x = ${M}20`, `Dans 4x = ${M}20, que vaut x ?`, [
    [`x = ${M}5`, `${M}20 ÷ 4 : les signes sont contraires, donc x est négatif : ${M}5.`],
    ['x = 5', `${M}20 est négatif et 4 est positif : les signes sont contraires, donc x est négatif.`],
    [`x = ${M}24`, `${M}24, c'est ${M}20 − 4 : tu as soustrait. On divise les deux membres par 4.`],
  ], 0)), { joinPrevious: true }),
  etapes(R3, verifier),
  lecon(small(eq3(3, 4), '3x = 12', 'Un élève a trouvé x = 9. On remplace : 3 × 9 = 27. Que conclut-on ?', [
    ['x = 9 est faux, car 27 n’est pas 12', 'Oui : en remplaçant, on devrait retrouver 12. Or 3 × 9 = 27. Le bon résultat est x = 4.'],
    ['x = 9 est juste', '3 × 9 = 27, et le membre de droite est 12. On ne retrouve pas le même nombre : x = 9 est faux.'],
    ['On ne peut pas savoir', 'Si : on remplace x, on calcule, et on compare avec le membre de droite. Ici 27 n’est pas 12.'],
  ], 0)),
  // Comparer deux cas : A de ce cours, B du cours « Ajouter ou retirer le même nombre »
  texted(decouverte(compareQ), {
    title: 'Comparer deux cas',
    intro: ['Voici deux équations qui se ressemblent. Regarde bien comment 3 est écrit à côté de x.'],
    mention: NOT_COUNTED_UNDERSTAND,
    compare: {
      a: { label: 'Équation A', latex: '3x = 12' },
      b: { label: 'Équation B', latex: 'x + 3 = 12' },
      note: 'L’équation B vient du cours précédent : tu sais déjà la résoudre. Ici, tu observes seulement ce qui change.',
      highlight: { a: toks(hl('3x'), ' = 12'), b: toks('x ', hl('+ 3'), ' = 12') },
      after: [
        'A : 3 multiplie x. On divise les deux membres par 3 : x = 4.',
        'B : 3 est ajouté à x. On retire 3 des deux côtés : x = 9.',
        'Ce qui change : une multiplication se défait en divisant, une addition en retirant.',
      ],
    },
  }),
  AUTRES,
  PRATIQUE,
  etapes('Exemple 1 sur 2', exemple1),
  texted(exemple(trou(eq3(-4, -5), 'x = \\square', -5)), {
    consigne: 'Tape ce qui manque dans la case, avec les touches du clavier.',
    above: ['-4x \\div (-4) = 20 \\div (-4)'],
    help: `Calcule 20 ÷ (${M}4) : les signes sont contraires, donc le résultat est négatif.`,
  }),
  texted(decouverte(signBox(eq3(6, -7), false, 'signe-oublie')), {
    consigne: 'Touche le signe du résultat.',
    intro: [`Cette fois, deux cases sont à toi. Pour 6x = ${M}42, x vaut ${M}42 ÷ 6. Trouve d'abord le signe du résultat, puis sa valeur.`],
    mention: '',
  }),
  texted(exemple(trou(eq3(6, -7), 'x = \\square', -7)), { above: ['6x \\div 6 = -42 \\div 6'], mention: '' }),
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
  lessonLength: parts.findIndex((p) => p.type === 'pratique'),
  unePhrase: true,
  endExercises: { count: 5, kind: 'saisie' },
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
