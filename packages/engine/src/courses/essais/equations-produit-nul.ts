// Cours 6 du module Équations et inéquations — « Équation produit nul » (déroulé guidé, 2026-11-26).
// La leçon utilise les écrans existants (phrases à trous, petites questions, comparaison). Les exercices de fin saisissent les DEUX
// solutions (question « solutions » : S = { ▢ ; ▢ }, exemple guidé compris) ou résolvent UN facteur (« À toi de résoudre » sur px + q = 0).
// La saisie d'une seule solution (« la plus petite » ou « la plus grande ») reste un format de révision.
// Fiche : docs/modules/02-equations-inequations/equations-produit-nul.md
// L'exercice garde la racine demandée, −q ÷ p, dans `expr` ; les deux facteurs (p, q, r, s) et la demande (ask) sont dans `meta`.
import { num, op } from '../../math/expr';
import { cst, equation, memberLatex, xt, type Equation } from '../../math/equation';
import { rat } from '../../math/rational';
import { solutionsQuestion } from '../../exercises/solutions';
import type { Rng } from '../../rng';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, Level } from '../types';
import {
  NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, buildErrors, choix, decouverte, draw, etapes, exemple, explanation,
  hl, is, lecon, linesScene, makeExercise, options3, redraw, small, step, texted, toks, trouOf, txt, type ErrorSpec,
} from '../calculs/shared';

const ID = 'equations-produit-nul';
const RULE = 'Un produit est nul si l’un de ses facteurs est nul : je résous chaque facteur égal à 0, et j’obtiens deux solutions.';

// ——— Exercice : (px + q)(rx + s) = 0, deux solutions entières distinctes ———
interface Params { p: number; q: number; r: number; s: number; ask: 'min' | 'max' }
const m = (ex: Exercise): Params => ex.meta as unknown as Params;
const roots = ({ p, q, r, s }: Params): [number, number] => [-q / p, -s / r];
const asked = (pr: Params): number => (pr.ask === 'min' ? Math.min(...roots(pr)) : Math.max(...roots(pr)));
/** Le facteur dont la racine est celle qu'on demande. */
const factorOf = (pr: Params): { a: number; b: number } => (roots(pr)[0] === asked(pr) ? { a: pr.p, b: pr.q } : { a: pr.r, b: pr.s });
const mk = (level: Level, p: number, q: number, r: number, s: number, ask: 'min' | 'max'): Exercise => {
  const pr = { p, q, r, s, ask };
  const f = factorOf(pr);
  return { ...makeExercise(ID, level, op('/', num(-f.b), num(f.a))), meta: pr as unknown as Record<string, unknown> };
};
const sgn = (rng: Rng, n: number): number => (rng() < 0.5 ? -n : n);
function generate(level: Level, rng: Rng): Exercise {
  return redraw(
    () => {
      const ask = rng() < 0.5 ? 'min' : 'max';
      let x1: number, x2: number, p: number, r: number;
      if (level === 1) {
        p = rng() < 0.5 ? 1 : 2; r = 1; // un coefficient 2 de temps en temps (sinon « oublier de diviser » n'existe pas au niveau 1)
        x1 = sgn(rng, draw(rng, [1, 9])); x2 = sgn(rng, draw(rng, [1, 9]));
      } else if (level === 2) {
        p = draw(rng, [2, 4]); r = 1;
        x1 = sgn(rng, draw(rng, [1, 6])); x2 = sgn(rng, draw(rng, [1, 9]));
      } else {
        p = draw(rng, [2, 5]); r = draw(rng, [2, 5]);
        x1 = sgn(rng, draw(rng, [1, 9])); x2 = sgn(rng, draw(rng, [1, 9]));
      }
      const swap = rng() < 0.5;
      return swap ? mk(level, r, -r * x2, p, -p * x1, ask) : mk(level, p, -p * x1, r, -r * x2, ask);
    },
    (ex) => roots(m(ex))[0] !== roots(m(ex))[1],
  );
}
const factorTex = (a: number, b: number): string => memberLatex([xt(a), cst(b)]);
const factorText = (a: number, b: number): string => factorTex(a, b).replace(/-/g, '−');
const productTex = (pr: Params): string => `(${factorTex(pr.p, pr.q)})(${factorTex(pr.r, pr.s)}) = 0`;
const productText = (pr: Params): string => `(${factorText(pr.p, pr.q)})(${factorText(pr.r, pr.s)}) = 0`;
const rootsTex = (pr: Params): string => `x = ${roots(pr)[0]} \\quad\\text{ou}\\quad x = ${roots(pr)[1]}`;
const resolution = (ex: Exercise): string[] => {
  const pr = m(ex);
  return [productTex(pr), `${factorTex(pr.p, pr.q)} = 0 \\quad\\text{ou}\\quad ${factorTex(pr.r, pr.s)} = 0`, rootsTex(pr)];
};
const askWord = (pr: Params): string => (pr.ask === 'min' ? 'petite' : 'grande');
const otherRoot = (pr: Params): number => roots(pr).find((x) => x !== asked(pr)) as number;

