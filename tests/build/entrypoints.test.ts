import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, delimiter, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const windows = process.platform === 'win32';
const bash = windows ? 'C:\\Program Files\\Git\\bin\\bash.exe' : 'bash';
const make = windows
  ? spawnSync('where.exe', ['make'], { encoding: 'utf8' }).stdout.trim().split(/\r?\n/)[0]
  : 'make';
type Call = { command: string; args: string[]; cwd: string };
type Fixture = { repo: string; caller: string; env: NodeJS.ProcessEnv; calls: () => Call[] };

// Copy only the entrypoints. Neither dependency installation nor an actual
// Wrangler invocation can occur, and child processes inherit no credentials.
function withFixture(run: (fixture: Fixture) => void) {
  const temp = mkdtempSync(join(tmpdir(), 'companysite-entrypoints-'));
  try {
    const repo = join(temp, 'repo with spaces');
    const caller = join(temp, 'unrelated caller');
    const bin = join(temp, 'stub bin');
    const log = join(temp, 'commands.jsonl');
    const npm = join(bin, 'npm-stub.cjs');
    for (const dir of [repo, caller, bin, join(repo, 'scripts'), join(repo, 'node_modules/wrangler/bin')]) {
      mkdirSync(dir, { recursive: true });
    }
    for (const file of ['build.sh', 'build.bat', 'Makefile', 'scripts/deploy-pages.mjs']) {
      copyFileSync(join(root, file), join(repo, file));
    }
    const stub = (command: string) => `
      const fs = require('node:fs');
      const args = process.argv.slice(2);
      fs.appendFileSync(process.env.ENTRYPOINT_LOG, JSON.stringify({
        command: ${JSON.stringify(command)}, args, cwd: process.cwd()
      }) + '\\n');
      if (process.env.ENTRYPOINT_FAIL === [${JSON.stringify(command)}, ...args].join(' ')) {
        process.exit(Number(process.env.ENTRYPOINT_EXIT));
      }
      if (${JSON.stringify(command)} === 'npm' && args[0] === 'run' && args[1] === 'deploy') {
        const result = require('node:child_process').spawnSync(process.execPath,
          [require('node:path').join(process.cwd(), 'scripts/deploy-pages.mjs'), ...args.slice(3)],
          { stdio: 'inherit' });
        process.exit(result.status ?? 1);
      }
    `;
    writeFileSync(npm, stub('npm'));
    writeFileSync(join(repo, 'node_modules/wrangler/bin/wrangler.js'), stub('wrangler'));
    const shellQuote = (value: string) => `'${value.replaceAll("'", "'\\''")}'`;
    writeFileSync(join(bin, 'npm'), `#!/bin/sh\nexec ${shellQuote(process.execPath.replaceAll('\\', '/'))} ${shellQuote(npm.replaceAll('\\', '/'))} "$@"\n`, { mode: 0o755 });
    writeFileSync(join(bin, 'npm.cmd'), `@echo off\r\n"${process.execPath}" "${npm}" %*\r\nexit /b %errorlevel%\r\n`);
    const env: NodeJS.ProcessEnv = {
      PATH: [bin, dirname(process.execPath), ...(windows
        ? [join(process.env.SystemRoot!, 'System32'), 'C:\\Program Files\\Git\\usr\\bin']
        : ['/usr/bin', '/bin'])].join(delimiter),
      HOME: temp, USERPROFILE: temp, TEMP: temp, TMP: temp,
      npm_execpath: npm, ENTRYPOINT_LOG: log,
    };
    for (const key of ['SystemRoot', 'WINDIR', 'COMSPEC', 'PATHEXT']) {
      if (process.env[key]) env[key] = process.env[key];
    }
    run({ repo, caller, env, calls: () => existsSync(log)
      ? readFileSync(log, 'utf8').trim().split('\n').map((line) => JSON.parse(line))
      : [] });
  } finally {
    const resolved = realpathSync(temp);
    if (dirname(resolved) !== realpathSync(tmpdir()) || !/^companysite-entrypoints-[A-Za-z0-9]+$/.test(basename(resolved))) {
      throw new Error('Refusing cleanup outside the isolated entrypoint test directory');
    }
    rmSync(resolved, { recursive: true, force: true });
  }
}

