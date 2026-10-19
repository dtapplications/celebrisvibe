// Site content shared by the pages and the generated llms.txt / llms-full.txt.
// Service content lives in src/data/services.ts.

export const SITE_NAME = 'Celebris Vibe';
export const SLOGAN = 'Създаваме Вайб, Честваме Живота.';

export const ROUTES = {
  home: '/',
  services: '/uslugi/',
  prices: '/ceni/',
  contact: '/kontakti/',
  privacy: '/poveritelnost/',
} as const;

export const NAV: [string, string][] = [
  [ROUTES.home, 'Начало'],
  [ROUTES.services, 'Услуги'],
  [ROUTES.prices, 'Цени'],
  [ROUTES.contact, 'Контакти'],
];

export const CONTACT_EMAIL = 'hello@celebrisvibe.com';

export const CONTACT_PHONE = '+359 (0) 000 000';

// TODO: replace with the client's real profile URLs
export const SOCIAL = { instagram: '#', facebook: '#' };

export const EVENT_TYPES = [
  {
    key: 'private',
    formLabel: 'Частно събитие',
    photo: 'dj-crowd',
    title: 'Частни събития',
    subtitle: 'Рождени дни · Годишнини · Партита',
    desc: 'Подбираме музиката и атмосферата спрямо гостите и характера на събитието.',
    tags: ['DJ', 'Водещ', 'Озвучаване', 'Осветление'],
  },
  {
    key: 'wedding',
    formLabel: 'Сватба',
    photo: 'extra-effects',
    title: 'Сватби',
    subtitle: 'Музика, водене и координация през цялата вечер',
    desc: 'Потвърждаваме музикалните предпочитания, програмата и ключовите моменти предварително, за да протече вечерта естествено.',
    tags: ['DJ', 'Водещ', 'Озвучаване', 'Осветление'],
  },
  {
    key: 'corporate',
    formLabel: 'Корпоративно',
    photo: 'sound-conference',
    title: 'Корпоративни събития',
    subtitle: 'Конференции · Лансирания · Тиймбилдинги',
    desc: 'Професионално техническо и музикално осигуряване за фирмени партита, презентации, конференции, тиймбилдинги, лансирания, коктейли и семинари.',
    tags: ['DJ', 'Водещ', 'Озвучаване', 'Безжични микрофони', 'Фонова музика'],
  },
];

export const SERVICE_GUIDE = [
  { when: 'До 50 гости', title: 'Малко парти или вечеря', rec: 'DJ с компактна система', desc: 'Рожден ден, годишнина или парти у дома или в ресторант. Достатъчни са DJ и малка, но мощна звукова система.' },
  { when: '50–300 гости', title: 'Сватба или голямо тържество', rec: 'Пълен вайб', desc: 'DJ, водещ, озвучаване и светлини от един екип - една отговорност и една оферта за цялата вечер.' },
  { when: 'Фирмено събитие', title: 'Конференция, презентация, парти', rec: 'Озвучаване + DJ', desc: 'Микрофони и техника за официалната част, фонова музика за коктейла и DJ за партито след това.' },
];

export const PRICE_FACTORS = [
  { title: 'Поводът', desc: 'Сватбата има ключови моменти и водещ, рожденият ден - повече свобода, конференцията - микрофони и презентации.' },
  { title: 'Продължителността', desc: 'Колко часа продължава събитието и дали има нужда от музика по време на вечерята или коктейла.' },
  { title: 'Залата и гостите', desc: 'Размерът на залата и броят гости определят колко мощна трябва да е звуковата система.' },
  { title: 'Осветление и ефекти', desc: 'Основно парти осветление или пълна светлинна сцена, дим, искри и декоративни акценти.' },
  { title: 'Локацията', desc: 'Събития извън града включват транспорт, който уточняваме предварително в офертата.' },
];

export const PRICE_COMPARE = [
  ['Включена ли е техниката?', 'Някои оферти са само за DJ - звукът и светлините се плащат отделно.'],
  ['Колко часа и какво след това?', 'Попитай колко струва всеки допълнителен час, ако партито продължи.'],
  ['Кой води програмата?', 'DJ и водещ в едно или трябва да наемеш още един човек.'],
  ['Има ли резервна техника?', 'Резервен лаптоп, пулт и микрофон са спокойствие, което не се вижда.'],
];

