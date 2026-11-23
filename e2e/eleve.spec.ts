import { expect, test } from '@playwright/test';
import { accounts } from './accounts';
import { idbAll, login, runCourse, validatedText } from './driver';

const C0 = 'c00-bien-ecrire';
const C1 = 'c01-additionner-meme-signe';

test('élève : Cours 0 puis Cours 1 avec une erreur voulue, validation, accueil', async ({ page, browser }) => {
  const { lea } = accounts();
  await login(page, lea.code);
  await expect(page.getByRole('heading', { name: 'Bonjour Léa !' })).toBeVisible();
  expect(await validatedText(page)).toBe('0 cours sur 8 validés');

  // Cours 0, sans erreur.
  await page.getByRole('button', { name: 'Commencer le cours 0' }).click();
  await runCourse(page, C0);
  await expect(page.getByRole('heading', { name: 'Cours 0 validé' })).toBeVisible();
  await expect(page.getByText('Le cours 1, « Additionner deux nombres de même signe », est débloqué.')).toBeVisible();

  // Cours 1 : une erreur voulue, explication, l'exercice revient en fin d'activité.
  await page.getByRole('button', { name: 'Commencer le cours 1' }).click();
  const report = await runCourse(page, C1, { wrongFirstFin: true });
  expect(report.explained).toBe(true);
  expect(report.fin, 'exercices de fin posés : 5, plus ceux que l\'erreur a fait revenir').toBeGreaterThan(5);
  await expect(page.getByRole('heading', { name: 'Cours 1 validé' })).toBeVisible();

  // Accueil : jauge et progression.
  await page.getByRole('button', { name: "Retour à l'accueil" }).click();
  await expect(page.locator('main[data-screen="accueil"]')).toBeVisible();
  await expect(page.getByRole('img', { name: /minutes sur 15/ })).toBeVisible(); // la jauge du jour
  await expect.poll(() => validatedText(page)).toBe('2 cours sur 8 validés');

  // Tout est parti vers le serveur avant de vider le téléphone.
  await expect.poll(async () => (await idbAll(page, 'outbox')).length, { timeout: 30_000 }).toBe(0);

  // Téléphone vidé (contexte neuf, aucun stockage) : même progression après reconnexion.
  const phone = await browser.newContext({ ...test.info().project.use, serviceWorkers: 'block' });
  const fresh = await phone.newPage();
  await login(fresh, lea.code);
  // L'accueil se remplit quand les événements du serveur arrivent.
  await expect.poll(() => validatedText(fresh)).toBe('2 cours sur 8 validés');
  await phone.close();
});
