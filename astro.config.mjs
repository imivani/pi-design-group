import { defineConfig } from 'astro/config';
export default defineConfig({
  output: 'static',
  // Public address used for canonical links, share images and the sitemap.
  site: process.env.SITE_URL || 'https://pi-design-group.vercel.app',
  devToolbar: { enabled: false },
  base: process.env.SITE_BASE || '/',
  server: { host: '127.0.0.1', port: 4321 },
  vite: { build: { sourcemap: true } },
});
