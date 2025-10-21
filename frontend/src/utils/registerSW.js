// Vite PWA plugin handles service worker registration automatically
// This file is kept for future custom SW logic if needed
export function registerSW() {
  // Service worker is automatically registered by vite-plugin-pwa
  // The plugin generates the service worker and registers it during build

  // In development, service worker may not be active
  // Run 'npm run build' and 'npm run preview' to test PWA features

  if (import.meta.env.DEV) {
    console.log('Development mode: Service worker will be available in production build');
  }
}
