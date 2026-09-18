import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost } from '../../functions/api/lead';
import { __resetBuckets } from '../../functions/_lib/rate';
import { API_SECURITY_HEADERS } from '../../functions/_lib/security-headers';

const fields = { name: 'Synthetic Buyer', email: 'buyer@example.invalid', businessType: 'Synthetic business', frustration: 'Synthetic private inquiry details.', intent: 'book:free-review' };
const env = { RESEND_API_KEY: 'synthetic-fixture', LEAD_TO: 'operator@example.invalid', COCKPIT_INGEST_URL: 'https://cockpit.example.invalid/ingest', N8N_LEAD_WEBHOOK_URL: 'https://n8n.example.invalid/intake' };
type Channel = 'admin' | 'reply' | 'cockpit' | 'n8n';
type Encoding = 'json' | 'urlencoded' | 'multipart';
const calls: Channel[] = [];
const accepted: Channel[] = [];
let replyBeforeAcceptance = false;
const outcomes: Record<Channel, number> = { admin: 500, reply: 200, cockpit: 500, n8n: 500 };
const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  let channel: Channel;
  if (url === 'https://api.resend.com/emails') channel = JSON.parse(String(init?.body)).to === env.LEAD_TO ? 'admin' : 'reply';
  else if (url === env.COCKPIT_INGEST_URL) channel = 'cockpit';
  else if (url === env.N8N_LEAD_WEBHOOK_URL) channel = 'n8n';
  else throw new Error('Unexpected network target');
  calls.push(channel);
  if (channel === 'reply' && accepted.length === 0) replyBeforeAcceptance = true;
  const status = outcomes[channel];
  if (status >= 200 && status < 300 && channel !== 'reply') accepted.push(channel);
  return new Response('{"detail":"Synthetic private provider detail"}', { status });
});

async function invoke(bindings: Record<string, string> = env, encoding: Encoding = 'json', extra: Record<string, string> = {}) {
  const data = { ...fields, ...extra };
  const headers = new Headers({ Origin: 'https://m3mm.net', 'CF-Connecting-IP': '192.0.2.9' });
  let body: BodyInit;
  if (encoding === 'json') { headers.set('Content-Type', 'application/json'); body = JSON.stringify(data); }
  else if (encoding === 'urlencoded') body = new URLSearchParams(data);
  else { const form = new FormData(); for (const [key, value] of Object.entries(data)) form.append(key, value); body = form; }
  const request = new Request('https://m3mm.net/api/lead', { method: 'POST', headers, body });
  return onRequestPost({ request, env: bindings } as unknown as Parameters<typeof onRequestPost>[0]);
}

async function expectUnavailable(response: Response) {
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ ok: false, error: 'delivery_unavailable' });
  expect(response.headers.get('Location')).toBeNull();
  expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://m3mm.net');
  expect(response.headers.get('Vary')).toContain('Origin');
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  for (const [key, value] of Object.entries(API_SECURITY_HEADERS)) expect(response.headers.get(key)).toBe(value);
}

beforeEach(() => {
  __resetBuckets();
  calls.length = 0; accepted.length = 0; replyBeforeAcceptance = false;
  Object.assign(outcomes, { admin: 500, reply: 200, cockpit: 500, n8n: 500 });
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('lead success requires operator-channel acceptance', () => {
  it.each(Array.from({ length: 8 }, (_, mask) => [mask, Boolean(mask & 1), Boolean(mask & 2), Boolean(mask & 4)] as const))(
    'handles operator acceptance combination %i (admin=%s, cockpit=%s, n8n=%s)', async (mask, admin, cockpit, n8n) => {
      Object.assign(outcomes, { admin: admin ? 202 : 500, cockpit: cockpit ? 202 : 500, n8n: n8n ? 202 : 500 });
      const response = await invoke();
      if (mask === 0) await expectUnavailable(response);
      else { expect(response.status).toBe(200); expect(await response.json()).toEqual({ ok: true }); }
      expect(calls.filter(channel => channel !== 'reply')).toEqual(['admin', 'cockpit', 'n8n']);
      expect(calls.filter(channel => channel === 'reply')).toHaveLength(mask === 0 ? 0 : 1);
      expect(replyBeforeAcceptance).toBe(false);
    },
  );

  it('fails visibly with no delivery configuration rather than treating a summary log as storage', async () => {
    await expectUnavailable(await invoke({}));
    expect(fetchMock).not.toHaveBeenCalled();
    const entry = JSON.parse(vi.mocked(console.log).mock.calls.at(-1)![0]);
    expect(entry.event).toBe('lead_delivery_failed');
    expect(entry.resend.reply).toEqual({ ok: false, skipped: true });
    const log = JSON.stringify(entry);
    for (const privateField of [fields.email, fields.name, fields.frustration]) expect(log).not.toContain(privateField);
  });

  it('does not count malformed optional delivery URLs as acceptance', async () => {
    await expectUnavailable(await invoke({ COCKPIT_INGEST_URL: 'not a URL', N8N_LEAD_WEBHOOK_URL: 'not a URL' }));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(['cockpit', 'n8n'] as const)('can accept through %s with email entirely unconfigured', async channel => {
    outcomes[channel] = 202;
    const bindings = channel === 'cockpit' ? { COCKPIT_INGEST_URL: env.COCKPIT_INGEST_URL } : { N8N_LEAD_WEBHOOK_URL: env.N8N_LEAD_WEBHOOK_URL };
    const response = await invoke(bindings);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(calls).toEqual([channel]);
  });

  it.each(['admin', 'cockpit', 'n8n'] as const)('does not turn an accepted %s inquiry into failure when its confirmation email fails', async channel => {
    outcomes[channel] = 202;
    outcomes.reply = 500;
    const response = await invoke();
    expect(response.status).toBe(200);
    expect(calls.filter(item => item === 'reply')).toHaveLength(1);
    const entry = JSON.parse(vi.mocked(console.log).mock.calls.at(-1)![0]);
    expect(entry.event).toBe('lead_received');
    expect(entry.resend.reply).toMatchObject({ ok: false, status: 500 });
  });

  it.each<Encoding>(['json', 'urlencoded', 'multipart'])('never claims roadmap receipt after total delivery failure for %s', async encoding => {
    await expectUnavailable(await invoke(env, encoding, { intent: 'book:roadmap-subscribe' }));
    expect(calls).not.toContain('reply');
  });

  it('handles thrown network errors without exposing provider details or sending a confirmation', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('Synthetic private provider detail'); }));
    await expectUnavailable(await invoke());
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(3);
  });

  it('fails after the existing channel timeouts without sending a false acknowledgment', async () => {
    vi.useFakeTimers();
    const signals: AbortSignal[] = [];
    vi.stubGlobal('fetch', vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      const signal = init!.signal!;
      signals.push(signal);
      signal.addEventListener('abort', () => reject(new DOMException('Synthetic timeout', 'AbortError')), { once: true });
    })));
    const pending = invoke();
    await vi.advanceTimersByTimeAsync(24_000);
    await expectUnavailable(await pending);
    expect(signals).toHaveLength(3);
    expect(signals.every(signal => signal.aborted)).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps the honeypot silent even when nothing is configured', async () => {
    const response = await invoke({}, 'json', { company_website: 'synthetic-bot' });
    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });
});
