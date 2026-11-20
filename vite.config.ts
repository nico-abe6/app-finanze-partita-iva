/**
 * vite.config.ts
 * Configurazione di Vite: React, app installabile (PWA) e percorso di pubblicazione.
 * BASE_PATH (variabile d'ambiente) è il percorso in cui viene pubblicata l'app:
 * su GitHub Pages è "/<nome-repository>/" (lo imposta il workflow), in locale "/".
 */

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const percorsoBase = process.env.BASE_PATH ?? '/';
const COLORE_TEMA = '#eef5fc';

export default defineConfig({
  base: percorsoBase,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // la nuova versione si attiva da sola alla successiva apertura
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Finanze – Partita IVA e conti',
        short_name: 'Finanze',
        description: 'Fatturato e tasse in regime forfettario, conti, entrate e uscite.',
        lang: 'it',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: COLORE_TEMA,
        theme_color: COLORE_TEMA,
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // salva in cache solo i file dell'app; i dati passano sempre da Supabase
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
});
