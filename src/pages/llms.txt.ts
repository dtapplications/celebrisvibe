import type { APIRoute } from 'astro';
import { CONTACT_EMAIL, CONTACT_PHONE, SERVICE_DETAILS, EVENT_TYPES } from '../data/site';
import { abs, textResponse } from '../lib/urls';

// Index for AI assistants, following https://llmstxt.org
export const GET: APIRoute = ({ site }) => {
  const home = abs(site);
  const events = EVENT_TYPES.map(e => e.title.toLowerCase());
  return textResponse(`# Celebris Vibe

> Celebris Vibe е DJ и събитийна компания в България: DJ, водещ, професионално озвучаване и осветление за ${events.slice(0, -1).join(', ')} и ${events.at(-1)}.

Сайтът е на български език. Услугите са ${SERVICE_DETAILS.map(s => s.title).join(', ')}. Цените на сайта са ориентировъчни - точна оферта се изпраща до един работен ден след запитване. Свободна дата може да се провери онлайн на страницата Контакти.

## Страници

- [Начало](${home}): представяне, услугите с примери, видове събития и допълнителни опции
- [Услуги](${home}#services): ${SERVICE_DETAILS.map(s => s.title).join(', ')} - какво включва всяка услуга и за какви поводи е подходяща
- [Цени](${home}#prices): от какво зависи цената, изходни пакети и ориентировъчен калкулатор
- [Контакти](${home}#contact): проверка на свободна дата, форма за запитване и заявка за обаждане
- [Политика за поверителност](${home}#privacy): как се обработват данните от формата

## Контакт

- Имейл: ${CONTACT_EMAIL}
- Телефон: ${CONTACT_PHONE}

## Optional

- [Пълно съдържание](${abs(site, 'llms-full.txt')}): всички услуги, видове събития, допълнителни опции, пакети и цени в един текст
`);
};
