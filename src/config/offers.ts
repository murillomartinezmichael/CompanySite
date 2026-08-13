/** Public offer links only. Never put Stripe secret keys in browser code. */

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

/**
 * Resolve the payment link from build-time config, env var first.
 *
 * `PUBLIC_STRIPE_PAYMENT_LINK` (Cloudflare Pages → Settings → Environment
 * variables, Production) is the intended way to set this: Mike pastes the real
 * Payment Link there and redeploys, no code edit. An env value that is missing,
 * blank, or not a well-formed LIVE link is ignored entirely and the placeholder
 * is returned — a typo'd or test-mode env var can never become a live buy
 * button, it just leaves the page in its gated free-review state.
 */
export function resolvePaymentLink(
  envValue: string | undefined,
  fallback: string = PLACEHOLDER_PAYMENT_LINK,
): string {
  const candidate = (envValue ?? '').trim();
  return isLiveStripePaymentLink(candidate) ? candidate : fallback;
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
