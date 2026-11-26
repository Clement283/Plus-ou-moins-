// Cours 1 du module « Équations et inéquations » — Tester si un nombre est solution.
// Fiche : docs/modules/02-equations-inequations/equations-tester-solution.md. Cours à l'essai (module « Essais »).
import { evaluate, toLatex } from '../../math/expr';
import { type Member, cst, equation, equationLatex, substitute, xt } from '../../math/equation';
import { calculerQuestion } from '../../exercises/calculer';
import { type Rng, randInt } from '../../rng';
import type { BuildCtx, Outcome, Question, QuestionKind } from '../../exercises/types';
import { errorOf } from '../errors-util';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, Level } from '../types';
import {
  M, NOT_COUNTED_GUESS, SIGN_CLASSES, annonceFin, buildErrors, choix, decouverte, etapes, exemple, explanation, hl, is, lecon,
  linesScene, oneScene, options3, redraw, small, step, stepped, texted, toText, trouOf, txt,
} from '../calculs/shared';

const ID = 'equations-tester-solution';
const RULE =
  'Un nombre est solution d’une équation si, en le mettant à la place de x, les deux membres donnent le même résultat.';

// ——— Un exercice = un membre d’une équation, où x est remplacé par le nombre testé ———
// `expr` est le calcul obtenu (3 × (−2) + 4), `answer` sa valeur ; l’équation et le nombre testé sont dans `meta`.
type Side = 'left' | 'right';
interface Meta {
  left: Member;
  right: Member;
  x: number;
  side: Side;
}
const metaOf = (e: Exercise): Meta => e.meta as unknown as Meta;
const memberOf = (e: Exercise): Member => (metaOf(e).side === 'left' ? metaOf(e).left : metaOf(e).right);

function build(level: Level, left: Member, right: Member, x: number, side: Side = 'left'): Exercise {
  const expr = substitute(side === 'left' ? left : right, x);
  return { courseId: ID, level, expr, answer: evaluate(expr), meta: { left, right, x, side } };
}

// ——— Générateur : niveau 1 = ax + b = c ; 2 = ax + b = cx + d ; 3 = membre à trois termes, nombre testé jusqu’à 9 ———
const nz = (rng: Rng, lo: number, hi: number): number => (randInt(rng, 0, 1) === 1 ? -1 : 1) * randInt(rng, lo, hi);
/** ax + b ou b + ax (x en tête : jamais −x, que la substitution ne sait pas écrire sans moins unaire). */
function affine(rng: Rng, max: number): Member {
  const b = nz(rng, 1, 9);
  return randInt(rng, 0, 1) === 1 ? [cst(b), xt(nz(rng, 1, max))] : [xt(nz(rng, 2, max)), cst(b)];
}
function generate(level: Level, rng: Rng): Exercise {
  return redraw(
    (): Exercise | null => {
      const max = level === 3 ? 6 : 9;
      const left: Member = level === 3 ? [xt(nz(rng, 2, 6)), cst(nz(rng, 1, 9)), xt(nz(rng, 1, 6))] : affine(rng, max);
      const x = nz(rng, 1, level === 3 ? 9 : 5);
      const l = evaluate(substitute(left, x)).n;
      const delta = randInt(rng, 0, 1) === 1 ? 0 : nz(rng, 1, 4); // une fois sur deux, le nombre est solution
      if (level === 1) return build(1, left, [cst(l + delta)], x);
      const c = nz(rng, 2, max);
      const d = l - c * x + delta;
      if (Math.abs(d) < 1 || Math.abs(d) > 20) return null;
      const right: Member = randInt(rng, 0, 1) === 1 ? [cst(d), xt(c)] : [xt(c), cst(d)];
      return build(level, left, right, x, level === 2 && randInt(rng, 0, 1) === 1 ? 'right' : 'left');
    },
    (e) => e !== null,
  ) as Exercise;
}

