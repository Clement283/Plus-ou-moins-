import { useState, type ReactNode } from 'react';
import {
  type Interval,
  type IntervalInput,
  type Relation,
  checkAnswer,
  emptyInterval,
  expectedGrid,
  factorLatex,
  solutionColumns,
  wholeLatex,
  intervalleHint,
  parseBound,
  readInterval,
  rootText,
  sortedRoots,
  symbolText,
} from '@pom/engine';
import { Math as MathView } from '../../ui/Math';
import { IntervalKeypad } from '../IntervalKeypad';
import { IntervalLine } from '../IntervalLine';
import { SymbolPicker } from '../SymbolPicker';
import { SignTable, labelLatex } from '../SignTable';
import { Prompt, QFrame, type QProps } from './Frame';

type Field = 'lo' | 'hi';
type Part = 0 | 1;
const same = (a: { n: number; d: number } | null, b: { n: number; d: number } | null): boolean => (a === null || b === null ? a === b : a.n === b.n && a.d === b.d);

/**
 * « Écrire un intervalle » (maquette equations-intervalles.html, validée le 2026-11-26) : S = [ ▢ , ▢ ] avec deux crochets
 * qu'on retourne d'un appui, deux bornes au clavier (−∞ et +∞ ont leur touche) et la droite qui se colorie pendant la
 * frappe, sans dire si c'est juste. Cours 8 (`q.flip`) : on choisit d'abord le symbole après la division par un négatif.
 * Une seule réponse, jugée à « Valider » : cases fausses en rouge une fois la question verrouillée.
 */
export function Intervalle({ q, course, locked, onAnswer, header, footer, texts }: QProps<'intervalle'>) {
  const [parts, setParts] = useState<IntervalInput[]>(() => [emptyInterval()]);
  const [activePart, setActivePart] = useState<Part>(0);
  const [active, setActive] = useState<Field>('lo');
  const [symbol, setSymbol] = useState<Relation | null>(null);
  const [hinted, setHinted] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const needSymbol = q.flip !== undefined && symbol === null;
  const input = parts[0]!;
  const input2 = parts[1] ?? null;
  const read = readInterval(input);
  const read2 = input2 ? readInterval(input2) : null;
  const allReadable = read.ok && (read2 === null || read2.ok);
  const finished = locked || sent;
  const editing = !finished && !needSymbol;

  const edit = (f: Field, fn: (t: string) => string) => setParts((ps) => ps.map((p, k) => (k === activePart ? { ...p, [f]: fn(p[f]) } : p)));
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
  const flip = (part: Part, side: 'left' | 'right') => editing && setParts((ps) => ps.map((p, k) => (k === part ? ({ ...p, [side]: p[side] === '[' ? ']' : '[' } as IntervalInput) : p)));
  const submit = () => {
    if (!editing || !allReadable) return;
    setSent(true);
    const a = { interval: input, interval2: input2, symbol, hinted };
    onAnswer(a, checkAnswer(course, q, a));
  };
  const pickSymbol = (s: Relation) => {
    if (symbol === null) setSymbol(s);
  };

  // Marques sur les cases une fois répondu : seule la case fautive passe en rouge (le morceau de rang `part`).
  const marksOf = (part: Part): Record<'left' | 'lo' | 'hi' | 'right', string> => {
    const none = { left: '', lo: '', hi: '', right: '' };
    const rd = part === 0 ? read : read2;
    const inp = parts[part];
    const e: Interval | undefined = part === 0 ? q.expected : q.expected2;
    if (!finished || !rd || !rd.ok || !inp || !e) return none;
    const g = rd.interval;
    const a = parseBound(inp.lo);
    const b = parseBound(inp.hi);
    const okLo = same(g.lo, e.lo) && (a.kind === 'inf') === (e.lo === null);
    const okHi = same(g.hi, e.hi) && (b.kind === 'inf') === (e.hi === null);
    const m = (ok: boolean): string => (ok ? ' is-correct' : ' is-wrong');
    return {
      lo: m(okLo),
      hi: m(okHi),
      left: m(e.lo === null ? inp.left === ']' : inp.left === (e.loClosed ? '[' : ']')),
      right: m(e.hi === null ? inp.right === '[' : inp.right === (e.hiClosed ? ']' : '[')),
    };
  };

  const slot = (part: Part, f: Field, cls: string) => (
    <button
      className={`sol-slot${active === f && activePart === part && editing ? ' is-active' : ''}${cls}`}
      type="button"
      disabled={!editing}
      aria-label={`${f === 'lo' ? 'Borne de gauche' : 'Borne de droite'}${part === 1 ? ' du 2e intervalle' : ''}`}
      onClick={() => {
        setActivePart(part);
        setActive(f);
      }}
    >
      {parts[part]![f] === '' ? '\u00A0' : parts[part]![f]}
    </button>
  );
  const row = (part: Part) => {
    const inp = parts[part]!;
    const mk = marksOf(part);
    const sfx = part === 1 ? ' du 2e intervalle' : '';
    return (
      <div className="sol-row" data-copie key={part}>
        <span className="sol-row__lbl">{part === 0 ? 'S =' : '∪'}</span>
        <button className={`sol-slot sol-slot--bracket${mk.left}`} type="button" disabled={!editing} aria-label={`Crochet de gauche${sfx}`} onClick={() => flip(part, 'left')}>
          {inp.left}
        </button>
        {slot(part, 'lo', mk.lo)}
        <span>,</span>
        {slot(part, 'hi', mk.hi)}
        <button className={`sol-slot sol-slot--bracket${mk.right}`} type="button" disabled={!editing} aria-label={`Crochet de droite${sfx}`} onClick={() => flip(part, 'right')}>
          {inp.right}
        </button>
      </div>
    );
  };

  // Le tableau à lire (cours 10 et 11) : colonnes qui conviennent surlignées.
  const table = q.table;
  const tableView = ((): ReactNode => {
    if (!table) return null;
    const grid = expectedGrid(table.op, table.factors);
    const ghost = solutionColumns(grid[grid.length - 1]!, table.rel);
    const labels = [...table.factors.map(factorLatex), ...(table.op === 'seul' ? [] : [wholeLatex(table.op, table.factors)])];
    return (
      <SignTable
        values={sortedRoots(table.factors).map(rootText)}
        ghost={ghost}
        rows={grid.map((cells, r) => ({ label: <MathView latex={labelLatex(labels[r]!)} />, cells: cells.map(String) }))}
        caption="Tableau de signes à lire"
      />
    );
  })();

  return (
    <QFrame
      header={header}
      footer={footer}
      locked={locked}
      foot={editing ? <IntervalKeypad onKey={press} onDelete={del} onSubmit={submit} canSubmit={allReadable} /> : undefined}
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
          {tableView}
          <IntervalLine interval={read.ok ? read.interval : null} interval2={read2 && read2.ok ? read2.interval : null} />
          {parts.map((_, k) => row(k as Part))}
          {editing && q.table && parts.length === 1 && (
            <button
              className="btn btn--text"
              type="button"
              onClick={() => {
                setParts((ps) => [...ps, emptyInterval()]);
                setActivePart(1);
                setActive('lo');
              }}
            >
              ∪ Relier un autre intervalle
            </button>
          )}
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