function expectCalls(fixture: Fixture, commands: string[][]) {
  const calls = fixture.calls();
  expect(calls.map(({ command, args }) => [command, ...args])).toEqual(commands);
  for (const call of calls) expect(resolve(call.cwd)).toBe(resolve(fixture.repo));
}

const buildSteps = [['npm', 'ci'], ['npm', 'run', 'build'], ['npm', 'test']];
for (const script of ['build.sh', 'build.bat']) {
  describe.skipIf(script === 'build.bat' && !windows)(script, () => {
    const launch = (fixture: Fixture) => script === 'build.sh'
      ? spawnSync(bash, [join(fixture.repo, script).replaceAll('\\', '/')], {
        cwd: fixture.caller, env: fixture.env, encoding: 'utf8', timeout: 10_000,
      })
      : spawnSync(process.env.COMSPEC || 'cmd.exe', ['/d', '/s', '/c', `""${join(fixture.repo, script)}""`], {
        cwd: fixture.caller, env: fixture.env, encoding: 'utf8', timeout: 10_000, windowsVerbatimArguments: true,
      });

    it('runs install, fenced build, and tests from its own directory before READY', () => {
      withFixture((fixture) => {
        const result = launch(fixture);
        expect(result.error).toBeUndefined();
        expect(result.status, result.stderr).toBe(0);
        expectCalls(fixture, buildSteps);
        expect(result.stdout).toContain('READY');
      });
    });

    it.each(buildSteps.map((step, index) => [step.join(' '), index] as const))('stops and propagates a failing %s', (command, index) => {
      withFixture((fixture) => {
        fixture.env.ENTRYPOINT_FAIL = command;
        fixture.env.ENTRYPOINT_EXIT = '37';
        const result = launch(fixture);
        expect(result.error).toBeUndefined();
        expect(result.status, result.stderr).toBe(37);
        expectCalls(fixture, buildSteps.slice(0, index + 1));
        expect(`${result.stdout}${result.stderr}`).not.toContain('READY');
      });
    });

    if (script === 'build.bat') {
      it.each(buildSteps.map((step, index) => [step.join(' '), index] as const))('preserves a negative Windows status from %s without READY', (command, index) => {
        withFixture((fixture) => {
          fixture.env.ENTRYPOINT_FAIL = command;
          fixture.env.ENTRYPOINT_EXIT = '-37';
          const result = launch(fixture);
          expect(result.error).toBeUndefined();
          // Node exposes the Windows DWORD as unsigned; cmd treats it as signed.
          expect(result.status! | 0, result.stderr).toBe(-37);
          expectCalls(fixture, buildSteps.slice(0, index + 1));
          expect(`${result.stdout}${result.stderr}`).not.toContain('READY');
        });
      });
    }
  });
}

