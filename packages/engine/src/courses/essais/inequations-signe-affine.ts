// Cours 9 du module Équations et inéquations (déroulé guidé) : le signe de ax + b, premier cours à tableau de signes.
// Découverte (signe de 2x − 6 en 0 et en 5), 3 règles (valeur qui annule, signe de a à droite, signe contraire à gauche),
// 2 petites questions, une comparaison utile (2x − 6 contre −2x + 6), un exemple guidé (3x + 9, tableau complet)
// puis 5 exercices en question « tableau » (valeur, ligne, signes).
// Fiche : docs/modules/02-equations-inequations/inequations-signe-affine.md
// L'exercice garde la valeur qui annule −b/a dans `expr` et `answer` ; le facteur ax + b est dans `meta` ({ a, b }).
import { num, op } from '../../math/expr';
import { factorLatex, factorText, rootText } from '../../math/tableau';
import { rat, type Rational } from '../../math/rational';
import type { Rng } from '../../rng';
import { tableauQuestion } from '../../exercises/tableau';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, Level } from '../types';
import {
  NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, chance, choix, decouverte, draw, etapes, exemple, explanation,
  hl, is, lecon, linesScene, options3, redraw, small, step, texted, toks, trouOf,
} from '../calculs/shared';

const ID = 'inequations-signe-affine';
const RULE = 'ax + b s’annule en −b/a ; à droite de cette valeur il a le signe de a, à gauche le signe contraire.';

// ——— Exercice : le facteur ax + b ; le niveau 1 a une racine entière, les autres une racine rationnelle possible ———
type Range = [number, number];
const SPEC: Record<Level, { a: Range; b: Range; x: Range }> = {
  1: { a: [1, 5], b: [1, 9], x: [1, 9] },
  2: { a: [2, 5], b: [1, 12], x: [1, 9] },
  3: { a: [2, 9], b: [1, 30], x: [1, 9] },
};
type Meta = { a: number; b: number };
const meta = (ex: Exercise): Meta => ex.meta as unknown as Meta;
const mk = (level: Level, a: number, b: number): Exercise => ({
  courseId: ID,
  level,
  expr: op('/', num(-b), num(a)),
  answer: rat(-b, a),
  meta: { a, b } as unknown as Record<string, unknown>,
});
const sign = (rng: Rng): number => (chance(rng, 0.5) ? -1 : 1);
function generate(level: Level, rng: Rng): Exercise {
  const s = SPEC[level];
  const a = sign(rng) * draw(rng, s.a);
  // niveau 1 : b = −a·x, la valeur est entière ; sinon b libre (non nul), la valeur peut être une fraction
  return level === 1 ? mk(level, a, -a * sign(rng) * draw(rng, s.x)) : mk(level, a, sign(rng) * draw(rng, s.b));
}
const isInt = (r: Rational): boolean => r.d === 1;
/** Un exercice à valeur entière (la saisie de la valeur ne prend que des entiers). */
const generateInt = (level: Level, rng: Rng): Exercise => redraw(() => generate(level, rng), (ex) => isInt(ex.answer));
const factorOf = (ex: Exercise) => ({ a: meta(ex).a, b: meta(ex).b });
const rootLatex = (r: Rational): string => (r.d === 1 ? `${r.n}` : `${r.n < 0 ? '-' : ''}\\frac{${Math.abs(r.n)}}{${r.d}}`);
const resolution = (ex: Exercise): string[] => [
  `${factorLatex(factorOf(ex))} = 0`,
  `${meta(ex).a}x = ${-meta(ex).b}`,
  `x = ${rootLatex(ex.answer)}`,
];

// ——— Erreurs reconnues : celles du tableau (math/tableau.ts) pour un facteur seul ; la valeur se détecte aussi sur un nombre ———
const RULE_1 = { n: 1, label: 'La valeur qui annule', partIndex: 1 };
const RULE_2 = { n: 2, label: 'Le signe à droite', partIndex: 2 };
type Rule = NonNullable<ErrorDef['rule']>;
const VALEUR = (ex: Exercise): string =>
  `${factorText(factorOf(ex))} s’annule quand ${factorText(factorOf(ex))} = 0 : on résout cette équation, x = ${rootText(ex.answer)}.`;
