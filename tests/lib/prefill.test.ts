import { describe, it, expect } from 'vitest';
import {
  CATALOG,
  BOOKING_PREFILLS,
  buildBrief,
  isPriorPrefill,
  TIER_ALIASES,
  PARAM_TO_FIELD,
  MAX_PARAM_LEN,
  RESERVED_INTENT_NAMESPACES,
  isReservedIntent,
} from '../../src/lib/prefill';

describe('CATALOG', () => {
  it('has entries for the four current Services tiers', () => {
    expect(CATALOG['tier:website:starter']).toBeDefined();
    expect(CATALOG['tier:website:business']).toBeDefined();
    expect(CATALOG['tier:siteguide:setup']).toBeDefined();
    expect(CATALOG['tier:custom:scoped-project']).toBeDefined();
  });

  it('every entry carries a title, price hint, and detail (never blank)', () => {
    for (const entry of Object.values(CATALOG)) {
      expect(entry.title.length).toBeGreaterThan(0);
      // Price hint may be "$500" or "Quote-only over $2,000" — must contain
      // a dollar figure but shape varies per tier.
      expect(entry.from).toMatch(/\$\d/);
      expect(entry.detail.length).toBeGreaterThan(0);
    }
  });

  it('has no stale intent keys from prior CATALOG generations', () => {
    // Old keys used through 2026-07 that got dropped when Services.astro
    // repositioned to the $500 / $1k-$2k / quote-only ladder. If any
    // resurface here, either the tests or Services.astro drifted.
    expect(CATALOG['tier:website:site-that-books']).toBeUndefined();
    expect(CATALOG['tier:automation:hours-saved']).toBeUndefined();
    expect(CATALOG['tier:widget:ai-assistant']).toBeUndefined();
  });
});

describe('BOOKING_PREFILLS (free `book:*` textarea seeds)', () => {
  // Cross-page CTAs on /thanks (urgent-email) and /accessibility
  // (contact) thread ?intent=book:urgent-review and
  // ?intent=book:accessibility-report through the URL as a JS-off
  // fallback. On landing at /audit#intake, applyUrlPrefill must seed
  // the textarea with structured context — otherwise the visitor
  // arrives at an empty form and has to reconstruct what they clicked
  // (CONVERSION_STANDARDS.md § 3).
  it('covers both book: intents that cross-page CTAs currently thread', () => {
    expect(BOOKING_PREFILLS['book:urgent-review']).toBeDefined();
    expect(BOOKING_PREFILLS['book:accessibility-report']).toBeDefined();
  });

  it('every seed ends with the SEPARATOR so isPriorPrefill flags it', () => {
    // Overwrite protection: wirePrefill's click handler only replaces a
    // prior prefill, never user-typed content. If a seed doesn't include
    // SEPARATOR, a follow-up tier click silently drops it.
    for (const seed of Object.values(BOOKING_PREFILLS)) {
      expect(isPriorPrefill(seed)).toBe(true);
      expect(seed.trim().length).toBeGreaterThan(0);
    }
  });

  it('every key is a reserved book: intent (bio-link contract)', () => {
    for (const key of Object.keys(BOOKING_PREFILLS)) {
      expect(key.startsWith('book:')).toBe(true);
      expect(isReservedIntent(key)).toBe(true);
    }
  });

  it('does not shadow a priced tier CATALOG entry', () => {
    // If both maps carry the same intent, applyUrlPrefill would use
    // CATALOG (checked first) and BOOKING_PREFILLS becomes dead code —
    // catches an accidental duplication before it hides a real bug.
    for (const key of Object.keys(BOOKING_PREFILLS)) {
      expect(CATALOG[key]).toBeUndefined();
    }
  });
});

describe('buildBrief', () => {
  it('writes title, price, detail, then the separator that marks a prefill', () => {
    const brief = buildBrief(CATALOG['tier:website:business']);
    expect(brief).toContain('Business website package');
    expect(brief).toContain('from $1,000-$2,000');
    expect(brief).toContain('Add anything else below:');
    expect(isPriorPrefill(brief)).toBe(true);
  });

  it('handles the quote-only tier without dropping the dollar hint', () => {
    const brief = buildBrief(CATALOG['tier:custom:scoped-project']);
    expect(brief).toContain('Quote-only over $2,000');
    expect(isPriorPrefill(brief)).toBe(true);
  });
});

describe('TIER_ALIASES (URL-param bio link contract)', () => {
  it('every alias resolves to a real CATALOG intent key', () => {
    for (const [alias, intent] of Object.entries(TIER_ALIASES)) {
      expect(CATALOG[intent], `alias "${alias}" → "${intent}" but no CATALOG entry`).toBeDefined();
    }
  });

  it('covers a short-name for each of the four tiers', () => {
    // If Michael writes /audit?tier=starter etc. in a bio link, at least
    // one alias per tier must land. Otherwise a URL rewrite in one place
    // (Services.astro intent rename) silently kills the bio-link surface.
    const intentsCovered = new Set(Object.values(TIER_ALIASES));
    expect(intentsCovered.has('tier:website:starter')).toBe(true);
    expect(intentsCovered.has('tier:website:business')).toBe(true);
    expect(intentsCovered.has('tier:siteguide:setup')).toBe(true);
    expect(intentsCovered.has('tier:custom:scoped-project')).toBe(true);
  });
});

