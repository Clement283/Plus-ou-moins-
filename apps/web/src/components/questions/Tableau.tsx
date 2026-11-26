import { useState } from 'react';
import {
  type TableErrorId,
  TABLE_ERROR_TEXT,
  checkAnswer,
  expectedGrid,
  factorLatex,
  factorText,
  judgeLabels,
  judgeSigns,
  judgeValues,
  rootText,
  sortedRoots,
  tableauHint,
  wholeLatex,
  wholeText,
} from '@pom/engine';
import { Icon } from '../../ui/Icon';
import { Math as MathView } from '../../ui/Math';
import { type Cursor, type SignRow, SignTable, labelLatex, type CellMark } from '../SignTable';
import { TableKeypad } from '../TableKeypad';
import { Prompt, QFrame, type QProps } from './Frame';

type Step = 1 | 2 | 3;
type Say = { ok: boolean; title: string; message?: string } | null;
const STEP_NAME: Record<Step, string> = { 1: '1 · Les valeurs', 2: '2 · Les lignes', 3: '3 · Les signes' };

/**
 * « Tableau de signes » (maquette equations-tableau-signes.html, validée le 2026-11-26) : l'élève construit le tableau en
 * trois étapes vérifiées l'une après l'autre : les valeurs (1re ligne), les lignes (1re colonne), les signes. `q.ask` dit
 * ce qui est à construire ; le reste est donné. Chaque vérification ratée compte (juste = aucune), la question est
 * répondue quand les signes sont justes.
 */
