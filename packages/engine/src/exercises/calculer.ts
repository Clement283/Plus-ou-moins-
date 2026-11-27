// « Calculer par lignes » (maquette docs/design/ecrans/equations-resolution-ligne.html, état 8, validée le 2026-11-26) :
// l'élève remplace x puis calcule étape par étape, puis compare les deux membres (est-ce une solution ?).
// Ici : la question, le retour de chaque ligne et la note de la question entière (juste si aucune ligne n'a été fausse
// en route et si le 1er verdict est le bon).
import type { Exercise } from '../courses/types';
import { type Equation, type Member, evalMember, memberLatex, substitute } from '../math/equation';
import { evaluate } from '../math/expr';
import {
  type CalcErrorId,
  type CalcErrorKind,
  calcSteps,
  calcTokensLatex,
  exprTokens,
  judgeCalcLine,
  parseCalc,
  tokensKey,
} from '../math/calcul';
import { type Rational, eqRat, rat, ratToString } from '../math/rational';

export interface CalculerQuestion {
  kind: 'calculer';
  ex: Exercise;
  /** L'équation, en LaTeX (−3x + 7 = −5). */
  eqLatex: string;
  xValue: number;
  /** Le membre à calculer, avec x remplacé : −3 × 4 + 7. */
  start: ReturnType<typeof substitute>;
  /** Les écritures acceptées pour la 1re ligne (clés, voir `parseCalc`). */
  first: string[];
  /** La valeur du membre à calculer et celle de l'autre membre. */
  value: Rational;
  other: Rational;
  /** Les deux membres sont égaux : x est solution. */
  isSolution: boolean;
  /** Exemple guidé : l'indice du cours est affiché d'office à chaque ligne, sans bouton. */
  guided?: true;
}

/** La question « calcule le membre de gauche (ou de droite) pour x = … » d'une équation. */
export function calculerQuestion(ex: Exercise, eq: Equation, xValue: number, side: 'left' | 'right' = 'left'): CalculerQuestion {
  const member: Member = side === 'left' ? eq.left : eq.right;
  const otherMember: Member = side === 'left' ? eq.right : eq.left;
  const start = substitute(member, xValue);
  const value = evaluate(start);
  const other = evalMember(otherMember, rat(xValue));
  return {
    kind: 'calculer',
    ex,
    eqLatex: `${memberLatex(eq.left)} = ${memberLatex(eq.right)}`,
    xValue,
    start,
    first: [tokensKey(exprTokens(start))],
    value,
    other,
    isSolution: eqRat(value, other),
  };
}

/** Texte brut d'une valeur : −5, 3/2. */
export const valueText = (v: Rational): string => ratToString(v).replace(/-/g, '−');

export const CALC_PARSE_TEXT: Record<CalcErrorKind, string> = {
  vide: 'Tape une ligne avant de valider.',
  'signe-inconnu': 'Cette ligne contient un signe que je ne connais pas.',
  'mal-ecrit': 'Cette ligne est mal écrite. Exemple : −3 × 4 + 7.',
  zero: 'On ne divise jamais par 0.',
  'negatif-sans-parentheses': 'Un nombre négatif se met entre parenthèses, sauf au début : 5 − (−3).',
};

export const CALC_ERROR_TEXT: Record<CalcErrorId, { title: string; message: string }> = {
  priorite: { title: 'On fait d’abord les × et les ÷.', message: 'Les multiplications et les divisions passent avant les additions et les soustractions.' },
  signe: {
    title: 'Erreur de signe.',
    message: 'Reprends la règle des signes : même signe, résultat positif ; signes différents, résultat négatif.',
  },
  autre: { title: 'Cette ligne n’a pas la même valeur.', message: 'Reprends la ligne d’avant et calcule une seule opération.' },
};

export type CalcLineResult =
  /** Pas comptée : la ligne reste à corriger. */
  | { kind: 'illisible' | 'sans-remplacer' | 'recopiee' | 'plus-longue'; title: string; message: string }
  | { kind: 'fausse'; errorId: CalcErrorId; title: string; message: string }
  | { kind: 'juste'; final: boolean; title: string; message: string };

/** Le retour d'une ligne tapée après `prevText` (null : la 1re ligne). */
export function judgeTypedCalcLine(q: CalculerQuestion, prevText: string | null, typed: string): CalcLineResult {
  const v = judgeCalcLine(prevText, typed, q.first);
  switch (v.kind) {
    case 'illisible':
      return { kind: 'illisible', title: 'Je ne peux pas lire cette ligne.', message: CALC_PARSE_TEXT[v.error] };
    case 'sans-remplacer':
      return {
        kind: 'sans-remplacer',
        title: 'Commence par remplacer x.',
        message: 'Écris le calcul en mettant la valeur de x à la place de x, entre parenthèses si elle est négative.',
      };
    case 'recopiee':
      return { kind: 'recopiee', title: 'C’est la même ligne.', message: 'Calcule une opération pour avancer.' };
    case 'plus-longue':
      return { kind: 'plus-longue', title: 'Cette ligne est plus longue.', message: 'Chaque ligne doit avoir moins d’opérations que la précédente, ou en changer une.' };
    case 'fausse':
      return { kind: 'fausse', errorId: v.errorId, ...CALC_ERROR_TEXT[v.errorId] };
    case 'juste':
      return { kind: 'juste', final: v.final, title: 'Ligne juste.', message: v.final ? '' : 'Continue jusqu’à obtenir un seul nombre.' };
  }
}

/** L'indice : l'étape suivante de la méthode du cours. */
export function calcHint(q: CalculerQuestion, prevText: string | null): string {
  if (prevText === null) return `Remplace x par ${q.xValue < 0 ? `(${valueText(rat(q.xValue))})` : q.xValue} dans le membre de gauche.`;
  const p = parseCalc(prevText);
  if (!p.ok) return 'Corrige d’abord ta ligne.';
  if (/[*/]/.test(p.key)) return 'Commence par la multiplication ou la division : elle passe avant l’addition.';
  return 'Additionne ou soustrais de gauche à droite.';
}

/** La méthode du cours, ligne par ligne, en LaTeX. */
export const courseCalcLines = (q: CalculerQuestion): string[] => calcSteps(exprTokens(q.start)).map(calcTokensLatex);

/**
 * La note de la question : on rejoue toutes les lignes validées (fausses comprises, dans l'ordre). Une ligne illisible,
 * recopiée ou plus longue n'est pas une erreur ; la 1re ligne fausse est celle qu'on garde.
 */
export function gradeCalcul(q: CalculerQuestion, lines: string[]): {
  finished: boolean;
  firstError: CalcErrorId | null;
  firstErrorText: { title: string; message: string } | null;
} {
  let prev: string | null = null;
  let finished = false;
  let firstError: CalcErrorId | null = null;
  let firstErrorText: { title: string; message: string } | null = null;
  for (const typed of lines) {
    const r = judgeTypedCalcLine(q, prev, typed);
    if (r.kind === 'juste') {
      prev = typed;
      finished = r.final;
    } else if (r.kind === 'fausse' && firstError === null) {
      firstError = r.errorId;
      firstErrorText = { title: r.title, message: r.message };
    }
  }
  return { finished, firstError, firstErrorText };
}

/** Le verdict : « solution » ou « pas solution ». */
export const verdictText = (isSolution: boolean): string => (isSolution ? 'solution' : 'pas solution');
