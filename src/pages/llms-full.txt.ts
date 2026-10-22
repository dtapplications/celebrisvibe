import type { APIRoute } from 'astro';
import {
  CONTACT_EMAIL, CONTACT_PHONE, EVENT_TYPES, ROUTES, SERVICE_GUIDE,
  EXTRAS, PACKAGES, PACKAGES_NOTE, BASE_PRICES, PRICE_FACTORS, PRICE_COMPARE, OFFER_INCLUDES,
} from '../data/site';
import { SERVICES, serviceUrl } from '../data/services';
import { abs, textResponse } from '../lib/urls';

const list = (items: string[]) => items.map(i => `- ${i}`).join('\n');

// Full site content in one Markdown document for AI assistants (https://llmstxt.org).
export const GET: APIRoute = ({ site }) => {
  const contact = abs(site, ROUTES.contact);

  const services = SERVICES.map(s => `### ${s.title}

Страница: ${abs(site, serviceUrl(s.slug))}

${s.description}

Какво включва:
${list(s.includes)}

Подходящо за: ${s.fits.join(', ')}.

Акценти:
${list(s.highlights.map(h => `${h.title}: ${h.desc} (${h.occasions.join(', ')})`))}
`).join('\n');

  return textResponse(`# Celebris Vibe

> DJ, водещ, професионално озвучаване и осветление за сватби, частни тържества и корпоративни събития в България. Уебсайт: ${abs(site)}

Този документ съдържа цялото съдържание на сайта в един текст. Цените са ориентировъчни; точна оферта се изпраща до един работен ден след запитване.

## Видове събития

${EVENT_TYPES.map(e => `### ${e.title}

${e.desc}

${e.subtitle}. Включва: ${e.tags.join(', ')}.
`).join('\n')}
## Услуги

${services}
## Коя услуга за какъв повод

${SERVICE_GUIDE.map(g => `- ${g.title} (${g.when}): препоръка - ${g.rec}. ${g.desc}`).join('\n')}

## Допълнителни опции

${list(EXTRAS.map(e => `${e.title}: ${e.desc}`))}

## Цени

Страница: ${abs(site, ROUTES.prices)}

### ${BASE_PRICES.title}

${list(BASE_PRICES.items.map(([label, price]) => `${label} — ${price}`))}

${BASE_PRICES.note}

### Базови пакети (ориентировъчно)

${PACKAGES.map(p => `- ${p.name} (${[...p.prices, p.tagline].filter(Boolean).join(', ')}): ${p.items.join(', ')}${p.note ? `. ${p.note}` : ''}`).join('\n')}

${PACKAGES_NOTE}

### Какво включва офертата

Всяка услуга и разход се описват предварително. Според избрания пакет офертата може да включва:
${list(OFFER_INCLUDES)}

Няма автоматично добавени услуги — всичко включено се уточнява предварително в персоналната оферта.

### От какво зависи цената

${PRICE_FACTORS.map((f, i) => `${i + 1}. ${f.title}: ${f.desc}`).join('\n')}

### Какво да сравниш при оферти

${PRICE_COMPARE.map(([q, a]) => `- ${q} ${a}`).join('\n')}

## Как се резервира

1. Провери свободна дата на ${contact}
2. Изпрати запитване с дата, локация, вид събитие и брой гости, или поискай обаждане
3. Получи персонална оферта до един работен ден
4. След потвърждение датата е запазена

## Контакт

- Имейл: ${CONTACT_EMAIL}
- Телефон: ${CONTACT_PHONE}
- Форма за запитване: ${contact}
`);
};
