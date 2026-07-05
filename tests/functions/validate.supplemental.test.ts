// Supplemental coverage for edges the primary validate.test.ts doesn't hit:
//   - `esc` HTML-escape (used for the outbound email body, so it IS money-path)
//   - `clean` non-string inputs (defense against fabricated JSON)
//   - `validateLead` honeypot silent-swallow (must not surface to caller)
//   - `validateLead` multi-error capture (all missing fields reported at once)

import { describe, it, expect } from 'vitest';
import { clean, esc, validateLead, LIMITS } from '../../functions/_lib/validate';

describe('esc — HTML escape for email body embedding', () => {
  it.each([
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['"', '&quot;'],
    ["'", '&#39;'],
  ])('escapes %s → %s', (input, expected) => {
    expect(esc(input)).toBe(expected);
  });

  it('escapes a full script-tag payload', () => {
    expect(esc('<script>alert("x")</script>'))
      .toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
  });

  it('leaves benign text alone', () => {
    expect(esc('deck build 12x16, $8,400 est')).toBe('deck build 12x16, $8,400 est');
  });

  it('double-escapes ampersands (correctly): the second pass sees the &amp; as literal', () => {
    // This is deliberate — if a user typed "&lt;" verbatim they meant the four
    // characters, and the email body should show them, not render an angle bracket.
    expect(esc(esc('<'))).toBe('&amp;lt;');
  });
});

describe('clean — rejects non-string input shapes', () => {
  it.each([
    [undefined],
    [null],
    [42],
    [{}],
    [[]],
    [true],
  ])('%o → ""', (input) => {
    expect(clean(input, 10)).toBe('');
  });

  it('whitespace-only string becomes empty', () => {
    expect(clean('     ', 10)).toBe('');
    expect(clean('\t\n', 10)).toBe('');
  });

  it('trim happens before the length cap', () => {
    // '   hello world' → trim → 'hello world' (11 chars) → cap 5 → 'hello'
    expect(clean('   hello world', 5)).toBe('hello');
  });
});

describe('validateLead — honeypot company_website field', () => {
  const good = {
    name: 'Michael',
    email: 'mike@example.com',
    businessType: 'Deck Builder',
    frustration: 'My website does not book jobs consistently.',
  };

  it('does not surface company_website in the cleaned lead', () => {
    const r = validateLead({ ...good, company_website: 'bot-filled-value' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      // Honeypot detection is a route-level responsibility (silent-swallow 200).
      // The validator's job is to NOT leak the honeypot value into the trusted lead.
      expect((r.lead as Record<string, unknown>).company_website).toBeUndefined();
    }
  });
});

describe('validateLead — multi-field error reporting', () => {
  it('captures all missing required fields in one pass, not first-fail', () => {
    const r = validateLead({});
    expect(r.ok).toBe(false);
    if (!r.ok) {
      const fields = new Set(r.errors.map(e => e.field));
      expect(fields.has('name')).toBe(true);
      expect(fields.has('email')).toBe(true);
      expect(fields.has('businessType')).toBe(true);
      expect(fields.has('frustration')).toBe(true);
    }
  });

  it('over-cap values truncate silently, do NOT reject', () => {
    // Caps are a defense (block 10 MB bombs); they aren't user-facing errors.
    // Anything the form widget accepts should still submit.
    const overCap = {
      name: 'x'.repeat(LIMITS.name + 100),
      email: 'a@b.co',
      businessType: 'y'.repeat(LIMITS.businessType + 100),
      frustration: 'z'.repeat(LIMITS.frustration + 100),
    };
    const r = validateLead(overCap);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.lead.name).toHaveLength(LIMITS.name);
      expect(r.lead.businessType).toHaveLength(LIMITS.businessType);
      expect(r.lead.frustration).toHaveLength(LIMITS.frustration);
    }
  });
});
