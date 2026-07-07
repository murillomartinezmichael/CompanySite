import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://m3mm.net',
  output: 'static',
  integrations: [tailwind({ applyBaseStyles: false })],
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
});
