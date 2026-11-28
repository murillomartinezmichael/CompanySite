import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost } from '../../functions/api/track';
import { __resetBuckets } from '../../functions/_lib/rate';

// `ts` is client-supplied. JSON.parse turns 1e400 into Infinity, which the log
// line serialises as null; any other number backdates/forward-dates the event.
const NOW = Date.UTC(2026, 10, 27, 12, 0, 0);
const logMock = vi.fn();

async function loggedTs(rawBody: string): Promise<unknown> {
  logMock.mockClear();
  const request = new Request('https://m3mm.net/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://m3mm.net', 'CF-Connecting-IP': '192.0.2.51' },
    body: rawBody,
  });
  await onRequestPost({ request, env: {} } as unknown as Parameters<typeof onRequestPost>[0]);
  const line = logMock.mock.calls.map(([l]) => String(l)).find((l) => l.includes('"event":"cta"'));
  return JSON.parse(line!).ts;
}

beforeEach(() => {
  __resetBuckets();
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
  vi.spyOn(console, 'log').mockImplementation(logMock);
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe('track ts is bounded to a plausible client clock', () => {
  it('replaces a non-finite ts (1e400 -> Infinity) with server time', async () => {
    expect(await loggedTs('{"name":"hero-review","ts":1e400}')).toBe(NOW);
  });

  it.each([-1, 0, 32503680000000, NOW - 2 * 86_400_000, NOW + 2 * 86_400_000])(
    'replaces implausible ts %s with server time', async (ts) => {
      expect(await loggedTs(JSON.stringify({ name: 'hero-review', ts }))).toBe(NOW);
    },
  );

  it('keeps a client ts within a day of server time', async () => {
    expect(await loggedTs(JSON.stringify({ name: 'hero-review', ts: NOW - 5_000 }))).toBe(NOW - 5_000);
  });
});
