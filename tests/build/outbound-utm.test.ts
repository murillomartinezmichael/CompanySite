import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p: string) => readFileSync(root + p, 'utf8');

function walkSrc(dir: string, exts: ReadonlyArray<string>): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) {
      out.push(...walkSrc(abs, exts));
    } else if (exts.some((e) => name.endsWith(e))) {
      out.push(abs);
    }
  }
  return out;
}

// CONVERSION_STANDARDS.md § outbound attribution — every outbound link to
// SiteGuide must carry the UTM triplet so downshifted traffic is
// attributable in Cloudflare Analytics and Cockpit. Historic gap: tick 17
// shipped UTMs on Footer / audit / thanks (`8f86748`) but missed Services;
// this pins the invariant so a future downshift can't silently regress.
//
// tick 25 (2026-07-12): downshift URLs now also carry `utm_content=<slug>`
// so the four placements sharing `utm_campaign=downshift` are disambiguated
// in SiteGuide's analytics without relying on utm_medium (which per Google's
// convention is meant for channel type, not placement). Matches the 4-UTM
// pattern already used by case-study outbound URLs.
const SITEGUIDE_HOST = 'siteguide-production.up.railway.app';
const UTM_KEYS = ['utm_source=m3mm', 'utm_medium=', 'utm_campaign=downshift', 'utm_content='] as const;

const SOURCES: Array<{ file: string; medium: string; content: string }> = [
  { file: 'src/components/Footer.astro',   medium: 'footer',   content: 'footer-link' },
  { file: 'src/components/Services.astro', medium: 'services', content: 'services-under-500' },
  { file: 'src/pages/audit.astro',         medium: 'audit',    content: 'audit-under-500' },
  { file: 'src/pages/thanks.astro',        medium: 'thanks',   content: 'thanks-storefront' },
  // Auto-reply email sent from /api/lead — highest-intent SiteGuide
  // outbound (visitor already submitted an intake and is browsing while
  // waiting for the 24h reply). Historic gap: prior sweeps only walked
  // `src/`, so this untagged link (until 2026-07-12) slipped both the
  // visual audit and CI. `utm_medium=email` since the placement lives in
  // an email body rather than a rendered HTML surface.
  { file: 'functions/api/lead.ts',         medium: 'email',    content: 'intake-reply' },
];

describe('outbound SiteGuide downshift links carry UTM attribution', () => {
  for (const { file, medium, content } of SOURCES) {
    it(`${file} — outbound SiteGuide link has utm_source, utm_medium=${medium}, utm_campaign=downshift, utm_content=${content}`, () => {
      const src = read(file);
      const rx = new RegExp(`https://${SITEGUIDE_HOST.replace(/\./g, '\\.')}/[^"'\\s]*`, 'g');
      const urls = src.match(rx) || [];
      expect(urls.length, `${file} should reference the SiteGuide host`).toBeGreaterThan(0);
      for (const url of urls) {
        for (const key of UTM_KEYS) {
          expect(url, `${file}: ${url} missing ${key}`).toContain(key);
        }
        expect(url, `${file}: ${url} should carry utm_medium=${medium}`).toContain(`utm_medium=${medium}`);
        expect(url, `${file}: ${url} should carry utm_content=${content}`).toContain(`utm_content=${content}`);
      }
    });
  }

  it('every downshift placement uses a unique utm_content slug', () => {
    const slugs = SOURCES.map((s) => s.content);
    expect(new Set(slugs).size, `duplicate utm_content slugs across placements: ${slugs.join(', ')}`).toBe(slugs.length);
  });

  it('no untagged siteguide-production link remains in shipped sources', () => {
    const scanned: string[] = [];
    for (const { file } of SOURCES) {
      const src = read(file);
      const rx = /https:\/\/siteguide-production\.up\.railway\.app\/[^"'\s]*/g;
      for (const url of src.match(rx) || []) {
        if (!url.includes('utm_source=')) scanned.push(`${file}: ${url}`);
      }
    }
    expect(scanned, `untagged SiteGuide links found: ${scanned.join(', ')}`).toEqual([]);
  });

  // Broadened invariant: the SOURCES above are the currently-placed
  // downshifts, but a new page (about, pricing, a landing test) or a new
  // server-side email template that adds its own SiteGuide outbound link
  // would slip past a hardcoded list. Walk every relevant file under both
  // `src/` and `functions/` and pin the same UTM contract at the repo
  // level, so an untagged link anywhere fails CI.
  //
  // Scope: files that render/emit HTML at build time OR emit HTML from a
  // Pages Function (e.g. auto-reply email bodies). Markdown case studies
  // keep raw client `liveUrl` values (`ariesoutdoorliving.com`,
  // `big7construction.com`) — `CaseStudy.astro` appends UTMs at render
  // time (asserted separately by `casestudy-outbound-utm.test.ts`).
  it('every siteguide-production URL anywhere in src/ + functions/ carries the downshift UTM contract', () => {
    const files = [
      ...walkSrc(root + 'src', ['.astro', '.ts', '.tsx', '.html']),
      ...walkSrc(root + 'functions', ['.astro', '.ts', '.tsx', '.html']),
    ];
    const rx = /https:\/\/siteguide-production\.up\.railway\.app\/[^"'\s)]*/g;
    const untagged: string[] = [];
    for (const abs of files) {
      const rel = relative(root, abs).replace(/\\/g, '/');
      const src = readFileSync(abs, 'utf8');
      for (const url of src.match(rx) || []) {
        const missing: string[] = [];
        if (!url.includes('utm_source=m3mm')) missing.push('utm_source=m3mm');
        if (!url.includes('utm_campaign=downshift')) missing.push('utm_campaign=downshift');
        if (!/[?&]utm_content=[^&]+/.test(url)) missing.push('utm_content=<slug>');
        if (missing.length) untagged.push(`${rel}: ${url} missing ${missing.join(', ')}`);
      }
    }
    expect(untagged, `SiteGuide outbound links missing UTM attribution:\n  ${untagged.join('\n  ')}`).toEqual([]);
  });
});
