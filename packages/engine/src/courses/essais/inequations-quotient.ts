// Cours 11 du module Équations et inéquations (déroulé guidé) : le quotient, la valeur interdite (double barre, crochet ouvert).
// Découverte (peut-on calculer en 2 ?), 3 règles (valeurs et lignes, 0 ou ‖, lecture de S), 2 petites questions,
// une comparaison utile (produit contre quotient), un exemple guidé ((2x − 6) ÷ (x + 1), tableau complet) puis 5 exercices : tableau, S, tableau, S, S.
// Fiche : docs/modules/02-equations-inequations/inequations-quotient.md
// L'exercice garde la valeur interdite (celle du bas) dans `expr` et `answer` ; haut et bas sont dans `meta` ({ f1, f2 }).
import { num, op } from '../../math/expr';
import type { Interval } from '../../math/intervalle';
import { type Factor, factorLatex, factorRoot, factorText, rootText, wholeLatex } from '../../math/tableau';
import { eqRat, type Rational, rat } from '../../math/rational';
import type { Rng } from '../../rng';
import { intervalleFromTable, type Strict } from '../../exercises/intervalle';
import { tableauQuestion } from '../../exercises/tableau';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, Level, Scene, SceneTable } from '../types';
import {
  NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, chance, choix, decouverte, draw, etapes, exemple, explanation,
  hl, is, lecon, linesScene, options3, redraw, small, step, texted, toks, trouOf,
} from '../calculs/shared';

const ID = 'inequations-quotient';
const RULE = 'Comme un produit, mais la valeur qui annule le dénominateur est interdite : double barre dans le tableau, crochet ouvert dans S.';

// ——— Exercice : (a1 x + b1) ÷ (a2 x + b2), deux valeurs distinctes ———
type Range = [number, number];
type Meta = { f1: Factor; f2: Factor };
const meta = (ex: Exercise): Meta => ex.meta as unknown as Meta;
const factorsOf = (ex: Exercise): Factor[] => [meta(ex).f1, meta(ex).f2];
const mk = (level: Level, f1: Factor, f2: Factor): Exercise => ({
  courseId: ID,
  level,
  expr: op('/', num(-f2.b), num(f2.a)),
  answer: factorRoot(f2),
  meta: { f1, f2 } as unknown as Record<string, unknown>,
});
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
const forbidden = (ex: Exercise): Factor => meta(ex).f2;
const rootLatex = (r: Rational): string => (r.d === 1 ? `${r.n}` : `${r.n < 0 ? '-' : ''}\\frac{${Math.abs(r.n)}}{${r.d}}`);
const resolution = (ex: Exercise): string[] => {
  const [f, g] = factorsOf(ex) as [Factor, Factor];
  return [
    `${wholeLatex('quotient', [f, g])}`,
    `${factorLatex(f)} = 0 \\quad\\text{donc}\\quad x = ${rootLatex(factorRoot(f))}`,
    `${factorLatex(g)} = 0 \\quad\\text{valeur interdite}\\quad x = ${rootLatex(factorRoot(g))}`,
  ];
};

