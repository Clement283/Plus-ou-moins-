// Tableau de signes (module Équations et inéquations, cours 9 à 11). Maquette docs/design/ecrans/equations-tableau-signes.html.
// Un facteur ax + b (a, b entiers, a ≠ 0) ; le tableau d'un facteur seul, d'un produit ou d'un quotient de deux facteurs.
import { type Rational, add, eqRat, mul, rat, ratToString, sub } from './rational';
import { parseBound } from './intervalle';

export interface Factor {
  a: number;
  b: number;
}
export type TableOp = 'seul' | 'produit' | 'quotient';
export type Sign = '+' | '−' | '0' | '‖';

const MINUS = '−';
export const factorRoot = (f: Factor): Rational => rat(-f.b, f.a);

/** x − 2, 2x + 3, −x + 4, x. */
export function factorText(f: Factor): string {
  const ax = f.a === 1 ? 'x' : f.a === -1 ? `${MINUS}x` : `${f.a < 0 ? MINUS : ''}${Math.abs(f.a)}x`;
  return f.b === 0 ? ax : `${ax} ${f.b < 0 ? MINUS : '+'} ${Math.abs(f.b)}`;
}
export const factorLatex = (f: Factor): string => factorText(f).replace(/−/g, '-');

/** Lit « x − 2 », « 2x+3 », « −x + 4 », « 3 − x » (espaces libres, − ou -). */
export function parseFactor(text: string): Factor | null {
  const t = text.replace(/\s+/g, '').replace(/[−–]/g, '-');
  if (t === '' || !/^[-+]?[\dx]/.test(t)) return null;
  const terms = t.match(/[+-]?[^+-]+/g);
  if (!terms || terms.join('') !== t) return null;
  let a = 0;
  let b = 0;
  for (const term of terms) {
    const m = /^([+-]?)(\d*)(x?)$/.exec(term);
    if (!m || (m[2] === '' && m[3] === '')) return null;
    const v = (m[1] === '-' ? -1 : 1) * (m[2] === '' ? 1 : Number(m[2]));
    if (m[3] === 'x') a += v;
    else b += v;
  }
  return a === 0 ? null : { a, b };
}

const sameFactor = (f: Factor, g: Factor): boolean => f.a === g.a && f.b === g.b;
const keyOf = (f: Factor): string => `${f.a}:${f.b}`;

/** Les valeurs qui annulent un facteur, de la plus petite à la plus grande. */
export function sortedRoots(factors: Factor[]): Rational[] {
  const rs = factors.map(factorRoot);
  return rs.sort((p, q) => sub(p, q).n);
}

/** L'expression en entier : (x − 2)(x + 1) ou (x + 1) ÷ (x − 2). `null` pour un facteur seul. */
export function wholeText(op: TableOp, factors: Factor[]): string | null {
  if (op === 'seul') return null;
  if (op === 'quotient') return `(${factorText(factors[0]!)}) ÷ (${factorText(factors[1]!)})`;
  return factors.map((f) => `(${factorText(f)})`).join('');
}
export function wholeLatex(op: TableOp, factors: Factor[]): string {
  if (op === 'seul') return factorLatex(factors[0]!);
  if (op === 'quotient') return `\\frac{${factorLatex(factors[0]!)}}{${factorLatex(factors[1]!)}}`;
  return factors.map((f) => `(${factorLatex(f)})`).join('');
}

const signOf = (f: Factor, x: Rational): Sign => {
  const v = add(mul(rat(f.a), x), rat(f.b));
  return v.n === 0 ? '0' : v.n > 0 ? '+' : MINUS;
};

