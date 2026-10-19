import { defineConfig, devices } from '@playwright/test';
import { BUILD_URL, DEV_URL, LIVE_URL, TEST_ENV } from './tests/e2e/env';

// Runs the same browser tests against:
//   build  - the production build (astro build + astro preview)
//   dev    - the dev server (astro dev)
//   parity - screenshots and computed styles of dev compared with build
// With LIVE_URL set (after a deploy), `dev` is replaced by `live` and parity compares the
// deployed site with a local build of the same commit.
//
//   npm test                                    build + dev + parity
//   LIVE_URL=https://celebrisvibe.com npm test  build + live + parity
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 60_000,
  use: {
    ...devices['Desktop Chrome'],
    locale: 'bg-BG',
    timezoneId: 'Europe/Sofia',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      // Build with fake service keys so tests never reach Web3Forms or the real Google Sheet
      command: 'npm run build && npm run preview -- --port 4321',
      url: BUILD_URL,
      env: TEST_ENV,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
    ...(LIVE_URL ? [] : [{
      command: 'npx astro dev --port 4322',
      url: DEV_URL,
      env: TEST_ENV,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    }]),
  ],
  projects: [
    { name: 'build', testMatch: 'site.spec.ts', use: { baseURL: BUILD_URL } },
    LIVE_URL
      ? { name: 'live', testMatch: 'site.spec.ts', use: { baseURL: LIVE_URL } }
      : { name: 'dev', testMatch: 'site.spec.ts', use: { baseURL: DEV_URL } },
    { name: 'parity', testMatch: 'parity.spec.ts' },
  ],
});
