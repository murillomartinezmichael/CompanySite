import { describe, expect, it } from 'vitest';
import { loadPage } from './helpers/page-scripts';

// The chat panel is non-modal and the mobile menu can stay open while the
// visitor works elsewhere. Escape closes them, but must only move focus back
// to their toggle when focus was inside what just closed. Otherwise Escape
// pressed in, say, an intake field yanks the visitor out of what they typed.
describe('Escape returns focus only from inside the closed layer', () => {
  it('chat: leaves focus on an unrelated field', () => {
    const { chat, outside, doc, keydown, click } = loadPage();
    click(chat['chat-trigger']);
    outside.focus();
    keydown('Escape');
    expect(chat['chat-panel'].hidden).toBe(true);
    expect(doc.activeElement).toBe(outside);
  });

  it('chat: returns focus to the trigger from inside the panel', () => {
    const { chat, doc, keydown, click } = loadPage();
    click(chat['chat-trigger']);
    expect(doc.activeElement).toBe(chat['chat-input']);
    keydown('Escape');
    expect(doc.activeElement).toBe(chat['chat-trigger']);
  });

  it('menu: leaves focus on an unrelated field', () => {
    const { menu, outside, doc, keydown, click } = loadPage();
    click(menu);
    outside.focus();
    keydown('Escape');
    expect(menu.getAttribute('aria-expanded')).toBe('false');
    expect(doc.activeElement).toBe(outside);
  });

  it('menu: returns focus to the Menu button from inside the nav', () => {
    const { menu, navLinks, doc, keydown, click } = loadPage();
    click(menu);
    navLinks[0].focus();
    keydown('Escape');
    expect(doc.activeElement).toBe(menu);
  });
});
