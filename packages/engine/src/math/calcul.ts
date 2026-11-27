// Lire et juger les lignes d'un calcul écrit par l'élève (« Calculer par lignes », module Équations, cours 1) :
// −3 × 4 + 7, puis −12 + 7, puis −5. Chaque ligne doit garder la même valeur et avancer.
// Le clavier de l'appli n'a que : chiffres, + − × ÷ ( ) [ ] (les espaces sont ignorés).
// Parenthèses de calcul et crochets (module Priorités) : le calcul tapé est lu en arbre (`CNode`), qui sert à la valeur,
// à la clé d'écriture, à la méthode du cours (`calcSteps`) et à la reconnaissance des erreurs.
import { type Expr } from './expr';
import { type Rational, add, div, mul, neg, rat, sub } from './rational';

export type CalcOp = '+' | '-' | '*' | '/';
export type CalcParen = '(' | ')' | '[' | ']';
export type CalcToken = { k: 'n'; v: Rational } | { k: 'o'; o: CalcOp } | { k: 'p'; p: CalcParen };
/** Un calcul en arbre : nombre, opération, groupe entre parenthèses (br : crochets) ou moins devant un groupe. */
export type CNode =
  | { t: 'n'; v: Rational }
  | { t: 'b'; o: CalcOp; a: CNode; b: CNode }
  | { t: 'g'; e: CNode; br: boolean }
  | { t: 'm'; e: CNode };
const PREC: Record<CalcOp, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };

export type CalcErrorKind =
  | 'vide' // rien de tapé
  | 'signe-inconnu' // un caractère que le clavier n'a pas
  | 'mal-ecrit' // « 3 ×× 4 », parenthèse oubliée…
  | 'zero' // division par 0
  | 'negatif-sans-parentheses'; // 5 − −3

/** Texte du clavier mis sous forme normale : sans espace, « − » → « - », « × » → « * », « ÷ » → « / ». */
export const normalizeCalcText = (raw: string): string =>
  raw.replace(/\s+/g, '').replace(/[−–]/g, '-').replace(/×/g, '*').replace(/÷/g, '/');

export type CalcParse =
  | {
      ok: true;
      value: Rational;
      /** Nombre d'opérations (+ − × ÷), le moins unaire d'un nombre négatif n'en est pas une. */
      ops: number;
      /** Écriture sans parenthèses autour des négatifs : « (−3) × 4 » et « −3 × 4 » ont la même clé. */
      key: string;
      /** Nombres et opérations à plat, ou null s'il reste des parenthèses (2 + 3) × 4. */
      flat: CalcToken[] | null;
      /** Le calcul en arbre (groupes compris). */
      tree: CNode;
    }
  | { ok: false; error: CalcErrorKind };

const apply = (a: Rational, o: CalcOp, b: Rational): Rational => {
  switch (o) {
    case '+': return add(a, b);
    case '-': return sub(a, b);
    case '*': return mul(a, b);
    case '/': return div(a, b);
  }
};

function flatten(s: string): CalcToken[] | null {
  const raw = s.match(/\(-\d+\)|\d+|[+\-*/()[\]]/g) ?? [];
  const out: CalcToken[] = [];
  for (let k = 0; k < raw.length; k++) {
    const t = raw[k]!;
    const parenNeg = /^\(-(\d+)\)$/.exec(t);
    if (parenNeg) out.push({ k: 'n', v: rat(-Number(parenNeg[1])) });
    else if (/^\d+$/.test(t)) out.push({ k: 'n', v: rat(Number(t)) });
    else if (t === '(' || t === ')' || t === '[' || t === ']') return null;
    else if (t === '-' && k === 0 && /^\d+$/.test(raw[1] ?? '')) {
      out.push({ k: 'n', v: rat(-Number(raw[1])) });
      k++;
    } else out.push({ k: 'o', o: t as CalcOp });
  }
  const alternates = out.every((t, k) => (k % 2 === 0) === (t.k === 'n'));
  return alternates && out.length % 2 === 1 ? out : null;
}

