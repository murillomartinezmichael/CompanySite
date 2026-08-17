import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p: string) => readFileSync(root + p, 'utf8');

// The /roadmap signup is the page's only CTA, and it was the one form on the
// site with no submit handler in front of it: a native POST navigated the
// visitor to /api/lead and rendered raw JSON. It also shipped no note field,
// which the endpoint requires, so the submit could not have succeeded at all.
// Both halves are pinned here.

const src = read('src/pages/roadmap.astro');

describe('/roadmap signup reaches the same success page as every other form', () => {
  it('intercepts its own submit instead of navigating to the API', () => {
    expect(src).toMatch(/getElementById\('roadmap-signup'\)/);
    expect(src).toMatch(/addEventListener\('submit'[\s\S]{0,120}preventDefault\(\)/);
  });

  it('posts JSON to the lead endpoint and sends the visitor to the thank-you page', () => {
    expect(src).toMatch(/fetch\('\/api\/lead'[\s\S]{0,200}'Content-Type':\s*'application\/json'/);
    expect(src).toMatch(/data-success-path="\/thanks"/);
    expect(src).toMatch(/window\.location\.href\s*=\s*destination/);
  });

  it('surfaces a failure to the visitor rather than swallowing it', () => {
    expect(src).toMatch(/id="roadmap-status"/);
    expect(src).toMatch(/aria-live="polite"/);
    expect(src).toMatch(/catch\s*\{[\s\S]{0,400}murillomartinezmichael@gmail\.com/);
  });

  it('always sends a note field, so the no-JS POST is a valid lead too', () => {
    // The endpoint requires `frustration` with a 10-character floor. The
    // optional topics box cannot satisfy that on its own.
    expect(src).toMatch(/type="hidden"\s*\n?\s*name="frustration"\s*\n?\s*value="Roadmap subscriber/);
    expect(src).toMatch(/name="topics"/);
    expect(src).toMatch(/data\.frustration = topics \?/);
  });

  it('lets the browser validate the email field on both paths', () => {
    expect(src).not.toMatch(/novalidate/);
  });

  it('the built page actually ships the handler', () => {
    const page = `${root}dist/roadmap/index.html`;
    if (!existsSync(page)) return;
    const html = readFileSync(page, 'utf8');
    expect(html).toContain('id="roadmap-signup"');
    const refs = [...html.matchAll(/src="(\/_astro\/[^"]+\.js)"/g)].map((m) => m[1]);
    const astroDir = `${root}dist/_astro`;
    const known = existsSync(astroDir) ? readdirSync(astroDir) : [];
    const bundles = refs.filter((r) => known.includes(r.split('/').pop() as string));
    const wired = bundles.some((r) => readFileSync(root + 'dist' + r, 'utf8').includes('preventDefault'));
    expect(wired, 'no /roadmap bundle calls preventDefault — the form would navigate to the API').toBe(true);
  });
});
