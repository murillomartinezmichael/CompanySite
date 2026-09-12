import { defineConfig } from 'astro/config';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  site: 'https://m3mm.net',
  output: 'static',
  // Keep Tailwind 3 tokens; the old integration only supports Astro <=5.
  vite: { css: { postcss: { plugins: [tailwind(), autoprefixer()] } } },
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
});
