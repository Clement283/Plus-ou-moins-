import { useMemo } from 'react';
import { Icon } from '../ui/Icon';
import { useToday } from '../store/progress';
import { useEvents } from '../store/sync';

/** Accueil : « Échauffement fait » une fois la question du jour répondue (« Passer » n'affiche rien). */
export function WarmupChip() {
  const events = useEvents();
  const today = useToday();
  const done = useMemo(() => events.some((e) => e.day === today && e.kind === 'answer' && e.activity === 'echauffement'), [events, today]);
  if (!done) return null;
  return (
    <span className="chip chip--success warmup-chip">
      <Icon name="check" size="sm" />
      Échauffement fait
    </span>
  );
}
