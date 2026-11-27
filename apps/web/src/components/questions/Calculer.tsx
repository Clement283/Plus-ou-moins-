import { useState } from 'react';
import {
  type CalcLineResult,
  calcHint,
  calcTextLatex,
  checkAnswer,
  judgeTypedCalcLine,
  parseCalc,
  valueText,
} from '@pom/engine';
import { Math as MathView } from '../../ui/Math';
import { Icon } from '../../ui/Icon';
import { Bold } from '../Bold';
import { ExprKeypad } from '../ExprKeypad';
import { Prompt, QFrame, type QProps } from './Frame';

/** Un calcul tapé, mis en forme dès qu'il se lit ; sinon tel quel (une parenthèse en cours de frappe, par exemple). */
const typedLatex = (typed: string): string => (parseCalc(typed).ok ? calcTextLatex(typed) : typed.replace(/\s+/g, ''));

function LineFeedback({ r }: { r: CalcLineResult }) {
  const tone = r.kind === 'juste' ? 'success' : r.kind === 'fausse' ? 'error' : 'info';
  const icon = r.kind === 'juste' ? 'check-circle' : r.kind === 'fausse' ? 'x-circle' : 'info';
  return (
    <div className={`alert alert--${tone}`} role="status">
      <Icon name={icon} />
      <div className="alert__title">{r.title}</div>
      {r.message && (
        <div>
          <Bold text={r.message} />
        </div>
      )}
    </div>
  );
}

/**
 * « Calculer par lignes » (maquette equations-resolution-ligne.html, état 8, validée le 2026-11-26) : elle remplace x puis
 * calcule étape par étape, avec sa méthode, puis compare les deux membres (« est-ce une solution ? »). Chaque ligne est jugée
 * à « Valider » (juste : elle s'ajoute ; fausse : le message de l'erreur, elle corrige). La question est répondue quand le
 * 1er verdict est donné juste : juste si aucune ligne n'a été fausse en route et si le 1er verdict était le bon.
 */
export function Calculer({ q, course, locked, onAnswer, header, footer, texts }: QProps<'calculer'>) {
  const [lines, setLines] = useState<string[]>([]);
  const [typed, setTyped] = useState('');
  const [fb, setFb] = useState<CalcLineResult | null>(null);
  const [sent, setSent] = useState<string[]>([]);
  const [hinted, setHinted] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [picks, setPicks] = useState<boolean[]>([]);
  const noX = q.xValue === null;
  const last = lines.length ? lines[lines.length - 1]! : null;
  const lastParse = last === null ? null : parseCalc(last);
  const reachedNumber = lastParse !== null && lastParse.ok && lastParse.ops === 0;
  const writing = !locked && !reachedNumber;
  const verdict = !writing;
  const finished = locked || done;

  const press = (k: string) => {
    if (!writing) return;
    setTyped((t) => t + k);
    if (fb && fb.kind !== 'juste') setFb(null);
  };
  const del = () => writing && setTyped((t) => t.slice(0, -1));
  const submit = () => {
    if (!writing || typed === '') return;
    const r = judgeTypedCalcLine(q, last, typed);
    setFb(r);
    if (r.kind !== 'juste' && r.kind !== 'fausse') return;
    setSent((s) => [...s, typed]);
    if (r.kind === 'fausse') return;
    setLines((ls) => [...ls, typed]);
    setTyped('');
    setHintOpen(false);
    if (r.final) setFb(null);
    if (r.final && noX) {
      // calcul seul : pas de verdict, la question est répondue dès qu'il reste un seul nombre
      setDone(true);
      const a = { calcLines: [...sent, typed], firstPick: true, hinted };
      onAnswer(a, checkAnswer(course, q, a));
    }
  };
  const pick = (yes: boolean) => {
    if (finished || !verdict) return;
    const all = [...picks, yes];
    setPicks(all);
    if (yes === q.isSolution) {
      setDone(true);
      const a = { calcLines: sent, firstPick: all[0]!, hinted };
      onAnswer(a, checkAnswer(course, q, a));
    }
  };
  const openHint = () => {
    setHinted(true);
    setHintOpen(true);
  };

  const mark = (yes: boolean): string => {
    if (picks.length === 0 && !locked) return '';
    if (yes === q.isSolution && (done || locked)) return ' is-correct';
    return picks.includes(yes) && yes !== q.isSolution ? ' is-wrong' : '';
  };

  return (
    <QFrame
      header={header}
      footer={footer}
      locked={locked}
      foot={writing ? <ExprKeypad onKey={press} onDelete={del} onSubmit={submit} canSubmit={typed !== ''} brackets={q.brackets === true} /> : undefined}
    >
      <Prompt texts={texts} fallback="Calcule le membre de gauche, ligne par ligne." cls="q-ask" />
      <div className="calc-head" data-copie>
        <span className="t-math-md">
          <MathView latex={q.eqLatex} />
        </span>
        {!noX && (
          <span className="t-body2">
            pour <MathView latex={`x = ${q.xValue}`} />
          </span>
        )}
      </div>
      <div className="solve-sheet" data-copie>
        {lines.length === 0 && <p className="t-body2 calc-empty">Tes lignes s’écrivent ici.</p>}
        {lines.map((l, i) => (
          <div key={i} className="solve-step">
            <div className={`solve-line calc-line is-${i < lines.length - 1 ? 'old' : verdict ? 'final' : 'cur'}`}>
              <MathView latex={calcTextLatex(l)} />
            </div>
          </div>
        ))}
      </div>
      {fb && !(verdict && fb.kind === 'juste') && <LineFeedback r={fb} />}
      {writing && (
        <>
          <div className="answer answer--text" aria-live="polite" aria-label="La ligne que tu écris">
            {typed === '' ? (
              <span className="answer__placeholder">{lines.length || noX ? 'Écris la ligne suivante' : 'Remplace x, écris la 1re ligne'}</span>
            ) : (
              <MathView latex={typedLatex(typed)} />
            )}
            <span className="answer__caret" />
          </div>
          {hintOpen || q.guided === true ? (
            <p className="t-body2 solve-hint">{calcHint(q, last)}</p>
          ) : (
            <button className="btn btn--text" type="button" onClick={openHint}>
              Un indice
            </button>
          )}
        </>
      )}
      {verdict && !noX && (
        <div className="stack">
          <p className="q-ask">
            Le membre de gauche vaut <b>{valueText(q.value)}</b>, celui de droite <b>{valueText(q.other)}</b>.{' '}
            {(q.xValue as number) < 0 ? `−${-(q.xValue as number)}` : q.xValue} est-il solution ?
          </p>
          <div className="choice-grid" data-copie>
            {[true, false].map((yes) => (
              <button key={String(yes)} className={`choice${mark(yes)}`} type="button" disabled={finished} onClick={() => pick(yes)}>
                {yes ? 'Oui' : 'Non'}
              </button>
            ))}
          </div>
          {!finished && picks.length > 0 && (
            <div className="alert alert--error" role="status">
              <Icon name="x-circle" />
              <div className="alert__title">Compare les deux membres.</div>
              <div>
                Ils sont {q.isSolution ? 'égaux' : 'différents'} : {valueText(q.value)} {q.isSolution ? '=' : '≠'} {valueText(q.other)}.
              </div>
            </div>
          )}
        </div>
      )}
    </QFrame>
  );
}
