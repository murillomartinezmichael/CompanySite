// Security response headers for the Pages Functions money path.
//
// Why this file exists (measured 2026-08-12)
// ------------------------------------------
// `public/_headers` sets the five security headers on `/*` — but Cloudflare
// Pages applies `_headers` to STATIC ASSET responses only. Functions build their
// own `Response`, so nothing in `_headers` reaches them. Measured against
// production:
//
//     GET     https://m3mm.net/            -> 200, all five headers present
//     OPTIONS https://m3mm.net/api/lead    -> 204, ZERO of the five
//     POST    https://m3mm.net/api/lead    -> 400, ZERO of the five
//     POST    https://m3mm.net/api/track   -> 204, ZERO of the five
//
// So the document was hardened and the money path — the endpoint every TikTok
// click terminates at — shipped bare. The `/api/*` block in `_headers`
// (`Cache-Control: no-store`) never applied either; `lead.ts`/`track.ts` set
// that one themselves, which is why nobody noticed the block was dead.
//
// The fleet's other live APIs (SiteGuide, SiteBot, AIMA — all FastAPI with
// `SecurityHeadersMiddleware`) already ship all five on every route, so this is
// bringing CompanySite up to the existing fleet standard, not inventing one.
//
// Values mirror `public/_headers` exactly so a response cannot advertise one
// policy for the document and a different one for the API. The single
// deliberate difference is CSP: a JSON endpoint should load nothing at all, so
// it gets `default-src 'none'` rather than the document's script/style/font
// allowances.

/**
 * Applied to every response off `functions/api/*`. Kept as a plain record so a
 * test can assert the exact set without booting a Cloudflare runtime.
 */
export const API_SECURITY_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=(), payment=()',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
});

/**
 * Merge the security headers UNDER a handler's own headers.
 *
 * Order is load-bearing: anything the caller already set wins. The CORS grant,
 * `Cache-Control: no-store`, `Retry-After` and `Vary` are decisions the handler
 * made on purpose, and a blanket security layer must not quietly overwrite one.
 */
export function withSecurityHeaders(
  headers: Record<string, string> = {},
): Record<string, string> {
  return { ...API_SECURITY_HEADERS, ...headers };
}

/**
 * Same merge for an already-constructed `Response` (the CORS preflight builds
 * its own). Returns a new `Response`; the original is untouched, and an
 * existing header of the same name is left alone for the reason above.
 */
export function secureResponse(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(API_SECURITY_HEADERS)) {
    if (!headers.has(name)) headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
