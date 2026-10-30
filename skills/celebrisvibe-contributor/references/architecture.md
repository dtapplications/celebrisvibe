# Architecture

## Contents
- Directory map
- Pages and URLs
- How a page is built
- Data files (where content lives)
- Components
- Libraries (`src/lib`)
- Generated files (SEO, AI, link previews)

## Directory map

```
celebrisvibe/
├── astro.config.mjs          site URL, prefetch, dev toolbar off during tests
├── playwright.config.ts      browser tests: build, dev and parity projects
├── public/
│   ├── CNAME                 celebrisvibe.com (GitHub Pages custom domain)
│   └── assets/               logos (SVG/PNG), favicons — served as-is
├── src/
│   ├── assets/photos/*.jpg   all photos; optimised by astro:assets at build
│   ├── components/*.astro    sections and UI pieces (see below)
│   ├── data/
│   │   ├── site.ts           most content: routes, nav, contacts, event types, prices, packages, extras, form options, calculator
│   │   ├── services.ts       the three services (DJ и водещ, Озвучаване, Осветление)
│   │   └── og.ts             headline + photo for each page's link-preview image
│   ├── layouts/Base.astro    <html>, <head> (SEO, JSON-LD, theme), Header, <main>, Footer
│   ├── lib/                  urls, photos, draft, datepicker, availability, og renderer
│   ├── pages/                one file per URL (see below)
│   └── styles/global.css     theme tokens, base styles, shared utility classes
├── tests/e2e/                Playwright: env.ts, fixtures.ts, site.spec.ts, parity.spec.ts
├── skills/celebrisvibe-contributor/   this skill (SKILL.md + references/)
├── scripts/package-skill.mjs  npm run skill:zip → dist-skills/<skill>.zip
├── README.md, CONTRIBUTING.md, .github/pull_request_template.md
├── AGENTS.md, CLAUDE.md       rules for AI agents (PR only, never push/merge to main)
└── .github/workflows/        deploy.yml (push to main), test.yml (pull requests)
```

## Pages and URLs

| URL | File | Notes |
|---|---|---|
| `/` | `src/pages/index.astro` | Hero, ServiceShowcase, "Индивидуален подход" block, Occasions, Extras. Also redirects old `/#contact`-style links. |
| `/uslugi/` | `src/pages/uslugi/index.astro` | Service index cards, per-service summaries, Occasions, Extras, guide, CTA |
| `/uslugi/<slug>/` | `src/pages/uslugi/[slug].astro` | One page per entry in `SERVICES` (slugs `dj-i-vodesht`, `ozvuchavane`, `osvetlenie`) |
| `/ceni/` | `src/pages/ceni.astro` | Hero + Estimator, Базови цени, factors, offer contents, packages, explanation, comparison, CTA |
| `/kontakti/` | `src/pages/kontakti.astro` | Date checker, contact details, ContactForm |
| `/poveritelnost/` | `src/pages/poveritelnost.astro` | Privacy policy (legal text — changes need client approval) |
| `/qr/` | `src/pages/qr.astro` | Standalone printable QR card pointing to `/kontakti/` (does not use Base layout) |
| `/404.html` | `src/pages/404.astro` | `noindex` |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt` | `src/pages/*.ts` | Generated from data at build |
| `/og/<key>.jpg` | `src/pages/og/[key].jpg.ts` | Link-preview images, one per key in `src/data/og.ts` |

URL slugs are transliterated Bulgarian (`uslugi`, `ceni`, `kontakti`, `poveritelnost`). Keep that pattern for new pages. Route constants live in `ROUTES` in `site.ts`; the header/footer menu is `NAV`.

## How a page is built

```astro
---
import Base from '../layouts/Base.astro';
import Eyebrow from '../components/Eyebrow.astro';
import CtaBand from '../components/CtaBand.astro';
import { ROUTES } from '../data/site';
---
<Base title="…" description="…120–160 chars…" og="<key>" schema={[/* optional JSON-LD */]}>
  <section class="page-top">
    <Eyebrow>Раздел</Eyebrow>
    <h1 class="h1" style="margin-top:24px">Заглавие</h1>
    <p class="lead">Въведение…</p>
  </section>

  <section class="section">
    …content (cards, lists)…
    <CtaBand actions={[{ label: 'Провери датата', path: ROUTES.contact, draft: { mode: 'inquiry' }, primary: true }]}>
      Свободна ли е датата ти?
    </CtaBand>
  </section>
</Base>

