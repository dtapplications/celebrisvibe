import type { APIRoute } from 'astro';
import { abs, textResponse } from '../lib/urls';

// Note: crawlers only read robots.txt at a domain root. Under a GitHub Pages project
// path (/celebrisvibe/) it is ignored; it takes effect once the site has its own domain.
export const GET: APIRoute = ({ site }) => textResponse(`User-agent: *
Allow: /

Sitemap: ${abs(site, 'sitemap.xml')}
`);
