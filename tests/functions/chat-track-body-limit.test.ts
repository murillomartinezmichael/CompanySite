import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost as chatPost } from '../../functions/api/chat';
import { onRequestPost as trackPost } from '../../functions/api/track';
import { __resetBuckets } from '../../functions/_lib/rate';
import { API_SECURITY_HEADERS } from '../../functions/_lib/security-headers';

const sdk = vi.hoisted(() => ({ construct: vi.fn(), stream: vi.fn() }));
vi.mock('@anthropic-ai/sdk', () => ({
  default: class FakeAnthropic {
    constructor(options: unknown) { sdk.construct(options); }
    messages = { stream: sdk.stream };
    static APIError = class extends Error {};
  },
}));

type Route = 'chat' | 'track';
const encoder = new TextEncoder();
const VALUE = 'Synthetic café 😀';
const logMock = vi.fn();
const fetchMock = vi.fn(async () => { throw new Error('Network forbidden in synthetic test'); });

function fields(route: Route): Record<string, unknown> {
  return route === 'chat'
    ? { messages: [{ role: 'user', content: VALUE }] }
    : { name: VALUE, section: 'synthetic', source: 'fixture' };
}

function post(route: Route, body: string | ReadableStream<Uint8Array>, headers: Record<string, string> = {}) {
  return new Request(`https://m3mm.net/api/${route}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://m3mm.net',
      'CF-Connecting-IP': '192.0.2.2',
      ...headers,
    },
    body,
    duplex: 'half',
  } as RequestInit);
}

function invoke(route: Route, request: Request) {
  // Supplying a synthetic key proves rejection precedes the SDK, rather than
  // accidentally passing because the unconfigured-key path stopped delivery.
  const ctx = { request, env: { ANTHROPIC_API_KEY: 'synthetic-fixture' } };
  return route === 'chat'
    ? chatPost(ctx as unknown as Parameters<typeof chatPost>[0])
    : trackPost(ctx as unknown as Parameters<typeof trackPost>[0]);
}

function streamed(chunks: Uint8Array[], cancellation: () => void | Promise<void> = () => {}) {
  let pulls = 0;
  const cancel = vi.fn(cancellation);
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      const chunk = chunks[pulls++];
      if (chunk) controller.enqueue(chunk);
      else controller.close();
    },
    cancel,
  }, { highWaterMark: 0 });
  return { stream, cancel, pulls: () => pulls };
}

function expectHeaders(route: Route, response: Response) {
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  for (const [name, value] of Object.entries(API_SECURITY_HEADERS)) {
    expect(response.headers.get(name)).toBe(value);
  }
  if (route === 'chat') {
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://m3mm.net');
    expect(response.headers.get('Vary')).toContain('Origin');
  } else {
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  }
}

async function expectRejected(route: Route, response: Response, readFailure = false) {
  expectHeaders(route, response);
  if (route === 'chat') {
    expect(response.status).toBe(readFailure ? 400 : 413);
    expect(await response.json()).toEqual({
      ok: false,
      error: readFailure ? 'invalid_body' : 'payload_too_large',
    });
  } else {
    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
  }
  expect(sdk.construct).not.toHaveBeenCalled();
  expect(sdk.stream).not.toHaveBeenCalled();
  expect(logMock).not.toHaveBeenCalled();
}

async function expectAccepted(route: Route, response: Response) {
  expectHeaders(route, response);
  if (route === 'chat') {
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/x-ndjson');
    expect((await response.text()).trim().split('\n').map(line => JSON.parse(line))).toEqual([
      { type: 'delta', text: 'Synthetic reply' },
      { type: 'done' },
    ]);
    expect(sdk.construct).toHaveBeenCalledExactlyOnceWith({ apiKey: 'synthetic-fixture' });
    expect(sdk.stream).toHaveBeenCalledTimes(1);
    expect(sdk.stream.mock.calls[0][0].messages).toEqual([{ role: 'user', content: VALUE }]);
    expect(logMock).not.toHaveBeenCalled();
  } else {
    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
    expect(logMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(logMock.mock.calls[0][0])).toMatchObject({ event: 'cta', cta: VALUE });
    expect(sdk.construct).not.toHaveBeenCalled();
    expect(sdk.stream).not.toHaveBeenCalled();
  }
}

beforeEach(() => {
  __resetBuckets();
  sdk.construct.mockClear();
  sdk.stream.mockReset();
  sdk.stream.mockImplementation(() => ({
    async *[Symbol.asyncIterator]() {
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Synthetic reply' } };
    },
    async finalMessage() { return { stop_reason: 'end_turn' }; },
  }));
  logMock.mockClear();
  fetchMock.mockClear();
  vi.spyOn(console, 'log').mockImplementation(logMock);
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  try {
    expect(fetchMock).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  }
});

describe.each([
  { route: 'chat' as const, limit: 16 * 1024 },
  { route: 'track' as const, limit: 4 * 1024 },
])('/api/$route byte budget', ({ route, limit }) => {
  it.each([
    ['absent', {}],
    ['understated', { 'Content-Length': '100' }],
  ] as const)('rejects oversized UTF-8 with %s Content-Length before effects', async (_label, headers) => {
    const body = JSON.stringify({ ...fields(route), ignoredPadding: 'é'.repeat(limit / 2) });
    expect(body.length).toBeLessThan(limit);
    expect(encoder.encode(body).byteLength).toBeGreaterThan(limit);
    await expectRejected(route, await invoke(route, post(route, body, headers)));
  });

  it.each([0, 1])('enforces the byte boundary at limit + %i', async extra => {
    const base = JSON.stringify({ ...fields(route), ignoredPadding: '' });
    const body = JSON.stringify({
      ...fields(route),
      ignoredPadding: 'x'.repeat(limit + extra - encoder.encode(base).byteLength),
    });
    expect(encoder.encode(body).byteLength).toBe(limit + extra);
    const response = await invoke(route, post(route, body));
    if (extra === 0) await expectAccepted(route, response);
    else await expectRejected(route, response);
  });

  it.each([
    ['resolves', () => Promise.resolve()],
    ['rejects', () => Promise.reject(new Error('Synthetic cancellation failure'))],
    ['never settles', () => new Promise<void>(() => {})],
  ] as const)('stops pulling at overflow when cancellation %s', async (_label, cancellation) => {
    const fixture = streamed([
      new Uint8Array(limit / 2 + 1),
      new Uint8Array(limit / 2 + 1),
      encoder.encode('must remain unread'),
    ], cancellation);

    await expectRejected(route, await invoke(route, post(route, fixture.stream)));
    expect(fixture.pulls()).toBe(2);
    expect(fixture.cancel).toHaveBeenCalledTimes(1);
    expect(fixture.stream.locked).toBe(false);
  });

  it('preserves read-failure responses and headers without effects', async () => {
    let pulls = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (pulls++ === 0) controller.enqueue(encoder.encode('{'));
        else controller.error(new Error('Synthetic read failure'));
      },
    }, { highWaterMark: 0 });
    await expectRejected(route, await invoke(route, post(route, stream)), true);
    expect(stream.locked).toBe(false);
  });

  it('preserves valid UTF-8 split across chunks at the upstream or log boundary', async () => {
    const bytes = encoder.encode(JSON.stringify(fields(route)));
    const emoji = bytes.indexOf(0xf0);
    expect(emoji).toBeGreaterThan(0);
    const fixture = streamed([
      bytes.slice(0, emoji + 1),
      bytes.slice(emoji + 1, emoji + 3),
      bytes.slice(emoji + 3),
    ]);
    await expectAccepted(route, await invoke(route, post(route, fixture.stream)));
    expect(fixture.cancel).not.toHaveBeenCalled();
    expect(fixture.stream.locked).toBe(false);
  });

  it('rejects oversized Content-Length before pulling', async () => {
    const fixture = streamed([encoder.encode(JSON.stringify(fields(route)))]);
    await expectRejected(route, await invoke(route, post(route, fixture.stream, {
      'Content-Length': String(limit + 1),
    })));
    expect(fixture.pulls()).toBe(0);
  });
});

it('/api/track preserves URL-encoded beacon fields', async () => {
  const body = new URLSearchParams({ name: VALUE, section: 'synthetic', source: 'fixture' }).toString();
  const fixture = streamed([encoder.encode(body.slice(0, 12)), encoder.encode(body.slice(12))]);
  await expectAccepted('track', await invoke('track', post('track', fixture.stream, {
    'Content-Type': 'application/x-www-form-urlencoded',
  })));
  expect(JSON.parse(logMock.mock.calls[0][0])).toMatchObject({ section: 'synthetic', source: 'fixture' });
  expect(fixture.stream.locked).toBe(false);
});
