# Content: texts, prices, services, photos, SEO

## Contents
- Where each piece of text lives
- Data shapes (copy these when adding items)
- What else to update after a content change
- Photos
- SEO titles, descriptions and link previews
- Applying client feedback documents
- Writing Bulgarian copy

## Where each piece of text lives

| You want to change… | Edit |
|---|---|
| Home hero headline, intro, buttons, date badge, "Индивидуален подход" block | `src/pages/index.astro` |
| Home showcase (tabs, 5 highlights per service) | `src/data/services.ts` → `intro`, `highlights[].desc` |
| Event-type cards (Частни събития, Сватби, Корпоративни) | `site.ts` → `EVENT_TYPES` |
| "Допълнителни опции" cards | `site.ts` → `EXTRAS`; section subtitle in `src/components/Extras.astro` |
| /uslugi/ headline and intro | `src/pages/uslugi/index.astro` |
| Service summaries on /uslugi/ | `services.ts` → `summary` |
| Service page intro, list, quote, highlights | `services.ts` → `description`, `includes`, `fits`, `quote`, `highlights[].pageDesc ?? desc` |
| "Коя услуга е подходяща…" guide | `site.ts` → `SERVICE_GUIDE`; heading in `uslugi/index.astro` |
| /ceni/ headline and intro paragraph | `src/pages/ceni.astro` |
| Базови цени block | `site.ts` → `BASE_PRICES` |
| Packages | `site.ts` → `PACKAGES`, `PACKAGES_NOTE` |
| "Какво включва твоята оферта" | heading/text in `ceni.astro`, list in `site.ts` → `OFFER_INCLUDES` |
| Price factors, comparison questions | `site.ts` → `PRICE_FACTORS`, `PRICE_COMPARE` |
| Calculator labels and footnote | `src/components/Estimator.astro`; prices/rules in `site.ts` → `ESTIMATE` (see interactive.md) |
| Contact headline, intro, about text | `src/pages/kontakti.astro` |
| Form labels, options | `src/components/ContactForm.astro`; options in `site.ts` → `FORM_*`, `GUEST_OPTIONS`, `CALL_TIMES` |
| Email, phone, socials | `site.ts` → `CONTACT_EMAIL`, `CONTACT_PHONE`, `SOCIAL` |
| Footer slogan | `site.ts` → `SLOGAN` (also used in JSON-LD); QR page has its own footer line in `qr.astro` |
| Header button "Запази дата", menu labels | `src/components/Header.astro`, `site.ts` → `NAV` |
| Privacy policy | `src/pages/poveritelnost.astro` (update the `UPDATED` date; client must approve legal text) |

Search tip: the visible text is unique enough to grep. `grep -rn "Ясна оферта" src` finds it.

## Data shapes

```ts
// site.ts
EVENT_TYPES: { key, formLabel, photo, title, subtitle, desc, tags: string[] }[]
EXTRAS: { title, tag, photo, desc }[]
SERVICE_GUIDE: { when, title, rec, desc }[]
PRICE_FACTORS: { title, desc }[]
PRICE_COMPARE: [question, answer][]
BASE_PRICES: { title, items: [label, price][], note }
PACKAGES: Package[]  // { name, prices: string[], from: number, tagline?, items: string[], note?, highlight: boolean }
OFFER_INCLUDES: string[]

// services.ts
SERVICES: Service[]  // see architecture.md for all fields
```

`Package.from` is the lowest price as a number; it feeds the JSON-LD `minPrice`, so keep it in sync with `prices`. Exactly one package should have `highlight: true` (the dark middle card).

## What else to update after a content change

| If you changed… | Also check |
|---|---|
| A page `<h1>` | `tests/e2e/env.ts` → `PAGES[].h1` (tests assert it) |
| A page's main headline | `src/data/og.ts` → that page's `title` (link-preview image) |
| A service `title` / `seoTitle` | Nothing extra — og, llms and tabs read from `SERVICES`. If a test refers to the title (e.g. `Запитване за Озвучаване`), update it |
| Prices, packages, `BASE_PRICES` | `ESTIMATE` rules so the calculator agrees; the estimator tests in `site.spec.ts`; the `/ceni/` hero paragraph in `ceni.astro` (it quotes €200/€300/€500 in prose) |
| Booking process, what's included, any claim in `llms-full.txt.ts` / `llms.txt.ts` prose | The prose in those files |

