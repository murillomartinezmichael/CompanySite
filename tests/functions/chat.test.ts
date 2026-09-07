// /api/chat — the Claude-powered assistant that replaced the SiteGuide embed
// (2026-08-20). Same hardening shape as lead.ts/track.ts: this suite drives
// the REAL exported handlers for every layer that runs before the Anthropic
// call (method routing, CORS, rate limit, body validation, missing-key
// degradation), then mocks the SDK for the one happy-path streaming test —
// no real network call, no API key required to run this suite.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { __resetBuckets } from '../../functions/_lib/rate';

const ALLOWED_ORIGIN = 'https://m3mm.net';
const EVIL_ORIGIN = 'https://evil.example.com';

function ctx(request: Request, env: Record<string, string> = {}) {
  return { request, env } as unknown as Parameters<typeof import('../../functions/api/chat').onRequestPost>[0];
}

function req(body: unknown, opts: { origin?: string | null; headers?: Record<string, string> } = {}): Request {
  const headers = new Headers({ 'Content-Type': 'application/json', ...opts.headers });
  if (opts.origin !== null) headers.set('Origin', opts.origin ?? ALLOWED_ORIGIN);
  return new Request('https://m3mm.net/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

const validBody = { messages: [{ role: 'user', content: 'What does a basic site cost?' }] };

describe('/api/chat — method routing', () => {
  it('OPTIONS defers to the shared CORS preflight', async () => {
    const { onRequest } = await import('../../functions/api/chat');
    const res = await onRequest(ctx(new Request('https://m3mm.net/api/chat', { method: 'OPTIONS', headers: { Origin: ALLOWED_ORIGIN, 'Access-Control-Request-Method': 'POST' } })));
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED_ORIGIN);
  });

  it('rejects a non-OPTIONS, non-POST method', async () => {
    const { onRequest } = await import('../../functions/api/chat');
    const res = await onRequest(ctx(new Request('https://m3mm.net/api/chat', { method: 'GET' })));
    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('POST, OPTIONS');
  });
});

describe('/api/chat — CORS', () => {
  beforeEach(() => __resetBuckets());

  it('403s a disallowed origin', async () => {
    const { onRequestPost } = await import('../../functions/api/chat');
    const res = await onRequestPost(ctx(req(validBody, { origin: EVIL_ORIGIN })));
    expect(res.status).toBe(403);
    expect((await res.json())).toEqual({ ok: false, error: 'origin_not_allowed' });
  });

  it('allows a null Origin (same-origin / server-side call)', async () => {
    const { onRequestPost } = await import('../../functions/api/chat');
    const res = await onRequestPost(ctx(req(validBody, { origin: null })));
    // No ANTHROPIC_API_KEY in this test's env -> 503, not 403. Proves the
    // request cleared the origin gate before hitting the missing-key check.
    expect(res.status).toBe(503);
  });
});

describe('/api/chat — rate limit', () => {
  beforeEach(() => __resetBuckets());

  it('429s after the per-IP ceiling, with Retry-After', async () => {
    const { onRequestPost } = await import('../../functions/api/chat');
    const withIp = (r: Request) => {
      const h = new Headers(r.headers);
      h.set('CF-Connecting-IP', '203.0.113.50');
      return new Request(r.url, { method: r.method, headers: h, body: JSON.stringify(validBody) });
    };
    let last: Response | undefined;
    for (let i = 0; i < 16; i++) {
      last = await onRequestPost(ctx(withIp(req(validBody))));
    }
    expect(last!.status).toBe(429);
    expect(last!.headers.get('Retry-After')).toBeTruthy();
  });

  it('is isolated from /api/lead and /api/track buckets (namespaced key)', async () => {
    const { onRequestPost } = await import('../../functions/api/chat');
    const ip = '203.0.113.51';
    const withIp = (r: Request) => {
      const h = new Headers(r.headers);
      h.set('CF-Connecting-IP', ip);
      return new Request(r.url, { method: r.method, headers: h, body: JSON.stringify(validBody) });
    };
    // 15 track-style beacons wouldn't fit in chat's 15/60s ceiling if the
    // buckets were shared with track's 60/60s — but they're different routes,
    // so a fresh chat request here must still see its own untouched bucket.
    const res = await onRequestPost(ctx(withIp(req(validBody))));
    expect(res.status).not.toBe(429);
  });
});

describe('/api/chat — validation', () => {
  beforeEach(() => __resetBuckets());

  async function post(body: unknown) {
    const { onRequestPost } = await import('../../functions/api/chat');
    return onRequestPost(ctx(req(body)));
  }

  it('400s when messages is missing', async () => {
    const res = await post({});
    expect(res.status).toBe(400);
    expect((await res.json()).field).toBe('messages');
  });

  it('400s when messages is empty', async () => {
    const res = await post({ messages: [] });
    expect(res.status).toBe(400);
  });

  it('400s when messages is not an array', async () => {
    const res = await post({ messages: 'hi' });
    expect(res.status).toBe(400);
  });

  it('400s over the history-length ceiling', async () => {
    const many = Array.from({ length: 21 }, (_, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: `msg ${i}` }));
    const res = await post({ messages: many });
    expect(res.status).toBe(400);
    expect((await res.json()).reason).toBe('too_many');
  });

  it('400s a message over the per-message character cap', async () => {
    const res = await post({ messages: [{ role: 'user', content: 'x'.repeat(4001) }] });
    expect(res.status).toBe(400);
    expect((await res.json()).reason).toBe('malformed');
  });

  it('400s a message with an invalid role', async () => {
    const res = await post({ messages: [{ role: 'system', content: 'hi' }] });
    expect(res.status).toBe(400);
  });

  it('400s a blank-content message', async () => {
    const res = await post({ messages: [{ role: 'user', content: '   ' }] });
    expect(res.status).toBe(400);
  });

  it("400s when the last message isn't from the user", async () => {
    const res = await post({
      messages: [
        { role: 'user', content: 'hi' },
        { role: 'assistant', content: 'hello' },
      ],
    });
    expect(res.status).toBe(400);
    expect((await res.json()).reason).toBe('must_end_with_user');
  });

  it('400s malformed JSON', async () => {
    const { onRequestPost } = await import('../../functions/api/chat');
    const request = new Request('https://m3mm.net/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: ALLOWED_ORIGIN },
      body: '{not json',
    });
    const res = await onRequestPost(ctx(request));
    expect(res.status).toBe(400);
  });

  it('413s a request over the body-size cap via Content-Length', async () => {
    const { onRequestPost } = await import('../../functions/api/chat');
    const request = req(validBody, { headers: { 'Content-Length': String(20 * 1024) } });
    const res = await onRequestPost(ctx(request));
    expect(res.status).toBe(413);
  });
});

