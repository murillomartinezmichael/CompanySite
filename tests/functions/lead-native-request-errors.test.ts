// A native (no-JS) <form> POST renders whatever /api/lead answers. The 400 and
// 429 refusals already got an HTML page; a 413, an unparsable multipart body,
// an unreadable body and a bad hidden retry reference still showed raw JSON.
// They also hit real visitors: 4000 CJK characters, URL-encoded, are ~36 KB,
// over the old 16 KB cap, although every field was inside its own limit.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost } from '../../functions/api/lead';
import { __resetBuckets } from '../../functions/_lib/rate';
import { LIMITS } from '../../functions/_lib/validate';

const env = { LEAD_TO: 'operator@example.invalid', RESEND_API_KEY: 'synthetic-fixture' };
const fields = { name: 'Synthetic Buyer', email: 'synthetic@example.invalid', businessType: 'Synthetic business',
  frustration: 'Synthetic inquiry details long enough.', source: 'synthetic', intent: 'book:free-review' };
const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));

function call(body: BodyInit, contentType?: string) {
  const request = new Request('https://m3mm.net/api/lead', {
    method: 'POST', body, duplex: 'half',
    headers: { Origin: 'https://m3mm.net', 'CF-Connecting-IP': '192.0.2.61', ...(contentType ? { 'Content-Type': contentType } : {}) },
  } as RequestInit);
  return onRequestPost({ request, env } as unknown as Parameters<typeof onRequestPost>[0]);
}
const form = (data: Record<string, string> | URLSearchParams) => call(new URLSearchParams(data));
async function expectHtml(res: Response, status: number, text: string) {
  expect(res.status).toBe(status);
  expect(res.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
  expect(res.headers.get('Cache-Control')).toBe('no-store');
  expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'none'");
  const html = await res.text();
  expect(html).toContain(text);
  expect(html).not.toMatch(/<script|"ok":false/);
  expect(fetchMock).not.toHaveBeenCalled();
  return html;
}

beforeEach(() => { __resetBuckets(); fetchMock.mockClear(); vi.stubGlobal('fetch', fetchMock); vi.spyOn(console, 'log').mockImplementation(() => {}); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('native form request errors render a page, not JSON', () => {
  it('a legal 4000-character CJK message fits the form body cap and is delivered', async () => {
    const body = new URLSearchParams({ ...fields, frustration: '中'.repeat(LIMITS.frustration) });
    expect(body.toString().length).toBeGreaterThan(16 * 1024);
    const res = await call(body);
    expect(res.status).toBe(303);
  });

  it('the form cap holds every field at its own limit in the worst-case encoding', () => {
    // 9 bytes per UTF-16 unit is the URL-encoding maximum (%XX x 3 UTF-8 bytes).
    const caps = { name: LIMITS.name, email: LIMITS.email, businessType: LIMITS.businessType,
      currentUrl: LIMITS.currentUrl, frustration: LIMITS.frustration, preferredStart: LIMITS.preferredStart,
      source: LIMITS.source, referredBy: LIMITS.referredBy, intent: LIMITS.intent, utm_source: LIMITS.utm,
      utm_medium: LIMITS.utm, utm_campaign: LIMITS.utm, utm_content: LIMITS.utm, utm_term: LIMITS.utm,
      topics: 200, submissionId: 36, company_website: 0 };
    const worst = new URLSearchParams(Object.entries(caps).map(([k, n]) => [k, '中'.repeat(n)])).toString();
    expect(worst.length).toBeLessThanOrEqual(LIMITS.formBodyBytes);
  });

  it('413 over the form cap: HTML page (Content-Length and streamed)', async () => {
    const big = new URLSearchParams({ ...fields, frustration: 'x'.repeat(LIMITS.formBodyBytes) }).toString();
    await expectHtml(await call(big, 'application/x-www-form-urlencoded'), 413, 'too long');
    const stream = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(new TextEncoder().encode(big)); c.close(); } });
    await expectHtml(await call(stream, 'application/x-www-form-urlencoded'), 413, 'too long');
  });

  it('invalid multipart and unreadable bodies: HTML page', async () => {
    await expectHtml(await call('--x--\r\n', 'multipart/form-data; boundary=y'), 400, 'could not be read');
    const broken = new ReadableStream<Uint8Array>({ pull(c) { c.error(new Error('synthetic')); } });
    await expectHtml(await call(broken, 'application/x-www-form-urlencoded'), 400, 'could not be read');
  });

  it('a duplicate hidden retry reference: HTML page that keeps the typed fields', async () => {
    const data = new URLSearchParams({ ...fields, submissionId: '00000000-0000-4000-8000-000000000001' });
    data.append('submissionId', '00000000-0000-4000-8000-000000000002');
    const html = await expectHtml(await form(data), 400, 'retry reference');
    expect(html).toContain(fields.frustration);
    expect(html).not.toContain('name="submissionId"');
  });

  it('JSON callers keep their JSON replies and the 16 KB cap', async () => {
    const res = await call(JSON.stringify({ ...fields, pad: 'x'.repeat(LIMITS.bodyBytes) }), 'application/json');
    expect(res.status).toBe(413);
    expect(await res.json()).toMatchObject({ ok: false, error: 'payload_too_large', limit: LIMITS.bodyBytes });
  });
});
