// « Réécris » : normalisation de la réponse tapée (espaces, - ASCII, * ou x, /, = final isolé ignoré).
export function normalizeCalc(s: string): string {
  return s
    .replace(/\s+/g, '')
    .replace(/-/g, '−')
    .replace(/[*x]/g, '×')
    .replace(/\//g, '÷')
    .replace(/=$/, '');
}
