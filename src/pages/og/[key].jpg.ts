import type { APIRoute, GetStaticPaths } from 'astro';
import { OG_PAGES } from '../../data/og';
import { renderOg } from '../../lib/og';

export const getStaticPaths: GetStaticPaths = () => Object.keys(OG_PAGES).map(key => ({ params: { key } }));

export const GET: APIRoute = async ({ params }) => {
  const jpg = await renderOg(OG_PAGES[params.key!]);
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
