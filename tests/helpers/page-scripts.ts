import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { vi } from 'vitest';

// Runs the Header and ChatWidget <script>s against one shared fake document,
// so cross-component behavior (keydown order, focus) can be tested in node.
// document listeners honor capture vs bubble order and preventDefault.

type Handler = (e: FakeEvent) => void;
export type FakeEvent = { key?: string; defaultPrevented: boolean; preventDefault(): void; [k: string]: unknown };

export type FakeEl = {
  id: string; hidden: boolean; value: string; disabled: boolean; style: Record<string, string>;
  dataset: Record<string, string>; attrs: Record<string, string>; children: FakeEl[]; parent?: FakeEl;
  listeners: Record<string, Handler[]>; classList: { add(): void; remove(): void };
  setAttribute(n: string, v: string): void; getAttribute(n: string): string | null; removeAttribute(n: string): void;
  toggleAttribute(n: string, on: boolean): void; focus(): void; contains(o: unknown): boolean;
  addEventListener(n: string, h: Handler): void; requestSubmit(): void; scrollTop: number; scrollHeight: number;
  appendChild(): void; title: string; querySelector(sel: string): FakeEl | null;
};

function scriptOf(file: string) {
  const source = readFileSync(new URL(`../../src/components/${file}`, import.meta.url), 'utf8');
  return ts.transpileModule(source.match(/<script>([\s\S]*?)<\/script>/)![1], {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

export function loadPage() {
  const docListeners: Array<{ name: string; h: Handler; capture: boolean }> = [];
  const doc: Record<string, unknown> = { activeElement: null };
  const el = (id: string, parent?: FakeEl): FakeEl => {
    const e: FakeEl = {
      id, hidden: false, value: '', disabled: false, style: {}, dataset: {}, attrs: {}, children: [], parent,
      listeners: {}, classList: { add() {}, remove() {} }, scrollTop: 0, scrollHeight: 0, title: '',
      setAttribute(n, v) { this.attrs[n] = String(v); }, getAttribute(n) { return this.attrs[n] ?? null; },
      removeAttribute(n) { delete this.attrs[n]; },
      toggleAttribute(n, on) { if (on) this.attrs[n] = ''; else delete this.attrs[n]; },
      focus() { doc.activeElement = this; }, appendChild() {}, requestSubmit: vi.fn(),
      contains(o) { for (let x = o as FakeEl | undefined; x; x = x.parent) if (x === this) return true; return false; },
      addEventListener(n, h) { (this.listeners[n] ||= []).push(h); },
      // Enough selector support for the header: 'a' and 'a[aria-current]'.
      querySelector(sel) {
        return this.children.find((c) => sel === 'a' || (sel === 'a[aria-current]' && c.attrs['aria-current'] !== undefined)) ?? null;
      },
    };
    parent?.children.push(e);
    return e;
  };
  const nav = el('company-navigation');
  const navLinks = [el('nav-home', nav), el('nav-services', nav)];
  const menu = el('menu');
  menu.attrs['aria-expanded'] = 'false';
  const widget = el('chat-widget');
  const chat = Object.fromEntries(['chat-trigger', 'chat-panel', 'chat-close', 'chat-messages', 'chat-form', 'chat-input', 'chat-send']
    .map((id) => [id, el(id, widget)])) as Record<string, FakeEl>;
  chat['chat-widget'] = widget;
  const byId: Record<string, FakeEl> = { 'company-navigation': nav, ...chat };

  const queries: Record<string, { matches: boolean; listeners: Array<() => void> }> = {};
  const matchMedia = (q: string) => {
    const mq = (queries[q] ||= { matches: q.includes('min-width: 1001px'), listeners: [] });
    return { get matches() { return mq.matches; }, addEventListener: (_: string, h: () => void) => mq.listeners.push(h) };
  };

  Object.assign(doc, {
    documentElement: { dataset: {} },
    body: el('body'),
    getElementById: (id: string) => byId[id] ?? null,
    querySelector: (sel: string) => (sel === '.m3-menu' ? menu : null),
    querySelectorAll: () => [],
    createElement: () => el('div'),
    addEventListener: (name: string, h: Handler, opts?: boolean | { capture?: boolean }) =>
      docListeners.push({ name, h, capture: opts === true || (typeof opts === 'object' && !!opts?.capture) }),
  });
  doc.activeElement = doc.body;

  const ctx = {
    exports: {}, document: doc, matchMedia, JSON,
    localStorage: { getItem: () => null, setItem() {} },
    CustomEvent: class { constructor(readonly type: string) {} },
    window: { addEventListener() {}, dispatchEvent() {} },
  };
  runInNewContext(scriptOf('Header.astro'), ctx);
  runInNewContext(scriptOf('ChatWidget.astro'), ctx);

  const keydown = (key: string) => {
    const e: FakeEvent = { key, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    for (const phase of [true, false]) for (const l of docListeners) if (l.name === 'keydown' && l.capture === phase) l.h(e);
    return e;
  };
  const click = (target: FakeEl) => (target.listeners.click || []).forEach((h) => h({ target } as unknown as FakeEvent));
  const setDesktop = (matches: boolean) => {
    const mq = queries['(min-width: 1001px)'];
    mq.matches = matches;
    mq.listeners.forEach((h) => h());
  };
  return { doc, nav, navLinks, menu, chat, keydown, click, setDesktop };
}
