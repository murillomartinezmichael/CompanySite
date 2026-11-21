/**
 * Unknown URLs must get a real 404, and the public footer must not link a private route.
 *
 * Cloudflare Pages returns dist/404.html with status 404 when it exists; without it Pages
 * serves the homepage with 200 for every unknown path (found 2026-10-23 by a Teardown audit:
 * /definitely-not-a-page-xyz -> 200). The same audit found the footer's "Private workspace"
 * link returning 503 JSON to public visitors.
 * dist/ assertions follow this suite's convention: skip when no build is present.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const DIST_404 = join(ROOT, 'dist/404.html');
const FOOTER = join(ROOT, 'src/components/Footer.astro');

describe('not-found page', () => {
  it('has a source page', () => {
    expect(existsSync(join(ROOT, 'src/pages/404.astro'))).toBe(true);
  });

  it.skipIf(!existsSync(join(ROOT, 'dist')))('ships dist/404.html at the root, noindexed, not the homepage', () => {
    expect(existsSync(DIST_404), 'dist/404.html missing — Pages falls back to a 200 homepage').toBe(true);
    const html = readFileSync(DIST_404, 'utf8');
    expect(html).toContain('Page not');
    expect(html).toMatch(/<meta name="robots" content="noindex,nofollow"/);
    expect(html).not.toContain('data-page="/"');
  });
});

describe('public footer', () => {
  it('does not link the private owner workspace', () => {
    expect(readFileSync(FOOTER, 'utf8')).not.toMatch(/href="\/workspace/);
  });
});