// ——— Erreurs reconnues ———
const NO = 1e9;
const RULE_1 = { n: 1, label: 'Un produit est nul', partIndex: 1 };
const RULE_2 = { n: 2, label: 'Un facteur égal à zéro', partIndex: 3 };
const RULE_3 = { n: 3, label: 'Deux solutions', partIndex: 5 };
const RULES: Record<string, NonNullable<ErrorDef['rule']>> = { 'signe-oublie': RULE_2, 'diviser-oublie': RULE_2, 'autre-solution': RULE_3 };
const redrawWhere = (ok: (ex: Exercise) => boolean) => (level: Level, rng: Rng): Exercise => redraw(() => generate(level, rng), ok);
const fac = (ex: Exercise) => factorOf(m(ex));

const specs: ErrorSpec[] = [
  {
    id: 'diviser-oublie',
    family: 'calcul',
    detect: (ex, given) => fac(ex).a !== 1 && is(given, -fac(ex).b),
    text: (ex) => {
      const { a, b } = fac(ex);
      return `Tu as oublié de diviser par ${a}. Dans ${factorText(a, b)} = 0, on arrive à ${a}x = ${txt(-b)}, donc x = ${txt(-b)} ÷ ${a} = ${txt(ex.answer.n)}.`;
    },
    draw: redrawWhere((ex) => fac(ex).a !== 1),
    sample: (ex) => (fac(ex).a !== 1 ? -fac(ex).b : NO),
  },
  {
    id: 'signe-oublie',
    family: 'signe',
    detect: (ex, given) => ex.answer.n !== 0 && is(given, -ex.answer.n),
    text: (ex) => {
      const { a, b } = fac(ex);
      return `Le signe est faux. Dans ${factorText(a, b)} = 0, on ${b > 0 ? 'retire' : 'ajoute'} ${Math.abs(b)} des deux côtés${a !== 1 ? `, puis on divise par ${a}` : ''} : x = ${txt(ex.answer.n)}.`;
    },
    draw: redrawWhere(() => true),
    sample: (ex) => -ex.answer.n,
  },
  {
    id: 'autre-solution',
    family: 'calcul',
    detect: (ex, given) => is(given, otherRoot(m(ex))),
    text: (ex) => {
      const pr = m(ex);
      const [x1, x2] = roots(pr);
      return `C’est l’autre solution. ${factorText(pr.p, pr.q)} = 0 donne x = ${txt(x1)}, et ${factorText(pr.r, pr.s)} = 0 donne x = ${txt(x2)} : on te demande la plus ${askWord(pr)}.`;
    },
    draw: redrawWhere(() => true),
    sample: (ex) => otherRoot(m(ex)),
  },
];
const numericErrors: ErrorDef[] = buildErrors(specs, resolution).map((x): ErrorDef => ({ ...x, rule: RULES[x.id] as NonNullable<ErrorDef['rule']> }));
/** Erreurs de la question « solutions » (ids de exercises/solutions.ts) : pas de valeur piège sur un nombre, la question les reconnaît elle-même. */
const solutionsError = (id: string, family: ErrorDef['family'], rule: NonNullable<ErrorDef['rule']>, text: (ex: Exercise) => string): ErrorDef => ({
  id,
  family,
  rule,
  detect: () => false,
  explain: (ex) => explanation(text(ex), resolution(ex)),
  trap: (level, rng) => generate(level, rng),
  wrongValues: () => [],
});
const errors: ErrorDef[] = [
  ...numericErrors,
  solutionsError('signe', 'signe', RULE_2, () => 'Pour chaque facteur, on retire ou on ajoute le nombre seul des deux côtés : x + 2 = 0 donne x = −2.'),
  solutionsError('valeur', 'calcul', RULE_2, () => 'Résous chaque facteur égal à 0 : une équation par facteur, en retirant le nombre seul puis en divisant.'),
  solutionsError('une-seule', 'calcul', RULE_3, () => 'Chaque facteur donne sa solution : il y a deux valeurs différentes à écrire.'),
];

