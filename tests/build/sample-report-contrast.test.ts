import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// axe color-contrast (WCAG 1.4.3) on every /samples/teardown-*.html page:
// the footer grey #9ca3af on white was 2.54:1 and the fix-list rank badge
// #6b7280 on #f3f4f6 was 4.39:1. Both are 12px text, so both need 4.5:1.
// The values match the SiteAudit renderer (siteaudit/report_html.py), which
// already shipped these fixes; the copies here had gone stale.
const dist = fileURLToPath(new URL('../../dist/samples/', import.meta.url));
const pages = readdirSync(dist).filter((f) => /^teardown-.*\.html$/.test(f));

const srgb = (v: number) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hex: string) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const rule = (html: string, selector: string) => {
  const m = html.match(new RegExp(`\\n\\s*${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`));
  expect(m, `${selector} rule`).toBeTruthy();
  return m![1];
};
const prop = (decls: string, name: string) => decls.match(new RegExp(`(?:^|;)\\s*${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];

describe('Teardown sample reports meet AA text contrast', () => {
  it('finds the sample pages', () => expect(pages.length).toBeGreaterThan(0));

  it.each(pages)('%s footer and rank badge clear 4.5:1', (file) => {
    const html = readFileSync(dist + file, 'utf8');
    const page = prop(rule(html, 'body'), 'background')!;
    const footer = prop(rule(html, 'footer'), 'color')!;
    expect(contrast(footer, page), `footer ${footer} on ${page}`).toBeGreaterThanOrEqual(4.5);
    const rank = rule(html, '.fix-rank');
    const [fg, bg] = [prop(rank, 'color')!, prop(rank, 'background')!];
    expect(contrast(fg, bg), `.fix-rank ${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    // The grade-dial letter is SVG text (axe does not measure it): 30px bold,
    // so the large-text floor of 3:1 applies. #ca8a04 was 2.94:1 on white.
    for (const [, fill] of html.matchAll(/<text\b[^>]*\bfill="(#[0-9a-fA-F]{6})"/g)) {
      expect(contrast(fill, page), `grade letter ${fill} on ${page}`).toBeGreaterThanOrEqual(3);
    }
  });
});
