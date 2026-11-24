import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { checkAnswer, checkParts, toLatex, type Exercise } from '@pom/engine';
import { Math as MathView } from '../../ui/Math';
import { calcLatex } from './calc';
import { LessonHeading, QFrame, ValidateFoot, type QProps } from './Frame';

export const CLASSER_ASK = "Fais glisser chaque calcul du bas de l'écran vers la bonne case. Tu peux aussi toucher un calcul, puis toucher la case.";
const DRAG_PX = 8;

/** Une consigne de deux phrases s'affiche en deux lignes : la 2e en petit. */
function Ask({ text }: { text: string }) {
  const m = /^(.+?[.!?])\s+(.+)$/s.exec(text);
  return m ? (
    <div className="class-note">
      <p className="t-body1">{m[1]}</p>
      <p className="t-body2">{m[2]}</p>
    </div>
  ) : (
    <p className="t-body1">{text}</p>
  );
}

/** Pendant un glisser : le calcul levé suit le doigt, la case dessous s'allume. */
interface Drag {
  i: number;
  x: number;
  y: number;
  moved: boolean;
  startX: number;
  startY: number;
  over: string | null;
}

const binAt = (x: number, y: number, target?: EventTarget | null): string | null => {
  const el = typeof document.elementFromPoint === 'function' ? document.elementFromPoint(x, y) : null;
  const hit = el?.closest<HTMLElement>('[data-bin]') ?? (target instanceof Element ? target.closest<HTMLElement>('[data-bin]') : null);
  return hit?.dataset.bin ?? null;
};

/**
 * Classer : les cases en haut, les calculs à ranger en bas. On les fait glisser (événements pointeur, `touch-action: none`)
 * ou on touche un calcul puis la case. Le calcul qu'on touche dans une case retourne en bas ; seule la première case où il
 * a été rangé compte. « Valider » s'active quand tout est rangé. Après « Valider », sous chaque calcul mal écrit du cours 0 :
 * sa correction et le numéro de la règle.
 */
export function Classer({ q, course, locked, onAnswer, header, footer, texts }: QProps<'classer'>) {
  const n = q.exs.length;
  const [sel, setSel] = useState<number | null>(null);
  const [first, setFirst] = useState<(string | null)[]>(() => Array(n).fill(null));
  const [now, setNow] = useState<(string | null)[]>(() => Array(n).fill(null));
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const suppressClick = useRef(false);

  const place = (i: number, box: string) => {
    setFirst((f) => f.map((b, k) => (k === i ? (b ?? box) : b)));
    setNow((c) => c.map((b, k) => (k === i ? box : b)));
    setSel(null);
  };
  const choose = (i: number) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (!locked) setSel(sel === i ? null : i);
  };
  const drop = (box: string) => {
    if (locked || sel === null) return;
    place(sel, box);
  };
  const submit = () => {
    const a = { classes: first as string[] };
    onAnswer(a, checkAnswer(course, q, a));
  };
  const back = (i: number) => !locked && setNow(now.map((b, k) => (k === i ? null : b)));

  const setDragState = (d: Drag | null) => {
    dragRef.current = d;
    setDrag(d);
  };
  const down = (i: number) => (e: ReactPointerEvent<HTMLElement>) => {
    if (locked) return;
    setDragState({ i, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, moved: false, over: null });
  };
  // Pendant un glisser, le suivi se fait sur le document : le doigt peut quitter le calcul sans le perdre.
  const dragging = drag !== null;
  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const far = !Number.isFinite(e.clientX) || Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > DRAG_PX;
      const moved = d.moved || far;
      setDragState({ ...d, x: e.clientX, y: e.clientY, moved, over: moved ? binAt(e.clientX, e.clientY, e.target) : null });
    };
    const up = (e: PointerEvent) => {
      const d = dragRef.current;
      setDragState(null);
      if (!d?.moved) return; // un simple toucher : le clic s'en occupe
      suppressClick.current = true; // le clic qui suit le lâcher ne choisit pas le calcul
      setTimeout(() => (suppressClick.current = false), 0);
      const box = binAt(e.clientX, e.clientY, e.target);
      if (box) place(d.i, box);
      else setSel(null);
    };
    const cancel = () => setDragState(null);
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', cancel);
    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', cancel);
    };
  }); // pas de dépendances : `place` voit toujours l'état courant
  const handlers = (i: number) => ({ 'data-drag': i, onPointerDown: down(i) });

  const complete = first.every((b) => b !== null);
  const parts = locked && complete ? checkParts(course, q, { classes: first as string[] }) : null;
  const shown = locked ? first : now;
  const ask = texts?.consigne ?? CLASSER_ASK;

  const fixOf = (e: Exercise, i: number): string | null => {
    if (!locked || q.expected[i] === 'bien' || typeof e.meta?.faultType !== 'string') return null;
    const rule = course.errors.find((x) => x.id === e.meta?.faultType)?.rule;
    return rule ? `règle ${rule.n}` : null;
  };

  return (
    <QFrame
      header={header}
      footer={footer}
      locked={locked}
      foot={<ValidateFoot enabled={now.every((b) => b !== null)} onSubmit={submit} />}
      answer={
        !locked && now.some((b) => b === null) ? (
          <>
            <p className="t-caption">À ranger :</p>
            <div className="tags">
              {q.exs.map((e, i) =>
                now[i] === null ? (
                  <button
                    key={i}
                    className={`tag${sel === i ? ' is-selected' : ''}${drag?.moved && drag.i === i ? ' is-lifted' : ''}`}
                    type="button"
                    onClick={() => choose(i)}
                    {...handlers(i)}
                  >
                    <MathView latex={calcLatex(e)} />
                  </button>
                ) : null,
              )}
            </div>
          </>
        ) : undefined
      }
    >
      <div className="stack stack--top" data-copie>
        {texts?.title ? <LessonHeading title={texts.title} subtitle={texts.subtitle} /> : null}
        <Ask text={ask} />
        <div className="bins bins--top">
          {q.classes.map((c) => (
            <div
              key={c.id}
              className={`bin${drag?.moved && drag.over === c.id ? ' is-over' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={c.label}
              data-bin={c.id}
              onClick={() => drop(c.id)}
              onKeyDown={(ev) => {
                if (ev.target !== ev.currentTarget || (ev.key !== 'Enter' && ev.key !== ' ')) return;
                ev.preventDefault();
                drop(c.id);
              }}
            >
              <p className="t-h6">{c.label}</p>
              <div className="tags">
                {q.exs.map((e, i) => {
                  if (shown[i] !== c.id) return null;
                  if (locked) {
                    const fix = fixOf(e, i);
                    return (
                      <span key={i} className={`tag${fix ? ' tag--fixed' : ''}${parts ? (parts[i]!.correct ? ' is-correct' : ' is-wrong') : ''}`}>
                        <MathView latex={calcLatex(e)} />
                        {fix && (
                          <span className="tag-fix">
                            → <MathView latex={toLatex(e.expr)} />, {fix}
                          </span>
                        )}
                      </span>
                    );
                  }
                  return (
                    <button key={i} className="tag" type="button" onClick={(ev) => { ev.stopPropagation(); back(i); }}>
                      <MathView latex={calcLatex(e)} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {drag?.moved && (
        <span className="tag tag-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          <MathView latex={calcLatex(q.exs[drag.i]!)} />
        </span>
      )}
    </QFrame>
  );
}
