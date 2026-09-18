import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost as leadPost } from '../../functions/api/lead';
import { __resetBuckets } from '../../functions/_lib/rate';
import { API_SECURITY_HEADERS } from '../../functions/_lib/security-headers';
import { LIMITS } from '../../functions/_lib/validate';

const encoder = new TextEncoder();
const FIELDS = {
  name: 'Renée 😀',
  email: 'synthetic@example.invalid',
  businessType: 'Synthetic fixture',
  frustration: 'Synthetic intake verification only.',
};
// All delivery paths are configured so a rejection cannot pass merely because
// an unset binding skipped delivery. fetch is replaced before every invocation.
const ENV = {
  RESEND_API_KEY: 'synthetic-fixture',
  LEAD_TO: 'operator@example.invalid',
  COCKPIT_INGEST_URL: 'https://cockpit.example.invalid/ingest',
  COCKPIT_INGEST_TOKEN: 'synthetic-fixture',
  N8N_LEAD_WEBHOOK_URL: 'https://n8n.example.invalid/intake',
};
const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
  new Response('{}', { status: 200 }));

function post(
  body: string | ReadableStream<Uint8Array>,
  headers: Record<string, string> = {},
) {
  return new Request('https://m3mm.net/api/lead', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://m3mm.net',
      'CF-Connecting-IP': '192.0.2.1',
      ...headers,
    },
    body,
    duplex: 'half',
  } as RequestInit);
}

const ctx = (request: Request) =>
  ({ request, env: ENV }) as unknown as Parameters<typeof leadPost>[0];

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

async function expectRejection(response: Response, status: number, error: string) {
  expect(response.status).toBe(status);
  expect(await response.json()).toEqual({
    ok: false,
    error,
    ...(status === 413 ? { limit: LIMITS.bodyBytes } : {}),
  });
  expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://m3mm.net');
  expect(response.headers.get('Vary')).toContain('Origin');
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  for (const [header, value] of Object.entries(API_SECURITY_HEADERS)) {
    expect(response.headers.get(header)).toBe(value);
  }
  expect(fetchMock).not.toHaveBeenCalled();
}

beforeEach(() => {
  __resetBuckets();
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('/api/lead request byte budget', () => {
  it.each([
    ['absent', {}],
    ['understated', { 'Content-Length': '100' }],
  ] as const)('rejects oversized UTF-8 with %s Content-Length', async (_label, headers) => {
    const body = JSON.stringify({ ...FIELDS, ignoredPadding: 'é'.repeat(9000) });
    expect(body.length).toBeLessThan(LIMITS.bodyBytes);
    expect(encoder.encode(body).byteLength).toBeGreaterThan(LIMITS.bodyBytes);

    await expectRejection(await leadPost(ctx(post(body, headers))), 413, 'payload_too_large');
  });

  it('accepts exactly the byte limit, including multibyte field values', async () => {
    const base = JSON.stringify({ ...FIELDS, ignoredPadding: '' });
    const body = JSON.stringify({
      ...FIELDS,
      ignoredPadding: 'x'.repeat(LIMITS.bodyBytes - encoder.encode(base).byteLength),
    });
    expect(encoder.encode(body).byteLength).toBe(LIMITS.bodyBytes);

    const response = await leadPost(ctx(post(body)));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('rejects one byte over the limit', async () => {
    const base = JSON.stringify({ ...FIELDS, ignoredPadding: '' });
    const body = JSON.stringify({
      ...FIELDS,
      ignoredPadding: 'x'.repeat(LIMITS.bodyBytes + 1 - encoder.encode(base).byteLength),
    });
    expect(encoder.encode(body).byteLength).toBe(LIMITS.bodyBytes + 1);
    await expectRejection(await leadPost(ctx(post(body))), 413, 'payload_too_large');
  });

  it.each([
    ['resolves', () => Promise.resolve()],
    ['rejects', () => Promise.reject(new Error('synthetic cancellation failure'))],
    ['never settles', () => new Promise<void>(() => {})],
  ] as const)('stops pulling and returns 413 even if cancellation %s', async (_label, cancellation) => {
    const fixture = streamed([
      new Uint8Array(9000),
      new Uint8Array(9000),
      encoder.encode('must remain unread'),
    ], cancellation);

    await expectRejection(await leadPost(ctx(post(fixture.stream))), 413, 'payload_too_large');
    expect(fixture.pulls()).toBe(2);
    expect(fixture.cancel).toHaveBeenCalledTimes(1);
    expect(fixture.stream.locked).toBe(false);
  });

  it('returns a hardened 400 on a stream read failure without delivery', async () => {
    let pulls = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (pulls++ === 0) controller.enqueue(encoder.encode('{"name":'));
        else controller.error(new Error('synthetic read failure'));
      },
    }, { highWaterMark: 0 });

    await expectRejection(await leadPost(ctx(post(stream))), 400, 'body_unreadable');
    expect(stream.locked).toBe(false);
  });

  it('preserves a JSON field when a UTF-8 character spans chunks', async () => {
    const bytes = encoder.encode(JSON.stringify(FIELDS));
    const emoji = bytes.indexOf(0xf0);
    expect(emoji).toBeGreaterThan(0);
    const fixture = streamed([
      bytes.slice(0, emoji + 1),
      bytes.slice(emoji + 1, emoji + 3),
      bytes.slice(emoji + 3),
    ]);

    const response = await leadPost(ctx(post(fixture.stream)));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(4);
    const adminEmail = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(adminEmail.html).toContain(FIELDS.name);
    expect(fixture.cancel).not.toHaveBeenCalled();
    expect(fixture.stream.locked).toBe(false);
  });

  it('preserves UTF-8 native-form fields and the existing redirect', async () => {
    const body = new URLSearchParams(FIELDS).toString();
    const fixture = streamed([encoder.encode(body.slice(0, 12)), encoder.encode(body.slice(12))]);
    const response = await leadPost(ctx(post(fixture.stream, {
      'Content-Type': 'application/x-www-form-urlencoded',
    })));

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/thanks');
    expect(fetchMock).toHaveBeenCalledTimes(4);
    const adminEmail = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(adminEmail.html).toContain(FIELDS.name);
    expect(fixture.stream.locked).toBe(false);
  });

  it('rejects an oversized declared length before reading or delivery', async () => {
    const fixture = streamed([encoder.encode(JSON.stringify(FIELDS))]);
    await expectRejection(await leadPost(ctx(post(fixture.stream, {
      'Content-Length': String(LIMITS.bodyBytes + 1),
    }))), 413, 'payload_too_large');
    expect(fixture.pulls()).toBe(0);
  });
});
