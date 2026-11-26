// Cours 2 du module Équations et inéquations — VERSION COURTE (essai, 2026-11-26) : même cours que `equations-ajouter-retirer`,
// écrit avec les règles de rédaction du module.md (environ 10 blocs, un même geste 2 ou 3 fois au plus, étapes écrites aux exercices).
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

const ID = 'equations-ajouter-retirer-court';
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

const ex2 = mk(1, -4, 7);
const ex4 = mk(1, -5, 4);

const PRATIQUE = pratique(
  'Pratique',
  [
    { question: opTrouQ(mk(1, 4, 9)), texts: { consigne: 'Pour trouver x dans x + 4 = 9, on retire 4 des deux côtés. **Tape le nombre retiré à droite.**' } },
    {
      question: choix(
        mk(1, 5, 12),
        'Quelle ligne vient juste après x + 5 = 12 ?',
        options3(
          ['x + 5 − 5 = 12 − 5', 'Oui : on retire 5 des deux côtés.'],
          ['x + 5 − 5 = 12', 'On a retiré 5 à gauche seulement. Il faut le faire aussi à droite.'],
          ['x + 5 + 5 = 12 + 5', 'On a ajouté 5 : le 5 ne disparaît pas. Il faut le retirer.'],
        ),
        0,
        'x + 5 = 12',
      ),
      texts: { consigne: 'Touche la bonne ligne.' },
    },
    {
      question: choix(
        mk(1, 5, 9),
        'Le nombre 4 est-il solution de x + 5 = 9 ? Remplace x par 4.',
        options3(
          ['Oui, 4 + 5 = 9', 'Oui : les deux membres donnent 9.'],
          ['Non, 4 + 5 = 8', 'Recalcule : 4 + 5 = 9.'],
          ['Non, 4 + 5 = 10', 'Recalcule : 4 + 5 = 9.'],
        ),
        0,
        'x + 5 = 9',
      ),
      texts: { consigne: 'Remplace x par 4, calcule le membre de gauche, puis touche la bonne réponse.' },
    },
    {
      question: { kind: 'resoudre', ex: ex4, start: eqOf(ex4) },
      texts: { consigne: 'Écris chaque ligne, avec ta méthode, jusqu’à avoir x tout seul. Tu peux demander un indice.' },
    },
  ],
  'Maintenant, deux exemples pour t’aider à les résoudre en entier.',
);