describe('/api/chat — missing key (LAW 6: never fake a reply)', () => {
  beforeEach(() => __resetBuckets());

  it('503s instead of faking a response when ANTHROPIC_API_KEY is unset', async () => {
    const { onRequestPost } = await import('../../functions/api/chat');
    const res = await onRequestPost(ctx(req(validBody)));
    expect(res.status).toBe(503);
    expect((await res.json())).toEqual({ ok: false, error: 'assistant_unavailable' });
  });
});

describe('/api/chat — security headers', () => {
  beforeEach(() => __resetBuckets());

  // Regression, measured against production 2026-09-07: `verify-security-headers.py`
  // reported /api/chat FAIL on all five while /api/lead and /api/track PASSed. Cause:
  // onRequest returned `preflightResponse(env, request)` raw. cors.ts builds that
  // Response itself and owns only the CORS decision, so nothing layered the security
  // headers on — exactly what `secureResponse` exists for, and what lead.ts already did.
  // The pre-existing OPTIONS test asserted status + ACAO only, so it stayed green.
  const FIVE = [
    'Strict-Transport-Security',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy',
    'Permissions-Policy',
  ];

  it('the GRANTED OPTIONS preflight carries the five hardened headers', async () => {
    const { onRequest } = await import('../../functions/api/chat');
    const res = await onRequest(ctx(new Request('https://m3mm.net/api/chat', {
      method: 'OPTIONS',
      headers: { Origin: ALLOWED_ORIGIN, 'Access-Control-Request-Method': 'POST' },
    })));
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED_ORIGIN);
    for (const name of FIVE) {
      expect(res.headers.get(name), `granted preflight missing ${name}`).toBeTruthy();
    }
  });

  it('the DENIED OPTIONS preflight also carries them, and grants nothing', async () => {
    const { onRequest } = await import('../../functions/api/chat');
    const res = await onRequest(ctx(new Request('https://m3mm.net/api/chat', {
      method: 'OPTIONS',
      headers: { Origin: EVIL_ORIGIN, 'Access-Control-Request-Method': 'POST' },
    })));
    expect(res.status).toBe(204);
    // A denial must still be a hardened response, and must not leak a grant.
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
    for (const name of FIVE) {
      expect(res.headers.get(name), `denied preflight missing ${name}`).toBeTruthy();
    }
  });

  it('every response carries the five hardened headers, including error paths', async () => {
    const { onRequestPost } = await import('../../functions/api/chat');
    const res = await onRequestPost(ctx(req({})));
    for (const name of ['Strict-Transport-Security', 'X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'Permissions-Policy']) {
      expect(res.headers.get(name), `missing ${name}`).toBeTruthy();
    }
  });
});

