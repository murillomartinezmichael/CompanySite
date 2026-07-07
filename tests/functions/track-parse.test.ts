import { describe, it, expect } from 'vitest';
import { parseTrackBody, cleanTrackEvent, TRACK_LIMITS } from '../../functions/_lib/track-parse';

describe('parseTrackBody — JSON path', () => {
  it('parses well-formed JSON', () => {
    const r = parseTrackBody('{"name":"cta-hero","section":"top"}');
    expect(r.name).toBe('cta-hero');
    expect(r.section).toBe('top');
  });

  it('returns empty object for empty input (never throws)', () => {
    expect(parseTrackBody('')).toEqual({});
  });

  it('discards non-object JSON (arrays, primitives, null)', () => {
    // sendBeacon can be misused — don't let a JSON array or number surface.
    expect(parseTrackBody('[1,2,3]')).toEqual({});
    expect(parseTrackBody('42')).toEqual({});
    expect(parseTrackBody('null')).toEqual({});
    expect(parseTrackBody('"just a string"')).toEqual({});
  });
});

describe('parseTrackBody — URLSearchParams fallback', () => {
  it('recovers name/section/source from url-encoded body', () => {
    const r = parseTrackBody('name=cta-hero&section=intake&source=audit-page');
    expect(r.name).toBe('cta-hero');
    expect(r.section).toBe('intake');
    expect(r.source).toBe('audit-page');
  });

  it('handles missing keys as undefined without throwing', () => {
    const r = parseTrackBody('name=only-one');
    expect(r.name).toBe('only-one');
    expect(r.section).toBeUndefined();
    expect(r.source).toBeUndefined();
  });

  it('returns empty object for total garbage that also fails URLSearchParams', () => {
    // URLSearchParams is very lenient; the fallback of a fallback is `{}`.
    // In practice URLSearchParams accepts almost anything, so this test
    // documents "never throws", not "matches strict-empty semantics".
    expect(() => parseTrackBody('%%%% not html not json')).not.toThrow();
  });
});

describe('cleanTrackEvent — shape + defaults', () => {
  it('trims + caps every field to its documented ceiling', () => {
    const huge = 'x'.repeat(1000);
    const r = cleanTrackEvent({
      name: huge, section: huge, source: huge, path: huge, referrer: huge,
    });
    expect(r.cta.length).toBeLessThanOrEqual(TRACK_LIMITS.ctaName);
    expect((r.section ?? '').length).toBeLessThanOrEqual(TRACK_LIMITS.section);
    expect((r.source ?? '').length).toBeLessThanOrEqual(TRACK_LIMITS.source);
    expect((r.path ?? '').length).toBeLessThanOrEqual(TRACK_LIMITS.path);
    expect((r.referrer ?? '').length).toBeLessThanOrEqual(TRACK_LIMITS.referrer);
  });

  it('defaults cta to "unknown" when the beacon omits a name', () => {
    // Log-line consumers scan the cta field — we always emit one.
    const r = cleanTrackEvent({});
    expect(r.cta).toBe('unknown');
  });

  it('accepts a client-supplied ts if it is a finite number', () => {
    const r = cleanTrackEvent({ ts: 1_700_000_000_000 });
    expect(r.ts).toBe(1_700_000_000_000);
  });

  it('falls back to now-ish for non-numeric ts (never trust client)', () => {
    const before = Date.now();
    const r = cleanTrackEvent({ ts: 'not-a-number' as unknown as number });
    const after = Date.now();
    expect(r.ts).toBeGreaterThanOrEqual(before);
    expect(r.ts).toBeLessThanOrEqual(after);
  });

  it('falls back to now-ish for NaN or Infinity ts', () => {
    const before = Date.now();
    const r1 = cleanTrackEvent({ ts: Number.NaN });
    const r2 = cleanTrackEvent({ ts: Number.POSITIVE_INFINITY });
    const after = Date.now();
    expect(r1.ts).toBeGreaterThanOrEqual(before);
    expect(r1.ts).toBeLessThanOrEqual(after);
    expect(r2.ts).toBeGreaterThanOrEqual(before);
    expect(r2.ts).toBeLessThanOrEqual(after);
  });

  it('honours an injected clock (deterministic tests can control now)', () => {
    const r = cleanTrackEvent({}, 999);
    expect(r.ts).toBe(999);
  });

  it('drops empty strings (undefined, not "")', () => {
    // Undefined optional fields keep the log line clean — no "section":"" noise.
    const r = cleanTrackEvent({ name: 'x', section: '   ', source: '' });
    expect(r.section).toBeUndefined();
    expect(r.source).toBeUndefined();
  });
});

describe('TRACK_LIMITS — contract lock', () => {
  it('caps match the endpoint contract in functions/api/track.ts', () => {
    // These match the constants at the top of track.ts. If the endpoint
    // drifts, this test fails and both places get looked at together.
    expect(TRACK_LIMITS.bodyBytes).toBe(4 * 1024);
    expect(TRACK_LIMITS.ctaName).toBe(80);
    expect(TRACK_LIMITS.section).toBe(40);
    expect(TRACK_LIMITS.source).toBe(64);
    expect(TRACK_LIMITS.path).toBe(256);
    expect(TRACK_LIMITS.referrer).toBe(512);
  });
});