/** Un point de chaque colonne : avant la 1re valeur, entre deux, après la dernière (les valeurs elles-mêmes aux colonnes impaires). */
function columns(roots: Rational[]): { x: Rational; root: boolean }[] {
  const cols: { x: Rational; root: boolean }[] = [{ x: sub(roots[0]!, rat(1)), root: false }];
  roots.forEach((r, i) => {
    cols.push({ x: r, root: true });
    const next = roots[i + 1];
    cols.push({ x: next ? mul(add(r, next), rat(1, 2)) : add(r, rat(1)), root: false });
  });
  return cols;
}

/** Les signes attendus : une ligne par facteur (dans l'ordre donné), puis la ligne du produit ou du quotient. */
export function expectedGrid(op: TableOp, rowFactors: Factor[]): Sign[][] {
  const roots = sortedRoots(rowFactors);
  const cols = columns(roots);
  const rows = rowFactors.map((f) => cols.map((c) => signOf(f, c.x)));
  if (op === 'seul') return rows;
  const whole = cols.map((_, c): Sign => {
    const signs = rows.map((r) => r[c]!);
    if (op === 'quotient' && signs[1] === '0') return '‖';
    if (signs.includes('0')) return '0';
    return signs.filter((s) => s === MINUS).length % 2 === 0 ? '+' : MINUS;
  });
  return [...rows, whole];
}

export type TableErrorId =
  | 'valeurs-ordre'
  | 'valeurs'
  | 'lignes-facteurs'
  | 'ligne-totale'
  | 'signe-facteur'
  | 'regle-signes'
  | 'zero-oublie'
  | 'zero-en-trop'
  | 'barre-oubliee'
  | 'barre-en-trop'
  | 'case-vide';

/** Les valeurs de la 1re ligne : les bonnes, dans l'ordre croissant. */
export function judgeValues(factors: Factor[], typed: string[]): { ok: true } | { ok: false; errorId: TableErrorId } {
  const want = sortedRoots(factors);
  if (typed.length !== want.length || typed.some((t) => t.trim() === '')) return { ok: false, errorId: 'case-vide' };
  const got = typed.map(parseBound);
  if (got.some((g) => g.kind !== 'num')) return { ok: false, errorId: 'valeurs' };
  const rs = got.map((g) => (g as { kind: 'num'; v: Rational }).v);
  if (rs.every((r, i) => eqRat(r, want[i]!))) return { ok: true };
  const sameSet = want.every((w) => rs.some((r) => eqRat(r, w)));
  return { ok: false, errorId: sameSet ? 'valeurs-ordre' : 'valeurs' };
}

const norm = (t: string): string => t.replace(/[\s×·*]/g, '').replace(/[−–]/g, '-');

/** La 1re colonne : un facteur par ligne (dans un ordre libre), puis l'expression en entier. */
export function judgeLabels(
  op: TableOp,
  factors: Factor[],
  labels: string[],
): { ok: true; rowFactors: Factor[] } | { ok: false; errorId: TableErrorId } {
  const n = factors.length;
  const total = op === 'seul' ? 0 : 1;
  if (labels.length !== n + total || labels.some((l) => l.trim() === '')) return { ok: false, errorId: 'case-vide' };
  const rows = labels.slice(0, n).map(parseFactor);
  if (rows.some((r) => r === null)) return { ok: false, errorId: 'lignes-facteurs' };
  const got = (rows as Factor[]).map(keyOf).sort().join('|');
  if (got !== factors.map(keyOf).sort().join('|')) return { ok: false, errorId: 'lignes-facteurs' };
  if (total === 1) {
    const w = norm(labels[n]!);
    const part = (s: string): Factor | null => parseFactor(s.replace(/^\((.*)\)$/, '$1'));
    let okWhole: boolean;
    if (op === 'quotient') {
      const [top, bottom] = w.split('÷');
      const num = top === undefined ? null : part(top);
      const den = bottom === undefined ? null : part(bottom);
      okWhole = num !== null && den !== null && sameFactor(num, rows[0]!) && sameFactor(den, rows[1]!);
    } else {
      const chunks = w.match(/\([^()]*\)/g) ?? [];
      const fs = chunks.map(part);
      okWhole =
        chunks.join('') === w &&
        fs.every((f) => f !== null) &&
        (fs as Factor[]).map(keyOf).sort().join('|') === got;
    }
    if (!okWhole) return { ok: false, errorId: 'ligne-totale' };
  }
  return { ok: true, rowFactors: rows as Factor[] };
}

