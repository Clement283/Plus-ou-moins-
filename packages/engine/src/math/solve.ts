// Résolution pas à pas d'une équation ou inéquation du premier degré, comme au tableau :
// une ligne « opération » (2x + 3 − 3 = 7 − 3), puis la ligne réduite (2x = 4), et ainsi de suite.
// Sert aux exemples guidés, aux indices et à juger la ligne que l'élève écrit.
import {
  type Equation,
  type Member,
  type Relation,
  collect,
  cst,
  flipRel,
  xt,
} from './equation';
import { type Rational, div, eqRat, rat } from './rational';

/** Ce qu'on fait aux deux membres. `swap` : on échange les membres (7 = 2x devient 2x = 7). */
export type StepOp =
  | { k: 'add'; v: number }
  | { k: 'addX'; c: number }
  | { k: 'div'; v: number }
  | { k: 'swap' };

/** Ce qu'on écrit à côté de chaque membre : −3, +2x, ÷ (−2). Rien pour `swap`. */
export function opLatex(op: StepOp): string | null {
  switch (op.k) {
    case 'add': return op.v < 0 ? `-${-op.v}` : `+${op.v}`;
    case 'addX': {
      const a = Math.abs(op.c);
      return `${op.c < 0 ? '-' : '+'}${a === 1 ? '' : a}x`;
    }
    case 'div': return op.v < 0 ? `\\div (-${-op.v})` : `\\div ${op.v}`;
    case 'swap': return null;
  }
}

/** La ligne obtenue en appliquant `op` aux deux membres, sans réduire. Diviser par un négatif change le sens. */
export function applyOp(eq: Equation, op: StepOp): Equation {
  if (eq.div !== undefined) throw new Error('applyOp : réduire la ligne d’abord');
  const both = (t: Member[number]): Equation => ({
    left: [...eq.left, t],
    right: [...eq.right, t],
    rel: eq.rel,
  });
  switch (op.k) {
    case 'add':
      if (op.v === 0) throw new Error('applyOp : ajouter 0');
      return both(cst(op.v));
    case 'addX':
      if (op.c === 0) throw new Error('applyOp : ajouter 0x');
      return both(xt(op.c));
    case 'div':
      if (op.v === 0) throw new Error('applyOp : diviser par 0');
      return { left: eq.left, right: eq.right, rel: op.v < 0 ? flipRel(eq.rel) : eq.rel, div: op.v };
    case 'swap':
      return { left: eq.right, right: eq.left, rel: flipRel(eq.rel) };
  }
}

/** Membre réduit, x d'abord : 2x + 1, −x, 7, 0. Exige des coefficients entiers. */
function reduced(a: Rational, b: Rational): Member {
  if (a.d !== 1 || b.d !== 1) throw new Error('Coefficients non entiers');
  const m: Member = [];
  if (a.n !== 0) m.push(xt(a.n));
  if (b.n !== 0) m.push(cst(b.n));
  return m.length ? m : [cst(0)];
}

/** La ligne réduite : chaque membre regroupé (et divisé, pour une ligne « ÷ d »). */
export function simplify(eq: Equation): Equation {
  const d = eq.div ?? 1;
  const side = (m: Member) => {
    const { a, b } = collect(m);
    return reduced(div(a, rat(d)), div(b, rat(d)));
  };
  return { left: side(eq.left), right: side(eq.right), rel: eq.rel };
}

const sameTerm = (s: Member[number], t: Member[number]) =>
  s.k === t.k && (s.k === 'x' ? s.coef === (t as typeof s).coef : s.v === (t as typeof s).v);
const sameMember = (m: Member, n: Member) =>
  m.length === n.length && m.every((t, i) => sameTerm(t, n[i]!));

/** Même écriture (mêmes termes dans le même ordre, même signe). */
export const sameEquation = (e: Equation, f: Equation): boolean =>
  e.rel === f.rel && e.div === f.div && sameMember(e.left, f.left) && sameMember(e.right, f.right);

export const isReduced = (eq: Equation): boolean => eq.div === undefined && sameEquation(eq, simplify(eq));

