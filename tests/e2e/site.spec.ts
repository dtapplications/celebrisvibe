import type { APIRequestContext, Page } from '@playwright/test';
import { test, expect, settle, checkedServices } from './fixtures';
import { BOOKED_DATE, FREE_DATE, PAGES } from './env';

const SITE = 'https://celebrisvibe.com';
const isLive = () => test.info().project.name === 'live';

/** Description, canonical URL and a working 1200×630 link-preview image for this page */
async function expectSeo(page: Page, request: APIRequestContext, path: string, og: string) {
  const meta = (sel: string) => page.locator(sel).first().getAttribute('content');
  expect((await meta('meta[name="description"]'))!.length).toBeGreaterThan(50);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${path}`);
  expect(await meta('meta[property="og:image"]')).toBe(`${SITE}/og/${og}.jpg`);
  expect(await meta('meta[name="twitter:image"]')).toBe(`${SITE}/og/${og}.jpg`);
  expect(await meta('meta[property="og:image:alt"]')).toBeTruthy();
  expect(await meta('meta[property="og:title"]')).toBe(await page.title());
  const img = await request.get(`/og/${og}.jpg`);
  expect(img.status()).toBe(200);
  expect(img.headers()['content-type']).toContain('image/jpeg');
  const body = await img.body();
  // JPEG SOF0/SOF2 marker holds the size: check it is 1200×630
  const sof = body.findIndex((b, i) => b === 0xff && (body[i + 1] === 0xc0 || body[i + 1] === 0xc2));
  expect([body.readUInt16BE(sof + 7), body.readUInt16BE(sof + 5)]).toEqual([1200, 630]);
}

test.describe('pages', () => {
  for (const p of PAGES) {
    test(`${p.path} renders with SEO tags and loads every image`, async ({ page, request }) => {
      const res = await page.goto(p.path);
      expect(res?.status()).toBe(200);

      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toContainText(p.h1);
      await expect(page).toHaveTitle(/Celebris Vibe/);
      await expectSeo(page, request, p.path, p.og);

      const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
      expect(ld['@graph'][0]).toMatchObject({ '@type': 'Organization', url: `${SITE}/` });

      await settle(page);
      const broken = await page.$$eval('img', imgs => imgs.filter(i => !i.naturalWidth).map(i => i.src));
      expect(broken).toEqual([]);
    });
  }

  test('every internal link points to an existing page', async ({ page, request }) => {
    const links = new Set<string>();
    for (const p of PAGES) {
      await page.goto(p.path);
      for (const href of await page.$$eval('a[href^="/"]', as => as.map(a => (a as HTMLAnchorElement).pathname))) links.add(href);
    }
    for (const href of links) {
      expect((await request.get(href)).status(), href).toBe(200);
    }
  });

  test('unknown URLs show the 404 page', async ({ page, errors }) => {
    const res = await page.goto('/no-such-page/');
    expect(res?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('Тази песен');
    errors.length = 0; // the 404 response itself is expected
  });

  test('QR page links to the contact page', async ({ page, request }) => {
    await page.goto('/qr/');
    await expectSeo(page, request, '/qr/', 'qr');
    await expect(page.locator('.qr-wrap svg')).toBeVisible();
    await expect(page.locator('.url')).toHaveText(`${SITE}/kontakti/`);
    await expect(page.getByRole('link', { name: 'Отвори формата' })).toHaveAttribute('href', '/kontakti/');
  });

  test('sitemap and llms.txt list every page', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const llms = await (await request.get('/llms.txt')).text();
    for (const p of PAGES) {
      expect(sitemap).toContain(`<loc>${SITE}${p.path}</loc>`);
      if (p.path !== '/') expect(llms).toContain(`${SITE}${p.path}`);
    }
    expect(sitemap).toContain(`<loc>${SITE}/qr/</loc>`);
    expect(await (await request.get('/llms-full.txt')).text()).toContain('## Услуги');
  });
});

test.describe('navigation and theme', () => {
  test('header links open each page and mark it as current', async ({ page }) => {
    await page.goto('/');
    for (const [label, path] of [['Услуги', '/uslugi/'], ['Цени', '/ceni/'], ['Контакти', '/kontakti/']]) {
      await page.locator('header nav').getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(path);
      await expect(page.locator('header nav a[aria-current="page"]')).toHaveText(label);
    }
  });

  test('mobile menu opens, closes and navigates', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const menu = page.locator('#mobile-menu');
    await expect(page.locator('header nav')).toBeHidden();
    await page.getByRole('button', { name: 'Отвори менюто' }).click();
    await expect(menu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await page.getByRole('button', { name: 'Отвори менюто' }).click();
    await menu.getByRole('link', { name: 'Цени' }).click();
    await expect(page).toHaveURL('/ceni/');
  });

  test('theme switch is remembered on the next page', async ({ page }) => {
    await page.goto('/');
    const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(await bg()).toBe('rgb(18, 19, 23)');
    await page.getByRole('button', { name: 'Смени темата' }).click();
    expect(await bg()).toBe('rgb(242, 241, 236)');
    await page.goto('/ceni/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await bg()).toBe('rgb(242, 241, 236)');
  });

  for (const [hash, path] of [['contact', '/kontakti/'], ['services', '/uslugi/'], ['prices', '/ceni/'], ['privacy', '/poveritelnost/']]) {
    test(`old link /#${hash} redirects to ${path}`, async ({ page }) => {
      await page.goto(`/#${hash}`);
      await expect(page).toHaveURL(path);
    });
  }
});

