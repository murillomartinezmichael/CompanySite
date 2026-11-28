#!/usr/bin/env node
/**
 * check-internal-links.mjs — fail the build when a built page links to a
 * same-site path that nothing serves.
 *
 * The only link check was CI's lychee job: it runs on source files (not the
 * built site), with continue-on-error, so it never blocked anything, and
 * Cloudflare Pages runs only `npm run build`. This runs inside verify:dist.
 *
 * A root-relative href/src/srcset target passes when dist has the file, the
 * directory's index.html, or a public/_redirects rule for it. /api/* (Pages
 * Functions) and /cdn-cgi/* (Cloudflare) are not static and are skipped.
 *
 * Usage: node scripts/check-internal-links.mjs [distDir]   (default: dist)
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const SKIP = /^\/(?:api|cdn-cgi)(?:\/|$)/;

export function linkTargets(html) {
  const targets = [];
  for (const m of html.matchAll(/\s(href|src|srcset)\s*=\s*"([^"]*)"/gi)) {
    const values = m[1].toLowerCase() === 'srcset' ? m[2].split(',').map((c) => c.trim().split(/\s+/)[0]) : [m[2]];
    for (const raw of values) {
      const value = raw.replace(/&amp;/g, '&').trim();
      if (value.startsWith('/') && !value.startsWith('//')) targets.push(value);
    }
  }
  return targets;
}

export function redirectSources(text) {
  return new Set(text.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => l.split(/\s+/)[0]));
}

export function resolves(dist, target, redirects) {
  let path = target.split(/[?#]/)[0];
  try { path = decodeURIComponent(path); } catch { return false; }
  if (path === '' || SKIP.test(path)) return true;
  if (redirects.has(path) || redirects.has(path.replace(/\/$/, ''))) return true;
  const file = join(dist, path);
  if (!file.startsWith(join(dist, '/')) && file !== dist) return false;
  if (existsSync(file) && statSync(file).isFile()) return true;
  return existsSync(join(file, 'index.html')) || existsSync(`${file}.html`);
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    return e.isDirectory() ? htmlFiles(full) : /\.html?$/i.test(e.name) ? [full] : [];
  });
}

export function brokenLinks(dist) {
  const redirectsPath = join(dist, '_redirects');
  const redirects = existsSync(redirectsPath) ? redirectSources(readFileSync(redirectsPath, 'utf8')) : new Set();
  const broken = [];
  for (const file of htmlFiles(dist)) {
    for (const target of new Set(linkTargets(readFileSync(file, 'utf8')))) {
      if (!resolves(dist, target, redirects)) broken.push({ page: relative(dist, file).replace(/\\/g, '/'), target });
    }
  }
  return broken;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dist = process.argv[2] ?? 'dist';
  if (!existsSync(dist)) {
    console.error(`check-internal-links: '${dist}' not found — run \`npm run build\` first.`);
    process.exitCode = 1;
  } else {
    const broken = brokenLinks(dist);
    if (broken.length === 0) console.log('check-internal-links: clean — every same-site link resolves');
    else {
      console.error(`\ncheck-internal-links: BUILD BLOCKED — ${broken.length} broken same-site link(s)\n`);
      for (const { page, target } of broken.slice(0, 50)) console.error(`  ${page} -> ${target}`);
      process.exitCode = 1;
    }
  }
}
