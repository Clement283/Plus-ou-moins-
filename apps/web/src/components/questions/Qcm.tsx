import { useState } from 'react';
import { checkAnswer, toLatex } from '@pom/engine';
import { Icon } from '../../ui/Icon';
import { Math } from '../../ui/Math';
import { WRITING_COURSE } from './calc';
import { QFrame, type QProps } from './Frame';

/** Cours 0 : les choix sont des écritures du même calcul, il n'y a pas de calcul au-dessus. */
const isWriting = (q: QProps<'qcm'>['q']): boolean => q.ex.courseId === WRITING_COURSE;

/** « Signe du résultat » : un QCM à deux choix « + » et « − » (doc 06). */
export const isSignBox = (q: QProps<'qcm'>['q']): boolean =>
  q.choices.length === 2 && q.choices[0]!.latex === '+' && q.choices[1]!.latex === '-';

/** QCM : la réponse part au toucher, sans « Valider » (doc 08 n° 10). */
export function Qcm({ q, course, locked, onAnswer, header, footer }: QProps<'qcm'>) {
  const [picked, setPicked] = useState<number | null>(null);
  const sign = isSignBox(q);
  const writing = isWriting(q);
  const pick = (i: number) => {
    if (locked || picked !== null) return;
    setPicked(i);
    onAnswer({ choice: i }, checkAnswer(course, q, { choice: i }));
  };
  const mark = (i: number): string => {
    if (!locked) return i === picked ? ' is-selected' : '';
    if (i === q.correctIndex) return ' is-correct';
    return i === picked ? ' is-wrong' : '';
  };
  return (
    <QFrame header={header} footer={footer} locked={locked}>
      <div className="q-expr" data-copie>
        <p className="t-body2">{writing ? 'Lequel est bien écrit ?' : sign ? 'Quel est le signe du résultat ?' : 'Choisis la bonne réponse.'}</p>
        {!writing && (
          <p className="t-math-xl">
            <Math latex={toLatex(q.ex.expr)} />
          </p>
        )}
      </div>
      <div className="choice-grid" data-copie>
        {q.choices.map((c, i) => (
          <button key={i} className={`choice${sign ? ' choice--sign' : ''}${mark(i)}`} type="button" disabled={locked || picked !== null} onClick={() => pick(i)}>
            {locked && !sign && i === q.correctIndex && <Icon name="check-circle" />}
            {locked && !sign && i === picked && i !== q.correctIndex && <Icon name="x-circle" />}
            {sign ? (c.latex === '+' ? '+' : '−') : <Math latex={c.latex} />}
          </button>
        ))}
      </div>
    </QFrame>
  );
}
