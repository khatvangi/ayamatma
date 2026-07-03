// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// standalone static site for the journal — its own domain, no shared deploy
// with ayamatma.com. static output (no cloudflare adapter): the journal has
// no server routes.
export default defineConfig({
  site: 'https://ajvs.ayamatma.com',
  integrations: [mdx(), sitemap()],
});
