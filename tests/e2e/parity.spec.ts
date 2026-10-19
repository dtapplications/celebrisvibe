import { writeFileSync } from 'node:fs';
import { test, expect, type Browser } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { BUILD_URL, CANDIDATE_NAME, CANDIDATE_URL, NOW, PAGES } from './env';
import { settle } from './fixtures';

// The production build is the reference. The dev server (or the deployed site, with LIVE_URL)
// must render the same text, the same computed styles on every element and the same pixels.

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];
const THEMES = ['dark', 'light'] as const;
/** Share of pixels allowed to differ, for anti-aliasing and image resampling noise */
const MAX_DIFF_RATIO = 0.002;

const STYLE_PROPS = [
  'display', 'position', 'visibility', 'opacity',
  'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-transform',
  'color', 'background-color', 'background-image',
  'margin', 'padding', 'gap', 'border', 'border-radius', 'box-shadow',
  'grid-template-columns', 'flex-direction', 'justify-content', 'align-items',
];

type Capture = { png: Buffer; text: string; styles: string[] };

async function capture(browser: Browser, base: string, path: string, vp: typeof VIEWPORTS[number], theme: string): Promise<Capture> {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    locale: 'bg-BG',
    timezoneId: 'Europe/Sofia',
  });
  const page = await context.newPage();
  // Freeze time so the calendar and the auto-advancing showcase are identical in both
  await page.clock.install({ time: NOW });
  await page.clock.pauseAt(new Date(NOW.getTime() + 60_000));
  if (theme === 'light') await page.addInitScript(() => localStorage.setItem('cv-theme', 'light'));

  await page.goto(base + path, { waitUntil: 'load' });
  await settle(page);

  const text = await page.locator('body').innerText();
  const styles = await page.evaluate(props => {
    const skip = new Set(['SCRIPT', 'STYLE', 'ASTRO-DEV-TOOLBAR', 'VITE-ERROR-OVERLAY']);
    return [...document.body.querySelectorAll('*')]
      .filter(el => !skip.has(el.tagName) && !el.closest('astro-dev-toolbar'))
      .map((el, i) => {
        const cs = getComputedStyle(el);
        const label = `${i} <${el.tagName.toLowerCase()} class="${el.getAttribute('class')?.replace(/\s*astro-[\w-]+/g, '') ?? ''}">`;
        return `${label} ${props.map(p => `${p}:${cs.getPropertyValue(p)}`).join('; ')}`;
      });
  }, STYLE_PROPS);
  const png = await page.screenshot({ fullPage: true, animations: 'disabled', caret: 'hide' });
  await context.close();
  return { png, text, styles };
}

for (const p of PAGES) {
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      test(`${p.path} ${vp.name} ${theme}: ${CANDIDATE_NAME} matches build`, async ({ browser }, testInfo) => {
        const [ref, cand] = await Promise.all([
          capture(browser, BUILD_URL, p.path, vp, theme),
          capture(browser, CANDIDATE_URL, p.path, vp, theme),
        ]);

        expect(cand.text, 'visible text').toBe(ref.text);

        const firstDiff = ref.styles.findIndex((s, i) => s !== cand.styles[i]);
        expect.soft(cand.styles.length, 'number of elements').toBe(ref.styles.length);
        expect(firstDiff === -1 ? null : { build: ref.styles[firstDiff], [CANDIDATE_NAME]: cand.styles[firstDiff] },
          'first element whose computed style differs').toBeNull();

        const a = PNG.sync.read(ref.png);
        const b = PNG.sync.read(cand.png);
        expect(`${b.width}x${b.height}`, 'page size').toBe(`${a.width}x${a.height}`);
        const diff = new PNG({ width: a.width, height: a.height });
        const changed = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
        const ratio = changed / (a.width * a.height);
        if (ratio > MAX_DIFF_RATIO) {
          // Shown in the HTML report and written next to the failure in test-results/
          for (const [name, body] of [['build.png', ref.png], [`${CANDIDATE_NAME}.png`, cand.png], ['diff.png', PNG.sync.write(diff)]] as const) {
            await testInfo.attach(name, { body, contentType: 'image/png' });
            writeFileSync(testInfo.outputPath(name), body);
          }
        }
        expect(ratio, `share of differing pixels (${changed} px)`).toBeLessThanOrEqual(MAX_DIFF_RATIO);
      });
    }
  }
}
