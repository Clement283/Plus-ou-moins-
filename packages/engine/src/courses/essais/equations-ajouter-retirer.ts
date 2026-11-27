// Cours 2 du module Équations et inéquations (déroulé guidé, 2026-11-26) : découverte, 3 règles, 2 petites questions,
// une comparaison utile (x + 3 = 7 contre x − 3 = 7), un exemple guidé (l'écran des exercices
// avec l'aide affichée d'office) puis les 5 exercices ligne par ligne. Pas de série de pratique, ni d'« autres façons de faire ».
// Fiche : docs/modules/02-equations-inequations/equations-ajouter-retirer.md
// L'exercice garde le calcul qui donne x (c − b) dans `expr` et la réponse x dans `answer` ; l'équation x + b = c est dans `meta`.
import { num, op, toLatex } from '../../math/expr';
import { applyOp } from '../../math/solve';
import { cst, equation, equationLatex, xt, type Equation } from '../../math/equation';
import type { Rng } from '../../rng';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, Level } from '../types';
import {
  NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, autres, buildErrors, choix, decouverte, draw, etapes, exemple,
  explanation, hl, is, lecon, linesScene, makeExercise, options3, pratique, redraw, small, step, texted, toks, toText, trou, trouOf, txt,
  type ErrorSpec,
} from '../calculs/shared';

const ID = 'equations-ajouter-retirer';
const RULE = 'Pour trouver x dans x + b = c, je retire (ou j’ajoute) le même nombre des deux côtés.';

// ——— Exercice : x + b = c (b de signe quelconque), x = c − b ———
type Range = [number, number];
const B_RANGE: Record<Level, Range> = { 1: [2, 9], 2: [10, 30], 3: [10, 99] };
const X_RANGE: Record<Level, Range> = { 1: [1, 9], 2: [1, 30], 3: [1, 99] };
const bc = (ex: Exercise): { b: number; c: number } => ex.meta as { b: number; c: number };
/** x + b = c ; x = c − b (b positif) ou c + |b| (b négatif). */
const mk = (level: Level, b: number, c: number): Exercise => ({
  ...makeExercise(ID, level, b > 0 ? op('-', num(c), num(b)) : op('+', num(c), num(-b))),
  meta: { b, c },
});
export const equationExercise = mk;
function generate(level: Level, rng: Rng): Exercise {
  return redraw(
    () => {
      const b = draw(rng, B_RANGE[level]) * (rng() < 0.5 ? -1 : 1);
      const x = draw(rng, X_RANGE[level]) * (level > 1 && rng() < 0.5 ? -1 : 1);
      return mk(level, b, x + b);
    },
    (ex) => bc(ex).c !== 0 && (ex.level > 1 || bc(ex).c > 0),
  );
}
const eqOf = (ex: Exercise): Equation => equation([xt(1), cst(bc(ex).b)], [cst(bc(ex).c)]);
const opLineOf = (ex: Exercise): string => equationLatex(applyOp(eqOf(ex), { k: 'add', v: -bc(ex).b }));
const xLine = (v: number): string => `x = ${toLatex(num(v))}`;
function resolution(ex: Exercise): string[] {
  return [equationLatex(eqOf(ex)), opLineOf(ex), xLine(ex.answer.n)];
}
/** Écriture en texte (− typographique) : « x + 3 = 7 ». */
const eqText = (ex: Exercise): string => equationLatex(eqOf(ex)).replace(/-/g, '−');

// ——— Erreurs reconnues ———
const RULE_1 = { n: 1, label: 'La balance', partIndex: 1 };
const RULE_2 = { n: 2, label: 'L’opération contraire', partIndex: 2 };
const RULE_3 = { n: 3, label: 'Calculer le membre de droite', partIndex: 4 };
const RULES: Record<string, NonNullable<ErrorDef['rule']>> = { 'un-seul-cote': RULE_1, 'mauvais-sens': RULE_2, 'signe-calcul': RULE_3 };
const abs = (ex: Exercise): number => Math.abs(bc(ex).b);
/** Signe de b dans x + b (« + » ou « − ») et le signe de l'opération contraire. */
const sgn = (ex: Exercise): string => (bc(ex).b > 0 ? '+' : '-');
const contrary = (ex: Exercise): string => (bc(ex).b > 0 ? '-' : '+');
const sens = (ex: Exercise): string => contrary(ex).replace('-', '−');
const rhs = (ex: Exercise): string => toLatex(num(bc(ex).c));
const lines3 = (ex: Exercise, middle: string, w: number): string[] => [equationLatex(eqOf(ex)), middle, xLine(w)];

