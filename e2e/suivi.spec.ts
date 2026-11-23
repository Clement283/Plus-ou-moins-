import { expect, test } from '@playwright/test';
import { accounts } from './accounts';
import { login } from './driver';

// Lit ce que eleve.spec.ts a fait faire à Léa (les fichiers passent dans l'ordre, un seul à la fois).
test('suiveur : accueil du suivi, module puis cours 1', async ({ page }) => {
  const { claire } = accounts();
  await login(page, claire.code, 'suiveur');
  await expect(page.getByRole('heading', { name: 'Léa' })).toBeVisible();

  await page.locator('main[data-screen="suivi"] a[href*="/module/"]').first().click();
  const module = page.locator('main[data-screen="suivi-module"]');
  await expect(module).toBeVisible();
  await expect(page.getByText('2 / 8 cours validés')).toBeVisible();

  await module.locator('a[href*="/cours/c01"]').click();
  const course = page.locator('main[data-screen="suivi-cours"]');
  await expect(course).toBeVisible();
  await expect(page.getByText('Cours 1, Additionner deux nombres de même signe')).toBeVisible();
  await expect(course.locator('.state', { hasText: 'validé' })).toBeVisible();
  // L'erreur voulue au Cours 1 figure parmi les dernières erreurs du cours.
  await expect(page.getByRole('heading', { name: 'Dernières erreurs du cours' })).toBeVisible();
});
