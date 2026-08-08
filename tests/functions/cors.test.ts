// CORS policy on the money path.
//
// Regression cover for the 2026-08-03 finding: the `/api/lead` OPTIONS branch
// reflected any request Origin into Access-Control-Allow-Origin with no
// allowlist check, while onRequestPost did enforce one. These tests pin both
// halves of the fix — the pure policy helpers AND the real exported handler.

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_ORIGINS,
  ALLOWED_METHODS,
  PREFLIGHT_MAX_AGE_S,
  allowedOrigins,
  originAllowed,
  requestedHeadersAllowed,
  corsResponseHeaders,
  preflightResponse,
} from '../../functions/_lib/cors';
import { onRequest, onRequestPost } from '../../functions/api/lead';

const ALLOWED = 'https://m3mm.net';
const EVIL = 'https://evil.example.com';

/** Build a CORS preflight. `origin: null` omits the header entirely. */
function preflight(
  origin: string | null,
  opts: { requestMethod?: string | null; requestHeaders?: string } = {},
): Request {
  const headers = new Headers();
  if (origin !== null) headers.set('Origin', origin);
  const method = opts.requestMethod === undefined ? 'POST' : opts.requestMethod;
  if (method !== null) headers.set('Access-Control-Request-Method', method);
  if (opts.requestHeaders !== undefined) {
    headers.set('Access-Control-Request-Headers', opts.requestHeaders);
  }
  return new Request('https://m3mm.net/api/lead', { method: 'OPTIONS', headers });
}

/** Every `access-control-*` header present on a response, lowercased + sorted. */
function corsHeaderNames(res: Response): string[] {
  const names: string[] = [];
  res.headers.forEach((_value, key) => {
    if (key.toLowerCase().startsWith('access-control-')) names.push(key.toLowerCase());
  });
  return names.sort();
}

/** Call the real Pages Function catch-all with only the context fields it uses. */
function callOnRequest(request: Request, env: Record<string, unknown> = {}) {
  return (onRequest as unknown as (ctx: unknown) => Promise<Response>)({ request, env });
}

function callOnRequestPost(request: Request, env: Record<string, unknown> = {}) {
  return (onRequestPost as unknown as (ctx: unknown) => Promise<Response>)({ request, env });
}

describe('allowedOrigins', () => {
  it('falls back to the built-in list when ALLOWED_ORIGINS is unset', () => {
    expect(allowedOrigins({})).toEqual(DEFAULT_ORIGINS);
    expect(allowedOrigins({}).includes(ALLOWED)).toBe(true);
  });

  it('parses a custom comma-separated list, trimming whitespace', () => {
    expect(
      allowedOrigins({ ALLOWED_ORIGINS: ' https://a.example.com , https://b.example.com ' }),
    ).toEqual(['https://a.example.com', 'https://b.example.com']);
  });

  it('treats an explicitly empty ALLOWED_ORIGINS as deny-all, not as "use defaults"', () => {
    // Pre-extraction behaviour, preserved deliberately: an operator who blanks
    // the var meant to close the door, not to re-open the defaults.
    expect(allowedOrigins({ ALLOWED_ORIGINS: '' })).toEqual([]);
    expect(originAllowed({ ALLOWED_ORIGINS: '' }, ALLOWED)).toBe(false);
  });
});

describe('originAllowed', () => {
  it('allows a null Origin — same-origin fetch, curl, or server-side call', () => {
    expect(originAllowed({}, null)).toBe(true);
  });

  it('allows every default origin and rejects anything else', () => {
    for (const origin of DEFAULT_ORIGINS) expect(originAllowed({}, origin)).toBe(true);
    expect(originAllowed({}, EVIL)).toBe(false);
    expect(originAllowed({}, 'http://m3mm.net')).toBe(false); // scheme matters
    expect(originAllowed({}, 'https://m3mm.net.evil.com')).toBe(false); // suffix trick
    expect(originAllowed({}, 'https://m3mm.net/')).toBe(false); // trailing slash is not an origin
  });

  it('honours a custom ALLOWED_ORIGINS list instead of the defaults', () => {
    const env = { ALLOWED_ORIGINS: 'https://client.example.com' };
    expect(originAllowed(env, 'https://client.example.com')).toBe(true);
    expect(originAllowed(env, ALLOWED)).toBe(false);
  });
});

