import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { inboxPayload, storeInCockpit } from '../../functions/_lib/cockpit-inbox';
import { validateLead } from '../../functions/_lib/validate';

const input = {
  name: 'Synthetic Buyer', email: 'buyer@example.invalid', businessType: 'B'.repeat(120),
  frustration: 'M'.repeat(4000), currentUrl: 'https://example.invalid/?q=one',
  preferredStart: 'next month', referredBy: 'Synthetic partner', source: 'landing',
  intent: 'book:free-review', utm_source: 'synthetic', utm_medium: 'fixture',
  utm_campaign: 'campaign', utm_term: 'term', utm_content: 'content',
};
const validation = validateLead(input);
if (!validation.ok) throw new Error('Invalid synthetic fixture');
const lead = validation.lead;
const id = 'c8b72df0-b768-4c35-b7ab-c106a030d811';
const receiptId = 'f33f1140e4c542fa9230ce2ea00b29d9';
const env = { COCKPIT_LEAD_INBOX_URL: 'https://cockpit.example.invalid/v1/leads/ingest', COCKPIT_INGEST_TOKEN: 'synthetic-token' };
const defaultChannels = ['acknowledgment_email', 'operator_email'] as const;
// Synthetic planned receipts. The actual old Python storage-only fixture below stays independent.
const deliveries = (channels: readonly string[]) => channels.map((channel, index) => ({
  id: String(index + 1).padStart(32, '0'), channel, state: 'pending', attempts: 0,
  provider_receipt: '', error: '',
}));
const receipt = (channels: readonly string[] = defaultChannels) => ({
  ...inboxPayload(lead), notifications: [...channels], deliveries: deliveries(channels),
  id: receiptId, created_at: '2026-09-24T12:00:00',
});
const response = (body: unknown = receipt(), status = 201) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

