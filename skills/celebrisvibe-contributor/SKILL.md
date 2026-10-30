---
name: celebrisvibe-contributor
description: Helps people contribute to the Celebris Vibe website (github.com/dtapplications/celebrisvibe, live at celebrisvibe.com) - an Astro 7 static site in Bulgarian for a DJ / events company, deployed to GitHub Pages behind Cloudflare. Use this skill whenever someone wants to change, fix, add or review anything on that site or repo - texts and prices, services, photos, pages, styles, the price calculator, the contact form, the booked-dates Google Sheet, SEO and link previews, tests, GitHub Actions, the domain or Cloudflare - or asks how the project works, how to run it locally, or how to open a pull request for it. Use it even when the request only says "the site", "Celebris", "celebrisvibe" or names a page such as Цени, Услуги or Контакти.
---

# Contributing to Celebris Vibe

You are helping someone change the Celebris Vibe website. Most contributors work from a chat window: you usually cannot run the project, open their files or push to GitHub. Your job is to know this codebase well enough to tell them exactly which files to change, give them the finished code, and walk them through testing it and opening a pull request.

## The project in one minute

- **Site:** https://celebrisvibe.com - Bulgarian-language marketing site for a DJ, host (водещ), sound and lighting company. Pages: `/` Начало, `/uslugi/` Услуги (+ one page per service), `/ceni/` Цени, `/kontakti/` Контакти, `/poveritelnost/` privacy, `/qr/` printable QR card, plus `404`.
- **Repo:** https://github.com/dtapplications/celebrisvibe, default branch `main`.
- **Stack:** Astro 7 (static output), plain TypeScript in `<script>` tags for interactivity (no React or other UI framework), CSS with custom properties, `astro:assets` for images, Playwright for tests. Node 24.
- **Content lives in data files, not in page markup:** `src/data/site.ts` (prices, packages, event types, extras, form options, calculator rules, routes, contact details) and `src/data/services.ts` (the three services). Most text changes are edits to these two files.
- **Deploy:** every push to `main` builds and publishes to GitHub Pages (`.github/workflows/deploy.yml`). Cloudflare sits in front for DNS, HTTPS and `www` redirect. Pull requests run two required checks (`.github/workflows/test.yml`): `build` (type check + build) and `test` (full test suite); deploys don't run them.

## How to work with the contributor

1. **Understand the change.** Restate it in one sentence. If it is ambiguous in a way that changes the code (which page? replace or add? applies to all pages?), ask one focused question. Otherwise pick the conventional option and say so.
2. **Locate it.** Use the map in [references/architecture.md](references/architecture.md) to name the exact file(s). Text and prices: [references/content.md](references/content.md). Styles: [references/styling.md](references/styling.md). Calculator, contact form, calendar, sheet: [references/interactive.md](references/interactive.md).
3. **Get the current file before editing it.** Ask the contributor to paste or upload the current version of each file you will change (or the zipped repo). The repo changes often; editing from memory produces broken patches. If they cannot, write the change as clear find-and-replace instructions anchored on text that is unlikely to have moved.
4. **Write the change.** Follow the conventions below. Return each changed file in full when it is short (under ~150 lines) or the edit touches many places; otherwise give exact before/after snippets with the file path. Never return partial files presented as complete.
5. **Update what depends on it.** Text in `site.ts`/`services.ts` also feeds `llms.txt`, `llms-full.txt`, link-preview images and the tests - check [references/content.md](references/content.md) "What else to update". Changing a page `<h1>` means updating `tests/e2e/env.ts`.
6. **Hand over testing and the PR.** Give the commands from [references/workflow.md](references/workflow.md): branch, `npm run check`, `npm test` (or at least `npm run build`), commit, push, open a PR. Tell them what to look at in the browser.
7. **Say what you could not verify.** You did not run the build. Say so plainly and point to the command that will catch problems.

If the contributor can share the repo (zip upload) and you can execute code, read the real files and run the Node scripts yourself where possible - but never claim tests passed unless you saw them pass.

## Conventions that matter here

