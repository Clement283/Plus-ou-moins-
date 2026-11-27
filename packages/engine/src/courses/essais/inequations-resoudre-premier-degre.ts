// Cours 8 du module Équations et inéquations (déroulé guidé) : résoudre ax + b rel c ; diviser par un négatif retourne le sens.
// Découverte (−5 est-il solution de −2x < 6 ?), 3 règles (retournement, retirer puis diviser, intervalle après la division),
// 2 petites questions, une comparaison utile (2x < 6 contre −2x < 6), un exemple guidé (−4x + 5 < 9) puis 5 exercices :
// 2 en « À toi de résoudre » (résolution complète) et 3 en question « intervalle » (choix du symbole après la division, puis S).
// Fiche : docs/modules/02-equations-inequations/inequations-resoudre-premier-degre.md
// L'exercice garde la borne x = (c − b) ÷ a dans `expr` et `answer` ; a, b, c, rel sont dans `meta`.
import { num, op } from '../../math/expr';
import { cst, equation, equationLatex, relationLatex, xt, type Equation, type Relation } from '../../math/equation';
import { resolve } from '../../math/solve';
import { type Interval, intervalOfRelation } from '../../math/intervalle';
import { rat } from '../../math/rational';
import type { Rng } from '../../rng';
import { intervalleFromInequality } from '../../exercises/intervalle';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, Level, Scene } from '../types';
import {
  NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, chance, choix, decouverte, draw, etapes, exemple, explanation,
  hl, intOf, is, lecon, linesScene, options3, redraw, small, step, texted, toks, trouOf,
} from '../calculs/shared';
import { paren, sgn } from '../equations/lineaire';

const ID = 'inequations-resoudre-premier-degre';
const RULE = 'Une inéquation se résout comme une équation, mais multiplier ou diviser par un nombre négatif retourne le sens de l’inégalité.';

// ——— Exercice : ax + b rel c, x entier non nul ; le niveau agrandit a, b et x ———
type Strict = Exclude<Relation, '='>;
type Range = [number, number];
const SPEC: Record<Level, { a: Range; b: Range; x: Range }> = {
  1: { a: [2, 5], b: [1, 9], x: [1, 9] },
  2: { a: [2, 9], b: [1, 20], x: [1, 12] },
  3: { a: [2, 12], b: [1, 30], x: [1, 15] },
};
const RELS: Strict[] = ['<', '<=', '>', '>='];
type Meta = { a: number; b: number; c: number; rel: Strict };
const meta = (ex: Exercise): Meta => ex.meta as unknown as Meta;
const eqOf = (ex: Exercise): Equation => equation([xt(meta(ex).a), cst(meta(ex).b)], [cst(meta(ex).c)], meta(ex).rel);
const mk = (level: Level, a: number, b: number, c: number, rel: Strict): Exercise => ({
  courseId: ID,
  level,
  expr: op('/', num(c - b), num(a)),
  answer: rat((c - b) / a),
  meta: { a, b, c, rel } as unknown as Record<string, unknown>,
});
function generate(level: Level, rng: Rng): Exercise {
  const s = SPEC[level];
  return redraw(
    () => {
      const a = (chance(rng, 0.75) ? -1 : 1) * draw(rng, s.a);
      const b = (chance(rng, 0.5) ? -1 : 1) * draw(rng, s.b);
      const x = (chance(rng, 0.5) ? -1 : 1) * draw(rng, s.x);
      return mk(level, a, b, a * x + b, RELS[draw(rng, [0, 3])] as Strict);
    },
    (ex) => meta(ex).c !== 0,
  );
}
const xOf = (ex: Exercise): number => intOf(ex.answer);
const inequationLatex = (ex: Exercise): string => equationLatex(eqOf(ex));
/** Toute la résolution, puis l'intervalle (cours 7). */
const resolution = (ex: Exercise): string[] => resolve(eqOf(ex)).lines.map((l) => equationLatex(l.eq));

