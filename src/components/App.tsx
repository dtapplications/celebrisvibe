import React, { useState, useEffect, useRef, type CSSProperties } from 'react';
import { loadBookedDates, todayIso } from '../lib/availability';
import { CONTACT_EMAIL, CONTACT_PHONE, SOCIAL, EVENT_TYPES, SERVICES, SERVICE_DETAILS, SERVICE_GUIDE, PRICE_FACTORS, ALWAYS_INCLUDED, PRICE_COMPARE, EXTRAS, PACKAGES } from '../data/site';

// Set in .env locally and from the FORMSSECRET repository secret in CI.
const WEB3FORMS_KEY: string = import.meta.env.PUBLIC_WEB3FORMS_KEY ?? '';



// ─── Types ────────────────────────────────────────────────────────────────────

type Page = 'home' | 'services' | 'prices' | 'contact' | 'privacy';
type Mode = 'inquiry' | 'call';

interface Theme {
  paper: string; headerBg: string; ink: string; card: string; line: string;
  chip: string; field: string; s1: string; s2: string; body: string;
  muted: string; faint: string; gold: string; frame: string; edge: string; danger: string;
  bandLine: string; bandText: string; bandGold: string;
  bandS1: string; bandS2: string; bandActive: string;
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────

const LIGHT: Theme = {
  paper: '#f2f1ec', headerBg: 'rgba(242,241,236,0.92)', ink: '#1b1d22',
  card: '#fbfaf7', line: '#dad8d0', chip: '#c9c7be', field: '#b9b7ae',
  s1: '#e4e2da', s2: '#ebe9e2', body: '#3e4048', muted: '#5d6068',
  faint: '#7b7d84', gold: '#8a6d3b', frame: '#c9ad78', edge: '#87857e', danger: '#b3402f',
  bandLine: '#4a4c54', bandText: '#c4c5ca', bandGold: '#c9ad78',
  bandS1: '#26282e', bandS2: '#2d2f36', bandActive: '#2a2c33',
};

const DARK: Theme = {
  paper: '#121317', headerBg: 'rgba(18,19,23,0.92)', ink: '#eceae3',
  card: '#1a1c21', line: '#2c2e35', chip: '#3e4048', field: '#4a4c54',
  s1: '#1c1e23', s2: '#212329', body: '#c4c5ca', muted: '#9a9ca3',
  faint: '#74767d', gold: '#c9ad78', frame: '#8a6d3b', edge: '#6e7078', danger: '#ef8f84',
  bandLine: '#c9c7be', bandText: '#3e4048', bandGold: '#8a6d3b',
  bandS1: '#d8d6ce', bandS2: '#e0ded7', bandActive: '#ffffff',
};

// ─── Static data ──────────────────────────────────────────────────────────────





// MOCK pricing for the estimator - replace with the client's real rules before launch.
// Calibrated to the packages for a 4-hour private event, 50-150 guests:
// DJ + sound €500 · + host + lights €900 ("Пълен вайб"). Sound is always included.
const ESTIMATE = {
  base: 200,                 // DJ, up to the included hours
  includedHours: 4,
  extraHour: 50,
  sound: { 'До 50': 150, '50 – 150': 300, '150 – 300': 450, '300+': 600 } as Record<string, number>,
  type: { private: 0, wedding: 100, corporate: 50 } as Record<string, number>,
  host: 200,
  lights: 200,
};
const EST_TYPES: [string, string, string][] = [['wedding', 'Сватба', 'Сватба'], ['private', 'Частно', 'Частно събитие'], ['corporate', 'Фирмено', 'Корпоративно']];
const EST_GUESTS = ['До 50', '50 – 150', '150 – 300', '300+'];



const PRIVACY_SECTIONS: [string, string[]][] = [
  ['Кой обработва данните ти', [
    `Администратор на личните данни е Celebris Vibe. За въпроси относно данните си пиши на ${CONTACT_EMAIL} или се обади на ${CONTACT_PHONE}.`,
  ]],
  ['Какви данни събираме', [
    'Само това, което ни изпращаш чрез формата: име, телефон, имейл (по желание), вид, дата и локация на събитието, брой гости, избрани услуги и свободен текст.',
  ]],
  ['Защо ги използваме', [
    'За да отговорим на запитването ти, да проверим наличността на датата, да ти се обадим и да подготвим оферта. Не използваме данните за реклама и не ги продаваме.',
  ]],
  ['На какво основание', [
    'Обработваме данните, за да предприемем стъпки по твое искане преди сключване на договор (чл. 6, ал. 1, буква „б“ от GDPR), и въз основа на съгласието ти, дадено чрез отметката във формата (чл. 6, ал. 1, буква „а“). Можеш да оттеглиш съгласието си по всяко време.',
  ]],
  ['Колко дълго ги пазим', [
    'До 12 месеца след последния ни контакт, ако не сключим договор. Ако работим заедно - толкова, колкото изисква счетоводното законодателство.',
  ]],
  ['Кой друг има достъп', [
    'Web3Forms - услугата, която доставя формата до нашата пощенска кутия. Тя може да обработва данни извън Европейския съюз при подходящи гаранции.',
    'Нашият имейл доставчик и хостингът на сайта (GitHub Pages), който съхранява технически сървърни логове, включително IP адрес.',
    'Google - при проверка на свободна дата браузърът ти зарежда списъка със заети дати от Google Таблици. Списъкът съдържа само дати, без лични данни, но Google получава техническа информация като IP адреса ти.',
  ]],
  ['Бисквитки', [
    'Сайтът не използва бисквитки за проследяване, анализ или реклама. Шрифтовете се зареждат от нашия сайт, а не от външни услуги.',
    'Браузърът ти запомня само кога е изпратено последното запитване, за да ни пази от спам. Тази информация остава на устройството ти и не се изпраща до нас.',
  ]],
  ['Твоите права', [
    'Имаш право на достъп до данните си, на коригиране, изтриване, ограничаване на обработването, преносимост и възражение, както и да оттеглиш съгласието си. За целта ни пиши на имейла по-горе.',
    'Ако смяташ, че правата ти са нарушени, можеш да подадеш жалба до Комисията за защита на личните данни (www.cpdp.bg).',
  ]],
];



const HERO_BEAMS = [
  { left: '-6%', width: '34%', opacity: 0.22, dur: 9, delay: 0 },
  { left: '22%', width: '26%', opacity: 0.14, dur: 12, delay: -4 },
  { left: '52%', width: '30%', opacity: 0.18, dur: 10, delay: -7 },
  { left: '78%', width: '28%', opacity: 0.2, dur: 11, delay: -2 },
];
const HERO_BOKEH = [
  { x: '8%', y: '22%', size: 22, o: 0.5, dur: 7, delay: 0 },
  { x: '18%', y: '70%', size: 12, o: 0.6, dur: 6, delay: -2 },
  { x: '31%', y: '12%', size: 34, o: 0.35, dur: 9, delay: -5 },
  { x: '42%', y: '58%', size: 16, o: 0.5, dur: 8, delay: -1 },
  { x: '49%', y: '30%', size: 10, o: 0.7, dur: 5, delay: -3 },
  { x: '58%', y: '80%', size: 28, o: 0.4, dur: 10, delay: -6 },
  { x: '66%', y: '18%', size: 14, o: 0.6, dur: 7, delay: -4 },
  { x: '74%', y: '48%', size: 40, o: 0.3, dur: 11, delay: -8 },
  { x: '86%', y: '26%', size: 18, o: 0.55, dur: 6, delay: -1 },
  { x: '92%', y: '68%', size: 24, o: 0.45, dur: 9, delay: -7 },
  { x: '3%', y: '88%', size: 30, o: 0.35, dur: 10, delay: -3 },
  { x: '36%', y: '90%', size: 12, o: 0.6, dur: 6, delay: -5 },
];
const HERO_EQ = Array.from({ length: 220 }, (_, i) => 0.6 + ((i * 37) % 11) / 10);

const EVENT_TYPE_LABELS = ['Частно събитие', 'Сватба', 'Корпоративно', 'Презентация', 'Друго'];
const SERVICE_CHECKBOXES = ['DJ', 'Водещ', 'Озвучаване', 'Осветление', 'Пълен пакет', 'Друго'];

const PAGES: [Page, string][] = [
  ['home', 'Начало'], ['services', 'Услуги'], ['prices', 'Цени'], ['contact', 'Контакти'],
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const ICON_PATHS = {
  arrowLeft: 'M19 12H5M12 19l-7-7 7-7',
  arrowRight: 'M5 12h14M12 5l7 7-7 7',
  chevronRight: 'M9 18l6-6-6-6',
  chevronDown: 'M6 9l6 6 6-6',
  chevronLeft: 'M15 18l-6-6 6-6',
  check: 'M20 6L9 17l-5-5',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
};
type IconName = keyof typeof ICON_PATHS | 'sparkle';

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  if (name === 'sparkle') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
        <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

// ─── Date picker ──────────────────────────────────────────────────────────────

const MONTHS = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const isoOf = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

function formatBgDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y} г.`;
}

function DatePicker({ value, onChange, booked, t, placeholder = 'Избери дата', disableBooked = false }: {
  value: string;
  onChange: (iso: string) => void;
  booked?: Set<string> | null;
  t: Theme;
  placeholder?: string;
  disableBooked?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const today = todayIso();
  const start = value || today;
  const [view, setView] = useState({ y: +start.slice(0, 4), m: +start.slice(5, 7) - 1 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const shift = (delta: number) => setView(v => {
    const m = v.m + delta;
    return { y: v.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 };
  });
  const atCurrentMonth = view.y === +today.slice(0, 4) && view.m === +today.slice(5, 7) - 1;
  const offset = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const navBtn = { width: 36, height: 36, borderRadius: '50%', border: `1px solid ${t.edge}`, background: 'transparent', color: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } as CSSProperties;

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <button type="button" onClick={() => setOpen(o => !o)} aria-haspopup="dialog" aria-expanded={open}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: t.paper, border: `1px solid ${open ? t.gold : t.line}`, borderRadius: 12, color: value ? t.ink : t.muted, fontSize: 16, padding: '12px 14px', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ color: t.gold, display: 'flex' }}><Icon name="calendar" size={18} /></span>
        <span style={{ flex: 1 }}>{value ? formatBgDate(value) : placeholder}</span>
        <Icon name="chevronDown" size={16} />
      </button>

      {open && (
        <div role="dialog" aria-label="Избор на дата" style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 20, width: 'min(320px, 86vw)', padding: 16, borderRadius: 20, background: t.paper, border: `1px solid ${t.edge}`, boxShadow: '0 24px 48px -20px rgba(0,0,0,0.45)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button type="button" onClick={() => shift(-1)} disabled={atCurrentMonth} aria-label="Предишен месец" style={{ ...navBtn, opacity: atCurrentMonth ? 0.3 : 1, cursor: atCurrentMonth ? 'default' : 'pointer' }}><Icon name="chevronLeft" size={16} /></button>
            <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: 17, color: t.ink, textTransform: 'capitalize' }}>{MONTHS[view.m]} {view.y}</span>
            <button type="button" onClick={() => shift(1)} aria-label="Следващ месец" style={navBtn}><Icon name="chevronRight" size={16} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {WEEKDAYS.map(w => <span key={w} style={{ textAlign: 'center', fontSize: 12, color: t.muted, padding: '4px 0' }}>{w}</span>)}
            {Array.from({ length: offset }, (_, i) => <span key={`pad${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const iso = isoOf(view.y, view.m, i + 1);
              const past = iso < today;
              const isBooked = !!booked?.has(iso);
              const selected = iso === value;
              const disabled = past || (disableBooked && isBooked);
              return (
                <button key={iso} type="button" disabled={disabled} onClick={() => { onChange(iso); setOpen(false); }}
                  aria-label={`${formatBgDate(iso)}${isBooked ? ', заета' : ''}`} aria-pressed={selected}
                  style={{
                    position: 'relative', aspectRatio: '1', borderRadius: 10, fontSize: 14,
                    border: iso === today && !selected ? `1px solid ${t.gold}` : '1px solid transparent',
                    background: selected ? t.ink : 'transparent',
                    color: selected ? t.paper : isBooked ? t.danger : t.ink,
                    opacity: past ? 0.3 : 1,
                    textDecoration: isBooked && !past ? 'line-through' : 'none',
                    cursor: disabled ? 'default' : 'pointer',
                  }}
                  className={disabled || selected ? undefined : 'cv-day'}>
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.line}`, fontSize: 12, color: t.muted }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, border: `1px solid ${t.gold}` }} />Днес</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: t.danger, textDecoration: 'line-through' }}>12</span>Заета</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function App({ base = '/' }: { base?: string }) {
  const [isDark, setIsDark]       = useState(true);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [page, setPage]           = useState<Page>('home');
  const [mode, setMode]           = useState<Mode>('inquiry');
  const [eventType, setEventType] = useState('Сватба');
  const [services, setServices]   = useState<string[]>([]);
  const [time, setTime]           = useState('Следобед');
  const [name, setName]           = useState('');
  const [phone, setPhone]         = useState('');
  const [email, setEmail]         = useState('');
  const [date, setDate]           = useState('');
  const [location, setLocation]   = useState('');
  const [guests, setGuests]       = useState('');
  const [note, setNote]           = useState('');
  const [sent, setSent]           = useState(false);
  const [consent, setConsent]     = useState(false);
  const [botcheck, setBotcheck]   = useState(false);
  const [trap, setTrap]           = useState('');
  const [sending, setSending]     = useState(false);
  const [formError, setFormError] = useState('');
  const formOpenedAt = useRef(0);
  const [checkedDate, setCheckedDate] = useState('');
  const [dateStatus, setDateStatus]   = useState<'idle' | 'checking' | 'available' | 'taken' | 'unknown'>('idle');
  const [booked, setBooked]           = useState<Set<string> | null | undefined>(undefined);
  const [estType, setEstType]         = useState('wedding');
  const [estHours, setEstHours]       = useState(5);
  const [estGuests, setEstGuests]     = useState('50 – 150');
  const [estHost, setEstHost]         = useState(true);
  const [estLights, setEstLights]     = useState(true);
  const [svcIdx, setSvcIdx]           = useState(0);
  const [svcStep, setSvcStep]         = useState(0);
  const svcPicked = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!svcPicked.current && page === 'home') setSvcStep(s => (s + 1) % 5);
    }, 4500);
    return () => clearInterval(timer);
  }, [page]);

  const pickSvcStep = (i: number) => {
    svcPicked.current = true;
    setSvcStep(((i % 5) + 5) % 5);
  };
  const svc = SERVICES[svcIdx];
  const svcItem = svc.items[svcStep];

  const t = isDark ? DARK : LIGHT;
  const logo = isDark
    ? `${base}assets/celebris-logo-light.png`
    : `${base}assets/celebris-logo-dark.png`;

  // Hash routing
  useEffect(() => {
    const hash = window.location.hash.slice(1) as Page;
    const valid: Page[] = ['home', 'services', 'prices', 'contact', 'privacy'];
    if (valid.includes(hash)) setPage(hash);
  }, []);

  const go = (p: Page, extra?: { mode?: Mode }) => {
    setPage(p);
    setMenuOpen(false);
    if (extra?.mode !== undefined) setMode(extra.mode);
    if (extra) setSent(false);
    window.history.replaceState(null, '', p === 'home' ? window.location.pathname : `#${p}`);
    window.scrollTo(0, 0);
  };

