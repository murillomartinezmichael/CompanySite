import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// @ts-expect-error — plain .mjs build script, no type declarations by design
import { RULES, isScannableFile, scanDir, scanText } from '../../scripts/check-shipped-placeholders.mjs';

// The build-time fence against the placeholder-shipped-to-production class.
// Cloudflare Pages runs `npm run build`, never `npm test` — so the checkout
// gate's unit tests could not have stopped the 2026-08-03 dead-Stripe-link
// deploy. `npm run build` now ends in this scanner. These tests prove the
// scanner catches the class AND that it does not false-positive on the real
// shipped output (a false positive here would block a production deploy).

const root = fileURLToPath(new URL('../../', import.meta.url));

const findingIds = (text: string): string[] =>
  scanText(text).map((f: { rule: string }) => f.rule);

describe('placeholder scanner — catches the class', () => {
  it.each([
    ['the exact bug that shipped', '<a href="https://buy.stripe.com/REPLACE_AFTER_SIGN_IN">Pay $100</a>', 'dead-stripe-link'],
    ['a Stripe test-mode link on the live page', '<a href="https://buy.stripe.com/test_bIYdRbc5C6pk0mA144">Pay</a>', 'dead-stripe-link'],
    ['a truncated Stripe link', '<a href="https://buy.stripe.com/abc">Pay</a>', 'dead-stripe-link'],
    ['plain-http Stripe link', '<a href="http://buy.stripe.com/bIYdRbc5C6pk0mA144">Pay</a>', 'dead-stripe-link'],
    ['any REPLACE_ marker', 'const key = "REPLACE_WITH_REAL_KEY";', 'replace-marker'],
    ['CHANGEME', 'apiUrl: "CHANGEME"', 'replace-marker'],
    ['YOUR_API_KEY', 'headers: { auth: "YOUR_API_KEY" }', 'replace-marker'],
    ['a placeholder GA4 id', '<script src="https://gtag/js?id=G-XXXXXXXXXX"></script>', 'placeholder-analytics-id'],
    ['a placeholder GTM id', "gtm('GTM-XXXXXX')", 'placeholder-analytics-id'],
    ['a placeholder UA id', "ga('create', 'UA-XXXXXXX-1')", 'placeholder-analytics-id'],
    ['a leaked secret key', 'const s = "sk_live_abc123def456";', 'stripe-key-material'],
    ['a wrong-mode publishable key', 'Stripe("pk_test_abc123def456")', 'stripe-key-material'],
    ['an example.com mailto', '<a href="mailto:hello@example.com">Email</a>', 'example-contact-target'],
    ['an example.com form action', '<form action="https://example.com/submit">', 'example-contact-target'],
    ['a fictional phone number', '<a href="tel:+15550123">Call</a>', 'placeholder-phone'],
  ])('flags %s', (_label, text, expectedRule) => {
    expect(findingIds(text)).toContain(expectedRule);
  });

  it('reports a sample of the offending text so the failure is actionable', () => {
    const [finding] = scanText('<a href="https://buy.stripe.com/REPLACE_AFTER_SIGN_IN">Pay</a>');
    expect(finding.samples[0]).toBe('https://buy.stripe.com/REPLACE_AFTER_SIGN_IN');
    expect(finding.message).toMatch(/stripe/i);
  });
});

describe('placeholder scanner — does not false-positive on real page content', () => {
  it.each([
    ['a real live payment link', '<a href="https://buy.stripe.com/bIYdRbc5C6pk0mA144">Pay $100</a>'],
    ['form input placeholder copy', '<input placeholder="you@business.com" /><input placeholder="David Serrano" />'],
    ['the Tailwind ::placeholder rule', '.field::placeholder{color:var(--bone)}'],
    ['schema.org and w3.org references', '<div itemtype="https://schema.org/Service" xmlns="http://www.w3.org/2000/svg">'],
    ['the real intake endpoint', '<form action="/api/lead" method="post">'],
    ['prose that happens to say replace', '<p>I replace dated sites with ones that book work.</p>'],
    ['a real-looking phone number', '<a href="tel:+15095551234">Call</a>'],
  ])('stays quiet on %s', (_label, text) => {
    expect(scanText(text)).toEqual([]);
  });

  it('skips binary assets and scans shipped text formats', () => {
    expect(isScannableFile('index.html')).toBe(true);
    expect(isScannableFile('_headers')).toBe(true);
    expect(isScannableFile('sitemap.xml')).toBe(true);
    expect(isScannableFile('hero.webp')).toBe(false);
    expect(isScannableFile('inter-latin.woff2')).toBe(false);
  });

  it('every rule declares an id and a human-readable message', () => {
    expect(RULES.length).toBeGreaterThanOrEqual(6);
    for (const rule of RULES) {
      expect(rule.id).toMatch(/^[a-z-]+$/);
      expect(rule.message.length).toBeGreaterThan(10);
    }
  });
});

// What actually ships. Requires a build (CI builds before testing; `npm run
// build` runs this same scanner as its final step — RUNBOOK § 3.4).
describe.skipIf(!existsSync(root + 'dist'))('built dist/ (needs `npm run build` first)', () => {
  it('ships zero placeholders of any kind', () => {
    expect(scanDir(root + 'dist')).toEqual([]);
  });
});
