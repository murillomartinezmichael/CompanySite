// tests/functions/cockpit-sink.test.ts — Rung II PROVE for the CockpitCloud
// lead-sink helper. Money code + a real network hop (Book V Rung VII fleet
// bond) = tested. Uses a stub fetch so no live URL is required and no state
// bleeds between cases.

import { describe, it, expect, vi } from 'vitest';
import {
  buildCockpitLeadCard,
  sendToCockpit,
  leadIdempotencyKey,
  COCKPIT_SINK_TIMEOUT_MS,
} from '../../functions/_lib/cockpit-sink';
import type { Lead } from '../../functions/_lib/validate';

const sampleLead: Lead = {
  name: 'Test Client',
  email: 'client@example.com',
  businessType: 'Home services',
  currentUrl: 'https://example.com',
  frustration: 'Site does not book jobs; leads land in DMs at 11pm.',
  source: 'hero',
};

function stubFetch(status = 202, body: unknown = { ok: true }) {
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

describe('buildCockpitLeadCard', () => {
  it('emits the CockpitCloud EventIn shape verbatim (source/kind/name/next_step/link/link_label)', () => {
    const card = buildCockpitLeadCard('lead_abc', sampleLead, '203.0.113.7');
    expect(card).toMatchObject({
      source: 'companysite:hero',
      kind: 'lead',
      name: 'Test Client — Home services',
      link: 'https://example.com',
      link_label: 'Their site',
    });
    // next_step contains the triage payload — email + site + frustration + IP
    const nextStep = String((card as { next_step: string }).next_step);
    expect(nextStep).toContain('Reply within 24h');
    expect(nextStep).toContain('client@example.com');
    expect(nextStep).toContain('https://example.com');
    expect(nextStep).toContain(sampleLead.frustration);
    expect(nextStep).toContain('203.0.113.7');
  });

  it('drops the "Their site" line and link_label when Lead has no currentUrl', () => {
    const card = buildCockpitLeadCard('id', { ...sampleLead, currentUrl: undefined }, 'ip');
    expect(card.link).toBe('');
    expect(card.link_label).toBe('');
    expect(String(card.next_step)).not.toContain('Their site:');
  });

  it('caps source at 64, name at 255, next_step at 4000, link at 2000, link_label at 64', () => {
    const longLead: Lead = {
      name: 'A'.repeat(400),
      email: 'x@y.z',
      businessType: 'B'.repeat(400),
      currentUrl: 'https://' + 'c'.repeat(2500) + '.example.com',
      frustration: 'F'.repeat(5000),
      source: 'S'.repeat(200),
    };
    const card = buildCockpitLeadCard('id', longLead, 'ip');
    expect(String(card.source).length).toBeLessThanOrEqual(64);
    expect(String(card.name).length).toBeLessThanOrEqual(255);
    expect(String(card.next_step).length).toBeLessThanOrEqual(4000);
    expect(String(card.link).length).toBeLessThanOrEqual(2000);
    expect(String(card.link_label).length).toBeLessThanOrEqual(64);
  });

  it('prefixes source with "companysite:" so triage knows the origin', () => {
    const card = buildCockpitLeadCard('id', { ...sampleLead, source: 'audit-page' }, 'ip');
    expect(card.source).toBe('companysite:audit-page');
  });
});

describe('leadIdempotencyKey', () => {
  it('returns the same key for identical stable-field leads', () => {
    const a = leadIdempotencyKey(sampleLead);
    const b = leadIdempotencyKey({ ...sampleLead, name: 'Different Name', source: 'audit-page' });
    // name + source are NOT part of the key (source can vary per hit; name is user-typed)
    expect(a).toBe(b);
    expect(a).toMatch(/^lead_[0-9a-f]{8}$/);
  });

  it('returns a different key when email changes', () => {
    const a = leadIdempotencyKey(sampleLead);
    const b = leadIdempotencyKey({ ...sampleLead, email: 'other@example.com' });
    expect(a).not.toBe(b);
  });

  it('returns a different key when frustration diverges past the truncate window', () => {
    const a = leadIdempotencyKey(sampleLead);
    const b = leadIdempotencyKey({ ...sampleLead, frustration: 'Completely different frustration copy that changes the hash input.' });
    expect(a).not.toBe(b);
  });
});

describe('sendToCockpit', () => {
  it('skips silently when COCKPIT_INGEST_URL is unset', async () => {
    const { impl, calls } = stubFetch();
    const r = await sendToCockpit({}, 'id', sampleLead, 'ip', impl);
    expect(r).toEqual({ ok: false, skipped: true });
    expect(calls).toHaveLength(0);
  });

  it('skips silently when COCKPIT_INGEST_URL is a malformed URL (typo guard)', async () => {
    const { impl, calls } = stubFetch();
    const r = await sendToCockpit({ COCKPIT_INGEST_URL: 'not a url' }, 'id', sampleLead, 'ip', impl);
    expect(r).toEqual({ ok: false, skipped: true });
    expect(calls).toHaveLength(0);
  });

  it('POSTs the EventIn body when URL is set and returns ok+status on 2xx', async () => {
    const { impl, calls } = stubFetch(201);
    const r = await sendToCockpit(
      { COCKPIT_INGEST_URL: 'https://cockpit.example.com/v1/events' },
      'lead_abc',
      sampleLead,
      '203.0.113.7',
      impl,
    );
    expect(r).toEqual({ ok: true, status: 201 });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://cockpit.example.com/v1/events');
    expect(calls[0].init.method).toBe('POST');
    const parsed = JSON.parse(String(calls[0].init.body));
    expect(parsed.kind).toBe('lead');
    expect(parsed.source).toBe('companysite:hero');
    expect(parsed.name).toBe('Test Client — Home services');
    expect(String(parsed.next_step)).toContain('client@example.com');
  });

  it('surfaces non-2xx status via ok:false', async () => {
    const { impl } = stubFetch(500, { error: 'kaboom' });
    const r = await sendToCockpit(
      { COCKPIT_INGEST_URL: 'https://cockpit.example.com/ingest' },
      'id',
      sampleLead,
      'ip',
      impl,
    );
    expect(r).toEqual({ ok: false, status: 500 });
  });

  it('adds Bearer Authorization when COCKPIT_INGEST_TOKEN is set', async () => {
    const { impl, calls } = stubFetch();
    await sendToCockpit(
      {
        COCKPIT_INGEST_URL: 'https://cockpit.example.com/ingest',
        COCKPIT_INGEST_TOKEN: 's3cret_token',
      },
      'id',
      sampleLead,
      'ip',
      impl,
    );
    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer s3cret_token');
  });

  it('omits Authorization when COCKPIT_INGEST_TOKEN is absent', async () => {
    const { impl, calls } = stubFetch();
    await sendToCockpit(
      { COCKPIT_INGEST_URL: 'https://cockpit.example.com/ingest' },
      'id',
      sampleLead,
      'ip',
      impl,
    );
    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it('collapses fetch errors to ok:false with error name — never throws', async () => {
    const failingFetch = (async () => {
      const err = new Error('boom') as Error & { name: string };
      err.name = 'NetworkError';
      throw err;
    }) as unknown as typeof fetch;
    const r = await sendToCockpit(
      { COCKPIT_INGEST_URL: 'https://cockpit.example.com/ingest' },
      'id',
      sampleLead,
      'ip',
      failingFetch,
    );
    expect(r).toEqual({ ok: false, error: 'NetworkError' });
  });

  it('sends X-Cockpit-Kind header for CockpitCloud routing', async () => {
    const { impl, calls } = stubFetch();
    await sendToCockpit(
      { COCKPIT_INGEST_URL: 'https://cockpit.example.com/ingest' },
      'id',
      sampleLead,
      'ip',
      impl,
    );
    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers['X-Cockpit-Kind']).toBe('lead');
  });

  it('keeps the timeout constant sensible (< 10s worker window)', () => {
    expect(COCKPIT_SINK_TIMEOUT_MS).toBeGreaterThan(0);
    expect(COCKPIT_SINK_TIMEOUT_MS).toBeLessThan(10_000);
  });
});