  const toggleService = (s: string) =>
    setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  useEffect(() => {
    if (page === 'contact') formOpenedAt.current = Date.now();
  }, [page]);

  const submitForm = async () => {
    if (sending) return;
    setFormError('');

    // Bots get a fake success so they don't learn what tripped them.
    if (botcheck || trap) return setSent(true);
    if (Date.now() - formOpenedAt.current < 3000) return setSent(true);

    if (name.trim().length < 2) return setFormError('Моля, въведи името си.');
    if (!/^[+\d\s()\-]+$/.test(phone.trim()) || phone.replace(/\D/g, '').length < 7) return setFormError('Моля, въведи валиден телефонен номер.');
    if (mode === 'inquiry' && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setFormError('Имейлът не изглежда валиден.');
    if ((note.match(/https?:\/\/|www\./gi) || []).length > 2) return setFormError('Съобщението съдържа твърде много линкове.');
    if (!consent) return setFormError('Моля, потвърди, че си запознат с Политиката за поверителност.');

    let lastSent = 0;
    try { lastSent = Number(localStorage.getItem('cv-last-sent')) || 0; } catch {}
    if (Date.now() - lastSent < 60_000) return setFormError('Вече получихме запитване от теб. Опитай отново след минута.');

    const fields: Record<string, string> = mode === 'call'
      ? { subject: `Заявка за обаждане - ${name}`, 'Тип': 'Обаждане', 'Име': name, 'Телефон': phone, 'Удобно време': time }
      : {
          subject: `Запитване: ${eventType}${date ? ` - ${date}` : ''}`,
          'Тип': 'Запитване', 'Име': name, 'Телефон': phone, email,
          'Вид събитие': eventType, 'Дата': date, 'Локация': location, 'Гости': guests,
          'Услуги': services.join(', '), 'Съобщение': note,
        };
    const payload = Object.fromEntries(Object.entries(fields).filter(([, v]) => v.trim() !== ''));

    setSending(true);
    try {
      if (!WEB3FORMS_KEY) {
        if (!import.meta.env.DEV) throw new Error('Web3Forms key not configured');
        console.info('[mock] Web3Forms payload', payload);
        await new Promise(r => setTimeout(r, 700));
      } else {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ access_key: WEB3FORMS_KEY, from_name: 'Celebris Vibe - сайт', ...payload }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error(json.message || `HTTP ${res.status}`);
      }
      try { localStorage.setItem('cv-last-sent', String(Date.now())); } catch {}
      setSent(true);
    } catch {
      setFormError(`Не успяхме да изпратим формата. Обади ни се на ${CONTACT_PHONE} или пиши на ${CONTACT_EMAIL}.`);
    } finally {
      setSending(false);
    }
  };