// ——— Erreurs reconnues : celles du tableau et de l'intervalle ; la valeur se détecte aussi sur un nombre (saisie) ———
const RULE_1 = { n: 1, label: 'La valeur interdite', partIndex: 1 };
const RULE_2 = { n: 2, label: 'La double barre', partIndex: 2 };
const RULE_3 = { n: 3, label: 'Lire S', partIndex: 4 };
type Rule = NonNullable<ErrorDef['rule']>;
const VALEUR = (ex: Exercise): string =>
  `${factorText(forbidden(ex))} s’annule quand ${factorText(forbidden(ex))} = 0 : cette valeur est interdite, x = ${rootText(ex.answer)}.`;
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
  error('valeurs', 'calcul', RULE_1, VALEUR, (ex) => forbidden(ex).b),
  error('valeurs-ordre', 'calcul', RULE_1, () => 'Écris les valeurs de la plus petite à la plus grande.'),
  error('lignes-facteurs', 'autre', RULE_1, () => 'Une ligne pour le haut et une pour le bas, écrits comme dans l’énoncé.'),
  error('ligne-totale', 'autre', RULE_1, () => 'La dernière ligne est le quotient : le haut ÷ le bas, avec des parenthèses.'),
  error('signe-facteur', 'signe', RULE_2, () => 'À droite de sa valeur, un facteur a le signe de a ; à gauche, le signe contraire.'),
  error('regle-signes', 'signe', RULE_2, () => 'Dans une colonne : deux signes pareils donnent +, deux signes différents donnent −.'),
  error('zero-oublie', 'ecriture', RULE_2, () => 'Sous la valeur qui annule le haut, le quotient vaut 0.'),
  error('zero-en-trop', 'ecriture', RULE_2, () => 'On met 0 seulement sous la valeur qui annule le haut.'),
  error('barre-oubliee', 'ecriture', RULE_2, () => 'Sous la valeur qui annule le bas, le quotient n’existe pas : on écrit la double barre ‖, pas 0.'),
  error('barre-en-trop', 'ecriture', RULE_2, () => 'La double barre va seulement sous la valeur qui annule le bas.'),
  error('reunion', 'ecriture', RULE_3, () => 'Chaque morceau séparé est un intervalle, et ∪ les relie.'),
  error('crochet', 'ecriture', RULE_3, () => 'La valeur interdite n’est jamais dans S : son crochet est ouvert, même avec ≤ ou ≥. Les 0 du haut sont gardés avec ≤ ou ≥.'),
  error('crochet-infini', 'ecriture', RULE_3, () => 'On n’atteint jamais l’infini : contre ∞, le crochet est toujours ouvert.'),
  error('cote', 'ecriture', RULE_3, () => 'Regarde quelles colonnes conviennent : à gauche ou à droite des valeurs.'),
  error('ordre', 'calcul', RULE_3, () => 'On écrit la plus petite borne à gauche, la plus grande à droite.'),
  error('borne', 'calcul', RULE_3, () => 'Les bornes sont les valeurs qui annulent les facteurs.'),
  error('signe-borne', 'signe', RULE_3, () => 'La borne est la valeur du tableau, avec son signe.'),
];

// ——— Questions faites à la main ———
const saisieQ = (ex: Exercise): Question => ({
  kind: 'saisie',
  ex,
  promptLatex: `${wholeLatex('quotient', factorsOf(ex))} \\quad\\text{valeur interdite :}\\quad x = \\square`,
});
const tableauOf = (ex: Exercise, ask?: { valeurs: boolean; lignes: boolean }) => tableauQuestion(ex, 'quotient', factorsOf(ex), ask);
/** Rang 2 des exercices de fin : les lignes sont données (valeurs et signes à écrire) ; partout ailleurs, le tableau complet. */
const askOf = (index: number | undefined): { valeurs: boolean; lignes: boolean } => ({ valeurs: true, lignes: index !== 2 });

/** Une inégalité large (≤ ou ≥) fait confondre la valeur interdite avec une borne comprise : le rang 1 des exercices de fin l'est toujours, les autres 3 fois sur 4. */
const relOf = (rng: Rng, index?: number): Strict =>
  index === 1 || chance(rng, 0.75) ? (chance(rng, 0.5) ? '<=' : '>=') : chance(rng, 0.5) ? '<' : '>';
const customQuestion: CourseDef['customQuestion'] = (kind, ctx) => {
  const trap = errors.find((e) => e.id === ctx.trapErrorType);
  if (kind === 'tableau') return tableauOf(trap ? trap.trap(ctx.level, ctx.rng) : generate(ctx.level, ctx.rng), askOf(ctx.index));
  if (kind === 'intervalle') {
    const ex = trap ? trap.trap(ctx.level, ctx.rng) : generate(ctx.level, ctx.rng);
    return intervalleFromTable(ex, tableauOf(ex), relOf(ctx.rng, ctx.index));
  }
  return saisieQ(trap ? trap.trap(ctx.level, ctx.rng) : generateInt(ctx.level, ctx.rng));
};

