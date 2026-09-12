import { describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// @ts-expect-error -- plain build script without type declarations
import { scanDir, scanText } from '../../scripts/check-shipped-placeholders.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const inTempDir = (run: (dir: string) => void) => {
  const dir = mkdtempSync(join(tmpdir(), 'scanner-diagnostics-'));
  try {
    run(dir);
  } finally {
    const resolved = realpathSync(dir);
    if (dirname(resolved) !== realpathSync(tmpdir()) || !/^scanner-diagnostics-[A-Za-z0-9]+$/.test(basename(resolved))) {
      throw new Error('Refusing cleanup outside the isolated scanner test directory');
    }
    rmSync(resolved, { recursive: true, force: true });
  }
};

describe('scanner diagnostics never echo key material from overlapping rules', () => {
  const prefixes = ['sk_live_', 'sk_test_', 'rk_live_', 'rk_test_', 'pk_test_'];
  const runCli = (dir: string) => spawnSync(process.execPath, [join(root, 'scripts/check-shipped-placeholders.mjs'), dir], {
    encoding: 'utf8', timeout: 10_000,
  });
  const assertRedacted = (output: string, secret: string) => {
    expect(output).not.toContain(secret);
    expect(output).not.toContain('Synthetic9_suffix123');
    expect(output).not.toContain('Synthetic9');
    expect(output).not.toContain('suffix123');
    expect(output).toContain('[redacted,');
  };

  it.each(prefixes)('redacts %s inside every overlapping finding', (prefix) => {
    const secret = `${prefix}Synthetic9_suffix123`;
    const findings = scanText(`<a href="https://buy.stripe.com/abcdefghij?key=${secret}">Pay</a>
      <a href="https://example.com/?key=${secret}">Contact</a>`);
    expect(findings.map((f: { rule: string }) => f.rule)).toEqual(expect.arrayContaining([
      'dead-stripe-link', 'example-contact-target', 'stripe-key-material',
    ]));
    assertRedacted(JSON.stringify(findings), secret);
    expect(findings[0].samples[0]).toContain('https://buy.stripe.com/abcdefghij?key=');
  });

  it('redacts multiple embedded keys without losing the placeholder finding', () => {
    const secrets = prefixes.map((prefix) => `${prefix}Synthetic9_suffix123`);
    const findings = scanText(`<a href="https://example.com/?keys=${secrets.join(',')}">Contact</a>`);
    for (const secret of secrets) assertRedacted(JSON.stringify(findings), secret);
    expect(findings.map((f: { rule: string }) => f.rule)).toContain('example-contact-target');
  });

  it('CLI: blocks overlapping content and redacts both streams, including the file name', () => {
    const secret = 'sk_live_Synthetic9_suffix123';
    inTempDir((dir) => {
      writeFileSync(join(dir, `${secret}.md`), `https://buy.stripe.com/abcdefghij?key=${secret}`);
      assertRedacted(JSON.stringify(scanDir(dir)), secret);
      const cli = runCli(dir);
      expect(cli.error).toBeUndefined();
      expect(cli.status).toBe(1);
      const output = `${cli.stdout}${cli.stderr}`;
      assertRedacted(output, secret);
      expect(output).toContain('BUILD BLOCKED');
      expect(output).toContain('dead-stripe-link');
      expect(output).toContain('shipped-markdown');
    });
  });

  it.each(['clean', 'missing', 'filesystem error'])('CLI: redacts the %s directory diagnostic', (scenario) => {
    const secret = 'rk_test_Synthetic9_suffix123';
    inTempDir((dir) => {
      const target = join(dir, secret);
      if (scenario === 'clean') mkdirSync(target);
      if (scenario === 'filesystem error') writeFileSync(target, 'ordinary text');
      const cli = runCli(target);
      expect(cli.error).toBeUndefined();
      expect(cli.status).toBe(scenario === 'clean' ? 0 : 1);
      assertRedacted(`${cli.stdout}${cli.stderr}`, secret);
    });
  });
});
