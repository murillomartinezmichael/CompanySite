import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The original robots exclusion standard defines records as blocks separated
// by blank lines, each starting with User-agent. Disallow lines stranded in a
// blank-line-separated block after `Sitemap:` belong to no user-agent for
// parsers that follow that rule, so /workspace and /investors were only
// protected for crawlers that ignore blank lines (Google does; not all do).
const robots = readFileSync(fileURLToPath(new URL('../../public/robots.txt', import.meta.url)), 'utf8');
const records = robots.split(/\n\s*\n/).map((block) => block.split('\n').map((l) => l.trim()).filter(Boolean));

describe('robots.txt grouping', () => {
  it('every Allow/Disallow sits in a record that starts with User-agent', () => {
    for (const record of records) {
      if (record.some((line) => /^(dis)?allow:/i.test(line))) {
        expect(record[0], record.join(' | ')).toMatch(/^user-agent:/i);
      }
    }
  });

  it('keeps the private paths disallowed for every agent', () => {
    const star = records.find((r) => /^user-agent:\s*\*$/i.test(r[0])) ?? [];
    for (const path of ['/workspace', '/investors', '/api/workspace']) {
      expect(star).toContain(`Disallow: ${path}`);
    }
  });
});
