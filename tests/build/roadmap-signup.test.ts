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

  it('posts JSON to the lead endpoint and sends the visitor to its own receipt', () => {
    expect(src).toMatch(/fetch\('\/api\/lead'[\s\S]{0,200}'Content-Type':\s*'application\/json'/);
    expect(src).toMatch(/data-success-path="\/roadmap\/thanks"/);
    expect(src).toMatch(/window\.location\.href\s*=\s*destination/);
  });

  // A roadmap subscriber is not a project intake. /thanks promises "a recorded
  // video teardown from Michael, within 24 hours", which is false for someone
  // who only asked to follow a build -- so both the JS and the no-JS path have
  // to land somewhere that promises nothing.
  it('never sends a roadmap subscriber to the site-review receipt', () => {
    expect(src).not.toMatch(/data-success-path="\/thanks"/);

    const receipt = read('src/pages/roadmap/thanks.astro');
    expect(receipt).toMatch(/path="\/roadmap\/thanks"/);
    expect(receipt).toMatch(/noindex=\{true\}/);

    // Assert on what SHIPS. The frontmatter explains which promise was removed
    // and why, so it names it on purpose; only the markup below --- reaches a
    // visitor, and that is what must be free of the site-review promise.
    const shipped = receipt.split('---').slice(2).join('---');
    for (const promise of [/teardown/i, /24 hours/i, /within 24/i]) {
      expect(shipped).not.toMatch(promise);
    }
  });

  it('routes the no-JS POST by intent from a server-side allowlist', () => {
    const api = read('functions/api/lead.ts');
    // The destination must come from a hard-coded map, never from the request,
    // or the endpoint becomes an open redirect.
    expect(api).toMatch(/INTENT_SUCCESS_PATHS[\s\S]{0,160}'book:roadmap-subscribe':\s*'\/roadmap\/thanks'/);
    expect(api).toMatch(/function successPathFor/);
    expect(api).toMatch(/redirectResponse\(successPathFor\(intent\)/);
    expect(api).toMatch(/return succeed\(lead\.intent\)/);
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
