import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p: string) => readFileSync(root + p, 'utf8');

// CONVERSION_STANDARDS.md § 1 — no dead-end CTAs.
// Only `/` and `/audit` render <Intake>. If Header or Footer emit a bare
// `#intake` href on any other page, the click scrolls to the top and the
// promise ("Free review") silently breaks. Header + Footer now accept a
// `path` prop and cross-navigate to `/audit#intake` on pages without the
// section. This test pins the wiring so a future page (about, pricing,
// etc.) cannot silently regress into a dead-end by forgetting the prop.

describe('Header + Footer thread `path` so intake CTAs never dead-end', () => {
  it('Header derives an intakeHref from the current path', () => {
    const src = read('src/components/Header.astro');
    expect(src).toMatch(/path\?:\s*string/);
    expect(src).toMatch(/const\s+intakeHref\s*=\s*hasIntakeOnPage\s*\?\s*['"]#intake['"]\s*:\s*['"]\/audit#intake['"]/);
    // Every `#intake` href in Header now flows through intakeHref — the
    // literal `href="#intake"` shape must be gone.
    expect(src).not.toMatch(/href="#intake"/);
  });

  it('Footer derives an intakeHref from the current path', () => {
    const src = read('src/components/Footer.astro');
    expect(src).toMatch(/path\?:\s*string/);
    expect(src).toMatch(/const\s+intakeHref\s*=\s*hasIntakeOnPage\s*\?\s*['"]#intake['"]\s*:\s*['"]\/audit#intake['"]/);
    expect(src).not.toMatch(/href="#intake"/);
  });

  it('every page that mounts Header or Footer passes its own path', () => {
    // Any .astro page that renders Header or Footer must forward its path.
    // Otherwise the components fall back to `/` and re-introduce the
    // dead-end on pages like /thanks and /accessibility.
    const pages: Array<{ file: string; expected: string }> = [
      { file: 'src/pages/index.astro', expected: '/' },
      { file: 'src/pages/audit.astro', expected: '/audit' },
      { file: 'src/pages/thanks.astro', expected: '/thanks' },
      { file: 'src/pages/accessibility.astro', expected: '/accessibility' },
      // Trade landing pages (2026-07-19) — each mounts <Intake>, and
      // Header/Footer/Layout's hasIntakeOnPage now includes `/for/*` so
      // their CTAs stay same-page anchors instead of bouncing the visitor
      // to /audit mid-funnel.
      { file: 'src/pages/for/outdoor-living.astro', expected: '/for/outdoor-living' },
      { file: 'src/pages/for/construction.astro', expected: '/for/construction' },
      { file: 'src/pages/for/home-services.astro', expected: '/for/home-services' },
    ];
    for (const { file, expected } of pages) {
      const src = read(file);
      const hasHeader = /<Header\b/.test(src);
      const hasFooter = /<Footer\b/.test(src);
      if (hasHeader) {
        expect(src, `${file} <Header> must forward path="${expected}"`)
          .toMatch(new RegExp(`<Header[^>]*\\bpath=(?:"${expected}"|\\{["']${expected}["']\\})`));
      }
      if (hasFooter) {
        expect(src, `${file} <Footer> must forward path="${expected}"`)
          .toMatch(new RegExp(`<Footer[^>]*\\bpath=(?:"${expected}"|\\{["']${expected}["']\\})`));
      }
    }
  });

  it('/thanks and /accessibility route intake CTAs to /audit#intake, never dead-end', () => {
    // Belt-and-suspenders: the Header/Footer logic above is the primary
    // guarantee. This asserts the two pages currently in this bucket
    // don't grow a rogue inline `#intake` link that would still dead-end
    // even if Header/Footer were fixed.
    for (const file of ['src/pages/thanks.astro', 'src/pages/accessibility.astro']) {
      const src = read(file);
      // Any inline anchor to #intake would be a fresh dead-end.
      expect(src, `${file} must not link directly to #intake`).not.toMatch(/href="#intake"/);
    }
  });

  it('Layout sticky-mobile CTA uses the same intakeHref pattern (no bare /audit fallback)', () => {
    // Sticky mobile is the TikTok-thumb primary CTA once the visitor
    // scrolls past the hero. Previously `href={path === '/audit' ? '#intake' : '/audit'}`
    // — the else branch dropped visitors at the top of /audit and forced
    // an extra scroll to reach the form. Now mirrors Header/Footer's
    // hasIntakeOnPage / intakeHref shape so the fallback lands the
    // visitor directly in the form.
    const src = read('src/layouts/Layout.astro');
    expect(src).toMatch(/const\s+hasIntakeOnPage\s*=\s*path\s*===\s*['"]\/['"]\s*\|\|\s*path\s*===\s*['"]\/audit['"]/);
    expect(src).toMatch(/const\s+stickyIntakeHref\s*=\s*hasIntakeOnPage\s*\?\s*['"]#intake['"]\s*:\s*['"]\/audit#intake['"]/);
    // The sticky anchor now uses the derived href — the literal bare
    // `/audit` fallback shape must be gone.
    expect(src).not.toMatch(/href=\{path\s*===\s*['"]\/audit['"]\s*\?\s*['"]#intake['"]\s*:\s*['"]\/audit['"]\}/);
    // And the sticky <a> is wired to the new variable name.
    expect(src).toMatch(/id=["']sticky-cta["'][\s\S]{0,200}href=\{stickyIntakeHref\}/);
  });
});