function feedbackText(q: Question, o: Outcome): string | null {
  if (o.correct || o.unfinished || o.errorFamily === 'ecriture' || q.kind !== 'saisie') return null;
  if (o.errorType === 'valeurs') return VALEUR(q.ex);
  return `La valeur interdite annule le bas : ${factorText(forbidden(q.ex))} = 0 donne x = ${rootText(q.ex.answer)}.`;
}

// ——— Leçon ———
const REGLE1 = '**Le bas ne peut pas valoir 0 : la valeur qui annule le bas est interdite. Le haut et le bas ont chacun leur ligne.**';
const REGLE2 = '**Sous la valeur qui annule le haut, on écrit 0. Sous la valeur qui annule le bas, on écrit la double barre ‖.**';
const REGLE3 = '**La valeur interdite n’est jamais dans S : son crochet est ouvert, même avec ≤ ou ≥. Les 0 du haut sont gardés avec ≤ ou ≥.**';

const guess = choix(
  mk(1, { a: 1, b: 1 }, { a: 1, b: -2 }),
  'Pour x = 2, peut-on calculer (x + 1) ÷ (x − 2) ?',
  options3(
    ['Non, on diviserait par 0', 'Oui : x − 2 vaut 0 pour x = 2, et on ne divise jamais par 0.'],
    ['Oui : 3 ÷ 0 = 0', '3 ÷ 0 n’a aucun résultat : diviser par 0 est impossible.'],
    ['Oui : 3 ÷ 0 = 3', '3 ÷ 0 n’a aucun résultat : diviser par 0 est impossible.'],
  ),
  0,
  '(x + 1) \\div (x - 2)',
);

/** Une scène en lignes d'écriture, avec le tableau de signes (`upTo`, `rows` : jusqu'où il est dessiné ; `ghost` : colonnes qui conviennent) et S en intervalles. */
type Calc = (string | ReturnType<typeof hl>)[];
const F = (a: number, b: number): Factor => ({ a, b });
const tab = (
  table: Omit<SceneTable, 'op' | 'factors'> & { factors: Factor[] },
  calcs: Calc[],
  intervals?: Interval[],
): Scene => ({
  ...linesScene(...calcs),
  table: { op: 'quotient', ...table },
  ...(intervals ? { interval: { intervals } } : {}),
});
const piece = (lo: number | null, hi: number | null, loClosed: boolean, hiClosed: boolean): Interval => ({
  lo: lo === null ? null : rat(lo),
  hi: hi === null ? null : rat(hi),
  loClosed,
  hiClosed,
});

const lignes: EtapeStep[] = [
  step('Dans **(x + 1) ÷ (x − 2)**, on ne peut pas diviser par 0. Le bas x − 2 vaut 0 pour x = 2 : cette valeur est **interdite**.', {
    scene: linesScene(['(x + 1) ÷ (x − 2)'], ['x − 2 = 0 : x = 2, interdit']),
  }),
  step('Pour x = 2, le bas vaut 0 : le quotient [ ? ].', {
    scene: linesScene(['(x + 1) ÷ (x − 2)']),
    after: tab({ factors: [F(1, 1), F(1, -2)], upTo: 'valeurs' }, [['x = ', hl('2'), ' : le quotient n’existe pas']]),
    action: trouOf('Pour x = 2, le bas vaut 0 : le quotient [ ? ].', ['n’existe pas', 'vaut 0'], 0, {
      1: 'Un quotient vaut 0 quand le haut vaut 0. Quand le bas vaut 0, il n’existe pas.',
    }),
  }),
  step(undefined, {
    scene: tab({ factors: [F(2, -4), F(1, 3)], upTo: 'lignes' }, [['(2x − 4) ÷ (x + 3)'], ['haut : 2x − 4 = 0 en 2'], ['bas : x + 3 = 0 en −3, interdit']]),
    rule: { n: 1, text: REGLE1 },
  }),
];