// ——— Questions : le produit est affiché, on demande une solution ; « À toi de résoudre » pour un facteur ———
const saisieQ = (ex: Exercise): Question => ({
  kind: 'saisie',
  ex,
  promptLatex: `${productTex(m(ex))} \\quad\\text{la plus ${askWord(m(ex))} solution :}\\quad x = \\square`,
});
const factorEq = (ex: Exercise): Equation => equation([xt(fac(ex).a), cst(fac(ex).b)], [cst(0)]);
const solutionsQ = (ex: Exercise): Question =>
  solutionsQuestion(ex, [
    { a: m(ex).p, b: m(ex).q },
    { a: m(ex).r, b: m(ex).s },
  ]);
const customQuestion: CourseDef['customQuestion'] = (kind, ctx) => {
  const trap = errors.find((x) => x.id === ctx.trapErrorType);
  const ex = trap ? trap.trap(ctx.level, ctx.rng) : generate(ctx.level, ctx.rng);
  if (kind === 'resoudre') return { kind: 'resoudre', ex, start: factorEq(ex) };
  return kind === 'solutions' ? solutionsQ(ex) : saisieQ(ex);
};

const OTHER = (ex: Exercise): string => {
  const pr = m(ex);
  return `Pour ${productText(pr)} : un produit est nul si un facteur est nul. On résout ${factorText(pr.p, pr.q)} = 0 et ${factorText(pr.r, pr.s)} = 0 : x = ${txt(roots(pr)[0])} ou x = ${txt(roots(pr)[1])}.`;
};
function feedbackText(qu: Question, o: Outcome): string | null {
  if (o.correct || o.unfinished || o.errorFamily === 'ecriture' || qu.kind !== 'saisie') return null;
  const spec = specs.find((s) => s.id === o.errorType);
  if (spec) return spec.text(qu.ex);
  const g = Number(o.given.replace(/−/g, '-'));
  const found = Number.isInteger(g) ? specs.find((s) => s.detect(qu.ex, rat(g))) : undefined;
  return found ? found.text(qu.ex) : OTHER(qu.ex);
}

// ——— Leçon ———
const REGLE1 = '**Un produit est nul si l’un de ses facteurs est nul.**';
const REGLE2 = '**Je résous chaque facteur égal à 0 comme une équation ordinaire : x + 2 = 0 donne x = −2.**';
const REGLE3 = '**Chaque facteur donne une solution : j’écris les deux.**';

const guess = choix(
  mk(1, 1, 2, 1, -3, 'max'),
  'À ton avis, quel nombre rend ce produit égal à 0 ?',
  options3(
    ['3', 'Oui : (3 + 2)(3 − 3) = 5 × 0 = 0. Le cours explique pourquoi, et s’il y en a d’autres.'],
    ['2', '(2 + 2)(2 − 3) = 4 × (−1) = −4, pas 0. Le cours explique comment trouver les bons nombres.'],
    ['5', '(5 + 2)(5 − 3) = 7 × 2 = 14, pas 0. Le cours explique comment trouver les bons nombres.'],
  ),
  0,
  '(x + 2)(x - 3) = 0',
);

