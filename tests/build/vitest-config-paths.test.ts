import { describe, expect, it } from 'vitest';
import { copyFileSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// The '@' alias must be a filesystem path, not a URL pathname. A URL pathname
// percent-encodes spaces ("cs%20space") and on Windows yields "/C:/...", so
// any checkout under such a directory failed every suite that imports
// src/lib/prefill.ts ("Cannot find package '@/lib/track'", reproduced
// 2026-11-27 in a worktree named "cs space probe").
const root = fileURLToPath(new URL('../../', import.meta.url));

describe('vitest.config.ts path handling', () => {
  it('resolves the @ alias correctly from a directory containing a space', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'cs alias probe '));
    try {
      copyFileSync(join(root, 'vitest.config.ts'), join(dir, 'vitest.config.ts'));
      symlinkSync(join(root, 'node_modules'), join(dir, 'node_modules'), 'junction');
      const { default: config } = await import(pathToFileURL(join(dir, 'vitest.config.ts')).href);
      expect(config.resolve.alias['@']).toBe(join(dir, 'src'));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