/** Valeur d'un calcul à plat. `reversed` : calcul « à l'envers » (+ et − avant × et ÷), l'erreur de priorité. */
export function evalFlat(t: CalcToken[], reversed = false): Rational | null {
  try {
    const pass = (items: CalcToken[], level: CalcOp[]): CalcToken[] => {
      const out: CalcToken[] = [items[0]!];
      for (let k = 1; k < items.length; k += 2) {
        const o = (items[k] as { o: CalcOp }).o;
        const b = (items[k + 1] as { v: Rational }).v;
        if (level.includes(o)) {
          const a = out[out.length - 1] as { v: Rational };
          out[out.length - 1] = { k: 'n', v: apply(a.v, o, b) };
        } else out.push(items[k]!, items[k + 1]!);
      }
      return out;
    };
    const first = pass(t, reversed ? ['+', '-'] : ['*', '/']);
    const second = pass(first, reversed ? ['*', '/'] : ['+', '-']);
    return second.length === 1 ? (second[0] as { v: Rational }).v : null;
  } catch {
    return null;
  }
}

export function parseCalc(raw: string): CalcParse {
  const s = normalizeCalcText(raw);
  if (!s) return { ok: false, error: 'vide' };
  if (!/^[0-9+\-*/()[\]]+$/.test(s)) return { ok: false, error: 'signe-inconnu' };
  let i = 0;
  let ops = 0;
  let bareNegative = false;
  const fail = (e: CalcErrorKind): never => {
    throw e;
  };
  const expr = (allowNeg: boolean): CNode => {
    let v = term(allowNeg);
    while (s[i] === '+' || s[i] === '-') {
      const o = s[i++] as CalcOp;
      ops++;
      v = { t: 'b', o, a: v, b: term(false) };
    }
    return v;
  };
  const term = (allowNeg: boolean): CNode => {
    let v = factor(allowNeg);
    while (s[i] === '*' || s[i] === '/') {
      const o = s[i++] as CalcOp;
      ops++;
      const r = factor(false);
      if (o === '/' && evalNode(r).n === 0) fail('zero');
      v = { t: 'b', o, a: v, b: r };
    }
    return v;
  };
  const factor = (allowNeg: boolean): CNode => {
    if (s[i] === '-') {
      if (!allowNeg) bareNegative = true;
      i++;
      const inner = factor(true);
      if (inner.t === 'n') return { t: 'n', v: neg(inner.v) };
      ops++;
      return { t: 'm', e: inner };
    }
    if (s[i] === '(' || s[i] === '[') {
      const br = s[i] === '[';
      i++;
      const e = expr(true);
      if (s[i] !== (br ? ']' : ')')) fail('mal-ecrit');
      i++;
      return e.t === 'n' ? e : { t: 'g', e, br };
    }
    const m = /^\d+/.exec(s.slice(i));
    if (!m) return fail('mal-ecrit');
    i += m[0].length;
    return { t: 'n', v: rat(Number(m[0])) };
  };
  let tree: CNode;
  try {
    tree = expr(true);
    if (i < s.length) fail('mal-ecrit');
  } catch (e) {
    return { ok: false, error: e === 'zero' || e === 'mal-ecrit' ? e : 'mal-ecrit' };
  }
  if (bareNegative) return { ok: false, error: 'negatif-sans-parentheses' };
  let value: Rational;
  try {
    value = evalNode(tree);
  } catch {
    return { ok: false, error: 'zero' };
  }
  return { ok: true, value, ops, key: keyOf(tree), flat: flatten(s), tree };
}

// ——— Le calcul en arbre ———

/** Écriture sans parenthèses autour des négatifs, crochets écrits comme des parenthèses : la même pour deux écritures équivalentes. */
function keyOf(n: CNode): string {
  switch (n.t) {
    case 'n': return `${n.v.n}`;
    case 'b': return `${keyOf(n.a)}${n.o}${keyOf(n.b)}`;
    case 'g': return `(${keyOf(n.e)})`;
    case 'm': return `-${keyOf(n.e)}`;
  }
}