const error = (id: string, family: ErrorDef['family'], rule: Rule, explainText: (ex: Exercise) => string, wrong?: (ex: Exercise) => number): ErrorDef => {
  const usable = (ex: Exercise): boolean => wrong !== undefined && isInt(ex.answer) && wrong(ex) !== ex.answer.n;
  return {
    id,
    family,
    rule,
    detect: (ex, given) => (wrong ? is(given, wrong(ex)) : false),
    explain: (ex) => explanation(explainText(ex), resolution(ex)),
    trap: (level, rng) => (wrong ? redraw(() => generateInt(level, rng), usable) : generate(level, rng)),
    wrongValues: (ex) => (wrong && usable(ex) ? [rat(wrong(ex))] : []),
  };
};
const errors: ErrorDef[] = [
  error('valeurs', 'calcul', RULE_1, VALEUR, (ex) => meta(ex).b),
  error('lignes-facteurs', 'ecriture', RULE_1, () => 'La ligne du tableau porte le facteur de l’énoncé, écrit tel quel.'),
  error('zero-oublie', 'ecriture', RULE_1, () => 'Sous la valeur qui annule le facteur, on écrit 0.'),
  error('zero-en-trop', 'ecriture', RULE_1, () => 'On met 0 seulement sous la valeur qui annule le facteur.'),
  error('signe-facteur', 'signe', RULE_2, () => 'À droite de la valeur, ax + b a le signe de a ; à gauche, le signe contraire.'),
];

// ——— Questions faites à la main ———
const saisieQ = (ex: Exercise): Question => ({
  kind: 'saisie',
  ex,
  promptLatex: `${factorLatex(factorOf(ex))} = 0 \\quad\\text{donc}\\quad x = \\square`,
});
const tableauQ = (ex: Exercise): Question => tableauQuestion(ex, 'seul', [factorOf(ex)], { valeurs: true, lignes: true });
const customQuestion: CourseDef['customQuestion'] = (kind, ctx) => {
  const trap = errors.find((e) => e.id === ctx.trapErrorType);
  if (kind === 'tableau') return tableauQ(trap ? trap.trap(ctx.level, ctx.rng) : generate(ctx.level, ctx.rng));
  return saisieQ(trap ? trap.trap(ctx.level, ctx.rng) : generateInt(ctx.level, ctx.rng));
};

function feedbackText(q: Question, o: Outcome): string | null {
  if (o.correct || o.unfinished || o.errorFamily === 'ecriture' || q.kind !== 'saisie') return null;
  if (o.errorType === 'valeurs') return VALEUR(q.ex);
  return `Résous ${factorText(factorOf(q.ex))} = 0 : x = ${rootText(q.ex.answer)}.`;
}

// ——— Leçon ———
const REGLE1 = '**La valeur qui annule ax + b est la solution de ax + b = 0 : x = −b ÷ a.**';
const REGLE2 = '**À droite de la valeur qui annule, ax + b a le signe de a.**';
const REGLE3 = '**À gauche de la valeur qui annule, ax + b a le signe contraire de a.**';

const guess = choix(
  mk(1, 2, -6),
  'Pour x = 0, puis pour x = 5, quel est le signe de 2x − 6 ?',
  options3(
    ['Négatif pour x = 0, positif pour x = 5', 'Oui : 2 × 0 − 6 = −6 et 2 × 5 − 6 = 4. Le signe change quelque part entre 0 et 5.'],
    ['Positif dans les deux cas', '2 × 0 − 6 = −6 : c’est négatif pour x = 0.'],
    ['Négatif dans les deux cas', '2 × 5 − 6 = 4 : c’est positif pour x = 5.'],
  ),
  0,
  '2x - 6',
);

