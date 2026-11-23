import type { ReactNode } from 'react';
import type { Answer, CourseDef, Outcome, Question } from '@pom/engine';

export type QProps<K extends Question['kind']> = {
  q: Extract<Question, { kind: K }>;
  course: CourseDef;
  /** Après la réponse : plus de saisie, les marques de correction se posent sur la question. */
  locked: boolean;
  onAnswer: (a: Answer, o: Outcome) => void;
  /** En tête du corps (la pastille du cours et de l'exercice, posée par l'écran). */
  header?: ReactNode;
  /** En bas une fois la question verrouillée (explication et « Continuer », posés par l'écran). */
  footer?: ReactNode;
};

/**
 * Cadre commun d'une question : le corps (`.q-body`) puis, en bas, le clavier ou « Valider » tant qu'elle est ouverte,
 * le pied de l'écran (`footer`) une fois verrouillée.
 */
export function QFrame({ header, footer, locked, foot, children }: { header?: ReactNode; footer?: ReactNode; locked: boolean; foot?: ReactNode; children: ReactNode }) {
  return (
    <>
      <div className="q-body">
        {header}
        {children}
      </div>
      {locked ? footer && <div className="q-foot">{footer}</div> : foot}
    </>
  );
}

/** Bouton « Valider » plein largeur des questions qu'on touche (étiquettes, classer). */
export function ValidateFoot({ enabled, onSubmit }: { enabled: boolean; onSubmit: () => void }) {
  return (
    <div className="q-foot">
      <button className="btn btn--contained btn--block" type="button" disabled={!enabled} onClick={() => enabled && onSubmit()}>
        Valider
      </button>
    </div>
  );
}