export interface SignJudgement {
  /** Par case : 'ok', 'ko' ou '' (vide). */
  cells: ('ok' | 'ko' | '')[][];
  complete: boolean;
  first: { r: number; c: number; errorId: TableErrorId } | null;
}

/** Les signes tapés, case par case. La 1re erreur est celle des lignes de facteurs avant celle du produit. */
export function judgeSigns(op: TableOp, rowFactors: Factor[], typed: string[][]): SignJudgement {
  const want = expectedGrid(op, rowFactors);
  let complete = true;
  let first: SignJudgement['first'] = null;
  const cells = want.map((row, r) =>
    row.map((e, c): 'ok' | 'ko' | '' => {
      const g = typed[r]?.[c] ?? '';
      if (g === '') {
        complete = false;
        return '';
      }
      if (g === e) return 'ok';
      if (first === null) {
        const whole = op !== 'seul' && r === want.length - 1;
        const errorId: TableErrorId =
          e === '0' ? 'zero-oublie' : g === '0' ? (whole && e === '‖' ? 'barre-oubliee' : 'zero-en-trop') : e === '‖' ? 'barre-oubliee' : g === '‖' ? 'barre-en-trop' : whole ? 'regle-signes' : 'signe-facteur';
        first = { r, c, errorId };
      }
      return 'ko';
    }),
  );
  return { cells, complete, first };
}

export const TABLE_ERROR_TEXT: Record<TableErrorId, { title: string; message: string }> = {
  'case-vide': { title: 'Il reste des cases vides.', message: 'Remplis toutes les cases, puis vérifie.' },
  'valeurs-ordre': { title: 'Les valeurs sont dans le désordre.', message: 'Écris-les de la plus petite à la plus grande.' },
  valeurs: { title: 'Une valeur n’est pas la bonne.', message: 'Une valeur annule un facteur : cherche x pour que le facteur soit égal à 0.' },
  'lignes-facteurs': { title: 'Les lignes du haut ne sont pas les bonnes.', message: 'Chaque ligne du haut est un facteur, écrit comme dans l’expression, un par ligne.' },
  'ligne-totale': { title: 'La dernière ligne est l’expression en entier.', message: 'Avec des parenthèses autour de chaque facteur ; pour un quotient, le haut ÷ le bas.' },
  'signe-facteur': { title: 'Regarde le signe du facteur.', message: 'À droite de sa valeur, un facteur a le signe du nombre devant x ; à gauche, le signe contraire.' },
  'regle-signes': { title: 'Regarde les signes au-dessus.', message: 'Dans une colonne : deux signes pareils donnent +, deux signes différents donnent −.' },
  'zero-oublie': { title: 'Sous une valeur qui annule, on met 0.', message: 'Là où le facteur vaut 0, le produit (ou le haut du quotient) vaut aussi 0.' },
  'zero-en-trop': { title: 'Ce 0 n’a rien à faire ici.', message: 'On ne met 0 que sous la valeur qui annule la ligne.' },
  'barre-oubliee': { title: 'Sous cette valeur, on ne peut pas diviser.', message: 'La valeur qui annule le bas du quotient n’est pas autorisée : mets la double barre ‖.' },
  'barre-en-trop': { title: 'Pas de double barre ici.', message: 'La double barre va seulement sous la valeur qui annule le bas d’un quotient.' },
};

/** Texte d'une ligne de signes : « + 0 − 0 + ». */
export const signsText = (row: string[]): string => row.join(' ');
export const rootText = (r: Rational): string => ratToString(r).replace(/-/g, MINUS);
