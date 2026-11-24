/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'node:child_process';

/** Identifiant de version de l'appli : invalide le cache de progression à chaque nouveau déploiement. */
const BUILD = String(Date.now());

/** Version affichée dans l'appli : date et heure du build (Paris) et commit, ex. « 24/11 12:05 · 483cc19 ». */
function appVersion(): string {
  const when = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(Number(BUILD)));
  let commit = '';
  try {
    commit = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    // pas de git (build hors dépôt) : la date suffit
  }
  return commit ? `${when.replace(' ', ' ')} · ${commit}` : when;
}

export default defineConfig({
  define: { __APP_BUILD__: JSON.stringify(BUILD), __APP_VERSION__: JSON.stringify(appVersion()) },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Enregistré dans main.tsx (registerSW) : la page se recharge seule quand une nouvelle version est installée.
      injectRegister: false,
      manifest: {
        name: 'Plus ou moins',
        short_name: 'Plus ou moins',
        lang: 'fr',
        description: 'Entraîne-toi, un peu chaque jour',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        background_color: '#F2F3F8',
        theme_color: '#F2F3F8',
        // Icône validée à l'étape design : « ± » empilé (docs/design/icones.html, option A).
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest,woff2}'], navigateFallback: '/index.html' },
    }),
  ],
  test: { include: ['test/**/*.test.{ts,tsx}'], environment: 'jsdom' },
});
