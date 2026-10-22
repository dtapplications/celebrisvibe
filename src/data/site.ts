// Site content shared by the pages and the generated llms.txt / llms-full.txt.
// Service content lives in src/data/services.ts.

export const SITE_NAME = 'Celebris Vibe';
export const SLOGAN = 'Creating Vibes, Celebrating Life.';

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
    subtitle: 'Рождени дни · Юбилеи · Частни партита',
    desc: 'Рождени дни, юбилеи и лични поводи, създадени около хората, мястото и характера на празника.',
    tags: ['DJ', 'Водещ', 'Озвучаване', 'Осветление'],
  },
  {
    key: 'wedding',
    formLabel: 'Сватба',
    photo: 'extra-effects',
    title: 'Сватби',
    subtitle: 'DJ · Водене · Озвучаване · Осветление · Координация',
    desc: 'От посрещането до последния танц координираме музиката, воденето и ключовите моменти, така че вечерта да има естествен ритъм и да остане време просто да ѝ се насладите.',
    tags: ['DJ', 'Водещ', 'Озвучаване', 'Осветление'],
  },
  {
    key: 'corporate',
    formLabel: 'Корпоративно',
    photo: 'sound-conference',
    title: 'Корпоративни събития',
    subtitle: 'Конференции · Продуктови представяния · Тиймбилдинги',
    desc: 'Музикално и техническо обезпечаване за фирмени партита, презентации, конференции, тиймбилдинги, продуктови представяния, коктейли и семинари.',
    tags: ['DJ', 'Водещ', 'Озвучаване', 'Безжични микрофони', 'Фонова музика'],
  },
];

export const SERVICE_GUIDE = [
  { when: 'До 50 гости', title: 'Малко парти или вечеря', rec: 'DJ с компактна система', desc: 'Рожден ден, юбилей или парти у дома или в ресторант. Достатъчни са DJ и малка, но мощна звукова система.' },
  { when: '50–300 гости', title: 'Сватба или голямо тържество', rec: 'Цялостен пакет', desc: 'DJ, водещ, озвучаване и осветление с една организация и едно цялостно решение за вечерта.' },
  { when: 'Фирмено събитие', title: 'Конференция, презентация, парти', rec: 'Озвучаване + DJ', desc: 'Микрофони и техника за официалната част, фонова музика за коктейла и DJ за партито след това.' },
];

export const PRICE_FACTORS = [
  { title: 'Видът на събитието', desc: 'Различните събития имат различни изисквания. Частното събитие обикновено позволява повече свобода, фирменото може да изисква микрофони и презентационна техника, а при сватбата има повече предварително планирани ключови моменти и координация.' },
  { title: 'Продължителността', desc: 'Цената зависи от продължителността на програмата и от това дали са необходими музика и техническо обслужване по време на посрещането, коктейла, вечерята или други части от събитието.' },
  { title: 'Пространството и броят гости', desc: 'Размерът и особеностите на мястото, както и броят гости, определят необходимата мощност и конфигурация на озвучаването и осветлението.' },
  { title: 'Осветление и ефекти', desc: 'От основно парти осветление до по-мащабна светлинна конфигурация, декоративно осветление и специални ефекти — всяко допълнение се съобразява с конкретното събитие и пространството.' },
  { title: 'Локацията', desc: 'При събития извън стандартния район на обслужване транспортните разходи се изчисляват предварително и се включват ясно в офертата.' },
]

export const PRICE_COMPARE = [
  ['Включена ли е техниката?', 'Провери дали офертата включва необходимото озвучаване, микрофони, осветление, монтаж и техническо обслужване или те се заплащат отделно.'],
  ['За колко часа е офертата?', 'Уточни продължителността на услугата и цената за допълнителен час, ако събитието продължи повече от планираното.'],
  ['Кой води програмата?', 'Провери дали воденето е включено в услугата и кой ще координира ключовите моменти по време на събитието.'],
  ['Има ли резервно оборудване?', 'При професионалното техническо обезпечаване резервното оборудване е важна част от спокойното протичане на събитието.'],
]

