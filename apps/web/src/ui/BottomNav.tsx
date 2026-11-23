import { Icon } from './Icon';
import type { IconName } from './icons';
import { toHash } from '../router';

export type NavKey = 'accueil' | 'cours' | 'entrainement';

const ITEMS: { key: NavKey; label: string; icon: IconName; hash: string }[] = [
  { key: 'accueil', label: 'Accueil', icon: 'home', hash: toHash({ name: 'accueil' }) },
  { key: 'cours', label: 'Mes cours', icon: 'book', hash: toHash({ name: 'cours' }) },
  { key: 'entrainement', label: 'Entraînement', icon: 'practice', hash: toHash({ name: 'entrainement' }) },
];

export function BottomNav({ active }: { active: NavKey }) {
  return (
    <nav className="bottomnav" aria-label="Navigation">
      {ITEMS.map((it) => (
        <a key={it.key} className={`bottomnav__item${it.key === active ? ' is-active' : ''}`} href={it.hash} aria-current={it.key === active ? 'page' : undefined}>
          <Icon name={it.icon} />
          {it.label}
        </a>
      ))}
    </nav>
  );
}