interface EvalOpts {
  /** + et − avant × et ÷ (priorité oubliée). */
  reversed?: boolean;
  /** de droite à gauche (a − b + c lu a − (b + c)). */
  rtl?: boolean;
  /** Groupes dont on oublie les parenthèses. */
  dissolve?: (g: CNode) => boolean;
}
const PR = (o: CalcOp): number => PREC[o];

function chainOf(n: CNode, o: EvalOpts, xs: CNode[] = [], os: CalcOp[] = []): { xs: CNode[]; os: CalcOp[] } {
  if (n.t === 'b') {
    chainOf(n.a, o, xs, os);
    os.push(n.o);
    chainOf(n.b, o, xs, os);
  } else if (n.t === 'g' && o.dissolve?.(n)) chainOf(n.e, o, xs, os);
  else xs.push(n);
  return { xs, os };
}

function foldChain(xs: Rational[], os: CalcOp[], o: EvalOpts): Rational {
  const levels: CalcOp[][] = o.reversed ? [['+', '-'], ['*', '/']] : [['*', '/'], ['+', '-']];
  let X = xs;
  let O = os;
  for (const lv of levels) {
    if (!o.rtl) {
      const nx = [X[0]!];
      const no: CalcOp[] = [];
      O.forEach((op, i) => {
        if (lv.includes(op)) nx[nx.length - 1] = apply(nx[nx.length - 1]!, op, X[i + 1]!);
        else {
          no.push(op);
          nx.push(X[i + 1]!);
        }
      });
      X = nx;
      O = no;
    } else {
      const ys = [X[X.length - 1]!];
      const no: CalcOp[] = [];
      for (let i = O.length - 1; i >= 0; i--) {
        if (lv.includes(O[i]!)) ys[0] = apply(X[i]!, O[i]!, ys[0]!);
        else {
          ys.unshift(X[i]!);
          no.unshift(O[i]!);
        }
      }
      X = ys;
      O = no;
    }
  }
  return X[0]!;
}

/** Valeur d'un arbre (division par 0 : lève une erreur). */
export function evalNode(n: CNode, o: EvalOpts = {}): Rational {
  const { xs, os } = chainOf(n, o);
  const vals = xs.map((x) => (x.t === 'n' ? x.v : x.t === 'b' ? evalNode(x, o) : x.t === 'g' ? evalNode(x.e, o) : neg(evalNode(x.e, o))));
  return foldChain(vals, os, o);
}

const tryEval = (n: CNode, o: EvalOpts = {}): Rational | null => {
  try {
    return evalNode(n, o);
  } catch {
    return null;
  }
};
const rebuild = (xs: CNode[], os: CalcOp[]): CNode => {
  let n = xs[0]!;
  os.forEach((o, i) => {
    n = { t: 'b', o, a: n, b: xs[i + 1]! };
  });
  return n;
};

type Wrong = { kind: 'priorite' | 'gauche-droite'; node: CNode };
/** Le calcul où UNE opération est faite au mauvais moment : une addition avant un produit, ou à droite au lieu de la gauche. */
function wrongOrder(n: CNode): Wrong[] {
  if (n.t === 'n') return [];
  if (n.t === 'g' || n.t === 'm') return wrongOrder(n.e).map((v): Wrong => ({ kind: v.kind, node: { ...n, e: v.node } }));
  const { xs, os } = chainOf(n, {});
  const out: Wrong[] = [];
  xs.forEach((x, k) =>
    wrongOrder(x).forEach((v) => out.push({ kind: v.kind, node: rebuild(xs.map((y, j) => (j === k ? v.node : y)), os) })),
  );
  os.forEach((o, i) => {
    const prev = os[i - 1];
    const next = os[i + 1];
    let kind: Wrong['kind'];
    if (PR(o) === 1 && ((prev && PR(prev) === 2) || (next && PR(next) === 2))) kind = 'priorite';
    else if (prev && PR(prev) === PR(o)) kind = 'gauche-droite';
    else return;
    const g: CNode = { t: 'g', br: false, e: rebuild([xs[i]!, xs[i + 1]!], [o]) };
    out.push({ kind, node: rebuild([...xs.slice(0, i), g, ...xs.slice(i + 2)], [...os.slice(0, i), ...os.slice(i + 1)]) });
  });
  return out;
}

