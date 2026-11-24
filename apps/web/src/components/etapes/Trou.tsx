import { useState } from 'react';
import type { StepAction } from '@pom/engine';
import { ErrorBlock } from './ErrorBlock';

type TrouAction = Extract<StepAction, { type: 'trou' }>;

/** La phrase à trous : un grand emplacement visible à la place de « [ ? ] » (lu « un mot à trouver » par Écouter). */
export function TrouPhrase({ open }: { open: string }) {
  const parts = open.split('[ ? ]');
  return (
    <>
      {parts.map((p, i) => (
        <span key={i} style={{ display: 'contents' }}>
          {p}
          {i < parts.length - 1 && (
            <span className="trou-slot" data-speak-open>
              <span className="sr-only">trou à remplir</span>
            </span>
          )}
        </span>
      ))}
    </>
  );
}

/** Les choix, en bas de l'écran. Faux : message, le trou reste ouvert, rien n'est noté. */
export function Trou({ action, onSolved }: { action: TrouAction; onSolved: () => void }) {
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="etape-action" data-speak-skip>
      {err && <ErrorBlock message={err} />}
      <div className="choice-grid">
        {action.choices.map((c, i) => (
          <button
            key={i}
            type="button"
            className="choice"
            onClick={() => (i === action.correct ? onSolved() : setErr(action.errors[i] ?? 'Regarde encore la droite.'))}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
