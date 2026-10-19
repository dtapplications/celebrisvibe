import { test as base, expect, type Page } from '@playwright/test';
import { BOOKED_CSV_URL, BOOKED_DATE, NOW } from './env';

export type Sent = Record<string, string>;

type Fixtures = {
  /** Payloads the page sent to Web3Forms (mocked, nothing leaves the browser) */
  sent: Sent[];
  /** Console errors, page errors and failed requests; must be empty when the test ends */
  errors: string[];
};

export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    // Fixed date for the calendar; time keeps running so the page loads normally
    await page.clock.install({ time: NOW });
    await use(page);
  },

  sent: [async ({ page }, use) => {
    const sent: Sent[] = [];
    // Never reach the real Web3Forms, also when testing the live site
    await page.route('https://api.web3forms.com/**', async route => {
      sent.push(route.request().postDataJSON());
      await route.fulfill({ json: { success: true, message: 'ok' } });
    });
    await page.route(BOOKED_CSV_URL, route =>
      route.fulfill({ contentType: 'text/csv', body: `Дата\n${BOOKED_DATE}\n31.12.2026 г.\n` }));
    await use(sent);
  }, { auto: true }],

  errors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
    page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });
    await use(errors);
    expect(errors, 'console errors or failed requests').toEqual([]);
  }, { auto: true }],
});

export { expect };

/** Values of the ticked service checkboxes on the contact form, once the form script has restored them */
export function checkedServices(page: Page) {
  return page.$$eval('input[name="services"]:checked', i => i.map(x => (x as HTMLInputElement).value).sort());
}

/** Load lazy images and wait until every image, CSS mask/background image and font has finished */
export async function settle(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll('img[loading="lazy"]').forEach(img => img.setAttribute('loading', 'eager'));
  });
  // A lazy image switched to eager can report `complete` before its request has even started,
  // so poll from here (page timers may be paused by the fake clock) until every image has pixels.
  const deadline = Date.now() + 20_000;
  let pending: string[] = [];
  while (Date.now() < deadline) {
    pending = await page.$$eval('img', imgs => imgs.filter(i => !(i.complete && i.naturalWidth > 0)).map(i => i.currentSrc || i.src));
    if (!pending.length) break;
    await new Promise(r => setTimeout(r, 200));
  }
  if (pending.length) throw new Error(`Images did not load: ${pending.join(', ')}`);

  await page.evaluate(async () => {
    await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
    // CSS images (the logo is a mask-image) are not in document.images
    const cssUrls = new Set<string>();
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      for (const v of [cs.backgroundImage, cs.maskImage, cs.getPropertyValue('-webkit-mask-image')]) {
        for (const m of v.matchAll(/url\("?([^")]+)"?\)/g)) cssUrls.add(m[1]);
      }
    }
    await Promise.all([...cssUrls].map(src => { const i = new Image(); i.src = src; return i.decode().catch(() => {}); }));
    await document.fonts.ready;
  });
  await page.waitForLoadState('networkidle');
}
