import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p: string) => readFileSync(root + p, 'utf8');

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
});
