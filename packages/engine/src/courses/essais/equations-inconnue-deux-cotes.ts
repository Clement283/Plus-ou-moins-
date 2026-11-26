// Cours 5 du module Équations et inéquations — « Résoudre ax + b = cx + d » (déroulé guidé, 2026-11-26) :
// découverte, 3 règles (retirer le x de droite, compter les x, finir comme avant), une comparaison utile,
// 2 petites questions, un exemple guidé (l'écran « À toi de résoudre » avec l'aide d'office), puis 5 résolutions écrites.
// Fiche : docs/modules/02-equations-inequations/equations-inconnue-deux-cotes.md
// L'exercice garde le calcul qui donne x, (d − b) ÷ (a − c), dans `expr` ; l'équation est dans `meta` (a, b, c, d).
import { num, op } from '../../math/expr';
import { cst, equation, equationLatex, memberLatex, xt, type Equation } from '../../math/equation';
import { resolve } from '../../math/solve';
import { rat } from '../../math/rational';
import type { Rng } from '../../rng';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, Level } from '../types';
import {
  NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, buildErrors, choix, decouverte, draw, etapes, exemple, explanation,
  hl, is, lecon, linesScene, makeExercise, options3, redraw, small, step, texted, toks, trouOf, txt, type ErrorSpec,
} from '../calculs/shared';

const ID = 'equations-inconnue-deux-cotes';
const RULE = 'Pour résoudre ax + b = cx + d, je regroupe les x d’un seul côté, puis je finis comme pour ax + b = c.';

// ——— Exercice : ax + b = cx + d, avec a > c + 1, x entier ———
interface Params { a: number; b: number; c: number; d: number }
const p = (ex: Exercise): Params => ex.meta as unknown as Params;
const A_RANGE: Record<Level, [number, number]> = { 1: [3, 6], 2: [4, 9], 3: [5, 12] };
const B_RANGE: Record<Level, [number, number]> = { 1: [1, 9], 2: [2, 20], 3: [2, 30] };
const X_RANGE: Record<Level, [number, number]> = { 1: [1, 6], 2: [2, 12], 3: [2, 15] };
const mk = (level: Level, a: number, b: number, c: number, d: number): Exercise => ({
  ...makeExercise(ID, level, op('/', num(d - b), num(a - c))),
  meta: { a, b, c, d } as unknown as Record<string, unknown>,
});
function generate(level: Level, rng: Rng): Exercise {
  return redraw(
    () => {
      const a = draw(rng, A_RANGE[level]);
      const c = draw(rng, [level === 1 ? 1 : 2, a - 2]);
      const x = draw(rng, X_RANGE[level]) * (level > 1 && rng() < 0.5 ? -1 : 1);
      const b = draw(rng, B_RANGE[level]) * (rng() < 0.5 ? -1 : 1);
      return mk(level, a, b, c, b + (a - c) * x);
    },
    (ex) => p(ex).c >= 1 && p(ex).a - p(ex).c >= 2 && p(ex).d !== 0 && (ex.level > 1 || p(ex).d > 0),
  );
}
const eqOf = (ex: Exercise): Equation => equation([xt(p(ex).a), cst(p(ex).b)], [xt(p(ex).c), cst(p(ex).d)]);
/** Les lignes de la résolution ; la division s'écrit « 3x ÷ 3 = 9 ÷ 3 » (pas de fraction en étage). */
const resolution = (ex: Exercise): string[] =>
  resolve(eqOf(ex)).lines.map((l) =>
    l.eq.div === undefined ? equationLatex(l.eq) : `${memberLatex(l.eq.left)} \\div ${l.eq.div} = ${memberLatex(l.eq.right)} \\div ${l.eq.div}`,
  );
/** Écriture en texte (− typographique) : « 3x + 2 = x + 8 ». */
const eqText = (ex: Exercise): string => equationLatex(eqOf(ex)).replace(/-/g, '−');

