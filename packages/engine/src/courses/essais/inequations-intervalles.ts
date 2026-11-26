// Cours 7 du module Équations et inéquations (déroulé guidé) : écrire un ensemble de solutions en intervalle.
// Découverte, 3 règles (bornes et ∞, crochet selon < ≤, ∞ toujours ouvert), 2 petites questions (lire un intervalle),
// une comparaison utile (x < 3 contre x ≤ 3), un exemple guidé (x > −2) puis 5 exercices en question « intervalle ».
// Fiche : docs/modules/02-equations-inequations/inequations-intervalles.md
// L'exercice garde la borne dans `expr` (num(b)) et `answer` ; le symbole et la borne sont dans `meta` ({ rel, b }).
import { num } from '../../math/expr';
import { relationLatex } from '../../math/equation';
import { intervalLatex, intervalOfRelation } from '../../math/intervalle';
import { rat } from '../../math/rational';
import type { Rng } from '../../rng';
import { intervalleQuestion, type Strict } from '../../exercises/intervalle';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, LineScene, Level, Scene } from '../types';
import {
  NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, choix, decouverte, draw, etapes, exemple, explanation, hl, is,
  lecon, linesScene, makeExercise, options3, small, step, texted, toks, trouOf, txt,
} from '../calculs/shared';

const ID = 'inequations-intervalles';
const RULE = 'Un ensemble de solutions s’écrit en intervalle : crochet fermé si la borne est comprise, ouvert si elle est exclue, toujours ouvert contre ∞.';

// ——— Exercice : x rel b, à écrire en intervalle ———
type Range = [number, number];
const B_RANGE: Record<Level, Range> = { 1: [1, 9], 2: [10, 30], 3: [10, 99] };
const RELS: Strict[] = ['<', '<=', '>', '>='];
type Meta = { rel: Strict; b: number };
const meta = (ex: Exercise): Meta => ex.meta as unknown as Meta;
const mk = (level: Level, rel: Strict, b: number): Exercise => ({
  ...makeExercise(ID, level, num(b)),
  meta: { rel, b } as unknown as Record<string, unknown>,
});
function generate(level: Level, rng: Rng): Exercise {
  const rel = RELS[draw(rng, [0, 3])] as Strict;
  const negative = level === 1 ? rng() < 1 / 3 : rng() < 0.5;
  return mk(level, rel, draw(rng, B_RANGE[level]) * (negative ? -1 : 1));
}
const inequationLatex = (ex: Exercise): string => `x ${relationLatex(meta(ex).rel)} ${meta(ex).b}`;
const resolution = (ex: Exercise): string[] => [inequationLatex(ex), intervalLatex(intervalOfRelation(meta(ex).rel, rat(meta(ex).b)))];

// ——— Erreurs reconnues : celles de la question « intervalle » (ids de math/intervalle.ts) ; seule la borne au signe près se détecte sur un nombre ———
const RULE_1 = { n: 1, label: 'Les bornes et ∞', partIndex: 1 };
const RULE_2 = { n: 2, label: 'Crochet ouvert ou fermé', partIndex: 2 };
const RULE_3 = { n: 3, label: 'Le crochet contre ∞', partIndex: 4 };
type Rule = NonNullable<ErrorDef['rule']>;
const BOUND_SIGN = (ex: Exercise): string =>
  `La borne est le nombre de l’inégalité, avec son signe : ${txt(meta(ex).b)}, pas ${txt(-meta(ex).b)}.`;
const error = (id: string, family: ErrorDef['family'], rule: Rule, text: (ex: Exercise) => string, wrong?: (ex: Exercise) => number): ErrorDef => ({
  id,
  family,
  rule,
  detect: (ex, given) => (wrong ? ex.answer.n !== 0 && is(given, wrong(ex)) : false),
  explain: (ex) => explanation(text(ex), resolution(ex)),
  trap: (level, rng) => generate(level, rng),
  wrongValues: (ex) => (wrong ? [rat(wrong(ex))] : []),
});
const errors: ErrorDef[] = [
  error('signe-borne', 'signe', RULE_1, BOUND_SIGN, (ex) => -meta(ex).b),
  error('cote', 'ecriture', RULE_1, () => 'Regarde le sens de l’inégalité : plus petit, les valeurs vont vers la gauche ; plus grand, vers la droite.'),
  error('ordre', 'calcul', RULE_1, () => 'On écrit la plus petite borne à gauche, la plus grande à droite.'),
  error('crochet', 'ecriture', RULE_2, () => 'Borne comprise (≤ ou ≥) : crochet fermé. Borne exclue (< ou >) : crochet ouvert.'),
  error('crochet-infini', 'ecriture', RULE_3, () => 'On n’atteint jamais l’infini : contre ∞, le crochet est toujours ouvert.'),
];

