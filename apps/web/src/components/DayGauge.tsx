import { useLayoutEffect, useRef } from 'react';
import { DAILY_GOAL_MS } from '@pom/engine';

/**
 * Droite graduée du jour (signature) : une graduation par minute, l'objectif en vert ; au-delà,
 * la droite s'allonge par pas de 5 minutes. Port de `docs/design/design-system/number-line.js`.
 */
/** Marge (px) dont la bulle peut dépasser l'axe : celle de l'axe (14 px), pour rester dans la marge de 16 px de l'écran. */
const ROOM = 14;

export function DayGauge({ minutes, goal = DAILY_GOAL_MS / 60_000 }: { minutes: number; goal?: number }) {
  const max = Math.max(goal, Math.ceil(minutes / 5) * 5);
  const pct = (v: number) => `${(v / max) * 100}%`;
  const axis = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLSpanElement>(null);
  // Au bord de l'axe (0 min, objectif), la bulle est décalée vers l'intérieur ; la flèche garde sa graduation.
  useLayoutEffect(() => {
    const place = () => {
      const a = axis.current;
      const c = cursor.current;
      if (!a || !c) return;
      const half = c.offsetWidth / 2;
      const x = (Math.min(minutes, max) / max) * a.offsetWidth;
      const left = Math.max(0, half - ROOM - x);
      const right = Math.max(0, x + half - a.offsetWidth - ROOM);
      c.style.setProperty('--nudge', `${left - right}px`);
    };
    place();
    // La bulle change de largeur quand la police arrive ou que le texte change ; l'axe, quand l'écran tourne.
    const watch = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(place);
    if (axis.current) watch?.observe(axis.current);
    if (cursor.current) watch?.observe(cursor.current);
    return () => watch?.disconnect();
  }, [minutes, max]);
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
      <div className="number-line__axis" ref={axis}>
        <div className="number-line__track" />
        <div className="number-line__fill" style={{ width: pct(Math.min(minutes, max)) }} />
        {ticks}
        <span ref={cursor} className={`number-line__cursor${minutes >= goal ? ' is-goal' : ''}`} style={{ left: pct(minutes) }}>
          {minutes} min
        </span>
      </div>
    </div>
  );
}
