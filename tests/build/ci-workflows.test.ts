import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Static checks on .github/workflows/*.yml. Plain line parsing on purpose:
// the repo has no direct YAML dependency and `uses:` lines are one-liners.
const dir = fileURLToPath(new URL('../../.github/workflows/', import.meta.url));
const workflows = readdirSync(dir)
  .filter((name) => /\.ya?ml$/.test(name))
  .map((name) => ({ name, text: readFileSync(dir + name, 'utf8') }));

const usesLines = workflows.flatMap(({ name, text }) =>
  text.split('\n').flatMap((line) => {
    const m = line.match(/^\s*(?:-\s+)?uses:\s*([^\s#]+)\s*(#.*)?$/);
    return m ? [{ name, ref: m[1], comment: m[2] ?? '' }] : [];
  }),
);

describe('GitHub Actions supply chain', () => {
  it('finds the workflows and their actions', () => {
    expect(workflows.length).toBeGreaterThanOrEqual(3);
    expect(usesLines.length).toBeGreaterThan(5);
  });

  // A tag like @v3 can be moved by whoever controls the action repo, and
  // gitleaks-action runs with GITHUB_TOKEN. A full commit SHA cannot move;
  // the trailing "# vX.Y.Z" comment lets Dependabot keep it current.
  it.each(usesLines.map((u) => [`${u.name}: ${u.ref}`, u]))('%s is pinned to a commit SHA with a version comment', (_label, u) => {
    expect(u.ref).toMatch(/^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/);
    expect(u.comment).toMatch(/^# v\d+\.\d+\.\d+$/);
  });
});
