import { useState } from 'react';
import { checkAnswer, num, toLatex } from '@pom/engine';
import { Math } from '../../ui/Math';
import { QFrame, type QProps } from './Frame';

/** Vrai ou faux : deux gros boutons, la réponse part au toucher (doc 08 n° 10). */
export function VraiFaux({ q, course, locked, onAnswer, header, footer }: QProps<'vraifaux'>) {
  const [picked, setPicked] = useState<boolean | null>(null);
  const pick = (bool: boolean) => {
    if (locked || picked !== null) return;
    setPicked(bool);
    onAnswer({ bool }, checkAnswer(course, q, { bool }));
  };
  return (
    <QFrame header={header} footer={footer} locked={locked}>
      <div className="q-expr" data-copie>
        <p className="t-body2">Vrai ou faux ?</p>
        <p className="t-math-xl">
          <Math latex={`${toLatex(q.ex.expr)} = ${toLatex(num(q.shown))}`} />
        </p>
      </div>
      <div className="toggle-group">
        {([true, false] as const).map((b) => (
          <button key={String(b)} className={`toggle${picked === b ? ' is-selected' : ''}`} type="button" disabled={locked || picked !== null} onClick={() => pick(b)}>
            {b ? 'Vrai' : 'Faux'}
          </button>
        ))}
      </div>
    </QFrame>
  );
}
