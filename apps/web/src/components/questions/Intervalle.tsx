import { useState } from 'react';
import {
  type IntervalInput,
  type Relation,
  checkAnswer,
  emptyInterval,
  intervalleHint,
  parseBound,
  readInterval,
  symbolText,
} from '@pom/engine';
import { Math as MathView } from '../../ui/Math';
import { IntervalKeypad } from '../IntervalKeypad';
import { IntervalLine } from '../IntervalLine';
import { SymbolPicker } from '../SymbolPicker';
import { Prompt, QFrame, type QProps } from './Frame';

type Field = 'lo' | 'hi';
const same = (a: { n: number; d: number } | null, b: { n: number; d: number } | null): boolean => (a === null || b === null ? a === b : a.n === b.n && a.d === b.d);

/**
 * « Écrire un intervalle » (maquette equations-intervalles.html, validée le 2026-11-26) : S = [ ▢ , ▢ ] avec deux crochets
 * qu'on retourne d'un appui, deux bornes au clavier (−∞ et +∞ ont leur touche) et la droite qui se colorie pendant la
 * frappe, sans dire si c'est juste. Cours 8 (`q.flip`) : on choisit d'abord le symbole après la division par un négatif.
 * Une seule réponse, jugée à « Valider » : cases fausses en rouge une fois la question verrouillée.
 */
export function Intervalle({ q, course, locked, onAnswer, header, footer, texts }: QProps<'intervalle'>) {
  const [input, setInput] = useState<IntervalInput>(emptyInterval);
  const [active, setActive] = useState<Field>('lo');
  const [symbol, setSymbol] = useState<Relation | null>(null);
  const [hinted, setHinted] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const needSymbol = q.flip !== undefined && symbol === null;
  const read = readInterval(input);
  const finished = locked || sent;
  const editing = !finished && !needSymbol;

  const edit = (f: Field, fn: (t: string) => string) => setInput((i) => ({ ...i, [f]: fn(i[f]) }));
  const press = (k: string) => {
    if (!editing) return;
    if (k === '−∞' || k === '+∞') {
      edit(active, () => k);
      if (active === 'lo') setActive('hi');
      return;
    }
    edit(active, (t) => {
      if (t === '−∞' || t === '+∞') return k === '−' ? '−' : k;
      if (k === '−') return t === '' ? '−' : t;
      if (k === '/') return /^−?\d+$/.test(t) ? `${t}/` : t;
      return t + k;
    });
  };
  const del = () => editing && edit(active, (t) => (t === '−∞' || t === '+∞' ? '' : t.slice(0, -1)));
  const flip = (side: 'left' | 'right') => editing && setInput((i) => ({ ...i, [side]: i[side] === '[' ? ']' : '[' }) as IntervalInput);
  const submit = () => {
    if (!editing || !read.ok) return;
    setSent(true);
    const a = { interval: input, symbol, hinted };
    onAnswer(a, checkAnswer(course, q, a));
  };
  const pickSymbol = (s: Relation) => {
    if (symbol === null) setSymbol(s);
  };

  // Marques sur les cases une fois répondu : seule la case fautive passe en rouge.
  const marks = ((): Record<'left' | 'lo' | 'hi' | 'right', string> => {
    const none = { left: '', lo: '', hi: '', right: '' };
    if (!finished || !read.ok) return none;
    const g = read.interval;
    const e = q.expected;
    const a = parseBound(input.lo);
    const b = parseBound(input.hi);
    const okLo = same(g.lo, e.lo) && (a.kind === 'inf') === (e.lo === null);
    const okHi = same(g.hi, e.hi) && (b.kind === 'inf') === (e.hi === null);
    const m = (ok: boolean): string => (ok ? ' is-correct' : ' is-wrong');
    return {
      lo: m(okLo),
      hi: m(okHi),
      left: m(e.lo === null ? input.left === ']' : input.left === (e.loClosed ? '[' : ']')),
      right: m(e.hi === null ? input.right === '[' : input.right === (e.hiClosed ? ']' : '[')),
    };
  })();

  const slot = (f: Field, cls: string) => (
    <button
      className={`sol-slot${active === f && editing ? ' is-active' : ''}${cls}`}
      type="button"
      disabled={!editing}
      aria-label={f === 'lo' ? 'Borne de gauche' : 'Borne de droite'}
      onClick={() => setActive(f)}
    >
      {input[f] === '' ? ' ' : input[f]}
    </button>
  );

  return (
    <QFrame
      header={header}
      footer={footer}
      locked={locked}
      foot={editing ? <IntervalKeypad onKey={press} onDelete={del} onSubmit={submit} canSubmit={read.ok} /> : undefined}
    >
      <Prompt texts={texts} fallback="Écris l’ensemble des solutions en intervalle." cls="q-ask" />
      <div className="calc-head" data-copie>
        <span className="t-math-md">
          <MathView latex={q.promptLatex} />
        </span>
      </div>
      {q.flip && (
        <div className="stack">
          <p className="q-ask">
            On divise par <MathView latex={`${q.flip.by}`} /> : {symbolText(q.flip.given)} devient ?
          </p>
          <SymbolPicker picked={symbol} answer={symbol === null ? null : q.flip.answer} disabled={symbol !== null || finished} onPick={pickSymbol} />
          {symbol !== null && (
            <div className="calc-head" data-copie>
              <span className="t-math-md">
                <MathView latex={q.resultLatex} />
              </span>
            </div>
          )}
        </div>
      )}
      {!needSymbol && (
        <>
          <IntervalLine interval={read.ok ? read.interval : null} />
          <div className="sol-row" data-copie>
            <span className="sol-row__lbl">S =</span>
            <button className={`sol-slot sol-slot--bracket${marks.left}`} type="button" disabled={!editing} aria-label="Crochet de gauche" onClick={() => flip('left')}>
              {input.left}
            </button>
            {slot('lo', marks.lo)}
            <span>,</span>
            {slot('hi', marks.hi)}
            <button className={`sol-slot sol-slot--bracket${marks.right}`} type="button" disabled={!editing} aria-label="Crochet de droite" onClick={() => flip('right')}>
              {input.right}
            </button>
          </div>
          {editing && <p className="t-body2 interval-hint">Touche un crochet pour le retourner.</p>}
          {editing &&
            (hintOpen || q.guided === true ? (
              <p className="t-body2 solve-hint">{intervalleHint(q)}</p>
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
        </>
      )}
    </QFrame>
  );
}
