import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p: string) => readFileSync(root + p, 'utf8');

// CONVERSION_STANDARDS.md § 4 — every `cta_click` beacon must carry `intent`.
// The intake-submit button intentionally omits a `data-intent` literal
// because the form's hidden `<input name="intent">` is the live source of
// truth (wirePrefill rewrites it on every tier-CTA click). Without the
// fallback in wireCTAs, the submit-button click emits `intent: undefined`
// and the funnel view sees a hollow bucket even though the paired
// `intake_submit` event carries the real intent — an inconsistency that
// looks like a broken funnel to any dashboard grouping by intent.
//
// This suite pins the three wires that keep the loop closed at the submit
// stage:
//   1. track.ts's wireCTAs reads the form's hidden intent as fallback.
//   2. Intake.astro's submit button has no data-intent literal (the
//      fallback is the contract — a literal would go stale after a
//      tier-CTA click).
//   3. Intake.astro's form still renders the hidden intent input the
//      fallback depends on (already covered by attribution-loop.test.ts;
//      re-asserted here so this test file stands alone as a
//      regression fence).

describe('§ 4 — intake-submit cta_click inherits intent from the form', () => {
  it('wireCTAs falls back to the enclosing form\'s hidden intent input', () => {
    const src = read('src/lib/track.ts');
    // The closure walks the button's ancestor form to the hidden intent input.
    expect(src).toMatch(
      /el[\s\S]{0,40}\.closest\(['"]form['"]\)[\s\S]{0,120}querySelector[\s\S]{0,120}input\[name="intent"\][\s\S]{0,40}value/,
    );
    // The dispatched event uses the literal-first, form-fallback order so
    // an explicit data-intent on any CTA (Hero, Services tier, Footer)
    // still wins over the form's default seed.
    expect(src).toMatch(/intent:\s*el\.dataset\.intent\s*\|\|\s*formIntent/);
  });

  it('Intake.astro submit button has no data-intent literal (fallback is the contract)', () => {
    const src = read('src/components/Intake.astro');
    // Locate the submit <button ...> block and assert data-intent is absent.
    // A literal data-intent on the button would go stale after any tier-CTA
    // click (wirePrefill updates the hidden input, not the button attribute).
    const match = src.match(/<button[^>]*data-cta="intake-submit"[^>]*>/);
    expect(match, 'Intake.astro must render <button data-cta="intake-submit">').not.toBeNull();
    expect(match![0]).not.toMatch(/\bdata-intent\b/);
  });

  it('Intake.astro still renders the hidden intent input the fallback reads', () => {
    // Redundant with attribution-loop.test.ts but pinned locally so this
    // regression fence stands alone. If someone drops the hidden input,
    // the fallback silently returns undefined and § 4 breaks again.
    const src = read('src/components/Intake.astro');
    expect(src).toMatch(/<input\s+type="hidden"\s+name="intent"\s+value=\{defaultIntent\}/);
  });
});
