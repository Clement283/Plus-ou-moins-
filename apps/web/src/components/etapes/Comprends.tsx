/** Bouton « Je comprends » : pas d'erreur possible. */
export function Comprends({ label, onClick }: { label?: string; onClick: () => void }) {
  return (
    <button className="btn btn--contained btn--block" type="button" onClick={onClick}>
      {label ?? 'Je comprends'}
    </button>
  );
}