beforeEach(() => vi.stubGlobal('fetch', vi.fn(async () => response())));
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('canonical Cockpit receipt', () => {
  it.each([201, 200])('accepts exact stored data with status %i', async status => {
    vi.mocked(fetch).mockResolvedValue(response(receipt(), status));
    expect(await storeInCockpit(env, id, lead)).toEqual({ ok: true, replayed: status === 200, receiptId });
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe(env.COCKPIT_LEAD_INBOX_URL);
    expect(init).toMatchObject({ redirect: 'manual', method: 'POST', headers: { 'Idempotency-Key': `companysite:${id}` } });
    const payload = JSON.parse(String(init?.body));
    expect(payload.message).toHaveLength(4000);
    expect(payload.projectType).toHaveLength(64);
    expect(payload.context).toEqual({ ...input, name: undefined, email: undefined, frustration: undefined, source: undefined, originalSource: 'landing' });
    expect(Object.keys(payload.context)).toHaveLength(11);
    expect(payload).not.toHaveProperty('ip');
    expect(payload.notifications).toEqual(defaultChannels);
  });

  it.each([202, 204, 302, 401, 409, 500])('rejects status %i as storage evidence', async status => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status }));
    expect(await storeInCockpit(env, id, lead)).toEqual({ ok: false, error: status === 409 ? 'conflict' : 'unavailable' });
  });

  it.each([
    { ...receipt(), id: '' }, { ...receipt(), id }, { ...receipt(), created_at: 'not a date' },
    { ...receipt(), message: 'truncated' }, { ...receipt(), name: 'different' },
    { ...receipt(), context: {} }, { ...receipt(), context: { ...receipt().context, intent: 'changed' } },
    { ...receipt(), context: { ...receipt().context, unexpected: 'extra' } },
    { ok: true }, null, [],
  ])('rejects incomplete or mismatched receipt %#', async body => {
    vi.mocked(fetch).mockResolvedValue(response(body));
    expect(await storeInCockpit(env, id, lead)).toMatchObject({ ok: false });
  });

  it.each(['<html>accepted</html>', '', '{'])('rejects non-JSON receipt %#', async body => {
    vi.mocked(fetch).mockResolvedValue(new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } }));
    expect(await storeInCockpit(env, id, lead)).toMatchObject({ ok: false });
  });

  it('rejects HTML even with a matching JSON-looking body', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(receipt()), { headers: { 'Content-Type': 'text/html' } }));
    expect(await storeInCockpit(env, id, lead)).toMatchObject({ ok: false });
  });

  it('ignores key order when comparing full context', async () => {
    vi.mocked(fetch).mockResolvedValue(response({ ...receipt(), context: Object.fromEntries(Object.entries(receipt().context).reverse()) }));
    expect(await storeInCockpit(env, id, lead)).toMatchObject({ ok: true });
  });

  it('does not split an astral character at the project-type display limit', async () => {
    const unicodeLead = { ...lead, businessType: 'B'.repeat(63) + '🛠️' };
    const payload = inboxPayload(unicodeLead, defaultChannels);
    expect(payload.projectType).toBe('B'.repeat(63) + '🛠');
    expect(payload.context.businessType).toBe(unicodeLead.businessType);
    vi.mocked(fetch).mockResolvedValue(response({ ...receipt(), ...payload }));
    expect(await storeInCockpit(env, id, unicodeLead)).toMatchObject({ ok: true });
  });

  it.each(['', 'bad', 'http://cockpit.example.invalid/v1/leads/ingest', 'https://u:p@cockpit.example.invalid/v1/leads/ingest', 'https://cockpit.example.invalid/v1/events', `${env.COCKPIT_LEAD_INBOX_URL}?token=x`, `${env.COCKPIT_LEAD_INBOX_URL}#x`])('rejects unsafe or wrong endpoint %# without fetch', async url => {
    expect(await storeInCockpit({ ...env, COCKPIT_LEAD_INBOX_URL: url }, id, lead)).toEqual({ ok: false, error: 'configuration' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('requires authentication configuration and a valid UUID before fetch', async () => {
    expect(await storeInCockpit({ ...env, COCKPIT_INGEST_TOKEN: '' }, id, lead)).toMatchObject({ ok: false });
    expect(await storeInCockpit(env, 'arbitrary', lead)).toMatchObject({ ok: false });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('caps a streamed body and cancels it', async () => {
    const cancel = vi.fn();
    const body = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(65_537)); }, cancel });
    vi.mocked(fetch).mockResolvedValue(new Response(body, { headers: { 'Content-Type': 'application/json' } }));
    expect(await storeInCockpit(env, id, lead)).toMatchObject({ ok: false });
    expect(cancel).toHaveBeenCalledOnce();
  });

  it.each(['fetch', 'body'])('bounds a stalled %s even if transport ignores cancellation', async phase => {
    vi.useFakeTimers();
    const cancel = vi.fn();
    vi.mocked(fetch).mockImplementation(async () => phase === 'fetch' ? new Promise<Response>(() => {})
      : new Response(new ReadableStream({ cancel }), { headers: { 'Content-Type': 'application/json' } }));
    const pending = storeInCockpit(env, id, lead);
    await vi.advanceTimersByTimeAsync(6000);
    expect(await pending).toEqual({ ok: false, error: 'unavailable' });
    expect(vi.mocked(fetch).mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    if (phase === 'body') expect(cancel).toHaveBeenCalledOnce();
  });

  it('keeps the pure helper storage-only by default and canonicalizes explicit channels', () => {
    expect(inboxPayload(lead).notifications).toEqual([]);
    expect(inboxPayload(lead, ['workflow', 'operator_email', 'workflow', 'acknowledgment_email']).notifications)
      .toEqual(['acknowledgment_email', 'operator_email', 'workflow']);
  });

  it.each([
    ['operator_email,workflow,acknowledgment_email', ['acknowledgment_email', 'operator_email', 'workflow']],
    [' workflow , operator_email ', ['operator_email', 'workflow']],
    ['', []],
  ] as const)('submits and verifies configured plan %s', async (configuration, channels) => {
    vi.mocked(fetch).mockResolvedValue(response(receipt(channels)));
    expect(await storeInCockpit({ ...env, COCKPIT_NOTIFICATION_CHANNELS: configuration }, id, lead)).toMatchObject({ ok: true });
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)).notifications).toEqual(channels);
  });

  it.each([' ', ',', 'operator_email,', ',operator_email', 'operator_email,,workflow', 'operator_email,operator_email',
    'operator_email,workflow,acknowledgment_email,operator_email', 'email', 'Operator_email', 'workflow, email'])
  ('rejects invalid channel config %j before fetch', async configuration => {
    expect(await storeInCockpit({ ...env, COCKPIT_NOTIFICATION_CHANNELS: configuration }, id, lead))
      .toEqual({ ok: false, error: 'configuration' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(['pending', 'processing', 'retry', 'accepted', 'failed', 'uncertain'])
  ('accepts durable %s jobs without claiming provider delivery', async state => {
    const body = receipt();
    body.deliveries = body.deliveries.map(delivery => ({ ...delivery, state, attempts: 3, provider_receipt: 'synthetic-receipt', error: 'transport_uncertain' }));
    vi.mocked(fetch).mockResolvedValue(response(body));
    expect(await storeInCockpit(env, id, lead)).toMatchObject({ ok: true });
  });

  it.each([
    { status: 201, attempts: 0 }, { status: 200, attempts: 0 },
    { status: 201, attempts: 3 }, { status: 200, attempts: 3 },
  ])('accepts synthetic restored uncertain receipts: status $status, attempts $attempts', async ({ status, attempts }) => {
    // Synthetic contract coverage only; the parent supplies actual restored Python wire proof separately.
    const original = receipt();
    const restored = {
      ...original,
      deliveries: original.deliveries.map(delivery => ({
        ...delivery, state: 'uncertain', attempts, error: 'restore_reconciliation',
      })),
    };
    vi.mocked(fetch).mockResolvedValue(response(restored, status));
    expect(await storeInCockpit(env, id, lead)).toEqual({ ok: true, replayed: status === 200, receiptId });
    expect(fetch).toHaveBeenCalledOnce();
    expect(restored.deliveries.map(delivery => delivery.id)).toEqual(original.deliveries.map(delivery => delivery.id));
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)).notifications).toEqual(defaultChannels);
  });

  it('accepts an operator-closed notification on an idempotent intake replay', async () => {
    const body = receipt();
    body.deliveries = body.deliveries.map(delivery => ({ ...delivery, state: 'failed', error: 'reconciled_closed' }));
    vi.mocked(fetch).mockResolvedValue(response(body, 200));
    expect(await storeInCockpit(env, id, lead)).toMatchObject({ ok: true });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each(['RESTORE_RECONCILIATION', 'restore_reconciliation_unknown', 'restore_reconciliation: synthetic private detail', 'RECONCILED_CLOSED', 'reconciled_closed: synthetic private detail'])
  ('rejects a non-exact restoration error code %s', async error => {
    const body = receipt();
    body.deliveries = body.deliveries.map(delivery => ({ ...delivery, state: 'uncertain', error }));
    vi.mocked(fetch).mockResolvedValue(response(body, 200));
    expect(await storeInCockpit(env, id, lead)).toEqual({ ok: false, error: 'invalid_receipt' });
  });

  it.each([
    { ...receipt(), notifications: undefined }, { ...receipt(), deliveries: undefined },
    { ...receipt(), notifications: [] }, { ...receipt(), notifications: [...defaultChannels].reverse() },
    { ...receipt(), notifications: ['acknowledgment_email', 'acknowledgment_email'] },
    { ...receipt(), notifications: [...defaultChannels, 'workflow'] },
    { ...receipt(), deliveries: [] }, { ...receipt(), deliveries: deliveries(['operator_email']) },
    { ...receipt(), deliveries: deliveries([...defaultChannels, 'workflow']) },
    { ...receipt(), deliveries: deliveries(['operator_email', 'operator_email']) },
    { ...receipt(), deliveries: [receipt().deliveries[0], { ...receipt().deliveries[1], id: receipt().deliveries[0].id }] },
    ...[
      { id }, { id: 'x'.repeat(32) }, { channel: 'unknown' }, { state: 'delivered' },
      { attempts: -1 }, { attempts: 0.5 }, { attempts: '0' }, { provider_receipt: null },
      { error: 'Synthetic private details leaked here' }, { error: '<html>' }, { error: 'x'.repeat(65) }, { error: 'unknown_code' },
    ].map(change => ({ ...receipt(), deliveries: [{ ...receipt().deliveries[0], ...change }, receipt().deliveries[1]] })),
  ])('rejects absent, mismatched or malformed notification evidence %#', async body => {
    vi.mocked(fetch).mockResolvedValue(response(body));
    expect(await storeInCockpit(env, id, lead)).toEqual({ ok: false, error: 'invalid_receipt' });
  });

  it('matches jobs by role, not response delivery ordering', async () => {
    vi.mocked(fetch).mockResolvedValue(response({ ...receipt(), deliveries: receipt().deliveries.reverse() }));
    expect(await storeInCockpit(env, id, lead)).toMatchObject({ ok: true });
  });

  it.each([
    { ...receipt([]), notifications: undefined }, { ...receipt([]), deliveries: undefined },
    { ...receipt([]), deliveries: deliveries(['workflow']) },
    { ...receipt([]), notifications: ['workflow'], deliveries: deliveries(['workflow']) },
  ])('rejects partial or unrequested storage-only notification evidence %#', async body => {
    vi.mocked(fetch).mockResolvedValue(response(body));
    expect(await storeInCockpit({ ...env, COCKPIT_NOTIFICATION_CHANNELS: '' }, id, lead)).toEqual({ ok: false, error: 'invalid_receipt' });
  });
});

// Captured from the real FastAPI response serializer in a guarded synthetic SQLite
// test (f45047, 2026-09-24): create201, replay200, owned GET count1. No live service.
// Keep this captured wire body independent of the TS payload builder.
const recordedPythonReceipt = {"id":"405e16f8a5944050bc5755975229bb11","name":"Synthetic Buyer","email":"buyer@example.invalid","phone":"","message":"MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM","lane":"","status":"new","followupSent":false,"company":"m3mm","projectType":"BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB","budget":"","location":"","source":"companysite","created_at":"2026-09-25T03:59:20.430858","context":{"businessType":"BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB","currentUrl":"https://example.invalid/?q=one","intent":"book:free-review","originalSource":"landing","preferredStart":"next month","referredBy":"Synthetic partner","utm_campaign":"campaign","utm_content":"content","utm_medium":"fixture","utm_source":"synthetic","utm_term":"term"}};
it.each([201, 200])('accepts the actual Python wire receipt at status %i', async status => {
  vi.mocked(fetch).mockResolvedValue(response(recordedPythonReceipt, status));
  expect(await storeInCockpit({ ...env, COCKPIT_NOTIFICATION_CHANNELS: '' }, id, lead)).toEqual({ ok: true, replayed: status === 200, receiptId: recordedPythonReceipt.id });
});
