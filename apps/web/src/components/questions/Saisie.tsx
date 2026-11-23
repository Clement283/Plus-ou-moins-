import { Keypad } from '../Keypad';
import { RawInputView } from '../RawInputView';
import { Math } from '../../ui/Math';
import { QFrame, type QProps } from './Frame';
import { useRawAnswer } from './useRawAnswer';

/** Réponse écrite : le calcul, le champ de réponse et le clavier maths. */
export function Saisie({ q, course, locked, onAnswer, header, footer, notice }: QProps<'saisie'>) {
  const r = useRawAnswer(course, q, locked, onAnswer);
  return (
    <QFrame header={header} footer={footer} notice={notice} locked={locked} foot={<Keypad onKey={r.press} onSubmit={r.submit} canSubmit={r.can} />}>
      <div className="q-expr" data-copie>
        <p className="t-body2">Calcule.</p>
        <p className="t-math-xl">
          <Math latex={q.promptLatex} />
        </p>
      </div>
      <RawInputView input={r.input} state={r.state} />
    </QFrame>
  );
}
