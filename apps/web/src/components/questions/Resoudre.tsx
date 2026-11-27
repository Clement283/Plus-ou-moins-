import { useState } from 'react';
import {
  type Equation,
  type LineResult,
  checkAnswer,
  courseMethod,
  equationLatex,
  hintFor,
  judgeTypedLine,
  memberLatex,
  parseEquation,
  relationLatex,
} from '@pom/engine';
import { Math as MathView } from '../../ui/Math';
import { Icon } from '../../ui/Icon';
import { Bold } from '../Bold';
import { Prompt, QFrame, type QProps } from './Frame';

const MINUS = '−';

/** Une ligne posée sur la feuille, et l'opération faite pour y arriver (sous la ligne d'avant). */
interface SheetLine {
  eq: Equation;
  /** Opération écrite sous chaque membre de la ligne d'avant (« −x +3 », « ÷ 3 ») ; null : regroupement ou plusieurs étapes. */
  opBefore: string | null;
}

/** Une ligne de la feuille : le signe du milieu dans une colonne fixe, comme dans un cahier. */
function Line({ eq, state }: { eq: Equation; state: 'old' | 'cur' | 'final' | 'plain' }) {
  return (
    <div className={`solve-line is-${state}`}>
      <span className="solve-line__l">
        <MathView latex={memberLatex(eq.left)} />
      </span>
      <span className="solve-line__s">
        <MathView latex={relationLatex(eq.rel)} />
      </span>
      <span className="solve-line__r">
        <MathView latex={memberLatex(eq.right)} />
      </span>
    </div>
  );
}

function Ops({ latex }: { latex: string }) {
  return (
    <div className="solve-ops" aria-label={`Des deux côtés : ${latex}`}>
      <span className="solve-ops__l">
        <span className="op-pill">
          <MathView latex={latex} />
        </span>
      </span>
      <span />
      <span className="solve-ops__r">
        <span className="op-pill">
          <MathView latex={latex} />
        </span>
      </span>
    </div>
  );
}

/** Ce qu'elle tape, lisible : la ligne mise en forme dès qu'elle se lit, sinon telle quelle (− et ÷ du clavier). */
function typedLatex(typed: string): string | null {
  const p = parseEquation(typed);
  return p.ok ? equationLatex(p.eq) : null;
}

const KEYS_EQ = ['7', '8', '9', '÷', '4', '5', '6', 'x', '1', '2', '3', MINUS, '0', '+'];

/** Clavier d'une ligne d'équation : chiffres, x, + − ÷ (fraction) et le signe du milieu. Le clavier du téléphone ne s'ouvre jamais. */
function LineKeypad({ inequality, onKey, onDelete, onSubmit, canSubmit }: { inequality: boolean; onKey: (k: string) => void; onDelete: () => void; onSubmit: () => void; canSubmit: boolean }) {
  const rel = inequality ? ['<', '>', '⩽', '⩾'] : ['='];
  const sign = (k: string) => ['÷', MINUS, '+', '=', '<', '>', '⩽', '⩾'].includes(k);
  return (
    <div className="keypad keypad--line" aria-label="Clavier de la ligne">
      {KEYS_EQ.map((k) => (
        <button key={k} className={`key${sign(k) ? ' key--sign' : ''}${k === 'x' ? ' key--x' : ''}`} type="button" aria-label={k === '÷' ? 'diviser (fraction)' : undefined} onClick={() => onKey(k)}>
          {k}
        </button>
      ))}
      {rel.map((k) => (
        <button key={k} className={`key key--sign${rel.length === 1 ? ' key--wide' : ''}`} type="button" onClick={() => onKey(k)}>
          {k}
        </button>
      ))}
      <button className="key key--fn key--wide" type="button" aria-label="effacer" onClick={onDelete}>
        <Icon name="backspace" />
      </button>
      {/* inéquation : la rangée ⩽ ⩾ effacer est pleine, « Valider » prend toute la largeur en dessous */}
      <button className={`key key--submit ${inequality ? 'key--full' : 'key--wide'}`} type="button" disabled={!canSubmit} onClick={() => canSubmit && onSubmit()}>
        Valider
      </button>
    </div>
  );
}

