import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (path: string) => readFileSync(root + path, 'utf8');

// Competitor research 2026-07-19 (TODO.md § vetted upgrades, high/S trust):
// Footbridge leads with a 90-day money-back guarantee, Designjoy with a
// week-one 75% refund; m3mm.net carried zero risk-reversal language. The
// $500 + $1k-2k build lanes now wear the vetted badge copy. This pins:
//   1. the exact copy (research chose it deliberately — no date-based
//      penalty until build-time data from more projects supports one);
//   2. which tiers carry it (the two M3 build lanes — not the SiteGuide
//      template lane, whose refund policy belongs to SiteGuide, and not
//      quote-only work, where the contract sets terms);
// so a future edit can't silently strengthen the promise into something
// Mike hasn't agreed to honor, or leak it onto the wrong tier.

const GUARANTEE = 'Full refund any time before launch.';

describe('pricing-card guarantee badge (risk reversal)', () => {
  const services = read('src/components/Services.astro');

  it('exactly the two build-lane tiers carry the vetted guarantee copy', () => {
    // Split the CATALOG into per-tier chunks keyed on `key:` and read each
    // tier's guarantee field, so the assertion survives reordering.
    const chunks = [...services.matchAll(/key: '([^']+)'[\s\S]*?guarantee: '([^']*)'/g)];
    const byKey = Object.fromEntries(chunks.map((m) => [m[1], m[2]]));
    expect(Object.keys(byKey)).toHaveLength(4);
    expect(byKey['site-that-books']).toBe(GUARANTEE);
    expect(byKey['business-website']).toBe(GUARANTEE);
    expect(byKey['siteguide-setup']).toBe('');
    expect(byKey['custom-builds']).toBe('');
  });

  it('badge renders conditionally so empty-guarantee tiers stay clean', () => {
    expect(services).toMatch(/\{s\.guarantee && \(/);
    expect(services).toMatch(/\{s\.guarantee\}/);
  });

  it('guarantee copy stays date-penalty-free until build data supports one', () => {
    // The research explicitly rejected "14 days or $250 back"-style promises
    // for now. Any wording with a day-count or dollar-penalty needs Mike's
    // sign-off plus data from more shipped projects first.
    expect(services).not.toMatch(/\d+ days or \$/);
    expect(services.match(/Full refund any time before launch\./g)).toHaveLength(2);
  });
});
