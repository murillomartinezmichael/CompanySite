import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// A provider/runtime exception message can quote request data (the inquiry,
// the visitor's email, an upstream body). The last-resort funnel must log
// that an error happened and its class, never the message text.
const PRIVATE = 'buyer-private@example.invalid said: synthetic upstream body';
vi.mock('../../functions/_lib/cockpit-inbox', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../functions/_lib/cockpit-inbox')>()),
  storeInCockpit: vi.fn(async () => { throw new TypeError(PRIVATE); }),
}));

const { onRequestPost } = await import('../../functions/api/lead');
const { __resetBuckets } = await import('../../functions/_lib/rate');

beforeEach(() => { __resetBuckets(); vi.spyOn(console, 'log').mockImplementation(() => {}); vi.spyOn(console, 'error').mockImplementation(() => {}); });
afterEach(() => vi.restoreAllMocks());

describe('lead unhandled-error funnel', () => {
  it('returns a generic 500 and logs no exception message', async () => {
    const request = new Request('https://m3mm.net/api/lead', {
      method: 'POST',
      headers: {
        Origin: 'https://m3mm.net', 'CF-Connecting-IP': '192.0.2.61', 'Content-Type': 'application/json',
        'Idempotency-Key': '7f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b',
      },
      body: JSON.stringify({ name: 'Synthetic Buyer', email: 'buyer-private@example.invalid', businessType: 'Synthetic', frustration: 'Synthetic inquiry details here.' }),
    });
    const env = { COCKPIT_LEAD_INBOX_URL: 'https://cockpit.example.invalid/v1/leads/ingest' };
    const response = await onRequestPost({ request, env } as unknown as Parameters<typeof onRequestPost>[0]);
    expect(response.status).toBe(500);
    const body = await response.text();
    expect(body).toBe('{"ok":false,"error":"internal_error"}');

    const logged = [...vi.mocked(console.log).mock.calls, ...vi.mocked(console.error).mock.calls]
      .map((args) => args.map(String).join(' ')).join('\n');
    expect(logged).toContain('lead_unhandled_error');
    expect(logged).toContain('TypeError');
    expect(logged).not.toContain('buyer-private');
    expect(logged).not.toContain('synthetic upstream body');
  });
});
