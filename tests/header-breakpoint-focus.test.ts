import { describe, expect, it } from 'vitest';
import { loadPage } from './helpers/page-scripts';

// Crossing the 1000px breakpoint hides what may hold focus: the Menu button
// is display:none on desktop, and the closed nav is display:none on mobile
// (Header.astro <style>). Focus then falls to <body> and keyboard users lose
// their place. It must move to the counterpart control instead.
describe('header focus across the nav breakpoint', () => {
  it('moves focus from a nav link to the Menu button when the nav collapses', () => {
    const { navLinks, menu, doc, setDesktop } = loadPage();
    navLinks[1].focus();
    setDesktop(false);
    expect(doc.activeElement).toBe(menu);
  });

  it('moves focus from the Menu button to the current nav link when the button hides', () => {
    const { navLinks, menu, doc, click, setDesktop } = loadPage();
    setDesktop(false);
    navLinks[1].setAttribute('aria-current', 'page');
    click(menu);
    menu.focus();
    setDesktop(true);
    expect(menu.getAttribute('aria-expanded')).toBe('false');
    expect(doc.activeElement).toBe(navLinks[1]);
  });

  it('leaves focus alone when it is elsewhere on the page', () => {
    const { chat, doc, setDesktop } = loadPage();
    chat['chat-trigger'].focus();
    setDesktop(false);
    expect(doc.activeElement).toBe(chat['chat-trigger']);
  });
});