// ——— Le calcul d’un membre, tel qu’un élève le fait (bien ou mal) ———
type Mode = 'ok' | 'colle' | 'plus' | 'paren' | 'signe';
interface Piece {
  op: 'first' | '+' | '-';
  p: number;
}
const coefOf = (t: Member[number]): number => (t.k === 'x' ? t.coef : t.v);
/** Facteur écrit devant x : le coefficient en tête, sa valeur absolue ensuite (le signe est dans l’opération). */
const shownCoef = (t: Member[number], i: number): number => (i === 0 ? coefOf(t) : Math.abs(coefOf(t)));
function pieces(m: Member, v: number, mode: Mode): Piece[] {
  return m.map((t, i) => {
    const o: Piece['op'] = i === 0 ? 'first' : coefOf(t) < 0 ? '-' : '+';
    const a = shownCoef(t, i);
    if (t.k === 'num') return { op: o, p: a };
    if (Math.abs(a) === 1) return { op: o, p: v }; // x tout seul : pas de produit
    const product = a * v;
    if (mode === 'colle') return { op: o, p: v > 0 ? Math.sign(a) * (10 * Math.abs(a) + v) : a + v };
    if (mode === 'plus') return { op: o, p: a + v };
    if (mode === 'signe' && o !== '-' && product < 0) return { op: o, p: -product };
    return { op: o, p: product };
  });
}
const total = (ps: Piece[]): number => ps.reduce((acc, { op, p }) => (op === 'first' ? p : op === '+' ? acc + p : acc - p), 0);
function valueIn(e: Exercise, mode: Mode): number {
  const ps = pieces(memberOf(e), metaOf(e).x, mode);
  // paren : le moins d’un nombre négatif soustrait est perdu (5 − (−3) lu 5 − 3)
  return mode === 'paren' ? total(ps.map((q) => (q.op === '-' && q.p < 0 ? { ...q, p: -q.p } : q))) : total(ps);
}
/** La ligne du milieu : produits faits, soustraction d’un négatif remplacée par l’addition de son opposé. */
function interLatex(ps: Piece[]): string {
  return ps
    .map(({ op, p }) => {
      if (op === 'first') return `${p}`;
      if (op === '+') return p < 0 ? `+ (${p})` : `+ ${p}`;
      return p < 0 ? `+ ${-p}` : `- ${p}`;
    })
    .join(' ');
}
function resolution(e: Exercise): string[] {
  return [toLatex(e.expr), `= ${interLatex(pieces(memberOf(e), metaOf(e).x, 'ok'))}`, `= ${e.answer.n}`];
}

// ——— Erreurs reconnues ———
const hasProduct = (e: Exercise): boolean => memberOf(e).some((t, i) => t.k === 'x' && Math.abs(shownCoef(t, i)) >= 2);
const hasNegSub = (e: Exercise): boolean => memberOf(e).some((t, i) => i > 0 && t.k === 'x' && t.coef < 0);
const R1 = 'Je remplace x par le nombre';
const R2 = 'Je calcule chaque membre à part';
const R3 = 'Je compare les deux résultats';
// partIndex : place de l'écran d'étapes de la règle dans `parts`
const RULES: Record<string, NonNullable<ErrorDef['rule']>> = {
  'x-colle': { n: 1, label: R1, partIndex: 2 },
  'parentheses-oubliees': { n: 1, label: R1, partIndex: 2 },
  priorite: { n: 2, label: R2, partIndex: 4 },
  signe: { n: 2, label: R2, partIndex: 4 },
  verdict: { n: 3, label: R3, partIndex: 6 },
};
/**
 * Le membre calculé de gauche à droite, sans la priorité de la multiplication : « b + ax » devient (b + a) × x.
 * Null s'il n'y a pas de produit après le premier terme (la priorité ne change alors rien).
 */
