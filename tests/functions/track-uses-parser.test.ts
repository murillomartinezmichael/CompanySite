import { afterEach, describe, expect, it, vi } from 'vitest';

// The handler must run the shared, unit-tested parser rather than its own
// inline copy; the two copies had already drifted (intent, ts bound).
const spies = vi.hoisted(() => ({ parse: vi.fn(), clean: vi.fn() }));
vi.mock('../../functions/_lib/track-parse', async (importOriginal) => {
  const real = await importOriginal<typeof import('../../functions/_lib/track-parse')>();
  return {
    ...real,
    parseTrackBody: (...a: Parameters<typeof real.parseTrackBody>) => { spies.parse(...a); return real.parseTrackBody(...a); },
    cleanTrackEvent: (...a: Parameters<typeof real.cleanTrackEvent>) => { spies.clean(...a); return real.cleanTrackEvent(...a); },
  };
});

afterEach(() => vi.restoreAllMocks());

describe('/api/track uses functions/_lib/track-parse', () => {
  it('parses and cleans every beacon through the shared module', async () => {
    const { onRequestPost } = await import('../../functions/api/track');
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const request = new Request('https://m3mm.net/api/track', {
      method: 'POST', headers: { Origin: 'https://m3mm.net', 'CF-Connecting-IP': '192.0.2.78' },
      body: '{"name":"hero-review"}',
    });
    await onRequestPost({ request, env: {} } as unknown as Parameters<typeof onRequestPost>[0]);
    expect(spies.parse).toHaveBeenCalledWith('{"name":"hero-review"}');
    expect(spies.clean).toHaveBeenCalledTimes(1);
  });
});
