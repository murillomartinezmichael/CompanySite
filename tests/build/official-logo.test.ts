import { it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

it('ships Michael’s original logo byte-for-byte, including its white background', () => {
  const expected = '27c7c0c1a8c069e4ea38c87a41c7a6d1523d00ebbde4c5e9eb6637372ec24e97';
  for (const location of ['../../public/official-logo.png', '../../dist/official-logo.png']) {
    const bytes = readFileSync(new URL(location, import.meta.url));
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(expected);
  }
});
