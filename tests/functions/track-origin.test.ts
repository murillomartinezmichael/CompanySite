import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost } from '../../functions/api/track';
import { __resetBuckets } from '../../functions/_lib/rate';

// A third-party page can make every visitor's browser POST beacons here. Each
// visitor has their own IP, so the per-IP rate limit does not bound it. The
// beacon is only ever sent same-origin (src/lib/track.ts), so a foreign Origin
// is dropped with the usual silent 204 and never logged as a CTA event.
const logMock = vi.fn();

function beacon(headers: Record<string, string>, env: Record<string, string> = {}) {
  const request = new Request('https://m3mm.net/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.41', ...headers },
    body: JSON.stringify({ name: 'hero-review', section: 'hero' }),
  });
  return onRequestPost({ request, env } as unknown as Parameters<typeof onRequestPost>[0]);
}
const ctaLogs = () => logMock.mock.calls.filter(([line]) => String(line).includes('"event":"cta"'));

beforeEach(() => { __resetBuckets(); logMock.mockClear(); vi.spyOn(console, 'log').mockImplementation(logMock); });
afterEach(() => vi.restoreAllMocks());

describe('track beacon origin gate', () => {
  it('drops a beacon from a non-allowlisted Origin without logging it', async () => {
    const response = await beacon({ Origin: 'https://attacker.example' });
    expect(response.status).toBe(204);
    expect(ctaLogs()).toHaveLength(0);
  });

  it('drops a sandboxed/opaque "null" Origin', async () => {
    await beacon({ Origin: 'null' });
    expect(ctaLogs()).toHaveLength(0);
  });

  it('honours ALLOWED_ORIGINS', async () => {
    await beacon({ Origin: 'https://m3mm.net' }, { ALLOWED_ORIGINS: 'https://preview.example' });
    expect(ctaLogs()).toHaveLength(0);
    await beacon({ Origin: 'https://preview.example' }, { ALLOWED_ORIGINS: 'https://preview.example' });
    expect(ctaLogs()).toHaveLength(1);
  });

  it('still logs same-origin and Origin-less beacons', async () => {
    await beacon({ Origin: 'https://m3mm.net' });
    await beacon({});
    expect(ctaLogs()).toHaveLength(2);
  });
});
