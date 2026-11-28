import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// @ts-expect-error — plain .mjs build script, no type declarations
import { applyScriptHashes, collectHtml, inlineScriptHashes, MAX_HEADER_LINE } from '../../scripts/csp-script-hashes.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const sha = (s: string) => `'sha256-${createHash('sha256').update(s).digest('base64')}'`;
const SOURCE_CSP = "  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";

describe('inlineScriptHashes', () => {
  it('hashes classic and module inline scripts, skips external and data blocks', () => {
    const html = '<script>a()</script><script type="module">b()</script><script src="/x.js"></script>'
      + '<script type="application/ld+json">{"x":1}</script><script type="text/javascript">c()</script>';
    expect([...inlineScriptHashes(html)].sort()).toEqual([sha('a()'), sha('b()'), sha('c()')].sort());
  });
});

describe('applyScriptHashes', () => {
  it("drops script-src 'unsafe-inline', keeps 'self' and style-src untouched", () => {
    const out = applyScriptHashes(`/*\n${SOURCE_CSP}\n`, new Set([sha('a()')]));
    const csp = out.split('\n')[1];
    expect(csp).toContain(`script-src 'self' ${sha('a()')};`);
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp.match(/script-src[^;]*/)![0]).not.toContain('unsafe-inline');
  });
  it('fails loudly when there is no CSP or no script-src', () => {
    expect(() => applyScriptHashes('/*\n  X-Frame-Options: DENY\n', new Set())).toThrow(/no Content-Security-Policy/);
    expect(() => applyScriptHashes("/*\n  Content-Security-Policy: default-src 'self'\n", new Set())).toThrow(/no script-src/);
  });
  it('fails when the header would exceed the Cloudflare line limit', () => {
    const many = new Set(Array.from({ length: 60 }, (_, i) => sha(String(i))));
    expect(() => applyScriptHashes(`/*\n${SOURCE_CSP}\n`, many)).toThrow(new RegExp(`limit ${MAX_HEADER_LINE}`));
  });
});

describe.skipIf(!existsSync(root + 'dist/_headers'))('built dist/_headers (needs `npm run build` first)', () => {
  it("allows every shipped inline script by hash and never 'unsafe-inline'", () => {
    const headers = readFileSync(root + 'dist/_headers', 'utf8');
    const scriptSrc = headers.match(/Content-Security-Policy:.*?script-src([^;\n]*)/)![1];
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    const missing: string[] = [];
    for (const file of collectHtml(root + 'dist')) {
      for (const hash of inlineScriptHashes(readFileSync(file, 'utf8'))) if (!scriptSrc.includes(hash)) missing.push(`${file} ${hash}`);
    }
    expect(missing).toEqual([]);
  });
});
