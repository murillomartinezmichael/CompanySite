import { describe, expect, it, vi } from 'vitest';
import { onRequest } from '../../functions/_middleware';
import { API_SECURITY_HEADERS } from '../../functions/_lib/security-headers';

const run = (request: Request, next = vi.fn(async () => new Response('next'))) => ({
  next,
  response: onRequest({ request, next } as Parameters<typeof onRequest>[0]),
});

describe('canonical hostname middleware', () => {
  it.each([
    ['https://www.m3mm.net/', 'https://m3mm.net/'],
    ['https://www.m3mm.net/websites?utm_source=referral&x=a%2Fb', 'https://m3mm.net/websites?utm_source=referral&x=a%2Fb'],
    ['https://www.m3mm.net:8443/start?return=https://outside.invalid/', 'https://m3mm.net/start?return=https://outside.invalid/'],
    ['http://www.m3mm.net:8080/a%2Fb', 'https://m3mm.net/a%2Fb'],
    ['https://www.m3mm.net//outside.invalid/path', 'https://m3mm.net//outside.invalid/path'],
    ['https://WWW.M3MM.NET/a', 'https://m3mm.net/a'],
  ])('redirects %s to the fixed apex', async (input, location) => {
    const { response, next } = run(new Request(input));
    const result = await response;
    expect(result.status).toBe(301);
    expect(result.headers.get('Location')).toBe(location);
    expect(new URL(result.headers.get('Location')!).origin).toBe('https://m3mm.net');
    expect(await result.text()).toBe('');
    expect(next).not.toHaveBeenCalled();
    for (const [header, value] of Object.entries(API_SECURITY_HEADERS)) {
      expect(result.headers.get(header)).toBe(value);
    }
  });

  it('does not copy userinfo from a synthetic incoming URL', async () => {
    // Real Request constructors reject userinfo; exercise the URL boundary too.
    const { response } = run({ url: 'https://synthetic:fixture@www.m3mm.net:8443/start?q=1', method: 'GET' } as Request);
    expect((await response).headers.get('Location')).toBe('https://m3mm.net/start?q=1');
  });

  it.each(['GET', 'HEAD'])('uses a permanent 301 for %s', async method => {
    const { response, next } = run(new Request('https://www.m3mm.net/', { method }));
    expect((await response).status).toBe(301);
    expect(next).not.toHaveBeenCalled();
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])('preserves %s with 308 without consuming the request', async method => {
    const request = new Request('https://www.m3mm.net/api/lead?source=fixture', { method, body: 'synthetic-body' });
    const { response, next } = run(request);
    const result = await response;
    expect(result.status).toBe(308);
    expect(result.headers.get('Location')).toBe('https://m3mm.net/api/lead?source=fixture');
    expect(request.bodyUsed).toBe(false);
    expect(await request.text()).toBe('synthetic-body');
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    'https://m3mm.net/api/lead',
    'https://preview.m3-companysite.pages.dev/',
    'https://m3-companysite.pages.dev/',
    'http://localhost:4321/',
    'https://www.m3mm.net.outside.invalid/',
    'https://outside.invalid/?host=www.m3mm.net',
  ])('passes %s through exactly once without changing the response', async url => {
    const original = new Response('unchanged', { status: 202, headers: { 'X-Fixture': 'retained' } });
    const next = vi.fn(async () => original);
    const result = await run(new Request(url, { headers: { Host: 'www.m3mm.net', 'X-Forwarded-Host': 'www.m3mm.net' } }), next).response;
    expect(result).toBe(original);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('leaves downstream errors to the existing middleware', async () => {
    const failure = new Error('synthetic downstream error');
    const next = vi.fn(async () => { throw failure; });
    await expect(run(new Request('https://m3mm.net/api/lead'), next).response).rejects.toBe(failure);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
