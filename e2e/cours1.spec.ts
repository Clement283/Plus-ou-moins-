import { expect, test, type Page } from '@playwright/test';
import { accounts } from './accounts';
import { answerEvents, expectNoOverflow, login, runCourse, seedCourse0Validated } from './driver';

const C1 = 'c01-additionner-meme-signe';
// Parties du Cours 1 v2 (voir packages/engine/src/courses/calculs/c01-additionner-meme-signe.ts)
const LAST_LESSON_PART = 6;
const PRACTICE_PART = 7;
const ANNOUNCE_PART = 12;

const chip = (page: Page) => page.locator('.chip--module').first();

test.describe('Cours 1 v2', () => {
  test.setTimeout(300_000);

  test('Cours 1 en entier : droite touchable, trous, comparer, série (une ratée repasse), exemples guidés, 5 fins justes', async ({ page }) => {
    const { ines } = accounts();
    await login(page, ines.code);
    await seedCourse0Validated(page, ines.id);
    await page.getByRole('button', { name: 'Commencer le cours 1' }).click();

    // Parcours : mauvais touchers exprès (droite, trous), la 4e question de la série ratée (rang 6), la case 1 de l'exemple 2 ratée (rang 8).
    const seenChips = new Set<string>();
    const report = await runCourse(page, C1, {
      wrongTaps: true,
      wrongAnswers: [6, 8],
      onScreen: async (p, at) => {
        await expectNoOverflow(p, `Cours 1, partie ${at.part}${at.step === null ? '' : `, étape ${at.step + 1}`}`);
        if (at.step === null) seenChips.add(`${at.part}|${(await chip(p).textContent()) ?? ''}`);
      },
    });
    expect(report.repassed, 'la question ratée de la série repasse avant les exercices de fin').toBe(1);
    expect(report.fin).toBe(5);
    expect(seenChips).toContain(`${LAST_LESSON_PART}|Cours 1 · Leçon · étape 7 sur 7`);
    expect(seenChips).toContain(`${PRACTICE_PART}|Cours 1 · Pratique`);
    expect(seenChips).toContain(`${ANNOUNCE_PART}|Cours 1 · Exercices de fin`);

    // Résultat : 11 questions comptent (la série ratée une fois, la case 1 de l'exemple 2 jamais).
    await expect(page.getByRole('heading', { name: 'Cours 1 validé' })).toBeVisible();
    await expect(page.getByText('10 bonnes réponses sur 11, dont 5 exercices de fin justes sur 5.')).toBeVisible();

    // Les actions interactives n'ont rien enregistré : seules les vraies questions ont un événement `answer`.
    const byActivity: Record<string, number> = {};
    await expect
      .poll(async () => {
        for (const k of Object.keys(byActivity)) delete byActivity[k];
        for (const e of await answerEvents(page)) {
          if (e.courseId === C1) byActivity[e.activity] = (byActivity[e.activity] ?? 0) + 1;
        }
        return byActivity;
      })
      // pour deviner : 2 questions + la case 1 de l'exemple 2 ; leçon : 4 de série + 1 repassage ; 2 exemples ; 5 fins
      .toEqual({ decouverte: 3, lecon: 5, exemple: 2, fin: 5 });
  });

  test('Cours 1 raté (5 exercices de fin faux) : « Relire la règle 2 » rouvre la partie 5', async ({ page }) => {
    const { jade } = accounts();
    await login(page, jade.code);
    await seedCourse0Validated(page, jade.id);
    await page.getByRole('button', { name: 'Commencer le cours 1' }).click();
    const report = await runCourse(page, C1, { failAllFin: true });
    expect(report.fin).toBeGreaterThanOrEqual(5);

    await expect(page.getByRole('heading', { name: "Le cours 1 n'est pas encore validé" })).toBeVisible();
    await expect(page.getByText('Tu as 6 bonnes réponses sur 11')).toBeVisible();
    await expect(page.getByText('Tes erreurs :')).toBeVisible();
    await page.getByRole('link', { name: 'Relire la règle 2' }).click();
    await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText('Je garde le signe');
  });
});
