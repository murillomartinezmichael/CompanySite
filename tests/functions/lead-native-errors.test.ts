// A native (no-JS) <form> POST renders whatever /api/lead answers. A server
// validation failure the browser could not catch (whitespace-only text passes
// minlength) or a 429 used to show raw JSON and drop what the visitor typed.
// Form encodings now get an HTML page in the confirmation-page style; JSON
// callers keep their exact JSON.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost } from '../../functions/api/lead';
import { __resetBuckets } from '../../functions/_lib/rate';

const env = { LEAD_TO: 'operator@example.invalid' };
const fields = { name: 'Renée <b>', email: 'synthetic@example.invalid', businessType: 'Synthetic café',
  frustration: 'Keep "quotes" & <script>bad()</script> intact.', source: 'synthetic', intent: 'book:free-review',
  preferredStart: 'Next month', utm_source: 'synthetic' };
const fetchMock = vi.fn(async () => new Response('{}', { status: 202 }));

function post(data: Record<string, string>, json = false) {
  const request = new Request('https://m3mm.net/api/lead', {
    method: 'POST',
    headers: { Origin: 'https://m3mm.net', 'CF-Connecting-IP': '198.51.100.77',
      'Content-Type': json ? 'application/json' : 'application/x-www-form-urlencoded' },
    body: json ? JSON.stringify(data) : new URLSearchParams(data).toString(),
  });
  return onRequestPost({ request, env } as unknown as Parameters<typeof onRequestPost>[0]);
}
const decode = (s: string) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const valueOf = (html: string, name: string) => {
  const input = html.match(new RegExp(`name="${name}"[^>]*value="([^"]*)"`));
  if (input) return decode(input[1]);
  const area = html.match(new RegExp(`<textarea[^>]*name="${name}"[^>]*>([^<]*)</textarea>`));
  return area ? decode(area[1]) : undefined;
};
function expectPage(res: Response, html: string) {
  expect(res.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
  expect(res.headers.get('Cache-Control')).toBe('no-store');
  expect(res.headers.get('Content-Security-Policy')).toBe("default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
  expect(html).toContain('action="/api/lead"');
  expect(html).not.toMatch(/<script|\sonclick=|<base/i);
}

beforeEach(() => { __resetBuckets(); fetchMock.mockClear(); vi.stubGlobal('fetch', fetchMock); vi.spyOn(console, 'log').mockImplementation(() => {}); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('native form errors render a page that keeps the visitor text', () => {
  it('whitespace-only frustration: 400 HTML with the typed fields editable', async () => {
    const res = await post({ ...fields, frustration: '            ' });
    expect(res.status).toBe(400);
    const html = await res.text(); expectPage(res, html);
    expect(html).toContain('Frustration is required.');
    expect(valueOf(html, 'name')).toBe(fields.name);
    expect(valueOf(html, 'email')).toBe(fields.email);
    expect(valueOf(html, 'intent')).toBe(fields.intent);
    expect(valueOf(html, 'utm_source')).toBe(fields.utm_source);
    expect(html).not.toContain('<b>');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rate limit: 429 HTML with Retry-After, text preserved, nothing sent', async () => {
    for (let i = 0; i < 5; i++) await post(fields);
    fetchMock.mockClear();
    const res = await post(fields);
    expect(res.status).toBe(429);
    expect(Number(res.headers.get('Retry-After'))).toBeGreaterThan(0);
    const html = await res.text(); expectPage(res, html);
    expect(valueOf(html, 'frustration')).toBe(fields.frustration);
    expect(valueOf(html, 'name')).toBe(fields.name);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('JSON callers are unchanged', async () => {
    const bad = await post({ ...fields, frustration: '            ' }, true);
    expect(bad.status).toBe(400);
    expect(bad.headers.get('Content-Type')).toBe('application/json');
    expect((await bad.json()).error).toBe('validation');
    for (let i = 0; i < 5; i++) await post(fields, true);
    const limited = await post(fields, true);
    expect(limited.status).toBe(429);
    expect(await limited.json()).toMatchObject({ ok: false, error: 'rate_limited' });
  });
});
