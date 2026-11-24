import type { ReactNode } from 'react';
import type { Activity, Answer, CourseDef, Outcome, PartTexts, Question } from '@pom/engine';

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
  /** Sous le champ de réponse, question encore ouverte (retour « Simplifie »). */
  notice?: ReactNode;
  /** Titre, sous-titre et consigne d'un écran de leçon (doc 09). */
  texts?: PartTexts;
  /** Activité de la question (`decouverte` : elle ne compte pas dans la note). */
  activity?: Activity;
  /** Deux questions par écran (`joinPrevious`) : la question juste avant, avec la réponse donnée. */
  previous?: PreviousChoix;
};

/** Une petite question déjà répondue, résumée en haut de l'écran de la suivante. */
export interface PreviousChoix {
  question: Extract<Question, { kind: 'choix' }>;
  choice: number;
  correct: boolean;
}

/**
 * La consigne d'une question : celle de l'écran de leçon (`texts.consigne`) ou la générique. Avec un titre (doc 09,
 * maquette « La leçon »), le titre remplace la consigne : h1 et sous-titre en tête de l'écran.
 */
export function Prompt({ texts, fallback, cls }: { texts?: PartTexts; fallback: string; cls: string }) {
  if (texts?.title) return <LessonHeading title={texts.title} subtitle={texts.subtitle} />;
  return <p className={cls}>{texts?.consigne ?? fallback}</p>;
}

/** Titre d'un écran de leçon et son sous-titre (maquette cours.html : `t-h3` puis `t-body2` en gris). */
export function LessonHeading({ title, subtitle }: { title: string; subtitle?: string | undefined }) {
  return (
    <>
      <h1 className="t-h3">{title}</h1>
      {subtitle && <p className="t-body2 lesson-sub">{subtitle}</p>}
    </>
  );
}

/**
 * Cadre commun d'une question : le corps (`.q-body`) puis, en bas, le clavier ou « Valider » tant qu'elle est ouverte,
 * le pied de l'écran (`footer`) une fois verrouillée. `answer` : ce qu'on touche pour répondre (choix, cases, calculs à
 * ranger), dans une zone collée en bas du corps (`.answer-zone`, doc 08 n° 28) ; le calcul et les consignes restent en haut.
 */
export function QFrame({ header, footer, locked, foot, notice, answer, children }: { header?: ReactNode; footer?: ReactNode; locked: boolean; foot?: ReactNode; notice?: ReactNode; answer?: ReactNode; children: ReactNode }) {
  return (
    <>
      <div className={answer ? 'q-body is-scroll' : 'q-body'}>
        {header}
        {children}
        {!locked && notice}
        {answer && <div className="answer-zone stack">{answer}</div>}
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