/** Les parenthèses de 1er niveau précédées d'un − (le b de « a − (…) »). */
function minusGroups(n: CNode, out: CNode[] = []): CNode[] {
  if (n.t === 'b') {
    if (n.o === '-' && n.b.t === 'g') out.push(n.b);
    minusGroups(n.a, out);
    if (n.b.t !== 'g') minusGroups(n.b, out);
  } else if (n.t === 'm') minusGroups(n.e, out);
  return out;
}

function groupsOf(n: CNode, d = 0, out: { g: CNode; d: number }[] = []): { g: CNode; d: number }[] {
  if (n.t === 'b') {
    groupsOf(n.a, d, out);
    groupsOf(n.b, d, out);
  } else if (n.t === 'g') {
    out.push({ g: n, d });
    groupsOf(n.e, d + 1, out);
  } else if (n.t === 'm') groupsOf(n.e, d, out);
  return out;
}

/** Les calculs où UN signe est perdu : le résultat d'une opération prête, ou un nombre, change de signe. */
function slipVariants(n: CNode): CNode[] {
  switch (n.t) {
    case 'n': return [{ t: 'n', v: neg(n.v) }];
    case 'b': {
      const out = [
        ...slipVariants(n.a).map((a): CNode => ({ ...n, a })),
        ...slipVariants(n.b).map((b): CNode => ({ ...n, b })),
      ];
      if (n.a.t === 'n' && n.b.t === 'n') {
        const r = tryEval(n);
        if (r) out.push({ t: 'n', v: neg(r) });
      }
      return out;
    }
    case 'g':
    case 'm': return slipVariants(n.e).map((e): CNode => ({ ...n, e }));
  }
}

const eqv = (a: Rational, b: Rational): boolean => a.n === b.n && a.d === b.d;

/**
 * Les valeurs fausses qu'on obtient en se trompant sur `prev`, par erreur, dans l'ordre où on les reconnaît
 * (la 1re erreur de la liste gagne quand deux donnent la même valeur).
 */
export function errorCandidates(prev: CNode): { id: Exclude<CalcErrorId, 'autre'>; value: Rational }[] {
  const out: { id: Exclude<CalcErrorId, 'autre'>; value: Rational }[] = [];
  const add = (id: Exclude<CalcErrorId, 'autre'>, n: CNode, o: EvalOpts = {}): void => {
    const r = tryEval(n, o);
    if (r !== null) out.push({ id, value: r });
  };
  const wo = wrongOrder(prev);
  wo.filter((x) => x.kind === 'priorite').forEach((x) => add('priorite', x.node));
  add('priorite', prev, { reversed: true });
  wo.filter((x) => x.kind === 'gauche-droite').forEach((x) => add('gauche-droite', x.node));
  add('gauche-droite', prev, { rtl: true });
  const gs = groupsOf(prev);
  // « a − (b + c) » lu « a − b + c » : la parenthèse enlevée sans changer les signes (avant « parenthèse ignorée »).
  minusGroups(prev).forEach((g) => add('moins-parenthese', prev, { dissolve: (x) => x === g }));
  gs.filter((x) => x.d === 0).forEach((x) => add('parenthese', prev, { dissolve: (g) => g === x.g }));
  if (gs.length > 0) add('parenthese', prev, { dissolve: () => true });
  gs.filter((x) => x.d > 0).forEach((x) => add('ordre-parentheses', prev, { dissolve: (g) => g === x.g }));
  slipVariants(prev).forEach((n) => add('signe', n));
  // Une valeur « − devant la parenthèse » n'est pas aussi une « parenthèse ignorée » : on garde l'erreur précise.
  const minus = out.filter((c) => c.id === 'moins-parenthese').map((c) => c.value);
  return out.filter((c) => c.id !== 'parenthese' || !minus.some((m) => eqv(m, c.value)));
}