describe('PARAM_TO_FIELD (URL-param whitelist)', () => {
  it('only maps visitor-facing fields — never seeds hidden `source` or `intent`', () => {
    // Guardrail against a hostile bio link like
    // ?source=organic&intent=tier:custom — attribution would lie.
    // `intent` is handled separately in applyUrlPrefill via TIER_ALIASES;
    // `source` is set once by the intake page and must not accept URL input.
    const allowedFields = new Set(Object.values(PARAM_TO_FIELD));
    expect(allowedFields.has('source')).toBe(false);
    expect(allowedFields.has('intent')).toBe(false);
    expect(allowedFields.has('honeypot')).toBe(false);
  });

  it('maps every current visitor-typed intake field', () => {
    // Intake.astro fields the visitor types: name, email, businessType,
    // currentUrl, frustration. `frustration` is textarea-seeded via
    // buildBrief, not a URL param, so it's not in the whitelist. The
    // remaining four should each have at least one URL-param alias.
    const values = new Set(Object.values(PARAM_TO_FIELD));
    expect(values.has('name')).toBe(true);
    expect(values.has('email')).toBe(true);
    expect(values.has('businessType')).toBe(true);
    expect(values.has('currentUrl')).toBe(true);
  });
});

describe('MAX_PARAM_LEN (DoS guardrail)', () => {
  it('caps URL-seeded values well below one HTTP request length', () => {
    expect(MAX_PARAM_LEN).toBeGreaterThan(0);
    // Long enough for a real business URL + descriptor; short enough
    // that a million-char query string can't push a megabyte into
    // form state before the browser truncates.
    expect(MAX_PARAM_LEN).toBeLessThanOrEqual(2048);
  });
});

describe('RESERVED_INTENT_NAMESPACES (bio-link intent contract)', () => {
  it('covers every reserved namespace listed in CONVERSION_STANDARDS.md § 2', () => {
    // The doc reserves: tier: · product: · feature: · plan: · book: · checkout:
    // A bio link may carry any of these; a rename in the doc must ripple here.
    expect(RESERVED_INTENT_NAMESPACES).toContain('tier:');
    expect(RESERVED_INTENT_NAMESPACES).toContain('product:');
    expect(RESERVED_INTENT_NAMESPACES).toContain('feature:');
    expect(RESERVED_INTENT_NAMESPACES).toContain('plan:');
    expect(RESERVED_INTENT_NAMESPACES).toContain('book:');
    expect(RESERVED_INTENT_NAMESPACES).toContain('checkout:');
  });

  it('every namespace ends with `:` so prefix match is unambiguous', () => {
    for (const ns of RESERVED_INTENT_NAMESPACES) {
      expect(ns.endsWith(':')).toBe(true);
    }
  });
});

describe('isReservedIntent (URL-param intent guardrail)', () => {
  it('accepts a real intent under each reserved namespace', () => {
    expect(isReservedIntent('tier:website:business')).toBe(true);
    expect(isReservedIntent('product:aries')).toBe(true);
    expect(isReservedIntent('feature:google-reviews')).toBe(true);
    expect(isReservedIntent('plan:care:hosting')).toBe(true);
    expect(isReservedIntent('book:free-review')).toBe(true);
    expect(isReservedIntent('checkout:hosting-monthly')).toBe(true);
  });

  it('rejects a bare namespace with nothing after the colon', () => {
    // `?intent=book:` shouldn't be treated as a valid intent — it carries
    // zero attribution and would clobber the default intent field.
    expect(isReservedIntent('tier:')).toBe(false);
    expect(isReservedIntent('book:')).toBe(false);
    expect(isReservedIntent('product:')).toBe(false);
  });

  it('rejects unreserved namespaces so hostile bio links cannot fabricate one', () => {
    // A URL like `?intent=admin:root` or `?intent=source:tiktok` must be
    // silently ignored so a bad actor cannot invent a new taxonomy.
    expect(isReservedIntent('admin:root')).toBe(false);
    expect(isReservedIntent('source:tiktok')).toBe(false);
    expect(isReservedIntent('utm:medium')).toBe(false);
    expect(isReservedIntent('random-string')).toBe(false);
    expect(isReservedIntent('')).toBe(false);
  });

  it('accepts case-insensitive input (URL params come raw from the address bar)', () => {
    expect(isReservedIntent('Book:free-review')).toBe(true);
    expect(isReservedIntent('PRODUCT:aries')).toBe(true);
  });
});

describe('isPriorPrefill', () => {
  it('is true for a message we wrote', () => {
    const brief = buildBrief(CATALOG['tier:website:starter']);
    expect(isPriorPrefill(brief)).toBe(true);
  });

  it('is false for user-typed content (no separator)', () => {
    expect(isPriorPrefill('')).toBe(false);
    expect(isPriorPrefill('my site is slow')).toBe(false);
    expect(isPriorPrefill("phone doesn't ring after visits")).toBe(false);
  });

  it('stays true after the user appends their own text below the separator', () => {
    const brief = buildBrief(CATALOG['tier:siteguide:setup']);
    const withUserAddition = brief + 'we get 20 DMs a week asking the same question';
    expect(isPriorPrefill(withUserAddition)).toBe(true);
  });
});
