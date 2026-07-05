import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { checkRate } from '../../functions/_lib/rate';

// The bucket in rate.ts is module-scoped state, so we need to isolate
// tests by using distinct IP keys. Ordering isn't a concern.

describe('checkRate — happy path', () => {
  it('allows requests under the limit', () => {
    const ip = 'test-under-limit';
    for (let i = 0; i < 5; i++) {
      const r = checkRate(ip, 5, 60);
      expect(r.ok).toBe(true);
    }
  });

  it('rejects the request that crosses the limit', () => {
    const ip = 'test-cross-limit';
    for (let i = 0; i < 5; i++) checkRate(ip, 5, 60);
    const r = checkRate(ip, 5, 60);
    if (r.ok) throw new Error('expected rate-limit rejection');
    expect(r.retryAfter).toBeGreaterThan(0);
    expect(r.retryAfter).toBeLessThanOrEqual(60);
  });
});

describe('checkRate — per-IP isolation', () => {
  it('one IP hitting the limit does not affect a different IP', () => {
    const busy = 'test-isolation-busy';
    const quiet = 'test-isolation-quiet';
    for (let i = 0; i < 5; i++) checkRate(busy, 5, 60);
    expect(checkRate(busy, 5, 60).ok).toBe(false);
    expect(checkRate(quiet, 5, 60).ok).toBe(true);
  });
});

describe('checkRate — window rollover', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('forgets hits that have aged out of the window', () => {
    const ip = 'test-window-rollover';
    const start = new Date('2026-07-05T20:00:00Z').getTime();
    vi.setSystemTime(start);

    // 5 hits inside a 60s window
    for (let i = 0; i < 5; i++) checkRate(ip, 5, 60);
    expect(checkRate(ip, 5, 60).ok).toBe(false);

    // Advance 61 seconds — all prior hits should have rolled off
    vi.setSystemTime(start + 61_000);
    const r = checkRate(ip, 5, 60);
    expect(r.ok).toBe(true);
  });

  it('retryAfter counts down as time passes', () => {
    const ip = 'test-retryafter-countdown';
    const start = new Date('2026-07-05T20:10:00Z').getTime();
    vi.setSystemTime(start);
    for (let i = 0; i < 5; i++) checkRate(ip, 5, 60);

    // Immediately: retryAfter close to 60
    const now = checkRate(ip, 5, 60);
    if (now.ok) throw new Error('expected rejection');
    expect(now.retryAfter).toBeGreaterThanOrEqual(59);

    // 30 seconds later: retryAfter roughly halved
    vi.setSystemTime(start + 30_000);
    const later = checkRate(ip, 5, 60);
    if (later.ok) throw new Error('still expected rejection at 30s');
    expect(later.retryAfter).toBeGreaterThanOrEqual(29);
    expect(later.retryAfter).toBeLessThanOrEqual(31);
  });
});

describe('checkRate — configurable limits', () => {
  it('honors a tighter (2/min) limit', () => {
    const ip = 'test-tight-limit';
    expect(checkRate(ip, 2, 60).ok).toBe(true);
    expect(checkRate(ip, 2, 60).ok).toBe(true);
    expect(checkRate(ip, 2, 60).ok).toBe(false);
  });

  it('honors a looser (100/min) limit', () => {
    const ip = 'test-loose-limit';
    for (let i = 0; i < 100; i++) {
      expect(checkRate(ip, 100, 60).ok).toBe(true);
    }
    expect(checkRate(ip, 100, 60).ok).toBe(false);
  });
});
