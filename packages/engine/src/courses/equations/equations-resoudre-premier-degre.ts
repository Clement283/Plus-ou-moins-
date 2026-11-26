// Cours 4 — Résoudre ax + b = c, déroulé guidé (2026-11-26). Fiche : docs/modules/02-equations-inequations/equations-resoudre-premier-degre.md.
import { rat } from '../../math/rational';
import type { Rng } from '../../rng';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, Level } from '../types';
import {
  M, NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, buildErrors, chance, choix, decouverte, draw, etapes,
  exemple, explanation, hl, intOf, is, lecon, linesScene, options3, redraw, small, step, texted, toks, trouOf,
} from '../calculs/shared';
import {
  EQ_MODULE_ID, coefText, latexOfEx, lin, lineQuestions, paramsOf, paren, parenL, resoudreQ, sgn, textOfEx,
} from './lineaire';

const ID = 'equations-resoudre-premier-degre';
const RULE = "Pour résoudre ax + b = c, j'enlève d'abord b des deux côtés, puis je divise les deux membres par a.";

// ——— Générateur : ax + b = c, x entier non nul, c jamais 0 ; le niveau agrandit a, b et x ———
type Range = [number, number];
const SPEC: Record<Level, { a: Range; b: Range; x: Range }> = {
  1: { a: [2, 5], b: [1, 9], x: [1, 9] },
  2: { a: [2, 9], b: [1, 20], x: [1, 12] },
  3: { a: [2, 12], b: [1, 30], x: [1, 15] },
};
function generate(level: Level, rng: Rng): Exercise {
  const s = SPEC[level];
  return redraw(
    () => {
      const a = (chance(rng, 0.25) ? -1 : 1) * draw(rng, s.a);
      const b = (chance(rng, 0.5) ? -1 : 1) * draw(rng, s.b);
      const x = (chance(rng, 0.5) ? -1 : 1) * draw(rng, s.x);
      return lin(ID, level, a, b, a * x + b);
    },
    (ex) => paramsOf(ex).c !== 0,
  );
}
/** ax + b = c avec a, b et x choisis : l'exemple d'un écran. */
const eq4 = (a: number, b: number, x: number): Exercise => lin(ID, 1, a, b, a * x + b);

const xOf = (ex: Exercise): number => intOf(ex.answer);
/** « on retire 3 » ou « on ajoute 4 » : ce qu'on fait pour enlever b. */
const removeText = (b: number): string => (b > 0 ? `on retire ${b}` : `on ajoute ${-b}`);
const opSign = (b: number): string => (b > 0 ? '-' : '+');

function resolution(ex: Exercise): string[] {
  const { a, b, c } = paramsOf(ex);
  const bb = Math.abs(b);
  return [
    latexOfEx(ex),
    `${a}x ${b > 0 ? '+' : '-'} ${bb} ${opSign(b)} ${bb} = ${c} ${opSign(b)} ${bb}`,
    `${a}x = ${c - b}`,
    `${a}x \\div ${parenL(a)} = ${c - b} \\div ${parenL(a)}`,
    `x = ${xOf(ex)}`,
  ];
}
const steps = (ex: Exercise): string => {
  const { a, b, c } = paramsOf(ex);
  return `${removeText(b)} des deux côtés : ${coefText(a)} = ${sgn(c - b)}, puis on divise les deux membres par ${paren(a)} : x = ${sgn(xOf(ex))}`;
};

