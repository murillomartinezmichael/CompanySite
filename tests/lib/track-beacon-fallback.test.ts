import { afterEach, describe, expect, it, vi } from 'vitest';
import { track } from '../../src/lib/track';

// navigator.sendBeacon returns false when the user agent refuses to queue
// the beacon (queue quota full, payload too large). The event is then lost
// unless track() falls back to a keepalive fetch.
afterEach(() => vi.unstubAllGlobals());

function stub(beaconResult: boolean) {
  const sendBeacon = vi.fn(() => beaconResult);
  const fetch = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));
  vi.stubGlobal('navigator', { sendBeacon });
  vi.stubGlobal('fetch', fetch);
  return { sendBeacon, fetch };
}

describe('track() delivery', () => {
  it('uses only sendBeacon when the beacon is queued', () => {
    const { sendBeacon, fetch } = stub(true);
    track({ name: 'hero-cta' });
    expect(sendBeacon).toHaveBeenCalledOnce();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('falls back to a keepalive fetch when sendBeacon returns false', () => {
    const { sendBeacon, fetch } = stub(false);
    track({ name: 'hero-cta' });
    expect(sendBeacon).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/track');
    expect(init.keepalive).toBe(true);
    expect(JSON.parse(String(init.body)).name).toBe('hero-cta');
  });
});
