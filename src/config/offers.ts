/** Public offer links only. Never put Stripe secret keys in browser code. */
export const BASIC_SITE = {
  priceUsd: 500,
  depositPercent: 20,
  depositUsd: 100,
  paymentLink: 'https://buy.stripe.com/REPLACE_AFTER_SIGN_IN',
} as const;
