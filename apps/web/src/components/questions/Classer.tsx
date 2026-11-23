import { useState } from 'react';
import { checkAnswer, checkParts } from '@pom/engine';
import { Math } from '../../ui/Math';
import { calcLatex } from './calc';
import { Prompt, QFrame, ValidateFoot, type QProps } from './Frame';

/**
 * Classer : toucher le calcul puis la case. Le calcul qu'on touche dans une case retourne en haut ; seule la
 * première case où il a été rangé compte. « Valider » s'active quand tout est rangé.
 */
export function Classer({ q, course, locked, onAnswer, header, footer, texts }: QProps<'classer'>) {
  const n = q.exs.length;
  const [sel, setSel] = useState<number | null>(null);
  const [first, setFirst] = useState<(string | null)[]>(() => Array(n).fill(null));
  const [now, setNow] = useState<(string | null)[]>(() => Array(n).fill(null));

  const choose = (i: number) => !locked && setSel(sel === i ? null : i);
  const drop = (box: string) => {
    if (locked || sel === null) return;
    const nextFirst = first.map((b, i) => (i === sel ? (b ?? box) : b));
    const nextNow = now.map((b, i) => (i === sel ? box : b));
    setFirst(nextFirst);
    setNow(nextNow);
    setSel(null);
  };
  const submit = () => {
    const a = { classes: first as string[] };
    onAnswer(a, checkAnswer(course, q, a));
  };
  const back = (i: number) => !locked && setNow(now.map((b, k) => (k === i ? null : b)));

  const complete = first.every((b) => b !== null);
  const parts = locked && complete ? checkParts(course, q, { classes: first as string[] }) : null;
  const shown = locked ? first : now;

  return (
    <QFrame header={header} footer={footer} locked={locked} foot={<ValidateFoot enabled={now.every((b) => b !== null)} onSubmit={submit} />}>
      <div className="stack stack--top" data-copie>
        <Prompt texts={texts} fallback="Range chaque calcul." cls="t-body1" />
        {!locked && (
          <div className="tags">
            {q.exs.map((e, i) =>
              now[i] === null ? (
                <button key={i} className={`tag${sel === i ? ' is-selected' : ''}`} type="button" onClick={() => choose(i)}>
                  <Math latex={calcLatex(e)} />
                </button>
              ) : null,
            )}
          </div>
        )}
        <div className="bins">
          {q.classes.map((c) => (
            <div key={c.id} className="bin" role="group" aria-label={c.label} onClick={() => drop(c.id)}>
              <p className="t-h6">{c.label}</p>
              <div className="tags">
                {q.exs.map((e, i) =>
                  shown[i] === c.id ? (
                    locked ? (
                      <span key={i} className={`tag${parts ? (parts[i]!.correct ? ' is-correct' : ' is-wrong') : ''}`}>
                        <Math latex={calcLatex(e)} />
                      </span>
                    ) : (
                      <button key={i} className="tag" type="button" onClick={(ev) => { ev.stopPropagation(); back(i); }}>
                        <Math latex={calcLatex(e)} />
                      </button>
                    )
                  ) : null,
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </QFrame>
  );
}
