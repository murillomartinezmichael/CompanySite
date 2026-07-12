import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isReservedIntent } from '../../src/lib/prefill';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p: string) => readFileSync(root + p, 'utf8');

// CONVERSION_STANDARDS.md § 3 (intake surfaces prefill) + § 4 (attribution
// loop closes at every stage). Cross-page CTAs that carry a specific
// data-intent (product:case-studies from /thanks, book:accessibility-report
// from /accessibility) lose that intent on plain-anchor navigation — the
// destination form's hidden `intent` input renders with its default
// (`book:free-review`), so the downstream intake_submit event silently
// mis-attributes the lead.
//
// Fix threads intent via ?intent= — applyUrlPrefill() reads it on load,
// validates against RESERVED_INTENT_NAMESPACES, and stamps it into the
// hidden intent input before the visitor submits. This test pins the two
// current cross-page carriers so a future edit can't strip the query
// param and silently regress the attribution loop.

const CARRIERS: ReadonlyArray<{
  file: string;
  cta: string;
  destBase: string;
  intent: string;
  anchor: string;
}> = [
  {
    file: 'src/pages/thanks.astro',
    cta: 'thanks-see-work',
    destBase: '/',
    intent: 'product:case-studies',
    anchor: 'proof',
  },
  {
    file: 'src/pages/accessibility.astro',
    cta: 'accessibility-contact',
    destBase: '/audit',
    intent: 'book:accessibility-report',
    anchor: 'intake',
  },
];

describe('cross-page CTA fallbacks preserve data-intent via ?intent= URL param', () => {
  for (const { file, cta, destBase, intent, anchor } of CARRIERS) {
    describe(`${file} — data-cta="${cta}"`, () => {
      const src = read(file);
      const openTag = src.match(new RegExp(`<a\\b[^>]*data-cta="${cta}"[^>]*>`, 's'));

      it('anchor tag is present', () => {
        expect(openTag, `${file} must render an <a data-cta="${cta}">`).not.toBeNull();
      });

      it('href carries the intent as a URL query param', () => {
        expect(openTag).not.toBeNull();
        const tag = openTag![0];
        const escapedBase = destBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedIntent = intent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Shape: href="{base}?intent={intent}#{anchor}" — the ?intent=
        // param must precede the # fragment so URL.searchParams reads it.
        const rx = new RegExp(
          `href="${escapedBase}\\?intent=${escapedIntent}#${anchor}"`,
        );
        expect(tag, `${file} href must carry ?intent=${intent} before the # fragment`).toMatch(rx);
      });

      it('data-intent matches the URL-encoded intent (single source of truth)', () => {
        // If someone edits data-intent without updating ?intent (or vice
        // versa), analytics on cta_click and intake_submit will disagree.
        expect(openTag).not.toBeNull();
        const tag = openTag![0];
        const rx = new RegExp(`data-intent="${intent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`);
        expect(tag, `${file}: data-intent must equal ${intent}`).toMatch(rx);
      });

      it(`intent "${intent}" is a reserved namespace so applyUrlPrefill accepts it`, () => {
        // Guardrail: if the intent drifts to a non-reserved namespace,
        // applyUrlPrefill silently rejects it and the URL-side prefill
        // is a no-op — the attribution loop breaks without a runtime error.
        expect(isReservedIntent(intent)).toBe(true);
      });
    });
  }
});
