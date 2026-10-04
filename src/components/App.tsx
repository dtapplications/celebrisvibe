import React, { useState, useEffect, useRef, type CSSProperties } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Page = 'home' | 'events' | 'services' | 'gallery' | 'artists' | 'about' | 'contact';
type PlanTab = 'Wedding' | 'Corporate' | 'Concert';
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

const ALL_EVENTS = [
  { day: 'Sat Oct', date: '18', type: 'Concert',   title: 'Celebris Live Sessions',    hint: 'stage lights',   venue: 'Grand Hall',       lineup: 'Live band and special guests',    price: 'From $60'  },
  { day: 'Fri Oct', date: '31', type: 'Party',     title: 'Masquerade',                hint: 'costume crowd',  venue: 'The Foundry',      lineup: 'Halloween costume party',         price: 'From $45'  },
  { day: 'Sat Nov', date: '15', type: 'Festival',  title: 'Open Air Winter',           hint: 'open-air stage', venue: 'Riverside Park',   lineup: '12 artists, two stages',          price: 'From $70'  },
  { day: 'Thu Nov', date: '20', type: 'Corporate', title: 'Founders Night',            hint: 'ballroom',       venue: 'Ivory Ballroom',   lineup: 'Dinner, awards and an after-party', price: 'Invite only' },
  { day: 'Wed Dec', date: '31', type: 'Party',     title: 'New Year at the Harbour',   hint: 'fireworks',      venue: 'Harbour Pavilion', lineup: 'Dinner, countdown, fireworks',    price: 'From $80'  },
];

const SERVICES = [
  { title: 'Weddings',                      desc: 'Ceremony to after-party: venue, décor, music and a planner on the day.',     size: '60 to 600 guests',      tags: ['Venue search', 'Décor and florals', 'Live music']       },
  { title: 'Corporate events',              desc: 'Launches, galas, conferences and team evenings.',                             size: '50 to 2,000 guests',    tags: ['Product launches', 'Award nights', 'Conferences']        },
  { title: 'Private celebrations',          desc: 'Birthdays, anniversaries and milestones, at home or somewhere new.',         size: '20 to 400 guests',      tags: ['Themes', 'Catering', 'Entertainment']                    },
  { title: 'Concerts and festivals',        desc: 'Staging, ticketing, artist logistics and crowd safety.',                     size: '300 to 20,000 guests',  tags: ['Stage and sound', 'Ticketing', 'Artist hospitality']    },
  { title: 'Celebrity and VIP appearances', desc: 'A known guest at your event, with contracts and security handled.',          size: 'Any size',              tags: ['Talent search', 'Riders', 'Security']                   },
  { title: 'DJ and artist booking',         desc: 'DJs, bands, string quartets and hosts matched to your guests.',              size: 'From one set',          tags: ['DJs', 'Live bands', 'Hosts']                             },
];

const GALLERY = [
  { title: 'Amara and Tobi',   meta: 'Wedding · 220 guests',       hint: 'first dance',   ratio: '4/5', cat: 'Weddings'  },
  { title: 'Lumen Awards',     meta: 'Corporate gala · 900',        hint: 'ballroom',      ratio: '4/5', cat: 'Corporate' },
  { title: 'Summer Daze',      meta: 'Festival · 1,200',            hint: 'main stage',    ratio: '4/5', cat: 'Concerts'  },
  { title: '30 and Thriving',  meta: 'Birthday dinner · 80',        hint: 'long table',    ratio: '4/5', cat: 'Private'   },
  { title: 'Lena and Arman',   meta: 'Garden wedding · 150',        hint: 'reception',     ratio: '4/5', cat: 'Weddings'  },
  { title: 'Vertex Launch',    meta: 'Product reveal · 600',        hint: 'stage',         ratio: '4/5', cat: 'Corporate' },
  { title: 'Golden Hour',      meta: 'Rooftop concert · 350',       hint: 'sunset crowd',  ratio: '4/5', cat: 'Concerts'  },
  { title: 'Ruby Anniversary', meta: 'Private dinner · 60',         hint: 'candles',       ratio: '4/5', cat: 'Private'   },
];