const prioValue = (e: Exercise): number | null => {
  const m = memberOf(e);
  const x = metaOf(e).x;
  let acc = 0;
  let late = false;
  m.forEach((t, i) => {
    const v = coefOf(t);
    const a = Math.abs(v);
    const sub = i > 0 && v < 0;
    if (i === 0) acc = t.k === 'x' ? v * x : v;
    else if (t.k === 'num') acc = sub ? acc - a : acc + a;
    else if (a === 1) acc = sub ? acc - x : acc + x;
    else {
      late = true;
      acc = (sub ? acc - a : acc + a) * x;
    }
  });
  return late ? acc : null;
};
/** La valeur de l'autre membre (celui qu'on ne demande pas). */
const otherValue = (e: Exercise): number => {
  const m = metaOf(e);
  return evaluate(substitute(m.side === 'left' ? m.right : m.left, m.x)).n;
};
const hasPrio = (e: Exercise): boolean => prioValue(e) !== null && prioValue(e) !== e.answer.n;
const modeFor = (e: Exercise, w: number, modes: Mode[]): Mode | undefined => modes.find((m) => valueIn(e, m) === w);
const errors: ErrorDef[] = buildErrors(
  [
    {
      id: 'x-colle',
      family: 'calcul',
      detect: (e, given) => hasProduct(e) && (is(given, valueIn(e, 'colle')) || is(given, valueIn(e, 'plus'))),
      text: (e) => {
        const i = memberOf(e).findIndex((t, k) => t.k === 'x' && Math.abs(shownCoef(t, k)) >= 2);
        const a = Math.abs(shownCoef(memberOf(e)[i] as Member[number], i));
        return `${a}x veut dire ${a} × x : le nombre collé à x multiplie x. Ici, avec x = ${txt(metaOf(e).x)}, le membre s’écrit ${toText(e.expr)}.`;
      },
      draw: (level, rng) => redraw(() => generate(level, rng), hasProduct),
      sample: (e) => valueIn(e, 'colle'),
      alsoWrong: (e) => [valueIn(e, 'plus')],
      wrongLines: (e, w) => {
        const m = modeFor(e, w, ['colle', 'plus']);
        return m ? stepped(e, interLatex(pieces(memberOf(e), metaOf(e).x, m)), w) : null;
      },
    },
    {
      id: 'parentheses-oubliees',
      family: 'signe',
      detect: (e, given) => hasNegSub(e) && is(given, valueIn(e, 'paren')),
      text: (e) =>
        `Pour x = ${txt(metaOf(e).x)}, on écrit le nombre entre parenthèses : ${toText(e.expr)}. Soustraire un nombre négatif, c’est ajouter son opposé.`,
      draw: (level, rng) => redraw(() => generate(level, rng), (e) => hasNegSub(e) && valueIn(e, 'paren') !== e.answer.n),
      sample: (e) => valueIn(e, 'paren'),
      wrongLines: (e, w) =>
        w === valueIn(e, 'paren')
          ? stepped(e, interLatex(pieces(memberOf(e), metaOf(e).x, 'paren').map((q) => (q.op === '-' && q.p < 0 ? { ...q, p: -q.p } : q))), w)
          : null,
    },
    {
      id: 'priorite',
      family: 'calcul',
      detect: (e, given) => hasPrio(e) && is(given, prioValue(e) as number),
      text: (e) => `Dans ${toText(e.expr)}, la multiplication passe avant l’addition : on calcule d’abord le produit, puis on additionne.`,
      draw: (level, rng) => redraw(() => generate(level, rng), hasPrio),
      sample: (e) => prioValue(e) as number,
    },
    {
      id: 'signe',
      family: 'signe',
      detect: (e, given) => is(given, valueIn(e, 'signe')),
      text: (e) =>
        `Dans ${toText(e.expr)}, un produit d’un nombre négatif et d’un nombre positif est négatif : c’est la règle des signes du cours « Multiplier deux relatifs ».`,
      draw: (level, rng) => redraw(() => generate(level, rng), (e) => valueIn(e, 'signe') !== e.answer.n),
      sample: (e) => valueIn(e, 'signe'),
      wrongLines: (e, w) => (w === valueIn(e, 'signe') ? stepped(e, interLatex(pieces(memberOf(e), metaOf(e).x, 'signe')), w) : null),
    },
    {
      id: 'verdict',
      family: 'autre',
      detect: (e, given) => otherValue(e) !== e.answer.n && is(given, otherValue(e)),
      text: (e) => `Tu as donné la valeur de l’autre membre (${txt(otherValue(e))}). On calcule chaque membre à part, puis on compare les deux résultats : ${toText(e.expr)} = ${txt(e.answer.n)}.`,
      draw: (level, rng) => redraw(() => generate(level, rng), (e) => otherValue(e) !== e.answer.n),
      sample: (e) => otherValue(e),
    },
  ],
  resolution,
).map((e): ErrorDef => ({ ...e, rule: RULES[e.id] as NonNullable<ErrorDef['rule']> }));


