import React, { useState, useEffect, useRef, type CSSProperties } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const CONTACT_URL = 'https://dtapplications.github.io/celebrisvibe/#contact';

// ─── Types ────────────────────────────────────────────────────────────────────

type Page = 'home' | 'services' | 'packages' | 'contact';
type Mode = 'inquiry' | 'call';

interface Theme {
  paper: string; headerBg: string; ink: string; card: string; line: string;
  chip: string; field: string; s1: string; s2: string; body: string;
  muted: string; faint: string; gold: string; frame: string;
  bandLine: string; bandText: string; bandGold: string;
  bandS1: string; bandS2: string; bandActive: string;
  logo: string; dot: string;
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────

const LIGHT: Theme = {
  paper: '#f2f1ec', headerBg: 'rgba(242,241,236,0.92)', ink: '#1b1d22',
  card: '#fbfaf7', line: '#dad8d0', chip: '#c9c7be', field: '#b9b7ae',
  s1: '#e4e2da', s2: '#ebe9e2', body: '#3e4048', muted: '#5d6068',
  faint: '#7b7d84', gold: '#8a6d3b', frame: '#c9ad78',
  bandLine: '#4a4c54', bandText: '#c4c5ca', bandGold: '#c9ad78',
  bandS1: '#26282e', bandS2: '#2d2f36', bandActive: '#2a2c33',
  logo: 'none', dot: 'transparent',
};

const DARK: Theme = {
  paper: '#121317', headerBg: 'rgba(18,19,23,0.92)', ink: '#eceae3',
  card: '#1a1c21', line: '#2c2e35', chip: '#3e4048', field: '#4a4c54',
  s1: '#1c1e23', s2: '#212329', body: '#c4c5ca', muted: '#9a9ca3',
  faint: '#74767d', gold: '#c9ad78', frame: '#8a6d3b',
  bandLine: '#c9c7be', bandText: '#3e4048', bandGold: '#8a6d3b',
  bandS1: '#d8d6ce', bandS2: '#e0ded7', bandActive: '#ffffff',
  logo: 'invert(1)', dot: '#eceae3',
};

// ─── Static data ──────────────────────────────────────────────────────────────

const EVENT_TYPES = [
  {
    key: 'private',
    title: 'Частни събития',
    subtitle: 'Рождени дни · Годишнини · Партита',
    desc: 'Подбираме музиката и атмосферата спрямо гостите и характера на събитието.',
    tags: ['DJ', 'MC', 'Озвучаване', 'Осветление'],
  },
  {
    key: 'wedding',
    title: 'Сватби',
    subtitle: 'Музика, водене и координация през цялата вечер',
    desc: 'Потвърждаваме музикалните предпочитания, програмата и ключовите моменти предварително, за да протече вечерта естествено.',
    tags: ['DJ', 'MC', 'Озвучаване', 'Осветление'],
  },
  {
    key: 'corporate',
    title: 'Корпоративни събития',
    subtitle: 'Конференции · Лансирания · Тиймбилдинги',
    desc: 'Професионално техническо и музикално осигуряване за фирмени партита, презентации, конференции, тиймбилдинги, лансирания, коктейли и семинари.',
    tags: ['DJ', 'MC', 'Озвучаване', 'Безжични микрофони', 'Фонова музика'],
  },
];

const SERVICES = [
  {
    title: 'DJ & MC',
    desc: 'Музика, подбрана за публиката и момента. При необходимост услугата включва професионално водене — представяне на ключови моменти, игри, речи и координация с останалите участници в събитието.',
    icon: '🎧',
  },
  {
    title: 'Озвучаване',
    desc: 'Професионално озвучаване за частни и корпоративни събития. Оборудване, подбрано спрямо вида събитие, размера на залата, брой гости, нужди от микрофони, презентации и музикалната програма.',
    icon: '🔊',
  },
  {
    title: 'Осветление',
    desc: 'Парти и декоративно осветление за по-добра атмосфера и завършен вид. Подбрано спрямо залата, формата и характера на събитието.',
    icon: '✦',
  },
];

const EXTRAS = [
  { title: 'Фотокабина', desc: 'Моментален спомен за всеки гост.' },
  { title: 'Изпълнители и музиканти', desc: 'Живи изпълнения, подходящи за събитието.' },
  { title: 'Специални ефекти', desc: 'Мъгла, CO₂ струи, конфети топове.' },
  { title: 'Допълнително осветление', desc: 'Допълнителни инсталации за по-големи или сложни зали.' },
  { title: 'Фотография и видео', desc: 'Пълно покритие чрез нашата партньорска мрежа.' },
  { title: 'Друго', desc: 'Кажете ни какво ви трябва — ще намерим начин.' },
];

const PACKAGES = [
  {
    name: 'DJ',
    tagline: 'Само музика',
    price: 'От €—',
    items: ['Подготовка на музиката', 'DJ програма', 'Монтаж на оборудването'],
    highlight: false,
  },
  {
    name: 'DJ + Озвучаване',
    tagline: 'Музика + професионално аудио',
    price: 'От €—',
    items: ['DJ програма', 'Професионална звукова система', 'Съобразено със залата и брой гости'],
    highlight: true,
  },
  {
    name: 'Пълен Вайб',
    tagline: 'Пълното изживяване',
    price: 'От €—',
    items: ['DJ', 'MC / Водещ', 'Звукова система', 'Осветление', 'Подготовка на програма и координация'],
    highlight: false,
  },
];

const HOW_IT_WORKS = [
  { n: '01', title: 'Изпрати запитване', desc: 'Кажи ни датата, залата и вида събитие.' },
  { n: '02', title: 'Уточняваме детайлите', desc: 'Обсъждаме програмата, музиката, гостите и техническите изисквания.' },
  { n: '03', title: 'Получаваш оферта', desc: 'Предлагаме най-подходящия вариант за твоето събитие.' },
  { n: '04', title: 'Подготвяме всичко', desc: 'Музика, оборудване, програма и координация.' },
  { n: '05', title: 'Наслаждавай се', desc: 'Ние се грижим за атмосферата.' },
];

// A handful of demo booked dates (YYYY-MM-DD). Replace with real data later.
const BOOKED_DATES = new Set([
  '2026-11-01', '2026-11-08', '2026-11-15',
  '2026-12-06', '2026-12-13', '2026-12-20', '2026-12-31',
  '2027-01-10', '2027-02-14',
]);

const EVENT_TYPE_LABELS = ['Частно събитие', 'Сватба', 'Корпоративно', 'Презентация', 'Друго'];
const SERVICE_CHECKBOXES = ['DJ', 'MC / Водещ', 'Озвучаване', 'Осветление', 'Пълен пакет', 'Друго'];

const PAGES: [Page, string][] = [
  ['home', 'Начало'], ['services', 'Услуги'], ['packages', 'Пакети'], ['contact', 'Контакт'],
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function App({ base = '/' }: { base?: string }) {
  const [isDark, setIsDark]       = useState(false);
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
  const [checkedDate, setCheckedDate] = useState('');
  const [dateStatus, setDateStatus]   = useState<'idle' | 'available' | 'taken'>('idle');

  const t = isDark ? DARK : LIGHT;
  const logo = `${base}assets/celebris-logo.png`;

  // Hash routing
  useEffect(() => {
    const hash = window.location.hash.slice(1) as Page;
    const valid: Page[] = ['home', 'services', 'packages', 'contact'];
    if (valid.includes(hash)) setPage(hash);
  }, []);

  const go = (p: Page, extra?: { mode?: Mode }) => {
    setPage(p);
    if (extra?.mode !== undefined) setMode(extra.mode);
    if (extra) setSent(false);
    window.history.replaceState(null, '', p === 'home' ? window.location.pathname : `#${p}`);
    window.scrollTo(0, 0);
  };

  const toggleService = (s: string) =>
    setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const checkDate = () => {
    if (!checkedDate) return;
    setDateStatus(BOOKED_DATES.has(checkedDate) ? 'taken' : 'available');
  };

  const grad = `repeating-linear-gradient(135deg,${t.s1} 0 12px,${t.s2} 12px 24px)`;
  const cssVars = { '--cv-gold': t.gold, '--cv-ink': t.ink, '--cv-paper': t.paper } as CSSProperties;

  const who = name ? `, ${name}` : '';
  const sentTitle = mode === 'call' ? 'Обаждането е записано' : 'Запитването е изпратено';
  const sentMsg   = mode === 'call'
    ? `Благодарим ти${who}. Ще те потърсим ${time.toLowerCase()} или на следващия работен ден.`
    : `Благодарим ти${who}. Ще се свържем с теб в рамките на един работен ден за твоето ${eventType.toLowerCase()}.`;

  // ── Pill badge ────────────────────────────────────────────────────────────
  const Pill = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px 7px 10px', borderRadius: 999, background: t.card, border: `1px solid ${t.line}`, fontSize: 14, fontWeight: 500, color: t.ink }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.gold, display: 'block', flexShrink: 0 }} />
      {children}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: t.paper, color: t.ink, overflowX: 'hidden', ...cssVars }}>

