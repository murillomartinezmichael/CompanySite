import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p: string) => readFileSync(root + p, 'utf8');

function walkAstro(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) {
      out.push(...walkAstro(abs));
    } else if (name.endsWith('.astro')) {
      out.push(abs);
    }
  }
  return out;
}

// CONVERSION_STANDARDS.md § 1 — no dead-end CTAs. Two currently-correct
// invariants sit unpinned in shipped source:
//
//   1. `<Hero />` renders a `data-cta="hero-review"` anchor whose default
//      href is `#intake`. It works today only because Hero mounts on `/`
//      which also mounts `<Intake />` (renders <section id="intake">).
//      A future edit that drops Hero on /thanks or /accessibility silently
//      lands the visitor at the top of the page with no form to fill.
//
//   2. `<Header minimal={false}>` (the default) renders the nav bar with
//      literal `href="#proof"` and `href="#services"` anchors targeting
//      <Proof /> and <Services />. Every non-homepage today opts in with
//      `minimal={true}` — flipping that on a page without those sections
//      re-introduces the dead-ends that `intake-cta.test.ts` closed for
//      `#intake`.
//
// Pin both at the page-composition layer so the regression fails CI
// instead of silently shipping.

const PAGES: ReadonlyArray<string> = walkAstro(root + 'src/pages')
  .map((abs) => relative(root, abs).replace(/\\/g, '/'))
  .sort();

function componentUsed(src: string, name: string): boolean {
  // Matches `<Name />`, `<Name>`, `<Name\n  prop=...>` — but not
  // `<NameSomethingElse />`. Word boundary via lookahead on non-identifier.
  return new RegExp(`<${name}(?![A-Za-z0-9_])`).test(src);
}

describe('§ 1 — page anchors resolve to sections on the same page', () => {
  it('every page rendering <Hero /> also renders <Intake /> (Hero CTA targets #intake)', () => {
    const offenders: string[] = [];
    for (const file of PAGES) {
      const src = read(file);
      if (!componentUsed(src, 'Hero')) continue;
      if (!componentUsed(src, 'Intake')) {
        offenders.push(`${file}: renders <Hero /> without <Intake /> — hero-review CTA dead-ends at #intake`);
      }
    }
    expect(
      offenders,
      `Hero mounted on pages without Intake — either mount <Intake /> or pass a non-anchor ctaHref:\n  ${offenders.join('\n  ')}`,
    ).toEqual([]);
  });

  it('every page rendering <Header minimal={false}> (or default) also renders <Proof /> and <Services />', () => {
    const missing: string[] = [];
    for (const file of PAGES) {
      const src = read(file);
      if (!componentUsed(src, 'Header')) continue;
      // Header defaults to minimal=false. Only the explicit
      // `minimal={true}` prop suppresses the nav bar.
      const isMinimal = /<Header[^>]*\bminimal=\{true\}/.test(src);
      if (isMinimal) continue;
      if (!componentUsed(src, 'Proof')) {
        missing.push(`${file}: Header nav renders (minimal!=true) without <Proof /> — nav-proof (#proof) dead-ends`);
      }
      if (!componentUsed(src, 'Services')) {
        missing.push(`${file}: Header nav renders (minimal!=true) without <Services /> — nav-services (#services) dead-ends`);
      }
    }
    expect(
      missing,
      `Header nav-* anchors point at sections not on the page — pass minimal={true} or mount the section:\n  ${missing.join('\n  ')}`,
    ).toEqual([]);
  });

  it('Hero.astro default ctaHref stays a same-page anchor (invariant this test relies on)', () => {
    // If Hero's default ctaHref ever changes to an absolute or cross-page
    // URL, the first invariant above becomes irrelevant — this pin
    // documents the coupling so a Hero refactor forces a matching update
    // to the invariant.
    const src = read('src/components/Hero.astro');
    expect(src).toMatch(/ctaHref\s*=\s*['"]#intake['"]/);
  });

  it('Header.astro nav anchors stay same-page (invariant this test relies on)', () => {
    // Same coupling as above — if Header nav switches to absolute URLs
    // (e.g. `/services` as its own page), the second invariant is moot
    // and this file needs updating with the new contract.
    const src = read('src/components/Header.astro');
    expect(src).toMatch(/href="#proof"/);
    expect(src).toMatch(/href="#services"/);
  });
});
