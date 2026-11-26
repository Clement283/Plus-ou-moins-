// Cours 1 du module « Équations et inéquations » — Tester si un nombre est solution.
// Fiche : docs/modules/02-equations-inequations/equations-tester-solution.md. Cours à l'essai (module « Essais »).
import { evaluate, toLatex } from '../../math/expr';
import { type Member, cst, equation, equationLatex, memberLatex, substitute, xt } from '../../math/equation';
import { type Rng, randInt } from '../../rng';
import type { BuildCtx, Outcome, Question, QuestionKind } from '../../exercises/types';
import { errorOf } from '../errors-util';
import type { CourseDef, ErrorDef, EtapeStep, Exercise, LessonPart, Level } from '../types';
import {
  M, NOT_COUNTED_GUESS, NOT_COUNTED_UNDERSTAND, SIGN_CLASSES, annonceFin, autres, buildErrors, choix, decouverte, etapes,
  exemple, explanation, hl, is, lecon, linesScene, oneScene, options3, pratique, redraw, small, step, stepped, texted, toks,
  toText, trou, trouOf, txt,
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
const RULES: Record<string, NonNullable<ErrorDef['rule']>> = {
  'x-colle': { n: 1, label: R1, partIndex: 2 },
  'parentheses-oubliees': { n: 1, label: R1, partIndex: 2 },
  'signe-relatif': { n: 2, label: R2, partIndex: 5 },
};
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
      id: 'signe-relatif',
      family: 'signe',
      detect: (e, given) => is(given, valueIn(e, 'signe')),
      text: (e) =>
        `Dans ${toText(e.expr)}, un produit d’un nombre négatif et d’un nombre positif est négatif : c’est la règle des signes du cours « Multiplier deux relatifs ».`,
      draw: (level, rng) => redraw(() => generate(level, rng), (e) => valueIn(e, 'signe') !== e.answer.n),
      sample: (e) => valueIn(e, 'signe'),
      wrongLines: (e, w) => (w === valueIn(e, 'signe') ? stepped(e, interLatex(pieces(memberOf(e), metaOf(e).x, 'signe')), w) : null),
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
function customQuestion(kind: QuestionKind, ctx: BuildCtx): Question | null {
  if (kind !== 'saisie') return null;
  const trap = errorOf(course, ctx.trapErrorType);
  return saisieEq(trap ? trap.trap(ctx.level, ctx.rng) : generate(ctx.level, ctx.rng));
}

// ——— Leçon : 15 écrans pour apprendre ———
const eqText = (left: Member, right: Member): string => `${memberLatex(left)} = ${memberLatex(right)}`.replace(/-/g, M);
const A = (x: number): Exercise => build(1, [xt(2), cst(1)], [cst(7)], x);
const E3 = (x: number, side: Side = 'left'): Exercise => build(1, [xt(3), cst(4)], [xt(1)], x, side);

const REGLE1 = '**Je remplace x par le nombre, partout, entre parenthèses s’il est négatif.** Le nombre collé à x devient une multiplication.';
const REGLE2 = '**Je calcule le membre de gauche, puis le membre de droite, chacun à part.** Je n’écris pas tout sur une seule ligne.';
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
    scene: linesScene(['2x + 1 = 7'], [`x = 3`]),
    after: linesScene(['2x + 1 = 7'], [`x = 3`], ['gauche = droite : ', hl('équilibre')]),
    action: trouOf('Si les deux côtés donnent la même chose, la balance est [ ? ].', ['à l’équilibre', 'penchée'], 0, {
      1: 'Penchée voudrait dire que les deux côtés sont différents. Ici, on cherche le cas où ils sont égaux.',
    }),
  }),
  step('Pour savoir si la balance est à l’équilibre, on peut **calculer chaque côté**. Voyons comment faire sans se tromper.', {
    scene: linesScene(['2x + 1 = 7'], [`x = 3`]),
  }),
];

