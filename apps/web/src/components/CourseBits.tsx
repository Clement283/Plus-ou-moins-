import { getCourse, type CourseStatus } from '@pom/engine';
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
