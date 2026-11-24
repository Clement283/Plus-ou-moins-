// Cours 1 — Additionner deux nombres de même signe (doc 06).
import { num, op, toLatex } from '../../math/expr';
import type { Rng } from '../../rng';
import type { Outcome, Question } from '../../exercises/types';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, LineScene, Level, Scene, SceneToken } from '../types';
import {
  COMPLETE, MODULE_ID, SIGN_CLASSES, SIZES, absIs, buildErrors, chance, choix, decouverte, draw, droiteQ, etapes, exemple, explanation,
  isOpposite, makeExercise, operands, pratique, resultLine, saisie, sg, signBox, signed, step, stepped, texted, toText, trou, txt
} from './shared';
import { rat } from '../../math/rational';

const ID = 'c01-additionner-meme-signe';
const RULE = "Même signe : j'additionne les nombres sans leur signe, et je garde le signe.";

const sum = (level: Level, a: number, b: number): Exercise => makeExercise(ID, level, op('+', num(a), num(b)));

function generate(level: Level, rng: Rng): Exercise {
  const negative = chance(rng, 0.7);
  return sum(level, signed(draw(rng, SIZES[level]), negative), signed(draw(rng, SIZES[level]), negative));
}

function resolution(ex: Exercise): string[] {
  const [a, b] = operands(ex.expr).map(Math.abs) as [number, number];
  const sign = ex.answer.n < 0 ? '-' : '+';
  return [toLatex(ex.expr), `= ${sign}(${a} + ${b})`, resultLine(ex)];
}

const baseErrors = buildErrors(
  [
    {
      id: 'signe-oublie',
      family: 'signe',
      detect: isOpposite,
      // Doc 07 #6A: the sentence follows the sign of the two numbers.
      text: (ex) =>
        ex.answer.n < 0
          ? 'Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − !'
          : 'Les deux nombres sont positifs : le résultat est positif aussi.',
      draw: (level, rng) => sum(level, -draw(rng, SIZES[level]), -draw(rng, SIZES[level])),
      sample: (ex) => -ex.answer.n,
      // −3 + (−5) = +(3 + 5) = 8
      wrongLines: (ex, w) => {
        const [a, b] = operands(ex.expr).map(Math.abs) as [number, number];
        return w === -ex.answer.n ? stepped(ex, `${sg(w)}(${a} + ${b})`, w) : null;
      },
    },
    {
      id: 'soustraction-au-lieu-addition',
      family: 'calcul',
      detect: (ex, given) => {
        const [a, b] = operands(ex.expr).map(Math.abs) as [number, number];
        return absIs(given, Math.abs(a - b));
      },
      text: (ex) => {
        const [a, b] = operands(ex.expr).map(Math.abs) as [number, number];
        return `Même signe : on **additionne** les nombres, on ne les soustrait pas. ${a} + ${b} = ${a + b}, donc ${txt(ex.answer.n)}.`;
      },
      // « deux nombres d'écart important » : the larger is at least 3 times the smaller.
      draw: (level, rng) => {
        const [lo, hi] = SIZES[level];
        const small = draw(rng, [lo, Math.floor(hi / 3)]);
        const big = draw(rng, [3 * small, hi]);
        const negative = chance(rng, 0.7);
        const [a, b] = chance(rng, 0.5) ? [small, big] : [big, small];
        return sum(level, signed(a, negative), signed(b, negative));
      },
      sample: (ex) => {
        const [a, b] = operands(ex.expr).map(Math.abs) as [number, number];
        return Math.sign(ex.answer.n) * Math.abs(a - b);
      },
      alsoWrong: (ex) => {
        const [a, b] = operands(ex.expr).map(Math.abs) as [number, number];
        return [Math.abs(a - b), -Math.abs(a - b)];
      },
      // −3 + (−5) = −(5 − 3) = −2: the sign kept, the sizes subtracted
      wrongLines: (ex, w) => {
        const [a, b] = operands(ex.expr).map(Math.abs) as [number, number];
        const [big, small] = a >= b ? [a, b] : [b, a];
        const r = ex.answer.n;
        return Math.abs(w) === big - small && (w === 0 || Math.sign(w) === Math.sign(r))
          ? stepped(ex, `${sg(r)}(${big} - ${small})`, w)
          : null;
      },
    },
  ],
  resolution,
);


