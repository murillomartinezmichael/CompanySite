import { describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// @ts-expect-error — plain .mjs build script, no type declarations by design
import { RULES, isScannableFile, redactSecret, scanDir, scanFileName, scanText } from '../../scripts/check-shipped-placeholders.mjs';

// The build-time fence against the placeholder-shipped-to-production class.
// Cloudflare Pages runs `npm run build`, never `npm test` — so the checkout
// gate's unit tests could not have stopped the 2026-08-03 dead-Stripe-link
// deploy. `npm run build` now ends in this scanner. These tests prove the
// scanner catches the class AND that it does not false-positive on the real
// shipped output (a false positive here would block a production deploy).

const root = fileURLToPath(new URL('../../', import.meta.url));

const findingIds = (text: string): string[] =>
  scanText(text).map((f: { rule: string }) => f.rule);

describe('placeholder scanner — catches the class', () => {
  it.each([
    ['the exact bug that shipped', '<a href="https://buy.stripe.com/REPLACE_AFTER_SIGN_IN">Pay $100</a>', 'dead-stripe-link'],
    ['a Stripe test-mode link on the live page', '<a href="https://buy.stripe.com/test_bIYdRbc5C6pk0mA144">Pay</a>', 'dead-stripe-link'],
    ['plain-http Stripe link', '<a href="http://buy.stripe.com/bIYdRbc5C6pk0mA144">Pay</a>', 'dead-stripe-link'],
    ['any REPLACE_ marker', 'const key = "REPLACE_WITH_REAL_KEY";', 'replace-marker'],
    ['CHANGEME', 'apiUrl: "CHANGEME"', 'replace-marker'],
    ['YOUR_API_KEY', 'headers: { auth: "YOUR_API_KEY" }', 'replace-marker'],
    ['a placeholder GA4 id', '<script src="https://gtag/js?id=G-XXXXXXXXXX"></script>', 'placeholder-analytics-id'],
    ['a placeholder GTM id', "gtm('GTM-XXXXXX')", 'placeholder-analytics-id'],
    ['a placeholder UA id', "ga('create', 'UA-XXXXXXX-1')", 'placeholder-analytics-id'],
    ['a leaked secret key', 'const s = "sk_live_abc123def456";', 'stripe-key-material'],
    ['a wrong-mode publishable key', 'Stripe("pk_test_abc123def456")', 'stripe-key-material'],
    ['an example.com mailto', '<a href="mailto:hello@example.com">Email</a>', 'example-contact-target'],
    ['an example.com form action', '<form action="https://example.com/submit">', 'example-contact-target'],
    ['a fictional phone number', '<a href="tel:+15550123">Call</a>', 'placeholder-phone'],
  ])('flags %s', (_label, text, expectedRule) => {
    expect(findingIds(text)).toContain(expectedRule);
  });

  it('reports a sample of the offending text so the failure is actionable', () => {
    const [finding] = scanText('<a href="https://buy.stripe.com/REPLACE_AFTER_SIGN_IN">Pay</a>');
    expect(finding.samples[0]).toBe('https://buy.stripe.com/REPLACE_AFTER_SIGN_IN');
    expect(finding.message).toMatch(/stripe/i);
  });
});

// Codex money-path review 2026-08-12 (job 20260812-214326-codex-4a959c).
// The finder previously stopped at the first `?` or `/`, so it validated a
// TRUNCATED base and waved through malformed suffixes on an otherwise
// live-shaped id. Confirmed against the real scanner before fixing.
describe('placeholder scanner — malformed suffixes cannot evade the finder', () => {
  const liveId = 'bIYdRbc5C6pk0mA144';

  it.each([
    ['a trailing slash', `<a href="https://buy.stripe.com/${liveId}/">Pay</a>`],
    ['extra path segments', `<a href="https://buy.stripe.com/${liveId}/extra">Pay</a>`],
  ])('flags %s on an otherwise live-shaped link', (_label, text) => {
    expect(findingIds(text)).toContain('dead-stripe-link');
  });

  it('still accepts the bare live link it is modelled on', () => {
    expect(scanText(`<a href="https://buy.stripe.com/${liveId}">Pay</a>`)).toEqual([]);
  });
});

// Build logs on Cloudflare Pages and GitHub Actions are retained and broadly
// readable. A fence that echoes a leaked key verbatim copies the secret into a
// second place every time it fires.
describe('placeholder scanner — never echoes a detected secret', () => {
  it.each([
    ['a live secret key', 'const s = "sk_live_51AbCdEfGhIjKlMnOp";', 'sk_live_51AbCdEfGhIjKlMnOp'],
    ['a restricted key', 'const s = "rk_live_51AbCdEfGhIjKlMnOp";', 'rk_live_51AbCdEfGhIjKlMnOp'],
    ['a wrong-mode publishable key', 'Stripe("pk_test_51AbCdEfGhIjKlMnOp")', 'pk_test_51AbCdEfGhIjKlMnOp'],
  ])('redacts %s out of the reported samples', (_label, text, secret) => {
    const [finding] = scanText(text);
    expect(finding.rule).toBe('stripe-key-material');
    expect(JSON.stringify(finding)).not.toContain(secret);
  });

  it('keeps the mode-bearing prefix and the length so the leak is still identifiable', () => {
    const [finding] = scanText('const s = "sk_live_51AbCdEfGhIjKlMnOp";');
    expect(finding.samples[0]).toBe('sk_live_…[redacted, 26 chars]');
  });

  it('redacts key material while leaving ordinary samples actionable', () => {
    const [finding] = scanText('<a href="https://buy.stripe.com/REPLACE_AFTER_SIGN_IN">Pay</a>');
    expect(finding.samples[0]).toBe('https://buy.stripe.com/REPLACE_AFTER_SIGN_IN');
    expect(redactSecret('sk_live_abcdef123456')).toMatch(/^sk_live_…\[redacted, \d+ chars\]$/);
  });
});

describe('placeholder scanner — does not false-positive on real page content', () => {
  it.each([
    ['a real live payment link', '<a href="https://buy.stripe.com/bIYdRbc5C6pk0mA144">Pay $100</a>'],
    ['form input placeholder copy', '<input placeholder="you@business.com" /><input placeholder="David Serrano" />'],
    ['the Tailwind ::placeholder rule', '.field::placeholder{color:var(--bone)}'],
    ['schema.org and w3.org references', '<div itemtype="https://schema.org/Service" xmlns="http://www.w3.org/2000/svg">'],
    ['the real intake endpoint', '<form action="/api/lead" method="post">'],
    ['prose that happens to say replace', '<p>I replace dated sites with ones that book work.</p>'],
    ['a real-looking phone number', '<a href="tel:+15095551234">Call</a>'],
  ])('stays quiet on %s', (_label, text) => {
    expect(scanText(text)).toEqual([]);
  });

  it('skips binary assets and scans shipped text formats', () => {
    expect(isScannableFile('index.html')).toBe(true);
    expect(isScannableFile('_headers')).toBe(true);
    expect(isScannableFile('sitemap.xml')).toBe(true);
    expect(isScannableFile('lead.ts')).toBe(true); // Pages Functions ship too
    // Regression: public/brand-ownership.md shipped to dist/ in Aug 2026 and
    // the fence stayed quiet because .md was outside its scan set. Markdown
    // that reaches dist/ is served verbatim, so it must be scanned.
    expect(isScannableFile('brand-ownership.md')).toBe(true);
    expect(isScannableFile('hero.webp')).toBe(false);
    expect(isScannableFile('inter-latin.woff2')).toBe(false);
  });

  it('every rule declares an id and a human-readable message', () => {
    expect(RULES.length).toBeGreaterThanOrEqual(6);
    for (const rule of RULES) {
      expect(rule.id).toMatch(/^[a-z-]+$/);
      expect(rule.message.length).toBeGreaterThan(10);
    }
  });
});

// Codex re-review 2026-09-01 (SHIP-WITH-FIXES): the content rules alone would
// NOT have caught the historical public/brand-ownership.md leak — that file
// carried no placeholder markers and no key material. Markdown in shipped
// output is therefore a finding by PRESENCE (`shipped-markdown`,
// deny-by-default), and the fixture tests below automate what was previously
// only a manual scratch-dir proof: block, redact, exit 1.
describe('placeholder scanner — markdown never ships', () => {
  const inTempDir = (files: Record<string, string>, run: (dir: string) => void) => {
    const dir = mkdtempSync(join(tmpdir(), 'fence-md-'));
    try {
      for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
      run(dir);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };

  it('flags a .md by presence alone — the brand-ownership.md class, no placeholder content at all', () => {
    inTempDir(
      { 'brand-ownership.md': '# Brand ownership record\n\nProse only. No markers, no keys, no links.\n' },
      (dir) => {
        const results = scanDir(dir);
        expect(results).toHaveLength(1);
        expect(results[0].file).toBe('brand-ownership.md');
        expect(results[0].findings.map((f: { rule: string }) => f.rule)).toContain('shipped-markdown');
      },
    );
  });

  it('scanFileName leaves every non-markdown shipped file alone', () => {
    for (const name of ['index.html', 'app.js', 'sitemap.xml', '_headers', 'hero.webp']) {
      expect(scanFileName(name)).toEqual([]);
    }
  });

  it('still runs the content rules on markdown, so a leak inside one is named too', () => {
    inTempDir({ 'leaked.md': 'REPLACE_AFTER_SIGN_IN plus sk_live_51AbCdEfGhIjKlMnOp\n' }, (dir) => {
      const rules = scanDir(dir)[0].findings.map((f: { rule: string }) => f.rule);
      expect(rules).toContain('shipped-markdown');
      expect(rules).toContain('replace-marker');
      expect(rules).toContain('stripe-key-material');
    });
  });

  it('CLI: a leaked .md blocks the build (exit 1) and the key is redacted from the log', () => {
    const secret = 'sk_live_51AbCdEfGhIjKlMnOp';
    inTempDir({ 'leaked.md': `REPLACE_AFTER_SIGN_IN plus ${secret}\n` }, (dir) => {
      const cli = spawnSync(process.execPath, [join(root, 'scripts', 'check-shipped-placeholders.mjs'), dir], {
        encoding: 'utf8',
      });
      const output = `${cli.stdout}${cli.stderr}`;
      expect(cli.status).toBe(1);
      expect(output).toContain('BUILD BLOCKED');
      expect(output).toContain('shipped-markdown');
      expect(output).toContain('[redacted,');
      expect(output).not.toContain(secret); // the fence must never copy the leak into the build log
    });
  });

  it('CLI: a placeholder-free .md still blocks the build with the move-to-docs message', () => {
    inTempDir({ 'notes.md': '# Internal notes\n\nNothing placeholder-shaped.\n' }, (dir) => {
      const cli = spawnSync(process.execPath, [join(root, 'scripts', 'check-shipped-placeholders.mjs'), dir], {
        encoding: 'utf8',
      });
      expect(cli.status).toBe(1);
      expect(`${cli.stdout}${cli.stderr}`).toContain('markdown must not ship');
    });
  });
});

// What actually ships. Requires a build (CI builds before testing; `npm run
// build` runs this same scanner as its final step — RUNBOOK § 3.4).
describe.skipIf(!existsSync(root + 'dist'))('built dist/ (needs `npm run build` first)', () => {
  it('ships zero placeholders of any kind', () => {
    expect(scanDir(root + 'dist')).toEqual([]);
  });
});

describe('shipped Pages Functions', () => {
  it('ship zero placeholders of any kind', () => {
    expect(scanDir(root + 'functions')).toEqual([]);
  });
});
