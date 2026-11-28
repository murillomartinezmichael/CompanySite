import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PUBLIC_PROJECTS } from '../../src/config/public-projects';

const dist = fileURLToPath(new URL('../../dist/', import.meta.url));
const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
const pages = walk(dist).filter(p => p.endsWith('.html')).map(file => ({
  file,
  route: '/' + relative(dist, file).replace(/\\/g, '/').replace(/index\.html$/, ''),
  html: readFileSync(file, 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ''),
}));
// Product samples (e.g. a Teardown report) are standalone copies of the product's output (see
// sample-report-contrast.test.ts for the a11y values they must keep):
// no site chrome, served noindex by public/_headers, pinned by the last test below.
const isSample = (route: string) => route.startsWith('/samples/');
const anchors = (html: string) => [...html.matchAll(/<a\b[^>]*>/g)].map(m => m[0]);
const hrefOf = (tag: string) => tag.match(/\bhref="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&');
const urlOf = (href: string, route: string) => new URL(href, 'https://m3mm.net' + route);
// Exact `id` attributes only: the leading whitespace keeps `data-id="x"` from counting as `id="x"`.
const idsOf = (html: string) => new Set([...html.matchAll(/\sid=(?:"([^"]*)"|'([^']*)')/g)].map(m => m[1] ?? m[2]));

describe('rendered site structure', () => {
  it('fragment lookup matches exact id attributes, not data-id', () => {
    expect(idsOf('<section data-id="intake"></section>').has('intake')).toBe(false);
    expect(idsOf('<section id="intake"></section>').has('intake')).toBe(true);
    expect(idsOf("<div class=\"x\" id='proof'></div>").has('proof')).toBe(true);
  });

  it.each(['/services', '/audit'])('marks only exact primary navigation matches on %s', route => {
    const page = pages.find(p => p.route === route + '/');
    const nav = page?.html.match(/<nav\b[^>]*aria-label="Primary"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    expect(nav).toBeDefined();
    const links = anchors(nav!);
    const current = links.filter(tag => tag.includes('aria-current="page"'));
    expect(current.map(hrefOf)).toEqual(route === '/services' ? ['/services'] : []);
    expect(links.filter(tag => tag.includes('data-active-section')).map(hrefOf)).toEqual(['/services']);
  });

  it('hides project filters and shows all project rows before JavaScript runs', () => {
    const html = pages.find(page => page.route === '/projects/')!.html;
    const controls = html.match(/<div\b[^>]*class="m3-filter"[^>]*>/)?.[0];
    expect(controls).toMatch(/\shidden(?=[\s=>])/);
    const rows = html.match(/<article\b[^>]*\sdata-project-row\b[^>]*>/g) ?? [];
    expect(rows).toHaveLength(PUBLIC_PROJECTS.length);
    for (const row of rows) expect(row).not.toMatch(/\shidden(?=[\s=>])/);
  });

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
      } else if (url.hash && !idsOf(target.html).has(decodeURIComponent(url.hash.slice(1)))) {
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
    expect(pages.filter(p => !p.html.includes('noindex') && !isSample(p.route) && !reached.has(p.route)).map(p => p.route)).toEqual([]);
    // Receipt URLs remain distinct completion destinations, deliberately outside primary browsing.
    for (const route of ['/thanks/', '/start/thanks/']) expect(pages.find(p => p.route === route)?.html).toContain('noindex');
  });

  it('every page exposes primary navigation and every action link is tracked', () => {
    const errors: string[] = [];
    for (const page of pages) {
      if (isSample(page.route)) continue;
      if(/^\/(workspace|investors)(\/|$)/.test(page.route)){expect(page.html,page.route).toContain('aria-label="Private workspace"');expect(page.html,page.route).toContain('noindex');expect(readFileSync(page.file,'utf8')).not.toContain('/api/track');expect(readFileSync(page.file,'utf8')).not.toContain('chat-widget');continue;}
      expect(page.html, page.route).toContain('aria-label="Primary"');
      for (const tag of anchors(page.html)) {
        if (hrefOf(tag) === '#main') continue; // accessibility skip control, not a funnel CTA
        if (!tag.includes('data-cta=')) errors.push(`${page.route}: ${tag}`);
      }
    }
    expect(errors).toEqual([]);
  });

  it('product samples are standalone, script-free and served noindex', () => {
    const samples = pages.filter(p => isSample(p.route));
    expect(samples.map(p => p.route)).toContain('/samples/teardown-report.html');
    for (const type of ['local', 'professional', 'health', 'venue']) {
      expect(samples.map(p => p.route)).toContain(`/samples/teardown-${type}.html`);
    }
    for (const page of samples) {
      const raw = readFileSync(page.file, 'utf8');
      expect(raw, page.route).not.toMatch(/<script\b/i);
      expect(raw, page.route).not.toContain('/api/track');
    }
    const headers = readFileSync(fileURLToPath(new URL('../../public/_headers', import.meta.url)), 'utf8');
    expect(headers).toMatch(/^\/samples\/\*\n(?:[ \t]+.*\n)*?[ \t]+X-Robots-Tag: noindex/m);
  });
});
