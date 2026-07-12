import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p: string) => readFileSync(root + p, 'utf8');

// CONVERSION_STANDARDS.md § 1 (no dead-end CTAs) + § 3 (intake surfaces
// prefill / carry context) + perf strike #5 (Footer / Accessibility bypass
// Cloudflare Email Address Obfuscation to kill render-blocking
// cdn-cgi/scripts/…/email-decode.min.js in the LCP critical chain).
//
// /thanks urgent-email CTA regressed both invariants: a raw
// mailto:…@gmail.com href in server-rendered HTML re-triggered CF EAO on
// /thanks, and the mailto carried no body scaffold — Mike would receive
// an "urgent" email with zero context to match it back to the intake the
// visitor just submitted.
//
// Fix mirrors the Footer + Accessibility pattern: split email into
// data-em-u / data-em-h attrs, hydrate to a real mailto: on load with a
// subject + body scaffold, and fall through to /audit#intake without JS.
// This test pins the shape so a future edit can't silently regress it.

describe('/thanks urgent-email CTA carries context + bypasses CF EAO', () => {
  const src = read('src/pages/thanks.astro');

  it('does not emit a raw mailto:…@gmail.com in server HTML', () => {
    // Any raw email in href="mailto:…" triggers CF Email Address
    // Obfuscation → email-decode.min.js render-block. Hydration must be
    // JS-only. The address may appear inside a JS string literal (the
    // hydration script builds it from data-em-u + data-em-h), but never
    // as a static href attribute.
    expect(src).not.toMatch(/href="mailto:[^"]*@[^"]*"/);
    expect(src).not.toMatch(/href='mailto:[^']*@[^']*'/);
  });

  it('urgent-email anchor uses the data-em-* obfuscation pattern', () => {
    // The anchor is identifiable by its stable data-cta hook.
    // Extract its opening tag and assert all four data-em-* attrs present.
    const anchor = src.match(/<a[^>]*data-cta="thanks-urgent-email"[^>]*>/);
    expect(anchor, 'thanks-urgent-email anchor not found').not.toBeNull();
    const tag = anchor![0];
    expect(tag).toMatch(/data-em-u="[^"]+"/);
    expect(tag).toMatch(/data-em-h="[^"]+"/);
    expect(tag).toMatch(/data-em-sub="[^"]+"/);
    expect(tag).toMatch(/data-em-body=/);
  });

  it('noscript fallback href routes to /audit intake carrying the urgent intent — never dead-ends, never downgrades intent', () => {
    // Without JS the anchor still lands the visitor somewhere real. Also
    // enforced globally by tests/build/intake-cta.test.ts § "/thanks and
    // /accessibility route intake CTAs to /audit#intake" but we duplicate
    // the check here scoped to the urgent-email anchor for clarity.
    //
    // CONVERSION_STANDARDS § 4 — the CTA loop must close. If JS is off
    // (mailto hydration hasn't run), the fallback URL used to be bare
    // /audit#intake, which lands with the Intake component's default
    // intent (book:free-review), silently downgrading a book:urgent-review
    // click. Fix mirrors accessibility.astro's pattern: encode the intent
    // in the URL so applyUrlPrefill picks it up on arrival.
    const anchor = src.match(/<a[^>]*data-cta="thanks-urgent-email"[^>]*>/);
    expect(anchor).not.toBeNull();
    expect(anchor![0]).toMatch(/href="\/audit\?intent=book:urgent-review#intake"/);
  });

  it('reserved data-intent namespace preserved (book:urgent-review)', () => {
    // Reserved namespaces per CONVERSION_STANDARDS § 2 — pinned globally
    // by reserved-intent-namespaces.test.ts, but this asserts the specific
    // value so a rename doesn't silently strip the urgent variant.
    const anchor = src.match(/<a[^>]*data-cta="thanks-urgent-email"[^>]*>/);
    expect(anchor).not.toBeNull();
    expect(anchor![0]).toMatch(/data-intent="book:urgent-review"/);
  });

  it('hydration script wires href to mailto: on load with subject + body', () => {
    // The inline is:inline script must (a) select the urgent-email
    // anchor, (b) build addr from em-u + em-h, (c) encode subject + body
    // into the query string, (d) set anchor.href.
    // Textcontent replacement is intentionally omitted — the anchor sits
    // mid-sentence and must keep its "email me directly" label.
    expect(src).toMatch(/data-cta="thanks-urgent-email"/);
    expect(src).toMatch(/dataset\.emU\s*\+\s*['"]@['"]\s*\+\s*.*dataset\.emH/);
    expect(src).toMatch(/encodeURIComponent\(sub\)/);
    expect(src).toMatch(/encodeURIComponent\(body\)/);
    expect(src).toMatch(/a\.href\s*=\s*['"]mailto:['"]\s*\+\s*addr/);
    // Preserving the sentence flow — no textContent overwrite.
    expect(src).not.toMatch(/data-cta="thanks-urgent-email"[\s\S]*?a\.textContent\s*=\s*addr/);
  });
});
