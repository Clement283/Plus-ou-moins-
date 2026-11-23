import { useEffect, useRef, useState } from 'react';
import { checkAnswer, checkParts } from '@pom/engine';
import { Math } from '../../ui/Math';
import { Prompt, QFrame, type QProps } from './Frame';

/** La paire fausse reste rouge ce temps-là (ms), puis redevient touchable. */
const FLASH_MS = 800;

interface State {
  l: number | null;
  r: number | null;
  /** Toutes les paires essayées, dans l'ordre, les fausses comprises. */
  pairs: [number, number][];
  doneL: number[];
  doneR: number[];
  flash: [number, number] | null;
}
const START: State = { l: null, r: null, pairs: [], doneL: [], doneR: [], flash: null };

/** Relier les paires : toucher un calcul puis son résultat. Une paire juste se grise, une fausse clignote et reste à relier. */
export function Paires({ q, course, locked, onAnswer, header, footer, texts }: QProps<'paires'>) {
  const [s, setS] = useState<State>(START);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const touch = (side: 'l' | 'r', i: number) => {
    if (locked) return;
    clearTimeout(timer.current);
    const next: State = { ...s, flash: null, [side]: s[side] === i ? null : i };
    if (next.l === null || next.r === null) return setS(next);
    const pair: [number, number] = [next.l, next.r];
    const pairs = [...s.pairs, pair];
    const ok = checkParts(course, q, { pairs: [pair] })[0]!.correct;
    if (!ok) {
      setS({ ...next, l: null, r: null, pairs, flash: pair });
      timer.current = setTimeout(() => setS((c) => ({ ...c, flash: null })), FLASH_MS);
      return;
    }
    const done = { ...next, l: null, r: null, pairs, doneL: [...s.doneL, pair[0]], doneR: [...s.doneR, pair[1]] };
    setS(done);
    if (done.doneL.length === q.exs.length) {
      const a = { pairs };
      onAnswer(a, checkAnswer(course, q, a));
    }
  };

  const cls = (side: 'l' | 'r', i: number): string => {
    const done = (side === 'l' ? s.doneL : s.doneR).includes(i);
    if (done) return ' is-done';
    if (s.flash && s.flash[side === 'l' ? 0 : 1] === i) return ' is-wrong';
    return s[side] === i ? ' is-selected' : '';
  };
  const col = (side: 'l' | 'r', items: string[]) => (
    <div className="pairs__col">
      {items.map((latex, i) => (
        <button key={i} className={`tag tag--block${cls(side, i)}`} type="button" disabled={locked || (side === 'l' ? s.doneL : s.doneR).includes(i)} onClick={() => touch(side, i)}>
          <Math latex={latex} />
        </button>
      ))}
    </div>
  );
  return (
    <QFrame header={header} footer={footer} locked={locked}>
      <div className="stack stack--top">
        <Prompt texts={texts} fallback="Relie chaque calcul à son résultat." cls="t-body1" />
        <div className="pairs" data-copie>
          {col('l', q.left)}
          {col('r', q.right.map((r) => r.latex))}
        </div>
      </div>
    </QFrame>
  );
}
