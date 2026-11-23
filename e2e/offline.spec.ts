import { expect, test } from '@playwright/test';
import type { AppEvent } from '@pom/engine';
import { accounts } from './accounts';
import { idbAll, login, runCourse, serverEvents } from './driver';

test('hors ligne : 3 réponses, la file se vide, chaque événement une seule fois ; téléphone vidé', async ({ page, context, browser }) => {
  const { hugo } = accounts();
  await login(page, hugo.code);

  // Plus de réseau : le cours 0 (leçons et réponses) marche et tout est gardé sur le téléphone.
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Commencer le cours 0' }).click();
  await runCourse(page, 'c00-bien-ecrire', { stopAfterAnswers: 3 });
  const waiting = await idbAll<AppEvent>(page, 'outbox');
  expect(waiting.filter((e) => e.kind === 'answer')).toHaveLength(3);
  expect((await idbAll<AppEvent>(page, 'events')).length).toBe(waiting.length);

  // Retour du réseau : la file se vide.
  await context.setOffline(false);
  await expect.poll(async () => (await idbAll<AppEvent>(page, 'outbox')).length, { timeout: 30_000 }).toBe(0);

  // Chaque événement est sur le serveur, une seule fois.
  const ids = (await serverEvents(page)).map((e) => e.id);
  expect(new Set(ids).size, 'aucun doublon sur le serveur').toBe(ids.length);
  for (const e of waiting) expect(ids.filter((id) => id === e.id), `événement ${e.id}`).toHaveLength(1);

  // Retour à l'accueil, puis téléphone vidé (contexte neuf, aucun stockage) : même code, même accueil.
  await page.evaluate(() => (window.location.hash = '#/'));
  const home = page.locator('main[data-screen="accueil"]');
  await expect(home).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bonjour Hugo !' })).toBeVisible();
  const before = await home.innerText();

  const phone = await browser.newContext({ ...test.info().project.use, serviceWorkers: 'block' });
  const fresh = await phone.newPage();
  await login(fresh, hugo.code);
  await expect(fresh.getByRole('heading', { name: 'Bonjour Hugo !' })).toBeVisible();
  await expect.poll(async () => (await idbAll<AppEvent>(fresh, 'events')).length).toBe(ids.length);
  expect(await fresh.locator('main[data-screen="accueil"]').innerText()).toBe(before);
  await phone.close();
});
