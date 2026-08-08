import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Shipped-source hygiene. Anything a browser can download is public: page
// HTML, the comments inside it, `is:inline` script/style bodies that Astro
// copies through verbatim, and every file under `public/`. Internal
// reasoning that leaks there is read by customers and competitors, not by us.
//
// The bar is NOT "is it a comment" — technical comments earn their place
// (a11y math, browser workarounds, JSON-LD rationale, layout landmarks).
// The bar is "does a customer or competitor learn something internal."
// This test pins the six categories that always fail that bar; the reasoning
// they used to carry lives in docs/shipped-source-hygiene.md.

const root = fileURLToPath(new URL('../../', import.meta.url));

type Finding = { surface: string; category: string; excerpt: string };

const FORBIDDEN: { category: string; re: RegExp }[] = [
  // LAW #6 / LAWS 1-9 — the fleet's internal rule numbering.
  { category: 'LAW numbering', re: /\bLAWS?\s*#?\s*\d+/i },
  // The owner-action queue. Naming it tells a reader the site has one.
  { category: 'PENDING_MANUAL reference', re: /PENDING_MANUAL/i },
  // Any SHOUTING_CASE repo doc: DECISIONS.md, CONVERSION_STANDARDS.md,
  // PENDING_MANUAL.md, TODO.md, SPEC.md, TRD.md ...
  { category: 'internal repo doc', re: /\b[A-Z][A-Z0-9_]{2,}\.md\b/ },
  // Repo-relative source/test/build paths. The negative lookbehind keeps
  // third-party public paths (e.g. `cdn-cgi/scripts/`) from matching.
  {
    category: 'internal repo path',
    re: /(?<![\w./-])(?:src|test|tests|public|functions|perf|scripts|node_modules|dist)\/[A-Za-z0-9._*-]/,
  },
  // Agent/session bookkeeping: tick-16e, "perf strike #5", opportunity #11,
  // session/2026-08-07-... branch names.
  {
    category: 'agent session name',
    re: /\b(?:tick-?\d+|strike\s*#\s*\d+|opportunity\s*#\s*\d+|session\/\d{4}-\d{2}-\d{2})/i,
  },
  // Competitors we research internally. Naming them in shipped source hands
  // a reader our positioning notes.
  {
    category: 'competitor name',
    re: /\b(?:GoLive|Squarespace|Webflow|Fiverr|Upwork|Carrd|Wix)\b/i,
  },
];

const walk = (dir: string, out: string[] = []): string[] => {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = `${dir}/${entry}`;
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};

const rel = (abs: string) => abs.slice(root.length).replace(/\\/g, '/');

/** Frontmatter (`---` ... `---`) is build-time only and never reaches a browser. */
const stripFrontmatter = (src: string) =>
  src.startsWith('---') ? src.replace(/^---[\s\S]*?\n---/, '') : src;

/**
 * The parts of an .astro file a browser actually receives verbatim:
 * HTML comments, plus the body of every `is:inline` <script>/<style>
 * (Astro copies those through untouched — non-inline blocks are bundled
 * and minified, which strips their comments).
 */
const shippedFragments = (src: string): string[] => {
  const body = stripFrontmatter(src);
  const frags: string[] = [];
  for (const m of body.matchAll(/<!--[\s\S]*?-->/g)) frags.push(m[0]);
  for (const m of body.matchAll(/<(script|style)\b([^>]*\bis:inline\b[^>]*)>([\s\S]*?)<\/\1>/g)) {
    frags.push(m[3]);
  }
  return frags;
};

const TEXT_EXT = /\.(html|css|js|mjs|json|txt|svg|xml|md|webmanifest)$/i;
const isTextish = (p: string) => TEXT_EXT.test(p) || /(^|\/)(_headers|_redirects|\.gitkeep)$/.test(p);

const scan = (surface: string, text: string, findings: Finding[]) => {
  for (const { category, re } of FORBIDDEN) {
    const all = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
    for (const hit of text.matchAll(all)) {
      const at = Math.max(0, hit.index - 60);
      const excerpt = text
        .slice(at, hit.index + hit[0].length + 60)
        .replace(/\s+/g, ' ')
        .trim();
      if (findings.some((f) => f.surface === surface && f.category === category && f.excerpt === excerpt)) {
        continue;
      }
      findings.push({ surface, category, excerpt });
    }
  }
};

const report = (findings: Finding[]) =>
  findings.map((f) => `  ${f.surface} [${f.category}]\n    …${f.excerpt}…`).join('\n');

describe('shipped source carries no internal reasoning', () => {
  it('the .astro surfaces a browser receives verbatim are clean', () => {
    const findings: Finding[] = [];
    for (const file of walk(`${root}src`).filter((f) => f.endsWith('.astro'))) {
      for (const frag of shippedFragments(readFileSync(file, 'utf8'))) {
        scan(rel(file), frag, findings);
      }
    }
    expect(report(findings), `internal reasoning in shipped .astro output:\n${report(findings)}`).toBe('');
  });

  it('every file under public/ is clean (all of it is downloadable)', () => {
    const findings: Finding[] = [];
    for (const file of walk(`${root}public`).filter((f) => isTextish(f))) {
      scan(rel(file), readFileSync(file, 'utf8'), findings);
    }
    expect(report(findings), `internal reasoning in public/:\n${report(findings)}`).toBe('');
  });

  // Belt-and-braces: when a build is present, grep the real bytes. This is
  // the only check that sees the fully-assembled page, so it catches a leak
  // arriving from a path the source scan above does not model.
  it('built dist/ output is clean when a build is present', () => {
    const dist = `${root}dist`;
    if (!existsSync(dist)) {
      expect(true).toBe(true);
      return;
    }
    const findings: Finding[] = [];
    for (const file of walk(dist).filter((f) => isTextish(f))) {
      scan(rel(file), readFileSync(file, 'utf8'), findings);
    }
    expect(report(findings), `internal reasoning in built output:\n${report(findings)}`).toBe('');
  });
});
