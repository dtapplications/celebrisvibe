import type { APIRoute } from 'astro';
import { abs, textResponse } from '../lib/urls';

// Note: crawlers only read robots.txt at a domain root, so this needs the site served
// from its own domain (celebrisvibe.com), not a project path.
export const GET: APIRoute = ({ site }) => textResponse(`User-agent: *
Allow: /

Sitemap: ${abs(site, 'sitemap.xml')}
`);