test.describe('interactive sections', () => {
  test('home showcase switches services and steps', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Озвучаване' }).click();
    await expect(page.getByRole('tab', { name: 'Озвучаване' })).toHaveAttribute('aria-selected', 'true');
    const panel = page.locator('.body:not([hidden])');
    await panel.locator('.step', { hasText: 'Конференции и презентации' }).click();
    await expect(panel.locator('.detail:not([hidden]) h3')).toHaveText('Конференции и презентации');
    await panel.locator('.detail:not([hidden])').getByRole('button', { name: 'Следваща' }).click();
    await expect(panel.locator('.detail:not([hidden]) h3')).toHaveText('Фонова музика');
  });

  test('price estimator updates and pre-fills the contact form', async ({ page }) => {
    await page.goto('/ceni/');
    const total = page.locator('[data-total]');
    await expect(total).toHaveText('1050');
    await page.locator('#est-hours').fill('7');
    await page.locator('label.choice', { hasText: 'Фирмено' }).click();
    await page.locator('label.choice', { hasText: '150 – 300' }).click();
    await expect(total).toHaveText('1250');

    await page.getByRole('link', { name: 'Получи точна оферта' }).click();
    await expect(page).toHaveURL('/kontakti/');
    await expect(page.locator('input[name="type"]:checked')).toHaveValue('Корпоративно');
    await expect(page.locator('select[name="guests"]')).toHaveValue('150 – 300');
    await expect.poll(() => checkedServices(page)).toEqual(['DJ', 'Водещ', 'Озвучаване', 'Осветление']);
    await expect(page.locator('textarea[name="note"]')).toHaveValue('Ориентировъчна оценка от сайта: от €1250, 7 часа');
  });

  test('"add extra" appends to the enquiry and is marked as added', async ({ page }) => {
    await page.goto('/uslugi/');
    await page.locator('article', { hasText: 'Фотокабина' }).getByRole('link', { name: 'Добави към запитване' }).click();
    await expect(page).toHaveURL('/kontakti/');
    await expect(page.locator('textarea[name="note"]')).toHaveValue('Допълнително: Фотокабина');
    await page.goto('/uslugi/');
    await expect(page.locator('article', { hasText: 'Фотокабина' }).locator('[data-extra]')).toHaveText('Добавено ✓');
  });

  test('service page enquiry pre-selects that service', async ({ page }) => {
    await page.goto('/uslugi/ozvuchavane/');
    await page.getByRole('link', { name: 'Запитване за Озвучаване' }).click();
    await expect.poll(() => checkedServices(page)).toEqual(['Озвучаване']);
  });
});

