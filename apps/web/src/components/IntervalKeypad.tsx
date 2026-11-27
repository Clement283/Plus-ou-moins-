import { Icon } from '../ui/Icon';

/** Chiffres, − et /, −∞ et +∞, effacer : le clavier d'une borne (le clavier du téléphone ne s'ouvre jamais). */
const ROWS: { k: string; inf?: boolean }[] = [
  { k: '7' }, { k: '8' }, { k: '9' }, { k: '−∞', inf: true }, { k: '+∞', inf: true },
  { k: '4' }, { k: '5' }, { k: '6' }, { k: '−' }, { k: '/' },
  { k: '1' }, { k: '2' }, { k: '3' }, { k: '0' },
];

export function IntervalKeypad({ onKey, onDelete, onSubmit, canSubmit }: { onKey: (k: string) => void; onDelete: () => void; onSubmit: () => void; canSubmit: boolean }) {
  return (
    <div className="keypad keypad--interval" aria-label="Clavier de la borne">
      {ROWS.map(({ k, inf }) => (
        <button key={k} className={`key${inf || k === '−' ? ' key--sign' : ''}`} type="button" onClick={() => onKey(k)}>
          {k}
        </button>
      ))}
      <button className="key key--fn" type="button" aria-label="effacer" onClick={onDelete}>
        <Icon name="backspace" />
      </button>
      <button className="key key--submit key--wide" type="button" disabled={!canSubmit} onClick={() => canSubmit && onSubmit()}>
        Valider
      </button>
    </div>
  );
}
