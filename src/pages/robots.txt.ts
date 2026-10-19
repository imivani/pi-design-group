import type { APIRoute } from 'astro';

// Search engines may list every page; the sitemap tells them where the pages are.
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(import.meta.env.BASE_URL + 'sitemap.xml', site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