describe('requestedHeadersAllowed', () => {
  it('accepts an absent or empty request-headers list', () => {
    expect(requestedHeadersAllowed(null)).toBe(true);
    expect(requestedHeadersAllowed('')).toBe(true);
    expect(requestedHeadersAllowed('  ,  ')).toBe(true);
  });

  it('accepts content-type in any casing, plus CORS-safelisted headers', () => {
    expect(requestedHeadersAllowed('content-type')).toBe(true);
    expect(requestedHeadersAllowed('Content-Type')).toBe(true);
    expect(requestedHeadersAllowed('content-type, accept, accept-language')).toBe(true);
  });

  it('rejects anything we do not actually read', () => {
    expect(requestedHeadersAllowed('authorization')).toBe(false);
    expect(requestedHeadersAllowed('content-type, x-api-key')).toBe(false);
    expect(requestedHeadersAllowed('cookie')).toBe(false);
  });

  it('rejects an absurdly long requested-headers list', () => {
    expect(requestedHeadersAllowed(Array(33).fill('content-type').join(','))).toBe(false);
  });
});

describe('preflightResponse — grant path', () => {
  it('204s an allowed origin with a matching Access-Control-Allow-Origin', () => {
    const res = preflightResponse({}, preflight(ALLOWED));
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED);
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe(ALLOWED_METHODS);
    expect(res.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    expect(res.headers.get('Access-Control-Max-Age')).toBe(String(PREFLIGHT_MAX_AGE_S));
    expect(res.headers.get('Allow')).toBe(ALLOWED_METHODS);
  });

  it('never emits Access-Control-Allow-Credentials', () => {
    const res = preflightResponse({}, preflight(ALLOWED));
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBeNull();
  });

  it('grants a custom ALLOWED_ORIGINS entry and denies the default one', () => {
    const env = { ALLOWED_ORIGINS: 'https://client.example.com' };
    const granted = preflightResponse(env, preflight('https://client.example.com'));
    expect(granted.headers.get('Access-Control-Allow-Origin')).toBe('https://client.example.com');

    const denied = preflightResponse(env, preflight(ALLOWED));
    expect(corsHeaderNames(denied)).toEqual([]);
  });

  it('grants when the preflight asks only for headers we accept', () => {
    const res = preflightResponse({}, preflight(ALLOWED, { requestHeaders: 'content-type' }));
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED);
  });
});

describe('preflightResponse — deny path emits zero Access-Control-* headers', () => {
  const cases: Array<[string, Request]> = [
    ['a non-allowlisted origin', preflight(EVIL)],
    ['a missing Origin header', preflight(null)],
    ['a blank Origin header', preflight('')],
    ['a malformed Origin', preflight('not-a-url')],
    ['the null Origin string (sandboxed iframe / file://)', preflight('null')],
    ['a requested method that is not POST', preflight(ALLOWED, { requestMethod: 'DELETE' })],
    ['a GET preflight', preflight(ALLOWED, { requestMethod: 'GET' })],
    ['no Access-Control-Request-Method at all', preflight(ALLOWED, { requestMethod: null })],
    ['a header we do not accept', preflight(ALLOWED, { requestHeaders: 'authorization' })],
    [
      'an accepted header smuggled alongside one we refuse',
      preflight(ALLOWED, { requestHeaders: 'content-type, x-admin' }),
    ],
  ];

  for (const [label, request] of cases) {
    it(`denies ${label}`, () => {
      const res = preflightResponse({}, request);
      expect(res.status).toBe(204);
      expect(corsHeaderNames(res)).toEqual([]);
      expect(res.headers.get('Allow')).toBe(ALLOWED_METHODS);
    });
  }

  it('accepts a lowercase requested method (spec normalises, we are lenient)', () => {
    const res = preflightResponse({}, preflight(ALLOWED, { requestMethod: 'post' }));
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED);
  });
});

