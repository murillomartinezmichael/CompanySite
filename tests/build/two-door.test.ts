import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (path: string) => readFileSync(root + path, 'utf8');

// Competitor research 2026-07-19 (TODO.md § vetted upgrades, medium/M flow):
// GoLive forks traffic at the top — 'Shop Templates' vs 'Hire Our Team' —
// so wrong-budget visitors route instead of bouncing. Our only above-fold
// path was the custom lane; SiteGuide first appeared as Services card 3.
// This pins the two-door chooser directly under the Hero: door placement,
// both funnel wirings, and the price framing (established copy — 'from
// $500' custom, 'under $500' templates — so the fork can't drift into a
// pricing claim the Services ladder doesn't back).

describe('two-door chooser under the Hero', () => {
  const index = read('src/pages/index.astro');
  const twoDoor = read('src/components/TwoDoor.astro');

  it('renders between Hero and Proof on the homepage', () => {
    expect(index).toMatch(/import TwoDoor from ['"]@\/components\/TwoDoor\.astro['"]/);
    expect(index.indexOf('<Hero />')).toBeLessThan(index.indexOf('<TwoDoor />'));
    expect(index.indexOf('<TwoDoor />')).toBeLessThan(index.indexOf('<Proof />'));
  });

  it('custom door lands in the on-page intake with funnel metadata', () => {
    expect(twoDoor).toMatch(/href="#intake"[\s\S]{0,300}data-cta="door-custom"[\s\S]{0,120}data-section="two-door"[\s\S]{0,120}data-intent="book:free-review"/);
  });

  it('template door routes to SiteGuide on its own UTM lane, in a new tab', () => {
    expect(twoDoor).toContain('utm_source=m3mm&utm_medium=two-door&utm_campaign=downshift&utm_content=hero-two-door');
    expect(twoDoor).toMatch(/target="_blank"[\s\S]{0,200}rel="noopener"[\s\S]{0,400}data-cta="door-siteguide"[\s\S]{0,120}data-section="two-door"[\s\S]{0,120}data-intent="product:siteguide"/);
  });

  it('price framing matches the Services ladder (no invented numbers)', () => {
    expect(twoDoor).toContain('from $500');
    expect(twoDoor).toContain('under $500');
    // Established storefront fact (mirrors /thanks): twelve templates,
    // preview + buy today. If SiteGuide's catalog changes, update both.
    expect(twoDoor).toContain('Twelve one-page SiteGuide templates');
  });
});
