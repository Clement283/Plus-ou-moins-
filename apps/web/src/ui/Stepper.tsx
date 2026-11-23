export type StepResult = 'ok' | 'ko';

/**
 * Segments de progression : indigo fait, rouge raté, clair courant.
 * `done` : résultat de chaque question terminée, dans l'ordre. `current` : indice (à partir de 0)
 * du segment courant ; par défaut la question qui suit la dernière terminée.
 */
export function Stepper({ total, done, current, label }: { total: number; done: StepResult[]; current?: number; label?: string }) {
  const cur = current ?? done.length;
  return (
    <div className="stepper" role="img" aria-label={label ?? `Question ${Math.min(cur + 1, total)} sur ${total}`} style={{ flex: 1 }}>
      {Array.from({ length: total }, (_, i) => {
        const r = done[i];
        const cls = r === 'ko' ? 'is-error' : r === 'ok' ? 'is-done' : i === cur ? 'is-current' : '';
        return <span key={i} className={`stepper__step${cls ? ` ${cls}` : ''}`} />;
      })}
    </div>
  );
}
