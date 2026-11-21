import { it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

it('ships Michael’s original logo byte-for-byte, including its white background', () => {
  const expected = '27c7c0c1a8c069e4ea38c87a41c7a6d1523d00ebbde4c5e9eb6637372ec24e97';
  for (const location of ['../../public/official-logo.png', '../../dist/official-logo.png']) {
    const bytes = readFileSync(new URL(location, import.meta.url));
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(expected);
  }
});

// D-CS-014 (Michael, 2026-11-21): small marks and icons use a pure downscale of the original
// (scripts/make-logo-icon.mjs) so pages stop downloading the 804 KB file for a 44 px mark.
// The original stays the social/structured-data logo.
it('small marks and icons use the 192px copy; social and JSON-LD keep the original', () => {
  const icon = readFileSync(new URL('../../dist/official-logo-192.png', import.meta.url));
  expect(icon.readUInt32BE(16)).toBe(192); // PNG IHDR width
  expect(icon.readUInt32BE(20)).toBe(192); // PNG IHDR height
  expect(icon.length).toBeLessThan(40_000);
  const home = readFileSync(new URL('../../dist/index.html', import.meta.url), 'utf8');
  expect(home).not.toMatch(/<(img|link)\b[^>]*["']\/official-logo\.png["']/);
  expect(home).toMatch(/<link rel="icon"[^>]*href="\/official-logo-192\.png"/);
  expect(home).toMatch(/<meta property="og:image" content="https:\/\/m3mm\.net\/official-logo\.png"/);
  expect(home).toContain('"logo":"https://m3mm.net/official-logo.png"');
});
