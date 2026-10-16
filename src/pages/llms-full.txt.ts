import type { APIRoute } from 'astro';
import {
  CONTACT_EMAIL, CONTACT_PHONE, EVENT_TYPES, SERVICES, SERVICE_DETAILS, SERVICE_GUIDE,
  EXTRAS, PACKAGES, PRICE_FACTORS, PRICE_COMPARE, ALWAYS_INCLUDED,
} from '../data/site';
import { abs, textResponse } from '../lib/urls';

const list = (items: string[]) => items.map(i => `- ${i}`).join('\n');

// Full site content in one Markdown document for AI assistants (https://llmstxt.org).
export const GET: APIRoute = ({ site }) => {
  const home = abs(site);

  const services = SERVICE_DETAILS.map(s => {
    const highlights = SERVICES.find(x => x.key === s.key)?.items ?? [];
    return `### ${s.title}

${s.lead}

Какво включва:
${list(s.includes)}

Подходящо за: ${s.fits.join(', ')}.
${highlights.length ? `\nАкценти:\n${list(highlights.map(h => `${h.title}: ${h.desc} (${h.occasions.join(', ')})`))}\n` : ''}`;
  }).join('\n');

  return textResponse(`# Celebris Vibe

> DJ, водещ, професионално озвучаване и осветление за сватби, частни тържества и корпоративни събития в България. Уебсайт: ${home}

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

Няма фиксиран ценоразпис. Офертата е за цялото събитие, а не на час, и включва музика, техника, екип и транспорт.

### Изходни пакети (ориентировъчно)

${PACKAGES.map(p => `- ${p.name}, ${p.price.toLowerCase()} (${p.tagline.toLowerCase()}): ${p.items.join(', ')}`).join('\n')}

### Винаги включено в офертата

${list(ALWAYS_INCLUDED)}

### От какво зависи цената

${PRICE_FACTORS.map((f, i) => `${i + 1}. ${f.title}: ${f.desc}`).join('\n')}

### Какво да сравниш при оферти

${PRICE_COMPARE.map(([q, a]) => `- ${q} ${a}`).join('\n')}

## Как се резервира

1. Провери свободна дата на ${home}#contact
2. Изпрати запитване с дата, локация, вид събитие и брой гости, или поискай обаждане
3. Получи персонална оферта до един работен ден
4. След потвърждение датата е запазена

## Контакт

- Имейл: ${CONTACT_EMAIL}
- Телефон: ${CONTACT_PHONE}
- Форма за запитване: ${home}#contact
`);
};
