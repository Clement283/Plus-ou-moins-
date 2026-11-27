// Lire et juger les lignes d'un calcul écrit par l'élève (« Calculer par lignes », module Équations, cours 1) :
// −3 × 4 + 7, puis −12 + 7, puis −5. Chaque ligne doit garder la même valeur et avancer.
// Le clavier de l'appli n'a que : chiffres, + − × ÷ ( ) (les espaces sont ignorés).
import { type Expr } from './expr';
import { type Rational, add, div, mul, neg, rat, sub } from './rational';

export type CalcOp = '+' | '-' | '*' | '/';
export type CalcToken = { k: 'n'; v: Rational } | { k: 'o'; o: CalcOp };
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
  const raw = s.match(/\(-\d+\)|\d+|[+\-*/()]/g) ?? [];
  const out: CalcToken[] = [];
  for (let k = 0; k < raw.length; k++) {
    const t = raw[k]!;
    const parenNeg = /^\(-(\d+)\)$/.exec(t);
    if (parenNeg) out.push({ k: 'n', v: rat(-Number(parenNeg[1])) });
    else if (/^\d+$/.test(t)) out.push({ k: 'n', v: rat(Number(t)) });
    else if (t === '(' || t === ')') return null;
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
  if (!/^[0-9+\-*/()]+$/.test(s)) return { ok: false, error: 'signe-inconnu' };
  let i = 0;
  let ops = 0;
  let bareNegative = false;
  const fail = (e: CalcErrorKind): never => {
    throw e;
  };
  const expr = (allowNeg: boolean): Rational => {
    let v = term(allowNeg);
    while (s[i] === '+' || s[i] === '-') {
      const o = s[i++] as CalcOp;
      ops++;
      v = apply(v, o, term(false));
    }
    return v;
  };
  const term = (allowNeg: boolean): Rational => {
    let v = factor(allowNeg);
    while (s[i] === '*' || s[i] === '/') {
      const o = s[i++] as CalcOp;
      ops++;
      const r = factor(false);
      if (o === '/' && r.n === 0) fail('zero');
      v = apply(v, o, r);
    }
    return v;
  };
  const factor = (allowNeg: boolean): Rational => {
    if (s[i] === '-') {
      if (!allowNeg) bareNegative = true;
      i++;
      return neg(factor(true));
    }
    if (s[i] === '(') {
      i++;
      const v = expr(true);
      if (s[i] !== ')') fail('mal-ecrit');
      i++;
      return v;
    }
    const m = /^\d+/.exec(s.slice(i));
    if (!m) return fail('mal-ecrit');
    i += m[0].length;
    return rat(Number(m[0]));
  };
  let value: Rational;
  try {
    value = expr(true);
    if (i < s.length) fail('mal-ecrit');
  } catch (e) {
    return { ok: false, error: e === 'zero' || e === 'mal-ecrit' ? e : 'mal-ecrit' };
  }
  if (bareNegative) return { ok: false, error: 'negatif-sans-parentheses' };
  return { ok: true, value, ops, key: s.replace(/\((-\d+)\)/g, '$1'), flat: flatten(s) };
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

/**
 * La méthode du cours : une opération à la fois (× et ÷ d'abord, sinon de gauche à droite), jusqu'à un seul nombre.
 * Soustraire un nombre négatif passe par « ajouter l'opposé » : 5 − (−3) devient 5 + 3.
 */
export function calcSteps(start: CalcToken[]): CalcToken[][] {
  const lines: CalcToken[][] = [start];
  let cur = start;
  while (cur.length > 1) {
    let idx = -1;
    for (let i = 1; i < cur.length && idx < 0; i += 2) if (PREC[(cur[i] as { o: CalcOp }).o] === 2) idx = i;
    if (idx < 0) idx = 1;
    const o = (cur[idx] as { o: CalcOp }).o;
    const b = (cur[idx + 1] as { v: Rational }).v;
    if (o === '-' && b.n < 0) {
      cur = [...cur.slice(0, idx), { k: 'o', o: '+' }, { k: 'n', v: neg(b) }, ...cur.slice(idx + 2)];
    } else cur = reduceAt(cur, idx);
    lines.push(cur);
  }
  return lines;
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
      const body = numLatex(x.v);
      return x.v.n < 0 ? (k === 0 ? `-${body}` : `(-${body})`) : body;
    })
    .join(' ');
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
    else if (c === '-') out += k === 0 || prev === '(' ? '-' : ' - ';
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

/** La clé d'écriture (voir `CalcParse.key`) d'un calcul à plat. */
export const tokensKey = (t: CalcToken[]): string =>
  t
    .map((x) => {
      if (x.k === 'o') return x.o;
      if (x.v.d !== 1) throw new Error('Fraction : hors de « Calculer par lignes »');
      return `${x.v.n}`;
    })
    .join('');

export type CalcErrorId = 'priorite' | 'signe' | 'autre';

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
  if (!same) {
    const alt = prev.flat ? evalFlat(prev.flat, true) : null;
    if (alt && alt.n === p.value.n && alt.d === p.value.d) return { kind: 'fausse', errorId: 'priorite' };
    const slips = prev.flat ? signSlipValues(prev.flat) : [];
    if (slips.some((v) => v.n === p.value.n && v.d === p.value.d)) return { kind: 'fausse', errorId: 'signe' };
    return { kind: 'fausse', errorId: 'autre' };
  }
  if (p.key === prev.key) return { kind: 'recopiee' };
  if (p.ops > prev.ops) return { kind: 'plus-longue' };
  return { kind: 'juste', value: p.value, final: p.ops === 0, ops: p.ops };
}
