import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mushroom-logo.svg', 'favicon-16x16.png', 'favicon-32x32.png', 'icon-192x192.png', 'icon-512x512.png'],
      manifest: {
        name: 'Mushroom Hunter',
        short_name: 'MushroomHunter',
        description: 'Progressive Web App for mushroom hunters in Switzerland',
        theme_color: '#dc2626',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        // Auto-detect: Use 'backend' service name in Docker, localhost otherwise
        // Docker detection: Check for /.dockerenv file or DOCKER_ENV variable
        target: (() => {
          const isDocker = fs.existsSync('/.dockerenv') || process.env.DOCKER_ENV === 'true';
          const target = isDocker ? 'http://backend:5000' : 'http://localhost:5000';
          console.log(`[Vite] Running in ${isDocker ? 'Docker' : 'local'} mode, API target: ${target}`);
          return target;
        })(),
        changeOrigin: true,
        secure: false
      }
    }
  }
});
