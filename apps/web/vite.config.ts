/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/** Identifiant de version de l'appli : invalide le cache de progression à chaque nouveau déploiement. */
const BUILD = String(Date.now());

export default defineConfig({
  define: { __APP_BUILD__: JSON.stringify(BUILD) },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
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