/** Pourquoi la valeur `v` est fausse : la 1re erreur reconnue dans le calcul `prev`. */
function classify(prev: CNode, v: Rational): CalcErrorId {
  return errorCandidates(prev).find((c) => eqv(c.value, v))?.id ?? 'autre';
}

// ——— Arbre, jetons et méthode du cours ———

const SYM: Record<CalcOp, string> = { '+': '+', '-': '-', '*': '*', '/': '/' };
/** Le texte tapé d'une suite de jetons (négatifs entre parenthèses sauf au début d'un groupe). */
function tokensText(t: CalcToken[]): string {
  return t
    .map((x, k) => {
      if (x.k === 'o') return SYM[x.o];
      if (x.k === 'p') return x.p;
      if (x.v.d !== 1) throw new Error('Fraction : hors de « Calculer par lignes »');
      const before = t[k - 1];
      const start = k === 0 || (before?.k === 'p' && (before.p === '(' || before.p === '['));
      return x.v.n < 0 && !start ? `(${x.v.n})` : `${x.v.n}`;
    })
    .join('');
}
export function treeOfTokens(t: CalcToken[]): CNode {
  const p = parseCalc(tokensText(t));
  if (!p.ok) throw new Error('Calcul illisible');
  return p.tree;
}
/** Les jetons d'un arbre : nombres, opérations et parenthèses. */
export function treeTokens(n: CNode): CalcToken[] {
  switch (n.t) {
    case 'n': return [{ k: 'n', v: n.v }];
    case 'b': return [...treeTokens(n.a), { k: 'o', o: n.o }, ...treeTokens(n.b)];
    case 'g': return [{ k: 'p', p: n.br ? '[' : '(' }, ...treeTokens(n.e), { k: 'p', p: n.br ? ']' : ')' }];
    case 'm': return [{ k: 'o', o: '-' }, ...treeTokens(n.e)];
  }
}
/** Les jetons d'un calcul tapé (null s'il ne se lit pas). */
export function textTokens(raw: string): CalcToken[] | null {
  const p = parseCalc(raw);
  return p.ok ? treeTokens(p.tree) : null;
}

const simplify = (n: CNode): CNode => {
  switch (n.t) {
    case 'n': return n;
    case 'b': return { ...n, a: simplify(n.a), b: simplify(n.b) };
    case 'g': {
      const e = simplify(n.e);
      return e.t === 'n' ? e : { ...n, e };
    }
    case 'm': {
      const e = simplify(n.e);
      return e.t === 'n' ? { t: 'n', v: neg(e.v) } : { ...n, e };
    }
  }
};
/** Le premier groupe (de gauche à droite) qui n'en contient pas d'autre. */
type CGroup = Extract<CNode, { t: 'g' }>;
function innermost(n: CNode): CGroup | null {
  switch (n.t) {
    case 'n': return null;
    case 'b': return innermost(n.a) ?? innermost(n.b);
    case 'm': return innermost(n.e);
    case 'g': return innermost(n.e) ?? n;
  }
}
const replaceNode = (n: CNode, target: CNode, by: CNode): CNode => {
  if (n === target) return by;
  switch (n.t) {
    case 'n': return n;
    case 'b': return { ...n, a: replaceNode(n.a, target, by), b: replaceNode(n.b, target, by) };
    case 'g':
    case 'm': return { ...n, e: replaceNode(n.e, target, by) };
  }
};
/** Une opération de la chaîne : × ou ÷ d'abord, sinon la première ; soustraire un négatif devient ajouter l'opposé. */
function stepChain(n: CNode): CNode {
  const { xs, os } = chainOf(n, {});
  let idx = os.findIndex((o) => PR(o) === 2);
  if (idx < 0) idx = 0;
  const o = os[idx]!;
  const a = xs[idx] as { t: 'n'; v: Rational };
  const b = xs[idx + 1] as { t: 'n'; v: Rational };
  if (o === '-' && b.v.n < 0) {
    const nos = [...os];
    nos[idx] = '+';
    return rebuild(xs.map((x, j) => (j === idx + 1 ? ({ t: 'n', v: neg(b.v) } as CNode) : x)), nos);
  }
  const r: CNode = { t: 'n', v: apply(a.v, o, b.v) };
  return rebuild([...xs.slice(0, idx), r, ...xs.slice(idx + 2)], [...os.slice(0, idx), ...os.slice(idx + 1)]);
}
/** Les opérations de la prochaine étape, et si elle se fait entre parenthèses. */
export function nextStepInfo(n: CNode): { inGroup: boolean; depth: number; ops: CalcOp[] } {
  const g = innermost(n);
  const depth = groupsOf(n).reduce((m, x) => Math.max(m, x.d + 1), 0);
  return { inGroup: g !== null, depth, ops: chainOf(g ? g.e : n, {}).os };
}

