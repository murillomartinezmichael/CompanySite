import { describe, expect, it, vi } from 'vitest';
import { onRequest } from '../../functions/api/_middleware';
import { API_SECURITY_HEADERS } from '../../functions/_lib/security-headers';

const run = (next: () => Promise<Response>) => onRequest({ next } as Parameters<typeof onRequest>[0]);

describe('API middleware boundary', () => {
  it.each([200, 404, 405, 429])('hardens an otherwise bare %i response from any handler', async status => {
    const response = await run(async () => new Response('body', { status }));
    expect(response.status).toBe(status);
    expect(await response.text()).toBe('body');
    for (const [header, value] of Object.entries(API_SECURITY_HEADERS)) {
      expect(response.headers.get(header)).toBe(value);
    }
  });

  it('preserves CORS, redirect, retry and intentional header values', async () => {
    const headers = {
      'Access-Control-Allow-Origin': 'https://m3mm.net', Vary: 'Origin',
      Location: '/thanks', 'Retry-After': '60', 'Cache-Control': 'no-store',
      'X-Frame-Options': 'SAMEORIGIN',
    };
    const response = await run(async () => new Response(null, { status: 303, headers }));
    expect(response.status).toBe(303);
    for (const [header, value] of Object.entries(headers)) expect(response.headers.get(header)).toBe(value);
  });

  it('returns a chat stream before the producer finishes', async () => {
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({ start(c) { controller = c; } });
    const response = await run(async () => new Response(stream, {
      headers: { 'Content-Type': 'application/x-ndjson' },
    }));
    expect(response.headers.get('Content-Type')).toBe('application/x-ndjson');
    controller.enqueue(new TextEncoder().encode('{"token":"hello"}\n'));
    controller.close();
    expect(await response.text()).toBe('{"token":"hello"}\n');
  });

  it('turns an unexpected throw into a private, non-cacheable error', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const response = await run(async () => { throw new Error('private request details'); });
      expect(response.status).toBe(500);
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(await response.json()).toEqual({ ok: false, error: 'internal_error' });
      for (const [header, value] of Object.entries(API_SECURITY_HEADERS)) expect(response.headers.get(header)).toBe(value);
      expect(log).toHaveBeenCalledWith('{"event":"api_unhandled_error"}');
    } finally { log.mockRestore(); }
  });
});
