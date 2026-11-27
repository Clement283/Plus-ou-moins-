// Outils communs aux cours du module 3 « Priorités » : un exercice est un calcul écrit comme au clavier
// (`10 - 3 + 2`, `2 * [10 - (4 + 2)]`), lu par `parseCalc` ; la méthode du cours est `calcSteps` ; les erreurs
// reconnues viennent de `errorCandidates` (gauche à droite, priorité, parenthèse ignorée, intérieure oubliée, signe).
// Rien ici ne dessine : l'écran est « Calculer par lignes » (calcul seul) ou la saisie du résultat.
import {
  type CalcErrorId,
  type CNode,
  calcSteps,
  calcTokensLatex,
  errorCandidates,
  parseCalc,
  textTokens,
} from '../../math/calcul';
import { type Expr, num, op } from '../../math/expr';
import { rat } from '../../math/rational';
import { randInt, pick, type Rng } from '../../rng';
import { calculerCalcul } from '../../exercises/calculer';
import type { QuestionKind } from '../../events';
import type { BuildCtx } from '../../exercises/types';
import type { Outcome, Question } from '../../exercises/types';
import type { CalculerQuestion } from '../../exercises/calculer';
import type { ErrorDef, Exercise, Level } from '../types';
import { buildErrors, explanation, is, redraw, type ErrorSpec } from '../calculs/shared';

// ——— Un calcul écrit comme au clavier ———

const exprOf = (n: CNode): Expr => {
  switch (n.t) {
    case 'n': return num(n.v);
    case 'b': return op(n.o, exprOf(n.a), exprOf(n.b));
    case 'g': return exprOf(n.e);
    case 'm': return op('*', num(-1), exprOf(n.e));
  }
};

