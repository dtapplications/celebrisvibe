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
    title: 'Private Events',
    subtitle: 'Birthdays · Anniversaries · Parties',
    desc: 'We match the music and atmosphere to your guests and the character of the event.',
    tags: ['DJ', 'MC', 'Sound', 'Lighting'],
  },
  {
    key: 'wedding',
    title: 'Weddings',
    subtitle: 'Music, hosting and coordination all evening',
    desc: 'We confirm musical preferences, the programme, and key moments in advance so the evening flows naturally.',
    tags: ['DJ', 'MC', 'Sound', 'Lighting'],
  },
  {
    key: 'corporate',
    title: 'Corporate Events',
    subtitle: 'Conferences · Launches · Team events',
    desc: 'Professional technical and musical provision for company parties, presentations, conferences, team-builds, product launches, cocktail events and seminars.',
    tags: ['DJ', 'MC', 'Sound', 'Wireless mics', 'Background music'],
  },
];

const SERVICES = [
  {
    title: 'DJ & MC',
    desc: 'Music tailored to the audience and the moment. Where needed, the service includes professional hosting — presenting key moments, games, speeches and coordination with other event participants.',
    icon: '🎧',
  },
  {
    title: 'Sound',
    desc: 'Professional sound for private and corporate events. Equipment matched to event type, venue size, guest count, microphone needs, presentations and the music programme.',
    icon: '🔊',
  },
  {
    title: 'Lighting',
    desc: 'Party and decorative lighting for a better atmosphere and a finished look. Selected to suit the venue, format and character of the event.',
    icon: '✦',
  },
];

const EXTRAS = [
  { title: 'Photo Booth', desc: 'An instant keepsake for every guest.' },
  { title: 'Performers & Musicians', desc: 'Live acts matched to your event.' },
  { title: 'Special Effects', desc: 'Fog, CO₂ jets, confetti cannons.' },
  { title: 'Additional Lighting', desc: 'Extra rigs for larger or complex venues.' },
  { title: 'Photography & Video', desc: 'Full coverage through our partner network.' },
  { title: 'Other', desc: 'Tell us what you need — we\'ll find a way.' },
];

const PACKAGES = [
  {
    name: 'DJ',
    tagline: 'Music only',
    price: 'From €—',
    items: ['Music preparation', 'DJ programme', 'Equipment setup'],
    highlight: false,
  },
  {
    name: 'DJ + Sound',
    tagline: 'Music + professional audio',
    price: 'From €—',
    items: ['DJ programme', 'Professional sound system', 'Matched to venue & guest count'],
    highlight: true,
  },
  {
    name: 'Complete Vibe',
    tagline: 'The full experience',
    price: 'From €—',
    items: ['DJ', 'MC / Host', 'Sound system', 'Lighting', 'Programme prep & coordination'],
    highlight: false,
  },
];

const HOW_IT_WORKS = [
  { n: '01', title: 'Send an enquiry', desc: 'Tell us the date, venue and type of event.' },
  { n: '02', title: 'Clarify the details', desc: 'We discuss the programme, music, guests and technical requirements.' },
  { n: '03', title: 'Receive an offer', desc: 'We propose the best option for your event.' },
  { n: '04', title: 'We prepare everything', desc: 'Music, equipment, programme and coordination.' },
  { n: '05', title: 'Enjoy the event', desc: 'We take care of the atmosphere.' },
];

// A handful of demo booked dates (YYYY-MM-DD). Replace with real data later.
const BOOKED_DATES = new Set([
  '2026-11-01', '2026-11-08', '2026-11-15',
  '2026-12-06', '2026-12-13', '2026-12-20', '2026-12-31',
  '2027-01-10', '2027-02-14',
]);

const EVENT_TYPE_LABELS = ['Private event', 'Wedding', 'Corporate', 'Presentation', 'Other'];
const SERVICE_CHECKBOXES = ['DJ', 'MC / Host', 'Sound', 'Lighting', 'Complete package', 'Other'];