// ——— Erreurs reconnues : celles de « À toi de résoudre » (math/solve.ts), de la saisie de la borne et de la question « intervalle » ———
const RULE_1 = { n: 1, label: 'Le sens se retourne', partIndex: 1 };
const RULE_2 = { n: 2, label: 'Retirer, puis diviser', partIndex: 3 };
const RULE_3 = { n: 3, label: 'Écrire l’intervalle', partIndex: 5 };
type Rule = NonNullable<ErrorDef['rule']>;
const text = {
  'signe-perdu-division': (ex: Exercise): string => `On divise ${sgn(meta(ex).c - meta(ex).b)} par ${paren(meta(ex).a)} : le résultat est ${sgn(xOf(ex))}, avec son signe.`,
  'soustraire-coef': (ex: Exercise): string => `${sgn(meta(ex).a)}x veut dire ${paren(meta(ex).a)} × x : on divise les deux membres par ${paren(meta(ex).a)}, on ne le soustrait pas.`,
};
const error = (id: string, family: ErrorDef['family'], rule: Rule, explainText: (ex: Exercise) => string, wrong?: (ex: Exercise) => number): ErrorDef => {
  /** La réponse fausse existe, et n'est pas prise pour une autre erreur (le signe perdu passe en premier). */
  const usable = (ex: Exercise): boolean => wrong !== undefined && wrong(ex) !== xOf(ex) && (id === 'signe-perdu-division' || wrong(ex) !== -xOf(ex));
  const self: ErrorDef = {
    id,
    family,
    rule,
    detect: (ex, given) => (wrong ? is(given, wrong(ex)) : false),
    explain: (ex) => explanation(explainText(ex), resolution(ex)),
    trap: (level, rng) =>
      wrong
        ? redraw(() => generate(level, rng), (ex) => usable(ex) && meta(ex).a < 0)
        : generate(level, rng),
    wrongValues: (ex) => (wrong && usable(ex) ? [rat(wrong(ex))] : []),
  };
  return self;
};
const errors: ErrorDef[] = [
  error('signe-perdu-division', 'signe', RULE_1, text['signe-perdu-division'], (ex) => -xOf(ex)),
  error('soustraire-coef', 'calcul', RULE_2, text['soustraire-coef'], (ex) => meta(ex).c - meta(ex).b - meta(ex).a),
  error('sens-non-change', 'signe', RULE_1, () => 'On a divisé par un nombre négatif : < devient >, ≤ devient ≥.'),
  error('sens', 'signe', RULE_1, () => 'On a divisé par un nombre négatif : le sens se retourne, puis on écrit l’intervalle.'),
  error('sens-change-a-tort', 'signe', RULE_2, () => 'Le sens ne change que pour une multiplication ou une division par un nombre négatif.'),
  error('signe-borne', 'signe', RULE_1, () => 'La borne est le résultat de la division, avec son signe.'),
  error('cote', 'ecriture', RULE_3, () => 'Lis le sens obtenu après la division : plus petit, vers la gauche ; plus grand, vers la droite.'),
  error('ordre', 'calcul', RULE_3, () => 'On écrit la plus petite borne à gauche, la plus grande à droite.'),
  error('crochet', 'ecriture', RULE_3, () => 'Borne comprise (≤ ou ≥) : crochet fermé. Borne exclue (< ou >) : crochet ouvert.'),
  error('crochet-infini', 'ecriture', RULE_3, () => 'On n’atteint jamais l’infini : contre ∞, le crochet est toujours ouvert.'),
];

// ——— Questions faites à la main ———
const saisieQ = (ex: Exercise): Question => ({
  kind: 'saisie',
  ex,
  promptLatex: `${inequationLatex(ex)} \\quad\\text{la borne de x est}\\quad \\square`,
});
const intervalleQ = (ex: Exercise): Question => intervalleFromInequality(ex, eqOf(ex), { by: meta(ex).a });
const customQuestion: CourseDef['customQuestion'] = (kind, ctx) => {
  const trap = errors.find((e) => e.id === ctx.trapErrorType);
  const ex = trap ? trap.trap(ctx.level, ctx.rng) : generate(ctx.level, ctx.rng);
  if (kind === 'resoudre') return { kind: 'resoudre', ex, start: eqOf(ex) };
  if (kind === 'intervalle') return intervalleQ(ex);
  return saisieQ(ex);
};

function feedbackText(q: Question, o: Outcome): string | null {
  if (o.correct || o.unfinished || o.errorFamily === 'ecriture' || q.kind !== 'saisie') return null;
  if (o.errorType === 'signe-perdu-division') return text['signe-perdu-division'](q.ex);
  if (o.errorType === 'soustraire-coef') return text['soustraire-coef'](q.ex);
  return `Retire ${paren(meta(q.ex).b)} des deux côtés, puis divise par ${paren(meta(q.ex).a)} : la borne est ${sgn(xOf(q.ex))}.`;
}

