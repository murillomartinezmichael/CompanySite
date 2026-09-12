#!/usr/bin/env node
// Supported direct-upload path. No network command runs before all local gates.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
// Make exports the literal value instead of interpolating it into shell code.
// This explicit bridge still requires a target and uses the same validation.
if (args.length === 1 && args[0] === '--from-make') {
  args.splice(0, 1, '--branch', process.env.COMPANYSITE_DEPLOY_BRANCH ?? '');
}
const usage = 'Usage: npm run deploy -- --branch <target-branch> (main publishes production)';

function run() {
  if (args.length === 1 && args[0] === '--help') {
    console.log(usage);
    return 0;
  }
  if (args.length !== 2 || args[0] !== '--branch' || !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(args[1])) {
    console.error(usage);
    return 1;
  }
  const npmCli = process.env.npm_execpath;
  const wrangler = join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
  if (!npmCli || !existsSync(npmCli) || !existsSync(wrangler)) {
    console.error('Install dependencies with npm ci, then use npm run deploy.');
    return 1;
  }
  const steps = [
    [npmCli, 'run', 'build'],
    [npmCli, 'test'],
    [npmCli, 'run', 'verify:dist'],
    [wrangler, 'pages', 'deploy', 'dist', '--project-name=m3-companysite', `--branch=${args[1]}`],
  ];
  for (const step of steps) {
    const result = spawnSync(process.execPath, step, { cwd: root, stdio: 'inherit' });
    if (result.error || result.signal || result.status !== 0) {
      console.error('Deployment stopped: a required command failed.');
      return result.status || 1;
    }
  }
  return 0;
}

process.exitCode = run();
