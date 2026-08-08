// CORS policy for the money path (`/api/lead`).
//
// Extracted 2026-08-04 from `functions/api/lead.ts` so the preflight decision
// is unit-testable without a Cloudflare runtime — same reason `validate.ts` and
// `rate.ts` were split out at Rung 2.
//
// Why this file exists at all: the OPTIONS branch used to echo whatever `Origin`
// the caller sent straight back into `Access-Control-Allow-Origin`, with no
// allowlist check, while `onRequestPost` did enforce one. The preflight
// advertised a policy the POST refused to honour. Everything here exists to make
// the two agree.
//
// Deliberate non-goals:
// - No `Access-Control-Allow-Credentials`. There is no session, no cookie, and
//   nothing to ride. Adding it would turn a public intake form into a CSRF
//   target for every allowlisted origin.
// - No wildcard. `*` and a real allowlist are different policies; we want the
//   allowlist.

export type CorsEnv = {
  ALLOWED_ORIGINS?: string; // comma-separated; DEFAULT_ORIGINS below when unset
};

export const DEFAULT_ORIGINS = [
  'https://m3mm.net',
  'https://www.m3mm.net',
  // dev
  'http://localhost:4321',
  'http://127.0.0.1:4321',
  'http://localhost:8788',
  'http://127.0.0.1:8788',
  'http://localhost:8789',
  'http://127.0.0.1:8789',
];

/** The only method this endpoint will hand out cross-origin. */
export const ALLOWED_METHODS = 'POST, OPTIONS';

/**
 * Non-safelisted request headers a cross-origin caller may set. `content-type`
 * is the only one `onRequestPost` reads. Lowercase — browsers send
 * `Access-Control-Request-Headers` lowercased.
 */
export const ALLOWED_REQUEST_HEADERS = ['content-type'];

/**
 * CORS-safelisted headers. Browsers omit these from
 * `Access-Control-Request-Headers`, but a non-browser client may include them;
 * they were never gated by CORS in the first place, so refusing them would be
 * theatre.
 */
const SAFELISTED_REQUEST_HEADERS = ['accept', 'accept-language', 'content-language'];

/** Defensive cap so a 10k-entry ACRH can't turn the check into a hot loop. */
const MAX_REQUESTED_HEADERS = 32;

export const PREFLIGHT_MAX_AGE_S = 86_400;

/**
 * The grant depends on all three of these request headers, so every response
 * off this path — allowed or denied — has to say so or a shared cache can serve
 * one origin's answer to another.
 */
export const CORS_VARY = 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers';

/**
 * `??` not `||` on purpose: an explicitly-set-but-empty `ALLOWED_ORIGINS`
 * resolves to an empty allowlist (deny every cross-origin caller), which is what
 * the pre-extraction code did. Falling back to the defaults there would quietly
 * re-open origins an operator meant to close.
 */
export function allowedOrigins(env: CorsEnv): string[] {
  const configured = env.ALLOWED_ORIGINS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return configured ?? DEFAULT_ORIGINS;
}

/**
 * A null Origin is allowed: that is a same-origin fetch, a curl, or a server-side
 * call — none of which CORS governs. Unchanged from the original POST-side rule
 * on purpose; the money path's behaviour must not shift under a CORS fix.
 */
export function originAllowed(env: CorsEnv, origin: string | null): boolean {
  if (!origin) return true;
  return allowedOrigins(env).includes(origin);
}

/**
 * True when every header the preflight asks to send is one we actually accept.
 * Returning a blanket `Access-Control-Allow-Headers: Content-Type` while the
 * caller asked for `Authorization` would be a grant that lies about its scope.
 */
export function requestedHeadersAllowed(headerValue: string | null): boolean {
  if (!headerValue) return true; // nothing non-safelisted requested
  const requested = headerValue
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  if (requested.length === 0) return true;
  if (requested.length > MAX_REQUESTED_HEADERS) return false;
  return requested.every(
    (h) => ALLOWED_REQUEST_HEADERS.includes(h) || SAFELISTED_REQUEST_HEADERS.includes(h),
  );
}

/**
 * Headers for a NON-preflight (i.e. the real POST) response.
 *
 * Cross-origin browser use IS intended here, so an allowlisted origin gets a
 * matching `Access-Control-Allow-Origin` and can read the JSON body. Concretely:
 * the allowlist ships `http://localhost:4321` (astro dev) alongside
 * `http://localhost:8788` (`wrangler pages dev`), which is exactly the
 * dev-server-to-functions-server cross-origin case; without ACAO on the POST
 * those entries would let the request through and then hide the result from the
 * caller. Same story for `www.m3mm.net` vs the apex.
 *
 * `Vary: Origin` goes on unconditionally — including the 403 — because the
 * response body and headers genuinely differ per origin.
 */
export function corsResponseHeaders(env: CorsEnv, origin: string | null): Record<string, string> {
  const headers: Record<string, string> = { Vary: CORS_VARY };
  if (origin && originAllowed(env, origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

/**
 * Answer a CORS preflight. Four gates, and a failure of any one returns a bare
 * 204 carrying no `Access-Control-*` header at all — which is what makes the
 * browser reject the preflight instead of caching a permission we don't mean.
 */
export function preflightResponse(env: CorsEnv, request: Request): Response {
  const deny = () =>
    new Response(null, {
      status: 204,
      headers: { Allow: ALLOWED_METHODS, Vary: CORS_VARY },
    });

  const origin = request.headers.get('Origin');
  // Missing/blank Origin: not a browser CORS preflight, so there is nothing to
  // reflect. `originAllowed` would say "true" (same-origin), but a grant needs a
  // concrete origin to name.
  if (!origin) return deny();
  if (!originAllowed(env, origin)) return deny();

  // A real preflight always carries Access-Control-Request-Method. POST is the
  // only method behind this route; anything else (or nothing) is not a request
  // we grant.
  const requestedMethod = (request.headers.get('Access-Control-Request-Method') || '')
    .trim()
    .toUpperCase();
  if (requestedMethod !== 'POST') return deny();

  if (!requestedHeadersAllowed(request.headers.get('Access-Control-Request-Headers'))) {
    return deny();
  }

  return new Response(null, {
    status: 204,
    headers: {
      Allow: ALLOWED_METHODS,
      Vary: CORS_VARY,
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': ALLOWED_METHODS,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': String(PREFLIGHT_MAX_AGE_S),
    },
  });
}
