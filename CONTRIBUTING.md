# Contributing to Celebris Vibe

Thanks for helping with the site. This guide covers how to make a change, the rules that keep the site consistent, and what a pull request needs to be merged. For setup and the project structure, see the [README](README.md).

## Workflow

1. **Start from an up-to-date `main`:**
   ```bash
   git checkout main
   git pull
   git checkout -b <type>/<short-topic>
   ```
   Branch types: `content/` (texts, prices, photos), `fix/`, `feat/`, `docs/`, `chore/`. Example: `content/new-package-prices`.
2. **Make the change** following the rules below.
3. **Check it locally:**
   ```bash
   npm run check     # must report 0 errors
   npm test          # full suite, ~3 min (first time: npx playwright install chromium)
   npm run dev       # look at the pages you changed, at phone (375 px) and desktop width, in dark and light theme
   ```
4. **Commit and push:** short, imperative messages, one topic per PR.
   ```bash
   git add -A
   git commit -m "Update package prices on Цени"
   git push -u origin <branch>
   ```
5. **Open a pull request to `main`** and fill in the template. Without write access, fork the repo and open the PR from your fork.
6. **Wait for the `test` check to go green.** `main` is protected: a PR can't be merged while the type check, build or tests fail. Every merge deploys to the live site within about a minute.

## Where to make common changes

| Change | File |
|---|---|
| Prices, packages, base prices | `src/data/site.ts` → `BASE_PRICES`, `PACKAGES` (and `ESTIMATE` for the calculator) |
| Event types, extras, guide, price factors, comparison | `src/data/site.ts` |
| Services (intros, lists, quotes, highlights) | `src/data/services.ts` |
| Page headlines and intros | the page in `src/pages/` |
| Contact details, social links, slogan | `src/data/site.ts` |
| Form labels and options | `src/components/ContactForm.astro`, options in `site.ts` |
| Colours, fonts, shared styles | `src/styles/global.css` |
| A photo | `src/assets/photos/<name>.jpg` (same name = replaced everywhere) |
| Booked dates | not in the code — the client's Google Sheet |

## Rules

**Content**
- Change text in `src/data/*.ts` when it lives there; don't copy it into page markup.
- Bulgarian copy: informal „ти“ in buttons and forms, „кавички“, ` — ` dashes, prices as `€500`. Agreed terms: "DJ и водещ", "Юбилеи", "Продуктови представяния", "Цялостен пакет".
- New or changed Bulgarian wording needs the client's approval — mark it in the PR.
- Client feedback documents (СТАРО / НОВО / ВАРИАНТ 3): use ВАРИАНТ 3 when present, otherwise НОВО.
- Legal text (privacy policy) changes only with the client's approval; update the date on the page.

**Code**
- No new frameworks or UI libraries. Interactivity is small TypeScript in the component's `<script>`.
- Use the theme variables from `global.css` (`--ink`, `--paper`, `--gold`…), never hardcoded colours, so both themes work.
- Links: `href()` from `src/lib/urls.ts` with `ROUTES`; internal URLs end with `/`.
- Images: `photo('<name>')` with `<Image>`/`<Picture>` from `astro:assets`.
- Page content sits inside `<section class="page-top">` / `<section class="section">`. Card titles use `.display` with a 20–28 px size; `.h1`–`.h3` are large section headings.
- New pages: copy the structure of a similar page, and add the page to `sitemap.xml.ts`, `llms.txt.ts`, `src/data/og.ts` and `tests/e2e/env.ts`.
- Structural changes: update the AI skill in `skills/celebrisvibe-contributor/` too.
- New fonts must cover Cyrillic and be self-hosted (`@fontsource/*`).
- Write gradients in minified form (`linear-gradient(A, B 80%)`, `90deg`) — otherwise the dev-vs-build parity test fails.
- Never commit `.env` or secret values.

**Tests**
- When you intentionally change something a test asserts (a page headline in `tests/e2e/env.ts`, a button label, a price), update the test in the same PR. Don't skip or delete tests to get green.
- Prices: keep `BASE_PRICES`, `PACKAGES`, the `/ceni/` intro, `ESTIMATE` and the calculator tests in agreement.
- A failing parity test shows its screenshots and diff in `npm run test:report`. Network errors (`ERR_NETWORK_*`) are environmental — rerun first.

## Pull request checklist

The [PR template](.github/pull_request_template.md) asks for:

- What changed and why, and which pages
- Screenshots for visual changes (phone + desktop)
- `npm run check` and `npm test` results
- Anything the owner or client must decide (wording, legal text, prices)

## Known pitfalls

- The bookings sheet secret must be the **CSV** publish link, not the „Уеб страница“ link — otherwise every date shows as free.
- The enquiry form emails the client; it does not add dates to the bookings sheet. That is intended.
- Elements with `display: flex/grid` ignore `hidden` unless the global `[hidden]` rule stays in `global.css`.
- Visible email addresses are wrapped in `<EmailOff>` so Cloudflare doesn't rewrite them.
- Old single-page links (`/#contact` from printed QR codes) are redirected by a small script on the home page — keep it.

## Using an AI assistant

The repo includes an AI skill, [`skills/celebrisvibe-contributor`](skills/celebrisvibe-contributor/SKILL.md), that describes this codebase in detail (architecture, content map, recipes, gotchas). To use it with ChatGPT or Claude:

1. Run `npm run skill:zip` → `dist-skills/celebrisvibe-contributor.zip`.
2. Import the zip in your assistant's skill settings.
3. Ask for your change and paste the files it asks for — it can't see your copy of the repo.

**Keep it current:** if your PR changes the structure (new page, renamed file, new data field, different pricing rules, new workflow), update the matching file in `skills/celebrisvibe-contributor/` in the same PR.

## Questions

Open an issue or ask in the pull request.
