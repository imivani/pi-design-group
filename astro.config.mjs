import { defineConfig } from 'astro/config';
export default defineConfig({
  output: 'static',
  devToolbar: { enabled: false },
  base: process.env.SITE_BASE || '/',
  server: { host: '127.0.0.1', port: 4321 },
  vite: { build: { sourcemap: true } },
});