export function Tableau({ q, course, locked, onAnswer, header, footer, texts }: QProps<'tableau'>) {
  const n = q.factors.length;
  const whole = wholeText(q.op, q.factors);
  const givenLabels = [...q.factors.map(factorText), ...(whole ? [whole] : [])];
  const roots = sortedRoots(q.factors).map(rootText);
  const rowCount = givenLabels.length;
  const cols = 2 * roots.length + 1;
  const first: Step = q.ask.valeurs ? 1 : q.ask.lignes ? 2 : 3;

  const [step, setStep] = useState<Step>(first);
  const [hd, setHd] = useState<string[]>(q.ask.valeurs ? roots.map(() => '') : roots);
  const [labs, setLabs] = useState<string[]>(q.ask.lignes ? givenLabels.map(() => '') : givenLabels);
  const [st, setSt] = useState<string[][]>(() => givenLabels.map(() => Array.from({ length: cols }, () => '')));
  const [cur, setCur] = useState<Cursor>(null);
  const [say, setSay] = useState<Say>(null);
  const [marks, setMarks] = useState<CellMark[][] | null>(null);
  const [errors, setErrors] = useState<TableErrorId[]>([]);
  const [hinted, setHinted] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const finished = locked || sent;
  const editing = !finished;

  const done = (s: Step): boolean => finished || s < step || (s === 1 && !q.ask.valeurs) || (s === 2 && !q.ask.lignes);
  const typedRows = judgeLabels(q.op, q.factors, labs);
  const rowsFactors = typedRows.ok ? typedRows.rowFactors : q.factors;

  const fail = (id: TableErrorId, counts = true) => {
    const t = TABLE_ERROR_TEXT[id];
    setSay({ ok: false, title: t.title, message: t.message });
    if (counts && id !== 'case-vide') setErrors((e) => [...e, id]);
  };
  const advance = (s: Step, title: string) => {
    setSay({ ok: true, title });
    setCur(null);
    setHintOpen(false);
    setStep(s);
  };

  const press = (k: string) => {
    if (!editing || cur === null) return;
    setSay(null);
    setMarks(null);
    if (step === 1 && 'h' in cur) setHd((h) => h.map((t, i) => (i === cur.h ? (k === '⌫' ? t.slice(0, -1) : t + k) : t)));
    if (step === 2 && 'l' in cur) setLabs((l) => l.map((t, i) => (i === cur.l ? (k === '⌫' ? t.slice(0, -1) : t + k) : t)));
    if (step === 3 && 'r' in cur) setSt((s) => s.map((row, r) => row.map((t, c) => (r === cur.r && c === cur.c ? (k === '⌫' ? '' : k) : t))));
  };

  const verify = () => {
    if (!editing) return;
    if (step === 1) {
      const j = judgeValues(q.factors, hd);
      if (!j.ok) return fail(j.errorId);
      return advance(q.ask.lignes ? 2 : 3, 'Les valeurs sont justes.');
    }
    if (step === 2) {
      const j = judgeLabels(q.op, q.factors, labs);
      if (!j.ok) return fail(j.errorId);
      setLabs(givenLabels.map((_, i) => (i < n ? factorText(j.rowFactors[i]!) : givenLabels[i]!)));
      return advance(3, 'Les lignes sont justes.');
    }
    const j = judgeSigns(q.op, rowsFactors, st);
    setMarks(j.cells);
    if (!j.complete && j.first === null) return fail('case-vide');
    if (j.first) return fail(j.first.errorId);
    setSent(true);
    setSay(null);
    const a = { tableau: errors, hinted };
    onAnswer(a, checkAnswer(course, q, a));
  };

  const grid = expectedGrid(q.op, rowsFactors);
  const latexRows = [...rowsFactors.map(factorLatex), ...(whole ? [wholeLatex(q.op, rowsFactors)] : [])];
  const rows: SignRow[] = givenLabels.map((_, r) => {
    const text = labs[r] ?? '';
    return {
      label: text === '' ? '' : <MathView latex={step >= 3 || done(2) ? (latexRows[r] ?? labelLatex(text)) : labelLatex(text)} />,
      labelEditable: editing && step === 2 && q.ask.lignes,
      labelEmpty: text === '',
      cells: step === 3 || finished ? (finished ? grid[r]!.map(String) : st[r]!) : st[r]!.map(() => ''),
      cellsEditable: editing && step === 3,
      ...(marks ? { marks: marks[r]! } : {}),
    };
  });

  const hintText = tableauHint(q, step);
  const showRows = step >= 2 || !q.ask.lignes || finished;

  return (
    <QFrame
      header={header}
      footer={footer}
      locked={locked}
      foot={editing ? <TableKeypad mode={step === 1 ? 'valeurs' : step === 2 ? 'lignes' : 'signes'} bar={q.op === 'quotient'} onKey={press} onSubmit={verify} canSubmit={cur !== null || step === 3} /> : undefined}
    >
      <Prompt texts={texts} fallback="Construis le tableau de signes." cls="q-ask" />
      <div className="calc-head" data-copie>
        <span className="t-math-md">
          <MathView latex={q.promptLatex} />
        </span>
      </div>
      <div className="sign-steps" role="list">
        {([1, 2, 3] as Step[]).map((s) => (
          <span key={s} role="listitem" className={`sign-steps__pill${s === step && !finished ? ' is-on' : done(s) ? ' is-done' : ''}`}>
            {STEP_NAME[s]}
          </span>
        ))}
      </div>
      <SignTable
        values={hd}
        headerEditable={editing && step === 1 && q.ask.valeurs}
        headerEmpty={hd.map((t) => t === '')}
        rows={showRows ? rows : []}
        cursor={cur}
        onHeader={(i) => {
          setCur({ h: i });
          setSay(null);
        }}
        onLabel={(r) => {
          setCur({ l: r });
          setSay(null);
        }}
        onCell={(r, c) => {
          setCur({ r, c });
          setSay(null);
          setMarks(null);
        }}
      />
      {editing && (
        <p className="t-body2 interval-hint">
          {step === 1 ? 'Touche une valeur, puis écris-la.' : step === 2 ? 'Touche une ligne, puis écris le facteur (la dernière : l’expression en entier).' : 'Touche une case, puis un signe.'}
        </p>
      )}
      {say && (
        <div className={`alert alert--${say.ok ? 'success' : 'error'}`} role="status">
          <Icon name={say.ok ? 'check-circle' : 'x-circle'} />
          <div className="alert__title">{say.title}</div>
          {say.message && <div>{say.message}</div>}
        </div>
      )}
      {editing &&
        (hintOpen || q.guided === true ? (
          <p className="t-body2 solve-hint">{hintText}</p>
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
    </QFrame>
  );
}