export const EXTRAS = [
  { title: 'Фотокабина', tag: 'Хит на сватби', photo: 'extra-photobooth',
    desc: 'Снимки с реквизит, отпечатани на момента - гостите си тръгват със спомен.' },
  { title: 'Изпълнители и музиканти', tag: 'На живо', photo: 'extra-performers',
    desc: 'Цигулка, саксофон, вокал или друг изпълнител на живо — самостоятелно или в комбинация с DJ сета.' },
  { title: 'Специални ефекти', tag: 'Кулминация', photo: 'extra-effects',
    desc: 'Студени искри, дим, CO₂ и конфети за първия танц или полунощ.' },
  { title: 'Допълнително осветление', tag: 'Големи зали', photo: 'light-stage',
    desc: 'Още светлина и ефекти за големи или сложни пространства.' },
  { title: 'Фотография и видео', tag: 'Партньори', photo: 'extra-video',
    desc: 'Фотограф и видеограф от нашата доверена партньорска мрежа.' },
];

export const BASE_PRICES = {
  title: 'Базови цени',
  items: [
    ['Минимален ангажимент: 2 часа', '€200'],
    ['DJ до 5 часа, без озвучаване', '€300'],
    ['DJ + озвучаване до 5 часа', '€500'],
  ] as [string, string][],
  note: 'За по-дълги събития, водене, осветление и допълнителни услуги — персонална оферта.',
};

export type Package = {
  name: string;
  /** Price lines, e.g. "Минимум 2 часа — €200" */
  prices: string[];
  /** Lowest price, for structured data */
  from: number;
  tagline?: string;
  items: string[];
  note?: string;
  highlight: boolean;
};

export const PACKAGES: Package[] = [
  {
    name: 'DJ услуга',
    prices: ['Минимум 2 часа — €200', 'До 5 часа — €300'], from: 200,
    tagline: 'Без озвучаване',
    items: ['Предварителна музикална подготовка', 'DJ програма', 'Музикален подбор според събитието', 'Подготовка и свързване на DJ оборудването'],
    note: 'Минималната продължителност за ангажимент е 2 часа.',
    highlight: false,
  },
  {
    name: 'DJ + озвучаване',
    prices: ['До 5 часа — €500'], from: 500,
    items: ['DJ програма', 'Предварителна музикална подготовка', 'Професионална звукова система', 'Конфигурация според мястото и броя гости', 'Монтаж и демонтаж'],
    highlight: true,
  },
  {
    name: 'Complete пакет',
    prices: ['От €900'], from: 900,
    items: ['DJ', 'Водещ', 'Озвучаване', 'Осветление', 'Подготовка и координация'],
    highlight: false,
  },
];

export const PACKAGES_NOTE = 'За ангажименти над 5 часа продължителността и условията за допълнително време се уточняват предварително в офертата. Не приемаме ангажименти с продължителност под 2 часа.';

/** What an offer can include, depending on the package */
export const OFFER_INCLUDES = ['DJ и музикална подготовка', 'Водене на програмата', 'Професионално озвучаване', 'Безжични микрофони', 'Парти и декоративно осветление', 'Монтаж и демонтаж', 'Техническо обслужване', 'Координация на програмата', 'Транспорт, когато е приложим'];

// ─── Contact form options ─────────────────────────────────────────────────────

export const FORM_EVENT_TYPES = ['Частно събитие', 'Сватба', 'Корпоративно', 'Презентация', 'Друго'];
export const FORM_SERVICES = ['DJ', 'Водещ', 'Озвучаване', 'Осветление', 'Цялостен пакет', 'Друго'];
export const GUEST_OPTIONS = ['До 50', '50 – 150', '150 – 300', '300+'];
export const CALL_TIMES = ['Сутринта', 'Следобед', 'Вечерта'];

// ─── Price estimator ──────────────────────────────────────────────────────────

// MOCK pricing for the estimator - replace with the client's real rules before launch.
// Calibrated to the packages for a 4-hour private event, 50-150 guests:
// DJ + sound €500 · + host + lights €900 ("Complete пакет"). Sound is always included.
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
  ['private', 'Частно', 'Частно събитие'],
  ['corporate', 'Фирмено', 'Корпоративно'],
  ['wedding', 'Сватба', 'Сватба'],
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
