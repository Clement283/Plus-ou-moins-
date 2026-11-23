import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/** Notation de copie : KaTeX, fractions empilées. Aucune couleur ajoutée ici. */
export function Math({ latex, block = false }: { latex: string; block?: boolean }) {
  const html = useMemo(() => katex.renderToString(latex, { throwOnError: false, displayMode: block }), [latex, block]);
  const Tag = block ? 'div' : 'span';
  return <Tag className="math" dangerouslySetInnerHTML={{ __html: html }} />;
}
