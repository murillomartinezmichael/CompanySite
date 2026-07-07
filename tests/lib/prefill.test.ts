import { describe, it, expect } from 'vitest';
import { CATALOG, buildBrief, isPriorPrefill } from '../../src/lib/prefill';

describe('CATALOG', () => {
  it('has entries for the three Services tiers', () => {
    expect(CATALOG['tier:website:site-that-books']).toBeDefined();
    expect(CATALOG['tier:automation:hours-saved']).toBeDefined();
    expect(CATALOG['tier:widget:ai-assistant']).toBeDefined();
  });

  it('every entry carries a real starting price (never blank)', () => {
    for (const entry of Object.values(CATALOG)) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.from).toMatch(/^\$\d/);
      expect(entry.detail.length).toBeGreaterThan(0);
    }
  });
});

describe('buildBrief', () => {
  it('writes title, price, detail, then the separator that marks a prefill', () => {
    const brief = buildBrief(CATALOG['tier:website:site-that-books']);
    expect(brief).toContain('A site that books jobs');
    expect(brief).toContain('from $2,400');
    expect(brief).toContain('Add anything else below:');
    expect(isPriorPrefill(brief)).toBe(true);
  });
});

describe('isPriorPrefill', () => {
  it('is true for a message we wrote', () => {
    const brief = buildBrief(CATALOG['tier:automation:hours-saved']);
    expect(isPriorPrefill(brief)).toBe(true);
  });

  it('is false for user-typed content (no separator)', () => {
    expect(isPriorPrefill('')).toBe(false);
    expect(isPriorPrefill('my site is slow')).toBe(false);
    expect(isPriorPrefill('phone doesn\'t ring after visits')).toBe(false);
  });

  it('stays true after the user appends their own text below the separator', () => {
    const brief = buildBrief(CATALOG['tier:widget:ai-assistant']);
    const withUserAddition = brief + 'we get 20 DMs a week asking the same question';
    expect(isPriorPrefill(withUserAddition)).toBe(true);
  });
});
