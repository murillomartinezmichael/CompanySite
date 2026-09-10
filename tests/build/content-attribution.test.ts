import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

// A content-loader migration can build successfully while replacing the old
// slug with undefined. Check the shipped links, not the implementation name.
const html = readFileSync(new URL('../../dist/websites/index.html', import.meta.url), 'utf8');

describe('built case-study attribution survives content-loader upgrades', () => {
  it.each(['aries', 'big7'])('%s retains its CTA, intent and outbound attribution', slug => {
    expect(html).toContain(`data-cta="casestudy-${slug}-visit"`);
    expect(html).toContain(`data-intent="product:${slug}"`);
    expect(html).toContain(`utm_content=${slug}`);
  });
  it('never emits an undefined attribution value', () => {
    expect(html).not.toMatch(/(?:data-(?:cta|intent)="[^"]*|utm_content=)undefined/);
  });
});
