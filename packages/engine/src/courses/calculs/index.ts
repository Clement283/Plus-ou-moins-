import type { CourseDef, ModuleDef } from '../types';
import { c00 } from './c00-bien-ecrire';
import { c01 } from './c01-additionner-meme-signe';
import { c02 } from './c02-additionner-signes-contraires';
import { c03 } from './c03-additionner-plusieurs';
import { c04 } from './c04-soustraire';
import { c05 } from './c05-multiplier-deux';
import { c06 } from './c06-diviser-deux';
import { c07 } from './c07-multiplier-plusieurs';
import { MODULE_ID } from './shared';

export const CALCULS_COURSES: CourseDef[] = [c00, c01, c02, c03, c04, c05, c06, c07];

export const CALCULS: ModuleDef = {
  id: MODULE_ID,
  title: 'Calculs',
  theme: 'les bases du calcul, sans lesquelles on perd des points partout (second degré, fractions, équations…).',
  colorVar: '--module-calculs',
  courseIds: CALCULS_COURSES.map((c) => c.id),
};
