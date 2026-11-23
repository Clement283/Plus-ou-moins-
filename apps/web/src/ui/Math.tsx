import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { colorizeLatex } from '../components/colorize';

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
  return <Tag className="math" dangerouslySetInnerHTML={{ __html: html }} />;
}
