# Recipes for common requests

## Contents
1. Change a price or package
2. Change any text on a page
3. Add an "extra" (Допълнителни опции)
4. Add or change an event type card
5. Add a new service (new page under /uslugi/)
6. Add a new page (e.g. ЧЗВ / FAQ)
7. Replace or add a photo
8. Change contact details or social links
9. Change the calculator rules
10. Add a booked date
11. Update the privacy policy
12. Apply a client feedback document

---

## 1. Change a price or package

1. `src/data/site.ts`: update `BASE_PRICES.items` and/or the `PACKAGES` entry (`prices` lines, `from` = lowest number, `items`, `note`).
2. The hero intro on `/ceni/` (`src/pages/ceni.astro`) quotes the base prices in prose — update it to match.
3. Update `ESTIMATE` so the calculator still matches (see interactive.md). The calculator **adds** components (DJ + sound + host + lights), so changing one component changes every combination that includes it — e.g. raising sound by €50 also raises "Цялостен пакет" from €900 to €950. When only one package price should change, ask which combinations the client wants, then list all resulting calculator prices for confirmation.
4. Update the estimator tests in `tests/e2e/site.spec.ts` (they assert €200/€300/€400/€500/€900 and €700).
5. `llms-full.txt` updates itself from `site.ts`; no edit needed unless its hand-written sentences mention prices.
6. `npm run check && npm test`; check `/ceni/` on desktop and phone.

## 2. Change any text on a page

1. Find it (table in content.md, or `grep -rn "<a few words>" src`).
2. Edit in the data file if it lives there; otherwise in the page/component.
3. If it is a page `<h1>`: update `tests/e2e/env.ts` `PAGES[].h1` and the page's headline in `src/data/og.ts`.
4. If a test clicks or asserts that text, update `tests/e2e/site.spec.ts`.
5. Keep the Bulgarian style rules (content.md).

## 3. Add an extra

1. Add the photo `src/assets/photos/extra-<name>.jpg`.
2. Append to `EXTRAS` in `site.ts`: `{ title: '…', tag: '…', photo: 'extra-<name>', desc: '…' }`.
3. The grid shows five per row on wide screens; with six or more, check the layout at 1440 px and adjust the `@media (min-width: 1400px)` rule in `Extras.astro` if a lone card appears.
4. "Добави към запитване" works automatically (uses `title`).

## 4. Add or change an event type card

Edit `EVENT_TYPES` in `site.ts` (`key`, `formLabel`, `photo`, `title`, `subtitle`, `desc`, `tags`). `formLabel` must exist in `FORM_EVENT_TYPES` so the card pre-selects it in the form. Three cards fit one row; a fourth wraps.

## 5. Add a new service

1. Add photos for the service and its five highlights.
2. Append a `Service` object to `SERVICES` in `src/data/services.ts` with a transliterated `slug` (e.g. `foto-i-video`), all fields filled (`summary`, `description`, `intro`, `seoTitle`, `quote`, `includes`, `fits`, `formServices`, `highlights` ×5).
3. Automatically handled: the page `/uslugi/<slug>/`, the home showcase tab, /uslugi/ cards and summaries, sitemap, llms.txt, link-preview image, "Други услуги".
4. Manual: add the service name to `FORM_SERVICES` if visitors should tick it; add `{ path: '/uslugi/<slug>/', h1: '<title>', og: '<slug>' }` to `PAGES` in `tests/e2e/env.ts`; check the showcase tabs still fit on a phone (four tabs are tight at 375 px).

## 6. Add a new page

Example: `/chzv/` (ЧЗВ — често задавани въпроси).

1. `src/pages/chzv.astro`: copy the structure of `poveritelnost.astro` (text page) — `Base` with title, description, `og="faq"`; a `<section class="page-top">` with `Eyebrow` + `.h1` + `.lead`; then `<section class="section">` with the content and, inside that same section, a `CtaBand`. Put the questions in `site.ts` (e.g. `FAQ: [question, answer][]`), not in the page. Question titles: `class="display"` with ~20–24 px set in the page style (not `.h3`, which is 52 px). A native `<details>/<summary>` accordion needs no JavaScript.
2. `site.ts`: add to `ROUTES`; add to `NAV` only if it belongs in the main menu.
3. `src/data/og.ts`: add `faq: { eyebrow: 'ЧЗВ', title: '…', photo: '…' }`.
4. `src/pages/sitemap.xml.ts`: add the route. `src/pages/llms.txt.ts`: add a line under "Страници" (and content to `llms-full.txt.ts` if useful).
5. Optional JSON-LD via `schema` (e.g. `FAQPage` with `mainEntity` questions).
6. `tests/e2e/env.ts`: add to `PAGES`.
7. Check desktop/phone, both themes.

## 7. Replace or add a photo

Same file name = automatic replacement. New name: add the file to `src/assets/photos/` and reference it by name. See content.md "Photos". Remember: the contributor must add binary files to the repo themselves.

## 8. Change contact details or social links

`site.ts`: `CONTACT_EMAIL`, `CONTACT_PHONE` (the `tel:` link strips everything except digits and `+`), `SOCIAL.instagram` / `SOCIAL.facebook` (full `https://` URLs; once real URLs are set they are also added to the Organization JSON-LD as `sameAs`). The privacy page and llms files read these automatically.

## 9. Change the calculator rules

1. `site.ts`: `ESTIMATE` values and, if the model changes (e.g. per-hour pricing), `estimatePrice()`.
2. `Estimator.astro` if inputs change (new checkbox, slider range = `ESTIMATE.minHours`…`maxHours + 1`).
3. Make sure published prices (`BASE_PRICES`, `PACKAGES`, `/ceni/` intro) still match.
4. Update the estimator tests. List the resulting prices for the contributor to confirm with the client.

## 10. Add a booked date

No code change. In the Google Sheet "Celebris – booked dates", tab "Лист1", add the date in column A (e.g. `20.12.2026`). The site picks it up within ~5 minutes. Verify by opening the CSV publish link or by picking the date in "Провери свободна дата" on `/kontakti/`.

## 11. Update the privacy policy

Edit `src/pages/poveritelnost.astro`, update `UPDATED`. Legal wording must be approved by the client; mark proposed text clearly in the PR. If you add a new third-party service (analytics, chat widget, fonts from a CDN), the policy must mention it — and the current policy promises no tracking cookies and self-hosted fonts.

## 12. Apply a client feedback document

1. Extract each СТАРО / НОВО / ВАРИАНТ 3 table (if you can run code: the `.docx` is a zip; read `word/document.xml`; cells use `<w:br/>` between lines).
2. Apply ВАРИАНТ 3 where present, else НОВО. Follow "What else to update" in content.md.
3. List anything ambiguous (new blocks without a location, inconsistent naming, numbers that contradict the calculator) for the owner.
4. Verify: every applied line appears on the built page it belongs to, and no СТАРО line remains (`npm run build`, then search `dist/**/index.html`).
