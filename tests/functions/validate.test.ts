import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidUrl, clean, validateLead, esc, LIMITS } from '../../functions/_lib/validate';

describe('isValidEmail', () => {
  it('accepts common shapes', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('david.serrano+m3@aries-outdoor.living')).toBe(true);
    expect(isValidEmail('user_1@sub.example.com')).toBe(true);
  });

  it('rejects garbage', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('nope')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);          // missing TLD dot
    expect(isValidEmail('a@.co')).toBe(false);         // TLD-only after dot IS matched by \S+, but no local domain part
    expect(isValidEmail('spaces @ok.com')).toBe(false);
    expect(isValidEmail('twoats@@bad.com')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('accepts http and https', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://example.com/path?q=1')).toBe(true);
    expect(isValidUrl('https://sub.domain.example/deep/path')).toBe(true);
  });

  it('rejects other protocols — the reason this exists is to block XSS via URL fields', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
    expect(isValidUrl('data:text/html,<script>1</script>')).toBe(false);
    expect(isValidUrl('file:///etc/passwd')).toBe(false);
    expect(isValidUrl('ftp://example.com')).toBe(false);
  });

  it('rejects malformed strings', () => {
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false); // no protocol
  });
});

describe('clean', () => {
  it('trims and caps strings', () => {
    expect(clean('  hello  ', 10)).toBe('hello');
    expect(clean('a'.repeat(200), 50)).toHaveLength(50);
    expect(clean('short', 100)).toBe('short');
  });

  it('returns empty for non-strings — every downstream call assumes string', () => {
    expect(clean(undefined, 10)).toBe('');
    expect(clean(null, 10)).toBe('');
    expect(clean(42, 10)).toBe('');
    expect(clean({}, 10)).toBe('');
    expect(clean([], 10)).toBe('');
  });
});

describe('esc', () => {
  it('encodes the five HTML-critical characters', () => {
    expect(esc('<b>hi</b>')).toBe('&lt;b&gt;hi&lt;/b&gt;');
    expect(esc('&amp;')).toBe('&amp;amp;');
    expect(esc(`"'`)).toBe('&quot;&#39;');
  });

  it('leaves benign text untouched', () => {
    expect(esc('hello, world 123')).toBe('hello, world 123');
  });
});

describe('validateLead — happy path', () => {
  it('accepts a well-formed lead and returns the cleaned shape', () => {
    const result = validateLead({
      name: '  David Serrano  ',
      email: 'david@aries.example',
      businessType: 'deck builder',
      currentUrl: 'https://ariesoutdoorliving.com',
      frustration: 'My site does not book jobs at all.',
      source: 'homepage',
      preferredStart: '  Within 2 weeks  ',
    });
    if (!result.ok) throw new Error('expected ok');
    expect(result.lead.name).toBe('David Serrano');
    expect(result.lead.email).toBe('david@aries.example');
    expect(result.lead.businessType).toBe('deck builder');
    expect(result.lead.currentUrl).toBe('https://ariesoutdoorliving.com');
    expect(result.lead.source).toBe('homepage');
    expect(result.lead.preferredStart).toBe('Within 2 weeks');
  });

  it('defaults source to "unknown" when missing', () => {
    const result = validateLead({
      name: 'A',
      email: 'a@b.co',
      businessType: 'x',
      frustration: 'longer than ten chars',
    });
    if (!result.ok) throw new Error('expected ok');
    expect(result.lead.source).toBe('unknown');
  });

  it('accepts an empty currentUrl (optional field)', () => {
    const result = validateLead({
      name: 'A',
      email: 'a@b.co',
      businessType: 'x',
      frustration: 'longer than ten chars',
      currentUrl: '',
    });
    if (!result.ok) throw new Error('expected ok');
    expect(result.lead.currentUrl).toBe('');
  });
});

describe('validateLead — failures', () => {
  it('reports each missing required field with a stable code', () => {
    const r = validateLead({ name: '', email: '', businessType: '', frustration: '' });
    if (r.ok) throw new Error('expected fail');
    const codes = new Map(r.errors.map((e) => [e.field, e.code]));
    expect(codes.get('name')).toBe('required');
    expect(codes.get('email')).toBe('required');
    expect(codes.get('businessType')).toBe('required');
    expect(codes.get('frustration')).toBe('required');
  });

  it('flags an unparseable email as format-invalid, not required-missing', () => {
    const r = validateLead({ name: 'A', email: 'nope', businessType: 'x', frustration: 'long enough here' });
    if (r.ok) throw new Error('expected fail');
    const email = r.errors.find((e) => e.field === 'email');
    expect(email?.code).toBe('format');
  });

  it('flags a too-short frustration as too_short', () => {
    const r = validateLead({ name: 'A', email: 'a@b.co', businessType: 'x', frustration: 'nope' });
    if (r.ok) throw new Error('expected fail');
    const frustration = r.errors.find((e) => e.field === 'frustration');
    expect(frustration?.code).toBe('too_short');
  });

  it('rejects a javascript: URL as format-invalid — XSS defense', () => {
    const r = validateLead({
      name: 'A',
      email: 'a@b.co',
      businessType: 'x',
      frustration: 'long enough here',
      currentUrl: 'javascript:alert(1)',
    });
    if (r.ok) throw new Error('expected fail');
    const url = r.errors.find((e) => e.field === 'currentUrl');
    expect(url?.code).toBe('format');
  });

  it('caps every string field to the documented limit', () => {
    const huge = 'x'.repeat(LIMITS.frustration + 5000);
    const r = validateLead({
      name: huge,
      email: 'a@b.co',
      businessType: 'x',
      frustration: huge,
    });
    if (!r.ok) throw new Error('expected ok — over-cap strings should trim, not fail');
    expect(r.lead.name.length).toBeLessThanOrEqual(LIMITS.name);
    expect(r.lead.frustration.length).toBeLessThanOrEqual(LIMITS.frustration);
  });
});

describe('validateLead — honeypot semantics', () => {
  it('does not validate the honeypot field — that is handled at the endpoint layer', () => {
    // The validator does not know about company_website; it is filtered at
    // the API boundary in functions/api/lead.ts. Documenting the contract.
    const r = validateLead({
      name: 'Bot',
      email: 'bot@example.com',
      businessType: 'spam',
      frustration: 'aaaaaaaaaaaaa',
      // company_website is intentionally NOT passed to validateLead
    });
    expect(r.ok).toBe(true);
  });
});
