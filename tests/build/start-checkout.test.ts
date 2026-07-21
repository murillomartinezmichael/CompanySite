import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (path: string) => readFileSync(root + path, 'utf8');

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

  it('uses a real public Stripe Payment Link and no secret material', () => {
    expect(offers).toMatch(/paymentLink:\s*'https:\/\/buy\.stripe\.com\/[A-Za-z0-9_]+'/);
    expect(offers).not.toMatch(/REPLACE|sk_live|sk_test/);
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
