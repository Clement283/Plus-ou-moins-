// Cours 10 du module Équations et inéquations (déroulé guidé) : tableau de signes d'un produit, puis lecture de S.
// Découverte (signe de (x − 2)(x + 1) en 0), 3 règles (valeurs et lignes, règle des signes par colonne, lecture de S),
// 2 petites questions, une comparaison utile (≥ 0 contre ≤ 0), un exemple guidé (tableau complet de (3x + 6)(x − 4))
// puis 5 exercices : tableau, S, tableau, S, S.
// Fiche : docs/modules/02-equations-inequations/inequations-tableau-signes-produit.md
// L'exercice garde la plus petite valeur qui annule le produit dans `expr` et `answer` ; les facteurs sont dans `meta` ({ f1, f2 }).
import { num, op } from '../../math/expr';
import { type Factor, factorLatex, factorRoot, factorText, rootText, wholeLatex } from '../../math/tableau';
import { eqRat, type Rational, rat } from '../../math/rational';
import type { Rng } from '../../rng';
import { intervalleFromTable, type Strict } from '../../exercises/intervalle';
import { tableauQuestion } from '../../exercises/tableau';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, Level } from '../types';
import {
  NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, chance, choix, decouverte, draw, etapes, exemple, explanation,
  hl, is, lecon, linesScene, options3, redraw, small, step, texted, toks, trouOf,
} from '../calculs/shared';

const ID = 'inequations-tableau-signes-produit';
const RULE = 'Une ligne par facteur, puis la règle des signes colonne par colonne (un facteur nul rend le produit nul), puis on lit S.';

// ——— Exercice : (a1 x + b1)(a2 x + b2), deux valeurs distinctes ———
type Range = [number, number];
type Meta = { f1: Factor; f2: Factor };
const meta = (ex: Exercise): Meta => ex.meta as unknown as Meta;
const factorsOf = (ex: Exercise): Factor[] => [meta(ex).f1, meta(ex).f2];
const smallest = (f: Factor[]): Factor => (factorRoot(f[0]!).n * factorRoot(f[1]!).d <= factorRoot(f[1]!).n * factorRoot(f[0]!).d ? f[0]! : f[1]!);
const mk = (level: Level, f1: Factor, f2: Factor): Exercise => {
  const s = smallest([f1, f2]);
  return {
    courseId: ID,
    level,
    expr: op('/', num(-s.b), num(s.a)),
    answer: factorRoot(s),
    meta: { f1, f2 } as unknown as Record<string, unknown>,
  };
};
const sgn = (rng: Rng): number => (chance(rng, 0.5) ? -1 : 1);
const aOf = (level: Level, rng: Rng): number =>
  level === 1 ? (chance(rng, 0.75) ? 1 : 2) * sgn(rng) : level === 2 ? draw(rng, [1, 4]) * sgn(rng) : draw(rng, [2, 5]) * sgn(rng);
const ROOT: Record<Level, Range> = { 1: [1, 6], 2: [1, 9], 3: [1, 9] };
function generate(level: Level, rng: Rng): Exercise {
  return redraw(
    () => {
      const mkF = (): Factor => {
        const a = aOf(level, rng);
        return level < 3 ? { a, b: -a * sgn(rng) * draw(rng, ROOT[level]) } : { a, b: sgn(rng) * draw(rng, [1, 12]) };
      };
      return mk(level, mkF(), mkF());
    },
    (ex) => !eqRat(factorRoot(meta(ex).f1), factorRoot(meta(ex).f2)),
  );
}
const isInt = (r: Rational): boolean => r.d === 1;
const generateInt = (level: Level, rng: Rng): Exercise => redraw(() => generate(level, rng), (ex) => isInt(factorRoot(meta(ex).f1)) && isInt(factorRoot(meta(ex).f2)));
const smallestFactor = (ex: Exercise): Factor => smallest(factorsOf(ex));
const rootLatex = (r: Rational): string => (r.d === 1 ? `${r.n}` : `${r.n < 0 ? '-' : ''}\\frac{${Math.abs(r.n)}}{${r.d}}`);
const resolution = (ex: Exercise): string[] => {
  const [f, g] = factorsOf(ex) as [Factor, Factor];
  return [
    `${wholeLatex('produit', [f, g])} = 0`,
    `${factorLatex(f)} = 0 \\quad\\text{ou}\\quad ${factorLatex(g)} = 0`,
    `x = ${rootLatex(factorRoot(f))} \\quad\\text{ou}\\quad x = ${rootLatex(factorRoot(g))}`,
  ];
};

