// Syntax policy only. Stripe account ownership, active status and amount must
// be verified separately before enabling production checkout.
// Add a custom payment hostname only after Michael verifies its Stripe setup.
export const PAYMENT_LINK_HOSTS = Object.freeze(['buy.stripe.com']);

export function decodePercentLiterals(value) {
  // Two layers cover accidentally double-encoded parameters without evaluating
  // anything. ASCII decoding is sufficient for the key prefixes we prohibit.
  for (let pass = 0; pass < 2; pass++) value = value.replace(/%([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return value;
}

export function paymentLinkProblem(link, allowedHosts = PAYMENT_LINK_HOSTS) {
  if (typeof link !== 'string' || !link || /[\s\\]/.test(link)) return 'it is not a complete URL';
  if (/(?:sk|rk)_(?:live|test)_|pk_test_/.test(decodePercentLiterals(link))) return 'it contains Stripe key material';
  let parsed;
  try { parsed = new URL(link); } catch { return 'it is not a complete URL'; }
  if (parsed.protocol !== 'https:') return 'it must use https://';
  if (parsed.username || parsed.password || parsed.port) return 'credentials and custom ports are not allowed';
  if (!allowedHosts.includes(parsed.hostname)) return 'its host is not in the verified payment-host allowlist';
  if (parsed.hash) return 'fragments are not supported';
  // Inspect the original path too: URL() otherwise normalizes /a/../id away.
  const rawPath = link.match(/^https:\/\/[^/]+(\/[^?#]*)/i)?.[1];
  if (rawPath !== parsed.pathname) return 'its path is not canonical';
  if (parsed.pathname.includes('REPLACE')) return 'it is still a REPLACE placeholder';
  if (/^\/test(?:_|\/|$)/i.test(parsed.pathname)) return 'it is a Stripe TEST-mode link';
  if (parsed.pathname.endsWith('/')) return 'it has a trailing slash or empty link id';
  // Stripe does not promise a 10-64 character contract. Reject malformed paths
  // without pretending that a plausible id proves a real/live Payment Link.
  if (!/^\/[A-Za-z0-9]+$/.test(parsed.pathname)) return 'it needs one alphanumeric link id without extra path segments';
  return null;
}
