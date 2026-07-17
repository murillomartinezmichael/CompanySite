import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (path: string) => readFileSync(root + path, 'utf8');

describe('homepage objection-handling FAQ', () => {
  const faq = read('src/components/Faq.astro');
  const index = read('src/pages/index.astro');

  it('renders between Services and Intake on the homepage', () => {
    expect(index).toMatch(/import Faq from ['"]@\/components\/Faq\.astro['"]/);
    expect(index.indexOf('<Services />')).toBeLessThan(index.indexOf('<Faq />'));
    expect(index.indexOf('<Faq />')).toBeLessThan(index.indexOf('<Intake />'));
  });

  it('uses native disclosure controls with an accessible section label and no custom script', () => {
    expect(faq).toMatch(/<section[^>]*id="faq"[^>]*aria-labelledby="faq-heading"/);
    expect(faq).toContain('<details');
    expect(faq).toContain('<summary');
    expect(faq).toMatch(/id="faq-heading"/);
    expect(faq).not.toMatch(/<script\b/);
  });

  it('answers all six confirmed-scope objections', () => {
    expect(faq.match(/^\s{4}question:/gm)).toHaveLength(6);
    for (const fact of ['$500', '$1,000-$2,000', 'over $2,000', 'You own the code', 'under $500', 'within 24 hours']) {
      expect(faq, `FAQ must keep confirmed fact: ${fact}`).toContain(fact);
    }
  });

  it('routes the free-review CTA to the mounted intake with funnel metadata', () => {
    expect(faq).toMatch(/href="#intake"[\s\S]{0,240}data-cta="faq-review"[\s\S]{0,120}data-section="faq"[\s\S]{0,120}data-intent="book:free-review"/);
  });

  it('attributes the under-$500 SiteGuide downshift and uses a reserved intent', () => {
    expect(faq).toContain('utm_source=m3mm&utm_medium=faq&utm_campaign=downshift&utm_content=faq-under-500');
    expect(faq).toMatch(/data-cta="faq-siteguide"[\s\S]{0,120}data-section="faq"[\s\S]{0,120}data-intent="product:siteguide"/);
  });

  it('keeps visible keyboard focus styling on each disclosure summary', () => {
    expect(faq).toMatch(/<summary[^>]*focus-visible:ring-2[^>]*focus-visible:ring-clay/);
    expect(faq).toMatch(/<div class="max-w-2xl pb-7 pt-2 pr-10 text-bone-dim">/);
  });
});