// ——— Erreurs reconnues ———
const R1 = "D'abord, enlever b";
const R2 = 'Ensuite, diviser par a';
const R3 = 'Vérifier en remplaçant';
const RULES: Record<string, NonNullable<ErrorDef['rule']>> = {
  'oublier-diviser': { n: 2, label: R2, partIndex: 4 },
  'signe-b-garde': { n: 1, label: R1, partIndex: 1 },
  'diviser-avant': { n: 1, label: R1, partIndex: 1 },
  'signe-oublie': { n: 2, label: R2, partIndex: 4 },
};
/** Aucune réponse ne vaut ça : l'erreur ne s'applique pas à cette équation (division qui ne tombe pas juste). */
const NO = 1e9;
const whole = (n: number, d: number): number => (Number.isInteger(n / d) ? n / d : NO);
const errors: ErrorDef[] = buildErrors(
  [
    {
      id: 'oublier-diviser',
      family: 'calcul',
      detect: (ex, given) => is(given, paramsOf(ex).c - paramsOf(ex).b),
      text: (ex) => {
        const { a, b, c } = paramsOf(ex);
        return `Tu t'es arrêté à ${coefText(a)} = ${sgn(c - b)} : il reste à diviser les deux membres par ${paren(a)}. x = ${sgn(c - b)} ÷ ${paren(a)} = ${sgn(xOf(ex))}.`;
      },
      draw: (level, rng) => generate(level, rng),
      sample: (ex) => paramsOf(ex).c - paramsOf(ex).b,
    },
    {
      id: 'signe-b-garde',
      family: 'calcul',
      detect: (ex, given) => is(given, whole(paramsOf(ex).c + paramsOf(ex).b, paramsOf(ex).a)),
      text: (ex) => {
        const { a, b, c } = paramsOf(ex);
        return `On ${removeText(b).replace('on ', '')} des deux côtés : à droite, on calcule ${sgn(c)} ${b > 0 ? '−' : '+'} ${Math.abs(b)} = ${sgn(c - b)}, et non ${sgn(c)} ${b > 0 ? '+' : '−'} ${Math.abs(b)}. Puis on divise par ${paren(a)} : x = ${sgn(xOf(ex))}.`;
      },
      draw: (level, rng) =>
        redraw(() => generate(level, rng), (ex) => whole(paramsOf(ex).c + paramsOf(ex).b, paramsOf(ex).a) !== NO),
      sample: (ex) => whole(paramsOf(ex).c + paramsOf(ex).b, paramsOf(ex).a),
    },
    {
      id: 'diviser-avant',
      family: 'calcul',
      detect: (ex, given) => is(given, whole(paramsOf(ex).c, paramsOf(ex).a) === NO ? NO : whole(paramsOf(ex).c, paramsOf(ex).a) - paramsOf(ex).b),
      text: (ex) => {
        const { a, b, c } = paramsOf(ex);
        return `On ne divise pas un seul terme. D'abord on enlève ${sgn(b)} : ${coefText(a)} = ${sgn(c - b)}. Ensuite on divise tout le membre par ${paren(a)} : x = ${sgn(xOf(ex))}.`;
      },
      draw: (level, rng) => redraw(() => generate(level, rng), (ex) => whole(paramsOf(ex).c, paramsOf(ex).a) !== NO),
      sample: (ex) => (whole(paramsOf(ex).c, paramsOf(ex).a) === NO ? NO : whole(paramsOf(ex).c, paramsOf(ex).a) - paramsOf(ex).b),
    },
    {
      id: 'signe-oublie',
      family: 'signe',
      detect: (ex, given) => is(given, -xOf(ex)),
      text: (ex) => {
        const { a, b, c } = paramsOf(ex);
        const same = c - b < 0 === a < 0;
        return `Après avoir enlevé ${sgn(b)}, on divise ${sgn(c - b)} par ${paren(a)} : ${same ? 'les deux nombres ont le même signe, donc x est positif' : 'les signes sont contraires, donc x est négatif'}. Le bon résultat est x = ${sgn(xOf(ex))}.`;
      },
      draw: (level, rng) => redraw(() => generate(level, rng), (ex) => paramsOf(ex).a < 0 || paramsOf(ex).c - paramsOf(ex).b < 0),
      sample: (ex) => -xOf(ex),
    },
  ],
  resolution,
).map((e): ErrorDef => ({ ...e, rule: RULES[e.id] as NonNullable<ErrorDef['rule']> }));

// ——— Retours d'erreur des questions qui comptent (saisie de x, cases « x = ▢ » et « ax = ▢ ») ———
const OTHER = (ex: Exercise): string => `Pour résoudre ${textOfEx(ex)} : ${steps(ex)}.`;

function feedbackText(q: Question, o: Outcome): string | null {
  if (o.unfinished || o.errorFamily === 'ecriture' || o.correct) return null;
  if (q.kind === 'trou' && q.promptLatex !== 'x = \\square') {
    const { a, b, c } = paramsOf(q.ex);
    // la case « ax = ▢ » : le membre de droite après avoir enlevé b
    if (q.promptLatex !== `${a}x = \\square`) return null;
    return `On ${removeText(b).replace('on ', '')} des deux côtés. À droite : ${sgn(c)} ${b > 0 ? '−' : '+'} ${Math.abs(b)} = ${sgn(c - b)}.`;
  }
  if (q.kind !== 'saisie' && q.kind !== 'trou') return null;
  const g = Number(o.given.replace(/−/g, '-'));
  const e = Number.isInteger(g) ? errors.find((x) => x.detect(q.ex, rat(g))) : undefined;
  return e ? e.explain(q.ex).rule : OTHER(q.ex);
}

// ——— Leçon : 8 écrans avant l'annonce de la fin (déroulé guidé, 2026-11-26) ———
const REGLE1 = "**Je commence par enlever b des deux côtés : ax + b = c devient ax = c − b.**";
const REGLE2 = '**Ensuite, je divise les deux membres par a, avec son signe : x = (c − b) ÷ a.**';
const REGLE3 = '**Je vérifie : je remplace x par ma réponse dans l’équation de départ, et je dois retrouver le membre de droite.**';

