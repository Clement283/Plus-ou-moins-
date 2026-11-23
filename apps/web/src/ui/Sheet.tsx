import { useEffect, type ReactNode } from 'react';

/** Volet en bas de l'écran ; se ferme en touchant le fond ou avec Échap. */
export function Sheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="backdrop backdrop--fixed backdrop--sheet" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