// ——— Erreurs reconnues : celles du tableau et de l'intervalle ; la valeur se détecte aussi sur un nombre (saisie) ———
const RULE_1 = { n: 1, label: 'Valeurs et lignes', partIndex: 1 };
const RULE_2 = { n: 2, label: 'Les signes par colonne', partIndex: 2 };
const RULE_3 = { n: 3, label: 'Lire S', partIndex: 4 };
type Rule = NonNullable<ErrorDef['rule']>;
const VALEUR = (ex: Exercise): string =>
  `${factorText(smallestFactor(ex))} s’annule quand ${factorText(smallestFactor(ex))} = 0 : on résout cette équation, x = ${rootText(ex.answer)}.`;
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
  error('valeurs', 'calcul', RULE_1, VALEUR, (ex) => smallestFactor(ex).b),
  error('valeurs-ordre', 'calcul', RULE_1, () => 'Écris les valeurs de la plus petite à la plus grande.'),
  error('lignes-facteurs', 'autre', RULE_1, () => 'Une ligne par facteur, écrit comme dans l’énoncé.'),
  error('ligne-totale', 'autre', RULE_1, () => 'La dernière ligne est le produit en entier, avec des parenthèses autour de chaque facteur.'),
  error('signe-facteur', 'signe', RULE_2, () => 'À droite de sa valeur, un facteur a le signe de a ; à gauche, le signe contraire.'),
  error('regle-signes', 'signe', RULE_2, () => 'Dans une colonne : deux signes pareils donnent +, deux signes différents donnent −.'),
  error('zero-oublie', 'ecriture', RULE_2, () => 'Sous la valeur qui annule un facteur, le produit vaut 0.'),
  error('zero-en-trop', 'ecriture', RULE_2, () => 'On met 0 seulement sous une valeur qui annule un facteur.'),
  error('reunion', 'ecriture', RULE_3, () => 'Chaque morceau séparé est un intervalle, et ∪ les relie.'),
  error('crochet', 'ecriture', RULE_3, () => 'Borne comprise (≤ ou ≥) : crochet fermé. Borne exclue (< ou >) : crochet ouvert.'),
  error('crochet-infini', 'ecriture', RULE_3, () => 'On n’atteint jamais l’infini : contre ∞, le crochet est toujours ouvert.'),
  error('cote', 'ecriture', RULE_3, () => 'Regarde quelles colonnes conviennent : à gauche ou à droite des valeurs.'),
  error('ordre', 'calcul', RULE_3, () => 'On écrit la plus petite borne à gauche, la plus grande à droite.'),
  error('borne', 'calcul', RULE_3, () => 'Les bornes sont les valeurs qui annulent les facteurs.'),
  error('signe-borne', 'signe', RULE_3, () => 'La borne est la valeur du tableau, avec son signe.'),
];

// ——— Questions faites à la main ———
const RELS: Strict[] = ['<', '<=', '>', '>='];
const saisieQ = (ex: Exercise): Question => ({
  kind: 'saisie',
  ex,
  promptLatex: `${wholeLatex('produit', factorsOf(ex))} = 0 \\quad\\text{la plus petite valeur :}\\quad x = \\square`,
});
const tableauOf = (ex: Exercise) => tableauQuestion(ex, 'produit', factorsOf(ex));
const customQuestion: CourseDef['customQuestion'] = (kind, ctx) => {
  const trap = errors.find((e) => e.id === ctx.trapErrorType);
  if (kind === 'tableau') return tableauOf(trap ? trap.trap(ctx.level, ctx.rng) : generate(ctx.level, ctx.rng));
  if (kind === 'intervalle') {
    const ex = trap ? trap.trap(ctx.level, ctx.rng) : generate(ctx.level, ctx.rng);
    return intervalleFromTable(ex, tableauOf(ex), RELS[draw(ctx.rng, [0, 3])] as Strict);
  }
  return saisieQ(trap ? trap.trap(ctx.level, ctx.rng) : generateInt(ctx.level, ctx.rng));
};

function feedbackText(q: Question, o: Outcome): string | null {
  if (o.correct || o.unfinished || o.errorFamily === 'ecriture' || q.kind !== 'saisie') return null;
  if (o.errorType === 'valeurs') return VALEUR(q.ex);
  return `Résous ${factorText(smallestFactor(q.ex))} = 0 : x = ${rootText(q.ex.answer)}. L’autre facteur donne la plus grande valeur.`;
}

// ——— Leçon ———
const REGLE1 = '**Je cherche la valeur qui annule chaque facteur, je les range de la plus petite à la plus grande, et je fais une ligne par facteur.**';
const REGLE2 = '**Dans chaque colonne : deux signes pareils donnent +, deux signes différents donnent −, et un facteur nul rend le produit nul.**';
const REGLE3 = '**Je garde les colonnes qui conviennent (avec les 0 si ≥ ou ≤), puis j’écris un intervalle par morceau, reliés par ∪.**';

