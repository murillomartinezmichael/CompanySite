#!/usr/bin/env node
/**
 * csp-script-hashes.mjs — replace script-src 'unsafe-inline' in the BUILT
 * dist/_headers with the sha256 hash of every inline script the built pages
 * actually ship.
 *
 * Why: public/_headers allowed `script-src 'self' 'unsafe-inline'`, so any
 * injected inline script would execute. The site ships only a handful of
 * distinct inline scripts (13 across 72 pages on 2026-11-27), all static
 * output of `astro build`, so exact hashes cover them and nothing else.
 * Runs after `astro build` and before verify:dist; public/_headers keeps the
 * readable source policy and only the deployed copy is rewritten.
 *
 * Usage: node scripts/csp-script-hashes.mjs [distDir]   (default: dist)
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Script types a browser executes (and CSP therefore governs). Data blocks
// such as application/ld+json are never executed and need no hash.
const EXECUTABLE_TYPES = new Set(['', 'module', 'text/javascript', 'application/javascript']);
// Cloudflare Pages rejects longer header values; fail the build, not the deploy.
export const MAX_HEADER_LINE = 2000;

export function inlineScriptHashes(html) {
  const hashes = new Set();
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const attrs = match[1];
    if (/\ssrc\s*=/i.test(attrs)) continue;
    const type = (attrs.match(/\stype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i) ?? []).slice(1).find((v) => v !== undefined) ?? '';
    if (!EXECUTABLE_TYPES.has(type.trim().toLowerCase())) continue;
    hashes.add(`'sha256-${createHash('sha256').update(match[2], 'utf8').digest('base64')}'`);
  }
  return hashes;
}

export function applyScriptHashes(headersText, hashes) {
  let rewritten = 0;
  const out = headersText.split('\n').map((line) => {
    const m = line.match(/^(\s*Content-Security-Policy:\s*)(.*)$/i);
    if (!m) return line;
    const directives = m[2].split(';').map((d) => d.trim()).filter(Boolean);
    const index = directives.findIndex((d) => /^script-src\s/i.test(d));
    if (index === -1) throw new Error('Content-Security-Policy has no script-src directive');
    const sources = directives[index].split(/\s+/).slice(1).filter((s) => s !== "'unsafe-inline'" && !/^'sha256-/.test(s));
    directives[index] = ['script-src', ...sources, ...[...hashes].sort()].join(' ');
    rewritten++;
    const result = `${m[1]}${directives.join('; ')}`;
    if (result.length > MAX_HEADER_LINE) throw new Error(`Content-Security-Policy line is ${result.length} chars (limit ${MAX_HEADER_LINE})`);
    return result;
  });
  if (rewritten === 0) throw new Error('no Content-Security-Policy header found');
  return out.join('\n');
}

export function collectHtml(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectHtml(full));
    else if (/\.html?$/i.test(entry.name)) files.push(full);
  }
  return files;
}

export function hashDist(dist) {
  const hashes = new Set();
  for (const file of collectHtml(dist)) for (const h of inlineScriptHashes(readFileSync(file, 'utf8'))) hashes.add(h);
  const headersPath = join(dist, '_headers');
  writeFileSync(headersPath, applyScriptHashes(readFileSync(headersPath, 'utf8'), hashes));
  return hashes.size;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const count = hashDist(process.argv[2] ?? 'dist');
    console.log(`csp-script-hashes: script-src now allows ${count} inline script hash(es), no 'unsafe-inline'`);
  } catch (error) {
    console.error(`csp-script-hashes: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
