// Absolute URL for a path inside the site, e.g. abs(site, 'llms.txt').
export function abs(site: URL | undefined, path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  return new URL(base + path, site).href;
}

export const textResponse = (body: string) =>
  new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
