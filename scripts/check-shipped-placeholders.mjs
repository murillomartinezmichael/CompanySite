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
import { opendirSync, readFileSync, lstatSync, existsSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PAYMENT_LINK_HOSTS, paymentLinkProblem, decodePercentLiterals } from './payment-link-policy.mjs';

/**
 * Files worth scanning: shipped text. Binary assets are skipped.
 *
 * `.md` is in the set so a markdown file that reaches shipped output gets its
 * CONTENT scanned like any other text — but content rules are not what fences
 * markdown. The real markdown fence is `scanFileName` below: no .md belongs in
 * shipped output at all, so its mere presence is a finding. See that rule for
 * the incident history and why deny-by-default is the only shape that works.
 */
const TEXT_EXT = new Set(['.html', '.htm', '.js', '.mjs', '.ts', '.css', '.json', '.xml', '.txt', '.svg', '.webmanifest', '.md', '.map', '.cjs', '.tsx', '.astro', '.toml', '.yaml', '.yml', '.csv']);
const TEXT_NAMES = new Set(['_headers', '_redirects', 'robots.txt']);

export const isScannableFile = (name) => TEXT_EXT.has(extname(name).toLowerCase()) || TEXT_NAMES.has(name) || extname(name) === '';

/**
 * Each rule is deliberately narrow. A false positive here fails a production
 * deploy, so rules match placeholder SHAPES, never merely suspicious words.
 * (`placeholder="you@business.com"` on a form input, for example, is real UI
 * copy and must not trip anything.)
 */
