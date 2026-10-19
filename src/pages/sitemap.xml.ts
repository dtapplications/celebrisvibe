import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { ROUTES } from '../data/site';
import { abs } from '../lib/urls';

export const GET: APIRoute = async ({ site }) => {
  const services = await getCollection('services');
  const paths = [
    ROUTES.home,
    ROUTES.services,
    ...services.sort((a, b) => a.data.order - b.data.order).map(s => `${ROUTES.services}${s.id}/`),
    ROUTES.prices,
    ROUTES.contact,
    ROUTES.privacy,
  ];
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = paths.map(p => `  <url>
    <loc>${abs(site, p)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`).join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
