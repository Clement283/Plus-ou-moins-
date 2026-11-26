import type { Interval } from '@pom/engine';

const MINUS = '−';
const fmt = (v: number): string => (v < 0 ? `${MINUS}${-v}` : `${v}`);
const val = (r: { n: number; d: number }): number => r.n / r.d;

/**
 * Droite graduée avec un intervalle colorié (maquette equations-intervalles.html) : rond plein = borne comprise, rond
 * vide = borne exclue, crochet dessiné du côté de la borne, flèche tenue jusqu'au bord pour ±∞. Réutilisable partout
 * où un ensemble de solutions s'affiche (leçons, questions, corrections). `interval = null` : la droite seule.
 * La fenêtre est centrée sur 0 et s'élargit si une borne en sort.
 */
export function IntervalLine({ interval, label }: { interval: Interval | null; label?: string }) {
  const bounds = interval ? [interval.lo, interval.hi].filter((b): b is { n: number; d: number } => b !== null).map(val) : [];
  const half = Math.max(5, ...bounds.map((b) => Math.ceil(Math.abs(b)) + 1));
  const min = -half;
  const max = half;
  const W = 340;
  const x0 = 20;
  const x1 = 320;
  const u = (x1 - x0) / (max - min);
  const X = (v: number): number => x0 + (v - min) * u;
  const y = 46;
  const every = max - min > 12 ? 2 : 1;
  const lo = interval ? (interval.lo === null ? x0 - 8 : X(val(interval.lo))) : 0;
  const hi = interval ? (interval.hi === null ? x1 + 8 : X(val(interval.hi))) : 0;
  const ends = interval
    ? ([
        { v: interval.lo, closed: interval.loClosed, d: -1 },
        { v: interval.hi, closed: interval.hiClosed, d: 1 },
      ] as const)
    : [];
  const desc = interval ? `Droite graduée, intervalle colorié de ${interval.lo ? fmt(val(interval.lo)) : `${MINUS}∞`} à ${interval.hi ? fmt(val(interval.hi)) : '+∞'}` : 'Droite graduée';
  return (
    <svg className="interval-line" viewBox={`0 0 ${W} 90`} role="img" aria-label={label ?? desc}>
      {interval && (
        <>
          <rect className="interval-line__zone" x={lo} y={y - 9} width={Math.max(hi - lo, 0)} height={18} rx={4} />
          <line className="interval-line__bar" x1={lo} x2={hi} y1={y} y2={y} />
        </>
      )}
      <line className="interval-line__axis" x1={x0 - 8} x2={x1 + 8} y1={y} y2={y} />
      <path className="interval-line__arrow" d={`M${x1 + 8} ${y} l-7 -5 m7 5 l-7 5`} />
      {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((v) => (
        <g key={v}>
          <line className="interval-line__tick" x1={X(v)} x2={X(v)} y1={y - 5} y2={y + 5} />
          {(v - min) % every === 0 && (
            <text x={X(v)} y={y + 24} textAnchor="middle">
              {fmt(v)}
            </text>
          )}
        </g>
      ))}
      {ends.map(({ v, closed, d }) =>
        v === null ? null : (
          <g key={d}>
            <circle className={`interval-line__dot${closed ? ' is-closed' : ''}`} cx={X(val(v))} cy={y} r={7} />
            <text className="interval-line__bracket" x={X(val(v)) + d * 14} y={y - 16} textAnchor="middle">
              {d < 0 ? (closed ? '[' : ']') : closed ? ']' : '['}
            </text>
          </g>
        ),
      )}
    </svg>
  );
}
