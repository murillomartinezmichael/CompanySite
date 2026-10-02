import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost as leadPost } from '../../functions/api/lead';
import { __resetBuckets } from '../../functions/_lib/rate';
import { API_SECURITY_HEADERS } from '../../functions/_lib/security-headers';
import { LIMITS } from '../../functions/_lib/validate';

const encoder = new TextEncoder();
const FIELDS = {
  name: 'Renée 😀',
  email: 'synthetic@example.invalid',
  businessType: 'Synthetic café',
  currentUrl: 'https://synthetic.example.invalid/',
  frustration: 'Keep A&B, 25% and café 😀 intact.',
  preferredStart: 'Next month',
  source: 'synthetic-fixture',
  referredBy: 'Synthetic referrer',
  intent: 'book:free-review',
  utm_source: 'synthetic-social',
  utm_medium: 'referral',
  utm_campaign: 'synthetic-campaign',
  utm_content: 'synthetic-content',
  utm_term: 'synthetic-term',
};
const ENV = {
  RESEND_API_KEY: 'synthetic-fixture',
  LEAD_TO: 'operator@example.invalid',
  COCKPIT_INGEST_URL: 'https://cockpit.example.invalid/ingest',
  COCKPIT_INGEST_TOKEN: 'synthetic-fixture',
  N8N_LEAD_WEBHOOK_URL: 'https://n8n.example.invalid/intake',
};
const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
  new Response('{}', { status: 200 }));

function form(extra: Record<string, string> = {}) {
  const data = new FormData();
  for (const [name, value] of Object.entries({ ...FIELDS, ...extra })) data.append(name, value);
  return data;
}

function post(body: FormData | string | ReadableStream<Uint8Array>, headers: Record<string, string> = {}) {
  return new Request('https://m3mm.net/api/lead', {
    method: 'POST',
    headers: { Origin: 'https://m3mm.net', 'CF-Connecting-IP': '192.0.2.3', ...headers },
    body,
    duplex: 'half',
  } as RequestInit);
}

const invoke = (request: Request) => leadPost({ request, env: ENV } as unknown as Parameters<typeof leadPost>[0]);

function expectHeaders(response: Response) {
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://m3mm.net');
  expect(response.headers.get('Vary')).toContain('Origin');
  for (const [header, value] of Object.entries(API_SECURITY_HEADERS)) {
    expect(response.headers.get(header)).toBe(value);
  }
}

async function expectRedirect(response: Response, location = '/thanks') {
  expectHeaders(response);
  expect(response.status).toBe(303);
  expect(response.headers.get('Location')).toBe(location);
  expect(await response.text()).toBe('');
}

async function expectRejected(response: Response, status: number, error: string) {
  expectHeaders(response);
  expect(response.status).toBe(status);
  expect(response.headers.get('Location')).toBeNull();
  expect(await response.json()).toMatchObject({ ok: false, error });
  expect(fetchMock).not.toHaveBeenCalled();
}