// ——— Leçon ———
const REGLE1 = '**Quand je multiplie ou je divise par un nombre négatif, le sens de l’inégalité se retourne : < devient >, ≤ devient ≥.**';
const REGLE2 = '**Je retire d’abord le nombre seul, sans changer le sens. Je divise ensuite par le nombre devant x : le sens se retourne seulement s’il est négatif.**';
const REGLE3 = '**J’écris l’intervalle à partir du sens obtenu après la division, pas du sens de départ.**';

const guess = choix(
  mk(1, -2, 0, 6, '<'),
  'Le nombre −5 est-il une solution de −2x < 6 ?',
  options3(
    ['Non', '−2 × (−5) = 10, et 10 n’est pas plus petit que 6 : −5 n’est pas solution. Donc x < −3 serait faux.'],
    ['Oui', '−2 × (−5) = 10, et 10 n’est pas plus petit que 6. Remplace x par le nombre pour vérifier.'],
    ['On ne peut pas savoir', 'On peut toujours remplacer x par le nombre et calculer.'],
  ),
  0,
  '-2x < 6',
);

/** Une scène en lignes d'écriture, avec l'intervalle obtenu colorié sur la droite graduée. */
const ivScene = (calcs: (string | ReturnType<typeof hl>)[][], ...intervals: Interval[]): Scene => ({ ...linesScene(...calcs), interval: { intervals } });
const iv = (rel: Strict, b: number): Interval => intervalOfRelation(rel, rat(b));

const retourne: EtapeStep[] = [
  step('Partons d’une inégalité vraie : **2 < 5**. Multiplions les deux côtés par −1 : on obtient −2 et −5.', {
    scene: linesScene(['2 < 5'], ['−2 ', hl('?'), ' −5']),
  }),
  step('Sur la droite, −5 est plus à gauche que −2 : donc −2 est [ ? ] que −5.', {
    scene: linesScene(['2 < 5'], ['−2 ', hl('?'), ' −5']),
    after: linesScene(['2 < 5'], ['−2 ', hl('>'), ' −5']),
    action: trouOf('Sur la droite, −5 est plus à gauche que −2 : donc −2 est [ ? ] que −5.', ['plus grand', 'plus petit'], 0, {
      1: '−5 est à gauche de −2, donc −5 est le plus petit : −2 est le plus grand.',
    }),
  }),
  step(undefined, { scene: linesScene(['−2x < 6'], ['−2x ÷ (−2) ', hl('>'), ' 6 ÷ (−2)'], ['x > −3']), rule: { n: 1, text: REGLE1 } }),
];

const retirerDiviser: EtapeStep[] = [
  step('Dans −2x + 1 ≥ 7, on commence par retirer 1 des deux côtés, comme pour une équation.', {
    scene: linesScene(['−2x + 1 ≥ 7'], ['−2x + 1 − 1 ≥ 7 − 1']),
  }),
  step('Retirer 1 des deux côtés ne change pas le sens : on obtient −2x [ ? ] 6.', {
    scene: linesScene(['−2x + 1 ≥ 7'], ['−2x + 1 − 1 ≥ 7 − 1']),
    after: linesScene(['−2x + 1 ≥ 7'], ['−2x + 1 − 1 ≥ 7 − 1'], ['−2x ', hl('≥'), ' 6']),
    action: trouOf('Retirer 1 des deux côtés ne change pas le sens : on obtient −2x [ ? ] 6.', ['≥', '≤'], 0, {
      1: 'Retirer 1 est une soustraction : le sens reste ≥. Il ne change que pour une division par un négatif.',
    }),
  }),
  step(undefined, { scene: linesScene(['−2x ≥ 6'], ['−2x ÷ (−2) ≤ 6 ÷ (−2)'], ['x ', hl('≤'), ' −3']), rule: { n: 2, text: REGLE2 } }),
];

const intervalle: EtapeStep[] = [
  step('Dans −3x > 12, on divise par −3 : le sens se retourne et on obtient **x < −4**.', {
    scene: linesScene(['−3x > 12'], ['x ', hl('<'), ' −4']),
  }),
  step('Le bon sens est x < −4 : l’intervalle est [ ? ].', {
    scene: linesScene(['−3x > 12'], ['x < −4']),
    after: ivScene([['−3x > 12'], ['x < −4'], [']', hl('−∞'), ' , −4[']], iv('<', -4)),
    action: trouOf('Le bon sens est x < −4 : l’intervalle est [ ? ].', [']−∞ , −4[', ']−4 , +∞['], 0, {
      1: 'Cet intervalle est celui de x > −4, le sens de départ. Il faut lire le sens après la division.',
    }),
  }),
  step(undefined, { scene: ivScene([['−x ≥ 2'], ['x ≤ −2'], [hl(']'), '−∞ , −2]']], iv('<=', -2)), rule: { n: 3, text: REGLE3 } }),
];

