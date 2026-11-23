import type { ReactNode } from 'react';

/** Boîte de dialogue centrée sur fond voilé. `actions` : les boutons (classes .btn). */
export function Dialog({ title, children, actions }: { title: string; children?: ReactNode; actions: ReactNode }) {
  return (
    <div className="backdrop backdrop--fixed">
      <div className="dialog" role="dialog" aria-modal="true" aria-label={title}>
        <h2 className="t-h4">{title}</h2>
        {children}
        <div className="dialog__actions">{actions}</div>
      </div>
    </div>
  );
}
