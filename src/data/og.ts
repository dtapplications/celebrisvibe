import { SERVICES } from './services';

// Link-preview image per page, generated at /og/<key>.jpg (src/pages/og/[key].jpg.ts).
// Pages pass the key to the Base layout as `og`.

export type OgPage = { eyebrow: string; title: string; photo: string };

export const OG_PAGES: Record<string, OgPage> = {
  home: { eyebrow: 'DJ · Водещ · Озвучаване · Осветление', title: 'Създаваме вайб. Честваме живота.', photo: 'hero' },
  services: { eyebrow: 'Услуги', title: 'DJ, звук и светлина за всеки повод', photo: 'dj-crowd' },
  prices: { eyebrow: 'Цени', title: 'Една оферта. Цялото събитие.', photo: 'light-finale' },
  contact: { eyebrow: 'Контакти', title: 'Запази дата. Провери свободна дата онлайн.', photo: 'dj-mic' },
  privacy: { eyebrow: 'Поверителност', title: 'Политика за поверителност', photo: 'sound-background' },
  qr: { eyebrow: 'Контакти', title: 'Планирай събитието си с нас', photo: 'extra-effects' },
  ...Object.fromEntries(SERVICES.map(s => [s.slug, { eyebrow: s.title, title: s.seoTitle, photo: s.photo }])),
};

export const ogPath = (key: string) => `/og/${key}.jpg`;

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
