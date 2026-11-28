import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Submitting clears the textarea before the request. When the send fails
// (network drop, 429, 5xx) the visitor's message must come back so they can
// retry without retyping it.
function run(fetchImpl: () => Promise<unknown>) {
  const source = readFileSync(new URL('../src/components/ChatWidget.astro', import.meta.url), 'utf8');
  const code = ts.transpileModule(source.match(/<script>([\s\S]*?)<\/script>/)![1], {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const el = () => {
    const listeners: Record<string, (e: unknown) => void> = {};
    return {
      listeners, hidden: true, style: {}, value: '', disabled: false, scrollTop: 0, scrollHeight: 0,
      classList: { add: vi.fn(), remove: vi.fn() }, setAttribute: vi.fn(), focus: vi.fn(),
      appendChild: vi.fn(), requestSubmit: vi.fn(),
      addEventListener: (n: string, h: (e: unknown) => void) => { listeners[n] = h; },
    };
  };
  const ids = ['chat-widget', 'chat-trigger', 'chat-panel', 'chat-close', 'chat-messages', 'chat-form', 'chat-input', 'chat-send'];
  const els = Object.fromEntries(ids.map((id) => [id, el()]));
  runInNewContext(code, {
    exports: {},
    fetch: fetchImpl,
    JSON,
    document: {
      getElementById: (id: string) => els[id] ?? null,
      addEventListener: vi.fn(),
      createElement: () => ({ className: '', textContent: '', classList: { add: vi.fn(), remove: vi.fn() } }),
    },
  });
  const submit = async (text: string) => {
    els['chat-input'].value = text;
    els['chat-form'].listeners.submit({ preventDefault: vi.fn() });
    expect(els['chat-input'].value).toBe('');
    await new Promise((r) => setTimeout(r, 0));
  };
  return { els, submit };
}

describe('chat widget failed send', () => {
  it('restores the message when the connection drops', async () => {
    const { els, submit } = run(() => Promise.reject(new TypeError('offline')));
    await submit('What does a site cost?');
    expect(els['chat-input'].value).toBe('What does a site cost?');
  });

  it('restores the message on a non-OK response', async () => {
    const { els, submit } = run(() => Promise.resolve({ ok: false, status: 429, body: null }));
    await submit('Hello');
    expect(els['chat-input'].value).toBe('Hello');
  });

  it('does not overwrite text typed while the failed request was in flight', async () => {
    let fail!: (e: unknown) => void;
    const { els } = run(() => new Promise((_, reject) => { fail = reject; }));
    els['chat-input'].value = 'First';
    els['chat-form'].listeners.submit({ preventDefault: vi.fn() });
    els['chat-input'].value = 'Second';
    fail(new TypeError('offline'));
    await new Promise((r) => setTimeout(r, 0));
    expect(els['chat-input'].value).toBe('Second');
  });
});