describe('direct Pages deployment entrypoint', () => {
  const branch = 'preview/Fix-42.test';
  const deploySteps = [
    ['npm', 'run', 'build'], ['npm', 'test'], ['npm', 'run', 'verify:dist'],
    ['wrangler', 'pages', 'deploy', 'dist', '--project-name=m3-companysite', `--branch=${branch}`],
  ];
  const launch = (fixture: Fixture, args: string[]) => spawnSync(process.execPath, [join(fixture.repo, 'scripts/deploy-pages.mjs'), ...args], {
    cwd: fixture.caller, env: fixture.env, encoding: 'utf8', timeout: 10_000,
  });

  it.each([
    [], ['--branch'], ['--branch', ''], ['--branch', '--production'],
    ['--branch', 'has spaces'], ['--branch', 'main;echo injected'],
    ['--branch', 'main', '--project-name=other'], ['--branch=main'],
    ['--project-name', 'other'], ['--branch', 'main', '--branch', 'other'],
  ].map((args) => ({ args })))('rejects invalid arguments $args before any command', ({ args }) => {
    withFixture((fixture) => {
      const result = launch(fixture, args);
      expect(result.error).toBeUndefined();
      expect(result.status).not.toBe(0);
      expect(`${result.stdout}${result.stderr}`).toContain('Usage:');
      expectCalls(fixture, []);
    });
  });

  it('shows help without running gates or uploading', () => {
    withFixture((fixture) => {
      const result = launch(fixture, ['--help']);
      expect(result.error).toBeUndefined();
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Usage:');
      expectCalls(fixture, []);
    });
  });

  it('requires a value for the explicit Make bridge', () => {
    withFixture((fixture) => {
      const result = launch(fixture, ['--from-make']);
      expect(result.error).toBeUndefined();
      expect(result.status).toBe(1);
      expectCalls(fixture, []);
    });
  });

  it('does not treat an ambient Make branch as ordinary invocation authorization', () => {
    withFixture((fixture) => {
      fixture.env.COMPANYSITE_DEPLOY_BRANCH = 'main';
      const result = launch(fixture, []);
      expect(result.error).toBeUndefined();
      expect(result.status).toBe(1);
      expectCalls(fixture, []);
    });
  });

  it.each([branch, 'main'])('gates upload and preserves explicit branch %s from an unrelated cwd', (target) => {
    withFixture((fixture) => {
      const result = launch(fixture, ['--branch', target]);
      expect(result.error).toBeUndefined();
      expect(result.status, result.stderr).toBe(0);
      expectCalls(fixture, [...deploySteps.slice(0, -1), [...deploySteps[3].slice(0, -1), `--branch=${target}`]]);
    });
  });

  it.each(deploySteps.map((step, index) => [step.join(' '), index] as const))('propagates failure and stops after %s', (command, index) => {
    withFixture((fixture) => {
      fixture.env.ENTRYPOINT_FAIL = command;
      fixture.env.ENTRYPOINT_EXIT = '43';
      const result = launch(fixture, ['--branch', branch]);
      expect(result.error).toBeUndefined();
      expect(result.status, result.stderr).toBe(43);
      expectCalls(fixture, deploySteps.slice(0, index + 1));
      expect(`${result.stdout}${result.stderr}`).not.toContain('READY');
    });
  });

  describe('GNU Make deployment alias', () => {
    const dispatch = ['npm', 'run', 'deploy', '--', '--from-make'];
    const launchMake = (fixture: Fixture, target?: string) => spawnSync(make,
      ['-C', fixture.repo, 'deploy', ...(target === undefined ? [] : [`BRANCH=${target}`])], {
        cwd: fixture.caller, env: fixture.env, encoding: 'utf8', timeout: 10_000,
      });

    it('forwards the exact explicit branch through the checked deploy entrypoint', () => {
      withFixture((fixture) => {
        const result = launchMake(fixture, branch);
        expect(result.error).toBeUndefined();
        expect(result.status, `${result.stdout}${result.stderr}`).toBe(0);
        expectCalls(fixture, [dispatch, ...deploySteps]);
      });
    });

    it('rejects a missing BRANCH before gates or upload', () => {
      withFixture((fixture) => {
        const result = launchMake(fixture);
        expect(result.error).toBeUndefined();
        expect(result.status).not.toBe(0);
        expect(`${result.stdout}${result.stderr}`).toContain('Usage:');
        expectCalls(fixture, [dispatch]);
      });
    });

    it.each([
      'preview"; echo injected > make-injected.txt; #',
      'preview" & echo injected > make-injected.txt & rem "',
      'preview$(shell echo injected > make-injected.txt)',
      'preview$(echo injected > make-injected.txt)',
      'preview`echo injected > make-injected.txt`',
    ])('rejects the literal malicious branch %s without executing its commands', (target) => {
      withFixture((fixture) => {
        const result = launchMake(fixture, target);
        expect(result.error).toBeUndefined();
        expect(result.status).not.toBe(0);
        expect(`${result.stdout}${result.stderr}`).toContain('Usage:');
        expectCalls(fixture, [dispatch]);
        expect(existsSync(join(fixture.repo, 'make-injected.txt'))).toBe(false);
        expect(existsSync(join(fixture.caller, 'make-injected.txt'))).toBe(false);
      });
    });
  });
});
