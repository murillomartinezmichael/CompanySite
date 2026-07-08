#!/usr/bin/env node
// Rendered-HTML audit: every page in dist/ must carry exactly one
// <link rel="canonical"> and it must point to the production origin.
//
// Complement to tests/build/canonical.test.ts (which guards the source).
// This one guards the *output* — catches a page that skipped Layout or
// had a manual canonical hand-edited to a preview subdomain.
//
// Usage:  npm run build && npm run audit:canonicals

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

const PROD_ORIGIN = 'https://m3mm.net';
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DIST = join(ROOT, 'dist');

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

let htmlFiles;
try {
  htmlFiles = walk(DIST);
} catch {
  console.error(`audit-canonicals: dist/ not found — run "npm run build" first.`);
  process.exit(2);
}

if (htmlFiles.length === 0) {
  console.error('audit-canonicals: dist/ has no HTML files.');
  process.exit(2);
}

const CANON_RE = /<link\s+[^>]*rel=["']canonical["'][^>]*>/gi;
const HREF_RE = /href=["']([^"']+)["']/i;

const failures = [];
for (const file of htmlFiles) {
  const rel = relative(ROOT, file);
  const html = readFileSync(file, 'utf8');
  const tags = html.match(CANON_RE) || [];
  if (tags.length === 0) {
    failures.push(`${rel}: missing <link rel="canonical">`);
    continue;
  }
  if (tags.length > 1) {
    failures.push(`${rel}: ${tags.length} canonical tags (must be exactly 1)`);
    continue;
  }
  const href = (tags[0].match(HREF_RE) || [])[1] || '';
  if (!href.startsWith(PROD_ORIGIN)) {
    failures.push(`${rel}: canonical "${href}" does not start with ${PROD_ORIGIN}`);
    continue;
  }
  console.log(`ok  ${rel}  →  ${href}`);
}

if (failures.length) {
  console.error(`\naudit-canonicals: ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(`\naudit-canonicals: ${htmlFiles.length} page(s) OK.`);
