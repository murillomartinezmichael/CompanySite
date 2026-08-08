/** Public offer links only. Never put Stripe secret keys in browser code. */
export const BASIC_SITE = {
  priceUsd: 500,
  depositPercent: 20,
  depositUsd: 100,
  paymentLink: 'https://buy.stripe.com/REPLACE_AFTER_SIGN_IN',
} as const;

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
 * While this is false, /start must NOT render the payment link as a clickable
 * CTA — the page gates to the free-review intake instead. Build tests pin the
 * gate at source AND built-HTML level so a placeholder (or a test-mode link)
 * can never ship as a live buy button.
 *
 * NOTE (static site): flipping this requires `npm run build` + a redeploy —
 * pasting a real link into this file changes nothing in production by itself.
 */
export const checkoutReady = isLiveStripePaymentLink(BASIC_SITE.paymentLink);