const regle1: EtapeStep[] = [
  step(`On teste le nombre ${M}2 dans cette équation. On enlève chaque **x** et on met le nombre à sa place.`, {
    scene: linesScene(['3', hl('x'), ' + 4 = ', hl('x')], [`x = ${M}2`]),
  }),
  step('Regarde bien 3x : le nombre collé à x **multiplie** x. Ce n’est pas un nombre à écrire à côté.', {
    scene: linesScene(['3x + 4']),
    after: linesScene(['3x + 4'], ['3 ', hl('×'), ' x + 4']),
    action: trouOf('Dans 3x, le 3 et le x sont [ ? ].', ['multipliés', 'additionnés'], 0, {
      1: '3x veut dire 3 fois x, pas 3 + x : on multiplie.',
    }),
  }),
  step(`Maintenant on écrit ${M}2 à la place de x. Comme ce nombre est négatif, on le met **entre parenthèses**.`, {
    scene: linesScene(['3 × x + 4']),
    after: linesScene(['3 × x + 4'], ['3 × ', hl(`(${M}2)`), ' + 4']),
    action: trouOf(`Pour x égal à ${M}2, on écrit le nombre [ ? ] dans le calcul.`, ['entre parenthèses', 'sans parenthèses'], 0, {
      1: 'Sans parenthèses, deux signes se suivent et on risque d’en oublier un, surtout dans 5 − x. Les parenthèses les séparent.',
    }),
  }),
  step(undefined, {
    scene: linesScene(['3x + 4 = x'], [`x = ${M}2`], [`3 × (${M}2) + 4 = ${M}2`]),
    rule: { n: 1, text: REGLE1 },
  }),
];

const regle2: EtapeStep[] = [
  step('Un membre, c’est un côté de l’équation. On calcule **celui de gauche d’abord**, tout seul.', {
    scene: oneScene(hl(`3 × (${M}2) + 4`), ` = ${M}2`),
  }),
  step('On commence par le produit, comme dans le cours sur la multiplication des relatifs. Trois fois moins deux donne un résultat négatif.', {
    scene: linesScene([`3 × (${M}2) + 4`]),
    after: linesScene([`3 × (${M}2) + 4`], ['= ', hl(`${M}6`), ' + 4']),
    action: trouOf('Trois fois moins deux donne un résultat [ ? ].', ['négatif', 'positif'], 0, {
      1: 'Un nombre positif multiplié par un nombre négatif donne un négatif : trois fois moins deux fait moins six.',
    }),
  }),
  step(`Ensuite, on ajoute 4. Moins six plus quatre : le plus grand sans le signe, le six, gagne.`, {
    scene: linesScene([`3 × (${M}2) + 4`], [`= ${M}6 + 4`]),
    after: linesScene([`3 × (${M}2) + 4`], [`= ${M}6 + 4`], ['= ', hl(`${M}2`)]),
    action: trouOf('Moins six plus quatre donne un résultat [ ? ].', ['négatif', 'positif'], 0, {
      1: `Le six est plus grand que le quatre, et il est négatif : le résultat est négatif, ${M}2.`,
    }),
  }),
  step(undefined, {
    scene: linesScene([`gauche : 3 × (${M}2) + 4 = ${M}2`], [`droite : x = ${M}2`]),
    rule: { n: 2, text: REGLE2 },
  }),
];

