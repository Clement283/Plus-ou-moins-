// Briques communes aux cours « ax = c » et « ax + b = c » du module Équations et inéquations :
// l'exercice (équation portée par `meta`), les questions « x = ▢ » et « À toi de résoudre », le constructeur de questions.
import { num, op } from '../../math/expr';
import { equation, equationLatex, cst, xt, type Equation } from '../../math/equation';
import { rat } from '../../math/rational';
import type { Rng } from '../../rng';
import type { BuildCtx, Question } from '../../exercises/types';
import type { QuestionKind } from '../../events';
import type { ErrorDef, Exercise, Level } from '../types';

/** Les cours à l'essai sont dans le module « Essais » tant qu'ils ne sont pas fusionnés dans leur module. */
export const EQ_MODULE_ID = 'essais';

export interface LinParams {
  a: number;
  b: number;
  c: number;
}

/**
 * ax + b = c (b = 0 : ax = c). `expr` est la division qui donne x, (c − b) ÷ a : elle sert aux écrans qui montrent
 * `ex.expr` (« signe du résultat »). L'équation est dans `meta` (`latex` est affiché en tête des exemples guidés).
 */
export function lin(courseId: string, level: Level, a: number, b: number, c: number): Exercise {
  const eq = startOf({ a, b, c });
  return {
    courseId,
    level,
    expr: op('/', num(c - b), num(a)),
    answer: rat((c - b) / a),
    meta: { a, b, c, latex: equationLatex(eq) },
  };
}

/** Les nombres de l'équation d'un exercice (zéros si l'exercice n'en porte pas : exemple d'un autre cours). */
export function paramsOf(ex: Exercise): LinParams {
  const m = ex.meta ?? {};
  const get = (k: string): number => (typeof m[k] === 'number' ? (m[k] as number) : 0);
  return { a: get('a'), b: get('b'), c: get('c') };
}

export const startOf = ({ a, b, c }: LinParams): Equation => equation(b === 0 ? [xt(a)] : [xt(a), cst(b)], [cst(c)]);
export const latexOfEx = (ex: Exercise): string => equationLatex(startOf(paramsOf(ex)));
/** L'équation écrite en toutes lettres, avec le vrai signe moins : « −4x = 20 ». */
export const textOfEx = (ex: Exercise): string => latexOfEx(ex).replace(/-/g, '−');

/** « x = ▢ » : l'élève tape la valeur de x. */
export const saisieX = (ex: Exercise): Question => ({
  kind: 'saisie',
  ex,
  promptLatex: `${latexOfEx(ex)} \\quad \\text{donc} \\quad x = \\square`,
});

/** « À toi de résoudre » : l'élève écrit chaque ligne avec sa méthode. */
export const resoudreQ = (ex: Exercise): Question => ({ kind: 'resoudre', ex, start: startOf(paramsOf(ex)) });

/** `customQuestion` d'un cours de ce module : « saisie » (x = ▢) et « resoudre », avec le calcul-piège demandé s'il y en a un. */
export function lineQuestions(generate: (level: Level, rng: Rng) => Exercise, errors: () => ErrorDef[]) {
  return (kind: QuestionKind, ctx: BuildCtx): Question | null => {
    if (kind !== 'saisie' && kind !== 'resoudre') return null;
    const trap = ctx.trapErrorType ? errors().find((e) => e.id === ctx.trapErrorType) : undefined;
    const ex = trap ? trap.trap(ctx.level, ctx.rng) : generate(ctx.level, ctx.rng);
    return kind === 'saisie' ? saisieX(ex) : resoudreQ(ex);
  };
}

/** Un nombre écrit entre parenthèses s'il est négatif : (−4). */
export const paren = (n: number): string => (n < 0 ? `(−${-n})` : `${n}`);
/** Un nombre avec le vrai signe moins. */
export const sgn = (n: number): string => (n < 0 ? `−${-n}` : `${n}`);
/** Un nombre en LaTeX, entre parenthèses s'il est négatif : (-4). */
export const parenL = (n: number): string => (n < 0 ? `(${n})` : `${n}`);
/** Le coefficient de x écrit : 3x, −4x. */
export const coefText = (a: number): string => `${sgn(a)}x`;
