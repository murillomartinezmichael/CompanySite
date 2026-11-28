import { describe, expect, it } from 'vitest';
import { isValidEmail, validateLead } from '../../functions/_lib/validate';

// The email field becomes the auto-reply `to`, the operator email `reply_to`
// and a `mailto:` href. It must be one bare address, not address-list or
// name-addr syntax that a mail API or client parses into something else.
describe('lead email accepts one bare address only', () => {
  it.each([
    'Prize<victim@example.invalid>',          // name-addr: display name + angle address
    '"Claim"victim@example.invalid',          // quoted display text
    'victim@example.invalid>',
    'a,b@example.invalid',                    // address-list separator
    'a;b@example.invalid',
    'buyer@example.invalid?bcc=x',            // mailto query smuggled into the domain
    'buyer@example.invalid#frag',
    'buyer@exa(mple).invalid',
    'buyer@[192.0.2.1]',
    'buyer@-bad.invalid',
    'buyer@example..invalid',
  ])('rejects %s', (email) => {
    expect(isValidEmail(email)).toBe(false);
    const r = validateLead({ name: 'A', email, businessType: 'x', frustration: 'long enough here' });
    expect(r.ok).toBe(false);
  });

  it.each([
    'a@b.co',
    'david.serrano+m3@aries-outdoor.living',
    "o'brien@example.co.uk",
    'first_last-1@sub.example.com',
    'tag!#$%&*=?^`{|}~@example.org',
    'josé@bücher.example',
  ])('still accepts %s', (email) => {
    expect(isValidEmail(email)).toBe(true);
  });
});