/** Ligne finale : x = 2, x ⩾ −3 (x seul à gauche, un nombre à droite). */
export function isFinal(eq: Equation): boolean {
  if (eq.div !== undefined) return false;
  const [t, ...rest] = eq.left;
  return t?.k === 'x' && t.coef === 1 && rest.length === 0 && eq.right.length === 1 && eq.right[0]!.k === 'num';
}

/**
 * L'étape suivante, sur une ligne réduite : (1) x seulement à droite → échanger les membres ;
 * (2) x des deux côtés → retirer le terme en x de droite ; (3) nombre à gauche → le retirer ;
 * (4) coefficient ≠ 1 → diviser. `null` : la ligne est finale, ou x a disparu.
 */
export function nextStep(eq: Equation): StepOp | null {
  const l = collect(eq.left);
  const r = collect(eq.right);
  if (l.a.n === 0 && r.a.n === 0) return null;
  if (l.a.n === 0) return { k: 'swap' };
  if (r.a.n !== 0) return { k: 'addX', c: -r.a.n / r.a.d };
  if (l.b.n !== 0) return { k: 'add', v: -l.b.n / l.b.d };
  if (!(l.a.n === 1 && l.a.d === 1)) return { k: 'div', v: l.a.n / l.a.d };
  return null;
}

export type SolutionSet =
  | { kind: 'one'; x: Rational }
  | { kind: 'none' }
  | { kind: 'all' }
  /** x rel bound, par exemple x ⩾ −3. */
  | { kind: 'ray'; rel: Exclude<Relation, '='>; bound: Rational };

/** Ensemble des solutions d'une équation ou d'une inéquation du premier degré. */
export function solutionSet(eq: Equation): SolutionSet {
  const l = collect(eq.left);
  const r = collect(eq.right);
  const a = rat(l.a.n * r.a.d - r.a.n * l.a.d, l.a.d * r.a.d);
  const b = rat(r.b.n * l.b.d - l.b.n * r.b.d, r.b.d * l.b.d);
  // eq.div ne change rien : le sens a déjà été retourné par applyOp si d < 0 ;
  // on se ramène à a·x rel' b avec le sens d'origine.
  const rel = eq.div !== undefined && eq.div < 0 ? flipRel(eq.rel) : eq.rel;
  if (a.n === 0) {
    const s = Math.sign(-b.n); // 0 rel b  ⇔  0 − b rel 0
    const ok = { '=': s === 0, '<': s < 0, '<=': s <= 0, '>': s > 0, '>=': s >= 0 }[rel];
    return ok ? { kind: 'all' } : { kind: 'none' };
  }
  const x = div(b, a);
  if (rel === '=') return { kind: 'one', x };
  return { kind: 'ray', rel: (a.n < 0 ? flipRel(rel) : rel) as Exclude<Relation, '='>, bound: x };
}

export function sameSet(s: SolutionSet, t: SolutionSet): boolean {
  if (s.kind !== t.kind) return false;
  if (s.kind === 'one') return eqRat(s.x, (t as typeof s).x);
  if (s.kind === 'ray') return s.rel === (t as typeof s).rel && eqRat(s.bound, (t as typeof s).bound);
  return true;
}

export const equivalent = (e: Equation, f: Equation): boolean => sameSet(solutionSet(e), solutionSet(f));

export interface ResolutionLine {
  eq: Equation;
  /** 'depart' : l'énoncé ; 'reduction' : on regroupe ; 'operation' : `op` appliquée aux deux membres. */
  note: 'depart' | 'reduction' | 'operation';
  op?: StepOp;
}

/** Toute la résolution, ligne par ligne, jusqu'à x = … (ou jusqu'à ce que x disparaisse). */
export function resolve(start: Equation): { lines: ResolutionLine[]; set: SolutionSet } {
  const lines: ResolutionLine[] = [{ eq: start, note: 'depart' }];
  let cur = start;
  if (!isReduced(cur)) {
    cur = simplify(cur);
    lines.push({ eq: cur, note: 'reduction' });
  }
  for (let op = nextStep(cur), n = 0; op && n < 8; op = nextStep(cur), n++) {
    const opLine = applyOp(cur, op);
    if (op.k === 'swap') {
      lines.push({ eq: opLine, note: 'operation', op });
      cur = opLine;
      continue;
    }
    lines.push({ eq: opLine, note: 'operation', op });
    cur = simplify(opLine);
    lines.push({ eq: cur, note: 'reduction' });
  }
  return { lines, set: solutionSet(start) };
}

