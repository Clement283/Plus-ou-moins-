import { defineConfig, devices } from '@playwright/test';

/**
 * Tests bout en bout sur un « téléphone » (iPhone 13) contre le vrai Worker en local :
 * `e2e/serve.ts` construit l'appli, prépare une base D1 locale neuve (migrations, comptes de test)
 * puis lance `wrangler dev`. Les fichiers passent l'un après l'autre : suivi.spec.ts relit ce que eleve.spec.ts a fait.
 *   npm run e2e -- --trace off
 */
const PORT = 8787;

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    ...devices['iPhone 13'],
    // Seul Chromium est préinstallé : l'écran, le toucher et l'agent de l'iPhone 13, moteur Chromium.
    defaultBrowserType: 'chromium',
    baseURL: `http://127.0.0.1:${PORT}`,
    serviceWorkers: 'block',
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    // Le navigateur préinstallé est celui de /opt/pw-browsers (jamais de `playwright install`).
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  webServer: {
    command: 'npx tsx e2e/serve.ts',
    url: `http://127.0.0.1:${PORT}/`,
    timeout: 240_000,
    reuseExistingServer: false,
    stdout: 'pipe',
    stderr: 'pipe',
    env: { E2E_PORT: String(PORT) },
  },
});