/**
 * La méthode du cours : une opération à la fois, jusqu'à un seul nombre. Parenthèses et crochets d'abord, les plus
 * intérieurs en premier ; dans une chaîne, × et ÷ d'abord, sinon de gauche à droite.
 * Soustraire un nombre négatif passe par « ajouter l'opposé » : 5 − (−3) devient 5 + 3.
 */
export function calcSteps(start: CalcToken[]): CalcToken[][] {
  const lines: CalcToken[][] = [start];
  let tree = simplify(treeOfTokens(start));
  while (tree.t !== 'n') {
    const g = innermost(tree);
    tree = simplify(g ? replaceNode(tree, g, { ...g, e: stepChain(g.e) }) : stepChain(tree));
    lines.push(treeTokens(tree));
  }
  return lines;
}

/** Une opération qu'on peut faire maintenant : ses voisins ne la retiennent pas (la priorité est respectée). */
function reducible(t: CalcToken[], i: number): boolean {
  const o = (t[i] as { o: CalcOp }).o;
  const left = i >= 3 ? (t[i - 2] as { o: CalcOp }).o : null;
  const right = i + 2 < t.length ? (t[i + 2] as { o: CalcOp }).o : null;
  return (right === null || PREC[right] <= PREC[o]) && (left === null || PREC[left] < PREC[o]);
}

const reduceAt = (t: CalcToken[], i: number, result?: Rational): CalcToken[] => {
  const a = (t[i - 1] as { v: Rational }).v;
  const b = (t[i + 1] as { v: Rational }).v;
  const o = (t[i] as { o: CalcOp }).o;
  return [...t.slice(0, i - 1), { k: 'n', v: result ?? apply(a, o, b) }, ...t.slice(i + 2)];
};

/**
 * Les valeurs d'une erreur de signe : UNE opération faite avec le mauvais signe (−3 × 4 écrit 12), ou le signe
 * d'un nombre oublié ou inversé (5 − (−3) lu 5 − 3, −3 × 4 + 7 lu −3 × 4 − 7).
 */
export function signSlipValues(t: CalcToken[]): Rational[] {
  const out: Rational[] = [];
  for (let i = 1; i < t.length; i += 2) {
    if (!reducible(t, i)) continue;
    const r = reduceAt(t, i);
    const slipped = reduceAt(t, i, neg((r[i - 1] as { v: Rational }).v));
    const v = evalFlat(slipped);
    if (v) out.push(v);
  }
  for (let i = 0; i < t.length; i += 2) {
    const flipped = t.map((x, k) => (k === i ? ({ k: 'n', v: neg((x as { v: Rational }).v) } as CalcToken) : x));
    const v = evalFlat(flipped);
    if (v) out.push(v);
  }
  return out;
}

const numLatex = (v: Rational): string => {
  const a = Math.abs(v.n);
  return v.d === 1 ? `${a}` : `\\frac{${a}}{${v.d}}`;
};

