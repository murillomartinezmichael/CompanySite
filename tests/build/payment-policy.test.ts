import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, basename } from 'node:path';
import { paymentLinkProblem } from '../../scripts/payment-link-policy.mjs';
import { SCAN_LIMITS, scanDir, scanText } from '../../scripts/check-shipped-placeholders.mjs';
import { isLiveStripePaymentLink, resolvePaymentLink } from '../../src/config/offers';

const base = 'https://buy.stripe.com/abc123';
describe('shared payment URL syntax policy', () => {
  it.each(['?utm_campaign=test_launch', '?client_reference_id=order_12', '?prefilled_email=a%40mail.test&locale=en', ''])('accepts query %s consistently', (query) => {
    const link = base + query;
    expect(paymentLinkProblem(link)).toBeNull();
    expect(isLiveStripePaymentLink(link)).toBe(true);
    expect(resolvePaymentLink(link)).toBe(link);
    expect(scanText(`<a href="${link}">Pay</a>`)).toEqual([]);
  });
  it.each([
    'https://u:p@buy.stripe.com/abc123', 'https://buy.stripe.com:8443/abc123',
    'https://buy.stripe.com/a/../abc123', base + '/extra', base + '#complete',
    'https://buy.stripe.com/test_abc123?utm_campaign=live',
    'https://buy.stripe.com/%74est_abc123', 'https://buy.stripe.com.evil.test/abc123',
  ])('rejects malformed or unauthorized URL %s', (link) => {
    expect(paymentLinkProblem(link)).not.toBeNull();
    expect(() => resolvePaymentLink(link)).toThrow();
  });
  it('custom domains require an explicit trusted-host configuration', () => {
    const custom = 'https://pay.merchant.test/abc123?client_reference_id=12';
    expect(paymentLinkProblem(custom)).not.toBeNull();
    expect(paymentLinkProblem(custom, ['pay.merchant.test'])).toBeNull();
    expect(paymentLinkProblem(custom.replace('merchant.test', 'merchant.test.evil.test'), ['pay.merchant.test'])).not.toBeNull();
  });
  it('redacts a short secret fragment in rejected query input', () => {
    const fragment = 'sk_live_' + 'a_b';
    expect(() => resolvePaymentLink(base + '?x=' + fragment)).toThrow(/redacted/);
    try { resolvePaymentLink(base + '?x=' + fragment); } catch (error) {
      expect(String(error)).not.toContain(fragment);
    }
  });
  it.each(['%73k_live_Synthetic123', '%2573k_live_Synthetic123', 'sk%5Flive%5FSynthetic123'])('rejects and redacts encoded key %s', (encoded) => {
    const link = base + '?key=' + encoded;
    expect(paymentLinkProblem(link)).not.toBeNull();
    expect(() => resolvePaymentLink(link)).toThrow(/redacted/);
    try { resolvePaymentLink(link); } catch (error) {
      expect(String(error)).not.toContain(encoded);
      expect(String(error)).not.toContain('Synthetic123');
    }
    const findings = scanText(`<a href="${link}">Pay</a>`);
    expect(findings.map((f) => f.rule)).toContain('stripe-key-material');
    expect(JSON.stringify(findings)).not.toContain('Synthetic123');
  });
  it.each([
    'https:\\/\\/buy.stripe.com\\/test_abc123',
    'https://buy.stripe.com/\\u0074est_abc123',
    'https&colon;&sol;&sol;buy.stripe.com/test_abc123',
    'https://buy.stripe.com/&#116;est_abc123',
  ])('scans encoded literal %s', (encoded) => {
    expect(scanText(encoded).map((f) => f.rule)).toContain('dead-stripe-link');
  });
});

function fixture(run: (root: string) => void) {
  const root = mkdtempSync(join(tmpdir(), 'companysite-policy-'));
  try { run(root); } finally {
    const resolved = realpathSync(root);
    if (dirname(resolved) !== realpathSync(tmpdir()) || !/^companysite-policy-[A-Za-z0-9]+$/.test(basename(resolved))) throw new Error('Unsafe test cleanup');
    rmSync(resolved, { recursive: true, force: true });
  }
}
describe('scanner traversal boundaries', () => {
  it.each(['source.map', 'source.cjs', 'source.tsx', 'source.astro', 'source.toml', 'challenge'])('scans shipped %s', (file) => {
    fixture((root) => {
      writeFileSync(join(root, file), 'REPLACE_WITH_REAL_VALUE');
      expect(scanDir(root)).toHaveLength(1);
    });
  });
  it('refuses a junction/link without reading its external target', () => {
    fixture((root) => {
      const scanned = join(root, 'scanned'); const target = join(root, 'outside');
      mkdirSync(scanned); mkdirSync(target);
      writeFileSync(join(target, 'secret.txt'), 'synthetic outside content');
      symlinkSync(target, join(scanned, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
      expect(() => scanDir(scanned)).toThrow(/symbolic links/);
    });
  });
  it.each([
    { fileBytes: 1 }, { totalBytes: 1 }, { entries: 1 }, { depth: 0 },
  ])('fails closed at limit %j', (override) => {
    fixture((root) => {
      writeFileSync(join(root, 'index.html'), 'ordinary content');
      expect(() => scanDir(root, { ...SCAN_LIMITS, ...override })).toThrow(/limit exceeded/);
    });
  });
});
