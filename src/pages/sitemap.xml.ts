import type { APIRoute } from 'astro';

// The site is a single page with hash routes (#services, #prices…), which search engines
// treat as one URL, so only real documents are listed here.
const PATHS = ['', 'qr/'];

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = PATHS.map(p => `  <url>
    <loc>${new URL(base + p, site).href}</loc>
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
