import { describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-expect-error — plain .mjs build script, no type declarations by design
import { scanDir, scanFileName } from '../../scripts/check-shipped-placeholders.mjs';

// public/og.png.bak-2026-08-24 and og-websites.png.bak-2026-08-24 shipped to
// dist/ and served live (curl https://m3mm.net/og.png.bak-2026-08-24 -> 200,
// application/octet-stream, 2026-11-27). The fence never saw them: file-name
// rules only ran on "scannable" text extensions, and ".bak-2026-08-24" is not one.
const rules = (name: string) => scanFileName(name).map((f: { rule: string }) => f.rule);

describe('shipped backup / editor artifacts', () => {
  it.each(['og.png.bak-2026-08-24', 'og.png.bak', 'index.html.orig', 'app.js~', '.index.html.swp', 'site.old'])(
    'flags %s',
    (name) => expect(rules(name)).toContain('shipped-backup-file'),
  );

  it.each(['og.png', 'index.html', 'backup-guide.html', 'bakery.svg', '_headers', 'resume.pdf'])('leaves %s alone', (name) =>
    expect(rules(name)).toEqual([]),
  );

  it('scanDir checks the name of non-text files too', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cs-backup-'));
    try {
      writeFileSync(join(dir, 'og.png'), Buffer.from([0x89, 0x50]));
      writeFileSync(join(dir, 'og.png.bak-2026-08-24'), Buffer.from([0x89, 0x50]));
      const results = scanDir(dir);
      expect(results.map((r: { file: string }) => r.file)).toEqual(['og.png.bak-2026-08-24']);
      expect(results[0].findings[0].rule).toBe('shipped-backup-file');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
