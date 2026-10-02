import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost as leadPost } from '../../functions/api/lead';
import { __resetBuckets } from '../../functions/_lib/rate';
import { LIMITS } from '../../functions/_lib/validate';

type Encoding = 'json' | 'urlencoded' | 'multipart';
const FIELDS = {
  name: 'Synthetic reader',
  email: 'reader@example.invalid',
  businessType: 'roadmap-subscriber',
  frustration: 'Roadmap subscriber wants: synthetic preview updates.',
  source: 'roadmap',
  intent: 'book:roadmap-subscribe',
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

async function post(encoding: Encoding, extra: Record<string, string> = {}) {
  const fields = { ...FIELDS, ...extra };
  const headers = new Headers({ Origin: 'https://m3mm.net', 'CF-Connecting-IP': '192.0.2.4' });
  let body: BodyInit;
  if (encoding === 'json') {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(fields);
  } else if (encoding === 'urlencoded') {
    body = new URLSearchParams(fields);
  } else {
    const data = new FormData();
    for (const [name, value] of Object.entries(fields)) data.append(name, value);
    body = data;
  }
  const request = new Request('https://m3mm.net/api/lead', { method: 'POST', headers, body });
  return leadPost({ request, env: ENV } as unknown as Parameters<typeof leadPost>[0]);
}

function confirmation() {
  expect(fetchMock).toHaveBeenCalledTimes(4);
  expect(fetchMock.mock.calls[0][0]).toBe('https://api.resend.com/emails');
  expect(fetchMock.mock.calls[1][0]).toBe('https://api.resend.com/emails');
  const admin = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
  const reply = JSON.parse(fetchMock.mock.calls[1][1]!.body as string);
  expect(admin.to).toBe(ENV.LEAD_TO);
  expect(admin.reply_to).toBe(FIELDS.email);
  expect(reply.to).toBe(FIELDS.email);
  const forwarded = JSON.parse(fetchMock.mock.calls[3][1]!.body as string);
  expect(forwarded.lead.email).toBe(FIELDS.email);
  return reply as { subject: string; html: string };
}

function expectRoadmapReceipt(reply: { subject: string; html: string }) {
  expect(reply.subject).toBe('Your M3MM roadmap request is in');
  expect(reply.html).toContain('Your roadmap update request was received by M3MM.');
  expect(reply.html).toContain('href="https://m3mm.net/roadmap"');
  expect(reply.html).not.toMatch(/teardown|review request|Deadline:|hear back from me before|within 24|weekly|every drop|Stripe|down payment|SiteGuide|share link/i);
}

beforeEach(() => {
  __resetBuckets();
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('lead confirmation matches the requested service', () => {
  it.each<Encoding>(['json', 'urlencoded', 'multipart'])('acknowledges a %s roadmap request without a review or schedule promise', async encoding => {
    const response = await post(encoding);
    expect(response.status).toBe(encoding === 'json' ? 200 : 303);
    if (encoding === 'json') expect(await response.json()).toEqual({ ok: true });
    else expect(response.headers.get('Location')).toBe('/roadmap/thanks');
    expectRoadmapReceipt(confirmation());
  });

  it('uses the validated, trimmed intent for both email and receipt', async () => {
    const response = await post('urlencoded', { intent: '  book:roadmap-subscribe  ' });
    expect(response.headers.get('Location')).toBe('/roadmap/thanks');
    expectRoadmapReceipt(confirmation());
  });

  it('escapes visitor text in the roadmap email and keeps its destination fixed', async () => {
    const name = '<img src=x onerror=alert(1)> & Renée';
    await post('json', { name, currentUrl: 'https://untrusted.example.invalid/' });
    const reply = confirmation();
    expectRoadmapReceipt(reply);
    expect(reply.html).toContain('&lt;img src=x onerror=alert(1)&gt; &amp; Renée');
    expect(reply.html).not.toContain('<img');
    expect(reply.html).not.toContain('untrusted.example.invalid');
  });

  it.each<Encoding>(['json', 'urlencoded', 'multipart'])('preserves the existing website-review email for %s', async encoding => {
    const response = await post(encoding, { intent: 'book:free-review' });
    expect(response.status).toBe(encoding === 'json' ? 200 : 303);
    if (encoding !== 'json') expect(response.headers.get('Location')).toBe('/thanks');
    const reply = confirmation();
    expect(reply.subject).toBe('Got your review request — M3MM');
    expect(reply.html).toContain('5-minute recorded video teardown');
    expect(reply.html).toContain('Deadline:');
    expect(reply.html).toContain('hear back from me before');
    expect(reply.html).toContain('Your share link:');
    expect(reply.html).not.toContain('roadmap update request');
  });

  it('preserves the project-intake acknowledgment and existing payment wording', async () => {
    await post('json', { intent: 'checkout:basic-deposit' });
    const reply = confirmation();
    expect(reply.subject).toBe('Your M3MM project intake is in');
    expect(reply.html).toContain("I'll review the scope and your preferred timing");
    expect(reply.html).toContain('Keep your Stripe receipt');
    expect(reply.html).toContain('Deadline:');
    expect(reply.html).not.toMatch(/recorded video teardown|roadmap update request/);
  });

  it.each(['book:roadmap-subscribe-extra', ''])('does not infer roadmap intent from source or business fields (%s)', async intent => {
    await post('json', { intent });
    const reply = confirmation();
    expect(reply.subject).toBe('Got your review request — M3MM');
    expect(reply.html).toContain('5-minute recorded video teardown');
  });

  it('does not send acknowledgments for a roadmap honeypot submission', async () => {
    const response = await post('json', { company_website: 'filled' });
    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not send acknowledgments when roadmap validation fails', async () => {
    const response = await post('json', { email: 'invalid' });
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each<Encoding>(['urlencoded', 'multipart'])('preserves native %s topics in every operator delivery', async encoding => {
    const response = await post(encoding, {
      topics: '  AIMA & café <preview>  ',
      frustration: 'Roadmap subscriber update request.',
      intent: ' book:roadmap-subscribe ',
    });
    expect(response.headers.get('Location')).toBe('/roadmap/thanks');
    expectRoadmapReceipt(confirmation());
    const payloads = fetchMock.mock.calls.map(([, init]) => JSON.parse(init!.body as string));
    const note = 'Roadmap subscriber wants: AIMA & café <preview>';
    expect(payloads[0].html).toContain('Roadmap subscriber wants: AIMA &amp; café &lt;preview&gt;');
    expect(payloads[2].next_step).toContain(note);
    expect(payloads[3].lead.frustration).toBe(note);
  });

  it.each<Encoding>(['urlencoded', 'multipart'])('keeps the default note for blank %s topics', async encoding => {
    await post(encoding, { topics: '   ', frustration: 'Roadmap subscriber update request.' });
    confirmation();
    expect(JSON.parse(fetchMock.mock.calls[3][1]!.body as string).lead.frustration)
      .toBe('Roadmap subscriber update request.');
  });

  it.each<Encoding>(['urlencoded', 'multipart'])('does not replace another intake note with a %s topics field', async encoding => {
    await post(encoding, { intent: 'book:free-review', topics: 'Unrelated topic', frustration: 'Keep this actual review request.' });
    confirmation();
    expect(JSON.parse(fetchMock.mock.calls[3][1]!.body as string).lead.frustration)
      .toBe('Keep this actual review request.');
  });

  it('applies the existing note limit to native roadmap topics', async () => {
    const topics = 'x'.repeat(LIMITS.frustration + 200);
    await post('urlencoded', { topics });
    confirmation();
    expect(JSON.parse(fetchMock.mock.calls[3][1]!.body as string).lead.frustration)
      .toBe(`Roadmap subscriber wants: ${topics}`.slice(0, LIMITS.frustration));
  });
});
