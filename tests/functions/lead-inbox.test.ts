import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost } from '../../functions/api/lead';
import { __resetBuckets } from '../../functions/_lib/rate';

const id = 'c8b72df0-b768-4c35-b7ab-c106a030d811';
const fields = { name: 'Synthetic Buyer', email: 'buyer@example.invalid', businessType: 'Synthetic business', frustration: 'Synthetic private inquiry details.', source: 'landing' };
const env = {
  COCKPIT_NOTIFICATION_CHANNELS: undefined as string | undefined,
  COCKPIT_LEAD_INBOX_URL: 'https://cockpit.example.invalid/v1/leads/ingest', COCKPIT_INGEST_TOKEN: 'synthetic-token',
  RESEND_API_KEY: 'synthetic', LEAD_TO: 'operator@example.invalid',
  COCKPIT_INGEST_URL: 'https://cockpit.example.invalid/v1/events', N8N_LEAD_WEBHOOK_URL: 'https://workflow.example.invalid/hook',
};
const calls: string[] = [];
let inboxStatus = 201;
let notificationStatus = 200;
let jobState = 'pending';
let wrongReceipt = false;

async function invoke(key: string | null = id, bindings: Partial<typeof env> = env, native = false, extra = {}) {
  const headers = new Headers({ Origin: 'https://m3mm.net' });
  if (key !== null) headers.set('Idempotency-Key', key);
  if (!native) headers.set('Content-Type', 'application/json');
  const data = { ...fields, ...extra };
  const request = new Request('https://m3mm.net/api/lead', { method: 'POST', headers, body: native ? new URLSearchParams(data) : JSON.stringify(data) });
  return onRequestPost({ request, env: bindings } as unknown as Parameters<typeof onRequestPost>[0]);
}

beforeEach(() => {
  __resetBuckets(); calls.length = 0; inboxStatus = 201; notificationStatus = 200; jobState = 'pending'; wrongReceipt = false;
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url === env.COCKPIT_LEAD_INBOX_URL) {
      calls.push('inbox');
      const payload = JSON.parse(String(init?.body));
      const deliveries = (payload.notifications ?? []).map((channel: string, index: number) => ({
        id: String(index + 1).padStart(32, '0'), channel, state: jobState,
        attempts: 0, provider_receipt: '', error: jobState === 'uncertain' ? 'transport_uncertain' : jobState === 'failed' ? 'provider_rejected' : '',
      }));
      return new Response(JSON.stringify(wrongReceipt ? { ok: true } : { ...payload, deliveries, id: id.replaceAll('-', ''), created_at: '2026-09-24T12:00:00' }), {
        status: inboxStatus, headers: { 'Content-Type': 'application/json' },
      });
    }
    if (url === 'https://api.resend.com/emails') calls.push(JSON.parse(String(init?.body)).to === env.LEAD_TO ? 'admin' : 'reply');
    else if (url === env.N8N_LEAD_WEBHOOK_URL) calls.push('workflow');
    else throw new Error('Unexpected network destination');
    return new Response('{}', { status: notificationStatus });
  }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('CompanySite canonical inbox mode', () => {
  it('confirms the default durable email jobs without inline sends or duplicate cards', async () => {
    const result = await invoke();
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ ok: true });
    expect(calls).toEqual(['inbox']);
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)).notifications).toEqual(['acknowledgment_email', 'operator_email']);
  });

  it.each([401, 409, 500])('does not send anything else after inbox status %i', async status => {
    inboxStatus = status;
    expect((await invoke()).status).toBe(status === 409 ? 409 : 503);
    expect(calls).toEqual(['inbox']);
  });

  it('does not acknowledge a fake 2xx receipt', async () => {
    wrongReceipt = true;
    expect((await invoke()).status).toBe(503);
    expect(calls).toEqual(['inbox']);
  });

  it('replays success without repeating notifications', async () => {
    inboxStatus = 200;
    expect((await invoke()).status).toBe(200);
    expect(calls).toEqual(['inbox']);
  });

  it.each(['failed', 'uncertain'])('keeps a confirmed inquiry successful when a persisted job is %s', async state => {
    notificationStatus = 500;
    jobState = state;
    expect((await invoke()).status).toBe(200);
    expect(calls).toEqual(['inbox']);
  });

  it('works with optional notifications disabled', async () => {
    const bindings = { ...env, COCKPIT_NOTIFICATION_CHANNELS: '', RESEND_API_KEY: '', N8N_LEAD_WEBHOOK_URL: '' };
    expect((await invoke(id, bindings)).status).toBe(200);
    expect(calls).toEqual(['inbox']);
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)).notifications).toEqual([]);
  });

  it('queues workflow only with explicit opt-in and never sends inline', async () => {
    const result = await invoke(id, { ...env, COCKPIT_NOTIFICATION_CHANNELS: 'workflow,operator_email,acknowledgment_email' });
    expect(result.status).toBe(200);
    expect(calls).toEqual(['inbox']);
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)).notifications).toEqual(['acknowledgment_email', 'operator_email', 'workflow']);
  });

  it('rejects an invalid plan without falling back to inline sends', async () => {
    expect((await invoke(id, { ...env, COCKPIT_NOTIFICATION_CHANNELS: 'workflow,' })).status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('preserves legacy email and workflow delivery when inbox mode is undefined', async () => {
    expect((await invoke(id, { ...env, COCKPIT_LEAD_INBOX_URL: undefined, COCKPIT_INGEST_URL: '', COCKPIT_NOTIFICATION_CHANNELS: 'invalid-but-unused' })).status).toBe(200);
    expect(calls).toEqual(['admin', 'reply', 'workflow']);
  });

  it('fails closed on empty opt-in URL without trying the old destinations', async () => {
    expect((await invoke(id, { ...env, COCKPIT_LEAD_INBOX_URL: '' })).status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects malformed retry identity before any send', async () => {
    expect((await invoke('not-a-uuid')).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('confirms a no-JS roadmap inquiry before sending, then redirects with the same key', async () => {
    const result = await invoke(null, env, true, { intent: 'book:roadmap-subscribe', topics: 'synthetic topic' });
    expect(result.status).toBe(200);
    expect(fetch).not.toHaveBeenCalled();
    const html = await result.text();
    const key = html.match(/name="submissionId" value="([^"]+)"/)![1];
    const confirmed = await invoke(null, env, true, { intent: 'book:roadmap-subscribe', topics: 'synthetic topic', submissionId: key });
    expect(confirmed.status).toBe(303);
    expect(confirmed.headers.get('Location')).toBe('/roadmap/thanks');
    const init = vi.mocked(fetch).mock.calls[0][1]!;
    expect(new Headers(init.headers).get('Idempotency-Key')).toMatch(/^companysite:[0-9a-f-]{36}$/);
    expect(JSON.parse(String(init.body)).message).toBe('Roadmap subscriber wants: synthetic topic');
    expect(new Headers(init.headers).get('Idempotency-Key')).toBe(`companysite:${key}`);
  });

  it('requires a stable key for JSON inbox requests', async () => {
    expect((await invoke(null)).status).toBe(428);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('keeps bot handling silent without persisting or notifying', async () => {
    expect((await invoke(id, env, false, { company_website: 'bot' })).status).toBe(200);
    expect(fetch).not.toHaveBeenCalled();
  });
});