/** LaTeX d'un calcul à plat : −3 \times 4 + 7, 5 - (-3). */
export function calcTokensLatex(t: CalcToken[]): string {
  return t
    .map((x, k) => {
      if (x.k === 'o') return { '+': '+', '-': '-', '*': '\\times', '/': '\\div' }[x.o];
      if (x.k === 'p') return x.p;
      const body = numLatex(x.v);
      const before = t[k - 1];
      const start = k === 0 || (before?.k === 'p' && (before.p === '(' || before.p === '['));
      return x.v.n < 0 ? (start ? `-${body}` : `(-${body})`) : body;
    })
    .reduce((acc, piece, k) => {
      const before = t[k - 1];
      const tight = k === 0 || (before?.k === 'p' && (before.p === '(' || before.p === '[')) || (t[k]!.k === 'p' && (t[k] as { p: string }).p.match(/[)\]]/) !== null);
      return acc + (tight ? '' : ' ') + piece;
    }, '');
}

/** Un calcul tapé, mis en forme : « 3*4+7 » → « 3 \times 4 + 7 » (sans lire le calcul : les parenthèses restent telles quelles). */
export function calcTextLatex(raw: string): string {
  const s = normalizeCalcText(raw);
  let out = '';
  for (let k = 0; k < s.length; k++) {
    const c = s[k]!;
    const prev = s[k - 1];
    if (c === '*') out += ' \\times ';
    else if (c === '/') out += ' \\div ';
    else if (c === '+') out += ' + ';
    else if (c === '-') out += k === 0 || prev === '(' || prev === '[' ? '-' : ' - ';
    else out += c;
  }
  return out.trim();
}

/** Les nombres et opérations d'une expression à plat (celle de `substitute`). */
export function exprTokens(e: Expr): CalcToken[] {
  switch (e.k) {
    case 'num': return [{ k: 'n', v: e.v }];
    case 'op': return [...exprTokens(e.a), { k: 'o', o: e.op }, ...exprTokens(e.b)];
    case 'pow': throw new Error('Puissance : hors de « Calculer par lignes »');
  }
}

/** La clé d'écriture (voir `CalcParse.key`) d'un calcul en jetons. */
export const tokensKey = (t: CalcToken[]): string => keyOf(treeOfTokens(t));

export type CalcErrorId = 'priorite' | 'gauche-droite' | 'moins-parenthese' | 'parenthese' | 'ordre-parentheses' | 'signe' | 'autre';

export type CalcLineVerdict =
  | { kind: 'illisible'; error: CalcErrorKind }
  /** 1re ligne qui ne remplace pas x : pas comptée comme une erreur. */
  | { kind: 'sans-remplacer' }
  /** Même ligne qu'avant (à une parenthèse près) : pas comptée. */
  | { kind: 'recopiee' }
  /** Plus d'opérations qu'avant : pas comptée. */
  | { kind: 'plus-longue' }
  | { kind: 'fausse'; errorId: CalcErrorId }
  | { kind: 'juste'; value: Rational; final: boolean; ops: number };

/**
 * Juge la ligne tapée après `prevText` (null : la 1re ligne, qui doit être l'un des `first`, les clés
 * des écritures acceptées du calcul avec x remplacé). Juste : même valeur, et qui avance.
 */
export function judgeCalcLine(prevText: string | null, typed: string, first: string[]): CalcLineVerdict {
  const p = parseCalc(typed);
  if (!p.ok) return { kind: 'illisible', error: p.error };
  if (prevText === null) {
    if (!first.includes(p.key)) return { kind: 'sans-remplacer' };
    return { kind: 'juste', value: p.value, final: p.ops === 0, ops: p.ops };
  }
  const prev = parseCalc(prevText);
  if (!prev.ok) throw new Error('Ligne précédente illisible');
  const same = p.value.n === prev.value.n && p.value.d === prev.value.d;
  if (!same) return { kind: 'fausse', errorId: classify(prev.tree, p.value) };
  if (p.key === prev.key) return { kind: 'recopiee' };
  if (p.ops > prev.ops) return { kind: 'plus-longue' };
  return { kind: 'juste', value: p.value, final: p.ops === 0, ops: p.ops };
}
