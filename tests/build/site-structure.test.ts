import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../../dist/', import.meta.url));
const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
const pages = walk(dist).filter(p => p.endsWith('.html')).map(file => ({
  file,
  route: '/' + relative(dist, file).replace(/\\/g, '/').replace(/index\.html$/, ''),
  html: readFileSync(file, 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ''),
}));
const anchors = (html: string) => [...html.matchAll(/<a\b[^>]*>/g)].map(m => m[0]);
const hrefOf = (tag: string) => tag.match(/\bhref="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&');
const urlOf = (href: string, route: string) => new URL(href, 'https://m3mm.net' + route);

describe('rendered site structure', () => {
  it('every internal navigation target and fragment resolves in the build', () => {
    const errors: string[] = [];
    for (const page of pages) for (const tag of anchors(page.html)) {
      const href = hrefOf(tag);
      if (!href) continue;
      const url = urlOf(href, page.route);
      if (url.origin !== 'https://m3mm.net') continue;
      const target = pages.find(p => p.route.replace(/\/$/, '') === url.pathname.replace(/\/$/, ''));
      if (!target) {
        if (!existsSync(join(dist, url.pathname))) errors.push(`${page.route} → ${href}`);
      } else if (url.hash && !target.html.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) {
        errors.push(`${page.route} → missing fragment ${href}`);
      }
    }
    expect(errors).toEqual([]);
  });

  it('all indexable pages are reachable by browsing from the homepage', () => {
    const reached = new Set(['/']);
    for (let changed = true; changed;) {
      changed = false;
      for (const page of pages.filter(p => reached.has(p.route))) for (const tag of anchors(page.html)) {
        const href = hrefOf(tag);
        if (!href) continue;
        const url = urlOf(href, page.route);
        if (url.origin !== 'https://m3mm.net') continue;
        const target = pages.find(p => p.route.replace(/\/$/, '') === url.pathname.replace(/\/$/, ''));
        if (target && !reached.has(target.route)) { reached.add(target.route); changed = true; }
      }
    }
    expect(pages.filter(p => !p.html.includes('noindex') && !reached.has(p.route)).map(p => p.route)).toEqual([]);
    // Receipt URLs remain distinct completion destinations, deliberately outside primary browsing.
    for (const route of ['/thanks/', '/start/thanks/']) expect(pages.find(p => p.route === route)?.html).toContain('noindex');
  });

  it('every page exposes primary navigation and every action link is tracked', () => {
    const errors: string[] = [];
    for (const page of pages) {
      expect(page.html, page.route).toContain('aria-label="Primary"');
      for (const tag of anchors(page.html)) {
        if (hrefOf(tag) === '#main') continue; // accessibility skip control, not a funnel CTA
        if (!tag.includes('data-cta=')) errors.push(`${page.route}: ${tag}`);
      }
    }
    expect(errors).toEqual([]);
  });
});
