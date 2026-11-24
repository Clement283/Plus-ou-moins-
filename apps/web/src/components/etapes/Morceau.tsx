import { useState } from 'react';
import type { SceneToken, StepAction } from '@pom/engine';
import { ErrorBlock } from './ErrorBlock';

type TouchAction = Extract<StepAction, { type: 'morceau' | 'endroit' }>;

/** Toucher un morceau du calcul (`morceau`) ou un endroit entre deux morceaux (`endroit`) ; cibles de 44 px au moins. */
export function Morceau({ tokens, action, onSolved }: { tokens: SceneToken[]; action: TouchAction; onSolved: () => void }) {
  const [err, setErr] = useState<string | null>(null);
  const pick = (i: number) => {
    if (action.target.includes(i)) return onSolved();
    setErr(action.errors.find((f) => f.at.includes(i))?.message ?? action.fallback);
  };
  const gap = (i: number) =>
    action.gaps && !action.gaps.includes(i) ? null : (
      <button key={`g${i}`} type="button" className="touch-gap" aria-label={`Endroit ${i + 1}`} onClick={() => pick(i)}>
        <i />
      </button>
    );
  return (
    <div className="etape-touch">
      <p className="etape-touch__consigne">
        <strong>{action.consigne}</strong>
      </p>
      <span className="etape-touch__calc">
        {action.type === 'endroit' && gap(0)}
        {tokens.map((t, i) => (
          <span key={i} style={{ display: 'contents' }}>
            {action.type === 'morceau' ? (
              <button type="button" className="touch-token" onClick={() => pick(i)}>
                {t.t}
              </button>
            ) : (
              <span>{t.t}</span>
            )}
            {action.type === 'endroit' && gap(i + 1)}
          </span>
        ))}
      </span>
      {err && <ErrorBlock message={err} />}
    </div>
  );
}
