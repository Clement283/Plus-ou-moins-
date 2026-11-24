import type { Outcome, Question } from '@pom/engine';

export interface AskClementProps {
  courseId: string;
  question: Question;
  outcome: Outcome;
  /** Texte de la correction affichée à l'élève. */
  correction: string;
}

/** « Demander à Clément » sous un retour d'erreur : emplacement câblé par la tâche 1, rempli par la tâche 11. */
export function AskClement(_props: AskClementProps) {
  return null;
}
