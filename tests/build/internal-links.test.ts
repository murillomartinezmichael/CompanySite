import { describe, expect, it } from 'vitest';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-expect-error — plain .mjs build script, no type declarations
import { brokenLinks, linkTargets } from '../../scripts/check-internal-links.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));

function site(files: Record<string, string>, run: (dir: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), 'cs-links-'));
  try {
    for (const [name, body] of Object.entries(files)) {
      mkdirSync(join(dir, name, '..'), { recursive: true });
      writeFileSync(join(dir, name), body);
    }
    run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('check-internal-links', () => {
  it('extracts root-relative href/src/srcset targets only', () => {
    const html = '<a href="/a/">x</a><a href="https://x.test/">x</a><a href="//cdn.test/x">x</a><img src="/i.png" srcset="/i-1.png 1x, /i-2.png 2x"><a href="#top">x</a>';
    expect(linkTargets(html)).toEqual(['/a/', '/i.png', '/i-1.png', '/i-2.png']);
  });

  it('accepts files, directory index pages, redirects, /api and query/fragment suffixes', () => {
    site({
      'index.html': '<a href="/about/">a</a><a href="/og.png?v=1">b</a><a href="/review">c</a><a href="/api/lead">d</a><a href="/about/#team">e</a>',
      'about/index.html': '',
      'og.png': '',
      _redirects: '/review /audit/ 301\n',
    }, (dir) => expect(brokenLinks(dir)).toEqual([]));
  });

  it('reports a link to a page that does not exist', () => {
    site({ 'index.html': '<a href="/pricing/">p</a>' }, (dir) =>
      expect(brokenLinks(dir)).toEqual([{ page: 'index.html', target: '/pricing/' }]));
  });

  it('runs as part of verify:dist, so `npm run build` (the Cloudflare build) enforces it', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    expect(pkg.scripts['verify:dist']).toContain('scripts/check-internal-links.mjs dist');
    expect(pkg.scripts.build).toContain('npm run verify:dist');
  });

  it.skipIf(!existsSync(join(root, 'dist/index.html')))('CLI blocks a built site with a broken link (needs `npm run build`)', () => {
    const copy = mkdtempSync(join(tmpdir(), 'cs-links-dist-'));
    try {
      cpSync(join(root, 'dist'), copy, { recursive: true });
      const clean = spawnSync(process.execPath, [join(root, 'scripts/check-internal-links.mjs'), copy], { encoding: 'utf8' });
      expect(clean.status, clean.stderr).toBe(0);
      writeFileSync(join(copy, 'index.html'), readFileSync(join(copy, 'index.html'), 'utf8').replace('</body>', '<a href="/no-such-page/">x</a></body>'));
      const broken = spawnSync(process.execPath, [join(root, 'scripts/check-internal-links.mjs'), copy], { encoding: 'utf8' });
      expect(broken.status).toBe(1);
      expect(broken.stderr).toContain('index.html -> /no-such-page/');
    } finally {
      rmSync(copy, { recursive: true, force: true });
    }
  });
});