const specs: ErrorSpec[] = [
  {
    id: 'un-seul-cote',
    family: 'calcul',
    detect: (ex, given) => is(given, bc(ex).c),
    text: (ex) => `Tu as changé seulement le membre de gauche. Ce qu’on fait à gauche, on le fait à droite : ${txt(bc(ex).c)} ${sens(ex)} ${abs(ex)} = ${txt(ex.answer.n)}.`,
    draw: (level, rng) => generate(level, rng),
    sample: (ex) => bc(ex).c,
    wrongLines: (ex, w) => (w === bc(ex).c ? lines3(ex, `x ${sgn(ex)} ${abs(ex)} ${contrary(ex)} ${abs(ex)} = ${rhs(ex)}`, w) : null),
  },
  {
    id: 'mauvais-sens',
    family: 'calcul',
    detect: (ex, given) => is(given, bc(ex).c + bc(ex).b),
    text: (ex) =>
      bc(ex).b > 0
        ? `Tu as ajouté ${abs(ex)} au lieu de le retirer. Dans x + ${abs(ex)}, le ${abs(ex)} s’ajoute à x : l’opération contraire est de retirer ${abs(ex)}.`
        : `Tu as retiré ${abs(ex)} au lieu de l’ajouter. Dans x − ${abs(ex)}, le ${abs(ex)} est retiré de x : l’opération contraire est d’ajouter ${abs(ex)}.`,
    draw: (level, rng) => generate(level, rng),
    sample: (ex) => bc(ex).c + bc(ex).b,
    wrongLines: (ex, w) =>
      w === bc(ex).c + bc(ex).b ? lines3(ex, `x ${sgn(ex)} ${abs(ex)} ${sgn(ex)} ${abs(ex)} = ${rhs(ex)} ${sgn(ex)} ${abs(ex)}`, w) : null,
  },
  {
    id: 'signe-calcul',
    family: 'signe',
    detect: (ex, given) => ex.answer.n !== 0 && is(given, -ex.answer.n),
    text: (ex) => `Le signe du résultat est faux : ${toText(ex.expr)} = ${txt(ex.answer.n)}. Regarde si tu passes de l’autre côté de 0.`,
    draw: (level, rng) => generate(level, rng),
    sample: (ex) => -ex.answer.n,
    wrongLines: (ex, w) => (w === -ex.answer.n ? lines3(ex, opLineOf(ex), w) : null),
  },
];
const errors: ErrorDef[] = buildErrors(specs, resolution).map((e): ErrorDef => ({ ...e, rule: RULES[e.id] as NonNullable<ErrorDef['rule']> }));

// ——— Questions faites à la main : l'équation est affichée, pas le calcul c − b ———
const saisieQ = (ex: Exercise): Question => ({ kind: 'saisie', ex, promptLatex: `${equationLatex(eqOf(ex))} \\quad\\text{donc}\\quad x = \\square` });
/** La ligne « opération » avec un trou : x + 3 − 3 = 7 − ▢. */
const opTrouQ = (ex: Exercise): Question =>
  trou(ex, `x ${sgn(ex)} ${abs(ex)} ${contrary(ex)} ${abs(ex)} = ${rhs(ex)} ${contrary(ex)} \\square`, abs(ex));
const customQuestion: CourseDef['customQuestion'] = (kind, ctx) => {
  const trap = errors.find((e) => e.id === ctx.trapErrorType);
  const ex = trap ? trap.trap(ctx.level, ctx.rng) : generate(ctx.level, ctx.rng);
  if (kind === 'resoudre') return { kind: 'resoudre', ex, start: eqOf(ex) };
  if (kind === 'trou') return opTrouQ(ex);
  return saisieQ(ex);
};

function feedbackText(q: Question, o: Outcome): string | null {
  if (o.correct || o.unfinished || o.errorFamily === 'ecriture' || q.kind !== 'saisie') return null;
  const spec = specs.find((s) => s.id === o.errorType);
  if (spec) return spec.text(q.ex);
  const a = abs(q.ex);
  return `Écris la ligne « opération » : x ${bc(q.ex).b > 0 ? '+' : '−'} ${a} ${sens(q.ex)} ${a} = ${txt(bc(q.ex).c)} ${sens(q.ex)} ${a}, puis calcule ${toText(q.ex.expr)}.`;
}

