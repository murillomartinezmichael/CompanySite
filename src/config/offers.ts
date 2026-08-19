/** Public offer links only. Never put Stripe secret keys in browser code. */

import { RULES, redactSecret } from '../../scripts/check-shipped-placeholders.mjs';

/**
 * The one rule from the shipped-source fence that recognizes Stripe key
 * material. Imported rather than re-expressed: two copies of a secret-detection
 * regex drift, and the copy that drifts is the one that stops redacting.
 */
const KEY_MATERIAL_RULE = (RULES as Array<{ id: string; test: (t: string) => string[] }>).find(
  (rule) => rule.id === 'stripe-key-material',
);

/**
 * Echo a rejected env value back to the operator without copying a secret into
 * a build log.
 *
 * The rejection message below exists so Mike can see what he actually pasted —
 * for the common case (a typo'd or test-mode URL) the literal value IS the
 * diagnosis and must be shown. But `PUBLIC_STRIPE_PAYMENT_LINK` is pasted by
 * hand from the same Stripe dashboard that issues secret keys, so the plausible
 * mistake is pasting a secret key into it. Cloudflare Pages and GitHub Actions
 * build logs are retained and widely readable, so echoing that verbatim would
 * copy a live key into a second place, and the fence that catches key material
 * in `dist/` would never see it — this throws before any HTML is written.
 *
 * Same policy as the fence's own `redact: true` on this rule.
 */
export function redactIfSecret(value: string): string {
  return KEY_MATERIAL_RULE && KEY_MATERIAL_RULE.test(value).length > 0
    ? redactSecret(value)
    : value;
}

/**
 * The link the site ships with until a real one exists. Kept as a loud
 * placeholder on purpose: `isLiveStripePaymentLink` rejects it, so /start
 * gates to the free-review intake instead of rendering a dead checkout.
 */
export const PLACEHOLDER_PAYMENT_LINK = 'https://buy.stripe.com/REPLACE_AFTER_SIGN_IN';

/**
 * Semantic validation for the checkout gate. Fails CLOSED: only a well-formed
 * LIVE Stripe Payment Link enables checkout on /start. Explicitly rejected:
 *   - the REPLACE_AFTER_SIGN_IN placeholder (any REPLACE marker)
 *   - Stripe TEST-mode links (`test_` slug prefix) — a test link on the live
 *     money page would take real visitors to a checkout that charges nothing
 *   - http://, wrong hosts, empty/short slugs, query strings, extra path
 *     segments, underscores, or anything else unrecognized
 * Live Payment Link slugs are URL-safe alphanumerics (observed 10–30 chars;
 * bounded 10–64 here for slack without accepting junk).
 */
export function isLiveStripePaymentLink(link: string): boolean {
  if (link.includes('REPLACE')) return false; // placeholder marker
  if (link.includes('test_')) return false; // Stripe test-mode link
  return /^https:\/\/buy\.stripe\.com\/[A-Za-z0-9]{10,64}$/.test(link);
}

/** Thrown at BUILD time when `PUBLIC_STRIPE_PAYMENT_LINK` is set but unusable. */
export class InvalidPaymentLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPaymentLinkError';
  }
}

/**
 * Why a candidate link was rejected, in words Mike can act on. Returns null
 * when the link is a well-formed live link.
 */
function explainRejection(link: string): string | null {
  if (isLiveStripePaymentLink(link)) return null;
  if (link.includes('REPLACE')) return 'it is still the REPLACE_AFTER_SIGN_IN placeholder';
  if (link.includes('test_')) return 'it is a Stripe TEST-mode link (contains "test_") — copy the link from the LIVE dashboard toggle';
  if (link.startsWith('http://')) return 'it uses http:// — Stripe Payment Links are https://';
  if (!link.startsWith('https://')) return 'it does not start with https://';
  if (!link.startsWith('https://buy.stripe.com/')) return `its host is not buy.stripe.com (custom-domain payment links are not supported by this gate yet)`;
  const slug = link.slice('https://buy.stripe.com/'.length);
  if (slug.includes('?')) return 'it has a query string — paste the bare link, without ?utm_/?prefilled_/?client_reference_id parameters';
  if (slug.endsWith('/')) return 'it has a trailing slash — remove it';
  if (slug.includes('/')) return 'it has extra path segments after the link id';
  if (slug.length < 10) return `its link id is too short (${slug.length} chars, expected 10-64)`;
  if (slug.length > 64) return `its link id is too long (${slug.length} chars, expected 10-64)`;
  return 'its link id contains characters outside A-Z a-z 0-9';
}

/**
 * Resolve the payment link from build-time config, env var first.
 *
 * `PUBLIC_STRIPE_PAYMENT_LINK` (Cloudflare Pages → Settings → Environment
 * variables, Production) is the intended way to set this: Mike pastes the real
 * Payment Link there and redeploys, no code edit.
 *
 * Two distinct cases, deliberately handled differently:
 *
 *   UNSET or blank  → return the placeholder, no error. This is the shipped
 *                     default; /start gates to the free-review intake. Every
 *                     build that has never touched the var must keep working.
 *
 *   SET but invalid → THROW. Mike pastes this value from the Stripe dashboard
 *                     exactly once. Silently falling back would mean he sets
 *                     it, redeploys, sees no pay button, and has nothing to
 *                     diagnose from — the same silent-absorption failure that
 *                     shipped 1,219 broken image URLs in AriesOutdoorLiving-V2
 *                     from a one-character env typo. A build that goes red
 *                     with the reason is the only signal that actually reaches
 *                     him. Safe to throw: `output: 'static'` in
 *                     astro.config.mjs with no adapter and no prerender
 *                     opt-out, so this module is evaluated only during
 *                     `astro build` — it can fail a deploy, never a request.
 *
 * A test-mode or typo'd value therefore still never becomes a live buy button.
 */
export function resolvePaymentLink(
  envValue: string | undefined,
  fallback: string = PLACEHOLDER_PAYMENT_LINK,
): string {
  const candidate = (envValue ?? '').trim();
  if (candidate === '') return fallback;
  const reason = explainRejection(candidate);
  if (reason === null) return candidate;
  throw new InvalidPaymentLinkError(
    `PUBLIC_STRIPE_PAYMENT_LINK is set but is not a usable LIVE Stripe Payment Link: ${reason}.\n` +
      `  Got:      ${redactIfSecret(candidate)}\n` +
      `  Expected: https://buy.stripe.com/<10-64 alphanumeric chars>\n` +
      `  Fix it in Cloudflare Pages → Settings → Environment variables → Production, then redeploy.\n` +
      `  To ship the free-review gate instead, unset the variable entirely (blank/unset is the supported "not selling yet" state).`,
  );
}

export const BASIC_SITE = {
  priceUsd: 500,
  depositPercent: 20,
  depositUsd: 100,
  paymentLink: resolvePaymentLink(import.meta.env.PUBLIC_STRIPE_PAYMENT_LINK),
} as const;

/**
 * While this is false, /start must NOT render the payment link as a clickable
 * CTA — the page gates to the free-review intake instead. Build tests pin the
 * gate at source AND built-HTML level, and `npm run build` runs
 * `scripts/check-shipped-placeholders.mjs` over dist/, so a placeholder (or a
 * test-mode link) can never ship as a live buy button.
 *
 * NOTE (static site): this is resolved at BUILD time. Setting the env var in
 * the Cloudflare Pages dashboard changes nothing until the next deploy.
 */
export const checkoutReady = isLiveStripePaymentLink(BASIC_SITE.paymentLink);
