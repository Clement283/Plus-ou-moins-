// Lire une ligne tapée par l'élève : « 2x+3=7 », « −x + 4 ⩾ 2x », « x = −3 ».
// Le clavier de l'appli n'a que : chiffres, x, +, −, =, <, >, ⩽, ⩾ (et l'espace, ignoré).
import { type Equation, type Member, type Relation, cst, xt } from './equation';

export type ParseError =
  | 'vide' // rien de tapé
  | 'sans-signe' // pas de =, <, >, ⩽, ⩾
  | 'deux-signes' // plus d'un signe =, <, >…
  | 'membre-vide' // « = 7 » ou « 2x = »
  | 'mal-ecrit'; // « 2x3 », « ++ », « x2 », caractère inconnu…

export type ParseResult = { ok: true; eq: Equation } | { ok: false; error: ParseError };

const REL: Record<string, Relation> = {
  '=': '=',
  '<': '<',
  '>': '>',
  '⩽': '<=',
  '≤': '<=',
  '<=': '<=',
  '⩾': '>=',
  '≥': '>=',
  '>=': '>=',
};

/** Un membre : suite de termes « ±nombre », « ±x », « ±nombre x ». Les termes nuls sont retirés. */
function member(s: string): Member | null {
  if (!/^[+-]?(\d*x|\d+)([+-](\d*x|\d+))*$/.test(s)) return null;
  const out: Member = [];
  for (const m of s.matchAll(/([+-]?)(\d*)(x?)/g)) {
    if (m[0] === '') continue;
    const sign = m[1] === '-' ? -1 : 1;
    if (m[3]) {
      const c = sign * (m[2] === '' ? 1 : Number(m[2]));
      if (c !== 0) out.push(xt(c));
    } else {
      const v = sign * Number(m[2]);
      if (v !== 0) out.push(cst(v));
    }
  }
  return out.length ? out : [cst(0)];
}

export function parseEquation(text: string): ParseResult {
  const s = text
    .replace(/\s+/g, '')
    .replace(/[−–]/g, '-')
    .replace(/X/g, 'x');
  if (s === '') return { ok: false, error: 'vide' };
  const rels = s.match(/<=|>=|[=<>⩽⩾≤≥]/g) ?? [];
  if (rels.length === 0) return { ok: false, error: 'sans-signe' };
  if (rels.length > 1) return { ok: false, error: 'deux-signes' };
  const r = rels[0]!;
  const i = s.indexOf(r);
  const [l, rt] = [s.slice(0, i), s.slice(i + r.length)];
  if (l === '' || rt === '') return { ok: false, error: 'membre-vide' };
  const left = member(l);
  const right = member(rt);
  if (!left || !right) return { ok: false, error: 'mal-ecrit' };
  return { ok: true, eq: { left, right, rel: REL[r]! } };
}
