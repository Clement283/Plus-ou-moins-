// « Réécris » : normalisation de la réponse tapée (espaces, - ASCII, * ou x, /).
export function normalizeCalc(s: string): string {
  return s
    .replace(/\s+/g, '')
    .replace(/-/g, '−')
    .replace(/[*x]/g, '×')
    .replace(/\//g, '÷');
}
