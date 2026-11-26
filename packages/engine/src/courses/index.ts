import type { ErrorFamily } from '../events';
import { type Rational, eqRat } from '../math/rational';
import { CALCULS, CALCULS_COURSES } from './calculs';
import { ESSAIS, ESSAIS_COURSES } from './essais';
import type { CourseDef, Exercise, ModuleDef } from './types';

export * from './types';
export { MEMO_BEFORE_VALIDATION, canOpenMemo } from './memo';
/** The LaTeX of a writing cut into pieces (Cours 0), for showing a calculation as it was written. */
export { joinPieces } from './calculs/c00-bien-ecrire';

export const MODULES: ModuleDef[] = [CALCULS];
/** Module d'essais : hors de MODULES, réservé aux comptes « aperçu ». */
export { ESSAIS };

/**
 * Le numéro affiché d'un cours (`order`, « Cours 3 ») est **calculé** : sa place dans son module, qui repart de
 * `firstNumber` (1 par défaut, 0 pour Relatifs). Insérer un cours décale donc les numéros de son module tout seul ;
 * l'identifiant (`id`) ne change jamais. Les cours « Essais », hors de MODULES, gardent le `order` de leur fichier.
 */
const NUMBER = new Map<string, number>(
  MODULES.flatMap((m) => m.courseIds.map((id, i) => [id, (m.firstNumber ?? 1) + i] as [string, number])),
);
const COURSES = new Map<string, CourseDef>(
  [...CALCULS_COURSES, ...ESSAIS_COURSES].map((c) => [c.id, NUMBER.has(c.id) ? { ...c, order: NUMBER.get(c.id)! } : c]),
);

/** Rang global d'un cours (ordre des modules puis ordre dans le module) : sert à trier des cours de modules différents. */
const GLOBAL_RANK = new Map(MODULES.flatMap((m) => m.courseIds).map((id, i) => [id, i]));
export const courseRank = (id: string): number => GLOBAL_RANK.get(id) ?? Number.MAX_SAFE_INTEGER;

/** « Cours 3 », ou « Équations · Cours 3 » dès qu'il y a plusieurs modules (les numéros repartent dans chaque module). */
export function courseNumberLabel(id: string): string {
  const c = getCourse(id);
  if (MODULES.length < 2) return `Cours ${c.order}`;
  const m = MODULES.find((x) => x.courseIds.includes(id));
  return m ? `${m.title} · Cours ${c.order}` : `Cours ${c.order}`;
}

export function getCourse(id: string): CourseDef {
  const c = COURSES.get(id);
  if (!c) throw new Error(`Cours inconnu : ${id}`);
  return c;
}

export function getModule(id: string): ModuleDef {
  const m = MODULES.find((x) => x.id === id);
  if (!m) throw new Error(`Module inconnu : ${id}`);
  return m;
}

/**
 * The recognised error of a wrong answer: the first matching error of the course's list,
 * otherwise « autre ». null when the answer is right, and null for a course that checks its
 * own questions (`customCheck`, e.g. Cours 0, whose exercises have no numeric answer).
 */
export function diagnose(
  course: CourseDef,
  ex: Exercise,
  given: Rational,
): { errorType: string; family: ErrorFamily } | null {
  if (course.customCheck || eqRat(given, ex.answer)) return null;
  const err = course.errors.find((e) => e.detect(ex, given));
  return err ? { errorType: err.id, family: err.family } : { errorType: 'autre', family: 'autre' };
}
