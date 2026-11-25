import { expect, test, type Page } from '@playwright/test';
import type { ClementQuestion } from '@pom/engine';
import { accounts } from './accounts';
import { authHeaders, idbAll, login, runCourse, seedCourse0Validated, validatedText } from './driver';

test.describe.configure({ timeout: 180_000 });

const goto = (page: Page, hash: string) => page.evaluate((h) => (window.location.hash = h), hash);

test.describe('échauffement', () => {
  test('1re ouverture du jour : une question ; répondre, puis recharger : pas de seconde proposition', async ({ page }) => {
    const { sam } = accounts();
    await login(page, sam.code);
    await seedCourse0Validated(page, sam.id, 'stay');

    await expect(page.getByRole('heading', { name: 'Un petit calcul avant de commencer' })).toBeVisible();
    await page.locator('.choice-grid .choice').first().click(); // juste ou fausse : les deux comptent comme faites
    await expect(page.getByRole('heading', { name: /^(Juste|Pas tout à fait)\.$/ })).toBeVisible();
    await page.getByRole('button', { name: 'Aller à l’accueil' }).click();
    await expect(page.locator('main[data-screen="accueil"]')).toBeVisible();
    await expect(page.getByText('Échauffement fait')).toBeVisible();

    await page.reload();
    await expect(page.getByText('Échauffement fait')).toBeVisible();
    await expect(page.locator('main[data-screen="echauffement"]')).toHaveCount(0);
    expect(page.url()).not.toContain('echauffement');
  });

  test('« Passer » puis recharger : pas de seconde proposition le même jour, pas de pastille « fait »', async ({ page }) => {
    const { tess } = accounts();
    await login(page, tess.code);
    await seedCourse0Validated(page, tess.id, 'stay');
    await page.getByRole('button', { name: 'Passer', exact: true }).click();
    await expect(page.locator('main[data-screen="accueil"]')).toBeVisible();
    await expect(page.getByText('Échauffement fait')).toHaveCount(0);

    await page.reload();
    await expect.poll(() => validatedText(page)).toBe('1 cours sur 8 validés'); // l'accueil est chargé
    await expect(page.locator('main[data-screen="echauffement"]')).toHaveCount(0);
    await expect(page.getByText('Échauffement fait')).toHaveCount(0);
  });
});

