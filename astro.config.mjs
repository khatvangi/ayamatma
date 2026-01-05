// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'Ayamatma',
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        hi: { label: 'हिंदी', lang: 'hi' },
        te: { label: 'తెలుగు', lang: 'te' },
      },
      customCss: ['./src/styles/global.css'],
      components: {
        Head: './src/components/DocsHead.astro',
        Header: './src/components/DocsHeader.astro',
        Footer: './src/components/DocsFooter.astro',
      },
    }),
    mdx(),
    tailwind({ applyBaseStyles: false }),
  ],
});
