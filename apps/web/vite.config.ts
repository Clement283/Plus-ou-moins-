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
        description: 'Les maths du collège, un peu chaque jour',
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
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'], navigateFallback: '/index.html' },
    }),
  ],
  test: { include: ['test/**/*.test.ts'], environment: 'node' },
});
