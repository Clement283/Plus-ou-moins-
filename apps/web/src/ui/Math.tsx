import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { colorizeLatex } from '../components/colorize';

/** Longueur d'un calcul tel qu'on le lit (une commande LaTeX = un signe, sans accolades) : de quoi décider de réduire un long calcul. */
export function shownLength(latex: string): number {
  return latex.replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim().length;
}

/** Un calcul de plus de 22 signes (5 termes ou plus) rétrécit un peu, de plus de 30 (6 termes de deux chiffres) davantage : il tient dans la largeur du téléphone. */
export const lengthClass = (latex: string): '' | ' math--long' | ' math--xlong' => {
  const n = shownLength(latex);
  return n > 30 ? ' math--xlong' : n > 22 ? ' math--long' : '';
};

/**
 * Notation de copie : KaTeX, fractions empilées. Aucune couleur ajoutée ici, sauf `colorize` (leçons et
 * explications seulement : négatifs rouges, positifs bleus, par classes du design system).
 */
export function Math({ latex, block = false, colorize = false }: { latex: string; block?: boolean; colorize?: boolean }) {
  const html = useMemo(
    () =>
      katex.renderToString(colorize ? colorizeLatex(latex) : latex, {
        throwOnError: false,
        displayMode: block,
        trust: colorize ? (c) => c.command === '\\htmlClass' : false,
        strict: (code: string) => (code === 'htmlExtension' ? 'ignore' : 'warn'),
      }),
    [latex, block, colorize],
  );
  const Tag = block ? 'div' : 'span';
  return <Tag className={`math${lengthClass(latex)}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