const exemple2: EtapeStep[] = [
  step('Résolvons **x − 4 = 7**. Ici le 4 est retiré de x : on l’**ajoute des deux côtés**.', { scene: linesScene(['x − 4 = 7']), action: { type: 'comprends' } }),
  step('On écrit la ligne « opération » : **x − 4 + 4 = 7 + 4**.', {
    scene: linesScene(['x − 4 = 7'], [hl('x − 4 + 4 = 7 + 4')]),
    action: { type: 'comprends' },
  }),
];

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
  texted(
    decouverte(
      choix(
        mk(1, 3, 7),
        'Dans lequel des deux calculs retire-t-on 3 pour trouver x ?',
        options3(
          ['Dans le calcul A, 7 − 3', 'Oui : 7 − 3 est le calcul fait à droite pour trouver x.'],
          ['Dans le calcul B, 4 + 3', 'Dans le B, x vaut déjà 4 : on remplace x et on additionne, pour vérifier.'],
          ['Dans les deux calculs', 'Le B ajoute 3 : il sert seulement à vérifier une réponse.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ['Voici deux calculs qui se ressemblent. Regarde bien l’opération.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Calcul A : trouver x', latex: '7 - 3' },
        b: { label: 'Calcul B : vérifier x = 4', latex: '4 + 3' },
        note: 'Le calcul B vient du cours précédent : tu sais déjà le faire. Ici, tu observes seulement ce qui change.',
        highlight: { a: toks('7 ', hl('−'), ' 3'), b: toks('4 ', hl('+'), ' 3') },
        after: ['Dans le calcul A, on retire 3 pour trouver x.', 'Dans le calcul B, x vaut déjà 4 : on additionne 3 pour vérifier.', 'On retire pour chercher x, on remplace x pour vérifier.'],
      },
    },
  ),
  autres({
    title: 'Autres façons de faire',
    recap: {
      title: 'Les règles à retenir',
      rules: [
        { title: '1. La même chose des deux côtés', ok: 'x + 3 − 3 = 7 − 3', ko: 'x + 3 − 3 = 7' },
        { title: '2. L’opération contraire', ok: 'x − 3 = 5 : j’ajoute 3', ko: 'x − 3 = 5 : je retire 3' },
        { title: '3. Je calcule avec les signes', ok: 'x = 4 − 9 = −5', ko: 'x = 4 − 9 = 5' },
      ],
      sentence: 'Je retire (ou j’ajoute) le même nombre des deux côtés pour avoir x tout seul.',
    },
    intro: 'La méthode marche toujours. Voici d’autres façons de faire : **choisis celle que tu veux essayer**.',
    techniques: [
      {
        name: 'Quel nombre ?',
        quand: 'Les nombres sont petits.',
        example: 'x + 3 = 7 : quel nombre plus 3 fait 7 ? C’est 4.',
        how: 'Tu cherches de tête le nombre qui, ajouté à 3, donne 7. Tu peux ensuite écrire la ligne « opération » pour vérifier.',
        essai: {
          kind: 'saisie',
          consigne: 'Essaie de tête : x + 5 = 9. **Tape x.**',
          calc: 'x + 5 = 9',
          answer: 4,
          yes: 'Oui : 4 + 5 = 9.',
          errors: [
            { values: [14], message: '14 + 5 = 19, pas 9. Cherche le nombre qui, plus 5, fait 9.' },
            { values: [9], message: '9 + 5 = 14, pas 9. Il faut aussi retirer 5 à droite.' },
          ],
          fallback: 'Pas tout à fait : remplace x par ton nombre et regarde si tu trouves 9.',
        },
      },
      {
        name: 'Vérifier en remplaçant',
        quand: 'Après chaque résolution.',
        example: 'x = 4 pour x + 3 = 7 : 4 + 3 = 7, c’est juste.',
        how: 'Tu remplaces x par ta réponse et tu calcules le membre de gauche. Si tu trouves le membre de droite, c’est bon.',
        essai: {
          kind: 'choix',
          consigne: 'On a trouvé x = 6 pour x + 4 = 10. **Touche la bonne conclusion.**',
          calc: 'x + 4 = 10',
          options: ['6 + 4 = 10 : c’est juste', '6 + 4 = 11 : c’est faux', '6 + 4 = 2 : c’est faux'],
          correct: 0,
          yes: 'Oui : 6 + 4 = 10, la réponse est juste.',
          no: 'Calcule 6 + 4 : on trouve 10, comme à droite.',
        },
      },
    ],
    outro: 'Ensuite, tu t’entraînes avec quatre questions.',
  }),
  PRATIQUE,
  etapes('Exemple guidé', exemple2),
  texted(exemple(trou(ex2, 'x - 4 + \\square = 7 + 4', 4)), {
    consigne: 'Tape le nombre ajouté des deux côtés.',
    intro: ['Équation de départ : **x − 4 = 7**.'],
  }),
  texted(exemple(trou(ex2, 'x = 7 + 4 = \\square', 11)), {
    consigne: 'Tape le résultat de 7 + 4.',
    intro: ['Maintenant que x est tout seul, calcule le membre de droite.'],
    mention: '',
  }),
  annonceFin(),
];

export const equationsAjouterRetirerCourt: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 2,
  title: 'Retirer ou ajouter le même nombre des deux côtés (version courte)',
  shortTitle: 'Ajouter, retirer (court)',
  rule: RULE,
  parts,
  lessonLength: parts.findIndex((p) => p.type === 'pratique'),
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
