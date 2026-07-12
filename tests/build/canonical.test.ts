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
      'public/sitemap.xml',
    ]) {
      expect(read(path)).not.toMatch(/companysite-production\.up\.railway\.app/i);
    }
  });

  it('sitemap.xml every <loc> uses the production origin', () => {
    // Canonical points to m3mm.net; if sitemap ever advertised a Railway
    // (or Cloudflare Pages preview) origin, Google would be told two
    // different absolute URLs for the same page and pick whichever won
    // its own de-dupe heuristic. Pin the origin at the sitemap level so
    // canonical + sitemap can't drift.
    const sitemap = read('public/sitemap.xml');
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    expect(locs.length, 'sitemap.xml must list at least one URL').toBeGreaterThan(0);
    for (const loc of locs) {
      expect(loc, `sitemap.xml <loc> must use ${PROD_ORIGIN}: ${loc}`).toMatch(
        new RegExp(`^${PROD_ORIGIN.replace(/[.]/g, '\\.')}(/|$)`),
      );
    }
  });

  it('robots.txt Sitemap: directive points at the production sitemap URL', () => {
    // A stale Sitemap: line (Railway preview, wrong path, missing scheme)
    // silently costs crawl budget on the correct sitemap. Match the exact
    // production shape so a well-meaning edit can't lower-case the origin
    // or drop the scheme without failing here.
    const robots = read('public/robots.txt');
    expect(robots).toMatch(new RegExp(`^Sitemap:\\s+${PROD_ORIGIN.replace(/[.]/g, '\\.')}/sitemap\\.xml\\s*$`, 'm'));
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
