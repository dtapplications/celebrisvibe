import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [mdx()],
  site: 'https://celebrisvibe.com',
  // Prefetch internal pages on hover so page-to-page navigation feels instant
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
