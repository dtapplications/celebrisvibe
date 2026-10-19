// Shared by playwright.config.ts and the specs.

export const BUILD_URL = 'http://localhost:4321';
export const DEV_URL = 'http://localhost:4322';
/** Set to the deployed site (https://celebrisvibe.com) to test it instead of the dev server */
export const LIVE_URL = process.env.LIVE_URL?.replace(/\/$/, '') || '';

/** URL compared against the build in parity.spec.ts */
export const CANDIDATE_URL = LIVE_URL || DEV_URL;
export const CANDIDATE_NAME = LIVE_URL ? 'live' : 'dev';

// Fake keys baked into the test build and dev server. Requests to them are mocked in the tests.
export const BOOKED_CSV_URL = 'https://booked-dates.test/dates.csv';
export const TEST_ENV = {
  CV_E2E: '1',
  PUBLIC_WEB3FORMS_KEY: 'test-key',
  PUBLIC_BOOKED_DATES_CSV_URL: BOOKED_CSV_URL,
};

/** Every page of the site, with its expected <h1> and link-preview image */
export const PAGES = [
  { path: '/', h1: 'Създаваме вайб.', og: 'home' },
  { path: '/uslugi/', h1: 'DJ, звук и светлина', og: 'services' },
  { path: '/uslugi/dj-i-vodesht/', h1: 'DJ & Водещ', og: 'dj-i-vodesht' },
  { path: '/uslugi/ozvuchavane/', h1: 'Озвучаване', og: 'ozvuchavane' },
  { path: '/uslugi/osvetlenie/', h1: 'Осветление', og: 'osvetlenie' },
  { path: '/ceni/', h1: 'Една оферта.', og: 'prices' },
  { path: '/kontakti/', h1: 'Запази дата.', og: 'contact' },
  { path: '/poveritelnost/', h1: 'Политика за поверителност', og: 'privacy' },
];

/** Fixed "today" so the calendar and screenshots are the same on every run */
export const NOW = new Date('2026-11-10T10:00:00+02:00');
export const BOOKED_DATE = '2026-11-20';
export const FREE_DATE = '2026-11-21';
