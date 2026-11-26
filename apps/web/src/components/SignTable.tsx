import type { ReactNode } from 'react';
import { Math as MathView } from '../ui/Math';

export type CellMark = 'ok' | 'ko' | '';

export interface SignRow {
  label: ReactNode;
  /** Un signe par colonne : '+', '−', '0', '‖' ou '' (vide). Colonnes impaires = valeurs. */
  cells: string[];
  marks?: CellMark[];
  /** Cellules touchables (étape « signes ») ; la ligne se pose dans la 1re colonne (étape « lignes »). */
  labelEditable?: boolean;
  labelEmpty?: boolean;
  cellsEditable?: boolean;
}

export type Cursor = { h: number } | { l: number } | { r: number; c: number } | null;

const SIGN_CLASS: Record<string, string> = { '+': 'sign-plus', '−': 'sign-minus', '0': 'sign-zero', '‖': 'sign-bar' };

/** LaTeX d'une ligne tapée : « (x+1)÷(x−2) » devient une fraction, le reste tel quel. */
export function labelLatex(text: string): string {
  const i = text.indexOf('÷');
  const strip = (s: string): string => s.trim().replace(/^\((.*)\)$/, '$1');
  const lx = (s: string): string => s.replace(/−/g, '-');
  if (i > 0 && text.slice(i + 1).trim() !== '') return `\\frac{${lx(strip(text.slice(0, i)))}}{${lx(strip(text.slice(i + 1)))}}`;
  return lx(text);
}

/**
 * Le tableau de signes (maquette equations-tableau-signes.html) : la 1re ligne donne les valeurs (−∞, valeurs, +∞), la
 * barre part sous chaque valeur et traverse les lignes, le signe 0 ou la double barre se pose sur elle. Présentationnel :
 * l'écran qui l'utilise garde l'état. `ghost` : colonnes surlignées (lecture de S). Réutilisable dans une leçon.
 */
export function SignTable({
  values,
  headerEditable,
  headerEmpty,
  rows,
  cursor,
  ghost,
  onHeader,
  onLabel,
  onCell,
  caption,
}: {
  /** Les valeurs de l'en-tête, du plus petit au plus grand (texte déjà mis en forme). */
  values: string[];
  headerEditable?: boolean;
  headerEmpty?: boolean[];
  rows: SignRow[];
  cursor?: Cursor;
  ghost?: boolean[];
  onHeader?: (i: number) => void;
  onLabel?: (r: number) => void;
  onCell?: (r: number, c: number) => void;
  caption?: string;
}) {
  const n = values.length;
  const cols = 2 * n + 1;
  const style = { gridTemplateColumns: `minmax(84px,1.1fr) ${Array.from({ length: cols }, (_, i) => (i % 2 ? 'minmax(0,.8fr)' : 'minmax(0,1.2fr)')).join(' ')}` };
  const isCur = (t: Cursor, k: 'h' | 'l' | 'c', a: number, b = 0): boolean =>
    !!t && (k === 'h' ? 'h' in t && t.h === a : k === 'l' ? 'l' in t && t.l === a : 'r' in t && t.r === a && t.c === b);
  return (
    <div className="sign-table" style={style} role="group" aria-label={caption ?? 'Tableau de signes'}>
      <div className="sign-table__c sign-table__lab sign-table__hd">x</div>
      {Array.from({ length: cols }, (_, i) => {
        const ghostCls = ghost?.[i] ? ' is-ghost' : '';
        if (i === 0) return <div key={i} className={`sign-table__c sign-table__hd${ghostCls}`}>−∞</div>;
        if (i === cols - 1) return <div key={i} className={`sign-table__c sign-table__hd${ghostCls}`}>+∞</div>;
        if (i % 2 === 0) return <div key={i} className={`sign-table__c sign-table__hd${ghostCls}`} />;
        const k = (i - 1) / 2;
        return headerEditable ? (
          <button
            key={i}
            type="button"
            className={`sign-table__c sign-table__hd is-edit${headerEmpty?.[k] ? ' is-empty' : ''}${isCur(cursor ?? null, 'h', k) ? ' is-cur' : ''}${ghostCls}`}
            aria-label={`Valeur ${k + 1}`}
            onClick={() => onHeader?.(k)}
          >
            {values[k]}
          </button>
        ) : (
          <div key={i} className={`sign-table__c sign-table__hd${ghostCls}`}>
            {values[k]}
          </div>
        );
      })}
      {rows.map((row, r) => {
        const last = r === rows.length - 1;
        const lab = row.labelEditable ? (
          <button
            type="button"
            className={`sign-table__c sign-table__lab is-edit${row.labelEmpty ? ' is-empty' : ''}${isCur(cursor ?? null, 'l', r) ? ' is-cur' : ''}${last ? ' is-last' : ''}`}
            aria-label={`Ligne ${r + 1}`}
            onClick={() => onLabel?.(r)}
          >
            {row.label}
          </button>
        ) : (
          <div className={`sign-table__c sign-table__lab${last ? ' is-last' : ''}`}>{row.label}</div>
        );
        return (
          <div key={r} className="sign-table__row">
            {lab}
            {row.cells.map((v, c) => {
              const cls = `sign-table__c ${SIGN_CLASS[v] ?? 'is-empty'}${c % 2 === 1 ? ' is-root' : ''}${last ? ' is-last' : ''}${row.marks?.[c] ? ` is-${row.marks[c]}` : ''}${ghost?.[c] ? ' is-ghost' : ''}${isCur(cursor ?? null, 'c', r, c) ? ' is-cur' : ''}`;
              return row.cellsEditable ? (
                <button key={c} type="button" className={cls} aria-label={`Ligne ${r + 1}, colonne ${c + 1}`} onClick={() => onCell?.(r, c)}>
                  <span>{v}</span>
                </button>
              ) : (
                <div key={c} className={cls}>
                  <span>{v}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/** Étiquette d'une ligne : LaTeX d'une expression (fraction pour un quotient). */
export const LineLabel = ({ latex }: { latex: string }) => <MathView latex={latex} />;
