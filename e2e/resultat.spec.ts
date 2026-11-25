import { expect, test } from '@playwright/test';
import { accounts } from './accounts';
import { login, runCourse } from './driver';

// Point B8 : un cours dont on rate les exercices de fin doit finir sur l'écran de résultat (et pas revenir à Mes cours).
// Hugo a seulement commencé le Cours 0 dans offline.spec.ts : il le refait ici en entier, du début à la fin.
test('élève : Cours 0 v3 en entier, exercices de fin ratés, écran de résultat puis Mes cours', async ({ page }) => {
  const { hugo } = accounts();
  await login(page, hugo.code);
  await page.getByRole('button', { name: 'Commencer le cours 0' }).click();

  // Étapes interactives, série de pratique, exemples guidés, puis les 5 exercices de fin tous ratés.
  const report = await runCourse(page, 'c00-bien-ecrire', { failAllFin: true });
  expect(report.fin, 'au moins les 5 exercices de fin ont été posés').toBeGreaterThanOrEqual(5);

  // L'écran de résultat est bien là, avec les erreurs.
  await expect(page.locator('main[data-screen="resultat"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: "Le cours 0 n'est pas encore validé" })).toBeVisible();
  await expect(page.getByText('Tes erreurs :')).toBeVisible();

  // Mes cours : la raison du dernier essai.
  await page.goto('/#/cours');
  await expect(page.getByText('Dernier essai :').first()).toBeVisible();
});
