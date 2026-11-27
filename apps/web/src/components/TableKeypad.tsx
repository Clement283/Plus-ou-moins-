import { Icon } from '../ui/Icon';

export type TableKeys = 'valeurs' | 'lignes' | 'signes';

const KEYS: Record<Exclude<TableKeys, 'signes'>, string[]> = {
  valeurs: ['7', '8', '9', '−', '⌫', '4', '5', '6', '/', '', '1', '2', '3', '0', ''],
  lignes: ['7', '8', '9', '÷', '⌫', '4', '5', '6', '+', 'x', '1', '2', '3', '−', '0', '(', ')'],
};
const SIGNS = ['+', '−', '0'];

/** Le clavier du tableau de signes : valeurs, lignes (x, + − ÷, parenthèses) ou signes (+ − 0, ‖ pour un quotient), puis « Vérifier ». */
export function TableKeypad({ mode, bar, onKey, onSubmit, canSubmit = true }: { mode: TableKeys; bar?: boolean; onKey: (k: string) => void; onSubmit: () => void; canSubmit?: boolean }) {
  const keys = mode === 'signes' ? [...SIGNS, ...(bar ? ['‖'] : []), '⌫'] : KEYS[mode];
  return (
    <div className={`keypad keypad--table keypad--table-${mode}`} aria-label="Clavier du tableau">
      {keys.map((k, i) =>
        k === '' ? (
          <span key={i} />
        ) : (
          <button key={`${k}${i}`} className={`key${'+−0‖÷'.includes(k) || k === 'x' ? ' key--sign' : ''}`} type="button" aria-label={k === '⌫' ? 'effacer' : k} onClick={() => onKey(k)}>
            {k === '⌫' ? <Icon name="backspace" /> : k}
          </button>
        ),
      )}
      <button className="key key--submit key--wide" type="button" disabled={!canSubmit} onClick={() => canSubmit && onSubmit()}>
        Vérifier
      </button>
    </div>
  );
}
