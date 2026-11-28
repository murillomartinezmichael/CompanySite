import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost } from '../../functions/api/lead';
import { __resetBuckets } from '../../functions/_lib/rate';
import { validateLead } from '../../functions/_lib/validate';

// Single-line lead fields flow into the operator email Subject, the Cockpit
// card title and n8n replyHint. A CR/LF (or other control) in them must never
// reach a provider, where it reads as a header break or a forged line.
const env = { RESEND_API_KEY: 'synthetic-fixture', LEAD_TO: 'operator@example.invalid' };
const sent: Array<Record<string, unknown>> = [];

beforeEach(() => {
  __resetBuckets();
  sent.length = 0;
  vi.stubGlobal('fetch', vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    sent.push(JSON.parse(String(init?.body)));
    return new Response(null, { status: 202 });
  }));
  vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('lead single-line fields cannot carry line breaks or controls', () => {
  it('strips CR/LF from name and businessType before they reach the email Subject', async () => {
    const request = new Request('https://m3mm.net/api/lead', {
      method: 'POST',
      headers: { Origin: 'https://m3mm.net', 'CF-Connecting-IP': '192.0.2.31', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Synthetic Buyer\r\nBcc: injected@example.invalid',
        email: 'buyer@example.invalid',
        businessType: 'Plumbing\nX-Injected: 1',
        frustration: 'Synthetic inquiry details that are long enough.',
      }),
    });
    const response = await onRequestPost({ request, env } as unknown as Parameters<typeof onRequestPost>[0]);
    expect(response.status).toBe(200);
    const admin = sent.find((b) => b.to === env.LEAD_TO)!;
    expect(admin.subject).not.toMatch(/[\r\n]/);
    expect(admin.subject).toBe('M3MM intake · Synthetic Buyer Bcc: injected@example.invalid (Plumbing X-Injected: 1)');
  });

  it('removes C0/C1 controls, Unicode line separators and bidi overrides from single-line fields', () => {
    const r = validateLead({
      name: 'A\u0000B\u0085C\u2028D\u202eE\u2066F\tG',
      email: 'buyer@example.invalid',
      businessType: 'Roofing\u000b',
      referredBy: 'Ref\r\nX',
      utm_source: 'tiktok\u2029x',
      frustration: 'Line one\r\nLine two\u0000 keeps its newline.\tTabbed.',
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.lead.name).toBe('A B C D E F G');
    expect(r.lead.businessType).toBe('Roofing');
    expect(r.lead.referredBy).toBe('Ref X');
    expect(r.lead.utm_source).toBe('tiktok x');
    // Multi-line free text keeps \n and \t, normalises CRLF, drops other controls.
    expect(r.lead.frustration).toBe('Line one\nLine two keeps its newline.\tTabbed.');
  });
});