const guess = choix(
  mk(1, { a: 1, b: -2 }, { a: 1, b: 1 }),
  'Pour x = 0, quel est le signe de (x − 2)(x + 1) ?',
  options3(
    ['Négatif', 'Oui : (0 − 2) × (0 + 1) = −2 × 1 = −2. Un facteur négatif et un positif donnent un produit négatif.'],
    ['Positif', '(0 − 2) × (0 + 1) = −2 × 1 = −2 : c’est négatif.'],
    ['Nul', 'Le produit n’est nul que si un facteur est nul. Pour x = 0, ni 0 − 2 ni 0 + 1 ne vaut 0.'],
  ),
  0,
  '(x - 2)(x + 1)',
);

const lignes: EtapeStep[] = [
  step('Pour **(x − 2)(x + 1)**, on étudie chaque facteur : x − 2 s’annule en 2, et x + 1 s’annule en −1.', {
    scene: linesScene(['(x − 2)(x + 1)'], ['x − 2 = 0 : x = 2'], ['x + 1 = 0 : x = −1']),
  }),
  step('Dans la 1re ligne du tableau, les valeurs vont de la plus petite à la plus grande : −1 est écrite [ ? ] 2.', {
    scene: linesScene(['x − 2 : 2'], ['x + 1 : −1']),
    after: linesScene(['Valeurs : ', hl('−1'), ' ; 2']),
    action: trouOf('Dans la 1re ligne du tableau, les valeurs vont de la plus petite à la plus grande : −1 est écrite [ ? ] 2.', ['avant', 'après'], 0, {
      1: '−1 est plus petit que 2 : il s’écrit à gauche, donc avant.',
    }),
  }),
  step(undefined, { scene: linesScene(['(2x − 4)(x + 3)'], ['2x − 4 : 2'], ['x + 3 : −3'], ['Valeurs : −3 ; 2']), rule: { n: 1, text: REGLE1 } }),
];

const signes: EtapeStep[] = [
  step('Chaque facteur se remplit comme au cours précédent. Pour (x + 1)(x − 2), les valeurs sont −1 et 2.', {
    scene: linesScene(['x + 1 : − 0 + + +'], ['x − 2 : − − − 0 +']),
  }),
  step('Dans la colonne entre −1 et 2, x + 1 est + et x − 2 est − : les signes sont différents, le produit est [ ? ].', {
    scene: linesScene(['x + 1 : − 0 + + +'], ['x − 2 : − − − 0 +']),
    after: linesScene(['x + 1 : − 0 + + +'], ['x − 2 : − − − 0 +'], ['(x + 1)(x − 2) : + 0 ', hl('−'), ' 0 +']),
    action: trouOf('Dans la colonne entre −1 et 2, x + 1 est + et x − 2 est − : les signes sont différents, le produit est [ ? ].', ['−', '+', '0'], 0, {
      1: '+ × − donne −. Deux signes pareils donnent +, deux signes différents donnent −.',
      2: 'Le produit n’est nul que si un facteur est nul : ce n’est pas le cas dans cette colonne.',
    }),
  }),
  step(undefined, {
    scene: linesScene(['−x + 1 : + + + 0 −'], ['x + 3 : − 0 + + +'], ['(−x + 1)(x + 3) : − 0 + 0 −']),
    rule: { n: 2, text: REGLE2 },
  }),
];

const lecture: EtapeStep[] = [
  step('Pour résoudre **(x + 1)(x − 2) ≥ 0**, on garde les colonnes où le produit est + ou 0.', {
    scene: linesScene(['(x + 1)(x − 2) : ', hl('+ 0'), ' − ', hl('0 +')]),
  }),
  step('Le produit vaut 0 en −1 et en 2, et ≥ garde le 0 : les crochets de −1 et de 2 sont [ ? ].', {
    scene: linesScene(['(x + 1)(x − 2) : + 0 − 0 +']),
    after: linesScene(['(x + 1)(x − 2) : + 0 − 0 +'], [']−∞ , ', hl('−1'), '] ∪ [', hl('2'), ' , +∞[']),
    action: trouOf('Le produit vaut 0 en −1 et en 2, et ≥ garde le 0 : les crochets de −1 et de 2 sont [ ? ].', ['fermés', 'ouverts'], 0, {
      1: 'Avec ≥, le 0 est gardé : la borne est comprise, donc le crochet est fermé.',
    }),
  }),
  step(undefined, {
    scene: linesScene(['(−x + 1)(x + 3) < 0 : ', hl('−'), ' 0 + 0 ', hl('−')], [']−∞ , −3[ ∪ ]1 , +∞[']),
    rule: { n: 3, text: REGLE3 },
  }),
];

