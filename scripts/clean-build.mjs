#!/usr/bin/env node
// Only generated build output; validate every target before removing anything.
import { lstatSync, readdirSync, realpathSync, rmSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = realpathSync(fileURLToPath(new URL('../', import.meta.url)));

function validateTree(target) {
  const within = relative(root, target);
  if (!within || isAbsolute(within) || within === '..' || within.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`)) {
    throw new Error('Cleanup target is outside the repository');
  }
  const stat = lstatSync(target);
  if (stat.isSymbolicLink()) throw new Error(`Refusing linked cleanup path: ${within}`);
  if (realpathSync(target) !== resolve(target)) throw new Error(`Refusing redirected cleanup path: ${within}`);
  if (stat.isDirectory()) {
    for (const name of readdirSync(target)) validateTree(join(target, name));
  }
}

try {
  if (process.argv.length !== 2) throw new Error('Usage: node scripts/clean-build.mjs');
  const targets = [];
  for (const name of ['dist', '.astro']) {
    const target = resolve(root, name);
    let stat;
    try {
      stat = lstatSync(target);
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      throw new Error(`Refusing cleanup target that is not an ordinary directory: ${name}`);
    }
    validateTree(target);
    targets.push(target);
  }
  for (const target of targets) rmSync(target, { recursive: true, force: true });
  console.log('Cleaned generated dist and .astro output.');
} catch (error) {
  console.error(`Cleanup stopped: ${error.message}`);
  process.exitCode = 1;
}
