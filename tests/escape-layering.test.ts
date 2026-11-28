import { describe, expect, it } from 'vitest';
import { loadPage } from './helpers/page-scripts';

// Header (mobile menu) and ChatWidget both close on Escape from a keydown
// listener on document. With both open, one press closed both, and each
// moved focus (menu button, then chat trigger). Escape must close only the
// topmost layer: the chat panel floats above the header (z-index 60 vs 40).
describe('Escape with the mobile menu and chat both open', () => {
  it('closes only the chat first, then the menu on the next press', () => {
    const { menu, chat, keydown, click, doc } = loadPage();
    click(menu);
    click(chat['chat-trigger']);
    expect(menu.getAttribute('aria-expanded')).toBe('true');
    expect(chat['chat-panel'].hidden).toBe(false);

    keydown('Escape');
    expect(chat['chat-panel'].hidden).toBe(true);
    expect(menu.getAttribute('aria-expanded')).toBe('true');
    expect(doc.activeElement).toBe(chat['chat-trigger']);

    keydown('Escape');
    expect(menu.getAttribute('aria-expanded')).toBe('false');
    expect(doc.activeElement).toBe(menu);
  });

  it('still closes each one on its own', () => {
    const a = loadPage();
    a.click(a.menu);
    a.keydown('Escape');
    expect(a.menu.getAttribute('aria-expanded')).toBe('false');

    const b = loadPage();
    b.click(b.chat['chat-trigger']);
    b.keydown('Escape');
    expect(b.chat['chat-panel'].hidden).toBe(true);
  });
});
