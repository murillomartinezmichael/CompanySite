import { existsSync, readFileSync, statSync } from 'node:fs';
import { expect, it } from 'vitest';

// The /websites Proof video sits well below the mobile fold, but a `poster`
// attribute is fetched eagerly at full size (no srcset, no lazy loading).
// Posters ship as data-poster-srcset and src/lib/lazyVideo.ts sets the
// smallest candidate that fits once the video nears the viewport.
const dist = new URL('../../dist/', import.meta.url);
const html = readFileSync(new URL('websites/index.html', dist), 'utf8');
const videos = html.match(/<video\b[^>]*>/g) ?? [];

it('ships at least one proof video', () => {
  expect(videos.length).toBeGreaterThan(0);
});

it('does not fetch video posters on first paint', () => {
  for (const tag of videos) expect(tag).not.toMatch(/\sposter=/);
});

it('offers a mobile-sized poster candidate under 160 KB', () => {
  for (const tag of videos) {
    const srcset = tag.match(/\bdata-poster-srcset="([^"]+)"/)?.[1];
    expect(srcset, tag).toBeTruthy();
    const candidates = srcset!.split(',').map(s => s.trim().split(/\s+/));
    for (const [url] of candidates) expect(existsSync(new URL('.' + url, dist)), url).toBe(true);
    const smallest = Math.min(...candidates.map(([url]) => statSync(new URL('.' + url, dist)).size));
    expect(smallest).toBeLessThan(160_000);
  }
});
