// Booked dates come from a Google Sheet published as CSV (File → Share → Publish to web → CSV).
// Only the first column is read; every row with a valid date in it counts as booked.
const CSV_URL: string = import.meta.env.PUBLIC_BOOKED_DATES_CSV_URL ?? '';

const DEMO_DATES = ['2026-11-01', '2026-11-08', '2026-12-31', '2027-02-14'];

const pad = (n: number) => String(n).padStart(2, '0');

function toIso(y: number, m: number, d: number): string | null {
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

// Accepts 2026-12-31, 31.12.2026, 31.12.2026 г., 31/12/2026 (day first, Bulgarian order).
export function parseDate(raw: string): string | null {
  const s = raw.replace(/^"|"$/g, '').replace(/\s*г\.?\s*$/i, '').trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return toIso(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (m) return toIso(+m[3], +m[2], +m[1]);
  return null;
}

export function parseBookedCsv(text: string): Set<string> {
  const booked = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    const first = line.match(/^\s*("[^"]*"|[^,]*)/)?.[1] ?? '';
    const iso = parseDate(first);
    if (iso) booked.add(iso);
  }
  return booked;
}

let pending: Promise<Set<string> | null> | null = null;

// Resolves to the booked dates, or null when they can't be known (no sheet configured, network error).
export function loadBookedDates(): Promise<Set<string> | null> {
  if (!pending) {
    pending = (async () => {
      if (!CSV_URL) return import.meta.env.DEV ? new Set(DEMO_DATES) : null;
      try {
        const res = await fetch(CSV_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return parseBookedCsv(await res.text());
      } catch {
        pending = null;
        return null;
      }
    })();
  }
  return pending;
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