/** « Relire la règle N » : la partie de la leçon qui l'explique (indices de `parts`). */
const RULES: Record<string, NonNullable<ErrorDef['rule']>> = {
  'signe-oublie': { n: 2, label: 'Je garde le signe des deux nombres', partIndex: 5 },
  'soustraction-au-lieu-addition': { n: 1, label: "J'additionne les nombres sans leur signe", partIndex: 4 },
};
const errors: ErrorDef[] = baseErrors.map((e) => ({ ...e, rule: RULES[e.id] as NonNullable<ErrorDef['rule']> }));

// ——— Textes du doc 06 (retours d'erreur) ———

const M = '−';
const SIGN_NEG = 'Les deux nombres sont négatifs : le résultat est négatif aussi. Je garde le signe − !';
const SIGN_POS = 'Les deux nombres sont positifs : le résultat est positif aussi.';
const terms = (ex: Exercise): [number, number] | null => {
  const t = operands(ex.expr);
  const same = t.length === 2 && Math.sign(t[0] as number) === Math.sign(t[1] as number);
  return ex.expr.k === 'op' && ex.expr.op === '+' && same ? [t[0] as number, t[1] as number] : null;
};
const givenOf = (o: Outcome): number => Number(o.given.replace(/−/g, '-'));
const signMsg = (neg: boolean): string => (neg ? SIGN_NEG : SIGN_POS);
const subMsg = (a: number, b: number, ans: number): string =>
  `Même signe : on **additionne** les nombres, on ne les soustrait pas. ${a} + ${b} = ${a + b}, donc ${txt(ans)}.`;

/** Réponse tapée sur un calcul de même signe : juste, signe oublié, soustraction, autre. */
function typedText(ex: Exercise, o: Outcome): string | null {
  const t = terms(ex);
  if (!t) return null;
  const a = Math.abs(t[0]);
  const b = Math.abs(t[1]);
  const neg = t[0] < 0;
  const ans = neg ? -(a + b) : a + b;
  if (o.correct)
    return neg ? `${a} + ${b} = ${a + b}, et on garde le signe − : ${txt(ans)}.` : `${a} + ${b} = ${a + b}, et le résultat reste positif.`;
  const g = givenOf(o);
  if (g === -ans) return signMsg(neg);
  if (Math.abs(g) === Math.abs(a - b)) return subMsg(a, b, ans);
  if (neg) return `Additionne ${a} et ${b} sans les signes, puis garde le signe −.${a === 8 && b === 9 ? ' Le résultat est −17.' : ''}`;
  return `Additionne ${a} et ${b} : le résultat reste positif.`;
}

function droiteText(q: Extract<Question, { kind: 'droite' }>, o: Outcome): string | null {
  const t = terms(q.ex);
  if (!t) return null;
  const a = Math.abs(t[0]);
  const b = Math.abs(t[1]);
  const neg = t[0] < 0;
  const arrive = neg ? `−${a + b}` : `${a + b}`;
  const side = neg ? 'gauche' : 'droite';
  if (o.correct) return `Les deux bonds vont vers la ${side}, bout à bout : ${a} + ${b} = ${a + b}, on arrive à ${arrive}.`;
  const steps = Array.from({ length: b }, (_, i) => txt(neg ? -(a + i + 1) : a + i + 1)).join(', ');
  return `Le deuxième bond part de ${txt(t[0])} et fait ${b} graduations vers la ${side} : ${steps}. On arrive à ${arrive}.`;
}