test.describe('fiche mémo hors ligne', () => {
  test('depuis Mes cours (cours validé et cours à faire), sans réseau', async ({ page, context }) => {
    const { sam } = accounts();
    await login(page, sam.code);
    await page.getByRole('link', { name: /Mes cours/ }).click();
    await expect(page.locator('main[data-screen="mes-cours"]')).toBeVisible();
    await context.setOffline(true);

    // Le cours à faire (ouvert par défaut) : sa fiche est consultable avant la validation.
    await page.getByRole('button', { name: 'Fiche', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Fiche mémo · Cours 1' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'La règle' })).toBeVisible();
    await page.getByRole('button', { name: 'Retour' }).click();

    // Le cours validé.
    await page.locator('summary', { hasText: 'Bien écrire un calcul' }).click();
    await page.getByRole('button', { name: 'Fiche', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Fiche mémo · Cours 0' })).toBeVisible();
    await expect(page.getByRole('heading', { name: "L'astuce" })).toBeVisible();
    await context.setOffline(false);
  });
});

test.describe('Demander à Clément', () => {
  test('l’élève demande hors ligne, le suiveur répond, l’élève lit', async ({ page, context, browser }) => {
    const { lou, paul } = accounts();
    await login(page, lou.code);
    await page.getByRole('button', { name: 'Commencer le cours 0' }).click();
    // 1re question qui compte (rang 2 : le rang 1 est « pour deviner ») : fausse exprès.
    await runCourse(page, 'c00-bien-ecrire', { stopAfterAnswers: 2, wrongAnswers: [2] });

    // Hors ligne : la demande est gardée sur le téléphone.
    await context.setOffline(true);
    await page.getByRole('button', { name: 'Demander à Clément' }).click();
    await page.getByLabel('Un petit mot (facultatif)').fill('Je ne comprends pas pourquoi.');
    await page.getByRole('button', { name: 'Envoyer à Clément' }).click();
    await expect(page.getByText('Envoyé. Clément te répondra ici.')).toBeVisible();
    await expect.poll(async () => (await idbAll(page, 'asks')).length).toBe(1);

    // Retour du réseau : elle part, une seule fois.
    await context.setOffline(false);
    const fetchQuestions = async () => ((await (await page.request.get('/api/questions', { headers: await authHeaders(page) })).json()) as { questions: ClementQuestion[] }).questions;
    await expect.poll(async () => (await fetchQuestions()).length, { timeout: 30_000 }).toBe(1);
    await expect.poll(async () => (await idbAll(page, 'asks')).length).toBe(0);
    await page.waitForTimeout(1500);
    const [asked] = await fetchQuestions();
    expect(await fetchQuestions()).toHaveLength(1);
    expect(asked!.note).toBe('Je ne comprends pas pourquoi.');
    expect(asked!.answer).toBeNull();

    // Côté suiveur : la demande apparaît, il répond.
    const phone = await browser.newContext({ ...test.info().project.use, serviceWorkers: 'block' });
    const follower = await phone.newPage();
    await login(follower, paul.code, 'suiveur');
    await expect(follower.locator('[data-questions-badge]')).toHaveText('1');
    await follower.getByRole('link', { name: 'Répondre' }).scrollIntoViewIfNeeded();
    await follower.getByRole('link', { name: 'Répondre' }).dispatchEvent('click'); // le lien est en bas d'une longue page de suivi
    await expect(follower.locator('main[data-screen="suivi-question"]')).toBeVisible();
    await expect(follower.getByText('« Je ne comprends pas pourquoi. »')).toBeVisible();
    await follower.getByLabel('Ton explication').fill('Regarde où est le signe : devant le nombre.');
    await follower.getByRole('button', { name: 'Envoyer la réponse' }).click();
    await expect(follower.locator('main[data-screen="suivi"]')).toBeVisible();
    await expect(follower.getByText('Répondu')).toBeVisible();
    await phone.close();

    // Côté élève : la bulle devient colorée, la carte apparaît ; la lire les éteint.
    await page.reload();
    await goto(page, '#/');
    const bubble = page.locator('.ask-bubble');
    await expect(bubble).toHaveAttribute('data-unread', 'true');
    const card = page.getByRole('region', { name: 'Réponse de Clément' });
    await expect(card).toContainText('Paul a répondu à ta question');
    await card.getByRole('button', { name: 'Lire' }).click();
    await expect(page.getByText('Regarde où est le signe : devant le nombre.')).toBeVisible();
    await goto(page, '#/');
    await expect(page.locator('main[data-screen="accueil"]')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Réponse de Clément' })).toHaveCount(0);
    await expect(page.locator('.ask-bubble')).not.toHaveAttribute('data-unread', 'true');
  });
});

test.describe('Écouter', () => {
  const listen = (page: Page) => page.getByRole('button', { name: 'Écouter cet écran à voix haute' });

  test('avec la synthèse vocale : lit l’écran en français, se coupe quand on quitte l’écran', async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __spoken: { text: string; lang: string }[]; __cancels: number };
      w.__spoken = [];
      w.__cancels = 0;
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: {
          speak: (u: SpeechSynthesisUtterance) => w.__spoken.push({ text: u.text, lang: u.lang }),
          cancel: () => void w.__cancels++,
          getVoices: () => [],
        },
      });
    });
    const { lou } = accounts();
    await login(page, lou.code);
    await goto(page, '#/cours/c00-bien-ecrire/fiche');
    await expect(page.getByRole('heading', { name: 'Fiche mémo · Cours 0' })).toBeVisible();
    await listen(page).click();
    const spoken = await page.evaluate(() => (window as unknown as { __spoken: { text: string; lang: string }[] }).__spoken);
    expect(spoken).toHaveLength(1);
    expect(spoken[0]!.lang).toBe('fr-FR');
    expect(spoken[0]!.text).toContain('Fiche mémo');
    const before = await page.evaluate(() => (window as unknown as { __cancels: number }).__cancels);
    await page.getByRole('button', { name: 'Retour' }).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __cancels: number }).__cancels)).toBeGreaterThan(before);
  });

  test('sans synthèse vocale : le bouton est là et ne plante pas', async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: undefined }));
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const { lou } = accounts();
    await login(page, lou.code);
    await goto(page, '#/cours/c00-bien-ecrire/fiche');
    await expect(listen(page)).toBeVisible();
    await listen(page).click();
    await listen(page).click();
    await expect(page.getByRole('heading', { name: 'Fiche mémo · Cours 0' })).toBeVisible();
    expect(errors).toEqual([]);
  });
});
