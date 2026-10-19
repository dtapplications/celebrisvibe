import { todayIso } from './availability';

const MONTHS = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

const svg = (d: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
const ICON = {
  calendar: svg('M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 18),
  down: svg('M6 9l6 6 6-6'),
  left: svg('M15 18l-6-6 6-6'),
  right: svg('M9 18l6-6-6-6'),
};

const isoOf = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export function formatBgDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y} г.`;
}

type Options = { placeholder?: string; onChange?: (iso: string) => void };

// Calendar dropdown that marks booked dates. Renders into `root` (an empty element).
export class DatePicker {
  value = '';
  private booked: Set<string> | null = null;
  private open = false;
  private view: { y: number; m: number };
  private trigger: HTMLButtonElement;
  private label: HTMLSpanElement;
  private popup: HTMLDivElement;

  constructor(private root: HTMLElement, private opts: Options = {}) {
    const today = todayIso();
    this.view = { y: +today.slice(0, 4), m: +today.slice(5, 7) - 1 };
    root.classList.add('dp');
    root.innerHTML = `
      <button type="button" class="dp-trigger" aria-haspopup="dialog" aria-expanded="false">
        <span class="dp-icon">${ICON.calendar}</span><span class="dp-label"></span>${ICON.down}
      </button>
      <div class="dp-popup" role="dialog" aria-label="Избор на дата" hidden></div>`;
    this.trigger = root.querySelector('.dp-trigger')!;
    this.label = root.querySelector('.dp-label')!;
    this.popup = root.querySelector('.dp-popup')!;

    this.trigger.addEventListener('click', () => this.toggle(!this.open));
    this.popup.addEventListener('click', e => this.onPopupClick(e));
    document.addEventListener('mousedown', e => { if (this.open && !root.contains(e.target as Node)) this.toggle(false); });
    document.addEventListener('keydown', e => { if (this.open && e.key === 'Escape') { this.toggle(false); this.trigger.focus(); } });
    this.renderLabel();
  }

  setValue(iso: string) {
    this.value = iso;
    if (iso) this.view = { y: +iso.slice(0, 4), m: +iso.slice(5, 7) - 1 };
    this.renderLabel();
    if (this.open) this.renderPopup();
  }

  setBooked(booked: Set<string> | null) {
    this.booked = booked;
    if (this.open) this.renderPopup();
  }

  private toggle(open: boolean) {
    this.open = open;
    this.trigger.setAttribute('aria-expanded', String(open));
    this.root.classList.toggle('is-open', open);
    this.popup.hidden = !open;
    if (open) this.renderPopup();
  }

  private renderLabel() {
    this.label.textContent = this.value ? formatBgDate(this.value) : (this.opts.placeholder ?? 'Избери дата');
    this.trigger.classList.toggle('has-value', !!this.value);
  }

  private renderPopup() {
    const today = todayIso();
    const { y, m } = this.view;
    const atCurrentMonth = y === +today.slice(0, 4) && m === +today.slice(5, 7) - 1;
    const offset = (new Date(y, m, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    let days = WEEKDAYS.map(w => `<span class="dp-wd">${w}</span>`).join('') + '<span></span>'.repeat(offset);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = isoOf(y, m, d);
      const past = iso < today;
      const booked = !!this.booked?.has(iso);
      const cls = ['dp-day', past && 'is-past', booked && 'is-booked', iso === this.value && 'is-selected', iso === today && 'is-today'].filter(Boolean).join(' ');
      days += `<button type="button" class="${cls}" data-iso="${iso}" ${past ? 'disabled' : ''} aria-pressed="${iso === this.value}" aria-label="${formatBgDate(iso)}${booked ? ', заета' : ''}">${d}</button>`;
    }

    this.popup.innerHTML = `
      <div class="dp-head">
        <button type="button" class="dp-nav" data-shift="-1" aria-label="Предишен месец" ${atCurrentMonth ? 'disabled' : ''}>${ICON.left}</button>
        <span class="dp-month">${MONTHS[m]} ${y}</span>
        <button type="button" class="dp-nav" data-shift="1" aria-label="Следващ месец">${ICON.right}</button>
      </div>
      <div class="dp-grid">${days}</div>
      <div class="dp-legend"><span><span class="dp-key-today"></span>Днес</span><span><span class="dp-key-booked">12</span>Заета</span></div>`;
  }

  private onPopupClick(e: MouseEvent) {
    const btn = (e.target as Element).closest<HTMLButtonElement>('button');
    if (!btn || btn.disabled) return;
    if (btn.dataset.shift) {
      const total = this.view.m + Number(btn.dataset.shift);
      this.view = { y: this.view.y + Math.floor(total / 12), m: ((total % 12) + 12) % 12 };
      this.renderPopup();
    } else if (btn.dataset.iso) {
      this.setValue(btn.dataset.iso);
      this.toggle(false);
      this.trigger.focus();
      this.opts.onChange?.(btn.dataset.iso);
    }
  }
}