// ——— Questions faites à la main ———
const saisieQ = (ex: Exercise): Question => ({
  kind: 'saisie',
  ex,
  promptLatex: `${inequationLatex(ex)} \\quad\\text{la borne de l’intervalle est}\\quad \\square`,
});
const customQuestion: CourseDef['customQuestion'] = (kind, ctx) => {
  const ex = generate(ctx.level, ctx.rng);
  return kind === 'intervalle' ? intervalleQuestion(ex, meta(ex).rel, meta(ex).b) : saisieQ(ex);
};

function feedbackText(q: Question, o: Outcome): string | null {
  if (o.correct || o.unfinished || o.errorFamily === 'ecriture' || q.kind !== 'saisie') return null;
  if (o.errorType === 'signe-borne') return BOUND_SIGN(q.ex);
  return `La borne est le nombre qui est dans l’inégalité : ici ${txt(meta(q.ex).b)}.`;
}

// ——— Leçon ———
const REGLE1 = '**On écrit la plus petite borne à gauche : −∞ si les valeurs vont vers la gauche, +∞ si elles vont vers la droite.**';
const REGLE2 = '**Borne comprise (≤ ou ≥) : crochet fermé, tourné vers la borne. Borne exclue (< ou >) : crochet ouvert, tourné à l’opposé.**';
const REGLE3 = '**Contre ∞, le crochet est toujours ouvert, même quand l’autre borne est comprise.**';

/** La droite graduée existante : seule la borne est marquée (pas d'intervalle colorié dans les scènes de leçon). */
const lineScene = (line: LineScene, ...calc: (string | ReturnType<typeof hl>)[]): Scene => ({
  layout: 'line',
  calcs: [{ tokens: calc.map((t) => (typeof t === 'string' ? { t } : t)) }],
  line,
});

const guess = choix(
  mk(1, '<', 3),
  'Peut-on écrire toutes les solutions de x < 3, une par une ?',
  options3(
    ['Non, il y en a une infinité', 'Oui : 2, 1, 0, −1, 1,5… et on ne s’arrête jamais.'],
    ['Oui : 2, 1 et 0', 'Et −1, −2, −3 ? Et 2,5 ? Il y en a beaucoup trop pour les écrire.'],
    ['Oui : seulement 2', '2 est une solution, mais 1, 0 et −5 aussi : il y en a une infinité.'],
  ),
  0,
  'x < 3',
);

const bornes: EtapeStep[] = [
  step('Dans **x < 3**, les solutions sont tous les nombres plus petits que 3. Sur la droite, elles vont **vers la gauche**, sans fin.', {
    scene: lineScene(
      { from: -4, to: 6, jumps: [], highlight: [3], marks: [{ at: 3, text: 'borne' }], legend: 'les solutions sont à gauche de 3', tone: 'color' },
      'x < ',
      hl('3'),
    ),
  }),
  step('Les valeurs s’en vont vers la gauche, sans fin : la borne de gauche de l’intervalle est [ ? ].', {
    scene: linesScene(['x < 3']),
    after: linesScene(['x < 3'], [']', hl('−∞'), ' , 3[']),
    action: trouOf('Les valeurs s’en vont vers la gauche, sans fin : la borne de gauche de l’intervalle est [ ? ].', ['−∞', '+∞'], 0, {
      1: '+∞ est tout à droite. Ici les valeurs vont vers la gauche, donc vers −∞.',
    }),
  }),
  step(undefined, { scene: linesScene(['x > 3'], [']3 , ', hl('+∞'), '[']), rule: { n: 1, text: REGLE1 } }),
];

const crochets: EtapeStep[] = [
  step('Dans **x ≥ 2**, le nombre 2 est **compris** : c’est une solution. Dans **x > 2**, il est **exclu** : 2 n’est pas plus grand que 2.', {
    scene: linesScene(['x ≥ ', hl('2')], ['x > ', hl('2')]),
  }),
  step('Dans x > 2, le nombre 2 est exclu : le crochet est [ ? ], il tourne le dos au 2.', {
    scene: linesScene(['x > 2']),
    after: linesScene(['x > 2'], [hl(']'), '2 , +∞[']),
    action: trouOf('Dans x > 2, le nombre 2 est exclu : le crochet est [ ? ], il tourne le dos au 2.', ['ouvert', 'fermé'], 0, {
      1: 'Un crochet fermé touche le 2 et le garde dans l’intervalle. Or 2 n’est pas une solution de x > 2.',
    }),
  }),
  step(undefined, { scene: linesScene(['x ≥ 2'], [hl('['), '2 , +∞[']), rule: { n: 2, text: REGLE2 } }),
];

const infini: EtapeStep[] = [
  step('**∞ n’est pas un nombre** : on s’en approche sans jamais l’atteindre. Dans x ≥ 4, les nombres grandissent sans fin.', {
    scene: lineScene(
      { from: -1, to: 9, jumps: [], highlight: [4], marks: [{ at: 4, text: 'borne' }], legend: 'les nombres continuent vers la droite, sans fin', tone: 'color' },
      'x ≥ 4',
    ),
  }),
  step('Dans x ≥ 4, le 4 est compris, mais +∞ n’est jamais atteint : son crochet est [ ? ].', {
    scene: linesScene(['x ≥ 4']),
    after: linesScene(['x ≥ 4'], ['[4 , +∞', hl('[')]),
    action: trouOf('Dans x ≥ 4, le 4 est compris, mais +∞ n’est jamais atteint : son crochet est [ ? ].', ['ouvert', 'fermé'], 0, {
      1: '+∞ n’est pas un nombre : on ne peut pas le garder dans l’intervalle, un crochet fermé serait faux.',
    }),
  }),
  step(undefined, { scene: linesScene(['x ≤ 5'], [hl(']'), '−∞ , 5]']), rule: { n: 3, text: REGLE3 } }),
];

