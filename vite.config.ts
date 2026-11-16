import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['icons/*.png', 'icons/*.svg'],
    manifest: {
      id: './', name: 'FP STUDY 14｜FP3級 学習ノート', short_name: 'FP STUDY',
      description: '14日間で学ぶFP3級の学科6分野と実技。講義・テスト・復習をオフラインでも。',
      lang: 'ja', start_url: './', scope: './', display: 'standalone',
      background_color: '#f1f7f3', theme_color: '#123e36',
      icons: [
        { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: { clientsClaim: true, globPatterns: ['**/*.{js,css,html,png,svg,json,webmanifest}'], cleanupOutdatedCaches: true, navigateFallback: 'index.html' }
  })],
  test: { environment: 'jsdom', setupFiles: fileURLToPath(new URL('./src/test/setup.ts', import.meta.url)), include: ['src/**/*.test.{ts,tsx}'], restoreMocks: true }
})