/** Le calcul de départ d'un exercice (texte du clavier). */
export const textOf = (ex: Exercise): string => (ex.meta as { text: string }).text;
export const treeOf = (text: string): CNode => {
  const p = parseCalc(text);
  if (!p.ok) throw new Error(`Calcul illisible : ${text}`);
  return p.tree;
};
export const latexOfText = (text: string): string => calcTokensLatex(textTokens(text) ?? []);
/** Texte à lire pour un calcul : « 10 − 3 + 2 ». */
export const readable = (text: string): string => text.replace(/-/g, '−').replace(/\*/g, '×').replace(/\//g, '÷').replace(/\s+/g, ' ');

/** Un calcul est « propre » : toutes les étapes de la méthode tombent juste, nombres lisibles, largeur de téléphone. */
export function clean(text: string, maxLen = 28, maxAbs = 200): boolean {
  const tokens = textTokens(text);
  if (!tokens || text.length > maxLen) return false;
  try {
    return calcSteps(tokens).every((line) => line.every((t) => t.k !== 'n' || (t.v.d === 1 && Math.abs(t.v.n) <= maxAbs)));
  } catch {
    return false;
  }
}

export function mkEx(courseId: string, level: Level, text: string, extra: Record<string, unknown> = {}): Exercise {
  const p = parseCalc(text);
  if (!p.ok) throw new Error(`Calcul illisible : ${text}`);
  return { courseId, level, expr: exprOf(p.tree), answer: p.value, meta: { text, ...extra } };
}

/** La résolution d'un cours : le calcul, puis une ligne par opération. */
export function resolutionOf(ex: Exercise): string[] {
  const lines = calcSteps(textTokens(textOf(ex)) ?? []).map(calcTokensLatex);
  return lines.map((l, i) => (i === 0 ? l : `= ${l}`));
}

/** Écrire un entier dans un calcul : un négatif entre parenthèses sauf en tête. */
export const fmt = (n: number, first = false): string => (n < 0 ? (first ? `${n}` : `(${n})`) : `${n}`);
export const rnd = (rng: Rng, [lo, hi]: [number, number]): number => randInt(rng, lo, hi);
export const coin = (rng: Rng, p = 0.5): boolean => rng() < p;
export const sgn = (rng: Rng): '+' | '-' => (rng() < 0.5 ? '+' : '-');
export { pick };

/** Deux nombres qui font la somme s : « 7 + 2 » ou « 11 - 2 » (les deux positifs). */
export function sumText(rng: Rng, s: number, max = 9): string {
  if (s >= 2 && coin(rng)) {
    const a = rnd(rng, [Math.max(1, s - max), Math.min(max, s - 1)]);
    return `${a} + ${s - a}`;
  }
  const c = rnd(rng, [1, max]);
  return s + c >= 1 ? `${s + c} - ${c}` : `${c + s} + ${-c}`;
}

/** Un produit à facteurs et diviseurs qui tombent juste : liste de facteurs et opérations ; renvoie le texte et la valeur. */
export function mulBlock(rng: Rng, len: number, range: [number, number], allowNeg: boolean, first: boolean): { text: string; value: number } {
  let v = rnd(rng, range) * (allowNeg && coin(rng, 0.35) ? -1 : 1);
  let text = fmt(v, first);
  for (let k = 1; k < len; k++) {
    const divisors = [2, 3, 4, 5, 6, 7, 8, 9].filter((d) => v % d === 0);
    if (divisors.length > 0 && coin(rng, 0.5)) {
      const d = pick(rng, divisors) * (allowNeg && coin(rng, 0.3) ? -1 : 1);
      text += ` / ${fmt(d)}`;
      v = v / d;
    } else {
      const f = rnd(rng, [2, 9]) * (allowNeg && coin(rng, 0.35) ? -1 : 1);
      text += ` * ${fmt(f)}`;
      v *= f;
    }
  }
  return { text, value: v };
}

// ——— Erreurs reconnues ———

export interface ErrDef {
  id: Exclude<CalcErrorId, 'autre'>;
  family: ErrorDef['family'];
  rule: NonNullable<ErrorDef['rule']>;
  /** Le message de cette erreur sur ce calcul (une phrase). */
  text: (ex: Exercise) => string;
}

/** Les valeurs fausses de l'erreur `id` sur ce calcul, entières et différentes de la bonne réponse. */
export const wrongOf = (ex: Exercise, id: ErrDef['id']): number[] => {
  const out = errorCandidates(treeOf(textOf(ex)))
    .filter((c) => c.id === id && c.value.d === 1 && c.value.n !== ex.answer.n)
    .map((c) => c.value.n);
  return [...new Set(out)];
};
/** Valeurs fausses de l'erreur, sans exiger un entier (pour reconnaître une réponse tapée). */
const hits = (ex: Exercise, id: ErrDef['id'], given: { n: number; d: number }): boolean =>
  errorCandidates(treeOf(textOf(ex))).some((c) => c.id === id && c.value.n === given.n && c.value.d === given.d);

/** Les ErrorDef d'un cours, dans l'ordre de la liste (la 1re erreur reconnue gagne). */
export function makeErrors(defs: ErrDef[], gen: (level: Level, rng: Rng) => Exercise): ErrorDef[] {
  const specs: ErrorSpec[] = defs.map((d) => ({
    id: d.id,
    family: d.family,
    detect: (ex, given) => hits(ex, d.id, given),
    text: d.text,
    draw: (level, rng) => redraw(() => gen(level, rng), (ex) => wrongOf(ex, d.id).length > 0),
    sample: (ex) => wrongOf(ex, d.id)[0] as number,
    alsoWrong: (ex) => wrongOf(ex, d.id).slice(1),
  }));
  return buildErrors(specs, resolutionOf).map((e): ErrorDef => ({ ...e, rule: defs.find((d) => d.id === e.id)?.rule as NonNullable<ErrorDef['rule']> }));
}

// ——— Questions ———

export const saisieOf = (ex: Exercise): Question => ({ kind: 'saisie', ex, promptLatex: `${latexOfText(textOf(ex))} = \\square` });
/** « Calculer par lignes » à partir du calcul seul. */
/** L'exemple guidé : l'indice du cours est affiché d'office. */
export const calculerGuided = (ex: Exercise): CalculerQuestion => ({ ...calculerCalcul(ex, textOf(ex), 'A'), guided: true });
export const calculerOf = (ex: Exercise): Question => calculerCalcul(ex, textOf(ex), 'A');

/** `customQuestion` d'un cours : saisie du résultat ou calcul par lignes, sur le calcul-piège s'il y en a un. */
export const customOf =
  (course: () => { errors: ErrorDef[]; generate: (level: Level, rng: Rng) => Exercise }) =>
  (kind: QuestionKind, ctx: BuildCtx): Question | null => {
    if (kind !== 'saisie' && kind !== 'calculer') return null;
    const c = course();
    const trap = c.errors.find((e) => e.id === ctx.trapErrorType);
    const ex = trap ? trap.trap(ctx.level, ctx.rng) : c.generate(ctx.level, ctx.rng);
    return kind === 'saisie' ? saisieOf(ex) : calculerOf(ex);
  };

/** Le retour d'une saisie ratée : le message de l'erreur reconnue, sinon la méthode. */
export const feedbackOf =
  (errors: () => ErrorDef[], generic: (ex: Exercise) => string) =>
  (q: Question, o: Outcome): string | null => {
    if (o.correct || o.unfinished || o.errorFamily === 'ecriture' || q.kind !== 'saisie') return null;
    const known = errors().find((e) => e.id === o.errorType);
    return known ? known.explain(q.ex).rule : generic(q.ex);
  };

export const explainOf = (rule: string) => (ex: Exercise) => explanation(rule, resolutionOf(ex));
export { is, rat };
