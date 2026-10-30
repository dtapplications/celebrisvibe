# Celebris Vibe

Website of **Celebris Vibe** — DJ, host (водещ), sound and lighting for weddings, private and corporate events in Bulgaria.

**Live:** [celebrisvibe.com](https://celebrisvibe.com) · **Language:** Bulgarian · **Hosting:** GitHub Pages behind Cloudflare

Want to contribute? Read **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## Tech stack

- [Astro 7](https://astro.build) — static site, one `.astro` file per page
- Plain TypeScript in component `<script>` tags for interactivity (no UI framework)
- CSS with custom properties (dark and light theme), self-hosted fonts (Jost, Onest)
- `astro:assets` for responsive WebP/AVIF images
- [Playwright](https://playwright.dev) browser tests, including dev-vs-build visual parity
- Node.js 24

## Quick start

```bash
git clone https://github.com/dtapplications/celebrisvibe.git
cd celebrisvibe
npm ci
cp .env.example .env              # values can stay empty for local work
npm run dev                       # http://localhost:4321
```

With an empty `.env` the contact form logs to the browser console instead of sending, and the calendar shows demo booked dates. That is enough for almost all work.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve `dist/` like production |
| `npm run check` | Type check (must report 0 errors) |
| `npm test` | Full browser test suite (~3 min). First run once: `npx playwright install chromium` |
| `npm run test:report` | Open the report of the last test run (screenshots and diffs) |
| `npm run skill:zip` | Package the AI contributor skill into `dist-skills/celebrisvibe-contributor.zip` |

## Pages

| URL | Page | Source |
|---|---|---|
| `/` | Начало | `src/pages/index.astro` |
| `/uslugi/` | Услуги | `src/pages/uslugi/index.astro` |
| `/uslugi/dj-i-vodesht/`, `/uslugi/ozvuchavane/`, `/uslugi/osvetlenie/` | One page per service | `src/pages/uslugi/[slug].astro` + `src/data/services.ts` |
| `/ceni/` | Цени (prices + calculator) | `src/pages/ceni.astro` |
| `/kontakti/` | Контакти (date check + enquiry form) | `src/pages/kontakti.astro` |
| `/poveritelnost/` | Privacy policy | `src/pages/poveritelnost.astro` |
| `/qr/` | Printable QR card → `/kontakti/` | `src/pages/qr.astro` |

Also generated at build: `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt` (site summary for AI assistants) and a branded link-preview image per page at `/og/<page>.jpg`.

## Project structure

```
├── .github/
│   ├── workflows/deploy.yml     push to main → build → GitHub Pages
│   ├── workflows/test.yml       pull requests → type check + tests (required to merge)
│   └── pull_request_template.md
├── public/                      files served as-is (logos, favicons, CNAME)
├── src/
│   ├── assets/photos/           all photos (optimised at build)
│   ├── components/              sections and UI pieces (Header, Footer, ContactForm, Estimator…)
│   ├── data/
│   │   ├── site.ts              most content: routes, contacts, prices, packages, extras, form options, calculator rules
│   │   ├── services.ts          the three services
│   │   └── og.ts                link-preview image per page
│   ├── layouts/Base.astro       <head> (SEO, structured data, theme), header, footer
│   ├── lib/                     helpers: urls, photos, enquiry draft, date picker, booked dates, preview images
│   ├── pages/                   one file per URL + generated files (sitemap, llms, og images)
│   └── styles/global.css        theme colours, base styles, shared classes
├── tests/e2e/                   Playwright tests (env.ts lists every page)
├── skills/celebrisvibe-contributor/   AI assistant skill describing this codebase (see CONTRIBUTING)
├── scripts/package-skill.mjs    builds the skill zip: npm run skill:zip
├── astro.config.mjs
└── playwright.config.ts
```

**Most text and all prices live in `src/data/site.ts` and `src/data/services.ts`**, not in the page markup. Pages, `llms.txt`, link previews and structured data are generated from them.

## How the main features work

- **Theme:** dark by default; the header button switches to light and remembers the choice.
- **Price calculator** (`/ceni/`): rules in `site.ts` → `ESTIMATE`, matching the published base prices (DJ 2 h €200, up to 5 h €300, + sound / host / lights €200 each).
- **Enquiry form** (`/kontakti/`): sends an email to the client via [Web3Forms](https://web3forms.com). It does **not** write to the bookings sheet.
- **Booked dates:** read from a Google Sheet published as CSV (column A, e.g. `31.12.2026`). The client adds confirmed bookings to the sheet; the site shows them within ~5 minutes, no redeploy needed.
- **Enquiry pre-fill:** buttons across the site (calculator, extras, services) pre-fill the contact form via `sessionStorage`.

## Configuration

| Variable | Local (`.env`) | CI (GitHub secret) |
|---|---|---|
| `PUBLIC_WEB3FORMS_KEY` | optional | `FORMSSECRET` |
| `PUBLIC_BOOKED_DATES_CSV_URL` | optional | `BOOKED_DATES_CSV_URL` — must be the **CSV** publish link (`…/pub?gid=0&single=true&output=csv`) |

Both are baked in at build time: after changing a secret, re-run the **Deploy to GitHub Pages** workflow. Never commit `.env`.

## Deployment

- Every push to `main` builds and deploys to GitHub Pages (`deploy.yml`, about a minute).
- Pull requests run the type check and the full test suite (`test.yml`); merging requires it to pass.
- Each page has `<meta name="build" content="<commit>">` showing which commit is live.
- Domain and HTTPS: Cloudflare (DNS proxied, SSL mode **Full**, Always Use HTTPS, `www` → apex redirect).
- To test the live site after a deploy: `LIVE_URL=https://celebrisvibe.com npm test`.

## License

No open-source license has been chosen, so all rights are reserved by the owner. Contributions are accepted under the same terms.
