// buildQuestion: one builder per kind of exercise (doc 04 §1–§8).
import type { CourseDef } from '../../courses/types';
import type { BuildCtx, Question, QuestionKind } from '../types';
import { buildClasser } from './classer';
import { buildDroite } from './droite';
import { buildErreur } from './erreur';
import { buildOrdre } from './ordre';
import { buildPaires } from './paires';
import { buildQcm } from './qcm';
import { buildSaisie } from './saisie';
import { buildSigne } from './signe';
import { buildTrou } from './trou';
import { buildVraiFaux } from './vraifaux';

/** « choix », « reecrire » et « resoudre » n'ont pas de générateur : ils viennent du contenu d'un cours. */
type GenericKind = Exclude<QuestionKind, 'choix' | 'reecrire' | 'resoudre' | 'calculer' | 'intervalle'>;
const BUILDERS: Record<GenericKind, (course: CourseDef, ctx: BuildCtx) => Question> = {
  saisie: buildSaisie,
  trou: buildTrou,
  ordre: buildOrdre,
  erreur: buildErreur,
  paires: buildPaires,
  classer: buildClasser,
  qcm: buildQcm,
  vraifaux: buildVraiFaux,
  droite: (course, ctx) => buildDroite(course, ctx.rng),
};

/**
 * A question of this kind on the course. The course's own builder comes first (Cours 0);
 * a course that checks its own questions has no numeric answer, so it has no generic builder.
 */
export function buildQuestion(course: CourseDef, kind: QuestionKind, ctx: BuildCtx): Question {
  const custom = course.customQuestion?.(kind, ctx);
  if (custom) return custom;
  if (course.customCheck) throw new Error(`Exercice « ${kind} » indisponible pour ${course.id}`);
  if (kind === 'choix' || kind === 'reecrire' || kind === 'resoudre' || kind === 'calculer' || kind === 'intervalle') throw new Error(`Exercice « ${kind} » sans générateur`);
  return BUILDERS[kind](course, ctx);
}

/** A slot of a review or training: a kind of question, or « signe » (a QCM « + / − »). */
export type Slot = QuestionKind | 'signe';

/** The question of a slot; « droite » only at level 1 (8 graduations), « saisie » otherwise. */
export function buildSlot(course: CourseDef, slot: Slot, ctx: BuildCtx): Question {
  if (slot === 'signe') return buildSigne(course, ctx);
  if (slot === 'droite' && ctx.level !== 1) return buildQuestion(course, 'saisie', ctx);
  return buildQuestion(course, slot, ctx);
}
