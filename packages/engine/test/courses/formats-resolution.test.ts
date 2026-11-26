import { describe, expect, it } from 'vitest';
import { availableKinds, getCourse, seededRng, courseRunItems } from '../../src';

// Les écrans qui font écrire (« résoudre », « calculer ») doivent aussi servir au calcul « du même genre » après une erreur,
// aux révisions et à l'entraînement : availableKinds les liste pour les cours qui les prévoient.
describe('types de question des cours du module Équations', () => {
  it('« calculer » pour le cours 1, « resoudre » pour les cours 2 à 5', () => {
    expect(availableKinds(getCourse('equations-tester-solution'))).toContain('calculer');
    for (const id of ['equations-ajouter-retirer', 'equations-diviser', 'equations-resoudre-premier-degre', 'equations-inconnue-deux-cotes'])
      expect(availableKinds(getCourse(id)), id).toContain('resoudre');
  });
  it('un cours sans ces écrans ne les propose pas', () => {
    const kinds = availableKinds(getCourse('c05-multiplier-deux'));
    expect(kinds).not.toContain('resoudre');
    expect(kinds).not.toContain('calculer');
  });
  it('leurs exercices de fin sont bien du type annoncé', () => {
    const kind = (id: string) =>
      courseRunItems(getCourse(id), seededRng(5))
        .filter((i) => i.type === 'question' && i.activity === 'fin')
        .map((i) => (i.type === 'question' ? i.question.kind : ''));
    expect(kind('equations-tester-solution')).toEqual(Array(5).fill('calculer'));
    expect(kind('equations-ajouter-retirer')).toEqual(Array(5).fill('resoudre'));
  });
});
