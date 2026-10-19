import type { APIRoute } from 'astro';
import { projects, projectPath } from '../data/projects';

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL;
  const paths = [base, base + 'about', base + 'contact', ...projects.map(project => projectPath(project, base))];
  const urls = paths.map(path => `  <url><loc>${new URL(path, site).href}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
