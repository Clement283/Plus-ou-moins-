import type { ReactNode } from 'react';
import type { Answer, CourseDef, Outcome, Question } from '@pom/engine';
import { Classer } from './Classer';
import { Erreur } from './Erreur';
import { ErreurEcriture } from './ErreurEcriture';
import { Ordre } from './Ordre';
import { Paires } from './Paires';
import { Qcm, isSignBox } from './Qcm';
import { Saisie } from './Saisie';
import { Signe } from './Signe';
import { Trou } from './Trou';
import { WRITING_COURSE } from './calc';
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
}

/**
 * Une question, quel que soit son type : consigne, calcul, façon de répondre et, une fois verrouillée, les marques
 * de correction sur place. Ni explication ni « Continuer » : c'est l'écran appelant qui les pose (`footer`).
 * À remonter avec une `key` par question : la saisie en cours appartient au composant.
 */
export function QuestionView({ question: q, course, locked, onAnswer, header, footer }: QuestionViewProps) {
  const common = { course, locked, onAnswer, header, footer };
  switch (q.kind) {
    case 'saisie': return <Saisie q={q} {...common} />;
    case 'trou': return <Trou q={q} {...common} />;
    case 'ordre': return <Ordre q={q} {...common} />;
    case 'erreur': return q.ex.courseId === WRITING_COURSE ? <ErreurEcriture q={q} {...common} /> : <Erreur q={q} {...common} />;
    case 'paires': return <Paires q={q} {...common} />;
    case 'classer': return <Classer q={q} {...common} />;
    case 'qcm': return isSignBox(q) ? <Signe q={q} {...common} /> : <Qcm q={q} {...common} />;
    case 'vraifaux': return <VraiFaux q={q} {...common} />;
  }
}