const ROSTER = [
  { name: 'Lyra Strings',   role: 'String quartet', genres: ['Ceremony', 'Pop strings'],          bio: 'Ceremonies and cocktail hours, with string versions of current hits.'              },
  { name: 'The Velvet Six', role: 'Live band',       genres: ['Soul', 'Funk', 'Pop'],              bio: 'Six-piece with horns. Dinner sets, first dances and a full late show.'             },
  { name: 'Nalu',           role: 'DJ',              genres: ['Hip-hop', 'R&B', 'Throwbacks'],     bio: 'Our most booked wedding DJ. Reads a room fast and plays to every generation.'      },
  { name: 'Ava Monroe',     role: 'Host and MC',     genres: ['Galas', 'Weddings'],                bio: 'Bilingual host who keeps programmes on time and the room with her.'               },
  { name: 'Sax Theory',     role: 'Live sax',        genres: ['Jazz', 'Lounge'],                   bio: 'Live saxophone over DJ sets. The moment everyone films.'                         },
  { name: 'DJ Kora',        role: 'DJ',              genres: ['Afro house', 'Deep house'],         bio: 'Long, warm sets that build slowly and keep the floor.'                           },
  { name: 'Remi Sol',       role: 'DJ',              genres: ['Techno', 'Melodic'],                bio: 'Festival closer with a big-room sound.'                                         },
  { name: 'Kid Atlas',      role: 'DJ',              genres: ['Afrobeats', 'Amapiano'],            bio: 'High-energy party sets for packed rooms and late finishes.'                      },
];

const TEAM = [
  { name: 'Founder name',  role: 'Founder, creative director' },
  { name: 'Planner name',  role: 'Lead wedding planner'        },
  { name: 'Producer name', role: 'Head of production'          },
  { name: 'Booker name',   role: 'Talent and bookings'         },
];

const PLANS: Record<PlanTab, [string, string, string][]> = {
  Wedding: [
    ['12 months out', 'First meeting',  'Guest count, budget, the feel of the day. We shortlist three venues.'],
    ['9 months',      'Venue and band', 'Contracts signed, date locked, music and photographer booked.'],
    ['3 months',      'Design',         'Décor, florals, menu tasting and the running order of the evening.'],
    ['2 weeks',       'Final details',  'Seating plan, timings sent to every vendor, rehearsal booked.'],
    ['The day',       'We run it',      'Your planner is on site from setup until the last guest leaves.'],
  ],
  Corporate: [
    ['8 weeks out', 'Brief',      'Audience, goals and what people should remember the next morning.'],
    ['6 weeks',     'Proposal',   'Venue, programme, speakers and an itemized budget.'],
    ['4 weeks',     'Production', 'Stage, AV, branding and catering confirmed. Invitations go out.'],
    ['1 week',      'Rehearsal',  'Speakers walk the stage, cues are timed, guest list is final.'],
    ['The evening', 'Show',       'Our crew runs every cue so your team can host.'],
  ],
  Concert: [
    ['6 months out', 'Booking', 'Artist offer, routing and venue hold.'],
    ['4 months',     'On sale',  'Ticketing live, marketing plan running, sponsors confirmed.'],
    ['6 weeks',      'Advance',  'Rider, stage plot, security and crowd flow signed off.'],
    ['Show week',    'Build',    'Load-in, sound check and staff briefings.'],
    ['Show day',     'Doors',    'Production manager and stage crew run the night.'],
  ],
};

const PLAN_HINTS: Record<PlanTab, string[]> = {
  Wedding:   ['coffee meeting', 'venue walkthrough', 'mood board',     'seating plan', 'first dance'],
  Corporate: ['brief session',  'venue',             'stage build',    'rehearsal',    'keynote'],
  Concert:   ['artist contract','ticket launch',     'stage plot',     'load-in',      'crowd'],
};

const PAGES: [Page, string][] = [
  ['home', 'Home'], ['events', 'Events'], ['services', 'Services'],
  ['gallery', 'Gallery'], ['artists', 'Artists'], ['about', 'About'], ['contact', 'Contact'],
];

