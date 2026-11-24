import { go } from '../router';
import { useMyQuestions } from '../store/questions';

/** Carte d'accueil « Clément a répondu à ta question », seulement si une réponse n'est pas lue. */
export function ClementCard() {
  const unread = useMyQuestions().filter((q) => q.answer !== null && q.readAt === null);
  const first = unread[0];
  if (!first) return null;
  const name = first.answeredBy ?? 'Clément';
  return (
    <section className="card card--outlined clement-card" aria-label="Réponse de Clément">
      <h2 className="t-h5">{`${name} a répondu à ta question`}</h2>
      <p className="t-body2 math">{first.calc}</p>
      <button className="btn btn--contained" type="button" onClick={() => go({ name: 'question', id: first.id })}>
        Lire
      </button>
    </section>
  );
}
