import { useEffect, useState } from 'react';
import { prefersReducedMotion } from './reducedMotion';

export interface Jump {
  from: number;
  by: number;
}

const MINUS = '−';
const fmt = (v: number, signed = false): string => (v < 0 ? `${MINUS}${-v}` : signed && v > 0 ? `+${v}` : `${v}`);

/**
 * Droite graduée de la leçon (doc 06) : le point part du départ puis fait ses bonds un à un, chaque bond dessine
 * son arc (rouge s'il est négatif, bleu s'il est positif) avec sa valeur. Avec `prefers-reduced-motion`, la droite
 * s'affiche directement à l'état final. `data-state` : start, moving, final.
 */
export function NumberLine({ from, to, jumps }: { from: number; to: number; jumps: Jump[] }) {
  const [reduced] = useState(prefersReducedMotion);
  const n = jumps.length;
  const [step, setStep] = useState(reduced ? n : 0);
  useEffect(() => {
    if (step >= n) return;
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 600 : 1000);
    return () => clearTimeout(t);
  }, [step, n]);

  const span = to - from;
  const pct = (v: number): string => `${((v - from) / span) * 100}%`;
  const at = step === 0 ? (jumps[0]?.from ?? from) : jumps[step - 1]!.from + jumps[step - 1]!.by;
  const ticks = Array.from({ length: span + 1 }, (_, i) => from + i);
  const every = span > 12 ? 2 : 1;
  const state = step === 0 && n > 0 ? 'start' : step >= n ? 'final' : 'moving';

  return (
    <div className="number-line nl" data-state={state} role="img" aria-label={`Droite graduée : départ ${fmt(jumps[0]?.from ?? from)}, arrivée ${fmt(at)}`}>
      <div className="number-line__axis">
        <div className="number-line__track" />
        {ticks.map((v) => (
          <span key={v}>
            <i className={`number-line__tick${v === 0 ? ' is-major' : ''}`} style={{ left: pct(v) }} />
            {(v - from) % every === 0 && (
              <span className="number-line__num" style={{ left: pct(v) }}>
                {fmt(v)}
              </span>
            )}
          </span>
        ))}
        <span className="number-line__cursor" style={{ left: pct(at) }}>
          {fmt(at)}
        </span>
      </div>
      <div className="nl-arcs">
        {jumps.map((j, i) => {
          const lo = Math.min(j.from, j.from + j.by);
          return (
            <span
              key={i}
              className={`nl-arc ${j.by < 0 ? 'is-neg' : 'is-pos'}${i < step ? ' is-shown' : ''}`}
              style={{ left: pct(lo), width: `${(Math.abs(j.by) / span) * 100}%` }}
            >
              <span className="nl-arc__val">{fmt(j.by, true)}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
