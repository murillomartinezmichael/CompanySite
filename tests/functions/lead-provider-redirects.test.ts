import { createServer, type IncomingHttpHeaders, type Server } from 'node:http';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost } from '../../functions/api/lead';
import { __resetBuckets } from '../../functions/_lib/rate';

// Use real fetch redirect handling against owned loopback servers. The mapping
// below refuses every non-fixture initial destination; no provider is contacted.
const nativeFetch = globalThis.fetch;
const lead = {
  name: 'Synthetic Buyer', email: 'buyer@example.invalid', businessType: 'Synthetic business',
  frustration: 'Synthetic private inquiry canary.', source: 'test',
};
const bindings = {
  RESEND_API_KEY: 'synthetic-email-token', LEAD_TO: 'operator@example.invalid',
  COCKPIT_INGEST_URL: 'https://cockpit.example.invalid/ingest', COCKPIT_INGEST_TOKEN: 'synthetic-cockpit-token',
  N8N_LEAD_WEBHOOK_URL: 'https://n8n.example.invalid/intake', N8N_LEAD_WEBHOOK_SECRET: 'synthetic-n8n-token',
};
type Channel = 'admin' | 'reply' | 'cockpit' | 'n8n';
type Received = { path: string; method: string; headers: IncomingHttpHeaders; body: string };
const statuses: Record<Channel, number> = { admin: 202, reply: 202, cockpit: 202, n8n: 202 };
const providerRequests: Received[] = [];
const redirectedRequests: Received[] = [];
let provider: Server;
let destination: Server;
let providerOrigin: string;
let destinationOrigin: string;
let sameOrigin = false;

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => { server.off('error', reject); resolve(); });
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Fixture did not bind TCP');
  return `http://127.0.0.1:${address.port}`;
}

beforeAll(async () => {
  destination = createServer(async (request, response) => {
    let body = '';
    for await (const chunk of request) body += chunk.toString();
    redirectedRequests.push({ path: request.url!, method: request.method!, headers: request.headers, body });
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end('<p>Synthetic login page: no inquiry stored.</p>');
  });
  destinationOrigin = await listen(destination);
  provider = createServer(async (request, response) => {
    let body = '';
    for await (const chunk of request) body += chunk.toString();
    const received = { path: request.url!, method: request.method!, headers: request.headers, body };
    if (request.url?.startsWith('/unexpected')) {
      redirectedRequests.push(received);
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end('<p>Synthetic login page: no inquiry stored.</p>');
      return;
    }
    providerRequests.push(received);
    const channel = request.url!.slice(1) as Channel;
    const status = statuses[channel];
    if (status >= 300 && status < 400) {
      response.writeHead(status, { Location: `${sameOrigin ? providerOrigin : destinationOrigin}/unexpected?detail=synthetic-private-redirect` });
    } else response.writeHead(status, { 'Content-Type': 'application/json' });
    response.end('{"fixture":true}');
  });
  providerOrigin = await listen(provider);
});

afterAll(async () => {
  await Promise.all([provider, destination].filter(Boolean).map(server => new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  })));
});

beforeEach(() => {
  __resetBuckets();
  providerRequests.length = 0;
  redirectedRequests.length = 0;
  sameOrigin = false;
  Object.assign(statuses, { admin: 202, reply: 202, cockpit: 202, n8n: 202 });
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
    let channel: Channel;
    if (String(input) === 'https://api.resend.com/emails') {
      channel = JSON.parse(String(init?.body)).to === bindings.LEAD_TO ? 'admin' : 'reply';
    } else if (String(input) === bindings.COCKPIT_INGEST_URL) channel = 'cockpit';
    else if (String(input) === bindings.N8N_LEAD_WEBHOOK_URL) channel = 'n8n';
    else throw new Error('Refused unexpected fixture destination');
    return nativeFetch(`${providerOrigin}/${channel}`, init);
  });
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