function LineFeedback({ r }: { r: LineResult }) {
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
 * « À toi de résoudre » (maquette equations-resolution-ligne.html, écran 7, validée le 2026-11-26) : elle écrit chaque ligne
 * en entier, avec sa méthode. Chaque ligne est jugée à « Valider » (juste : elle s'ajoute, avec l'opération faite sous la
 * ligne d'avant ; fausse : le message de l'erreur, elle corrige). La question est répondue quand x est tout seul : juste si
 * aucune ligne n'a été fausse en route ; l'indice la marque « avec aide ».
 */
export function Resoudre({ q, course, locked, onAnswer, header, footer, texts }: QProps<'resoudre'>) {
  const [lines, setLines] = useState<SheetLine[]>([{ eq: q.start, opBefore: null }]);
  const [typed, setTyped] = useState('');
  const [fb, setFb] = useState<LineResult | null>(null);
  const [sent, setSent] = useState<string[]>([]);
  const [hinted, setHinted] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [showCourse, setShowCourse] = useState(false);
  const cur = lines[lines.length - 1]!.eq;
  const inequality = q.start.rel !== '=';
  const finished = locked || (fb?.kind === 'juste' && fb.final);

  const press = (k: string) => {
    if (finished) return;
    setTyped((t) => t + k);
    if (fb && fb.kind !== 'juste') setFb(null);
  };
  const del = () => !finished && setTyped((t) => t.slice(0, -1));
  const submit = () => {
    if (finished || typed === '') return;
    const r = judgeTypedLine(cur, typed);
    setFb(r);
    if (r.kind === 'illisible' || r.kind === 'recopiee') return;
    const all = [...sent, typed];
    setSent(all);
    if (r.kind === 'fausse') return;
    setLines((ls) => [...ls, { eq: r.eq, opBefore: r.opLatex }]);
    setTyped('');
    setHintOpen(false);
    if (r.final) {
      const a = { lines: all, hinted };
      onAnswer(a, checkAnswer(course, q, a));
    }
  };
  const openHint = () => {
    setHinted(true);
    setHintOpen(true);
  };
  // exemple guidé : l'aide est affichée d'office, sans bouton ni « avec aide »
  const hint = (hintOpen || q.guided === true) && !finished ? hintFor(cur) : null;
  const method = finished ? courseMethod(q.start) : [];
  const sameAsCourse =
    method.length === lines.length - 1 && method.every((m, i) => m.latex === equationLatex(lines[i + 1]!.eq) && (m.opLatex ?? null) === lines[i + 1]!.opBefore);
  const shown = typedLatex(typed);

  return (
    <QFrame
      header={header}
      footer={footer}
      locked={locked}
      foot={finished ? undefined : <LineKeypad inequality={inequality} onKey={press} onDelete={del} onSubmit={submit} canSubmit={typed !== ''} />}
    >
      <Prompt texts={texts} fallback={`Résous ${inequality ? 'cette inéquation' : 'cette équation'} : écris chaque ligne, jusqu'à avoir x tout seul.`} cls="q-ask" />
      <div className="solve-sheet" data-copie>
        {lines.map((l, i) => (
          <div key={i} className="solve-step">
            {l.opBefore && <Ops latex={l.opBefore} />}
            <Line eq={l.eq} state={i < lines.length - 1 ? 'old' : finished && i > 0 ? 'final' : 'cur'} />
          </div>
        ))}
      </div>
      {fb && !(finished && fb.kind === 'juste') && <LineFeedback r={fb} />}
      {!finished && (
        <>
          <div className="answer answer--text" aria-live="polite" aria-label="La ligne que tu écris">
            {typed === '' ? <span className="answer__placeholder">Écris la ligne suivante</span> : shown ? <MathView latex={shown} /> : <span>{typed}</span>}
            <span className="answer__caret" />
          </div>
          {hint ? (
            <p className="t-body2 solve-hint">
              {hint.text}
              {hint.opLatex && (
                <>
                  {' '}
                  <span className="op-pill">
                    <MathView latex={hint.opLatex} />
                  </span>
                </>
              )}
            </p>
          ) : (
            <button className="btn btn--text" type="button" onClick={openHint}>
              Un indice
            </button>
          )}
        </>
      )}
      {finished && !sameAsCourse && (
        <div className="stack">
          <p className="t-body2">Ta méthode est juste. Tu peux la comparer avec celle du cours.</p>
          {showCourse ? (
            <div className="solve-sheet solve-sheet--course" data-copie>
              <Line eq={q.start} state="old" />
              {method.map((m, i) => (
                <div key={i} className="solve-step">
                  {m.opLatex && <Ops latex={m.opLatex} />}
                  <Line eq={m.eq} state={i === method.length - 1 ? 'final' : 'plain'} />
                </div>
              ))}
            </div>
          ) : (
            <button className="btn btn--outlined btn--block" type="button" onClick={() => setShowCourse(true)}>
              Voir la méthode du cours
            </button>
          )}
        </div>
      )}
    </QFrame>
  );
}
