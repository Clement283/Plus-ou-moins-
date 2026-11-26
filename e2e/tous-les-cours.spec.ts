import { expect, test } from '@playwright/test';
import { ESSAIS, MODULES, getCourse } from '@pom/engine';
import { accounts } from './accounts';
import { expectNoOverflow, login, runCourse } from './driver';

/**
 * Chaque cours de chaque module (et du module « Essais ») joué du début à la fin, en répondant juste, avec le compte
 * « aperçu » (tous les cours ouverts). Un cours ajouté au registre est testé tout seul : il doit se terminer sur
 * « Cours N validé », sans écran inconnu ni page qui déborde en largeur.
 */
const ALL = [...MODULES, ESSAIS].flatMap((m) => m.courseIds.map((id) => ({ module: m.title, id })));

test.describe('Tous les cours, du début à la fin', () => {
  test.setTimeout(300_000);

  for (const { module, id } of ALL) {
    test(`${module} · ${getCourse(id).title} (${id})`, async ({ page }) => {
      await login(page, accounts().apercu.code);
      await page.goto(`/#/cours/${id}`);
      await runCourse(page, id, {
        onScreen: (p, at) => expectNoOverflow(p, `${id}, partie ${at.part}${at.step === null ? '' : `, étape ${at.step + 1}`}`),
      });
      await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('validé');
    });
  }
});