export const EXTRAS = [
  { title: 'Фотокабина', tag: 'Хит на сватби', photo: 'extra-photobooth',
    desc: 'Снимки с реквизит, отпечатани на момента - гостите си тръгват със спомен.' },
  { title: 'Изпълнители и музиканти', tag: 'На живо', photo: 'extra-performers',
    desc: 'Цигулка, саксофон или вокал над DJ сета - моментът, който всички снимат.' },
  { title: 'Специални ефекти', tag: 'Кулминация', photo: 'extra-effects',
    desc: 'Студени искри, дим, CO₂ и конфети за първия танц или полунощ.' },
  { title: 'Допълнително осветление', tag: 'Големи зали', photo: 'light-stage',
    desc: 'Още светлина и ефекти за големи или сложни пространства.' },
  { title: 'Фотография и видео', tag: 'Партньори', photo: 'extra-video',
    desc: 'Фотограф и видеограф от нашата доверена партньорска мрежа.' },
];

export const PACKAGES = [
  {
    name: 'DJ',
    tagline: 'Само музика',
    price: 'От €200', from: 200,
    items: ['Подготовка на музиката', 'DJ програма', 'Монтаж на оборудването'],
    highlight: false,
  },
  {
    name: 'DJ + Озвучаване',
    tagline: 'Музика + професионално аудио',
    price: 'От €500', from: 500,
    items: ['DJ програма', 'Професионална звукова система', 'Съобразено със залата и брой гости'],
    highlight: true,
  },
  {
    name: 'Пълен Вайб',
    tagline: 'Пълното изживяване',
    price: 'От €900', from: 900,
    items: ['DJ', 'Водещ', 'Звукова система', 'Осветление', 'Подготовка на програма и координация'],
    highlight: false,
  },
];

export const ALWAYS_INCLUDED = ['Звукова система', 'Микрофон за речи', 'Основно парти осветление', 'Монтаж и демонтаж', 'Музикална подготовка'];

// ─── Contact form options ─────────────────────────────────────────────────────

export const FORM_EVENT_TYPES = ['Частно събитие', 'Сватба', 'Корпоративно', 'Презентация', 'Друго'];
export const FORM_SERVICES = ['DJ', 'Водещ', 'Озвучаване', 'Осветление', 'Пълен пакет', 'Друго'];
export const GUEST_OPTIONS = ['До 50', '50 – 150', '150 – 300', '300+'];
export const CALL_TIMES = ['Сутринта', 'Следобед', 'Вечерта'];

// ─── Price estimator ──────────────────────────────────────────────────────────

// MOCK pricing for the estimator - replace with the client's real rules before launch.
// Calibrated to the packages for a 4-hour private event, 50-150 guests:
// DJ + sound €500 · + host + lights €900 ("Пълен вайб"). Sound is always included.
export const ESTIMATE = {
  base: 200,                 // DJ, up to the included hours
  includedHours: 4,
  extraHour: 50,
  sound: { 'До 50': 150, '50 – 150': 300, '150 – 300': 450, '300+': 600 } as Record<string, number>,
  type: { private: 0, wedding: 100, corporate: 50 } as Record<string, number>,
  host: 200,
  lights: 200,
};

// [key, chip label, contact form event type]
export const ESTIMATE_TYPES: [string, string, string][] = [
  ['wedding', 'Сватба', 'Сватба'],
  ['private', 'Частно', 'Частно събитие'],
  ['corporate', 'Фирмено', 'Корпоративно'],
];

export type EstimateInput = { type: string; hours: number; guests: string; host: boolean; lights: boolean };

export const ESTIMATE_DEFAULTS: EstimateInput = { type: 'wedding', hours: 5, guests: '50 – 150', host: true, lights: true };

export function estimatePrice(i: EstimateInput): number {
  return ESTIMATE.base
    + Math.max(0, i.hours - ESTIMATE.includedHours) * ESTIMATE.extraHour
    + ESTIMATE.sound[i.guests]
    + ESTIMATE.type[i.type]
    + (i.host ? ESTIMATE.host : 0)
    + (i.lights ? ESTIMATE.lights : 0);
}