const valeur: EtapeStep[] = [
  step('Le signe de **2x − 6** change là où l’expression vaut 0. On cherche cette valeur de x : c’est la solution de 2x − 6 = 0.', {
    scene: linesScene(['2x − 6 = 0']),
  }),
  step('On résout comme au cours 4 : on ajoute 6 des deux côtés, puis on divise par 2. On trouve x = [ ? ].', {
    scene: linesScene(['2x − 6 = 0'], ['2x = 6']),
    after: linesScene(['2x − 6 = 0'], ['2x = 6'], ['x = ', hl('3')]),
    action: trouOf('On résout comme au cours 4 : on ajoute 6 des deux côtés, puis on divise par 2. On trouve x = [ ? ].', ['3', '−3', '6'], 0, {
      1: '2 × (−3) − 6 = −12, pas 0. On ajoute 6 des deux côtés : 2x = 6.',
      2: '2x = 6 : il reste à diviser par 2.',
    }),
  }),
  step(undefined, { scene: linesScene(['−x + 4 = 0'], ['x = ', hl('4')]), rule: { n: 1, text: REGLE1 } }),
];

const droite: EtapeStep[] = [
  step('Au cours précédent, on résout 2x − 6 ≥ 0 : 2x ≥ 6, puis x ≥ 3, en divisant par 2, un nombre positif.', {
    scene: linesScene(['2x − 6 ≥ 0'], ['2x ≥ 6'], ['x ≥ 3']),
  }),
  step('Donc pour x plus grand que 3, 2x − 6 est [ ? ] : son signe est celui de 2.', {
    scene: linesScene(['2x − 6 ≥ 0'], ['x ≥ 3']),
    after: linesScene(['x > 3 donne 2x − 6 ', hl('> 0')]),
    action: trouOf('Donc pour x plus grand que 3, 2x − 6 est [ ? ] : son signe est celui de 2.', ['positif', 'négatif'], 0, {
      1: 'x ≥ 3 est la solution de 2x − 6 ≥ 0 : ces valeurs rendent 2x − 6 positif ou nul.',
    }),
  }),
  step(undefined, { scene: linesScene(['−x + 4 ≥ 0'], ['−x ≥ −4'], ['x ≤ 4'], ['À droite de 4 : signe ', hl('−'), ', celui de a = −1']), rule: { n: 2, text: REGLE2 } }),
];

const gauche: EtapeStep[] = [
  step('Dans 2x − 6, essayons x = 0, à **gauche** de 3 : 2 × 0 − 6 = −6.', {
    scene: linesScene(['x = 0 : 2 × 0 − 6 = ', hl('−6')]),
  }),
  step('Pour x = 0, on trouve −6 : le signe est [ ? ] de celui de a = 2.', {
    scene: linesScene(['x = 0 : 2 × 0 − 6 = −6']),
    after: linesScene(['x = 0 : 2 × 0 − 6 = −6'], ['a = 2 est +, et −6 est ', hl('−')]),
    action: trouOf('Pour x = 0, on trouve −6 : le signe est [ ? ] de celui de a = 2.', ['contraire', 'pareil'], 0, {
      1: 'a = 2 est positif, mais −6 est négatif : les signes sont contraires.',
    }),
  }),
  step(undefined, { scene: linesScene(['−x + 4 : x = 4 donne 0'], ['x = 0 : −0 + 4 = 4'], ['À gauche de 4 : signe ', hl('+'), ', contraire de a = −1']), rule: { n: 3, text: REGLE3 } }),
];

