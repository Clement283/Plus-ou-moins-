import { SYMBOLS, symbolText, type Relation } from '@pom/engine';

/**
 * Le choix d'un symbole < ≤ > ≥ (maquette equations-intervalles.html, état 5) : « on divise par −2 : ≥ devient ? ».
 * Brique réutilisable. Marques : `picked` (le choix de l'élève) et `answer` (le bon, montré une fois répondu).
 */
export function SymbolPicker({ picked, answer, disabled, onPick, label }: { picked: Relation | null; answer: Relation | null; disabled?: boolean; onPick: (s: Relation) => void; label?: string }) {
  const mark = (s: Relation): string => {
    if (answer === null || picked === null) return '';
    if (s === answer) return ' is-correct';
    return s === picked ? ' is-wrong' : '';
  };
  return (
    <div className="symbol-picker" role="group" aria-label={label ?? 'Choisis le symbole'} data-copie>
      {SYMBOLS.map((s) => (
        <button key={s} type="button" className={`choice${mark(s)}`} disabled={disabled} aria-label={symbolName[s]} onClick={() => onPick(s)}>
          {symbolText(s)}
        </button>
      ))}
    </div>
  );
}

const symbolName: Record<string, string> = { '<': 'inférieur', '<=': 'inférieur ou égal', '>': 'supérieur', '>=': 'supérieur ou égal' };
