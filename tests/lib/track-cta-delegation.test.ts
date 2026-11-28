import { afterEach, describe, expect, it, vi } from 'vitest';
import { wireCTAs } from '../../src/lib/track';

// Some data-cta elements are created after page load, e.g. the
// "Start a separate inquiry" button (showInquiryRecovery, data-cta=
// "separate-inquiry"). wireCTAs runs once from Layout.astro, so it must
// catch clicks on elements that did not exist when it ran.
function harness() {
  const docListeners: Array<(e: unknown) => void> = [];
  const beacons: unknown[] = [];
  vi.stubGlobal('location', { search: '?src=bio', pathname: '/audit' });
  vi.stubGlobal('navigator', { sendBeacon: (_url: string, blob: Blob) => { beacons.push(blob); return true; } });
  vi.stubGlobal('document', {
    referrer: '',
    querySelectorAll: () => [], // nothing with data-cta exists yet at wire time
    addEventListener: (name: string, h: (e: unknown) => void) => { if (name === 'click') docListeners.push(h); },
  });
  wireCTAs();
  return { docListeners, beacons };
}

const ctaElement = (dataset: Record<string, string>, formIntent?: string) => {
  const el = {
    dataset,
    closest: (sel: string) => (sel === '[data-cta]' ? el : sel === 'form' && formIntent ? { querySelector: () => ({ value: formIntent }) } : null),
  };
  return el;
};

afterEach(() => vi.unstubAllGlobals());

describe('wireCTAs', () => {
  it('tracks a data-cta element added after wiring', async () => {
    const { docListeners, beacons } = harness();
    const late = ctaElement({ cta: 'separate-inquiry' }, 'tier:website:business');
    docListeners.forEach((h) => h({ target: { closest: late.closest } }));
    expect(beacons).toHaveLength(1);
    const payload = JSON.parse(await (beacons[0] as Blob).text());
    expect(payload).toMatchObject({ name: 'separate-inquiry', source: 'bio', intent: 'tier:website:business' });
  });

  it('ignores clicks outside any data-cta element and prefers an explicit data-intent', async () => {
    const { docListeners, beacons } = harness();
    docListeners.forEach((h) => h({ target: { closest: () => null } }));
    docListeners.forEach((h) => h({ target: null }));
    expect(beacons).toHaveLength(0);
    const el = ctaElement({ cta: 'hero-primary', section: 'hero', intent: 'book:free-review' }, 'tier:website:starter');
    docListeners.forEach((h) => h({ target: { closest: el.closest } }));
    const payload = JSON.parse(await (beacons[0] as Blob).text());
    expect(payload).toMatchObject({ name: 'hero-primary', section: 'hero', intent: 'book:free-review' });
  });
});