// ——— Retours d’erreur des questions qui comptent ———
function feedbackText(q: Question, o: Outcome): string | null {
  if (o.unfinished || o.errorFamily === 'ecriture' || q.kind !== 'saisie' || o.correct) return null;
  const e = q.ex;
  const known = errors.find((x) => x.id === o.errorType);
  if (known) return known.explain(e).rule;
  return `Remplace x par ${txt(metaOf(e).x)} partout, entre parenthèses s’il est négatif, puis calcule : ${toText(e.expr)}.`;
}

// ——— Questions de saisie : l’équation et le nombre testé sont montrés au-dessus ———
const eqLatex = (e: Exercise): string => equationLatex(equation(metaOf(e).left, metaOf(e).right));
const promptOf = (e: Exercise): string =>
  `\\begin{gathered}${eqLatex(e)}\\\\ {\\small \\text{membre de ${metaOf(e).side === 'left' ? 'gauche' : 'droite'}, pour } x = ${metaOf(e).x}}\\end{gathered}`;
const saisieEq = (e: Exercise): Question => ({ kind: 'saisie', ex: e, promptLatex: promptOf(e) });
/** « Calculer par lignes » : l'élève remplace x, calcule ligne par ligne, puis dit si c'est une solution. */
const calculerEq = (e: Exercise): Question =>
  calculerQuestion(e, equation(metaOf(e).left, metaOf(e).right), metaOf(e).x, metaOf(e).side);
function customQuestion(kind: QuestionKind, ctx: BuildCtx): Question | null {
  if (kind !== 'saisie' && kind !== 'calculer') return null;
  const trap = errorOf(course, ctx.trapErrorType);
  const e = trap ? trap.trap(ctx.level, ctx.rng) : generate(ctx.level, ctx.rng);
  return kind === 'saisie' ? saisieEq(e) : calculerEq(e);
}

// ——— Leçon : 8 écrans avant l’annonce de la fin (déroulé guidé, 2026-11-26) ———
const A = (x: number): Exercise => build(1, [xt(2), cst(1)], [cst(7)], x);

const REGLE1 = '**Je remplace x par le nombre, partout, entre parenthèses s’il est négatif.** Le nombre collé à x devient une multiplication.';
const REGLE2 = '**Je calcule le membre de gauche, puis le membre de droite, chacun à part, une opération par ligne.** Les multiplications passent avant les additions.';
const REGLE3 =
  '**Si les deux résultats sont égaux, le nombre est une solution. Sinon, ce n’est pas une solution.** On compare la gauche et la droite, jamais la gauche et le nombre testé.';

const guess = choix(
  A(3),
  'Pour commencer, à ton avis : le nombre 3 est-il une solution de cette équation ?',
  options3(
    ['Oui, les deux côtés donnent 7', 'Oui. À gauche, 2 × 3 + 1 fait 7, et à droite il y a 7. On va voir comment faire.'],
    ['Non, 2x avec x = 3 fait 23', '2x ne veut pas dire « 2 collé à 3 » : cela veut dire 2 × 3, donc 6, puis 6 + 1 fait 7.'],
    ['Non, parce que 3 n’est pas 7', 'Le nombre 3 ne se compare pas à 7 : on compare le côté gauche de l’équation au côté droit.'],
  ),
  0,
  '2x + 1 = 7',
);

const idee: EtapeStep[] = [
  step('Une équation est une **question** : pour quel nombre les deux côtés donnent-ils la même chose ?', {
    scene: linesScene(['2x + 1 = 7']),
  }),
  step('Tester un nombre, c’est **essayer une réponse** : on le met à la place de x. Comme sur une balance, on regarde si elle est à l’équilibre.', {
    scene: linesScene(['2x + 1 = 7'], ['x = 3']),
    after: linesScene(['2x + 1 = 7'], ['x = 3'], ['gauche = droite : ', hl('équilibre')]),
    action: trouOf('Si les deux côtés donnent la même chose, la balance est [ ? ].', ['à l’équilibre', 'penchée'], 0, {
      1: 'Penchée voudrait dire que les deux côtés sont différents. Ici, on cherche le cas où ils sont égaux.',
    }),
  }),
];

