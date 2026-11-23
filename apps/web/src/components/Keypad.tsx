import type { ReactNode } from 'react';
import type { Key } from '@pom/engine';
import { Icon } from '../ui/Icon';

type Def = { key: Key; label: string; cls?: string; content: ReactNode };

const digit = (d: number): Def => ({ key: `digit:${d}` as Key, label: String(d), content: String(d) });

const FRAC = (
  <span className="frac-icon">
    <i />
    <span />
    <i />
  </span>
);

/** Disposition du doc 03 §2 : 7 8 9 ⌫ / 4 5 6 − / 1 2 3 fraction / ( 0 ) → , puis Valider. */
const KEYS: Def[] = [
  digit(7), digit(8), digit(9),
  { key: 'back', label: 'effacer', cls: 'key--fn', content: <Icon name="backspace" /> },
  digit(4), digit(5), digit(6),
  { key: 'minus', label: 'moins', cls: 'key--sign', content: '−' },
  digit(1), digit(2), digit(3),
  { key: 'frac', label: 'fraction', cls: 'key--fn', content: FRAC },
  { key: 'lpar', label: 'parenthèse ouvrante', content: '(' },
  digit(0),
  { key: 'rpar', label: 'parenthèse fermante', content: ')' },
  { key: 'next', label: 'case suivante', cls: 'key--fn', content: <Icon name="arrow-right" /> },
];

/** Clavier maths de l'appli : le clavier du téléphone ne s'ouvre jamais. Aucune logique de saisie ici. */
export function Keypad({ onKey, onSubmit, canSubmit }: { onKey: (k: Key) => void; onSubmit: () => void; canSubmit: boolean }) {
  return (
    <div className="keypad" aria-label="Clavier maths">
      {KEYS.map((k) => (
        <button
          key={k.key}
          className={`key${k.cls ? ` ${k.cls}` : ''}`}
          type="button"
          aria-label={/^\d$/.test(k.label) ? undefined : k.label}
          onClick={() => onKey(k.key)}
        >
          {k.content}
        </button>
      ))}
      <button className="key key--submit" type="button" style={{ gridColumn: 'span 4' }} disabled={!canSubmit} onClick={() => canSubmit && onSubmit()}>
        Valider
      </button>
    </div>
  );
}