const produitNul: EtapeStep[] = [
  step('Les nombres qu’on multiplie s’appellent des **facteurs**. Un produit comme 5 × 0 ou 0 × 7 vaut toujours 0.', {
    scene: linesScene(['5 × ', hl('0'), ' = 0'], ['', hl('0'), ' × 7 = 0']),
  }),
  step('Dans 4 × B = 0, le facteur 4 n’est pas nul. Alors c’est l’autre facteur qui doit l’être.', {
    scene: linesScene(['4 × B = 0']),
    after: linesScene(['4 × B = 0'], ['4 × ', hl('0'), ' = 0']),
    action: trouOf('Dans 4 × B = 0, le facteur B vaut [ ? ].', ['0', '4'], 0, {
      1: '4 × 4 = 16, pas 0. Pour que le produit soit 0, il faut que B soit 0.',
    }),
  }),
  step(undefined, { scene: linesScene(['A × B = 0'], ['A = 0   ou   B = 0']), rule: { n: 1, text: REGLE1 } }),
];

const facteur: EtapeStep[] = [
  step('Dans **(x + 2)(x − 3) = 0**, les facteurs sont **x + 2** et **x − 3**. L’un des deux doit valoir 0.', {
    scene: linesScene(['(', hl('x + 2'), ')(x − 3) = 0']),
  }),
  step('Je prends le premier facteur : x + 2 = 0. Je cherche le nombre qui, plus 2, donne 0.', {
    scene: linesScene(['(x + 2)(x − 3) = 0']),
    after: linesScene(['(x + 2)(x − 3) = 0'], ['x + 2 = 0'], ['x = ', hl('−2')]),
    action: trouOf('Si x + 2 = 0, alors x vaut [ ? ].', ['−2', '2'], 0, {
      1: '2 + 2 = 4, pas 0. Il faut un nombre qui, plus 2, donne 0 : c’est −2.',
    }),
  }),
  step(undefined, { scene: linesScene(['x + 2 = 0'], ['x + 2 − 2 = 0 − 2'], ['x = −2']), rule: { n: 2, text: REGLE2 } }),
];

const deux: EtapeStep[] = [
  step('Le deuxième facteur compte aussi. Dans **(x − 1)(x + 4) = 0**, on résout chaque facteur.', {
    scene: linesScene(['(x − 1)(x + 4) = 0'], ['x − 1 = 0   ou   x + 4 = 0'], ['x = 1   ou   x = −4']),
  }),
  step('Chaque facteur peut valoir 0, donc on a une solution par facteur.', {
    scene: linesScene(['(x − 1)(x + 4) = 0'], ['x − 1 = 0   ou   x + 4 = 0']),
    after: linesScene(['x − 1 = 0   ou   x + 4 = 0'], ['', hl('x = 1'), '   ou   ', hl('x = −4')]),
    action: trouOf('Ce produit nul a [ ? ] solutions.', ['deux', 'une'], 0, {
      1: 'Chaque facteur donne une solution : x − 1 = 0 donne 1, et x + 4 = 0 donne −4. Il y en a deux.',
    }),
  }),
  step(undefined, { scene: linesScene(['x = 1   ou   x = −4'], ['S = {−4 ; 1}']), rule: { n: 3, text: REGLE3 } }),
];

