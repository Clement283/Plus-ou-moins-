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
import { type Rational, div, eqRat, mul, neg, rat, sub } from './rational';

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

/** Membre réduit, x d'abord : 2x + 1, −x, 7, 0, ou une fraction irréductible (3/2). */
function reduced(a: Rational, b: Rational): Member {
  const m: Member = [];
  if (a.n !== 0) m.push(xt(a.n, a.d));
  if (b.n !== 0) m.push(cst(b.n, b.d));
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
  s.k === t.k &&
  (s.den ?? 1) === (t.den ?? 1) &&
  (s.k === 'x' ? s.coef === (t as typeof s).coef : s.v === (t as typeof s).v);
const sameMember = (m: Member, n: Member) =>
  m.length === n.length && m.every((t, i) => sameTerm(t, n[i]!));

/** Même écriture (mêmes termes dans le même ordre, même signe). */
export const sameEquation = (e: Equation, f: Equation): boolean =>
  e.rel === f.rel && e.div === f.div && sameMember(e.left, f.left) && sameMember(e.right, f.right);

export const isReduced = (eq: Equation): boolean => eq.div === undefined && sameEquation(eq, simplify(eq));

const xAlone = (m: Member) => m.length === 1 && m[0]!.k === 'x' && m[0]!.coef === 1 && m[0]!.den === undefined;
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
/** Un nombre seul, écrit simplement : 4, −3, ou une fraction irréductible à dénominateur positif (3/2). */
const numAlone = (m: Member) => {
  const t = m[0];
  if (m.length !== 1 || t?.k !== 'num') return false;
  return t.den === undefined || (t.den > 1 && gcd(t.v, t.den) === 1);
};

/** Une fraction qui se simplifie (12/3, −6/−2) : la ligne est juste mais pas finie. */
export const hasReducibleFraction = (eq: Equation): boolean =>
  [...eq.left, ...eq.right].some((t) => t.den !== undefined && (t.den < 0 || gcd(t.k === 'x' ? t.coef : t.v, t.den) !== 1));

/** Ligne finale : x = 2, x ⩾ −3, ou écrite à l'envers : 2 = x, −3 ⩽ x. */
export function isFinal(eq: Equation): boolean {
  if (eq.div !== undefined) return false;
  return (xAlone(eq.left) && numAlone(eq.right)) || (numAlone(eq.left) && xAlone(eq.right));
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
  | 'reduction'
  | 'sens-change-a-tort'
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
 * Lignes fausses typiques au moment de diviser, sur la ligne réduite a·x = b (`prev`) :
 * soustraire le coefficient au lieu de diviser ; signe perdu en divisant par un négatif ;
 * sens de l'inégalité non changé. (Les erreurs d'addition sont reconnues par `judgeLine`
 * quelle que soit l'opération choisie, voir `addError`.)
 */
export function wrongNext(prev: Equation): { id: StepErrorId; eq: Equation }[] {
  const op = nextStep(prev);
  if (!op || op.k !== 'div') return [];
  const out: { id: StepErrorId; eq: Equation | null }[] = [];
  const ca = collect(prev.left).a;
  const cb = collect(prev.right).b;
  if (ca.d !== 1 || cb.d !== 1) return [];
  const a = ca.n;
  const b = cb.n;
  const ineq = prev.rel !== '=';
  if (b - a !== 0) out.push({ id: 'soustraire-coef', eq: { left: [xt(1)], right: [cst(b - a)], rel: prev.rel } });
  if (a < 0 && b % a === 0 && b !== 0)
    out.push({ id: 'signe-perdu-division', eq: { left: [xt(1)], right: [cst(b / -a)], rel: flipRel(prev.rel) } });
  if (ineq && a < 0) out.push({ id: 'sens-non-change', eq: tryEq(() => ({ ...applyOp(prev, op), rel: prev.rel })) });
  return out.filter((w): w is { id: StepErrorId; eq: Equation } => w.eq !== null && !equivalent(w.eq, prev));
}

type Lin = { a: Rational; b: Rational };
const linSub = (p: Lin, q: Lin): Lin => ({ a: sub(p.a, q.a), b: sub(p.b, q.b) });
const linZero = (p: Lin) => p.a.n === 0 && p.b.n === 0;
const linEq = (p: Lin, q: Lin) => eqRat(p.a, q.a) && eqRat(p.b, q.b);
const linNeg = (p: Lin): Lin => ({ a: neg(p.a), b: neg(p.b) });
/** Le membre a-t-il des termes à regrouper (deux termes en x, ou deux nombres) ? */
const unreduced = (m: Member) =>
  m.filter((t) => t.k === 'x').length > 1 || m.filter((t) => t.k === 'num').length > 1;

/** Ce que l'élève a fait entre deux lignes, lu en comparant les membres (pas la méthode du cours). */
export type DoneOp =
  | { k: 'add'; x: number; n: number } // ajouté x·x + n aux deux membres (−x + 3 : x = −1, n = 3)
  | { k: 'div'; v: number }
  | { k: 'swap' }
  | { k: 'reduce' } // seulement regroupé
  | { k: 'several' }; // plusieurs étapes d'un coup (juste, mais sans une seule opération lisible)

/** Pour une ligne juste : l'opération faite, à écrire sous chaque membre. */
export function inferOp(prev: Equation, given: Equation): DoneOp {
  const pl = collect(prev.left);
  const pr = collect(prev.right);
  const gl = collect(given.left);
  const gr = collect(given.right);
  if (linEq(gl, pr) && linEq(gr, pl) && given.rel === flipRel(prev.rel) && !linEq(pl, pr)) return { k: 'swap' };
  const dl = linSub(gl, pl);
  const dr = linSub(gr, pr);
  if (linEq(dl, dr) && given.rel === prev.rel) {
    if (linZero(dl)) return { k: 'reduce' };
    if (dl.a.d === 1 && dl.b.d === 1) return { k: 'add', x: dl.a.n, n: dl.b.n };
  }
  // Division : prev = d · given, membre à membre (le sens change si d < 0).
  const ratio = (p: Lin, g: Lin): Rational | null => {
    if (g.a.n !== 0) return div(p.a, g.a);
    if (g.b.n !== 0) return div(p.b, g.b);
    return null;
  };
  const d = ratio(pl, gl) ?? ratio(pr, gr);
  if (d && d.d === 1 && d.n !== 0 && d.n !== 1) {
    const k = rat(d.n);
    const times = (g: Lin): Lin => ({ a: mul(g.a, k), b: mul(g.b, k) });
    const rel = d.n < 0 ? flipRel(prev.rel) : prev.rel;
    if (linEq(times(gl), pl) && linEq(times(gr), pr) && given.rel === rel) return { k: 'div', v: d.n };
  }
  return { k: 'several' };
}

/** Écriture de l'opération faite : « −x + 3 », « ÷ 3 », null pour une réduction ou plusieurs étapes. */
export function doneOpLatex(op: DoneOp): string | null {
  switch (op.k) {
    case 'add': {
      const parts: string[] = [];
      if (op.x !== 0) parts.push(opLatex({ k: 'addX', c: op.x })!);
      if (op.n !== 0) parts.push(opLatex({ k: 'add', v: op.n })!);
      return parts.join(' ');
    }
    case 'div': return opLatex({ k: 'div', v: op.v });
    default: return null;
  }
}

/**
 * Erreurs d'une étape « on ajoute aux deux membres », quelle que soit l'opération choisie :
 * un seul membre a changé ; un terme a changé de côté en gardant son signe ; erreur en regroupant ;
 * sens changé sans raison.
 */
function addError(prev: Equation, given: Equation): StepErrorId | null {
  const dl = linSub(collect(given.left), collect(prev.left));
  const dr = linSub(collect(given.right), collect(prev.right));
  const ineq = prev.rel !== '=';
  if (ineq && given.rel === flipRel(prev.rel) && linEq(dl, dr)) return 'sens-change-a-tort';
  if (given.rel !== prev.rel) return null;
  if (linZero(dl) !== linZero(dr)) {
    const changed = linZero(dl) ? 'right' : 'left';
    // Le membre qui change était à regrouper et l'élève l'a raccourci : erreur en regroupant.
    if (unreduced(prev[changed]) && given[changed].length < prev[changed].length) return 'reduction';
    return 'un-seul-cote';
  }
  if (!linZero(dl) && linEq(dl, linNeg(dr))) return 'signe-garde';
  return null;
}

export interface LineVerdict {
  correct: boolean;
  /** La ligne donne x = … (ou x ⩾ …, ou 2 = x) : la résolution est finie. */
  final: boolean;
  /** Juste mais recopiée : mêmes termes qu'avant, au plus dans un autre ordre. Réduire, c'est avancer. */
  unchanged: boolean;
  /** Pour une ligne juste : ce que l'élève a fait (sa méthode, pas forcément celle du cours). */
  done: DoneOp | null;
  errorId: StepErrorId | null;
}

const termKey = (t: Member[number]) => (t.k === 'x' ? `x${t.coef}` : `n${t.v}`) + `/${t.den ?? 1}`;
const sameTermsAnyOrder = (m: Member, n: Member) =>
  m.length === n.length && [...m].map(termKey).sort().join() === [...n].map(termKey).sort().join();

/** Juge la ligne écrite par l'élève après `prev` : juste si elle garde les mêmes solutions, quelle que soit la méthode. */
export function judgeLine(prev: Equation, given: Equation): LineVerdict {
  if (equivalent(prev, given)) {
    const final = isFinal(given);
    const unchanged =
      !final && given.rel === prev.rel && sameTermsAnyOrder(given.left, prev.left) && sameTermsAnyOrder(given.right, prev.right);
    return { correct: true, final, unchanged, done: unchanged ? null : inferOp(prev, given), errorId: null };
  }
  let errorId = addError(prev, given);
  if (!errorId) {
    const g = solutionSet(given);
    const base = prev.div === undefined && isReduced(prev) ? prev : simplify(prev);
    errorId = wrongNext(base).find((w) => sameSet(solutionSet(w.eq), g))?.id ?? null;
  }
  return { correct: false, final: false, unchanged: false, done: null, errorId };
}