// 0 — Accroche : une question pour deviner (ne compte pas)
const guess = choix(
  eq4(2, 3, 2),
  'Pour commencer, à ton avis : si 2x + 3 = 7, combien vaut x ?',
  options3(
    ['2', 'Bonne intuition : 2 × 2 + 3 = 7. Le cours va te montrer comment le trouver à coup sûr, même avec des nombres plus grands.'],
    ['5', "5, c'est 7 − 2. Mais 2x veut dire 2 × x, et 2 × 5 + 3 = 13. Le cours va t'expliquer quoi faire des deux côtés."],
    ['4', "4, c'est 7 − 3 : il reste une étape. 2 × 4 + 3 = 11, pas 7. Le cours va t'expliquer l'étape qui manque."],
  ),
  0,
  '2x + 3 = 7',
);

// 1 — Règle 1 : d'abord les jetons (reprise du cours « Retirer ou ajouter le même nombre des deux côtés »)
const idee: EtapeStep[] = [
  step('Sur la balance, 2x + 3 = 7 veut dire : **2 paquets de x et 3 jetons** pèsent 7.', {
    scene: linesScene(['2x ', hl('+ 3'), ' = 7']),
  }),
  step('Pour isoler les paquets, on enlève d’abord les 3 jetons, comme dans le cours précédent. On le fait **des deux côtés**, sinon la balance penche.', {
    scene: linesScene(['2x + 3 = 7']),
    after: linesScene(['2x + 3 = 7'], [hl('2x + 3 − 3 = 7 − 3')]),
    action: trouOf('On enlève les 3 jetons [ ? ].', ['des deux côtés', 'à gauche seulement', 'à droite seulement'], 0, {
      1: 'Si on enlève 3 à gauche seulement, la gauche devient plus légère : la balance penche. Ce qu’on fait d’un côté, on le fait de l’autre.',
      2: 'Si on enlève 3 à droite seulement, la droite devient plus légère : la balance penche. Ce qu’on fait d’un côté, on le fait de l’autre.',
    }),
  }),
  step(undefined, {
    scene: linesScene(['2x + 3 = 7'], ['2x + 3 − 3 = 7 − 3'], ['2x = 4']),
    rule: { n: 1, text: REGLE1 },
  }),
];

// 4 — Règle 2 : ensuite, on divise par a (reprise du cours « Diviser des deux côtés »)
const regle2: EtapeStep[] = [
  step('Il reste **2x = 4**. C’est une équation du cours « Diviser des deux côtés ».', {
    scene: linesScene(['2x + 3 − 3 = 7 − 3'], ['2x = 4']),
  }),
  step('Pour trouver un seul x, on divise les deux membres par **le nombre devant x**.', {
    scene: linesScene(['2x = 4']),
    after: linesScene(['2x = 4'], [hl('2x ÷ 2 = 4 ÷ 2')]),
    action: trouOf('2x = 4 : on divise les deux membres par [ ? ].', ['2', '4', '3'], 0, {
      1: '4 est le nombre de droite. On divise par le nombre qui multiplie x : dans 2x, c’est 2.',
      2: '3 est le nombre qu’on a déjà enlevé à la première ligne. On divise par le nombre qui multiplie x : dans 2x, c’est 2.',
    }),
  }),
  step(undefined, {
    scene: linesScene(['2x + 3 = 7'], ['2x = 4'], ['2x ÷ 2 = 4 ÷ 2'], ['x = 2']),
    rule: { n: 2, text: REGLE2 },
  }),
];

// 6 — Règle 3 : vérifier en remplaçant (reprise du cours « Tester si un nombre est solution »), cas nouveau : résultat négatif
const verifier: EtapeStep[] = [
  step(`Pour 4x + 5 = ${M}7, on a trouvé x = ${M}3. Pour être sûr, on **remplace x** par ${M}3 dans l’équation de départ.`, {
    scene: linesScene([`4x + 5 = ${M}7`], [`x = ${M}3`]),
  }),
  step(`À gauche, 4 × (${M}3) + 5 : on doit retrouver ${M}7, le membre de droite.`, {
    scene: linesScene([`4x + 5 = ${M}7`], [`4 × (${M}3) + 5 = ?`]),
    after: linesScene([`4x + 5 = ${M}7`], [`4 × (${M}3) + 5 = ${M}12 + 5 = `, hl(`${M}7`)]),
    action: trouOf(`4 × (${M}3) + 5 = [ ? ].`, [`${M}7`, '17', `${M}17`], 0, {
      1: `17, c'est ${M}12 + 5 avec le mauvais signe. 4 × (${M}3) = ${M}12, puis ${M}12 + 5 : le plus grand sans le signe, 12, gagne, donc ${M}7.`,
      2: `${M}17, c'est ${M}12 − 5. Ici on ajoute 5 : ${M}12 + 5 = ${M}7.`,
    }),
  }),
  step(undefined, {
    scene: linesScene([`4 × (${M}3) + 5 = ${M}7`], ['On retrouve le membre de droite.']),
    rule: { n: 3, text: REGLE3 },
  }),
];

