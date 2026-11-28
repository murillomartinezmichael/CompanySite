import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// `Cache-Control: ... immutable` with a one-year max-age is only correct for a
// URL whose name changes when its bytes change. A file under such a rule with
// a fixed name (public/fonts/inter-latin.woff2) stays stale in returning
// visitors' caches for a year after it is replaced.
const root = fileURLToPath(new URL('../../', import.meta.url));
const dist = join(root, 'dist');
// Vite/Astro content hashes: an 8+ char [A-Za-z0-9_-] segment before the
// extension (images add a variant suffix: name.kutUx4fe_15cg4c.webp).
const HASHED = /\.[A-Za-z0-9_-]{8,}\.[a-z0-9]+$/i;

function immutablePatterns(headers: string): string[] {
  const patterns: string[] = [];
  let current = '';
  for (const line of headers.split('\n')) {
    if (/^\S/.test(line)) current = line.trim();
    else if (/cache-control:.*immutable/i.test(line)) patterns.push(current);
  }
  return patterns;
}

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? files(full) : [full];
  });
}

describe.skipIf(!existsSync(join(dist, '_headers')))('immutable caching in built dist (needs `npm run build` first)', () => {
  const patterns = immutablePatterns(readFileSync(join(dist, '_headers'), 'utf8'));

  it('caches hashed build assets immutably', () => {
    expect(patterns).toContain('/_astro/*');
  });

  it('marks only content-hashed files immutable', () => {
    const offenders: string[] = [];
    for (const pattern of patterns) {
      expect(pattern, `unsupported pattern ${pattern}`).toMatch(/^\/[\w-]+\/\*$/);
      const dir = join(dist, pattern.slice(1, -2));
      if (!existsSync(dir)) continue;
      for (const file of files(dir)) if (!HASHED.test(file)) offenders.push(`${pattern}: /${relative(dist, file).replace(/\\/g, '/')}`);
    }
    expect(offenders).toEqual([]);
  });
});