// ——— Leçon ———
const REGLE1 = '**Ce que je fais à gauche du signe =, je le fais aussi à droite.**';
const REGLE2 = '**Je fais l’opération contraire du nombre collé à x : je retire s’il s’ajoute, j’ajoute s’il est retiré.**';
const REGLE3 = '**Je calcule le membre de droite avec la règle des signes, puis j’écris x = …**';

const guess = choix(
  mk(1, 3, 7),
  'À ton avis, quel nombre cache x ?',
  options3(
    ['4', 'Oui : 4 + 3 = 7. On cherche le nombre qui, plus 3, fait 7.'],
    ['10', '10 + 3 = 13, pas 7. Ici, il faut trouver ce qui manque pour arriver à 7.'],
    ['7', '7 + 3 = 10, pas 7. Le 7 est le résultat de l’autre côté, ce n’est pas x.'],
  ),
  0,
  'x + 3 = 7',
);

const balance: EtapeStep[] = [
  step('Une équation est comme une **balance en équilibre** : à gauche x + 3, à droite 7.', { scene: linesScene(['x + 3 = 7']) }),
  step('Si je retire 3 à gauche, la balance penche. Pour garder l’équilibre, je retire aussi 3 du plateau de droite.', {
    scene: linesScene(['x + 3 = 7']),
    after: linesScene(['x + 3 = 7'], ['x + 3 ', hl('− 3'), ' = 7 ', hl('− 3')]),
    action: trouOf('Si je retire 3 à gauche, la balance penche. Pour garder l’équilibre, je retire aussi 3 [ ? ].', ['du plateau de droite', 'du plateau de gauche encore'], 0, {
      1: 'Retirer encore à gauche ne rééquilibre rien. Il faut toucher l’autre plateau, celui de droite.',
    }),
  }),
  step(undefined, { scene: linesScene(['x + 3 = 7'], ['x + 3 − 3 = 7 − 3']), rule: { n: 1, text: REGLE1 } }),
];

const contraire: EtapeStep[] = [
  step('Dans **x − 3 = 5**, le 3 est **retiré** de x. Pour le faire disparaître, on fait le contraire : on l’**ajoute**, des deux côtés.', {
    scene: linesScene(['x ', hl('− 3'), ' = 5']),
    after: linesScene(['x − 3 = 5'], ['x − 3 ', hl('+ 3'), ' = 5 ', hl('+ 3')]),
    action: trouOf('Pour faire disparaître − 3, il faut [ ? ] 3 des deux côtés.', ['ajouter', 'retirer'], 0, {
      1: 'Retirer 3 donnerait x − 6 : le 3 ne disparaît pas. Il faut faire le contraire de « − 3 ».',
    }),
  }),
  step(undefined, { scene: linesScene(['x − 3 = 5'], ['x − 3 + 3 = 5 + 3'], ['x = ', hl('8')]), rule: { n: 2, text: REGLE2 } }),
];

const calculer: EtapeStep[] = [
  step('Parfois le membre de droite est **plus petit** que le nombre retiré. Dans x + 9 = 4, on retire 9 des deux côtés : x = 4 − 9.', {
    scene: linesScene(['x + 9 = 4'], ['x + 9 − 9 = 4 − 9'], ['x = 4 − 9']),
  }),
  step('Je pars de 4 et je retire 9 : je passe de l’autre côté de 0, donc le résultat est négatif.', {
    scene: linesScene(['x + 9 = 4'], ['x + 9 − 9 = 4 − 9'], ['x = 4 − 9']),
    after: linesScene(['x + 9 − 9 = 4 − 9'], ['x = 4 − 9 = ', hl('−5')]),
    action: trouOf('Je pars de 4 et je retire 9 : je passe de l’autre côté de 0, donc le résultat est [ ? ].', ['négatif', 'positif'], 0, {
      1: 'Retirer 9 à partir de 4 dépasse 0 : on arrive du côté des négatifs.',
    }),
  }),
  step(undefined, { scene: linesScene(['x + 9 = 4'], ['x + 9 − 9 = 4 − 9'], ['x = ', hl('−5')]), rule: { n: 3, text: REGLE3 } }),
];

