/** Public offer links only. Never put Stripe secret keys in browser code. */

import { redactDiagnostic } from '../../scripts/check-shipped-placeholders.mjs';
import { paymentLinkProblem } from '../../scripts/payment-link-policy.mjs';

/** Every rejected value uses the same complete diagnostic redaction policy. */
export function redactIfSecret(value: string): string {
  return redactDiagnostic(value);
}

/**
 * The link the site ships with until a real one exists. Kept as a loud
 * placeholder on purpose: `isLiveStripePaymentLink` rejects it, so /start
 * gates to the free-review intake instead of rendering a dead checkout.
 */
export const PLACEHOLDER_PAYMENT_LINK = 'https://buy.stripe.com/REPLACE_AFTER_SIGN_IN';

/** Syntax check only; ownership, activation and amount remain release checks.
 * Query parameters are supported. Custom hosts must be explicitly added to the
 * shared verified-host allowlist; arbitrary hosts never enable checkout.
 */
export function isLiveStripePaymentLink(link: string): boolean {
  return paymentLinkProblem(link) === null;
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
  return paymentLinkProblem(link);
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
      `  Expected: https://buy.stripe.com/<link-id> (optional query parameters)\n` +
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