async function invoke(env: Record<string, string>) {
  return onRequestPost({ request: new Request('https://m3mm.net/api/lead', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://m3mm.net', 'CF-Connecting-IP': '192.0.2.10' },
    body: JSON.stringify(lead),
  }), env } as unknown as Parameters<typeof onRequestPost>[0]);
}

function onlyChannel(channel: Exclude<Channel, 'reply'>): Record<string, string> {
  if (channel === 'admin') return { RESEND_API_KEY: bindings.RESEND_API_KEY, LEAD_TO: bindings.LEAD_TO };
  if (channel === 'cockpit') return { COCKPIT_INGEST_URL: bindings.COCKPIT_INGEST_URL, COCKPIT_INGEST_TOKEN: bindings.COCKPIT_INGEST_TOKEN };
  return { N8N_LEAD_WEBHOOK_URL: bindings.N8N_LEAD_WEBHOOK_URL, N8N_LEAD_WEBHOOK_SECRET: bindings.N8N_LEAD_WEBHOOK_SECRET };
}

describe.each(['admin', 'cockpit', 'n8n'] as const)('%s delivery destination', channel => {
  it.each([301, 302, 303, 307, 308])('rejects cross-origin %i without sending data to the redirect or issuing a receipt', async status => {
    statuses[channel] = status;
    const response = await invoke(onlyChannel(channel));
    expect.soft(redirectedRequests).toEqual([]);
    expect.soft(providerRequests.map(request => request.path)).toEqual([`/${channel}`]);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, error: 'delivery_unavailable' });
    expect(response.headers.get('Location')).toBeNull();
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://m3mm.net');
    const logs = JSON.stringify(vi.mocked(console.log).mock.calls);
    for (const canary of [lead.email, lead.frustration, 'synthetic-private-redirect', 'synthetic-email-token', 'synthetic-cockpit-token', 'synthetic-n8n-token']) {
      expect(logs).not.toContain(canary);
    }
  });

  it('also rejects a same-origin login redirect', async () => {
    sameOrigin = true;
    statuses[channel] = 302;
    expect((await invoke(onlyChannel(channel))).status).toBe(503);
    expect(redirectedRequests).toEqual([]);
  });

  it('still accepts a direct 2xx response with the complete inquiry', async () => {
    expect((await invoke(onlyChannel(channel))).status).toBe(200);
    expect(providerRequests[0].method).toBe('POST');
    expect(providerRequests[0].body).toContain(lead.email);
    expect(providerRequests[0].body).toContain(lead.frustration);
    expect(redirectedRequests).toEqual([]);
  });
});

it('accepts a direct fallback when the other operator channels redirect', async () => {
  statuses.admin = 302;
  statuses.n8n = 307;
  const response = await invoke(bindings);
  expect(response.status).toBe(200);
  expect(providerRequests.map(request => request.path)).toEqual(['/admin', '/cockpit', '/n8n', '/reply']);
  expect(redirectedRequests).toEqual([]);
});

it('keeps an accepted inquiry successful when its acknowledgment redirects', async () => {
  statuses.reply = 307;
  expect((await invoke(onlyChannel('admin'))).status).toBe(200);
  expect(providerRequests.map(request => request.path)).toEqual(['/admin', '/reply']);
  expect(redirectedRequests).toEqual([]);
  const entry = JSON.parse(vi.mocked(console.log).mock.calls.at(-1)![0]);
  expect(entry.resend.reply).toMatchObject({ ok: false, status: 307 });
});

it('permits a deliberate retry after the operator endpoint is corrected', async () => {
  statuses.n8n = 302;
  expect((await invoke(onlyChannel('n8n'))).status).toBe(503);
  statuses.n8n = 202;
  expect((await invoke(onlyChannel('n8n'))).status).toBe(200);
  expect(providerRequests).toHaveLength(2);
  const first = JSON.parse(providerRequests[0].body);
  const second = JSON.parse(providerRequests[1].body);
  expect(second.lead).toEqual(first.lead);
  expect(redirectedRequests).toEqual([]);
});
