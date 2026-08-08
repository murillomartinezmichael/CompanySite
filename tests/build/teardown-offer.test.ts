import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (path: string) => readFileSync(root + path, 'utf8');

// Competitor research 2026-07-19 (TODO.md § vetted upgrades, high/S):
// the free review is repositioned as a concrete deliverable — a 5-minute
// recorded video teardown within 24 hours, no sales call — instead of an
// unspecified "written review". Footbridge's audit CTA converts because
// the visitor knows exactly what artifact they'll receive; ours now does
// too. This pins the promise on every surface that states it so a future
// copy edit can't quietly water the offer back down to "I'll reply", or
// leave one surface promising a different deliverable than the others
// (offer drift = trust leak on the money path).

const DELIVERABLE = /5-minute recorded video teardown|5-minute recorded walkthrough|record a 5-minute video teardown/;

describe('free review promises the video-teardown deliverable on every surface', () => {
  it('Intake default sub states the deliverable + 24h + no sales call', () => {
    const src = read('src/components/Intake.astro');
    expect(src).toMatch(/sub = '[^']*5-minute recorded video teardown/);
    expect(src).toMatch(/sub = '[^']*[Ww]ithin 24 hours/);
    expect(src).toMatch(/sub = '[^']*No sales call/);
  });

  it('Intake step 03 delivers a video teardown, not a bare written review', () => {
    const src = read('src/components/Intake.astro');
    expect(src).toContain('Video teardown + rough scope');
    expect(src).toMatch(DELIVERABLE);
    expect(src).not.toContain('Written review + rough scope');
  });

  it('/audit hero + bullets carry the deliverable', () => {
    const src = read('src/pages/audit.astro');
    expect(src).toMatch(DELIVERABLE);
    expect(src).toContain('Recorded video teardown, not a template');
    expect(src).not.toContain('Written review, not a template');
  });

  it('FAQ answer states the deliverable inside the 24h promise', () => {
    const src = read('src/components/Faq.astro');
    expect(src).toMatch(/within 24 hours with a 5-minute recorded video teardown/);
  });

  it('/thanks checkpoint card + wait copy state the deliverable', () => {
    const src = read('src/pages/thanks.astro');
    expect(src).toMatch(DELIVERABLE);
    expect(src).toContain('Video teardown');
  });

  it('lead auto-reply email promises the same deliverable as the site', () => {
    // The visitor reads the site's promise, submits, and gets this email —
    // the two must describe the same artifact or the offer reads as bait.
    const src = read('functions/api/lead.ts');
    expect(src).toMatch(/5-minute recorded video teardown/);
  });
});