About `llms.txt` / `llms-full.txt`: price lists, packages, services, extras, factors and contacts in them are **generated from the data files** — editing `site.ts`/`services.ts` updates them automatically, no edit needed. Only the hand-written sentences inside the template strings (intro, "Как се резервира", "Какво включва офертата") need a manual check when the facts they describe change.
| A button label used by a test (e.g. "Свържи се с нас", "Получи точна оферта", "Добави към запитване") | `tests/e2e/site.spec.ts` |
| A form option label | Contact form tests that click it (`label.choice` with that text) |
| Event type `formLabel` | `FORM_EVENT_TYPES` must contain the same string |
| Anything visible | Nothing for parity tests — they compare dev vs build, not fixed text |

## Photos

1. Add the file as `src/assets/photos/<kebab-name>.jpg` (landscape, at least 1200 px wide, under ~500 KB; Astro generates WebP/AVIF sizes).
2. Reference it by name in data (`photo: 'kebab-name'`) or in a page via `photo('kebab-name')` with `<Image>`/`<Picture>` from `astro:assets`, always with `widths` and `sizes`.
3. Decorative images get `alt=""`; content images get a short Bulgarian description.
4. To replace a photo, overwrite the file with the same name — no code change.

A contributor in a chat window cannot upload binary files into the repo through you; tell them where to put the file and give the code change.

## SEO titles, descriptions and link previews

- Page `<title>`: `Base title="…"` → becomes `… | Celebris Vibe` (keep the whole thing ≤ ~60 characters). Home uses `fullTitle`.
- Meta description: `Base description="…"`, 120–160 characters, Bulgarian, describes the page and includes the service words people search for (DJ, водещ, озвучаване, осветление, сватба…).
- Service pages use `seoTitle` and `description` from `services.ts`.
- Link-preview image: `og="<key>"`; headline/photo per key in `src/data/og.ts`. Images regenerate on every build.
- Canonical URL, Open Graph and Twitter tags are automatic (`SeoMeta.astro`).
- A new page also needs: `sitemap.xml.ts` entry, a link in `llms.txt.ts` "Страници", an `og.ts` entry, and an entry in `tests/e2e/env.ts` `PAGES`.

## Applying client feedback documents

The client sends Word files with tables per text: **СТАРО** (current), **НОВО** (new) and sometimes **ВАРИАНТ 3** (preferred alternative). The agreed rule: **use ВАРИАНТ 3 when present, otherwise НОВО.** Lines in a cell (one per line) map to line breaks or separate elements on the page. When the document gives two different versions of the same item for different pages, keep both (that is why highlights have `desc` and `pageDesc`, and services have `summary` and `description`). When a new block has no СТАРО ("—"), place it next to the item that precedes it in the document and say where you put it. Afterwards, verify every НОВО/ВАРИАНТ 3 line appears on the built site and no СТАРО line remains.

## Writing Bulgarian copy

- Informal "ти" towards the visitor in CTAs and forms ("Провери свободна дата", "Изпрати запитване"). Keep the client's "вие/вашите" where they wrote it.
- Short, concrete, no hype; the client prefers calm wording ("с мярка", "без излишно натрапване").
- Typography: „кавички“, ` — ` (em dash with spaces) in new copy, `€` before the amount without space (`€500`), times as `2 часа`, date format `31.12.2026`.
- Standard terms: "DJ и водещ" (not "DJ & Водещ"), "Юбилеи" (not "Годишнини"), "Продуктови представяния" (not "Лансирания"), "Цялостен пакет" (not "Пълен вайб"/"Complete пакет").
- English appears only in the slogan "Creating Vibes, Celebrating Life." and the word DJ.