const signes: EtapeStep[] = [
  step('Le tableau se remplit comme celui d’un produit. Pour (x + 1) ÷ (x − 2), les valeurs sont −1 (haut) et 2 (bas).', {
    scene: tab({ factors: [F(1, 1), F(1, -2)], upTo: 'signes', rows: 2 }, [['(x + 1) ÷ (x − 2)']]),
  }),
  step('Sous la valeur interdite 2, on écrit [ ? ] : le quotient n’existe pas.', {
    scene: tab({ factors: [F(1, 1), F(1, -2)], upTo: 'signes', rows: 2 }, [['(x + 1) ÷ (x − 2)']]),
    after: tab({ factors: [F(1, 1), F(1, -2)], upTo: 'signes' }, [['Sous 2, on écrit ', hl('‖')]]),
    action: trouOf('Sous la valeur interdite 2, on écrit [ ? ] : le quotient n’existe pas.', ['‖', '0'], 0, {
      1: '0 voudrait dire que le quotient vaut 0. Or en 2 il n’existe pas : on écrit la double barre ‖.',
    }),
  }),
  step(undefined, {
    scene: tab({ factors: [F(-1, 1), F(1, 3)], upTo: 'signes' }, [['(−x + 1) ÷ (x + 3)']]),
    rule: { n: 2, text: REGLE2 },
  }),
];

const lecture: EtapeStep[] = [
  step('Pour résoudre **(x + 1) ÷ (x − 2) ≥ 0**, on garde les colonnes + et 0 : le 0 en −1 est gardé, la barre en 2 ne l’est jamais.', {
    scene: tab({ factors: [F(1, 1), F(1, -2)], upTo: 'signes', ghost: '>=' }, [['(x + 1) ÷ (x − 2) ≥ 0 : on garde ', hl('+ et 0')]]),
  }),
  step('En 2, la valeur est interdite : le crochet de 2 est [ ? ], même avec ≥.', {
    scene: tab({ factors: [F(1, 1), F(1, -2)], upTo: 'signes', ghost: '>=' }, [['(x + 1) ÷ (x − 2) ≥ 0']]),
    after: tab({ factors: [F(1, 1), F(1, -2)], upTo: 'signes', ghost: '>=' }, [[']−∞ , −1] ∪ ]', hl('2'), ' , +∞[']], [piece(null, -1, false, true), piece(2, null, false, false)]),
    action: trouOf('En 2, la valeur est interdite : le crochet de 2 est [ ? ], même avec ≥.', ['ouvert', 'fermé'], 0, {
      1: 'Le quotient n’existe pas en 2 : 2 ne peut pas être une solution, donc le crochet est ouvert.',
    }),
  }),
  step(undefined, {
    scene: tab({ factors: [F(-1, 1), F(1, 3)], upTo: 'signes', ghost: '<=' }, [['(−x + 1) ÷ (x + 3) ≤ 0 : on garde ', hl('− et 0')], [']−∞ , −3[ ∪ [1 , +∞[']], [piece(null, -3, false, false), piece(1, null, true, false)]),
    rule: { n: 3, text: REGLE3 },
  }),
];

