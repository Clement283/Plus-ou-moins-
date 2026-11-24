import type { ReactNode } from 'react';
import { Bold } from '../Bold';
import { Math as MathView } from '../../ui/Math';
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
  return (
    <p className={cls}>
      <Bold text={texts?.consigne ?? fallback} />
    </p>
  );
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

/** Série de pratique : « Question n sur N » et un point par question (`data-speak-skip` : « Écouter » ne les lit pas). */
export function SeriesCounter({ series, locked }: { series: { n: number; of: number }; locked: boolean }) {
  const done = series.n - 1 + (locked ? 1 : 0);
  return (
    <div className="series-counter" data-speak-skip>
      <span className="series-counter__n">
        Question <b>{series.n} sur {series.of}</b>
      </span>
      <div className="series-dots" aria-hidden="true">
        {Array.from({ length: series.of }, (_, j) => (
          <i key={j} className={j < done ? 'on' : ''} />
        ))}
      </div>
    </div>
  );
}

/** Exemple guidé : lignes de résolution déjà posées (`above`) puis l'aide de la ligne en cours (`help`). Le calcul de départ reste au-dessus. */
export function Resolution({ texts }: { texts?: PartTexts | undefined }) {
  if (!texts?.above?.length && !texts?.help) return null;
  return (
    <>
      {texts.above && texts.above.length > 0 && (
        <div className="resolution" data-copie>
          {texts.above.map((l, i) => (
            <p key={i} className="resolution__line t-math-md">
              <MathView latex={l} />
            </p>
          ))}
        </div>
      )}
      {texts.help && (
        <div className="help-box">
          <Bold text={texts.help} />
        </div>
      )}
    </>
  );
}

/** Mention sous la question (« ne compte pas ») ; vide ou absente : rien. */
export function Mention({ text }: { text?: string | undefined }) {
  return text ? <p className="t-caption">{text}</p> : null;
}
