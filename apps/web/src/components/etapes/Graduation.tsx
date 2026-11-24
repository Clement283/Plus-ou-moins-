import { useState } from 'react';
import type { LineScene, StepAction } from '@pom/engine';
import { LineView } from '../NumberLine';
import { ErrorBlock } from './ErrorBlock';

type GraduationAction = Extract<StepAction, { type: 'graduation' }>;

/** Toucher une graduation de la droite (grise tant que la question est ouverte). */
export function Graduation({ line, action, hand, replay, onSolved }: { line: LineScene; action: GraduationAction; hand: boolean; replay: number; onSolved: () => void }) {
  const [err, setErr] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const pick = (p: number) => {
    setPicked(p);
    if (p === action.target) return onSolved();
    setErr(action.errors.find((f) => f.at.includes(p))?.message ?? action.fallback);
  };
  return (
    <div className="etape-graduation">
      <LineView line={{ ...line, tone: 'neutral' }} touch={{ onPick: pick, picked, hand, consigne: action.consigne }} replay={replay} />
      {err && <ErrorBlock message={err} />}
    </div>
  );
}
