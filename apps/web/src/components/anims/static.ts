import { prefersReducedMotion } from '../reducedMotion';

/** Mouvement réduit : l'animation n'est pas jouée, la scène est posée à son état final (classe `is-static`). */
export const staticClass = (): string => (prefersReducedMotion() ? ' is-static' : '');
