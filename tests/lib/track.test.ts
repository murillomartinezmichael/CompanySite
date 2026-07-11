import { describe, it, expect } from 'vitest';
import { readUtms } from '../../src/lib/track';

// Bio-link attribution contract. CONVERSION_STANDARDS.md § 4 requires the
// CTA loop (cta_click → intake_start → intake_submit → checkout_complete)
// to carry attribution across every stage. On TikTok/IG, that attribution
// enters as UTM query params on the bio-link landing URL — if the client
// event pipeline silently drops them, we can never tell which video shipped
// a lead. These tests pin the URL-param → analytics-meta shape.

describe('readUtms — bio-link attribution capture', () => {
  it('returns empty when the search string has no utm params', () => {
    expect(readUtms('')).toEqual({});
    expect(readUtms('?tier=business&biz=deck')).toEqual({});
  });

  it('captures the five standard utm keys with values intact', () => {
    const utms = readUtms(
      '?utm_source=tiktok&utm_medium=bio&utm_campaign=aries-video&utm_content=hero&utm_term=deck-builder'
    );
    expect(utms).toEqual({
      utm_source: 'tiktok',
      utm_medium: 'bio',
      utm_campaign: 'aries-video',
      utm_content: 'hero',
      utm_term: 'deck-builder',
    });
  });

  it('accepts the leading ? or its absence', () => {
    expect(readUtms('utm_source=tiktok')).toEqual({ utm_source: 'tiktok' });
    expect(readUtms('?utm_source=tiktok')).toEqual({ utm_source: 'tiktok' });
  });

  it('ignores non-utm params — no source pollution from arbitrary keys', () => {
    // A hostile bio link like ?source=organic&intent=tier:custom must not
    // leak fake attribution into the utm surface (source is set from the
    // form's data-source attribute, not the URL).
    const utms = readUtms('?utm_source=tiktok&source=organic&intent=fake&random=x');
    expect(utms).toEqual({ utm_source: 'tiktok' });
  });

  it('caps each value below the DoS threshold', () => {
    const long = 'x'.repeat(500);
    const utms = readUtms(`?utm_campaign=${long}`);
    expect(utms.utm_campaign.length).toBeLessThanOrEqual(240);
    expect(utms.utm_campaign.length).toBeGreaterThan(0);
  });

  it('trims whitespace so ?utm_source=%20tiktok%20 does not lie in analytics', () => {
    const utms = readUtms('?utm_source=%20tiktok%20');
    expect(utms.utm_source).toBe('tiktok');
  });

  it('drops empty values so ?utm_source= does not fabricate an empty attribution', () => {
    const utms = readUtms('?utm_source=&utm_medium=bio');
    expect(utms.utm_source).toBeUndefined();
    expect(utms.utm_medium).toBe('bio');
  });

  it('handles a malformed search string without throwing', () => {
    expect(() => readUtms('====&&&%%%')).not.toThrow();
    expect(() => readUtms('?')).not.toThrow();
  });

  it('returns only the five reserved keys, never a shorthand alias', () => {
    // Some analytics tools accept src / medium / campaign shorthand.
    // The site's contract is strict UTM naming; shorthand must not leak.
    const utms = readUtms('?src=tiktok&medium=bio&campaign=aries');
    expect(utms).toEqual({});
  });
});
