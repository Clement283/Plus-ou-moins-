import { useEffect, useState } from 'react';
import { QUESTION_LIMITS, getCourse, isAnswerText } from '@pom/engine';
import { ApiError, answerQuestion } from '../api';
import { FollowBar } from '../components/FollowBar';
import { OfflineAlert } from '../components/FollowBits';
import { toHash } from '../router';
import { useSession } from '../store/progress';
import { saveQuestionsCache, useRememberStudent, useStudentQuestions } from '../store/follow';

/** Page de suivi, une demande à Clément : la demande en entier, un champ de réponse (maquette `nouvelles-fonctions.html` §3, côté Clément). */

export default function SuiviQuestion({ eleve, id }: { eleve: string; id: string }) {
  const session = useSession();
  const { data, failed } = useStudentQuestions(eleve);
  useRememberStudent(eleve);
  const q = data?.find((x) => x.id === id);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);
  const back = toHash({ name: 'suivi' });

  useEffect(() => {
    document.title = 'Demande';
  }, []);
  // Une réponse déjà donnée préremplit le champ (« Modifier ma réponse »), une seule fois.
  useEffect(() => {
    if (q && !seeded) {
      setSeeded(true);
      if (q.answer) setText(q.answer);
    }
  }, [q, seeded]);

  if (!q)
    return (
      <>
        <FollowBar back={back} backLabel="Retour au suivi" title="" />
        <main className="app-body" data-screen="suivi-question">
          {failed && !data ? <OfflineAlert /> : data ? <p className="t-body1">Cette demande n'existe plus.</p> : null}
        </main>
      </>
    );

  const answered = q.answer !== null;
  const tooLong = text.length > QUESTION_LIMITS.answer;
  const valid = isAnswerText(text);
  const order = (() => {
    try {
      return getCourse(q.courseId).order;
    } catch {
      return null;
    }
  })();

  async function send() {
    if (!valid || sending || !session || !q) return;
    setSending(true);
    setError(null);
    const answer = text.trim();
    try {
      await answerQuestion(session.token, eleve, q.id, answer);
      const next = (data ?? []).map((x) =>
        x.id === q.id ? { ...x, answer, answeredAt: Date.now(), answeredBy: session.user.id } : x,
      );
      void saveQuestionsCache(session.user.id, eleve, next);
      window.location.hash = back;
    } catch (e) {
      setSending(false);
      if (e instanceof ApiError && e.status === 403) setError('Tu ne suis plus cette élève.');
      else if (e instanceof ApiError && e.status === 0) setError('Pas de connexion. Réessaie quand tu as du réseau.');
      else setError("La réponse n'est pas partie. Réessaie dans un instant.");
    }
  }

  return (
    <>
      <FollowBar back={back} backLabel="Retour au suivi" title="Demande" />
      <main className="app-body" data-screen="suivi-question">
        {order !== null && <div className="kicker">Cours {order}</div>}
        <section className="card block" aria-labelledby="hq">
          <h1 className="t-h5" id="hq">
            Le calcul
          </h1>
          <p className="t-h2">{q.calc}</p>
          <div className="fact">
            <span className="fact__label">Sa réponse</span>
            <span className="fact__value">{q.given}</span>
          </div>
          <div className="fact">
            <span className="fact__label">La bonne réponse</span>
            <span className="fact__value">{q.expected}</span>
          </div>
          <p className="t-body2">{q.correction}</p>
        </section>
        {q.note && (
          <section className="card block" aria-labelledby="hnote">
            <h2 className="t-h5" id="hnote">
              Son mot
            </h2>
            <p className="t-body1">« {q.note} »</p>
          </section>
        )}
        {answered && (
          <section className="card block" aria-labelledby="hans">
            <h2 className="t-h5" id="hans">
              Ta réponse actuelle
            </h2>
            <p className="t-body1">{q.answer}</p>
          </section>
        )}
        <div className="field">
          <label className="field__label" htmlFor="reponse-clement">
            {answered ? 'Ta réponse' : 'Ton explication'}
          </label>
          <textarea
            id="reponse-clement"
            className="field__box"
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-invalid={tooLong}
          />
          <span className="field__help" aria-live="polite">
            {tooLong ? `Trop long : ${text.length} / ${QUESTION_LIMITS.answer} caractères.` : `${text.length} / ${QUESTION_LIMITS.answer}`}
          </span>
        </div>
        {error && (
          <p className="t-body2" role="alert">
            {error}
          </p>
        )}
        <button type="button" className="btn btn--contained" disabled={!valid || sending} onClick={() => void send()}>
          {answered ? 'Modifier ma réponse' : 'Envoyer la réponse'}
        </button>
      </main>
    </>
  );
}