function trouText(q: Extract<Question, { kind: 'trou' }>, o: Outcome): string | null {
  const g = givenOf(o);
  const wrongAbs = (x: number): boolean => Math.abs(g) === x;
  if (q.promptLatex === '= \\square' && q.hidden.n === -13) {
    if (o.correct) return 'On garde le signe − : −13.';
    return g === 13 ? SIGN_NEG : "Le résultat de la ligne du dessus est −(13), c'est-à-dire −13.";
  }
  if (q.promptLatex === '-6 + (-1) = -(6 + \\square)') {
    if (o.correct) return null;
    return g === -1 ? 'On écrit le nombre sans son signe : 1. Le signe − est déjà devant la parenthèse.' : "Dans −(6 + ▢), on remet le deuxième nombre du calcul sans son signe : 1.";
  }
  if (q.promptLatex === '-6 + (-1) = -(6 + 1) = \\square') {
    if (o.correct) return null;
    if (g === 7) return SIGN_NEG;
    return wrongAbs(5) ? subMsg(6, 1, -7) : 'Additionne 6 et 1, puis garde le signe − devant le résultat.';
  }
  return null;
}

function feedbackText(q: Question, o: Outcome): string | null {
  if (o.unfinished || o.errorFamily === 'ecriture') return null;
  switch (q.kind) {
    case 'saisie':
      return typedText(q.ex, o);
    case 'droite':
      return droiteText(q, o);
    case 'trou':
      return trouText(q, o);
    case 'qcm': {
      const t = terms(q.ex);
      if (!t || q.choices.map((c) => c.latex).join('|') !== '+|-') return null;
      if (!o.correct) return signMsg(t[0] < 0);
      return t[0] < 0 ? 'Les deux nombres sont négatifs : on garde le signe −. Le résultat est négatif.' : 'Les deux nombres sont positifs : on garde le signe +. Le résultat est positif.';
    }
    case 'vraifaux': {
      const t = terms(q.ex);
      if (!t || q.isTrue) return null;
      const a = Math.abs(t[0]);
      const b = Math.abs(t[1]);
      const neg = t[0] < 0;
      const ans = neg ? -(a + b) : a + b;
      if (q.shown.n !== -ans || q.shown.d !== 1) return null;
      if (o.correct)
        return neg ? `Faux : ${a} + ${b} = ${a + b}, mais on garde le signe −. Le bon résultat est ${txt(ans)}.` : `Faux : ${a} + ${b} = ${a + b}, le résultat reste positif.`;
      return `On a bien additionné ${a} et ${b}, mais les deux nombres sont ${neg ? 'négatifs : le résultat est négatif' : 'positifs : le résultat est positif'} aussi. ${toText(q.ex.expr)} = ${txt(ans)}.`;
    }
    default:
      return null;
  }
}

// ——— Leçon ———

const ex1 = (a: number, b: number): Exercise => sum(1, a, b);
const hl = (t: string, anim?: SceneToken['anim']): SceneToken => ({ t, hl: true, ...(anim ? { anim } : {}) });
const calcOf = (...tokens: (string | SceneToken)[]): { tokens: SceneToken[] } => ({
  tokens: tokens.map((t) => (typeof t === 'string' ? { t } : t)),
});
const lineScene = (line: LineScene, ...calc: (string | SceneToken)[]): Scene => ({ layout: 'line', calcs: [calcOf(...calc)], line });
const TWO_JUMPS = [{ from: 0, by: -3 }, { from: -3, by: -5 }];
const NEUTRAL_HINT = 'Touche la droite à l\'endroit où l\'on arrive.';
const trouOf = (open: string, choices: string[], correct: number, errs: Record<number, string>) =>
  ({ type: 'trou' as const, open, choices, correct, errors: errs });

const l1: LineScene = { from: -5, to: 5, jumps: [], tone: 'color' };
const l10: LineScene = { from: -10, to: 2, jumps: TWO_JUMPS, tone: 'color' };
const neutral = (l: LineScene): LineScene => ({ ...l, tone: 'neutral' });

