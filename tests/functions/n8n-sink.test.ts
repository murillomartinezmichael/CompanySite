import { describe, it, expect } from 'vitest';
import {
  buildN8nLeadPayload,
  scoreLead,
  sendToN8n,
  N8N_SINK_TIMEOUT_MS,
} from '../../functions/_lib/n8n-sink';
import type { Lead } from '../../functions/_lib/validate';

const sampleLead: Lead = {
  name: 'Test Client',
  email: 'client@example.com',
  businessType: 'Home services',
  currentUrl: 'https://example.com',
  frustration: 'Site does not book jobs; leads land in DMs at 11pm and I miss half of them.',
  source: 'hero',
  intent: 'website review',
  utm_source: 'tiktok',
};

function stubFetch(status = 200, body: unknown = { ok: true }) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const impl: typeof fetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init: init ?? {} });
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as unknown as typeof fetch;
  return { impl, calls };
}

describe('scoreLead', () => {
  it('scores hotter when URL + long frustration + review intent + tiktok', () => {
    expect(scoreLead(sampleLead)).toBeGreaterThanOrEqual(60);
  });

  it('stays cooler for bare minimum leads', () => {
    const cold: Lead = {
      name: 'A',
      email: 'a@b.c',
      businessType: 'Other',
      frustration: 'hi',
      source: 'footer',
    };
    expect(scoreLead(cold)).toBeLessThan(60);
  });
});

describe('buildN8nLeadPayload', () => {
  it('includes score, hot flag, replyHint, and nested lead', () => {
    const payload = buildN8nLeadPayload('lead_abc', sampleLead, '203.0.113.7');
    expect(payload.event).toBe('m3.lead.received');
    expect(payload.id).toBe('lead_abc');
    expect(payload.hot).toBe(true);
    expect(String(payload.replyHint)).toContain('Test');
    expect(payload.lead).toMatchObject({
      email: 'client@example.com',
      businessType: 'Home services',
      currentUrl: 'https://example.com',
    });
  });
});

describe('sendToN8n', () => {
  it('skips when webhook URL unset', async () => {
    const { impl, calls } = stubFetch();
    const result = await sendToN8n({}, 'id', sampleLead, 'ip', impl);
    expect(result).toEqual({ ok: false, skipped: true });
    expect(calls).toHaveLength(0);
  });

  it('skips when URL is invalid', async () => {
    const { impl, calls } = stubFetch();
    const result = await sendToN8n(
      { N8N_LEAD_WEBHOOK_URL: 'not-a-url' },
      'id',
      sampleLead,
      'ip',
      impl,
    );
    expect(result).toEqual({ ok: false, skipped: true });
    expect(calls).toHaveLength(0);
  });

  it('POSTs JSON and optional secret header', async () => {
    const { impl, calls } = stubFetch(200);
    const result = await sendToN8n(
      {
        N8N_LEAD_WEBHOOK_URL: 'https://n8n.example.com/webhook/m3-leads',
        N8N_LEAD_WEBHOOK_SECRET: 's3cret',
      },
      'lead_1',
      sampleLead,
      '1.2.3.4',
      impl,
    );
    expect(result).toEqual({ ok: true, status: 200 });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://n8n.example.com/webhook/m3-leads');
    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-M3-Webhook-Secret']).toBe('s3cret');
    const body = JSON.parse(String(calls[0].init.body));
    expect(body.event).toBe('m3.lead.received');
    expect(body.id).toBe('lead_1');
  });

  it('returns status on non-2xx without throwing', async () => {
    const { impl } = stubFetch(502);
    const result = await sendToN8n(
      { N8N_LEAD_WEBHOOK_URL: 'https://n8n.example.com/webhook/x' },
      'id',
      sampleLead,
      'ip',
      impl,
    );
    expect(result).toEqual({ ok: false, status: 502 });
  });

  it('uses a timeout AbortSignal', () => {
    expect(N8N_SINK_TIMEOUT_MS).toBe(6_000);
  });
});