const EVENT_TYPES = ['Wedding', 'Corporate', 'Private celebration', 'Concert', 'VIP appearance', 'Artist booking'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function App() {
  const [isDark, setIsDark]       = useState(false);
  const [page, setPage]           = useState<Page>('home');
  const [planTab, setPlanTab]     = useState<PlanTab>('Wedding');
  const [planStep, setPlanStep]   = useState(0);
  const [evFilter, setEvFilter]   = useState('All');
  const [galFilter, setGalFilter] = useState('All');
  const [type, setType]           = useState('Wedding');
  const [mode, setMode]           = useState<Mode>('inquiry');
  const [time, setTime]           = useState('Afternoon');
  const [name, setName]           = useState('');
  const [note, setNote]           = useState('');
  const [sent, setSent]           = useState(false);
  const [tickets, setTickets]     = useState<Record<string, boolean>>({});
  const [artistIdx, setArtistIdx] = useState<number | null>(null);
  const picked = useRef(false);

  const t = isDark ? DARK : LIGHT;

  // Auto-advance plan stepper
  useEffect(() => {
    const timer = setInterval(() => {
      if (!picked.current && page === 'home') {
        setPlanStep(s => (s + 1) % 5);
      }
    }, 4500);
    return () => clearInterval(timer);
  }, [page]);

  const go = (p: Page, extra?: { mode?: Mode; type?: string; note?: string }) => {
    setPage(p);
    setArtistIdx(null);
    if (extra?.mode !== undefined) setMode(extra.mode);
    if (extra?.type !== undefined) setType(extra.type);
    if (extra?.note !== undefined) setNote(extra.note);
    if (extra) setSent(false);
    window.scrollTo(0, 0);
  };

  const pickStep = (i: number) => {
    picked.current = true;
    setPlanStep(((i % 5) + 5) % 5);
  };

  const toggleTicket = (title: string) =>
    setTickets(prev => ({ ...prev, [title]: !prev[title] }));

  // Derived
  const stepIdx = Math.min(planStep, 4);
  const [planWhen, planTitle, planDesc] = PLANS[planTab][stepIdx];
  const planHint = PLAN_HINTS[planTab][stepIdx];

  const mkEvent = (e: typeof ALL_EVENTS[number]) => {
    const got    = tickets[e.title];
    const invite = e.price === 'Invite only';
    return {
      ...e,
      btnLabel: got ? (invite ? 'Requested' : 'In your cart') : invite ? 'Request an invite' : 'Get tickets',
      btnBg:    got ? 'transparent' : t.ink,
      btnFg:    got ? t.ink : t.paper,
      onTicket: () => toggleTicket(e.title),
    };
  };

  const filteredEvents = ALL_EVENTS
    .filter(e => evFilter === 'All' || e.type === evFilter)
    .map(mkEvent);

  const eventsTop = [ALL_EVENTS[0], ALL_EVENTS[2], ALL_EVENTS[4]].map(mkEvent);

  const filteredGallery = GALLERY.filter(g => galFilter === 'All' || g.cat === galFilter);

  const artist   = artistIdx != null ? ROSTER[artistIdx] : null;
  const who      = name ? `, ${name}` : '';
  const sentTitle = mode === 'call' ? 'Call booked' : 'Inquiry sent';
  const sentMsg   = mode === 'call'
    ? `Thank you${who}. A planner will call you this ${time.toLowerCase()} or the next working day.`
    : `Thank you${who}. We'll reply about your ${type.toLowerCase()} within one working day.`;

  const grad     = `repeating-linear-gradient(135deg,${t.s1} 0 12px,${t.s2} 12px 24px)`;
  const bandGrad = `repeating-linear-gradient(135deg,${t.bandS1} 0 12px,${t.bandS2} 12px 24px)`;

  // CSS vars for hover classes defined in index.astro
  const cssVars = { '--cv-gold': t.gold, '--cv-ink': t.ink, '--cv-paper': t.paper } as CSSProperties;

  // ── Pill badge (label + gold dot) ──────────────────────────────────────────
  const Pill = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px 7px 10px', borderRadius: 999, background: t.card, border: `1px solid ${t.line}`, fontSize: 14, fontWeight: 500, color: t.ink }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.gold, display: 'block', flexShrink: 0 }} />
      {children}
    </div>
  );

  // ── Filter chip row ────────────────────────────────────────────────────────
  const FilterChips = ({ options, active, onChange }: { options: string[]; active: string; onChange: (v: string) => void }) => (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map(f => {
        const on = active === f;
        return (
          <button key={f} onClick={() => onChange(f)} style={{ padding: '10px 18px', borderRadius: 999, border: `1px solid ${on ? t.ink : t.chip}`, background: on ? t.ink : 'transparent', color: on ? t.paper : t.ink, fontSize: 15, cursor: 'pointer' }}>
            {f}
          </button>
        );
      })}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: t.paper, color: t.ink, overflowX: 'hidden', ...cssVars }}>

      {/* ── HEADER ── */}
      <header style={{ position: 'sticky', top: 12, zIndex: 30, margin: '12px clamp(12px,2vw,24px) 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 8px 8px 18px', background: t.headerBg, backdropFilter: 'blur(14px)', border: `1px solid ${t.line}`, borderRadius: 999, flexWrap: 'nowrap' }}>
        <button onClick={() => go('home')} style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', color: t.ink, cursor: 'pointer', padding: 0 }}>
          <img src="/assets/celebris-logo.png" alt="Celebris Vibe" style={{ height: 42, filter: t.logo }} />
        </button>

        <nav style={{ display: 'flex', gap: 2, flexWrap: 'nowrap', flex: '1 1 auto', minWidth: 0, overflowX: 'auto', justifyContent: 'center', scrollbarWidth: 'none' } as CSSProperties}>
          {PAGES.slice(1).map(([k, label]) => (
            <button key={k} onClick={() => go(k)} style={{ background: page === k ? t.card : 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flex: 'none', padding: '8px 11px', borderRadius: 999, fontSize: 15, color: page === k ? t.ink : t.muted, transition: 'background 200ms' }}>
              {label}
            </button>
          ))}
        </nav>

        <button onClick={() => setIsDark(d => !d)} aria-label="Switch colour theme" title={isDark ? 'Switch to light' : 'Switch to dark'} style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, border: `1px solid ${t.chip}`, borderRadius: 999, background: 'transparent', cursor: 'pointer' }}>
          <span style={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${t.ink}`, background: t.dot, display: 'block' }} />
        </button>

        <button onClick={() => go('contact', { mode: 'inquiry' })} className="cv-btn-primary" style={{ flex: 'none', whiteSpace: 'nowrap', padding: '12px 22px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 15, cursor: 'pointer', transition: 'background 200ms' }}>
          Plan an event
        </button>
      </header>

      {/* ════════════════════════════════════════════ HOME ════════════════════ */}
      {page === 'home' && <>

        {/* Hero */}
        <section style={{ padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px) clamp(56px,7vw,96px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,460px),1fr))', gap: 'clamp(40px,5vw,80px)', alignItems: 'center' }}>
          <div>
            <Pill>Event planning and production</Pill>
            <h1 style={{ margin: '24px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(56px,7.6vw,124px)', lineHeight: 0.95 }}>
              You set the date. We set the room.
            </h1>
            <p style={{ margin: '32px 0 0', fontSize: 20, fontWeight: 300, lineHeight: 1.55, maxWidth: 500, color: t.body }}>
              Weddings, company evenings, concerts and private celebrations, planned by one team and run on the night by the same people.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
              <button onClick={() => go('contact', { mode: 'inquiry' })} className="cv-btn-primary" style={{ padding: '17px 28px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 16, cursor: 'pointer', transition: 'background 200ms' }}>
                Tell us about your event
              </button>
              <button onClick={() => go('contact', { mode: 'call' })} style={{ padding: '17px 28px', border: `1px solid ${t.ink}`, borderRadius: 999, background: 'transparent', color: t.ink, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>
                Request a call
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', width: 'min(100%,560px)', aspectRatio: '1', justifySelf: 'center' }}>
            <div style={{ position: 'absolute', inset: '9%', borderRadius: '50%', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, color: t.faint }}>photo: reception, warm light</span>
            </div>
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', animation: 'cvspin 90s linear infinite' }}>
              <img src="/assets/celebris-logo.png" alt="" style={{ position: 'absolute', width: '273%', left: '-86.8%', top: '-72.2%', maxWidth: 'none', filter: t.logo }} />
            </div>
            <button onClick={() => go('events')} style={{ position: 'absolute', right: -4, bottom: '6%', padding: '16px 20px', background: t.paper, border: `1px solid ${t.line}`, borderRadius: 20, boxShadow: '0 24px 48px -24px rgba(0,0,0,0.35)', textAlign: 'left', cursor: 'pointer', color: t.ink }}>
              <div style={{ fontSize: 11, color: t.gold }}>Next public event</div>
              <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 22, marginTop: 4 }}>Celebris Live Sessions</div>
              <div style={{ fontSize: 14, color: t.muted, marginTop: 2 }}>Sat 18 Oct · Grand Hall</div>
            </button>
          </div>
        </section>

        {/* How it comes together */}
        <section style={{ padding: '0 clamp(12px,2vw,24px) clamp(64px,8vw,112px)' }}>
          <div style={{ borderRadius: 40, background: t.ink, color: t.paper, padding: 'clamp(28px,4.5vw,64px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: '24px 40px', alignItems: 'end', marginBottom: 40 }}>
              <div>
                <div style={{ fontSize: 15, color: t.bandGold, marginBottom: 12 }}>Pick an occasion, then a step</div>
                <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(44px,5.6vw,84px)', lineHeight: 0.95 }}>How it comes together</h2>
              </div>
              <div style={{ display: 'flex', gap: 4, padding: 5, borderRadius: 999, border: `1px solid ${t.bandLine}`, justifySelf: 'end', flexWrap: 'wrap' }}>
                {(['Wedding', 'Corporate', 'Concert'] as PlanTab[]).map(tab => (
                  <button key={tab} onClick={() => { picked.current = true; setPlanTab(tab); setPlanStep(0); }} style={{ padding: '11px 20px', borderRadius: 999, border: 'none', background: planTab === tab ? t.paper : 'transparent', color: planTab === tab ? t.ink : t.paper, fontSize: 15, cursor: 'pointer', transition: 'background 250ms' }}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 20, alignItems: 'stretch' }}>
              {/* Step list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PLANS[planTab].map(([when, title], i) => {
                  const on = i === stepIdx;
                  return (
                    <button key={i} onClick={() => pickStep(i)} style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', gap: '2px 16px', alignItems: 'center', textAlign: 'left', cursor: 'pointer', padding: '16px 20px 16px 16px', borderRadius: 22, border: `1px solid ${on ? t.bandActive : t.bandLine}`, background: on ? t.bandActive : 'transparent', color: t.paper, transition: 'background 300ms,border-color 300ms' }}>
                      <span style={{ gridRow: 'span 2', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 15, background: on ? t.bandGold : 'transparent', color: on ? t.ink : t.bandGold, transition: 'background 300ms' }}>{i + 1}</span>
                      <span style={{ fontSize: 13, color: t.bandGold }}>{when}</span>
                      <span style={{ gridRow: 'span 2', fontSize: 20, opacity: on ? 1 : 0, transition: 'opacity 300ms' }}>→</span>
                      <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.02em', fontSize: 22, lineHeight: 1.1 }}>{title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Detail card */}
              <div style={{ position: 'relative', minHeight: 460, borderRadius: 30, overflow: 'hidden', background: bandGrad, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 16 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {PLANS[planTab].map((_, i) => (
                    <span key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= stepIdx ? t.bandGold : t.bandLine, transition: 'background 400ms' }} />
                  ))}
                </div>
                <span style={{ alignSelf: 'center', fontSize: 12, color: t.bandText }}>photo: {planHint}</span>
                <div style={{ background: t.paper, color: t.ink, borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ padding: '6px 12px', borderRadius: 999, background: t.card, border: `1px solid ${t.line}`, fontSize: 13, color: t.gold }}>{planWhen}</span>
                    <span style={{ fontSize: 14, color: t.muted }}>Step {stepIdx + 1} of 5</span>
                  </div>
                  <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.03em', fontSize: 'clamp(30px,3vw,40px)', lineHeight: 1 }}>{planTitle}</div>
                  <p style={{ margin: 0, fontSize: 17, fontWeight: 300, lineHeight: 1.55, color: t.body }}>{planDesc}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button onClick={() => pickStep(stepIdx - 1)} aria-label="Previous step" style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${t.chip}`, background: 'transparent', color: t.ink, fontSize: 18, cursor: 'pointer' }}>←</button>
                    <button onClick={() => pickStep(stepIdx + 1)} aria-label="Next step" style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: t.ink, color: t.paper, fontSize: 18, cursor: 'pointer' }}>→</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Occasions we plan */}
        <section style={{ padding: 'clamp(64px,8vw,120px) clamp(20px,4vw,64px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 36 }}>
            <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(44px,5.6vw,84px)', lineHeight: 1 }}>Occasions we plan</h2>
            <button onClick={() => go('services')} style={{ background: 'none', border: 'none', borderBottom: `1px solid ${t.ink}`, padding: '4px 0', color: t.ink, fontSize: 16, cursor: 'pointer' }}>Services in detail</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,300px),1fr))', gap: 16 }}>
            {SERVICES.map(s => (
              <button key={s.title} onClick={() => go('services')} className="cv-card" style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 240, padding: 28, borderRadius: 28, background: t.card, border: `1px solid ${t.line}`, color: t.ink, textAlign: 'left', cursor: 'pointer', transition: 'transform 300ms,box-shadow 300ms' }}>
                <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 30, lineHeight: 1.05 }}>{s.title}</span>
                <span style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.5, color: t.body }}>{s.desc}</span>
                <span style={{ marginTop: 'auto', alignSelf: 'flex-start', padding: '7px 14px', borderRadius: 999, background: t.paper, fontSize: 14, color: t.gold }}>{s.size}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Open to the public */}
        <section style={{ padding: '0 clamp(20px,4vw,64px) clamp(64px,8vw,120px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
            <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(44px,5.6vw,84px)', lineHeight: 1 }}>Open to the public</h2>
            <button onClick={() => go('events')} style={{ background: 'none', border: 'none', borderBottom: `1px solid ${t.ink}`, padding: '4px 0', color: t.ink, fontSize: 16, cursor: 'pointer' }}>All events</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 20 }}>
            {eventsTop.map(e => (
              <div key={e.title} className="cv-event-card" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 32, padding: 10, display: 'flex', flexDirection: 'column', transition: 'transform 300ms,box-shadow 300ms' }}>
                <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 24, background: grad, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 14 }}>
                  <span style={{ fontSize: 11, color: t.faint }}>photo: {e.hint}</span>
                  <div style={{ position: 'absolute', top: 12, left: 12, background: t.paper, borderRadius: 18, padding: '10px 14px', textAlign: 'center', minWidth: 64 }}>
                    <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 28, lineHeight: 1, letterSpacing: '-0.03em' }}>{e.date}</div>
                    <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{e.day}</div>
                  </div>
                  <span style={{ position: 'absolute', top: 12, right: 12, padding: '6px 12px', borderRadius: 999, background: t.paper, fontSize: 13, color: t.ink }}>{e.type}</span>
                </div>
                <div style={{ padding: '20px 14px 10px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 28, lineHeight: 1.05 }}>{e.title}</div>
                  <div style={{ fontSize: 15, fontWeight: 300, color: t.muted }}>{e.venue} · {e.lineup}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 6px 6px 14px' }}>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{e.price}</span>
                  <button onClick={e.onTicket} style={{ padding: '12px 20px', borderRadius: 999, border: `1px solid ${t.ink}`, background: e.btnBg, color: e.btnFg, fontSize: 15, cursor: 'pointer' }}>{e.btnLabel}</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </>}

      {/* ════════════════════════════════════════════ EVENTS ══════════════════ */}
      {page === 'events' && (
        <section style={{ padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px)' }}>
          <Pill>Public events we produce</Pill>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', margin: '20px 0 48px' }}>
            <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(56px,8vw,128px)', lineHeight: 1 }}>Upcoming</h1>
            <FilterChips options={['All', 'Concert', 'Festival', 'Party', 'Corporate']} active={evFilter} onChange={setEvFilter} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredEvents.map(e => (
              <div key={e.title} className="cv-event-row" style={{ display: 'grid', gridTemplateColumns: '120px minmax(0,1fr) auto', gap: 28, alignItems: 'center', padding: '16px 24px 16px 16px', borderRadius: 28, background: t.card, border: `1px solid ${t.line}`, transition: 'transform 300ms' }}>
                <div style={{ textAlign: 'center', background: t.paper, borderRadius: 20, padding: '16px 8px' }}>
                  <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 56, lineHeight: 1 }}>{e.date}</div>
                  <div style={{ fontSize: 12, color: t.gold, marginTop: 4 }}>{e.day}</div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: t.muted }}>{e.type} · {e.venue}</div>
                  <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 'clamp(28px,3.2vw,42px)', lineHeight: 1.1, marginTop: 6 }}>{e.title}</div>
                  <div style={{ fontSize: 16, fontWeight: 300, color: t.body, marginTop: 6 }}>{e.lineup}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                  <div style={{ fontSize: 15, color: t.muted }}>{e.price}</div>
                  <button onClick={e.onTicket} style={{ padding: '12px 22px', borderRadius: 999, border: `1px solid ${t.ink}`, background: e.btnBg, color: e.btnFg, fontSize: 15, cursor: 'pointer', whiteSpace: 'nowrap' }}>{e.btnLabel}</button>
                </div>
              </div>
            ))}
          </div>
          <p style={{ margin: '40px 0 0', fontSize: 18, fontWeight: 300, color: t.body, maxWidth: 620, lineHeight: 1.5 }}>
            Most of what we plan is private and never listed.{' '}
            <button onClick={() => go('contact')} style={{ background: 'none', border: 'none', padding: 0, color: t.gold, fontSize: 18, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 4 }}>
              Plan a private event
            </button>
          </p>
        </section>
      )}

      {/* ════════════════════════════════════════════ SERVICES ════════════════ */}
      {page === 'services' && (
        <section style={{ padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px)' }}>
          <Pill>Services</Pill>
          <h1 style={{ margin: '20px 0 64px', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(56px,8vw,128px)', lineHeight: 1, maxWidth: 1100 }}>
            You host. We take care of the rest.
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SERVICES.map(s => (
              <div key={s.title} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: '20px 56px', padding: 'clamp(24px,3vw,40px)', borderRadius: 28, background: t.card, border: `1px solid ${t.line}` }}>
                <div>
                  <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 'clamp(32px,3.6vw,48px)', lineHeight: 1.05 }}>{s.title}</div>
                  <div style={{ fontSize: 14, color: t.gold, marginTop: 12 }}>{s.size}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ fontSize: 19, fontWeight: 300, lineHeight: 1.55, color: t.body }}>{s.desc}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {s.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 14, padding: '6px 14px', border: `1px solid ${t.chip}`, borderRadius: 999, color: t.body }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 48, borderRadius: 28, padding: 'clamp(32px,5vw,64px)', background: t.ink, color: t.paper, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 'clamp(32px,4vw,56px)', lineHeight: 1.05 }}>
              The first call is free and takes 20 minutes.
            </div>
            <button onClick={() => go('contact', { mode: 'call' })} style={{ padding: '17px 28px', border: 'none', borderRadius: 999, background: t.paper, color: t.ink, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>
              Request a call
            </button>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════ GALLERY ════════════════ */}
      {page === 'gallery' && (
        <section style={{ padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px)' }}>
          <Pill>Past events</Pill>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', margin: '20px 0 48px' }}>
            <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(56px,8vw,128px)', lineHeight: 1 }}>Our work</h1>
            <FilterChips options={['All', 'Weddings', 'Corporate', 'Concerts', 'Private']} active={galFilter} onChange={setGalFilter} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap: '40px 20px' }}>
            {filteredGallery.map(g => (
              <div key={g.title} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ aspectRatio: g.ratio, borderRadius: 24, background: grad, display: 'flex', alignItems: 'flex-end', padding: 14 }}>
                  <span style={{ fontSize: 11, color: t.faint }}>photo: {g.hint}</span>
                </div>
                <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 24 }}>{g.title}</div>
                <div style={{ fontSize: 14, color: t.muted, marginTop: -8 }}>{g.meta}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════ ARTISTS ════════════════ */}
      {page === 'artists' && (
        <section style={{ padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px)' }}>
          <Pill>Artists, DJs and hosts we book</Pill>
          <h1 style={{ margin: '20px 0 56px', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(56px,8vw,128px)', lineHeight: 1 }}>The roster</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,240px),1fr))', gap: '40px 20px' }}>
            {ROSTER.map((a, i) => (
              <button key={a.name} onClick={() => setArtistIdx(i)} style={{ background: 'none', border: 'none', color: t.ink, textAlign: 'left', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ aspectRatio: '3/4', width: '100%', borderRadius: 24, background: grad, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16 }}>
                  <span style={{ fontSize: 11, color: t.faint }}>portrait</span>
                </div>
                <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 26 }}>{a.name}</div>
                <div style={{ fontSize: 14, color: t.muted, marginTop: -6 }}>{a.role} · {a.genres.join(', ')}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════ ABOUT ══════════════════ */}
      {page === 'about' && (
        <section style={{ padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 64, alignItems: 'center' }}>
            <div>
              <Pill>About</Pill>
              <h1 style={{ margin: '20px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(52px,7vw,112px)', lineHeight: 1 }}>
                Creating vibes, celebrating life.
              </h1>
              <p style={{ margin: '32px 0 0', fontSize: 20, fontWeight: 300, lineHeight: 1.6, color: t.body, maxWidth: 560 }}>
                Celebris Vibe plans a 40-guest birthday with the same care as a 5,000-ticket concert. The person you meet on the first call is the person running your event on the night.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: 56, borderRadius: 28, background: t.card, border: `1px solid ${t.line}` }}>
              <img src="/assets/celebris-logo.png" alt="Celebris Vibe logo" style={{ width: 'min(100%,300px)', filter: t.logo }} />
            </div>
          </div>
          <h2 style={{ margin: '104px 0 36px', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(40px,5vw,72px)', lineHeight: 1 }}>The team</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,220px),1fr))', gap: 20 }}>
            {TEAM.map(m => (
              <div key={m.name} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ aspectRatio: '4/5', borderRadius: 24, background: grad, display: 'flex', alignItems: 'flex-end', padding: 14 }}>
                  <span style={{ fontSize: 11, color: t.faint }}>portrait</span>
                </div>
                <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 22 }}>{m.name}</div>
                <div style={{ fontSize: 14, color: t.muted, marginTop: -6 }}>{m.role}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════ CONTACT ════════════════ */}
      {page === 'contact' && (
        <section style={{ padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,64px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 64 }}>
          <div>
            <Pill>Contact</Pill>
            <h1 style={{ margin: '20px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.04em', fontSize: 'clamp(52px,7vw,112px)', lineHeight: 1 }}>Tell us the date.</h1>
            <p style={{ margin: '28px 0 0', fontSize: 19, fontWeight: 300, lineHeight: 1.55, color: t.body, maxWidth: 440 }}>
              Send a few details or ask for a call. A planner replies within one working day.
            </p>
            <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 18 }}>
              <a href="mailto:hello@celebrisvibe.com" style={{ color: t.ink }}>hello@celebrisvibe.com</a>
              <a href="tel:+10000000000" style={{ color: t.ink }}>+1 (000) 000-0000</a>
            </div>
          </div>

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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                {/* Mode toggle */}
                <div style={{ display: 'flex', padding: 4, border: `1px solid ${t.chip}`, borderRadius: 999, alignSelf: 'flex-start' }}>
                  {(['inquiry', 'call'] as Mode[]).map(k => (
                    <button key={k} onClick={() => setMode(k)} style={{ padding: '10px 20px', borderRadius: 999, border: 'none', background: mode === k ? t.ink : 'transparent', color: mode === k ? t.paper : t.muted, fontSize: 15, cursor: 'pointer' }}>
                      {k === 'inquiry' ? 'Send inquiry' : 'Request a call'}
                    </button>
                  ))}
                </div>

                {mode === 'inquiry' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: t.muted, marginBottom: 12 }}>What are you planning?</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {EVENT_TYPES.map(l => {
                          const on = type === l;
                          return <button key={l} onClick={() => setType(l)} style={{ padding: '10px 18px', borderRadius: 999, border: `1px solid ${on ? t.ink : t.chip}`, background: on ? t.ink : 'transparent', color: on ? t.paper : t.ink, fontSize: 15, cursor: 'pointer' }}>{l}</button>;
                        })}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 22 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, fontWeight: 500, color: t.muted }}>
                        Name
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 14, color: t.ink, fontSize: 17, padding: '14px 16px', outline: 'none' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, fontWeight: 500, color: t.muted }}>
                        Email
                        <input type="email" placeholder="you@email.com" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 14, color: t.ink, fontSize: 17, padding: '14px 16px', outline: 'none' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, fontWeight: 500, color: t.muted }}>
                        Date
                        <input type="date" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 14, color: t.ink, fontSize: 17, padding: '14px 16px', outline: 'none' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, fontWeight: 500, color: t.muted }}>
                        Guests
                        <select style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 14, color: t.ink, fontSize: 17, padding: '14px 16px', outline: 'none' }}>
                          <option>Under 50</option>
                          <option>50 to 150</option>
                          <option>150 to 500</option>
                          <option>500+</option>
                        </select>
                      </label>
                    </div>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, fontWeight: 500, color: t.muted }}>
                      Anything we should know
                      <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Venue ideas, music, budget range" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 14, color: t.ink, fontSize: 17, padding: '14px 16px', outline: 'none', resize: 'vertical', fontFamily: "'Jost',sans-serif" }} />
                    </label>
                    <button onClick={() => setSent(true)} className="cv-btn-primary" style={{ alignSelf: 'flex-start', padding: '17px 30px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontWeight: 500, fontSize: 16, cursor: 'pointer', transition: 'background 200ms' }}>
                      Send inquiry
                    </button>
                  </div>
                )}

                {mode === 'call' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 22 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, fontWeight: 500, color: t.muted }}>
                        Name
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 14, color: t.ink, fontSize: 17, padding: '14px 16px', outline: 'none' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, fontWeight: 500, color: t.muted }}>
                        Phone
                        <input type="tel" placeholder="+1" style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 14, color: t.ink, fontSize: 17, padding: '14px 16px', outline: 'none' }} />
                      </label>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: t.muted, marginBottom: 12 }}>Best time to call</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
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
        </section>
      )}

      {/* ════════════════════════════════════════════ ARTIST MODAL ═══════════ */}
      {artistIdx != null && artist && (
        <div onClick={() => setArtistIdx(null)} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(27,29,34,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(880px,100%)', maxHeight: '90vh', overflow: 'auto', borderRadius: 28, background: t.paper, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))' }}>
            <div style={{ minHeight: 380, background: grad, display: 'flex', alignItems: 'flex-end', padding: 16 }}>
              <span style={{ fontSize: 11, color: t.faint }}>artist photo</span>
            </div>
            <div style={{ padding: 36, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button onClick={() => setArtistIdx(null)} aria-label="Close" style={{ alignSelf: 'flex-end', background: 'none', border: `1px solid ${t.field}`, color: t.ink, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>×</button>
              <div style={{ fontSize: 13, color: t.gold }}>{artist.role}</div>
              <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, letterSpacing: '-0.025em', fontSize: 52, lineHeight: 1 }}>{artist.name}</div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 300, lineHeight: 1.55, color: t.body }}>{artist.bio}</p>
              <div style={{ fontSize: 15, color: t.muted }}>{artist.genres.join(', ')}</div>
              <button onClick={() => go('contact', { mode: 'inquiry', type: 'Artist booking', note: `We would like to book ${artist.name}.` })} style={{ marginTop: 'auto', alignSelf: 'flex-start', padding: '15px 26px', border: 'none', borderRadius: 999, background: t.ink, color: t.paper, fontSize: 15, cursor: 'pointer' }}>
                Book {artist.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════ FOOTER ══════════════════ */}
      <footer style={{ padding: '56px clamp(20px,4vw,64px) 32px', borderTop: `1px solid ${t.line}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <img src="/assets/celebris-logo.png" alt="Celebris Vibe" style={{ height: 120, filter: t.logo }} />
          <div style={{ display: 'flex', gap: '4px 8px', flexWrap: 'wrap', maxWidth: 560 }}>
            {PAGES.map(([k, label]) => (
              <button key={k} onClick={() => go(k)} style={{ background: 'none', border: 'none', color: t.body, cursor: 'pointer', padding: '6px 10px', fontSize: 15 }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginTop: 40, fontSize: 14, color: t.muted }}>
          <div>© 2026 Celebris Vibe</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="#" style={{ color: t.muted }}>Instagram</a>
            <a href="#" style={{ color: t.muted }}>TikTok</a>
            <a href="#" style={{ color: t.muted }}>YouTube</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
