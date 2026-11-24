import { useEffect } from 'react';
import { go } from '../router';
import { markRead, refreshQuestions, useMyQuestions } from '../store/questions';
import { AppBar } from '../ui/AppBar';
import { courseKicker } from './Questions';

/** Une question à Clément avec sa réponse ; la voir la marque comme lue. */
export default function QuestionDetail({ id }: { id: string }) {
  const q = useMyQuestions().find((x) => x.id === id);
  useEffect(() => {
    document.title = 'Ma question';
    void refreshQuestions();
  }, []);
  const seen = q !== undefined && q.answer !== null;
  useEffect(() => {
    if (seen) void markRead(id);
  }, [seen, id]);
  return (
    <>
      <AppBar onClose={() => go('#/questions')} closeLabel="Retour à Mes questions" title="Ma question" />
      <main className="app-body" data-screen="question">
        {!q ? (
          <p className="t-body1">Cette question n'existe plus.</p>
        ) : (
          <>
            <div className="kicker">{courseKicker(q.courseId)}</div>
            <section className="card block">
              <p className="t-h3 math">{q.calc}</p>
              <p className="t-body1">Ta réponse : <b className="math">{q.given}</b></p>
              <p className="t-body1">La bonne réponse : <b className="math">{q.expected}</b></p>
              <p className="t-body2">{q.correction}</p>
              {q.note && <p className="t-body2">{`Ton mot : « ${q.note} »`}</p>}
            </section>
            {q.answer !== null ? (
              <section className="card card--outlined qitem">
                <p className="t-caption">{`Réponse de ${q.answeredBy ?? 'Clément'}`}</p>
                <p className="t-body1 qitem__answer">{q.answer}</p>
              </section>
            ) : (
              <p className="t-body1">{q.pending ? 'Envoyée, en attente de réseau.' : 'Pas encore de réponse.'}</p>
            )}
          </>
        )}
      </main>
    </>
  );
}
