import { useEffect, useState } from 'react';
import type { LineScene } from '@pom/engine';
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

  const span = to > from ? to - from : 1; // droite vide ou à l'envers : on ne divise pas par zéro
  const pct = (v: number): string => `${((v - from) / span) * 100}%`;
  const at = step === 0 ? (jumps[0]?.from ?? from) : jumps[step - 1]!.from + jumps[step - 1]!.by;
  const ticks = Array.from({ length: Math.max(span, 0) + 1 }, (_, i) => from + i);
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

const MAX_TOUCH_TICKS = 8;
/** Largeur minimale d'une pastille touchable : 44 px dès que la place le permet, jamais moins de 36 px (8 × 36 = 288 px tient dans la scène d'un écran de 360 px). */
const TOUCH_MIN_PX = 36;

/** Hauteur d'un arc par défaut, et ce qu'on ajoute par arc plus court qui tient dedans. */
const ARC_H = 28;
const ARC_STEP = 16;

/**
 * Hauteur de chaque arc : deux bonds qui se superposent (un petit bond sous le grand, ex. −7 puis +2) ne se confondent pas.
 * Un arc est d'autant plus haut qu'il en contient d'autres (même étendue : le plus ancien est le plus bas).
 */
export function arcHeights(jumps: { from: number; by: number }[]): number[] {
  const span = (j: { from: number; by: number }) => [Math.min(j.from, j.from + j.by), Math.max(j.from, j.from + j.by)] as const;
  return jumps.map((j, i) => {
    const [lo, hi] = span(j);
    const inside = jumps.filter((k, m) => {
      if (m === i) return false;
      const [klo, khi] = span(k);
      const contained = lo <= klo && khi <= hi;
      const smaller = khi - klo < hi - lo || (khi - klo === hi - lo && m < i);
      return contained && smaller;
    }).length;
    return ARC_H + ARC_STEP * inside;
  });
}

export interface LineTouch {
  onPick(point: number): void;
  picked?: number | null;
  /** Main animée : l'appelant ne la passe que la 1re fois. */
  hand?: boolean;
  consigne: string;
}

/** Graduation de la main : jamais 0 ; arrivée du dernier bond, sinon la graduation non nulle la plus proche du milieu. */
function handPoint(line: LineScene): number | null {
  const ticks = Array.from({ length: Math.max(line.to - line.from, 0) + 1 }, (_, i) => line.from + i).filter((v) => v !== 0);
  if (ticks.length === 0) return null;
  const last = line.jumps[line.jumps.length - 1];
  if (last) {
    const end = last.from + last.by;
    if (ticks.includes(end)) return end;
  }
  const mid = (line.from + line.to) / 2;
  return ticks.reduce((best, v) => (Math.abs(v - mid) < Math.abs(best - mid) ? v : best));
}

/**
 * Droite graduée de la scène : une colonne par graduation (largeur partagée, au moins 36 px si touchable), pastille touchable, nombres SOUS les
 * pastilles, arcs orange (négatif) / bleu (positif) ou gris (`tone: 'neutral'`). `revealed` dessine les bonds `after`.
 */
export function LineView({
  line,
  mode = 'lesson',
  touch,
  revealed = false,
  replay = 0,
}: {
  line: LineScene;
  mode?: 'lesson' | 'question';
  touch?: LineTouch;
  revealed?: boolean;
  replay?: number;
}) {
  const [reduced] = useState(prefersReducedMotion);
  const ticks = Array.from({ length: Math.max(line.to - line.from, 0) + 1 }, (_, i) => line.from + i);
  const n = ticks.length;
  const center = (v: number): string => `${((v - line.from + 0.5) / n) * 100}%`;
  const neutral = line.tone === 'neutral';
  const hl = new Set(line.highlight ?? []);
  const hand = touch?.hand && !reduced ? handPoint(line) : null;
  const touchable = touch !== undefined && n <= MAX_TOUCH_TICKS;
  const heights = arcHeights(line.jumps);
  const arcSpace = Math.max(ARC_H, ...heights);

  return (
    <div className={`line-view${neutral ? ' is-neutral' : ' is-color'}${touchable ? ' is-touch' : ''}`} data-mode={mode}>
      {touch && (
        <p className="line-view__consigne">
          <strong>{touch.consigne}</strong>
        </p>
      )}
      <div className="line-view__grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(${touchable ? TOUCH_MIN_PX : 0}px, 1fr))` }}>
        <span className="line-view__track" />
        {ticks.map((v) => (
          <span key={v} className="line-view__col">
            {touchable ? (
              <button
                type="button"
                className={`line-view__dot${reduced ? '' : ' is-breathing'}${touch.picked === v ? ' is-picked' : ''}`}
                style={{ minWidth: `${TOUCH_MIN_PX}px` }}
                aria-label={`Graduation ${fmt(v)}`}
                onClick={() => touch.onPick(v)}
              >
                <i className="line-view__pastille" />
              </button>
            ) : (
              <span className="line-view__dot">
                <i className={`line-view__tick${hl.has(v) ? ' is-hl' : ''}`} />
              </span>
            )}
            <span className={`line-view__num${hl.has(v) ? ' is-hl' : ''}`}>{fmt(v)}</span>
            {hand === v && (
              <span className={`line-view__hand${reduced ? '' : ' is-animated'}`} aria-hidden="true">
                👆
              </span>
            )}
          </span>
        ))}
      </div>
      <div className="line-view__arcs" key={replay} style={arcSpace > ARC_H ? { height: arcSpace + ARC_H } : undefined}>
        {line.jumps.map((j, i) => {
          const lo = Math.min(j.from, j.from + j.by);
          const sign = neutral ? '' : j.by < 0 ? ' is-neg' : ' is-pos';
          const visible = !j.after || revealed;
          return (
            <span
              key={i}
              className={`line-view__arc${sign}${visible ? ' is-shown' : ''}`}
              style={{ left: center(lo), width: `${(Math.abs(j.by) / n) * 100}%`, ...(heights[i] !== ARC_H ? { height: heights[i] } : {}) }}
            >
              <span className="line-view__arcval">{j.label ?? fmt(j.by, true)}</span>
            </span>
          );
        })}
      </div>
      {line.marks && line.marks.length > 0 && (
        <div className="line-view__marks">
          {line.marks.map((m) => (
            <span key={m.at} className="line-view__mark" style={{ left: center(m.at) }}>
              {m.text}
            </span>
          ))}
        </div>
      )}
      {line.legend && <p className="line-view__legend">{line.legend}</p>}
    </div>
  );
}
