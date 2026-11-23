import { useState } from 'react';
import { checkAnswer, toLatex } from '@pom/engine';
import { Math } from '../../ui/Math';
import { LessonHeading, Prompt, QFrame, ValidateFoot, type QProps } from './Frame';

/** Étiquettes à ordonner (doc 03 §4) : toucher place à la fin, toucher une étiquette placée la renvoie. */
export function Ordre({ q, course, locked, onAnswer, header, footer, texts }: QProps<'ordre'>) {
  const [placed, setPlaced] = useState<string[]>([]);
  const size = q.solution.length;
  const toggle = (id: string) => {
    if (locked) return;
    setPlaced((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < size ? [...p, id] : p));
  };
  const submit = () => {
    const a = { order: placed };
    onAnswer(a, checkAnswer(course, q, a));
  };
  const tile = (id: string) => q.tiles.find((t) => t.id === id)!;
  return (
    <QFrame header={header} footer={footer} locked={locked} foot={<ValidateFoot enabled={placed.length === size} onSubmit={submit} />}>
      {texts?.title ? (
        <LessonHeading title={texts.title} subtitle={texts.subtitle} />
      ) : (
        <div className="q-expr q-expr--top" data-copie>
          <Prompt texts={texts} fallback="Remets les étapes dans l'ordre." cls="t-body2" />
          <p className="t-math">
            <Math latex={toLatex(q.ex.expr)} />
          </p>
        </div>
      )}
      <div className="stack">
        <p className="t-subtitle2">Ta réponse</p>
        <div className="slots" data-copie>
          {placed.map((id) => (
            <button key={id} className="tag" type="button" disabled={locked} onClick={() => toggle(id)}>
              <Math latex={tile(id).latex} />
            </button>
          ))}
          {Array.from({ length: size - placed.length }, (_, i) => (
            <span key={`s${i}`} className="slot" />
          ))}
        </div>
      </div>
      <div className="stack">
        <p className="t-subtitle2">Étiquettes</p>
        <div className="tags" data-copie>
          {q.tiles.map((t) => (
            <button key={t.id} className={`tag${placed.includes(t.id) ? ' is-done' : ''}`} type="button" disabled={locked} onClick={() => toggle(t.id)}>
              <Math latex={t.latex} />
            </button>
          ))}
        </div>
      </div>
    </QFrame>
  );
}