  const addExtra = (title: string) => {
    setNote(n => n.includes(title) ? n : `${n ? n + '\n' : ''}Допълнително: ${title}`);
    go('contact', { mode: 'inquiry' });
  };

  useEffect(() => {
    if (page === 'contact') loadBookedDates().then(setBooked);
  }, [page]);

  const checkDate = async (iso: string) => {
    setCheckedDate(iso);
    setDateStatus('checking');
    const list = await loadBookedDates();
    setBooked(list);
    if (!list) return setDateStatus('unknown');
    if (list.has(iso)) return setDateStatus('taken');
    setDate(iso);
    setDateStatus('available');
  };

  const grad     = `repeating-linear-gradient(135deg,${t.s1} 0 12px,${t.s2} 12px 24px)`;
  const cssVars = { '--cv-gold': t.gold, '--cv-ink': t.ink, '--cv-paper': t.paper } as CSSProperties;

  const who = name ? `, ${name}` : '';
  const sentTitle = mode === 'call' ? 'Обаждането е записано' : 'Запитването е изпратено';
  const sentMsg   = mode === 'call'
    ? `Благодарим ти${who}. Ще те потърсим ${time.toLowerCase()} или на следващия работен ден.`
    : `Благодарим ти${who}. Ще се свържем с теб в рамките на един работен ден за твоето ${eventType.toLowerCase()}.`;

