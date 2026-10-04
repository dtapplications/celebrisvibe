import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  site: 'https://dtapplications.github.io',
  base: '/celebrisvibe',
});
