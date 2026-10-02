import { describe, expect, it, vi } from 'vitest';
import { createInquirySubmission, InquiryRetryError, inquiryErrorMessage } from '../src/lib/inquiry-submission';

const original = { email: 'private@example.invalid', frustration: 'Private synthetic note, never retained.', intent: 'book:free-review' };
const changed = { ...original, frustration: 'A separate synthetic inquiry.' };

function fixture() {
  let serial = 0;
  const data = new Map<string, string>();
  const storage = { getItem: vi.fn((key: string) => data.get(key) ?? null), setItem: vi.fn((key: string, value: string) => { data.set(key, value); }) };
  const uuid = vi.fn(() => `00000000-0000-4000-8000-${String(++serial).padStart(12, '0')}`);
  const create = () => createInquirySubmission(uuid, { scope: 'test', storage: () => storage });
  return { data, storage, uuid, create };
}

describe('privacy-limited reload retry lifecycle', () => {
  it('persists only key/fingerprint/status before a request and reuses after reload', async () => {
    const f = fixture();
    const first = await f.create().prepare(original);
    expect(first.accepted).toBe(false);
    const raw = [...f.data.values()][0];
    expect(raw).not.toContain(original.email);
    expect(raw).not.toContain(original.frustration);
    expect(raw).not.toContain('book:free-review');
    expect(JSON.parse(raw)[0]).toEqual({ key: first.key, fingerprint: expect.stringMatching(/^[a-f0-9]{64}$/), status: 'uncertain' });
    expect(await f.create().prepare(Object.fromEntries(Object.entries(original).reverse()))).toEqual(first);
    expect(f.uuid).toHaveBeenCalledOnce();
  });

  it('requires an explicit separate inquiry for changed input and preserves A→B→A across reload', async () => {
    const f = fixture(); const state = f.create();
    const a = await state.prepare(original);
    await expect(state.prepare(changed)).rejects.toMatchObject({ code: 'changed' });
    expect(f.uuid).toHaveBeenCalledOnce();
    await state.allowSeparate(changed);
    const b = await state.prepare(changed);
    expect(b.key).not.toBe(a.key);
    expect(await state.prepare(original)).toEqual(a);
    expect(await f.create().prepare(changed)).toEqual(b);
    expect(await f.create().prepare(original)).toEqual(a);
  });

  it('binds the deliberate separate approval to exactly the reviewed payload', async () => {
    const state = fixture().create();
    await state.prepare(original); await state.allowSeparate(changed);
    await expect(state.prepare({ ...changed, email: 'other@example.invalid' })).rejects.toMatchObject({ code: 'changed' });
  });

  it('retains acceptance after reload; an identical new inquiry requires explicit intent', async () => {
    const f = fixture(); const state = f.create(); const first = await state.prepare(original);
    expect(state.markAccepted(first.key)).toBe(true);
    const reloaded = f.create();
    expect(await reloaded.prepare(original)).toEqual({ key: first.key, accepted: true });
    await reloaded.allowSeparate(original);
    const next = await reloaded.prepare(original);
    expect(next.accepted).toBe(false); expect(next.key).not.toBe(first.key);
    expect(await f.create().prepare(original)).toEqual(next);
  });

  it.each(['read', 'write', 'readback'])('refuses network preparation when storage %s fails', async phase => {
    const f = fixture();
    if (phase === 'read') f.storage.getItem.mockImplementation(() => { throw new Error('blocked'); });
    if (phase === 'write') f.storage.setItem.mockImplementation(() => { throw new Error('quota'); });
    if (phase === 'readback') f.storage.setItem.mockImplementation(() => {});
    await expect(f.create().prepare(original)).rejects.toMatchObject({ code: 'storage' });
  });

  it.each(['read', 'write', 'missing', 'replaced'])('does not throw or report nothing sent when post-acceptance storage is %s', async phase => {
    const f = fixture(); const state = f.create(); const first = await state.prepare(original);
    if (phase === 'read') f.storage.getItem.mockImplementation(() => { throw new Error('blocked'); });
    if (phase === 'write') f.storage.setItem.mockImplementation(() => { throw new Error('quota'); });
    if (phase === 'missing') f.data.clear();
    if (phase === 'replaced') f.data.set('m3.inquiry.retry.v1:test', '[]');
    expect(state.markAccepted(first.key)).toBe(false);
    if (phase === 'write') {
      f.storage.setItem.mockImplementation((key, value) => { f.data.set(key, value); });
      expect((await f.create().prepare(original)).key).toBe(first.key);
    }
  });

  it('refuses silent identity replacement after storage disappears mid-page', async () => {
    const f = fixture(); const state = f.create(); await state.prepare(original); f.data.clear();
    await expect(state.prepare(original)).rejects.toMatchObject({ code: 'storage' });
    expect(f.uuid).toHaveBeenCalledOnce();
  });

  it.each(['{}', '[]', 'null', '[null]', 'not json', 'x'.repeat(4097),
    JSON.stringify([{ key: 'not-a-uuid', fingerprint: 'a'.repeat(64), status: 'uncertain' }]),
    JSON.stringify([{ key: '00000000-0000-4000-8000-000000000001', fingerprint: 'a'.repeat(64), status: 'uncertain', email: original.email }]),
  ])('fails closed for corrupt/unexpected storage %s', async raw => {
    const f = fixture(); f.data.set('m3.inquiry.retry.v1:test', raw);
    await expect(f.create().prepare(original)).rejects.toMatchObject({ code: 'invalid' });
    expect(f.uuid).not.toHaveBeenCalled();
  });

  it('never evicts old unresolved identities when the bounded map is full', async () => {
    const f = fixture(); const state = f.create();
    const a = await state.prepare(original);
    for (let i = 1; i < 16; i++) {
      const data = { ...original, frustration: `Synthetic separate inquiry ${i}` };
      await state.allowSeparate(data); await state.prepare(data);
    }
    await state.allowSeparate(changed);
    await expect(state.prepare(changed)).rejects.toMatchObject({ code: 'limit' });
    expect(await f.create().prepare(original)).toEqual(a);
  });

  it('explains before-send failure without denying an earlier uncertain send', () => {
    const message = inquiryErrorMessage(new InquiryRetryError('storage'));
    expect(message).toContain('No request was made this time');
    expect(message).toContain('Earlier attempts may already be saved');
    expect(inquiryErrorMessage(new Error('transport'))).toContain('Delivery was not confirmed');
  });
});