const leconDroite: EtapeStep[] = [
  step('Pour additionner des relatifs, on les dessine sur une **droite graduée**. Au milieu, **0** : notre point de **départ**.', {
    scene: lineScene({ ...l1, highlight: [0], legend: 'Une droite où les nombres sont rangés dans l\'ordre' }),
  }),
  step('À droite de 0, les **positifs**, en bleu. À gauche, les **négatifs**, en orange. Mêmes couleurs dans tout le module.', {
    scene: lineScene({ ...l1, legend: 'négatifs à gauche · positifs à droite' }),
  }),
  step('**Ajouter un nombre positif**, c\'est faire un bond vers la **droite**. On part de 0 et on ajoute 3.', {
    scene: lineScene({ from: -3, to: 4, jumps: [{ from: 0, by: 3, after: true }], tone: 'neutral' }),
    action: {
      type: 'graduation',
      consigne: NEUTRAL_HINT,
      target: 3,
      errors: [
        { at: [0], message: 'Tu es resté au départ : le bond fait 3 graduations.' },
        { at: [-3, -2, -1], message: 'Ajouter un nombre positif, c\'est avancer vers la droite. Tu es parti vers la gauche.' },
        { at: [4], message: 'Une graduation de trop : le bond fait exactement 3 graduations.' },
        { at: [1, 2], message: 'Il manque des graduations : le bond en fait 3. Compte-les une par une à partir de 0.' },
      ],
      fallback: 'Le bond fait 3 graduations : compte-les une par une à partir de 0.',
    },
  }),
  step('Le bond de 3 vers la droite arrive en **3**.', {
    scene: lineScene({ from: -3, to: 4, jumps: [{ from: 0, by: 3 }], tone: 'color' }, '0 + 3'),
  }),
  step('**Ajouter un nombre négatif**, c\'est faire un bond vers la **gauche**. On repart de 0 et on ajoute −3.', {
    scene: lineScene({ from: -4, to: 3, jumps: [{ from: 0, by: -3, after: true }], tone: 'neutral' }),
    action: {
      type: 'graduation',
      consigne: NEUTRAL_HINT,
      target: -3,
      errors: [
        { at: [0], message: 'Tu es resté au départ : le bond fait 3 graduations.' },
        { at: [1, 2, 3], message: 'Ajouter un nombre négatif, c\'est reculer vers la gauche. Tu es parti vers la droite.' },
        { at: [-4], message: 'Une graduation de trop : le bond fait exactement 3 graduations.' },
        { at: [-1, -2], message: 'Il manque des graduations : le bond en fait 3. Compte-les une par une à partir de 0.' },
      ],
      fallback: 'Le bond fait 3 graduations : compte-les une par une à partir de 0.',
    },
  }),
  step('Le bond de −3 va vers la **gauche**. Il fait 3 graduations : autant que le nombre sans son signe.', {
    scene: lineScene({ from: -4, to: 3, jumps: [{ from: 0, by: -3 }], tone: 'color' }, '0 + (−3)'),
    action: trouOf('Le bond de −3 va vers la [ ? ].', ['droite', 'gauche'], 1, {
      0: 'Ajouter un nombre négatif, c\'est reculer : vers la gauche.',
    }),
  }),
];

const deuxDettes: EtapeStep[] = [
  step('Une **dette** se note avec un nombre **négatif**. Tu dois **3 €** : un bond de 3 graduations vers la gauche, tu es à −3.', {
    scene: lineScene(
      {
        from: -10, to: 2, jumps: [{ from: 0, by: -3 }], tone: 'color',
        legend: 'Une dette, c\'est un nombre négatif',
        marks: [{ at: 0, text: 'départ' }, { at: -3, text: 'arrivée' }],
      },
      `${M}3`,
    ),
  }),
  step('Tu dois encore **5 €** : un deuxième bond de 5 graduations, vers la gauche aussi, **dans le même sens**.', {
    scene: lineScene(l10, `${M}3 + (${M}5)`),
  }),
  step(`Les deux bonds vont vers la **gauche**. Tu arrives à ${M}8 : **8 € en tout**. Deux bonds de même sens vont **plus loin ensemble**.`, {
    scene: lineScene(neutral(l10), `${M}3 + (${M}5)`),
    action: trouOf('Les deux bonds vont vers la [ ? ].', ['gauche', 'droite'], 0, {
      1: 'Regarde la droite : les deux bonds reculent, comme une dette qui grandit.',
    }),
  }),
];

