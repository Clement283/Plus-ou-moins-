import type { ReactNode } from 'react';
import type { Activity, Answer, CourseDef, Outcome, PartTexts, Question } from '@pom/engine';
import { Choix } from './Choix';
import { Classer } from './Classer';
import { Erreur } from './Erreur';
import { ErreurEcriture } from './ErreurEcriture';
import { Ordre } from './Ordre';
import { Paires } from './Paires';
import { Qcm, isSignBox } from './Qcm';
import { Reecrire } from './Reecrire';
import { Saisie } from './Saisie';
import { Signe } from './Signe';
import { Trou } from './Trou';
import { WRITING_COURSE } from './calc';
import type { PreviousChoix } from './Frame';
import { VraiFaux } from './VraiFaux';

export interface QuestionViewProps {
  question: Question;
  course: CourseDef;
  /** Après la réponse : plus de saisie, les marques de correction se posent sur la question. */
  locked: boolean;
  onAnswer: (a: Answer, o: Outcome) => void;
  /** En tête du corps (pastille du cours et de l'exercice). */
  header?: ReactNode;
  /** En bas une fois verrouillée (explication, « Continuer »). Remplace le clavier ou « Valider ». */
  footer?: ReactNode;
  /** Sous le champ de réponse tant que la question reste ouverte (types à saisie : retour « Simplifie »). */
  notice?: ReactNode;
  /** Titre, sous-titre et consigne de l'écran de leçon (doc 09). */
  texts?: PartTexts;
  /** Activité de la question : `decouverte` = elle ne compte pas dans la note (mention sous la question). */
  activity?: Activity;
  /** Deux questions par écran (`joinPrevious`) : la question d'avant et la réponse donnée, résumées en haut. */
  previous?: PreviousChoix;
}

/**
 * Une question, quel que soit son type : consigne, calcul, façon de répondre et, une fois verrouillée, les marques
 * de correction sur place. Ni explication ni « Continuer » : c'est l'écran appelant qui les pose (`footer`).
 * À remonter avec une `key` par question : la saisie en cours appartient au composant.
 */
export function QuestionView({ question: q, course, locked, onAnswer, header, footer, notice, texts, activity, previous }: QuestionViewProps) {
  const common = { course, locked, onAnswer, header, footer, notice, texts, activity, previous };
  switch (q.kind) {
    case 'saisie': return <Saisie q={q} {...common} />;
    case 'trou': return <Trou q={q} {...common} />;
    case 'ordre': return <Ordre q={q} {...common} />;
    case 'erreur': return q.ex.courseId === WRITING_COURSE ? <ErreurEcriture q={q} {...common} /> : <Erreur q={q} {...common} />;
    case 'paires': return <Paires q={q} {...common} />;
    case 'classer': return <Classer q={q} {...common} />;
    case 'qcm': return isSignBox(q) ? <Signe q={q} {...common} /> : <Qcm q={q} {...common} />;
    case 'vraifaux': return <VraiFaux q={q} {...common} />;
    case 'choix': return <Choix q={q} {...common} />;
    case 'reecrire': return <Reecrire q={q} {...common} />;
  }
}
