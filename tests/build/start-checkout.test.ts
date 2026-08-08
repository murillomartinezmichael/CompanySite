import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BASIC_SITE, checkoutReady, isLiveStripePaymentLink } from '../../src/config/offers';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (path: string) => readFileSync(root + path, 'utf8');

// The Stripe Payment Link starts life as a REPLACE_AFTER_SIGN_IN placeholder
// (Mike-only manual gate, PENDING_MANUAL.md). Until a well-formed LIVE link
// lands, /start must NOT render it as a clickable payment CTA — it gates to
// the free-review intake instead, with the paid offer still visible and
// honestly marked "checkout opening soon". Three layers of fence:
//
//   1. isLiveStripePaymentLink() is validated over a table of good AND bad
//      links — placeholder, test-mode, and malformed values all fail closed.
//   2. Source structure: the payment href may only ever render inside the
//      checkoutReady branch of start.astro.
//   3. Built HTML: dist/start/index.html is asserted directly, so what
//      actually ships is proven, not inferred (run `npm run build` first;
//      CI builds before testing).

describe('isLiveStripePaymentLink — fails closed on everything but a live link', () => {
  it.each([
    'https://buy.stripe.com/bIYdRbc5C6pk0mA144',
    'https://buy.stripe.com/4gwcN2eXW9uv12aabb00',
    'https://buy.stripe.com/aEU5kEcDe0nq7ZS5kk',
  ])('accepts live-shaped link %s', (link) => {
    expect(isLiveStripePaymentLink(link)).toBe(true);
  });

  it.each([
    ['the shipped placeholder', 'https://buy.stripe.com/REPLACE_AFTER_SIGN_IN'],
    ['any REPLACE marker', 'https://buy.stripe.com/REPLACEbIYdRbc5C6pk0mA144'],
    ['a Stripe TEST-mode link', 'https://buy.stripe.com/test_bIYdRbc5C6pk0mA144'],
    ['test_ anywhere in the slug', 'https://buy.stripe.com/abctest_dRbc5C6pk0mA1'],
    ['plain http', 'http://buy.stripe.com/bIYdRbc5C6pk0mA144'],
    ['the wrong host', 'https://buy.stripe.evil.com/bIYdRbc5C6pk0mA144'],
    ['a lookalike path on another host', 'https://evil.example.com/buy.stripe.com/bIYdRbc5C6pk0mA144'],
    ['an empty slug', 'https://buy.stripe.com/'],
    ['a too-short slug', 'https://buy.stripe.com/abc123'],
    ['an underscore slug', 'https://buy.stripe.com/bIY_dRbc5C6pk0mA144'],
    ['a query string', 'https://buy.stripe.com/bIYdRbc5C6pk0mA144?x=1'],
    ['an extra path segment', 'https://buy.stripe.com/bIYdRbc5C6pk0mA144/extra'],
    ['a trailing newline', 'https://buy.stripe.com/bIYdRbc5C6pk0mA144\n'],
    ['an empty string', ''],
    ['a secret key pasted by mistake', 'sk_live_abcdefghijklmnop'],
  ])('rejects %s', (_label, link) => {
    expect(isLiveStripePaymentLink(link)).toBe(false);
  });
});