const REGLE1 = "**Deux nombres de même signe : j'additionne les nombres sans leur signe.**";
const REGLE2 = '**Je garde le signe des deux nombres.**';

const additionne: EtapeStep[] = [
  step(`Reprenons ${M}3 + (${M}5) : même signe, donc les deux bonds vont dans le même sens, **bout à bout**.`, {
    scene: lineScene(l10, `${M}3 + (${M}5)`),
  }),
  step('Les longueurs des bonds sont les nombres **sans leur signe** : 3 et 5. Le trajet total fait 3 + 5 = **8** graduations.', {
    scene: lineScene(
      { ...neutral(l10), jumps: [{ from: 0, by: -3, label: '3' }, { from: -3, by: -5, label: '5' }] },
      hl('3 + 5'),
    ),
    action: trouOf('Les longueurs des bonds sont les nombres **sans leur signe** : 3 et 5. Le trajet total fait 3 + 5 = [ ? ] graduations.', ['2', '8', '15'], 1, {
      0: 'Soustraire, ce serait pour des bonds de sens contraires. Ici les deux bonds vont dans le même sens : ils s\'ajoutent.',
      2: 'On additionne les longueurs, on ne les multiplie pas : 3 + 5.',
    }),
  }),
  step(undefined, { rule: { n: 1, text: REGLE1 } }),
];

const gardeSigne: EtapeStep[] = [
  step(`Le trajet fait 8 graduations : on arrive à **8** ou à **${M}8** ? Les deux bonds vont vers la **gauche** : côté **négatif**.`, {
    scene: lineScene({ ...l10, highlight: [-8] }, `${M}3 + (${M}5) = ?`),
  }),
  step(`Du côté négatif : ${M}3 + (${M}5) = **${M}8**. On garde le signe ${M} des deux nombres.`, {
    scene: lineScene(neutral(l10), `${M}3 + (${M}5)`),
    action: trouOf(`Du côté négatif : ${M}3 + (${M}5) = [ ? ]`, ['8', `${M}8`, `${M}2`], 1, {
      0: 'Le trajet fait bien 8 graduations, mais on arrive à gauche de 0 : il faut garder le signe.',
      2: `${M}2 viendrait de 5 ${M} 3. Ici les bonds s'ajoutent : 3 + 5 = 8, avec le signe ${M}.`,
    }),
  }),
  step('Même chose avec 4 + 6 : bonds vers la **droite**, côté **positif**. On garde le signe + : 10.', {
    scene: lineScene({ from: -2, to: 11, jumps: [{ from: 0, by: 4 }, { from: 4, by: 6 }], tone: 'color' }, '4 + 6 = 10'),
  }),
  step(undefined, { rule: { n: 2, text: REGLE2 } }),
];

const recap: EtapeStep[] = [
  step("**En une phrase :** Même signe : j'additionne les nombres sans leur signe, et je garde le signe. Maintenant, tu t'entraînes avec quatre questions.", {
    recap: [
      { title: "1. J'additionne les nombres sans leur signe.", ok: `${M}3 + (${M}5) : 3 + 5 = 8`, ko: `5 ${M} 3 = 2` },
      { title: '2. Je garde le signe des deux nombres.', ok: `${M}3 + (${M}5) = ${M}8`, ko: `${M}3 + (${M}5) = 8` },
    ],
  }),
];

const options3 = (...o: [string, string][]) => o.map(([label, why]) => ({ label, why }));

const guess = choix(
  sum(1, -3, -5),
  'Pour commencer, à ton avis : tu dois 3 € à une amie, puis encore 5 €. Combien dois-tu en tout ?',
  options3(
    ['2 €', 'Tu dois déjà 3 €, puis tu dois encore 5 € de plus : ta dette grandit, elle ne diminue pas. Tu dois 8 €.'],
    ["8 €", "Deux dettes qui s'ajoutent font une dette plus grande. Le cours va t'expliquer comment l'écrire avec des nombres négatifs."],
    ['15 €', 'On additionne les deux dettes : 3 + 5 = 8, pas 3 × 5. Tu dois 8 €.'],
  ),
  1,
);

