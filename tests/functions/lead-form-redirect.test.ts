// A native <form> POST navigates the browser to /api/lead, so whatever the
// route returns is what the visitor reads. Returning JSON there dead-ends the
// submit on `{"ok":true,...}` — the /roadmap signup did exactly that, because
// it is the one form on the site with no fetch handler in front of it.
//
// Successful urlencoded submits now answer 303 to the thank-you page. JSON
// callers are untouched: every page's fetch handler still parses `{ok:true}`.

import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestPost as leadPost } from '../../functions/api/lead';
import { __resetBuckets } from '../../functions/_lib/rate';

const ctx = (r: Request) => ({ request: r, env: {} }) as unknown as Parameters<typeof leadPost>[0];

const FIELDS = {
  name: 'Roadmap subscriber',
  email: 'subscriber@example.com',
  businessType: 'roadmap-subscriber',
  frustration: 'Roadmap subscriber — notify me on every drop.',
  source: 'roadmap',
  intent: 'book:roadmap-subscribe',
};

const formPost = (extra: Record<string, string> = {}, ip = '198.51.100.20') =>
  new Request('https://m3mm.net/api/lead', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'https://m3mm.net',
      'CF-Connecting-IP': ip,
    },
    body: new URLSearchParams({ ...FIELDS, ...extra }).toString(),
  });

const jsonPost = (ip = '198.51.100.21') =>
  new Request('https://m3mm.net/api/lead', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://m3mm.net',
      'CF-Connecting-IP': ip,
    },
    body: JSON.stringify(FIELDS),
  });

describe('no-JS form submits land on a page, not on raw JSON', () => {
  beforeEach(() => __resetBuckets());

  it('a successful urlencoded submit redirects to the thank-you page', async () => {
    const res = await leadPost(ctx(formPost()));
    expect(res.status).toBe(303);
    expect(res.headers.get('Location')).toBe('/thanks');
    expect(await res.text()).toBe('');
  });

  it('the redirect is a fixed same-site path, never taken from the request', async () => {
    const res = await leadPost(ctx(formPost({ successPath: 'https://evil.example/steal' })));
    expect(res.headers.get('Location')).toBe('/thanks');
  });

  it('the honeypot success looks identical to a real one, so bots learn nothing', async () => {
    const res = await leadPost(ctx(formPost({ company_website: 'https://spam.example' })));
    expect(res.status).toBe(303);
    expect(res.headers.get('Location')).toBe('/thanks');
  });

  it('the redirect still carries the security headers and is never cached', async () => {
    const res = await leadPost(ctx(formPost()));
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('JSON callers are unchanged — they still parse an ok payload', async () => {
    const res = await leadPost(ctx(jsonPost()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('a failed form submit still reports the error rather than pretending to succeed', async () => {
    const res = await leadPost(ctx(formPost({ email: 'not-an-email' })));
    expect(res.status).toBe(400);
    expect(res.headers.get('Location')).toBeNull();
  });
});