const exGuide = mk(1, 3, 9, 1, -2, 'min'); // (3x + 9)(x − 2) = 0 ; facteur 3x + 9 = 0, x = −3

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Un produit égal à zéro',
    intro: ['Ici, deux parenthèses sont multipliées, et le résultat doit être 0.', 'Tu apprends à trouver les nombres qui conviennent.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(RULE_1.label, produitNul),
  texted(
    decouverte(
      choix(
        mk(1, 1, 2, 1, -3, 'max'),
        'Dans quelle équation peut-on dire qu’un des facteurs vaut 0 ?',
        options3(
          ['Dans A, le produit vaut 0', 'Oui : un produit qui vaut 0 a un facteur nul.'],
          ['Dans B, le produit vaut 6', 'Un produit de 6 ne dit rien d’un facteur seul : 2 × 3 = 6, et aucun n’est nul.'],
          ['Dans les deux', 'Cela ne marche que si le produit vaut 0.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ['Regarde le nombre à droite du signe =.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Équation A', latex: '(x + 2)(x - 3) = 0' },
        b: { label: 'Équation B', latex: '(x + 2)(x - 3) = 6' },
        note: '',
        inPlace: true,
        highlight: { a: toks('(x + 2)(x − 3) = ', hl('0')), b: toks('(x + 2)(x − 3) = ', hl('6')) },
        after: ['Dans A, un facteur vaut 0 : on résout chaque facteur.', 'Dans B, on ne peut rien dire d’un facteur seul.'],
      },
    },
  ),
  etapes(RULE_2.label, facteur),
  lecon(
    small(mk(1, 2, -8, 1, 5, 'max'), '2x − 8 = 0', 'Le facteur 2x − 8 vaut 0. Combien vaut x ?', [
      ['4', 'Oui : 2x = 8, donc x = 8 ÷ 2 = 4.'],
      ['8', 'Il reste 2x = 8 : il faut encore diviser par 2.'],
      ['−4', 'Le − 8 s’annule en ajoutant 8 : 2x = 8, donc x = 4, positif.'],
    ], 0),
  ),
  etapes(RULE_3.label, deux),
  lecon(
    small(mk(1, 1, -5, 1, 1, 'max'), '(x − 5)(x + 1) = 0', 'Quelles sont les solutions de (x − 5)(x + 1) = 0 ?', [
      ['5 et −1', 'Oui : x − 5 = 0 donne 5, et x + 1 = 0 donne −1.'],
      ['−5 et 1', 'Ce sont les contraires : x − 5 = 0 donne x = 5, pas −5.'],
      ['5 et 1', 'x + 1 = 0 donne x = −1 : le signe change.'],
    ], 0),
  ),
  texted(exemple({ ...(solutionsQ(exGuide) as Extract<Question, { kind: 'solutions' }>), guided: true as const }), {
    title: 'On le fait ensemble',
    subtitle: 'Résous (3x + 9)(x − 2) = 0 : une valeur pour chaque facteur. À chaque étape, une aide te dit quoi faire.',
  }),
  annonceFin(),
];

export const equationsProduitNul: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 6,
  title: 'Équation produit nul',
  shortTitle: 'Produit nul',
  rule: RULE,
  parts,
  // pas de série de pratique : la pastille s'arrête avant l'exemple guidé
  lessonLength: parts.findIndex((x) => x.type === 'question' && x.activity === 'exemple'),
  unePhrase: true,
  // les deux solutions (S = { ▢ ; ▢ }) en alternance avec la résolution d'un facteur
  endExercises: { count: 5, kind: 'saisie', mix: ['solutions', 'resoudre', 'solutions', 'resoudre', 'solutions'] },
  formats: ['saisie', 'resoudre', 'solutions'],
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
      'Un produit est nul si l’un de ses facteurs est nul.',
      'Je résous chaque facteur égal à 0 comme une équation ordinaire.',
      'Chaque facteur donne une solution : j’écris les deux.',
    ],
    examples: ['(x + 2)(x − 3) = 0 ; x + 2 = 0 ou x − 3 = 0 ; x = −2 ou x = 3', '(2x − 8)(x + 1) = 0 ; 2x = 8 ou x = −1 ; x = 4 ou x = −1'],
    mistake: { wrong: '(x + 2)(x − 3) = 0, donc x = 2', why: 'x + 2 = 0 se résout en **retirant 2** : x = −2, et non 2. L’autre facteur donne x = 3.' },
    tip: 'Écris chaque facteur égal à 0 sur sa propre ligne, puis résous-le.',
  },
};