- **Bulgarian copy.** Address the visitor informally (ти/твоя), except where the client deliberately uses вие/вашите (e.g. „съобразени с вас, вашите гости“). Use the em dash with spaces ` — ` in new copy; older copy uses ` - `, keep whichever the surrounding text uses. Quotes are „…“. Prices are written `€500`, `От €900`, `Минимум 2 часа — €200`. Never machine-translate client wording; if a change needs new Bulgarian text and the contributor did not provide it, propose it and flag it for the client to approve.
- **Change data, not markup.** If text exists in `src/data/*.ts`, edit it there. Pages render from data; hardcoding a copy in a page creates two versions that drift.
- **No new dependencies or frameworks** without a clear reason. Interactive code is small TypeScript in the component's `<script>` (bundled and minified by Astro). Do not add React, Vue, jQuery, Tailwind or CSS frameworks.
- **Styles** use the CSS variables from `src/styles/global.css` (both themes: dark default, light via `data-theme="light"`). Never hardcode theme colours. Scoped `<style>` per component; shared utilities (`.btn`, `.card`, `.tag`, `.h1`…) in `global.css`. Heading classes are large (`.h3` is 52 px) — card and list titles use `.display` with a local 20–28 px size. All content sits inside `<section class="page-top">` / `<section class="section">`, which provide the side padding; `CtaBand` goes inside a section.
- **New pages copy the closest existing page** (`poveritelnost.astro` for text, `ceni.astro` for cards) so spacing and sizes match.
- **Links** use `href('/path/')` from `src/lib/urls.ts` and the `ROUTES` constants. Internal URLs end with `/`.
- **Images** go in `src/assets/photos/<name>.jpg` and are used via `photo('<name>')` with `<Image>`/`<Picture>` from `astro:assets` - never `<img src="/assets/photos/...">`.
- **Secrets** (`PUBLIC_WEB3FORMS_KEY`, `PUBLIC_BOOKED_DATES_CSV_URL`) come from `.env` locally and GitHub Actions secrets in CI. Never ask for, print or commit their values. `.env` is git-ignored.
- **Tests guard behaviour and dev/build parity.** When text in a test changes on purpose, update the test in the same change; do not delete or skip tests to make a change pass.
- **Keep commits focused**, one topic per PR, with a short imperative message (e.g. `Update DJ package prices`).

## Things that look harmless but break the site

Read [references/gotchas.md](references/gotchas.md) before touching styles, the contact page, deployment or the Google Sheet. The short version:

- Elements styled with `display:flex/grid` ignore the `hidden` attribute unless the global `[hidden]{display:none!important}` rule stays.
- Write gradients the way the CSS minifier outputs them (`linear-gradient(rgba(...), rgba(...) 80%)`, `90deg` instead of `to right`) or the dev-vs-build parity test fails.
- The booked-dates secret must be the **CSV** publish link (`…/pub?gid=0&single=true&output=csv`), not the „Уеб страница“ link (`…/pubhtml…`).
- Heading font is Onest because the earlier one had no Cyrillic. Any new font must cover Cyrillic.
- Visible email addresses are wrapped in `<EmailOff>` so Cloudflare does not rewrite them.
- The enquiry form only emails the client (Web3Forms). It does not write to the Google Sheet - that is by design.

## Reference files

| File | Read it when |
|---|---|
| [references/architecture.md](references/architecture.md) | You need to find where something lives, or understand pages, layout, data flow |
| [references/content.md](references/content.md) | Changing texts, prices, packages, services, extras, photos, SEO titles, link previews |
| [references/styling.md](references/styling.md) | Changing look, layout, colours, fonts, responsive behaviour |
| [references/interactive.md](references/interactive.md) | Calculator, contact form, calendar/booked dates, enquiry draft, theme switch, menu |
| [references/workflow.md](references/workflow.md) | Local setup, testing, branches, PRs, CI, deploys, secrets, Cloudflare, domain |
| [references/gotchas.md](references/gotchas.md) | Before styling, contact-page, deploy or Google Sheet work, and when something "mysteriously" breaks |
| [references/recipes.md](references/recipes.md) | Step-by-step for common requests (change a price, add a service, add a page, swap a photo…) |

## Keeping this skill current

This skill lives in the repo at `skills/celebrisvibe-contributor/` and describes the code as of its last update. If the contributor's files contradict it (a file moved, a field renamed, different prices), trust the files, say what differs, and suggest updating the matching reference file in the same PR. Rebuild the zip with `npm run skill:zip`.

## Answer format

For a change request, structure the reply as:

1. **What will change** - one or two sentences, in the contributor's language.
2. **Files** - each path, then the full new file or exact before/after snippet.
3. **Also updated** - dependent files (tests, `llms-full.txt`, etc.) or "none".
4. **Test it** - the commands and what to check in the browser.
5. **Open the PR** - branch name, commit message, PR title.
6. **Not verified** - anything you could not check.

For a question about how something works, answer directly and cite file paths.
