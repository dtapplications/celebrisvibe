import type { APIRoute } from 'astro';
import { ROUTES } from '../data/site';
import { SERVICES, serviceUrl } from '../data/services';
import { abs } from '../lib/urls';

export const GET: APIRoute = ({ site }) => {
  const paths = [
    ROUTES.home,
    ROUTES.services,
    ...SERVICES.map(s => serviceUrl(s.slug)),
    ROUTES.prices,
    ROUTES.contact,
    ROUTES.privacy,
    '/qr/',
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