// ——— Erreurs reconnues ———
const NO = 1e9; // aucune réponse ne vaut ça : l'erreur ne s'applique pas à cette équation
const whole = (n: number, d: number): number => (Number.isInteger(n / d) ? n / d : NO);
const e = (ex: Exercise): number => p(ex).a - p(ex).c;
const q = (ex: Exercise): number => p(ex).d - p(ex).b;
const cx = (c: number): string => (c === 1 ? 'x' : `${c}x`);
const RULE_1 = { n: 1, label: 'Retirer le x de droite', partIndex: 1 };
const RULE_2 = { n: 2, label: 'Compter les x qui restent', partIndex: 3 };
const RULE_3 = { n: 3, label: 'Finir comme avant', partIndex: 5 };
const RULES: Record<string, NonNullable<ErrorDef['rule']>> = {
  'ajouter-x': RULE_1,
  'x-oublie': RULE_2,
  'nombre-mal-deplace': RULE_3,
  'signe-resultat': RULE_3,
};
const redrawWhere = (ok: (ex: Exercise) => boolean) => (level: Level, rng: Rng): Exercise => redraw(() => generate(level, rng), ok);

const specs: ErrorSpec[] = [
  {
    id: 'ajouter-x',
    family: 'calcul',
    detect: (ex, given) => is(given, whole(q(ex), p(ex).a + p(ex).c)),
    text: (ex) =>
      `Tu as ajouté ${cx(p(ex).c)} au lieu de le retirer. Pour le faire disparaître à droite, on le retire des deux côtés : à gauche, ${p(ex).a}x − ${cx(p(ex).c)} = ${e(ex)}x.`,
    draw: redrawWhere((ex) => whole(q(ex), p(ex).a + p(ex).c) !== NO),
    sample: (ex) => whole(q(ex), p(ex).a + p(ex).c),
  },
  {
    id: 'x-oublie',
    family: 'calcul',
    detect: (ex, given) => is(given, whole(q(ex), p(ex).a)),
    text: (ex) =>
      `Tu as oublié le ${cx(p(ex).c)} de droite. On le retire des deux côtés : ${p(ex).a}x − ${cx(p(ex).c)} = ${e(ex)}x, donc on divise par ${e(ex)}, pas par ${p(ex).a}.`,
    draw: redrawWhere((ex) => whole(q(ex), p(ex).a) !== NO),
    sample: (ex) => whole(q(ex), p(ex).a),
  },
  {
    id: 'nombre-mal-deplace',
    family: 'calcul',
    detect: (ex, given) => is(given, whole(p(ex).d + p(ex).b, e(ex))),
    text: (ex) => {
      const { b, d } = p(ex);
      const B = Math.abs(b);
      return b > 0
        ? `Tu as ajouté ${B} au lieu de le retirer. Une fois les x regroupés, on retire ${B} des deux côtés : ${txt(d)} − ${B} = ${txt(q(ex))}.`
        : `Tu as retiré ${B} au lieu de l’ajouter. Dans ${e(ex)}x − ${B}, le ${B} est retiré : on l’ajoute des deux côtés, ${txt(d)} + ${B} = ${txt(q(ex))}.`;
    },
    draw: redrawWhere((ex) => whole(p(ex).d + p(ex).b, e(ex)) !== NO),
    sample: (ex) => whole(p(ex).d + p(ex).b, e(ex)),
  },
  {
    id: 'signe-resultat',
    family: 'signe',
    detect: (ex, given) => ex.answer.n !== 0 && is(given, -ex.answer.n),
    text: (ex) => `Le signe de x est faux : ${txt(q(ex))} ÷ ${e(ex)} = ${txt(ex.answer.n)}. Un nombre négatif divisé par un nombre positif reste négatif.`,
    draw: redrawWhere((ex) => q(ex) < 0 || p(ex).b < 0),
    sample: (ex) => -ex.answer.n,
  },
];
const errors: ErrorDef[] = buildErrors(specs, resolution).map((x): ErrorDef => ({ ...x, rule: RULES[x.id] as NonNullable<ErrorDef['rule']> }));

// ——— Questions ———
const saisieQ = (ex: Exercise): Question => ({ kind: 'saisie', ex, promptLatex: `${equationLatex(eqOf(ex))} \\quad\\text{donc}\\quad x = \\square` });
const customQuestion: CourseDef['customQuestion'] = (kind, ctx) => {
  const trap = errors.find((x) => x.id === ctx.trapErrorType);
  const ex = trap ? trap.trap(ctx.level, ctx.rng) : generate(ctx.level, ctx.rng);
  return kind === 'resoudre' ? { kind: 'resoudre', ex, start: eqOf(ex) } : saisieQ(ex);
};

