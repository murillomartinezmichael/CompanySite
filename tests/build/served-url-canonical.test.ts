import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { servedPath } from '../../src/lib/servedUrl';

// Cloudflare Pages serves dist/<route>/index.html at /<route>/ and answers
// /<route> with a 308 to the slash form (verified live 2026-11-27:
// `curl -I https://m3mm.net/about` -> 308 Location https://m3mm.net/about/).
// A canonical / og:url that points at the redirecting form tells crawlers the
// preferred URL is one that never returns 200.
const dist = fileURLToPath(new URL('../../dist/', import.meta.url));

function pages(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) return pages(abs);
    return name === 'index.html' ? [abs] : [];
  });
}

describe('servedPath', () => {
  it('maps directory routes to the URL Pages serves with 200', () => {
    expect(servedPath('/')).toBe('/');
    expect(servedPath('/about')).toBe('/about/');
    expect(servedPath('/for/hvac')).toBe('/for/hvac/');
    expect(servedPath('/about/')).toBe('/about/');
    expect(servedPath('/404')).toBe('/404');
    expect(servedPath('/sitemap.xml')).toBe('/sitemap.xml');
  });
});

describe('built canonical + og:url', () => {
  const files = pages(dist).filter((f) => !/\/(workspace|investors|samples)\//.test(f));

  it('finds the public pages', () => expect(files.length).toBeGreaterThan(40));

  for (const file of files) {
    const route = '/' + relative(dist, file).replace(/\\/g, '/').replace(/index\.html$/, '');
    it(`${route} canonical is the served (trailing-slash) URL`, () => {
      const html = readFileSync(file, 'utf8');
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
      const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
      expect(canonical).toBe(`https://m3mm.net${route}`);
      expect(ogUrl).toBe(canonical);
    });
  }
});
