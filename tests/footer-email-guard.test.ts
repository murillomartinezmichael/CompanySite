import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// The footer hydrates "Email Michael" from data-em-u / data-em-h. If either
// is missing it must leave the fallback link alone (like thanks, accessibility
// and resume do) instead of showing "undefined@undefined".
function run(dataset: Record<string, string>) {
  const source = readFileSync(new URL('../src/components/Footer.astro', import.meta.url), 'utf8');
  const code = source.match(/<script is:inline>([\s\S]*?)<\/script>/)![1];
  const a = { dataset, href: '/audit#intake', textContent: 'Email Michael' };
  runInNewContext(code, { document: { querySelector: () => a }, encodeURIComponent });
  return a;
}

describe('footer email hydration', () => {
  it('builds the mailto when both parts are present', () => {
    const a = run({ emU: 'someone', emH: 'example.invalid' });
    expect(a.href).toBe('mailto:someone@example.invalid');
    expect(a.textContent).toBe('someone@example.invalid');
  });

  it.each([[{}], [{ emU: 'someone' }], [{ emH: 'example.invalid' }]])('keeps the fallback link when data is missing (%o)', (dataset) => {
    const a = run(dataset as Record<string, string>);
    expect(a.href).toBe('/audit#intake');
    expect(a.textContent).toBe('Email Michael');
  });
});
