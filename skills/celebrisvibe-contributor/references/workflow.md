# Workflow: setup, tests, pull requests, deploy

## Contents
- Local setup
- Everyday commands
- Tests: what they check and how to update them
- Pull request flow
- CI and deployment
- Secrets, domain and Cloudflare

## Local setup

Requirements: Git, Node.js 24, npm. Works on Windows (Git Bash or PowerShell), macOS and Linux.

```bash
git clone https://github.com/dtapplications/celebrisvibe.git
cd celebrisvibe
npm ci
cp .env.example .env          # leave values empty unless the owner gives you test keys
npx playwright install chromium   # once, for the tests
npm run dev                   # http://localhost:4321
```

With an empty `.env`: the contact form logs the payload to the browser console instead of sending, and the calendar shows demo booked dates (dev only). That is enough for almost all work. Never commit `.env`.

## Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload at `http://localhost:4321` |
| `npm run build` | Production build into `dist/` (also renders link-preview images) |
| `npm run preview` | Serves `dist/` like production |
| `npm run check` | TypeScript and Astro type check — must report 0 errors |
| `npm test` | Full Playwright suite (~3 min): builds with fake keys, starts dev, runs everything |
| `npx playwright test --project=build` | Functional tests on the production build only (faster) |
| `npx playwright test -g "estimator"` | Only tests whose name matches |
| `npm run test:report` | Opens the HTML report of the last run (screenshots and diffs of failures) |
| `npm run skill:zip` | Packages `skills/celebrisvibe-contributor` into `dist-skills/celebrisvibe-contributor.zip` |
| `LIVE_URL=https://celebrisvibe.com npm test` | Same tests against the live site after a deploy (PowerShell: `$env:LIVE_URL="https://celebrisvibe.com"; npm test`) |

## Tests (`tests/e2e`)

Three Playwright projects:

- **build** and **dev** run the same functional tests (`site.spec.ts`) against the production build and the dev server: every page loads with one `<h1>`, SEO tags, a working 1200×630 preview image and no broken images or internal links, no console errors; navigation, mobile menu, theme persistence, old `/#…` redirects, showcase, calculator prices, "add extra", service enquiry pre-fill, call mode, form validation/sending/rate limit/honeypot, date checker, QR page, 404, sitemap and llms.txt.
- **parity** (`parity.spec.ts`) opens every page at 1440 px and 390 px in dark and light theme on both dev and build and requires identical visible text, identical computed styles on every element, and ≤ 0.2% differing pixels.

Mocks: Web3Forms and the bookings sheet are intercepted in the browser, so tests never send a real enquiry or read the real sheet, even against the live site. The fake "today" is `NOW` in `tests/e2e/env.ts` (10 Nov 2026), booked test date 20 Nov, free 21 Nov.

When your change intentionally alters something a test asserts, update the test in the same commit:

- Page headline → `PAGES[].h1` in `env.ts`.
- New page → add to `PAGES` (path, h1, og key); it is then covered by SEO, link, image and parity tests automatically.
- Button/label text a test clicks → `site.spec.ts`.
- Prices/calculator → the two estimator tests in `site.spec.ts`.

If a parity test fails, open `npm run test:report`: it attaches `build.png`, `dev.png` and `diff.png`, or names the first element whose computed style differs. Usual causes are listed in gotchas.md. Network blips (`ERR_NETWORK_CHANGED`, `ERR_NETWORK_IO_SUSPENDED`) are environmental — rerun before debugging.

## Pull request flow

Every change — including small fixes and docs — goes through a pull request. Never commit, push or merge directly to `main`: pushes to `main` deploy immediately and skip the `build`/`test` checks. AI agents open the PR and stop; a human merges after the checks pass.

```bash
git checkout main && git pull
git checkout -b <type>/<short-topic>        # e.g. content/new-package-prices, fix/mobile-menu, feat/faq-page
# …make the change…
npm run check
npm test                                    # or at least: npm run build
git add -A
git commit -m "Update package prices on Цени"
git push -u origin <branch>
```

The PR template (`.github/pull_request_template.md`) contains the checklist. Then open a pull request to `main` on GitHub (or `gh pr create --base main`). Contributors without write access fork the repo first and open the PR from the fork.

PR description: what changed and why, which pages, screenshots for visual changes (desktop + phone), and what you tested. Mention anything the owner must decide (e.g. Bulgarian copy you proposed, legal text).

## CI and deployment

- `.github/workflows/test.yml` — on every pull request, two checks that must both pass to merge: **`build`** (`npm run check`, `npm run build`, verifies every page and the generated files exist) and **`test`** (installs Chromium, `npm test`). On failure the Playwright report is uploaded as an artifact.
- `.github/workflows/deploy.yml` — on every push to `main` (and manual run): build with the real secrets and publish to GitHub Pages. No tests run here, to keep deploys fast — so merge only PRs whose Test run is green.
- Every page carries `<meta name="build" content="<commit sha>">`, which shows which commit is live.
- Rolling back = revert the commit on `main` and push; the deploy runs again.

## Secrets, domain and Cloudflare

- GitHub Actions secrets: `FORMSSECRET` (→ `PUBLIC_WEB3FORMS_KEY`) and `BOOKED_DATES_CSV_URL` (→ `PUBLIC_BOOKED_DATES_CSV_URL`). They are baked into the build, so changing a secret requires a redeploy (Actions → Deploy to GitHub Pages → Run workflow). Only the owner manages them.
- Domain `celebrisvibe.com`: DNS at Cloudflare, proxied. GitHub Pages custom domain is set in the repo settings (and `public/CNAME`); GitHub's "Enforce HTTPS" stays off because Cloudflare provides HTTPS.
- Cloudflare settings that matter: SSL/TLS mode **Full** (not Flexible, not Strict), **Always Use HTTPS** on, a redirect rule `www.celebrisvibe.com/*` → `https://celebrisvibe.com/${1}`, AI-training-bot blocking (adds rules to robots.txt). Email obfuscation is neutralised in code with `<EmailOff>`.
- Search engines: the site is indexable (sitemap, canonical URLs, no noindex except 404). Google Search Console is where indexing is requested and old URLs are removed.
