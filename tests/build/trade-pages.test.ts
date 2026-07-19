import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (path: string) => readFileSync(root + path, 'utf8');

// Competitor research 2026-07-19 (TODO.md § vetted upgrades, high/M
// positioning): Footbridge/Hook sell to named trade verticals; our proof
// was already contractors but the copy sold to a generic "business". The
// /for/* pages are deep-link targets for trade-specific TikTok/IG videos,
// so message match (video → headline → proof → form) must hold end-to-end.
// This pins:
//   1. each page's proof references ONLY the real client(s) in that trade
//      (LAW #6 — no invented clients, no outcome cross-contamination);
//   2. each Intake carries a unique `source` so lead attribution can tell
//      the verticals apart;
//   3. the pages are discoverable (sitemap) and the funnel wiring
//      (hasIntakeOnPage → same-page #intake) covers /for/*.

const TRADES: ReadonlyArray<{
  file: string;
  path: string;
  source: string;
  clients: string[];
  absent: string[];
}> = [
  {
    file: 'src/pages/for/outdoor-living.astro',
    path: '/for/outdoor-living',
    source: 'for-outdoor-living',
    clients: ['Aries Outdoor Living'],
    absent: ['Big 7 Construction'],
  },
  {
    file: 'src/pages/for/construction.astro',
    path: '/for/construction',
    source: 'for-construction',
    clients: ['Big 7 Construction'],
    absent: ['Aries Outdoor Living'],
  },
  {
    file: 'src/pages/for/home-services.astro',
    path: '/for/home-services',
    source: 'for-home-services',
    clients: ['Aries Outdoor Living', 'Big 7 Construction'],
    absent: [],
  },
];

describe('trade landing pages — message match + real proof only', () => {
  for (const t of TRADES) {
    const src = read(t.file);

    it(`${t.path} mounts the funnel: minimal Header, TradeLanding, Intake(source=${t.source})`, () => {
      expect(src).toMatch(/<Header[^>]*\bminimal=\{true\}/);
      expect(src).toMatch(/<TradeLanding(?![A-Za-z0-9_])/);
      expect(src).toMatch(new RegExp(`<Intake[\\s\\S]{0,400}source="${t.source}"`));
    });

    it(`${t.path} proof names only the matching real client(s)`, () => {
      for (const c of t.clients) {
        expect(src, `${t.file} must cite ${c}`).toContain(c);
      }
      for (const a of t.absent) {
        expect(src, `${t.file} must not borrow ${a}'s outcome`).not.toContain(a);
      }
    });

    it(`${t.path} states the teardown deliverable (offer parity with /audit)`, () => {
      expect(src).toMatch(/video teardown|teardown/i);
    });
  }

  it('TradeLanding CTA carries tracked funnel metadata into a per-trade bucket', () => {
    const src = read('src/components/TradeLanding.astro');
    expect(src).toMatch(/data-cta="trade-review"[\s\S]{0,120}data-section=\{`for-\$\{trade\}`\}[\s\S]{0,120}data-intent="book:free-review"/);
    expect(src).toMatch(/data-cta="trade-see-work"[\s\S]{0,160}data-intent="product:case-studies"/);
    // Proof facts are the verified ones shared with Hero + /audit + /thanks —
    // TradeLanding renders whatever the page passes, so pages pin the names
    // above; here pin that the component has no hardcoded client claims.
    expect(src).not.toContain('Sold at handoff');
  });

  it('all three trade pages are listed in the sitemap', () => {
    const sitemap = read('public/sitemap.xml');
    for (const t of TRADES) {
      expect(sitemap).toContain(`<loc>https://m3mm.net${t.path}</loc>`);
    }
  });

  it('hasIntakeOnPage covers /for/* in Header, Footer, and Layout (sticky CTA)', () => {
    for (const file of [
      'src/components/Header.astro',
      'src/components/Footer.astro',
      'src/layouts/Layout.astro',
    ]) {
      expect(read(file), `${file} must treat /for/* as intake-bearing`).toMatch(
        /path\.startsWith\(['"]\/for\/['"]\)/,
      );
    }
  });
});