      {/* ── HEADER ── */}
      <header style={{ position: 'sticky', top: 12, zIndex: 30, margin: '12px clamp(12px,2vw,24px) 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 8px 8px 18px', background: t.headerBg, backdropFilter: 'blur(14px)', border: `1px solid ${t.line}`, borderRadius: 999, flexWrap: 'nowrap' }}>
        <button onClick={() => go('home')} style={{ flex: 'none', display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: t.ink, cursor: 'pointer', padding: 0 }}>
          <img src={logo} alt="Celebris Vibe" style={{ height: 42, filter: t.logo }} />
        </button>

        <nav style={{ display: 'flex', gap: 2, flexWrap: 'nowrap', flex: '1 1 auto', minWidth: 0, overflowX: 'auto', justifyContent: 'center', scrollbarWidth: 'none' } as CSSProperties}>
          {PAGES.slice(1).map(([k, label]) => (
            <button key={k} onClick={() => go(k)} style={{ background: page === k ? t.card : 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flex: 'none', padding: '8px 11px', borderRadius: 999, fontSize: 15, color: page === k ? t.ink : t.muted, transition: 'background 200ms' }}>
              {label}
            </button>
          ))}
        </nav>

        <button onClick={() => setIsDark(d => !d)} aria-label="Toggle theme" style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, border: `1px solid ${t.chip}`, borderRadius: 999, background: 'transparent', cursor: 'pointer' }}>
          <span style={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${t.ink}`, background: t.dot, display: 'block' }} />
        </button>

        <button onClick={() => go('contact', { mode: 'inquiry' })} className="cv-btn-primary" style={{ flex: 'none', whiteSpace: 'nowrap', padding: '12px 22px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 15, cursor: 'pointer', transition: 'background 200ms' }}>
          Запази дата
        </button>
      </header>

      {/* ════════════════════════════════════════════ HOME ══════════════════ */}
      {page === 'home' && (
        <>
          {/* Hero */}
          <section style={{ padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px) clamp(56px,7vw,96px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,460px),1fr))', gap: 'clamp(40px,5vw,80px)', alignItems: 'center' }}>
            <div>
              <Pill>DJ · MC · Озвучаване · Осветление</Pill>
              <h1 style={{ margin: '24px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(56px,7.6vw,124px)', lineHeight: 0.95, textWrap: 'balance' as any }}>
                Създаваме Вайб, Честваме Живота.
              </h1>
              <p style={{ margin: '32px 0 0', fontSize: 20, fontWeight: 300, lineHeight: 1.55, maxWidth: 500, color: t.body }}>
                DJ, MC, озвучаване и техническа продукция за твоето събитие. Частни тържества, сватби и корпоративни поводи.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
                <button onClick={() => go('contact')} className="cv-btn-primary" style={{ padding: '17px 28px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 16, cursor: 'pointer', transition: 'background 200ms' }}>
                  Провери свободна дата
                </button>
                <button onClick={() => go('services')} style={{ padding: '17px 28px', border: `1px solid ${t.ink}`, borderRadius: 999, background: 'transparent', color: t.ink, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>
                  Виж услугите
                </button>
              </div>
            </div>
            <div style={{ position: 'relative', width: 'min(100%,520px)', aspectRatio: '1', justifySelf: 'center' }}>
              <div style={{ position: 'absolute', inset: '9%', borderRadius: '50%', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 12, color: t.faint }}>снимка: атмосфера на събитие</span>
              </div>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', animation: 'cvspin 90s linear infinite' }}>
                <img src={logo} alt="" style={{ position: 'absolute', width: '273%', left: '-86.8%', top: '-72.2%', maxWidth: 'none', filter: t.logo }} />
              </div>
              <button onClick={() => go('contact')} style={{ position: 'absolute', right: -4, bottom: '6%', padding: '16px 20px', background: t.paper, border: `1px solid ${t.line}`, borderRadius: 20, boxShadow: '0 24px 48px -24px rgba(0,0,0,0.35)', textAlign: 'left', cursor: 'pointer', color: t.ink }}>
                <div style={{ fontSize: 11, color: t.gold }}>Провери наличност</div>
                <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 20, marginTop: 4 }}>Датата ти свободна ли е?</div>
                <div style={{ fontSize: 14, color: t.muted, marginTop: 2 }}>Провери за секунди →</div>
              </button>
            </div>
          </section>

          {/* 3 event types */}
          <section style={{ padding: '0 clamp(20px,4vw,64px) clamp(64px,8vw,112px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 36 }}>
              <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(40px,5.6vw,72px)', lineHeight: 1 }}>Избери своето събитие</h2>
              <button onClick={() => go('services')} style={{ background: 'none', border: 'none', borderBottom: `1px solid ${t.ink}`, padding: '4px 0', color: t.ink, fontSize: 16, cursor: 'pointer' }}>Всички услуги</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 16 }}>
              {EVENT_TYPES.map(e => (
                <button key={e.key} onClick={() => go('contact', { mode: 'inquiry' })} className="cv-card" style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 260, padding: 28, borderRadius: 28, background: t.card, border: `1px solid ${t.line}`, color: t.ink, textAlign: 'left', cursor: 'pointer', transition: 'transform 300ms,box-shadow 300ms' }}>
                  <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 30, lineHeight: 1.05 }}>{e.title}</span>
                  <span style={{ fontSize: 14, color: t.gold }}>{e.subtitle}</span>
                  <span style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.5, color: t.body, flex: 1 }}>{e.desc}</span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                    {e.tags.map(tag => <span key={tag} style={{ fontSize: 13, padding: '5px 12px', border: `1px solid ${t.chip}`, borderRadius: 999, color: t.muted }}>{tag}</span>)}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section style={{ padding: '0 clamp(12px,2vw,24px) clamp(64px,8vw,112px)' }}>
            <div style={{ borderRadius: 40, background: t.ink, color: t.paper, padding: 'clamp(28px,4.5vw,64px)' }}>
              <div style={{ marginBottom: 48 }}>
                <div style={{ fontSize: 15, color: t.bandGold, marginBottom: 12 }}>Просто и ясно</div>
                <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(40px,5.6vw,72px)', lineHeight: 0.95 }}>Как работим</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,200px),1fr))', gap: 24 }}>
                {HOW_IT_WORKS.map((step, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '24px 20px', borderRadius: 24, border: `1px solid ${t.bandLine}`, background: i === 0 ? t.bandActive : 'transparent' }}>
                    <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 32, color: t.bandGold, lineHeight: 1 }}>{step.n}</span>
                    <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: 20, lineHeight: 1.1 }}>{step.title}</span>
                    <span style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.5, color: t.bandText }}>{step.desc}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => go('contact')} style={{ padding: '17px 32px', border: 'none', borderRadius: 999, background: t.paper, color: t.ink, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>
                  Получи персонална оферта
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════════════════════════════ SERVICES ══════════════ */}
      {page === 'services' && (
        <section style={{ padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px)' }}>
          <Pill>Какво предлагаме</Pill>
          <h1 style={{ margin: '20px 0 64px', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(56px,8vw,112px)', lineHeight: 1, maxWidth: 1000, textWrap: 'balance' as any }}>
            Ти се наслаждаваш. Ние се грижим за останалото.
          </h1>

          {/* Main services */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SERVICES.map(s => (
              <div key={s.title} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: '20px 56px', padding: 'clamp(24px,3vw,40px)', borderRadius: 28, background: t.card, border: `1px solid ${t.line}` }}>
                <div>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 'clamp(32px,3.6vw,48px)', lineHeight: 1.05 }}>{s.title}</div>
                </div>
                <div style={{ fontSize: 19, fontWeight: 300, lineHeight: 1.6, color: t.body, display: 'flex', alignItems: 'center' }}>{s.desc}</div>
              </div>
            ))}
          </div>

          {/* Extras */}
          <div style={{ marginTop: 64 }}>
            <h2 style={{ margin: '0 0 8px', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.03em', fontSize: 'clamp(32px,4vw,52px)', lineHeight: 1 }}>Допълнителни опции</h2>
            <p style={{ margin: '0 0 36px', fontSize: 17, fontWeight: 300, color: t.body }}>Налични чрез нашата партньорска мрежа при нужда.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,260px),1fr))', gap: 12 }}>
              {EXTRAS.map(e => (
                <div key={e.title} style={{ padding: '20px 24px', borderRadius: 20, background: t.card, border: `1px solid ${t.line}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: 20 }}>{e.title}</div>
                  <div style={{ fontSize: 15, fontWeight: 300, color: t.body }}>{e.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: 64, borderRadius: 28, padding: 'clamp(32px,5vw,64px)', background: t.ink, color: t.paper, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 'clamp(28px,4vw,48px)', lineHeight: 1.1 }}>
              Първото обаждане е безплатно<br />и отнема 20 минути.
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => go('packages')} style={{ padding: '17px 28px', border: `1px solid rgba(255,255,255,0.25)`, borderRadius: 999, background: 'transparent', color: t.paper, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Виж пакетите</button>
              <button onClick={() => go('contact', { mode: 'call' })} style={{ padding: '17px 28px', border: 'none', borderRadius: 999, background: t.paper, color: t.ink, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Поискай обаждане</button>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════ PACKAGES ══════════════ */}
      {page === 'packages' && (
        <section style={{ padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px)' }}>
          <Pill>Цени</Pill>
          <h1 style={{ margin: '20px 0 16px', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(56px,8vw,112px)', lineHeight: 1 }}>Пакети</h1>
          <p style={{ margin: '0 0 64px', fontSize: 19, fontWeight: 300, color: t.body, maxWidth: 560 }}>
            Всяко събитие е различно. Крайната цена зависи от продължителността, локацията, броя гости и необходимото оборудване.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: 16 }}>
            {PACKAGES.map(p => (
              <div key={p.name} style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 28, background: p.highlight ? t.ink : t.card, border: `1px solid ${p.highlight ? t.ink : t.line}`, overflow: 'hidden' }}>
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
                  <button onClick={() => go('contact', { mode: 'inquiry' })} style={{ width: '100%', padding: '14px 0', borderRadius: 999, border: p.highlight ? 'none' : `1px solid ${t.ink}`, background: p.highlight ? t.paper : 'transparent', color: p.highlight ? t.ink : t.ink, fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
                    Поискай този пакет
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40, padding: 'clamp(24px,3vw,40px)', borderRadius: 28, background: t.card, border: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: 26, letterSpacing: '-0.02em' }}>Търсиш нещо по-специфично?</div>
              <div style={{ fontSize: 16, fontWeight: 300, color: t.body, marginTop: 4 }}>Разкажи ни за събитието си и ще изготвим персонална оферта.</div>
            </div>
            <button onClick={() => go('contact', { mode: 'inquiry' })} className="cv-btn-primary" style={{ padding: '14px 26px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 15, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 200ms' }}>
              Получи персонална оферта
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
              <Pill>Контакт</Pill>
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
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    type="date"
                    value={checkedDate}
                    onChange={e => { setCheckedDate(e.target.value); setDateStatus('idle'); }}
                    style={{ flex: 1, minWidth: 160, background: t.paper, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '12px 14px', outline: 'none' }}
                  />
                  <button onClick={checkDate} className="cv-btn-primary" style={{ padding: '12px 20px', border: 'none', borderRadius: 12, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 15, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 200ms' }}>
                    Провери
                  </button>
                </div>
                {dateStatus === 'available' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(138,109,59,0.12)', border: `1px solid ${t.gold}` }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50', display: 'block', flexShrink: 0 }} />
                    <span style={{ fontSize: 15, color: t.ink }}>Тази дата изглежда <strong>свободна</strong> — попълни формата, за да я запазиш.</span>
                  </div>
                )}
                {dateStatus === 'taken' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(200,80,60,0.1)', border: '1px solid rgba(200,80,60,0.3)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e57373', display: 'block', flexShrink: 0 }} />
                    <span style={{ fontSize: 15, color: t.ink }}>Тази дата може да е заета — свържи се с нас за потвърждение.</span>
                  </div>
                )}
              </div>

              {/* QR badge */}
              <div style={{ marginTop: 40, display: 'inline-flex', alignItems: 'center', gap: 20, padding: '16px 20px 16px 16px', borderRadius: 20, background: t.card, border: `1px solid ${t.line}` }}>
                <div style={{ padding: 8, background: '#fff', borderRadius: 12 }}>
                  <QRCodeSVG value={CONTACT_URL} size={72} bgColor="#ffffff" fgColor="#1b1d22" level="M" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: t.muted }}>Сканирай, за да отвориш формата</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: t.ink }}>Подходящо за визитки</div>
                  <a href={`${base}qr`} style={{ marginTop: 4, fontSize: 13, color: t.gold, textDecoration: 'underline', textUnderlineOffset: 3 }}>Вземи QR за печат →</a>
                </div>
              </div>

              {/* About mini */}
              <div style={{ marginTop: 56, paddingTop: 40, borderTop: `1px solid ${t.line}` }}>
                <img src={logo} alt="Celebris Vibe" style={{ height: 48, filter: t.logo, marginBottom: 20 }} />
                <p style={{ margin: 0, fontSize: 17, fontWeight: 300, lineHeight: 1.6, color: t.body, maxWidth: 400 }}>
                  Celebris Vibe е изграден на идеята, че доброто събитие е повече от музика — това е правилната атмосфера в правилния момент. Подхождаме към всяко събитие индивидуално.
                </p>
              </div>
            </div>

            {/* Right: form */}
            <div>
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
                        {[['Имe', name, setName, 'text', 'Твоето ime'], ['Телефон', phone, setPhone, 'tel', '+359…'], ['Имейл', email, setEmail, 'email', 'ти@имейл.com']].map(([label, val, setter, type, ph]) => (
                          <label key={label as string} style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                            {label as string}
                            <input value={val as string} onChange={e => (setter as any)(e.target.value)} type={type as string} placeholder={ph as string} style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '13px 15px', outline: 'none' }} />
                          </label>
                        ))}
                      </div>
                      {/* Date + Location + Guests */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                          Дата на събитието
                          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '13px 15px', outline: 'none' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                          Локация / Зала
                          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="София, зала…" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '13px 15px', outline: 'none' }} />
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
                      {/* What do you need — checkboxes */}
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
                        <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Идеи за зала, музикални предпочитания, бюджет…" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '13px 15px', outline: 'none', resize: 'vertical', fontFamily: "'Jost',sans-serif" }} />
                      </label>
                      <button onClick={() => setSent(true)} className="cv-btn-primary" style={{ alignSelf: 'flex-start', padding: '17px 30px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 16, cursor: 'pointer', transition: 'background 200ms' }}>
                        Изпрати запитване
                      </button>
                    </div>
                  )}

                  {mode === 'call' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                          Имe
                          <input value={name} onChange={e => setName(e.target.value)} placeholder="Твоето ime" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '13px 15px', outline: 'none' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                          Телефон
                          <input type="tel" placeholder="+359…" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '13px 15px', outline: 'none' }} />
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
                      <button onClick={() => setSent(true)} className="cv-btn-primary" style={{ alignSelf: 'flex-start', padding: '17px 30px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 16, cursor: 'pointer', transition: 'background 200ms' }}>
                        Поискай обаждане
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ padding: '56px clamp(20px,4vw,64px) 32px', borderTop: `1px solid ${t.line}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <img src={logo} alt="Celebris Vibe" style={{ height: 100, filter: t.logo }} />
          <div style={{ display: 'flex', gap: '4px 8px', flexWrap: 'wrap', maxWidth: 480 }}>
            {PAGES.map(([k, label]) => (
              <button key={k} onClick={() => go(k)} style={{ background: 'none', border: 'none', color: t.body, cursor: 'pointer', padding: '6px 10px', fontSize: 15 }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginTop: 40, fontSize: 14, color: t.muted }}>
          <div>© 2026 Celebris Vibe · Създаваме Вайб, Честваме Живота.</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="#" style={{ color: t.muted }}>Instagram</a>
            <a href="#" style={{ color: t.muted }}>Facebook</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
