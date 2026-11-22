export type Rational = { n: number; d: number };

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

/** Normalised rational: d > 0, gcd(|n|, d) = 1. */
export function rat(n: number, d = 1): Rational {
  if (d === 0) throw new Error('Dénominateur nul');
  if (n === 0) return { n: 0, d: 1 };
  const g = gcd(n, d);
  const s = d < 0 ? -1 : 1;
  return { n: (s * n) / g, d: (s * d) / g };
}

export const add = (a: Rational, b: Rational): Rational => rat(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Rational, b: Rational): Rational => rat(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Rational, b: Rational): Rational => rat(a.n * b.n, a.d * b.d);
export function div(a: Rational, b: Rational): Rational {
  if (b.n === 0) throw new Error('Division par zéro');
  return rat(a.n * b.d, a.d * b.n);
}
export const neg = (a: Rational): Rational => rat(-a.n, a.d);
export const eqRat = (a: Rational, b: Rational): boolean => a.n === b.n && a.d === b.d;
export const ratToString = (a: Rational): string => (a.d === 1 ? `${a.n}` : `${a.n}/${a.d}`);