const OTHER = (ex: Exercise): string => {
  const { b, c } = p(ex);
  return `Pour résoudre ${eqText(ex)} : on retire ${cx(c)} des deux côtés, puis on ${b > 0 ? 'retire' : 'ajoute'} ${Math.abs(b)}, puis on divise par ${e(ex)}.`;
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
const REGLE1 = '**Je retire le terme en x de droite des deux côtés : il disparaît à droite.**';
const REGLE2 = '**Je compte les x qui restent à gauche : je soustrais les coefficients, et x veut dire 1x.**';
const REGLE3 = '**Je finis comme avant : je retire le nombre seul, puis je divise par le coefficient de x.**';

const guess = choix(
  mk(1, 3, 2, 1, 8),
  'À ton avis, quel nombre cache x ?',
  options3(
    ['3', 'Oui : 3 × 3 + 2 = 11 et 3 + 8 = 11. Le cours te montre comment le trouver à coup sûr.'],
    ['6', '6 donne 3 × 6 + 2 = 20 à gauche, mais 6 + 8 = 14 à droite. Les deux côtés doivent être égaux.'],
    ['8', '8 donne 3 × 8 + 2 = 26 à gauche, mais 8 + 8 = 16 à droite. Les deux côtés doivent être égaux.'],
  ),
  0,
  '3x + 2 = x + 8',
);

const retirer: EtapeStep[] = [
  step('Dans **4x + 3 = x + 18**, il y a des x des deux côtés. Pour résoudre, je veux **tous les x du même côté**.', {
    scene: linesScene(['', hl('4x'), ' + 3 = ', hl('x'), ' + 18']),
  }),
  step('Pour faire disparaître le x de droite, je fais l’opération contraire, des deux côtés.', {
    scene: linesScene(['4x + 3 = x + 18']),
    after: linesScene(['4x + 3 = x + 18'], ['4x + 3 ', hl('− x'), ' = x + 18 ', hl('− x')]),
    action: trouOf('Pour faire disparaître le x de droite, je [ ? ] x des deux côtés.', ['retire', 'ajoute'], 0, {
      1: 'Ajouter x ferait 2x à droite : le x ne disparaît pas. Il faut retirer x.',
    }),
  }),
  step(undefined, { scene: linesScene(['4x + 3 = x + 18'], ['4x + 3 − x = x + 18 − x'], ['4x + 3 − x = 18']), rule: { n: 1, text: REGLE1 } }),
];

const compter: EtapeStep[] = [
  step('Prenons **7x + 1 = 3x + 13**. Je retire 3x des deux côtés : à gauche, il reste 7x − 3x.', {
    scene: linesScene(['7x + 1 = 3x + 13'], ['7x + 1 − 3x = 3x + 13 − 3x'], ['7x + 1 − 3x = 13']),
  }),
  step('Je soustrais les coefficients de x : 7 − 3.', {
    scene: linesScene(['7x + 1 − 3x = 13']),
    after: linesScene(['7x + 1 − 3x = 13'], ['', hl('4x'), ' + 1 = 13']),
    action: trouOf('Dans 7x − 3x, il reste [ ? ] x.', ['4', '10'], 0, {
      1: 'On retire 3x, on ne l’ajoute pas : 7 − 3 = 4, et non 7 + 3.',
    }),
  }),
  step(undefined, { scene: linesScene(['7x + 1 = 3x + 13'], ['7x + 1 − 3x = 13'], ['4x + 1 = 13']), rule: { n: 2, text: REGLE2 } }),
];

const finir: EtapeStep[] = [
  step('Après avoir regroupé les x, on retrouve **ax + b = c**, comme dans le cours précédent. Ici : 3x + 5 = 14.', {
    scene: linesScene(['4x + 5 = x + 14'], ['4x + 5 − x = 14'], [hl('3x + 5 = 14')]),
  }),
  step('Il reste le 5 et le 3. Je choisis par quoi commencer.', {
    scene: linesScene(['3x + 5 = 14']),
    after: linesScene(['3x + 5 = 14'], ['3x + 5 ', hl('− 5'), ' = 14 ', hl('− 5')]),
    action: trouOf('Je commence par [ ? ].', ['retirer 5', 'diviser par 3'], 0, {
      1: 'Si on divise d’abord par 3, il faudrait aussi diviser le 5. On retire d’abord le nombre seul.',
    }),
  }),
  step(undefined, { scene: linesScene(['3x + 5 = 14'], ['3x = 9'], ['x = 3']), rule: { n: 3, text: REGLE3 } }),
];

const exGuide = mk(1, 4, 9, 1, -3); // 4x + 9 = x − 3, x = −4 (résultat négatif, non montré par la leçon)

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Des x des deux côtés',
    intro: ['Dans cette équation, il y a des x à gauche et à droite.', 'Tu apprends à les regrouper pour revenir à une équation que tu sais déjà résoudre.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes(RULE_1.label, retirer),
  texted(
    decouverte(
      choix(
        mk(1, 2, 3, 1, 11),
        'Dans quelle équation commence-t-on par retirer x ?',
        options3(
          ['Dans B, 2x + 3 = x + 11', 'Oui : dans B, il y a un x à droite, on le retire d’abord.'],
          ['Dans A, 2x + 3 = 11', 'Dans A, il n’y a pas de x à droite : on retire 3 tout de suite.'],
          ['Dans les deux', 'Il faut un x de chaque côté pour avoir à le retirer.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ['Regarde s’il y a un x à droite du signe =.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Équation A', latex: '2x + 3 = 11' },
        b: { label: 'Équation B', latex: '2x + 3 = x + 11' },
        note: '',
        inPlace: true,
        highlight: { a: toks('2x + 3 = ', hl('11')), b: toks('2x + 3 = ', hl('x'), ' + 11') },
        after: ['Dans A, on retire 3 tout de suite.', 'Dans B, on retire d’abord x, pour avoir les x du même côté.'],
      },
    },
  ),
  etapes(RULE_2.label, compter),
  lecon(
    small(mk(1, 6, 2, 1, 12), '6x + 2 = x + 12', 'On retire x des deux côtés. Combien de x reste-t-il à gauche ?', [
      ['5x', 'Oui : x veut dire 1x, et 6 − 1 = 5.'],
      ['6x', 'Le x de droite est retiré : à gauche, 6x − x = 5x, et non 6x.'],
      ['7x', 'On retire x, on ne l’ajoute pas : 6 − 1 = 5.'],
    ], 0),
  ),
  etapes(RULE_3.label, finir),
  lecon(
    small(mk(1, 5, -4, 2, 8), '3x − 4 = 8', 'On a retiré 2x et on obtient 3x − 4 = 8. Que fait-on ensuite ?', [
      ['J’ajoute 4 des deux côtés', 'Oui : dans 3x − 4, le 4 est retiré, on l’ajoute pour le faire disparaître.'],
      ['Je retire 4 des deux côtés', 'Retirer 4 donnerait 3x − 8 : le 4 ne disparaît pas.'],
      ['Je divise par 3 tout de suite', 'Il faut d’abord isoler le terme en x : on s’occupe du nombre seul avant de diviser.'],
    ], 0),
  ),
  texted(exemple({ kind: 'resoudre', ex: exGuide, start: eqOf(exGuide), guided: true }), {
    title: 'On le fait ensemble',
    subtitle: 'Résous 4x + 9 = x − 3. À chaque ligne, une aide te dit quoi faire.',
  }),
  annonceFin(),
];

export const equationsInconnueDeuxCotes: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 5,
  title: 'Résoudre ax + b = cx + d',
  shortTitle: 'ax + b = cx + d',
  rule: RULE,
  parts,
  // pas de série de pratique : la pastille s'arrête avant l'exemple guidé
  lessonLength: parts.findIndex((x) => x.type === 'question' && x.activity === 'exemple'),
  unePhrase: true,
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
      'Je retire le terme en x de droite des deux côtés.',
      'Je compte les x qui restent à gauche : je soustrais les coefficients.',
      'Je finis comme avant : le nombre seul, puis la division.',
    ],
    examples: ['4x + 5 = x + 14 ; 3x + 5 = 14 ; 3x = 9 ; x = 3', '5x − 4 = 2x + 8 ; 3x − 4 = 8 ; 3x = 12 ; x = 4'],
    mistake: { wrong: '7x + 1 = 3x + 13, donc x = 12 ÷ 7', why: 'On a oublié de retirer **3x** : à gauche, 7x − 3x = 4x, donc x = 12 ÷ 4 = 3.' },
    tip: 'Écris une ligne par opération : d’abord retirer le x de droite, ensuite le nombre seul, enfin diviser.',
  },
};