describe('$500 basic-site checkout', () => {
  const start = read('src/pages/start.astro');
  const offers = read('src/config/offers.ts');
  const services = read('src/components/Services.astro');

  it('publishes the exact deposit amount and refund terms', () => {
    expect(offers).toMatch(/priceUsd:\s*500/);
    expect(offers).toMatch(/depositPercent:\s*20/);
    expect(offers).toMatch(/depositUsd:\s*100/);
    expect(start).toContain('The $100 down payment is non-refundable. All other payments are refundable before launch.');
    expect(start).not.toMatch(/full refund/i);
  });

  it('keeps secret material out of the public offer config', () => {
    expect(offers).not.toMatch(/sk_live_|sk_test_/);
    expect(BASIC_SITE.paymentLink).toMatch(/^https:\/\/buy\.stripe\.com\//);
  });

  it('derives checkoutReady from the validator — the gate cannot be hand-flipped', () => {
    // The gate's source of truth is semantic validation of the link itself.
    // If someone hardcodes `checkoutReady = true` while the placeholder (or a
    // test-mode link) is live, this fails.
    expect(offers).toMatch(/export const checkoutReady = isLiveStripePaymentLink\(BASIC_SITE\.paymentLink\)/);
    expect(checkoutReady).toBe(isLiveStripePaymentLink(BASIC_SITE.paymentLink));
  });

  it('renders the payment link as an href ONLY inside the checkoutReady branch', () => {
    // Exactly one href usage, and it must sit between the aside's
    // `{checkoutReady ? (` and its `) : (` fallback. A second usage, or a
    // move outside the gate, fails here.
    const hrefUses = start.match(/href=\{BASIC_SITE\.paymentLink\}/g) ?? [];
    expect(hrefUses, 'payment link must render as an href in exactly one place').toHaveLength(1);

    const gateOpen = start.indexOf('{checkoutReady ? (');
    const gateElse = start.indexOf(') : (', gateOpen);
    const hrefAt = start.indexOf('href={BASIC_SITE.paymentLink}');
    expect(gateOpen, 'aside must gate on checkoutReady').toBeGreaterThan(-1);
    expect(gateElse, 'checkoutReady gate must have a fallback branch').toBeGreaterThan(gateOpen);
    expect(hrefAt, 'payment href must be inside the checkoutReady branch').toBeGreaterThan(gateOpen);
    expect(hrefAt, 'payment href must come before the fallback branch').toBeLessThan(gateElse);
  });

  it.runIf(!checkoutReady)('gated source: /start falls back to the free-review intake with honest copy', () => {
    const fallbackCta = start.match(/<a\s+href="#intake"\s+class="btn-primary[\s\S]{0,900}?<\/a>/)?.[0] ?? '';
    expect(fallbackCta, 'gated state must ship a primary #intake CTA').not.toBe('');
    expect(fallbackCta).toContain('data-cta="start-free-review"');
    expect(fallbackCta).toContain('data-intent="book:free-review"');
    expect(start).toContain('Checkout opening soon');
    // The free-review intake actually mounts on the page in the gated state,
    // so the #intake anchor resolves on /start itself.
    expect(start).toMatch(/<Intake source="start" \/>/);
  });

  it.runIf(checkoutReady)('live source: the configured link is a well-formed live Payment Link', () => {
    expect(isLiveStripePaymentLink(BASIC_SITE.paymentLink)).toBe(true);
    expect(BASIC_SITE.paymentLink).not.toContain('REPLACE');
    expect(BASIC_SITE.paymentLink).not.toContain('test_');
  });

  it('wires the basic tier to /start while quote lanes keep the intake', () => {
    expect(services).toMatch(/key:\s*'site-that-books'[\s\S]{0,800}href:\s*'\/start'/);
    expect(services).toMatch(/key:\s*'business-website'[\s\S]{0,800}href:\s*'#intake'/);
    expect(services).toMatch(/href=\{s\.href\}/);
  });

  it('reveals the project intake after Stripe redirects back', () => {
    expect(start).toMatch(/id="project-intake"\s+hidden/);
    expect(start).toContain("query.get('checkout') === 'complete'");
    expect(start).toMatch(/source="basic-deposit"/);
    expect(start).toMatch(/defaultIntent="checkout:basic-deposit"/);
    expect(start).toMatch(/showStartWindow=\{true\}/);
    expect(start).toMatch(/successPath="\/start\/thanks"/);
  });

  it('lists the public start route in the sitemap', () => {
    expect(read('public/sitemap.xml')).toContain('<loc>https://m3mm.net/start</loc>');
  });
});

// What actually ships. Requires a build (CI builds before testing; locally run
// `npm run build` first — RUNBOOK § 3.4). Skipped, loudly, when dist/ absent.
const distStartPath = root + 'dist/start/index.html';

describe.skipIf(!existsSync(distStartPath))('built /start HTML (needs `npm run build` first)', () => {
  const html = () => readFileSync(distStartPath, 'utf8');

  it.runIf(!checkoutReady)('gated build: no placeholder, no paid CTA, free-review fallback ships', () => {
    const h = html();
    expect(h).not.toContain('REPLACE_AFTER_SIGN_IN');
    expect(h).not.toContain('buy.stripe.com');
    expect(h).not.toContain('data-cta="start-pay-deposit"');
    expect(h).toContain('Checkout opening soon');
    expect(h).toContain('data-cta="start-free-review"');
    expect(h).toContain('id="intake"');
  });

  it.runIf(checkoutReady)('live build: the payment CTA ships and the gated fallback does not', () => {
    const h = html();
    expect(h).toContain(`href="${BASIC_SITE.paymentLink}"`);
    expect(h).toContain('data-cta="start-pay-deposit"');
    expect(h).not.toContain('Checkout opening soon');
    expect(h).not.toContain('data-cta="start-free-review"');
  });
});
