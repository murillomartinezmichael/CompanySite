import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// A _redirects target in bare form (/audit) lands on Cloudflare Pages' own
// 308 to /audit/, so every legacy link pays two hops (verified live
// 2026-11-27: /review -> 301 /audit -> 308 /audit/). Each target must be the
// final, 200-serving URL of a built page.
const root = fileURLToPath(new URL('../../', import.meta.url));
const rules = readFileSync(root + 'public/_redirects', 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => line.split(/\s+/));

describe('public/_redirects targets', () => {
  it('has rules', () => expect(rules.length).toBeGreaterThan(5));
  for (const [from, to] of rules) {
    it(`${from} -> ${to} lands on a served page in one hop`, () => {
      expect(to.startsWith('/')).toBe(true);
      const path = to.split('#')[0];
      expect(path.endsWith('/'), `${to} must end with / to avoid a second 308`).toBe(true);
      expect(existsSync(root + 'dist' + path + 'index.html'), `dist${path}index.html`).toBe(true);
    });
  }
});
