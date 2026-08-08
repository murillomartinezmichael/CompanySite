import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));

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

// CONVERSION_STANDARDS.md § 2 (intent metadata) + § 4 (attribution loop).
// Every conversion CTA must declare `data-intent` inline so wireCTAs()
// stamps the `cta_click` beacon with a real intent. A bare tracked CTA
// (data-cta but no data-intent) silently ships `intent: undefined` into
// the funnel dashboard — the click is counted, but no intent bucket
// picks it up, so it looks like a broken funnel.
//
// Two exceptions are legitimate today:
//
//   NAV-ONLY: elements that navigate but don't promise a conversion
//   outcome (logo → home, in-page nav to Work / Services, footer link
//   to the /accessibility statement). These are tracked so we can see
//   nav usage, but they don't need an intent.
//
//   FORM-SUBMIT: the intake-submit button reads its intent from the
//   enclosing form's hidden <input name="intent"> at click time (see
//   intake-submit-intent-fallback.test.ts). A literal data-intent
//   would go stale after a tier-CTA click updates the hidden input.
//
// Any NEW data-cta must either carry data-intent or be added to one of
// these lists with a written reason. This is the fence.

const NAV_ONLY_CTAS: ReadonlySet<string> = new Set([
  'logo',              // Header: brand mark → /
  'nav-proof',         // Header: in-page anchor → #proof
  'nav-services',      // Header: in-page anchor → #services
  'footer-a11y',       // Footer: nav → /accessibility statement page
  'signature-tiktok',  // Intake signature card: outbound nav to founder's
                       // TikTok profile — no conversion outcome to intent-tag.
]);

const FORM_SUBMIT_CTAS: ReadonlySet<string> = new Set([
  'intake-submit',  // Intake: intent from hidden input (fallback pinned separately)
]);

type CtaTag = {
  file: string;
  cta: string;
  hasIntent: boolean;
  hasSection: boolean;
  raw: string;
};

// Scan every <tag ... data-cta="…" …> across shipped source. Regex is
// bounded (no `.*` greediness) so an unclosed tag doesn't blow up.
function collectCtas(): CtaTag[] {
  const files = walkAstro(root + 'src');
  const rx = /<[a-zA-Z][a-zA-Z0-9]*\b[^>]*\bdata-cta="([^"]+)"[^>]*>/g;
  const out: CtaTag[] = [];
  for (const abs of files) {
    const rel = relative(root, abs).replace(/\\/g, '/');
    const src = readFileSync(abs, 'utf8');
    for (const m of src.matchAll(rx)) {
      out.push({
        file: rel,
        cta: m[1],
        raw: m[0],
        hasIntent: /\bdata-intent="[^"]+"/.test(m[0]),
        // Accept either the literal `data-section="…"` or Astro's
        // expression form `data-section={source}` (Hero passes its
        // placement in via a prop so a future page can override).
        hasSection: /\bdata-section=("[^"]+"|\{[^}]+\})/.test(m[0]),
      });
    }
  }
  return out;
}

describe('§ 2 + § 4 — every tracked CTA carries an intent or is nav-only', () => {
  const ctas = collectCtas();

  it('finds every currently-shipped data-cta element', () => {
    // Sanity: if the walker returns zero, the regex broke. The site has
    // ~15 conversion CTAs plus a handful of nav CTAs; guard the floor
    // so a silent regex regression can't quietly pass the whole suite.
    expect(ctas.length, 'walker must find CTAs — regex likely broken').toBeGreaterThan(10);
  });

  it('every data-cta has data-intent OR is on an explicit exception list', () => {
    const offenders: string[] = [];
    for (const t of ctas) {
      if (t.hasIntent) continue;
      if (NAV_ONLY_CTAS.has(t.cta)) continue;
      if (FORM_SUBMIT_CTAS.has(t.cta)) continue;
      offenders.push(`${t.file}: data-cta="${t.cta}" has no data-intent`);
    }
    expect(
      offenders,
      `New tracked CTAs missing data-intent — add data-intent or add the CTA name to NAV_ONLY_CTAS / FORM_SUBMIT_CTAS with a written reason:\n  ${offenders.join('\n  ')}`,
    ).toEqual([]);
  });

  it('every NAV_ONLY_CTAS entry is actually shipped somewhere (no dead allowlist)', () => {
    // If an allowlisted CTA is removed from source but stays on the list,
    // a future edit could reintroduce that data-cta name without intent
    // and this test would silently permit it. Enforce that every entry
    // corresponds to a real element in shipped source.
    const shipped = new Set(ctas.map((t) => t.cta));
    const dead: string[] = [];
    for (const name of NAV_ONLY_CTAS) {
      if (!shipped.has(name)) dead.push(name);
    }
    expect(
      dead,
      `NAV_ONLY_CTAS contains names not present in source — remove them:\n  ${dead.join(', ')}`,
    ).toEqual([]);
  });

  it('every FORM_SUBMIT_CTAS entry is actually shipped somewhere (no dead allowlist)', () => {
    const shipped = new Set(ctas.map((t) => t.cta));
    const dead: string[] = [];
    for (const name of FORM_SUBMIT_CTAS) {
      if (!shipped.has(name)) dead.push(name);
    }
    expect(
      dead,
      `FORM_SUBMIT_CTAS contains names not present in source — remove them:\n  ${dead.join(', ')}`,
    ).toEqual([]);
  });

  it('every data-cta also declares data-section (funnel placement bucket)', () => {
    // wireCTAs() reads `el.dataset.section` into every cta_click beacon
    // (see src/lib/track.ts). A CTA without data-section ships
    // `section: undefined` — the click counts, but the funnel dashboard
    // can't tell whether it fired from Hero, Services, Footer, or the
    // sticky mobile bar. Same class of silent data loss the intent pin
    // above closes; pin section too so a future CTA can't skip it.
    // No allowlist — every currently-shipped CTA already carries
    // data-section, so drift lands as a test failure instead of a
    // sneaky "unknown-bucket" spike in Cockpit.
    const offenders: string[] = [];
    for (const t of ctas) {
      if (!t.hasSection) offenders.push(`${t.file}: data-cta="${t.cta}" has no data-section`);
    }
    expect(
      offenders,
      `New tracked CTAs missing data-section — add data-section="<placement>" so cta_click carries a real funnel bucket:\n  ${offenders.join('\n  ')}`,
    ).toEqual([]);
  });

  it('every data-cta value is unique-ish (no accidental copy-paste collisions)', () => {
    // A duplicated data-cta name across two different destinations makes
    // funnel analysis lie: the two placements collapse into one bucket.
    // Exception: `downshift-siteguide` intentionally shares one name
    // across audit-hero + services placements (both are the same
    // downshift path); `logo` renders once per page but only lives in
    // one file. Guard the floor without banning legitimate reuse.
    const KNOWN_REUSED: ReadonlySet<string> = new Set(['downshift-siteguide']);
    const seen = new Map<string, string[]>();
    for (const t of ctas) {
      const files = seen.get(t.cta) || [];
      files.push(t.file);
      seen.set(t.cta, files);
    }
    const bad: string[] = [];
    for (const [cta, files] of seen) {
      const uniqueFiles = [...new Set(files)];
      if (uniqueFiles.length > 1 && !KNOWN_REUSED.has(cta)) {
        bad.push(`data-cta="${cta}" appears in multiple files: ${uniqueFiles.join(', ')}`);
      }
    }
    expect(
      bad,
      `Duplicated data-cta across files — rename to disambiguate the funnel, or add to KNOWN_REUSED with a reason:\n  ${bad.join('\n  ')}`,
    ).toEqual([]);
  });
});
