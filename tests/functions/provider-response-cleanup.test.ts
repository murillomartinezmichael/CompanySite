import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendToCockpit } from '../../functions/_lib/cockpit-sink';
import { sendToN8n } from '../../functions/_lib/n8n-sink';
import { onRequestPost } from '../../functions/api/lead';
import { __resetBuckets } from '../../functions/_lib/rate';

const lead = {
  name: 'Synthetic Buyer', email: 'buyer@example.invalid', businessType: 'Synthetic business',
  frustration: 'Synthetic inquiry.', source: 'test',
};
type Channel = 'cockpit' | 'n8n' | 'email';

async function invoke(channel: Channel, fetchImpl: typeof fetch) {
  if (channel === 'cockpit') {
    return sendToCockpit({ COCKPIT_INGEST_URL: 'https://cockpit.example.invalid/ingest' }, 'fixture', lead, '192.0.2.1', fetchImpl);
  }
  if (channel === 'n8n') {
    return sendToN8n({ N8N_LEAD_WEBHOOK_URL: 'https://n8n.example.invalid/intake' }, 'fixture', lead, '192.0.2.1', fetchImpl);
  }
  vi.stubGlobal('fetch', fetchImpl);
  return onRequestPost({
    request: new Request('https://m3mm.net/api/lead', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://m3mm.net' },
      body: JSON.stringify(lead),
    }),
    env: { RESEND_API_KEY: 'synthetic-fixture', LEAD_TO: 'operator@example.invalid' },
  } as unknown as Parameters<typeof onRequestPost>[0]);
}

beforeEach(() => {
  __resetBuckets();
  vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe.each<Channel>(['cockpit', 'n8n', 'email'])('%s provider response ownership', channel => {
  it.each([202, 503])('releases an unused %i body without buffering it', async status => {
    const cancel = vi.fn();
    const pull = vi.fn();
    const fetchImpl = vi.fn(async () => new Response(
      new ReadableStream<Uint8Array>({ cancel, pull }, { highWaterMark: 0 }), { status },
    ));
    const result = await invoke(channel, fetchImpl);
    const calls = channel === 'email' && status === 202 ? 2 : 1;
    expect(fetchImpl).toHaveBeenCalledTimes(calls);
    expect(cancel).toHaveBeenCalledTimes(calls);
    expect(pull).not.toHaveBeenCalled();
    if (result instanceof Response) expect(result.status).toBe(status === 202 ? 200 : 503);
    else expect(result).toEqual({ ok: status === 202, status });
  });

  it.each(['rejects', 'stalls'] as const)('preserves acceptance when body cancellation %s', async mode => {
    const cancel = vi.fn(() => mode === 'rejects'
      ? Promise.reject(new Error('Synthetic cleanup failure'))
      : new Promise<void>(() => {}));
    const fetchImpl = vi.fn(async () => new Response(
      new ReadableStream<Uint8Array>({ cancel }, { highWaterMark: 0 }), { status: 202 },
    ));
    const result = await invoke(channel, fetchImpl);
    expect(cancel).toHaveBeenCalledTimes(channel === 'email' ? 2 : 1);
    if (result instanceof Response) expect(result.status).toBe(200);
    else expect(result).toEqual({ ok: true, status: 202 });
  }, 1_000);

  it('accepts a bodyless response', async () => {
    const result = await invoke(channel, vi.fn(async () => new Response(null, { status: 204 })));
    if (result instanceof Response) expect(result.status).toBe(200);
    else expect(result).toEqual({ ok: true, status: 204 });
  });
});
