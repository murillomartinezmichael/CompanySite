import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// BreadcrumbList `item` URLs are crawled like links. Bare /projects 308s to
// /projects/ on Cloudflare Pages, so each item must be the served slash form,
// and the last crumb must equal the page's own canonical.
const dist = fileURLToPath(new URL('../../dist/', import.meta.url));
const pages = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
  const abs = join(dir, name);
  return statSync(abs).isDirectory() ? pages(abs) : name.endsWith('.html') ? [abs] : [];
});

describe('BreadcrumbList JSON-LD item URLs', () => {
  const lists = pages(dist).flatMap((file) => {
    const html = readFileSync(file, 'utf8');
    return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]))
      .filter((block) => block['@type'] === 'BreadcrumbList')
      .map((block) => ({ file: relative(dist, file), html, block }));
  });

  it('finds breadcrumb lists', () => expect(lists.length).toBeGreaterThan(30));

  for (const { file, html, block } of lists) {
    it(`${file} uses served URLs`, () => {
      const items: string[] = block.itemListElement.map((i: { item: string }) => i.item);
      for (const item of items) expect(item).toMatch(/^https:\/\/m3mm\.net\/(.*\/)?$/);
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
      if (!file.startsWith('404')) expect(items.at(-1)).toBe(canonical);
    });
  }
});
