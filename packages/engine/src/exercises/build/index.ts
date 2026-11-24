// buildQuestion: one builder per kind of exercise (doc 04 §1–§8).
import type { CourseDef } from '../../courses/types';
import type { BuildCtx, Question, QuestionKind } from '../types';
import { buildClasser } from './classer';
import { buildErreur } from './erreur';
import { buildOrdre } from './ordre';
import { buildPaires } from './paires';
import { buildQcm } from './qcm';
import { buildSaisie } from './saisie';
import { buildTrou } from './trou';
import { buildVraiFaux } from './vraifaux';

/** « choix » et « reecrire » n'ont pas de générateur : ils viennent du contenu d'un cours. */
type GenericKind = Exclude<QuestionKind, 'choix' | 'reecrire'>;
const BUILDERS: Record<GenericKind, (course: CourseDef, ctx: BuildCtx) => Question> = {
  saisie: buildSaisie,
  trou: buildTrou,
  ordre: buildOrdre,
  erreur: buildErreur,
  paires: buildPaires,
  classer: buildClasser,
  qcm: buildQcm,
  vraifaux: buildVraiFaux,
};

/**
 * A question of this kind on the course. The course's own builder comes first (Cours 0);
 * a course that checks its own questions has no numeric answer, so it has no generic builder.
 */
export function buildQuestion(course: CourseDef, kind: QuestionKind, ctx: BuildCtx): Question {
  const custom = course.customQuestion?.(kind, ctx);
  if (custom) return custom;
  if (course.customCheck) throw new Error(`Exercice « ${kind} » indisponible pour ${course.id}`);
  if (kind === 'choix' || kind === 'reecrire') throw new Error(`Exercice « ${kind} » sans générateur`);
  return BUILDERS[kind](course, ctx);
}
