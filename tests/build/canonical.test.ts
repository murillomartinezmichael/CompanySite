import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p: string) => readFileSync(root + p, 'utf8');

const PROD_ORIGIN = 'https://m3mm.net';

describe('canonical URL wiring', () => {
  it('astro.config.mjs pins site to the production origin', () => {
    const cfg = read('astro.config.mjs');
    expect(cfg).toMatch(new RegExp(`site:\\s*['"\`]${PROD_ORIGIN}['"\`]`));
  });

  it('Layout.astro emits <link rel="canonical"> from Astro.site', () => {
    const layout = read('src/layouts/Layout.astro');
    expect(layout).toMatch(/<link\s+rel="canonical"\s+href=\{canonical\}\s*\/>/);
    expect(layout).toMatch(/const canonical = new URL\(path, Astro\.site\s*\?\?\s*['"]https:\/\/m3mm\.net['"]\)/);
  });

  it('Layout.astro keeps og:url in sync with canonical', () => {
    const layout = read('src/layouts/Layout.astro');
    expect(layout).toMatch(/property="og:url"\s+content=\{canonical\}/);
  });

  it('rendered source (excluding legacy/) has no companysite-production.up.railway.app leakage', () => {
    for (const path of [
      'src/layouts/Layout.astro',
      'src/pages/index.astro',
      'src/pages/audit.astro',
      'public/_headers',
      'public/_redirects',
      'public/robots.txt',
    ]) {
      expect(read(path)).not.toMatch(/companysite-production\.up\.railway\.app/i);
    }
  });
});
