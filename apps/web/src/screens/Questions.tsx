import { useEffect } from 'react';
import { courseNumberLabel, getCourse } from '@pom/engine';
import { go, toHash } from '../router';
import { refreshQuestions, useMyQuestions } from '../store/questions';
import { AppBar } from '../ui/AppBar';

export const courseKicker = (courseId: string): string => {
  try {
    return courseNumberLabel(courseId);
  } catch {
    return 'Cours';
  }
};

/** « Mes questions » : les demandes envoyées à Clément, la réponse en dessous de la question. */
export default function Questions() {
  const list = useMyQuestions();
  useEffect(() => {
    document.title = 'Mes questions';
    void refreshQuestions();
  }, []);
  return (
    <>
      <AppBar onClose={() => go('#/')} closeLabel="Retour à l'accueil" title="Mes questions" />
      <main className="app-body" data-screen="questions">
        {list.length === 0 && <p className="t-body1">Tu n'as pas encore posé de question. Après une erreur, touche « Demander à Clément ».</p>}
        <ul className="qlist">
          {list.map((q) => (
            <li key={q.id} className="card card--outlined qitem" data-unread={q.answer !== null && q.readAt === null ? 'true' : undefined}>
              <div className="kicker">{`${courseKicker(q.courseId)} · ${q.calc}`}</div>
              {q.answer !== null ? (
                <>
                  {q.readAt === null && <span className="chip">Nouvelle réponse</span>}
                  <p className="t-caption">{`Réponse de ${q.answeredBy ?? 'Clément'}`}</p>
                  <p className="t-body1 qitem__answer">{q.answer}</p>
                </>
              ) : (
                <p className="t-body2">{q.pending ? 'Envoyée, en attente de réseau' : 'Pas encore de réponse'}</p>
              )}
              <a className="btn btn--text" href={toHash({ name: 'question', id: q.id })}>Ouvrir</a>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
