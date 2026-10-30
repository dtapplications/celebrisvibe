# Styling

## Contents
- Themes and colour tokens
- Fonts and type scale
- Shared utility classes
- Component styles (scoped CSS)
- Responsive behaviour
- Motion
- Rules that keep dev and build identical

## Themes and colour tokens

Dark is the default. Light is `:root[data-theme="light"]`, toggled by the header button and remembered in `localStorage` (`cv-theme`). An inline script in Base applies it before first paint.

Always use tokens — never hex colours — for anything that should follow the theme:

| Token | Use |
|---|---|
| `--paper` | Page background |
| `--ink` | Main text; also background of "inverted" bands and primary buttons |
| `--card`, `--line` | Card background and border |
| `--body`, `--muted`, `--faint` | Paragraph text, secondary text, faint captions |
| `--gold` | Accent (numbers, tags, links, focus) |
| `--chip`, `--edge`, `--field` | Chip borders, outline borders, inputs |
| `--danger` | Booked dates, errors |
| `--band-*` (`line`, `text`, `gold`, `s1`, `s2`, `active`) | Colours inside `--ink` bands (showcase, CTA, highlighted package) |
| `--eyebrow` | Eyebrow labels (deeper gold in light theme for contrast) |
| `--logo` | Logo colour (pure white in dark, black in light) |
| `--fx-*` | Hero backdrop animation colour/intensity per theme |
| `--header-bg`, `--s1`, `--s2`, `--stripes` | Header glass, striped image placeholder |
| `--font-display`, `--font-body`, `--pad-x` | Fonts and horizontal page padding |

Fixed colours are fine only on top of photos (e.g. white text on a darkened image), where the theme does not apply.

## Fonts and type scale

- Body: **Jost** (300/400/500/600) — `--font-body`.
- Headings/display: **Onest** (600/700) — `--font-display`. Chosen because it covers Cyrillic; the previous heading font did not, so Bulgarian headings fell back to system fonts. Any new font must include Cyrillic, be self-hosted via `@fontsource/*` (no Google Fonts links — the privacy policy promises fonts load from the site), and be imported in `Base.astro` (and `qr.astro` if used there). The link-preview renderer (`src/lib/og.ts`) loads `.woff` files of the same fonts.
- Type scale (desktop → phone). These are big on purpose; pick by role, not by HTML tag:

  | Class | Size | Use for |
  |---|---|---|
  | `.h1` | 92 → 36 px | The one page headline in the hero |
  | `.h2` | 84 → 36 px | Major section titles on home ("Събития, които правим") |
  | `.h2-sm` | 72 → 36 px | Section titles on inner pages |
  | `.h3` | 52 → 30 px | Sub-section titles ("Как се формира крайната цена") |
  | `.display` + local `font-size` | 20–40 px | **Card, list-item and question titles** — e.g. `class="display"` with `font-size: 22px` in the component's style |
  | `.lead` / `.sub` | 20 / 18 px | Hero paragraph / section intro |
  | `.num` | — | Gold numbers ("01") |

  A common mistake is using `.h3` for items inside cards or accordions — that renders 52 px text. Card titles elsewhere use 20–28 px (`.factor-title`, `.guide-title`, `.title` in Extras).

## Shared utility classes (`src/styles/global.css`)

Layout: `.page-top` (top section padding, includes side padding), `.section` (standard section: side padding + bottom spacing), `.split` (two-column hero grid), `.section-head` (title + link row), `.stack-gap` (big vertical gap), `.hero` (positioning for `HeroBackdrop`).

Every block of page content must sit inside a `<section class="page-top">` or `<section class="section">` — they provide the left/right page padding (`--pad-x`). Components such as `CtaBand`, `Occasions` and `Extras` have **no side padding of their own**; placed directly in `<Base>` they run edge to edge. Put them inside the last `.section` (see `ceni.astro`).
Buttons/links: `.btn` + `.btn-primary` / `.btn-outline` / `.btn-paper` / `.btn-ghost` (the last two for dark bands), `.btn-sm`, `.btn-row`, `.text-link`, `.text-link-sm`.
Surfaces: `.card`, `.tag`, `.tag-plain`, `.tags`, `.photo-frame` (rounded image box with striped placeholder), `.lift` (hover lift), `.reveal-card` (card whose photo fades in on hover), `.check-list`.
Forms: `.field`, `.field-label`, `.input`, `.choices` + `.choice` (radio/checkbox styled as a pill: `<label class="choice"><input type="radio"…><span>Text</span></label>`), `.choice-box` (checkbox variant), `.notice` + `-ok`/`-err`/`-info`.
Date picker: `.dp-*` (used by `src/lib/datepicker.ts`).
Accessibility: `.sr-only`.

Reuse these before writing new CSS.

## Component styles

Each `.astro` file has a scoped `<style>`; Astro adds a per-component attribute so selectors don't leak. Two consequences:

- To style elements rendered by a child component (e.g. the `<img>` from `<Image>`), use `:global()` inside the scoped selector: `.circle :global(img) { … }`.
- Theme selectors inside scoped styles need `:global(...)` around the root part: `:global([data-theme='light']) .sun { display: none; }`.

Prefer classes over inline `style=""`. Small one-off spacing inline styles exist in pages and are acceptable.

## Responsive behaviour

Mobile-first fluid sizes with `clamp()` and grids with `repeat(auto-fit, minmax(min(100%, Npx), 1fr))`. Breakpoints used:

- `max-width: 900px` — header nav and CTA collapse into the menu button.
- `max-width: 640px` — smaller header logo, tighter hero badge, showcase tabs fill the width, fewer backdrop beams.
- `max-width: 420px` — contact mode toggle tightens.
- `min-width: 1400px` — extras grid shows five cards in a row.

Check every change at 375 px wide (phone) and 1440 px (desktop), in both themes. Bulgarian words are long ("Продължителността"); make sure headings don't overflow narrow cards.

## Motion

Animations (hero beams/bokeh/equalizer, logo ring spin, card hovers, showcase crossfade) are CSS. `prefers-reduced-motion: reduce` disables transitions and animations globally — keep it that way for any new animation.

## Rules that keep dev and build identical

The test suite compares the dev server with the production build pixel by pixel and style by style, so:

- **Gradients:** write them in the form the CSS minifier produces. Use `linear-gradient(A, B 80%)` instead of `linear-gradient(to top, B 20%, A)`, omit `to bottom`, use `90deg` instead of `to right`, merge equal stops (`#000 15% 85%`). Otherwise computed styles differ between dev and build and parity tests fail even though it looks the same.
- **`[hidden]`:** global rule `[hidden] { display: none !important; }` must stay — elements with `display:flex/grid` ignore the `hidden` attribute otherwise, and the scripts rely on `hidden`.
- **Logo:** draw with `<Logo>` (SVG mask in `--logo` colour); don't use the large PNGs.
