import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Enter in the chat textarea sends. While an IME composition is active
// (Japanese, Chinese, Korean input), Enter confirms the candidate text;
// sending then posts a half-composed message and clears the box.
function run() {
  const source = readFileSync(new URL('../src/components/ChatWidget.astro', import.meta.url), 'utf8');
  const code = ts.transpileModule(source.match(/<script>([\s\S]*?)<\/script>/)![1], {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const el = () => {
    const listeners: Record<string, (e: unknown) => void> = {};
    return {
      listeners, hidden: true, style: {}, value: '', disabled: false,
      classList: { add: vi.fn(), remove: vi.fn() }, setAttribute: vi.fn(), focus: vi.fn(),
      requestSubmit: vi.fn(),
      addEventListener: (n: string, h: (e: unknown) => void) => { listeners[n] = h; },
    };
  };
  const ids = ['chat-widget', 'chat-trigger', 'chat-panel', 'chat-close', 'chat-messages', 'chat-form', 'chat-input', 'chat-send'];
  const els = Object.fromEntries(ids.map((id) => [id, el()]));
  runInNewContext(code, {
    exports: {},
    document: { getElementById: (id: string) => els[id] ?? null, addEventListener: vi.fn() },
  });
  return els;
}

const key = (over: Record<string, unknown>) => ({ key: 'Enter', shiftKey: false, isComposing: false, keyCode: 13, preventDefault: vi.fn(), ...over });

describe('chat widget Enter-to-send', () => {
  it('sends on a plain Enter', () => {
    const els = run();
    const e = key({});
    els['chat-input'].listeners.keydown(e);
    expect(els['chat-form'].requestSubmit).toHaveBeenCalledOnce();
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it('does not send while an IME composition is confirming text', () => {
    const els = run();
    const composing = key({ isComposing: true, keyCode: 229 });
    els['chat-input'].listeners.keydown(composing);
    // Safari reports the confirming Enter with isComposing=false but keyCode 229.
    els['chat-input'].listeners.keydown(key({ keyCode: 229 }));
    expect(els['chat-form'].requestSubmit).not.toHaveBeenCalled();
    expect(composing.preventDefault).not.toHaveBeenCalled();
  });

  it('keeps Shift+Enter as a newline', () => {
    const els = run();
    els['chat-input'].listeners.keydown(key({ shiftKey: true }));
    expect(els['chat-form'].requestSubmit).not.toHaveBeenCalled();
  });
});