const exGuide = mk(1, { a: 3, b: 6 }, { a: 1, b: -4 }); // (3x + 6)(x − 4), valeurs −2 et 4

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Le signe d’un produit',
    intro: ['Un produit change de signe quand l’un de ses facteurs change de signe.', 'Un tableau range tous ces changements, colonne par colonne.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(RULE_1.label, lignes),
  etapes(RULE_2.label, signes),
  lecon(
    small(mk(1, { a: -1, b: 3 }, { a: 1, b: 2 }), '(-x + 3)(x + 2)', 'Pour x = 5, −x + 3 est négatif et x + 2 est positif. Quel est le signe du produit ?', [
      ['−', 'Oui : un signe négatif et un positif, différents, donnent −. Et (−2) × 7 = −14.'],
      ['+', 'Les deux signes sont différents : le produit est négatif, pas positif.'],
      ['0', 'Le produit est nul seulement en x = 3 ou x = −2, pas en x = 5.'],
    ], 0),
  ),
  etapes(RULE_3.label, lecture),
  lecon(
    small(mk(1, { a: 1, b: -1 }, { a: 1, b: 4 }), '(x - 1)(x + 4) \\leqslant 0', 'Le produit est + 0 − 0 + (valeurs −4 et 1). Quel est S pour ≤ 0 ?', [
      ['[−4 , 1]', 'Oui : on garde la colonne − et les deux 0, donc un seul morceau aux crochets fermés.'],
      [']−∞ , −4] ∪ [1 , +∞[', 'Ce sont les colonnes + : S serait celui de ≥ 0.'],
      [']−4 , 1[', 'Avec ≤, les 0 sont gardés : les crochets sont fermés.'],
    ], 0),
  ),
  texted(
    decouverte(
      choix(
        mk(1, { a: 1, b: -1 }, { a: 1, b: 4 }),
        'Dans laquelle des deux inéquations S est-il en deux morceaux ?',
        options3(
          ['Dans A, ≥ 0', 'Oui : les colonnes + sont aux deux bouts, séparées par la colonne −.'],
          ['Dans B, ≤ 0', 'Dans B, on garde la colonne − du milieu : un seul morceau.'],
          ['Dans les deux', 'Le symbole décide des colonnes gardées : + ou −.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ['Même tableau : + 0 − 0 +. Regarde le symbole.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Inéquation A', latex: '(x - 1)(x + 4) \\geqslant 0' },
        b: { label: 'Inéquation B', latex: '(x - 1)(x + 4) \\leqslant 0' },
        note: '',
        inPlace: true,
        highlight: { a: toks('(x − 1)(x + 4) ', hl('≥'), ' 0'), b: toks('(x − 1)(x + 4) ', hl('≤'), ' 0') },
        after: ['Dans A, on garde + et 0 : ]−∞ , −4] ∪ [1 , +∞[.', 'Dans B, on garde − et 0 : [−4 , 1].'],
      },
    },
  ),
  texted(exemple({ ...tableauOf(exGuide), guided: true as const }), {
    title: 'On le fait ensemble',
    subtitle: 'Construis le tableau de signes de (3x + 6)(x − 4). À chaque étape, une aide te dit quoi faire.',
  }),
  annonceFin(),
];

export const inequationsTableauSignesProduit: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 10,
  title: 'Tableau de signes d’un produit',
  shortTitle: 'Tableau d’un produit',
  rule: RULE,
  parts,
  // pas de série de pratique : la pastille s'arrête avant l'exemple guidé
  lessonLength: parts.findIndex((p) => p.type === 'question' && p.activity === 'exemple'),
  unePhrase: true,
  // tableau complet, puis lecture de S (un ou deux intervalles), en alternance
  endExercises: { count: 5, kind: 'saisie', mix: ['tableau', 'intervalle', 'tableau', 'intervalle', 'intervalle'] },
  formats: ['saisie', 'tableau', 'intervalle'],
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
      'Une ligne par facteur ; les valeurs de la plus petite à la plus grande.',
      'Dans chaque colonne : pareils +, différents −, un facteur nul donne 0.',
      'Je garde les colonnes qui conviennent et j’écris un intervalle par morceau, reliés par ∪.',
    ],
    examples: ['(x − 2)(x + 1) : + 0 − 0 +', '(x − 2)(x + 1) ≥ 0 ; ]−∞ , −1] ∪ [2 , +∞['],
    mistake: { wrong: '(x − 2)(x + 1) ≥ 0 écrit [2 , +∞[', why: 'On a oublié le morceau de gauche : le produit est aussi + avant −1. S = ]−∞ , −1] ∪ [2 , +∞[.' },
    tip: 'Essaie x = 0 dans le produit : son signe te dit quelle colonne du milieu est + ou −.',
  },
};
