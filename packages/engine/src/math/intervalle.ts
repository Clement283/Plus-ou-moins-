// Intervalles de ℝ (module Équations et inéquations, cours 7 et 8). Maquette docs/design/ecrans/equations-intervalles.html.
// Écriture du programme 2nde 2026 p. 7 : virgule entre les bornes (« ; » : une seule constante à changer, `SEP`).
import { type Rational, eqRat, rat, ratToString, sub } from './rational';
import type { Relation } from './equation';

/** Séparateur des bornes à l'écran : ]−∞ , 3]. */
export const SEP = ' , ';

/** Une borne nulle = l'infini de ce côté. Les crochets des infinis sont toujours ouverts. */
export interface Interval {
  lo: Rational | null;
  hi: Rational | null;
  loClosed: boolean;
  hiClosed: boolean;
}

/**
 * Ce que tape l'élève : `left` et `right` sont les crochets tels qu'ils s'écrivent ('[' ou ']'),
 * `lo` et `hi` les bornes en texte (« −2 », « 3/2 », « −∞ », « +∞ »).
 */
export interface IntervalInput {
  left: '[' | ']';
  lo: string;
  hi: string;
  right: '[' | ']';
}

export const emptyInterval = (): IntervalInput => ({ left: '[', lo: '', hi: '', right: ']' });

/** x rel b (rel ≠ '=') en intervalle : x < 3 donne ]−∞ , 3[, x ⩾ 2 donne [2 , +∞[. */
export function intervalOfRelation(rel: Exclude<Relation, '='>, bound: Rational): Interval {
  switch (rel) {
    case '<': return { lo: null, hi: bound, loClosed: false, hiClosed: false };
    case '<=': return { lo: null, hi: bound, loClosed: false, hiClosed: true };
    case '>': return { lo: bound, hi: null, loClosed: false, hiClosed: false };
    case '>=': return { lo: bound, hi: null, loClosed: true, hiClosed: false };
  }
}

const MINUS = '−';
const num = (v: Rational): string => ratToString(v).replace(/-/g, MINUS);
const boundText = (v: Rational | null, side: 'lo' | 'hi'): string => (v === null ? (side === 'lo' ? `${MINUS}∞` : '+∞') : num(v));

/** ]−∞ , 3] : le crochet de gauche ouvre vers l'extérieur (« ] » = ouvert), celui de droite aussi (« [ » = ouvert). */
export const intervalText = (iv: Interval): string =>
  `${iv.loClosed ? '[' : ']'}${boundText(iv.lo, 'lo')}${SEP}${boundText(iv.hi, 'hi')}${iv.hiClosed ? ']' : '['}`;

const latexBound = (v: Rational | null, side: 'lo' | 'hi'): string =>
  v === null ? (side === 'lo' ? '-\\infty' : '+\\infty') : v.d === 1 ? `${v.n}` : `${v.n < 0 ? '-' : ''}\\frac{${Math.abs(v.n)}}{${v.d}}`;

export const intervalLatex = (iv: Interval): string =>
  `\\mathopen{${iv.loClosed ? '[' : ']'}}${latexBound(iv.lo, 'lo')}\\,,\;${latexBound(iv.hi, 'hi')}\\mathclose{${iv.hiClosed ? ']' : '['}}`;

/** Ce que l'élève a tapé, lisible : [−2 , +∞[ (cases vides : un tiret). */
export const inputText = (i: IntervalInput): string => `${i.left}${i.lo || '…'}${SEP}${i.hi || '…'}${i.right}`;

export type Bound = { kind: 'inf'; sign: 1 | -1 } | { kind: 'num'; v: Rational } | { kind: 'bad' };

/** −∞, +∞, ∞, un entier, un décimal ou une fraction : −3, 1,5 ou 3/2. */
export function parseBound(text: string): Bound {
  const t = text.replace(/\s+/g, '').replace(/[−–]/g, '-').replace(',', '.');
  if (t === '') return { kind: 'bad' };
  if (/^[+]?∞$/.test(t)) return { kind: 'inf', sign: 1 };
  if (t === '-∞') return { kind: 'inf', sign: -1 };
  let m = /^(-?)(\d+)\/(\d+)$/.exec(t);
  if (m) {
    const d = Number(m[3]);
    return d === 0 ? { kind: 'bad' } : { kind: 'num', v: rat((m[1] ? -1 : 1) * Number(m[2]), d) };
  }
  m = /^(-?)(\d+)(?:\.(\d{1,3}))?$/.exec(t);
  if (!m) return { kind: 'bad' };
  const dec = m[3] ?? '';
  const den = 10 ** dec.length;
  return { kind: 'num', v: rat((m[1] ? -1 : 1) * Number(`${m[2]}${dec}`), den) };
}

