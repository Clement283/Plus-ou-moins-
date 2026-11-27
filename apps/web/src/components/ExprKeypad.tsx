import { Icon } from '../ui/Icon';

/** Chiffres 0–9, + − × ÷ ( ), effacer (doc 06, « Réécris » : jamais réduit). Même disposition que le clavier maths. */
const ROWS: { k: string; sign?: boolean }[] = [
  { k: '7' }, { k: '8' }, { k: '9' }, { k: '÷', sign: true },
  { k: '4' }, { k: '5' }, { k: '6' }, { k: '×', sign: true },
  { k: '1' }, { k: '2' }, { k: '3' }, { k: '−', sign: true },
  { k: '(' }, { k: '0' }, { k: ')' }, { k: '+', sign: true },
];

/** Clavier d'un calcul entier : le clavier du téléphone ne s'ouvre jamais. Aucune logique de saisie ici. */
export function ExprKeypad({ onKey, onDelete, onSubmit, canSubmit, brackets, letter }: { onKey: (k: string) => void; onDelete: () => void; onSubmit: () => void; canSubmit: boolean; brackets?: boolean; letter?: boolean }) {
  // `letter` : la touche x remplace ÷ (réécrire une expression avec une lettre)
  const rows = letter ? ROWS.map((r) => (r.k === '÷' ? { k: 'x' } : r)) : ROWS;
  return (
    <div className="keypad keypad--expr" aria-label="Clavier du calcul">
      {rows.map(({ k, sign }) => (
        <button key={k} className={`key${sign ? ' key--sign' : ''}${k === 'x' ? ' key--x' : ''}`} type="button" onClick={() => onKey(k)}>
          {k}
        </button>
      ))}
      {brackets &&
        ['[', ']'].map((k) => (
          <button key={k} className="key" type="button" onClick={() => onKey(k)}>
            {k}
          </button>
        ))}
      <button className="key key--fn key--wide" type="button" aria-label="effacer" onClick={onDelete}>
        <Icon name="backspace" />
      </button>
      <button className="key key--submit key--wide" type="button" disabled={!canSubmit} onClick={() => canSubmit && onSubmit()}>
        Valider
      </button>
    </div>
  );
}
