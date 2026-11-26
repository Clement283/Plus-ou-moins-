import { toLatex } from '@pom/engine';
import { Bold } from '../Bold';
import { Keypad } from '../Keypad';
import { RawInputContent } from '../RawInputView';
import { Math } from '../../ui/Math';
import { Prompt, QFrame, Resolution, type QProps } from './Frame';
import { useRawAnswer } from './useRawAnswer';

const HOLE = '\\square';

/** Compléter le trou : la case du calcul est le champ de réponse. */
export function Trou({ q, course, locked, onAnswer, header, footer, notice, texts }: QProps<'trou'>) {
  const r = useRawAnswer(course, q, locked, onAnswer);
  const at = q.promptLatex.indexOf(HOLE);
  const before = at < 0 ? '' : q.promptLatex.slice(0, at);
  const after = at < 0 ? q.promptLatex : q.promptLatex.slice(at + HOLE.length);
  const cls = `hole${r.state === 'faux' ? ' hole--error' : r.state === 'juste' ? ' hole--success' : ''}`;
  return (
    <QFrame header={header} footer={footer} notice={notice} locked={locked} foot={<Keypad onKey={r.press} onSubmit={r.submit} canSubmit={r.can} />}>
      <div className="q-expr" data-copie>
        <Prompt texts={texts} fallback="Complète." cls="t-body2" />
        {texts?.intro?.map((t, i) => (
          <p key={i} className="t-body1">
            <Bold text={t} />
          </p>
        ))}
        {/* exemple guidé : le calcul de départ reste affiché, puis les lignes déjà posées, avant la case */}
        <Resolution texts={texts?.above?.length ? { ...texts, above: [typeof q.ex.meta?.latex === 'string' ? q.ex.meta.latex : toLatex(q.ex.expr), ...texts.above] } : undefined} part="above" />
        <p className="t-math-xl">
          {before && <Math latex={`${before}{}\\,`} />}
          <span className={cls} aria-label="Case à remplir">
            <span className="hole__in">
              <RawInputContent input={r.input} typing={r.state === 'neutre' && !locked} />
            </span>
          </span>
          {after && <Math latex={`\\ ${after}`} />}
        </p>
      </div>
      <Resolution texts={texts} part="help" />
    </QFrame>
  );
}
