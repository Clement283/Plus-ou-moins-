import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { Stepper, type StepResult } from './Stepper';

export type AppBarProps = {
  onClose?: () => void;
  closeLabel?: string;
  title?: ReactNode;
  stepper?: { total: number; done: StepResult[]; current?: number; label?: string };
  trailing?: ReactNode;
};

/** Barre du haut d'une activité : croix de sortie + progression (ou titre). */
export function AppBar({ onClose, closeLabel = 'Quitter', title, stepper, trailing }: AppBarProps) {
  return (
    <div className="appbar" style={stepper ? { padding: 'var(--sp-8) var(--sp-16) 0 var(--sp-4)' } : undefined}>
      {onClose && (
        <button className="icon-btn" type="button" aria-label={closeLabel} onClick={onClose}>
          <Icon name="close" />
        </button>
      )}
      {title !== undefined && <div className="appbar__title">{title}</div>}
      {stepper && <Stepper {...stepper} />}
      {trailing}
    </div>
  );
}
