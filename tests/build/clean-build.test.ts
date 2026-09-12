import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, delimiter, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const windows = process.platform === 'win32';
const make = windows
  ? spawnSync('where.exe', ['make'], { encoding: 'utf8' }).stdout.trim().split(/\r?\n/)[0]
  : 'make';

function fixture(run: (repo: string, caller: string, env: NodeJS.ProcessEnv) => void) {
  const temp = mkdtempSync(join(tmpdir(), 'companysite-clean-build-'));
  try {
    const repo = join(temp, 'repo with spaces');
    const caller = join(temp, 'unrelated caller');
    const bin = join(temp, 'bin');
    for (const name of ['scripts', 'src', 'node_modules']) mkdirSync(join(repo, name), { recursive: true });
    mkdirSync(caller);
    mkdirSync(bin);
    copyFileSync(join(root, 'scripts/clean-build.mjs'), join(repo, 'scripts/clean-build.mjs'));
    copyFileSync(join(root, 'Makefile'), join(repo, 'Makefile'));
    writeFileSync(join(repo, 'src/keep.txt'), 'source');
    writeFileSync(join(repo, 'node_modules/keep.txt'), 'dependency');
    writeFileSync(join(caller, 'keep.txt'), 'outside');
    const npm = join(bin, 'npm.cjs');
    writeFileSync(npm, `require('node:fs').writeFileSync(process.env.CLEAN_TEST_LOG, JSON.stringify(process.argv.slice(2))); process.exit(Number(process.env.CLEAN_TEST_EXIT || 0));`);
    const quote = (value: string) => `'${value.replaceAll("'", "'\\''")}'`;
    writeFileSync(join(bin, 'npm'), `#!/bin/sh\nexec ${quote(process.execPath.replaceAll('\\', '/'))} ${quote(npm.replaceAll('\\', '/'))} "$@"\n`, { mode: 0o755 });
    writeFileSync(join(bin, 'npm.cmd'), `@echo off\r\n"${process.execPath}" "${npm}" %*\r\nexit /b %errorlevel%\r\n`);
    const env: NodeJS.ProcessEnv = {
      PATH: [bin, dirname(process.execPath), ...(windows
        ? [join(process.env.SystemRoot!, 'System32'), 'C:\\Program Files\\Git\\usr\\bin']
        : ['/usr/bin', '/bin'])].join(delimiter),
      HOME: temp, USERPROFILE: temp, TEMP: temp, TMP: temp, CLEAN_TEST_LOG: join(temp, 'npm.json'),
    };
    for (const key of ['SystemRoot', 'SystemDrive', 'WINDIR', 'COMSPEC', 'PATHEXT']) {
      if (process.env[key]) env[key] = process.env[key];
    }
    run(repo, caller, env);
  } finally {
    const resolved = realpathSync(temp);
    if (dirname(resolved) !== realpathSync(tmpdir()) || !/^companysite-clean-build-[A-Za-z0-9]+$/.test(basename(resolved))) {
      throw new Error('Refusing cleanup outside the isolated cleanup test directory');
    }
    rmSync(resolved, { recursive: true, force: true });
  }
}

function output(repo: string, name: string) {
  mkdirSync(join(repo, name, 'nested'), { recursive: true });
  writeFileSync(join(repo, name, 'nested/output.txt'), 'generated');
}

function retained(repo: string, caller: string) {
  expect(readFileSync(join(repo, 'src/keep.txt'), 'utf8')).toBe('source');
  expect(readFileSync(join(repo, 'node_modules/keep.txt'), 'utf8')).toBe('dependency');
  expect(readFileSync(join(caller, 'keep.txt'), 'utf8')).toBe('outside');
}

const clean = (repo: string, caller: string, env: NodeJS.ProcessEnv, args: string[] = []) => spawnSync(
  process.execPath, [join(repo, 'scripts/clean-build.mjs'), ...args],
  { cwd: caller, env, encoding: 'utf8', timeout: 10_000 },
);

describe('bounded build cleanup', () => {
  it('removes only its own generated directories from an unrelated caller and is repeatable', () => {
    fixture((repo, caller, env) => {
      output(repo, 'dist');
      output(repo, '.astro');
      output(caller, 'dist');
      for (let attempt = 0; attempt < 2; attempt++) {
        const result = clean(repo, caller, env);
        expect(result.error).toBeUndefined();
        expect(result.status, result.stderr).toBe(0);
      }
      expect(existsSync(join(repo, 'dist'))).toBe(false);
      expect(existsSync(join(repo, '.astro'))).toBe(false);
      expect(existsSync(join(caller, 'dist/nested/output.txt'))).toBe(true);
      retained(repo, caller);
    });
  });

  it.each(['dist', '.astro', '.astro/linked-child'])('refuses linked %s before deleting any output', (target) => {
    fixture((repo, caller, env) => {
      output(repo, target === 'dist' ? '.astro' : 'dist');
      if (target.includes('/')) mkdirSync(join(repo, '.astro'));
      symlinkSync(caller, join(repo, target), windows ? 'junction' : 'dir');
      const result = clean(repo, caller, env);
      expect(result.error).toBeUndefined();
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('Cleanup stopped:');
      expect(existsSync(join(repo, target === 'dist' ? '.astro' : 'dist', 'nested/output.txt'))).toBe(true);
      retained(repo, caller);
    });
  });

  it('refuses an unexpected file target before deleting an earlier valid output', () => {
    fixture((repo, caller, env) => {
      output(repo, 'dist');
      writeFileSync(join(repo, '.astro'), 'not a generated directory');
      const result = clean(repo, caller, env);
      expect(result.status).toBe(1);
      expect(existsSync(join(repo, 'dist/nested/output.txt'))).toBe(true);
      expect(readFileSync(join(repo, '.astro'), 'utf8')).toBe('not a generated directory');
      retained(repo, caller);
    });
  });

  it('rejects caller-supplied cleanup paths', () => {
    fixture((repo, caller, env) => {
      output(repo, 'dist');
      expect(clean(repo, caller, env, [caller]).status).toBe(1);
      expect(existsSync(join(repo, 'dist/nested/output.txt'))).toBe(true);
      retained(repo, caller);
    });
  });

  it('runs cleanup through the actual Make alias in an isolated repository', () => {
    fixture((repo, caller, env) => {
      output(repo, 'dist');
      output(repo, '.astro');
      const result = spawnSync(make, ['-C', repo, 'clean'], { cwd: caller, env, encoding: 'utf8', timeout: 10_000 });
      expect(result.error).toBeUndefined();
      expect(result.status, result.stderr).toBe(0);
      expect(existsSync(join(repo, 'dist'))).toBe(false);
      expect(existsSync(join(repo, '.astro'))).toBe(false);
      retained(repo, caller);
    });
  });

  it.each([0, 31])('Make lint invokes Astro diagnostics and respects npm exit %i', (status) => {
    fixture((repo, caller, env) => {
      env.CLEAN_TEST_EXIT = String(status);
      const result = spawnSync(make, ['-C', repo, 'lint'], { cwd: caller, env, encoding: 'utf8', timeout: 10_000 });
      expect(result.error).toBeUndefined();
      expect(result.status === 0).toBe(status === 0);
      expect(JSON.parse(readFileSync(env.CLEAN_TEST_LOG!, 'utf8'))).toEqual(['exec', '--', 'astro', 'check']);
      retained(repo, caller);
    });
  });
});