const compareQ = choix(
  sum(1, -3, -5),
  "Qu'est-ce qui change entre A et B ?",
  options3(
    ['Le premier nombre', 'Le premier nombre est −3 dans les deux calculs : il ne change pas.'],
    ['La longueur du deuxième bond', "Le deuxième bond fait 5 graduations dans les deux calculs : ce n'est pas sa longueur qui change, c'est son sens."],
    ['Le signe du deuxième nombre', 'Le deuxième nombre est négatif dans le calcul A, positif dans le calcul B : un signe change, donc le sens du bond change.'],
  ),
  2,
);

const NOT_COUNTED_GUESS = 'Question pour découvrir : elle ne compte pas dans la note.';
const NOT_COUNTED_UNDERSTAND = 'Question pour comprendre : elle ne compte pas dans la note.';

const exemple1: EtapeStep[] = [
  step('Voici la résolution complète. Lis chaque ligne, puis touche « Je comprends ».', {
    scene: { layout: 'lines', calcs: [calcOf(`${M}4 + (${M}9)`)] },
  }),
  step('Les deux nombres sont négatifs : j\'additionne 4 et 9 sans leur signe, et je garde le signe − devant la parenthèse.', {
    scene: { layout: 'lines', calcs: [calcOf(`${M}4 + (${M}9)`), calcOf(hl(`= ${M}(4 + 9)`))] },
    action: { type: 'comprends' },
  }),
  step('4 + 9 = 13. Le signe − est toujours devant : c\'est le signe des deux nombres.', {
    scene: { layout: 'lines', calcs: [calcOf(`${M}4 + (${M}9)`), calcOf(`= ${M}(4 + 9)`), calcOf(hl(`= ${M}(13)`))] },
    action: { type: 'comprends' },
  }),
];

