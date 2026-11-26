import type { CourseDef, ModuleDef } from '../types';
import { equationsTesterSolution } from './equations-tester-solution';
import { equationsAjouterRetirer } from './equations-ajouter-retirer';
import { equationsAjouterRetirerCourt } from './equations-ajouter-retirer-court';
import { equationsAjouterRetirerGuide } from './equations-ajouter-retirer-guide';
import { equationsInconnueDeuxCotes } from './equations-inconnue-deux-cotes';
import { equationsProduitNul } from './equations-produit-nul';
import { c07b } from '../calculs/c07b-multiplier-plusieurs';
import { equationsDiviser } from '../equations/equations-diviser';
import { equationsResoudrePremierDegre } from '../equations/equations-resoudre-premier-degre';

/**
 * Module « Essais » : cours à l'essai, visibles seulement des comptes « aperçu » (relecture, « Tester les cours »).
 * Il n'est PAS dans MODULES : l'élève ne le voit jamais, il ne compte ni dans sa progression ni dans le suivi.
 * Tous les cours y sont ouverts (aucun ordre à respecter).
 */
export const ESSAIS_COURSES: CourseDef[] = [
  c07b,
  equationsTesterSolution,
  equationsAjouterRetirer,
  equationsAjouterRetirerCourt,
  equationsAjouterRetirerGuide,
  equationsDiviser,
  equationsResoudrePremierDegre,
  equationsInconnueDeuxCotes,
  equationsProduitNul,
];

export const ESSAIS: ModuleDef = {
  id: 'essais',
  title: 'Essais',
  theme: 'cours à l\'essai, réservés au compte de relecture.',
  colorVar: '--module-calculs',
  courseIds: ESSAIS_COURSES.map((c) => c.id),
};