describe('/api/chat — streaming happy path (mocked SDK, no network)', () => {
  beforeEach(() => {
    __resetBuckets();
    vi.resetModules();
  });

  it('streams NDJSON deltas then a done event', async () => {
    vi.doMock('@anthropic-ai/sdk', () => {
      class FakeStream {
        async *[Symbol.asyncIterator]() {
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hi ' } };
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'there!' } };
        }
        async finalMessage() {
          return { stop_reason: 'end_turn' };
        }
      }
      class FakeAnthropic {
        messages = { stream: () => new FakeStream() };
        static APIError = class extends Error {};
      }
      return { default: FakeAnthropic };
    });

    const { onRequestPost } = await import('../../functions/api/chat');
    const res = await onRequestPost(ctx(req(validBody, {}), { ANTHROPIC_API_KEY: 'test-key' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/x-ndjson');

    const text = await res.text();
    const lines = text.trim().split('\n').map((l) => JSON.parse(l));
    expect(lines).toEqual([
      { type: 'delta', text: 'Hi ' },
      { type: 'delta', text: 'there!' },
      { type: 'done' },
    ]);

    vi.doUnmock('@anthropic-ai/sdk');
  });

  it('surfaces a refusal as an error event instead of a silent done', async () => {
    vi.doMock('@anthropic-ai/sdk', () => {
      class FakeStream {
        async *[Symbol.asyncIterator]() {}
        async finalMessage() {
          return { stop_reason: 'refusal' };
        }
      }
      class FakeAnthropic {
        messages = { stream: () => new FakeStream() };
        static APIError = class extends Error {};
      }
      return { default: FakeAnthropic };
    });

    const { onRequestPost } = await import('../../functions/api/chat');
    const res = await onRequestPost(ctx(req(validBody, {}), { ANTHROPIC_API_KEY: 'test-key' }));
    const text = await res.text();
    const lines = text.trim().split('\n').map((l) => JSON.parse(l));
    expect(lines).toEqual([{ type: 'error', message: 'The assistant declined to answer that.' }]);

    vi.doUnmock('@anthropic-ai/sdk');
  });
});

describe('/api/chat — role alternation (Anthropic requires user-first + alternating)', () => {
  beforeEach(() => __resetBuckets());

  it('400s when the first message is not from the user', async () => {
    const { onRequestPost } = await import('../../functions/api/chat');
    const body = { messages: [
      { role: 'assistant', content: 'hi' },
      { role: 'user', content: 'hello' },
    ] };
    const res = await onRequestPost(ctx(req(body)));
    expect(res.status).toBe(400);
    expect((await res.json()).reason).toBe('must_start_with_user');
  });

  it('400s on consecutive same-role messages', async () => {
    const { onRequestPost } = await import('../../functions/api/chat');
    const body = { messages: [
      { role: 'user', content: 'first' },
      { role: 'user', content: 'second' },
    ] };
    const res = await onRequestPost(ctx(req(body)));
    expect(res.status).toBe(400);
    expect((await res.json()).reason).toBe('must_alternate');
  });

  it('accepts a valid alternating history (clears validation, 503 on missing key)', async () => {
    const { onRequestPost } = await import('../../functions/api/chat');
    const body = { messages: [
      { role: 'user', content: 'a' },
      { role: 'assistant', content: 'b' },
      { role: 'user', content: 'c' },
    ] };
    const res = await onRequestPost(ctx(req(body)));
    // No ANTHROPIC_API_KEY in env -> 503 proves it cleared alternation validation.
    expect(res.status).toBe(503);
  });
});