const exGuide = mk(1, 6, 2); // x + 6 = 2, x = −4

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Trouver le nombre caché',
    intro: ['Dans une équation, une lettre cache un nombre.', 'Ici, tu apprends à le trouver en gardant la balance en équilibre.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(RULE_1.label, balance),
  etapes(RULE_2.label, contraire),
  lecon(
    small(mk(1, -4, 9), 'x - 4 = 9', 'Quelle opération fait disparaître le − 4 ?', [
      ['Ajouter 4 des deux côtés', 'Oui : − 4 + 4 = 0, il reste x.'],
      ['Retirer 4 des deux côtés', 'Retirer 4 donnerait x − 8 : le 4 ne disparaît pas.'],
      ['Ajouter 4 à gauche seulement', 'Il faut le faire des deux côtés pour garder l’équilibre.'],
    ], 0),
  ),
  etapes(RULE_3.label, calculer),
  lecon(
    small(mk(2, 8, 3), 'x + 8 = 3', 'On retire 8 des deux côtés : x = 3 − 8. Combien vaut x ?', [
      ['−5', 'Oui : de 3, on recule de 8, on passe 0 et on arrive à −5.'],
      ['5', '5 serait 8 − 3. Ici on part de 3 et on retire 8 : le résultat est négatif.'],
      ['−11', 'On recule de 8 à partir de 3, pas de 11.'],
    ], 0),
  ),
  texted(
    decouverte(
      choix(
        mk(1, 3, 7),
        'Dans laquelle des deux équations ajoute-t-on 3 des deux côtés ?',
        options3(
          ['Dans B, x − 3 = 7', 'Oui : dans B, le 3 est retiré de x, on l’ajoute.'],
          ['Dans A, x + 3 = 7', 'Dans A, le 3 s’ajoute à x : on le retire.'],
          ['Dans les deux', 'Le signe devant le 3 change l’opération.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ['Regarde le signe devant le 3.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Équation A', latex: 'x + 3 = 7' },
        b: { label: 'Équation B', latex: 'x - 3 = 7' },
        note: '',
        inPlace: true,
        highlight: { a: toks('x ', hl('+ 3'), ' = 7'), b: toks('x ', hl('− 3'), ' = 7') },
        after: ['Dans A, on retire 3 : x = 7 − 3 = 4.', 'Dans B, on ajoute 3 : x = 7 + 3 = 10.'],
      },
    },
  ),
  texted(exemple({ kind: 'resoudre', ex: exGuide, start: eqOf(exGuide), guided: true }), {
    title: 'On le fait ensemble',
    subtitle: 'Résous x + 6 = 2. À chaque ligne, une aide te dit quoi faire.',
  }),
  annonceFin(),
];

export const equationsAjouterRetirer: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 2,
  title: 'Retirer ou ajouter le même nombre des deux côtés',
  shortTitle: 'Ajouter, retirer',
  rule: RULE,
  parts,
  // pas de série de pratique : la pastille s'arrête avant l'exemple guidé
  lessonLength: parts.findIndex((p) => p.type === 'question' && p.activity === 'exemple'),
  unePhrase: true,
  // « résoudre » : l'élève écrit ses lignes (décision du 2026-11-26) ; 3 formats pour que la révision garde 3 questions
  endExercises: { count: 5, kind: 'saisie', mix: ['resoudre', 'resoudre', 'resoudre', 'resoudre', 'resoudre'] },
  formats: ['saisie', 'resoudre', 'resoudre'],
  generate,
  errors,
  generalExplanation: (ex) => explanation(RULE, resolution(ex)),
  resolution,
  classes: SIGN_CLASSES,
  expectInteger: true,
  customQuestion,
  feedbackText,
  memo: {
    rule: RULE,
    ruleBullets: [
      'Ce que je fais à gauche du signe =, je le fais à droite.',
      'Je fais l’opération contraire du nombre collé à x.',
      'Je calcule le membre de droite avec la règle des signes.',
    ],
    examples: ['x + 3 = 7 ; x + 3 − 3 = 7 − 3 ; x = 4', 'x − 3 = 5 ; x − 3 + 3 = 5 + 3 ; x = 8'],
    mistake: { wrong: 'x + 3 − 3 = 7, donc x = 7', why: 'On a retiré 3 à gauche **seulement**. Il faut aussi le retirer à droite : x = 7 − 3 = 4.' },
    tip: 'Écris la ligne « opération » : x + 3 − 3 = 7 − 3, puis calcule.',
  },
};
