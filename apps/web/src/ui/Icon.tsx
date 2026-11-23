import type { IconName } from './icons';

export function Icon({ name, size, className }: { name: IconName; size?: 'sm' | 'lg'; className?: string }) {
  const cls = ['ico', size ? `ico--${size}` : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <svg className={cls} aria-hidden="true" focusable="false">
      <use href={`#i-${name}`} />
    </svg>
  );
}
