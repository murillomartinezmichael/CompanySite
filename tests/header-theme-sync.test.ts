import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// The saved light/dark choice is applied before paint (Layout.astro), but a
// page restored from the back/forward cache, or open in another tab, keeps
// the theme it had. Toggle on page B, press Back to page A: A shows the old
// theme and its toggle label lies about what a click will do.
function run(initialTheme: string) {
  const source = readFileSync(new URL('../src/components/Header.astro', import.meta.url), 'utf8');
  const code = ts.transpileModule(source.match(/<script>([\s\S]*?)<\/script>/)![1], {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const store = new Map<string, string>([['m3mm-theme', initialTheme]]);
  const root = { dataset: { theme: initialTheme } as Record<string, string> };
  const toggle = { title: '', attrs: {} as Record<string, string>, setAttribute(n: string, v: string) { this.attrs[n] = v; }, addEventListener: vi.fn() };
  const winListeners: Record<string, Array<(e: unknown) => void>> = {};
  const dispatched: string[] = [];
  runInNewContext(code, {
    exports: {},
    document: {
      documentElement: root,
      querySelectorAll: (sel: string) => (sel === '[data-theme-toggle]' ? [toggle] : []),
      querySelector: () => null, getElementById: () => null, addEventListener: vi.fn(),
    },
    matchMedia: () => ({ matches: false, addEventListener: vi.fn() }),
    localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) },
    CustomEvent: class { constructor(readonly type: string) {} },
    window: {
      addEventListener: (n: string, h: (e: unknown) => void) => { (winListeners[n] ||= []).push(h); },
      dispatchEvent: (e: { type: string }) => { dispatched.push(e.type); },
    },
  });
  const fire = (name: string, event: unknown) => (winListeners[name] || []).forEach((h) => h(event));
  return { store, root, toggle, fire, dispatched };
}

describe('header theme toggle stays in sync with the saved choice', () => {
  it('re-applies the saved theme when the page is restored from bfcache', () => {
    const { store, root, toggle, fire, dispatched } = run('dark');
    expect(toggle.attrs['aria-label']).toBe('Switch to light mode');
    store.set('m3mm-theme', 'light'); // changed on another page
    fire('pageshow', { persisted: true });
    expect(root.dataset.theme).toBe('light');
    expect(toggle.attrs['aria-label']).toBe('Switch to dark mode');
    expect(dispatched).toContain('m3mm:themechange');
  });

  it('follows a change made in another tab', () => {
    const { store, root, fire } = run('light');
    store.set('m3mm-theme', 'dark');
    fire('storage', { key: 'm3mm-theme', newValue: 'dark' });
    expect(root.dataset.theme).toBe('dark');
  });

  it('ignores unrelated storage keys and junk values', () => {
    const { store, root, fire } = run('dark');
    store.set('m3mm-theme', 'purple');
    fire('storage', { key: 'm3mm-theme', newValue: 'purple' });
    fire('storage', { key: 'other', newValue: 'light' });
    expect(root.dataset.theme).toBe('dark');
  });
});
