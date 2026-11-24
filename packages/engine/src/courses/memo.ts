import type { CourseStatus } from '../srs';

/** Décision du porteur du projet : la fiche mémo est consultable depuis « Mes cours » avant la validation du cours. */
export const MEMO_BEFORE_VALIDATION = true;

/** La fiche mémo d'un cours s'ouvre-t-elle ? Jamais pour un cours verrouillé ou sans fiche. */
export function canOpenMemo(status: CourseStatus, hasMemo: boolean): boolean {
  if (!hasMemo || status === 'verrouille') return false;
  return status === 'valide' || MEMO_BEFORE_VALIDATION;
}
