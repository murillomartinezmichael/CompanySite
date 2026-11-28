import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (path: string) => readFileSync(root + path, 'utf8');

// Owner-confirmed payment policy (2026-07-20): the two M3 build lanes require
// 20% down before work begins. That down payment is non-refundable, while
// additional payments remain refundable before launch. SiteGuide owns its own
// policy, and quote-only work sets terms in the contract.

const PAYMENT_POLICY = '20% down to start. The down payment is non-refundable; all other payments are refundable before launch.';

describe('pricing-card payment-policy badge', () => {
  const services = read('src/components/Services.astro');

  it('exactly the two build-lane tiers carry the owner-confirmed policy', () => {
    const html = read('dist/websites/index.html');
    for (const tier of ['site-that-books', 'business-website', 'siteguide-setup', 'custom-builds']) {
      const card = html.match(new RegExp(`data-cta="service-${tier}"[\\s\\S]*?</a>`))?.[0];
      expect(card).toBeDefined();
      expect(card!.includes(PAYMENT_POLICY)).toBe(['site-that-books', 'business-website'].includes(tier));
    }
  });

  it('badge renders conditionally so tiers without this policy stay clean', () => {
    expect(services).toMatch(/\{s\.paymentPolicy && \(/);
    expect(services).toMatch(/\{s\.paymentPolicy\}/);
  });

  it('pins the 20% down payment as the only non-refundable payment before launch', () => {
    // Prevent the superseded full-refund claim from silently returning.
    expect(services).not.toContain('Full refund any time before launch.');
    expect(read('dist/websites/index.html').match(/20% down to start\./g)).toHaveLength(2);
    expect(services.match(/The down payment is non-refundable;/g)).toHaveLength(2);
    expect(services.match(/all other payments are refundable before launch\./g)).toHaveLength(2);
  });
});
