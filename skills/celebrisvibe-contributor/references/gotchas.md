# Gotchas (things that already went wrong once)

Each entry: symptom → cause → what to do.

## Site and code

**Something set to `hidden` is still visible.**
→ CSS `display: flex/grid` beats the `hidden` attribute. → Keep the global `[hidden] { display: none !important; }` in `global.css`; toggle visibility with `el.hidden = …`.

**Parity test says computed style differs, but dev and build look the same.**
→ The production CSS minifier rewrites some values (gradients: `to top` → reversed stops, `to right` → `90deg`, merged colour stops, hex colours). → Write CSS in the minified form from the start. See styling.md.

**Parity test fails on a photo area (striped box in one screenshot).**
→ An image hadn't finished loading. The test waits for images and CSS mask images; a genuinely missing image fails the functional test instead. → Rerun; if it persists, check the image name with `photo()`.

**A test that reads form values right after navigation fails only on the dev server.**
→ Dev loads scripts a moment later than the build. → Use auto-retrying assertions (`await expect(...).toHaveValue(...)`, `expect.poll`) instead of reading once.

**Bulgarian headings look different on Windows, Mac and Android.**
→ The font lacks Cyrillic, so the browser falls back to system fonts. → Headings use Onest (has Cyrillic). Check `@fontsource/<font>/files/` contains `*-cyrillic-*` before adopting any font.

**Link-preview image shows boxes or missing punctuation.**
→ satori picks one font file per family+weight; Latin glyphs (DJ, punctuation, the domain) were missing from the Cyrillic subset. → `src/lib/og.ts` registers Latin and Cyrillic subsets under separate family names and lists both in `fontFamily`. Keep that pattern.

**Relative `new URL('../…', import.meta.url)` paths break in build-time code.**
→ Astro bundles the module first, so `import.meta.url` no longer points into `src/`. → In build-time code (`og.ts`), resolve from `process.cwd()` (project root).

**`<script>` inside an `.astro` component doesn't see server variables.**
→ Component scripts run in the browser and are bundled separately. → Import shared values from `src/data`/`src/lib`, or pass them via `data-*` attributes or `define:vars` (inline scripts only).

**Old links like `/#contact` from printed QR codes.**
→ The site used to be one page with hash routes. → The home page's inline head script redirects them. Don't remove it; add new mappings there if hash links ever change.

## Content

**A text appears in two different versions.**
→ It was hardcoded in a page instead of read from `site.ts`/`services.ts`. → Move it to the data file and render from there.

**Calculator disagrees with published prices.**
→ `ESTIMATE` rules weren't updated with `BASE_PRICES`/`PACKAGES`. → Change them together; the estimator tests encode the published prices.

**`llms-full.txt` says something no longer true.**
→ Its prose (booking steps, what's included) is hand-written in `src/pages/llms-full.txt.ts`. → Re-read and update it whenever prices, process or services change.

## Booked dates and the form

**Every date shows as free.**
1. The published sheet is empty, or dates are not in column A of the first tab ("Лист1").
2. The secret holds the „Уеб страница“ link (`…/pubhtml…`) instead of the CSV link (`…/pub?gid=0&single=true&output=csv`). Google's publish dialog: choose „Стойности, разделени със запетая (.csv)“.
3. The secret changed but the site wasn't redeployed (the URL is baked in at build).
4. Google hasn't refreshed yet — wait ~5 minutes.
Quick check: open the CSV URL in a browser; it must download plain text with the dates.

**"Dates submitted in the form don't appear in the sheet."**
→ By design: the form only emails the client via Web3Forms. Confirmed bookings are added to the sheet manually.

**Form says it couldn't send, locally.**
→ With a real key in `.env`, Web3Forms may reject submissions from `localhost`. With an empty key, dev mode only logs the payload. Test real sending on the live site.

## Deploy and hosting

**Live site still shows old content after merging.**
→ Check the Deploy workflow run on GitHub Actions and compare `<meta name="build">` on the live page with the merge commit. Browsers may cache; try a private window.

**Visitors see the old (Duda) site or Google shows old results.**
→ Browser/DNS cache locally; for Google, indexing lag. → Clear cache / private window; request indexing in Google Search Console and remove outdated results there.

**Visible email turned into "[email protected]".**
→ Cloudflare Email Address Obfuscation. → Wrap visible emails in `<EmailOff>`; text inside JSON-LD scripts is not touched.

**Redirect loop or SSL errors after a Cloudflare change.**
→ SSL/TLS mode must be **Full**. Flexible loops with GitHub Pages; Full (strict) fails because GitHub has no certificate for the proxied domain.

**`www.celebrisvibe.com` shows a GitHub 404.**
→ GitHub Pages serves one hostname; Cloudflare must redirect `www` → apex with a Redirect Rule.

## Windows / tooling

**Shell commands with Cyrillic or quotes misbehave in Git Bash.**
→ Quote carefully or put multi-line scripts in a file and run it with `node script.cjs`.

**`grep -c` or `wc` shows odd lengths for Bulgarian text.**
→ They count bytes (Cyrillic is 2 bytes/char in UTF-8). Count characters with Node: `[...str].length`.
