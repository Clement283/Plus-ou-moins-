import { useState } from 'react';
import { checkAnswer } from '@pom/engine';
import { Math as MathView } from '../../ui/Math';
import { Prompt, QFrame, type QProps } from './Frame';
import { symbolText, writingLatex } from './calc';

/** Consigne de « Toucher la faute » (doc 06, écran 18) : le moteur ne la porte pas, l'écran la pose quand `accept` est là. */
export const TOUCH_ASK = 'Ce calcul est-il bien écrit ?';
export const TOUCH_HELP = "S'il est mal écrit, touche l'endroit de la faute dans les cases en bas. Chaque symbole du calcul a sa case.";

/**
 * Trouver l'erreur d'écriture (cours 0). Avec `accept` (« Toucher la faute ») : le calcul écrit en haut, comme sur une copie,
 * et en bas une case de même taille par symbole puis « Tout est bien écrit ». Sans : les morceaux du calcul à toucher.
 * Vert et rouge seulement après la réponse.
 */
export function ErreurEcriture({ q, course, locked, onAnswer, header, footer, texts }: QProps<'erreur'>) {
  const [picked, setPicked] = useState<number | null | undefined>(undefined);
  const touch = q.accept !== undefined;
  const faults = q.accept ?? (q.wrongLine === null ? [] : [q.wrongLine]);
  const done = locked || picked !== undefined;
  const pick = (line: number | null) => {
    if (done) return;
    setPicked(line);
    onAnswer({ line }, checkAnswer(course, q, { line }));
  };
  const mark = (i: number): string => {
    if (!locked) return '';
    if (faults.includes(i)) return ' is-correct';
    return i === picked ? ' is-wrong' : '';
  };
  const noneMark = !locked ? '' : faults.length === 0 ? ' is-correct' : picked === null ? ' is-wrong' : '';
  const nothing = (
    <button className={`btn btn--outlined btn--block${noneMark}`} type="button" disabled={done} onClick={() => pick(null)}>
      Tout est bien écrit
    </button>
  );
  if (touch) {
    return (
      <QFrame
        header={header}
        footer={footer}
        locked={locked}
        answer={
          <>
            <div className="pieces" data-copie>
              {q.lines.map((piece, i) => (
                <button key={i} className={`tag tag--piece${mark(i)}`} type="button" disabled={done} onClick={() => pick(i)}>
                  {symbolText(piece)}
                </button>
              ))}
            </div>
            {nothing}
          </>
        }
      >
        <p className="q-ask q-ask--lesson">{texts?.consigne ?? TOUCH_ASK}</p>
        {q.shownLatex && (
          <div className="q-calc" data-copie>
            <p className="t-math-xl">
              <MathView latex={writingLatex(q.shownLatex)} />
            </p>
          </div>
        )}
        <p className="t-body2">{TOUCH_HELP}</p>
      </QFrame>
    );
  }
  return (
    <QFrame header={header} footer={footer} locked={locked}>
      <div className="stack stack--top">
        <Prompt texts={texts} fallback="Touche l'endroit mal écrit." cls="t-body1" />
        <div className="tags" data-copie>
          {q.lines.map((piece, i) => (
            <button key={i} className={`tag tag--piece${mark(i) || (i === picked ? ' is-selected' : '')}`} type="button" disabled={done} onClick={() => pick(i)}>
              <MathView latex={writingLatex(piece)} />
            </button>
          ))}
        </div>
        {nothing}
      </div>
    </QFrame>
  );
}