  // ── Събития, които правим (home + Услуги) ────────────────────────────────
  const occasionsSection = (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 36 }}>
          <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(44px,5.6vw,84px)', lineHeight: 1 }}>Събития, които правим</h2>
          {page === 'home' && <button onClick={() => go('services')} style={{ background: 'none', border: 'none', borderBottom: `1px solid ${t.ink}`, padding: '4px 0', color: t.ink, fontSize: 16, cursor: 'pointer' }}>Услугите в детайли</button>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 16 }}>
          {EVENT_TYPES.map(e => (
            <button key={e.key} onClick={() => { setEventType(e.formLabel); go('contact', { mode: 'inquiry' }); }} className="cv-occasion" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 340, padding: 0, borderRadius: 28, background: t.card, border: `1px solid ${t.line}`, color: t.ink, textAlign: 'left', cursor: 'pointer' }}>
              <img className="cv-occasion-img" src={`${base}assets/photos/${e.photo}.jpg`} alt="" loading="lazy" />
              <span className="cv-occasion-shade" />
              <span style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14, flex: 1, padding: 32 }}>
                <span className="cv-occ-title" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 'clamp(28px,2.4vw,36px)', lineHeight: 1.05 }}>{e.title}</span>
                <span className="cv-occ-desc" style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.55, color: t.body, maxWidth: 440 }}>{e.desc}</span>
                <span style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <span className="cv-occ-chip" style={{ padding: '7px 14px', borderRadius: 999, background: t.paper, fontSize: 14, color: t.gold }}>{e.subtitle}</span>
                  <span className="cv-occ-go" style={{ flexShrink: 0, width: 48, height: 48, borderRadius: '50%', border: `1px solid ${t.edge}`, color: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="arrowRight" />
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </>
  );

  // ── Допълнителни опции (home + Услуги) ───────────────────────────────────
  const extrasSection = (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(44px,5.6vw,84px)', lineHeight: 1 }}>Допълнителни опции</h2>
            <p style={{ margin: '14px 0 0', fontSize: 18, fontWeight: 300, color: t.body }}>Добави към всеки пакет - сами или чрез нашата партньорска мрежа.</p>
          </div>
          <button onClick={() => go('prices')} style={{ background: 'none', border: 'none', borderBottom: `1px solid ${t.ink}`, padding: '4px 0', color: t.ink, fontSize: 16, cursor: 'pointer' }}>Виж цените</button>
        </div>
        <div className="cv-extras" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: 20 }}>
          {EXTRAS.map(e => {
            const added = note.includes(e.title);
            return (
              <div key={e.title} className="cv-event-card" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 32, padding: 10, display: 'flex', flexDirection: 'column', transition: 'transform 300ms,box-shadow 300ms' }}>
                <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 24, overflow: 'hidden', background: grad }}>
                  <img src={`${base}assets/photos/${e.photo}.jpg`} alt={e.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <span style={{ position: 'absolute', top: 12, right: 12, padding: '6px 12px', borderRadius: 999, background: t.paper, fontSize: 13, color: t.ink }}>{e.tag}</span>
                </div>
                <div style={{ padding: '20px 14px 10px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 26, lineHeight: 1.05 }}>{e.title}</div>
                  <div style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.5, color: t.body }}>{e.desc}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 'auto', paddingTop: 12 }}>
                    <button onClick={() => go('prices')} style={{ background: 'none', border: 'none', borderBottom: `1px solid ${t.muted}`, padding: '2px 0', color: t.muted, fontSize: 14, cursor: 'pointer' }}>Към цените</button>
                    <button onClick={() => addExtra(e.title)} className={added ? undefined : 'cv-btn-primary'} style={{ padding: '11px 18px', borderRadius: 999, border: `1px solid ${t.ink}`, background: added ? 'transparent' : t.ink, color: added ? t.ink : t.paper, fontWeight: 500, fontSize: 14, cursor: 'pointer', transition: 'background 200ms' }}>
                      {added ? 'Добавено ✓' : 'Добави към запитване'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );

  // ── Price estimator (Цени page) ──────────────────────────────────────────
  const estimate = ESTIMATE.base
    + Math.max(0, estHours - ESTIMATE.includedHours) * ESTIMATE.extraHour
    + ESTIMATE.sound[estGuests]
    + ESTIMATE.type[estType]
    + (estHost ? ESTIMATE.host : 0)
    + (estLights ? ESTIMATE.lights : 0);

  const requestEstimate = () => {
    setEventType(EST_TYPES.find(([k]) => k === estType)![2]);
    setGuests(estGuests);
    setServices(['DJ', 'Озвучаване', ...(estHost ? ['Водещ'] : []), ...(estLights ? ['Осветление'] : [])]);
    setNote(n => {
      const line = `Ориентировъчна оценка от сайта: от €${estimate}, ${estHours} часа`;
      const rest = n.split('\n').filter(l => !l.startsWith('Ориентировъчна оценка от сайта')).join('\n');
      return rest ? `${line}\n${rest}` : line;
    });
    go('contact', { mode: 'inquiry' });
  };

  const estChip = (on: boolean) => ({ padding: '9px 14px', borderRadius: 999, border: `1px solid ${on ? t.ink : t.edge}`, background: on ? t.ink : 'transparent', color: on ? t.paper : t.ink, fontSize: 14, cursor: 'pointer' }) as CSSProperties;
  const estLabel = { fontSize: 13, fontWeight: 500, color: t.muted, marginBottom: 10 } as CSSProperties;

  const estimator = (
    <div style={{ width: '100%', maxWidth: 580, justifySelf: 'center' }}>
      <div style={{ borderRadius: 28, background: t.card, border: `1px solid ${t.line}`, overflow: 'hidden', boxShadow: '0 30px 60px -36px rgba(0,0,0,0.45)' }}>
        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: 24, letterSpacing: '-0.02em' }}>Пресметни ориентировъчно</div>

          <div>
            <div style={estLabel}>Повод</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EST_TYPES.map(([k, label]) => (
                <button key={k} type="button" aria-pressed={estType === k} onClick={() => setEstType(k)} style={estChip(estType === k)}>{label}</button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ ...estLabel, display: 'flex', justifyContent: 'space-between' }}>
              <span>Продължителност</span>
              <span style={{ color: t.ink, fontWeight: 600 }}>{estHours} часа</span>
            </div>
            <input type="range" min={2} max={10} step={1} value={estHours} onChange={e => setEstHours(+e.target.value)} aria-label="Продължителност в часове" style={{ width: '100%', accentColor: t.gold, cursor: 'pointer' }} />
          </div>

          <div>
            <div style={estLabel}>Гости</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EST_GUESTS.map(g => (
                <button key={g} type="button" aria-pressed={estGuests === g} onClick={() => setEstGuests(g)} style={estChip(estGuests === g)}>{g}</button>
              ))}
            </div>
          </div>

          <div>
            <div style={estLabel}>Добави</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {([['Водещ', estHost, setEstHost], ['Осветление', estLights, setEstLights]] as [string, boolean, (v: boolean) => void][]).map(([label, on, set]) => (
                <button key={label} type="button" aria-pressed={on} onClick={() => set(!on)} style={{ ...estChip(on), display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${on ? t.paper : t.edge}`, background: on ? t.paper : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {on && <span style={{ width: 6, height: 6, background: t.ink, borderRadius: 1 }} />}
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '22px 28px', background: t.ink, color: t.paper, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div aria-live="polite">
            <div style={{ fontSize: 13, color: t.bandGold }}>Ориентировъчно от</div>
            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 40, letterSpacing: '-0.03em', lineHeight: 1.05 }}>€{estimate}<span style={{ color: t.bandGold }}>*</span></div>
          </div>
          <button onClick={requestEstimate} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 22px', border: 'none', borderRadius: 999, background: t.paper, color: t.ink, fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
            Получи точна оферта <Icon name="arrowRight" size={16} />
          </button>
        </div>
      </div>
      <p style={{ margin: '14px 4px 0', fontSize: 13, lineHeight: 1.55, color: t.muted }}>
        * Ориентировъчна цена, изчислена автоматично за събитие в града. Не е оферта. Точната сума зависи от залата, програмата, техниката и локацията и я потвърждаваме в персонална оферта до един работен ден.
      </p>
    </div>
  );

  // ── Hero backdrop: stage beams, bokeh, equalizer (decorative) ────────────
  // Light theme needs a more saturated amber, multiplied onto the paper, to read at all.
  const fx = isDark
    ? { color: t.gold, beam: 1, dot: 1, eq: 0.3, blend: 'normal' as const }
    : { color: '#d39a3c', beam: 1.5, dot: 1.2, eq: 0.5, blend: 'multiply' as const };
  const heroBackdrop = (
    <div className="cv-hero-bg" aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {HERO_BEAMS.map((b, i) => (
        <div key={`beam${i}`} style={{
          position: 'absolute', top: '-12%', left: b.left, width: b.width, height: '125%',
          transformOrigin: '50% 0', opacity: b.opacity * fx.beam, filter: 'blur(28px)', mixBlendMode: fx.blend,
          animation: `cvBeam ${b.dur}s ease-in-out ${b.delay}s infinite alternate`,
        }}>
          <div style={{ width: '100%', height: '100%', clipPath: 'polygon(44% 0, 56% 0, 100% 100%, 0 100%)', background: `linear-gradient(to bottom, ${fx.color}, transparent 70%)` }} />
        </div>
      ))}
      {HERO_BOKEH.map((d, i) => (
        <span key={`dot${i}`} style={{
          position: 'absolute', left: d.x, top: d.y, width: d.size, height: d.size, borderRadius: '50%',
          background: `radial-gradient(circle, ${fx.color} 0%, transparent 70%)`,
          opacity: 0, mixBlendMode: fx.blend, animation: `cvBokeh ${d.dur}s ease-in-out ${d.delay}s infinite`,
          ['--cv-o' as any]: Math.min(1, d.o * fx.dot),
        }} />
      ))}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 26, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 5, overflow: 'hidden',
        opacity: fx.eq,
        WebkitMaskImage: 'linear-gradient(to right, transparent, #000 15%, #000 85%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, #000 15%, #000 85%, transparent)',
      }}>
        {HERO_EQ.map((dur, i) => (
          <span key={`eq${i}`} style={{ flex: 'none', width: 3, height: '100%', borderRadius: 2, background: fx.color, transformOrigin: 'bottom', transform: 'scaleY(0.15)', animation: `cvEq ${dur}s ease-in-out ${(i % 7) * -0.17}s infinite alternate` }} />
        ))}
      </div>
    </div>
  );

  // ── Pill badge ────────────────────────────────────────────────────────────
  // Eyebrow label above headings. Light theme uses a deeper gold so small text keeps 4.5:1.
  const eyebrowGold = isDark ? t.gold : '#7a5f31';
  const Pill = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, fontSize: 13, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: eyebrowGold }}>
      <span style={{ width: 32, height: 1, background: eyebrowGold, display: 'block', flexShrink: 0 }} />
      {children}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: t.paper, color: t.ink, overflowX: 'hidden', ...cssVars }}>

      {/* ── HEADER ── */}
      <header style={{ position: 'sticky', top: 12, zIndex: 30, margin: '12px clamp(12px,2vw,24px) 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '6px 8px 6px 16px', background: t.headerBg, backdropFilter: 'blur(14px)', border: `1px solid ${t.line}`, borderRadius: 999, flexWrap: 'nowrap' }}>
        <button onClick={() => go('home')} style={{ flex: 'none', display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: t.ink, cursor: 'pointer', padding: 0 }}>
          <img src={logo} alt="Celebris Vibe" className="cv-header-logo" style={{ height: 58, display: 'block' }} />
        </button>

        <nav className="cv-nav" style={{ display: 'flex', gap: 2, flexWrap: 'nowrap', flex: '1 1 auto', minWidth: 0, overflowX: 'auto', justifyContent: 'center', scrollbarWidth: 'none' } as CSSProperties}>
          {PAGES.slice(1).map(([k, label]) => (
            <button key={k} onClick={() => go(k)} aria-current={page === k ? 'page' : undefined} className="cv-navlink" style={{ background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flex: 'none', padding: '8px 12px', borderRadius: 999, fontSize: 16, color: page === k ? t.ink : t.body, textDecoration: page === k ? 'underline' : 'none', textDecorationColor: t.gold, textDecorationThickness: 2, textUnderlineOffset: 7, fontWeight: page === k ? 600 : 400, transition: 'color 200ms' }}>
              {label}
            </button>
          ))}
        </nav>

        <button onClick={() => setIsDark(d => !d)} className="cv-theme-btn" aria-label="Смени темата" title={isDark ? 'Светла тема' : 'Тъмна тема'} style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, border: `1px solid ${t.edge}`, borderRadius: 999, background: 'transparent', cursor: 'pointer' }}>
          {isDark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.ink} strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <button onClick={() => go('contact', { mode: 'inquiry' })} className="cv-btn-primary cv-header-cta" style={{ flex: 'none', whiteSpace: 'nowrap', padding: '12px 22px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 15, cursor: 'pointer', transition: 'background 200ms' }}>
          Запази дата
        </button>

        <button onClick={() => setMenuOpen(o => !o)} className="cv-menu-btn" aria-label={menuOpen ? 'Затвори менюто' : 'Отвори менюто'} aria-expanded={menuOpen} style={{ flex: 'none', display: 'none', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontSize: 18, cursor: 'pointer' }}>
          <Icon name={menuOpen ? 'close' : 'menu'} size={20} />
        </button>

        {menuOpen && (
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, display: 'flex', flexDirection: 'column', gap: 2, padding: 10, background: t.paper, border: `1px solid ${t.edge}`, borderRadius: 24, boxShadow: '0 24px 48px -24px rgba(0,0,0,0.35)' }}>
            {PAGES.map(([k, label]) => (
              <button key={k} onClick={() => go(k)} aria-current={page === k ? 'page' : undefined} style={{ textAlign: 'left', background: page === k ? t.card : 'none', border: 'none', borderLeft: `3px solid ${page === k ? t.gold : 'transparent'}`, cursor: 'pointer', padding: '14px 16px', borderRadius: 12, fontSize: 17, color: page === k ? t.ink : t.body, fontWeight: page === k ? 600 : 400 }}>
                {label}
              </button>
            ))}
            <button onClick={() => go('contact', { mode: 'inquiry' })} style={{ marginTop: 6, padding: '15px 18px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>
              Запази дата
            </button>
          </div>
        )}
      </header>

      {/* ════════════════════════════════════════════ HOME ══════════════════ */}
      {page === 'home' && (
        <>
          {/* Hero */}
          <section className="cv-hero" style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px) clamp(56px,7vw,96px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,460px),1fr))', gap: 'clamp(40px,5vw,80px)', alignItems: 'center' }}>
            {heroBackdrop}
            <div>
              <Pill>DJ · Водещ · Озвучаване · Осветление</Pill>
              <h1 style={{ margin: '24px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(36px,5vw,92px)', lineHeight: 0.98 }}>
                Създаваме вайб.<br />Честваме живота.
              </h1>
              <p style={{ margin: '32px 0 0', fontSize: 20, fontWeight: 300, lineHeight: 1.55, maxWidth: 500, color: t.body }}>
                DJ, водещ, озвучаване и осветление за сватби, частни тържества и корпоративни събития - от един екип, от първата песен до последната.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
                <button onClick={() => go('contact', { mode: 'inquiry' })} className="cv-btn-primary" style={{ padding: '17px 28px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 16, cursor: 'pointer', transition: 'background 200ms' }}>
                  Провери свободна дата
                </button>
                <button onClick={() => go('contact', { mode: 'call' })} style={{ padding: '17px 28px', border: `1px solid ${t.ink}`, borderRadius: 999, background: 'transparent', color: t.ink, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>
                  Поискай обаждане
                </button>
              </div>
            </div>

            <div style={{ position: 'relative', width: 'min(100%,560px)', aspectRatio: '1', justifySelf: 'center' }}>
              <div style={{ position: 'absolute', inset: '9%', borderRadius: '50%', background: grad, overflow: 'hidden' }}>
                <img src={`${base}assets/photos/hero.jpg`} alt="Сватбено парти на дансинга" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', animation: 'cvspin 90s linear infinite' }}>
                <img src={logo} alt="" style={{ position: 'absolute', width: '273%', left: '-86.8%', top: '-72.2%', maxWidth: 'none' }} />
              </div>
              <button onClick={() => go('contact', { mode: 'inquiry' })} className="cv-next-event" style={{ position: 'absolute', right: -4, bottom: '6%', padding: '16px 20px', background: t.paper, border: `1px solid ${t.line}`, borderRadius: 20, boxShadow: '0 24px 48px -24px rgba(0,0,0,0.35)', textAlign: 'left', cursor: 'pointer', color: t.ink }}>
                <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 22 }}>Провери за свободна дата</div>
                <div style={{ fontSize: 14, color: t.ink, marginTop: 2 }}>Отговор за секунди</div>
              </button>
            </div>
          </section>

          {/* Услуги - interactive */}
          <section style={{ padding: '0 clamp(12px,2vw,24px) clamp(64px,8vw,112px)' }}>
          <div style={{ borderRadius: 40, background: t.ink, color: t.paper, padding: 'clamp(28px,4.5vw,64px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: '24px 40px', alignItems: 'end', marginBottom: 40 }}>
              <div>
                <div style={{ fontSize: 15, color: t.bandGold, marginBottom: 12 }}>{svc.intro}</div>
                <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(44px,5.6vw,84px)', lineHeight: 0.95 }}>{svc.title}</h2>
              </div>
              <div className="cv-plan-tabs" style={{ display: 'flex', gap: 4, padding: 5, borderRadius: 999, border: `1px solid ${t.bandLine}`, justifySelf: 'end', flexWrap: 'wrap' }}>
                {SERVICES.map((s, i) => (
                  <button key={s.key} onClick={() => { svcPicked.current = true; setSvcIdx(i); setSvcStep(0); }} style={{ padding: '11px 20px', borderRadius: 999, border: 'none', background: svcIdx === i ? t.paper : 'transparent', color: svcIdx === i ? t.ink : t.paper, fontSize: 15, cursor: 'pointer', transition: 'background 250ms' }}>
                    {s.title}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 20, alignItems: 'stretch' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {svc.items.map((item, i) => {
                  const on = i === svcStep;
                  return (
                    <button key={item.title} onClick={() => pickSvcStep(i)} style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', gap: '2px 16px', alignItems: 'center', textAlign: 'left', cursor: 'pointer', padding: '16px 20px 16px 16px', borderRadius: 22, border: `1px solid ${on ? t.bandActive : t.bandLine}`, background: on ? t.bandActive : 'transparent', color: t.paper, transition: 'background 300ms,border-color 300ms' }}>
                      <span style={{ gridRow: 'span 2', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 15, background: on ? t.bandGold : 'transparent', color: on ? t.ink : t.bandGold, transition: 'background 300ms' }}>{i + 1}</span>
                      <span style={{ fontSize: 13, color: t.bandGold }}>{item.occasions.join(' · ')}</span>
                      <span style={{ gridRow: 'span 2', display: 'flex', opacity: on ? 1 : 0, transition: 'opacity 300ms' }}><Icon name="chevronRight" size={22} /></span>
                      <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.02em', fontSize: 22, lineHeight: 1.1 }}>{item.title}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ position: 'relative', minHeight: 460, borderRadius: 30, overflow: 'hidden', background: t.bandS1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 16 }}>
                {svc.items.map(item => (
                  <img key={item.photo} src={`${base}assets/photos/${item.photo}.jpg`} alt={item.title} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: item === svcItem ? 1 : 0, transition: 'opacity 500ms' }} />
                ))}
                <div style={{ position: 'relative', display: 'flex', gap: 6 }}>
                  {svc.items.map((_, i) => (
                    <span key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= svcStep ? t.bandGold : 'rgba(255,255,255,0.35)', transition: 'background 400ms' }} />
                  ))}
                </div>
                <div style={{ position: 'relative', background: t.paper, color: t.ink, borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {svcItem.occasions.map(o => (
                        <span key={o} style={{ padding: '6px 12px', borderRadius: 999, background: t.card, border: `1px solid ${t.line}`, fontSize: 13, color: t.gold }}>{o}</span>
                      ))}
                    </div>
                    <span style={{ fontSize: 14, color: t.muted }}>{svcStep + 1} от {svc.items.length}</span>
                  </div>
                  <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.03em', fontSize: 'clamp(30px,3vw,40px)', lineHeight: 1 }}>{svcItem.title}</div>
                  <p style={{ margin: 0, fontSize: 17, fontWeight: 300, lineHeight: 1.55, color: t.body }}>{svcItem.desc}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                    <button onClick={() => pickSvcStep(svcStep - 1)} aria-label="Предишна" style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${t.edge}`, background: 'transparent', color: t.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowLeft" /></button>
                    <button onClick={() => pickSvcStep(svcStep + 1)} aria-label="Следваща" style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: t.ink, color: t.paper, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowRight" /></button>
                    <button onClick={() => go('contact', { mode: 'inquiry' })} style={{ marginLeft: 'auto', background: 'none', border: 'none', borderBottom: `1px solid ${t.ink}`, padding: '4px 0', color: t.ink, fontSize: 15, cursor: 'pointer' }}>Запитване</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          </section>

          <section style={{ padding: '0 clamp(20px,4vw,64px) clamp(64px,8vw,120px)' }}>
            {occasionsSection}
          </section>

          {/* Допълнителни опции */}
          <section style={{ padding: '0 clamp(20px,4vw,64px) clamp(64px,8vw,120px)' }}>
            {extrasSection}
          </section>

        </>
      )}

      {/* ════════════════════════════════════════════ SERVICES ══════════════ */}
      {page === 'services' && (<>
        <section className="cv-hero" style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px) clamp(56px,7vw,96px)' }}>
          {heroBackdrop}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap: 'clamp(40px,5vw,80px)', alignItems: 'center' }}>
            <div>
              <Pill>Услуги</Pill>
              <h1 style={{ margin: '24px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(36px,5vw,92px)', lineHeight: 0.98 }}>
                DJ, звук и светлина<br />за всеки повод.
              </h1>
              <p style={{ margin: '32px 0 0', fontSize: 20, fontWeight: 300, lineHeight: 1.55, maxWidth: 560, color: t.body }}>
                Професионален DJ и водещ, собствено озвучаване и осветление - за сватби, частни партита и корпоративни събития. Избери отделна услуга или ги комбинирай в един пакет.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
                <button onClick={() => go('contact', { mode: 'inquiry' })} className="cv-btn-primary" style={{ padding: '17px 28px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 16, cursor: 'pointer', transition: 'background 200ms' }}>
                  Провери свободна дата
                </button>
                <button onClick={() => go('prices')} style={{ padding: '17px 28px', border: `1px solid ${t.ink}`, borderRadius: 999, background: 'transparent', color: t.ink, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>
                  Виж цените
                </button>
              </div>
            </div>

            {/* Service index: jump to each section */}
            <nav aria-label="Услуги" style={{ width: '100%', maxWidth: 580, justifySelf: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SERVICE_DETAILS.map((s, i) => (
                <button key={s.key} onClick={() => document.getElementById(`svc-${s.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="cv-occasion" style={{ position: 'relative', overflow: 'hidden', display: 'block', padding: 0, borderRadius: 24, background: t.card, border: `1px solid ${t.line}`, color: t.ink, textAlign: 'left', cursor: 'pointer' }}>
                  <img className="cv-occasion-img" src={`${base}assets/photos/${s.photo}.jpg`} alt="" loading="lazy" />
                  <span className="cv-occasion-shade" />
                  <span style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 20, padding: '22px 24px' }}>
                    <span className="cv-occ-chip" style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 15, color: t.gold }}>0{i + 1}</span>
                    <span>
                      <span className="cv-occ-title" style={{ display: 'block', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.02em', fontSize: 'clamp(22px,2vw,28px)', lineHeight: 1.1 }}>{s.title}</span>
                      <span className="cv-occ-desc" style={{ display: 'block', marginTop: 6, fontSize: 15, fontWeight: 300, color: t.body }}>{s.fits.slice(0, 3).join(' · ')}</span>
                    </span>
                    <span className="cv-occ-go" style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${t.edge}`, color: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="chevronDown" />
                    </span>
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </section>

        <section style={{ padding: '0 clamp(20px,4vw,64px) clamp(48px,7vw,104px)' }}>
          {/* Detail section per service */}
          {SERVICE_DETAILS.map((s, i) => (
            <article key={s.key} id={`svc-${s.key}`} style={{ scrollMarginTop: 110, marginTop: 'clamp(64px,8vw,120px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 'clamp(32px,4vw,64px)', alignItems: 'start' }}>
              <div style={{ order: i % 2 ? 2 : 1 }}>
                <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 15, color: t.gold }}>0{i + 1}</div>
                <h2 style={{ margin: '10px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(40px,5vw,72px)', lineHeight: 1 }}>{s.title}</h2>
                <p style={{ margin: '24px 0 0', fontSize: 19, fontWeight: 300, lineHeight: 1.6, color: t.body }}>{s.lead}</p>

                <div style={{ marginTop: 32, fontSize: 14, fontWeight: 500, color: t.muted }}>Какво включва</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {s.includes.map(item => (
                    <li key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 17, lineHeight: 1.45 }}>
                      <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: t.ink, color: t.paper, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: 28, fontSize: 14, fontWeight: 500, color: t.muted }}>Подходящо за</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                  {s.fits.map(f => (
                    <span key={f} style={{ padding: '7px 14px', borderRadius: 999, background: t.card, border: `1px solid ${t.line}`, fontSize: 14, color: t.gold }}>{f}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
                  <button onClick={() => { setServices(s.formServices); go('contact', { mode: 'inquiry' }); }} className="cv-btn-primary" style={{ padding: '15px 24px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 15, cursor: 'pointer', transition: 'background 200ms' }}>
                    Запитване за {s.title}
                  </button>
                  <button onClick={() => go('prices')} style={{ padding: '15px 24px', border: `1px solid ${t.ink}`, borderRadius: 999, background: 'transparent', color: t.ink, fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
                    Цени
                  </button>
                </div>
              </div>

              <figure style={{ order: i % 2 ? 1 : 2, position: 'relative', margin: 0, aspectRatio: '4/3', borderRadius: 32, overflow: 'hidden', background: grad }}>
                <img src={`${base}assets/photos/${s.photo}.jpg`} alt={s.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <figcaption style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 'clamp(56px,7vw,96px) clamp(24px,3vw,40px) clamp(24px,3vw,36px)', background: 'linear-gradient(to top, rgba(10,10,12,0.9) 0%, rgba(10,10,12,0.55) 55%, transparent)' }}>
                  <blockquote style={{ margin: 0, paddingLeft: 20, borderLeft: '3px solid #c9ad78', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.02em', fontSize: 'clamp(20px,2vw,28px)', lineHeight: 1.25, color: '#f2f1ec', textWrap: 'balance' as any }}>
                    {s.quote}
                  </blockquote>
                </figcaption>
              </figure>
            </article>
          ))}

          {/* Събития, които правим */}
          <div style={{ marginTop: 'clamp(80px,9vw,140px)' }}>
            {occasionsSection}
          </div>

          {/* Допълнителни опции */}
          <div style={{ marginTop: 'clamp(80px,9vw,140px)' }}>
            {extrasSection}
          </div>

          {/* Guide */}
          <div style={{ marginTop: 'clamp(80px,9vw,140px)' }}>
            <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(40px,5vw,72px)', lineHeight: 1 }}>Коя услуга за какъв повод?</h2>
            <p style={{ margin: '16px 0 36px', fontSize: 18, fontWeight: 300, color: t.body, maxWidth: 620 }}>Не си сигурен какво ти трябва? Ето от какво започват повечето ни клиенти.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 16 }}>
              {SERVICE_GUIDE.map(g => (
                <div key={g.title} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 28, borderRadius: 28, background: t.card, border: `1px solid ${t.line}` }}>
                  <span style={{ alignSelf: 'flex-start', padding: '6px 12px', borderRadius: 999, background: t.paper, fontSize: 13, color: t.gold }}>{g.when}</span>
                  <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 26, lineHeight: 1.1 }}>{g.title}</span>
                  <span style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.5, color: t.body }}>{g.desc}</span>
                  <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderTop: `1px solid ${t.line}` }}>
                    <span style={{ fontSize: 15, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ color: t.gold, display: 'flex' }}><Icon name="sparkle" size={14} /></span>{g.rec}</span>
                    <button onClick={() => go('prices')} style={{ background: 'none', border: 'none', borderBottom: `1px solid ${t.muted}`, padding: '2px 0', color: t.muted, fontSize: 14, cursor: 'pointer' }}>Цени</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: 64, borderRadius: 28, padding: 'clamp(32px,5vw,64px)', background: t.ink, color: t.paper, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 'clamp(28px,4vw,48px)', lineHeight: 1.1 }}>
              Свободна ли е датата ти?
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => go('prices')} style={{ padding: '17px 28px', border: `1px solid ${t.bandLine}`, borderRadius: 999, background: 'transparent', color: t.paper, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Виж цените</button>
              <button onClick={() => go('contact', { mode: 'inquiry' })} style={{ padding: '17px 28px', border: 'none', borderRadius: 999, background: t.paper, color: t.ink, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Провери датата</button>
            </div>
          </div>
        </section>
      </>)}

      {/* ════════════════════════════════════════════ PRICES ════════════════ */}
      {page === 'prices' && (<>
        <section className="cv-hero" style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px) clamp(56px,7vw,96px)' }}>
          {heroBackdrop}
          {/* Intro + estimator */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap: 'clamp(40px,5vw,80px)', alignItems: 'center' }}>
          <div>
            <Pill>Цени</Pill>
            <h1 style={{ margin: '24px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(36px,5vw,92px)', lineHeight: 0.98 }}>
              Една оферта.<br />Цялото събитие.
            </h1>
            <p style={{ margin: '32px 0 0', fontSize: 20, fontWeight: 300, lineHeight: 1.55, maxWidth: 620, color: t.body }}>
              Всяко събитие е различно, затова не работим с фиксиран ценоразпис. Изпрати ни едно запитване и до един работен ден ще получиш точна оферта.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
              <button onClick={() => go('contact', { mode: 'inquiry' })} className="cv-btn-primary" style={{ padding: '17px 28px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 16, cursor: 'pointer', transition: 'background 200ms' }}>
                Получи оферта
              </button>
              <button onClick={() => go('contact', { mode: 'call' })} style={{ padding: '17px 28px', border: `1px solid ${t.ink}`, borderRadius: 999, background: 'transparent', color: t.ink, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>
                Поискай обаждане
              </button>
            </div>
          </div>
          {estimator}
          </div>
        </section>

        <section style={{ padding: '0 clamp(20px,4vw,64px) clamp(48px,7vw,104px)' }}>
          {/* Factors */}
          <h2 style={{ margin: 'clamp(64px,8vw,112px) 0 36px', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(40px,5vw,72px)', lineHeight: 1 }}>От какво зависи цената</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap: 16 }}>
            {PRICE_FACTORS.map((f, i) => (
              <div key={f.title} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 28, borderRadius: 28, background: t.card, border: `1px solid ${t.line}` }}>
                <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 40, lineHeight: 1, color: t.gold }}>0{i + 1}</span>
                <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.02em', fontSize: 24, lineHeight: 1.1 }}>{f.title}</span>
                <span style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.5, color: t.body }}>{f.desc}</span>
              </div>
            ))}
          </div>

          {/* Always included */}
          <div style={{ marginTop: 16, padding: 'clamp(28px,3.5vw,44px)', borderRadius: 28, background: t.ink, color: t.paper, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: '28px clamp(32px,4vw,64px)', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 'clamp(26px,2.8vw,38px)', lineHeight: 1.1 }}>Винаги включено в офертата</div>
              <p style={{ margin: '12px 0 0', fontSize: 16, fontWeight: 300, lineHeight: 1.55, color: t.bandText, maxWidth: 420 }}>Основата на всяко събитие е в цената - без доплащане за техниката, която прави вечерта възможна.</p>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '14px 24px' }}>
              {ALWAYS_INCLUDED.map(x => (
                <li key={x} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: t.paper }}>
                  <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', border: `1px solid ${t.bandGold}`, color: t.bandGold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check" size={15} />
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>

          {/* Starting packages */}
          <h2 style={{ margin: 'clamp(64px,8vw,112px) 0 12px', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(40px,5vw,72px)', lineHeight: 1 }}>Изходни пакети</h2>
          <p style={{ margin: '0 0 36px', fontSize: 18, fontWeight: 300, color: t.body, maxWidth: 620 }}>Ориентир, от който започваме. Крайната цена уточняваме спрямо факторите по-горе.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: 16 }}>
            {PACKAGES.map(p => (
              <div key={p.name} style={{ display: 'flex', flexDirection: 'column', borderRadius: 28, background: p.highlight ? t.ink : t.card, border: `1px solid ${p.highlight ? t.ink : t.line}`, overflow: 'hidden' }}>
                <div style={{ padding: '32px 28px 24px', flex: 1 }}>
                  <div style={{ fontSize: 13, color: p.highlight ? t.bandGold : t.gold, marginBottom: 8 }}>{p.tagline}</div>
                  <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.03em', fontSize: 36, lineHeight: 1, color: p.highlight ? t.paper : t.ink }}>{p.name}</div>
                  <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 28, marginTop: 20, color: p.highlight ? t.paper : t.ink }}>{p.price}</div>
                  <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {p.items.map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: p.highlight ? t.bandText : t.body }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.highlight ? t.bandGold : t.gold, flexShrink: 0, display: 'block' }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '0 28px 28px' }}>
                  <button onClick={() => go('contact', { mode: 'inquiry' })} style={{ width: '100%', padding: '14px 0', borderRadius: 999, border: p.highlight ? 'none' : `1px solid ${t.ink}`, background: p.highlight ? t.paper : 'transparent', color: t.ink, fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
                    Поискай оферта
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* How the price is formed + what to compare */}
          <div style={{ marginTop: 'clamp(64px,8vw,112px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 'clamp(32px,4vw,64px)', alignItems: 'start' }}>
            <div>
              <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(32px,3.6vw,52px)', lineHeight: 1 }}>Как се формира цената</h2>
              <p style={{ margin: '24px 0 0', fontSize: 18, fontWeight: 300, lineHeight: 1.65, color: t.body, maxWidth: 560 }}>
                След като ни изпратиш дата, локация и вид събитие, уточняваме програмата и техниката, която е нужна.
              </p>
              <p style={{ margin: '14px 0 0', fontSize: 18, fontWeight: 300, lineHeight: 1.65, color: t.body, maxWidth: 560 }}>
                Офертата покрива цялото събитие - музика, техника, екип и транспорт - така че знаеш точната сума предварително.
              </p>
              <blockquote style={{ margin: '36px 0 0', padding: '4px 0 4px 28px', borderLeft: `3px solid ${t.gold}`, maxWidth: 560 }}>
                <span style={{ display: 'block', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.02em', fontSize: 'clamp(22px,2.2vw,30px)', lineHeight: 1.25, color: t.ink }}>
                  Офертата е за цялото събитие, а не на час - без изненади в края на вечерта.
                </span>
              </blockquote>
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(32px,3.6vw,52px)', lineHeight: 1 }}>Какво да сравниш</h2>
              <ol style={{ listStyle: 'none', margin: '24px 0 0', padding: '4px 28px', borderRadius: 28, background: t.card, border: `1px solid ${t.line}` }}>
                {PRICE_COMPARE.map(([q, a], i) => (
                  <li key={q} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 12, padding: '22px 0', borderTop: i ? `1px solid ${t.line}` : 'none' }}>
                    <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 15, color: t.gold, paddingTop: 3 }}>0{i + 1}</span>
                    <span>
                      <span style={{ display: 'block', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: 20, lineHeight: 1.25 }}>{q}</span>
                      <span style={{ display: 'block', fontSize: 15, fontWeight: 300, lineHeight: 1.55, color: t.body, marginTop: 6 }}>{a}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: 64, borderRadius: 28, padding: 'clamp(32px,5vw,64px)', background: t.ink, color: t.paper, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 'clamp(28px,4vw,48px)', lineHeight: 1.1 }}>
              Точна оферта до<br />един работен ден.
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => go('services')} style={{ padding: '17px 28px', border: `1px solid ${t.bandLine}`, borderRadius: 999, background: 'transparent', color: t.paper, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Виж услугите</button>
              <button onClick={() => go('contact', { mode: 'inquiry' })} style={{ padding: '17px 28px', border: 'none', borderRadius: 999, background: t.paper, color: t.ink, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Получи оферта</button>
            </div>
          </div>
        </section>
      </>)}

      {/* ════════════════════════════════════════════ PRIVACY ═══════════════ */}
      {page === 'privacy' && (
        <section style={{ padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px)' }}>
          <div style={{ maxWidth: 780 }}>
            <Pill>Поверителност</Pill>
            <h1 style={{ margin: '24px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(36px,4.6vw,72px)', lineHeight: 1 }}>
              Политика за поверителност
            </h1>
            <p style={{ margin: '20px 0 0', fontSize: 14, color: t.muted }}>Последна актуализация: 16.10.2026</p>

            {PRIVACY_SECTIONS.map(([heading, body]) => (
              <div key={heading} style={{ marginTop: 40 }}>
                <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.02em', fontSize: 26, lineHeight: 1.15 }}>{heading}</h2>
                {body.map((para, i) => (
                  <p key={i} style={{ margin: '12px 0 0', fontSize: 17, fontWeight: 300, lineHeight: 1.65, color: t.body }}>{para}</p>
                ))}
              </div>
            ))}

            <button onClick={() => go('contact')} className="cv-btn-primary" style={{ marginTop: 48, padding: '15px 26px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 15, cursor: 'pointer', transition: 'background 200ms', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <Icon name="arrowLeft" /> Обратно към формата
            </button>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════ CONTACT ═══════════════ */}
      {page === 'contact' && (
        <section style={{ padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 64, alignItems: 'start' }}>

            {/* Left: info + check date */}
            <div>
              <Pill>Контакти</Pill>
              <h1 style={{ margin: '20px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(52px,7vw,96px)', lineHeight: 1 }}>Запази дата.</h1>
              <p style={{ margin: '24px 0 0', fontSize: 19, fontWeight: 300, lineHeight: 1.55, color: t.body, maxWidth: 440 }}>
                Изпрати ни детайлите и ще отговорим в рамките на един работен ден.
              </p>
              <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 17 }}>
                <a href="mailto:hello@celebrisvibe.com" style={{ color: t.ink }}>hello@celebrisvibe.com</a>
                <a href="tel:+359000000000" style={{ color: t.ink }}>+359 (0) 000 000</a>
              </div>

              {/* Check free date */}
              <div style={{ marginTop: 40, padding: '24px', borderRadius: 20, background: t.card, border: `1px solid ${t.line}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: 22, letterSpacing: '-0.02em' }}>Провери свободна дата</div>
                <div style={{ display: 'flex' }}>
                  <DatePicker value={checkedDate} onChange={checkDate} booked={booked} t={t} placeholder="Избери дата от календара" />
                </div>
                {dateStatus === 'checking' && <div style={{ fontSize: 14, color: t.muted }}>Проверка…</div>}
                <div aria-live="polite">
                  {dateStatus === 'available' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '12px 16px', borderRadius: 12, background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.45)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50', display: 'block', flexShrink: 0 }} />
                      <span style={{ flex: '1 1 200px', fontSize: 15, color: t.ink }}>Датата изглежда <strong>свободна</strong>. Добавихме я във формата - изпрати запитване и ще я потвърдим.</span>
                      <button onClick={() => document.getElementById('cv-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, border: 'none', background: t.ink, color: t.paper, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                        Към формата <Icon name="arrowRight" size={16} />
                      </button>
                    </div>
                  )}
                  {dateStatus === 'taken' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(200,80,60,0.1)', border: '1px solid rgba(200,80,60,0.35)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e57373', display: 'block', flexShrink: 0 }} />
                      <span style={{ fontSize: 15, color: t.ink }}>За съжаление датата е <strong>заета</strong>. Обади ни се - понякога можем да предложим решение.</span>
                    </div>
                  )}
                  {dateStatus === 'unknown' && (
                    <div style={{ padding: '12px 16px', borderRadius: 12, background: t.paper, border: `1px solid ${t.line}`, fontSize: 15, color: t.ink }}>
                      В момента не можем да проверим автоматично. Изпрати запитване или ни се обади на {CONTACT_PHONE} - ще отговорим бързо.
                    </div>
                  )}
                </div>
              </div>

              {/* About mini */}
              <div style={{ marginTop: 56, paddingTop: 40, borderTop: `1px solid ${t.line}` }}>
                <img src={logo} alt="Celebris Vibe" style={{ height: 48, marginBottom: 20 }} />
                <p style={{ margin: 0, fontSize: 17, fontWeight: 300, lineHeight: 1.6, color: t.body, maxWidth: 400 }}>
                  Celebris Vibe е изграден на идеята, че доброто събитие е повече от музика - това е правилната атмосфера в правилния момент. Подхождаме към всяко събитие индивидуално.
                </p>
              </div>
            </div>

            {/* Right: form */}
            <div id="cv-form" style={{ scrollMarginTop: 110 }}>
              {sent ? (
                <div style={{ background: t.card, borderRadius: 28, border: `1px solid ${t.line}` }}>
                  <div style={{ padding: '48px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
                    <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 48, lineHeight: 1.05 }}>{sentTitle}</div>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 300, lineHeight: 1.55, color: t.body, maxWidth: 420 }}>{sentMsg}</p>
                    <button onClick={() => setSent(false)} style={{ marginTop: 8, padding: '12px 22px', borderRadius: 999, border: `1px solid ${t.ink}`, background: 'transparent', color: t.ink, fontSize: 15, cursor: 'pointer' }}>Обратно към формата</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                  {/* Mode toggle */}
                  <div style={{ display: 'flex', padding: 4, border: `1px solid ${t.chip}`, borderRadius: 999, alignSelf: 'flex-start' }}>
                    {(['inquiry', 'call'] as Mode[]).map(k => (
                      <button key={k} onClick={() => setMode(k)} style={{ padding: '10px 20px', borderRadius: 999, border: 'none', background: mode === k ? t.ink : 'transparent', color: mode === k ? t.paper : t.muted, fontSize: 15, cursor: 'pointer' }}>
                        {k === 'inquiry' ? 'Изпрати запитване' : 'Поискай обаждане'}
                      </button>
                    ))}
                  </div>

                  {mode === 'inquiry' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {/* Event type */}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: t.muted, marginBottom: 10 }}>Вид събитие</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {EVENT_TYPE_LABELS.map(l => {
                            const on = eventType === l;
                            return <button key={l} onClick={() => setEventType(l)} style={{ padding: '9px 16px', borderRadius: 999, border: `1px solid ${on ? t.ink : t.chip}`, background: on ? t.ink : 'transparent', color: on ? t.paper : t.ink, fontSize: 14, cursor: 'pointer' }}>{l}</button>;
                          })}
                        </div>
                      </div>
                      {/* Name + Phone + Email */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
                        {[['Име *', name, setName, 'text', 'Твоето име'], ['Телефон *', phone, setPhone, 'tel', '+359…'], ['Имейл', email, setEmail, 'email', 'ти@имейл.com']].map(([label, val, setter, type, ph]) => (
                          <label key={label as string} style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                            {label as string}
                            <input value={val as string} onChange={e => (setter as any)(e.target.value)} type={type as string} maxLength={type === 'email' ? 120 : type === 'tel' ? 30 : 80} placeholder={ph as string} style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '13px 15px', outline: 'none' }} />
                          </label>
                        ))}
                      </div>
                      {/* Date + Location + Guests */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                          Дата на събитието
                          <DatePicker value={date} onChange={setDate} booked={booked} t={t} />
                        </div>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                          Локация / Зала
                          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="София, зала…" maxLength={120} style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '13px 15px', outline: 'none' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                          Гости
                          <select value={guests} onChange={e => setGuests(e.target.value)} style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: guests ? t.ink : t.muted, fontSize: 16, padding: '13px 15px', outline: 'none' }}>
                            <option value="">Избери…</option>
                            <option>До 50</option>
                            <option>50 – 150</option>
                            <option>150 – 300</option>
                            <option>300+</option>
                          </select>
                        </label>
                      </div>
                      {/* What do you need - checkboxes */}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: t.muted, marginBottom: 10 }}>Какво ти трябва?</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {SERVICE_CHECKBOXES.map(s => {
                            const on = services.includes(s);
                            return (
                              <button key={s} onClick={() => toggleService(s)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 999, border: `1px solid ${on ? t.ink : t.chip}`, background: on ? t.ink : 'transparent', color: on ? t.paper : t.ink, fontSize: 14, cursor: 'pointer' }}>
                                <span style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${on ? t.paper : t.chip}`, background: on ? t.paper : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  {on && <span style={{ width: 6, height: 6, background: t.ink, borderRadius: 1, display: 'block' }} />}
                                </span>
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* Note */}
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                        Допълнителна информация
                        <textarea rows={3} maxLength={2000} value={note} onChange={e => setNote(e.target.value)} placeholder="Идеи за зала, музикални предпочитания, бюджет…" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '13px 15px', outline: 'none', resize: 'vertical', fontFamily: "'Jost',sans-serif" }} />
                      </label>
                    </div>
                  )}

                  {mode === 'call' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                          Име *
                          <input value={name} onChange={e => setName(e.target.value)} placeholder="Твоето име" maxLength={80} style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '13px 15px', outline: 'none' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                          Телефон *
                          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} maxLength={30} placeholder="+359…" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '13px 15px', outline: 'none' }} />
                        </label>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: t.muted, marginBottom: 10 }}>Най-добро време за обаждане</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {['Сутринта', 'Следобед', 'Вечерта'].map(l => {
                            const on = time === l;
                            return <button key={l} onClick={() => setTime(l)} style={{ padding: '10px 18px', borderRadius: 999, border: `1px solid ${on ? t.ink : t.chip}`, background: on ? t.ink : 'transparent', color: on ? t.paper : t.ink, fontSize: 15, cursor: 'pointer' }}>{l}</button>;
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Honeypots: invisible to people, bots fill them in */}
                  <div aria-hidden="true" style={{ position: 'absolute', left: -10000, width: 1, height: 1, overflow: 'hidden' }}>
                    <input type="checkbox" name="botcheck" tabIndex={-1} checked={botcheck} onChange={e => setBotcheck(e.target.checked)} />
                    <input type="text" name="company_website" tabIndex={-1} autoComplete="off" value={trap} onChange={e => setTrap(e.target.value)} />
                  </div>

                  {/* Consent */}
                  <div style={{ padding: '18px 20px', borderRadius: 16, background: t.card, border: `1px solid ${t.line}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 15, lineHeight: 1.5, color: t.ink, cursor: 'pointer' }}>
                      <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0, accentColor: t.gold, cursor: 'pointer' }} />
                      <span>
                        Запознах се с{' '}
                        <a href="#privacy" onClick={e => { e.preventDefault(); go('privacy'); }} style={{ color: t.gold, textDecoration: 'underline', textUnderlineOffset: 3 }}>Политиката за поверителност</a>
                        {' '}и съм съгласен данните ми да бъдат използвани, за да получа отговор и оферта. *
                      </span>
                    </label>
                    <div style={{ fontSize: 13, color: t.muted, lineHeight: 1.5, paddingLeft: 32 }}>
                      Използваме данните само за отговор на запитването. Не ги споделяме и не изпращаме реклама.
                    </div>
                  </div>

                  {formError && (
                    <div role="alert" style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(200,80,60,0.1)', border: '1px solid rgba(200,80,60,0.35)', fontSize: 15, color: t.ink }}>
                      {formError}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <button onClick={submitForm} disabled={sending} className={sending ? undefined : 'cv-btn-primary'} style={{ padding: '17px 30px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 16, cursor: sending ? 'wait' : 'pointer', opacity: sending ? 0.6 : 1, transition: 'background 200ms' }}>
                      {sending ? 'Изпращане…' : mode === 'call' ? 'Поискай обаждане' : 'Изпрати запитване'}
                    </button>
                    <span style={{ fontSize: 13, color: t.muted }}>* задължителни полета</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ padding: '56px clamp(20px,4vw,64px) 32px', borderTop: `1px solid ${t.line}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <img src={logo} alt="Celebris Vibe" style={{ height: 100 }} />
          <div style={{ display: 'flex', gap: '4px 8px', flexWrap: 'wrap', maxWidth: 480 }}>
            {PAGES.map(([k, label]) => (
              <button key={k} onClick={() => go(k)} aria-current={page === k ? 'page' : undefined} className="cv-navlink" style={{ background: 'none', border: 'none', color: page === k ? t.ink : t.body, cursor: 'pointer', padding: '6px 10px', fontSize: 15, textDecoration: page === k ? 'underline' : 'none', textDecorationColor: t.gold, textDecorationThickness: 2, textUnderlineOffset: 7, fontWeight: page === k ? 600 : 400 }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginTop: 40, fontSize: 14, color: t.muted }}>
          <div style={{ display: 'flex', gap: '6px 20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span>© 2026 Celebris Vibe · Създаваме Вайб, Честваме Живота.</span>
            <a href="#privacy" onClick={e => { e.preventDefault(); go('privacy'); }} style={{ color: t.muted, textDecoration: 'underline', textUnderlineOffset: 3 }}>Политика за поверителност</a>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="cv-social" style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${t.edge}`, color: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 200ms, border-color 200ms' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
              </svg>
            </a>
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="cv-social" style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${t.edge}`, color: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 200ms, border-color 200ms' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.25-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
