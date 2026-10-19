// The enquiry the visitor is putting together, carried between pages in sessionStorage.
// Links with a data-draft attribute update it before navigating to the contact page,
// e.g. <a href="/kontakti/" data-draft='{"type":"Сватба"}'>.

export type Draft = {
  mode?: 'inquiry' | 'call';
  type?: string;
  guests?: string;
  services?: string[];
  date?: string;
  note?: string;
};

// What a data-draft link can ask for: plain fields are replaced, `extra` and `estimate`
// add a line to the note (an estimate line replaces the previous one).
export type DraftPatch = Omit<Draft, 'note'> & { extra?: string; estimate?: string };

const KEY = 'cv-draft';
export const ESTIMATE_PREFIX = 'Ориентировъчна оценка от сайта';

export function readDraft(): Draft {
  try { return JSON.parse(sessionStorage.getItem(KEY) || '{}') as Draft; } catch { return {}; }
}

export function writeDraft(draft: Draft): void {
  try { sessionStorage.setItem(KEY, JSON.stringify(draft)); } catch {}
}

export function clearDraft(): void {
  try { sessionStorage.removeItem(KEY); } catch {}
}

export function applyPatch(patch: DraftPatch): Draft {
  const { extra, estimate, ...fields } = patch;
  const draft = { ...readDraft(), ...fields };
  let lines = (draft.note ?? '').split('\n').filter(Boolean);
  if (extra && !lines.some(l => l.includes(extra))) lines.push(`Допълнително: ${extra}`);
  if (estimate) lines = [estimate, ...lines.filter(l => !l.startsWith(ESTIMATE_PREFIX))];
  draft.note = lines.join('\n');
  writeDraft(draft);
  return draft;
}

export function initDraftLinks(): void {
  document.addEventListener('click', e => {
    const link = (e.target as Element).closest<HTMLElement>('[data-draft]');
    if (!link) return;
    try { applyPatch(JSON.parse(link.dataset.draft || '{}')); } catch {}
  });
}
