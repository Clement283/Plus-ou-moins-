import type { CourseDef, ModuleDef } from '../types';
import { equationsTesterSolution } from './equations-tester-solution';
import { equationsAjouterRetirer } from './equations-ajouter-retirer';
import { equationsInconnueDeuxCotes } from './equations-inconnue-deux-cotes';
import { equationsProduitNul } from './equations-produit-nul';
import { inequationsIntervalles } from './inequations-intervalles';
import { inequationsResoudrePremierDegre } from './inequations-resoudre-premier-degre';
import { inequationsSigneAffine } from './inequations-signe-affine';
import { inequationsTableauSignesProduit } from './inequations-tableau-signes-produit';
import { inequationsQuotient } from './inequations-quotient';
import { priorites1 } from './priorites-gauche-droite';
import { priorites2 } from './priorites-fois-avant-plus';
import { priorites3 } from './priorites-parentheses';
import { priorites4 } from './priorites-parentheses-imbriquees';
import { priorites5 } from './priorites-nature-calcul';
import { priorites6 } from './priorites-ecrire-un-calcul';
import { priorites7 } from './priorites-moins-devant-parenthese';
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
  equationsDiviser,
  equationsResoudrePremierDegre,
  equationsInconnueDeuxCotes,
  equationsProduitNul,
  inequationsIntervalles,
  inequationsResoudrePremierDegre,
  inequationsSigneAffine,
  inequationsTableauSignesProduit,
  inequationsQuotient,
  priorites1,
  priorites2,
  priorites3,
  priorites4,
  priorites5,
  priorites6,
  priorites7,
];

export const ESSAIS: ModuleDef = {
  id: 'essais',
  title: 'Essais',
  theme: 'cours à l\'essai, réservés au compte de relecture.',
  colorVar: '--module-calculs',
  courseIds: ESSAIS_COURSES.map((c) => c.id),
};
