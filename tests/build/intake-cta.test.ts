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
});
