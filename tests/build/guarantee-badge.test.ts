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
    // Split the CATALOG into per-tier chunks keyed on `key:` and read each
    // tier's paymentPolicy field, so the assertion survives reordering.
    const chunks = [...services.matchAll(/key: '([^']+)'[\s\S]*?paymentPolicy: '([^']*)'/g)];
    const byKey = Object.fromEntries(chunks.map((m) => [m[1], m[2]]));
    expect(Object.keys(byKey)).toHaveLength(4);
    expect(byKey['site-that-books']).toBe(PAYMENT_POLICY);
    expect(byKey['business-website']).toBe(PAYMENT_POLICY);
    expect(byKey['siteguide-setup']).toBe('');
    expect(byKey['custom-builds']).toBe('');
  });

  it('badge renders conditionally so tiers without this policy stay clean', () => {
    expect(services).toMatch(/\{s\.paymentPolicy && \(/);
    expect(services).toMatch(/\{s\.paymentPolicy\}/);
  });

  it('pins the 20% down payment as the only non-refundable payment before launch', () => {
    // Prevent the superseded full-refund claim from silently returning.
    expect(services).not.toContain('Full refund any time before launch.');
    expect(services.match(/20% down to start\./g)).toHaveLength(2);
    expect(services.match(/The down payment is non-refundable;/g)).toHaveLength(2);
    expect(services.match(/all other payments are refundable before launch\./g)).toHaveLength(2);
  });
});
