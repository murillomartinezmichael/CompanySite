import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost } from '../../functions/api/lead';
import { __resetBuckets } from '../../functions/_lib/rate';

const fields = { name: 'Renée 😀', email: 'synthetic@example.invalid', businessType: 'Synthetic café',
  frustration: 'Keep "quotes", <script>bad()</script>, A&B and 😀 intact.', source: 'synthetic',
  currentUrl: 'https://example.invalid/?a=1&b=2', preferredStart: 'Next month', referredBy: 'Synthetic referrer',
  intent: 'book:free-review', utm_source: 'synthetic', utm_medium: 'referral', utm_campaign: 'synthetic campaign',
  utm_content: 'one & two', utm_term: 'term' };
const id = '00000000-0000-4000-8000-000000000001';
const env = { COCKPIT_LEAD_INBOX_URL: 'https://cockpit.example.invalid/v1/leads/ingest',
  COCKPIT_INGEST_TOKEN: 'synthetic-only', RESEND_API_KEY: 'synthetic-no-send' };
let mode = 'ok';
const saved = new Map<string, Record<string, unknown>>();
const fetchMock = vi.fn(async (_url: unknown, init?: RequestInit) => {
  expect(String(_url)).toBe(env.COCKPIT_LEAD_INBOX_URL);
  const key = new Headers(init?.headers).get('Idempotency-Key')!;
  const payload = JSON.parse(String(init?.body));
  const old = saved.get(key);
  if (mode === 'conflict' || old && JSON.stringify(old.payload) !== JSON.stringify(payload)) return new Response('{}', { status: 409 });
  const receipt = old?.receipt ?? { ...payload, id: id.replaceAll('-', ''), created_at: '2026-10-02T00:00:00Z',
    deliveries: payload.notifications.map((channel: string, i: number) => ({ id: String(i + 1).padStart(32, '0'), channel,
      state: 'pending', attempts: 0, provider_receipt: '', error: '' })) };
  saved.set(key, { payload, receipt });
  if (mode === 'lost') throw new Error('Synthetic response lost after retention');
  return Response.json(receipt, { status: old ? 200 : 201 });
});

function decodedFields(html: string) {
  const decode = (s: string) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  return Object.fromEntries([...html.matchAll(/<input type="hidden" name="([^"]*)" value="([^"]*)">/g)].map(match => [decode(match[1]), decode(match[2])]));
}
async function post(data: Record<string, string> | URLSearchParams = fields, multipart = false, headers: Record<string, string> = {}) {
  const entries = data instanceof URLSearchParams ? data.entries() : Object.entries(data);
  const body = multipart ? new FormData() : new URLSearchParams();
  for (const [key, value] of entries) body.append(key, value);
  const request = new Request('https://m3mm.net/api/lead', { method: 'POST',
    headers: { Origin: 'https://m3mm.net', ...headers }, body });
  return onRequestPost({ request, env } as unknown as Parameters<typeof onRequestPost>[0]);
}
beforeEach(() => { __resetBuckets(); mode = 'ok'; saved.clear(); fetchMock.mockClear(); vi.stubGlobal('fetch', fetchMock); vi.spyOn(console, 'log').mockImplementation(() => {}); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('native inbox retry confirmation', () => {
  it.each([false, true])('preserves all validated fields, encoding and same key across lost receipt/retry (multipart=%s)', async multipart => {
    const confirmation = await post(fields, multipart);
    expect(confirmation.status).toBe(200); expect(fetchMock).not.toHaveBeenCalled();
    const html = await confirmation.text(); const data = decodedFields(html);
    expect(html).not.toContain('<script>bad()');
    expect(html).not.toMatch(/<script|\sonclick=|<base/i);
    expect(html).toContain('action="/api/lead"');
    for (const [key, value] of Object.entries(fields)) expect(data[key]).toBe(value);
    expect(data.submissionId).toMatch(/^[a-f0-9-]{36}$/);
    expect(confirmation.headers.get('Cache-Control')).toBe('no-store');
    expect(confirmation.headers.get('Referrer-Policy')).toBe('same-origin');
    expect(confirmation.headers.get('Content-Security-Policy')).toContain("form-action 'self'");
    mode = 'lost'; const uncertain = await post(data, multipart);
    expect(uncertain.status).toBe(503);
    const recovery = decodedFields(await uncertain.text());
    expect(recovery).toEqual(data); expect(saved.size).toBe(1);
    mode = 'ok'; const accepted = await post(recovery, multipart);
    expect(accepted.status).toBe(303); expect(accepted.headers.get('Location')).toBe('/thanks');
    expect(saved.size).toBe(1); expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get('Idempotency-Key')).toBe(new Headers(fetchMock.mock.calls[1][1]?.headers).get('Idempotency-Key'));
  });

  it('does not offer a blind retry after a same-key content conflict', async () => {
    mode = 'conflict'; const response = await post({ ...fields, submissionId: id });
    expect(response.status).toBe(409); const html = await response.text();
    expect(html).toContain('original inquiry may already be saved'); expect(html).not.toContain('<form');
    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it.each(['', 'invalid', `${id}extra`])('rejects malformed hidden reference %j without effects', async submissionId => {
    expect((await post({ ...fields, submissionId })).status).toBe(400); expect(fetchMock).not.toHaveBeenCalled();
  });
  it('rejects duplicate and contradictory hidden references without effects', async () => {
    const data = new URLSearchParams({ ...fields, submissionId: id }); data.append('submissionId', id);
    expect((await post(data)).status).toBe(400);
    expect((await post({ ...fields, submissionId: id }, false, { 'Idempotency-Key': id.replace(/1$/, '2') })).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('still enforces origin, body and field validation before confirmation', async () => {
    expect((await post(fields, false, { Origin: 'https://untrusted.example.invalid' })).status).toBe(403);
    expect((await post({ ...fields, frustration: 'x'.repeat(20000) })).status).toBe(413);
    expect((await post({ ...fields, email: 'invalid' })).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