export const RULES = [
  {
    id: 'dead-stripe-link',
    // Consume complete literal URLs. Shared parsing keeps the build fence
    // and checkout gate consistent for allowed hosts and query parameters.
    test: (text) => {
      const found = text.match(/https?:\/\/[^\s"'`<>)\]}\\]+/gi) ?? [];
      return found.filter((value) => {
        let hostname;
        try { hostname = new URL(value).hostname; } catch { return false; }
        return PAYMENT_LINK_HOSTS.includes(hostname) && paymentLinkProblem(value) !== null;
      });
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

/**
 * Mask a secret down to a locatable fingerprint: keep the mode-bearing prefix
 * (`sk_live_`, `pk_test_`, …) so the reader knows what leaked and how bad it
 * is, drop the entropy, and state the length so it can be matched against the
 * real key without reproducing it.
 */
export const redactSecret = (value) => {
  const prefix = value.match(/^(?:sk|rk|pk)_(?:live|test)_/)?.[0] ?? '';
  return `${prefix}…[redacted, ${value.length} chars]`;
};

// Redaction applies to every diagnostic, including overlapping rule matches,
// filenames and filesystem errors. Mask partial/underscore-containing key
// shapes too: diagnostic safety must not depend on a detector's match length.
// Detection rules above deliberately retain their existing coverage.
export const redactDiagnostic = (value) => {
  const pattern = /(?:sk|rk)_(?:live|test)_[A-Za-z0-9_]+|pk_test_[A-Za-z0-9_]+/g;
  const decoded = decodePercentLiterals(value);
  if (decoded !== value && pattern.test(decoded)) return redactSecret(decoded);
  return value.replace(pattern, redactSecret);
};

/**
 * File-level rules: a finding triggered by a file's PRESENCE in shipped
 * output, regardless of its content. Same finding shape as `scanText`.
 *
 * shipped-markdown — anything in public/ ships to dist/ verbatim and serves at
 * m3mm.net/<name>. In Aug 2026, public/brand-ownership.md (an internal
 * copyright record: legal name, asset SHA-256 fingerprints, registration
 * strategy) shipped exactly that way. It contained no placeholder markers and
 * no key material, so every content rule above would have stayed quiet — only
 * deny-by-default catches that class. No .md is supposed to reach dist/ or
 * functions/ (verified: the built site ships zero), so presence alone is the
 * signal. Deny-all also moots the content-rule false-positive risk that comes
 * with scanning markdown (a doc's code fence legitimately showing
 * `YOUR_API_KEY` would trip replace-marker): the file is already a finding for
 * existing, with a message that names the actual fix. If a .md ever must ship,
 * that is a deliberate product decision — revisit this rule then, don't route
 * around it.
 */
export function scanFileName(name) {
  if (extname(name).toLowerCase() !== '.md') return [];
  return [
    {
      rule: 'shipped-markdown',
      message: 'markdown must not ship — internal docs belong in docs/, not public/ (public/ serves verbatim at the site root)',
      samples: [redactDiagnostic(name)],
    },
  ];
}

/** Scan one file's text. Returns [{ rule, message, samples }]. */
export function scanText(text) {
  // Decode common literal encodings, without evaluating scripts or expressions.
  // Arbitrarily constructed runtime strings remain outside a static text fence.
  for (let pass = 0; pass < 2; pass++) {
    text = decodePercentLiterals(text);
    text = text.replace(/\\\//g, '/').replace(/\\u([0-9a-f]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (whole, code) => {
        const point = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code);
        return point <= 0x10ffff ? String.fromCodePoint(point) : whole;
      }).replace(/&(colon|sol|bsol|amp);/gi, (_, name) => ({ colon: ':', sol: '/', bsol: '\\', amp: '&' })[name.toLowerCase()]);
  }
  const findings = [];
  for (const rule of RULES) {
    const hits = rule.test(text);
    if (hits.length > 0) {
      const samples = [...new Set(hits)].slice(0, 3);
      findings.push({
        rule: rule.id,
        message: rule.message,
        samples: samples.map(redactDiagnostic),
      });
    }
  }
  return findings;
}

/** Bound traversal and reject links before following/reading their targets. */
export const SCAN_LIMITS = Object.freeze({ fileBytes: 8 * 1024 * 1024, totalBytes: 64 * 1024 * 1024, entries: 20000, depth: 32 });
export function scanDir(dir, limits = SCAN_LIMITS) {
  if (!lstatSync(dir).isDirectory()) throw new Error(`scanner requires a directory: ${redactDiagnostic(dir)}`);
  const results = [];
  let entries = 0;
  let totalBytes = 0;
  const walk = (current, depth) => {
    if (++entries > limits.entries || depth > limits.depth) throw new Error('scanner traversal limit exceeded');
    const stat = lstatSync(current);
    if (stat.isSymbolicLink()) throw new Error('scanner refuses symbolic links and junctions');
    if (stat.isDirectory()) {
      const directory = opendirSync(current);
      try {
        let entry;
        while ((entry = directory.readSync()) !== null) walk(join(current, entry.name), depth + 1);
      } finally { directory.closeSync(); }
    } else if (!stat.isFile()) {
      throw new Error('scanner refuses non-regular files');
    } else if (isScannableFile(current)) {
      totalBytes += stat.size;
      if (stat.size > limits.fileBytes || totalBytes > limits.totalBytes) throw new Error('scanner text size limit exceeded');
      const findings = [...scanFileName(current), ...scanText(readFileSync(current, 'utf8'))];
      if (findings.length > 0) results.push({ file: redactDiagnostic(relative(dir, current)), findings });
    }
  };
  walk(dir, 0);
  return results;
}

// ---------------------------------------------------------------- CLI ----
const invokedDirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
function runCli() {
  const dirs = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ['dist'];
  const results = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      console.error(redactDiagnostic(`check-shipped-placeholders: '${dir}' not found — run \`npm run build\` first.`));
      return 1;
    }
    results.push(...scanDir(dir).map((r) => ({ ...r, file: `${dir}/${r.file}` })));
  }
  if (results.length === 0) {
    console.log(redactDiagnostic(`check-shipped-placeholders: clean — no placeholders in ${dirs.join('/, ')}/`));
    return 0;
  }
  console.error(`\ncheck-shipped-placeholders: BUILD BLOCKED — placeholder content shipped\n`);
  for (const { file, findings } of results) {
    for (const f of findings) {
      console.error(redactDiagnostic(`  ${file}\n    [${f.rule}] ${f.message}\n    e.g. ${f.samples.join(' , ')}`));
    }
  }
  console.error('\nFix the source (see src/config/offers.ts for the checkout gate) and rebuild.\n');
  return 1;
}

if (invokedDirectly) {
  try {
    process.exitCode = runCli();
  } catch (error) {
    // Uncaught Node errors echo their raw filesystem paths and bypass normal
    // diagnostics. Keep the failure visible without copying key material.
    console.error(redactDiagnostic(`check-shipped-placeholders: ${error instanceof Error ? error.message : String(error)}`));
    process.exitCode = 1;
  }
}
