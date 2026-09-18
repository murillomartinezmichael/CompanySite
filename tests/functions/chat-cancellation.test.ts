import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost as chatPost } from '../../functions/api/chat';
import { __resetBuckets } from '../../functions/_lib/rate';
import { API_SECURITY_HEADERS } from '../../functions/_lib/security-headers';

const sdk = vi.hoisted(() => ({ stream: vi.fn() }));
vi.mock('@anthropic-ai/sdk', () => ({
  default: class FakeAnthropic {
    messages = { stream: sdk.stream };
    static APIError = class extends Error {};
  },
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

const delta = (text: string) => ({ type: 'content_block_delta', delta: { type: 'text_delta', text } });
function pendingProvider(firstDelta = false) {
  const gate = deferred<void>();
  const finalMessage = vi.fn(async () => ({ stop_reason: 'end_turn' }));
  return {
    gate, finalMessage,
    async *[Symbol.asyncIterator]() {
      if (firstDelta) yield delta('Synthetic partial');
      await gate.promise;
      yield delta('Synthetic late token');
    },
  };
}

function request(signal?: AbortSignal) {
  return new Request('https://m3mm.net/api/chat', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', Origin: 'https://m3mm.net' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Synthetic question' }] }),
  });
}
const invoke = (req: Request) => chatPost({ request: req, env: { ANTHROPIC_API_KEY: 'synthetic-fixture' } } as unknown as Parameters<typeof chatPost>[0]);
const upstreamSignal = (call = 0): AbortSignal | undefined => sdk.stream.mock.calls[call]?.[1]?.signal;
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

async function promptly<T>(promise: Promise<T>): Promise<T | 'still-pending'> {
  let timer: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([promise, new Promise<'still-pending'>(resolve => {
      timer = setTimeout(() => resolve('still-pending'), 50);
    })]);
  } finally { clearTimeout(timer!); }
}

beforeEach(() => {
  __resetBuckets();
  sdk.stream.mockReset();
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Unexpected network request'); }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('/api/chat upstream cancellation', () => {
  it('cancels before the first token without waiting for a stalled provider', async () => {
    const provider = pendingProvider();
    sdk.stream.mockReturnValue(provider);
    const response = await invoke(request());
    const cancellation = response.body!.cancel().catch(error => error);
    try {
      expect(await promptly(cancellation)).toBeUndefined();
      expect(upstreamSignal()?.aborted).toBe(true);
      expect(provider.finalMessage).not.toHaveBeenCalled();
    } finally {
      provider.gate.resolve();
      await cancellation;
      await tick();
    }
  });

  it.each(['late token', 'late error'])('ignores a %s after consumer cancellation', async outcome => {
    const provider = pendingProvider(true);
    sdk.stream.mockReturnValue(provider);
    const response = await invoke(request());
    const reader = response.body!.getReader();
    expect(new TextDecoder().decode((await reader.read()).value)).toContain('Synthetic partial');
    const cancellation = reader.cancel().catch(error => error);
    try {
      expect(await promptly(cancellation)).toBeUndefined();
      expect(upstreamSignal()?.aborted).toBe(true);
      expect(await reader.read()).toEqual({ value: undefined, done: true });
    } finally {
      if (outcome === 'late error') provider.gate.reject(new Error('Synthetic late provider failure'));
      else provider.gate.resolve();
      await cancellation;
      reader.releaseLock();
      await tick();
    }
    expect(provider.finalMessage).not.toHaveBeenCalled();
  });

  it('aborts upstream and closes the response when the incoming request aborts', async () => {
    const abort = new AbortController();
    const req = request(abort.signal);
    const remove = vi.spyOn(req.signal, 'removeEventListener');
    const provider = pendingProvider();
    sdk.stream.mockReturnValue(provider);
    const response = await invoke(req);
    const result = response.text();
    abort.abort();
    try {
      expect(upstreamSignal()?.aborted).toBe(true);
      expect(await promptly(result)).toBe('');
      expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
    } finally { provider.gate.resolve(); await result.catch(() => {}); await tick(); }
  });

  it('never starts generation for an already aborted request', async () => {
    const abort = new AbortController();
    abort.abort();
    sdk.stream.mockReturnValue({
      async *[Symbol.asyncIterator]() {},
      async finalMessage() { return { stop_reason: 'end_turn' }; },
    });
    const response = await invoke(request(abort.signal));
    expect(sdk.stream).not.toHaveBeenCalled();
    expect(await response.text()).toBe('');
  });

  it('cancels while the final provider message is pending', async () => {
    const final = deferred<{ stop_reason: string }>();
    const entered = deferred<void>();
    sdk.stream.mockReturnValue({
      async *[Symbol.asyncIterator]() { yield delta('Synthetic partial'); },
      finalMessage() { entered.resolve(); return final.promise; },
    });
    const response = await invoke(request());
    await entered.promise;
    const cancellation = response.body!.cancel().catch(error => error);
    try {
      expect(await promptly(cancellation)).toBeUndefined();
      expect(upstreamSignal()?.aborted).toBe(true);
    } finally { final.resolve({ stop_reason: 'end_turn' }); await cancellation; await tick(); }
  });

  it.each(['end_turn', 'refusal', 'error'])('cleans its listener and preserves %s output and headers', async outcome => {
    const abort = new AbortController();
    const req = request(abort.signal);
    const add = vi.spyOn(req.signal, 'addEventListener');
    const remove = vi.spyOn(req.signal, 'removeEventListener');
    sdk.stream.mockReturnValue({
      async *[Symbol.asyncIterator]() {
        if (outcome === 'error') throw new Error('Synthetic private provider detail');
        if (outcome === 'end_turn') yield delta('Synthetic complete');
      },
      async finalMessage() { return { stop_reason: outcome }; },
    });
    const response = await invoke(req);
    const events = (await response.text()).trim().split('\n').map(line => JSON.parse(line));
    expect(events).toEqual(outcome === 'end_turn'
      ? [{ type: 'delta', text: 'Synthetic complete' }, { type: 'done' }]
      : [{ type: 'error', message: outcome === 'refusal' ? 'The assistant declined to answer that.' : 'Something broke on send.' }]);
    const listener = add.mock.calls.find(([event]) => event === 'abort')?.[1];
    expect(listener).toBeTypeOf('function');
    expect(remove).toHaveBeenCalledWith('abort', listener);
    expect(upstreamSignal()?.aborted).toBe(false);
    abort.abort();
    expect(upstreamSignal()?.aborted).toBe(false);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/x-ndjson');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://m3mm.net');
    for (const [header, value] of Object.entries(API_SECURITY_HEADERS)) expect(response.headers.get(header)).toBe(value);
  });

  it('isolates cancellation between concurrent requests', async () => {
    const first = pendingProvider();
    const second = pendingProvider();
    sdk.stream.mockReturnValueOnce(first).mockReturnValueOnce(second);
    const a = await invoke(request());
    const b = await invoke(request());
    const cancellation = a.body!.cancel().catch(error => error);
    try {
      expect(await promptly(cancellation)).toBeUndefined();
      expect(upstreamSignal(0)?.aborted).toBe(true);
      expect(upstreamSignal(1)?.aborted).toBe(false);
      second.gate.resolve();
      expect(await b.text()).toContain('Synthetic late token');
    } finally { first.gate.resolve(); second.gate.resolve(); await cancellation; await tick(); }
  });
});
