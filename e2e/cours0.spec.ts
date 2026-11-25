import { expect, test, type Page } from '@playwright/test';
import { accounts } from './accounts';
import { answerEvents, expectNoOverflow, login, runCourse } from './driver';

const C0 = 'c00-bien-ecrire';
// Parties du Cours 0 v3 (voir packages/engine/src/courses/calculs/c00-bien-ecrire.ts)
const LAST_LESSON_PART = 10;
const PRACTICE_PART = 11;
const ANNOUNCE_PART = 16;

const chip = (page: Page) => page.locator('.chip--module').first();

test.describe('Cours 0 v3', () => {
  test.setTimeout(300_000);

  test('Cours 0 en entier : étapes interactives, série (une ratée repasse), exemples guidés, 5 fins justes', async ({ page }) => {
    const { noe } = accounts();
    await login(page, noe.code);

    // La fiche mémo s'ouvre depuis Mes cours avant la validation, hors ligne.
    await page.getByRole('button', { name: 'Commencer le cours 0' }).waitFor();
    await page.getByRole('link', { name: /Mes cours/ }).click();
    await expect(page.locator('main[data-screen="mes-cours"]')).toBeVisible();
    await page.context().setOffline(true);
    await page.getByRole('button', { name: 'Fiche', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Fiche mémo · Cours 0' })).toBeVisible();
    await expect(page.getByText("Cherche d'abord les signes qui se touchent")).toBeVisible();
    await page.getByRole('button', { name: 'Retour' }).click();
    await page.context().setOffline(false);
    await page.goto('/#/');
    await page.getByRole('button', { name: 'Commencer le cours 0' }).click();

    // Parcours : mauvais touchers exprès, une question de la série ratée (rang 8), la case 1 du 2e exemple ratée (rang 12).
    const seenChips = new Set<string>();
    const report = await runCourse(page, C0, {
      wrongTaps: true,
      wrongAnswers: [8, 12],
      onScreen: async (p, at) => {
        await expectNoOverflow(p, `Cours 0, partie ${at.part}${at.step === null ? '' : `, étape ${at.step + 1}`}`);
        // aucune couleur de signe (orange ou bleu) dans ce cours
        await expect(p.locator('.neg, .pos')).toHaveCount(0);
        if (at.step === null) seenChips.add(`${at.part}|${(await chip(p).textContent()) ?? ''}`);
      },
    });
    expect(report.repassed, 'la question ratée de la série repasse avant les exercices de fin').toBe(1);
    expect(report.fin).toBe(5);
    expect(seenChips).toContain(`${LAST_LESSON_PART}|Cours 0 · Leçon · étape 10 sur 10`);
    expect(seenChips).toContain(`${PRACTICE_PART}|Cours 0 · Pratique`);
    expect(seenChips).toContain(`${ANNOUNCE_PART}|Cours 0 · Exercices de fin`);

    // Résultat : 14 questions comptent (la série ratée une fois, la case 1 de l'exemple 2 jamais).
    await expect(page.getByRole('heading', { name: 'Cours 0 validé' })).toBeVisible();
    await expect(page.getByText('13 bonnes réponses sur 14, dont 5 exercices de fin justes sur 5.')).toBeVisible();

    // La fiche s'ouvre aussi depuis « Cours 0 validé », hors ligne.
    await page.context().setOffline(true);
    await page.getByRole('button', { name: 'Voir la fiche mémo' }).click();
    await expect(page.getByRole('heading', { name: 'Fiche mémo · Cours 0' })).toBeVisible();
    await page.context().setOffline(false);

    // Les étapes interactives n'ont rien enregistré : seules les vraies questions ont un événement `answer`.
    const byActivity: Record<string, number> = {};
    await expect
      .poll(async () => {
        for (const k of Object.keys(byActivity)) delete byActivity[k];
        for (const e of await answerEvents(page)) byActivity[e.activity] = (byActivity[e.activity] ?? 0) + 1;
        return byActivity;
      })
      // pour deviner : 3 questions + la case 1 de l'exemple 2 ; leçon : 3 petites questions + 4 de série + 1 repassage ; 2 exemples ; 5 fins
      .toEqual({ decouverte: 4, lecon: 8, exemple: 2, fin: 5 });
  });

  test('Cours 0 raté (5 exercices de fin faux) : « N bonnes réponses sur 14 », « Relire la règle » rouvre la bonne partie', async ({ page }) => {
    const { maya } = accounts();
    await login(page, maya.code);
    await page.getByRole('button', { name: 'Commencer le cours 0' }).click();
    const report = await runCourse(page, C0, { failAllFin: true });
    expect(report.fin).toBeGreaterThanOrEqual(5);

    await expect(page.getByRole('heading', { name: "Le cours 0 n'est pas encore validé" })).toBeVisible();
    await expect(page.getByText('Tu as 9 bonnes réponses sur 14')).toBeVisible();
    await expect(page.getByText('Tes erreurs :')).toBeVisible();

    // « Relire la règle N » rouvre la partie de la leçon qui explique la règle.
    const link = page.getByRole('link', { name: /^Relire la règle \d$/ });
    const n = Number((await link.textContent())!.slice(-1));
    const titles: Record<number, string> = { 1: 'Quand deux signes se touchent', 2: 'Et au début du calcul ?', 3: 'Le moins se met avant le nombre', 4: 'Une parenthèse ouverte se ferme' };
    await link.click();
    await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(titles[n]!);
  });
});
