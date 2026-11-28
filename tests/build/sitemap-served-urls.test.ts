import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Sitemap <loc> must be the URL that answers 200 and matches the page's own
// canonical. Bare /about 308-redirects to /about/ on Cloudflare Pages, and a
// sitemap of redirecting URLs is flagged "Page with redirect" in Search Console.
const dist = fileURLToPath(new URL('../../dist/', import.meta.url));
const sitemap = readFileSync(dist + 'sitemap.xml', 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

describe('sitemap.xml lists served, canonical URLs', () => {
  it('has entries', () => expect(locs.length).toBeGreaterThan(40));
  for (const loc of locs) {
    it(`${loc} ends with a slash and matches its page canonical`, () => {
      expect(loc).toMatch(/^https:\/\/m3mm\.net\/(.*\/)?$/);
      const route = new URL(loc).pathname;
      const file = dist + route.slice(1) + 'index.html';
      expect(existsSync(file), file).toBe(true);
      const canonical = readFileSync(file, 'utf8').match(/<link rel="canonical" href="([^"]+)"/)?.[1];
      expect(canonical).toBe(loc);
    });
  }
});
