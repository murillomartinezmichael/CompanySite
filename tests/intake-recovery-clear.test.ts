import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as lib from '../src/lib/inquiry-submission';
import { validateLead } from '../functions/_lib/validate';

// The "Start a separate inquiry" button is only meaningful next to the
// error text that explains it. When the intake script hides that text
// (visitor edits a field, or a field-level validation error), the button
// must go too, or it is left floating with no explanation.
function run() {
  const source = readFileSync(new URL('../src/components/Intake.astro', import.meta.url), 'utf8');
  const code = ts.transpileModule(source.match(/<script>([\s\S]*?)<\/script>/)![1], {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const recovery = { remove: vi.fn() };
  const status = { textContent: 'error', classList: { add: vi.fn(), remove: vi.fn() } };
  const button = { disabled: false, querySelector: () => ({ innerHTML: 'Send' }) };
  const listeners: Record<string, (e?: unknown) => unknown> = {};
  const fields: Record<string, string> = { name: '', email: 'x', businessType: '', frustration: '', source: 'website' };
  const doc = {
    getElementById: (id: string) => (id === 'intake-form' ? form : id === 'intake-form-new-inquiry' ? recovery : status),
  };
  const form = {
    id: 'intake-form', ownerDocument: doc, dataset: { source: 'website' },
    querySelector: (sel: string) => (sel.startsWith('[name=') ? { setCustomValidity: vi.fn() } : button),
    querySelectorAll: () => [],
    addEventListener: (name: string, h: (e?: unknown) => unknown) => { listeners[name] = h; },
    reportValidity: vi.fn(), reset: vi.fn(),
  };
  runInNewContext(code, {
    exports: {},
    require: (name: string) => {
      if (name === '@/lib/inquiry-submission') return lib;
      if (name === '@/lib/track') return { track: vi.fn() };
      if (name === '@/lib/prefill') return { isPriorPrefill: () => false };
      if (name === '../../functions/_lib/validate') return { validateLead };
      throw new Error(`Unexpected import ${name}`);
    },
    document: doc,
    FormData: class { entries() { return Object.entries(fields); } },
    fetch: vi.fn(), setTimeout: vi.fn(), window: { location: { href: '' } },
  });
  return { listeners, recovery, status };
}

describe('intake separate-inquiry button follows its explanation', () => {
  it('is removed when typing hides the error status', () => {
    const { listeners, recovery, status } = run();
    listeners.input();
    expect(status.classList.add).toHaveBeenCalledWith('hidden');
    expect(recovery.remove).toHaveBeenCalled();
  });

  it('is removed when a field validation error hides the status', async () => {
    const { listeners, recovery, status } = run();
    await listeners.submit({ preventDefault: vi.fn() });
    expect(status.classList.add).toHaveBeenCalledWith('hidden');
    expect(recovery.remove).toHaveBeenCalled();
  });
});

describe('clearInquiryRecovery', () => {
  it('removes the recovery button for that form and tolerates its absence', () => {
    const btn = { remove: vi.fn() };
    const form = { id: 'f', ownerDocument: { getElementById: (id: string) => (id === 'f-new-inquiry' ? btn : null) } };
    lib.clearInquiryRecovery(form as unknown as HTMLFormElement);
    expect(btn.remove).toHaveBeenCalledOnce();
    expect(() => lib.clearInquiryRecovery({ id: 'g', ownerDocument: { getElementById: () => null } } as unknown as HTMLFormElement)).not.toThrow();
  });
});
