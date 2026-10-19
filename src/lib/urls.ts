const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

// Site-relative link for a path like '/uslugi/' (keeps working if the site moves under a base path).
export const href = (path: string): string => BASE + path.replace(/^\//, '');

// Absolute URL for a path inside the site, e.g. abs(site, 'llms.txt').
export function abs(site: URL | undefined, path = ''): string {
  return new URL(href(path), site).href;
}

export const textResponse = (body: string) =>
  new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
