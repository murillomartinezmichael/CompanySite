import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

const policies = readFileSync(new URL('../../dist/policies/index.html', import.meta.url), 'utf8');

it('defers the below-fold footer logo', () => {
  const footer = policies.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/)?.[1];
  const logo = footer?.match(/<img\b[^>]*>/)?.[0];
  expect(logo).toMatch(/\bloading="lazy"/);
});

it('treats the logo beside the policy library brand text as decorative', () => {
  const intro = policies.match(/<section\b[^>]*class="page-intro\b[^"]*"[^>]*>([\s\S]*?)<h1\b/)?.[1];
  expect(intro).toContain('M3MM · Policy library');
  expect(intro?.match(/<img\b[^>]*>/)?.[0]).toMatch(/\balt=""/);
});