export type StepErrorId =
  | 'un-seul-cote'
  | 'signe-garde'
  | 'soustraire-coef'
  | 'signe-perdu-division'
  | 'sens-non-change';

const tryEq = (f: () => Equation): Equation | null => {
  try {
    return simplify(f());
  } catch {
    return null;
  }
};

/**
 * Les lignes fausses typiques après `prev` (ligne réduite), une par erreur classique :
 * opération faite d'un seul côté ; « passer de l'autre côté » sans changer le signe ;
 * soustraire le coefficient au lieu de diviser ; signe perdu en divisant par un négatif ;
 * sens de l'inégalité non changé.
 */
export function wrongNext(prev: Equation): { id: StepErrorId; eq: Equation }[] {
  const op = nextStep(prev);
  if (!op) return [];
  const out: { id: StepErrorId; eq: Equation | null }[] = [];
  const r = collect(prev.right);
  const l = collect(prev.left);
  const ineq = prev.rel !== '=';
  if (op.k === 'add' || op.k === 'addX') {
    const t = op.k === 'add' ? cst(op.v) : xt(op.c);
    const opp = op.k === 'add' ? cst(-op.v) : xt(-op.c);
    out.push({ id: 'un-seul-cote', eq: tryEq(() => ({ ...prev, left: [...prev.left, t] })) });
    out.push({ id: 'un-seul-cote', eq: tryEq(() => ({ ...prev, right: [...prev.right, t] })) });
    // Le terme « passe de l'autre côté » en gardant son signe : 2x + 3 = 7 → 2x = 7 + 3 ; 5x + 1 = 2x + 7 → 7x + 1 = 7.
    const moved = op.k === 'add'
      ? { left: [...prev.left, t], right: [...prev.right, opp] }
      : { left: [...prev.left, opp], right: [...prev.right, t] };
    out.push({ id: 'signe-garde', eq: tryEq(() => ({ ...prev, ...moved })) });
  }
  if (op.k === 'div') {
    const a = l.a.n;
    const b = r.b.n;
    out.push({ id: 'un-seul-cote', eq: { left: [xt(1)], right: [b === 0 ? cst(0) : cst(b)], rel: prev.rel } });
    if (b - a !== 0) out.push({ id: 'soustraire-coef', eq: { left: [xt(1)], right: [cst(b - a)], rel: prev.rel } });
    const good = applyOp(prev, op);
    if (a < 0 && b % a === 0 && b !== 0)
      out.push({ id: 'signe-perdu-division', eq: { left: [xt(1)], right: [cst(b / -a)], rel: prev.rel } });
    if (ineq && a < 0) out.push({ id: 'sens-non-change', eq: tryEq(() => ({ ...good, rel: prev.rel })) });
  }
  if (op.k === 'swap' && ineq) {
    out.push({ id: 'sens-non-change', eq: { left: prev.right, right: prev.left, rel: prev.rel } });
  }
  return out.filter((w): w is { id: StepErrorId; eq: Equation } => w.eq !== null && !equivalent(w.eq, prev));
}

export interface LineVerdict {
  correct: boolean;
  /** La ligne donne x = … (ou x ⩾ …) : la résolution est finie. */
  final: boolean;
  /** Juste mais sans avancer : une fois réduite, c'est la même ligne qu'avant (ligne recopiée). */
  unchanged: boolean;
  errorId: StepErrorId | null;
}

/** Juge la ligne écrite par l'élève après `prev` : juste si elle garde les mêmes solutions. */
export function judgeLine(prev: Equation, given: Equation): LineVerdict {
  if (equivalent(prev, given)) {
    const unchanged = !isFinal(given) && sameEquation(simplify(prev), simplify(given));
    return { correct: true, final: isFinal(given), unchanged, errorId: null };
  }
  const g = solutionSet(given);
  const hit = wrongNext(prev.div === undefined && isReduced(prev) ? prev : simplify(prev)).find((w) =>
    sameSet(solutionSet(w.eq), g),
  );
  return { correct: false, final: false, unchanged: false, errorId: hit?.id ?? null };
}