// Comparer deux cas : le signe de b change l'opération (retirer 3, ou ajouter 3), donc le résultat
const compareQ = choix(
  eq4(2, 3, 4),
  'Dans laquelle des deux équations ajoute-t-on 3 des deux côtés ?',
  options3(
    ['Dans B, 2x − 3 = 11', 'Oui : dans B, le 3 est retiré de 2x, on l’ajoute.'],
    ['Dans A, 2x + 3 = 11', 'Dans A, le 3 s’ajoute à 2x : on le retire.'],
    ['Dans les deux', 'Le signe devant le 3 change l’opération.'],
  ),
  0,
);

const exGuide = eq4(-3, 4, 5); // −3x + 4 = −11, x = 5

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Résoudre ax + b = c',
    intro: ['Dans 2x + 3 = 7, il y a **deux choses** du côté de x : 2x et + 3.', 'Dans ce cours, tu apprends dans quel ordre les enlever, **une ligne pour chaque opération**.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(R1, idee),
  lecon(
    small(eq4(5, 2, 3), '5x + 2 = 17', 'Dans 5x + 2 = 17, que fait-on en premier, des deux côtés ?', [
      ['On retire 2', 'Oui : on enlève d’abord le nombre seul, 2. À droite, 17 − 2 = 15, et 5x = 15.'],
      ['On divise par 5', 'Pas encore : 5 divise seulement 5x, pas le + 2. On enlève d’abord le 2, ensuite on divise.'],
      ['On retire 5', '5 multiplie x, il ne s’enlève pas. On enlève le nombre seul, 2, puis on divise par 5.'],
    ], 0),
  ),
  texted(
    decouverte(compareQ),
    {
      title: 'Comparer deux cas',
      intro: ['Regarde le signe devant le 3.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Équation A', latex: '2x + 3 = 11' },
        b: { label: 'Équation B', latex: '2x - 3 = 11' },
        note: '',
        inPlace: true,
        highlight: { a: toks('2x ', hl('+ 3'), ' = 11'), b: toks('2x ', hl('− 3'), ' = 11') },
        after: ['Dans A, on retire 3 : 2x = 8, puis x = 4.', 'Dans B, on ajoute 3 : 2x = 14, puis x = 7.'],
      },
    },
  ),
  etapes(R2, regle2),
  lecon(
    small(eq4(-2, 4, -3), `${M}2x + 4 = 10`, `Dans ${M}2x + 4 = 10, on trouve ${M}2x = 6. Que vaut x ?`, [
      [`x = ${M}3`, `6 ÷ (${M}2) : les signes sont contraires, donc x est négatif : ${M}3.`],
      ['x = 3', `3 a le bon chiffre, mais on divise par ${M}2 : les signes sont contraires, donc x est négatif.`],
      ['x = 6', `${M}2x = 6 : il reste à diviser les deux membres par ${M}2.`],
    ], 0),
  ),
  etapes(R3, verifier),
  texted(exemple({ ...resoudreQ(exGuide), guided: true } as Question), {
    title: 'On le fait ensemble',
    subtitle: `Résous ${M}3x + 4 = ${M}11. À chaque ligne, une aide te dit quoi faire.`,
  }),
  annonceFin(),
];

export const equationsResoudrePremierDegre: CourseDef = {
  id: ID,
  moduleId: EQ_MODULE_ID,
  order: 4,
  title: 'Résoudre ax + b = c',
  shortTitle: 'ax + b = c',
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
      "J'enlève b des deux côtés : ax + b = c devient ax = c − b.",
      'Je divise les deux membres par a, avec son signe.',
      'Je vérifie en remplaçant x dans l’équation de départ.',
    ],
    examples: [
      `3x ${M} 4 = 11 : 3x ${M} 4 + 4 = 11 + 4, puis 3x = 15, donc x = 5`,
      '2x + 3 = 7 : 2x + 3 − 3 = 7 − 3, puis 2x = 4, donc x = 2',
    ],
    mistake: {
      wrong: '2x + 3 = 7, donc 2x = 7 + 3 = 10',
      why: '**Enlever 3 des deux côtés**, c’est faire 7 − 3 à droite, pas 7 + 3 : ce qu’on fait à gauche, on le fait à droite.',
    },
    tip: 'Une opération par ligne : d’abord enlever b, ensuite diviser par a, puis vérifier.',
  },
};