const regle1: EtapeStep[] = [
  step(`On teste le nombre ${M}2 dans cette équation. On enlève chaque **x** et on met le nombre à sa place.`, {
    scene: linesScene(['3', hl('x'), ' + 4 = ', hl('x')], [`x = ${M}2`]),
  }),
  step('Regarde bien 3x : le nombre collé à x **multiplie** x. Comme −2 est négatif, on le met **entre parenthèses**.', {
    scene: linesScene(['3x + 4']),
    after: linesScene(['3x + 4'], ['3 ', hl('×'), ' ', hl(`(${M}2)`), ' + 4']),
    action: trouOf('Dans 3x, le 3 et le x sont [ ? ].', ['multipliés', 'additionnés'], 0, {
      1: '3x veut dire 3 fois x, pas 3 + x : on multiplie.',
    }),
  }),
  step(undefined, {
    scene: linesScene(['3x + 4 = x'], [`x = ${M}2`], [`3 × (${M}2) + 4 = ${M}2`]),
    rule: { n: 1, text: REGLE1 },
  }),
];

const regle2: EtapeStep[] = [
  step('On calcule **le membre de gauche d’abord**, tout seul, une opération par ligne.', {
    scene: oneScene(hl(`3 × (${M}2) + 4`), ` = ${M}2`),
  }),
  step('On commence par le produit, comme dans le cours sur la multiplication des relatifs. Trois fois moins deux donne un résultat négatif.', {
    scene: linesScene([`3 × (${M}2) + 4`]),
    after: linesScene([`3 × (${M}2) + 4`], ['= ', hl(`${M}6`), ' + 4']),
    action: trouOf('Trois fois moins deux donne un résultat [ ? ].', ['négatif', 'positif'], 0, {
      1: 'Un nombre positif multiplié par un nombre négatif donne un négatif : trois fois moins deux fait moins six.',
    }),
  }),
  step(undefined, {
    scene: linesScene([`gauche : 3 × (${M}2) + 4`], [`= ${M}6 + 4`], [`= ${M}2`]),
    rule: { n: 2, text: REGLE2 },
  }),
];

const regle3: EtapeStep[] = [
  step(`Ici, la gauche vaut ${M}2 et la droite, x, vaut aussi ${M}2. Les deux résultats sont égaux.`, {
    scene: linesScene([`gauche : ${M}2`], [`droite : ${M}2`]),
    after: linesScene([`gauche : ${M}2`], [`droite : ${M}2`], ['x = ', hl(M + '2'), ' : ', hl('solution')]),
    action: trouOf(`Les deux résultats sont égaux : ${M}2 [ ? ] de l’équation.`, ['est une solution', 'n’est pas une solution'], 0, {
      1: 'Quand les deux côtés donnent le même résultat, l’équation est vraie : le nombre est une solution.',
    }),
  }),
  step('Essayons avec x = 1. À gauche : 3 × 1 + 4 fait 7. À droite : x vaut 1. Les deux résultats sont **différents**.', {
    scene: linesScene(['x = 1'], ['gauche : 3 × 1 + 4 = 7'], ['droite : 1']),
    after: linesScene(['x = 1'], ['gauche : 3 × 1 + 4 = 7'], ['droite : 1'], ['7 ', hl('≠'), ' 1']),
    action: trouOf('Sept et un sont différents : le nombre 1 [ ? ] de l’équation.', ['n’est pas une solution', 'est une solution'], 0, {
      1: 'Sept et un ne sont pas égaux : la balance n’est pas à l’équilibre.',
    }),
  }),
  step(undefined, {
    scene: linesScene(['gauche = droite : solution'], ['gauche ≠ droite : pas solution']),
    rule: { n: 3, text: REGLE3 },
  }),
];

/** L'exemple guidé : 7 − 2x = x − 8 pour x = 5 (gauche 7 − 10 = −3, droite 5 − 8 = −3). */
const EX_LEFT: Member = [cst(7), xt(-2)];
const EX_RIGHT: Member = [xt(1), cst(-8)];
const exGuide = build(1, EX_LEFT, EX_RIGHT, 5);

