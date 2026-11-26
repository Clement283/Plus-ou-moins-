// Équations et inéquations du premier degré à une inconnue x (module « Équations et inéquations »).
// Un membre est une liste de termes, gardés tels qu'écrits (4x + 1 − 2x n'est pas réduit) :
// une ligne de résolution montre ce que l'élève écrit. Les calculs restent des `Expr` :
// `substitute` remplace x par un nombre et rend un calcul ordinaire (toLatex, evaluate…).
import { type Expr, num, op } from './expr';
import { type Rational, add, div, mul, rat, sub } from './rational';

/** Terme en x (coef·x) ou nombre seul. Coefficient non nul, entier. */
export type Term = { k: 'x'; coef: number } | { k: 'num'; v: number };
export type Member = Term[];
export type Relation = '=' | '<' | '<=' | '>' | '>=';
export interface Equation {
  left: Member;
  right: Member;
  rel: Relation;
  /** Ligne « on divise les deux membres par d » : chaque membre s'écrit en fraction sur d (voir solve.ts). */
  div?: number;
}

export const xt = (coef: number): Term => ({ k: 'x', coef });
export const cst = (v: number): Term => ({ k: 'num', v });
export const equation = (left: Member, right: Member, rel: Relation = '='): Equation => ({
  left,
  right,
  rel,
});

const value = (t: Term): number => (t.k === 'x' ? t.coef : t.v);

/** Un membre nul s'écrit [cst(0)]. */
export const isZeroMember = (m: Member): boolean => m.length === 1 && m[0]!.k === 'num' && m[0]!.v === 0;

function check(m: Member): void {
  if (m.length === 0) throw new Error('Membre vide');
  m.forEach((t, i) => {
    const v = value(t);
    // 0 seulement comme nombre en tête : « 0 », ou « 0 − 3 » quand on retire 3 d'un membre nul.
    const zeroOk = v === 0 && i === 0 && t.k === 'num';
    if ((v === 0 && !zeroOk) || !Number.isInteger(v)) throw new Error(`Terme invalide : ${v}`);
  });
}

/** Écriture d'un terme sans son signe : 3x, x, 7. */
function body(t: Term): string {
  const a = Math.abs(value(t));
  return t.k === 'num' ? `${a}` : a === 1 ? 'x' : `${a}x`;
}

/** LaTeX d'un membre, à la façon d'un cahier : 2x - 3, -x + 4, 5 - x. */
export function memberLatex(m: Member): string {
  check(m);
  return m
    .map((t, i) => {
      const negative = value(t) < 0;
      if (i === 0) return negative ? `-${body(t)}` : body(t);
      return `${negative ? '-' : '+'} ${body(t)}`;
    })
    .join(' ');
}

const REL_LATEX: Record<Relation, string> = {
  '=': '=',
  '<': '<',
  '<=': '\\leqslant',
  '>': '>',
  '>=': '\\geqslant',
};

export const relationLatex = (rel: Relation): string => REL_LATEX[rel];

const DIV_LATEX = (m: Member, d: number): string =>
  `\\frac{${memberLatex(m)}}{${d < 0 ? `-${-d}` : d}}`;

export function equationLatex(eq: Equation): string {
  const side = (m: Member) => (eq.div === undefined ? memberLatex(m) : DIV_LATEX(m, eq.div));
  return `${side(eq.left)} ${REL_LATEX[eq.rel]} ${side(eq.right)}`;
}

/** Sens contraire : < devient >, ⩽ devient ⩾ ; = reste =. */
export function flipRel(rel: Relation): Relation {
  const f: Record<Relation, Relation> = { '=': '=', '<': '>', '<=': '>=', '>': '<', '>=': '<=' };
  return f[rel];
}

/**
 * Le calcul obtenu en remplaçant x par `v` : 3x + 4 pour x = −2 donne 3 × (−2) + 4 ;
 * 5 − x pour x = −3 donne 5 − (−3). Un terme négatif après le premier devient une soustraction.
 * Limite : −x en tête n'a pas d'écriture sans moins unaire ; il donne (−1) × v.
 */
export function substitute(m: Member, v: number): Expr {
  check(m);
  const abs = (t: Term): Expr => {
    const a = Math.abs(value(t));
    if (t.k === 'num') return num(a);
    return a === 1 ? num(v) : op('*', num(a), num(v));
  };
  const first = (t: Term): Expr => {
    if (t.k === 'num') return num(t.v);
    return t.coef === 1 ? num(v) : op('*', num(t.coef), num(v));
  };
  return m
    .slice(1)
    .reduce<Expr>((acc, t) => op(value(t) < 0 ? '-' : '+', acc, abs(t)), first(m[0]!));
}

/** Membre réduit à a·x + b. */
export function collect(m: Member): { a: Rational; b: Rational } {
  check(m);
  let a = rat(0);
  let b = rat(0);
  for (const t of m) {
    if (t.k === 'x') a = add(a, rat(t.coef));
    else b = add(b, rat(t.v));
  }
  return { a, b };
}

export function evalMember(m: Member, x: Rational): Rational {
  const { a, b } = collect(m);
  return add(mul(a, x), b);
}

/** `x` vérifie-t-il l'équation ou l'inéquation ? */
export function isSolution(eq: Equation, x: number | Rational): boolean {
  const v = typeof x === 'number' ? rat(x) : x;
  const k = eq.div === undefined ? rat(1) : rat(1, eq.div);
  const d = mul(sub(evalMember(eq.left, v), evalMember(eq.right, v)), k);
  const s = Math.sign(d.n);
  switch (eq.rel) {
    case '=': return s === 0;
    case '<': return s < 0;
    case '<=': return s <= 0;
    case '>': return s > 0;
    case '>=': return s >= 0;
  }
}

export type LinearSolution = { kind: 'one'; x: Rational } | { kind: 'none' } | { kind: 'all' };

/** Solution d'une équation du premier degré (pas d'une inéquation). */
export function solveLinear(eq: Equation): LinearSolution {
  if (eq.rel !== '=') throw new Error('solveLinear : équation seulement');
  const l = collect(eq.left);
  const r = collect(eq.right);
  const a = sub(l.a, r.a);
  const b = sub(r.b, l.b);
  if (a.n === 0) return b.n === 0 ? { kind: 'all' } : { kind: 'none' };
  return { kind: 'one', x: div(b, a) };
}
