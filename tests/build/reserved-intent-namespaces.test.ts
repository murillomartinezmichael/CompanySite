import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// CONVERSION_STANDARDS.md § 2 — every `data-intent` on every CTA must
// use a reserved namespace. Prior drift: `browse:` / `downshift:` /
// `urgent:` were silently invented (tick-22 remap closed them). This
// pins the invariant so a future CTA can't reintroduce a new namespace
// without either (a) mapping to a reserved one or (b) extending the
// shared standards doc + `RESERVED_INTENT_NAMESPACES` in prefill.ts.
const RESERVED = ['tier:', 'product:', 'feature:', 'plan:', 'book:', 'checkout:'] as const;

const root = fileURLToPath(new URL('../../', import.meta.url));

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = `${dir}/${entry}`;
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (/\.(astro|ts|tsx|html)$/.test(entry)) out.push(p);
  }
  return out;
}

const INTENT_RX = /data-intent=(?:"([^"]+)"|\{`([^`{}$]+)`\})/g;

function extractLiterals(src: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = INTENT_RX.exec(src))) {
    const raw = m[1] ?? m[2];
    if (!raw) continue;
    if (raw.includes('${')) continue; // interpolated (e.g. product:${slug}) — checked separately
    out.push(raw);
  }
  return out;
}

describe('every `data-intent` uses a CONVERSION_STANDARDS § 2 reserved namespace', () => {
  const files = walk(`${root}src`);

  for (const file of files) {
    const rel = file.replace(root, '');
    const src = readFileSync(file, 'utf8');
    const intents = extractLiterals(src);
    if (!intents.length) continue;

    it(`${rel} — all literal intents start with a reserved namespace`, () => {
      const bad = intents.filter((i) => !RESERVED.some((ns) => i.startsWith(ns) && i.length > ns.length));
      expect(bad, `${rel} uses non-reserved intent(s): ${bad.join(', ')}`).toEqual([]);
    });
  }

  it('interpolated intents in components live only on documented prefixes', () => {
    // CaseStudy.astro emits `product:${entry.slug}` — the only interpolated
    // form we expect. Any other file introducing template-literal intents
    // must be added here so we know we're not shipping intent shapes we
    // haven't audited. Regression guard against silent namespace drift.
    const allowed = ['src/components/CaseStudy.astro', 'src/components/Services.astro'];
    const found: string[] = [];
    for (const file of files) {
      const rel = file.replace(root, '').replace(/\\/g, '/');
      const src = readFileSync(file, 'utf8');
      if (/data-intent=\{`[^`]*\$\{/.test(src)) found.push(rel);
      else if (/data-intent=\{[^}]*\$\{/.test(src)) found.push(rel);
    }
    // Services.astro uses `{s.intent}` (variable, not template literal),
    // still worth pinning here so a future rewrite gets caught.
    const undocumented = found.filter((f) => !allowed.includes(f));
    expect(undocumented, `undocumented interpolated intents: ${undocumented.join(', ')}`).toEqual([]);
  });

  it('Services.astro tier CATALOG intents are all reserved', () => {
    // Services renders {s.intent} from a local array; the intents are
    // literal strings in the .astro frontmatter block. Grab those.
    const src = readFileSync(`${root}src/components/Services.astro`, 'utf8');
    const intentBlock = src.match(/intent:\s*['"]([^'"]+)['"]/g) || [];
    const values = intentBlock.map((s) => s.match(/['"]([^'"]+)['"]/)![1]);
    expect(values.length, 'Services.astro should declare tier intents').toBeGreaterThan(0);
    for (const v of values) {
      expect(RESERVED.some((ns) => v.startsWith(ns) && v.length > ns.length), `${v} not reserved`).toBe(true);
    }
  });
});
