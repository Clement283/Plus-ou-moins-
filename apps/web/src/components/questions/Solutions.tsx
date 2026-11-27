import { useState } from 'react';
import { checkAnswer, parseBound, solutionsHint } from '@pom/engine';
import { Math as MathView } from '../../ui/Math';
import { TableKeypad } from '../TableKeypad';
import { Prompt, QFrame, type QProps } from './Frame';

/**
 * « Écrire les solutions » (cours 6, produit nul) : S = { ▢ ; ▢ }, une case par solution, dans l'ordre qu'on veut.
 * Clavier des valeurs (chiffres, −, /). Une seule réponse jugée à « Vérifier ».
 */
export function Solutions({ q, course, locked, onAnswer, header, footer, texts }: QProps<'solutions'>) {
  const [vals, setVals] = useState<string[]>(() => q.roots.map(() => ''));
  const [cur, setCur] = useState(0);
  const [hinted, setHinted] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const editing = !locked && !sent;
  const readable = vals.every((v) => v !== '' && parseBound(v).kind === 'num');

  const press = (k: string) => {
    if (!editing) return;
    setVals((vs) => vs.map((t, i) => (i === cur ? (k === '⌫' ? t.slice(0, -1) : k === '−' ? (t === '' ? '−' : t) : k === '/' ? (/^−?\d+$/.test(t) ? `${t}/` : t) : t + k) : t)));
  };
  const submit = () => {
    if (!editing || !readable) return;
    setSent(true);
    const a = { values: vals, hinted };
    onAnswer(a, checkAnswer(course, q, a));
  };
  return (
    <QFrame header={header} footer={footer} locked={locked} foot={editing ? <TableKeypad mode="valeurs" onKey={press} onSubmit={submit} canSubmit={readable} /> : undefined}>
      <Prompt texts={texts} fallback="Écris l’ensemble des solutions." cls="q-ask" />
      <div className="calc-head" data-copie>
        <span className="t-math-md">
          <MathView latex={q.promptLatex} />
        </span>
      </div>
      <div className="sol-row" data-copie>
        <span className="sol-row__lbl">S =</span>
        <span className="sol-brace">{'{'}</span>
        {vals.map((v, i) => (
          <span key={i} className="sol-row__item">
            {i > 0 && <span>;</span>}
            <button className={`sol-slot${cur === i && editing ? ' is-active' : ''}`} type="button" disabled={!editing} aria-label={`Solution ${i + 1}`} onClick={() => setCur(i)}>
              {v === '' ? ' ' : v}
            </button>
          </span>
        ))}
        <span className="sol-brace">{'}'}</span>
      </div>
      {editing && <p className="t-body2 interval-hint">Touche une case, puis écris la solution.</p>}
      {editing &&
        (hintOpen || q.guided === true ? (
          <p className="t-body2 solve-hint">{solutionsHint()}</p>
        ) : (
          <button
            className="btn btn--text"
            type="button"
            onClick={() => {
              setHinted(true);
              setHintOpen(true);
            }}
          >
            Un indice
          </button>
        ))}
    </QFrame>
  );
}
