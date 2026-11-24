import { getCourse, type CourseStatus, type LastAttempt } from '@pom/engine';
import { Icon } from '../ui/Icon';

/** Étoiles d'un cours validé (1 à 3), vides comprises : `.rating` du design system. */
export function Stars({ n, small = false }: { n: number; small?: boolean }) {
  return (
    <span className={small ? 'rating rating--sm' : 'rating'} role="img" aria-label={`${n} étoile${n > 1 ? 's' : ''} sur 3`}>
      {[0, 1, 2].map((i) => (
        <Icon key={i} name="star" className={i < n ? '' : 'is-empty'} />
      ))}
    </span>
  );
}

const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

/** « Cours 4, soustraire, c'est ajouter l'opposé » (libellé des listes). */
export function courseLabel(courseId: string): string {
  const c = getCourse(courseId);
  return `Cours ${c.order}, ${lowerFirst(c.title)}`;
}

/** « à faire » couvre un cours disponible ou commencé (un cours quitté recommence, doc 08 n° 16). */
export const isTodo = (s: CourseStatus) => s === 'disponible' || s === 'en-cours';

/** « Dernier essai : … À revoir : … » (doc 08 n° 29), seulement pour un cours à valider qui a un essai terminé. */
export function lastAttemptText(a: LastAttempt): string {
  const base = a.kind === 'cours' ? `Dernier essai : ${a.finOk} exercices de fin justes sur ${a.fin}.` : `Dernier essai : ${a.finOk} sur ${a.fin}.`;
  if (!a.top || a.top.rule === null) return base;
  const label = a.top.label.charAt(0).toLowerCase() + a.top.label.slice(1);
  return `${base} À revoir : ${label}.`;
}

/** Lien « Relire la règle N » de l'erreur la plus fréquente, s'il y a une règle. */
export function ruleLink(a: LastAttempt | null): { n: number; part: number } | null {
  const t = a?.top;
  return t && t.rule !== null && t.partIndex !== null ? { n: t.rule, part: t.partIndex } : null;
}