const PAGES: [Page, string][] = [
  ['home', 'Home'], ['services', 'Services'], ['packages', 'Packages'], ['contact', 'Contact'],
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function App({ base = '/' }: { base?: string }) {
  const [isDark, setIsDark]       = useState(false);
  const [page, setPage]           = useState<Page>('home');
  const [mode, setMode]           = useState<Mode>('inquiry');
  const [eventType, setEventType] = useState('Wedding');
  const [services, setServices]   = useState<string[]>([]);
  const [time, setTime]           = useState('Afternoon');
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
  const sentTitle = mode === 'call' ? 'Call booked' : 'Inquiry sent';
  const sentMsg   = mode === 'call'
    ? `Thank you${who}. We'll call you this ${time.toLowerCase()} or the next working day.`
    : `Thank you${who}. We'll be in touch within one working day about your ${eventType.toLowerCase()}.`;

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
          Book a date
        </button>
      </header>

      {/* ════════════════════════════════════════════ HOME ══════════════════ */}
      {page === 'home' && (
        <>
          {/* Hero */}
          <section style={{ padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px) clamp(56px,7vw,96px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,460px),1fr))', gap: 'clamp(40px,5vw,80px)', alignItems: 'center' }}>
            <div>
              <Pill>DJ · MC · Sound · Lighting</Pill>
              <h1 style={{ margin: '24px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(56px,7.6vw,124px)', lineHeight: 0.95, textWrap: 'balance' as any }}>
                Creating Vibes, Celebrating Life.
              </h1>
              <p style={{ margin: '32px 0 0', fontSize: 20, fontWeight: 300, lineHeight: 1.55, maxWidth: 500, color: t.body }}>
                DJ, MC, sound and technical production for your event. Private celebrations, weddings and corporate occasions.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
                <button onClick={() => go('contact')} className="cv-btn-primary" style={{ padding: '17px 28px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 16, cursor: 'pointer', transition: 'background 200ms' }}>
                  Check available date
                </button>
                <button onClick={() => go('services')} style={{ padding: '17px 28px', border: `1px solid ${t.ink}`, borderRadius: 999, background: 'transparent', color: t.ink, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>
                  See services
                </button>
              </div>
            </div>
            <div style={{ position: 'relative', width: 'min(100%,520px)', aspectRatio: '1', justifySelf: 'center' }}>
              <div style={{ position: 'absolute', inset: '9%', borderRadius: '50%', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 12, color: t.faint }}>photo: event atmosphere</span>
              </div>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', animation: 'cvspin 90s linear infinite' }}>
                <img src={logo} alt="" style={{ position: 'absolute', width: '273%', left: '-86.8%', top: '-72.2%', maxWidth: 'none', filter: t.logo }} />
              </div>
              <button onClick={() => go('contact')} style={{ position: 'absolute', right: -4, bottom: '6%', padding: '16px 20px', background: t.paper, border: `1px solid ${t.line}`, borderRadius: 20, boxShadow: '0 24px 48px -24px rgba(0,0,0,0.35)', textAlign: 'left', cursor: 'pointer', color: t.ink }}>
                <div style={{ fontSize: 11, color: t.gold }}>Next availability check</div>
                <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 20, marginTop: 4 }}>Is your date free?</div>
                <div style={{ fontSize: 14, color: t.muted, marginTop: 2 }}>Check in seconds →</div>
              </button>
            </div>
          </section>

          {/* 3 event types */}
          <section style={{ padding: '0 clamp(20px,4vw,64px) clamp(64px,8vw,112px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 36 }}>
              <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(40px,5.6vw,72px)', lineHeight: 1 }}>Choose your event</h2>
              <button onClick={() => go('services')} style={{ background: 'none', border: 'none', borderBottom: `1px solid ${t.ink}`, padding: '4px 0', color: t.ink, fontSize: 16, cursor: 'pointer' }}>All services</button>
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
                <div style={{ fontSize: 15, color: t.bandGold, marginBottom: 12 }}>Simple and straightforward</div>
                <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(40px,5.6vw,72px)', lineHeight: 0.95 }}>How we work</h2>
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
                  Get a personalised offer
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════════════════════════════ SERVICES ══════════════ */}
      {page === 'services' && (
        <section style={{ padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px)' }}>
          <Pill>What we provide</Pill>
          <h1 style={{ margin: '20px 0 64px', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(56px,8vw,112px)', lineHeight: 1, maxWidth: 1000, textWrap: 'balance' as any }}>
            You enjoy. We handle the rest.
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
            <h2 style={{ margin: '0 0 8px', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.03em', fontSize: 'clamp(32px,4vw,52px)', lineHeight: 1 }}>Additional options</h2>
            <p style={{ margin: '0 0 36px', fontSize: 17, fontWeight: 300, color: t.body }}>Available through our partner network when needed.</p>
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
              The first call is free<br />and takes 20 minutes.
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => go('packages')} style={{ padding: '17px 28px', border: `1px solid rgba(255,255,255,0.25)`, borderRadius: 999, background: 'transparent', color: t.paper, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>See packages</button>
              <button onClick={() => go('contact', { mode: 'call' })} style={{ padding: '17px 28px', border: 'none', borderRadius: 999, background: t.paper, color: t.ink, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>Request a call</button>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════ PACKAGES ══════════════ */}
      {page === 'packages' && (
        <section style={{ padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px)' }}>
          <Pill>Pricing</Pill>
          <h1 style={{ margin: '20px 0 16px', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(56px,8vw,112px)', lineHeight: 1 }}>Packages</h1>
          <p style={{ margin: '0 0 64px', fontSize: 19, fontWeight: 300, color: t.body, maxWidth: 560 }}>
            Not every event is the same. The final price depends on duration, location, guest count and equipment required.
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
                    Request this package
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40, padding: 'clamp(24px,3vw,40px)', borderRadius: 28, background: t.card, border: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: 26, letterSpacing: '-0.02em' }}>Need something custom?</div>
              <div style={{ fontSize: 16, fontWeight: 300, color: t.body, marginTop: 4 }}>Tell us about your event and we'll put together a personalised offer.</div>
            </div>
            <button onClick={() => go('contact', { mode: 'inquiry' })} className="cv-btn-primary" style={{ padding: '14px 26px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 15, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 200ms' }}>
              Get a custom quote
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
              <Pill>Contact</Pill>
              <h1 style={{ margin: '20px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(52px,7vw,96px)', lineHeight: 1 }}>Book a date.</h1>
              <p style={{ margin: '24px 0 0', fontSize: 19, fontWeight: 300, lineHeight: 1.55, color: t.body, maxWidth: 440 }}>
                Send us the details and we'll reply within one working day.
              </p>
              <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 17 }}>
                <a href="mailto:hello@celebrisvibe.com" style={{ color: t.ink }}>hello@celebrisvibe.com</a>
                <a href="tel:+359000000000" style={{ color: t.ink }}>+359 (0) 000 000</a>
              </div>

              {/* Check free date */}
              <div style={{ marginTop: 40, padding: '24px', borderRadius: 20, background: t.card, border: `1px solid ${t.line}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: 22, letterSpacing: '-0.02em' }}>Check available date</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    type="date"
                    value={checkedDate}
                    onChange={e => { setCheckedDate(e.target.value); setDateStatus('idle'); }}
                    style={{ flex: 1, minWidth: 160, background: t.paper, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '12px 14px', outline: 'none' }}
                  />
                  <button onClick={checkDate} className="cv-btn-primary" style={{ padding: '12px 20px', border: 'none', borderRadius: 12, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 15, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 200ms' }}>
                    Check
                  </button>
                </div>
                {dateStatus === 'available' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(138,109,59,0.12)', border: `1px solid ${t.gold}` }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50', display: 'block', flexShrink: 0 }} />
                    <span style={{ fontSize: 15, color: t.ink }}>This date looks <strong>available</strong> — fill in the form to request it.</span>
                  </div>
                )}
                {dateStatus === 'taken' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(200,80,60,0.1)', border: '1px solid rgba(200,80,60,0.3)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e57373', display: 'block', flexShrink: 0 }} />
                    <span style={{ fontSize: 15, color: t.ink }}>This date may already be taken — contact us to confirm.</span>
                  </div>
                )}
              </div>

              {/* QR badge */}
              <div style={{ marginTop: 40, display: 'inline-flex', alignItems: 'center', gap: 20, padding: '16px 20px 16px 16px', borderRadius: 20, background: t.card, border: `1px solid ${t.line}` }}>
                <div style={{ padding: 8, background: '#fff', borderRadius: 12 }}>
                  <QRCodeSVG value={CONTACT_URL} size={72} bgColor="#ffffff" fgColor="#1b1d22" level="M" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: t.muted }}>Scan to open this form</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: t.ink }}>Perfect for business cards</div>
                  <a href={`${base}qr`} style={{ marginTop: 4, fontSize: 13, color: t.gold, textDecoration: 'underline', textUnderlineOffset: 3 }}>Get printable QR →</a>
                </div>
              </div>

              {/* About mini */}
              <div style={{ marginTop: 56, paddingTop: 40, borderTop: `1px solid ${t.line}` }}>
                <img src={logo} alt="Celebris Vibe" style={{ height: 48, filter: t.logo, marginBottom: 20 }} />
                <p style={{ margin: 0, fontSize: 17, fontWeight: 300, lineHeight: 1.6, color: t.body, maxWidth: 400 }}>
                  Celebris Vibe was built on the idea that a good event is more than just music — it's the right atmosphere at the right moment. We approach every event individually.
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
                    <button onClick={() => setSent(false)} style={{ marginTop: 8, padding: '12px 22px', borderRadius: 999, border: `1px solid ${t.ink}`, background: 'transparent', color: t.ink, fontSize: 15, cursor: 'pointer' }}>Back to the form</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                  {/* Mode toggle */}
                  <div style={{ display: 'flex', padding: 4, border: `1px solid ${t.chip}`, borderRadius: 999, alignSelf: 'flex-start' }}>
                    {(['inquiry', 'call'] as Mode[]).map(k => (
                      <button key={k} onClick={() => setMode(k)} style={{ padding: '10px 20px', borderRadius: 999, border: 'none', background: mode === k ? t.ink : 'transparent', color: mode === k ? t.paper : t.muted, fontSize: 15, cursor: 'pointer' }}>
                        {k === 'inquiry' ? 'Send inquiry' : 'Request a call'}
                      </button>
                    ))}
                  </div>

                  {mode === 'inquiry' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {/* Event type */}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: t.muted, marginBottom: 10 }}>Type of event</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {EVENT_TYPE_LABELS.map(l => {
                            const on = eventType === l;
                            return <button key={l} onClick={() => setEventType(l)} style={{ padding: '9px 16px', borderRadius: 999, border: `1px solid ${on ? t.ink : t.chip}`, background: on ? t.ink : 'transparent', color: on ? t.paper : t.ink, fontSize: 14, cursor: 'pointer' }}>{l}</button>;
                          })}
                        </div>
                      </div>
                      {/* Name + Phone + Email */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
                        {[['Name', name, setName, 'text', 'Your name'], ['Phone', phone, setPhone, 'tel', '+359…'], ['Email', email, setEmail, 'email', 'you@email.com']].map(([label, val, setter, type, ph]) => (
                          <label key={label as string} style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                            {label as string}
                            <input value={val as string} onChange={e => (setter as any)(e.target.value)} type={type as string} placeholder={ph as string} style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '13px 15px', outline: 'none' }} />
                          </label>
                        ))}
                      </div>
                      {/* Date + Location + Guests */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                          Event date
                          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '13px 15px', outline: 'none' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                          Location / Venue
                          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Sofia, venue name…" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '13px 15px', outline: 'none' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                          Guests
                          <select value={guests} onChange={e => setGuests(e.target.value)} style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: guests ? t.ink : t.muted, fontSize: 16, padding: '13px 15px', outline: 'none' }}>
                            <option value="">Select…</option>
                            <option>Under 50</option>
                            <option>50 – 150</option>
                            <option>150 – 300</option>
                            <option>300+</option>
                          </select>
                        </label>
                      </div>
                      {/* What do you need — checkboxes */}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: t.muted, marginBottom: 10 }}>What do you need?</div>
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
                        Additional information
                        <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Venue ideas, music preferences, budget range…" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '13px 15px', outline: 'none', resize: 'vertical', fontFamily: "'Jost',sans-serif" }} />
                      </label>
                      <button onClick={() => setSent(true)} className="cv-btn-primary" style={{ alignSelf: 'flex-start', padding: '17px 30px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 16, cursor: 'pointer', transition: 'background 200ms' }}>
                        Send inquiry
                      </button>
                    </div>
                  )}

                  {mode === 'call' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                          Name
                          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '13px 15px', outline: 'none' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, fontWeight: 500, color: t.muted }}>
                          Phone
                          <input type="tel" placeholder="+359…" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, color: t.ink, fontSize: 16, padding: '13px 15px', outline: 'none' }} />
                        </label>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: t.muted, marginBottom: 10 }}>Best time to call</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {['Morning', 'Afternoon', 'Evening'].map(l => {
                            const on = time === l;
                            return <button key={l} onClick={() => setTime(l)} style={{ padding: '10px 18px', borderRadius: 999, border: `1px solid ${on ? t.ink : t.chip}`, background: on ? t.ink : 'transparent', color: on ? t.paper : t.ink, fontSize: 15, cursor: 'pointer' }}>{l}</button>;
                          })}
                        </div>
                      </div>
                      <button onClick={() => setSent(true)} className="cv-btn-primary" style={{ alignSelf: 'flex-start', padding: '17px 30px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 16, cursor: 'pointer', transition: 'background 200ms' }}>
                        Request a call
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
          <div>© 2026 Celebris Vibe · Creating Vibes, Celebrating Life.</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="#" style={{ color: t.muted }}>Instagram</a>
            <a href="#" style={{ color: t.muted }}>Facebook</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
