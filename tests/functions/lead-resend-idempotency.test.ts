// The retry page resends the same inquiry when delivery was not confirmed.
// If Resend accepted the operator email but the response timed out, that
// retry used to send it a second time. Each Resend call now carries an
// Idempotency-Key (Resend docs: same key + same payload within 24h returns
// the original response without sending again; max 256 chars) derived from
// a hash of the validated lead, its submission id and the email kind.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost } from '../../functions/api/lead';
import { __resetBuckets } from '../../functions/_lib/rate';

const env = { RESEND_API_KEY: 'synthetic-fixture-key', LEAD_TO: 'operator@example.invalid' };
const fields = { name: 'Synthetic Buyer', email: 'buyer@example.invalid', businessType: 'Synthetic business',
  frustration: 'Synthetic inquiry details long enough.', intent: 'book:free-review', source: 'synthetic' };
const id = '00000000-0000-4000-8000-0000000000a1';
let resendStatus: number | 'timeout' = 200;
const keys: Array<{ to: string; key: string | null; body: string }> = [];
const fetchMock = vi.fn(async (_url: unknown, init?: RequestInit) => {
  keys.push({ to: JSON.parse(String(init?.body)).to, key: new Headers(init?.headers).get('Idempotency-Key'), body: String(init?.body) });
  if (resendStatus === 'timeout') throw new DOMException('Synthetic timeout', 'AbortError');
  return new Response('{}', { status: resendStatus });
});

function post(data: Record<string, string>, headers: Record<string, string> = {}, json = false) {
  const request = new Request('https://m3mm.net/api/lead', {
    method: 'POST',
    headers: { Origin: 'https://m3mm.net', 'CF-Connecting-IP': '192.0.2.31', ...headers,
      ...(json ? { 'Content-Type': 'application/json' } : {}) },
    body: json ? JSON.stringify(data) : new URLSearchParams(data),
  });
  return onRequestPost({ request, env } as unknown as Parameters<typeof onRequestPost>[0]);
}
const decode = (s: string) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const hiddenFields = (html: string) => Object.fromEntries([...html.matchAll(/<input type="hidden" name="([^"]*)" value="([^"]*)">/g)].map(m => [decode(m[1]), decode(m[2])]));

beforeEach(() => { __resetBuckets(); resendStatus = 200; keys.length = 0; fetchMock.mockClear(); vi.stubGlobal('fetch', fetchMock); vi.spyOn(console, 'log').mockImplementation(() => {}); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('Resend Idempotency-Key', () => {
  it('a native retry after a timed-out operator send reuses the same key', async () => {
    resendStatus = 'timeout';
    const page = await post(fields);
    expect(page.status).toBe(503);
    const first = keys.find(k => k.to === env.LEAD_TO)!.key;
    expect(first).toBeTruthy();
    resendStatus = 200; keys.length = 0;
    const retried = await post(hiddenFields(await page.text()));
    expect(retried.status).toBe(303);
    expect(keys.find(k => k.to === env.LEAD_TO)!.key).toBe(first);
  });

  // Resend answers 409 invalid_idempotent_request when a key is reused with a
  // different body, so the keyed payload must not vary between retries.
  it('a retry from another IP sends a byte-identical operator email under the same key', async () => {
    await post(fields, { 'Idempotency-Key': id }, true);
    await post(fields, { 'Idempotency-Key': id, 'CF-Connecting-IP': '198.51.100.9' }, true);
    const admin = keys.filter(k => k.to === env.LEAD_TO);
    expect(admin).toHaveLength(2);
    expect(admin[1].key).toBe(admin[0].key);
    expect(admin[1].body).toBe(admin[0].body);
  });

  it('keys are per email, stable per submission id, never contain secrets, fit 256 chars', async () => {
    await post(fields, { 'Idempotency-Key': id }, true);
    await post(fields, { 'Idempotency-Key': id }, true);
    await post(fields, { 'Idempotency-Key': id.replace(/a1$/, 'a2') }, true);
    const admin = keys.filter(k => k.to === env.LEAD_TO).map(k => k.key);
    const reply = keys.filter(k => k.to === fields.email).map(k => k.key);
    expect(admin).toHaveLength(3); expect(reply).toHaveLength(3);
    expect(admin[0]).toBe(admin[1]); expect(admin[2]).not.toBe(admin[0]);
    expect(reply[0]).toBe(reply[1]); expect(reply[0]).not.toBe(admin[0]);
    for (const { key } of keys) {
      expect(key!.length).toBeLessThanOrEqual(256);
      expect(key).not.toContain(env.RESEND_API_KEY);
      expect(key).not.toContain(fields.email);
    }
  });
});