describe('Vary: Origin on EVERY preflight response', () => {
  const requests: Request[] = [
    preflight(ALLOWED),
    preflight(EVIL),
    preflight(null),
    preflight(''),
    preflight(ALLOWED, { requestMethod: 'GET' }),
    preflight(ALLOWED, { requestHeaders: 'authorization' }),
  ];

  it('sets Vary on allowed and denied responses alike, so no cache cross-serves a grant', () => {
    for (const request of requests) {
      const vary = preflightResponse({}, request).headers.get('Vary') || '';
      expect(vary).toContain('Origin');
      expect(vary).toContain('Access-Control-Request-Method');
      expect(vary).toContain('Access-Control-Request-Headers');
    }
  });
});

describe('corsResponseHeaders — the POST side', () => {
  it('gives an allowlisted origin a matching ACAO so it can read the result', () => {
    expect(corsResponseHeaders({}, ALLOWED)['Access-Control-Allow-Origin']).toBe(ALLOWED);
  });

  it('gives a rejected origin Vary but no ACAO', () => {
    const headers = corsResponseHeaders({}, EVIL);
    expect(headers['Access-Control-Allow-Origin']).toBeUndefined();
    expect(headers.Vary).toContain('Origin');
  });

  it('emits no ACAO for a null Origin — there is nothing to name', () => {
    const headers = corsResponseHeaders({}, null);
    expect(headers['Access-Control-Allow-Origin']).toBeUndefined();
    expect(headers.Vary).toContain('Origin');
  });
});

describe('the real /api/lead handler', () => {
  it('routes an allowed-origin OPTIONS to a grant', async () => {
    const res = await callOnRequest(preflight(ALLOWED));
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED);
    expect(res.headers.get('Vary')).toContain('Origin');
  });

  it('routes an evil-origin OPTIONS to a bare 204 with no CORS grant', async () => {
    const res = await callOnRequest(preflight(EVIL));
    expect(res.status).toBe(204);
    expect(corsHeaderNames(res)).toEqual([]);
    expect(res.headers.get('Vary')).toContain('Origin');
  });

  it('reads ALLOWED_ORIGINS off env — the handler destructures it, not just request', async () => {
    const env = { ALLOWED_ORIGINS: 'https://client.example.com' };
    const granted = await callOnRequest(preflight('https://client.example.com'), env);
    expect(granted.headers.get('Access-Control-Allow-Origin')).toBe('https://client.example.com');

    const denied = await callOnRequest(preflight(ALLOWED), env);
    expect(corsHeaderNames(denied)).toEqual([]);
  });

  it('still 405s a non-OPTIONS, non-POST method', async () => {
    const res = await callOnRequest(new Request('https://m3mm.net/api/lead', { method: 'GET' }));
    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('POST');
  });

  // POST-side coverage stops short of a successful lead on purpose: a 200 fires
  // the Resend + CockpitCloud + n8n sinks. Both cases below short-circuit before
  // any of that, so they prove the CORS headers without touching the money path.
  it('403s a disallowed origin with Vary and no ACAO', async () => {
    const res = await callOnRequestPost(
      new Request('https://m3mm.net/api/lead', {
        method: 'POST',
        headers: { Origin: EVIL, 'Content-Type': 'application/json' },
        body: '{}',
      }),
    );
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ ok: false, error: 'origin_not_allowed' });
    expect(corsHeaderNames(res)).toEqual([]);
    expect(res.headers.get('Vary')).toContain('Origin');
  });

  it('echoes ACAO to an allowlisted origin even on an error response', async () => {
    const res = await callOnRequestPost(
      new Request('https://m3mm.net/api/lead', {
        method: 'POST',
        headers: { Origin: ALLOWED, 'Content-Type': 'text/plain' },
        body: 'nope',
      }),
    );
    expect(res.status).toBe(415);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED);
    expect(res.headers.get('Vary')).toContain('Origin');
  });
});
