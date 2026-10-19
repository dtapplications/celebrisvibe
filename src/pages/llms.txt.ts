import type { APIRoute } from 'astro';
import { CONTACT_EMAIL, CONTACT_PHONE, EVENT_TYPES, ROUTES } from '../data/site';
import { SERVICES as services, serviceUrl } from '../data/services';
import { abs, textResponse } from '../lib/urls';

// Index for AI assistants, following https://llmstxt.org
export const GET: APIRoute = ({ site }) => {
  const events = EVENT_TYPES.map(e => e.title.toLowerCase());
  const titles = services.map(s => s.title).join(', ');

  return textResponse(`# Celebris Vibe

> Celebris Vibe е DJ и събитийна компания в България: DJ, водещ, професионално озвучаване и осветление за ${events.slice(0, -1).join(', ')} и ${events.at(-1)}.

Сайтът е на български език. Услугите са ${titles}. Цените на сайта са ориентировъчни - точна оферта се изпраща до един работен ден след запитване. Свободна дата може да се провери онлайн на страницата Контакти.

## Страници

- [Начало](${abs(site)}): представяне, услугите с примери, видове събития и допълнителни опции
- [Услуги](${abs(site, ROUTES.services)}): преглед на услугите, видове събития, допълнителни опции и коя услуга за какъв повод
- [Цени](${abs(site, ROUTES.prices)}): от какво зависи цената, изходни пакети и ориентировъчен калкулатор
- [Контакти](${abs(site, ROUTES.contact)}): проверка на свободна дата, форма за запитване и заявка за обаждане
- [Политика за поверителност](${abs(site, ROUTES.privacy)}): как се обработват данните от формата

## Услуги

${services.map(s => `- [${s.title}](${abs(site, serviceUrl(s.slug))}): ${s.description}`).join('\n')}

## Контакт

- Имейл: ${CONTACT_EMAIL}
- Телефон: ${CONTACT_PHONE}

## Optional

- [Пълно съдържание](${abs(site, 'llms-full.txt')}): всички услуги, видове събития, допълнителни опции, пакети и цени в един текст
`);
};
