import { afterEach, describe, expect, it, vi } from 'vitest';
import { CATALOG, BOOKING_PREFILLS, buildBrief, wirePrefill } from '../../src/lib/prefill';

// Minimal fake DOM: wirePrefill only needs document.getElementById (URL
// prefill bails when the form is absent), addEventListener('click') and two
// querySelector lookups for the hidden intent input and the textarea.
function harness(initial: string) {
  let onClick: (e: unknown) => void = () => {};
  const ta = { value: initial, dispatchEvent: vi.fn() };
  const intentField = { value: '' };
  vi.stubGlobal('window', { location: { href: 'https://m3mm.net/audit' } });
  vi.stubGlobal('document', {
    getElementById: () => null,
    addEventListener: (name: string, handler: typeof onClick) => { if (name === 'click') onClick = handler; },
    querySelector: (sel: string) => (sel.includes('textarea') ? ta : intentField),
  });
  wirePrefill();
  const click = (intent: string) => {
    const el = { dataset: { intent } };
    onClick({ target: { closest: () => el } });
  };
  return { ta, intentField, click };
}

afterEach(() => vi.unstubAllGlobals());

describe('wirePrefill tier-CTA click', () => {
  it('keeps what the visitor typed below the separator when switching tiers', () => {
    const typed = 'We get 20 DMs a week asking the same question.';
    const { ta, click } = harness(buildBrief(CATALOG['tier:website:starter']) + typed);
    click('tier:website:business');
    expect(ta.value).toBe(buildBrief(CATALOG['tier:website:business']) + typed);
  });

  it('keeps visitor text when switching from a booking seed to a tier', () => {
    const typed = 'Launch is Friday.';
    const { ta, click } = harness(BOOKING_PREFILLS['book:urgent-review'] + typed);
    click('tier:custom:scoped-project');
    expect(ta.value).toBe(buildBrief(CATALOG['tier:custom:scoped-project']) + typed);
  });

  it('seeds an empty textarea and never touches free-typed text', () => {
    const empty = harness('');
    empty.click('tier:website:starter');
    expect(empty.ta.value).toBe(buildBrief(CATALOG['tier:website:starter']));
    const free = harness('My own words, no prefill.');
    free.click('tier:website:starter');
    expect(free.ta.value).toBe('My own words, no prefill.');
    expect(free.intentField.value).toBe('tier:website:starter');
  });
});
