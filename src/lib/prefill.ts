// Intake prefill — two paths:
//
// 1) Click-based: when the visitor clicks a `[data-intent]` CTA on-page
//    (Hero, Services tier cards, Footer), the intent + a matching CATALOG
//    entry are pushed into the intake form so the textarea is seeded and
//    intent submits with attribution.
//
// 2) URL-param-based (2026-07-11): when the visitor lands from a link
//    like `/audit?tier=business&biz=deck+builder&email=x@y.com`, the
//    matching form fields are populated before the visitor types. This
//    turns the TikTok/IG bio into a warm-lead surface — the same click
//    already fills 60% of the form.
//
// Both paths are additive: click-based prefill still overrides URL-based
// prefill if the visitor then clicks a tier CTA, so a wrong URL param
// can't lock them out of picking a different tier.

import { track } from '@/lib/track';

export type CatalogEntry = {
  title: string;
  from: string;
  detail: string;
};

// Keys match the `intent` attribute on Services.astro's tier rows —
// intentional pinning so a mismatch here silently disables prefill for
// that tier, which is caught by manual smoke on the /audit form.
export const CATALOG: Record<string, CatalogEntry> = {
  'tier:website:starter': {
    title: 'Basic site or cleanup',
    from: '$500',
    detail: 'One-page site, landing page, or refresh — mobile-first, clear CTA, contact path wired.',
  },
  'tier:website:business': {
    title: 'Business website package',
    from: '$1,000-$2,000',
    detail: 'Full custom business site — positioning, proof, service sections, lead capture. Bounded scope.',
  },
  'tier:siteguide:setup': {
    title: 'SiteGuide setup + customization',
    from: '$500',
    detail: 'Brand a SiteGuide template, configure the AI guide widget, wire the launch path, hand off.',
  },
  'tier:custom:scoped-project': {
    title: 'Premium custom company build',
    from: 'Quote-only over $2,000',
    detail: 'Large company site, multi-page service line, portal, or integration — scoped after a call.',
  },
};

const SEPARATOR = '\n---\nAdd anything else below:\n';

export function buildBrief(entry: CatalogEntry): string {
  return `${entry.title} — from ${entry.from}\n${entry.detail}${SEPARATOR}`;
}

export function isPriorPrefill(text: string): boolean {
  return text.includes(SEPARATOR);
}

// Non-priced textarea seeds for `book:*` intents that land at
// /audit#intake via cross-page fallbacks (thanks-urgent-email JS-off,
// accessibility-contact JS-off, or a hostile CSP that blocked the
// mailto hydration script). CATALOG covers priced tiers only — its
// entries carry a dollar figure by contract, which doesn't fit a free
// booking action. Without a seed here, the visitor arrives at an empty
// textarea and has to recall what they clicked. CONVERSION_STANDARDS.md
// § 3: "The prefill must write structured context" — this closes that
// gap for the two book: intents cross-page CTAs currently thread.
export const BOOKING_PREFILLS: Readonly<Record<string, string>> = {
  'book:urgent-review':
    `Urgent — same-day site review\nDeadline / event date: \nWhat's urgent about it: ${SEPARATOR}`,
  'book:accessibility-report':
    `Accessibility issue on m3mm.net\nPage where it happened: \nWhat got in your way: ${SEPARATOR}`,
};

// Short-name → full intent key map. Lets Michael write TikTok/IG bio
// links like `?tier=starter` or `?tier=business` instead of the wire
// intent value. Missing keys silently no-op — the URL is user-facing.
// Exported for the URL-param contract test — a rename in CATALOG that
// doesn't ripple here silently breaks a bio link.
export const TIER_ALIASES: Readonly<Record<string, string>> = {
  starter: 'tier:website:starter',
  basic: 'tier:website:starter',
  business: 'tier:website:business',
  bounded: 'tier:website:business',
  siteguide: 'tier:siteguide:setup',
  template: 'tier:siteguide:setup',
  custom: 'tier:custom:scoped-project',
  premium: 'tier:custom:scoped-project',
  scope: 'tier:custom:scoped-project',
};

// URL query params → form field name map. Only the names listed here
// are accepted; anything else is ignored so a hostile URL can't seed
// arbitrary field values (e.g. can't overwrite hidden `source`).
// Exported so the whitelist stays testable.
export const PARAM_TO_FIELD: Readonly<Record<string, string>> = {
  biz: 'businessType',
  businesstype: 'businessType', // tolerate query-param case
  business: 'businessType',
  email: 'email',
  name: 'name',
  url: 'currentUrl',
  currenturl: 'currentUrl',
  site: 'currentUrl',
};

// Cap each URL-seeded value so a malicious bio link can't push a
// megabyte string into the textarea/input. Real values are always
// short — a name, an email, a URL, a two-word business type.
export const MAX_PARAM_LEN = 240;

