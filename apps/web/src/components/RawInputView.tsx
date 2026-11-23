import type { ReactNode } from 'react';
import type { RawInput, RawToken } from '@pom/engine';

export type RawInputState = 'neutre' | 'juste' | 'faux' | 'note';

const Caret = () => <span className="answer__caret" />;

/** Un caractère s'affiche tel quel ; le moins est le vrai « − » (U+2212). */
const text = (tokens: readonly RawToken[]): string => tokens.map((t) => (t.t === 'c' ? (t.c === '-' ? '−' : t.c) : '')).join('');

function Box({ tokens, active, showCaret }: { tokens: readonly RawToken[]; active: boolean; showCaret: boolean }) {
  if (tokens.length === 0) return <span className={`is-slot${active ? ' is-active' : ''}`} />;
  return (
    <span>
      {text(tokens)}
      {active && showCaret && <Caret />}
    </span>
  );
}

/**
 * Champ de réponse : affiche exactement ce qui est tapé, comme sur une copie (fraction empilée).
 * Rendu en React plutôt qu'avec KaTeX (`rawToLatex`) : le LaTeX ne porte pas le curseur ni la case active.
 * Le curseur n'apparaît que pendant la saisie (état « neutre »). Aucune couleur sur les caractères.
 */
export function RawInputView({ input, placeholder = 'Ta réponse', state = 'neutre' }: { input: RawInput; placeholder?: string; state?: RawInputState }) {
  const typing = state === 'neutre';
  const cls = ['answer', input.tokens.length === 0 ? 'answer--empty' : '', state === 'faux' ? 'answer--error' : '', state === 'juste' ? 'answer--success' : '']
    .filter(Boolean)
    .join(' ');

  const nodes: ReactNode[] = [];
  let run = '';
  const flush = (k: number) => {
    if (run) nodes.push(<span key={`t${k}`} className="math">{run}</span>);
    run = '';
  };
  input.tokens.forEach((tok, i) => {
    if (tok.t === 'c') {
      run += tok.c === '-' ? '−' : tok.c;
      return;
    }
    flush(i);
    const last = i === input.tokens.length - 1;
    const inside = last && input.cursor !== 'root';
    nodes.push(
      <span key={`f${i}`} className="frac">
        <Box tokens={tok.num} active={typing && inside && input.cursor === 'num'} showCaret={typing} />
        <Box tokens={tok.den} active={typing && inside && input.cursor === 'den'} showCaret={typing} />
      </span>,
    );
  });
  flush(input.tokens.length);

  const lastTok = input.tokens[input.tokens.length - 1];
  const caretAtRoot = typing && (input.cursor === 'root' || lastTok?.t !== 'frac');

  return (
    <div className={cls} aria-label={placeholder}>
      {input.tokens.length === 0 ? <span>{placeholder}</span> : nodes}
      {caretAtRoot && <Caret />}
    </div>
  );
}
