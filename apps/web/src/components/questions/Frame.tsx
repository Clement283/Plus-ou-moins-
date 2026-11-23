import type { ReactNode } from 'react';
import type { Answer, CourseDef, Outcome, PartTexts, Question } from '@pom/engine';

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
};

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
 * le pied de l'écran (`footer`) une fois verrouillée.
 */
export function QFrame({ header, footer, locked, foot, notice, children }: { header?: ReactNode; footer?: ReactNode; locked: boolean; foot?: ReactNode; notice?: ReactNode; children: ReactNode }) {
  return (
    <>
      <div className="q-body">
        {header}
        {children}
        {!locked && notice}
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
