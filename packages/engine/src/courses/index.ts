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

const COURSES = new Map<string, CourseDef>([...CALCULS_COURSES, ...ESSAIS_COURSES].map((c) => [c.id, c]));

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