const parts: LessonPart[] = [
  // 0 — Accroche + deviner (ne compte pas)
  texted(decouverte(guess), {
    title: 'Additionner deux nombres de même signe',
    intro: [
      'Quand tu additionnes deux nombres **négatifs**, ou deux nombres **positifs**, on dit qu\'ils ont le **même signe**.',
      'Dans ce cours, tu vas apprendre à les additionner sans te tromper de signe, avec une image : **la droite graduée**.',
    ],
    mention: NOT_COUNTED_GUESS,
  }),
  // 1 — La droite graduée et les bonds
  etapes('La droite graduée et les bonds', leconDroite),
  // 2 — Deux dettes qui s'ajoutent
  etapes("Deux dettes qui s'ajoutent", deuxDettes),
  // 3 — Comparer deux cas (ne compte pas)
  texted(decouverte(compareQ), {
    title: 'Comparer deux cas',
    intro: ['Voici deux calculs presque identiques. Regarde-les bien.'],
    mention: NOT_COUNTED_UNDERSTAND,
    compare: {
      a: { label: 'Calcul A', latex: '-3 + (-5)' },
      b: { label: 'Calcul B', latex: '-3 + 5' },
      note: 'Le calcul B est un aperçu : au prochain cours, tu apprendras à le calculer. Ici, tu observes seulement ce qui change.',
      line: {
        from: -9,
        to: 3,
        jumps: [{ from: 0, by: -3 }, { from: -3, by: -5, label: 'A' }, { from: -3, by: 5, label: 'B' }],
        marks: [{ at: -8, text: `A : ${M}8` }, { at: 2, text: 'B : 2' }],
        tone: 'color',
      },
      after: [
        `A arrive en ${M}8 : ${M}3 + (${M}5) = ${M}8.`,
        `B arrive en 2 : ${M}3 + 5 = 2.`,
        'Dans A, les deux bonds vont vers la **gauche** : ils s\'ajoutent. Dans B, le deuxième bond repart vers la **droite** : on revient vers 0. Ce cours ne traite que le cas A, le même signe.',
      ],
    },
  }),
  // 4 — Règle 1
  etapes("J'additionne les longueurs des bonds", additionne),
  // 5 — Règle 2
  etapes('Je garde le signe', gardeSigne),
  // 6 — Récapitulatif
  etapes('Les 2 règles à retenir', recap),
  // 7 — Série de pratique (notée)
  pratique('Cours 1 · Pratique', [
    { question: droiteQ(ex1(-2, -5), { from: -7, to: 0 }, [{ from: 0, by: -2 }, { from: -2, by: -5 }]) },
    {
      question: signBox(ex1(-4, -3), false, 'signe-oublie'),
      texts: { consigne: "Touche le signe du résultat. Tu n'as pas besoin de calculer.", intro: ['Quel est le signe du résultat ?'] },
    },
    {
      question: { kind: 'vraifaux', ex: ex1(-4, -3), shown: rat(7), isTrue: false, errorType: 'signe-oublie' },
      texts: { consigne: 'Touche Vrai ou Faux.' },
    },
    { question: saisie(ex1(-8, -9)), texts: { consigne: 'Calcule. Tape le résultat.' } },
  ]),
  // 8 — Exemple 1 : tout est résolu à l'écran
  etapes('Exemple 1 sur 2', exemple1),
  // 9 — Exemple 1 : la dernière ligne (notée)
  texted(exemple(trou(ex1(-4, -9), '= \\square', -13)), {
    consigne: 'Tape ce qui manque dans la case, avec les touches du clavier.',
    above: [`= ${M}(4 + 9)`, `= ${M}(13)`].map((s) => s.replace(/−/g, '-')),
    help: 'Dernière ligne. Écris le résultat, avec son signe. Tu peux t\'aider de la ligne du dessus.',
  }),
  // 10 — Exemple 2, case 1 (entraînement non noté)
  texted(decouverte(trou(ex1(-6, -1), '-6 + (-1) = -(6 + \\square)', 1)), {
    consigne: COMPLETE,
    intro: ['Cette fois, deux cases sont à toi. Les deux nombres sont négatifs : je garde le signe, et j\'additionne.'],
    mention: '',
  }),
  // 11 — Exemple 2, case 2 (le résultat, notée)
  texted(exemple(trou(ex1(-6, -1), '-6 + (-1) = -(6 + 1) = \\square', -7)), { mention: '' }),
  // 12 — Annonce des exercices de fin
  etapes('Place aux 5 exercices de fin', [
    step('Cette fois, **pas d\'aide**. Ils ressemblent à ce que tu verras en contrôle.'),
    step('Pour valider le cours, il faut : au moins **4 exercices de fin justes sur 5** ; et **80 % de bonnes réponses** sur tout le cours.'),
    step("Si tu n'y arrives pas, ce n'est pas grave : tu feras une **série de validation**. Ce sont 5 exercices, sans refaire la leçon."),
  ]),
];

export const c01: CourseDef = {
  id: ID,
  moduleId: MODULE_ID,
  order: 1,
  title: 'Additionner deux nombres de même signe',
  shortTitle: 'Même signe',
  rule: RULE,
  parts,
  lessonLength: 7,
  endExercises: { count: 5, kind: 'saisie' },
  generate,
  errors,
  generalExplanation: (ex) => explanation(RULE, resolution(ex)),
  resolution,
  classes: SIGN_CLASSES,
  expectInteger: true,
  formats: ['saisie', 'droite', 'signe', 'vraifaux', 'erreur'],
  feedbackText,
  memo: {
    rule: "Même signe : j'additionne les nombres sans leur signe, et je garde le signe.",
    examples: [`${M}3 + (${M}5) : 3 + 5 = 8, je garde le ${M} : **${M}8**.`, '4 + 6 : 4 + 6 = 10, je garde le + : **10**.'],
    mistake: {
      wrong: `${M}3 + (${M}5) = 8`,
      why: `Oublier le signe (${M}3 + (${M}5) = 8) ou soustraire au lieu d'additionner (${M}3 + (${M}5) = ${M}2).`,
    },
    tip: "Deux bonds dans le même sens vont plus loin ensemble : on additionne les longueurs, et on arrive du côté où vont les bonds.",
  },
};
