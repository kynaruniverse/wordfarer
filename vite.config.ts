import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Base path matches a GitHub Pages project site (username.github.io/wordfarer/).
// Change to '/' if deploying to a custom domain or a user/org root site.
const BASE_PATH = '/wordfarer/';

export default defineConfig({
  base: BASE_PATH,
  resolve: {
    // Mirrors the "@/*" path in tsconfig.json — Vite's bundler doesn't read
    // tsconfig paths on its own, so both must be kept in sync by hand.
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Wordfarer',
        short_name: 'Wordfarer',
        description: 'A cartographer of language — craft your way through riddles with a permanent, ever-growing Wordbank.',
        theme_color: '#1B2A4A',
        background_color: '#F3E9D2',
        display: 'standalone',
        start_url: BASE_PATH,
        scope: BASE_PATH,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        // Wordbank state itself lives in IndexedDB, not the cache — this just
        // makes the app shell/assets available offline.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}']
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
