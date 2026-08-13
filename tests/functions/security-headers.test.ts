// Security headers on the Pages Functions money path.
//
// Regression cover for the 2026-08-12 finding: `public/_headers` hardens `/*`
// but Cloudflare Pages applies it to STATIC ASSETS ONLY, so every response off
// `/api/lead` and `/api/track` shipped bare. Measured in production before the
// fix — OPTIONS/POST on both routes returned ZERO of the five headers while the
// document root returned all five.
//
// These tests drive the REAL exported handlers, not just the helper, because the
// helper being correct is not the property that was broken.

import { describe, it, expect } from 'vitest';
import {
  API_SECURITY_HEADERS,
  withSecurityHeaders,
  secureResponse,
} from '../../functions/_lib/security-headers';
import { onRequest as leadOnRequest, onRequestPost as leadOnRequestPost } from '../../functions/api/lead';
import { onRequest as trackOnRequest, onRequestPost as trackOnRequestPost } from '../../functions/api/track';

/** The five graded by ../../../scripts/verify-security-headers.py. */
const REQUIRED = [
  'Strict-Transport-Security',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
  'Permissions-Policy',
] as const;

const ALLOWED_ORIGIN = 'https://m3mm.net';

function expectHardened(res: Response, where: string) {
  for (const name of REQUIRED) {
    expect(res.headers.get(name), `${where} is missing ${name}`).toBeTruthy();
  }
  // Must match the document policy in public/_headers, or the API advertises a
  // weaker posture than the page that calls it.
  expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  expect(res.headers.get('X-Frame-Options')).toBe('DENY');
  const hsts = res.headers.get('Strict-Transport-Security') || '';
  const maxAge = Number(/max-age=(\d+)/.exec(hsts)?.[1] ?? 0);
  expect(maxAge, `${where} HSTS max-age too short`).toBeGreaterThanOrEqual(15_768_000);
}

function ctx(request: Request, env: Record<string, string> = {}) {
  // Only `request` and `env` are read by these handlers.
  return { request, env } as unknown as Parameters<typeof leadOnRequestPost>[0];
}

describe('API_SECURITY_HEADERS', () => {
  it('carries all five graded headers', () => {
    for (const name of REQUIRED) expect(API_SECURITY_HEADERS[name]).toBeTruthy();
  });

  it('lets the handler win — a security header never clobbers a deliberate one', () => {
    const merged = withSecurityHeaders({ 'X-Frame-Options': 'SAMEORIGIN', 'Cache-Control': 'no-store' });
    expect(merged['X-Frame-Options']).toBe('SAMEORIGIN');
    expect(merged['Cache-Control']).toBe('no-store');
    expect(merged['Referrer-Policy']).toBe(API_SECURITY_HEADERS['Referrer-Policy']);
  });

  it('secureResponse preserves status and existing headers', () => {
    const original = new Response(null, {
      status: 204,
      headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'X-Frame-Options': 'SAMEORIGIN' },
    });
    const secured = secureResponse(original);
    expect(secured.status).toBe(204);
    expect(secured.headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED_ORIGIN);
    // Deliberately pre-set — the layer must not overwrite it.
    expect(secured.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    for (const name of REQUIRED) {
      expect(secured.headers.get(name), `secureResponse dropped ${name}`).toBeTruthy();
    }
  });
});

describe('/api/lead ships the headers on every response shape', () => {
  it('405 on a non-POST method', async () => {
    const res = await leadOnRequest(ctx(new Request('https://m3mm.net/api/lead', { method: 'GET' })));
    expect(res.status).toBe(405);
    expectHardened(res, 'lead 405');
  });

  it('204 CORS preflight — granted', async () => {
    const headers = new Headers({
      Origin: ALLOWED_ORIGIN,
      'Access-Control-Request-Method': 'POST',
    });
    const res = await leadOnRequest(ctx(new Request('https://m3mm.net/api/lead', { method: 'OPTIONS', headers })));
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED_ORIGIN);
    expectHardened(res, 'lead preflight (granted)');
  });

  it('204 CORS preflight — denied to a hostile origin, still hardened', async () => {
    const headers = new Headers({
      Origin: 'https://evil.example.com',
      'Access-Control-Request-Method': 'POST',
    });
    const res = await leadOnRequest(ctx(new Request('https://m3mm.net/api/lead', { method: 'OPTIONS', headers })));
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
    expectHardened(res, 'lead preflight (denied)');
  });

  it('415 on a wrong content type', async () => {
    const res = await leadOnRequestPost(ctx(new Request('https://m3mm.net/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'nope',
    })));
    expect(res.status).toBe(415);
    expectHardened(res, 'lead 415');
  });

  it('400 on invalid JSON', async () => {
    const res = await leadOnRequestPost(ctx(new Request('https://m3mm.net/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not json',
    })));
    expect(res.status).toBe(400);
    expectHardened(res, 'lead 400');
  });

  it('403 on a disallowed origin', async () => {
    const res = await leadOnRequestPost(ctx(new Request('https://m3mm.net/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example.com' },
      body: '{}',
    })));
    expect(res.status).toBe(403);
    expectHardened(res, 'lead 403');
  });
});

describe('/api/track ships the headers on every response shape', () => {
  it('204 beacon accept', async () => {
    const res = await trackOnRequestPost(ctx(new Request('https://m3mm.net/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'hero-cta' }),
    })));
    expect(res.status).toBe(204);
    expectHardened(res, 'track 204');
  });

  it('204 OPTIONS', async () => {
    const res = await trackOnRequest(ctx(new Request('https://m3mm.net/api/track', { method: 'OPTIONS' })));
    expect(res.status).toBe(204);
    expectHardened(res, 'track OPTIONS');
  });

  it('405 on a non-POST method', async () => {
    const res = await trackOnRequest(ctx(new Request('https://m3mm.net/api/track', { method: 'GET' })));
    expect(res.status).toBe(405);
    expectHardened(res, 'track 405');
  });
});
