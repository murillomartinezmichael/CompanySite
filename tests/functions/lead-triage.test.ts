import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildN8nLeadPayload, scoreLead } from '../../functions/_lib/n8n-sink';
import { buildCockpitLeadCard } from '../../functions/_lib/cockpit-sink';
import { onRequestPost } from '../../functions/api/lead';
import { __resetBuckets } from '../../functions/_lib/rate';
import type { Lead } from '../../functions/_lib/validate';

const lead = {
  name: 'Synthetic Reader',
  email: 'reader@example.invalid',
  businessType: 'roadmap-subscriber',
  currentUrl: 'https://synthetic.example.invalid',
  frustration: 'Roadmap topics: synthetic previews and release notes. '.repeat(3),
  source: 'roadmap',
  intent: 'book:roadmap-subscribe',
  referredBy: 'Synthetic Referrer',
  preferredStart: 'Not a build request',
  utm_source: 'tiktok',
};
const env = {
  RESEND_API_KEY: 'synthetic-fixture',
  LEAD_TO: 'operator@example.invalid',
  COCKPIT_INGEST_URL: 'https://cockpit.example.invalid/ingest',
  N8N_LEAD_WEBHOOK_URL: 'https://n8n.example.invalid/intake',
};
const fetchMock = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => new Response('{}'));
const payload = (value: Lead) => buildN8nLeadPayload('synthetic-id', value, '192.0.2.6');
const card = (value: Lead) => buildCockpitLeadCard('synthetic-id', value, '192.0.2.6');

function expectRoadmapTriage(n8n: Record<string, unknown>, cockpit: Record<string, unknown>) {
  expect(n8n).toMatchObject({ event: 'm3.lead.received', score: 0, hot: false });
  expect(String(n8n.triage)).toContain('Roadmap update request');
  expect(String(n8n.triage)).not.toMatch(/HOT|reply within|few hours|24h/);
  expect(String(n8n.replyHint)).toContain('received your roadmap update request');
  expect(String(n8n.replyHint)).toContain('https://m3mm.net/roadmap');
  expect(String(n8n.replyHint)).not.toMatch(/\breview\b|peeked|concrete fixes|24h|within|weekly|every (?:drop|release)|subscribed|Stripe/i);
  expect(String(cockpit.next_step)).toMatch(/^Roadmap update request/);
  expect(String(cockpit.next_step)).not.toMatch(/Reply within|Checkout intake|verify Stripe/);
}

beforeEach(() => {
  __resetBuckets();
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('truthful intake triage', () => {
  it('does not score a roadmap follow request as a hot sales lead, even with sales-like metadata', () => {
    expect(scoreLead(lead)).toBe(0);
    expectRoadmapTriage(payload(lead), card(lead));
  });

  it('retains roadmap contact, topics, attribution and existing wire schemas', () => {
    const n8n = payload(lead);
    const cockpit = card(lead);
    expect(n8n.lead).toMatchObject(lead);
    expect(Object.keys(n8n).sort()).toEqual(['event', 'hot', 'id', 'ip', 'lead', 'receivedAt', 'replyHint', 'score', 'triage'].sort());
    expect(Object.keys(cockpit).sort()).toEqual(['kind', 'link', 'link_label', 'name', 'next_step', 'source'].sort());
    expect(cockpit).toMatchObject({ kind: 'lead', source: 'companysite:roadmap', link: lead.currentUrl });
    for (const text of [lead.email, lead.frustration, lead.referredBy]) expect(String(cockpit.next_step)).toContain(text);
    expectRoadmapTriage(n8n, cockpit);
  });

  it.each(['book:roadmap-subscribe-extra', 'BOOK:ROADMAP-SUBSCRIBE', '', undefined])('does not infer roadmap treatment from source/business fields for intent %s', intent => {
    const other = { ...lead, intent };
    expect(scoreLead(other)).toBe(90);
    expect(payload(other)).toMatchObject({ score: 90, hot: true });
    expect(String(payload(other).triage)).toMatch(/^HOT/);
    expect(String(card(other).next_step)).toMatch(/^Reply within 24h/);
    expect(String(payload(other).replyHint)).not.toContain('received your roadmap update request');
  });

  it('does not claim a website has already been inspected when generating a sales reply draft', () => {
    const hint = String(payload({ ...lead, intent: 'book:free-review' }).replyHint);
    expect(hint).toContain('Synthetic');
    expect(hint).toContain(lead.currentUrl);
    expect(hint).toContain('I’ll review it before suggesting changes.');
    expect(hint).not.toMatch(/I peeked|I reviewed|I checked|have 2–3 concrete fixes/);
  });

  it('still asks for a URL when the sales lead has not supplied one', () => {
    const hint = String(payload({ ...lead, intent: 'book:free-review', currentUrl: undefined }).replyHint);
    expect(hint).toContain('Send me the site URL (or a screenshot)');
    expect(hint).not.toMatch(/I peeked|I reviewed|I checked/);
  });

  it('preserves checkout payment verification and build-week instructions', () => {
    const checkout = { ...lead, intent: 'checkout:basic-deposit', preferredStart: 'October' };
    expect(payload(checkout)).toMatchObject({ score: 100, hot: true });
    expect(String(payload(checkout).replyHint)).toContain('Verify the Stripe payment, then reply:');
    expect(String(payload(checkout).replyHint)).toContain('October');
    expect(String(card(checkout).next_step)).toMatch(/^Checkout intake — verify Stripe payment, then confirm scope and build week\./);
  });

  it.each(['json', 'urlencoded', 'multipart'])('sends corrected roadmap triage through the real %s route', async encoding => {
    const fields = { ...lead, intent: '  book:roadmap-subscribe  ' };
    const headers = new Headers({ Origin: 'https://m3mm.net' });
    let body: BodyInit;
    if (encoding === 'json') {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(fields);
    } else if (encoding === 'urlencoded') body = new URLSearchParams(fields);
    else {
      const form = new FormData();
      for (const [key, value] of Object.entries(fields)) form.append(key, value);
      body = form;
    }
    const request = new Request('https://m3mm.net/api/lead', { method: 'POST', headers, body });
    const response = await onRequestPost({ request, env } as unknown as Parameters<typeof onRequestPost>[0]);
    expect(response.status).toBe(encoding === 'json' ? 200 : 303);
    if (encoding === 'json') expect(await response.json()).toEqual({ ok: true });
    else expect(response.headers.get('Location')).toBe('/roadmap/thanks');
    expect(fetchMock).toHaveBeenCalledTimes(4);
    const sent = (url: string) => {
      const call = fetchMock.mock.calls.find(([target]) => String(target) === url);
      expect(call).toBeDefined();
      return JSON.parse(call![1]!.body as string);
    };
    const n8n = sent(env.N8N_LEAD_WEBHOOK_URL);
    expect(n8n.lead.intent).toBe('book:roadmap-subscribe');
    expect(n8n.lead.frustration).toBe(lead.frustration.trim());
    expectRoadmapTriage(n8n, sent(env.COCKPIT_INGEST_URL));
  });
});