const regle3: EtapeStep[] = [
  step('Il reste à **comparer** : est-ce que les deux membres ont la même valeur ?', {
    scene: linesScene([`gauche : ${M}2`], [`droite : ${M}2`]),
  }),
  step(`Ici, la gauche vaut ${M}2 et la droite vaut ${M}2. Les deux résultats sont égaux.`, {
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

const exemple1: EtapeStep[] = [
  step('Voici la résolution. Lis la première ligne, puis touche « Je comprends ».', {
    scene: linesScene(['3x + 4 = x'], [`x = ${M}2`]),
  }),
  step(`On remplace x par ${M}2, entre parenthèses, et on écrit le calcul du membre de gauche.`, {
    scene: linesScene(['3x + 4 = x'], [`x = ${M}2`], [hl(`gauche : 3 × (${M}2) + 4`)]),
    action: { type: 'comprends' },
  }),
];

const PRATIQUE = pratique(
  'Cours 1 · Pratique',
  [
    {
      question: trou(build(1, [xt(2), cst(5)], [cst(1)], -2), '= \\square', 1),
      texts: {
        consigne: 'Le produit est déjà fait. **Tape le résultat dans la case.**',
        intro: [`On teste x = ${M}2 dans 2x + 5 = 1. On calcule le membre de gauche.`],
        above: ['= -4 + 5'],
      },
    },
    {
      question: choix(
        build(1, [xt(4), cst(-5)], [xt(2), cst(1)], 3),
        'Le nombre 3 est-il une solution de cette équation ?',
        options3(
          ['Oui : les deux membres valent 7', 'Oui : 4 × 3 − 5 fait 7, et 2 × 3 + 1 fait 7. Les deux résultats sont égaux.'],
          ['Non : la gauche vaut 7 et la droite vaut 1', 'La droite n’est pas 1 : c’est 2x + 1, donc 2 × 3 + 1, qui fait 7.'],
          ['Non : la gauche vaut 12', 'Après 4 × 3, il faut encore retirer 5 : la gauche vaut 7, comme la droite.'],
        ),
        0,
        `4x ${M} 5 = 2x + 1`,
      ),
      texts: { consigne: 'Calcule les deux membres dans ta tête, puis touche ta réponse.' },
    },
    {
      question: choix(
        { courseId: 'c04-soustraire', level: 1, expr: substitute([cst(5), xt(-1)], -3), answer: evaluate(substitute([cst(5), xt(-1)], -3)) },
        'Ce calcul vient du cours sur la soustraction. Quel est le résultat ?',
        options3(
          ['8', 'Oui : soustraire −3, c’est ajouter son opposé, 3. Donc 5 + 3 fait 8.'],
          ['2', 'Tu as retiré 3 au lieu de retirer −3. Soustraire un négatif, c’est ajouter son opposé.'],
          [`${M}8`, 'Cinq moins moins trois : on ajoute 3, le résultat est positif, 8.'],
        ),
        0,
        '5 - (-3)',
      ),
      texts: { consigne: 'Regarde bien les signes, puis touche le résultat.', intro: [`C’est le calcul de 5 − x quand x vaut ${M}3.`] },
    },
    {
      question: saisieEq(build(1, [cst(7), xt(-2)], [xt(1), cst(-8)], 5)),
      texts: { consigne: 'Calcule le membre de gauche. **Tape le résultat.**' },
    },
  ],
  "Maintenant, deux exemples pour t'aider à les résoudre en entier.",
);

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
  texted(
    lecon(
      small(build(1, [xt(2), cst(1)], [cst(7)], 3), '2x \\quad (x = 3)', 'Quel calcul obtient-on pour 2x quand x vaut 3 ?', [
        ['2 × 3', 'Oui : 2x veut dire 2 fois x, donc 2 × 3.'],
        ['23', 'On ne colle pas les chiffres : 2x veut dire 2 × x, donc 2 × 3.'],
        ['2 + 3', '2x veut dire 2 fois x : on multiplie, on n’additionne pas.'],
      ], 0),
    ),
    { joinPrevious: true },
  ),
  etapes(R2, regle2),
  lecon(
    small(build(1, [xt(2), cst(3)], [xt(1), cst(-4)], -2, 'right'), `x - 4 \\quad (x = -2)`, 'Que vaut le membre de droite, x − 4, quand x vaut −2 ?', [
      [`${M}6`, 'Oui : x vaut −2, puis −2 − 4 fait −6.'],
      [`${M}2`, 'Tu as oublié de retrancher 4 : il reste −2 − 4.'],
      ['2', 'Le signe de x a disparu : x vaut −2, pas 2.'],
    ], 0),
  ),
  etapes(R3, regle3),
  lecon(
    choix(
      build(1, [xt(3), cst(-2)], [xt(2), cst(4)], 4),
      'Le nombre 4 est-il une solution de cette équation ?',
      options3(
        ['Non : la gauche vaut 10 et la droite vaut 12', 'Oui, c’est ça : 3 × 4 − 2 fait 10, 2 × 4 + 4 fait 12. Les résultats sont différents.'],
        ['Oui : la gauche et la droite valent 10', 'La droite vaut 2 × 4 + 4, donc 12, pas 10. Calcule bien le membre de droite.'],
        ['Oui : le nombre testé est 4', 'Le nombre testé ne se compare à rien : on compare le membre de gauche et le membre de droite.'],
      ),
      0,
      `3x ${M} 2 = 2x + 4 \\quad (x = 4)`,
    ),
  ),
  texted(
    decouverte(
      choix(
        build(1, [xt(2), cst(1)], [cst(7)], -3),
        'Que vaut chaque calcul ?',
        options3(
          [`A fait ${M}6 et B fait ${M}1`, 'Oui : A est une multiplication, 2 × (−3) fait −6. B est une addition, 2 + (−3) fait −1.'],
          [`A fait ${M}1 et B fait ${M}1`, 'A est une multiplication : 2x veut dire 2 × x, donc 2 × (−3), qui fait −6.'],
          [`A fait ${M}6 et B fait ${M}6`, 'B est une addition : 2 + (−3) fait −1.'],
        ),
        0,
      ),
    ),
    {
      title: 'Comparer deux cas',
      intro: ['Voici deux calculs qui se ressemblent beaucoup. Regarde bien l’opération.'],
      mention: NOT_COUNTED_UNDERSTAND,
      compare: {
        a: { label: 'Calcul A : 2x avec x = −3', latex: '2 \\times (-3)' },
        b: { label: 'Calcul B', latex: '2 + (-3)' },
        note: 'Le calcul B vient du cours « Additionner deux nombres de signes contraires » : tu sais déjà le faire. Ici, tu observes seulement ce qui change.',
        highlight: { a: toks('2 ', hl('×'), ` (${M}3)`), b: toks('2 ', hl('+'), ` (${M}3)`) },
        after: [
          `A : 2x veut dire 2 × x. Avec x = ${M}3, on multiplie : ${M}6.`,
          `B : on additionne 2 et ${M}3 : ${M}1.`,
          'Ce qui change : à côté d’une lettre, un nombre veut dire « fois ». Entre deux nombres, c’est le signe qui décide.',
        ],
      },
    },
  ),
  autres({
    title: 'Autres façons de faire',
    recap: {
      title: 'Les règles à retenir',
      rules: [
        { title: '1. Je remplace x par le nombre', ok: `2x pour x = 3 : 2 × 3`, ko: '2x pour x = 3 : 23' },
        { title: '2. Je calcule chaque membre à part', ok: `3 × (${M}2) + 4 = ${M}6 + 4 = ${M}2`, ko: `3 × (${M}2) + 4 = 10` },
        { title: '3. Je compare les deux résultats', ok: `gauche ${M}2, droite ${M}2 : solution`, ko: `gauche ${M}2, nombre testé ${M}2 : solution` },
      ],
      sentence: 'Je remplace x, je calcule chaque membre, puis je compare.',
    },
    intro: 'La méthode marche toujours. Voici d’autres façons de faire : **choisis celle que tu veux essayer**.',
    techniques: [
      {
        name: 'Essayer pour trouver',
        quand: 'Quand tu ne sais pas encore résoudre l’équation.',
        example: `x + 2 = 5 : pour x = 1 on trouve 3, pour x = 2 on trouve 4, pour x = 3 on trouve 5. La solution est 3.`,
        how: 'On essaie des nombres, un par un, et on s’arrête quand les deux membres sont égaux.',
        essai: {
          kind: 'saisie',
          consigne: 'Essaie x = 1, puis x = 2, et ainsi de suite. **Tape la solution.**',
          calc: '2x + 1 = 7',
          answer: 3,
          yes: 'Oui : pour x = 3, 2 × 3 + 1 fait 7, comme à droite.',
          errors: [
            { values: [7], message: 'Sept est ce que doit valoir le côté gauche. On cherche x : le nombre à mettre à la place de x.' },
            { values: [4], message: 'Pour x = 4, 2 × 4 + 1 fait 9, pas 7.' },
          ],
          fallback: 'Pour chaque nombre essayé, calcule 2 × x + 1 et regarde si tu trouves 7.',
        },
      },
      {
        name: 'Vérifier sa réponse',
        quand: 'Quand tu as trouvé une valeur de x et que tu veux être sûr.',
        example: `2x + 1 = 7 avec x = 3 : la gauche vaut 2 × 3 + 1 = 7, la droite vaut 7. C’est juste.`,
        how: 'On remplace x par la valeur trouvée et on compare les deux membres : c’est la même méthode.',
        essai: {
          kind: 'choix',
          consigne: 'Un élève a trouvé x = 4. Vérifie sa réponse. **Touche ce que vaut le côté gauche.**',
          calc: `3x ${M} 2 = 10`,
          options: ['10', '12', '14'],
          correct: 0,
          yes: 'Oui : 3 × 4 fait 12, moins 2 fait 10, comme à droite. Sa réponse est juste.',
          no: 'Remplace x par 4 : 3 × 4 fait 12, puis on retire 2.',
        },
      },
    ],
    outro: "Ensuite, tu t'entraînes avec quatre questions.",
  }),
  PRATIQUE,
  etapes('Exemple 1 sur 2', exemple1),
  texted(exemple(trou(E3(-2), '= \\square', -2)), {
    consigne: 'Tape ce qui manque dans la case, avec les touches du clavier.',
    intro: [`On teste x = ${M}2 dans 3x + 4 = x. Calcul du membre de gauche :`],
    above: ['= -6 + 4'],
    help: 'Moins six plus quatre : le six est le plus grand sans le signe, donc le résultat est négatif, moins deux. La droite vaut aussi moins deux : c’est une solution.',
  }),
  texted(exemple(trou(build(2, [cst(5), xt(-1)], [xt(2), cst(14)], -3), '= \\square', 8)), {
    consigne: 'Cette fois, deux cases sont à toi. Commence par le membre de gauche.',
    intro: [`On teste x = ${M}3 dans ${eqText([cst(5), xt(-1)], [xt(2), cst(14)])}.`],
    above: [`\\text{avec } x = -3`],
    help: `Moins trois est un nombre négatif : soustraire ${M}3, c’est ajouter 3. Cinq plus trois fait huit.`,
  }),
  texted(exemple(trou(build(2, [cst(5), xt(-1)], [xt(2), cst(14)], -3, 'right'), '= \\square', 8)), {
    consigne: 'Maintenant le membre de droite.',
    intro: [`Le membre de gauche vaut 8. Calcule le membre de droite : 2x + 14.`],
    above: [`\\text{avec } x = -3`],
    help: `Deux fois moins trois fait moins six, puis moins six plus quatorze fait huit. Les deux membres valent 8 : ${M}3 est une solution.`,
    mention: '',
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
  lessonLength: parts.findIndex((p) => p.type === 'pratique'),
  unePhrase: true,
  endExercises: { count: 5, kind: 'saisie' },
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
      'Je calcule le membre de gauche, puis le membre de droite, séparément.',
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
