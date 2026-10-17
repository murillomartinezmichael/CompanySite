import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// These pages are created by scripts/build-investors.mjs after the Astro build.
// Investor-preview assets are mounted under /investors/assets in the main site.
describe('integrated investor pages ship their referenced static assets', () => {
  const routes = ['', 'accessibility/', 'infrastructure/'] as const;

  for (const route of routes) {
    it(`omits standalone preview-only asset paths and withheld presenter CSS on /investors/${route}`, () => {
      const html = readFileSync(
        new URL(`../../dist/investors/${route}index.html`, import.meta.url),
        'utf8',
      );

      expect(html).not.toMatch(/(?:src|href|poster)="\/assets\//);
      expect(html).not.toMatch(/<link[^>]+href="[^"]*presenter\.css"/);
      expect(html).toMatch(/<link[^>]+rel="canonical"/);
    });
  }

  it('ships the exact approved investor logo unchanged', () => {
    const original = readFileSync(new URL('../../public/official-logo.png', import.meta.url));
    const integrated = readFileSync(
      new URL('../../dist/investors/assets/official-logo.png', import.meta.url),
    );

    const sha256 = (data: Buffer) => createHash('sha256').update(data).digest('hex');
    expect(sha256(integrated)).toBe(sha256(original));
  });
});
