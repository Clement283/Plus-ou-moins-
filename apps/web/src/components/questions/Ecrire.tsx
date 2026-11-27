import { useMemo, useState } from 'react';
import { type EcrireVerdict, calcTextLatex, checkAnswer, ecrireCalcul, ecrireText, judgeEcrire, parseCalc } from '@pom/engine';
import { Math as MathView } from '../../ui/Math';
import { Icon } from '../../ui/Icon';
import { Bold } from '../Bold';
import { ExprKeypad } from '../ExprKeypad';
import { Calculer } from './Calculer';
import { Prompt, QFrame, type QProps } from './Frame';

/** Un calcul tapé, mis en forme (LaTeX) dès qu'il se lit ; sinon, et pour une expression avec x, en texte (chaîne vide : LaTeX). */
const shown = (typed: string, letter: boolean): string => (letter ? ecrireText(typed) : parseCalc(typed).ok ? '' : typed);

function Verdict({ v }: { v: EcrireVerdict }) {
  const tone = v.kind === 'juste' ? 'success' : v.kind === 'faux' ? 'error' : 'info';
  const icon = v.kind === 'juste' ? 'check-circle' : v.kind === 'faux' ? 'x-circle' : 'info';
  return (
    <div className={`alert alert--${tone}`} role="status">
      <Icon name={icon} />
      <div className="alert__title">{v.title}</div>
      {v.message && (
        <div>
          <Bold text={v.message} />
        </div>
      )}
    </div>
  );
}

/**
 * « Écris le calcul » (maquette priorites-ecrire-un-calcul.html, validée le 2026-11-27). L'élève tape un calcul (cours 6 :
 * une phrase, un programme pas à pas, un problème) ou une expression sans parenthèses (cours 7, avec x). Message gris :
 * rien ne compte, elle corrige. Phrase : une seule réponse jugée. Programme : une réponse par étape, une étape fausse se
 * corrige. Problème : une fois le calcul écrit juste, l'écran « calculer par lignes » s'enchaîne.
 */
export function Ecrire({ q, course, locked, onAnswer, header, footer, texts }: QProps<'ecrire'>) {
  const letter = q.mode === 'reecrire';
  const [k, setK] = useState(0);
  const [typed, setTyped] = useState('');
  const [fb, setFb] = useState<EcrireVerdict | null>(null);
  const [written, setWritten] = useState<string[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [hinted, setHinted] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [phase, setPhase] = useState<'write' | 'calc' | 'end'>('write');
  const calcQ = useMemo(() => (q.compute ? ecrireCalcul(q) : null), [q]);
  const writing = !locked && phase === 'write';

  const finish = (w: string[], calcul: string[], h: boolean) => {
    setPhase('end');
    const a = { written: w, calcul, hinted: h };
    onAnswer(a, checkAnswer(course, q, a));
  };
  const press = (key: string) => {
    if (!writing) return;
    setTyped((t) => t + key);
    if (fb && fb.kind !== 'juste') setFb(null);
  };
  const del = () => writing && setTyped((t) => t.slice(0, -1));
  const submit = () => {
    if (!writing || typed === '') return;
    const v = judgeEcrire(q, k, typed);
    setFb(v);
    if (v.kind === 'gris') return;
    const w = [...written, typed];
    setWritten(w);
    if (v.kind === 'faux') {
      if (q.steps.length === 1) finish(w, [], hinted); // une phrase : une seule réponse jugée
      return;
    }
    setDone((d) => [...d, typed]);
    setTyped('');
    setHintOpen(false);
    if (k + 1 < q.steps.length) {
      setK(k + 1);
      return;
    }
    if (calcQ) setPhase('calc');
    else finish(w, [], hinted);
  };

  if (phase === 'calc' && calcQ) {
    return (
      <Calculer
        q={calcQ}
        course={course}
        locked={locked}
        header={header}
        footer={footer}
        texts={{ consigne: `Ton calcul est juste. Calcule ${q.name ?? 'A'}, ligne par ligne.` }}
        onAnswer={(a) => {
          if (!('calcLines' in a)) return;
          finish(written, a.calcLines, hinted || a.hinted);
        }}
      />
    );
  }

  const label = q.name ? `${q.name} = ` : '';
  const current = q.steps[k];
  return (
    <QFrame header={header} footer={footer} locked={locked} foot={writing ? <ExprKeypad onKey={press} onDelete={del} onSubmit={submit} canSubmit={typed !== ''} letter={letter} /> : undefined}>
      <Prompt
        texts={texts}
        fallback={
          letter
            ? 'Écris la même expression, sans les parenthèses.'
            : q.context.kind === 'programme'
              ? 'Suis le programme une étape à la fois. Écris le calcul, sans le calculer.'
              : q.compute
                ? 'Écris un seul calcul qui donne la réponse. Tu le calculeras ensuite.'
                : 'Traduis la phrase en un seul calcul. Tu n’as pas à le calculer.'
        }
        cls="q-ask"
      />
      <div className="ecrire-ctx" data-copie>
        {q.context.kind === 'phrase' && <p className="t-body1">{q.context.text}</p>}
        {q.context.kind === 'latex' && (
          <span className="t-math-md">
            <MathView latex={q.context.latex} />
          </span>
        )}
        {q.context.kind === 'programme' && (
          <ol className="ecrire-prog">
            {q.steps.map((s, i) => (
              <li key={i} className={i < done.length ? 'is-done' : i === k && writing ? 'is-now' : 'is-later'}>
                {i === k && writing ? <mark>{s.instr}</mark> : s.instr}
                {i < done.length && (
                  <span className="ecrire-prog__res">
                    <MathView latex={calcTextLatex(done[i]!)} />
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
      {fb && <Verdict v={fb} />}
      {writing && current && (
        <>
          <div className="answer answer--text" aria-live="polite" aria-label="Le calcul que tu écris">
            {label && <span className="ecrire-label">{label}</span>}
            {typed === '' ? (
              <span className="answer__placeholder">{letter ? 'Écris l’expression' : 'Tape ton calcul'}</span>
            ) : shown(typed, letter) === '' ? (
              <MathView latex={calcTextLatex(typed)} />
            ) : (
              <span>{shown(typed, letter)}</span>
            )}
            <span className="answer__caret" />
          </div>
          {hintOpen || q.guided === true ? (
            <p className="t-body2 solve-hint">{q.hint}</p>
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
          )}
        </>
      )}
    </QFrame>
  );
}