beforeEach(() => {
  __resetBuckets();
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('/api/lead multipart form submissions', () => {
  it('delivers native FormData with Unicode, literal punctuation and all attribution intact', async () => {
    await expectRedirect(await invoke(post(form())));
    expect(fetchMock).toHaveBeenCalledTimes(4);
    const payloads = fetchMock.mock.calls.map(([, init]) => JSON.parse(init!.body as string));
    expect(payloads[0].reply_to).toBe(FIELDS.email);
    expect(payloads[0].html).toContain(FIELDS.name);
    expect(payloads[0].html).toContain('Keep A&amp;B, 25% and café 😀 intact.');
    expect(payloads[1].to).toBe(FIELDS.email);
    expect(payloads[2].name).toBe(`${FIELDS.name} — ${FIELDS.businessType}`);
    expect(payloads[3].lead).toEqual(FIELDS);
  });

  it.each([
    ['book:roadmap-subscribe', '/roadmap/thanks'],
    ['https://evil.example.invalid/', '/thanks'],
  ])('keeps intent %s inside the receipt allowlist', async (intent, location) => {
    await expectRedirect(await invoke(post(form({ intent }))), location);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('keeps the honeypot silent without any delivery', async () => {
    await expectRedirect(await invoke(post(form({ company_website: 'filled', intent: 'book:roadmap-subscribe' }))), '/roadmap/thanks');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('preserves first-value semantics for duplicate text fields', async () => {
    const data = form();
    data.append('name', 'Wrong second name');
    data.append('intent', 'book:roadmap-subscribe');
    await expectRedirect(await invoke(post(data)));
    const payload = JSON.parse(fetchMock.mock.calls[3][1]!.body as string);
    expect(payload.lead.name).toBe(FIELDS.name);
    expect(payload.lead.intent).toBe(FIELDS.intent);
  });

  it('still validates required fields before delivery', async () => {
    await expectRejected(await invoke(post(form({ email: 'invalid' }))), 400, 'validation');
  });

  it.each(['name', 'attachment'])('rejects file parts in %s instead of coercing or forwarding them', async field => {
    const data = form();
    data.set(field, new Blob(['Synthetic file contents']), 'synthetic.txt');
    await expectRejected(await invoke(post(data)), 400, 'invalid_form');
  });

  it.each([
    ['missing boundary', 'multipart/form-data', '--SyntheticBoundary--\r\n'],
    ['wrong boundary', 'multipart/form-data; boundary=ExpectedBoundary', '--DifferentBoundary--\r\n'],
    ['truncated part', 'multipart/form-data; boundary=SyntheticBoundary', '--SyntheticBoundary\r\nContent-Disposition: form-data; name="name"\r\n\r\nRenée'],
  ])('rejects a %s without sending', async (_label, contentType, body) => {
    await expectRejected(await invoke(post(body, { 'Content-Type': contentType })), 400, 'invalid_form');
  });

  it.each([
    ['absent', {}],
    ['understated', { 'Content-Length': '100' }],
  ] as const)('rejects oversized multipart bytes with %s Content-Length before parsing', async (_label, headers) => {
    const request = post(form({ ignoredPadding: 'é'.repeat(8000) }), headers);
    const bytes = await request.clone().arrayBuffer();
    expect(bytes.byteLength).toBeGreaterThan(LIMITS.bodyBytes);
    expect(new TextDecoder().decode(bytes).length).toBeLessThan(LIMITS.bodyBytes);
    const parser = vi.spyOn(Response.prototype, 'formData');
    await expectRejected(await invoke(request), 413, 'payload_too_large');
    expect(parser).not.toHaveBeenCalled();
  });

  it('accepts exactly the byte limit with a quoted, case-sensitive boundary', async () => {
    const boundary = 'SyntheticCaseSensitiveBoundary';
    const part = (key: string, value: string) =>
      `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`;
    const prefix = Object.entries(FIELDS).map(([key, value]) => part(key, value)).join('');
    const suffix = `--${boundary}--\r\n`;
    const overhead = encoder.encode(prefix + part('ignoredPadding', '') + suffix).byteLength;
    const body = prefix + part('ignoredPadding', 'x'.repeat(LIMITS.bodyBytes - overhead)) + suffix;
    expect(encoder.encode(body).byteLength).toBe(LIMITS.bodyBytes);
    await expectRedirect(await invoke(post(body, { 'Content-Type': `multipart/form-data; boundary="${boundary}"` })));
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('preserves multipart boundaries and UTF-8 split across stream chunks', async () => {
    const request = post(form());
    const contentType = request.headers.get('Content-Type')!;
    const bytes = new Uint8Array(await request.arrayBuffer());
    let index = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (index === bytes.length) controller.close();
        else controller.enqueue(bytes.slice(index, ++index));
      },
    }, { highWaterMark: 0 });
    await expectRedirect(await invoke(post(stream, { 'Content-Type': contentType })));
    expect(stream.locked).toBe(false);
    expect(JSON.parse(fetchMock.mock.calls[3][1]!.body as string).lead).toEqual(FIELDS);
  });
});
