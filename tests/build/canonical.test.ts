import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p: string) => readFileSync(root + p, 'utf8');

const PROD_ORIGIN = 'https://m3mm.net';

// Every page renders <Layout path=…>. Layout derives canonical + og:url
// from that prop; if a page omits it, Layout's default (`'/'`) silently
// stamps the homepage URL onto every non-root page and duplicates the
// canonical across the site. Pin the wiring at both the Layout-source
// level and the per-page-invocation level.
const PAGE_EXPECTATIONS: ReadonlyArray<{ file: string; path: string }> = [
  { file: 'src/pages/index.astro', path: '/' },
  { file: 'src/pages/audit.astro', path: '/audit' },
  { file: 'src/pages/thanks.astro', path: '/thanks' },
  { file: 'src/pages/accessibility.astro', path: '/accessibility' },
];

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

  it('rendered source has no companysite-production.up.railway.app leakage', () => {
    // Pages, layout, and static config assets — anywhere the Railway
    // preview subdomain could sneak back into the shipped HTML.
    for (const path of [
      'src/layouts/Layout.astro',
      'src/pages/index.astro',
      'src/pages/audit.astro',
      'src/pages/thanks.astro',
      'src/pages/accessibility.astro',
      'public/_headers',
      'public/_redirects',
      'public/robots.txt',
    ]) {
      expect(read(path)).not.toMatch(/companysite-production\.up\.railway\.app/i);
    }
  });

  it('every src/pages/*.astro file is covered by an expectation', () => {
    // If someone adds a new page and forgets to pin it here, the audit
    // silently rots. Enumerate the directory and diff against the list
    // — any *.astro file missing from PAGE_EXPECTATIONS fails.
    const disk = readdirSync(root + 'src/pages')
      .filter((f) => f.endsWith('.astro'))
      .map((f) => `src/pages/${f}`)
      .sort();
    const covered = PAGE_EXPECTATIONS.map((p) => p.file).sort();
    expect(disk).toEqual(covered);
  });

  it('every page passes its own path= to <Layout> so canonical is per-page-correct', () => {
    // Layout.astro defaults `path='/'`. A page that omits `path=` will
    // render the homepage canonical, deduping SEO signal across the
    // site. Match the exact literal so a stray `path={someVar}` also
    // fails the pin (paths must be static + reviewable in source).
    for (const { file, path } of PAGE_EXPECTATIONS) {
      const src = read(file);
      expect(src, `${file} must mount <Layout path="${path}">`).toMatch(
        new RegExp(`<Layout\\b[^>]*\\bpath="${path}"`),
      );
    }
  });
});
