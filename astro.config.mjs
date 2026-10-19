import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://celebrisvibe.com',
  // Prefetch internal pages on hover so page-to-page navigation feels instant
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // The browser tests (tests/e2e) run the dev server without the dev toolbar overlay
  devToolbar: { enabled: process.env.CV_E2E !== '1' },
});
