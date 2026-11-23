import type { ReactNode } from 'react';
import { Icon } from '../ui/Icon';

/** Barre du haut des écrans de suivi : flèche de retour (un lien) et titre. */
export function FollowBar({ back, backLabel, title, sub }: { back: string; backLabel: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <div className="appbar appbar--follow">
      <a className="icon-btn" href={back} aria-label={backLabel}>
        <Icon name="back" />
      </a>
      <span className="appbar__title">{title}</span>
      {sub !== undefined && <span className="appbar__sub">{sub}</span>}
    </div>
  );
}