const exGuide = mk(1, '>', -2); // x > −2, ]−2 , +∞[

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Beaucoup de solutions',
    intro: ['Une inéquation comme x < 3 a une infinité de solutions.', 'On les résume par un intervalle : deux bornes entre crochets.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(RULE_1.label, bornes),
  etapes(RULE_2.label, crochets),
  lecon(
    small(mk(1, '>=', -1), '[-1 , +\\infty[', 'Quelle inégalité s’écrit [−1 , +∞[ ?', [
      ['x ≥ −1', 'Oui : le crochet est fermé sur −1, donc −1 est compris, et les valeurs vont vers +∞.'],
      ['x > −1', 'Avec > le crochet serait ouvert : ]−1 , +∞[. Ici il est fermé sur −1.'],
      ['x ≤ −1', 'Les valeurs vont vers +∞, donc vers la droite : ce sont les nombres plus grands que −1.'],
    ], 0),
  ),
  etapes(RULE_3.label, infini),
  lecon(
    small(mk(1, '<=', 2), 'x \\leqslant 2', 'Laquelle de ces écritures donne x ≤ 2 en intervalle ?', [
      [']−∞ , 2]', 'Oui : 2 est compris (crochet fermé), et −∞ garde un crochet ouvert.'],
      ['[−∞ , 2]', 'Contre −∞, le crochet est toujours ouvert : −∞ n’est pas un nombre.'],
      [']2 , +∞[', 'Ce sont les nombres plus grands que 2. Pour x ≤ 2, ils sont plus petits.'],
    ], 0),
  ),
  texted(
    decouverte(
      choix(
        mk(1, '<=', 3),
        'Dans laquelle des deux inégalités le nombre 3 est-il une solution ?',
        options3(
          ['Dans B, x ≤ 3', 'Oui : dans B, 3 ≤ 3 est vrai, donc 3 est compris.'],
          ['Dans A, x < 3', 'Dans A, 3 n’est pas plus petit que 3 : il est exclu.'],
          ['Dans les deux', 'Le symbole change tout : < exclut 3, ≤ le garde.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ['Regarde le symbole : < ou ≤.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Inégalité A', latex: 'x < 3' },
        b: { label: 'Inégalité B', latex: 'x \\leqslant 3' },
        note: '',
        inPlace: true,
        highlight: { a: toks('x ', hl('<'), ' 3'), b: toks('x ', hl('≤'), ' 3') },
        after: ['Dans A, 3 est exclu : ]−∞ , 3[.', 'Dans B, 3 est compris : ]−∞ , 3].'],
      },
    },
  ),
  texted(exemple({ ...intervalleQuestion(exGuide, '>', -2), guided: true }), {
    title: 'On le fait ensemble',
    subtitle: 'Écris l’ensemble des solutions de x > −2. À chaque étape, une aide te dit quoi faire.',
  }),
  annonceFin(),
];

export const inequationsIntervalles: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 7,
  title: 'Écrire un ensemble de solutions en intervalle',
  shortTitle: 'Intervalles',
  rule: RULE,
  parts,
  // pas de série de pratique : la pastille s'arrête avant l'exemple guidé
  lessonLength: parts.findIndex((p) => p.type === 'question' && p.activity === 'exemple'),
  unePhrase: true,
  // « intervalle » : l'élève retourne les crochets et tape les bornes ; 3 formats pour que la révision garde 3 questions
  endExercises: { count: 5, kind: 'saisie', mix: ['intervalle', 'intervalle', 'intervalle', 'intervalle', 'intervalle'] },
  formats: ['saisie', 'intervalle', 'intervalle'],
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
      'La plus petite borne à gauche : −∞ si les valeurs vont vers la gauche, +∞ vers la droite.',
      'Borne comprise (≤ ou ≥) : crochet fermé. Borne exclue (< ou >) : crochet ouvert.',
      'Contre ∞, le crochet est toujours ouvert.',
    ],
    examples: ['x < 3 ; ]−∞ , 3[', 'x ≥ 2 ; [2 , +∞['],
    mistake: { wrong: 'x ≥ 2 écrit [2 , +∞]', why: '+∞ n’est pas un nombre : contre ∞, le crochet est **toujours ouvert**. On écrit [2 , +∞[.' },
    tip: 'Demande-toi : la borne est-elle une solution ? Oui : crochet fermé. Non, ou si c’est ∞ : crochet ouvert.',
  },
};