<style>/* scoped to this page */</style>
```

For a new page, copy the structure of the closest existing page (`poveritelnost.astro` for text pages, `ceni.astro` for card-heavy pages) rather than starting from scratch — spacing and type sizes then match automatically. Pages with the animated backdrop use `<section class="hero page-top"><HeroBackdrop />…`.

`Base` props: `title` (rendered as `title | Celebris Vibe` unless `fullTitle`), `description` (meta description), `og` (key in `OG_PAGES`, default `home`), `schema` (extra JSON-LD nodes; Organization is always included), `noindex`, `fullTitle`. All `<head>` SEO tags come from `src/components/SeoMeta.astro`.

Base also: loads fonts (Jost body, Onest headings) and `global.css`, sets the saved theme before first paint, renders Header/Footer, and starts `initDraftLinks()` (see interactive.md).

## Data files

`src/data/site.ts` — exports and what they drive:

| Export | Used for |
|---|---|
| `SITE_NAME`, `SLOGAN` | Footer, JSON-LD (`SLOGAN` = "Creating Vibes, Celebrating Life.") |
| `ROUTES`, `NAV` | Links and menus |
| `CONTACT_EMAIL`, `CONTACT_PHONE`, `SOCIAL` | Contact page, footer, privacy, llms (`SOCIAL` links are placeholders `#` until the client provides real URLs) |
| `EVENT_TYPES` | "Събития, които правим" cards (home + /uslugi/); `formLabel` pre-selects the form's event type |
| `SERVICE_GUIDE` | "Коя услуга е подходяща за твоя повод?" on /uslugi/ |
| `PRICE_FACTORS`, `PRICE_COMPARE` | /ceni/ factors and "Как да сравниш различните оферти?" |
| `EXTRAS` | "Допълнителни опции" cards |
| `BASE_PRICES`, `PACKAGES` (`Package` type), `PACKAGES_NOTE`, `OFFER_INCLUDES` | /ceni/ price blocks and packages; also JSON-LD and llms-full |
| `FORM_EVENT_TYPES`, `FORM_SERVICES`, `GUEST_OPTIONS`, `CALL_TIMES` | Contact form choices |
| `ESTIMATE`, `ESTIMATE_TYPES`, `EstimateInput`, `ESTIMATE_DEFAULTS`, `estimatePrice()` | The price calculator (server render and browser script share this) |

`src/data/services.ts` — `SERVICES: Service[]` and `serviceUrl(slug)`. Fields: `slug`, `title`, `seoTitle` (page `<title>` and preview headline), `description` (intro on the service page + meta description), `summary` (text on /uslugi/), `intro` (one-liner in the home showcase), `photo`, `quote`, `formServices` (pre-ticked in the form), `includes`, `fits`, `highlights[]` (`title`, `photo`, `occasions`, `desc` = home showcase text, optional `pageDesc` = text on the service page).

`src/data/og.ts` — `OG_PAGES` (key → eyebrow, title, photo), `ogPath()`, `OG_WIDTH/HEIGHT`. Services get an entry automatically.

## Components (`src/components`)

| Component | What it is |
|---|---|
| `Header` | Sticky pill header: logo, nav, theme toggle, "Запази дата", mobile menu (+ script) |
| `Footer` | Logo, nav, slogan, copyright, privacy link, socials |
| `SeoMeta` | All SEO/Open Graph/Twitter tags (used by Base and the QR page) |
| `Logo` | Logo drawn from one SVG as a CSS mask in `--logo` colour. Props `height`, `label`, `class` |
| `Icon` | Inline SVG icons: `arrowLeft`, `arrowRight`, `chevronRight`, `chevronDown`, `check`, `menu`, `close`, `sparkle` |
| `Eyebrow` | Small uppercase label above headings |
| `HeroBackdrop` | Animated beams/bokeh/equalizer behind heroes (parent needs class `hero`) |
| `ServiceShowcase` | Home tabs × 5 highlights with auto-advance (+ script). Renders all content to HTML; script toggles visibility |
| `Occasions` | Event-type cards with photo reveal. Prop `showServicesLink` |
| `Extras` | "Допълнителни опции" cards + "Добави към запитване" (+ script marks added items) |
| `CtaBand` | Dark call-to-action band. Prop `actions: {label, path, draft?, primary?}[]` (`path` like `ROUTES.contact`), title in the slot. Has no side padding: place it **inside** a `<section class="section">` |
| `Estimator` | Price calculator form (+ script) |
| `ContactForm` | Enquiry / call-request form (+ script: validation, date picker, Web3Forms) |
| `EmailOff` | Wraps visible email addresses so Cloudflare does not obfuscate them |

## Libraries (`src/lib`)

| File | Exports |
|---|---|
| `urls.ts` | `href(path)` site-relative link, `abs(site, path)` absolute URL, `textResponse()` |
| `photos.ts` | `photo(name)` → image import for `src/assets/photos/<name>.jpg` (throws on unknown names) |
| `draft.ts` | Enquiry draft in `sessionStorage`; `initDraftLinks()` handles `data-draft` links |
| `datepicker.ts` | `DatePicker` class (calendar dropdown, booked dates), `formatBgDate()` |
| `availability.ts` | `loadBookedDates()` from the published Google Sheet CSV, `parseBookedCsv()`, `parseDate()`, `todayIso()` |
| `og.ts` | `renderOg()` — builds a 1200×630 JPEG with satori + resvg + sharp (build-time only) |

## Generated files

- `sitemap.xml` — list in `src/pages/sitemap.xml.ts`. Add new pages there.
- `robots.txt` — from `src/pages/robots.txt.ts`. Note: Cloudflare's managed robots.txt (AI-crawler blocking) is prepended in production.
- `llms.txt` / `llms-full.txt` — summaries for AI assistants, built from the data files. Prose sections in these files (e.g. how booking works) are written by hand in the `.ts` file and must be kept true when content changes.
- `/og/<key>.jpg` — link previews; headline font Onest, small text Jost.
- JSON-LD — Organization (Base), WebSite (home), ItemList + BreadcrumbList (/uslugi/), Service + BreadcrumbList (service pages), OfferCatalog (/ceni/), ContactPage (/kontakti/).
