/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Plus ou moins',
        short_name: 'Plus ou moins',
        lang: 'fr',
        description: 'Entraînement aux nombres relatifs',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        // Icônes : à ajouter à l'étape design.
        icons: [],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'], navigateFallback: '/index.html' },
    }),
  ],
  test: { include: ['test/**/*.test.ts'], environment: 'node' },
});