test.describe('contact form', () => {
  test('"request a call" switches the form to call mode', async ({ page }) => {
    await page.goto('/');
    await page.locator('main').getByRole('link', { name: 'Поискай обаждане' }).click();
    await expect(page).toHaveURL('/kontakti/');
    await expect(page.locator('[data-contact]')).toHaveAttribute('data-mode', 'call');
    await expect(page.locator('input[name="email"]')).toBeHidden();
    await expect(page.locator('label.choice', { hasText: 'Следобед' })).toBeVisible();
    await expect(page.locator('[data-submit]')).toHaveText('Поискай обаждане');
  });

  test('validates fields, sends an enquiry and blocks a quick second one', async ({ page, sent }) => {
    await page.goto('/kontakti/');
    await page.clock.fastForward(4000); // past the 3 s bot check
    const error = page.locator('[data-error]');
    const submit = page.locator('[data-submit]');

    await submit.click();
    await expect(error).toHaveText('Моля, въведи името си.');
    await page.fill('input[name="name"]', 'Тест Тестов');
    await page.fill('input[name="phone"]', 'abc');
    await submit.click();
    await expect(error).toHaveText('Моля, въведи валиден телефонен номер.');
    await page.fill('input[name="phone"]', '+359 888 123 456');
    await page.fill('input[name="email"]', 'not-an-email');
    await submit.click();
    await expect(error).toHaveText('Имейлът не изглежда валиден.');
    await page.fill('input[name="email"]', 'test@example.com');
    await submit.click();
    await expect(error).toContainText('Политиката за поверителност');

    await page.locator('label.choice', { hasText: 'Частно събитие' }).click();
    await page.locator('[data-date-picker] .dp-trigger').click();
    await page.locator(`[data-date-picker] [data-iso="${FREE_DATE}"]`).click();
    await page.fill('input[name="location"]', 'София');
    await page.selectOption('select[name="guests"]', '50 – 150');
    await page.locator('label.choice', { hasText: 'Озвучаване' }).click();
    await page.fill('textarea[name="note"]', 'Тестово съобщение');
    await page.locator('input[name="consent"]').check();
    await submit.click();

    await expect(page.locator('[data-sent]')).toBeVisible();
    await expect(page.locator('[data-sent-title]')).toHaveText('Запитването е изпратено');
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      'Тип': 'Запитване', 'Име': 'Тест Тестов', 'Телефон': '+359 888 123 456', email: 'test@example.com',
      'Вид събитие': 'Частно събитие', 'Дата': FREE_DATE, 'Локация': 'София', 'Гости': '50 – 150',
      'Услуги': 'Озвучаване', 'Съобщение': 'Тестово съобщение',
    });
    if (!isLive()) expect(sent[0].access_key).toBe('test-key');
    expect(await page.evaluate(() => sessionStorage.getItem('cv-draft'))).toBeNull();

    await page.getByRole('button', { name: 'Обратно към формата' }).click();
    await submit.click();
    await expect(error).toContainText('Вече получихме запитване');
    expect(sent).toHaveLength(1);
  });

  test('sends a call request', async ({ page, sent }) => {
    await page.goto('/kontakti/');
    await page.clock.fastForward(4000);
    await page.locator('.modes label', { hasText: 'Поискай обаждане' }).click();
    await page.fill('input[name="name"]', 'Тест');
    await page.fill('input[name="phone"]', '0888123456');
    await page.locator('label.choice', { hasText: 'Вечерта' }).click();
    await page.locator('input[name="consent"]').check();
    await page.locator('[data-submit]').click();
    await expect(page.locator('[data-sent-title]')).toHaveText('Обаждането е записано');
    expect(sent[0]).toMatchObject({ 'Тип': 'Обаждане', 'Име': 'Тест', 'Телефон': '0888123456', 'Удобно време': 'Вечерта' });
  });

  test('bots filling the hidden honeypot get a fake success and nothing is sent', async ({ page, sent }) => {
    await page.goto('/kontakti/');
    await page.clock.fastForward(4000);
    await page.fill('input[name="name"]', 'Bot');
    await page.fill('input[name="phone"]', '0888123456');
    await page.locator('input[name="consent"]').check();
    await page.locator('input[name="company_website"]').evaluate((i: HTMLInputElement) => { i.value = 'https://spam.example'; });
    await page.locator('[data-submit]').click();
    await expect(page.locator('[data-sent]')).toBeVisible();
    expect(sent).toHaveLength(0);
  });

  test('date check reports booked and free dates', async ({ page }) => {
    test.skip(isLive(), 'the live site reads the real bookings sheet');
    await page.goto('/kontakti/');
    const checker = page.locator('[data-date-check]');
    await checker.locator('.dp-trigger').click();
    await expect(checker.locator(`[data-iso="${BOOKED_DATE}"]`)).toHaveClass(/is-booked/);
    await checker.locator(`[data-iso="${BOOKED_DATE}"]`).click();
    await expect(page.locator('[data-status="taken"]')).toBeVisible();

    await checker.locator('.dp-trigger').click();
    await checker.locator(`[data-iso="${FREE_DATE}"]`).click();
    await expect(page.locator('[data-status="available"]')).toBeVisible();
    await expect(page.locator('[data-date-picker] .dp-label')).toHaveText('21 ноември 2026 г.');
    await expect(page.locator('input[name="date"]')).toHaveValue(FREE_DATE);
  });
});
