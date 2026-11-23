import { DAILY_GOAL_MS } from '@pom/engine';

/**
 * Droite graduée du jour (signature) : une graduation par minute, l'objectif en vert ; au-delà,
 * la droite s'allonge par pas de 5 minutes. Port de `docs/design/design-system/number-line.js`.
 */
export function DayGauge({ minutes, goal = DAILY_GOAL_MS / 60_000 }: { minutes: number; goal?: number }) {
  const max = Math.max(goal, Math.ceil(minutes / 5) * 5);
  const pct = (v: number) => `${(v / max) * 100}%`;
  const ticks = [];
  for (let i = 0; i <= max; i++) {
    const cls = i === goal ? 'is-goal' : i % 5 === 0 ? 'is-major' : i <= minutes ? 'is-passed' : '';
    ticks.push(<i key={`t${i}`} className={`number-line__tick${cls ? ` ${cls}` : ''}`} style={{ left: pct(i) }} />);
    if (i % 5 === 0)
      ticks.push(
        <span key={`n${i}`} className="number-line__num" style={{ left: pct(i) }}>
          {i}
        </span>,
      );
  }
  return (
    <div className="number-line" role="img" aria-label={`${minutes} minutes sur ${goal}`}>
      <div className="number-line__axis">
        <div className="number-line__track" />
        <div className="number-line__fill" style={{ width: pct(Math.min(minutes, max)) }} />
        {ticks}
        <span className={`number-line__cursor${minutes >= goal ? ' is-goal' : ''}`} style={{ left: pct(minutes) }}>
          {minutes} min
        </span>
      </div>
    </div>
  );
}