/** Les cases sont remplies et lisibles : l'aperçu de la droite et « Valider » en dépendent. */
export function readInterval(i: IntervalInput): { ok: true; interval: Interval } | { ok: false; error: 'vide' | 'illisible' } {
  if (i.lo === '' || i.hi === '') return { ok: false, error: 'vide' };
  const a = parseBound(i.lo);
  const b = parseBound(i.hi);
  if (a.kind === 'bad' || b.kind === 'bad') return { ok: false, error: 'illisible' };
  const lo = a.kind === 'inf' ? null : a.v;
  const hi = b.kind === 'inf' ? null : b.v;
  return {
    ok: true,
    interval: { lo, hi, loClosed: lo !== null && i.left === '[', hiClosed: hi !== null && i.right === ']' },
  };
}

export type IntervalErrorId =
  /** Crochet fermé contre ∞. */
  | 'crochet-infini'
  /** Borne gauche +∞, borne droite −∞, ou lo > hi. */
  | 'ordre'
  /** Les bornes sont bonnes mais pas le côté : x < 3 écrit ]3 , +∞[. */
  | 'cote'
  /** Bonne borne, mauvais crochet (ouvert pour fermé, ou l'inverse). */
  | 'crochet'
  /** Même nombre au signe près. */
  | 'signe-borne'
  | 'borne'
  /** Mauvaise lecture du sens après une division par un négatif. */
  | 'sens';

export type IntervalVerdict = { ok: true } | { ok: false; errorId: IntervalErrorId };

const sameBound = (a: Rational | null, b: Rational | null): boolean => (a === null || b === null ? a === b : eqRat(a, b));

/** L'élève a-t-il écrit `expected` ? Sinon, quelle est l'erreur la plus parlante ? */
export function judgeInterval(expected: Interval, input: IntervalInput): IntervalVerdict {
  const read = readInterval(input);
  if (!read.ok) return { ok: false, errorId: 'borne' };
  const g = read.interval;
  const a = parseBound(input.lo);
  const b = parseBound(input.hi);
  if ((a.kind === 'inf' && a.sign === 1) || (b.kind === 'inf' && b.sign === -1)) return { ok: false, errorId: 'ordre' };
  if (g.lo !== null && g.hi !== null && sub(g.lo, g.hi).n > 0) return { ok: false, errorId: 'ordre' };
  // Un crochet fermé contre ∞ : l'erreur à nommer, même si le reste est juste.
  if ((a.kind === 'inf' && input.left === '[') || (b.kind === 'inf' && input.right === ']')) return { ok: false, errorId: 'crochet-infini' };
  if (sameBound(g.lo, expected.lo) && sameBound(g.hi, expected.hi)) {
    return g.loClosed === expected.loClosed && g.hiClosed === expected.hiClosed ? { ok: true } : { ok: false, errorId: 'crochet' };
  }
  // Le bon nombre mais de l'autre côté : ]3 , +∞[ au lieu de ]−∞ , 3[
  const bounds = (iv: Interval): Rational | null => iv.lo ?? iv.hi;
  const gb = bounds(g);
  const eb = bounds(expected);
  const otherSide = (g.lo === null) !== (expected.lo === null);
  if (otherSide && gb && eb && eqRat(gb, eb)) return { ok: false, errorId: 'cote' };
  if (gb && eb && eqRat(gb, rat(-eb.n, eb.d))) return { ok: false, errorId: 'signe-borne' };
  return { ok: false, errorId: 'borne' };
}

export const INTERVAL_ERROR_TEXT: Record<IntervalErrorId, { title: string; message: string }> = {
  'crochet-infini': { title: 'Contre ∞, le crochet est toujours ouvert.', message: 'On n’atteint jamais l’infini : retourne ce crochet.' },
  ordre: { title: 'Les bornes sont à l’envers.', message: 'On écrit la plus petite borne à gauche, la plus grande à droite.' },
  cote: { title: 'C’est l’autre côté.', message: 'Regarde le sens de l’inégalité : les valeurs sont-elles plus petites ou plus grandes que la borne ?' },
  crochet: {
    title: 'Regarde le crochet.',
    message: 'Si la borne est comprise (≤ ou ≥), le crochet est tourné vers elle. Si elle est exclue (< ou >), il s’en éloigne.',
  },
  'signe-borne': { title: 'Regarde le signe de la borne.', message: 'C’est le même nombre, mais pas du même signe.' },
  borne: { title: 'La borne n’est pas la bonne.', message: 'Relis l’inégalité : la borne est le nombre qui est dedans.' },
  sens: { title: 'Le sens a changé.', message: 'Quand on multiplie ou qu’on divise par un nombre négatif, le sens de l’inégalité se retourne.' },
};
