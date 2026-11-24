import { useState } from 'react';
import { checkAnswer, type LineScene } from '@pom/engine';
import { Math as MathView } from '../../ui/Math';
import { LineView } from '../NumberLine';
import { QFrame, type QProps } from './Frame';

export const DROITE_CONSIGNE = "Touche la droite à l'endroit où l'on arrive.";

/** La main animée ne se montre que la 1re fois qu'une droite à toucher s'affiche (par ouverture de l'appli). */
let handShown = false;

/**
 * « Toucher la droite » : le calcul, la droite grise avec ses bonds sans étiquette et son départ marqué, la consigne en gras.
 * Le toucher est la réponse. Après : la bonne graduation en vert, la touchée fausse en rouge, aucune couleur de signe.
 */
export function Droite({ q, course, locked, onAnswer, header, footer, texts }: QProps<'droite'>) {
  const [picked, setPicked] = useState<number | null>(null);
  const [hand] = useState(() => {
    const first = !handShown;
    handShown = true;
    return first;
  });
  const done = locked || picked !== null;
  const start = q.jumps[0]?.from ?? 0;
  const scene: LineScene = {
    from: q.line.from,
    to: q.line.to,
    jumps: q.jumps.map((j) => ({ from: j.from, by: j.by, label: '' })),
    marks: [{ at: start, text: 'départ' }],
    tone: 'neutral',
  };
  const pick = (v: number) => {
    if (done) return;
    setPicked(v);
    onAnswer({ point: v }, checkAnswer(course, q, { point: v }));
  };
  const label = (v: number) => `Graduation ${v < 0 ? `−${-v}` : v}`;
  const marks = done
    ? `.droite [aria-label="${label(q.answer)}"] .line-view__pastille{background:var(--success);box-shadow:0 0 0 3px var(--success)}` +
      (picked !== null && picked !== q.answer ? `.droite [aria-label="${label(picked)}"] .line-view__pastille{background:var(--error);box-shadow:0 0 0 3px var(--error)}` : '')
    : '';
  return (
    <QFrame
      header={header}
      footer={footer}
      locked={locked}
      answer={
        <div className="droite">
          {marks && <style>{marks}</style>}
          <LineView
            line={scene}
            mode="question"
            touch={{ onPick: pick, picked, hand: hand && !done, consigne: texts?.consigne ?? DROITE_CONSIGNE }}
          />
        </div>
      }
    >
      <div className="q-calc q-calc--md" data-copie>
        <p className="t-math-xl">
          <MathView latex={q.promptLatex} />
        </p>
      </div>
    </QFrame>
  );
}
