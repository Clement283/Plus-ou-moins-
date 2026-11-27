import { type SceneTable, expectedGrid, factorLatex, rootText, solutionColumns, sortedRoots, wholeLatex } from '@pom/engine';
import { Math as MathView } from '../../ui/Math';
import { SignTable, labelLatex } from '../SignTable';

/**
 * Le tableau de signes d'une scène de leçon (`scene.table`) : mêmes calculs du moteur que la question `tableau`, sans
 * saisie. `upTo` dessine la 1re ligne seule, puis la 1re colonne, puis les signes (de haut en bas : `rows`).
 */
export function SceneTableView({ table }: { table: SceneTable }) {
  const upTo = table.upTo ?? 'signes';
  const grid = expectedGrid(table.op, table.factors);
  const labels = [...table.factors.map(factorLatex), ...(table.op === 'seul' ? [] : [wholeLatex(table.op, table.factors)])];
  const shown = upTo === 'signes' ? (table.rows ?? grid.length) : 0;
  const ghost = table.ghost && upTo === 'signes' ? solutionColumns(grid[grid.length - 1]!, table.ghost) : undefined;
  return (
    <SignTable
      values={sortedRoots(table.factors).map(rootText)}
      {...(ghost ? { ghost } : {})}
      rows={upTo === 'valeurs' ? [] : grid.map((cells, r) => ({ label: <MathView latex={labelLatex(labels[r]!)} />, cells: r < shown ? cells.map(String) : cells.map(() => '') }))}
      caption="Tableau de signes"
    />
  );
}
