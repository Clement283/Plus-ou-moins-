import { go } from '../router';
import { useUnreadCount } from '../store/questions';

/** Petit bouton rond de la barre du haut : gris sans nouveauté, coloré avec un point si une réponse n'est pas lue. */
export function HomeBubble() {
  const unread = useUnreadCount();
  return (
    <button
      className="ask-bubble"
      type="button"
      data-unread={unread > 0 ? 'true' : undefined}
      aria-label={unread > 0 ? 'Mes questions, nouvelle réponse' : 'Mes questions'}
      onClick={() => go({ name: 'questions' })}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
      </svg>
    </button>
  );
}