// UTM keys captured from the bio-link URL into the intake form so
// `/api/lead` sees the traffic source (CONVERSION_STANDARDS.md § 4).
// Analytics beacons already carry these via track.ts; here we mirror
// them into hidden form fields so the admin email + console log tell
// Michael which TikTok video / IG post sourced the lead.
export const UTM_FORM_KEYS: ReadonlyArray<string> = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
];

// Reserved intent namespaces per CONVERSION_STANDARDS.md § 2. A bio
// link like `/audit?intent=product:aries` or `?intent=book:free-review`
// must carry the raw intent through to attribution; TIER_ALIASES only
// covers the `tier:` short-name surface. Anything not on this list is
// silently rejected so a hostile URL can't fabricate a novel namespace.
export const RESERVED_INTENT_NAMESPACES: ReadonlyArray<string> = [
  'tier:',
  'product:',
  'feature:',
  'plan:',
  'book:',
  'checkout:',
];

export function isReservedIntent(raw: string): boolean {
  const lower = raw.toLowerCase();
  return RESERVED_INTENT_NAMESPACES.some((ns) => lower.startsWith(ns) && lower.length > ns.length);
}

function readParams(): Record<string, string> {
  try {
    if (typeof window === 'undefined') return {};
    const url = new URL(window.location.href);
    const out: Record<string, string> = {};
    url.searchParams.forEach((raw, key) => {
      const v = (raw || '').trim().slice(0, MAX_PARAM_LEN);
      if (v) out[key.toLowerCase()] = v;
    });
    return out;
  } catch {
    return {};
  }
}

function setField(form: HTMLFormElement, name: string, value: string, overwrite = false): boolean {
  const field = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(
    `[name="${CSS.escape(name)}"]`
  );
  if (!field) return false;
  if (!overwrite && field.value.trim()) return false;
  field.value = value;
  field.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

// Runs once on page load. Idempotent: no-op if the form isn't on the
// page (e.g. root `/` when the intake hasn't scrolled in) or if no
// recognised params are present.
export function applyUrlPrefill(): void {
  const form = document.getElementById('intake-form') as HTMLFormElement | null;
  if (!form) return;
  const params = readParams();
  if (!Object.keys(params).length) return;

  const filled: string[] = [];

  // Explicit tier / intent — carry into hidden `intent` field + seed textarea.
  const rawTier = params['tier'] || params['intent'];
  if (rawTier) {
    const lower = rawTier.toLowerCase();
    const intent = TIER_ALIASES[lower] || (isReservedIntent(lower) ? lower : null);
    if (intent) {
      if (setField(form, 'intent', intent, true)) filled.push('intent');
      const entry = CATALOG[intent];
      const bookingSeed = BOOKING_PREFILLS[intent];
      if (entry || bookingSeed) {
        const ta = form.querySelector<HTMLTextAreaElement>('textarea[name="frustration"]');
        if (ta && !ta.value.trim()) {
          ta.value = entry ? buildBrief(entry) : bookingSeed;
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          filled.push('frustration');
        }
      }
    }
  }

  // Direct field prefills — only the whitelisted names in PARAM_TO_FIELD.
  Object.entries(params).forEach(([key, value]) => {
    const fieldName = PARAM_TO_FIELD[key];
    if (!fieldName) return;
    if (setField(form, fieldName, value)) filled.push(fieldName);
  });

  // UTM capture — overwrite the empty hidden inputs Intake.astro renders
  // so the lead POST carries the traffic source. Overwrite is safe: the
  // fields ship blank and are never visitor-typed.
  UTM_FORM_KEYS.forEach((key) => {
    const v = params[key];
    if (!v) return;
    if (setField(form, key, v, true)) filled.push(key);
  });

  if (filled.length) {
    track({
      name: 'intake_prefill',
      section: 'intake',
      intent: form.querySelector<HTMLInputElement>('input[name="intent"]')?.value || undefined,
      meta: { fields: filled.join(','), count: filled.length },
    });
  }
}

export function wirePrefill(): void {
  // URL params first — happens on load once.
  applyUrlPrefill();

  // Click-based prefill — same behavior as before, delegated on document.
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>('[data-intent]');
      if (!el) return;
      const intent = el.dataset.intent;
      if (!intent) return;

      const intentField = document.querySelector<HTMLInputElement>(
        'form#intake-form input[name="intent"]'
      );
      if (intentField) intentField.value = intent;

      const entry = CATALOG[intent];
      const bookingSeed = BOOKING_PREFILLS[intent];
      if (!entry && !bookingSeed) return;
      const ta = document.querySelector<HTMLTextAreaElement>(
        'form#intake-form textarea[name="frustration"]'
      );
      if (!ta) return;
      if (ta.value.trim() && !isPriorPrefill(ta.value)) return;
      ta.value = entry ? buildBrief(entry) : bookingSeed;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    },
    { passive: true }
  );
}
