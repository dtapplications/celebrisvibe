# Interactive parts

## Contents
- How interactivity is built
- Enquiry draft (carrying choices to the contact form)
- Price calculator
- Contact form and Web3Forms
- Booked dates (Google Sheet) and the date picker
- Header, theme switch, showcase

## How interactivity is built

There is no UI framework. Each interactive component renders its full HTML at build time (so search engines and AI agents see all content), and a `<script>` in the same `.astro` file adds behaviour. Astro bundles, de-duplicates and minifies these scripts; they can `import` from `src/data` and `src/lib`. Shared state between pages goes through `sessionStorage` (draft) or `localStorage` (theme, last-sent time).

Pattern to follow for a new interactive piece:

```astro
<div data-thing>…server-rendered markup with all states, extra states `hidden`…</div>

<script>
  const root = document.querySelector<HTMLElement>('[data-thing]');
  if (root) {
    // query elements inside root, toggle `hidden` / classes / aria-* on events
  }
</script>
```

Wrap every `localStorage`/`sessionStorage` call in `try/catch` (private mode can throw). Keep scripts small; the whole site ships ~1–6 KB of JS per page.

## Enquiry draft (`src/lib/draft.ts`)

Links to the contact page can pre-fill the form. Add `data-draft` with JSON to any link to `/kontakti/`:

```astro
<a href={href(ROUTES.contact)} data-draft={JSON.stringify({ mode: 'inquiry', type: 'Сватба', services: ['DJ', 'Водещ'] })}>Запитване</a>
```

Fields: `mode` (`'inquiry' | 'call'`), `type` (must match a `FORM_EVENT_TYPES` value), `guests` (a `GUEST_OPTIONS` value), `services` (values from `FORM_SERVICES`), `date` (`YYYY-MM-DD`), plus patch-only `extra` (adds "Допълнително: X" to the note) and `estimate` (replaces the calculator line in the note). `initDraftLinks()` (started in Base) saves the patch to `sessionStorage` (`cv-draft`) on click; `ContactForm` restores it on load and keeps it updated while the visitor edits; it is cleared after a successful send. Without JavaScript the link still works, just without pre-filling.

## Price calculator (`src/components/Estimator.astro`, rules in `site.ts`)

Rules reproduce the published base prices:

| Selection | Price |
|---|---|
| DJ, 2 hours | €200 (`ESTIMATE.djMinimum`) |
| DJ, 3–5 hours | €300 (`ESTIMATE.djUpToMax`) |
| + Озвучаване | +€200 (`ESTIMATE.sound`) → DJ + sound up to 5 h = €500 |
| + Водещ | +€200 (`ESTIMATE.host`) |
| + Осветление | +€200 (`ESTIMATE.lights`) → everything = €900 (Цялостен пакет) |
| Over 5 hours | Slider's last step "5+": shows the 5-hour price + a personal-offer note |

Event type and guests do not change the price; they pre-fill the contact form. Defaults: `ESTIMATE_DEFAULTS` (private, 5 h, 50–150, sound on). `estimatePrice()` is shared by the server render and the browser script, so change rules only there. When prices change, update `ESTIMATE`, `BASE_PRICES`/`PACKAGES`, the estimator tests in `tests/e2e/site.spec.ts`, and the price prose in `llms-full.txt.ts` together — and confirm the published prices and the calculator still agree.

## Contact form (`src/components/ContactForm.astro`)

- Real `<form>`; choices are radio/checkbox inputs styled as pills. Two modes: "Изпрати запитване" (full enquiry) and "Поискай обаждане" (name, phone, preferred time). Fields marked `data-only="inquiry"` / `"call"` are hidden per mode.
- Validation (in order): name ≥ 2 chars; phone digits/spaces/+()- with ≥ 7 digits; email format if given; ≤ 2 links in the note; consent checkbox. Messages are Bulgarian and shown in `[data-error]`.
- Anti-spam: two hidden honeypot fields (`botcheck`, `company_website`) and a 3-second minimum before sending — bots get a fake success. A sent form blocks another send from the same browser for 60 s (`localStorage` `cv-last-sent`).
- Sending: `POST https://api.web3forms.com/submit` with `access_key` = `PUBLIC_WEB3FORMS_KEY` and Bulgarian field names (`Тип`, `Име`, `Телефон`, `Вид събитие`, `Дата`, …). Web3Forms emails it to the client. In local dev without a key, the payload is logged to the console instead.
- **The form does not write to the Google Sheet.** An enquiry is not a booking; the client adds confirmed dates to the sheet by hand. Logging enquiries automatically would need a Google Apps Script web app writing to a separate tab — not built; discuss with the repo owner before adding.

## Booked dates (`src/lib/availability.ts`, `src/lib/datepicker.ts`)

- Source: a Google Sheet ("Celebris – booked dates", tab "Лист1") published to the web as **CSV**. URL in `PUBLIC_BOOKED_DATES_CSV_URL` (GitHub secret `BOOKED_DATES_CSV_URL`), format `https://docs.google.com/spreadsheets/d/e/<id>/pub?gid=0&single=true&output=csv`.
- Only column A is read; any row whose first cell is a valid date counts as booked. Accepted: `2026-12-31`, `31.12.2026`, `31/12/2026`, `31-12-2026`, optional trailing `г.`. Header rows and other text are ignored.
- Without a URL: demo dates in dev, "can't check automatically" (status `unknown`) in production. On a network error the same `unknown` message shows.
- Google refreshes the published CSV a few minutes after the sheet changes. No redeploy is needed for new dates — only if the URL changes.
- The calendar (`DatePicker`) crosses out booked dates; the "Провери свободна дата" card shows `taken` / `available` / `unknown`, and an available date is copied into the form's date field.

## Header, theme switch, showcase

- `Header.astro` script: mobile menu (`#mobile-menu`, Escape/outside click closes) and theme toggle (`data-theme` on `<html>`, saved as `cv-theme`).
- `ServiceShowcase.astro` script: tabs per service, 5 steps, auto-advance every 4.5 s until the visitor interacts, prev/next buttons. All panels are in the HTML; inactive ones are `hidden`.
- Home page head script: redirects old single-page links (`/#contact`, `/#services`, `/#prices`, `/#privacy`) to the new URLs — printed QR codes rely on it, don't remove it.
