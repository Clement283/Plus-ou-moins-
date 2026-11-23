import { useState } from 'react';
import { checkAnswer } from '@pom/engine';
import { Math } from '../../ui/Math';
import { QFrame, type QProps } from './Frame';

/** Trouver l'erreur : toutes les lignes se touchent, la ligne de départ comprise (doc 08 n° 11). */
export function Erreur({ q, course, locked, onAnswer, header, footer }: QProps<'erreur'>) {
  const [picked, setPicked] = useState<number | null | undefined>(undefined);
  const pick = (line: number | null) => {
    if (locked || picked !== undefined) return;
    setPicked(line);
    onAnswer({ line }, checkAnswer(course, q, { line }));
  };
  const open = !locked;
  return (
    <QFrame header={header} footer={footer} locked={locked}>
      <div className="stack stack--top" data-copie>
        {open ? (
          <>
            <p className="t-body1">Une ligne est fausse. Touche-la.</p>
            <div className="copy-lines">
              {q.lines.map((l, i) => (
                <button key={i} className="copy-line" type="button" disabled={picked !== undefined} onClick={() => pick(i)}>
                  <Math latex={l} />
                </button>
              ))}
            </div>
            <button className="btn btn--outlined btn--block" type="button" disabled={picked !== undefined} onClick={() => pick(null)}>
              Tout est juste
            </button>
          </>
        ) : (
          <Corrected q={q} course={course} picked={picked} />
        )}
      </div>
    </QFrame>
  );
}

/**
 * Résolution corrigée sur place : la première ligne fausse marquée, sa version juste, puis la suite.
 * Sur une résolution entièrement juste, seule la ligne touchée par erreur est marquée.
 */
function Corrected({ q, course, picked }: { q: QProps<'erreur'>['q']; course: QProps<'erreur'>['course']; picked: number | null | undefined }) {
  const w = q.wrongLine;
  const right = w === null ? undefined : course.resolution(q.ex)[w];
  return (
    <div className="copy-lines">
      {q.lines.flatMap((l, i) => {
        const rows = [];
        if (i === w) {
          rows.push(
            <div key={`l${i}`} className="lesson-line lesson-line--ko">
              <span className="lesson-line__mark">✗</span>
              <Math latex={l} />
              <span className="lesson-line__note">ligne fausse</span>
            </div>,
          );
          if (right !== undefined)
            rows.push(
              <div key={`r${i}`} className="lesson-line lesson-line--ok">
                <span className="lesson-line__mark">✓</span>
                <Math latex={right} />
                <span className="lesson-line__note">corrigée</span>
              </div>,
            );
        } else if (w === null && i === picked) {
          rows.push(
            <div key={`l${i}`} className="lesson-line lesson-line--ko">
              <span className="lesson-line__mark">✗</span>
              <Math latex={l} />
            </div>,
          );
        } else {
          rows.push(
            <div key={`l${i}`} className="lesson-line lesson-line--neutral">
              <Math latex={l} />
              {w !== null && i === w + 1 && <span className="lesson-line__note">la suite reprenait l'erreur</span>}
            </div>,
          );
        }
        return rows;
      })}
    </div>
  );
}