const exGuide = mk(1, { a: 2, b: -6 }, { a: 1, b: 1 }); // (2x − 6) ÷ (x + 1), haut en 3, valeur interdite −1

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Diviser par zéro',
    intro: ['Dans un quotient, le bas ne peut jamais valoir 0.', 'Il y a donc une valeur de x qu’on doit exclure.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(RULE_1.label, lignes),
  etapes(RULE_2.label, signes),
  lecon(
    small(mk(1, { a: 1, b: -3 }, { a: 1, b: 2 }), '\\frac{x - 3}{x + 2}', 'Sous la valeur qui annule le bas, x + 2, que met-on dans la ligne du quotient ?', [
      ['La double barre ‖', 'Oui : le bas vaut 0 en −2, le quotient n’existe pas.'],
      ['0', '0 se met sous la valeur qui annule le haut, ici 3. Sous le bas, le quotient n’existe pas.'],
      ['+', 'Le quotient n’existe pas en −2 : il n’a pas de signe, on met la double barre.'],
    ], 0),
  ),
  etapes('Lire S', lecture),
  lecon(
    small(mk(1, { a: 1, b: -3 }, { a: 1, b: 2 }), '\\frac{x - 3}{x + 2} \\leqslant 0', 'Le quotient est + ‖ − 0 + (valeurs −2 et 3). Quel est S pour ≤ 0 ?', [
      [']−2 , 3]', 'Oui : −2 est interdit (crochet ouvert) et le 0 en 3 est gardé (crochet fermé).'],
      ['[−2 , 3]', '−2 annule le bas : il est interdit, son crochet est ouvert.'],
      [']−2 , 3[', 'Avec ≤, le 0 du haut est gardé : en 3 le crochet est fermé.'],
    ], 0),
  ),
  texted(
    decouverte(
      choix(
        mk(1, { a: 1, b: 1 }, { a: 1, b: -2 }),
        'Dans laquelle des deux inéquations le nombre 2 est-il une solution ?',
        options3(
          ['Dans A, le produit', 'Oui : en 2, le produit vaut 0, et 0 ≥ 0 est vrai.'],
          ['Dans B, le quotient', 'En 2, le quotient n’existe pas : 2 ne peut pas être une solution.'],
          ['Dans les deux', 'Dans B, on diviserait par 0 : 2 est exclu.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ['Même tableau de signes, mais regarde la valeur 2.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Inéquation A', latex: '(x + 1)(x - 2) \\geqslant 0' },
        b: { label: 'Inéquation B', latex: '\\frac{x + 1}{x - 2} \\geqslant 0' },
        note: '',
        inPlace: true,
        highlight: { a: toks('(x + 1)', hl('(x − 2)'), ' ≥ 0'), b: toks('(x + 1) ÷ ', hl('(x − 2)'), ' ≥ 0') },
        after: ['Dans A, en 2 le produit vaut 0 : S finit par [2 , +∞[.', 'Dans B, en 2 le quotient n’existe pas : S finit par ]2 , +∞[.'],
      },
    },
  ),
  texted(exemple({ ...tableauOf(exGuide), guided: true as const }), {
    title: 'On le fait ensemble',
    subtitle: 'Construis le tableau de signes de (2x − 6) ÷ (x + 1). À chaque étape, une aide te dit quoi faire.',
  }),
  annonceFin(),
];

export const inequationsQuotient: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 11,
  title: 'Quotient et valeur interdite',
  shortTitle: 'Quotient',
  rule: RULE,
  parts,
  // pas de série de pratique : la pastille s'arrête avant l'exemple guidé
  lessonLength: parts.findIndex((p) => p.type === 'question' && p.activity === 'exemple'),
  unePhrase: true,
  // tableau complet, puis lecture de S (un ou deux intervalles, valeur interdite ouverte), en alternance
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
      'Le bas ne peut pas valoir 0 : sa valeur est interdite.',
      'Sous la valeur du haut, 0. Sous la valeur du bas, la double barre ‖.',
      'La valeur interdite n’est jamais dans S : crochet ouvert, même avec ≤ ou ≥.',
    ],
    examples: ['(x + 1) ÷ (x − 2) : + 0 − ‖ +', '(x + 1) ÷ (x − 2) ≥ 0 ; ]−∞ , −1] ∪ ]2 , +∞['],
    mistake: { wrong: '(x + 1) ÷ (x − 2) ≥ 0 écrit ]−∞ , −1] ∪ [2 , +∞[', why: 'En 2 le quotient n’existe pas : la valeur interdite a toujours un crochet **ouvert**. S = ]−∞ , −1] ∪ ]2 , +∞[.' },
    tip: 'Demande-toi pour chaque borne : le quotient existe-t-il ici ? Non : crochet ouvert.',
  },
};
