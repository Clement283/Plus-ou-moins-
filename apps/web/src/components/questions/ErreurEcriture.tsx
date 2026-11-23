import { useState } from 'react';
import { checkAnswer } from '@pom/engine';
import { Math } from '../../ui/Math';
import { QFrame, type QProps } from './Frame';

/** Trouver l'erreur d'écriture (cours 0) : le calcul en morceaux touchables, ou « Tout est bien écrit ». */
export function ErreurEcriture({ q, course, locked, onAnswer, header, footer }: QProps<'erreur'>) {
  const [picked, setPicked] = useState<number | null | undefined>(undefined);
  const pick = (line: number | null) => {
    if (locked || picked !== undefined) return;
    setPicked(line);
    onAnswer({ line }, checkAnswer(course, q, { line }));
  };
  const mark = (i: number): string => {
    if (locked && i === q.wrongLine) return ' is-correct';
    if (locked && i === picked) return ' is-wrong';
    return i === picked ? ' is-selected' : '';
  };
  return (
    <QFrame header={header} footer={footer} locked={locked}>
      <div className="stack stack--top">
        <p className="t-body1">Touche l'endroit mal écrit.</p>
        <div className="tags" data-copie>
          {q.lines.map((piece, i) => (
            <button key={i} className={`tag tag--piece${mark(i)}`} type="button" disabled={locked || picked !== undefined} onClick={() => pick(i)}>
              <Math latex={piece} />
            </button>
          ))}
        </div>
        <button className="btn btn--outlined btn--block" type="button" disabled={locked || picked !== undefined} onClick={() => pick(null)}>
          Tout est bien écrit
        </button>
      </div>
    </QFrame>
  );
}