const parts: LessonPart[] = [
  texted(decouverte(guess), {
    title: 'Tester si un nombre est solution',
    intro: ['Une équation pose une question : quel nombre rend les deux côtés égaux ?', 'Dans ce cours, tu apprends à tester une réponse, sans te tromper dans les signes.'],
    mention: NOT_COUNTED_GUESS,
  }),
  etapes('Pourquoi on teste', idee),
  etapes(R1, regle1),
  lecon(
    small(build(1, [cst(5), xt(-1)], [cst(2)], -3), `5 - x \\quad (x = -3)`, 'Quel calcul obtient-on pour 5 − x quand x vaut −3 ?', [
      [`5 − (${M}3)`, 'Oui : on remplace x par −3, entre parenthèses, et le moins devant x reste.'],
      ['5 − 3', 'Le signe moins du nombre −3 a disparu. Il faut garder les parenthèses : 5 − (−3).'],
      [`5 + (${M}3)`, 'Devant x, il y avait un moins : il reste. On écrit 5 − (−3).'],
    ], 0),
  ),
  etapes(R2, regle2),
  lecon(
    small(build(1, [cst(6), xt(2)], [cst(12)], 3), `6 + 2x \\quad (x = 3)`, 'Dans 6 + 2x avec x = 3, quelle opération fait-on en premier ?', [
      ['2 × 3', 'Oui : la multiplication passe avant l’addition. 2 × 3 fait 6, puis 6 + 6 fait 12.'],
      ['6 + 2', 'Si on additionne d’abord 6 et 2, on obtient 8, puis 8 × 3 fait 24 : c’est faux. La multiplication passe avant.'],
      ['6 + 3', 'Le 3 est la valeur de x : il est multiplié par 2, il ne s’additionne pas à 6.'],
    ], 0),
  ),
  etapes(R3, regle3),
  texted(exemple({ ...calculerQuestion(exGuide, equation(EX_LEFT, EX_RIGHT), 5, 'left'), guided: true }), {
    title: 'On le fait ensemble',
    subtitle: 'Teste x = 5 dans 7 − 2x = x − 8. À chaque ligne, une aide te dit quoi faire.',
  }),
  annonceFin(),
];

const course: CourseDef = {
  id: ID,
  moduleId: 'essais',
  order: 1,
  title: 'Tester si un nombre est solution',
  shortTitle: 'Tester une solution',
  rule: RULE,
  parts,
  // pas de série de pratique : la pastille s'arrête avant l'exemple guidé
  lessonLength: parts.findIndex((p) => p.type === 'question' && p.activity === 'exemple'),
  unePhrase: true,
  // « calculer » : l'élève remplace x et calcule ligne par ligne (décision du 2026-11-26)
  endExercises: { count: 5, kind: 'saisie', mix: ['calculer', 'calculer', 'calculer', 'calculer', 'calculer'] },
  generate,
  errors,
  generalExplanation: (e) => explanation(RULE, resolution(e)),
  resolution,
  classes: SIGN_CLASSES,
  expectInteger: true,
  customQuestion,
  feedbackText,
  memo: {
    rule: RULE,
    ruleBullets: [
      'Je remplace x par le nombre, entre parenthèses s’il est négatif.',
      'Je calcule le membre de gauche, puis le membre de droite, une opération par ligne, les produits d’abord.',
      'Même résultat des deux côtés : c’est une solution. Sinon, ce n’est pas une solution.',
    ],
    examples: [
      `x = ${M}2 dans 3x + 4 = x : gauche 3 × (${M}2) + 4 = ${M}2, droite ${M}2. Égaux : c’est une solution.`,
      'x = 1 dans 3x + 4 = x : gauche 3 × 1 + 4 = 7, droite 1. Différents : ce n’est pas une solution.',
    ],
    mistake: { wrong: '2x pour x = 3 : 23', why: '**2x veut dire 2 × x** : on multiplie, on ne colle pas les chiffres. Pour x = 3, cela fait 2 × 3 = 6.' },
    tip: 'Remplacer, calculer, comparer : je mets le nombre à la place de x, je calcule chaque membre, puis je compare.',
  },
};

export const equationsTesterSolution = course;