const exGuide = mk(1, 3, 9); // 3x + 9, valeur −3

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Un signe qui change',
    intro: ['Le signe d’une expression comme 2x − 6 dépend de x.', 'On cherche où il change, et dans quel sens.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(RULE_1.label, valeur),
  etapes(RULE_2.label, droite),
  lecon(
    small(mk(1, -3, 6), '-3x + 6', 'Elle s’annule en 2. Pour x = 5, à droite de 2, quel est le signe de −3x + 6 ?', [
      ['Négatif', 'Oui : à droite, le signe de a = −3. Et −3 × 5 + 6 = −9.'],
      ['Positif', 'Positif serait le signe de a si a était positif. Ici a = −3 est négatif.'],
      ['Nul', 'Il n’est nul qu’en x = 2, pas en x = 5.'],
    ], 0),
  ),
  etapes('Le signe à gauche', gauche),
  lecon(
    small(mk(1, 4, 8), '4x + 8', 'Elle s’annule en −2. Pour x = −5, à gauche de −2, quel est le signe de 4x + 8 ?', [
      ['Négatif', 'Oui : à gauche, le signe contraire de a = 4. Et 4 × (−5) + 8 = −12.'],
      ['Positif', 'Positif est le signe de a, mais à gauche c’est le signe contraire.'],
      ['Nul', 'Il n’est nul qu’en x = −2, pas en x = −5.'],
    ], 0),
  ),
  texted(
    decouverte(
      choix(
        mk(1, 2, -6),
        'Dans laquelle des deux expressions est-on positif à droite de 3 ?',
        options3(
          ['Dans A, 2x − 6', 'Oui : dans A, a = 2 est positif, donc positif à droite de 3.'],
          ['Dans B, −2x + 6', 'Dans B, a = −2 est négatif : à droite de 3, c’est négatif.'],
          ['Dans les deux', 'Le signe devant le 2 change tout : il inverse les deux côtés.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ['Les deux s’annulent en 3. Regarde le signe de a.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Expression A', latex: '2x - 6' },
        b: { label: 'Expression B', latex: '-2x + 6' },
        note: '',
        inPlace: true,
        highlight: { a: toks(hl('2'), 'x − 6'), b: toks(hl('−2'), 'x + 6') },
        after: ['Dans A, a = 2 est positif : − à gauche de 3, + à droite.', 'Dans B, a = −2 est négatif : + à gauche de 3, − à droite.'],
      },
    },
  ),
  texted(exemple({ ...tableauQuestion(exGuide, 'seul', [factorOf(exGuide)], { valeurs: true, lignes: true }), guided: true as const }), {
    title: 'On le fait ensemble',
    subtitle: 'Construis le tableau de signes de 3x + 9. À chaque étape, une aide te dit quoi faire.',
  }),
  annonceFin(),
];

export const inequationsSigneAffine: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 9,
  title: 'Le signe de ax + b',
  shortTitle: 'Signe de ax + b',
  rule: RULE,
  parts,
  // pas de série de pratique : la pastille s'arrête avant l'exemple guidé
  lessonLength: parts.findIndex((p) => p.type === 'question' && p.activity === 'exemple'),
  unePhrase: true,
  // « tableau » : l'élève construit la valeur, la ligne et les signes (5 fois, tableau complet)
  endExercises: { count: 5, kind: 'saisie', mix: ['tableau', 'tableau', 'tableau', 'tableau', 'tableau'] },
  formats: ['saisie', 'tableau', 'tableau'],
  generate,
  errors,
  generalExplanation: (ex) => explanation(RULE, resolution(ex)),
  resolution,
  classes: SIGN_CLASSES,
  expectInteger: false,
  customQuestion,
  feedbackText,
  memo: {
    rule: RULE,
    ruleBullets: [
      'La valeur qui annule ax + b : je résous ax + b = 0, x = −b ÷ a.',
      'À droite de cette valeur, ax + b a le signe de a.',
      'À gauche, il a le signe contraire.',
    ],
    examples: ['2x − 6 : s’annule en 3 ; signes − 0 +', '−x + 4 : s’annule en 4 ; signes + 0 −'],
    mistake: { wrong: '2x − 6 s’annule en −3', why: 'On résout 2x − 6 = 0 : on **ajoute** 6, 2x = 6, donc x = 3.' },
    tip: 'Essaie un nombre de chaque côté de la valeur : le signe du résultat te le confirme.',
  },
};
