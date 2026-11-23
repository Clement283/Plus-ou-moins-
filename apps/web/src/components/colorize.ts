/**
 * Couleurs de leçon (doc 06) : dans un calcul LaTeX, chaque nombre négatif (moins unaire compris) reçoit la
 * classe `neg` (rouge), chaque nombre positif la classe `pos` (bleu). Les classes sont posées par KaTeX
 * (`\htmlClass`), les couleurs viennent du design system (`.neg`, `.pos` : tokens). Le contenu de `\text{}`
 * reste intact.
 */
const TOKEN = /\\text\{[^}]*\}|\\[a-zA-Z]+|\d+(?:[.,]\d+)?|\s+|[\s\S]/g;
/** Ce qui précède un moins unaire : début, ouvrante, opérateur, signe égal. */
const BEFORE_UNARY = new Set(['(', '[', '{', '=', '+', '-', '<', '>', '\\times', '\\div', '\\cdot', '\\Rightarrow', ',']);
const isNumber = (t: string | undefined): boolean => t !== undefined && /^\d/.test(t);

export function colorizeLatex(latex: string): string {
  const tokens = latex.match(TOKEN) ?? [];
  let out = '';
  let prev: string | null = null; // dernier jeton non blanc
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]!;
    if (/^\s+$/.test(t)) {
      out += t;
      continue;
    }
    if (t === '-' && (prev === null || BEFORE_UNARY.has(prev))) {
      let k = i + 1;
      while (k < tokens.length && /^\s+$/.test(tokens[k]!)) k++;
      if (isNumber(tokens[k])) {
        out += `\\htmlClass{neg}{-${tokens[k]!}}`;
        prev = tokens[k]!;
        i = k;
        continue;
      }
    }
    if (isNumber(t)) out += `\\htmlClass{pos}{${t}}`;
    else out += t;
    prev = t;
  }
  return out;
}
