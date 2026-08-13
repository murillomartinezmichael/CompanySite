#!/usr/bin/env node
/**
 * check-shipped-placeholders.mjs — build-time fence against the
 * "placeholder shipped to production" bug class.
 *
 * WHY THIS EXISTS
 * On 2026-08-03 a fleet audit found m3mm.net/start/ live and serving
 * `buy.stripe.com/REPLACE_AFTER_SIGN_IN` — a real buyer clicking Pay hit a dead
 * Stripe page. The unit tests fence the checkout gate, but Cloudflare Pages
 * only runs `npm run build`, never `npm test`. So the tests could not have
 * stopped that deploy. This script runs as part of `npm run build` and exits
 * non-zero, which fails the Pages build, so a placeholder cannot reach
 * production even if every test is skipped.
 *
 * Scope: the whole class, not just the Stripe link — payment links, leftover
 * REPLACE/CHANGEME markers, placeholder analytics ids, example.com contact
 * targets, 555-01xx phone numbers, and any Stripe key material.
 *
 * Usage:  node scripts/check-shipped-placeholders.mjs [dir...]   (default: dist)
 *
 * `npm run verify:dist` scans BOTH shipped surfaces: `dist/` (the static site)
 * and `functions/` (the Pages Functions that ship as Workers alongside it).
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Files worth scanning: shipped text. Binary assets are skipped. */
const TEXT_EXT = new Set(['.html', '.htm', '.js', '.mjs', '.ts', '.css', '.json', '.xml', '.txt', '.svg', '.webmanifest']);
const TEXT_NAMES = new Set(['_headers', '_redirects', 'robots.txt']);

export const isScannableFile = (name) => TEXT_EXT.has(extname(name).toLowerCase()) || TEXT_NAMES.has(name);

/**
 * Each rule is deliberately narrow. A false positive here fails a production
 * deploy, so rules match placeholder SHAPES, never merely suspicious words.
 * (`placeholder="you@business.com"` on a form input, for example, is real UI
 * copy and must not trip anything.)
 */
export const RULES = [
  {
    id: 'dead-stripe-link',
    // Any buy.stripe.com URL that is not a well-formed LIVE payment link.
    test: (text) => {
      const found = text.match(/https?:\/\/buy\.stripe\.com\/[A-Za-z0-9_-]*/g) ?? [];
      return found.filter((u) => !/^https:\/\/buy\.stripe\.com\/[A-Za-z0-9]{10,64}$/.test(u) || u.includes('test_'));
    },
    message: 'dead or test-mode Stripe payment link shipped',
  },
  {
    id: 'replace-marker',
    test: (text) => text.match(/REPLACE_[A-Z0-9_]{3,}|CHANGE_?ME|YOUR_(API|SECRET|ACCOUNT|KEY|TOKEN|ID)[A-Z_]*|<INSERT[^>]*>/g) ?? [],
    message: 'unreplaced placeholder marker shipped',
  },
  {
    id: 'placeholder-analytics-id',
    test: (text) => text.match(/\bG-X{4,}[A-Z0-9]*|\bGTM-X{3,}[A-Z0-9]*|\bUA-X{4,}-?[0-9X]*/g) ?? [],
    message: 'placeholder analytics/tag id shipped',
  },
  {
    id: 'stripe-key-material',
    test: (text) => text.match(/\b(sk|rk)_(live|test)_[A-Za-z0-9]{6,}|\bpk_test_[A-Za-z0-9]{6,}/g) ?? [],
    message: 'Stripe key material in shipped output (secret keys must never leave the server; pk_test is a wrong-mode key)',
  },
  {
    id: 'example-contact-target',
    // example.com/.org/.net only matters when it is something a visitor can act on.
    test: (text) => text.match(/(?:href|src|action)="[^"]*example\.(?:com|org|net)[^"]*"|mailto:[^"'\s]*@example\.(?:com|org|net)/gi) ?? [],
    message: 'example.com placeholder used as a real contact/link target',
  },
  {
    id: 'placeholder-phone',
    test: (text) => text.match(/tel:\+?1?[ .()-]*555[ .()-]*01[0-9]{2}|\b\(?555\)?[ .-]01[0-9]{2}\b/g) ?? [],
    message: 'fictional 555-01xx phone number shipped',
  },
];

/** Scan one file's text. Returns [{ rule, message, sample }]. */
export function scanText(text) {
  const findings = [];
  for (const rule of RULES) {
    const hits = rule.test(text);
    if (hits.length > 0) {
      findings.push({ rule: rule.id, message: rule.message, samples: [...new Set(hits)].slice(0, 3) });
    }
  }
  return findings;
}

/** Walk a directory, scanning every shipped text file. */
export function scanDir(dir) {
  const results = [];
  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (isScannableFile(entry)) {
        const findings = scanText(readFileSync(full, 'utf8'));
        if (findings.length > 0) results.push({ file: relative(dir, full), findings });
      }
    }
  };
  walk(dir);
  return results;
}

// ---------------------------------------------------------------- CLI ----
const invokedDirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  const dirs = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ['dist'];
  const results = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      console.error(`check-shipped-placeholders: '${dir}' not found — run \`npm run build\` first.`);
      process.exit(1);
    }
    results.push(...scanDir(dir).map((r) => ({ ...r, file: `${dir}/${r.file}` })));
  }
  if (results.length === 0) {
    console.log(`check-shipped-placeholders: clean — no placeholders in ${dirs.join('/, ')}/`);
    process.exit(0);
  }
  console.error(`\ncheck-shipped-placeholders: BUILD BLOCKED — placeholder content shipped\n`);
  for (const { file, findings } of results) {
    for (const f of findings) {
      console.error(`  ${file}\n    [${f.rule}] ${f.message}\n    e.g. ${f.samples.join(' , ')}`);
    }
  }
  console.error('\nFix the source (see src/config/offers.ts for the checkout gate) and rebuild.\n');
  process.exit(1);
}
