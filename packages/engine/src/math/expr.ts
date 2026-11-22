import { type Rational, div, mul, add, sub, rat } from './rational';

export type Op = '+' | '-' | '*' | '/';
export type Expr =
  | { k: 'num'; v: Rational }
  | { k: 'op'; op: Op; a: Expr; b: Expr }
  | { k: 'pow'; a: Expr; e: number };

export const num = (v: number | Rational): Expr => ({
  k: 'num',
  v: typeof v === 'number' ? rat(v) : v,
});
export const op = (o: Op, a: Expr, b: Expr): Expr => ({ k: 'op', op: o, a, b });
export const pow = (a: Expr, e: number): Expr => ({ k: 'pow', a, e });

function ratPow(base: Rational, e: number): Rational {
  let r = rat(1);
  for (let i = 0; i < Math.abs(e); i++) r = mul(r, base);
  return e < 0 ? div(rat(1), r) : r;
}

export function evaluate(e: Expr): Rational {
  switch (e.k) {
    case 'num':
      return e.v;
    case 'pow':
      return ratPow(evaluate(e.a), e.e);
    case 'op': {
      const a = evaluate(e.a);
      const b = evaluate(e.b);
      switch (e.op) {
        case '+': return add(a, b);
        case '-': return sub(a, b);
        case '*': return mul(a, b);
        case '/': return div(a, b);
      }
    }
  }
}

const prec = (e: Expr): number =>
  e.k === 'op' ? (e.op === '+' || e.op === '-' ? 1 : 2) : e.k === 'pow' ? 3 : 4;

const SYMBOL: Record<Op, string> = { '+': '+', '-': '-', '*': '\\times', '/': '\\div' };

function numLatex(v: Rational): string {
  const abs = Math.abs(v.n);
  const body = v.d === 1 ? `${abs}` : `\\frac{${abs}}{${v.d}}`;
  return v.n < 0 ? `-${body}` : body;
}

const paren = (s: string): string => `(${s})`;

/** `leading`: leftmost position of a (sub)expression, where a negative needs no parentheses. */
function render(e: Expr, leading: boolean): string {
  switch (e.k) {
    case 'num':
      return e.v.n < 0 && !leading ? paren(numLatex(e.v)) : numLatex(e.v);
    case 'pow': {
      const simple = e.a.k === 'num' && e.a.v.n >= 0 && e.a.v.d === 1;
      const base = simple ? render(e.a, true) : paren(render(e.a, true));
      return `${base}^{${e.e}}`;
    }
    case 'op': {
      const p = prec(e);
      const left = prec(e.a) < p ? paren(render(e.a, true)) : render(e.a, leading);
      const rightNeedsParens =
        prec(e.b) < p || (prec(e.b) === p && (e.op === '-' || e.op === '/'));
      const right = rightNeedsParens ? paren(render(e.b, true)) : render(e.b, false);
      return `${left} ${SYMBOL[e.op]} ${right}`;
    }
  }
}

export const toLatex = (e: Expr): string => render(e, true);

/** Terms of a sum (chain of '+'), left to right; any other expression is a single term. */
export function terms(e: Expr): Expr[] {
  return e.k === 'op' && e.op === '+' ? [...terms(e.a), ...terms(e.b)] : [e];
}
