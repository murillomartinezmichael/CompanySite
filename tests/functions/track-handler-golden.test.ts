import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost } from '../../functions/api/track';
import { __resetBuckets } from '../../functions/_lib/rate';

// Byte-level contract of the CTA log line that Cloudflare tail consumers read.
// The expected strings were recorded from the handler BEFORE it was switched
// to functions/_lib/track-parse.ts; the parser move must not change one byte.
const NOW = Date.UTC(2026, 10, 27, 12, 0, 0);
const logMock = vi.fn();
const long = 'x'.repeat(600);

async function logged(body: string, contentType = 'application/json'): Promise<string | undefined> {
  logMock.mockClear();
  const request = new Request('https://m3mm.net/api/track', {
    method: 'POST',
    headers: { 'Content-Type': contentType, Origin: 'https://m3mm.net', 'CF-Connecting-IP': '192.0.2.77', 'User-Agent': 'SyntheticAgent/1.0' },
    body,
  });
  const response = await onRequestPost({ request, env: {} } as unknown as Parameters<typeof onRequestPost>[0]);
  expect(response.status).toBe(204);
  return logMock.mock.calls.map(([l]) => String(l)).find((l) => l.includes('"event":"cta"'));
}

beforeEach(() => {
  __resetBuckets();
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
  vi.spyOn(console, 'log').mockImplementation(logMock);
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

const tail = `"ip":"192.0.2.77","ua":"SyntheticAgent/1.0"`;
const cases: Array<[string, string, string, string?]> = [
  ['full JSON beacon',
    JSON.stringify({ name: 'hero-review', section: 'hero', source: 'home', intent: 'book:free-review', path: '/audit', referrer: 'https://example.invalid/', ts: NOW - 1000 }),
    `{"event":"cta","cta":"hero-review","section":"hero","source":"home","intent":"book:free-review","path":"/audit","referrer":"https://example.invalid/",${tail},"ts":${NOW - 1000}}`],
  ['JSON beacon with no ts',
    JSON.stringify({ name: 'nav-start', intent: 'checkout:basic-deposit' }),
    `{"event":"cta","cta":"nav-start","intent":"checkout:basic-deposit",${tail},"ts":${NOW}}`],
  ['url-encoded sendBeacon fallback (keeps intent, ignores path)',
    'name=hero-review&section=hero&source=home&intent=book%3Afree-review&path=%2Fignored',
    `{"event":"cta","cta":"hero-review","section":"hero","source":"home","intent":"book:free-review",${tail},"ts":${NOW}}`,
    'text/plain'],
  ['empty body', '', `{"event":"cta","cta":"unknown",${tail},"ts":${NOW}}`],
  ['JSON null', 'null', `{"event":"cta","cta":"unknown",${tail},"ts":${NOW}}`],
  ['JSON array', '[{"name":"x"}]', `{"event":"cta","cta":"unknown",${tail},"ts":${NOW}}`],
  ['non-string fields and blank strings',
    JSON.stringify({ name: 42, section: '   ', source: '', intent: { a: 1 }, path: ['/x'] }),
    `{"event":"cta","cta":"unknown",${tail},"ts":${NOW}}`],
  ['oversized fields are trimmed and capped',
    JSON.stringify({ name: `  ${long}`, section: long, source: long, intent: long, path: long, referrer: long }),
    `{"event":"cta","cta":"${'x'.repeat(80)}","section":"${'x'.repeat(40)}","source":"${'x'.repeat(64)}","intent":"${'x'.repeat(64)}","path":"${'x'.repeat(256)}","referrer":"${'x'.repeat(512)}",${tail},"ts":${NOW}}`],
  ['implausible ts falls back to server time',
    JSON.stringify({ name: 'hero-review', ts: NOW - 2 * 86_400_000 }),
    `{"event":"cta","cta":"hero-review",${tail},"ts":${NOW}}`],
  ['non-finite ts falls back to server time',
    '{"name":"hero-review","ts":1e400}',
    `{"event":"cta","cta":"hero-review",${tail},"ts":${NOW}}`],
  ['string ts falls back to server time',
    JSON.stringify({ name: 'hero-review', ts: String(NOW - 1000) }),
    `{"event":"cta","cta":"hero-review",${tail},"ts":${NOW}}`],
];

describe('track handler log line is byte-stable', () => {
  it.each(cases)('%s', async (_label, body, expected, contentType) => {
    expect(await logged(body, contentType)).toBe(expected);
  });
});