const exGuide = mk(1, -4, 5, 9, '<'); // −4x + 5 < 9, x > −1

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Un nombre qui ne convient pas',
    intro: ['Une inéquation se résout comme une équation, avec une seule différence.', 'Un nombre négatif peut retourner le sens : on va voir pourquoi.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(RULE_1.label, retourne),
  lecon(
    small(mk(1, -3, 0, 9, '>'), '-3x > 9', 'On divise les deux côtés par −3. Que devient l’inégalité ?', [
      ['x < −3', 'Oui : 9 ÷ (−3) = −3, et le sens se retourne : > devient <.'],
      ['x > −3', 'Tu as divisé par −3 sans retourner le sens.'],
      ['x < 3', 'Le sens est juste, mais 9 ÷ (−3) = −3 : le résultat est négatif.'],
    ], 0),
  ),
  etapes(RULE_2.label, retirerDiviser),
  lecon(
    small(mk(1, -1, 3, 5, '>='), '-x + 3 \\geqslant 5', 'On retire 3, puis on divise par −1. Que trouve-t-on ?', [
      ['x ≤ −2', 'Oui : −x ≥ 2, puis on divise par −1 et le sens se retourne.'],
      ['x ≥ −2', 'Le nombre est bon, mais le sens n’a pas été retourné après la division par −1.'],
      ['x ≤ 2', 'Le sens est bon, mais 2 ÷ (−1) = −2.'],
    ], 0),
  ),
  etapes(RULE_3.label, intervalle),
  texted(
    decouverte(
      choix(
        mk(1, -2, 0, 6, '<'),
        'Dans laquelle des deux inéquations le sens se retourne-t-il ?',
        options3(
          ['Dans B, −2x < 6', 'Oui : dans B, on divise par −2, un nombre négatif.'],
          ['Dans A, 2x < 6', 'Dans A, on divise par 2, un nombre positif : le sens reste.'],
          ['Dans les deux', 'Le signe devant le 2 change tout : seul un négatif retourne le sens.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ['Regarde le signe devant le 2.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Inéquation A', latex: '2x < 6' },
        b: { label: 'Inéquation B', latex: '-2x < 6' },
        note: '',
        inPlace: true,
        highlight: { a: toks(hl('2'), 'x < 6'), b: toks(hl('−2'), 'x < 6') },
        after: ['Dans A, on divise par 2 : x < 3.', 'Dans B, on divise par −2 : x > −3.'],
      },
    },
  ),
  texted(exemple({ kind: 'resoudre', ex: exGuide, start: eqOf(exGuide), guided: true }), {
    title: 'On le fait ensemble',
    subtitle: 'Résous −4x + 5 < 9. À chaque ligne, une aide te dit quoi faire.',
  }),
  annonceFin(),
];

export const inequationsResoudrePremierDegre: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 8,
  title: 'Résoudre une inéquation du premier degré',
  shortTitle: 'Inéquations',
  rule: RULE,
  parts,
  // pas de série de pratique : la pastille s'arrête avant l'exemple guidé
  lessonLength: parts.findIndex((p) => p.type === 'question' && p.activity === 'exemple'),
  unePhrase: true,
  // 2 résolutions complètes sur 5, les 3 autres en intervalle (choix du symbole après la division, puis S)
  endExercises: { count: 5, kind: 'saisie', mix: ['resoudre', 'intervalle', 'resoudre', 'intervalle', 'intervalle'] },
  formats: ['saisie', 'resoudre', 'intervalle'],
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
      'Je retire le nombre seul des deux côtés, sans changer le sens.',
      'Je divise par le nombre devant x : si c’est un négatif, le sens se retourne.',
      'J’écris l’intervalle avec le sens obtenu après la division.',
    ],
    examples: ['−2x + 1 ≥ 7 ; −2x ≥ 6 ; x ≤ −3', '2x < 6 ; x < 3 (diviser par un positif : le sens reste)'],
    mistake: { wrong: '−2x < 6, donc x < −3', why: 'On a divisé par −2 **sans retourner le sens**. Il devient x > −3.' },
    tip: 'Vérifie avec un nombre : x = −5 donne −2 × (−5) = 10, qui n’est pas plus petit que 6.',
  },
};
