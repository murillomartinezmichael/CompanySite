import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// After Stripe redirects back to /start?checkout=complete the script reveals
// #project-intake and moves focus to the intake <section id="intake">. A
// <section> is not focusable unless it has a tabindex, so focus() is a silent
// no-op and keyboard / screen-reader users stay at the top of a page whose
// content was just swapped. A fake element models that browser rule.
function section(id: string) {
  const attrs = new Map<string, string>();
  return {
    id, hidden: true, focusedWhileFocusable: false,
    getAttribute: (n: string) => attrs.get(n) ?? null,
    hasAttribute: (n: string) => attrs.has(n),
    setAttribute(n: string, v: string) { attrs.set(n, v); },
    focus() { if (attrs.has('tabindex')) this.focusedWhileFocusable = true; },
  };
}

function run(search: string) {
  const source = readFileSync(new URL('../../src/pages/start.astro', import.meta.url), 'utf8');
  const script = source.match(/<script>([\s\S]*?)<\/script>/)![1];
  const code = ts.transpileModule(script, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const els: Record<string, ReturnType<typeof section>> = {
    'project-intake': section('project-intake'), 'deposit-step': section('deposit-step'), intake: section('intake'),
  };
  let linkClick: (() => void) | undefined;
  runInNewContext(code, {
    exports: {}, URLSearchParams,
    window: { location: { search } },
    document: {
      getElementById: (id: string) => els[id] ?? null,
      querySelector: () => ({ addEventListener: (_: string, h: () => void) => { linkClick = h; } }),
    },
    requestAnimationFrame: (cb: () => void) => cb(),
  });
  return { els, clickLink: () => linkClick?.() };
}

describe('/start ?checkout=complete reveal', () => {
  it('actually moves focus to the project intake', () => {
    const { els } = run('?checkout=complete');
    expect(els['project-intake'].hidden).toBe(false);
    expect(els['deposit-step'].hasAttribute('hidden')).toBe(true);
    expect(els.intake.focusedWhileFocusable).toBe(true);
    expect(els.intake.getAttribute('tabindex')).toBe('-1');
  });

  it('does nothing without the checkout param until the paid-intake link is clicked', () => {
    const { els, clickLink } = run('');
    expect(els['project-intake'].hidden).toBe(true);
    expect(els.intake.focusedWhileFocusable).toBe(false);
    clickLink();
    expect(els['project-intake'].hidden).toBe(false);
    expect(els.intake.focusedWhileFocusable).toBe(true);
  });
});
